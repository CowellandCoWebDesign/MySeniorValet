/**
 * Cache Compliance Service
 * Manages data caching policies based on regional regulations and preferences
 */

import { cache } from '../cache';

// Cache duration policies by country and data type (in hours)
export const CACHE_POLICIES = {
  US: {
    // United States - FTC guidelines for data aggregation
    publicInfo: 24,        // 24 hours for public facility information
    pricing: 48,           // 48 hours for pricing data
    availability: 12,      // 12 hours for availability status
    photos: 168,           // 7 days for photos
    reviews: 72,           // 72 hours for reviews
    compliance: 'FTC Fair Information Practices - Public data aggregation allowed with attribution'
  },
  CA: {
    // Canada - PIPEDA compliance
    publicInfo: 72,        // 72 hours for public information
    pricing: 24,           // 24 hours for pricing (more sensitive)
    availability: 24,      // 24 hours for availability
    photos: 336,           // 14 days for photos
    reviews: 96,           // 96 hours for reviews
    compliance: 'PIPEDA - Personal Information Protection and Electronic Documents Act'
  },
  MX: {
    // Mexico - LFPDPPP regulations
    publicInfo: 168,       // 7 days for public information
    pricing: 72,           // 72 hours for pricing
    availability: 48,      // 48 hours for availability
    photos: 504,           // 21 days for photos
    reviews: 168,          // 7 days for reviews
    compliance: 'LFPDPPP - Federal Law on Protection of Personal Data'
  },
  DEFAULT: {
    // Conservative default for unknown regions
    publicInfo: 12,        // 12 hours
    pricing: 6,            // 6 hours
    availability: 6,       // 6 hours
    photos: 24,            // 24 hours
    reviews: 12,           // 12 hours
    compliance: 'Default conservative caching - Minimal retention period'
  }
};

// State to country mapping
const STATE_TO_COUNTRY: Record<string, string> = {
  // US States
  'AL': 'US', 'AK': 'US', 'AZ': 'US', 'AR': 'US', 'CA': 'US', 'CO': 'US',
  'CT': 'US', 'DE': 'US', 'FL': 'US', 'GA': 'US', 'HI': 'US', 'ID': 'US',
  'IL': 'US', 'IN': 'US', 'IA': 'US', 'KS': 'US', 'KY': 'US', 'LA': 'US',
  'ME': 'US', 'MD': 'US', 'MA': 'US', 'MI': 'US', 'MN': 'US', 'MS': 'US',
  'MO': 'US', 'MT': 'US', 'NE': 'US', 'NV': 'US', 'NH': 'US', 'NJ': 'US',
  'NM': 'US', 'NY': 'US', 'NC': 'US', 'ND': 'US', 'OH': 'US', 'OK': 'US',
  'OR': 'US', 'PA': 'US', 'RI': 'US', 'SC': 'US', 'SD': 'US', 'TN': 'US',
  'TX': 'US', 'UT': 'US', 'VT': 'US', 'VA': 'US', 'WA': 'US', 'WV': 'US',
  'WI': 'US', 'WY': 'US', 'DC': 'US',
  
  // Canadian Provinces
  'AB': 'CA', 'BC': 'CA', 'MB': 'CA', 'NB': 'CA', 'NL': 'CA', 'NS': 'CA',
  'NT': 'CA', 'NU': 'CA', 'ON': 'CA', 'PE': 'CA', 'QC': 'CA', 'SK': 'CA', 'YT': 'CA',
  
  // Mexican States
  'AGU': 'MX', 'BCN': 'MX', 'BCS': 'MX', 'CAM': 'MX', 'CHP': 'MX', 'CHH': 'MX',
  'CMX': 'MX', 'COA': 'MX', 'COL': 'MX', 'DUR': 'MX', 'GUA': 'MX', 'GRO': 'MX',
  'HID': 'MX', 'JAL': 'MX', 'MEX': 'MX', 'MIC': 'MX', 'MOR': 'MX', 'NAY': 'MX',
  'NLE': 'MX', 'OAX': 'MX', 'PUE': 'MX', 'QUE': 'MX', 'ROO': 'MX', 'SLP': 'MX',
  'SIN': 'MX', 'SON': 'MX', 'TAB': 'MX', 'TAM': 'MX', 'TLA': 'MX', 'VER': 'MX',
  'YUC': 'MX', 'ZAC': 'MX'
};

