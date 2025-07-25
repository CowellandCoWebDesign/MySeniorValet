/**
 * Intelligent Pricing System for MySeniorValet
 * Eliminates "Call for Pricing" by providing data-driven estimates
 * Based on official government data sources and market analysis
 */

// Note: All hardcoded pricing data has been removed to ensure data integrity
// We only display verified pricing from real sources:
// 1. HUD properties with actual rent data
// 2. Community-verified pricing (within 30 days)
// 3. Authenticated market research from database
// 4. User-reported pricing with verification

interface PricingEstimate {
  displayPrice: string;
  priceRange: { min: number; max: number };
  priceLabel: string;
  qualityBadge: string;
  dataSource: string;
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export class IntelligentPricingSystem {
  
  /**
   * Get verified pricing for a community - ONLY from real sources
   * Returns null if no verified pricing exists
   */
  static generatePricingEstimate(community: any): PricingEstimate | null {
    // Debug logging to check HUD data
    if (community.hudPropertyId) {
      console.log(`Checking HUD data for ${community.name}:`, {
        hudPropertyId: community.hudPropertyId,
        rentPerMonth: community.rentPerMonth,
        rentPerMonthType: typeof community.rentPerMonth,
        rentPerMonthValue: parseFloat(community.rentPerMonth || 0)
      });
    }
    
    // PRIORITY 1: Use authentic HUD data if available (rentPerMonth is the correct field)
    if (community.hudPropertyId && community.rentPerMonth && parseFloat(community.rentPerMonth) > 0) {
      const hudRent = Math.round(parseFloat(community.rentPerMonth));
      console.log(`Using HUD pricing for ${community.name}: $${hudRent}/month`);
      return {
        displayPrice: `$${hudRent.toLocaleString()}/month`,
        priceRange: {
          min: hudRent,
          max: hudRent // No artificial range - use exact HUD data
        },
        priceLabel: 'HUD Verified',
        qualityBadge: '🏛️ Government Data',
        dataSource: `HUD Property ${community.hudPropertyId}`,
        confidence: 'high',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }
    
    // PRIORITY 2: Use community-verified pricing (within 30 days)
    if (community.priceRange && community.priceRange.min > 0 && community.claimedBy &&
        community.pricingLastUpdated && 
        new Date(community.pricingLastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      return {
        displayPrice: `$${community.priceRange.min.toLocaleString()} - $${community.priceRange.max.toLocaleString()}/month`,
        priceRange: community.priceRange,
        priceLabel: 'Community Verified',
        qualityBadge: '✓ Verified',
        dataSource: 'Community Provided',
        confidence: 'high',
        lastUpdated: new Date(community.pricingLastUpdated).toISOString().split('T')[0]
      };
    }
    
    // PRIORITY 3: Use database market research pricing
    if (community.priceRange && community.priceRange.min > 0 && community.dataSource) {
      return {
        displayPrice: `$${community.priceRange.min.toLocaleString()} - $${community.priceRange.max.toLocaleString()}/month`,
        priceRange: community.priceRange,
        priceLabel: 'Market Research',
        qualityBadge: 'Research Data',
        dataSource: community.dataSource,
        confidence: 'medium',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }
    
    // No verified pricing available - return null
    return null;
  }
  

  
  /**
   * Get pricing transparency score based on data quality
   */
  static getPricingTransparencyScore(community: any): number {
    let score = 0;
    
    // HUD official data = highest score
    if (community.hudPropertyId && community.monthlyRentRangeStart) {
      score = 100;
    }
    // Community-provided pricing
    else if (community.priceRange?.min && community.claimedBy) {
      score = 85;
    }
    // Market estimates with good data
    else if (community.state && community.city && community.careTypes) {
      score = 70;
    }
    // Basic estimates
    else {
      score = 50;
    }
    
    return score;
  }
  
  /**
   * Generate pricing badge based on transparency
   */
  static getPricingBadge(transparencyScore: number): string {
    if (transparencyScore >= 95) return 'Price Pioneer';
    if (transparencyScore >= 85) return 'Transparency Leader';
    if (transparencyScore >= 75) return 'Price Clear';
    if (transparencyScore >= 65) return 'Market Rate';
    return 'Estimated';
  }
}

/**
 * War on Call for Pricing - Replace all instances
 * Now properly handles cases where no verified pricing exists
 */
export function eliminateCallForPricing(community: any): any {
  const pricingEstimate = IntelligentPricingSystem.generatePricingEstimate(community);
  
  // Debug HUD data detection
  const isHudProperty = community.hudPropertyId && community.rentPerMonth && community.rentPerMonth > 0;
  if (isHudProperty) {
    console.log(`HUD Property detected: ${community.name} (ID: ${community.hudPropertyId}, Rent: $${community.rentPerMonth})`);
  }
  
  // Handle case when no verified pricing exists
  if (!pricingEstimate) {
    return {
      ...community,
      // Preserve all HUD and pricing fields
      hudPropertyId: community.hudPropertyId,
      rentPerMonth: community.rentPerMonth,
      claimedBy: community.claimedBy,
      pricingType: community.pricingType,
      pricingLastUpdated: community.pricingLastUpdated,
      displayPricing: {
        displayPrice: 'Contact for pricing',
        priceLabel: 'Contact Community',
        qualityBadge: 'Please Contact',
        showContactButton: true
      },
      priceRange: null,
      transparencyScore: 0,
      pricingBadge: 'Contact Required',
      dataQuality: {
        isAuthentic: false,
        source: 'No verified data',
        qualityScore: 0,
        lastVerified: null
      }
    };
  }
  
  // Normal case with verified pricing
  return {
    ...community,
    // Preserve all HUD and pricing fields
    hudPropertyId: community.hudPropertyId,
    rentPerMonth: community.rentPerMonth,
    claimedBy: community.claimedBy,
    pricingType: community.pricingType,
    pricingLastUpdated: community.pricingLastUpdated,
    displayPricing: {
      displayPrice: pricingEstimate.displayPrice,
      priceLabel: pricingEstimate.priceLabel,
      qualityBadge: pricingEstimate.qualityBadge,
      showContactButton: pricingEstimate.confidence !== 'high' // Only show contact for non-HUD estimates
    },
    priceRange: pricingEstimate.priceRange,
    transparencyScore: IntelligentPricingSystem.getPricingTransparencyScore(community),
    pricingBadge: IntelligentPricingSystem.getPricingBadge(
      IntelligentPricingSystem.getPricingTransparencyScore(community)
    ),
    dataQuality: {
      isAuthentic: pricingEstimate.confidence === 'high',
      source: pricingEstimate.dataSource,
      qualityScore: pricingEstimate.confidence === 'high' ? 95 : 
                   pricingEstimate.confidence === 'medium' ? 75 : 55,
      lastVerified: pricingEstimate.lastUpdated
    }
  };
}