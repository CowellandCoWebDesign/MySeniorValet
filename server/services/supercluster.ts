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
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.index = new Supercluster({
      radius: 60,        // pixel radius to group points
      maxZoom: 16,       // max zoom to cluster before showing individual markers
      minZoom: 1,        // min zoom level
      minPoints: 2,      // minimum points to form a cluster
      generateId: true,  // generate unique IDs for clusters
    });
  }

  async initialize(): Promise<void> {
    const now = Date.now();
    
    // Skip if recently initialized
    if (this.isInitialized && (now - this.lastInitTime) < this.CACHE_DURATION) {
      return;
    }

    console.log('Initializing Supercluster with community data...');
    
    try {
      // Get all communities from database
      const communities = await storage.getAllCommunities();
      
      // Convert communities to GeoJSON features
      const features: GeoJSONFeature[] = communities
        .filter(community => community.latitude && community.longitude)
        .map(community => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [community.longitude, community.latitude]
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

      // Load features into Supercluster
      this.index.load(features);
      
      this.isInitialized = true;
      this.lastInitTime = now;
      
      console.log(`Supercluster initialized with ${features.length} communities`);
    } catch (error) {
      console.error('Failed to initialize Supercluster:', error);
      throw error;
    }
  }

  async getClusters(bbox: [number, number, number, number], zoom: number): Promise<ClusterFeature[]> {
    // Ensure supercluster is initialized
    await this.initialize();

    if (!this.isInitialized) {
      throw new Error('Supercluster not initialized');
    }

    try {
      // Get clusters from supercluster
      const clusters = this.index.getClusters(bbox, zoom);
      
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
    await this.initialize();
  }
}

export const superclusterService = new SuperclusterService();