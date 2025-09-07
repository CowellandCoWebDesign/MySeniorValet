import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, sql, ne } from 'drizzle-orm';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface CommunityData {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  description?: string;
}

export class DataIntegrityValidator {
  // Test data patterns that should be rejected
  private static readonly TEST_PATTERNS = {
    addresses: [
      /^123\s+main\s+(st|street)$/i,
      /^2123\s+main\s+(st|street)$/i,
      /^1234\s+[a-z]+\s+(blvd|boulevard|ave|avenue|st|street)$/i,
      /^test\s+address$/i,
      /^sample\s+street$/i,
      /^example\s+(road|rd|street|st)$/i,
    ],
    phones: [
      /^000-000-\d{4}$/,
      /^111-111-1111$/,
      /^123-456-7890$/,
      /^555-555-5555$/,
      /^\(000\)\s*000-\d{4}$/,
      /^test$/i,
    ],
    names: [
      /^test\s+community$/i,
      /^sample\s+(home|facility|center)$/i,
      /^placeholder/i,
      /^dummy/i,
      /^demo\s+/i,
      /^\d{4}\s+[a-z]+\s+(blvd|ave|st),\s+[a-z]+,\s+[a-z]{2}\s+\d{5}$/i, // Address as name
    ],
    websites: [
      /^https?:\/\/(www\.)?example\.com/i,
      /^https?:\/\/(www\.)?test\.com/i,
      /^https?:\/\/(www\.)?demo\./i,
      /^https?:\/\/localhost/i,
    ],
  };

  /**
   * Validates community data for test patterns and data integrity issues
   */
  public static validateCommunityData(data: CommunityData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for test address patterns
    if (data.address) {
      for (const pattern of this.TEST_PATTERNS.addresses) {
        if (pattern.test(data.address)) {
          errors.push(`Invalid test address detected: "${data.address}"`);
          break;
        }
      }
    }

    // Check for test phone patterns
    if (data.phone) {
      for (const pattern of this.TEST_PATTERNS.phones) {
        if (pattern.test(data.phone)) {
          errors.push(`Invalid test phone number detected: "${data.phone}"`);
          break;
        }
      }
    }

    // Check for test name patterns
    if (data.name) {
      for (const pattern of this.TEST_PATTERNS.names) {
        if (pattern.test(data.name)) {
          errors.push(`Invalid test name detected: "${data.name}"`);
          break;
        }
      }

      // Check if name is just an address
      if (data.name.match(/^\d+\s+.+\s+(st|street|ave|avenue|blvd|boulevard|rd|road)/i)) {
        warnings.push(`Community name appears to be an address: "${data.name}"`);
      }
    }

    // Check for test website patterns
    if (data.website) {
      for (const pattern of this.TEST_PATTERNS.websites) {
        if (pattern.test(data.website)) {
          errors.push(`Invalid test website detected: "${data.website}"`);
          break;
        }
      }
    }

    // Check for suspicious data combinations
    if (data.name && data.address) {
      // Name should not be identical to address
      if (data.name.toLowerCase() === data.address.toLowerCase()) {
        errors.push('Community name cannot be identical to address');
      }
    }

    // Check for missing required fields
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Community name is required');
    }

    if (!data.city || data.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!data.state || data.state.trim().length === 0) {
      errors.push('State is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Checks if a community would be a duplicate
   */
  public static async checkForDuplicate(data: CommunityData): Promise<{
    isDuplicate: boolean;
    existingId?: number;
    message?: string;
  }> {
    if (!data.name || !data.address || !data.city) {
      return { isDuplicate: false };
    }

    const existingCommunity = await db
      .select({
        id: communities.id,
        name: communities.name,
      })
      .from(communities)
      .where(
        and(
          sql`LOWER(${communities.name}) = LOWER(${data.name})`,
          sql`LOWER(${communities.address}) = LOWER(${data.address})`,
          sql`LOWER(${communities.city}) = LOWER(${data.city})`,
          eq(communities.isActive, true),
          data.id ? ne(communities.id, data.id) : sql`true`
        )
      )
      .limit(1);

    if (existingCommunity.length > 0) {
      return {
        isDuplicate: true,
        existingId: existingCommunity[0].id,
        message: `A community with the same name, address, and city already exists (ID: ${existingCommunity[0].id})`,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Performs full validation including duplicate check
   */
  public static async performFullValidation(data: CommunityData): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    // First perform basic validation
    const validationResult = this.validateCommunityData(data);
    
    // Then check for duplicates
    const duplicateCheck = await this.checkForDuplicate(data);
    
    if (duplicateCheck.isDuplicate) {
      validationResult.errors.push(duplicateCheck.message || 'Duplicate community detected');
      validationResult.isValid = false;
    }

    return validationResult;
  }

  /**
   * Sanitizes community data by removing test patterns
   */
  public static sanitizeCommunityData(data: CommunityData): CommunityData {
    const sanitized = { ...data };

    // Clean phone numbers
    if (sanitized.phone) {
      // Remove test phones completely
      for (const pattern of this.TEST_PATTERNS.phones) {
        if (pattern.test(sanitized.phone)) {
          delete sanitized.phone;
          break;
        }
      }
    }

    // Clean websites
    if (sanitized.website) {
      // Remove test websites completely
      for (const pattern of this.TEST_PATTERNS.websites) {
        if (pattern.test(sanitized.website)) {
          delete sanitized.website;
          break;
        }
      }
    }

    return sanitized;
  }
}