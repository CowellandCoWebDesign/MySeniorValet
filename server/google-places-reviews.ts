/**
 * Google Places API Reviews Integration
 * Fetches authentic Google reviews for senior living communities
 */

import { db } from './db';
import { communities } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface GooglePlacesReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

interface GooglePlacesDetailsResponse {
  result: {
    name: string;
    rating: number;
    user_ratings_total: number;
    reviews: GooglePlacesReview[];
  };
}

interface GooglePlacesSearchResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    rating: number;
    user_ratings_total: number;
  }>;
}

export class GooglePlacesReviews {
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  
  constructor() {
    if (!GOOGLE_API_KEY) {
      console.warn('Google Places API key not configured - reviews will not be available');
    }
  }

  /**
   * Enrich a community with authentic Google reviews
   */
  async enrichCommunityWithGoogleReviews(communityId: number): Promise<{
    reviewsAdded: number;
    rating: number | null;
    reviewCount: number;
    success: boolean;
    error?: string;
  }> {
    if (!GOOGLE_API_KEY) {
      return {
        reviewsAdded: 0,
        rating: null,
        reviewCount: 0,
        success: false,
        error: 'Google Places API key not configured'
      };
    }

    try {
      // Get community details
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) {
        return {
          reviewsAdded: 0,
          rating: null,
          reviewCount: 0,
          success: false,
          error: 'Community not found'
        };
      }

      console.log(`🔍 Searching for Google Place: ${community.name}`);
      
      // Search for the place
      const placeId = await this.findPlaceId(community.name, community.address, community.city, community.state);
      if (!placeId) {
        return {
          reviewsAdded: 0,
          rating: null,
          reviewCount: 0,
          success: false,
          error: 'Place not found on Google Places'
        };
      }

      console.log(`📍 Found place ID: ${placeId}`);

      // Get place details with reviews
      const placeDetails = await this.getPlaceDetails(placeId);
      if (!placeDetails) {
        return {
          reviewsAdded: 0,
          rating: null,
          reviewCount: 0,
          success: false,
          error: 'Failed to fetch place details'
        };
      }

      console.log(`⭐ Found ${placeDetails.result.reviews?.length || 0} reviews with rating ${placeDetails.result.rating}`);

      // Format reviews for database
      const formattedReviews = this.formatReviewsForDatabase(placeDetails.result.reviews || []);

      // Update community with reviews using direct SQL to avoid schema mismatch
      await db.execute(sql`
        UPDATE communities 
        SET 
          google_review_snippets = ${JSON.stringify(formattedReviews)},
          google_rating = ${placeDetails.result.rating?.toString() || null},
          google_review_count = ${placeDetails.result.user_ratings_total || 0}
        WHERE id = ${communityId}
      `);

      console.log(`✅ Updated ${community.name} with ${formattedReviews.length} authentic Google reviews (${placeDetails.result.rating}★)`);

      return {
        reviewsAdded: formattedReviews.length,
        rating: placeDetails.result.rating,
        reviewCount: placeDetails.result.user_ratings_total || 0,
        success: true
      };

    } catch (error) {
      console.error('Error enriching community with Google reviews:', error);
      return {
        reviewsAdded: 0,
        rating: null,
        reviewCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Find Google Place ID for a community
   */
  private async findPlaceId(name: string, address: string, city: string, state: string): Promise<string | null> {
    try {
      const query = `${name} ${address} ${city} ${state}`;
      const searchUrl = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(searchUrl);
      const data: GooglePlacesSearchResponse = await response.json();
      
      if (!response.ok || !data.results || data.results.length === 0) {
        console.log(`No results found for: ${query}`);
        return null;
      }

      // Find best match by name similarity
      const bestMatch = data.results.find(result => 
        this.calculateSimilarity(result.name.toLowerCase(), name.toLowerCase()) > 0.7
      );

      return bestMatch?.place_id || data.results[0]?.place_id || null;
    } catch (error) {
      console.error('Error searching for place:', error);
      return null;
    }
  }

  /**
   * Get detailed place information including reviews
   */
  private async getPlaceDetails(placeId: string): Promise<GooglePlacesDetailsResponse | null> {
    try {
      const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(detailsUrl);
      const data: GooglePlacesDetailsResponse = await response.json();
      
      if (!response.ok) {
        console.error('Failed to fetch place details:', response.status);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Format Google reviews for database storage
   */
  private formatReviewsForDatabase(reviews: GooglePlacesReview[]): Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }> {
    return reviews.map(review => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      date: new Date(review.time * 1000).toISOString().split('T')[0] // Convert Unix timestamp to YYYY-MM-DD
    }));
  }

  /**
   * Calculate string similarity for matching
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Batch process multiple communities
   */
  async enrichCommunitiesWithGoogleReviews(communityIds: number[]): Promise<{
    processed: number;
    successful: number;
    failed: number;
    details: Array<{ id: number; success: boolean; reviewsAdded: number; error?: string }>;
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const communityId of communityIds) {
      console.log(`\n📍 Processing community ${communityId}...`);
      
      const result = await this.enrichCommunityWithGoogleReviews(communityId);
      
      results.push({
        id: communityId,
        success: result.success,
        reviewsAdded: result.reviewsAdded,
        error: result.error
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      processed: communityIds.length,
      successful,
      failed,
      details: results
    };
  }
}

export const googlePlacesReviews = new GooglePlacesReviews();