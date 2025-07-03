import axios from 'axios';
import type { Community } from '@shared/schema';

export interface GooglePlacesBusinessData {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  types: string[];
}

export interface GooglePlacesEnrichmentResult {
  placeId: string;
  rating: number;
  reviewCount: number;
  photos: string[];
  reviews: Array<{
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
  website?: string;
  phone?: string;
  address?: string;
  openingHours?: string[];
  success: boolean;
  error?: string;
  costIncurred: number; // Track API costs
}

export class GooglePlacesIntegration {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private callCount = 0;
  private totalCost = 0;
  private readonly dailyLimit = 1000; // Conservative limit
  private readonly costPerTextSearch = 0.032; // $0.032 per request
  private readonly costPerDetailsRequest = 0.017; // $0.017 per request
  private readonly costPerPhotoRequest = 0.007; // $0.007 per request

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GOOGLE_API_KEY or GOOGLE_PLACES_API_KEY not found in environment variables');
    }
  }

  async enrichCommunityWithGooglePlaces(community: Community): Promise<GooglePlacesEnrichmentResult | null> {
    // Only use Google Places as fallback when other sources fail
    const existingPhotos = community.photos || [];
    const hasYelpData = community.yelpId && community.yelpPhotos && community.yelpPhotos.length > 0;
    
    // Skip if we already have sufficient data from other sources
    if (existingPhotos.length >= 2 && hasYelpData) {
      console.log(`Community ${community.name} already has sufficient data, skipping Google Places`);
      return null;
    }

    // Rate limiting and cost control
    if (this.callCount >= this.dailyLimit) {
      console.warn('Google Places API daily limit reached');
      return null;
    }

    if (this.totalCost >= 85) { // $85 monthly budget as recommended by OpenAI
      console.warn('Google Places API monthly budget reached');
      return null;
    }

    try {
      // First, search for the business
      const searchResult = await this.searchGooglePlaces(community);
      if (!searchResult) {
        return {
          placeId: '',
          rating: 0,
          reviewCount: 0,
          photos: [],
          reviews: [],
          success: false,
          error: 'Business not found on Google Places',
          costIncurred: this.costPerTextSearch
        };
      }

      // Get detailed information
      const detailsResult = await this.getPlaceDetails(searchResult.place_id);
      if (!detailsResult) {
        return {
          placeId: searchResult.place_id,
          rating: searchResult.rating || 0,
          reviewCount: searchResult.user_ratings_total || 0,
          photos: [],
          reviews: [],
          success: false,
          error: 'Failed to get place details',
          costIncurred: this.costPerTextSearch + this.costPerDetailsRequest
        };
      }

      // Get photos (only if we need them)
      const photos: string[] = [];
      if (existingPhotos.length < 2 && detailsResult.photos) {
        const photoUrls = await this.getPlacePhotos(detailsResult.photos.slice(0, 3));
        photos.push(...photoUrls);
      }

      // Process reviews
      const reviews = this.processReviews(detailsResult.reviews || []);

      const totalCost = this.costPerTextSearch + this.costPerDetailsRequest + 
                       (photos.length * this.costPerPhotoRequest);
      this.totalCost += totalCost;

      return {
        placeId: detailsResult.place_id,
        rating: detailsResult.rating || 0,
        reviewCount: detailsResult.user_ratings_total || 0,
        photos,
        reviews,
        website: detailsResult.website,
        phone: detailsResult.formatted_phone_number,
        address: detailsResult.formatted_address,
        openingHours: detailsResult.opening_hours?.weekday_text,
        success: true,
        costIncurred: totalCost
      };

    } catch (error) {
      console.error(`Google Places enrichment failed for ${community.name}:`, error);
      return {
        placeId: '',
        rating: 0,
        reviewCount: 0,
        photos: [],
        reviews: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        costIncurred: this.costPerTextSearch
      };
    }
  }

  private async searchGooglePlaces(community: Community): Promise<{ place_id: string; rating?: number; user_ratings_total?: number } | null> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    // Create focused search queries for senior living
    const searchQueries = [
      `${community.name} ${community.city} ${community.state} senior living`,
      `${community.name} ${community.address} ${community.city}`,
      `${community.name} assisted living ${community.city} ${community.state}`,
      `${community.name} nursing home ${community.city} ${community.state}`
    ];

    for (const query of searchQueries) {
      try {
        const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
          params: {
            query,
            key: this.apiKey,
            type: 'health|lodging',
            location: `${community.city}, ${community.state}`,
            radius: 5000 // 5km radius
          },
          timeout: 10000
        });

        this.callCount++;
        this.totalCost += this.costPerTextSearch;

        if (response.data?.results?.length > 0) {
          // Find the best match
          const bestMatch = this.findBestGooglePlacesMatch(community, response.data.results);
          if (bestMatch) {
            return bestMatch;
          }
        }

        // Rate limiting between requests
        await this.delay(100);

      } catch (error) {
        console.log(`Google Places search failed for query: ${query}`);
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn('Google Places API rate limit exceeded');
          break;
        }
      }
    }

    return null;
  }

  private findBestGooglePlacesMatch(
    community: Community, 
    results: any[]
  ): { place_id: string; rating?: number; user_ratings_total?: number } | null {
    // Score results by relevance to our community
    const scoredResults = results.map(result => {
      let score = 0;
      
      // Name similarity (most important)
      const nameSimilarity = this.calculateStringSimilarity(
        community.name.toLowerCase(),
        result.name.toLowerCase()
      );
      score += nameSimilarity * 50;

      // Address similarity
      if (community.address && result.formatted_address) {
        const addressSimilarity = this.calculateStringSimilarity(
          community.address.toLowerCase(),
          result.formatted_address.toLowerCase()
        );
        score += addressSimilarity * 30;
      }

      // Type relevance for senior living
      const relevantTypes = ['health', 'lodging', 'establishment'];
      const hasRelevantType = result.types?.some((type: string) => 
        relevantTypes.includes(type) || 
        type.includes('care') || 
        type.includes('health')
      );
      if (hasRelevantType) {
        score += 15;
      }

      // Rating quality boost
      if (result.rating && result.rating >= 4.0) {
        score += 5;
      }

      return { result, score };
    });

    // Return the best match if score is above threshold
    const bestMatch = scoredResults.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestMatch.score >= 40 ? {
      place_id: bestMatch.result.place_id,
      rating: bestMatch.result.rating,
      user_ratings_total: bestMatch.result.user_ratings_total
    } : null;
  }

  private async getPlaceDetails(placeId: string): Promise<GooglePlacesBusinessData | null> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,reviews,opening_hours,types'
        },
        timeout: 10000
      });

      this.callCount++;
      this.totalCost += this.costPerDetailsRequest;

      return response.data?.result || null;

    } catch (error) {
      console.error(`Failed to get Google Places details for ${placeId}:`, error);
      return null;
    }
  }

  private async getPlacePhotos(photos: Array<{ photo_reference: string; height: number; width: number }>): Promise<string[]> {
    if (!this.apiKey) {
      return [];
    }

    const photoUrls: string[] = [];

    for (const photo of photos) {
      try {
        // Generate photo URL (note: this doesn't count as an API call, but we track it for cost estimation)
        const photoUrl = `${this.baseUrl}/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${this.apiKey}`;
        photoUrls.push(photoUrl);
        
        this.totalCost += this.costPerPhotoRequest;

        // Rate limiting
        await this.delay(50);

      } catch (error) {
        console.log(`Failed to get photo: ${photo.photo_reference}`);
      }
    }

    return photoUrls;
  }

  private processReviews(reviews: any[]): Array<{ author: string; rating: number; text: string; date: string }> {
    return reviews.slice(0, 5).map(review => ({
      author: review.author_name || 'Anonymous',
      rating: review.rating || 0,
      text: review.text || '',
      date: new Date(review.time * 1000).toISOString().split('T')[0]
    }));
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation based on common words
    const words1 = str1.split(/\s+/).filter(w => w.length > 2);
    const words2 = str2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current usage and cost stats
  getUsageStats() {
    return {
      callsUsed: this.callCount,
      remainingCalls: this.dailyLimit - this.callCount,
      totalCostUSD: this.totalCost,
      remainingBudgetUSD: Math.max(0, 85 - this.totalCost),
      dailyLimit: this.dailyLimit,
      usagePercentage: (this.callCount / this.dailyLimit) * 100,
      budgetPercentage: (this.totalCost / 85) * 100
    };
  }

  // Batch enrichment with cost control
  async enrichCommunitiesBatch(communities: Community[]): Promise<Map<number, GooglePlacesEnrichmentResult>> {
    const results = new Map<number, GooglePlacesEnrichmentResult>();
    let totalBatchCost = 0;
    
    for (const community of communities) {
      // Cost check before each community
      if (this.totalCost >= 85) {
        console.warn('Google Places monthly budget reached, stopping batch enrichment');
        break;
      }
      
      try {
        const enrichmentResult = await this.enrichCommunityWithGooglePlaces(community);
        if (enrichmentResult) {
          results.set(community.id, enrichmentResult);
          totalBatchCost += enrichmentResult.costIncurred;
        }
        
        // Rate limiting between requests
        await this.delay(200);
        
        // Conservative limit check
        if (this.callCount >= this.dailyLimit * 0.9) {
          console.warn('Approaching Google Places API daily limit, stopping batch enrichment');
          break;
        }
        
      } catch (error) {
        console.error(`Batch enrichment failed for community ${community.id}:`, error);
      }
    }
    
    console.log(`Google Places batch enrichment completed: ${results.size} communities enriched`);
    console.log(`Total batch cost: $${totalBatchCost.toFixed(3)}`);
    return results;
  }

  // Reset counters (for testing or new day)
  resetCounters() {
    this.callCount = 0;
    this.totalCost = 0;
  }
}

export const googlePlacesIntegration = new GooglePlacesIntegration();