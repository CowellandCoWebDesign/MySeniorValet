import { db } from './db';
import { securityAuditLogs } from '@shared/schema';
import type { Request } from 'express';

export interface AuditLogEntry {
  userId?: number;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent?: string;
  details?: {
    sessionId?: string;
    errorMessage?: string;
    requestId?: string;
    riskScore?: number;
    metadata?: Record<string, any>;
  };
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
}

export class SecurityAuditService {
  async logSecurityEvent(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(securityAuditLogs).values({
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details,
        riskLevel: entry.riskLevel || 'low',
        success: entry.success ?? true,
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Don't throw - audit logging shouldn't break the application
    }
  }

  async logAuthentication(req: Request, action: 'login' | 'logout' | 'failed_login', userId?: number, sessionId?: string, errorMessage?: string): Promise<void> {
    const riskScore = this.calculateRiskScore(req, action, !!errorMessage);
    
    await this.logSecurityEvent({
      userId,
      action,
      resource: req.originalUrl,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      details: {
        sessionId,
        errorMessage,
        riskScore,
        metadata: {
          timestamp: new Date().toISOString(),
          method: req.method,
        }
      },
      riskLevel: this.getRiskLevel(riskScore),
      success: action !== 'failed_login',
    });
  }

  async logDataAccess(req: Request, resource: string, userId?: number, success: boolean = true): Promise<void> {
    const riskScore = this.calculateRiskScore(req, 'data_access', !success);
    
    await this.logSecurityEvent({
      userId,
      action: 'data_access',
      resource,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      details: {
        riskScore,
        metadata: {
          timestamp: new Date().toISOString(),
          method: req.method,
          query: req.query,
        }
      },
      riskLevel: this.getRiskLevel(riskScore),
      success,
    });
  }

  async logSuspiciousActivity(req: Request, reason: string, metadata?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      action: 'suspicious_activity',
      resource: req.originalUrl,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      details: {
        errorMessage: reason,
        riskScore: 80, // High risk for suspicious activity
        metadata: {
          timestamp: new Date().toISOString(),
          method: req.method,
          body: req.body,
          query: req.query,
          ...metadata,
        }
      },
      riskLevel: 'high',
      success: false,
    });
  }

  private calculateRiskScore(req: Request, action: string, isFailure: boolean): number {
    let score = 0;

    // Base score for action type
    const actionScores: Record<string, number> = {
      'login': 10,
      'failed_login': 40,
      'logout': 5,
      'data_access': 15,
      'admin_action': 25,
      'suspicious_activity': 80,
    };

    score += actionScores[action] || 10;

    // Increase score for failures
    if (isFailure) {
      score += 30;
    }

    // Check for suspicious patterns
    const userAgent = req.get('User-Agent') || '';
    if (!userAgent || userAgent.length < 10) {
      score += 20; // Missing or suspicious user agent
    }

    // Check for automated requests
    if (userAgent.toLowerCase().includes('bot') || 
        userAgent.toLowerCase().includes('crawler') ||
        userAgent.toLowerCase().includes('script')) {
      score += 15;
    }

    // Time-based risk (unusual hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 10; // Late night/early morning activity
    }

    return Math.min(score, 100); // Cap at 100
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // Cleanup old audit logs (for compliance and storage management)
  async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const { eq, lt } = await import('drizzle-orm');
      await db.delete(securityAuditLogs).where(lt(securityAuditLogs.timestamp, cutoffDate));
      console.log(`Cleaned up audit logs older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }

  // Get security metrics for monitoring
  async getSecurityMetrics(hours: number = 24): Promise<{
    totalEvents: number;
    failedLogins: number;
    suspiciousActivity: number;
    highRiskEvents: number;
    uniqueIPs: number;
  }> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    try {
      const { count, countDistinct, eq, gte, and, or } = await import('drizzle-orm');
      
      const [totalEvents] = await db
        .select({ count: count() })
        .from(securityAuditLogs)
        .where(gte(securityAuditLogs.timestamp, since));

      const [failedLogins] = await db
        .select({ count: count() })
        .from(securityAuditLogs)
        .where(and(
          gte(securityAuditLogs.timestamp, since),
          eq(securityAuditLogs.action, 'failed_login')
        ));

      const [suspiciousActivity] = await db
        .select({ count: count() })
        .from(securityAuditLogs)
        .where(and(
          gte(securityAuditLogs.timestamp, since),
          eq(securityAuditLogs.action, 'suspicious_activity')
        ));

      const [highRiskEvents] = await db
        .select({ count: count() })
        .from(securityAuditLogs)
        .where(and(
          gte(securityAuditLogs.timestamp, since),
          or(
            eq(securityAuditLogs.riskLevel, 'high'),
            eq(securityAuditLogs.riskLevel, 'critical')
          )
        ));

      const [uniqueIPs] = await db
        .select({ count: countDistinct(securityAuditLogs.ipAddress) })
        .from(securityAuditLogs)
        .where(gte(securityAuditLogs.timestamp, since));

      return {
        totalEvents: totalEvents.count,
        failedLogins: failedLogins.count,
        suspiciousActivity: suspiciousActivity.count,
        highRiskEvents: highRiskEvents.count,
        uniqueIPs: uniqueIPs.count,
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        totalEvents: 0,
        failedLogins: 0,
        suspiciousActivity: 0,
        highRiskEvents: 0,
        uniqueIPs: 0,
      };
    }
  }
}

export const auditService = new SecurityAuditService();

// Schedule daily cleanup of old logs
setInterval(() => {
  auditService.cleanupOldLogs(90); // Keep 90 days of logs
}, 24 * 60 * 60 * 1000); // Run daily