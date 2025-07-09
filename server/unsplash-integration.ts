import axios from 'axios';

/**
 * Unsplash API Integration for Premium Quality Images
 * Provides high-resolution, professional photography for senior living communities
 */

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export class UnsplashService {
  private readonly accessKey: string;
  private readonly baseUrl = 'https://api.unsplash.com';
  private readonly applicationId: string;

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY!;
    this.applicationId = process.env.UNSPLASH_APPLICATION_ID!;
    
    if (!this.accessKey || !this.applicationId) {
      throw new Error('Unsplash API credentials not configured');
    }
  }

  /**
   * Search for premium senior living and care community images
   */
  async searchSeniorLivingImages(
    query: string = 'senior living community',
    page: number = 1,
    perPage: number = 20
  ): Promise<UnsplashSearchResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: 'landscape',
          content_filter: 'high',
          order_by: 'relevant'
        },
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Unsplash API error:', error);
      throw new Error('Failed to fetch images from Unsplash');
    }
  }

  /**
   * Get curated hero images for homepage
   */
  async getHeroImages(): Promise<UnsplashImage[]> {
    const heroQueries = [
      'senior living community exterior',
      'retirement community garden',
      'assisted living facility',
      'senior housing beautiful',
      'elder care community'
    ];

    const allImages: UnsplashImage[] = [];
    
    for (const query of heroQueries) {
      try {
        const result = await this.searchSeniorLivingImages(query, 1, 4);
        allImages.push(...result.results);
      } catch (error) {
        console.error(`Failed to fetch images for query: ${query}`, error);
      }
    }

    // Return top 10 highest quality images
    return allImages
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }

  /**
   * Get a specific image by ID
   */
  async getSpecificImage(imageId: string): Promise<UnsplashImage | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/photos/${imageId}`, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to fetch specific image ${imageId}:`, error);
      return null;
    }
  }

  /**
   * Search for images with a specific query
   */
  async searchImages(query: string, perPage: number = 20): Promise<UnsplashImage[]> {
    try {
      const result = await this.searchSeniorLivingImages(query, 1, perPage);
      return result.results;
    } catch (error) {
      console.error(`Failed to search images for query: ${query}`, error);
      return [];
    }
  }

  /**
   * Get community-specific images
   */
  async getCommunityImages(communityName: string, careType: string = 'assisted living'): Promise<UnsplashImage[]> {
    const searchQueries = [
      `${careType} facility exterior`,
      `${careType} community interior`,
      `senior living dining room`,
      `senior community activities`,
      `assisted living apartment`,
      `senior housing lobby`
    ];

    const allImages: UnsplashImage[] = [];
    
    for (const query of searchQueries) {
      try {
        const result = await this.searchSeniorLivingImages(query, 1, 3);
        allImages.push(...result.results);
      } catch (error) {
        console.error(`Failed to fetch images for query: ${query}`, error);
      }
    }

    return allImages.slice(0, 6);
  }

  /**
   * Get specific image by ID with optimized size
   */
  async getOptimizedImage(imageId: string, width: number = 1200, height: number = 600): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/photos/${imageId}`, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });

      const image = response.data;
      // Return optimized URL with specific dimensions
      return `${image.urls.raw}&w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`;
    } catch (error) {
      console.error('Failed to fetch optimized image:', error);
      throw new Error('Failed to get optimized image');
    }
  }

  /**
   * Get random high-quality image for specific use case
   */
  async getRandomImage(
    query: string = 'senior living',
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
  ): Promise<UnsplashImage> {
    try {
      const response = await axios.get(`${this.baseUrl}/photos/random`, {
        params: {
          query,
          orientation,
          content_filter: 'high',
          count: 1
        },
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });

      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.error('Failed to fetch random image:', error);
      throw new Error('Failed to get random image');
    }
  }

  /**
   * Download attribution for proper credit
   */
  async triggerDownload(imageId: string): Promise<void> {
    try {
      await axios.get(`${this.baseUrl}/photos/${imageId}/download`, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });
    } catch (error) {
      console.error('Failed to trigger download attribution:', error);
    }
  }
}

export const unsplashService = new UnsplashService();