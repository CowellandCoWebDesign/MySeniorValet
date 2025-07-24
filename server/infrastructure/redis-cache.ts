import Redis from 'ioredis';

class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Initialize Redis client with fallback to memory cache
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableOfflineQueue: false
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.log('⚠️ Redis connection failed, using memory cache:', error.message);
        this.isConnected = false;
      });
    } catch (error) {
      console.log('⚠️ Redis initialization failed, using memory cache');
      this.isConnected = false;
    }
    
    // Cleanup memory cache every 5 minutes
    setInterval(() => this.cleanupMemoryCache(), 5 * 60 * 1000);
  }

  private memoryCache = new Map<string, { data: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.get(key);
        return result ? JSON.parse(result) : null;
      }
    } catch (error) {
      console.log('Redis get error, falling back to memory:', error);
    }

    // Memory cache fallback
    const cached = this.memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.setex(key, ttlSeconds, JSON.stringify(value));
        return true;
      }
    } catch (error) {
      console.log('Redis set error, falling back to memory:', error);
    }

    // Memory cache fallback
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttlSeconds * 1000)
    });
    return true;
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
        return true;
      }
    } catch (error) {
      console.log('Redis del error:', error);
    }

    this.memoryCache.delete(key);
    return true;
  }

  async flush(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushall();
      }
    } catch (error) {
      console.log('Redis flush error:', error);
    }

    this.memoryCache.clear();
    return true;
  }

  // Search-specific caching
  async cacheSearchResults(location: string, filters: any, results: any[], ttl: number = 600): Promise<void> {
    const key = `search:${location}:${JSON.stringify(filters)}`;
    await this.set(key, results, ttl);
  }

  async getCachedSearchResults(location: string, filters: any): Promise<any[] | null> {
    const key = `search:${location}:${JSON.stringify(filters)}`;
    return await this.get<any[]>(key);
  }

  // Community-specific caching
  async cacheCommunityDetails(communityId: number, data: any, ttl: number = 1800): Promise<void> {
    const key = `community:${communityId}`;
    await this.set(key, data, ttl);
  }

  async getCachedCommunityDetails(communityId: number): Promise<any | null> {
    const key = `community:${communityId}`;
    return await this.get<any>(key);
  }

  // API response caching
  async cacheApiResponse(endpoint: string, params: any, response: any, ttl: number = 300): Promise<void> {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    await this.set(key, response, ttl);
  }

  async getCachedApiResponse(endpoint: string, params: any): Promise<any | null> {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return await this.get<any>(key);
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, sessionData, ttl);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await this.get<any>(key);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }

  // Statistics and analytics caching
  async cacheStats(statsKey: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `stats:${statsKey}`;
    await this.set(key, data, ttl);
  }

  async getCachedStats(statsKey: string): Promise<any | null> {
    const key = `stats:${statsKey}`;
    return await this.get<any>(key);
  }

  // Cleanup expired memory cache entries
  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires < now) {
        this.memoryCache.delete(key);
      }
    }
  }


}

export const redisCache = new RedisCache();