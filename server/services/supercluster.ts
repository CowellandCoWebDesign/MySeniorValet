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
  private indexes: Map<string, Supercluster> = new Map();
  private isInitialized = false;
  private lastInitTime = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour - longer cache for better performance
  private featuresCache: GeoJSONFeature[] | null = null;
  private initializationPromise: Promise<void> | null = null;
  private readonly MAX_INDEXES = 3; // Limit zoom indexes to prevent memory overload
  private lastAccessTime: Map<string, number> = new Map(); // Track last access time for cleanup

  constructor() {
    // We'll create indexes on demand based on zoom level
    // Set up periodic cleanup to free memory
    setInterval(() => this.cleanupOldIndexes(), 5 * 60 * 1000); // Clean up every 5 minutes
  }

  private getClusterConfig(zoom: number): Supercluster.Options {
    // Smart clustering based on zoom level
    
    if (zoom >= 14) {
      // Street/building level - NO clustering
      return {
        radius: 0,         // Zero radius = no clustering at all
        maxZoom: 20,       // Support ultra high zoom
        minZoom: 0,
        minPoints: 999999, // Impossibly high threshold
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    } else if (zoom >= 12) {
      // City level - minimal clustering only for very dense areas
      return {
        radius: 20,        // Small radius for minimal clustering
        maxZoom: 20,
        minZoom: 0,
        minPoints: 10,     // Only cluster if 10+ communities overlap
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    } else if (zoom >= 10) {
      // County level - light clustering
      return {
        radius: 40,        // Medium radius
        maxZoom: 20,
        minZoom: 0,
        minPoints: 5,      // Cluster 5+ communities
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    } else if (zoom >= 8) {
      // Multi-county/regional view - moderate clustering
      return {
        radius: 60,        // Larger radius for regional grouping
        maxZoom: 20,
        minZoom: 0,
        minPoints: 3,      // Cluster any 3+ communities
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    } else if (zoom >= 6) {
      // State view - heavy clustering
      return {
        radius: 80,        // Large radius for state-level view
        maxZoom: 20,
        minZoom: 0,
        minPoints: 2,      // Cluster any 2+ communities
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    } else if (zoom >= 4) {
      // Multi-state view - aggressive clustering
      return {
        radius: 100,       // Very large radius
        maxZoom: 20,
        minZoom: 0,
        minPoints: 2,      // Cluster any 2+ communities
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    } else {
      // Country/world view - maximum clustering
      return {
        radius: 120,       // Maximum radius for country-level view
        maxZoom: 20,
        minZoom: 0,
        minPoints: 2,      // Cluster any 2+ communities
        generateId: true,
        extent: 512,
        nodeSize: 64,
      };
    }
  }

  private getOrCreateIndex(zoom: number): Supercluster {
    const zoomKey = `zoom_${zoom}`;
    
    if (!this.indexes.has(zoomKey)) {
      // Check if we need to clean up before creating new index
      if (this.indexes.size >= this.MAX_INDEXES) {
        this.cleanupOldIndexes();
      }
      
      const config = this.getClusterConfig(zoom);
      const index = new Supercluster(config);
      
      // Load features if we have them cached
      if (this.featuresCache) {
        index.load(this.featuresCache);
      }
      
      this.indexes.set(zoomKey, index);
      this.lastAccessTime.set(zoomKey, Date.now());
      
      console.log(`Created new ${zoomKey} index with radius=${config.radius}, maxZoom=${config.maxZoom}`);
      console.log(`Total indexes in memory: ${this.indexes.size}`);
    } else {
      // Update last access time
      this.lastAccessTime.set(zoomKey, Date.now());
    }
    
    return this.indexes.get(zoomKey)!;
  }
  
  private cleanupOldIndexes(): void {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    
    // Find least recently used indexes
    const sortedIndexes = Array.from(this.lastAccessTime.entries())
      .sort((a, b) => a[1] - b[1]);
    
    // Remove oldest indexes
    while (this.indexes.size > this.MAX_INDEXES - 1 && sortedIndexes.length > 0) {
      const [oldestKey, lastAccess] = sortedIndexes.shift()!;
      this.indexes.delete(oldestKey);
      this.lastAccessTime.delete(oldestKey);
      console.log(`Cleaned up old index: ${oldestKey} (last accessed ${Math.round((now - lastAccess) / 1000)}s ago)`);
    }
  }

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
      if (this.featuresCache) {
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
      
      // Clear existing indexes to reload with new data
      this.indexes.clear();
      
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

    if (!this.isInitialized) {
      throw new Error('Supercluster not initialized');
    }

    try {
      const startTime = Date.now();
      const [west, south, east, north] = bbox;
      
      // Get the appropriate index for this zoom level
      const index = this.getOrCreateIndex(zoom);
      
      // Get clusters from the zoom-specific index
      const clusters = index.getClusters(bbox, zoom);
      const processingTime = Date.now() - startTime;
      
      // Log clustering behavior with updated configuration
      const config = this.getClusterConfig(zoom);
      if (zoom >= 14) {
        console.log(`Street level (zoom ${zoom}): NO clustering (radius ${config.radius}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
      } else if (zoom >= 12) {
        console.log(`City view (zoom ${zoom}): MINIMAL clustering (radius ${config.radius}, minPoints ${config.minPoints}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
      } else if (zoom >= 10) {
        console.log(`County view (zoom ${zoom}): LIGHT clustering (radius ${config.radius}, minPoints ${config.minPoints}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
      } else if (zoom >= 8) {
        console.log(`Regional view (zoom ${zoom}): MODERATE clustering (radius ${config.radius}, minPoints ${config.minPoints}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
      } else if (zoom >= 6) {
        console.log(`State view (zoom ${zoom}): HEAVY clustering (radius ${config.radius}, minPoints ${config.minPoints}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
      } else if (zoom >= 4) {
        console.log(`Multi-state view (zoom ${zoom}): AGGRESSIVE clustering (radius ${config.radius}, minPoints ${config.minPoints}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
      } else {
        console.log(`Country view (zoom ${zoom}): MAXIMUM clustering (radius ${config.radius}, minPoints ${config.minPoints}) - returned ${clusters.length} clusters/points in ${processingTime}ms`);
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