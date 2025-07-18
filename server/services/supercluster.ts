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
  };
}

class SuperclusterService {
  private index: Supercluster;
  private isInitialized = false;
  private lastInitTime = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour - longer cache for better performance
  private featuresCache: GeoJSONFeature[] | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.index = new Supercluster({
      radius: 40,        // Smaller radius for better individual community visibility
      maxZoom: 18,       // Higher zoom for maximum detail at close range
      minZoom: 0,        
      minPoints: 2,      // Lower threshold for better Mexico/sparse area visibility
      generateId: true,  
      extent: 512,       // Larger extent for better performance
      nodeSize: 64,      // Optimized node size for faster queries
    });
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
            description: community.description || ''
          }
        }));

      // Cache features for future use
      this.featuresCache = features;
      
      // Load features into Supercluster
      this.index.load(features);
      
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
      // Get clusters from supercluster with performance optimization
      const startTime = Date.now();
      const clusters = this.index.getClusters(bbox, zoom);
      const processingTime = Date.now() - startTime;
      
      // Log performance if slow
      if (processingTime > 100) {
        console.log(`Slow cluster query: ${processingTime}ms for ${clusters.length} features at zoom ${zoom}`);
      }
      
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

  async getClusterExpansionZoom(clusterId: number): Promise<number> {
    await this.initialize();
    return this.index.getClusterExpansionZoom(clusterId);
  }

  async getClusterChildren(clusterId: number): Promise<ClusterFeature[]> {
    await this.initialize();
    const children = this.index.getChildren(clusterId);
    
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
    await this.initialize();
  }
}

export const superclusterService = new SuperclusterService();