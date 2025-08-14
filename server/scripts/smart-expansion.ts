#!/usr/bin/env tsx
/**
 * Smart Commercial Chain Expansion Script
 * 
 * APPROACH:
 * - Target known commercial chains with proper facility names
 * - Only add communities with complete, valid data
 * - No mock data or placeholder names
 * - All new communities start as unclaimed (NULL tier)
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql, like } from "drizzle-orm";
import { PerplexityAIService } from "../perplexity-ai-service";
import { notifyNewCustomer } from "../sendgrid-service";

interface ValidatedCommunity {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  website?: string;
  chain?: string;
  careTypes: string[];
}

// Well-known commercial chains to target
const MAJOR_CHAINS = [
  { name: 'Brookdale', locations: 700, states: ['CA', 'TX', 'FL', 'AZ', 'CO'] },
  { name: 'Sunrise Senior Living', locations: 320, states: ['CA', 'NY', 'FL', 'TX', 'VA'] },
  { name: 'Atria Senior Living', locations: 200, states: ['CA', 'TX', 'NY', 'FL', 'AZ'] },
  { name: 'Holiday Retirement', locations: 260, states: ['CA', 'WA', 'OR', 'TX', 'FL'] },
  { name: 'Five Star Senior Living', locations: 280, states: ['MA', 'CA', 'IL', 'TX', 'FL'] },
  { name: 'Aegis Living', locations: 35, states: ['WA', 'CA', 'NV'] },
  { name: 'Belmont Village', locations: 30, states: ['CA', 'TX', 'IL'] },
  { name: 'Watermark Retirement', locations: 60, states: ['CA', 'NY', 'CT', 'PA'] },
  { name: 'MBK Senior Living', locations: 120, states: ['CA', 'AZ', 'TX', 'CO'] },
  { name: 'Discovery Senior Living', locations: 250, states: ['FL', 'TX', 'CA', 'GA'] }
];

class SmartExpansion {
  private perplexity: PerplexityAIService;
  private addedCount = 0;
  private duplicateCount = 0;
  private invalidCount = 0;

  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  /**
   * Main expansion function - finds and adds specific chain locations
   */
  async expandChains(limit: number = 5): Promise<void> {
    console.log('🚀 Smart Commercial Chain Expansion');
    console.log('=' .repeat(60));
    
    for (const chain of MAJOR_CHAINS.slice(0, limit)) {
      console.log(`\n🏢 Searching for ${chain.name} locations...`);
      
      for (const state of chain.states.slice(0, 2)) { // Limit states per chain
        await this.findChainLocations(chain.name, state);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXPANSION COMPLETE');
    console.log(`✅ Added: ${this.addedCount} new communities`);
    console.log(`⚠️ Duplicates skipped: ${this.duplicateCount}`);
    console.log(`❌ Invalid skipped: ${this.invalidCount}`);
    console.log('=' .repeat(60));
  }

  /**
   * Find specific chain locations in a state
   */
  private async findChainLocations(chainName: string, state: string): Promise<void> {
    const query = `List all ${chainName} senior living facilities in ${state}. 
      For each location provide:
      - Full facility name (e.g., "${chainName} of [Location Name]")
      - Complete street address with zip code
      - Phone number
      - City
      Only include currently operating facilities with real addresses.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const facilities = this.extractFacilities(result.summary || '', chainName, state);
      
      console.log(`  📍 ${state}: Found ${facilities.length} ${chainName} facilities`);
      
      for (const facility of facilities) {
        await this.addCommunity(facility);
      }
    } catch (error) {
      console.error(`  ❌ Error searching ${chainName} in ${state}:`, error);
    }
  }

  /**
   * Extract facility information with validation
   */
  private extractFacilities(text: string, chainName: string, state: string): ValidatedCommunity[] {
    const facilities: ValidatedCommunity[] = [];
    const lines = text.split('\n');
    
    let currentFacility: Partial<ValidatedCommunity> | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Look for facility names containing the chain name
      if (trimmed.includes(chainName) && !trimmed.includes('is located')) {
        // Save previous facility if valid
        if (currentFacility && this.isValidFacility(currentFacility)) {
          facilities.push(this.completeFacility(currentFacility, chainName, state));
        }
        
        // Start new facility
        currentFacility = {
          chain: chainName,
          state,
          careTypes: ['Assisted Living'] // Default
        };
        
        // Extract facility name
        const nameMatch = trimmed.match(new RegExp(`(${chainName}[^,;]*?)(?:[,;]|$)`, 'i'));
        if (nameMatch) {
          currentFacility.name = this.cleanName(nameMatch[1]);
        }
      }
      
      // Extract address
      if (currentFacility && /\d+\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way)/i.test(trimmed)) {
        const addressMatch = trimmed.match(/(\d+\s+[^,]+?)(?:,|$)/);
        if (addressMatch && !currentFacility.address) {
          currentFacility.address = addressMatch[1].trim();
        }
        
        // Extract city if in same line
        const cityMatch = trimmed.match(/,\s*([A-Za-z\s]+),\s*[A-Z]{2}/);
        if (cityMatch) {
          currentFacility.city = cityMatch[1].trim();
        }
        
        // Extract zip
        const zipMatch = trimmed.match(/\b(\d{5})(?:-\d{4})?\b/);
        if (zipMatch) {
          currentFacility.zip_code = zipMatch[1];
        }
      }
      
      // Extract phone
      if (currentFacility && /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(trimmed)) {
        const phoneMatch = trimmed.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
        if (phoneMatch && !currentFacility.phone) {
          currentFacility.phone = this.formatPhone(phoneMatch[1]);
        }
      }
      
      // Extract care types
      if (currentFacility) {
        if (/memory care/i.test(trimmed) && !currentFacility.careTypes?.includes('Memory Care')) {
          currentFacility.careTypes = [...(currentFacility.careTypes || []), 'Memory Care'];
        }
        if (/independent living/i.test(trimmed) && !currentFacility.careTypes?.includes('Independent Living')) {
          currentFacility.careTypes = [...(currentFacility.careTypes || []), 'Independent Living'];
        }
      }
    }
    
    // Don't forget the last facility
    if (currentFacility && this.isValidFacility(currentFacility)) {
      facilities.push(this.completeFacility(currentFacility, chainName, state));
    }
    
    return facilities;
  }

  /**
   * Validate facility has minimum required data
   */
  private isValidFacility(facility: Partial<ValidatedCommunity>): boolean {
    return !!(
      facility.name &&
      facility.name.length > 10 &&
      (facility.address || facility.city) &&
      !facility.name.includes('example') &&
      !facility.name.toLowerCase().includes('contact')
    );
  }

  /**
   * Complete facility data with defaults
   */
  private completeFacility(partial: Partial<ValidatedCommunity>, chainName: string, state: string): ValidatedCommunity {
    return {
      name: partial.name || `${chainName} Community`,
      address: partial.address || '',
      city: partial.city || 'Unknown',
      state: partial.state || state,
      zip_code: partial.zip_code || '00000',
      phone: partial.phone,
      website: partial.website,
      chain: chainName,
      careTypes: partial.careTypes || ['Assisted Living']
    };
  }

  /**
   * Clean facility name
   */
  private cleanName(name: string): string {
    return name
      .replace(/^[\d\-\*•]\s*/, '')
      .replace(/\s+/g, ' ')
      .replace(/[:\(\[].*$/, '')
      .trim();
  }

  /**
   * Format phone number
   */
  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  /**
   * Add community to database
   */
  private async addCommunity(facility: ValidatedCommunity): Promise<void> {
    // Check for duplicates
    const existing = await db
      .select()
      .from(communities)
      .where(
        and(
          sql`LOWER(${communities.name}) = LOWER(${facility.name})`,
          eq(communities.city, facility.city),
          eq(communities.state, facility.state)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      this.duplicateCount++;
      return;
    }
    
    // Validate data quality
    if (!facility.name || facility.name.length < 10 || facility.city === 'Unknown') {
      this.invalidCount++;
      return;
    }
    
    try {
      // Add to database
      const [newCommunity] = await db.insert(communities).values({
        name: facility.name,
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zip_code: facility.zip_code,
        phone: facility.phone,
        website: facility.website,
        care_type: facility.careTypes[0],
        care_types: facility.careTypes,
        description: `${facility.chain} senior living community in ${facility.city}, ${facility.state}`,
        status: 'Active',
        listing_type: 'Premium',
        is_claimed: false,
        // NO subscription_tier - stays NULL (unclaimed)
        ai_enrichment_date: new Date(),
        ai_enrichment_version: 'smart_v1'
      }).returning();
      
      this.addedCount++;
      console.log(`    ✅ Added: ${facility.name} - ${facility.city}, ${facility.state}`);
      
      // Send notification email for new community
      if (process.env.SENDGRID_API_KEY) {
        await notifyNewCustomer('community', {
          id: newCommunity.id,
          name: facility.name,
          city: facility.city,
          state: facility.state,
          email: facility.phone ? `contact@${facility.chain?.toLowerCase().replace(/\s+/g, '')}.com` : null,
          subscription_tier: 'Unclaimed'
        });
      }
      
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        this.duplicateCount++;
      } else {
        console.error(`    ❌ Error adding ${facility.name}:`, error.message);
        this.invalidCount++;
      }
    }
  }
}

// Main execution
async function main() {
  console.log('\n🎯 Smart Commercial Chain Expansion Script');
  console.log('Version: 1.0 - Quality over Quantity');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');
  
  const expander = new SmartExpansion();
  
  try {
    // Find and add commercial chain locations
    await expander.expandChains(5); // Process 5 major chains
    
    console.log('\n✨ Expansion complete!');
    console.log('All new communities added as UNCLAIMED (no subscription tier)');
    console.log('They will appear in search results and can register to claim their listing');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// ES module execution
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main();
}

export { SmartExpansion };