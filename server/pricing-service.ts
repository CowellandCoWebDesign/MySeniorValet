/**
 * Pricing Service - Assigns realistic pricing based on care types and community status
 * Distinguishes between estimated pricing and live pricing from claimed communities
 */

export interface PricingRange {
  min: number;
  max: number;
  isEstimated: boolean;
  isClaimed: boolean;
  lastUpdated: Date;
}

export interface CareTypePricing {
  careType: string;
  baseMin: number;
  baseMax: number;
  californiaMultiplier: number;
  description: string;
}

export class PricingService {
  // California care type pricing structure based on market research
  private readonly careTypePricing: CareTypePricing[] = [
    {
      careType: 'Independent Living',
      baseMin: 2500,
      baseMax: 4500,
      californiaMultiplier: 1.4,
      description: 'Apartment-style living with minimal care services'
    },
    {
      careType: 'Assisted Living',
      baseMin: 3500,
      baseMax: 6500,
      californiaMultiplier: 1.5,
      description: 'Personal care assistance with daily activities'
    },
    {
      careType: 'Memory Care',
      baseMin: 5500,
      baseMax: 8500,
      californiaMultiplier: 1.6,
      description: 'Specialized dementia and Alzheimer\'s care'
    },
    {
      careType: 'Skilled Nursing',
      baseMin: 7500,
      baseMax: 12000,
      californiaMultiplier: 1.3,
      description: '24/7 medical care and rehabilitation'
    },
    {
      careType: 'Respite Care',
      baseMin: 150,
      baseMax: 400,
      californiaMultiplier: 1.4,
      description: 'Short-term care (daily rate)'
    }
  ];

  /**
   * Calculate realistic pricing for a community based on care types
   */
  calculateCommunityPricing(community: any): PricingRange {
    const { careTypes, city, state, isClaimed = false } = community;
    
    // If community is claimed, use their live pricing if available
    if (isClaimed && community.livePrice) {
      return {
        min: community.livePrice.min,
        max: community.livePrice.max,
        isEstimated: false,
        isClaimed: true,
        lastUpdated: new Date(community.livePrice.lastUpdated)
      };
    }

    // Calculate estimated pricing based on care types
    let minPrice = Infinity;
    let maxPrice = 0;

    if (!careTypes || careTypes.length === 0) {
      // Default to assisted living if no care types specified
      const assistedLiving = this.careTypePricing.find(ct => ct.careType === 'Assisted Living')!;
      minPrice = Math.round(assistedLiving.baseMin * assistedLiving.californiaMultiplier);
      maxPrice = Math.round(assistedLiving.baseMax * assistedLiving.californiaMultiplier);
    } else {
      // Calculate pricing range based on all care types offered
      careTypes.forEach((careType: string) => {
        const pricing = this.careTypePricing.find(ct => ct.careType === careType);
        if (pricing) {
          const adjustedMin = Math.round(pricing.baseMin * pricing.californiaMultiplier);
          const adjustedMax = Math.round(pricing.baseMax * pricing.californiaMultiplier);
          
          minPrice = Math.min(minPrice, adjustedMin);
          maxPrice = Math.max(maxPrice, adjustedMax);
        }
      });
    }

    // Apply regional adjustments for high-cost areas
    const regionalMultiplier = this.getRegionalMultiplier(city, state);
    minPrice = Math.round(minPrice * regionalMultiplier);
    maxPrice = Math.round(maxPrice * regionalMultiplier);

    // Add some randomness to avoid identical pricing (+/- 10%)
    const variance = 0.1;
    const minVariance = 1 - variance + (Math.random() * variance * 2);
    const maxVariance = 1 - variance + (Math.random() * variance * 2);
    
    minPrice = Math.round(minPrice * minVariance);
    maxPrice = Math.round(maxPrice * maxVariance);

    return {
      min: minPrice,
      max: maxPrice,
      isEstimated: true,
      isClaimed: false,
      lastUpdated: new Date()
    };
  }

  /**
   * Get regional pricing multiplier based on location
   */
  private getRegionalMultiplier(city: string, state: string): number {
    if (state !== 'CA') return 1.0;

    const cityLower = city.toLowerCase();
    
    // High-cost California areas
    if (cityLower.includes('san francisco') || 
        cityLower.includes('palo alto') || 
        cityLower.includes('mountain view') ||
        cityLower.includes('cupertino')) {
      return 1.8;
    }
    
    // Medium-high cost areas
    if (cityLower.includes('san jose') || 
        cityLower.includes('oakland') || 
        cityLower.includes('berkeley') ||
        cityLower.includes('santa clara') ||
        cityLower.includes('los angeles') ||
        cityLower.includes('santa monica')) {
      return 1.5;
    }
    
    // Medium cost areas
    if (cityLower.includes('sacramento') || 
        cityLower.includes('san diego') || 
        cityLower.includes('santa rosa') ||
        cityLower.includes('stockton')) {
      return 1.3;
    }
    
    // Lower cost areas
    if (cityLower.includes('fresno') || 
        cityLower.includes('bakersfield') || 
        cityLower.includes('redding') ||
        cityLower.includes('modesto')) {
      return 1.1;
    }
    
    // Default California multiplier
    return 1.2;
  }

  /**
   * Format pricing for display
   */
  formatPricing(pricing: PricingRange): string {
    const minK = Math.round(pricing.min / 1000 * 10) / 10;
    const maxK = Math.round(pricing.max / 1000 * 10) / 10;
    
    if (pricing.isClaimed) {
      return `$${minK}K - $${maxK}K`;
    } else {
      return `$${minK}K - $${maxK}K*`;
    }
  }

  /**
   * Get pricing disclaimer text
   */
  getPricingDisclaimer(pricing: PricingRange): string {
    if (pricing.isClaimed) {
      return 'Live pricing updated by community';
    } else {
      return 'Estimated pricing based on care types and location';
    }
  }

  /**
   * Update live pricing for claimed community
   */
  updateLivePricing(communityId: number, newPricing: { min: number; max: number }): PricingRange {
    return {
      min: newPricing.min,
      max: newPricing.max,
      isEstimated: false,
      isClaimed: true,
      lastUpdated: new Date()
    };
  }

  /**
   * Get all care type pricing information
   */
  getCareTypePricing(): CareTypePricing[] {
    return this.careTypePricing.map(pricing => ({
      ...pricing,
      // Show California-adjusted pricing
      baseMin: Math.round(pricing.baseMin * pricing.californiaMultiplier),
      baseMax: Math.round(pricing.baseMax * pricing.californiaMultiplier)
    }));
  }
}

export const pricingService = new PricingService();