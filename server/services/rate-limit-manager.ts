import { RateLimiterMemory } from 'rate-limiter-flexible';

interface RateLimitConfig {
  points: number; // Number of requests
  duration: number; // Per duration in seconds
  blockDuration?: number; // Block duration in seconds
}

export class RateLimitManager {
  private static limiters = new Map<string, RateLimiterMemory>();
  private static configs = new Map<string, RateLimitConfig>();
  
  // Default configurations based on endpoint type
  private static readonly DEFAULT_CONFIGS = {
    // Authentication endpoints - strict limits
    'auth_login': { points: 5, duration: 60, blockDuration: 900 }, // 5 per minute, block 15 min
    'auth_register': { points: 3, duration: 3600, blockDuration: 3600 }, // 3 per hour
    'auth_reset': { points: 3, duration: 3600, blockDuration: 3600 }, // 3 per hour
    
    // API endpoints - moderate limits  
    'api_search': { points: 30, duration: 60 }, // 30 per minute
    'api_communities': { points: 60, duration: 60 }, // 60 per minute
    'api_tours': { points: 20, duration: 60 }, // 20 per minute
    'api_claims': { points: 5, duration: 3600 }, // 5 per hour
    'api_emergency': { points: 10, duration: 60 }, // 10 per minute (safety critical)
    
    // Data endpoints - relaxed limits
    'data_map': { points: 100, duration: 60 }, // 100 per minute
    'data_clusters': { points: 100, duration: 60 }, // 100 per minute
    'data_spatial': { points: 100, duration: 60 }, // 100 per minute
    
    // Webhook endpoints - very relaxed
    'webhook_stripe': { points: 1000, duration: 60 }, // 1000 per minute
    'webhook_sendgrid': { points: 1000, duration: 60 }, // 1000 per minute
    
    // Admin endpoints - no limits for super admins
    'admin_all': { points: 10000, duration: 60 }, // Effectively unlimited
    
    // Default fallback
    'default': { points: 50, duration: 60 } // 50 per minute
  };

  static initialize() {
    // Create rate limiters for each configuration
    Object.entries(this.DEFAULT_CONFIGS).forEach(([key, config]) => {
      this.configs.set(key, config);
      this.limiters.set(key, new RateLimiterMemory({
        points: config.points,
        duration: config.duration,
        blockDuration: config.blockDuration
      }));
    });

    console.log('✅ Rate limit manager initialized with intelligent limits');
    this.logCurrentLimits();
  }

  static async checkLimit(
    endpoint: string, 
    identifier: string,
    isAdmin = false
  ): Promise<{ allowed: boolean; remainingPoints?: number; resetTime?: Date }> {
    // Super admins bypass rate limits
    if (isAdmin && (identifier === 'william.cowell01@gmail.com' || identifier === 'admin@myseniorvalet.com')) {
      return { allowed: true, remainingPoints: 9999 };
    }

    // Determine which limiter to use
    const limiterKey = this.getlimiterKey(endpoint);
    const limiter = this.limiters.get(limiterKey) || this.limiters.get('default')!;

    try {
      const result = await limiter.consume(identifier, 1);
      return {
        allowed: true,
        remainingPoints: result.remainingPoints,
        resetTime: new Date(Date.now() + result.msBeforeNext)
      };
    } catch (rejRes: any) {
      return {
        allowed: false,
        remainingPoints: rejRes.remainingPoints || 0,
        resetTime: new Date(Date.now() + rejRes.msBeforeNext)
      };
    }
  }

  private static getlimiterKey(endpoint: string): string {
    // Authentication endpoints
    if (endpoint.includes('/auth/login')) return 'auth_login';
    if (endpoint.includes('/auth/register')) return 'auth_register';
    if (endpoint.includes('/auth/reset')) return 'auth_reset';
    
    // API endpoints
    if (endpoint.includes('/api/search')) return 'api_search';
    if (endpoint.includes('/api/communities')) return 'api_communities';
    if (endpoint.includes('/api/tours') || endpoint.includes('/api/tourmate')) return 'api_tours';
    if (endpoint.includes('/api/communities/claim')) return 'api_claims';
    if (endpoint.includes('/api/emergency')) return 'api_emergency';
    
    // Data endpoints
    if (endpoint.includes('/clusters')) return 'data_clusters';
    if (endpoint.includes('/spatial')) return 'data_spatial';
    if (endpoint.includes('/map')) return 'data_map';
    
    // Webhook endpoints
    if (endpoint.includes('/webhook') || endpoint.includes('/stripe/webhook')) return 'webhook_stripe';
    
    // Admin endpoints
    if (endpoint.includes('/admin')) return 'admin_all';
    
    return 'default';
  }

