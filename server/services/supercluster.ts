import Supercluster from 'supercluster';
import { storage } from '../storage';

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    website: string;
    priceRange: string;
    availability: string;
    rating: number;
    reviewCount: number;
    careTypes: string[];
    photos: string[];
    description: string;
  };
}

interface ClusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    // Community properties for individual markers
    id?: number;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    website?: string;
    priceRange?: string;
    availability?: string;
    rating?: number;
    reviewCount?: number;
    careTypes?: string[];
    photos?: string[];
    description?: string;
    // HUD data fields
    hudPropertyId?: string;
    rentPerMonth?: number;
  };
}

class SuperclusterService {
  private index: Supercluster | null = null; // SINGLE index for all zoom levels
  private isInitialized = false;
  private lastInitTime = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache
  private featuresCache: GeoJSONFeature[] | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize with enterprise-grade clustering configuration
    // Optimized for 35,000+ points across North America
    this.index = new Supercluster({
      radius: 120,        // Large radius for aggressive clustering at country level
      maxZoom: 16,        // Stop clustering at zoom 16 (street level)
      minZoom: 0,         // Start clustering from zoom 0
      minPoints: 2,       // Minimum 2 points to form a cluster
      extent: 512,        // Tile extent (standard)
      nodeSize: 64,       // KD-tree node size for performance
      generateId: true,   // Generate cluster IDs for tracking
    });
  }

  // Removed getClusterConfig and getOrCreateIndex methods - using single index now

  async initialize(): Promise<void> {
    const now = Date.now();
    
    // Skip if recently initialized
    if (this.isInitialized && (now - this.lastInitTime) < this.CACHE_DURATION) {
      return;
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    console.log('Initializing Supercluster with community data...');
    
    try {
      // Use cached features if available
      if (this.featuresCache && this.index) {
        this.index.load(this.featuresCache);
        this.isInitialized = true;
        this.lastInitTime = Date.now();
        console.log(`Supercluster initialized with ${this.featuresCache.length} cached communities`);
        return;
      }

      // Get all communities from database with optimized query
      const communities = await storage.getAllCommunitiesForClustering();
      
      // Convert communities to GeoJSON features
      const features: GeoJSONFeature[] = communities
        .filter(community => community.latitude && community.longitude)
        .map(community => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(community.longitude), parseFloat(community.latitude)]
          },
          properties: {
            id: community.id,
            name: community.name,
            address: community.address,
            city: community.city,
            state: community.state,
            zipCode: community.zipCode,
            phone: community.phone,
            website: community.website || '',
            priceRange: community.priceRange || 'Contact for pricing',
            availability: community.availability || 'Available',
            rating: community.rating || 0,
            reviewCount: community.reviewCount || 0,
            careTypes: community.careTypes || [],
            photos: community.photos || [],
            description: community.description || '',
            // HUD data fields for color-coding
            hudPropertyId: community.hudPropertyId || null,
            rentPerMonth: community.rentPerMonth || null
          }
        }));

      // Cache features for future use
      this.featuresCache = features;
      
      // Load features into the single index
      if (this.index) {
        this.index.load(features);
      }
      
      this.isInitialized = true;
      this.lastInitTime = Date.now();
      
      console.log(`Supercluster initialized with ${features.length} communities`);
    } catch (error) {
      console.error('Failed to initialize Supercluster:', error);
      this.initializationPromise = null;
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  async getClusters(bbox: [number, number, number, number], zoom: number): Promise<ClusterFeature[]> {
    // Ensure supercluster is initialized
    await this.initialize();

    if (!this.isInitialized || !this.index) {
      throw new Error('Supercluster not initialized');
    }

    try {
      const startTime = Date.now();
      const [west, south, east, north] = bbox;
      
      // Get clusters from the SINGLE index (SuperCluster handles zoom internally)
      const clusters = this.index.getClusters(bbox, zoom);
      const processingTime = Date.now() - startTime;
      
      // Log clustering behavior
      if (zoom >= 16) {
        console.log(`Street level (zoom ${zoom}): returned ${clusters.length} markers/clusters in ${processingTime}ms`);
      } else if (zoom >= 14) {
        console.log(`Neighborhood (zoom ${zoom}): returned ${clusters.length} markers/clusters in ${processingTime}ms`);
      } else if (zoom >= 12) {
        console.log(`City view (zoom ${zoom}): returned ${clusters.length} markers/clusters in ${processingTime}ms`);
      } else if (zoom >= 10) {
        console.log(`County view (zoom ${zoom}): returned ${clusters.length} markers/clusters in ${processingTime}ms`);
      } else if (zoom >= 8) {
        console.log(`State view (zoom ${zoom}): returned ${clusters.length} markers/clusters in ${processingTime}ms`);
      } else {
        console.log(`Country view (zoom ${zoom}): returned ${clusters.length} markers/clusters in ${processingTime}ms`);
      }
      
      console.log(`Bounds: [${west.toFixed(4)}, ${south.toFixed(4)}, ${east.toFixed(4)}, ${north.toFixed(4)}]`);
      
      // Convert to our ClusterFeature format
      const result: ClusterFeature[] = clusters.map(cluster => ({
        type: 'Feature',
        geometry: cluster.geometry,
        properties: cluster.properties.cluster ? {
          cluster: true,
          cluster_id: cluster.properties.cluster_id,
          point_count: cluster.properties.point_count,
          point_count_abbreviated: this.abbreviateNumber(cluster.properties.point_count || 0)
        } : {
          cluster: false,
          ...cluster.properties
        }
      }));

      return result;
    } catch (error) {
      console.error('Failed to get clusters:', error);
      throw error;
    }
  }

  async getClusterExpansionZoom(clusterId: number, currentZoom: number): Promise<number> {
    await this.initialize();
    
    try {
      // Get the appropriate index for current zoom level
      const index = this.getOrCreateIndex(currentZoom);
      
      // Get the base expansion zoom from supercluster
      const baseExpansionZoom = index.getClusterExpansionZoom(clusterId);
      
      // Get cluster children to analyze density
      const children = index.getChildren(clusterId);
      const childCount = children.length;
      
      // Intelligent expansion algorithm based on cluster characteristics
      let intelligentZoom = baseExpansionZoom;
      
      if (childCount > 1000) {
        // Very dense clusters: conservative expansion
        intelligentZoom = Math.min(baseExpansionZoom + 1, 12);
      } else if (childCount > 100) {
        // Dense clusters: moderate expansion
        intelligentZoom = Math.min(baseExpansionZoom + 2, 14);
      } else if (childCount > 20) {
        // Medium clusters: normal expansion
        intelligentZoom = Math.min(baseExpansionZoom + 2, 15);
      } else if (childCount > 5) {
        // Small clusters: aggressive expansion
        intelligentZoom = Math.min(baseExpansionZoom + 3, 17);
      } else {
        // Very small clusters: maximum expansion to show individuals
        intelligentZoom = Math.min(baseExpansionZoom + 4, 18);
      }
      
      console.log(`Intelligent expansion for cluster ${clusterId}: ${childCount} children, base: ${baseExpansionZoom}, intelligent: ${intelligentZoom}`);
      
      return intelligentZoom;
    } catch (error) {
      console.error('Error in intelligent expansion:', error);
      // Fallback to safe zoom
      return Math.min(currentZoom + 2, 16);
    }
  }

  /**
   * Get cluster children for expansion analysis
   */
  async getClusterChildren(clusterId: number, currentZoom: number): Promise<ClusterFeature[]> {
    await this.initialize();
    
    try {
      const index = this.getOrCreateIndex(currentZoom);
      const children = index.getChildren(clusterId);
      
      return children.map(child => ({
        type: 'Feature',
        geometry: child.geometry,
        properties: child.properties.cluster ? {
          cluster: true,
          cluster_id: child.properties.cluster_id,
          point_count: child.properties.point_count,
          point_count_abbreviated: this.abbreviateNumber(child.properties.point_count || 0)
        } : {
          cluster: false,
          ...child.properties
        }
      }));
    } catch (error) {
      console.error('Error getting cluster children:', error);
      return [];
    }
  }

  private abbreviateNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Force refresh the cluster index
  async refresh(): Promise<void> {
    this.isInitialized = false;
    this.lastInitTime = 0;
    this.featuresCache = null;
    this.initializationPromise = null;
    
    // Clear all indexes to free memory
    this.indexes.clear();
    this.lastAccessTime.clear();
    console.log('Cleared all supercluster indexes from memory');
    
    await this.initialize();
  }
}

export const superclusterService = new SuperclusterService();