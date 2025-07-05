/**
 * Google Places Integration with Cost Controls
 * Clean implementation with $300 disaster prevention
 */

import axios from 'axios';
import { trackAPICall, checkCostLimits } from './cost-tracker';
import type { Community, GooglePlacesEnrichmentResult } from '@shared/schema';

export class GooglePlacesIntegration {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  
  // Cost tracking
  private callCount = 0;
  private totalCost = 0;
  private dailyLimit = 1000;
  
  // Cost per operation (in USD)
  private costPerTextSearch = 0.032;
  private costPerDetailsRequest = 0.017;
  private costPerPhotoRequest = 0.007;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GOOGLE_API_KEY or GOOGLE_PLACES_API_KEY not found in environment variables');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced community enrichment with Google Places data
   */
  async enrichCommunityWithGooglePlaces(community: Community): Promise<GooglePlacesEnrichmentResult | null> {
    // Check cost limits before proceeding
    const costCheck = checkCostLimits();
    if (!costCheck.canProceed) {
      console.warn(`Cost limit exceeded: ${costCheck.reason}`);
      return null;
    }

    const existingPhotos = community.photos || [];
    
    if (this.callCount >= this.dailyLimit) {
      console.warn('Google Places API daily limit reached');
      return null;
    }

    try {
      console.log(`🔍 Enriching community: ${community.name}`);

      // Find the best Google Places match
      const searchResults = await this.searchGooglePlaces(community);
      if (!searchResults || searchResults.length === 0) {
        console.log(`No Google Places results found for ${community.name}`);
        return null;
      }

      const bestMatch = this.findBestMatch(community, searchResults);
      if (!bestMatch) {
        console.log(`No suitable match found for ${community.name}`);
        return null;
      }

      // Get detailed place information
      const placeDetails = await this.getPlaceDetails(bestMatch.place_id);
      if (!placeDetails) {
        console.log(`Failed to get place details for ${community.name}`);
        return null;
      }

      // Extract photos (limit to prevent cost explosion)
      const maxPhotosToAdd = 15; // Reasonable limit
      const newPhotos: string[] = [];
      
      if (placeDetails.photos && placeDetails.photos.length > 0) {
        const photosToProcess = placeDetails.photos.slice(0, maxPhotosToAdd);
        
        for (const photo of photosToProcess) {
          try {
            const photoUrl = this.buildPhotoUrl(photo.photo_reference, 800);
            
            // Check if photo already exists
            if (!existingPhotos.some(url => url.includes(photo.photo_reference))) {
              newPhotos.push(photoUrl);
              trackAPICall('photo', this.costPerPhotoRequest);
            }
            
            await this.delay(100); // Rate limiting
          } catch (error) {
            console.warn(`Failed to process photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      const enrichmentResult: GooglePlacesEnrichmentResult = {
        success: true,
        placeId: bestMatch.place_id,
        rating: placeDetails.rating || null,
        reviewCount: placeDetails.user_ratings_total || null,
        newPhotos,
        website: placeDetails.website || null,
        phone: placeDetails.formatted_phone_number || null,
        priceLevel: placeDetails.price_level || null,
        openingHours: placeDetails.opening_hours?.weekday_text || null,
        reviews: placeDetails.reviews?.slice(0, 5) || null, // Limit reviews
      };

      console.log(`✅ Enriched ${community.name}: ${newPhotos.length} new photos, rating: ${enrichmentResult.rating}`);
      return enrichmentResult;

    } catch (error) {
      console.error(`Error enriching ${community.name}:`, error instanceof Error ? error.message : 'Unknown error');
      return { success: false };
    }
  }

  /**
   * Search for a community in Google Places
   */
  private async searchGooglePlaces(community: Community): Promise<any[] | null> {
    try {
      const query = `${community.name} ${community.city} ${community.state}`;
      
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          key: this.apiKey,
          query: query,
          type: 'establishment'
        },
        timeout: 10000
      });

      this.callCount++;
      this.totalCost += this.costPerTextSearch;
      trackAPICall('textSearch', this.costPerTextSearch);

      if (response.data.status === 'OK') {
        return response.data.results || [];
      } else {
        console.warn(`Google Places search failed: ${response.data.status}`);
        return null;
      }
    } catch (error) {
      console.error('Google Places search error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Get detailed information about a place
   */
  private async getPlaceDetails(placeId: string): Promise<any | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          key: this.apiKey,
          place_id: placeId,
          fields: 'name,rating,user_ratings_total,formatted_phone_number,website,photos,reviews,price_level,opening_hours'
        },
        timeout: 10000
      });

      this.callCount++;
      this.totalCost += this.costPerDetailsRequest;
      trackAPICall('placeDetails', this.costPerDetailsRequest);

      if (response.data.status === 'OK') {
        return response.data.result;
      } else {
        console.warn(`Place details failed: ${response.data.status}`);
        return null;
      }
    } catch (error) {
      console.error('Place details error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Find the best matching place for a community
   */
  private findBestMatch(community: Community, results: any[]): any | null {
    if (!results || results.length === 0) return null;

    // Simple matching based on name similarity and location
    const communityName = community.name.toLowerCase();
    
    for (const result of results) {
      const resultName = result.name.toLowerCase();
      
      // Check if names are similar
      if (resultName.includes(communityName) || communityName.includes(resultName)) {
        return result;
      }
    }

    // If no exact match, return the first result
    return results[0];
  }

  /**
   * Build photo URL from photo reference
   */
  private buildPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Discover communities in an area (with strict cost controls)
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
    // Check cost limits before proceeding
    const costCheck = checkCostLimits();
    if (!costCheck.canProceed) {
      throw new Error(`Cost limit exceeded: ${costCheck.reason}`);
    }

    const discoveredCommunities: any[] = [];
    const seenPlaceIds = new Set<string>();

    console.log(`Discovering senior living communities near ${location}...`);

    // Limit search terms to prevent cost explosion
    const limitedSearchTerms = searchTerms.slice(0, 3); // Max 3 search terms

    for (const searchTerm of limitedSearchTerms) {
      try {
        console.log(`Searching for: ${searchTerm}`);
        
        const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
          params: {
            key: this.apiKey,
            query: `${searchTerm} near ${location}`,
            radius: radius
          },
          timeout: 15000
        });

        this.callCount++;
        this.totalCost += this.costPerTextSearch;
        trackAPICall('textSearch', this.costPerTextSearch);

        if (response.data?.results?.length > 0) {
          // Limit results per search to prevent cost explosion
          const limitedResults = response.data.results.slice(0, 10);
          
          for (const place of limitedResults) {
            if (seenPlaceIds.has(place.place_id)) {
              continue;
            }

            if (this.isSeniorLivingFacility(place.name, place.types)) {
              seenPlaceIds.add(place.place_id);
              
              const community = await this.extractCommunityDataFromPlace(place);
              if (community) {
                discoveredCommunities.push(community);
                console.log(`✅ Added: ${community.name} in ${community.city}`);
              }
            }
          }
        }

        await this.delay(200); // Rate limiting

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

  /**
   * Check if a place is a senior living facility
   */
  private isSeniorLivingFacility(name: string, types: string[]): boolean {
    const nameText = name.toLowerCase();
    
    // Senior living keywords
    const seniorKeywords = [
      'senior', 'assisted living', 'retirement', 'memory care',
      'nursing home', 'elder care', 'skilled nursing',
      'independent living', 'continuing care', 'ccrc'
    ];
    
    // Exclusion keywords
    const excludeKeywords = [
      'hospital', 'clinic', 'medical center', 'urgent care',
      'pharmacy', 'dentist', 'optometry', 'veterinary',
      'school', 'church', 'restaurant', 'hotel', 'motel'
    ];
    
    // Check exclusions first
    if (excludeKeywords.some(keyword => nameText.includes(keyword))) {
      return false;
    }
    
    // Check for senior living keywords
    return seniorKeywords.some(keyword => nameText.includes(keyword));
  }

  /**
   * Extract community data from a Google Places result
   */
  private async extractCommunityDataFromPlace(place: any): Promise<any | null> {
    try {
      // Parse address components
      const addressParts = place.formatted_address?.split(', ') || [];
      let city = '';
      let state = '';
      let zipCode = '';
      
      if (addressParts.length >= 3) {
        city = addressParts[addressParts.length - 3] || '';
        const stateZip = addressParts[addressParts.length - 2] || '';
        const stateZipMatch = stateZip.match(/^([A-Z]{2})\s+(\d{5})/);
        if (stateZipMatch) {
          state = stateZipMatch[1];
          zipCode = stateZipMatch[2];
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
      console.error('Error extracting community data:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Get cost statistics
   */
  getCostStats() {
    return {
      callCount: this.callCount,
      totalCost: this.totalCost,
      costPerTextSearch: this.costPerTextSearch,
      costPerDetailsRequest: this.costPerDetailsRequest,
      costPerPhotoRequest: this.costPerPhotoRequest
    };
  }
}

// Export singleton instance
export const googlePlacesIntegration = new GooglePlacesIntegration();