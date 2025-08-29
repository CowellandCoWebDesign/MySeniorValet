/**
 * Optimized Community Enrichment Service
 * Features: Caching, parallel processing, progressive loading, smart verification
 */

import { ScalableCache } from '../infrastructure/cache';
import { multiAIVerificationService } from '../multi-ai-verification-service';
import { perplexityService } from '../perplexity-ai-service';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize cache with 24-hour TTL for verification results
const verificationCache = new ScalableCache(1000, 24 * 60 * 60 * 1000); // 24 hours

interface EnrichmentOptions {
  forceRefresh?: boolean;
  streamUpdates?: boolean;
  specificFields?: string[];
}

interface CachedVerification {
  data: any;
  timestamp: number;
  communityId: number;
}

export class OptimizedEnrichmentService {
  /**
   * Check if community has recent verification data
   */
  private async hasRecentVerification(communityId: number): Promise<CachedVerification | null> {
    const cacheKey = `verify:${communityId}`;
    const cached = verificationCache.get<CachedVerification>(cacheKey);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      // Use cache if less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        console.log(`✅ Cache hit for community ${communityId}, age: ${Math.round(age / 1000 / 60)} minutes`);
        return cached;
      }
    }
    
    return null;
  }

  /**
   * Perform parallel AI verification with optimizations
   */
  public async verifyWithOptimizations(
    communityId: number,
    realTimeData: any,
    options: EnrichmentOptions = {}
  ): Promise<any> {
    // Check cache first unless force refresh
    if (!options.forceRefresh) {
      const cached = await this.hasRecentVerification(communityId);
      if (cached) {
        return cached.data;
      }
    }

    // Get community details
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      throw new Error('Community not found');
    }

    console.log(`🚀 Starting optimized enrichment for ${community.name}`);
    const startTime = Date.now();

    try {
      // PARALLEL PROCESSING: Run all searches simultaneously
      const [communitySpecificData, verificationReport] = await Promise.all([
        // Search for specific community information
        this.searchCommunitySpecific(community, realTimeData),
        
        // Run multi-AI verification in parallel
        this.performParallelVerification(communityId, community, realTimeData)
      ]);

      // Merge results - ensure webIntelligence is included for photos
      const enrichedData = {
        ...verificationReport,
        communitySpecificData,
        lastUpdated: new Date().toISOString(),
        enrichmentTime: Date.now() - startTime,
        // Ensure webIntelligence structure exists for frontend compatibility
        verificationResults: {
          ...verificationReport.verificationResults,
          webIntelligence: verificationReport.verificationResults?.webIntelligence || {
            images: [],
            sources: communitySpecificData?.sources || []
          }
        }
      };
      
      // If no photos found, add fallback stock photos based on community type
      if (!enrichedData.verificationResults.webIntelligence?.images?.length) {
        console.log('📷 No real photos found, using stock photos as fallback');
        const careType = community.careType || 'senior living';
        enrichedData.verificationResults.webIntelligence = {
          ...enrichedData.verificationResults.webIntelligence,
          images: this.getStockPhotosForCommunity(careType),
          isStockPhotos: true
        };
      }

      // Cache the results
      const cacheKey = `verify:${communityId}`;
      const cacheData: CachedVerification = {
        data: enrichedData,
        timestamp: Date.now(),
        communityId
      };
      
      verificationCache.set(cacheKey, cacheData, 24 * 60 * 60 * 1000); // 24 hour cache
      console.log(`✅ Enrichment completed in ${Date.now() - startTime}ms, cached for 24 hours`);

      // Update database with enriched data
      await this.updateDatabaseWithEnrichedData(communityId, enrichedData);

      return enrichedData;
    } catch (error) {
      console.error(`❌ Enrichment failed for community ${communityId}:`, error);
      throw error;
    }
  }

  /**
   * Search for community-specific information
   */
  private async searchCommunitySpecific(community: any, realTimeData: any): Promise<any> {
    try {
      const communityBaseName = community.name
        .replace(/ - A .* Community/gi, '')
        .replace(/ Senior Living.*$/gi, '')
        .replace(/ Assisted Living.*$/gi, '')
        .trim();
      
      const searchQuery = `${communityBaseName} ${community.address || ''} ${community.city} ${community.state} senior living current phone website 2025`;
      
      console.log(`🔍 Searching for: "${searchQuery}"`);
      
      const perplexityResponse = await perplexityService.searchRealTime(
        searchQuery,
        `Find CURRENT 2025 information about ${communityBaseName} in ${community.city}, ${community.state}.
         Focus on: current phone, website, pricing, availability, recent news, management changes.`
      );
      
      return {
        ...realTimeData,
        searchContent: perplexityResponse.summary,
        sources: perplexityResponse.sources,
        communityName: community.name,
        lastSearched: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️ Community-specific search failed, using general data`);
      return realTimeData;
    }
  }

  /**
   * Perform parallel AI verification
   */
  private async performParallelVerification(communityId: number, community: any, realTimeData: any): Promise<any> {
    // Run verification with all three AI services in parallel
    const verificationReport = await multiAIVerificationService.verifyRealTimeData(
      communityId,
      community.name,
      realTimeData,
      {
        city: community.city,
        state: community.state,
        zipCode: community.zipCode,
        address: community.address,
        careTypes: community.careTypes || [],
        communityType: community.communityType || 'senior-living',
        communitySubtype: community.communitySubtype,
        rating: community.rating,
        bedCount: community.bedCount || 0,
        yearEstablished: community.yearEstablished || 0,
        description: community.description,
        ownershipType: community.ownershipType || '',
        certifications: community.certifications || [],
        hudPropertyId: community.hudPropertyId || null
      }
    );

    return verificationReport;
  }

  /**
   * Update database with enriched data
   */
  private async updateDatabaseWithEnrichedData(communityId: number, enrichedData: any): Promise<void> {
    try {
      const updateData: any = {};
      
      // Extract contact information
      if (enrichedData.contactInfo) {
        const contactInfo = enrichedData.contactInfo;
        
        if (contactInfo.phone) {
          const cleanPhone = contactInfo.phone.replace(/\D/g, '');
          if (cleanPhone.length >= 10) {
            updateData.phone = contactInfo.phone;
          }
        }
        
        if (contactInfo.website && contactInfo.website.startsWith('http')) {
          updateData.website = contactInfo.website;
        }
        
        if (contactInfo.email && contactInfo.email.includes('@')) {
          updateData.email = contactInfo.email;
        }
      }

      // Update description if we have better content
      if (enrichedData.description && enrichedData.description.length > 100) {
        updateData.description = enrichedData.description;
      }

      // Update pricing if found
      if (enrichedData.pricingInfo?.basePrice) {
        const price = enrichedData.pricingInfo.basePrice.toString().replace(/\D/g, '');
        if (price && parseInt(price) > 0) {
          updateData.startingPrice = price;
        }
      }

      // Only update if we have data
      if (Object.keys(updateData).length > 0) {
        await db
          .update(communities)
          .set({
            ...updateData,
            lastUpdated: new Date()
          })
          .where(eq(communities.id, communityId));
        
        console.log(`✅ Updated ${Object.keys(updateData).length} fields for community ${communityId}`);
      }
    } catch (error) {
      console.error(`Failed to update database for community ${communityId}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return verificationCache.getStats();
  }

  /**
   * Clear cache for a specific community
   */
  public clearCommunityCache(communityId: number): void {
    const cacheKey = `verify:${communityId}`;
    verificationCache.delete(cacheKey);
    console.log(`🗑️ Cleared cache for community ${communityId}`);
  }

  /**
   * Pre-warm cache for popular communities
   */
  public async prewarmPopularCommunities(limit: number = 50): Promise<void> {
    console.log(`🔥 Pre-warming cache for top ${limit} communities...`);
    
    try {
      // Get most viewed communities
      const popularCommunities = await db
        .select()
        .from(communities)
        .orderBy(communities.rating)
        .limit(limit);
      
      // Process in batches of 5 to avoid overwhelming APIs
      const batchSize = 5;
      for (let i = 0; i < popularCommunities.length; i += batchSize) {
        const batch = popularCommunities.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(community => 
            this.verifyWithOptimizations(community.id, {}, { forceRefresh: false })
              .catch(err => console.error(`Pre-warm failed for ${community.id}:`, err))
          )
        );
        
        console.log(`Pre-warmed ${Math.min(i + batchSize, popularCommunities.length)}/${popularCommunities.length} communities`);
      }
      
      console.log(`✅ Pre-warming complete!`);
    } catch (error) {
      console.error('Pre-warming failed:', error);
    }
  }
}

// Export singleton instance
export const optimizedEnrichmentService = new OptimizedEnrichmentService();