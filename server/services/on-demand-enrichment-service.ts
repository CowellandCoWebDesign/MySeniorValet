import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { CommunityEnrichmentService } from "../community-enrichment-service";
import { WebsiteScraperService } from "../website-scraper-service";
import { OpenAIIntegration } from "../openai-integration";

interface EnrichmentResult {
  success: boolean;
  fieldsUpdated: string[];
  protectedFieldsSkipped: string[];
  error?: string;
}

export class OnDemandEnrichmentService {
  private readonly VERIFICATION_THRESHOLD = 2; // Fields protected after 2 verifications
  private readonly ENRICHMENT_CACHE_HOURS = 24; // Don't re-enrich for 24 hours
  private readonly ALWAYS_UPDATE_FIELDS = ['photos', 'availability', 'promotions', 'reviews'];
  
  private communityEnrichmentService: CommunityEnrichmentService;
  private websiteScraperService: WebsiteScraperService;
  private openAIIntegration: OpenAIIntegration;

  constructor() {
    this.communityEnrichmentService = new CommunityEnrichmentService();
    this.websiteScraperService = new WebsiteScraperService();
    this.openAIIntegration = new OpenAIIntegration();
  }

  /**
   * Check if a community needs enrichment based on view/search triggers
   */
  async shouldEnrichCommunity(communityId: number): Promise<boolean> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) return false;

    // Never enrich if recently enriched (within cache window)
    if (community.lastSuccessfulEnrichment) {
      const hoursSinceEnrichment = 
        (Date.now() - new Date(community.lastSuccessfulEnrichment).getTime()) / (1000 * 60 * 60);
      if (hoursSinceEnrichment < this.ENRICHMENT_CACHE_HOURS) {
        return false;
      }
    }

    // Enrich if never enriched or failed
    if (community.enrichmentStatus === 'pending' || 
        community.enrichmentStatus === 'failed' ||
        !community.enrichmentCompleted) {
      return true;
    }

    // Check if dynamic content needs update (photos, availability, promotions)
    const shouldUpdatePhotos = !community.lastPhotoUpdate || 
      this.isOlderThanDays(community.lastPhotoUpdate, 7);
    const shouldUpdateAvailability = !community.lastAvailabilityCheck || 
      this.isOlderThanDays(community.lastAvailabilityCheck, 1);
    const shouldUpdatePromotions = !community.lastPromotionsUpdate || 
      this.isOlderThanDays(community.lastPromotionsUpdate, 3);

    return shouldUpdatePhotos || shouldUpdateAvailability || shouldUpdatePromotions;
  }

  /**
   * Trigger enrichment when a community is viewed
   */
  async onCommunityView(communityId: number): Promise<void> {
    try {
      // Increment view count and update last viewed
      await db
        .update(communities)
        .set({
          viewCount: sql`COALESCE(view_count, 0) + 1`,
          lastViewedAt: new Date(),
          popularityScore: sql`COALESCE(popularity_score, 0) + 1`
        })
        .where(eq(communities.id, communityId));

      // Check if enrichment is needed
      const shouldEnrich = await this.shouldEnrichCommunity(communityId);
      if (shouldEnrich) {
        // Enrich asynchronously without blocking the view
        this.enrichCommunity(communityId).catch(error => {
          console.error(`Failed to enrich community ${communityId}:`, error);
        });
      }
    } catch (error) {
      console.error(`Error processing community view for ${communityId}:`, error);
    }
  }

  /**
   * Enrich a community with smart field protection
   */
  async enrichCommunity(communityId: number): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      fieldsUpdated: [],
      protectedFieldsSkipped: []
    };

    try {
      // Get current community data
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        result.error = "Community not found";
        return result;
      }

      // Update enrichment status to in-progress
      await db
        .update(communities)
        .set({
          enrichmentStatus: 'in_progress',
          lastEnrichmentAttempt: new Date(),
          enrichmentAttempts: sql`COALESCE(enrichment_attempts, 0) + 1`
        })
        .where(eq(communities.id, communityId));

      // Scrape website if available
      let scrapedData: any = null;
      if (community.website && !community.websiteProtected) {
        try {
          scrapedData = await this.websiteScraperService.scrapeWebsite(community.website);
        } catch (error) {
          console.error(`Failed to scrape website for community ${communityId}:`, error);
        }
      }

      // Build update object with smart field protection
      const updates: any = {};
      // Parse JSON field properly
      const existingSources = community.enrichmentSources ? 
        (typeof community.enrichmentSources === 'string' ? 
          JSON.parse(community.enrichmentSources) : 
          community.enrichmentSources) : 
        [];
      const enrichmentSources = [...existingSources];

      // Always update dynamic fields (photos, availability, promotions)
      if (scrapedData?.photos && scrapedData.photos.length > 0) {
        updates.photos = scrapedData.photos;
        updates.lastPhotoUpdate = new Date();
        result.fieldsUpdated.push('photos');
      }

      if (scrapedData?.availability) {
        updates.availabilityStatus = scrapedData.availability;
        updates.lastAvailabilityCheck = new Date();
        result.fieldsUpdated.push('availability');
      }

      if (scrapedData?.promotions) {
        updates.promotions = scrapedData.promotions;
        updates.lastPromotionsUpdate = new Date();
        result.fieldsUpdated.push('promotions');
      }

      // Update protected fields only if not protected
      if (scrapedData?.phone && !community.phoneProtected) {
        updates.phone = scrapedData.phone;
        updates.phoneVerificationCount = sql`COALESCE(phone_verification_count, 0) + 1`;
        // Protect after threshold
        if ((community.phoneVerificationCount || 0) + 1 >= this.VERIFICATION_THRESHOLD) {
          updates.phoneProtected = true;
        }
        result.fieldsUpdated.push('phone');
      } else if (scrapedData?.phone && community.phoneProtected) {
        result.protectedFieldsSkipped.push('phone');
      }

      if (scrapedData?.email && !community.emailProtected) {
        updates.email = scrapedData.email;
        updates.emailVerificationCount = sql`COALESCE(email_verification_count, 0) + 1`;
        if ((community.emailVerificationCount || 0) + 1 >= this.VERIFICATION_THRESHOLD) {
          updates.emailProtected = true;
        }
        result.fieldsUpdated.push('email');
      } else if (scrapedData?.email && community.emailProtected) {
        result.protectedFieldsSkipped.push('email');
      }

      // Generate AI description if needed and not already present
      if (!community.description || community.description.length < 100) {
        try {
          const aiDescription = await this.openAIIntegration.generateCommunityDescription({
            name: community.name,
            city: community.city,
            state: community.state,
            careTypes: community.careTypes,
            amenities: scrapedData?.amenities || community.amenities || [],
            services: scrapedData?.services || community.services || []
          });
          
          if (aiDescription) {
            updates.description = aiDescription;
            result.fieldsUpdated.push('description');
          }
        } catch (error) {
          console.error(`Failed to generate AI description for community ${communityId}:`, error);
        }
      }

      // Add enrichment source tracking
      // TODO: Fix JSON field update - temporarily disabled to allow enrichment to work
      // if (result.fieldsUpdated.length > 0) {
      //   enrichmentSources.push({
      //     source: 'on_demand_enrichment',
      //     date: new Date().toISOString(),
      //     fieldsUpdated: result.fieldsUpdated,
      //     confidence: 0.85
      //   });
      //   updates.enrichmentSources = enrichmentSources;
      // }

      // Update enrichment status
      updates.enrichmentStatus = 'completed'; // Always mark as completed after successful enrichment attempt
      updates.lastSuccessfulEnrichment = new Date();
      updates.enrichmentCompleted = true;

      // Save updates to database
      if (Object.keys(updates).length > 0) {
        await db
          .update(communities)
          .set(updates)
          .where(eq(communities.id, communityId));
      }

      result.success = true;
      console.log(`✅ On-demand enrichment completed for community ${communityId}:`, {
        fieldsUpdated: result.fieldsUpdated,
        protectedFieldsSkipped: result.protectedFieldsSkipped
      });

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ On-demand enrichment failed for community ${communityId}:`, error);
      
      // Update enrichment status to failed
      await db
        .update(communities)
        .set({
          enrichmentStatus: 'failed',
          lastEnrichmentAttempt: new Date()
        })
        .where(eq(communities.id, communityId));
    }

    return result;
  }

  /**
   * Batch enrich high-priority communities (run periodically)
   */
  async enrichHighPriorityCommunities(limit: number = 10): Promise<void> {
    try {
      // Get communities with high view counts that need enrichment
      const communitiesToEnrich = await db
        .select()
        .from(communities)
        .where(sql`
          (enrichment_status = 'pending' OR enrichment_status = 'failed' OR 
           last_successful_enrichment < NOW() - INTERVAL '7 days')
          AND view_count > 0
        `)
        .orderBy(sql`popularity_score DESC, view_count DESC`)
        .limit(limit);

      console.log(`🔄 Starting batch enrichment for ${communitiesToEnrich.length} high-priority communities`);

      for (const community of communitiesToEnrich) {
        await this.enrichCommunity(community.id);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`✅ Batch enrichment completed for ${communitiesToEnrich.length} communities`);
    } catch (error) {
      console.error('❌ Batch enrichment failed:', error);
    }
  }

  /**
   * Force refresh dynamic content for a community
   */
  async refreshDynamicContent(communityId: number): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {
      success: false,
      fieldsUpdated: [],
      protectedFieldsSkipped: []
    };

    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community || !community.website) {
        result.error = "Community not found or no website";
        return result;
      }

      // Force scrape for dynamic content only
      const scrapedData = await this.websiteScraperService.scrapeWebsite(community.website);
      const updates: any = {};

      // Update only dynamic fields
      if (scrapedData.photos && scrapedData.photos.length > 0) {
        updates.photos = scrapedData.photos;
        updates.lastPhotoUpdate = new Date();
        result.fieldsUpdated.push('photos');
      }

      if (scrapedData.availability) {
        updates.availabilityStatus = scrapedData.availability;
        updates.lastAvailabilityCheck = new Date();
        result.fieldsUpdated.push('availability');
      }

      if (scrapedData.promotions) {
        updates.promotions = scrapedData.promotions;
        updates.lastPromotionsUpdate = new Date();
        result.fieldsUpdated.push('promotions');
      }

      // Save updates
      if (Object.keys(updates).length > 0) {
        await db
          .update(communities)
          .set(updates)
          .where(eq(communities.id, communityId));
      }

      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private isOlderThanDays(date: Date | string | null, days: number): boolean {
    if (!date) return true;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const daysSince = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > days;
  }
}

// Export singleton instance
export const onDemandEnrichmentService = new OnDemandEnrichmentService();