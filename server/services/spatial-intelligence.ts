/**
 * Advanced Spatial Intelligence Service
 * Implements Kepler.gl-inspired spatial processing algorithms
 * for efficient backend geospatial analysis
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface HexBin {
  id: string;
  center: [number, number];
  count: number;
  communities: any[];
}

interface SpatialCluster {
  id: string;
  center: [number, number];
  radius: number;
  count: number;
  density: number;
  properties: Record<string, any>;
}

export class SpatialIntelligenceService {
  private static instance: SpatialIntelligenceService;
  private hexagonalGrid: Map<string, HexBin> = new Map();
  private spatialIndex: Map<string, any[]> = new Map();

  private constructor() {
    this.initializeSpatialIndex();
  }

  static getInstance(): SpatialIntelligenceService {
    if (!SpatialIntelligenceService.instance) {
      SpatialIntelligenceService.instance = new SpatialIntelligenceService();
    }
    return SpatialIntelligenceService.instance;
  }

  /**
   * Initialize spatial index for fast lookups
   */
  private async initializeSpatialIndex() {
    try {
      const communities = await db.execute(sql`
        SELECT id, name, latitude, longitude, community_subtype, city, state
        FROM communities
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      `);

      // Create grid-based spatial index
      for (const community of communities.rows) {
        const gridKey = this.getGridKey(
          Number(community.latitude),
          Number(community.longitude)
        );
        
        if (!this.spatialIndex.has(gridKey)) {
          this.spatialIndex.set(gridKey, []);
        }
        
        this.spatialIndex.get(gridKey)?.push(community);
      }

      console.log(`Spatial index initialized with ${this.spatialIndex.size} grid cells`);
    } catch (error) {
      console.error('Failed to initialize spatial index:', error);
    }
  }

  /**
   * Get communities within viewport using spatial indexing
   */
  async getCommunitiesInViewport(bounds: BoundingBox, zoom: number) {
    const gridKeys = this.getGridKeysInBounds(bounds);
    const communities: any[] = [];
    
    for (const key of gridKeys) {
      const items = this.spatialIndex.get(key) || [];
      communities.push(...items.filter(c => 
        Number(c.latitude) >= bounds.minLat &&
        Number(c.latitude) <= bounds.maxLat &&
        Number(c.longitude) >= bounds.minLng &&
        Number(c.longitude) <= bounds.maxLng
      ));
    }

    // Apply dynamic clustering based on zoom level
    if (zoom < 8) {
      return this.createHexagonalBins(communities, zoom);
    } else if (zoom < 12) {
      return this.createAdaptiveClusters(communities, zoom);
    }
    
    return communities;
  }

  /**
   * Create hexagonal bins for data aggregation (Kepler.gl style)
   */
  private createHexagonalBins(communities: any[], zoom: number): HexBin[] {
    const hexSize = this.getHexSizeForZoom(zoom);
    const hexBins = new Map<string, HexBin>();

    for (const community of communities) {
      const hexId = this.getHexId(
        Number(community.latitude),
        Number(community.longitude),
        hexSize
      );

      if (!hexBins.has(hexId)) {
        const center = this.getHexCenter(hexId, hexSize);
        hexBins.set(hexId, {
          id: hexId,
          center,
          count: 0,
          communities: []
        });
      }

      const bin = hexBins.get(hexId)!;
      bin.count++;
      bin.communities.push(community);
    }

    return Array.from(hexBins.values());
  }

  /**
   * Create adaptive clusters based on density
   */
  private createAdaptiveClusters(communities: any[], zoom: number): SpatialCluster[] {
    const clusters: SpatialCluster[] = [];
    const processed = new Set<number>();
    const radius = this.getClusterRadiusForZoom(zoom);

    for (const community of communities) {
      if (processed.has(community.id)) continue;

      const nearbyPoints = this.findNearbyPoints(
        community,
        communities,
        radius
      );

      if (nearbyPoints.length > 1) {
        const cluster = this.createClusterFromPoints(nearbyPoints);
        clusters.push(cluster);
        nearbyPoints.forEach(p => processed.add(p.id));
      } else {
        // Single point becomes its own cluster
        clusters.push({
          id: `single-${community.id}`,
          center: [Number(community.longitude), Number(community.latitude)],
          radius: 0,
          count: 1,
          density: 1,
          properties: community
        });
        processed.add(community.id);
      }
    }

    return clusters;
  }

  /**
   * Perform spatial aggregation for analytics
   */
  async performSpatialAggregation(
    bounds: BoundingBox,
    aggregationType: 'count' | 'density' | 'heatmap'
  ) {
    const communities = await this.getCommunitiesInViewport(bounds, 10);
    
    switch (aggregationType) {
      case 'count':
        return this.aggregateByCount(communities);
      case 'density':
        return this.calculateDensityMap(communities, bounds);
      case 'heatmap':
        return this.generateHeatmapData(communities, bounds);
      default:
        return communities;
    }
  }

  /**
   * Calculate spatial statistics for an area
   */
  async calculateSpatialStatistics(center: [number, number], radius: number) {
    const bounds = this.getBoundsFromCenterRadius(center, radius);
    const communities = await this.getCommunitiesInViewport(bounds, 12);
    
    // Calculate various spatial metrics
    const statistics = {
      totalCommunities: communities.length,
      density: communities.length / (Math.PI * radius * radius),
      spatialDistribution: this.calculateSpatialDistribution(communities),
      clusters: this.identifyClusterCenters(communities),
      accessibility: this.calculateAccessibilityScore(communities, center),
      diversityIndex: this.calculateDiversityIndex(communities)
    };

    return statistics;
  }

  /**
   * Find optimal locations using multi-criteria spatial analysis
   */
  async findOptimalLocations(criteria: {
    targetDensity?: number;
    communityTypes?: string[];
    maxDistance?: number;
  }) {
    const gridCells = Array.from(this.spatialIndex.entries());
    const scores = new Map<string, number>();

    for (const [gridKey, communities] of gridCells) {
      let score = 0;

      // Density scoring
      if (criteria.targetDensity) {
        const density = communities.length;
        score += 1 / (1 + Math.abs(density - criteria.targetDensity));
      }

      // Type diversity scoring
      if (criteria.communityTypes) {
        const typeCount = new Set(
          communities
            .map(c => c.community_subtype)
            .filter(t => criteria.communityTypes?.includes(t))
        ).size;
        score += typeCount / criteria.communityTypes.length;
      }

      scores.set(gridKey, score);
    }

    // Return top scoring locations
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, score]) => ({
        gridKey: key,
        score,
        center: this.getGridCenter(key),
        communities: this.spatialIndex.get(key)
      }));
  }

  /**
   * Perform viewshed analysis (what's visible from a point)
   */
  async performViewshedAnalysis(
    viewpoint: [number, number],
    maxDistance: number
  ) {
    const visibleCommunities = [];
    const bounds = this.getBoundsFromCenterRadius(viewpoint, maxDistance);
    const candidates = await this.getCommunitiesInViewport(bounds, 15);

    for (const community of candidates) {
      const distance = this.calculateDistance(
        viewpoint,
        [Number(community.longitude), Number(community.latitude)]
      );

      if (distance <= maxDistance) {
        visibleCommunities.push({
          ...community,
          distance,
          bearing: this.calculateBearing(
            viewpoint,
            [Number(community.longitude), Number(community.latitude)]
          )
        });
      }
    }

    return visibleCommunities.sort((a, b) => a.distance - b.distance);
  }

  // Helper methods
  private getGridKey(lat: number, lng: number, precision: number = 2): string {
    const gridLat = Math.floor(lat * Math.pow(10, precision)) / Math.pow(10, precision);
    const gridLng = Math.floor(lng * Math.pow(10, precision)) / Math.pow(10, precision);
    return `${gridLat},${gridLng}`;
  }

  private getGridKeysInBounds(bounds: BoundingBox): string[] {
    const keys: string[] = [];
    const step = 0.01; // Grid cell size

    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += step) {
      for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += step) {
        keys.push(this.getGridKey(lat, lng));
      }
    }

    return keys;
  }

  private getHexSizeForZoom(zoom: number): number {
    // Larger hexagons for lower zoom levels
    return Math.max(0.5, 10 / Math.pow(2, zoom));
  }

  private getHexId(lat: number, lng: number, size: number): string {
    const q = (2/3 * lng) / size;
    const r = (-1/3 * lng + Math.sqrt(3)/3 * lat) / size;
    return `${Math.round(q)},${Math.round(r)}`;
  }

  private getHexCenter(hexId: string, size: number): [number, number] {
    const [q, r] = hexId.split(',').map(Number);
    const lng = size * 3/2 * q;
    const lat = size * (Math.sqrt(3) * r + Math.sqrt(3)/2 * q);
    return [lng, lat];
  }

  private getClusterRadiusForZoom(zoom: number): number {
    return 50 / Math.pow(2, zoom);
  }

  private findNearbyPoints(center: any, points: any[], radius: number): any[] {
    return points.filter(point => {
      const distance = this.calculateDistance(
        [Number(center.longitude), Number(center.latitude)],
        [Number(point.longitude), Number(point.latitude)]
      );
      return distance <= radius;
    });
  }

  private createClusterFromPoints(points: any[]): SpatialCluster {
    const centerLng = points.reduce((sum, p) => sum + Number(p.longitude), 0) / points.length;
    const centerLat = points.reduce((sum, p) => sum + Number(p.latitude), 0) / points.length;
    
    const maxDistance = Math.max(...points.map(p => 
      this.calculateDistance(
        [centerLng, centerLat],
        [Number(p.longitude), Number(p.latitude)]
      )
    ));

    return {
      id: `cluster-${centerLat.toFixed(4)}-${centerLng.toFixed(4)}`,
      center: [centerLng, centerLat],
      radius: maxDistance,
      count: points.length,
      density: points.length / (Math.PI * maxDistance * maxDistance),
      properties: {
        types: [...new Set(points.map(p => p.community_subtype))],
        cities: [...new Set(points.map(p => p.city))].slice(0, 3)
      }
    };
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2[1] - point1[1]);
    const dLon = this.toRad(point2[0] - point1[0]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(point1[1])) * Math.cos(this.toRad(point2[1])) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateBearing(point1: [number, number], point2: [number, number]): number {
    const dLon = this.toRad(point2[0] - point1[0]);
    const y = Math.sin(dLon) * Math.cos(this.toRad(point2[1]));
    const x = Math.cos(this.toRad(point1[1])) * Math.sin(this.toRad(point2[1])) -
              Math.sin(this.toRad(point1[1])) * Math.cos(this.toRad(point2[1])) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return (this.toDeg(bearing) + 360) % 360;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private toDeg(rad: number): number {
    return rad * (180 / Math.PI);
  }

  private getBoundsFromCenterRadius(
    center: [number, number],
    radiusKm: number
  ): BoundingBox {
    const latDelta = radiusKm / 111; // Rough conversion
    const lngDelta = radiusKm / (111 * Math.cos(this.toRad(center[1])));
    
    return {
      minLat: center[1] - latDelta,
      maxLat: center[1] + latDelta,
      minLng: center[0] - lngDelta,
      maxLng: center[0] + lngDelta
    };
  }

  private getGridCenter(gridKey: string): [number, number] {
    const [lat, lng] = gridKey.split(',').map(Number);
    return [lng + 0.005, lat + 0.005]; // Center of grid cell
  }

  private aggregateByCount(data: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of data) {
      const type = item.community_subtype || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }

  private calculateDensityMap(data: any[], bounds: BoundingBox) {
    const gridSize = 0.1;
    const densityMap: any[] = [];
    
    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += gridSize) {
      for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += gridSize) {
        const count = data.filter(d => 
          Number(d.latitude) >= lat &&
          Number(d.latitude) < lat + gridSize &&
          Number(d.longitude) >= lng &&
          Number(d.longitude) < lng + gridSize
        ).length;
        
        if (count > 0) {
          densityMap.push({
            center: [lng + gridSize/2, lat + gridSize/2],
            value: count,
            density: count / (gridSize * gridSize)
          });
        }
      }
    }
    
    return densityMap;
  }

  private generateHeatmapData(data: any[], bounds: BoundingBox) {
    return data.map(d => ({
      lat: Number(d.latitude),
      lng: Number(d.longitude),
      weight: 1
    }));
  }

  private calculateSpatialDistribution(data: any[]) {
    if (data.length === 0) return { type: 'empty' };
    
    const centerLng = data.reduce((sum, d) => sum + Number(d.longitude), 0) / data.length;
    const centerLat = data.reduce((sum, d) => sum + Number(d.latitude), 0) / data.length;
    
    const distances = data.map(d => 
      this.calculateDistance(
        [centerLng, centerLat],
        [Number(d.longitude), Number(d.latitude)]
      )
    );
    
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
    
    return {
      type: variance < 10 ? 'clustered' : variance < 50 ? 'random' : 'dispersed',
      center: [centerLng, centerLat],
      averageDistance: avgDistance,
      variance
    };
  }

  private identifyClusterCenters(data: any[]) {
    // Simple density-based clustering
    const clusters: any[] = [];
    const visited = new Set();
    
    for (const point of data) {
      if (visited.has(point.id)) continue;
      
      const neighbors = this.findNearbyPoints(point, data, 5);
      if (neighbors.length >= 3) {
        clusters.push(this.createClusterFromPoints(neighbors));
        neighbors.forEach(n => visited.add(n.id));
      }
    }
    
    return clusters;
  }

  private calculateAccessibilityScore(data: any[], center: [number, number]): number {
    if (data.length === 0) return 0;
    
    const distances = data.map(d => 
      this.calculateDistance(
        center,
        [Number(d.longitude), Number(d.latitude)]
      )
    );
    
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    
    // Score based on average distance (closer is better)
    return Math.max(0, 100 - avgDistance * 2);
  }

  private calculateDiversityIndex(data: any[]): number {
    const types = data.map(d => d.community_subtype).filter(Boolean);
    const typeCounts = new Map<string, number>();
    
    for (const type of types) {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }
    
    if (typeCounts.size <= 1) return 0;
    
    // Shannon diversity index
    let diversity = 0;
    const total = types.length;
    
    for (const count of typeCounts.values()) {
      const proportion = count / total;
      diversity -= proportion * Math.log(proportion);
    }
    
    return diversity;
  }
}

// Export singleton instance
export const spatialIntelligence = SpatialIntelligenceService.getInstance();