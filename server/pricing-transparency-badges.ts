/**
 * Dual Transparency Badge System
 * Awards communities for providing transparent pricing and availability information
 */

export interface TransparencyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'pricing' | 'availability';
  criteria: {
    hasPricing?: boolean;
    hasLivePricing?: boolean;
    hasRangeDetailed?: boolean;
    hasRecentUpdate?: boolean;
    hasMultipleCareTypes?: boolean;
    hasSpecialRates?: boolean;
    hasAvailability?: boolean;
    hasRecentAvailability?: boolean;
    isClaimed?: boolean;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export const TRANSPARENCY_BADGES: TransparencyBadge[] = [
  // Pricing Transparency Badges
  {
    id: 'price-pioneer',
    name: 'Price Pioneer',
    description: 'First to share pricing information',
    icon: 'star',
    color: 'bg-blue-500',
    type: 'pricing',
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
    color: 'bg-green-500',
    type: 'pricing',
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
    color: 'bg-purple-500',
    type: 'pricing',
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
    color: 'bg-yellow-500',
    type: 'pricing',
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
    description: 'Ultimate pricing transparency with special offers',
    icon: 'trophy',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    type: 'pricing',
    criteria: {
      hasPricing: true,
      hasLivePricing: true,
      hasRangeDetailed: true,
      hasRecentUpdate: true,
      hasSpecialRates: true,
      isClaimed: true
    },
    rarity: 'legendary',
    points: 250
  },
  
  // Availability Transparency Badges
  {
    id: 'availability-beacon',
    name: 'Availability Beacon',
    description: 'Shares current availability status',
    icon: 'activity',
    color: 'bg-cyan-500',
    type: 'availability',
    criteria: {
      hasAvailability: true
    },
    rarity: 'common',
    points: 15
  },
  {
    id: 'live-tracker',
    name: 'Live Tracker',
    description: 'Provides real-time availability updates',
    icon: 'clock',
    color: 'bg-emerald-500',
    type: 'availability',
    criteria: {
      hasAvailability: true,
      hasRecentAvailability: true,
      isClaimed: true
    },
    rarity: 'uncommon',
    points: 35
  },
  {
    id: 'availability-master',
    name: 'Availability Master',
    description: 'Complete availability transparency with frequent updates',
    icon: 'check-circle',
    color: 'bg-indigo-500',
    type: 'availability',
    criteria: {
      hasAvailability: true,
      hasRecentAvailability: true,
      hasLivePricing: true,
      isClaimed: true
    },
    rarity: 'rare',
    points: 75
  },
  {
    id: 'transparency-ultimate',
    name: 'Transparency Ultimate',
    description: 'Perfect transparency: pricing + availability + claimed',
    icon: 'diamond',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    type: 'availability',
    criteria: {
      hasAvailability: true,
      hasRecentAvailability: true,
      hasLivePricing: true,
      hasRecentUpdate: true,
      isClaimed: true
    },
    rarity: 'legendary',
    points: 500
  }
];

export class PricingTransparencyService {
  /**
   * Evaluate which badges a community has earned
   */
  evaluateCommunityBadges(community: any): TransparencyBadge[] {
    const earnedBadges: TransparencyBadge[] = [];
    
    // Extract community pricing data
    const hasPricing = !!(community.priceRange?.min && community.priceRange?.max) || 
                      !!(community.livePricing && Object.keys(community.livePricing).length > 0);
    const hasLivePricing = community.pricingType === 'live' && community.isClaimed && community.livePricing;
    const hasRangeDetailed = hasPricing && ((community.priceRange?.max - community.priceRange?.min) > 1000 ||
                            (community.livePricing && Object.keys(community.livePricing).length > 1));
    const hasRecentUpdate = community.pricingLastUpdated && 
      new Date(community.pricingLastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const hasMultipleCareTypes = community.careTypes && community.careTypes.length > 1;
    const hasSpecialRates = community.pricingDetails?.specialOffers && community.pricingDetails.specialOffers.length > 0;
    
    // Extract community availability data
    const hasAvailability = community.availabilityStatus && community.availabilityStatus !== 'Unknown';
    const hasRecentAvailability = community.availabilityLastUpdated && 
      new Date(community.availabilityLastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const isClaimed = community.isClaimed;
    
    // Check each badge
    for (const badge of TRANSPARENCY_BADGES) {
      const criteria = badge.criteria;
      let qualifies = true;
      
      if (criteria.hasPricing && !hasPricing) qualifies = false;
      if (criteria.hasLivePricing && !hasLivePricing) qualifies = false;
      if (criteria.hasRangeDetailed && !hasRangeDetailed) qualifies = false;
      if (criteria.hasRecentUpdate && !hasRecentUpdate) qualifies = false;
      if (criteria.hasMultipleCareTypes && !hasMultipleCareTypes) qualifies = false;
      if (criteria.hasSpecialRates && !hasSpecialRates) qualifies = false;
      if (criteria.hasAvailability && !hasAvailability) qualifies = false;
      if (criteria.hasRecentAvailability && !hasRecentAvailability) qualifies = false;
      if (criteria.isClaimed && !isClaimed) qualifies = false;
      
      if (qualifies) {
        earnedBadges.push(badge);
      }
    }
    return earnedBadges;
  }
  
  /**
   * Get transparency score for a community (combined pricing + availability)
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