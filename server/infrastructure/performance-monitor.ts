import { Request, Response, NextFunction } from 'express';
import { redisCache } from './redis-cache';

interface PerformanceMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    slowestEndpoints: Array<{
      endpoint: string;
      averageTime: number;
      requestCount: number;
    }>;
  };
  database: {
    queriesPerSecond: number;
    averageQueryTime: number;
    slowQueries: Array<{
      query: string;
      duration: number;
      timestamp: Date;
    }>;
  };
  cache: {
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    averageRetrievalTime: number;
  };
  memory: {
    usage: number;
    peak: number;
    gcFrequency: number;
  };
  uptime: number;
  errors: Array<{
    message: string;
    stack: string;
    endpoint: string;
    timestamp: Date;
    count: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;
  private requestTimes: Map<string, number[]> = new Map();
  private activeRequests: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        slowestEndpoints: []
      },
      database: {
        queriesPerSecond: 0,
        averageQueryTime: 0,
        slowQueries: []
      },
      cache: {
        hitRate: 0,
        totalHits: 0,
        totalMisses: 0,
        averageRetrievalTime: 0
      },
      memory: {
        usage: 0,
        peak: 0,
        gcFrequency: 0
      },
      uptime: 0,
      errors: []
    };

    // Load persisted metrics
    this.loadMetrics();
    
    // Save metrics every minute
    setInterval(() => this.saveMetrics(), 60 * 1000);
    
    // Update system metrics every 30 seconds
    setInterval(() => this.updateSystemMetrics(), 30 * 1000);
  }

  private async loadMetrics(): Promise<void> {
    try {
      const cachedMetrics = await redisCache.getCachedStats('performance_metrics');
      if (cachedMetrics) {
        this.metrics = { ...this.metrics, ...cachedMetrics };
      }
    } catch (error) {
      console.log('Failed to load performance metrics:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      await redisCache.cacheStats('performance_metrics', this.metrics, 86400);
    } catch (error) {
      console.log('Failed to save performance metrics:', error);
    }
  }

  private updateSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    this.metrics.memory.usage = memUsage.heapUsed;
    this.metrics.memory.peak = Math.max(this.metrics.memory.peak, memUsage.heapUsed);
    this.metrics.uptime = Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Middleware for request monitoring
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = `${req.method}:${req.path}`;
      
      this.activeRequests.set(requestId, startTime);
      this.metrics.requests.total++;

      // Override res.end to capture response time and status
      const originalEnd = res.end;
      res.end = function(this: Response, chunk?: any, encoding?: any) {
        const duration = Date.now() - startTime;
        
        // Record response time
        performanceMonitor.recordRequestTime(requestId, duration);
        
        // Update success/failure counts
        if (res.statusCode >= 200 && res.statusCode < 400) {
          performanceMonitor.metrics.requests.successful++;
        } else {
          performanceMonitor.metrics.requests.failed++;
        }

        // Remove from active requests
        performanceMonitor.activeRequests.delete(requestId);
        
        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  private recordRequestTime(endpoint: string, duration: number): void {
    if (!this.requestTimes.has(endpoint)) {
      this.requestTimes.set(endpoint, []);
    }
    
    const times = this.requestTimes.get(endpoint)!;
    times.push(duration);
    
    // Keep only last 100 request times per endpoint
    if (times.length > 100) {
      times.splice(0, times.length - 100);
    }

    // Update average response time
    this.updateAverageResponseTime();
    
    // Update slowest endpoints
    this.updateSlowestEndpoints();
  }

  private updateAverageResponseTime(): void {
    let totalTime = 0;
    let totalRequests = 0;
    
    for (const times of this.requestTimes.values()) {
      totalTime += times.reduce((a, b) => a + b, 0);
      totalRequests += times.length;
    }
    
    this.metrics.requests.averageResponseTime = totalRequests > 0 ? totalTime / totalRequests : 0;
  }

  private updateSlowestEndpoints(): void {
    const endpointStats: Array<{
      endpoint: string;
      averageTime: number;
      requestCount: number;
    }> = [];

    for (const [endpoint, times] of this.requestTimes.entries()) {
      if (times.length > 0) {
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        endpointStats.push({
          endpoint,
          averageTime,
          requestCount: times.length
        });
      }
    }

    // Sort by average time and keep top 10
    this.metrics.requests.slowestEndpoints = endpointStats
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);
  }

  // Database query monitoring
  recordDatabaseQuery(query: string, duration: number): void {
    // Update slow queries if this is slower than 1 second
    if (duration > 1000) {
      this.metrics.database.slowQueries.unshift({
        query: query.substring(0, 200), // Truncate long queries
        duration,
        timestamp: new Date()
      });
      
      // Keep only last 50 slow queries
      if (this.metrics.database.slowQueries.length > 50) {
        this.metrics.database.slowQueries.splice(50);
      }
    }

    // Calculate queries per second (approximate)
    this.metrics.database.queriesPerSecond = this.calculateQueriesPerSecond();
  }

  private calculateQueriesPerSecond(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track queries over time windows
    const uptime = this.metrics.uptime || 1;
    return this.metrics.requests.total / uptime;
  }

  // Cache monitoring
  recordCacheHit(): void {
    this.metrics.cache.totalHits++;
    this.updateCacheHitRate();
  }

  recordCacheMiss(): void {
    this.metrics.cache.totalMisses++;
    this.updateCacheHitRate();
  }

  private updateCacheHitRate(): void {
    const total = this.metrics.cache.totalHits + this.metrics.cache.totalMisses;
    this.metrics.cache.hitRate = total > 0 ? (this.metrics.cache.totalHits / total) * 100 : 0;
  }

  // Error monitoring
  recordError(error: Error, endpoint: string): void {
    const errorMessage = error.message;
    const existingError = this.metrics.errors.find(e => e.message === errorMessage && e.endpoint === endpoint);
    
    if (existingError) {
      existingError.count++;
      existingError.timestamp = new Date();
    } else {
      this.metrics.errors.unshift({
        message: errorMessage,
        stack: error.stack || '',
        endpoint,
        timestamp: new Date(),
        count: 1
      });
    }
    
    // Keep only last 100 unique errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors.splice(100);
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    this.updateSystemMetrics();
    return { ...this.metrics };
  }

  // Get real-time status
  getRealTimeStatus(): {
    activeRequests: number;
    systemLoad: {
      memory: string;
      uptime: string;
      requestRate: number;
    };
    health: 'excellent' | 'good' | 'warning' | 'critical';
  } {
    const memoryUsageMB = Math.round(this.metrics.memory.usage / 1024 / 1024);
    const uptimeHours = Math.floor(this.metrics.uptime / 3600);
    const requestRate = this.metrics.uptime > 0 ? this.metrics.requests.total / this.metrics.uptime : 0;
    
    let health: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    
    if (this.metrics.requests.averageResponseTime > 5000) health = 'critical';
    else if (this.metrics.requests.averageResponseTime > 2000) health = 'warning';
    else if (this.metrics.requests.averageResponseTime > 1000) health = 'good';
    
    if (memoryUsageMB > 1000) health = 'critical';
    else if (memoryUsageMB > 500) health = 'warning';

    return {
      activeRequests: this.activeRequests.size,
      systemLoad: {
        memory: `${memoryUsageMB} MB`,
        uptime: `${uptimeHours}h`,
        requestRate: Math.round(requestRate * 100) / 100
      },
      health
    };
  }

  // Performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.requests.averageResponseTime > 2000) {
      recommendations.push('High response times detected - consider implementing caching or optimizing slow endpoints');
    }
    
    if (this.metrics.cache.hitRate < 70) {
      recommendations.push('Low cache hit rate - review caching strategy and increase cache TTL for stable data');
    }
    
    if (this.metrics.database.slowQueries.length > 10) {
      recommendations.push('Multiple slow database queries detected - review query optimization and indexing');
    }
    
    if (this.metrics.memory.usage > 500 * 1024 * 1024) { // 500MB
      recommendations.push('High memory usage detected - review for memory leaks and consider garbage collection tuning');
    }
    
    if (this.metrics.requests.failed / this.metrics.requests.total > 0.05) { // 5% error rate
      recommendations.push('High error rate detected - review error logs and implement better error handling');
    }

    const slowEndpoints = this.metrics.requests.slowestEndpoints.filter(e => e.averageTime > 1000);
    if (slowEndpoints.length > 0) {
      recommendations.push(`Slow endpoints detected: ${slowEndpoints.map(e => e.endpoint).join(', ')} - consider optimization`);
    }

    return recommendations;
  }

  // Generate performance report
  generateReport(): {
    summary: {
      overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
      uptime: string;
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
    };
    details: PerformanceMetrics;
    recommendations: string[];
    trends: {
      responseTimetrend: 'improving' | 'stable' | 'degrading';
      errorTrend: 'improving' | 'stable' | 'degrading';
      memoryTrend: 'stable' | 'increasing' | 'concerning';
    };
  } {
    const realTimeStatus = this.getRealTimeStatus();
    const errorRate = this.metrics.requests.total > 0 
      ? (this.metrics.requests.failed / this.metrics.requests.total) * 100 
      : 0;

    return {
      summary: {
        overallHealth: realTimeStatus.health,
        uptime: realTimeStatus.systemLoad.uptime,
        totalRequests: this.metrics.requests.total,
        averageResponseTime: Math.round(this.metrics.requests.averageResponseTime),
        errorRate: Math.round(errorRate * 100) / 100
      },
      details: this.getMetrics(),
      recommendations: this.getRecommendations(),
      trends: {
        responseTimetrend: 'stable', // Would require historical data to determine
        errorTrend: 'stable',
        memoryTrend: 'stable'
      }
    };
  }

  // Reset metrics (for testing)
  reset(): void {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        slowestEndpoints: []
      },
      database: {
        queriesPerSecond: 0,
        averageQueryTime: 0,
        slowQueries: []
      },
      cache: {
        hitRate: 0,
        totalHits: 0,
        totalMisses: 0,
        averageRetrievalTime: 0
      },
      memory: {
        usage: 0,
        peak: 0,
        gcFrequency: 0
      },
      uptime: 0,
      errors: []
    };
    
    this.requestTimes.clear();
    this.activeRequests.clear();
    this.startTime = Date.now();
  }
}

export const performanceMonitor = new PerformanceMonitor();