import { db } from "./db";
import { communities } from "@shared/schema";
import { sql, and, gte, lte, isNotNull } from "drizzle-orm";
import type { AvailabilityHeatmapData, HeatmapRegion } from "@shared/schema";

export class AvailabilityHeatmapService {
  private cache = new Map<string, { data: AvailabilityHeatmapData[], timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate heatmap data for a given geographic region
   */
  async generateHeatmapData(
    bounds: { north: number; south: number; east: number; west: number },
    zoomLevel: number
  ): Promise<HeatmapRegion> {
    const cacheKey = `${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}_${zoomLevel}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { bounds, data: cached.data, zoomLevel };
    }

    try {
      // Calculate grid size based on zoom level
      const gridSize = this.calculateGridSize(zoomLevel);
      const heatmapData = await this.aggregateAvailabilityData(bounds, gridSize);
      
      // Cache the results
      this.cache.set(cacheKey, { data: heatmapData, timestamp: Date.now() });
      
      return { bounds, data: heatmapData, zoomLevel };
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      return { bounds, data: [], zoomLevel };
    }
  }

  /**
   * Calculate grid size based on zoom level for clustering
   */
  private calculateGridSize(zoomLevel: number): number {
    // Smaller grid = more granular data at higher zoom levels
    if (zoomLevel >= 12) return 0.01; // ~1km
    if (zoomLevel >= 10) return 0.05; // ~5km
    if (zoomLevel >= 8) return 0.1;   // ~10km
    if (zoomLevel >= 6) return 0.25;  // ~25km
    return 0.5; // ~50km for low zoom levels
  }

  /**
   * Aggregate availability data into grid cells
   */
  private async aggregateAvailabilityData(
    bounds: { north: number; south: number; east: number; west: number },
    gridSize: number
  ): Promise<AvailabilityHeatmapData[]> {
    try {
      // Fetch ALL communities within bounds in a SINGLE query
      const allCommunities = await db
        .select({
          id: communities.id,
          latitude: communities.latitude,
          longitude: communities.longitude,
          availabilityStatus: communities.availabilityStatus,
          availableUnits: communities.availableUnits,
          totalUnits: communities.totalUnits,
          subscriptionTier: communities.subscriptionTier,
          isVerified: communities.isVerified,
          city: communities.city,
          state: communities.state
        })
        .from(communities)
        .where(
          and(
            isNotNull(communities.latitude),
            isNotNull(communities.longitude),
            sql`${communities.latitude}::numeric >= ${bounds.south}`,
            sql`${communities.latitude}::numeric <= ${bounds.north}`,
            sql`${communities.longitude}::numeric >= ${bounds.west}`,
            sql`${communities.longitude}::numeric <= ${bounds.east}`
          )
        )
        .limit(1000); // Limit for performance

      // Group communities into grid cells
      const gridMap = new Map<string, any[]>();
      
      for (const community of allCommunities) {
        if (!community.latitude || !community.longitude) continue;
        
        // Calculate which grid cell this community belongs to
        const lat = Number(community.latitude);
        const lng = Number(community.longitude);
        const gridLat = Math.floor(lat / gridSize) * gridSize;
        const gridLng = Math.floor(lng / gridSize) * gridSize;
        const gridKey = `${gridLat}_${gridLng}`;
        
        if (!gridMap.has(gridKey)) {
          gridMap.set(gridKey, []);
        }
        gridMap.get(gridKey)!.push(community);
      }
      
      // Process each grid cell
      const heatmapData: AvailabilityHeatmapData[] = [];
      
      for (const [gridKey, cellCommunities] of gridMap.entries()) {
        const [latStr, lngStr] = gridKey.split('_');
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        
        // Calculate availability scores for this cell
        const availabilityScores = cellCommunities.map(community => 
          this.calculateCommunityAvailabilityScore(community)
        );
        
        const averageAvailability = availabilityScores.reduce((sum, score) => sum + score, 0) / availabilityScores.length;
        const densityMultiplier = Math.min(cellCommunities.length / 10, 1);
        const availabilityScore = Math.round(averageAvailability * densityMultiplier);
        
        // Get region name from first community in cell
        const regionName = cellCommunities[0].city && cellCommunities[0].state 
          ? `${cellCommunities[0].city}, ${cellCommunities[0].state}`
          : `Grid_${lat.toFixed(3)}_${lng.toFixed(3)}`;
        
        heatmapData.push({
          latitude: lat + gridSize / 2,
          longitude: lng + gridSize / 2,
          availabilityScore,
          communityCount: cellCommunities.length,
          averageAvailability: Math.round(averageAvailability),
          regionName,
          lastUpdated: new Date().toISOString()
        });
      }
      
      return heatmapData;
    } catch (error) {
      console.error('Error aggregating availability data:', error);
      return [];
    }
  }

  /**
   * Calculate availability score for a specific cell
   */
  private async calculateCellAvailability(
    cellBounds: { north: number; south: number; east: number; west: number }
  ): Promise<{
    availabilityScore: number;
    communityCount: number;
    averageAvailability: number;
  }> {
    try {
      // Query communities within the cell bounds
      const cellCommunities = await db
        .select({
          id: communities.id,
          latitude: communities.latitude,
          longitude: communities.longitude,
          availabilityStatus: communities.availabilityStatus,
          availableUnits: communities.availableUnits,
          totalUnits: communities.totalUnits,
          subscriptionTier: communities.subscriptionTier,
          isVerified: communities.isVerified
        })
        .from(communities)
        .where(
          and(
            isNotNull(communities.latitude),
            isNotNull(communities.longitude),
            sql`${communities.latitude}::numeric >= ${cellBounds.south}`,
            sql`${communities.latitude}::numeric <= ${cellBounds.north}`,
            sql`${communities.longitude}::numeric >= ${cellBounds.west}`,
            sql`${communities.longitude}::numeric <= ${cellBounds.east}`
          )
        );

      if (cellCommunities.length === 0) {
        return { availabilityScore: 0, communityCount: 0, averageAvailability: 0 };
      }

      // Calculate availability scores for each community
      const availabilityScores = cellCommunities.map(community => 
        this.calculateCommunityAvailabilityScore(community)
      );

      const averageAvailability = availabilityScores.reduce((sum, score) => sum + score, 0) / availabilityScores.length;
      
      // Convert to 0-100 scale and apply community density weighting
      const densityMultiplier = Math.min(cellCommunities.length / 10, 1); // Cap at 10 communities
      const availabilityScore = Math.round(averageAvailability * densityMultiplier);

      return {
        availabilityScore,
        communityCount: cellCommunities.length,
        averageAvailability: Math.round(averageAvailability)
      };
    } catch (error) {
      console.error('Error calculating cell availability:', error);
      return { availabilityScore: 0, communityCount: 0, averageAvailability: 0 };
    }
  }

  /**
   * Calculate availability score for a single community
   */
  private calculateCommunityAvailabilityScore(community: {
    availabilityStatus: string | null;
    availableUnits: number | null;
    totalUnits: number | null;
    subscriptionTier: string | null;
    isVerified: boolean | null;
  }): number {
    let score = 0;

    // Base score from availability status
    switch (community.availabilityStatus) {
      case 'Available':
        score = 100;
        break;
      case 'Waitlist':
        score = 50;
        break;
      case 'Full':
        score = 25;
        break;
      case 'Unknown':
      default:
        score = 20; // Unknown status
    }

    // Adjust based on unit availability ratio
    if (community.availableUnits && community.totalUnits && community.totalUnits > 0) {
      const availabilityRatio = community.availableUnits / community.totalUnits;
      score = score * (0.3 + 0.7 * availabilityRatio); // Weight actual units heavily
    }

    // Boost score for verified communities
    if (community.isVerified) {
      score *= 1.1;
    }

    // Boost score for paid tier communities (more reliable data)
    if (community.subscriptionTier && community.subscriptionTier !== 'free') {
      score *= 1.2;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get real-time availability trends for admin dashboard
   */
  async getAvailabilityTrends(): Promise<{
    totalCommunities: number;
    availableNow: number;
    limitedAvailability: number;
    waitlistOnly: number;
    noAvailability: number;
    lastUpdated: string;
  }> {
    try {
      const trends = await db
        .select({
          availabilityStatus: communities.availabilityStatus,
          count: sql<number>`count(*)`
        })
        .from(communities)
        .where(isNotNull(communities.latitude))
        .groupBy(communities.availabilityStatus);

      const result = {
        totalCommunities: 0,
        availableNow: 0,
        limitedAvailability: 0,
        waitlistOnly: 0,
        noAvailability: 0,
        lastUpdated: new Date().toISOString()
      };

      for (const trend of trends) {
        const count = Number(trend.count);
        result.totalCommunities += count;

        switch (trend.availabilityStatus) {
          case 'Available':
            result.availableNow = count;
            break;
          case 'Limited':
            result.limitedAvailability = count;
            break;
          case 'Waitlist':
            result.waitlistOnly = count;
            break;
          case 'Full':
          case 'Unknown':
          case null:
            result.noAvailability += count;
            break;
        }
      }

      return result;
    } catch (error) {
      console.error('Error getting availability trends:', error);
      return {
        totalCommunities: 0,
        availableNow: 0,
        limitedAvailability: 0,
        waitlistOnly: 0,
        noAvailability: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Clear cache for fresh data
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const availabilityHeatmapService = new AvailabilityHeatmapService();