export class CacheComplianceService {
  /**
   * Get cache duration for a specific data type and location
   */
  getCacheDuration(state: string, dataType: keyof typeof CACHE_POLICIES.US): number {
    const country = STATE_TO_COUNTRY[state] || 'DEFAULT';
    const policy = CACHE_POLICIES[country as keyof typeof CACHE_POLICIES] || CACHE_POLICIES.DEFAULT;
    return policy[dataType] * 3600; // Convert hours to seconds
  }

  /**
   * Get compliance notice for a location
   */
  getComplianceNotice(state: string): string {
    const country = STATE_TO_COUNTRY[state] || 'DEFAULT';
    const policy = CACHE_POLICIES[country as keyof typeof CACHE_POLICIES] || CACHE_POLICIES.DEFAULT;
    return policy.compliance;
  }

  /**
   * Check if cached data is still valid based on compliance rules
   */
  isCacheValid(cacheTimestamp: Date, state: string, dataType: keyof typeof CACHE_POLICIES.US): boolean {
    const now = new Date();
    const cacheAge = (now.getTime() - cacheTimestamp.getTime()) / 1000; // Age in seconds
    const maxAge = this.getCacheDuration(state, dataType);
    return cacheAge < maxAge;
  }

  /**
   * Set compliant cache with appropriate TTL
   */
  async setCompliantCache(
    key: string, 
    value: any, 
    state: string, 
    dataType: keyof typeof CACHE_POLICIES.US
  ): Promise<void> {
    const ttl = this.getCacheDuration(state, dataType);
    const cacheData = {
      value,
      timestamp: new Date().toISOString(),
      state,
      dataType,
      compliance: this.getComplianceNotice(state)
    };
    await cache.set(key, JSON.stringify(cacheData), ttl);
  }

  /**
   * Get compliant cache data
   */
  async getCompliantCache(
    key: string, 
    state: string, 
    dataType: keyof typeof CACHE_POLICIES.US
  ): Promise<any | null> {
    const cached = await cache.get(key);
    if (!cached) return null;

    try {
      const cacheData = JSON.parse(cached);
      const cacheDate = new Date(cacheData.timestamp);
      
      // Validate cache is still compliant
      if (this.isCacheValid(cacheDate, state, dataType)) {
        return cacheData.value;
      }
      
      // Cache expired, remove it
      await cache.del(key);
      return null;
    } catch (error) {
      console.error('Error parsing cache data:', error);
      return null;
    }
  }

  /**
   * Get all cache policies for display
   */
  getAllPolicies() {
    return Object.entries(CACHE_POLICIES).map(([country, policy]) => ({
      country,
      policy,
      description: this.getPolicyDescription(country)
    }));
  }

  /**
   * Get human-readable policy description
   */
  private getPolicyDescription(country: string): string {
    switch (country) {
      case 'US':
        return 'United States - FTC guidelines for fair information practices and data aggregation';
      case 'CA':
        return 'Canada - PIPEDA compliance for electronic document protection';
      case 'MX':
        return 'Mexico - LFPDPPP federal law on personal data protection';
      default:
        return 'Default conservative caching policy for maximum compliance';
    }
  }

  /**
   * Clear expired cache entries based on compliance rules
   */
  async clearExpiredCache(): Promise<number> {
    // This would typically iterate through cache entries and remove expired ones
    // For now, return a placeholder count
    console.log('Running compliance-based cache cleanup...');
    return 0;
  }

  /**
   * Generate transparency report for cache usage
   */
  async generateTransparencyReport() {
    return {
      timestamp: new Date().toISOString(),
      policies: this.getAllPolicies(),
      dataCategories: [
        { type: 'publicInfo', description: 'Facility names, addresses, contact information' },
        { type: 'pricing', description: 'Public pricing information from official sources' },
        { type: 'availability', description: 'Current availability and occupancy status' },
        { type: 'photos', description: 'Public facility photos and virtual tours' },
        { type: 'reviews', description: 'Public reviews and ratings from residents' }
      ],
      sources: [
        'Perplexity AI for web search and aggregation',
        'Public government databases (HUD, Medicare.gov)',
        'Official facility websites',
        'Public review platforms'
      ],
      attribution: 'All data is sourced from publicly available information with appropriate attribution',
      userRights: [
        'Right to request data removal',
        'Right to correct inaccurate information',
        'Right to know data sources',
        'Right to opt-out of data collection'
      ]
    };
  }
}

// Export singleton instance
export const cacheComplianceService = new CacheComplianceService();