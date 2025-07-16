/**
 * Intelligent Pricing Service - WAR ON "CALL FOR PRICING"
 * 
 * This service ensures EVERY community has transparent pricing estimates
 * based on market data, location, care types, and amenities.
 * 
 * NO COMMUNITY WILL EVER SHOW "CALL FOR PRICING" AGAIN!
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { searchCache, communityCache, apiCache } from "./infrastructure/cache";

interface PricingEstimate {
  min: number;
  max: number;
  careTypePricing: {
    careType: string;
    min: number;
    max: number;
  }[];
  confidence: 'high' | 'medium' | 'low';
  dataSource: 'live' | 'market' | 'estimated';
  lastUpdated: Date;
}

interface MarketData {
  state: string;
  city?: string;
  avgIndependentLiving: number;
  avgAssistedLiving: number;
  avgMemoryCare: number;
  avgSkilledNursing: number;
  costOfLivingMultiplier: number;
}

// Market-based pricing data by state (industry research)
const STATE_MARKET_DATA: Record<string, MarketData> = {
  'CA': {
    state: 'California',
    avgIndependentLiving: 3800,
    avgAssistedLiving: 5500,
    avgMemoryCare: 7200,
    avgSkilledNursing: 8500,
    costOfLivingMultiplier: 1.3
  },
  'TX': {
    state: 'Texas',
    avgIndependentLiving: 3200,
    avgAssistedLiving: 4200,
    avgMemoryCare: 5800,
    avgSkilledNursing: 6800,
    costOfLivingMultiplier: 0.9
  },
  'HI': {
    state: 'Hawaii',
    avgIndependentLiving: 4500,
    avgAssistedLiving: 6200,
    avgMemoryCare: 8000,
    avgSkilledNursing: 9500,
    costOfLivingMultiplier: 1.4
  },
  'AZ': {
    state: 'Arizona',
    avgIndependentLiving: 3400,
    avgAssistedLiving: 4600,
    avgMemoryCare: 6200,
    avgSkilledNursing: 7200,
    costOfLivingMultiplier: 0.95
  },
  'NV': {
    state: 'Nevada',
    avgIndependentLiving: 3600,
    avgAssistedLiving: 4800,
    avgMemoryCare: 6400,
    avgSkilledNursing: 7400,
    costOfLivingMultiplier: 1.0
  },
  'ID': {
    state: 'Idaho',
    avgIndependentLiving: 2800,
    avgAssistedLiving: 3800,
    avgMemoryCare: 5200,
    avgSkilledNursing: 6200,
    costOfLivingMultiplier: 0.8
  },
  'MT': {
    state: 'Montana',
    avgIndependentLiving: 2900,
    avgAssistedLiving: 3900,
    avgMemoryCare: 5400,
    avgSkilledNursing: 6400,
    costOfLivingMultiplier: 0.85
  },
  'OR': {
    state: 'Oregon',
    avgIndependentLiving: 3500,
    avgAssistedLiving: 4700,
    avgMemoryCare: 6300,
    avgSkilledNursing: 7300,
    costOfLivingMultiplier: 1.1
  },
  'WA': {
    state: 'Washington',
    avgIndependentLiving: 3700,
    avgAssistedLiving: 5000,
    avgMemoryCare: 6800,
    avgSkilledNursing: 7800,
    costOfLivingMultiplier: 1.15
  },
  'WY': {
    state: 'Wyoming',
    avgIndependentLiving: 2700,
    avgAssistedLiving: 3600,
    avgMemoryCare: 5000,
    avgSkilledNursing: 6000,
    costOfLivingMultiplier: 0.8
  },
  'UT': {
    state: 'Utah',
    avgIndependentLiving: 3100,
    avgAssistedLiving: 4100,
    avgMemoryCare: 5600,
    avgSkilledNursing: 6600,
    costOfLivingMultiplier: 0.9
  },
  'NM': {
    state: 'New Mexico',
    avgIndependentLiving: 2900,
    avgAssistedLiving: 3800,
    avgMemoryCare: 5200,
    avgSkilledNursing: 6200,
    costOfLivingMultiplier: 0.85
  },
  'CO': {
    state: 'Colorado',
    avgIndependentLiving: 3300,
    avgAssistedLiving: 4400,
    avgMemoryCare: 6000,
    avgSkilledNursing: 7000,
    costOfLivingMultiplier: 1.05
  }
};

// Premium city multipliers for high-cost areas
const CITY_MULTIPLIERS: Record<string, number> = {
  // California premium cities
  'San Francisco': 1.8,
  'Palo Alto': 1.7,
  'San Jose': 1.6,
  'Los Angeles': 1.4,
  'San Diego': 1.3,
  'Santa Monica': 1.6,
  'Beverly Hills': 1.9,
  'Malibu': 1.8,
  'Carmel': 1.7,
  'Monterey': 1.5,
  'Napa': 1.6,
  'Sausalito': 1.7,
  
  // Texas premium cities
  'Austin': 1.2,
  'Dallas': 1.1,
  'Houston': 1.1,
  'San Antonio': 1.0,
  'Plano': 1.2,
  'The Woodlands': 1.3,
  
  // Hawaii premium cities
  'Honolulu': 1.4,
  'Maui': 1.5,
  'Kauai': 1.3,
  'Hilo': 1.1,
  
  // Arizona premium cities
  'Scottsdale': 1.3,
  'Paradise Valley': 1.4,
  'Sedona': 1.5,
  'Tucson': 1.0,
  'Phoenix': 1.1,
  
  // Nevada premium cities
  'Las Vegas': 1.1,
  'Reno': 1.0,
  'Henderson': 1.1,
  
  // Washington premium cities
  'Seattle': 1.4,
  'Bellevue': 1.5,
  'Kirkland': 1.3,
  'Redmond': 1.4,
  
  // Oregon premium cities
  'Portland': 1.2,
  'Bend': 1.3,
  'Ashland': 1.2,
  
  // Colorado premium cities
  'Denver': 1.2,
  'Boulder': 1.4,
  'Aspen': 1.8,
  'Vail': 1.7,
  'Colorado Springs': 1.0
};

class IntelligentPricingService {
  
  /**
   * Generate comprehensive pricing estimate for ANY community
   * This ensures NO community ever shows "call for pricing"
   */
  async generatePricingEstimate(community: any): Promise<PricingEstimate> {
    // 1. Check if community has live pricing (claimed community)
    if (community.isClaimed && community.livePricing) {
      return {
        min: community.livePricing.min,
        max: community.livePricing.max,
        careTypePricing: this.calculateCareTypePricing(community.livePricing.min, community.livePricing.max, community.careTypes),
        confidence: 'high',
        dataSource: 'live',
        lastUpdated: new Date(community.livePricing.lastUpdated)
      };
    }
    
    // 2. Use nationwide pricing research data as primary source
    try {
      const { nationwidePricingResearch } = await import('./nationwide-pricing-research');
      const researchData = await nationwidePricingResearch.getCommunityPricingEstimate(community.id);
      
      if (researchData && researchData.priceRange && researchData.priceRange.min > 0) {
        // Apply amenity multiplier to research data
        const amenityMultiplier = this.calculateAmenityMultiplier(community);
        const finalMin = Math.round(researchData.priceRange.min * amenityMultiplier);
        const finalMax = Math.round(researchData.priceRange.max * amenityMultiplier);
        
        return {
          min: finalMin,
          max: finalMax,
          careTypePricing: this.calculateCareTypePricing(finalMin, finalMax, community.careTypes || []),
          confidence: 'high',
          dataSource: 'market',
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      console.log('Research data not available, using existing pricing');
    }
    
    // 3. Check if community has existing price range
    if (community.priceRange && community.priceRange.min > 0) {
      return {
        min: community.priceRange.min,
        max: community.priceRange.max,
        careTypePricing: this.calculateCareTypePricing(community.priceRange.min, community.priceRange.max, community.careTypes),
        confidence: 'medium',
        dataSource: 'market',
        lastUpdated: new Date()
      };
    }
    
    // 3. Generate intelligent market-based estimate
    return this.generateMarketBasedEstimate(community);
  }
  
  /**
   * Generate market-based pricing estimate using state and city data
   */
  private generateMarketBasedEstimate(community: any): PricingEstimate {
    const stateData = STATE_MARKET_DATA[community.state] || STATE_MARKET_DATA['TX']; // Default to Texas
    const cityMultiplier = CITY_MULTIPLIERS[community.city] || 1.0;
    const amenityMultiplier = this.calculateAmenityMultiplier(community);
    
    // Calculate base pricing for primary care type
    const primaryCareType = community.careTypes[0] || 'Assisted Living';
    let basePricing = this.getBasePricingForCareType(primaryCareType, stateData);
    
    // Apply multipliers
    basePricing.min = Math.round(basePricing.min * cityMultiplier * amenityMultiplier * stateData.costOfLivingMultiplier);
    basePricing.max = Math.round(basePricing.max * cityMultiplier * amenityMultiplier * stateData.costOfLivingMultiplier);
    
    // Ensure reasonable range
    basePricing.min = Math.max(basePricing.min, 2000); // Minimum floor
    basePricing.max = Math.min(basePricing.max, 15000); // Maximum ceiling
    
    return {
      min: basePricing.min,
      max: basePricing.max,
      careTypePricing: this.calculateCareTypePricing(basePricing.min, basePricing.max, community.careTypes),
      confidence: 'medium',
      dataSource: 'estimated',
      lastUpdated: new Date()
    };
  }
  
  /**
   * Get base pricing for specific care type
   */
  private getBasePricingForCareType(careType: string, stateData: MarketData): { min: number, max: number } {
    const variance = 0.25; // 25% variance for range
    
    let basePrice: number;
    switch (careType) {
      case 'Independent Living':
        basePrice = stateData.avgIndependentLiving;
        break;
      case 'Assisted Living':
        basePrice = stateData.avgAssistedLiving;
        break;
      case 'Memory Care':
        basePrice = stateData.avgMemoryCare;
        break;
      case 'Skilled Nursing':
        basePrice = stateData.avgSkilledNursing;
        break;
      default:
        basePrice = stateData.avgAssistedLiving;
    }
    
    return {
      min: Math.round(basePrice * (1 - variance)),
      max: Math.round(basePrice * (1 + variance))
    };
  }
  
  /**
   * Calculate care type specific pricing
   */
  private calculateCareTypePricing(baseMin: number, baseMax: number, careTypes: string[]): Array<{careType: string, min: number, max: number}> {
    const careTypeMultipliers = {
      'Independent Living': 0.7,
      'Assisted Living': 1.0,
      'Memory Care': 1.4,
      'Skilled Nursing': 1.6
    };
    
    return careTypes.map(careType => {
      const multiplier = careTypeMultipliers[careType as keyof typeof careTypeMultipliers] || 1.0;
      return {
        careType,
        min: Math.round(baseMin * multiplier),
        max: Math.round(baseMax * multiplier)
      };
    });
  }
  
  /**
   * Calculate amenity multiplier based on premium amenities
   */
  private calculateAmenityMultiplier(community: any): number {
    let multiplier = 1.0;
    const premiumAmenities = [
      'Spa Services', 'Golf Course', 'Fine Dining', 'Concierge', 'Valet',
      'Theater', 'Library', 'Pool', 'Fitness Center', 'Beauty Salon',
      'Transportation', 'Housekeeping', 'Wellness Center'
    ];
    
    const amenities = community.amenities || [];
    const premiumCount = amenities.filter((amenity: string) => 
      premiumAmenities.some(premium => amenity.toLowerCase().includes(premium.toLowerCase()))
    ).length;
    
    // Add 5% for each premium amenity (max 25% increase)
    multiplier += Math.min(premiumCount * 0.05, 0.25);
    
    return multiplier;
  }
  
  /**
   * Update ALL communities with pricing ranges - NO EXCEPTIONS
   * Ensures every community has a pricing range (either live or estimated)
   */
  async updateAllCommunityPricing(): Promise<void> {
    try {
      console.log('🎯 ENFORCING UNIVERSAL PRICING COVERAGE - Starting update for ALL communities...');
      
      const allCommunities = await db.select().from(communities);
      let updated = 0;
      let skippedServiceProviders = 0;
      
      for (const community of allCommunities) {
        // Skip service providers (they don't need pricing)
        if (community.facilityType === 'Service Provider' || community.pricingType === 'service_provider') {
          skippedServiceProviders++;
          continue;
        }
        
        // Generate pricing estimate for ALL communities (claimed or unclaimed)
        const estimate = await this.generatePricingEstimate(community);
        
        // Update community with pricing estimate
        await db.update(communities)
          .set({ 
            priceRange: { min: estimate.min, max: estimate.max },
            pricingLastUpdated: new Date()
          })
          .where(eq(communities.id, community.id));
        
        updated++;
        
        // Log progress every 100 communities
        if (updated % 100 === 0) {
          console.log(`Updated pricing for ${updated} communities...`);
        }
      }
      
      console.log(`✅ UNIVERSAL PRICING COVERAGE ACHIEVED! Updated ${updated} communities, skipped ${skippedServiceProviders} service providers.`);
      
      // Clear all cached data that depends on community pricing
      console.log('🗑️ Clearing homepage and search caches to reflect updated pricing...');
      await searchCache.clear();
      await communityCache.clear();
      await apiCache.clear();
      console.log('✅ Cache cleared - updated pricing will now be visible on homepage and search results');
    } catch (error) {
      console.error('Error updating community pricing:', error);
    }
  }
  
  /**
   * Get pricing estimate for specific community
   */
  async getCommunityPricing(communityId: number): Promise<PricingEstimate> {
    const community = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
    
    if (!community.length) {
      throw new Error('Community not found');
    }
    
    return this.generatePricingEstimate(community[0]);
  }
}

export const intelligentPricingService = new IntelligentPricingService();

// Auto-update pricing on service startup
setTimeout(async () => {
  console.log('🎯 WAR ON "CALL FOR PRICING" - Starting automatic pricing updates...');
  await intelligentPricingService.updateAllCommunityPricing();
}, 5000); // Wait 5 seconds for DB to be ready