import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { googlePlacesIntegration } from "./google-places-integration";
import { dataProtectionService } from "./data-protection";
import { apiCostProtection } from "./api-cost-protection";

import { emergencyApiDisable } from './emergency-api-disable';

export class ComprehensivePhotoEnrichment {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async enrichAllCommunities(): Promise<{
    totalCommunities: number;
    enriched: number;
    photosAdded: number;
    errors: string[];
  }> {
    // EMERGENCY: API DISABLED
    emergencyApiDisable.checkApiAccess('Comprehensive Photo Enrichment');
    
    console.log("🚀 Starting comprehensive photo enrichment for ALL communities");
    
    // 🚨 CRITICAL COST PROTECTION: Check total operation cost before starting
    const allCommunities = await db.select().from(communities);
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
    
    console.log(`📊 Found ${allCommunities.length} communities to enrich`);
    
    let enriched = 0;
    let totalPhotosAdded = 0;
    const errors: string[] = [];
    
    for (const community of allCommunities) {
      try {
        console.log(`🔍 Enriching: ${community.name} (ID: ${community.id})`);
        
        // Get existing photos count
        const existingPhotosCount = community.photos?.length || 0;
        
        // Enrich with Google Places
        const enrichmentResult = await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
        
        if (enrichmentResult && enrichmentResult.success) {
          // Update community with ALL photos (no limits)
          const existingPhotos = community.photos || [];
          const newPhotos = enrichmentResult.photos || [];
          
          // Filter out duplicates by checking photo reference IDs
          const newUniquePhotos = newPhotos.filter(photo => 
            !existingPhotos.some(existing => 
              existing.includes(photo.split('photo_reference=')[1]?.split('&')[0] || '')
            )
          );
          
          const allPhotos = [...existingPhotos, ...newUniquePhotos];
          
          // Data Protection: Validate photo enrichment data before update
          const updateData = {
            photos: allPhotos,
            googleRating: enrichmentResult.rating?.toString(),
            googleReviewCount: enrichmentResult.reviewCount,
            phone: enrichmentResult.phone,
            website: enrichmentResult.website
          };

          const protectionResult = await dataProtectionService.enforceDataProtection([updateData], 'google_places_photos');
          
          if (protectionResult.blocked.length > 0) {
            console.warn(`⚠️ Data protection blocked photo update for ${community.name}:`, protectionResult.summary);
            continue; // Skip this community
          }
          
          // Update database with enriched data
          await db.update(communities)
            .set({
              photos: allPhotos,
              googleRating: enrichmentResult.rating?.toString() || community.googleRating,
              googleReviewCount: enrichmentResult.reviewCount || community.googleReviewCount,
              // googlePlacesId: enrichmentResult.placeId || community.googlePlacesId,
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
        } else {
          console.log(`⚠️  ${community.name}: No enrichment data found`);
        }
        
        // 🚨 CRITICAL: Check if we're approaching limits after each community
        const currentUsage = apiCostProtection.getUsageStatus();
        if (currentUsage.remaining.dailyCost < 5) {
          console.warn('🚨 STOPPING ENRICHMENT: Less than $5 remaining for today');
          break;
        }
        
        // Rate limiting to avoid API quota issues
        await this.delay(3000); // Increased to 3 second delay between communities
        
      } catch (error) {
        const errorMsg = `Error enriching ${community.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
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
  }

  async enrichByCity(city: string, state: string): Promise<{
    totalCommunities: number;
    enriched: number;
    photosAdded: number;
    errors: string[];
  }> {
    // EMERGENCY: API DISABLED
    emergencyApiDisable.checkApiAccess('City Photo Enrichment');
    
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
          // Update community with ALL photos (no limits)
          const existingPhotos = community.photos || [];
          const newPhotos = enrichmentResult.photos || [];
          
          // Filter out duplicates
          const newUniquePhotos = newPhotos.filter(photo => 
            !existingPhotos.some(existing => 
              existing.includes(photo.split('photo_reference=')[1]?.split('&')[0] || '')
            )
          );
          
          const allPhotos = [...existingPhotos, ...newUniquePhotos];
          
          // Update database
          await db.update(communities)
            .set({
              photos: allPhotos,
              googleRating: enrichmentResult.rating?.toString() || community.googleRating,
              googleReviewCount: enrichmentResult.reviewCount || community.googleReviewCount,
              // googlePlaceId: enrichmentResult.placeId || community.googlePlaceId,
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
}

export const comprehensivePhotoEnrichment = new ComprehensivePhotoEnrichment();