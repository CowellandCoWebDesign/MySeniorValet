import Supercluster from 'supercluster';
import { db } from '../db';
import { communities } from '@shared/schema';
import { and, sql, gte, lte, isNotNull } from 'drizzle-orm';
import { cache } from '../cache';

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
    phone: string | null;
    website: string | null;
    priceRange: string | null;
    availability?: string;
    rating: number | null;
    reviewCount: number;
    careTypes: string[];
    photos: string[];
    description: string | null;
    hudPropertyId?: string;
    rentPerMonth?: number;
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
    hudPropertyId?: string;
    rentPerMonth?: number;
  };
}

interface RegionalCache {
  features: GeoJSONFeature[];
  bounds: [number, number, number, number];
  timestamp: number;
}

class SuperclusterService {
  // Cache for regional clusters by state/zoom level
  private regionalCaches: Map<string, RegionalCache> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  // Pre-computed clusters for different zoom levels
  private zoomLevelClusters: Map<string, ClusterFeature[]> = new Map();
  
  // City summaries for country-level view
  private citySummaries: Map<string, any> = new Map();
  
  constructor() {
    // Initialize city summaries on startup for fast country-level view
    this.initializeCitySummaries();
  }

  /**
   * OPTION 1: Dynamic Viewport Loading
   * Only load communities visible in the current map viewport
   */
  async getClusters(bbox: [number, number, number, number], zoom: number): Promise<ClusterFeature[]> {
    const [west, south, east, north] = bbox;
    
    // OPTION 4: Progressive Loading based on zoom level
    if (zoom < 5) {
      // Country level: Show major city summaries only
      return this.getMajorCitySummaries(bbox);
    } else if (zoom < 8) {
      // State level: Use pre-computed state clusters
      return this.getStateClusters(bbox, zoom);
    } else if (zoom < 12) {
      // County level: Use regional clusters
      return this.getRegionalClusters(bbox, zoom);
    } else {
      // Local level: Show actual communities
      return this.getLocalCommunities(bbox, zoom);
    }
  }

