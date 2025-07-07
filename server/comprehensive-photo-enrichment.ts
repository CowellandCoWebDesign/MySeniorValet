import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { googlePlacesIntegration } from "./google-places-integration";
import { dataProtectionService } from "./data-protection";
import { apiCostProtection } from "./api-cost-protection";
import { photoCacheService } from "./photo-cache-service";

export class ComprehensivePhotoEnrichment {
  private static readonly MAX_PHOTOS_PER_COMMUNITY = 5;
  private static enrichmentInProgress = false;
  private static enrichmentLock = new Date(0); // Initialize with old timestamp

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async enrichAllCommunities(): Promise<{
    totalCommunities: number;
    enriched: number;
    photosAdded: number;
    errors: string[];
  }> {
    // 🚨 ENRICHMENT LOCK: Check if enrichment is already in progress
    if (ComprehensivePhotoEnrichment.enrichmentInProgress) {
      throw new Error("Enrichment is already in progress. Please wait for the current operation to complete.");
    }

    // Set enrichment lock
    ComprehensivePhotoEnrichment.enrichmentInProgress = true;
    ComprehensivePhotoEnrichment.enrichmentLock = new Date();
    
    try {
      console.log("🚀 Starting comprehensive photo enrichment for ALL communities");
      
      // 🚨 CRITICAL COST PROTECTION: Check total operation cost before starting
      // Only get communities that haven't been enriched yet or were enriched more than 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
      const allCommunities = await db.select().from(communities).where(
        sql`${communities.enrichmentCompleted} IS NULL OR ${communities.enrichmentCompleted} = false OR ${communities.lastEnrichmentDate} < ${thirtyDaysAgo}`
      );
      
      console.log(`📊 Found ${allCommunities.length} communities needing enrichment`);
      
      if (allCommunities.length === 0) {
        console.log("✅ All communities have been enriched recently. No work needed.");
        return {
          totalCommunities: 0,
          enriched: 0,
          photosAdded: 0,
          errors: []
        };
      }
      
      const totalEstimatedCost = allCommunities.length * 0.50; // $0.50 per community (conservative estimate)
      const totalEstimatedCalls = allCommunities.length * 10; // 10 calls per community
      
      const protection = await apiCostProtection.checkBeforeOperation(totalEstimatedCalls, totalEstimatedCost);
      
      if (!protection.allowed) {
        console.error(`🚨 BULK ENRICHMENT BLOCKED: ${protection.reason}`);
        return {
          totalCommunities: allCommunities.length,
          enriched: 0,
          photosAdded: 0,
          errors: [`Operation blocked: ${protection.reason}`]
        };
      }
      
      let enriched = 0;
      let totalPhotosAdded = 0;
      const errors: string[] = [];
      
      for (const community of allCommunities) {
        try {
          console.log(`🔍 Enriching: ${community.name} (ID: ${community.id})`);
          
          // Skip if already enriched recently
          if (community.enrichmentCompleted && community.lastEnrichmentDate) {
            const daysSinceEnrichment = (Date.now() - new Date(community.lastEnrichmentDate).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceEnrichment < 30) {
              console.log(`⏭️ ${community.name}: Already enriched ${daysSinceEnrichment.toFixed(1)} days ago, skipping`);
              continue;
            }
          }
          
          // Enrich with Google Places to get photo references
          const enrichmentResult = await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
          
          if (enrichmentResult && enrichmentResult.success) {
            // Get photo references from Google Places
            const photoReferences = enrichmentResult.photoReferences || [];
            console.log(`📷 Found ${photoReferences.length} photo references for ${community.name}`);
            
            // Download and cache photos using the new photo cache service
            const cachedPhotoUrls: string[] = [];
            const photoAttributions = enrichmentResult.photoAttributions || [];
            const maxPhotos = Math.min(photoReferences.length, ComprehensivePhotoEnrichment.MAX_PHOTOS_PER_COMMUNITY);
            
            for (let i = 0; i < maxPhotos; i++) {
              const photoRef = photoReferences[i];
              const attribution = photoAttributions[i]; // Get corresponding attribution
              console.log(`💾 Caching photo ${i + 1}/${maxPhotos} for ${community.name}`);
              
              const cacheResult = await photoCacheService.downloadAndCacheGooglePhoto(
                photoRef, 
                community.id, 
                i,
                attribution
              );
              
              if (cacheResult.success && cacheResult.permanentUrl) {
                cachedPhotoUrls.push(cacheResult.permanentUrl);
                if (cacheResult.cached) {
                  console.log(`📷 Used cached photo ${i + 1} for ${community.name}`);
                } else {
                  console.log(`💾 Downloaded and cached photo ${i + 1} for ${community.name}`);
                }
              } else {
                console.warn(`⚠️ Failed to cache photo ${i + 1} for ${community.name}: ${cacheResult.error}`);
              }
              
              // Small delay between photo downloads
              await this.delay(1000);
            }
            
            // Data Protection: Validate enriched data before update
            const updateData = {
              photos: cachedPhotoUrls,
              googleRating: enrichmentResult.rating?.toString(),
              googleReviewCount: enrichmentResult.reviewCount,
              phone: enrichmentResult.phone,
              website: enrichmentResult.website
            };

            const protectionResult = await dataProtectionService.enforceDataProtection([updateData], 'google_places_enrichment');
            
            if (protectionResult.blocked.length > 0) {
              console.warn(`⚠️ Data protection blocked enrichment for ${community.name}:`, protectionResult.summary);
              continue; // Skip this community
            }
            
            // Update database with enriched data and mark as completed
            await db.update(communities)
              .set({
                photos: cachedPhotoUrls,
                photoAttributions: photoAttributions,
                googleRating: enrichmentResult.rating?.toString() || community.googleRating,
                googleReviewCount: enrichmentResult.reviewCount || community.googleReviewCount,
                phone: enrichmentResult.phone || community.phone,
                website: enrichmentResult.website || community.website,
                lastEnrichmentDate: new Date(),
                enrichmentCompleted: true, // Mark as completed
                updatedAt: new Date()
              })
              .where(eq(communities.id, community.id));
            
            const photosAdded = cachedPhotoUrls.length;
            totalPhotosAdded += photosAdded;
            enriched++;
            
            console.log(`✅ ${community.name}: Cached ${photosAdded} photos, marked as complete`);
          } else {
            console.log(`⚠️ ${community.name}: No enrichment data found`);
            
            // Mark as completed even if no photos found to prevent re-processing
            await db.update(communities)
              .set({
                enrichmentCompleted: true,
                lastEnrichmentDate: new Date(),
                updatedAt: new Date()
              })
              .where(eq(communities.id, community.id));
          }
          
          // 🚨 CRITICAL: Check if we're approaching limits after each community
          const currentUsage = apiCostProtection.getUsageStatus();
          if (currentUsage.remaining.dailyCost < 5) {
            console.warn('🚨 STOPPING ENRICHMENT: Less than $5 remaining for today');
            break;
          }
          
          // Rate limiting to avoid API quota issues - 5 second delay between communities
          await this.delay(5000);
          
        } catch (error) {
          const errorMsg = `Error enriching ${community.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
          
          // Mark as failed attempt to prevent infinite retries
          try {
            await db.update(communities)
              .set({
                lastEnrichmentDate: new Date(),
                updatedAt: new Date()
              })
              .where(eq(communities.id, community.id));
          } catch (dbError) {
            console.error(`Failed to update failure timestamp for ${community.name}:`, dbError);
          }
        }
      }
      
      console.log(`🎉 Comprehensive photo enrichment completed!`);
      console.log(`📈 Statistics:`);
      console.log(`   - Total communities: ${allCommunities.length}`);
      console.log(`   - Successfully enriched: ${enriched}`);
      console.log(`   - Total photos added: ${totalPhotosAdded}`);
      console.log(`   - Errors: ${errors.length}`);
      
      return {
        totalCommunities: allCommunities.length,
        enriched,
        photosAdded: totalPhotosAdded,
        errors
      };
      
    } finally {
      // Release enrichment lock
      ComprehensivePhotoEnrichment.enrichmentInProgress = false;
      console.log("🔓 Enrichment lock released");
    }
  }

  async enrichByCity(city: string, state: string): Promise<{
    totalCommunities: number;
    enriched: number;
    photosAdded: number;
    errors: string[];
  }> {
    console.log(`🚀 Starting photo enrichment for ${city}, ${state}`);
    
    // Get communities in specific city
    const cityCommunities = await db.select()
      .from(communities)
      .where(
        sql`LOWER(${communities.city}) = LOWER(${city}) AND LOWER(${communities.state}) = LOWER(${state})`
      );
    
    console.log(`📊 Found ${cityCommunities.length} communities in ${city}, ${state}`);
    
    let enriched = 0;
    let totalPhotosAdded = 0;
    const errors: string[] = [];
    
    for (const community of cityCommunities) {
      try {
        console.log(`🔍 Enriching: ${community.name}`);
        
        // Enrich with Google Places
        const enrichmentResult = await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
        
        if (enrichmentResult && enrichmentResult.success) {
          // Update community with LIMITED photos (MAX 5 per community)
          const existingPhotos = community.photos || [];
          const newPhotos = enrichmentResult.photos || [];
          
          // Filter out duplicates
          const newUniquePhotos = newPhotos.filter(photo => 
            !existingPhotos.some(existing => 
              existing.includes(photo.split('photo_reference=')[1]?.split('&')[0] || '')
            )
          );
          
          // Limit total photos per community to MAX_PHOTOS_PER_COMMUNITY
          const allPhotos = [...existingPhotos, ...newUniquePhotos]
            .slice(0, ComprehensivePhotoEnrichment.MAX_PHOTOS_PER_COMMUNITY);
          
          // Update database
          await db.update(communities)
            .set({
              photos: allPhotos,
              googleRating: enrichmentResult.rating?.toString() || community.googleRating,
              googleReviewCount: enrichmentResult.reviewCount || community.googleReviewCount,
              phone: enrichmentResult.phone || community.phone,
              website: enrichmentResult.website || community.website,
              lastEnrichmentDate: new Date(),
              updatedAt: new Date()
            })
            .where(eq(communities.id, community.id));
          
          const photosAdded = newUniquePhotos.length;
          totalPhotosAdded += photosAdded;
          enriched++;
          
          console.log(`✅ ${community.name}: Added ${photosAdded} photos (total: ${allPhotos.length})`);
        }
        
        // Rate limiting
        await this.delay(1000);
        
      } catch (error) {
        const errorMsg = `Error enriching ${community.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    return {
      totalCommunities: cityCommunities.length,
      enriched,
      photosAdded: totalPhotosAdded,
      errors
    };
  }

  async getEnrichmentStats(): Promise<{
    totalCommunities: number;
    communitiesWithPhotos: number;
    communitiesWithoutPhotos: number;
    averagePhotosPerCommunity: number;
    totalPhotos: number;
  }> {
    const result = await db.select({
      totalCommunities: sql<number>`COUNT(*)`,
      communitiesWithPhotos: sql<number>`COUNT(CASE WHEN array_length(photos, 1) > 0 THEN 1 END)`,
      communitiesWithoutPhotos: sql<number>`COUNT(CASE WHEN array_length(photos, 1) IS NULL OR array_length(photos, 1) = 0 THEN 1 END)`,
      totalPhotos: sql<number>`COALESCE(SUM(array_length(photos, 1)), 0)`
    }).from(communities);

    const stats = result[0];
    
    return {
      totalCommunities: stats.totalCommunities,
      communitiesWithPhotos: stats.communitiesWithPhotos,
      communitiesWithoutPhotos: stats.communitiesWithoutPhotos,
      averagePhotosPerCommunity: stats.totalCommunities > 0 ? stats.totalPhotos / stats.totalCommunities : 0,
      totalPhotos: stats.totalPhotos
    };
  }

  // Static method to check enrichment status
  static isEnrichmentInProgress(): boolean {
    return ComprehensivePhotoEnrichment.enrichmentInProgress;
  }

  // Static method to get enrichment lock timestamp
  static getEnrichmentLockTime(): Date {
    return ComprehensivePhotoEnrichment.enrichmentLock;
  }
}

export const comprehensivePhotoEnrichment = new ComprehensivePhotoEnrichment();