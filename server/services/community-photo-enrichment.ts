import { STOCK_PHOTO_THEMES, getRandomPhotosFromTheme, selectBestThemeForCommunity } from './stock-photo-themes';
import { communities } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Community Photo Enrichment Service
 * Provides high-quality stock photos for communities without real photos
 * Randomly selects from 5 different themes for variety
 */

export class CommunityPhotoEnrichment {
  /**
   * Check if a photo URL is a placeholder or invalid
   */
  private static isPlaceholderPhoto(url: string): boolean {
    if (!url) return true;
    const placeholderPatterns = [
      '/api/placeholder/',
      'placeholder.com',
      'via.placeholder.com',
      'placehold.it',
      'placeimg.com',
      'dummyimage.com',
      'lorempixel.com'
    ];
    return placeholderPatterns.some(pattern => url.toLowerCase().includes(pattern));
  }

  /**
   * Get enriched photos for a community using random theme selection
   */
  static getEnrichedPhotosForCommunity(community: any): string[] {
    // Check existing photos
    const existingPhotos = [
      ...(community.photos || []),
      ...(community.imageGallery || []),
      ...(community.yelpPhotos || [])
    ].filter(photo => photo && !this.isPlaceholderPhoto(photo));
    
    // If we already have enough real photos, return them
    if (existingPhotos.length >= 8) {
      return existingPhotos.slice(0, 15);
    }
    
    // Randomly select a theme (with 70% chance of smart selection, 30% pure random)
    const useSmartSelection = Math.random() < 0.7;
    let selectedTheme: keyof typeof STOCK_PHOTO_THEMES;
    
    if (useSmartSelection) {
      // Use smart selection based on community characteristics
      selectedTheme = selectBestThemeForCommunity(community);
    } else {
      // Pure random selection for variety
      const themes = Object.keys(STOCK_PHOTO_THEMES) as Array<keyof typeof STOCK_PHOTO_THEMES>;
      selectedTheme = themes[Math.floor(Math.random() * themes.length)];
    }
    
    // Get photos from selected theme
    const themePhotos = getRandomPhotosFromTheme(selectedTheme, 12);
    
    // Mix existing photos with theme photos
    const allPhotos = [
      ...existingPhotos,
      ...themePhotos
    ];
    
    // Remove duplicates and return up to 15 photos
    return [...new Set(allPhotos)].slice(0, 15);
  }
  
  /**
   * Enrich community with stock photos if needed
   */
  static async enrichCommunityIfNeeded(community: any): Promise<any> {
    // Check if community needs enrichment
    const hasPlaceholderPhotos = (community.photos || []).some((photo: string) => 
      this.isPlaceholderPhoto(photo)
    );
    const hasNoPhotos = !community.photos || community.photos.length === 0;
    const hasRealTimePhotos = community.realTimeData?.photos && community.realTimeData.photos.length > 0;
    
    // Don't enrich if we have real-time photos from Perplexity
    if (hasRealTimePhotos) {
      return community;
    }
    
    // Enrich if needed
    if (hasPlaceholderPhotos || hasNoPhotos) {
      const enrichedPhotos = this.getEnrichedPhotosForCommunity(community);
      
      return {
        ...community,
        photos: enrichedPhotos,
        photoAttributions: enrichedPhotos.map(url => {
          if (url.includes('unsplash.com')) {
            return 'Photo by Unsplash';
          }
          if (url.includes('pexels.com')) {
            return 'Photo by Pexels';
          }
          return 'Community Photo';
        })
      };
    }
    
    return community;
  }
  
  /**
   * Update community photos in database if needed
   */
  static async updateCommunityPhotosInDatabase(communityId: number): Promise<void> {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community) return;
      
      // Check if community needs photo enrichment
      const hasPlaceholderPhotos = (community.photos || []).some(photo => 
        this.isPlaceholderPhoto(photo)
      );
      const hasNoPhotos = !community.photos || community.photos.length === 0;
      
      if (hasPlaceholderPhotos || hasNoPhotos) {
        const enrichedPhotos = this.getEnrichedPhotosForCommunity(community);
        
        // Update database with new photos
        await db
          .update(communities)
          .set({
            photos: enrichedPhotos,
            photoAttributions: enrichedPhotos.map(url => {
              if (url.includes('unsplash.com')) {
                return 'Photo by Unsplash';
              }
              if (url.includes('pexels.com')) {
                return 'Photo by Pexels';
              }
              return 'Community Photo';
            })
          })
          .where(eq(communities.id, communityId));
      }
    } catch (error) {
      console.error('Error updating community photos:', error);
    }
  }
}