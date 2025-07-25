/**
 * Nationwide Pricing Research System
 * 
 * This system has been updated to comply with the golden data rule.
 * We NO LONGER generate artificial pricing estimates.
 * 
 * Only verified pricing from these sources is allowed:
 * - HUD properties with actual rent data (rentPerMonth field)
 * - Community-verified pricing (within 30 days)  
 * - Authenticated market research from database
 * - User-reported pricing with verification
 * 
 * NO FAKE DATA - All pricing must come from authentic sources
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

interface CareTypePricing {
  careType: string;
  nationalAverage: {
    min: number;
    max: number;
    median: number;
  };
  stateAverages: Record<string, { min: number; max: number; median: number }>;
  metroAdjustments: Record<string, number>; // Cost of living multipliers
}

interface MarketResearchData {
  state: string;
  careType: string;
  averageMonthlyRate: number;
  lowRange: number;
  highRange: number;
  dataSource: string;
  lastUpdated: string;
  cityCostMultipliers: Record<string, number>;
}

// No hardcoded pricing data allowed
const AUTHENTIC_PRICING_DATA: MarketResearchData[] = [];

export class NationwidePricingResearch {
  /**
   * Get verified pricing only - no artificial estimates
   * Returns null if no verified pricing exists
   */
  getAuthenticPricing(state: string, city: string, careTypes: string[]): {
    priceRange: { min: number; max: number };
    careTypePricing: Array<{ careType: string; min: number; max: number }>;
    dataSource: string;
    confidence: 'high' | 'medium' | 'low';
  } | null {
    // This method has been disabled to prevent artificial pricing generation
    // Only verified pricing from real sources should be used
    return null;
  }

  /**
   * This method has been disabled - we no longer generate artificial pricing
   * Communities must provide verified pricing data
   */
  async updateAllCommunityPricing(): Promise<void> {
    console.log('⚠️ This method has been disabled to maintain data integrity');
    console.log('Communities without verified pricing will show "Contact for pricing"');
    return;
  }

  /**
   * Get pricing transparency level for a community
   * Only shows "live" for verified data
   */
  getPricingTransparencyLevel(community: any): {
    level: 'live' | 'estimated' | 'contact';
    badge: string;
    description: string;
  } {
    // Check for HUD verified pricing
    if (community.hudPropertyId && community.rentPerMonth && parseFloat(community.rentPerMonth) > 0) {
      return {
        level: 'live',
        badge: 'HUD Verified',
        description: 'Government verified pricing data'
      };
    }

    // Check if community is claimed and has verified pricing
    const isClaimed = community.claimedBy || 
                     community.badges?.includes('Featured') || 
                     community.badges?.includes('Premium');

    if (isClaimed && community.priceRange && community.priceRange.min > 0 &&
        community.pricingLastUpdated && 
        new Date(community.pricingLastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      return {
        level: 'live',
        badge: 'Community Verified',
        description: 'Pricing verified by community within last 30 days'
      };
    }

    // Check for database market research pricing
    if (community.priceRange && community.priceRange.min > 0 && community.dataSource) {
      return {
        level: 'estimated',
        badge: 'Market Research',
        description: 'Based on verified market research data'
      };
    }

    // No verified pricing available
    return {
      level: 'contact',
      badge: 'Contact for Pricing',
      description: 'Please contact community for current pricing information'
    };
  }
}

export const nationwidePricingResearch = new NationwidePricingResearch();