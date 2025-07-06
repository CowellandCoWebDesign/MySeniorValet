import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { googlePlacesIntegration } from "./google-places-integration";

export interface PhotoEnrichmentResult {
  communityId: number;
  communityName: string;
  existingPhotos: number;
  newPhotosFound: number;
  totalPhotosAfter: number;
  success: boolean;
  error?: string;
  googlePlaceId?: string;
  googleRating?: number;
}

export class SystematicPhotoEnrichment {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async enrichCommunityByIdWithDetails(communityId: number): Promise<PhotoEnrichmentResult> {
    try {
      // Get community data
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      
      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      console.log(`🔍 Systematically reviewing: ${community.name} (ID: ${communityId})`);
      
      const existingPhotos = community.photos?.length || 0;
      console.log(`   📸 Current photos: ${existingPhotos}`);
      
      // Enrich with Google Places
      const enrichmentResult = await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
      
      if (!enrichmentResult || !enrichmentResult.success) {
        console.log(`   ⚠️  No Google Places data found for ${community.name}`);
        return {
          communityId,
          communityName: community.name,
          existingPhotos,
          newPhotosFound: 0,
          totalPhotosAfter: existingPhotos,
          success: false,
          error: "No Google Places data found"
        };
      }

      // Process photos
      const currentPhotos = community.photos || [];
      const newPhotos = enrichmentResult.photos || [];
      
      // Filter out duplicates by checking photo reference IDs
      const newUniquePhotos = newPhotos.filter(photo => 
        !currentPhotos.some(existing => 
          existing.includes(photo.split('photo_reference=')[1]?.split('&')[0] || '')
        )
      );
      
      const allPhotos = [...currentPhotos, ...newUniquePhotos];
      
      // Update database with enriched data
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
        .where(eq(communities.id, communityId));
      
      const result: PhotoEnrichmentResult = {
        communityId,
        communityName: community.name,
        existingPhotos,
        newPhotosFound: newUniquePhotos.length,
        totalPhotosAfter: allPhotos.length,
        success: true,
        googlePlaceId: enrichmentResult.placeId,
        googleRating: enrichmentResult.rating
      };
      
      console.log(`   ✅ Success: +${newUniquePhotos.length} photos (total: ${allPhotos.length})`);
      if (enrichmentResult.rating) {
        console.log(`   ⭐ Google Rating: ${enrichmentResult.rating}/5`);
      }
      
      return result;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Error enriching community ${communityId}: ${errorMsg}`);
      
      return {
        communityId,
        communityName: `Community ${communityId}`,
        existingPhotos: 0,
        newPhotosFound: 0,
        totalPhotosAfter: 0,
        success: false,
        error: errorMsg
      };
    }
  }

  async enrichCommunitiesSystematically(startId?: number, endId?: number): Promise<{
    totalProcessed: number;
    successful: number;
    failed: number;
    totalPhotosAdded: number;
    results: PhotoEnrichmentResult[];
    summary: {
      communitiesWithNewPhotos: number;
      averagePhotosPerCommunity: number;
      topPerformers: Array<{name: string, photosAdded: number}>;
    };
  }> {
    console.log("🚀 Starting systematic photo enrichment with detailed tracking");
    
    // Get all communities in range
    let query = db.select().from(communities);
    
    if (startId && endId) {
      query = query.where(sql`${communities.id} BETWEEN ${startId} AND ${endId}`);
    } else if (startId) {
      query = query.where(sql`${communities.id} >= ${startId}`);
    }
    
    const communitiesToProcess = await query;
    
    console.log(`📊 Processing ${communitiesToProcess.length} communities systematically`);
    
    const results: PhotoEnrichmentResult[] = [];
    let successful = 0;
    let failed = 0;
    let totalPhotosAdded = 0;
    
    for (const community of communitiesToProcess) {
      const result = await this.enrichCommunityByIdWithDetails(community.id);
      results.push(result);
      
      if (result.success) {
        successful++;
        totalPhotosAdded += result.newPhotosFound;
      } else {
        failed++;
      }
      
      // Rate limiting to avoid API quota issues (2 seconds between requests)
      await this.delay(2000);
    }
    
    // Generate summary statistics
    const communitiesWithNewPhotos = results.filter(r => r.newPhotosFound > 0).length;
    const averagePhotosPerCommunity = totalPhotosAdded / results.length;
    const topPerformers = results
      .filter(r => r.newPhotosFound > 0)
      .sort((a, b) => b.newPhotosFound - a.newPhotosFound)
      .slice(0, 5)
      .map(r => ({ name: r.communityName, photosAdded: r.newPhotosFound }));
    
    console.log(`🎉 Systematic enrichment completed!`);
    console.log(`📈 Final Statistics:`);
    console.log(`   - Total processed: ${results.length}`);
    console.log(`   - Successful: ${successful}`);
    console.log(`   - Failed: ${failed}`);
    console.log(`   - Total photos added: ${totalPhotosAdded}`);
    console.log(`   - Communities with new photos: ${communitiesWithNewPhotos}`);
    console.log(`   - Average photos per community: ${averagePhotosPerCommunity.toFixed(2)}`);
    
    return {
      totalProcessed: results.length,
      successful,
      failed,
      totalPhotosAdded,
      results,
      summary: {
        communitiesWithNewPhotos,
        averagePhotosPerCommunity,
        topPerformers
      }
    };
  }

  async getDetailedPhotoStats(): Promise<{
    totalCommunities: number;
    communitiesWithPhotos: number;
    communitiesWithoutPhotos: number;
    totalPhotos: number;
    averagePhotosPerCommunity: number;
    photoDistribution: Array<{photoCount: number, communities: number}>;
    topPhotoCommunities: Array<{name: string, photoCount: number}>;
  }> {
    // Get basic stats
    const basicStats = await db.select({
      totalCommunities: sql<number>`COUNT(*)`,
      communitiesWithPhotos: sql<number>`COUNT(CASE WHEN array_length(photos, 1) > 0 THEN 1 END)`,
      communitiesWithoutPhotos: sql<number>`COUNT(CASE WHEN array_length(photos, 1) IS NULL OR array_length(photos, 1) = 0 THEN 1 END)`,
      totalPhotos: sql<number>`COALESCE(SUM(array_length(photos, 1)), 0)`
    }).from(communities);

    const stats = basicStats[0];
    
    // Get photo distribution
    const photoDistribution = await db.select({
      photoCount: sql<number>`COALESCE(array_length(photos, 1), 0)`,
      communities: sql<number>`COUNT(*)`
    })
    .from(communities)
    .groupBy(sql`COALESCE(array_length(photos, 1), 0)`)
    .orderBy(sql`COALESCE(array_length(photos, 1), 0)`);
    
    // Get top photo communities
    const topPhotoCommunities = await db.select({
      name: communities.name,
      photoCount: sql<number>`COALESCE(array_length(photos, 1), 0)`
    })
    .from(communities)
    .where(sql`array_length(photos, 1) > 0`)
    .orderBy(sql`array_length(photos, 1) DESC`)
    .limit(10);
    
    return {
      totalCommunities: stats.totalCommunities,
      communitiesWithPhotos: stats.communitiesWithPhotos,
      communitiesWithoutPhotos: stats.communitiesWithoutPhotos,
      totalPhotos: stats.totalPhotos,
      averagePhotosPerCommunity: stats.totalCommunities > 0 ? stats.totalPhotos / stats.totalCommunities : 0,
      photoDistribution: photoDistribution.map(pd => ({
        photoCount: pd.photoCount,
        communities: pd.communities
      })),
      topPhotoCommunities: topPhotoCommunities.map(tpc => ({
        name: tpc.name,
        photoCount: tpc.photoCount
      }))
    };
  }
}

export const systematicPhotoEnrichment = new SystematicPhotoEnrichment();