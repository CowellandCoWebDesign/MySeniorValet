/**
 * Token bucket rate limiter for 10,000+ concurrent users
 * Prevents API abuse and ensures fair resource allocation
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
  requests: number;
  windowStart: number;
}

export class TokenBucketRateLimiter {
  private buckets = new Map<string, RateLimitEntry>();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly windowMs: number;
  private readonly maxRequestsPerWindow: number;

  constructor(
    maxTokens = 100,
    refillRate = 10,
    windowMs = 60000, // 1 minute
    maxRequestsPerWindow = 60
  ) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.windowMs = windowMs;
    this.maxRequestsPerWindow = maxRequestsPerWindow;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  isAllowed(identifier: string, cost = 1): boolean {
    const now = Date.now();
    let entry = this.buckets.get(identifier);

    if (!entry) {
      entry = {
        tokens: this.maxTokens,
        lastRefill: now,
        requests: 0,
        windowStart: now
      };
      this.buckets.set(identifier, entry);
    }

    // Refill tokens based on time elapsed
    const elapsed = (now - entry.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    entry.tokens = Math.min(this.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;

    // Reset window if needed
    if (now - entry.windowStart >= this.windowMs) {
      entry.requests = 0;
      entry.windowStart = now;
    }

    // Check both token bucket and sliding window limits
    if (entry.tokens >= cost && entry.requests < this.maxRequestsPerWindow) {
      entry.tokens -= cost;
      entry.requests++;
      return true;
    }

    return false;
  }

  getRemainingTokens(identifier: string): number {
    const entry = this.buckets.get(identifier);
    if (!entry) return this.maxTokens;

    const now = Date.now();
    const elapsed = (now - entry.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    return Math.min(this.maxTokens, entry.tokens + tokensToAdd);
  }

  getWindowRemaining(identifier: string): number {
    const entry = this.buckets.get(identifier);
    if (!entry) return this.maxRequestsPerWindow;

    const now = Date.now();
    if (now - entry.windowStart >= this.windowMs) {
      return this.maxRequestsPerWindow;
    }

    return Math.max(0, this.maxRequestsPerWindow - entry.requests);
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - (this.windowMs * 2); // Keep entries for 2 windows

    for (const [key, entry] of this.buckets.entries()) {
      if (entry.windowStart < cutoff) {
        this.buckets.delete(key);
      }
    }
  }

  getStats() {
    return {
      totalBuckets: this.buckets.size,
      memoryUsage: process.memoryUsage().heapUsed,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      windowMs: this.windowMs
    };
  }
}

// Rate limiter instances for different endpoints
// Development mode: More permissive limits for testing
const isDev = process.env.NODE_ENV === 'development';

export const generalLimiter = new TokenBucketRateLimiter(
  isDev ? 2000 : 100,    // tokens: 2000 in dev, 100 in prod
  isDev ? 200 : 10,      // refill rate: 200/sec in dev, 10/sec in prod  
  60000, 
  isDev ? 1000 : 60      // max requests per minute: 1000 in dev, 60 in prod
);

export const searchLimiter = new TokenBucketRateLimiter(
  isDev ? 1000 : 50,     // tokens: 1000 in dev, 50 in prod
  isDev ? 100 : 5,       // refill rate: 100/sec in dev, 5/sec in prod
  60000, 
  isDev ? 500 : 30       // max requests per minute: 500 in dev, 30 in prod
);

export const apiLimiter = new TokenBucketRateLimiter(
  isDev ? 100 : 20,     // tokens: 100 in dev, 20 in prod
  isDev ? 10 : 2,       // refill rate: 10/sec in dev, 2/sec in prod
  60000, 
  isDev ? 60 : 10       // max requests per minute: 60 in dev, 10 in prod
);

export const uploadLimiter = new TokenBucketRateLimiter(10, 1, 300000, 5); // 5 uploads per 5 min

// Image serving limiter - more permissive for photo loading
export const imageLimiter = new TokenBucketRateLimiter(
  isDev ? 1000 : 500,   // tokens: 1000 in dev, 500 in prod (more permissive for images)
  isDev ? 100 : 50,     // refill rate: 100/sec in dev, 50/sec in prod
  60000, 
  isDev ? 600 : 300     // max requests per minute: 600 in dev, 300 in prod (more for images)
);

// Authentication limiter - very permissive for login/auth endpoints
export const authLimiter = new TokenBucketRateLimiter(
  isDev ? 5000 : 1000,  // tokens: 5000 in dev, 1000 in prod (very permissive for auth)
  isDev ? 500 : 100,    // refill rate: 500/sec in dev, 100/sec in prod
  60000, 
  isDev ? 2000 : 500    // max requests per minute: 2000 in dev, 500 in prod
);

// Rate limiting middleware
export function createRateLimitMiddleware(limiter: TokenBucketRateLimiter) {
  return (req: any, res: any, next: any) => {
    // In development, use a consistent identifier to avoid issues
    const identifier = isDev ? 'dev-client' : (req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown');
    
    if (!limiter.isAllowed(identifier)) {
      const remaining = limiter.getRemainingTokens(identifier);
      const windowRemaining = limiter.getWindowRemaining(identifier);
      
      res.setHeader('X-RateLimit-Remaining-Tokens', Math.floor(remaining));
      res.setHeader('X-RateLimit-Remaining-Requests', windowRemaining);
      res.setHeader('X-RateLimit-Reset', Date.now() + 60000);
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60,
        remainingTokens: Math.floor(remaining),
        remainingRequests: windowRemaining
      });
    }
    
    // Add rate limit headers to successful requests
    res.setHeader('X-RateLimit-Remaining-Tokens', Math.floor(limiter.getRemainingTokens(identifier)));
    res.setHeader('X-RateLimit-Remaining-Requests', limiter.getWindowRemaining(identifier));
    
    next();
  };
}