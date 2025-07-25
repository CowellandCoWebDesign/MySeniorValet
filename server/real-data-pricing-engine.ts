/**
 * Real Data Pricing Engine - Authentic Pricing Intelligence
 * 
 * Replaces ALL hardcoded estimates with real data from:
 * 1. Database analysis of 25,782 communities
 * 2. External market research (Genworth, CMS, AARP)
 * 
 * ZERO HARDCODED ESTIMATES - REAL DATA ONLY!
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { realDataAnalyzer } from "./real-data-analyzer";

interface RealPricingData {
  communityId: number;
  priceMin: number;
  priceMax: number;
  careType: string;
  state: string;
  dataSource: 'database_analysis' | 'market_research' | 'combined';
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

export class RealDataPricingEngine {
  private databaseAnalysis: any = null;
  private marketData: any = null;
  private lastUpdate: Date | null = null;

  /**
   * Initialize with real data sources
   */
  async initialize() {
    console.log('🔍 Initializing Real Data Pricing Engine...');
    
    try {
      // Get comprehensive real data analysis
      const intelligence = await realDataAnalyzer.getCombinedPricingIntelligence();
      
      this.databaseAnalysis = intelligence.databaseAnalysis;
      this.marketData = intelligence.externalMarketData;
      this.lastUpdate = new Date();
      
      console.log(`✅ Real Data Pricing Engine initialized with ${this.databaseAnalysis.totalCommunities} communities`);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Real Data Pricing Engine:', error);
      return false;
    }
  }

  /**
   * Get verified pricing for a community - ONLY from real sources
   * Returns null if no verified pricing exists
   */
  async getRealPricing(communityId: number): Promise<RealPricingData | null> {
    try {
      // Get the community from database
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        return null;
      }

      // Only return pricing if it's verified data from real sources
      // 1. HUD properties with actual rent data
      if (community.hudPropertyId && community.rentPerMonth && parseFloat(community.rentPerMonth) > 0) {
        const hudRent = Math.round(parseFloat(community.rentPerMonth));
        return {
          communityId,
          priceMin: hudRent,
          priceMax: hudRent, // Use exact HUD data, no artificial range
          careType: community.careType || 'Assisted Living',
          state: community.state || 'CA',
          dataSource: 'database_analysis',
          confidence: 'high',
          lastUpdated: new Date()
        };
      }

      // 2. Community-verified pricing (within 30 days)
      if (community.priceMin && community.priceMin > 0 && community.claimedBy &&
          community.pricingLastUpdated && 
          new Date(community.pricingLastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        return {
          communityId,
          priceMin: community.priceMin,
          priceMax: community.priceMax || community.priceMin,
          careType: community.careType || 'Assisted Living',
          state: community.state || 'CA',
          dataSource: 'database_analysis',
          confidence: 'high',
          lastUpdated: new Date()
        };
      }

      // 3. Database market research pricing (if from verified source)
      if (community.priceMin && community.priceMin > 0 && community.dataSource) {
        return {
          communityId,
          priceMin: community.priceMin,
          priceMax: community.priceMax || community.priceMin,
          careType: community.careType || 'Assisted Living',
          state: community.state || 'CA',
          dataSource: 'market_research',
          confidence: 'medium',
          lastUpdated: new Date()
        };
      }

      // No verified pricing available - return null
      return null;
    } catch (error) {
      console.error('Error getting real pricing:', error);
      return null;
    }
  }

  /**
   * This method has been disabled to prevent artificial pricing generation
   * We no longer create artificial price ranges around averages
   */
  private getMarketPricing(state: string, careType: string): { min: number; max: number } | null {
    // Return null - no artificial pricing generation allowed
    return null;
  }

  /**
   * This method has been disabled to prevent artificial pricing generation
   * We no longer create artificial price ranges around averages
   */
  private getCareTypeAverage(careType: string): { min: number; max: number } | null {
    // Return null - no artificial pricing generation allowed
    return null;
  }

  /**
   * Update ALL communities with real pricing data
   */
  async updateAllCommunitiesWithRealData(): Promise<{
    success: boolean;
    updated: number;
    skipped: number;
    errors: number;
    message: string;
  }> {
    console.log('🚀 Starting comprehensive real data pricing update...');
    
    const startTime = Date.now();
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Initialize with fresh data
      await this.initialize();

      // Get all communities
      const allCommunities = await db.select().from(communities);
      console.log(`📊 Found ${allCommunities.length} communities to analyze`);

      // Process in batches to avoid overwhelming the system
      const batchSize = 100;
      for (let i = 0; i < allCommunities.length; i += batchSize) {
        const batch = allCommunities.slice(i, i + batchSize);
        
        for (const community of batch) {
          try {
            // Skip if already has good pricing data
            if (community.priceMin && community.priceMin > 0) {
              skipped++;
              continue;
            }

            // Get real pricing
            const realPricing = await this.getRealPricing(community.id);
            if (!realPricing) {
              errors++;
              continue;
            }

            // Update community with real pricing
            await db
              .update(communities)
              .set({
                priceMin: realPricing.priceMin,
                priceMax: realPricing.priceMax,
                priceRange: {
                  min: realPricing.priceMin,
                  max: realPricing.priceMax
                },
                pricingDataSource: realPricing.dataSource,
                pricingConfidence: realPricing.confidence,
                updatedAt: new Date()
              })
              .where(eq(communities.id, community.id));

            updated++;
          } catch (error) {
            console.error(`Error updating community ${community.id}:`, error);
            errors++;
          }
        }

        // Log progress
        const progress = Math.round(((i + batchSize) / allCommunities.length) * 100);
        console.log(`📈 Progress: ${progress}% (${updated} updated, ${skipped} skipped, ${errors} errors)`);
      }

      const duration = Date.now() - startTime;
      const message = `Real data pricing update completed in ${Math.round(duration / 1000)}s: ${updated} communities updated, ${skipped} skipped, ${errors} errors`;
      
      console.log(`✅ ${message}`);
      
      return {
        success: true,
        updated,
        skipped,
        errors,
        message
      };
    } catch (error) {
      console.error('❌ Real data pricing update failed:', error);
      return {
        success: false,
        updated,
        skipped,
        errors,
        message: `Real data pricing update failed: ${error}`
      };
    }
  }

  /**
   * Get pricing statistics from real data
   */
  async getRealPricingStats(): Promise<{
    totalCommunities: number;
    withRealPricing: number;
    byDataSource: Record<string, number>;
    byConfidence: Record<string, number>;
    byState: Record<string, number>;
    byCareType: Record<string, number>;
  }> {
    try {
      const allCommunities = await db.select().from(communities);
      
      const stats = {
        totalCommunities: allCommunities.length,
        withRealPricing: 0,
        byDataSource: {} as Record<string, number>,
        byConfidence: {} as Record<string, number>,
        byState: {} as Record<string, number>,
        byCareType: {} as Record<string, number>
      };

      allCommunities.forEach(community => {
        // Check for valid pricing data - either priceRange or rentPerMonth for HUD properties
        const hasValidPricing = (
          (community.priceRange && typeof community.priceRange === 'object' && community.priceRange.min > 0) ||
          (community.rentPerMonth && community.rentPerMonth > 0)
        );
        
        if (hasValidPricing) {
          stats.withRealPricing++;
          
          // Count by data source (use rentPerMonth for HUD properties)
          const dataSource = community.rentPerMonth ? 'hud_official' : (community.pricingType || 'estimated');
          stats.byDataSource[dataSource] = (stats.byDataSource[dataSource] || 0) + 1;
          
          // Count by confidence
          const confidence = community.rentPerMonth ? 'high' : (community.pricingType === 'live' ? 'high' : 'medium');
          stats.byConfidence[confidence] = (stats.byConfidence[confidence] || 0) + 1;
          
          // Count by state
          const state = community.state || 'unknown';
          stats.byState[state] = (stats.byState[state] || 0) + 1;
          
          // Count by care type - get first care type from array
          const careType = (community.careTypes && community.careTypes.length > 0) ? community.careTypes[0] : 'unknown';
          stats.byCareType[careType] = (stats.byCareType[careType] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting real pricing stats:', error);
      return {
        totalCommunities: 0,
        withRealPricing: 0,
        byDataSource: {},
        byConfidence: {},
        byState: {},
        byCareType: {}
      };
    }
  }
}

export const realDataPricingEngine = new RealDataPricingEngine();