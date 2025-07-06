/**
 * Manual Enrichment System
 * Only runs when explicitly requested - no automatic processes
 * Simple operations that run once and store results permanently
 */

import { db } from './db';
import { communities } from '../shared/schema';
import { eq, isNull, or } from 'drizzle-orm';
import { apiCostProtection } from './api-cost-protection';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export class ManualEnrichmentService {
  /**
   * Add photos to a specific community (manual operation)
   */
  async addPhotosToOne(communityId: number): Promise<{
    success: boolean;
    photosAdded: number;
    error?: string;
    cost: number;
  }> {
    if (!GOOGLE_API_KEY) {
      return { success: false, photosAdded: 0, error: 'Google API key not configured', cost: 0 };
    }

    // Check cost protection before starting
    const costCheck = await apiCostProtection.checkBeforeOperation(2, 0.05); // Estimate 2 calls, $0.05
    if (!costCheck.allowed) {
      return { success: false, photosAdded: 0, error: costCheck.reason, cost: 0 };
    }

    try {
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) {
        return { success: false, photosAdded: 0, error: 'Community not found', cost: 0 };
      }

      if (community.photos && community.photos.length > 0) {
        return { success: true, photosAdded: 0, error: 'Community already has photos', cost: 0 };
      }

      // Search for place
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(community.name + ' ' + community.address)}&key=${GOOGLE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.results || searchData.results.length === 0) {
        await apiCostProtection.recordUsage(1, 0.032, `Photo search for community ${communityId}`);
        return { success: false, photosAdded: 0, error: 'Place not found', cost: 0.032 };
      }

      const placeId = searchData.results[0].place_id;

      // Get place details with photos
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      let photosAdded = 0;
      const cost = 0.032 + 0.017; // Text search + Place details

      if (detailsData.result && detailsData.result.photos) {
        const photoUrls = detailsData.result.photos.slice(0, 5).map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
        );

        await db.update(communities)
          .set({ 
            photos: photoUrls,
            lastEnrichmentDate: new Date()
          })
          .where(eq(communities.id, communityId));

        photosAdded = photoUrls.length;
      }

      await apiCostProtection.recordUsage(2, cost, `Photo enrichment for community ${communityId}`);

      return { success: true, photosAdded, cost };
    } catch (error) {
      return { 
        success: false, 
        photosAdded: 0, 
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0
      };
    }
  }

  /**
   * Add reviews to a specific community (manual operation)
   */
  async addReviewsToOne(communityId: number): Promise<{
    success: boolean;
    reviewsAdded: number;
    error?: string;
    cost: number;
  }> {
    if (!GOOGLE_API_KEY) {
      return { success: false, reviewsAdded: 0, error: 'Google API key not configured', cost: 0 };
    }

    // Check cost protection
    const costCheck = await apiCostProtection.checkBeforeOperation(2, 0.05);
    if (!costCheck.allowed) {
      return { success: false, reviewsAdded: 0, error: costCheck.reason, cost: 0 };
    }

    try {
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) {
        return { success: false, reviewsAdded: 0, error: 'Community not found', cost: 0 };
      }

      if (community.googleReviewSnippets && community.googleReviewSnippets.length > 0) {
        return { success: true, reviewsAdded: 0, error: 'Community already has reviews', cost: 0 };
      }

      // Search for place
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(community.name + ' ' + community.address)}&key=${GOOGLE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.results || searchData.results.length === 0) {
        await apiCostProtection.recordUsage(1, 0.032, `Review search for community ${communityId}`);
        return { success: false, reviewsAdded: 0, error: 'Place not found', cost: 0.032 };
      }

      const placeId = searchData.results[0].place_id;

      // Get place details with reviews
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      let reviewsAdded = 0;
      const cost = 0.032 + 0.017; // Text search + Place details

      if (detailsData.result) {
        const updates: any = { lastEnrichmentDate: new Date() };

        if (detailsData.result.reviews) {
          const reviewSnippets = detailsData.result.reviews.slice(0, 5).map((review: any) => ({
            author: review.author_name || 'Anonymous',
            rating: review.rating || 0,
            text: review.text || '',
            date: new Date(review.time * 1000).toISOString().split('T')[0]
          }));
          updates.googleReviewSnippets = reviewSnippets;
          reviewsAdded = reviewSnippets.length;
        }

        if (detailsData.result.rating) {
          updates.googleRating = detailsData.result.rating;
        }

        if (detailsData.result.user_ratings_total) {
          updates.googleReviewCount = detailsData.result.user_ratings_total;
        }

        await db.update(communities).set(updates).where(eq(communities.id, communityId));
      }

      await apiCostProtection.recordUsage(2, cost, `Review enrichment for community ${communityId}`);

      return { success: true, reviewsAdded, cost };
    } catch (error) {
      return { 
        success: false, 
        reviewsAdded: 0, 
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: 0
      };
    }
  }

  /**
   * Get communities that need photos (manual query)
   */
  async getCommunitiesNeedingPhotos(): Promise<Array<{ id: number; name: string; city: string }>> {
    const result = await db.select({
      id: communities.id,
      name: communities.name,
      city: communities.city
    })
    .from(communities)
    .where(isNull(communities.photos));

    return result;
  }

  /**
   * Get communities that need reviews (manual query)
   */
  async getCommunitiesNeedingReviews(): Promise<Array<{ id: number; name: string; city: string }>> {
    const result = await db.select({
      id: communities.id,
      name: communities.name,
      city: communities.city
    })
    .from(communities)
    .where(isNull(communities.googleReviewSnippets));

    return result;
  }

  /**
   * Get enrichment statistics (manual query)
   */
  async getEnrichmentStats(): Promise<{
    total: number;
    withPhotos: number;
    withReviews: number;
    needingPhotos: number;
    needingReviews: number;
  }> {
    const allCommunities = await db.select().from(communities);
    
    return {
      total: allCommunities.length,
      withPhotos: allCommunities.filter(c => c.photos && c.photos.length > 0).length,
      withReviews: allCommunities.filter(c => c.googleReviewSnippets && c.googleReviewSnippets.length > 0).length,
      needingPhotos: allCommunities.filter(c => !c.photos || c.photos.length === 0).length,
      needingReviews: allCommunities.filter(c => !c.googleReviewSnippets || c.googleReviewSnippets.length === 0).length
    };
  }
}

export const manualEnrichment = new ManualEnrichmentService();