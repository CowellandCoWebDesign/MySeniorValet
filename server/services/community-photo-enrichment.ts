import { communities } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { ScalableCache } from '../infrastructure/cache';

/**
 * Community Photo Enrichment Service
 * NO STOCK PHOTOS - Only real photos from verified sources
 */

// Cache for photo enrichment results - 5 minute TTL
const photoEnrichmentCache = new ScalableCache(500, 5 * 60 * 1000);

// Track enrichments in progress to prevent concurrent calls
const photoEnrichmentInProgress = new Map<number, Promise<any>>();

export class CommunityPhotoEnrichment {
  /**
   * Check if a photo URL is a placeholder or stock photo
   */
  private static isStockOrPlaceholderPhoto(url: string): boolean {
    if (!url) return true;
    
    // Block ALL stock photo services and placeholders
    const blockedPatterns = [
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'shutterstock.com',
      'gettyimages.com',
      'istockphoto.com',
      'depositphotos.com',
      'adobestock.com',
      'freepik.com',
      'rawpixel.com',
      'burst.shopify.com',
      'stocksnap.io',
      'picjumbo.com',
      'placeholder.com',
      'via.placeholder.com',
      'placehold.it',
      'placeimg.com',
      'dummyimage.com',
      'lorempixel.com',
      '/api/placeholder/'
    ];
    
    return blockedPatterns.some(pattern => url.toLowerCase().includes(pattern));
  }

  /**
   * Get only real photos for a community (NO STOCK PHOTOS)
   */
  static getEnrichedPhotosForCommunity(community: any): string[] {
    // Check existing photos and filter out ANY stock/placeholder photos
    const existingPhotos = [
      ...(community.photos || []),
      ...(community.imageGallery || []),
      ...(community.yelpPhotos || [])
    ].filter(photo => photo && !this.isStockOrPlaceholderPhoto(photo));
    
    // Return only real photos, no stock photo fallbacks
    return existingPhotos.slice(0, 15);
  }
  
  /**
   * Check community photos - remove any stock photos with caching
   */
  static async enrichCommunityIfNeeded(community: any): Promise<any> {
    if (!community || !community.id) return community;
    
    const cacheKey = `photo_enrich:${community.id}`;
    
    // Check if enrichment is already in progress
    if (photoEnrichmentInProgress.has(community.id)) {
      console.log(`⏳ Photo enrichment already in progress for community ${community.id}, waiting...`);
      return photoEnrichmentInProgress.get(community.id)!;
    }
    
    // Check cache first
    const cached = photoEnrichmentCache.get(cacheKey);
    if (cached) {
      console.log(`✅ Using cached photo enrichment for community ${community.id}`);
      return cached;
    }
    
    // Create enrichment promise and track it
    const enrichmentPromise = (async () => {
      // Get only real photos (no stock photos)
      const realPhotos = this.getEnrichedPhotosForCommunity(community);
      
      // Create enriched community
      const enrichedCommunity = {
        ...community,
        photos: realPhotos.length > 0 ? realPhotos : []
      };
      
      // Cache the result
      photoEnrichmentCache.set(cacheKey, enrichedCommunity);
      
      return enrichedCommunity;
    })();
    
    // Track the enrichment
    photoEnrichmentInProgress.set(community.id, enrichmentPromise);
    
    try {
      const result = await enrichmentPromise;
      return result;
    } finally {
      // Clean up tracking
      photoEnrichmentInProgress.delete(community.id);
    }
  }
  
  /**
   * Bulk enrich communities - remove stock photos from all
   */
  static async bulkEnrichCommunities(communityIds: number[]): Promise<void> {
    console.log(`Processing ${communityIds.length} communities to remove stock photos...`);
    
    for (const id of communityIds) {
      try {
        const [community] = await db
          .select()
          .from(communities)
          .where(eq(communities.id, id))
          .limit(1);
        
        if (community) {
          const realPhotos = this.getEnrichedPhotosForCommunity(community);
          
          // Update only if we need to remove stock photos
          if (community.photos && Array.isArray(community.photos)) {
            const hadStockPhotos = community.photos.some(photo => 
              this.isStockOrPlaceholderPhoto(photo)
            );
            
            if (hadStockPhotos) {
              await db
                .update(communities)
                .set({ 
                  photos: realPhotos.length > 0 ? realPhotos : null
                })
                .where(eq(communities.id, id));
              
              console.log(`✅ Removed stock photos from community ${id}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing community ${id}:`, error);
      }
    }
    
    console.log('✅ Stock photo removal complete');
  }
  
  /**
   * Get theme info (returns "no stock photos" message)
   */
  static getThemeInfo(): string {
    return 'NO STOCK PHOTOS - Only authentic community photos from verified sources';
  }
}