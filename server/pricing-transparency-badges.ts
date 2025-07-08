/**
 * Pricing Transparency Achievement Badges System
 * Awards communities for providing transparent pricing information
 */

export interface PricingTransparencyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    hasPricing: boolean;
    hasLivePricing?: boolean;
    hasRangeDetailed?: boolean;
    hasRecentUpdate?: boolean;
    hasMultipleCareTypes?: boolean;
    hasSpecialRates?: boolean;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export const PRICING_TRANSPARENCY_BADGES: PricingTransparencyBadge[] = [
  {
    id: 'price-pioneer',
    name: 'Price Pioneer',
    description: 'First to share pricing information',
    icon: 'star',
    color: 'blue',
    criteria: {
      hasPricing: true
    },
    rarity: 'common',
    points: 10
  },
  {
    id: 'transparency-champion',
    name: 'Transparency Champion',
    description: 'Provides live, up-to-date pricing',
    icon: 'shield-check',
    color: 'green',
    criteria: {
      hasPricing: true,
      hasLivePricing: true
    },
    rarity: 'uncommon',
    points: 25
  },
  {
    id: 'pricing-pro',
    name: 'Pricing Pro',
    description: 'Detailed pricing for multiple care types',
    icon: 'award',
    color: 'purple',
    criteria: {
      hasPricing: true,
      hasLivePricing: true,
      hasMultipleCareTypes: true
    },
    rarity: 'rare',
    points: 50
  },
  {
    id: 'price-master',
    name: 'Price Master',
    description: 'Complete pricing transparency with recent updates',
    icon: 'crown',
    color: 'gold',
    criteria: {
      hasPricing: true,
      hasLivePricing: true,
      hasRangeDetailed: true,
      hasRecentUpdate: true
    },
    rarity: 'epic',
    points: 100
  },
  {
    id: 'transparency-legend',
    name: 'Transparency Legend',
    description: 'Ultimate pricing transparency with special rates',
    icon: 'diamond',
    color: 'rainbow',
    criteria: {
      hasPricing: true,
      hasLivePricing: true,
      hasRangeDetailed: true,
      hasRecentUpdate: true,
      hasMultipleCareTypes: true,
      hasSpecialRates: true
    },
    rarity: 'legendary',
    points: 250
  }
];

export class PricingTransparencyService {
  /**
   * Evaluate which badges a community has earned
   */
  evaluateCommunityBadges(community: any): PricingTransparencyBadge[] {
    const earnedBadges: PricingTransparencyBadge[] = [];
    
    // Extract community pricing data
    const hasPricing = !!(community.priceRange?.min && community.priceRange?.max);
    const hasLivePricing = community.pricingType === 'live' && community.isClaimed;
    const hasRangeDetailed = hasPricing && (community.priceRange.max - community.priceRange.min) > 1000;
    const hasRecentUpdate = community.lastPriceUpdate && 
      new Date(community.lastPriceUpdate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const hasMultipleCareTypes = community.careTypes && community.careTypes.length > 1;
    const hasSpecialRates = community.specialOffers && community.specialOffers.length > 0;
    

    
    // Check each badge
    for (const badge of PRICING_TRANSPARENCY_BADGES) {
      const criteria = badge.criteria;
      let qualifies = true;
      
      if (criteria.hasPricing && !hasPricing) qualifies = false;
      if (criteria.hasLivePricing && !hasLivePricing) qualifies = false;
      if (criteria.hasRangeDetailed && !hasRangeDetailed) qualifies = false;
      if (criteria.hasRecentUpdate && !hasRecentUpdate) qualifies = false;
      if (criteria.hasMultipleCareTypes && !hasMultipleCareTypes) qualifies = false;
      if (criteria.hasSpecialRates && !hasSpecialRates) qualifies = false;
      
      if (qualifies) {
        earnedBadges.push(badge);
      }
    }
    return earnedBadges;
  }
  
  /**
   * Get transparency score for a community
   */
  getTransparencyScore(community: any): number {
    const badges = this.evaluateCommunityBadges(community);
    return badges.reduce((total, badge) => total + badge.points, 0);
  }
  
  /**
   * Get all communities with their transparency badges
   */
  async enrichCommunitiesWithBadges(communities: any[]): Promise<any[]> {
    return communities.map(community => {
      const badges = this.evaluateCommunityBadges(community);
      const transparencyScore = this.getTransparencyScore(community);
      
      return {
        ...community,
        transparencyBadges: badges,
        transparencyScore
      };
    });
  }
}

export const pricingTransparencyService = new PricingTransparencyService();