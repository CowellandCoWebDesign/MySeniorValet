/**
 * Redis-based caching layer for performance optimization
 * Implements intelligent caching with TTL and hit/miss tracking
 */

import Redis from 'ioredis';
import type { Community } from "@shared/schema";

// Cache statistics for monitoring
export const cacheStats = {
  hits: 0,
  misses: 0,
  hitRate: function() {
    return this.hits / (this.hits + this.misses) * 100;
  }
};

// Redis client with fallback to in-memory for development
class CacheManager {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { data: any; expires: number }>();

  constructor() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        console.log('Redis connected successfully');
      } else {
        console.log('Redis not available, using in-memory cache');
      }
    } catch (error) {
      console.log('Redis connection failed, using in-memory cache:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          cacheStats.hits++;
          return JSON.parse(cached);
        }
      } else {
        // In-memory fallback
        const cached = this.memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          cacheStats.hits++;
          return cached.data;
        }
        if (cached) {
          this.memoryCache.delete(key);
        }
      }
      cacheStats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      cacheStats.misses++;
      return null;
    }
  }

  async set(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
      } else {
        // In-memory fallback
        this.memoryCache.set(key, {
          data,
          expires: Date.now() + (ttlSeconds * 1000)
        });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.flushdb();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      ...cacheStats,
      cacheType: this.redis ? 'redis' : 'memory',
      memorySize: this.memoryCache.size
    };
  }
}

export const cache = new CacheManager();