import { communities } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Community Photo Enrichment Service
 * NO STOCK PHOTOS - Only real photos from verified sources
 */

export class CommunityPhotoEnrichment {
  /**
   * Check if a photo URL is a placeholder, stock photo, or non-photo asset
   */
  private static isStockOrPlaceholderPhoto(url: string): boolean {
    if (!url) return true;
    
    // Block ALL stock photo services, placeholders, and non-photo assets
    const blockedPatterns = [
      // Stock photo services
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
      // Placeholders
      'placeholder.com',
      'via.placeholder.com',
      'placehold.it',
      'placeimg.com',
      'dummyimage.com',
      'lorempixel.com',
      '/api/placeholder/',
      // Icons and logos (NOT real community photos)
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'youtube',
      'pinterest',
      '/icon',
      '/logo',
      '-icon.',
      '-logo.',
      'social-media',
      'social_media',
      'foot-facebook',
      'foot-twitter',
      'sns/', // social network service icons
      'badge',
      'button',
      '.svg',
      'tracking',
      'analytics',
      '1x1',
      'spacer',
      'blank',
      'loading.gif',
      'loading.png',
      'spinner',
      'loader',
      'mt-association',
      'association-top',
      'banner-ad',
      'advertisement',
      // Listing sites that serve generic template images, not community-specific photos
      'lowincomehousing.us',
      'mapquest.com',
      'after55.com',
      // Listing-site placeholder/template image filename patterns
      'no_photo',
      'nophoto',
      'no-photo',
      'divider-half',
      '/divider',
      'default_community_property',
      'templates/homely'
    ];
    
    const urlLower = url.toLowerCase();
    return blockedPatterns.some(pattern => urlLower.includes(pattern));
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
   * Check community photos - remove any stock photos
   */
  static async enrichCommunityIfNeeded(community: any): Promise<any> {
    if (!community) return community;
    
    // Get only real photos (no stock photos)
    const realPhotos = this.getEnrichedPhotosForCommunity(community);
    
    // Return community with only real photos (empty array if none found)
    return {
      ...community,
      photos: realPhotos
    };
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