/**
 * Geocoding Service - Add missing coordinates to communities
 * Placeholder service - Google API removed to prevent charges
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import { apiCostProtection } from "./api-cost-protection";

interface GeocodeResult {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  success: boolean;
  error?: string;
}

interface GeocodeStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  results: GeocodeResult[];
}

export class GeocodingService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get coordinates for a single address using Google Places API
   */
  private async geocodeAddress(address: string, city: string, state: string, zipCode?: string): Promise<{ lat: number; lng: number } | null> {
    try {
      if (!process.env.GOOGLE_PLACES_API_KEY) {
        throw new Error('Google Places API key not configured');
      }

      // Build full address
      const fullAddress = `${address}, ${city}, ${state}${zipCode ? ` ${zipCode}` : ''}`;
      const encodedAddress = encodeURIComponent(fullAddress);

      // Use Google Geocoding API (simpler than Places API for this use case)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      }

      console.warn(`Geocoding failed for ${fullAddress}: ${data.status}`);
      return null;
    } catch (error) {
      console.error(`Error geocoding address ${address}:`, error);
      return null;
    }
  }

  /**
   * Find all communities missing coordinates
   */
  async findCommunitiesWithoutCoordinates(): Promise<Array<{
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string | null;
  }>> {
    return await db
      .select({
        id: communities.id,
        name: communities.name,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        zipCode: communities.zipCode,
      })
      .from(communities)
      .where(
        or(
          isNull(communities.latitude),
          isNull(communities.longitude)
        )
      );
  }

  /**
   * Geocode a single community and update its coordinates
   */
  async geocodeCommunity(communityId: number): Promise<GeocodeResult> {
    try {
      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        return {
          id: communityId,
          name: 'Unknown',
          address: 'Unknown',
          latitude: 0,
          longitude: 0,
          success: false,
          error: 'Community not found'
        };
      }

      // Check API cost protection
      const costCheck = await apiCostProtection.checkBeforeOperation(1, 0.005); // ~$0.005 per geocoding request
      if (!costCheck.allowed) {
        return {
          id: communityId,
          name: community.name,
          address: community.address,
          latitude: 0,
          longitude: 0,
          success: false,
          error: `API cost protection: ${costCheck.reason}`
        };
      }

      // Geocode the address
      const coordinates = await this.geocodeAddress(
        community.address,
        community.city,
        community.state,
        community.zipCode
      );

      if (coordinates) {
        // Update database with coordinates
        await db
          .update(communities)
          .set({
            latitude: coordinates.lat.toFixed(8),
            longitude: coordinates.lng.toFixed(8),
          })
          .where(eq(communities.id, communityId));

        // Record API usage
        await apiCostProtection.recordUsage(1, 0.005, `Geocode: ${community.name}`);

        return {
          id: communityId,
          name: community.name,
          address: community.address,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          success: true
        };
      } else {
        return {
          id: communityId,
          name: community.name,
          address: community.address,
          latitude: 0,
          longitude: 0,
          success: false,
          error: 'Geocoding failed'
        };
      }
    } catch (error) {
      console.error(`Error geocoding community ${communityId}:`, error);
      return {
        id: communityId,
        name: 'Unknown',
        address: 'Unknown',
        latitude: 0,
        longitude: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Geocode all communities missing coordinates
   */
  async geocodeAllMissingCoordinates(): Promise<GeocodeStats> {
    const missingCommunities = await this.findCommunitiesWithoutCoordinates();
    
    const stats: GeocodeStats = {
      total: missingCommunities.length,
      processed: 0,
      successful: 0,
      failed: 0,
      results: []
    };

    console.log(`Found ${missingCommunities.length} communities missing coordinates`);

    if (missingCommunities.length === 0) {
      return stats;
    }

    // Check if we have enough API budget
    const estimatedCost = missingCommunities.length * 0.005;
    const costCheck = await apiCostProtection.checkBeforeOperation(missingCommunities.length, estimatedCost);
    
    if (!costCheck.allowed) {
      console.error(`Cannot geocode communities: ${costCheck.reason}`);
      return stats;
    }

    // Process communities one by one with delays
    for (const community of missingCommunities) {
      console.log(`Geocoding ${community.name} (${community.address}, ${community.city})`);
      
      const result = await this.geocodeCommunity(community.id);
      stats.results.push(result);
      stats.processed++;

      if (result.success) {
        stats.successful++;
        console.log(`✓ Geocoded ${community.name}: ${result.latitude}, ${result.longitude}`);
      } else {
        stats.failed++;
        console.log(`✗ Failed to geocode ${community.name}: ${result.error}`);
      }

      // Add delay between requests to respect rate limits
      if (stats.processed < missingCommunities.length) {
        await this.delay(1000); // 1 second delay
      }
    }

    return stats;
  }

  /**
   * Geocode communities by city (useful for targeted fixes)
   */
  async geocodeByCity(city: string, state: string = 'CA'): Promise<GeocodeStats> {
    const missingCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        zipCode: communities.zipCode,
      })
      .from(communities)
      .where(
        and(
          eq(communities.city, city),
          eq(communities.state, state),
          or(
            isNull(communities.latitude),
            isNull(communities.longitude)
          )
        )
      );

    const stats: GeocodeStats = {
      total: missingCommunities.length,
      processed: 0,
      successful: 0,
      failed: 0,
      results: []
    };

    console.log(`Found ${missingCommunities.length} communities in ${city}, ${state} missing coordinates`);

    for (const community of missingCommunities) {
      const result = await this.geocodeCommunity(community.id);
      stats.results.push(result);
      stats.processed++;

      if (result.success) {
        stats.successful++;
      } else {
        stats.failed++;
      }

      // Add delay between requests
      if (stats.processed < missingCommunities.length) {
        await this.delay(1000);
      }
    }

    return stats;
  }

  /**
   * Get geocoding statistics
   */
  async getGeocodingStats(): Promise<{
    totalCommunities: number;
    withCoordinates: number;
    missingCoordinates: number;
    percentageComplete: number;
  }> {
    const totalResult = await db
      .select({ count: communities.id })
      .from(communities);

    const withCoordinatesResult = await db
      .select({ count: communities.id })
      .from(communities)
      .where(
        and(
          isNull(communities.latitude),
          isNull(communities.longitude)
        )
      );

    const total = totalResult.length;
    const missing = withCoordinatesResult.length;
    const withCoordinates = total - missing;

    return {
      totalCommunities: total,
      withCoordinates,
      missingCoordinates: missing,
      percentageComplete: total > 0 ? Math.round((withCoordinates / total) * 100) : 0
    };
  }
}

export const geocodingService = new GeocodingService();