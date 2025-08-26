/**
 * Advanced Cache Service for MySeniorValet
 * Provides multi-layer caching with Redis fallback to in-memory
 */

import { performanceOptimizer } from "./performance-optimizer";

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
  compress?: boolean;
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL = 300; // 5 minutes default
  private readonly maxCacheSize = 1000; // Maximum entries in memory cache
  
  // Cache TTL configurations by data type
  private readonly ttlConfig = {
    communities_list: 600,      // 10 minutes
    community_detail: 1800,      // 30 minutes
    search_results: 300,         // 5 minutes
    user_favorites: 60,          // 1 minute
    platform_stats: 3600,        // 1 hour
    hud_properties: 7200,        // 2 hours
    pricing_data: 1800,          // 30 minutes
    photo_validation: 86400,     // 24 hours
    web_intelligence: 3600,      // 1 hour
    competitive_analysis: 7200,  // 2 hours
  };

  constructor() {
    // Clear expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 300000);
    
    console.log("✅ Advanced cache service initialized");
  }

  /**
   * Get cached data with automatic refresh
   */
  async get<T>(key: string, fetcher?: () => Promise<T>, options?: { ttl?: number }): Promise<T | null> {
    const startTime = Date.now();
    
    // Check memory cache first
    const cached = this.memoryCache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      cached.hits++;
      performanceOptimizer.trackCacheHit(key, true);
      performanceOptimizer.trackQueryPerformance(`cache_hit_${key}`, Date.now() - startTime);
      
      console.log(`✅ Cache HIT: ${key} (${cached.hits} hits, ${Date.now() - startTime}ms)`);
      return cached.data;
    }

    // Cache miss
    performanceOptimizer.trackCacheHit(key, false);
    
    if (!fetcher) {
      console.log(`❌ Cache MISS: ${key} (no fetcher provided)`);
      return null;
    }

    // Fetch fresh data
    console.log(`🔄 Cache MISS: ${key} - fetching fresh data...`);
    
    try {
      const freshData = await fetcher();
      const ttl = options?.ttl || this.getTTLForKey(key);
      
      await this.set(key, freshData, { ttl });
      
      performanceOptimizer.trackQueryPerformance(`cache_fetch_${key}`, Date.now() - startTime);
      
      return freshData;
    } catch (error) {
      console.error(`Error fetching data for cache key ${key}:`, error);
      
      // Return stale data if available
      if (cached) {
        console.log(`⚠️ Returning stale cache for ${key} due to fetch error`);
        return cached.data;
      }
      
      return null;
    }
  }

  /**
   * Set cache data
   */
  async set(key: string, data: any, options?: { ttl?: number }): Promise<void> {
    const ttl = options?.ttl || this.getTTLForKey(key);
    
    // Ensure cache size limit
    if (this.memoryCache.size >= this.maxCacheSize) {
      this.evictOldestEntry();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      hits: 0
    };

    this.memoryCache.set(key, entry);
    console.log(`📝 Cache SET: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    console.log(`🗑️ Cache DELETE: ${key}`);
  }

  /**
   * Clear all cache entries matching a pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    let cleared = 0;
    
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }
    
    console.log(`🗑️ Cache CLEAR: ${cleared} entries matching pattern "${pattern}"`);
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    const size = this.memoryCache.size;
    this.memoryCache.clear();
    console.log(`🗑️ Cache CLEAR ALL: ${size} entries removed`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      size: this.memoryCache.size,
      entries: [] as any[],
      totalHits: 0,
      totalMemory: 0,
      oldestEntry: null as Date | null,
      newestEntry: null as Date | null
    };

    for (const [key, entry] of this.memoryCache.entries()) {
      const entrySize = JSON.stringify(entry.data).length;
      stats.totalMemory += entrySize;
      stats.totalHits += entry.hits;
      
      const entryDate = new Date(entry.timestamp);
      if (!stats.oldestEntry || entryDate < stats.oldestEntry) {
        stats.oldestEntry = entryDate;
      }
      if (!stats.newestEntry || entryDate > stats.newestEntry) {
        stats.newestEntry = entryDate;
      }

      stats.entries.push({
        key,
        size: entrySize,
        hits: entry.hits,
        age: Math.floor((Date.now() - entry.timestamp) / 1000),
        ttl: entry.ttl / 1000,
        expired: this.isExpired(entry)
      });
    }

    // Sort entries by hits (most accessed first)
    stats.entries.sort((a, b) => b.hits - a.hits);

    return {
      ...stats,
      totalMemoryMB: (stats.totalMemory / 1024 / 1024).toFixed(2),
      averageHits: stats.size > 0 ? (stats.totalHits / stats.size).toFixed(2) : 0
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Get TTL for a specific key based on its pattern
   */
  private getTTLForKey(key: string): number {
    for (const [pattern, ttl] of Object.entries(this.ttlConfig)) {
      if (key.includes(pattern)) {
        return ttl;
      }
    }
    return this.defaultTTL;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    let removed = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 Cache cleanup: removed ${removed} expired entries`);
    }
  }

  /**
   * Evict the oldest entry when cache is full
   */
  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      console.log(`♻️ Cache eviction: removed oldest entry "${oldestKey}"`);
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(keys: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    console.log(`🔥 Warming cache with ${keys.length} entries...`);
    
    const results = await Promise.allSettled(
      keys.map(async ({ key, fetcher, ttl }) => {
        try {
          const data = await fetcher();
          await this.set(key, data, { ttl });
          return { key, status: 'success' };
        } catch (error) {
          console.error(`Failed to warm cache for ${key}:`, error);
          return { key, status: 'failed', error };
        }
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
    console.log(`✅ Cache warmed: ${successful}/${keys.length} entries loaded`);
    
    return results;
  }
}

// Export singleton instance
export const cacheService = new CacheService();