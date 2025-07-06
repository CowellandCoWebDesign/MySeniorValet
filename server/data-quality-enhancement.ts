/**
 * Comprehensive Data Quality Enhancement System
 * Addresses photo duplication, missing reviews, empty amenities, and review transparency
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { googlePlacesIntegration } from "./google-places-integration";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DataQualityReport {
  communityId: number;
  name: string;
  issues: string[];
  improvements: string[];
  before: {
    photoCount: number;
    amenityCount: number;
    reviewCount: number;
  };
  after: {
    photoCount: number;
    amenityCount: number;
    reviewCount: number;
  };
}

export class DataQualityEnhancement {
  
  /**
   * Deduplicate photos by removing identical photo references
   */
  async deduplicatePhotos(communityId: number): Promise<{
    before: number;
    after: number;
    duplicatesRemoved: number;
  }> {
    const community = await db.select().from(communities).where(eq(communities.id, communityId)).then(r => r[0]);
    if (!community?.photos) return { before: 0, after: 0, duplicatesRemoved: 0 };

    const originalCount = community.photos.length;
    
    // Extract photo reference IDs to detect duplicates
    const uniquePhotos = [];
    const seenReferences = new Set();
    
    for (const photo of community.photos) {
      // Extract photoreference parameter from Google Places photo URL
      const match = photo.match(/photoreference=([^&]+)/);
      const reference = match ? match[1] : photo;
      
      if (!seenReferences.has(reference)) {
        seenReferences.add(reference);
        uniquePhotos.push(photo);
      }
    }

    const finalCount = uniquePhotos.length;
    const duplicatesRemoved = originalCount - finalCount;

    if (duplicatesRemoved > 0) {
      await db
        .update(communities)
        .set({ photos: uniquePhotos })
        .where(eq(communities.id, communityId));
      
      console.log(`✅ Deduplicated ${duplicatesRemoved} photos for ${community.name}`);
    }

    return {
      before: originalCount,
      after: finalCount,
      duplicatesRemoved
    };
  }

  /**
   * Add authentic Google review data from Google Places API
   */
  async addAuthenticGoogleReviews(communityId: number): Promise<{
    reviewsAdded: number;
    success: boolean;
  }> {
    try {
      const community = await db.select().from(communities).where(eq(communities.id, communityId)).then(r => r[0]);
      if (!community) return { reviewsAdded: 0, success: false };

      // Get Google Places data which includes reviews
      // 🚨 EMERGENCY STOP: Google Places API blocked due to $100 burn
      console.error(`🚨 EMERGENCY STOP: data-quality-enhancement blocked for ${community.name}`);
      const enrichmentResult = null; // await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
      
      if (enrichmentResult?.success && enrichmentResult.reviews.length > 0) {
        // Convert Google reviews to our yelp_reviews format (since it's the main review field)
        const formattedReviews = enrichmentResult.reviews.map(review => ({
          rating: review.rating,
          text: review.text,
          author: review.author,
          date: review.date,
          isPositive: review.rating >= 4
        }));

        // Update community with authentic Google reviews
        await db
          .update(communities)
          .set({ 
            yelpReviews: formattedReviews
          })
          .where(eq(communities.id, communityId));

        console.log(`✅ Added ${formattedReviews.length} authentic Google reviews for ${community.name}`);
        return { reviewsAdded: formattedReviews.length, success: true };
      }

      return { reviewsAdded: 0, success: false };
    } catch (error) {
      console.error('Error adding Google reviews:', error);
      return { reviewsAdded: 0, success: false };
    }
  }

  /**
   * Extract amenities and services from review text using AI
   */
  async extractAmenitiesFromReviews(communityId: number): Promise<{
    amenitiesFound: string[];
    servicesFound: string[];
    success: boolean;
  }> {
    try {
      const community = await db.select().from(communities).where(eq(communities.id, communityId)).then(r => r[0]);
      if (!community) return { amenitiesFound: [], servicesFound: [], success: false };

      // Get review text from all review sources
      const allReviews = [
        ...(community.yelpReviews || []),
        ...(community.careComReviews || []),
        ...(community.seniorAdvisorReviews || []),
        ...(community.aplaceformomReviews || [])
      ];

      if (allReviews.length === 0) {
        return { amenitiesFound: [], servicesFound: [], success: false };
      }

      // Combine all review text
      const reviewText = allReviews.map(review => review.text).join(' ');
      
      // Use AI to extract amenities and services from reviews
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing senior living community reviews to extract specific amenities and services mentioned. Focus on concrete, tangible features that families care about. 

AMENITIES are physical features/spaces like:
- Swimming pool, fitness center, library, chapel, garden, dining room, beauty salon, game room, theater, etc.

SERVICES are care/support offerings like:
- Physical therapy, transportation, housekeeping, laundry, meal service, medication management, etc.

Respond with JSON in this exact format:
{
  "amenities": ["specific amenity 1", "specific amenity 2"],
  "services": ["specific service 1", "specific service 2"]
}

Only include items specifically mentioned in the reviews. Be precise and avoid generic terms.`
          },
          {
            role: "user",
            content: `Extract amenities and services mentioned in these reviews for ${community.name}:\n\n${reviewText.substring(0, 2000)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const amenitiesFound = result.amenities || [];
      const servicesFound = result.services || [];

      if (amenitiesFound.length > 0 || servicesFound.length > 0) {
        // Merge with existing amenities/services, avoiding duplicates
        const currentAmenities = community.amenities || [];
        const currentServices = community.services || [];
        
        const uniqueAmenities = [...new Set([...currentAmenities, ...amenitiesFound])];
        const uniqueServices = [...new Set([...currentServices, ...servicesFound])];

        await db
          .update(communities)
          .set({ 
            amenities: uniqueAmenities,
            services: uniqueServices
          })
          .where(eq(communities.id, communityId));

        console.log(`✅ Extracted ${amenitiesFound.length} amenities and ${servicesFound.length} services for ${community.name}`);
      }

      return { amenitiesFound, servicesFound, success: true };
    } catch (error) {
      console.error('Error extracting amenities from reviews:', error);
      return { amenitiesFound: [], servicesFound: [], success: false };
    }
  }

  /**
   * Comprehensive data quality enhancement for a single community
   */
  async enhanceCommunityDataQuality(communityId: number): Promise<DataQualityReport> {
    const community = await db.select().from(communities).where(eq(communities.id, communityId)).then(r => r[0]);
    if (!community) {
      throw new Error(`Community ${communityId} not found`);
    }

    const report: DataQualityReport = {
      communityId,
      name: community.name,
      issues: [],
      improvements: [],
      before: {
        photoCount: community.photos?.length || 0,
        amenityCount: community.amenities?.length || 0,
        reviewCount: (community.yelpReviews?.length || 0) + 
                    (community.careComReviews?.length || 0) + 
                    (community.seniorAdvisorReviews?.length || 0) + 
                    (community.aplaceformomReviews?.length || 0)
      },
      after: {
        photoCount: 0,
        amenityCount: 0,
        reviewCount: 0
      }
    };

    // 1. Deduplicate photos
    if (community.photos && community.photos.length > 10) {
      report.issues.push(`${community.photos.length} photos (potential duplicates)`);
      const photoResult = await this.deduplicatePhotos(communityId);
      if (photoResult.duplicatesRemoved > 0) {
        report.improvements.push(`Removed ${photoResult.duplicatesRemoved} duplicate photos`);
      }
      report.after.photoCount = photoResult.after;
    } else {
      report.after.photoCount = community.photos?.length || 0;
    }

    // 2. Add authentic Google reviews if missing
    if (report.before.reviewCount === 0) {
      report.issues.push("No review data available");
      const reviewResult = await this.addAuthenticGoogleReviews(communityId);
      if (reviewResult.success) {
        report.improvements.push(`Added ${reviewResult.reviewsAdded} authentic Google reviews`);
        report.after.reviewCount = reviewResult.reviewsAdded;
      }
    } else {
      report.after.reviewCount = report.before.reviewCount;
    }

    // 3. Extract amenities from reviews if amenities are sparse
    if (report.before.amenityCount < 5) {
      report.issues.push(`Only ${report.before.amenityCount} amenities listed`);
      const amenityResult = await this.extractAmenitiesFromReviews(communityId);
      if (amenityResult.success && (amenityResult.amenitiesFound.length > 0 || amenityResult.servicesFound.length > 0)) {
        report.improvements.push(`Extracted ${amenityResult.amenitiesFound.length} amenities and ${amenityResult.servicesFound.length} services from reviews`);
      }
      
      // Get updated counts
      const updatedCommunity = await db.select().from(communities).where(eq(communities.id, communityId)).then(r => r[0]);
      report.after.amenityCount = updatedCommunity?.amenities?.length || 0;
    } else {
      report.after.amenityCount = report.before.amenityCount;
    }

    return report;
  }

  /**
   * Batch enhance data quality for multiple communities
   */
  async enhanceMultipleCommunities(communityIds: number[]): Promise<DataQualityReport[]> {
    const reports: DataQualityReport[] = [];
    
    for (const id of communityIds) {
      try {
        console.log(`🔍 Enhancing data quality for community ${id}...`);
        const report = await this.enhanceCommunityDataQuality(id);
        reports.push(report);
        
        // Add delay to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to enhance community ${id}:`, error);
        reports.push({
          communityId: id,
          name: 'Unknown',
          issues: ['Enhancement failed'],
          improvements: [],
          before: { photoCount: 0, amenityCount: 0, reviewCount: 0 },
          after: { photoCount: 0, amenityCount: 0, reviewCount: 0 }
        });
      }
    }

    return reports;
  }

  /**
   * Get summary of data quality issues across all communities
   */
  async getDataQualityOverview(): Promise<{
    totalCommunities: number;
    communitiesWithDuplicatePhotos: number;
    communitiesWithoutReviews: number;
    communitiesWithFewAmenities: number;
    averagePhotoCount: number;
    averageAmenityCount: number;
    averageReviewCount: number;
  }> {
    const allCommunities = await db.select().from(communities);
    
    const totalCommunities = allCommunities.length;
    const communitiesWithDuplicatePhotos = allCommunities.filter(c => 
      c.photos && c.photos.length > 10
    ).length;
    
    const communitiesWithoutReviews = allCommunities.filter(c => 
      (!c.yelpReviews || c.yelpReviews.length === 0) &&
      (!c.careComReviews || c.careComReviews.length === 0) &&
      (!c.seniorAdvisorReviews || c.seniorAdvisorReviews.length === 0) &&
      (!c.aplaceformomReviews || c.aplaceformomReviews.length === 0)
    ).length;
    
    const communitiesWithFewAmenities = allCommunities.filter(c => 
      !c.amenities || c.amenities.length < 5
    ).length;

    const averagePhotoCount = allCommunities.reduce((sum, c) => sum + (c.photos?.length || 0), 0) / totalCommunities;
    const averageAmenityCount = allCommunities.reduce((sum, c) => sum + (c.amenities?.length || 0), 0) / totalCommunities;
    const averageReviewCount = allCommunities.reduce((sum, c) => {
      const reviewCount = (c.yelpReviews?.length || 0) + 
                         (c.careComReviews?.length || 0) + 
                         (c.seniorAdvisorReviews?.length || 0) + 
                         (c.aplaceformomReviews?.length || 0);
      return sum + reviewCount;
    }, 0) / totalCommunities;

    return {
      totalCommunities,
      communitiesWithDuplicatePhotos,
      communitiesWithoutReviews,
      communitiesWithFewAmenities,
      averagePhotoCount: Math.round(averagePhotoCount * 10) / 10,
      averageAmenityCount: Math.round(averageAmenityCount * 10) / 10,
      averageReviewCount: Math.round(averageReviewCount * 10) / 10
    };
  }
}

export const dataQualityEnhancement = new DataQualityEnhancement();