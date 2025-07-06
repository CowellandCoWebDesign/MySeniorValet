import { db } from "./db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface GooglePlacesSearchResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
}

export class EmergencyEnrichment {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchGooglePlaces(query: string, location: string): Promise<GooglePlacesSearchResult[]> {
    const searchQuery = `${query} ${location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results || [];
      }
      return [];
    } catch (error) {
      console.error(`Google Places search failed for "${searchQuery}":`, error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,photos,formatted_address,formatted_phone_number,website,reviews&key=${GOOGLE_PLACES_API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.result;
      }
      return null;
    } catch (error) {
      console.error(`Place details failed for ${placeId}:`, error);
      return null;
    }
  }

  async enrichCommunityDirectly(communityId: number): Promise<boolean> {
    try {
      // Get community
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) return false;

      console.log(`🚀 Emergency enriching: ${community.name} (${community.city}, ${community.state})`);

      // Search Google Places
      // 🚨 EMERGENCY STOP: Google Places API blocked due to $100 burn
      console.error(`🚨 EMERGENCY STOP: emergency-enrichment blocked for ${community.name}`);
      const searchResults = []; // await this.searchGooglePlaces(community.name, `${community.city}, ${community.state}`);
      
      if (searchResults.length === 0) {
        console.log(`   ❌ No Google Places found for ${community.name}`);
        return false;
      }

      // Take the first result that looks like a match
      const bestMatch = searchResults[0];
      console.log(`   ✅ Found Google Place: ${bestMatch.name} (${bestMatch.place_id})`);

      // Get detailed information
      const details = await this.getPlaceDetails(bestMatch.place_id);
      await this.delay(100); // Respect API limits

      if (!details) {
        console.log(`   ❌ Could not get details for ${bestMatch.place_id}`);
        return false;
      }

      // Extract photos
      const photos: string[] = [];
      if (details.photos && details.photos.length > 0) {
        for (const photo of details.photos.slice(0, 6)) {
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
          photos.push(photoUrl);
        }
      }

      // Extract reviews
      const reviewSnippets: any[] = [];
      if (details.reviews && details.reviews.length > 0) {
        for (const review of details.reviews.slice(0, 5)) {
          reviewSnippets.push({
            author_name: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time,
            relative_time_description: review.relative_time_description
          });
        }
      }

      // Update database with all enriched data
      await db.update(communities)
        .set({
          googlePlaceId: bestMatch.place_id,
          photos: photos.length > 0 ? photos : community.photos,
          googleRating: details.rating?.toString() || community.googleRating,
          googleReviewCount: details.user_ratings_total || community.googleReviewCount,
          googleReviewSnippets: reviewSnippets.length > 0 ? reviewSnippets : community.googleReviewSnippets,
          phone: details.formatted_phone_number || community.phone,
          website: details.website || community.website,
          lastEnrichmentDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));

      console.log(`   ✅ SUCCESS: +${photos.length} photos, +${reviewSnippets.length} reviews, rating: ${details.rating || 'N/A'}`);
      return true;

    } catch (error) {
      console.error(`   ❌ Emergency enrichment failed for community ${communityId}:`, error);
      return false;
    }
  }

  async enrichAllCommunities(): Promise<{
    total: number;
    enriched: number;
    failed: number;
  }> {
    const allCommunities = await db.select({ id: communities.id, name: communities.name })
      .from(communities)
      .where(eq(communities.state, 'CA'));

    console.log(`🚀 EMERGENCY ENRICHMENT: Processing ${allCommunities.length} communities`);

    let enriched = 0;
    let failed = 0;

    for (const community of allCommunities) {
      const success = await this.enrichCommunityDirectly(community.id);
      if (success) {
        enriched++;
      } else {
        failed++;
      }
      
      // Rate limiting - 2 second delay between communities
      await this.delay(2000);
    }

    console.log(`🏁 EMERGENCY ENRICHMENT COMPLETE: ${enriched} enriched, ${failed} failed`);
    
    return {
      total: allCommunities.length,
      enriched,
      failed
    };
  }
}

export const emergencyEnrichment = new EmergencyEnrichment();