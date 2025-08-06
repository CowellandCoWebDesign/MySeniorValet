import { db } from '../db';
import Supercluster from 'supercluster';

interface ClusterOptions {
  zoom: number;
  bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
  maxClusters?: number;
}

class SmartClusteringService {
  private supercluster: Supercluster | null = null;
  private points: any[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Load communities but keep them in memory for clustering
      const result = await db.execute(`
        SELECT id, name, city, state, latitude, longitude, 
               community_subtype, total_units
        FROM communities 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        LIMIT 35000
      `);

      this.points = result.rows.map((c: any) => ({
        type: 'Feature',
        properties: {
          id: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          type: c.community_subtype || 'Senior Living',
          units: c.total_units || 0
        },
        geometry: {
          type: 'Point',
          coordinates: [Number(c.longitude), Number(c.latitude)]
        }
      }));

      // Initialize Supercluster with appropriate settings
      this.supercluster = new Supercluster({
        radius: 60,  // Cluster radius in pixels
        maxZoom: 16,  // Max zoom to cluster points on
        minPoints: 2, // Minimum points to form a cluster
        extent: 512,  // Tile extent
        nodeSize: 64  // Size of the KD-tree leaf node
      });

      this.supercluster.load(this.points);
      this.initialized = true;
      
      console.log(`Smart clustering initialized with ${this.points.length} communities`);
    } catch (error) {
      console.error('Failed to initialize smart clustering:', error);
      throw error;
    }
  }

  async getClusteredData(options: ClusterOptions) {
    if (!this.initialized) {
      await this.initialize();
    }

    const { zoom, bounds, maxClusters = 50 } = options;

    // For country view (zoom < 5), return aggregated stats
    if (zoom < 5) {
      return this.getCountryAggregation();
    }

    // For state view (zoom 5-7), cluster by state
    if (zoom >= 5 && zoom < 8) {
      return this.getStateAggregation(bounds);
    }

    // For regional view (zoom 8-10), use smart clustering with limit
    if (zoom >= 8 && zoom < 11) {
      return this.getSmartClusters(bounds, zoom, maxClusters);
    }

    // For detailed view (zoom 11+), show individual communities
    return this.getDetailedCommunities(bounds, zoom);
  }

  private getCountryAggregation() {
    // Return just 50 major clusters across the US
    const clusters = this.supercluster!.getClusters(
      [-130, 24, -65, 50], // Continental US bounds
      4
    );

    // Limit to top 50 clusters by point count
    const sortedClusters = clusters
      .sort((a: any, b: any) => {
        const aCount = a.properties?.point_count || 1;
        const bCount = b.properties?.point_count || 1;
        return bCount - aCount;
      })
      .slice(0, 50);

    return {
      type: 'FeatureCollection',
      features: sortedClusters,
      totalCommunities: this.points.length,
      displayLevel: 'country',
      clusterCount: sortedClusters.length
    };
  }

  private async getStateAggregation(bounds: any) {
    // Get state-level aggregation
    const result = await db.execute(`
      SELECT state, COUNT(*) as count,
             AVG(latitude) as lat, AVG(longitude) as lng
      FROM communities
      WHERE latitude BETWEEN ${bounds.south} AND ${bounds.north}
      AND longitude BETWEEN ${bounds.west} AND ${bounds.east}
      AND latitude IS NOT NULL
      GROUP BY state
      HAVING COUNT(*) > 0
    `);

    const features = result.rows.map((row: any) => ({
      type: 'Feature',
      properties: {
        cluster: true,
        cluster_id: `state_${row.state}`,
        point_count: row.count,
        state: row.state
      },
      geometry: {
        type: 'Point',
        coordinates: [Number(row.lng), Number(row.lat)]
      }
    }));

    return {
      type: 'FeatureCollection',
      features,
      displayLevel: 'state',
      clusterCount: features.length
    };
  }

  private getSmartClusters(bounds: any, zoom: number, maxClusters: number) {
    const bbox: [number, number, number, number] = [
      bounds.west,
      bounds.south,
      bounds.east,
      bounds.north
    ];

    // Get clusters for current viewport
    let clusters = this.supercluster!.getClusters(bbox, zoom);

    // If too many clusters, increase clustering radius
    if (clusters.length > maxClusters) {
      // Sort by point count and take top clusters
      clusters = clusters
        .sort((a: any, b: any) => {
          const aCount = a.properties?.point_count || 1;
          const bCount = b.properties?.point_count || 1;
          return bCount - aCount;
        })
        .slice(0, maxClusters);
    }

    return {
      type: 'FeatureCollection',
      features: clusters,
      displayLevel: 'regional',
      clusterCount: clusters.length
    };
  }

  private getDetailedCommunities(bounds: any, zoom: number) {
    const bbox: [number, number, number, number] = [
      bounds.west,
      bounds.south,
      bounds.east,
      bounds.north
    ];

    // Get all points in viewport at high zoom
    const features = this.supercluster!.getClusters(bbox, zoom);

    // Limit to 500 communities max even at detailed view
    const limitedFeatures = features.slice(0, 500);

    return {
      type: 'FeatureCollection',
      features: limitedFeatures,
      displayLevel: 'detailed',
      clusterCount: limitedFeatures.length
    };
  }

  async getClusterExpansion(clusterId: number, clusterZoom: number) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get points that make up this cluster
      const leaves = this.supercluster!.getLeaves(clusterId, 100);
      
      return {
        type: 'FeatureCollection',
        features: leaves,
        expandedFrom: clusterId
      };
    } catch (error) {
      console.error('Failed to expand cluster:', error);
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
  }
}

export const smartClusteringService = new SmartClusteringService();