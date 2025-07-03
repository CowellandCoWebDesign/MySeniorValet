/**
 * Performance monitoring system for 10,000+ users
 * Tracks response times, error rates, and system health
 */

interface MetricEntry {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface PerformanceMetrics {
  responseTime: MetricEntry[];
  errorRate: MetricEntry[];
  requestCount: MetricEntry[];
  activeUsers: MetricEntry[];
  memoryUsage: MetricEntry[];
  cpuUsage: MetricEntry[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private readonly maxDataPoints = 1000;
  private readonly cleanupInterval = 300000; // 5 minutes

  constructor() {
    this.metrics = {
      responseTime: [],
      errorRate: [],
      requestCount: [],
      activeUsers: [],
      memoryUsage: [],
      cpuUsage: []
    };

    this.startSystemMonitoring();
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  // Record response time for API endpoints
  recordResponseTime(endpoint: string, duration: number): void {
    this.metrics.responseTime.push({
      value: duration,
      timestamp: Date.now(),
      labels: { endpoint }
    });
  }

  // Record error occurrence
  recordError(endpoint: string, errorType: string): void {
    const now = Date.now();
    const recentErrors = this.metrics.errorRate.filter(m => now - m.timestamp < 60000);
    const errorRate = recentErrors.length / 60; // errors per second
    
    this.metrics.errorRate.push({
      value: errorRate,
      timestamp: now,
      labels: { endpoint, errorType }
    });
  }

  // Record request count
  recordRequest(endpoint: string): void {
    const now = Date.now();
    const recentRequests = this.metrics.requestCount.filter(m => now - m.timestamp < 60000);
    
    this.metrics.requestCount.push({
      value: recentRequests.length + 1,
      timestamp: now,
      labels: { endpoint }
    });
  }

  // Record active user count
  recordActiveUsers(count: number): void {
    this.metrics.activeUsers.push({
      value: count,
      timestamp: Date.now()
    });
  }

  private startSystemMonitoring(): void {
    // Monitor system metrics every 30 seconds
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.metrics.memoryUsage.push({
        value: memUsage.heapUsed / 1024 / 1024, // MB
        timestamp: Date.now()
      });

      this.metrics.cpuUsage.push({
        value: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        timestamp: Date.now()
      });
    }, 30000);
  }

  // Get performance statistics
  getStats(timeframe = 300000): any { // Default 5 minutes
    const now = Date.now();
    const cutoff = now - timeframe;

    const recentResponseTimes = this.metrics.responseTime.filter(m => m.timestamp > cutoff);
    const recentErrors = this.metrics.errorRate.filter(m => m.timestamp > cutoff);
    const recentRequests = this.metrics.requestCount.filter(m => m.timestamp > cutoff);
    const recentMemory = this.metrics.memoryUsage.filter(m => m.timestamp > cutoff);

    return {
      performance: {
        avgResponseTime: this.calculateAverage(recentResponseTimes),
        p95ResponseTime: this.calculatePercentile(recentResponseTimes, 95),
        p99ResponseTime: this.calculatePercentile(recentResponseTimes, 99),
        maxResponseTime: Math.max(...recentResponseTimes.map(m => m.value), 0)
      },
      reliability: {
        errorRate: this.calculateAverage(recentErrors),
        uptime: this.calculateUptime(),
        successRate: this.calculateSuccessRate(recentRequests, recentErrors)
      },
      throughput: {
        requestsPerSecond: recentRequests.length / (timeframe / 1000),
        totalRequests: recentRequests.length,
        peakRPS: this.calculatePeakRPS(recentRequests)
      },
      resources: {
        memoryUsage: this.getLatestValue(recentMemory),
        memoryTrend: this.calculateTrend(recentMemory),
        activeConnections: this.getActiveConnections()
      },
      health: {
        status: this.getHealthStatus(),
        lastCheck: now,
        timeframe: timeframe
      }
    };
  }

