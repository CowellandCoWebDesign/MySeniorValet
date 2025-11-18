import Redis from 'ioredis';

// Redis client with graceful fallback when Redis is not available
let redisClient: Redis | null = null;

// Only initialize Redis if credentials are provided
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    redisClient = new Redis(
      process.env.REDIS_URL || {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times: number) => {
          // Stop retrying after 3 attempts
          if (times > 3) {
            console.warn('⚠️ Redis connection failed after 3 attempts - using in-memory fallback');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      }
    );
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
    
    redisClient.on('error', (error) => {
      console.warn('⚠️ Redis error:', error.message);
    });
    
    // Test the connection
    redisClient.ping().catch((err) => {
      console.warn('⚠️ Redis ping failed - disabling Redis features');
      redisClient = null;
    });
    
  } catch (error) {
    console.warn('⚠️ Redis initialization failed - using in-memory fallback');
    redisClient = null;
  }
} else {
  console.log('ℹ️ Redis not configured - using in-memory cache');
}

// Export the client (may be null if Redis is not available)
export { redisClient };

// Helper to check if Redis is available
export function isRedisAvailable(): boolean {
  return redisClient !== null && redisClient.status === 'ready';
}

// In-memory cache fallback for when Redis is not available
class InMemoryCache {
  private cache: Map<string, { value: string; expiry?: number }> = new Map();
  
  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  async set(key: string, value: string): Promise<void> {
    this.cache.set(key, { value });
  }
  
  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.cache.set(key, { 
      value, 
      expiry: Date.now() + (seconds * 1000) 
    });
  }
  
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
  
  async keys(pattern: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }
}

// Export in-memory cache for fallback use
export const inMemoryCache = new InMemoryCache();