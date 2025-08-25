import { db } from '../db';
import { notificationLogs, notificationMetrics } from '@shared/schema';
import { desc, gte, and, eq, sql } from 'drizzle-orm';

interface NotificationEvent {
  type: string;
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  metadata?: any;
  error?: string;
  timestamp: Date;
}

export class NotificationMonitor {
  private static events: NotificationEvent[] = [];
  private static metrics = {
    totalSent: 0,
    totalFailed: 0,
    byType: {} as Record<string, number>,
    byRecipient: {} as Record<string, number>,
    lastHourCount: 0,
    averageDeliveryTime: 0
  };

  static logEvent(event: NotificationEvent) {
    this.events.push(event);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Update metrics
    if (event.status === 'sent') {
      this.metrics.totalSent++;
    } else if (event.status === 'failed') {
      this.metrics.totalFailed++;
    }

    // Track by type
    this.metrics.byType[event.type] = (this.metrics.byType[event.type] || 0) + 1;

    // Track by recipient domain
    const domain = event.recipient.split('@')[1] || 'unknown';
    this.metrics.byRecipient[domain] = (this.metrics.byRecipient[domain] || 0) + 1;

    // Log to database (non-blocking)
    this.persistToDatabase(event).catch(error => {
      console.error('Failed to persist notification log:', error);
    });
  }

  private static async persistToDatabase(event: NotificationEvent) {
    try {
      // Store in database for long-term analysis
      // Note: This would require adding notificationLogs table to schema
      // For now, just log to console in production
      if (process.env.NODE_ENV === 'production') {
        console.log('📊 Notification Event:', {
          type: event.type,
          recipient: event.recipient,
          status: event.status,
          timestamp: event.timestamp.toISOString()
        });
      }
    } catch (error) {
      console.error('Database persistence error:', error);
    }
  }

  static getRecentEvents(limit = 100): NotificationEvent[] {
    return this.events.slice(-limit);
  }

  static getMetrics() {
    // Calculate last hour count
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics.lastHourCount = this.events.filter(
      e => e.timestamp > oneHourAgo
    ).length;

    return {
      ...this.metrics,
      successRate: this.metrics.totalSent / (this.metrics.totalSent + this.metrics.totalFailed) || 0,
      recentEvents: this.getRecentEvents(10)
    };
  }

  static getDashboard() {
    const metrics = this.getMetrics();
    const hourlyBreakdown = this.getHourlyBreakdown();
    const topRecipients = this.getTopRecipients();
    const errorPatterns = this.getErrorPatterns();

    return {
      summary: {
        totalSent: metrics.totalSent,
        totalFailed: metrics.totalFailed,
        successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        lastHourCount: metrics.lastHourCount
      },
      byType: metrics.byType,
      hourlyBreakdown,
      topRecipients,
      errorPatterns,
      recentEvents: metrics.recentEvents
    };
  }

  private static getHourlyBreakdown() {
    const breakdown: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = hour.toISOString().slice(0, 13);
      breakdown[hourKey] = 0;
    }

    this.events.forEach(event => {
      const hourKey = event.timestamp.toISOString().slice(0, 13);
      if (breakdown[hourKey] !== undefined) {
        breakdown[hourKey]++;
      }
    });

    return breakdown;
  }

  private static getTopRecipients() {
    const recipients: Record<string, number> = {};
    
    this.events.forEach(event => {
      recipients[event.recipient] = (recipients[event.recipient] || 0) + 1;
    });

    return Object.entries(recipients)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([recipient, count]) => ({ recipient, count }));
  }

  private static getErrorPatterns() {
    const errors: Record<string, number> = {};
    
    this.events
      .filter(e => e.status === 'failed' && e.error)
      .forEach(event => {
        const errorKey = event.error || 'Unknown error';
        errors[errorKey] = (errors[errorKey] || 0) + 1;
      });

    return Object.entries(errors)
      .sort(([, a], [, b]) => b - a)
      .map(([error, count]) => ({ error, count }));
  }

  static checkHealthStatus() {
    const metrics = this.getMetrics();
    const issues = [];

    // Check success rate
    if (metrics.successRate < 0.95) {
      issues.push({
        severity: 'warning',
        message: `Success rate is ${(metrics.successRate * 100).toFixed(1)}% (below 95% threshold)`
      });
    }

    if (metrics.successRate < 0.80) {
      issues.push({
        severity: 'critical',
        message: `CRITICAL: Success rate is ${(metrics.successRate * 100).toFixed(1)}%`
      });
    }

    // Check for spike in failures
    const recentFailures = this.events
      .slice(-100)
      .filter(e => e.status === 'failed').length;
    
    if (recentFailures > 10) {
      issues.push({
        severity: 'warning',
        message: `${recentFailures} failures in last 100 notifications`
      });
    }

    // Check for specific error patterns
    const errorPatterns = this.getErrorPatterns();
    errorPatterns.forEach(pattern => {
      if (pattern.count > 5) {
        issues.push({
          severity: 'warning',
          message: `Repeated error: "${pattern.error}" (${pattern.count} times)`
        });
      }
    });

    return {
      healthy: issues.length === 0,
      issues,
      metrics: {
        successRate: metrics.successRate,
        lastHourCount: metrics.lastHourCount,
        totalSent: metrics.totalSent,
        totalFailed: metrics.totalFailed
      }
    };
  }
}

// Auto-report health status every hour
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const health = NotificationMonitor.checkHealthStatus();
    if (!health.healthy) {
      console.warn('⚠️ Notification System Health Issues:', health.issues);
    } else {
      console.log('✅ Notification System Healthy:', health.metrics);
    }
  }, 60 * 60 * 1000); // Every hour
}