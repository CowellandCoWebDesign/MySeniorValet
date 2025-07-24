import { Request, Response, NextFunction } from 'express';
import { redisCache } from './redis-cache';

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  threats: {
    sqlInjection: number;
    xss: number;
    ddos: number;
    bruteForce: number;
    suspicious: number;
  };
  topBlockedIPs: Array<{
    ip: string;
    count: number;
    lastBlocked: Date;
    reason: string;
  }>;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  uptime: number;
}

interface ThreatAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  ip: string;
  timestamp: Date;
  details: any;
  resolved: boolean;
}

class SecurityDashboard {
  private metrics: SecurityMetrics;
  private alerts: ThreatAlert[] = [];
  private responseTimes: number[] = [];

  constructor() {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      threats: {
        sqlInjection: 0,
        xss: 0,
        ddos: 0,
        bruteForce: 0,
        suspicious: 0
      },
      topBlockedIPs: [],
      responseTime: {
        average: 0,
        p95: 0,
        p99: 0
      },
      uptime: 100
    };

    // Load persisted metrics from cache
    this.loadMetrics();
    
    // Save metrics every 5 minutes
    setInterval(() => this.saveMetrics(), 5 * 60 * 1000);
  }

  private async loadMetrics(): Promise<void> {
    try {
      const cachedMetrics = await redisCache.getCachedStats('security_metrics');
      if (cachedMetrics) {
        this.metrics = { ...this.metrics, ...cachedMetrics };
      }

      const cachedAlerts = await redisCache.getCachedStats('security_alerts');
      if (cachedAlerts) {
        this.alerts = cachedAlerts;
      }
    } catch (error) {
      console.log('Failed to load security metrics from cache:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      await redisCache.cacheStats('security_metrics', this.metrics, 86400); // 24 hours
      await redisCache.cacheStats('security_alerts', this.alerts.slice(-100), 86400); // Keep last 100 alerts
    } catch (error) {
      console.log('Failed to save security metrics to cache:', error);
    }
  }

  // Record security events
  recordRequest(): void {
    this.metrics.totalRequests++;
  }

  recordBlocked(ip: string, reason: string): void {
    this.metrics.blockedRequests++;
    
    // Update blocked IPs list
    const existing = this.metrics.topBlockedIPs.find(item => item.ip === ip);
    if (existing) {
      existing.count++;
      existing.lastBlocked = new Date();
      existing.reason = reason;
    } else {
      this.metrics.topBlockedIPs.push({
        ip,
        count: 1,
        lastBlocked: new Date(),
        reason
      });
    }

    // Keep only top 20 blocked IPs
    this.metrics.topBlockedIPs.sort((a, b) => b.count - a.count);
    this.metrics.topBlockedIPs = this.metrics.topBlockedIPs.slice(0, 20);
  }

  recordThreat(type: keyof SecurityMetrics['threats'], ip: string, details: any): void {
    this.metrics.threats[type]++;
    
    // Create threat alert
    const alert: ThreatAlert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.getThreatSeverity(type),
      message: this.getThreatMessage(type, ip),
      ip,
      timestamp: new Date(),
      details,
      resolved: false
    };

    this.alerts.unshift(alert);
    
    // Keep only last 1000 alerts in memory
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    // Auto-resolve low priority alerts after 1 hour
    if (alert.type === 'low') {
      setTimeout(() => {
        alert.resolved = true;
      }, 60 * 60 * 1000);
    }
  }

  private getThreatSeverity(type: keyof SecurityMetrics['threats']): ThreatAlert['type'] {
    const severityMap: Record<keyof SecurityMetrics['threats'], ThreatAlert['type']> = {
      sqlInjection: 'critical',
      xss: 'high',
      ddos: 'critical',
      bruteForce: 'medium',
      suspicious: 'low'
    };
    return severityMap[type];
  }

  private getThreatMessage(type: keyof SecurityMetrics['threats'], ip: string): string {
    const messages: Record<keyof SecurityMetrics['threats'], string> = {
      sqlInjection: `SQL injection attempt detected from ${ip}`,
      xss: `XSS attack attempt detected from ${ip}`,
      ddos: `DDoS attack pattern detected from ${ip}`,
      bruteForce: `Brute force attack detected from ${ip}`,
      suspicious: `Suspicious activity detected from ${ip}`
    };
    return messages[type];
  }

  recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    
    // Keep only last 1000 response times for calculations
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    // Update metrics
    this.updateResponseTimeMetrics();
  }

  private updateResponseTimeMetrics(): void {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    this.metrics.responseTime.average = sum / sorted.length;
    this.metrics.responseTime.p95 = sorted[Math.floor(sorted.length * 0.95)];
    this.metrics.responseTime.p99 = sorted[Math.floor(sorted.length * 0.99)];
  }

  // Get current metrics
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  // Get recent alerts
  getAlerts(limit: number = 50): ThreatAlert[] {
    return this.alerts.slice(0, limit);
  }

  // Get unresolved alerts
  getUnresolvedAlerts(): ThreatAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolve alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  // Security dashboard middleware
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      // Record request
      this.recordRequest();

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(this: Response, chunk?: any, encoding?: any) {
        const responseTime = Date.now() - start;
        securityDashboard.recordResponseTime(responseTime);
        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Generate security report
  generateReport(): {
    summary: {
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      totalThreats: number;
      blockRate: number;
      uptime: number;
    };
    details: SecurityMetrics;
    recommendations: string[];
  } {
    const totalThreats = Object.values(this.metrics.threats).reduce((a, b) => a + b, 0);
    const blockRate = this.metrics.totalRequests > 0 
      ? (this.metrics.blockedRequests / this.metrics.totalRequests) * 100 
      : 0;

    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (totalThreats > 100) threatLevel = 'critical';
    else if (totalThreats > 50) threatLevel = 'high';
    else if (totalThreats > 10) threatLevel = 'medium';

    const recommendations: string[] = [];
    
    if (blockRate > 10) {
      recommendations.push('High block rate detected - consider implementing CAPTCHA or additional verification');
    }
    
    if (this.metrics.threats.sqlInjection > 0) {
      recommendations.push('SQL injection attempts detected - review input validation and parameterized queries');
    }
    
    if (this.metrics.threats.ddos > 10) {
      recommendations.push('DDoS patterns detected - consider implementing rate limiting or CDN protection');
    }
    
    if (this.metrics.responseTime.average > 2000) {
      recommendations.push('High response times detected - consider performance optimization');
    }

    return {
      summary: {
        threatLevel,
        totalThreats,
        blockRate: Math.round(blockRate * 100) / 100,
        uptime: this.metrics.uptime
      },
      details: this.getMetrics(),
      recommendations
    };
  }

  // Reset metrics (for testing or cleanup)
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      threats: {
        sqlInjection: 0,
        xss: 0,
        ddos: 0,
        bruteForce: 0,
        suspicious: 0
      },
      topBlockedIPs: [],
      responseTime: {
        average: 0,
        p95: 0,
        p99: 0
      },
      uptime: 100
    };
    this.alerts = [];
    this.responseTimes = [];
  }
}

export const securityDashboard = new SecurityDashboard();