  // Get detailed endpoint statistics
  getEndpointStats(endpoint: string, timeframe = 300000): any {
    const now = Date.now();
    const cutoff = now - timeframe;

    const endpointResponses = this.metrics.responseTime.filter(m => 
      m.timestamp > cutoff && m.labels?.endpoint === endpoint
    );
    
    const endpointErrors = this.metrics.errorRate.filter(m => 
      m.timestamp > cutoff && m.labels?.endpoint === endpoint
    );

    return {
      endpoint,
      avgResponseTime: this.calculateAverage(endpointResponses),
      errorCount: endpointErrors.length,
      requestCount: endpointResponses.length,
      errorRate: endpointErrors.length / Math.max(endpointResponses.length, 1)
    };
  }

  private calculateAverage(metrics: MetricEntry[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  private calculatePercentile(metrics: MetricEntry[], percentile: number): number {
    if (metrics.length === 0) return 0;
    
    const sorted = metrics.map(m => m.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateUptime(): number {
    // Simple uptime calculation based on error rate
    const recentErrors = this.metrics.errorRate.filter(m => 
      Date.now() - m.timestamp < 3600000 // Last hour
    );
    
    const totalRequests = this.metrics.requestCount.filter(m => 
      Date.now() - m.timestamp < 3600000
    ).length;

    if (totalRequests === 0) return 100;
    return Math.max(0, 100 - (recentErrors.length / totalRequests * 100));
  }

  private calculateSuccessRate(requests: MetricEntry[], errors: MetricEntry[]): number {
    if (requests.length === 0) return 100;
    return Math.max(0, 100 - (errors.length / requests.length * 100));
  }

  private calculatePeakRPS(requests: MetricEntry[]): number {
    if (requests.length === 0) return 0;
    
    // Group requests by second and find peak
    const requestsBySecond = new Map<number, number>();
    
    requests.forEach(request => {
      const second = Math.floor(request.timestamp / 1000);
      requestsBySecond.set(second, (requestsBySecond.get(second) || 0) + 1);
    });
    
    return Math.max(...Array.from(requestsBySecond.values()), 0);
  }

  private calculateTrend(metrics: MetricEntry[]): 'increasing' | 'decreasing' | 'stable' {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-10);
    const first = recent[0].value;
    const last = recent[recent.length - 1].value;
    
    const change = ((last - first) / first) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  private getLatestValue(metrics: MetricEntry[]): number {
    if (metrics.length === 0) return 0;
    return metrics[metrics.length - 1].value;
  }

  private getActiveConnections(): number {
    // This would be implemented with actual connection tracking
    return Math.floor(Math.random() * 100) + 50; // Mock for now
  }

  private getHealthStatus(): 'healthy' | 'warning' | 'critical' {
    const stats = this.getStats(60000); // Last minute
    
    if (stats.performance.avgResponseTime > 5000 || stats.reliability.errorRate > 5) {
      return 'critical';
    }
    
    if (stats.performance.avgResponseTime > 1000 || stats.reliability.errorRate > 1) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private cleanup(): void {
    const cutoff = Date.now() - 3600000; // Keep 1 hour of data
    
    Object.keys(this.metrics).forEach(key => {
      const metricArray = this.metrics[key as keyof PerformanceMetrics];
      const filtered = metricArray.filter(m => m.timestamp > cutoff);
      this.metrics[key as keyof PerformanceMetrics] = filtered;
    });
  }

  // Express middleware for automatic monitoring
  middleware() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      const endpoint = `${req.method} ${req.path}`;
      
      this.recordRequest(endpoint);
      
      const originalSend = res.send;
      res.send = function(data: any) {
        const duration = Date.now() - start;
        monitor.recordResponseTime(endpoint, duration);
        
        if (res.statusCode >= 400) {
          monitor.recordError(endpoint, `HTTP_${res.statusCode}`);
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
}

export const monitor = new PerformanceMonitor();