/**
 * Dynamic Pricing Service
 * Determines the most current pricing with source attribution
 * Prioritizes by recency and source reliability
 */

import { Community } from '@shared/schema';

export interface PricingDisplay {
  min: number;
  max: number;
  source: 'AI' | 'HUD' | 'Live' | 'Estimated' | 'AI Search';
  lastUpdated: Date | null;
  displayText: string;
  sourceAttribution: string;
  confidence: 'high' | 'medium' | 'low';
}

export class PricingService {
  /**
   * Get the most current pricing for a community with source attribution
   */
  static getCurrentPricing(community: any): PricingDisplay | null {
    const pricingSources: Array<{
      min: number;
      max: number;
      source: PricingDisplay['source'];
      lastUpdated: Date | null;
      priority: number;
    }> = [];

    // 1. Live Pricing (highest priority for claimed communities)
    if (community.livePricing && community.isClaimed) {
      const livePricing = community.livePricing;
      let min = Number.MAX_VALUE;
      let max = 0;
      
      ['independentLiving', 'assistedLiving', 'memoryCare', 'skilledNursing'].forEach(type => {
        if (livePricing[type]) {
          min = Math.min(min, livePricing[type].min);
          max = Math.max(max, livePricing[type].max);
        }
      });
      
      if (min !== Number.MAX_VALUE && max !== 0) {
        pricingSources.push({
          min,
          max,
          source: 'Live',
          lastUpdated: livePricing.updatedAt ? new Date(livePricing.updatedAt) : community.pricingLastUpdated,
          priority: 1
        });
      }
    }

    // 2. AI Enrichment Pricing (second priority - most recent)
    if (community.price_range_min && community.price_range_max) {
      pricingSources.push({
        min: Number(community.price_range_min),
        max: Number(community.price_range_max),
        source: 'AI Search',
        lastUpdated: community.ai_enrichment_date,
        priority: 2
      });
    }

    // 3. HUD Pricing (third priority - verified government data)
    if (community.rentPerMonth) {
      const hudRent = Number(community.rentPerMonth);
      if (hudRent > 0) {
        pricingSources.push({
          min: hudRent,
          max: hudRent,
          source: 'HUD',
          lastUpdated: community.hudDataLastUpdate || null,
          priority: 3
        });
      }
    }

    // 4. Price Range JSON (fourth priority)
    if (community.priceRange && community.priceRange.min && community.priceRange.max) {
      pricingSources.push({
        min: community.priceRange.min,
        max: community.priceRange.max,
        source: 'Estimated',
        lastUpdated: community.pricingLastUpdated || null,
        priority: 4
      });
    }

    // 5. Pricing Details Base Price (fifth priority)
    if (community.pricingDetails && community.pricingDetails.basePrice) {
      const basePrice = community.pricingDetails.basePrice;
      pricingSources.push({
        min: basePrice,
        max: basePrice,
        source: 'Estimated',
        lastUpdated: community.pricingLastUpdated || null,
        priority: 5
      });
    }

    // Select the best pricing source
    if (pricingSources.length === 0) {
      return null;
    }

    // Sort by priority (lower is better) and recency
    pricingSources.sort((a, b) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by recency if both have dates
      if (a.lastUpdated && b.lastUpdated) {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      }
      // Prefer ones with dates
      if (a.lastUpdated && !b.lastUpdated) return -1;
      if (!a.lastUpdated && b.lastUpdated) return 1;
      return 0;
    });

    const selected = pricingSources[0];
    
    // Format display text
    let displayText: string;
    if (selected.min === selected.max) {
      displayText = `$${selected.min.toLocaleString()}`;
    } else {
      displayText = `$${selected.min.toLocaleString()}-$${selected.max.toLocaleString()}`;
    }

    // Generate source attribution
    let sourceAttribution: string;
    let confidence: PricingDisplay['confidence'] = 'medium';
    
    switch (selected.source) {
      case 'Live':
        sourceAttribution = 'Live Pricing';
        confidence = 'high';
        break;
      case 'AI Search':
        const daysAgo = selected.lastUpdated 
          ? Math.floor((Date.now() - selected.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        if (daysAgo === 0) {
          sourceAttribution = 'AI Verified Today';
          confidence = 'high';
        } else if (daysAgo === 1) {
          sourceAttribution = 'AI Verified Yesterday';
          confidence = 'high';
        } else if (daysAgo <= 7) {
          sourceAttribution = `AI Verified ${daysAgo} days ago`;
          confidence = 'high';
        } else if (daysAgo <= 30) {
          sourceAttribution = `AI Verified ${Math.floor(daysAgo / 7)} weeks ago`;
          confidence = 'medium';
        } else {
          sourceAttribution = 'AI Verified Pricing';
          confidence = 'low';
        }
        break;
      case 'HUD':
        sourceAttribution = 'HUD Verified';
        confidence = 'high';
        break;
      case 'Estimated':
        sourceAttribution = 'Estimated Pricing';
        confidence = 'low';
        break;
      default:
        sourceAttribution = 'Pricing Available';
        confidence = 'low';
    }

    return {
      min: selected.min,
      max: selected.max,
      source: selected.source,
      lastUpdated: selected.lastUpdated,
      displayText,
      sourceAttribution,
      confidence
    };
  }

  /**
   * Format pricing for display in community cards
   */
  static formatCardPricing(pricing: PricingDisplay): string {
    return pricing.displayText;
  }

  /**
   * Format source attribution for display
   */
  static formatSourceAttribution(pricing: PricingDisplay): string {
    return pricing.sourceAttribution;
  }

  /**
   * Get confidence badge color
   */
  static getConfidenceColor(confidence: PricingDisplay['confidence']): string {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  }

  /**
   * Check if pricing needs refresh
   */
  static needsRefresh(community: any): boolean {
    // If no AI enrichment date, needs refresh
    if (!community.ai_enrichment_date) {
      return true;
    }

    // If AI enrichment is older than 30 days, needs refresh
    const daysSinceEnrichment = Math.floor(
      (Date.now() - new Date(community.ai_enrichment_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceEnrichment > 30;
  }

  /**
   * Get pricing history for a community
   */
  static getPricingHistory(community: any): Array<{
    date: Date;
    min: number;
    max: number;
    source: string;
  }> {
    const history = [];

    // Add HUD pricing
    if (community.rentPerMonth) {
      history.push({
        date: community.hudDataLastUpdate || new Date('2024-01-01'),
        min: Number(community.rentPerMonth),
        max: Number(community.rentPerMonth),
        source: 'HUD Database'
      });
    }

    // Add AI enrichment pricing
    if (community.price_range_min && community.price_range_max && community.ai_enrichment_date) {
      history.push({
        date: new Date(community.ai_enrichment_date),
        min: Number(community.price_range_min),
        max: Number(community.price_range_max),
        source: 'AI Market Research'
      });
    }

    // Add live pricing
    if (community.livePricing && community.livePricing.updatedAt) {
      let min = Number.MAX_VALUE;
      let max = 0;
      
      ['independentLiving', 'assistedLiving', 'memoryCare', 'skilledNursing'].forEach(type => {
        if (community.livePricing[type]) {
          min = Math.min(min, community.livePricing[type].min);
          max = Math.max(max, community.livePricing[type].max);
        }
      });
      
      if (min !== Number.MAX_VALUE && max !== 0) {
        history.push({
          date: new Date(community.livePricing.updatedAt),
          min,
          max,
          source: 'Community Provided'
        });
      }
    }

    // Sort by date descending
    return history.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}

export default PricingService;