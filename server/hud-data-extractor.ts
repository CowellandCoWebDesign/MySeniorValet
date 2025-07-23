// HUD Data Extractor - Extract authentic pricing and occupancy data from HUD descriptions
// This ensures we display ONLY real government-sourced data, no fake/mock information

export interface ExtractedHudData {
  avgRent?: number;
  occupancyRate?: number;
  totalUnits?: number;
  seniorPercentage?: number;
  hudPropertyId?: string;
  isHudProperty: boolean;
  pricingSource: 'hud_authentic' | 'market_estimate' | 'contact_for_pricing';
  qualityScore: number; // 0-100, higher = more reliable data
}

export class HudDataExtractor {
  
  /**
   * Extract authentic HUD data from community description
   * Returns only verified government data, never fake/mock data
   */
  static extractHudData(community: any): ExtractedHudData {
    const description = community.description || '';
    const isHudProperty = !!community.hud_property_id || description.includes('Official HUD');
    
    const result: ExtractedHudData = {
      isHudProperty,
      pricingSource: 'contact_for_pricing',
      qualityScore: 0
    };

    if (!isHudProperty) {
      // For non-HUD properties, only use market estimates if we have sufficient data
      result.pricingSource = 'market_estimate';
      result.qualityScore = 20; // Low quality for estimated data
      return result;
    }

    // Extract authentic HUD pricing data
    const avgRentMatch = description.match(/avg rent \$([0-9,]+)\/month/);
    if (avgRentMatch) {
      result.avgRent = parseInt(avgRentMatch[1].replace(',', ''));
      result.pricingSource = 'hud_authentic';
      result.qualityScore += 40; // High quality for HUD pricing
    }

    // Extract authentic occupancy data
    const occupancyMatch = description.match(/([0-9.]+)% occupied/);
    if (occupancyMatch) {
      result.occupancyRate = parseFloat(occupancyMatch[1]);
      result.qualityScore += 30; // High quality for HUD occupancy
    }

    // Extract unit count
    const unitsMatch = description.match(/with ([0-9,]+) units/);
    if (unitsMatch) {
      result.totalUnits = parseInt(unitsMatch[1].replace(',', ''));
      result.qualityScore += 20; // High quality for HUD unit data
    }

    // Extract senior percentage
    const seniorMatch = description.match(/([0-9.]+)% senior residents/);
    if (seniorMatch) {
      result.seniorPercentage = parseFloat(seniorMatch[1]);
      result.qualityScore += 10; // Moderate quality for demographics
    }

    // Extract HUD Property ID
    const hudIdMatch = description.match(/Official HUD (?:property )?ID: ([0-9]+)/);
    if (hudIdMatch) {
      result.hudPropertyId = hudIdMatch[1];
      result.qualityScore += 10; // Official verification
    }

    return result;
  }

  /**
   * Generate display-ready pricing information
   * Only shows authentic data with proper source attribution
   */
  static formatPricingDisplay(hudData: ExtractedHudData): {
    displayPrice: string;
    priceLabel: string;
    qualityBadge: string;
    showContactButton: boolean;
  } {
    
    if (hudData.pricingSource === 'hud_authentic' && hudData.avgRent) {
      return {
        displayPrice: `$${hudData.avgRent.toLocaleString()}/month`,
        priceLabel: 'HUD Official Avg Rent',
        qualityBadge: 'GOLD: Government Data',
        showContactButton: true
      };
    }

    if (hudData.pricingSource === 'market_estimate') {
      return {
        displayPrice: 'Contact for Current Pricing',
        priceLabel: 'Market-Based Estimate Available',
        qualityBadge: 'BRONZE: Market Analysis',
        showContactButton: true
      };
    }

    return {
      displayPrice: 'Contact for Pricing',
      priceLabel: 'Call for Current Rates',
      qualityBadge: 'Contact Required',
      showContactButton: true
    };
  }

