import { describe, it, expect } from '@jest/globals';

// Test utility functions that might exist in the MySeniorValet codebase
describe('Utility Functions', () => {
  
  // Test data formatting utilities
  describe('formatCurrency', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    it('should format currency correctly', () => {
      expect(formatCurrency(3500)).toBe('$3,500');
      expect(formatCurrency(450)).toBe('$450');
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(15000)).toBe('$15,000');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });
  });

  // Test address formatting
  describe('formatAddress', () => {
    const formatAddress = (city: string, state: string, zipCode?: string): string => {
      let address = `${city}, ${state}`;
      if (zipCode) {
        address += ` ${zipCode}`;
      }
      return address;
    };

    it('should format address with city and state', () => {
      expect(formatAddress('Sacramento', 'California')).toBe('Sacramento, California');
      expect(formatAddress('San Francisco', 'CA')).toBe('San Francisco, CA');
    });

    it('should include zip code when provided', () => {
      expect(formatAddress('Sacramento', 'California', '95814')).toBe('Sacramento, California 95814');
    });
  });

  // Test data validation utilities
  describe('validateEmail', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('admin@myseniorvalet.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test.domain.com')).toBe(false);
    });
  });

  // Test phone number formatting
  describe('formatPhoneNumber', () => {
    const formatPhoneNumber = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return phone; // Return original if not 10 digits
    };

    it('should format 10-digit phone numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('9162345678')).toBe('(916) 234-5678');
    });

    it('should handle phone numbers with existing formatting', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
    });

    it('should return original for invalid lengths', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('12345678901')).toBe('12345678901');
    });
  });

  // Test data sanitization
  describe('sanitizeSearchQuery', () => {
    const sanitizeSearchQuery = (query: string): string => {
      return query
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ');
    };

    it('should sanitize search queries', () => {
      expect(sanitizeSearchQuery('  Sacramento Senior Living  ')).toBe('sacramento senior living');
      expect(sanitizeSearchQuery('Assisted-Living!')).toBe('assisted-living');
      expect(sanitizeSearchQuery('Community@Name#123')).toBe('communityname123');
    });

    it('should preserve hyphens and spaces', () => {
      expect(sanitizeSearchQuery('Memory-Care Facility')).toBe('memory-care facility');
      expect(sanitizeSearchQuery('Senior   Living')).toBe('senior living');
    });
  });

  // Test distance calculation (simplified)
  describe('calculateDistance', () => {
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    it('should calculate distance between coordinates', () => {
      // Sacramento to San Francisco (approximately 87 miles)
      const distance = calculateDistance(38.5816, -121.4944, 37.7749, -122.4194);
      expect(Math.round(distance)).toBe(87);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(38.5816, -121.4944, 38.5816, -121.4944);
      expect(Math.round(distance)).toBe(0);
    });
  });
});