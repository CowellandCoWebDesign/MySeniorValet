import { LRUCache } from 'lru-cache';
import { db } from '../db';
import { communities, analyticsEvents } from '@shared/schema';
import { eq, sql, desc, gte } from 'drizzle-orm';
import { PerformanceMonitorService } from './performance.service';
import EventEmitter from 'events';

interface CacheEntry {
  data: any;
  timestamp: number;
  hits: number;
  source: 'database' | 'computed' | 'api';
}

interface CacheConfig {
  max: number;
  ttl: number;
  updateAgeOnGet: boolean;
  updateAgeOnHas: boolean;
}

export class CacheOptimizerService extends EventEmitter {
  private static instance: CacheOptimizerService;
  private performanceService: PerformanceMonitorService;
  
  // Multiple cache layers for different data types
  private caches: Map<string, LRUCache<string, CacheEntry>> = new Map();
  private cacheConfigs: Map<string, CacheConfig> = new Map();
  private preloadQueue: Set<string> = new Set();
  private cacheWarmupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.performanceService = PerformanceMonitorService.getInstance();
    this.initializeCaches();
    this.startCacheWarmup();
  }

  static getInstance(): CacheOptimizerService {
    if (!CacheOptimizerService.instance) {
      CacheOptimizerService.instance = new CacheOptimizerService();
    }
    return CacheOptimizerService.instance;
  }

  private initializeCaches() {
    // Community data cache - long TTL
    this.createCache('communities', {
      max: 1000,
      ttl: 1000 * 60 * 60, // 1 hour
      updateAgeOnGet: true,
      updateAgeOnHas: false
    });

    // Analytics cache - medium TTL
    this.createCache('analytics', {
      max: 500,
      ttl: 1000 * 60 * 15, // 15 minutes
      updateAgeOnGet: true,
      updateAgeOnHas: false
    });

    // Search results cache - short TTL
    this.createCache('search', {
      max: 200,
      ttl: 1000 * 60 * 5, // 5 minutes
      updateAgeOnGet: false,
      updateAgeOnHas: false
    });

    // Metrics cache - very short TTL
    this.createCache('metrics', {
      max: 100,
      ttl: 1000 * 60, // 1 minute
      updateAgeOnGet: false,
      updateAgeOnHas: false
    });

    // Hot data cache - adaptive TTL
    this.createCache('hot', {
      max: 50,
      ttl: 1000 * 60 * 30, // 30 minutes
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });

    console.log('🗄️ Cache optimizer initialized with', this.caches.size, 'cache layers');
  }

  private createCache(name: string, config: CacheConfig) {
    const cache = new LRUCache<string, CacheEntry>({
      max: config.max,
      ttl: config.ttl,
      updateAgeOnGet: config.updateAgeOnGet,
      updateAgeOnHas: config.updateAgeOnHas,
      dispose: (value, key) => {
        // Track evictions
        this.performanceService.recordCacheEviction();
        this.emit('cache_eviction', { cache: name, key });
      },
      fetchMethod: async (key: string) => {
        // Auto-fetch from database if not in cache
        return await this.fetchFromSource(name, key);
      }
    });

    this.caches.set(name, cache);
    this.cacheConfigs.set(name, config);
  }

  async get(cacheName: string, key: string): Promise<any> {
    const cache = this.caches.get(cacheName);
    if (!cache) {
      this.performanceService.recordCacheMiss();
      return null;
    }

    const entry = cache.get(key);
    if (entry) {
      // Update hit counter
      entry.hits++;
      this.performanceService.recordCacheHit();
      
      // Track hot data
      if (entry.hits > 10) {
        this.promoteToHotCache(key, entry);
      }

      return entry.data;
    }

    this.performanceService.recordCacheMiss();
    
    // Fetch and cache
    const data = await this.fetchFromSource(cacheName, key);
    if (data) {
      this.set(cacheName, key, data.data, data.source);
    }
    
    return data?.data;
  }

  set(cacheName: string, key: string, data: any, source: CacheEntry['source'] = 'database') {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      hits: 0,
      source
    };

    cache.set(key, entry);
    this.emit('cache_set', { cache: cacheName, key });
  }

  async has(cacheName: string, key: string): Promise<boolean> {
    const cache = this.caches.get(cacheName);
    return cache ? cache.has(key) : false;
  }

  delete(cacheName: string, key: string) {
    const cache = this.caches.get(cacheName);
    if (cache) {
      cache.delete(key);
      this.emit('cache_delete', { cache: cacheName, key });
    }
  }

  clear(cacheName?: string) {
    if (cacheName) {
      const cache = this.caches.get(cacheName);
      if (cache) {
        cache.clear();
        console.log(`🗑️ Cache cleared: ${cacheName}`);
      }
    } else {
      // Clear all caches
      this.caches.forEach((cache, name) => {
        cache.clear();
        console.log(`🗑️ Cache cleared: ${name}`);
      });
    }
  }

  private async fetchFromSource(cacheName: string, key: string): Promise<CacheEntry | null> {
    try {
      let data: any = null;
      let source: CacheEntry['source'] = 'database';

      switch (cacheName) {
        case 'communities':
          // Fetch community data from database
          if (key.startsWith('community:')) {
            const id = parseInt(key.split(':')[1]);
            const [community] = await db
              .select()
              .from(communities)
              .where(eq(communities.id, id))
              .limit(1);
            data = community;
          }
          break;

        case 'analytics':
          // Fetch analytics data
          if (key.startsWith('analytics:')) {
            const parts = key.split(':');
            const type = parts[1];
            const timeRange = parts[2] || '1h';
            
            data = await this.fetchAnalyticsData(type, timeRange);
            source = 'computed';
          }
          break;

        case 'search':
          // Search results are not auto-fetched
          return null;

        case 'metrics':
          // Fetch latest metrics
          if (key.startsWith('metrics:')) {
            const metricType = key.split(':')[1];
            data = await this.fetchMetricsData(metricType);
            source = 'computed';
          }
          break;

        case 'hot':
          // Hot cache is only for promoted items
          return null;

        default:
          return null;
      }

      if (data) {
        return {
          data,
          timestamp: Date.now(),
          hits: 0,
          source
        };
      }
    } catch (error) {
      console.error(`Error fetching data for cache ${cacheName}, key ${key}:`, error);
    }

    return null;
  }

  private async fetchAnalyticsData(type: string, timeRange: string) {
    const timeMs = this.parseTimeRange(timeRange);
    const since = new Date(Date.now() - timeMs);

    const analytics = await db
      .select({
        count: sql<number>`COUNT(*)`,
        type: analyticsEvents.eventType,
        avgValue: sql<number>`AVG(CAST(metadata->>'value' AS FLOAT))`
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, since))
      .groupBy(analyticsEvents.eventType)
      .limit(100);

    return analytics;
  }

  private async fetchMetricsData(metricType: string) {
    // Fetch performance metrics
    const report = await this.performanceService.getPerformanceReport();
    
    switch (metricType) {
      case 'database':
        return report.current.metrics.database;
      case 'api':
        return report.current.metrics.api;
      case 'cache':
        return report.current.metrics.cache;
      case 'system':
        return report.current.metrics.system;
      default:
        return report.aggregated;
    }
  }

  private parseTimeRange(range: string): number {
    const unit = range.slice(-1);
    const value = parseInt(range.slice(0, -1));
    
    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      default: return 60 * 60 * 1000; // Default 1 hour
    }
  }

  private promoteToHotCache(key: string, entry: CacheEntry) {
    const hotCache = this.caches.get('hot');
    if (hotCache && !hotCache.has(key)) {
      hotCache.set(key, entry);
      console.log(`🔥 Promoted to hot cache: ${key}`);
    }
  }

  private startCacheWarmup() {
    // Warm up caches every 5 minutes
    this.cacheWarmupInterval = setInterval(() => {
      this.warmupCaches();
    }, 5 * 60 * 1000);

    // Initial warmup
    this.warmupCaches();
    console.log('🔥 Cache warmup scheduled');
  }

  private async warmupCaches() {
    try {
      // Preload frequently accessed communities
      const popularCommunities = await db
        .select({
          id: communities.id,
          views: sql<number>`COUNT(ae.id)`
        })
        .from(communities)
        .leftJoin(
          analyticsEvents,
          eq(analyticsEvents.communityId, communities.id)
        )
        .groupBy(communities.id)
        .orderBy(desc(sql`COUNT(ae.id)`))
        .limit(50);

      for (const community of popularCommunities) {
        const key = `community:${community.id}`;
        if (!await this.has('communities', key)) {
          await this.get('communities', key);
        }
      }

      // Preload recent analytics
      const analyticsKey = 'analytics:overview:1h';
      await this.get('analytics', analyticsKey);

      console.log('✅ Cache warmup completed');
    } catch (error) {
      console.error('Error during cache warmup:', error);
    }
  }

  async getCacheStats() {
    const stats: any = {};
    
    this.caches.forEach((cache, name) => {
      const size = cache.size;
      const calculatedSize = cache.calculatedSize || 0;
      
      stats[name] = {
        size,
        maxSize: this.cacheConfigs.get(name)?.max || 0,
        ttl: this.cacheConfigs.get(name)?.ttl || 0,
        hitRate: this.calculateHitRate(name),
        memoryUsage: calculatedSize
      };
    });

    return stats;
  }

  private calculateHitRate(cacheName: string): number {
    // This would normally track actual hit/miss ratios
    // For now, return simulated values based on cache type
    switch (cacheName) {
      case 'hot': return 95;
      case 'communities': return 85;
      case 'analytics': return 75;
      case 'search': return 60;
      case 'metrics': return 50;
      default: return 70;
    }
  }

  invalidatePattern(pattern: string) {
    let invalidated = 0;
    
    this.caches.forEach((cache, cacheName) => {
      cache.forEach((value, key) => {
        if (key.includes(pattern)) {
          cache.delete(key);
          invalidated++;
        }
      });
    });

    console.log(`🗑️ Invalidated ${invalidated} cache entries matching pattern: ${pattern}`);
    return invalidated;
  }

  preload(cacheName: string, keys: string[]) {
    const cache = this.caches.get(cacheName);
    if (!cache) return;

    keys.forEach(key => {
      this.preloadQueue.add(`${cacheName}:${key}`);
    });

    // Process preload queue
    this.processPreloadQueue();
  }

  private async processPreloadQueue() {
    const batch = Array.from(this.preloadQueue).slice(0, 10);
    
    for (const item of batch) {
      const [cacheName, key] = item.split(':');
      await this.get(cacheName, key);
      this.preloadQueue.delete(item);
    }

    if (this.preloadQueue.size > 0) {
      setTimeout(() => this.processPreloadQueue(), 100);
    }
  }

  stopWarmup() {
    if (this.cacheWarmupInterval) {
      clearInterval(this.cacheWarmupInterval);
      this.cacheWarmupInterval = null;
      console.log('🛑 Cache warmup stopped');
    }
  }
}