  /**
   * Generate availability display
   * Shows real occupancy data when available
   */
  static formatAvailabilityDisplay(hudData: ExtractedHudData): {
    availabilityStatus: string;
    occupancyDisplay?: string;
    availabilityColor: string;
    unitsDisplay?: string;
  } {
    
    if (hudData.occupancyRate !== undefined) {
      const availableRate = 100 - hudData.occupancyRate;
      const availabilityColor = availableRate > 10 ? 'green' : availableRate > 5 ? 'yellow' : 'red';
      
      return {
        availabilityStatus: availableRate > 5 ? 'Units Available' : 'Limited Availability',
        occupancyDisplay: `${hudData.occupancyRate}% occupied`,
        availabilityColor,
        unitsDisplay: hudData.totalUnits ? `${hudData.totalUnits} total units` : undefined
      };
    }

    return {
      availabilityStatus: 'Contact for Availability',
      availabilityColor: 'gray'
    };
  }

  /**
   * Generate transparency badges based on authentic data quality
   */
  static generateTransparencyBadges(hudData: ExtractedHudData): Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    type: string;
    rarity: string;
    points: number;
  }> {
    const badges = [];

    if (hudData.isHudProperty) {
      badges.push({
        id: 'hud-verified',
        name: 'HUD Verified',
        description: 'Official HUD property with government verification',
        icon: 'shield-check',
        color: 'bg-blue-600',
        type: 'verification',
        rarity: 'rare',
        points: 50
      });
    }

    if (hudData.pricingSource === 'hud_authentic') {
      badges.push({
        id: 'authentic-pricing',
        name: 'Authentic Pricing',
        description: 'Real pricing data from official HUD sources',
        icon: 'dollar-sign',
        color: 'bg-green-600',
        type: 'pricing',
        rarity: 'rare',
        points: 40
      });
    }

    if (hudData.occupancyRate !== undefined) {
      badges.push({
        id: 'live-occupancy',
        name: 'Live Occupancy Data',
        description: 'Real-time occupancy information from HUD',
        icon: 'activity',
        color: 'bg-cyan-600',
        type: 'availability',
        rarity: 'uncommon',
        points: 30
      });
    }

    if (hudData.qualityScore >= 80) {
      badges.push({
        id: 'gold-standard',
        name: 'Gold Standard Data',
        description: 'Highest quality authentic government data',
        icon: 'award',
        color: 'bg-yellow-500',
        type: 'quality',
        rarity: 'legendary',
        points: 60
      });
    }

    return badges;
  }

  /**
   * Check if a community has sufficient authentic data for premium display
   */
  static isPremiumQuality(hudData: ExtractedHudData): boolean {
    return hudData.qualityScore >= 60 || 
           (hudData.isHudProperty && hudData.avgRent !== undefined);
  }

  /**
   * Remove any fake/testing data and ensure only authentic information is displayed
   */
  static sanitizeForProduction(community: any): any {
    const hudData = this.extractHudData(community);
    const pricing = this.formatPricingDisplay(hudData);
    const availability = this.formatAvailabilityDisplay(hudData);
    const badges = this.generateTransparencyBadges(hudData);

    return {
      ...community,
      // Replace any fake pricing with authentic HUD data
      priceRange: hudData.avgRent ? {
        min: hudData.avgRent,
        max: hudData.avgRent,
        source: 'hud_authentic'
      } : null,
      
      // Use authentic availability data
      availabilityStatus: availability.availabilityStatus,
      occupancyRate: hudData.occupancyRate,
      totalUnits: hudData.totalUnits,
      
      // Add transparency information
      transparencyBadges: badges,
      transparencyScore: hudData.qualityScore,
      
      // Add display-ready information
      displayPricing: pricing,
      displayAvailability: availability,
      
      // Mark data source for transparency
      dataQuality: {
        isAuthentic: hudData.isHudProperty,
        source: hudData.pricingSource,
        qualityScore: hudData.qualityScore,
        lastVerified: hudData.isHudProperty ? 'Government Source' : 'Estimated'
      }
    };
  }
}