  /**
   * OPTION 4: Progressive Loading - Major cities only for zoom < 5
   */
  private async getMajorCitySummaries(bbox: [number, number, number, number]): Promise<ClusterFeature[]> {
    const cacheKey = `cities:${bbox.join(',')}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    try {
      // Get major cities with community counts
      const cityData = await db.execute(sql`
        SELECT 
          city,
          state,
          COUNT(*)::integer as community_count,
          AVG(CAST(latitude AS float)) as avg_lat,
          AVG(CAST(longitude AS float)) as avg_lng,
          MIN(CAST(price_range ->> 'min' AS integer)) as min_price,
          MAX(CAST(price_range ->> 'max' AS integer)) as max_price
        FROM communities
        WHERE 
          latitude IS NOT NULL 
          AND longitude IS NOT NULL
          AND (is_hidden IS NULL OR is_hidden = false)
          AND CAST(latitude AS float) >= ${bbox[1]}
          AND CAST(latitude AS float) <= ${bbox[3]}
          AND CAST(longitude AS float) >= ${bbox[0]}
          AND CAST(longitude AS float) <= ${bbox[2]}
        GROUP BY city, state
        HAVING COUNT(*) > 10
        ORDER BY community_count DESC
        LIMIT 100
      `);

      const clusters: ClusterFeature[] = cityData.rows.map((row: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row.avg_lng, row.avg_lat]
        },
        properties: {
          cluster: true,
          cluster_id: this.generateClusterId(row.city, row.state),
          point_count: row.community_count,
          point_count_abbreviated: this.abbreviateNumber(row.community_count),
          city: row.city,
          state: row.state,
          priceRange: row.min_price && row.max_price ? 
            `$${row.min_price} - $${row.max_price}` : 
            'Contact for pricing'
        }
      }));

      // Cache for 30 minutes
      await cache.set(cacheKey, JSON.stringify(clusters), 1800);
      return clusters;
    } catch (error: any) {
      console.error('Error getting city summaries:', error);
      return [];
    }
  }

  /**
   * OPTION 3: Pre-computed Regional Clusters - State level (zoom 5-8)
   */
  private async getStateClusters(bbox: [number, number, number, number], zoom: number): Promise<ClusterFeature[]> {
    const cacheKey = `state:${zoom}:${bbox.join(',')}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    try {
      // Get state-level clusters
      const stateData = await db.execute(sql`
        WITH grid AS (
          SELECT 
            FLOOR(CAST(latitude AS float) * 2) / 2 as lat_bucket,
            FLOOR(CAST(longitude AS float) * 2) / 2 as lng_bucket,
            COUNT(*)::integer as community_count,
            array_agg(DISTINCT city) as cities,
            array_agg(DISTINCT state) as states,
            MIN(CAST(price_range ->> 'min' AS integer)) as min_price,
            MAX(CAST(price_range ->> 'max' AS integer)) as max_price
          FROM communities
          WHERE 
            latitude IS NOT NULL 
            AND longitude IS NOT NULL
            AND (is_hidden IS NULL OR is_hidden = false)
            AND CAST(latitude AS float) >= ${bbox[1]}
            AND CAST(latitude AS float) <= ${bbox[3]}
            AND CAST(longitude AS float) >= ${bbox[0]}
            AND CAST(longitude AS float) <= ${bbox[2]}
          GROUP BY lat_bucket, lng_bucket
        )
        SELECT * FROM grid WHERE community_count > 0
      `);

      const clusters: ClusterFeature[] = stateData.rows.map((row: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row.lng_bucket + 0.25, row.lat_bucket + 0.25]
        },
        properties: {
          cluster: true,
          cluster_id: this.generateClusterId(row.lat_bucket, row.lng_bucket),
          point_count: row.community_count,
          point_count_abbreviated: this.abbreviateNumber(row.community_count),
          priceRange: row.min_price && row.max_price ? 
            `$${row.min_price} - $${row.max_price}` : 
            'Contact for pricing'
        }
      }));

      // Cache for 30 minutes
      await cache.set(cacheKey, JSON.stringify(clusters), 1800);
      return clusters;
    } catch (error: any) {
      console.error('Error getting state clusters:', error);
      return [];
    }
  }

  /**
   * OPTION 2: Database Spatial Clustering - County level (zoom 8-12)
   */
  private async getRegionalClusters(bbox: [number, number, number, number], zoom: number): Promise<ClusterFeature[]> {
    const cacheKey = `region:${zoom}:${bbox.join(',')}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    try {
      // Use database clustering with finer grid
      const gridSize = 0.5 / Math.pow(2, zoom - 8); // Adaptive grid size
      
      const regionalData = await db.execute(sql`
        WITH grid AS (
          SELECT 
            FLOOR(CAST(latitude AS float) / ${gridSize}) * ${gridSize} as lat_bucket,
            FLOOR(CAST(longitude AS float) / ${gridSize}) * ${gridSize} as lng_bucket,
            COUNT(*)::integer as community_count,
            array_agg(id) as community_ids,
            array_agg(name) as names,
            MIN(CAST(price_range ->> 'min' AS integer)) as min_price,
            MAX(CAST(price_range ->> 'max' AS integer)) as max_price
          FROM communities
          WHERE 
            latitude IS NOT NULL 
            AND longitude IS NOT NULL
            AND (is_hidden IS NULL OR is_hidden = false)
            AND CAST(latitude AS float) >= ${bbox[1]}
            AND CAST(latitude AS float) <= ${bbox[3]}
            AND CAST(longitude AS float) >= ${bbox[0]}
            AND CAST(longitude AS float) <= ${bbox[2]}
          GROUP BY lat_bucket, lng_bucket
        )
        SELECT * FROM grid 
        WHERE community_count > 1
        LIMIT 500
      `);

      const clusters: ClusterFeature[] = regionalData.rows.map((row: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row.lng_bucket + gridSize/2, row.lat_bucket + gridSize/2]
        },
        properties: {
          cluster: true,
          cluster_id: this.generateClusterId(row.lat_bucket, row.lng_bucket),
          point_count: row.community_count,
          point_count_abbreviated: this.abbreviateNumber(row.community_count),
          priceRange: row.min_price && row.max_price ? 
            `$${row.min_price} - $${row.max_price}` : 
            'Contact for pricing'
        }
      }));

      // Add individual communities that aren't clustered
      const individualData = await db.execute(sql`
        WITH grid AS (
          SELECT 
            id, name, address, city, state, zip_code,
            CAST(latitude AS float) as lat,
            CAST(longitude AS float) as lng,
            price_range, availability_status, rating, review_count,
            care_types, photos, description,
            hud_property_id, rent_per_month,
            FLOOR(CAST(latitude AS float) / ${gridSize}) * ${gridSize} as lat_bucket,
            FLOOR(CAST(longitude AS float) / ${gridSize}) * ${gridSize} as lng_bucket,
            COUNT(*) OVER (PARTITION BY 
              FLOOR(CAST(latitude AS float) / ${gridSize}), 
              FLOOR(CAST(longitude AS float) / ${gridSize})
            ) as cluster_count
          FROM communities
          WHERE 
            latitude IS NOT NULL 
            AND longitude IS NOT NULL
            AND (is_hidden IS NULL OR is_hidden = false)
            AND CAST(latitude AS float) >= ${bbox[1]}
            AND CAST(latitude AS float) <= ${bbox[3]}
            AND CAST(longitude AS float) >= ${bbox[0]}
            AND CAST(longitude AS float) <= ${bbox[2]}
        )
        SELECT * FROM grid 
        WHERE cluster_count = 1
        LIMIT 300
      `);

      const individuals: ClusterFeature[] = individualData.rows.map((row: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [row.lng, row.lat]
        },
        properties: {
          cluster: false,
          id: row.id,
          name: row.name,
          address: row.address,
          city: row.city,
          state: row.state,
          zipCode: row.zip_code,
          priceRange: row.price_range ? 
            (typeof row.price_range === 'object' ? 
              `$${row.price_range.min} - $${row.price_range.max}` : 
              row.price_range) : 
            'Contact for pricing',
          availability: row.availability_status || 'Available',
          rating: row.rating || 0,
          reviewCount: row.review_count || 0,
          careTypes: row.care_types || [],
          photos: row.photos || [],
          description: row.description || '',
          hudPropertyId: row.hud_property_id,
          rentPerMonth: row.rent_per_month
        }
      }));

      const allFeatures = [...clusters, ...individuals];
      
      // Cache for 30 minutes
      await cache.set(cacheKey, JSON.stringify(allFeatures), 1800);
      return allFeatures;
    } catch (error: any) {
      console.error('Error getting regional clusters:', error);
      return [];
    }
  }

  /**
   * OPTION 1: Dynamic Viewport Loading - Local level (zoom >= 12)
   * Load actual communities without clustering
   */
  private async getLocalCommunities(bbox: [number, number, number, number], zoom: number): Promise<ClusterFeature[]> {
    const cacheKey = `local:${zoom}:${bbox.join(',')}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    try {
      // Query only active communities within viewport
      const viewportCommunities = await db.select()
        .from(communities)
        .where(
          and(
            sql`${communities.isActive} = true`,
            sql`(${communities.isHidden} IS NULL OR ${communities.isHidden} = false)`,
            isNotNull(communities.latitude),
            isNotNull(communities.longitude),
            sql`CAST(${communities.latitude} AS float) >= ${bbox[1]}`,
            sql`CAST(${communities.latitude} AS float) <= ${bbox[3]}`,
            sql`CAST(${communities.longitude} AS float) >= ${bbox[0]}`,
            sql`CAST(${communities.longitude} AS float) <= ${bbox[2]}`
          )
        )
        .limit(500); // Cap at 500 for performance

      const features: ClusterFeature[] = viewportCommunities.map(community => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(community.longitude!), 
            parseFloat(community.latitude!)
          ]
        },
        properties: {
          cluster: false,
          id: community.id,
          name: community.name,
          address: community.address,
          city: community.city,
          state: community.state,
          zipCode: community.zipCode,
          phone: community.phone,
          website: community.website || '',
          priceRange: community.priceRange ? 
            (typeof community.priceRange === 'object' ? 
              `$${(community.priceRange as any).min} - $${(community.priceRange as any).max}` : 
              community.priceRange as string) : 
            'Contact for pricing',
          availability: community.availabilityStatus || 'Available',
          rating: community.rating || 0,
          reviewCount: community.reviewCount || 0,
          careTypes: community.careTypes || [],
          photos: community.photos || [],
          description: community.description || '',
          hudPropertyId: community.hudPropertyId || undefined,
          rentPerMonth: community.rentPerMonth || undefined
        }
      }));

      // Cache for 30 minutes
      await cache.set(cacheKey, JSON.stringify(features), 1800);
      return features;
    } catch (error: any) {
      console.error('Error getting local communities:', error);
      return [];
    }
  }

  /**
   * Initialize city summaries for fast country-level rendering
   */
  private async initializeCitySummaries() {
    try {
      const majorCities = await db.execute(sql`
        SELECT 
          city, 
          state, 
          COUNT(*)::integer as count,
          AVG(CAST(latitude AS float)) as lat,
          AVG(CAST(longitude AS float)) as lng
        FROM communities
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND (is_hidden IS NULL OR is_hidden = false)
        GROUP BY city, state
        HAVING COUNT(*) > 50
        ORDER BY count DESC
        LIMIT 100
      `);

      majorCities.rows.forEach((city: any) => {
        const key = `${city.city}:${city.state}`;
        this.citySummaries.set(key, city);
      });

      console.log(`Initialized ${this.citySummaries.size} major city summaries for fast rendering`);
    } catch (error) {
      console.error('Error initializing city summaries:', error);
    }
  }

  /**
   * Get children of a cluster
   */
  async getClusterChildren(clusterId: number, zoom: number): Promise<any[]> {
    // For database-based clustering, we need to decode the cluster ID
    // to get the actual communities
    // This is a simplified version - implement based on your cluster ID encoding
    return [];
  }

  /**
   * Invalidate all supercluster caches immediately.
   * Clears both in-memory service maps and the shared cache store entries
   * (keys prefixed with cities:, state:, region:, local:).
   * Call this after any admin hide/unhide action so the map reflects the
   * change on the next request rather than waiting for TTL expiry.
   */
  async invalidateCache(): Promise<void> {
    this.regionalCaches.clear();
    this.zoomLevelClusters.clear();
    this.citySummaries.clear();
    await Promise.all([
      cache.deleteByPrefix('cities:'),
      cache.deleteByPrefix('state:'),
      cache.deleteByPrefix('region:'),
      cache.deleteByPrefix('local:'),
    ]);
    console.log('Supercluster caches invalidated');
  }

  /**
   * Refresh caches (reinitializes city summaries after invalidation)
   */
  async refresh(): Promise<void> {
    await this.invalidateCache();
    await this.initializeCitySummaries();
    console.log('Supercluster caches refreshed');
  }

  /**
   * Generate a unique cluster ID from coordinates
   */
  private generateClusterId(lat: any, lng: any): number {
    const latInt = Math.floor(parseFloat(lat) * 1000);
    const lngInt = Math.floor(parseFloat(lng) * 1000);
    return Math.abs(latInt * 1000000 + lngInt);
  }

  /**
   * Abbreviate large numbers for display
   */
  private abbreviateNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Remove old methods that loaded all communities
  async initialize(): Promise<void> {
    // No longer load all communities at startup
    console.log('Supercluster service initialized with viewport-based loading');
  }
}

export const superclusterService = new SuperclusterService();