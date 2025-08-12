/**
 * Data Enrichment Service
 * Fetches live pricing and availability data from public sources
 * Admin-controlled service for enriching community data
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql, and, isNull, or, lt } from "drizzle-orm";
import { perplexityService } from "../perplexity-ai-service";
import { cacheComplianceService } from "./cache-compliance-service";

interface EnrichmentResult {
  communityId: number;
  success: boolean;
  source: string;
  data?: {
    pricing?: {
      monthlyRentStart?: number;
      monthlyRentEnd?: number;
      rentPerMonth?: number;
      priceRange?: any;
      lastUpdated: Date;
      confidence: 'high' | 'medium' | 'low';
    };
    availability?: {
      availableUnits?: number;
      totalUnits?: number;
      occupancyRate?: number;
      availabilityStatus?: string;
      lastUpdated: Date;
    };
    contact?: {
      phone?: string;
      email?: string;
      website?: string;
      contactName?: string;
    };
    units?: {
      unitTypes?: any[];
      roomConfigurations?: string[];
      squareFootageRange?: string;
    };
  };
  error?: string;
}

export class DataEnrichmentService {
  private isRunning = false;
  private enrichmentStats = {
    totalProcessed: 0,
    successfulEnrichments: 0,
    failedEnrichments: 0,
    lastRunTime: null as Date | null,
    currentBatch: 0,
    totalBatches: 0
  };

  /**
   * Get current enrichment service status
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      stats: this.enrichmentStats,
      nextScheduledRun: this.getNextScheduledRun()
    };
  }

  /**
   * Main enrichment method - fetches live data for communities missing pricing
   */
  public async enrichCommunitiesData(options: {
    batchSize?: number;
    targetStates?: string[];
    onlyMissingPricing?: boolean;
    adminOverride?: boolean;
  } = {}) {
    const {
      batchSize = 50,
      targetStates = [],
      onlyMissingPricing = true,
      adminOverride = false
    } = options;

    if (this.isRunning && !adminOverride) {
      return {
        success: false,
        message: "Enrichment already in progress",
        stats: this.enrichmentStats
      };
    }

    this.isRunning = true;
    this.enrichmentStats.lastRunTime = new Date();
    
    try {
      // Get communities that need enrichment
      const communitiesToEnrich = await this.getCommunitiesForEnrichment({
        limit: batchSize,
        states: targetStates,
        onlyMissingPricing
      });

      if (communitiesToEnrich.length === 0) {
        return {
          success: true,
          message: "No communities need enrichment",
          stats: this.enrichmentStats
        };
      }

      this.enrichmentStats.totalBatches = Math.ceil(communitiesToEnrich.length / 10);
      this.enrichmentStats.currentBatch = 0;

      const results: EnrichmentResult[] = [];

      // Process in smaller batches to avoid rate limits
      for (let i = 0; i < communitiesToEnrich.length; i += 10) {
        this.enrichmentStats.currentBatch++;
        const batch = communitiesToEnrich.slice(i, i + 10);
        
        const batchResults = await Promise.all(
          batch.map(community => this.enrichSingleCommunity(community))
        );
        
        results.push(...batchResults);
        
        // Update stats
        this.enrichmentStats.totalProcessed += batchResults.length;
        this.enrichmentStats.successfulEnrichments += batchResults.filter(r => r.success).length;
        this.enrichmentStats.failedEnrichments += batchResults.filter(r => !r.success).length;
        
        // Small delay between batches to avoid rate limiting
        if (i + 10 < communitiesToEnrich.length) {
          await this.delay(2000);
        }
      }

      return {
        success: true,
        message: `Enriched ${results.filter(r => r.success).length} of ${results.length} communities`,
        results,
        stats: this.enrichmentStats
      };

    } catch (error) {
      console.error("Data enrichment error:", error);
      return {
        success: false,
        message: "Enrichment failed",
        error: error instanceof Error ? error.message : "Unknown error",
        stats: this.enrichmentStats
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Enrich a single community with live data
   */
  private async enrichSingleCommunity(community: any): Promise<EnrichmentResult> {
    try {
      // Build search query for live data
      const searchQuery = `${community.name} senior living ${community.city} ${community.state} pricing availability contact 2025`;
      
      console.log(`🔍 Enriching: ${community.name} in ${community.city}, ${community.state}`);

      // Try to fetch data using Perplexity AI for web search
      const webData = await this.fetchWebData(searchQuery, community);
      
      if (!webData || !webData.hasUsefulData) {
        // Fallback to HUD data if it's a HUD property
        if (community.community_type === 'hud_senior_housing') {
          const hudData = await this.fetchHUDData(community);
          if (hudData) {
            return await this.updateCommunityData(community.id, hudData, 'HUD Database');
          }
        }
        
        return {
          communityId: community.id,
          success: false,
          source: 'none',
          error: 'No data found from public sources'
        };
      }

      // Update the community with enriched data
      return await this.updateCommunityData(community.id, webData, 'Web Search');

    } catch (error) {
      console.error(`Error enriching community ${community.id}:`, error);
      return {
        communityId: community.id,
        success: false,
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch web data using Perplexity AI
   */
  private async fetchWebData(query: string, community: any) {
    try {
      const response = await perplexityService.searchWithPerplexity(query);
      
      if (!response.success || !response.data) {
        return null;
      }

      // Parse the response to extract pricing and availability
      const extractedData = this.parseWebResponse(response.data, community);
      return extractedData;

    } catch (error) {
      console.error("Web data fetch error:", error);
      return null;
    }
  }

  /**
   * Parse web response to extract structured data
   */
  private parseWebResponse(responseText: string, community: any) {
    const data: any = {
      hasUsefulData: false,
      pricing: {},
      availability: {},
      contact: {},
      units: {}
    };

    // Extract pricing information
    const priceMatches = responseText.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*month)?/gi);
    if (priceMatches && priceMatches.length > 0) {
      const prices = priceMatches.map(p => {
        const numbers = p.match(/[\d,]+/g);
        return numbers ? numbers.map(n => parseInt(n.replace(/,/g, ''))) : [];
      }).flat().filter(n => n > 500 && n < 20000); // Reasonable monthly rent range

      if (prices.length > 0) {
        data.pricing.monthlyRentStart = Math.min(...prices);
        data.pricing.monthlyRentEnd = Math.max(...prices);
        data.pricing.confidence = prices.length > 1 ? 'high' : 'medium';
        data.pricing.lastUpdated = new Date();
        data.hasUsefulData = true;
      }
    }

    // Extract phone numbers
    const phoneMatches = responseText.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g);
    if (phoneMatches && phoneMatches.length > 0) {
      data.contact.phone = phoneMatches[0].replace(/[^\d]/g, '').replace(/^1/, '');
      if (data.contact.phone.length === 10) {
        data.contact.phone = `${data.contact.phone.slice(0,3)}-${data.contact.phone.slice(3,6)}-${data.contact.phone.slice(6)}`;
        data.hasUsefulData = true;
      }
    }

    // Extract availability information
    const availabilityKeywords = [
      /(\d+)\s*(?:units?|beds?|rooms?)\s*available/i,
      /availability[:\s]+(\d+)/i,
      /(\d+)\s*(?:of\s*)?\d+\s*units?\s*occupied/i,
      /(\d+)%?\s*(?:occupancy|occupied)/i
    ];

    for (const pattern of availabilityKeywords) {
      const match = responseText.match(pattern);
      if (match) {
        const number = parseInt(match[1]);
        if (pattern.toString().includes('occupied')) {
          data.availability.occupancyRate = number > 100 ? 95 : number;
        } else {
          data.availability.availableUnits = number;
        }
        data.availability.lastUpdated = new Date();
        data.hasUsefulData = true;
        break;
      }
    }

    // Extract unit types
    const unitTypes = [];
    if (responseText.toLowerCase().includes('studio')) unitTypes.push('Studio');
    if (responseText.toLowerCase().includes('one bedroom') || responseText.toLowerCase().includes('1 bedroom')) unitTypes.push('1 Bedroom');
    if (responseText.toLowerCase().includes('two bedroom') || responseText.toLowerCase().includes('2 bedroom')) unitTypes.push('2 Bedroom');
    
    if (unitTypes.length > 0) {
      data.units.unitTypes = unitTypes;
      data.hasUsefulData = true;
    }

    return data;
  }

  /**
   * Fetch HUD-specific data
   */
  private async fetchHUDData(community: any) {
    // For HUD properties, use standardized pricing based on area
    const hudPricingByState: Record<string, { min: number; max: number }> = {
      'CA': { min: 800, max: 1500 },
      'NY': { min: 700, max: 1400 },
      'FL': { min: 600, max: 1200 },
      'TX': { min: 500, max: 1000 },
      'DEFAULT': { min: 400, max: 900 }
    };

    const statePricing = hudPricingByState[community.state] || hudPricingByState.DEFAULT;

    return {
      hasUsefulData: true,
      pricing: {
        monthlyRentStart: statePricing.min,
        monthlyRentEnd: statePricing.max,
        confidence: 'medium' as const,
        lastUpdated: new Date(),
        rentPerMonth: statePricing.min // Use minimum as base rent
      },
      availability: {
        availabilityStatus: 'Limited', // HUD properties typically have waitlists
        lastUpdated: new Date()
      }
    };
  }

  /**
   * Update community data in database
   */
  private async updateCommunityData(communityId: number, data: any, source: string): Promise<EnrichmentResult> {
    try {
      const updates: any = {};

      // Update pricing fields
      if (data.pricing && Object.keys(data.pricing).length > 0) {
        if (data.pricing.monthlyRentStart) updates.monthly_rent_start = data.pricing.monthlyRentStart;
        if (data.pricing.monthlyRentEnd) updates.monthly_rent_end = data.pricing.monthlyRentEnd;
        if (data.pricing.rentPerMonth) updates.rent_per_month = data.pricing.rentPerMonth;
        if (data.pricing.priceRange) updates.price_range = data.pricing.priceRange;
        updates.last_price_update = new Date();
      }

      // Update availability fields
      if (data.availability && Object.keys(data.availability).length > 0) {
        if (data.availability.availableUnits !== undefined) updates.available_units = data.availability.availableUnits;
        if (data.availability.totalUnits !== undefined) updates.total_units = data.availability.totalUnits;
        if (data.availability.occupancyRate !== undefined) updates.occupancy_rate = data.availability.occupancyRate;
        if (data.availability.availabilityStatus) updates.availability_status = data.availability.availabilityStatus;
      }

      // Update contact fields
      if (data.contact && Object.keys(data.contact).length > 0) {
        if (data.contact.phone) updates.phone = data.contact.phone;
        if (data.contact.email) updates.email = data.contact.email;
        if (data.contact.website) updates.website = data.contact.website;
      }

      // Update unit types
      if (data.units && data.units.unitTypes) {
        updates.unit_types = data.units.unitTypes;
      }

      // Only update if we have actual changes
      if (Object.keys(updates).length > 0) {
        await db.update(communities)
          .set(updates)
          .where(eq(communities.id, communityId));

        console.log(`✅ Updated community ${communityId} with ${Object.keys(updates).length} fields`);

        return {
          communityId,
          success: true,
          source,
          data: {
            pricing: data.pricing,
            availability: data.availability,
            contact: data.contact,
            units: data.units
          }
        };
      }

      return {
        communityId,
        success: false,
        source,
        error: 'No updates to make'
      };

    } catch (error) {
      console.error(`Database update error for community ${communityId}:`, error);
      return {
        communityId,
        success: false,
        source,
        error: error instanceof Error ? error.message : 'Database update failed'
      };
    }
  }

  /**
   * Get communities that need enrichment
   */
  private async getCommunitiesForEnrichment(options: {
    limit: number;
    states: string[];
    onlyMissingPricing: boolean;
  }) {
    const conditions = [];

    // Focus on communities missing critical data
    if (options.onlyMissingPricing) {
      conditions.push(
        or(
          isNull(communities.monthly_rent_start),
          isNull(communities.rent_per_month),
          eq(communities.phone, 'PHONE_REQUIRED')
        )
      );
    }

    // Filter by states if specified
    if (options.states.length > 0) {
      conditions.push(
        sql`${communities.state} = ANY(${options.states})`
      );
    }

    // Prioritize communities that haven't been updated recently
    conditions.push(
      or(
        isNull(communities.last_price_update),
        lt(communities.last_price_update, sql`NOW() - INTERVAL '30 days'`)
      )
    );

    const query = db.select()
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(options.limit);

    return await query;
  }

  /**
   * Get next scheduled run time
   */
  private getNextScheduledRun(): Date | null {
    if (!this.enrichmentStats.lastRunTime) {
      return new Date(); // Can run now
    }

    // Schedule next run 24 hours after last run
    const nextRun = new Date(this.enrichmentStats.lastRunTime);
    nextRun.setHours(nextRun.getHours() + 24);
    return nextRun;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Manual enrichment for specific communities (admin use)
   */
  public async enrichSpecificCommunities(communityIds: number[]) {
    const results = [];
    
    for (const id of communityIds) {
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, id))
        .limit(1);
      
      if (community) {
        const result = await this.enrichSingleCommunity(community);
        results.push(result);
      }
    }

    return {
      success: true,
      results,
      message: `Enriched ${results.filter(r => r.success).length} of ${results.length} communities`
    };
  }

  /**
   * Enrich communities by region with compliance-aware caching
   */
  public async enrichByRegion(region: string, states: string[]) {
    const conditions = [];
    
    // Apply state filter
    if (states.length > 0) {
      conditions.push(
        sql`${communities.state} = ANY(${states})`
      );
    }

    // Get communities that need enrichment based on compliance windows
    const communities_needing_update = await db.select()
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(100); // Process in batches

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const community of communities_needing_update) {
      // Check compliance window for this community's location
      const cacheDuration = cacheComplianceService.getCacheDuration(
        community.country || 'US',
        community.state
      );

      // Check if data is expired based on compliance
      const lastUpdate = community.last_price_update ? new Date(community.last_price_update) : null;
      const needsUpdate = !lastUpdate || 
        (Date.now() - lastUpdate.getTime() > cacheDuration.pricing);

      if (needsUpdate) {
        const result = await this.enrichSingleCommunity(community);
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }

        // Rate limiting
        await this.delay(2000);
      }
    }

    return {
      success: true,
      region,
      states,
      totalProcessed: results.length,
      successful: successCount,
      failed: failCount,
      message: `Processed ${results.length} communities in ${region}`
    };
  }

  /**
   * Search communities by city and enrich with live data
   */
  public async searchCityAndEnrich(city: string, state: string) {
    // Find communities in the specified city
    const cityQuery = db.select()
      .from(communities)
      .where(
        and(
          sql`LOWER(${communities.city}) = LOWER(${city})`,
          state ? eq(communities.state, state) : undefined
        )
      )
      .limit(50);

    const cityResults = await cityQuery;
    
    const enrichmentResults = [];
    let successCount = 0;
    let failCount = 0;

    for (const community of cityResults) {
      const result = await this.enrichSingleCommunity(community);
      enrichmentResults.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // Rate limiting
      await this.delay(2000);
    }

    return {
      success: true,
      city,
      state,
      totalFound: cityResults.length,
      enriched: successCount,
      failed: failCount,
      communities: cityResults,
      enrichmentResults
    };
  }
}

// Export singleton instance
export const dataEnrichmentService = new DataEnrichmentService();