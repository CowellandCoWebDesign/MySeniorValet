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
  private readonly dailyLimit = 0; // EMERGENCY SHUTDOWN: $300 spent yesterday // EMERGENCY: Reduced from 1000 // Conservative limit
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
    // Continue enrichment to gather additional photos and information
    const existingPhotos = community.photos || [];
    
    // Note: Always attempt enrichment to potentially find new photos, reviews, or updated information

    // Rate limiting and cost control
    if (this.callCount >= this.dailyLimit) {
      console.warn('Google Places API daily limit reached');
      return null;
    }

    if (this.totalCost >= 0) // EMERGENCY SHUTDOWN: No more spending allowed { // EMERGENCY: Reduced from $85
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

      // Get all available photos (avoid duplicates)
      const photos: string[] = [];
      if (detailsResult.photos) {
        // Get up to 6 photos instead of limiting to 3
        const photoUrls = await this.getPlacePhotos(detailsResult.photos.slice(0, 3)); // EMERGENCY: Reduced from 6
        // Filter out any photos that might already exist
        const newUniquePhotos = photoUrls.filter(url => !existingPhotos.includes(url));
        photos.push(...newUniquePhotos);
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

    // Create focused search queries for senior living (simplified approach)
    const searchQueries = [
      `${community.name} ${community.city} CA`,
      `${community.name} ${community.address}`,
      `${community.name} senior living ${community.city}`,
      `${community.name} assisted living`
    ];

    for (const query of searchQueries) {
      try {
        const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
          params: {
            query,
            key: this.apiKey,
            // Removed type restriction - senior living facilities don't classify as health or lodging
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

  /**
   * Discover new senior living communities in a specific area using Google Places
   */
  async discoverCommunitiesInArea(
    searchTerms: string[],
    location: string,
    radius: number = 25000
  ): Promise<Array<{
    place_id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    phone?: string;
    website?: string;
    rating?: number;
    reviewCount?: number;
    lat?: number;
    lng?: number;
    types: string[];
  }>> {
    const discoveredCommunities: any[] = [];
    const seenPlaceIds = new Set<string>();

    if (this.callCount >= this.dailyLimit) {
      throw new Error('Daily API limit reached');
    }

    console.log(`Discovering senior living communities near ${location}...`);

    for (const searchTerm of searchTerms) {
      try {
        console.log(`Searching for: ${searchTerm}`);
        
        const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
          params: {
            key: this.apiKey,
            query: `${searchTerm} near ${location}`,
            radius: radius
            // Removed type restriction - senior living facilities have various types
          },
          timeout: 15000
        });

        this.callCount++;
        this.totalCost += this.costPerTextSearch;

        if (response.data?.results?.length > 0) {
          for (const place of response.data.results) {
            // Skip if we've already found this place
            if (seenPlaceIds.has(place.place_id)) {
              continue;
            }

            // Filter to only include senior living related places
            console.log(`Checking place: ${place.name} | Types: ${place.types?.join(', ') || 'none'}`);
            if (this.isSeniorLivingFacility(place.name, place.types)) {
              seenPlaceIds.add(place.place_id);
              
              const community = await this.extractCommunityDataFromPlace(place);
              if (community) {
                discoveredCommunities.push(community);
                console.log(`✅ Added: ${community.name} in ${community.city}`);
              }
            } else {
              console.log(`❌ Filtered out: ${place.name} (not recognized as senior living)`);
            }
          }
        }

        // Rate limiting between searches
        await this.delay(200);

      } catch (error) {
        console.error(`Search failed for "${searchTerm}":`, error instanceof Error ? error.message : 'Unknown error');
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.warn('Google Places API rate limit exceeded');
          break;
        }
      }
    }

    console.log(`Discovery complete. Found ${discoveredCommunities.length} unique communities.`);
    return discoveredCommunities;
  }

  private isSeniorLivingFacility(name: string, types: string[]): boolean {
    const nameLower = name.toLowerCase();
    
    // Expanded list of senior living keywords
    const seniorKeywords = [
      'senior', 'assisted living', 'memory care', 'independent living', 
      'retirement', 'elder care', 'adult care', 'senior community',
      'continuing care', 'skilled nursing', 'nursing home', 'care facility',
      'assisted', 'residence', 'manor', 'lodge', 'springs', 'gardens',
      'terrace', 'village', 'estate', 'place', 'home', 'center',
      'silvercrest', 'timber ridge', 'alder bay', 'humboldt house'
    ];
    
    // Exclude obvious non-senior facilities
    const excludeKeywords = [
      'hospital', 'urgent care', 'clinic', 'medical center', 'pharmacy',
      'school', 'daycare', 'bank', 'restaurant', 'store', 'shop', 'hotel',
      'gas station', 'church', 'temple', 'mosque', 'auto', 'repair'
    ];
    
    const hasSeniorKeyword = seniorKeywords.some(keyword => nameLower.includes(keyword));
    const hasExcludeKeyword = excludeKeywords.some(keyword => nameLower.includes(keyword));
    
    // Remove the restrictive type requirement - just check name patterns
    return hasSeniorKeyword && !hasExcludeKeyword;
  }

  private async extractCommunityDataFromPlace(place: any): Promise<any | null> {
    try {
      // Parse address components
      const addressParts = place.formatted_address?.split(', ') || [];
      let city = '';
      let state = '';
      let zipCode = '';
      
      if (addressParts.length >= 2) {
        const lastPart = addressParts[addressParts.length - 1]; // "CA 96002, USA"
        const secondLastPart = addressParts[addressParts.length - 2]; // City name
        
        city = secondLastPart || '';
        
        // Extract state and zip from last part
        const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5}(-\d{4})?)?/);
        if (stateZipMatch) {
          state = stateZipMatch[1];
          zipCode = stateZipMatch[2] || '';
        }
      }

      return {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address || '',
        city: city,
        state: state,
        zipCode: zipCode,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        reviewCount: place.user_ratings_total || 0,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        types: place.types || []
      };
    } catch (error) {
      console.error('Error extracting community data:', error);
      return null;
    }
  }

}

export const googlePlacesIntegration = new GooglePlacesIntegration();