  static adjustLimit(endpoint: string, newConfig: RateLimitConfig) {
    const limiterKey = this.getlimiterKey(endpoint);
    
    // Update configuration
    this.configs.set(limiterKey, newConfig);
    
    // Create new limiter with updated config
    this.limiters.set(limiterKey, new RateLimiterMemory({
      points: newConfig.points,
      duration: newConfig.duration,
      blockDuration: newConfig.blockDuration
    }));

    console.log(`📊 Rate limit adjusted for ${limiterKey}:`, newConfig);
  }

  static async getUsageStats(identifier: string) {
    const stats: Record<string, any> = {};
    
    for (const [key, limiter] of this.limiters.entries()) {
      try {
        const res = await limiter.get(identifier);
        if (res && res.consumedPoints > 0) {
          stats[key] = {
            consumed: res.consumedPoints,
            remaining: res.remainingPoints,
            resetTime: new Date(Date.now() + res.msBeforeNext)
          };
        }
      } catch (error) {
        // No usage for this limiter
      }
    }

    return stats;
  }

  static logCurrentLimits() {
    console.log('📊 Current Rate Limit Configuration:');
    console.log('=====================================');
    
    this.configs.forEach((config, key) => {
      console.log(`${key}: ${config.points} requests per ${config.duration}s` + 
        (config.blockDuration ? ` (blocks for ${config.blockDuration}s)` : ''));
    });
  }

  static getDynamicRecommendations(metrics: {
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
  }) {
    const recommendations: string[] = [];

    // High response times - reduce limits
    if (metrics.avgResponseTime > 1000) {
      recommendations.push('⚠️ High response times detected. Consider reducing search API limits.');
      this.adjustLimit('/api/search', { points: 20, duration: 60 });
    }

    // High error rate - reduce limits
    if (metrics.errorRate > 0.05) {
      recommendations.push('⚠️ High error rate. Temporarily reducing all API limits by 20%.');
      this.configs.forEach((config, key) => {
        if (!key.includes('admin') && !key.includes('webhook')) {
          this.adjustLimit(key, {
            ...config,
            points: Math.floor(config.points * 0.8)
          });
        }
      });
    }

    // Low activity - can increase limits
    if (metrics.activeUsers < 100 && metrics.avgResponseTime < 200) {
      recommendations.push('✅ System performing well. Limits can be increased if needed.');
    }

    // Very high activity - implement stricter limits
    if (metrics.activeUsers > 1000) {
      recommendations.push('🔥 High traffic detected. Implementing stricter rate limits.');
      this.adjustLimit('/api/search', { points: 15, duration: 60, blockDuration: 300 });
      this.adjustLimit('/api/communities', { points: 30, duration: 60, blockDuration: 300 });
    }

    return recommendations;
  }

  // Auto-adjust limits based on time of day
  static implementTimeBasedLimits() {
    const hour = new Date().getHours();
    
    // Peak hours (9 AM - 5 PM)
    if (hour >= 9 && hour <= 17) {
      console.log('🕐 Peak hours - implementing standard rate limits');
      // Use default configs
    } 
    // Off-peak hours (10 PM - 6 AM)
    else if (hour >= 22 || hour <= 6) {
      console.log('🌙 Off-peak hours - relaxing rate limits by 50%');
      this.configs.forEach((config, key) => {
        if (!key.includes('auth')) { // Keep auth limits strict
          this.adjustLimit(key, {
            ...config,
            points: Math.floor(config.points * 1.5)
          });
        }
      });
    }
    // Normal hours
    else {
      console.log('🌤️ Normal hours - standard rate limits apply');
    }
  }
}

// Initialize on module load
RateLimitManager.initialize();

// Set up automatic time-based adjustments (every hour)
setInterval(() => {
  RateLimitManager.implementTimeBasedLimits();
}, 60 * 60 * 1000);