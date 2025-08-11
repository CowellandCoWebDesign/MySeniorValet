import { Request, Response, NextFunction } from 'express';
import { auditService } from './audit';
import { db } from './db';
import { securityAuditLogs } from '@shared/schema';
import { eq, gte, and, desc, count, countDistinct } from 'drizzle-orm';
import { internalNotifications } from './services/internal-notifications';
import { internalNotificationService } from './services/internal-notifications';

export interface SecurityThreat {
  id: string;
  type: 'injection' | 'brute_force' | 'rate_limit' | 'suspicious_pattern' | 'unknown_user_agent';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  details: Record<string, any>;
  endpoint: string;
  action: string;
}

export interface SecurityMetrics {
  activeUsers: number;
  totalRequests: number;
  failedRequests: number;
  suspiciousActivity: number;
  blockedIPs: string[];
  topEndpoints: { endpoint: string; count: number }[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  recentThreats: SecurityThreat[];
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private threats: SecurityThreat[] = [];
  private blockedIPs: Set<string> = new Set();
  private requestCounts: Map<string, number> = new Map();
  private userAgents: Map<string, number> = new Map();
  private endpoints: Map<string, number> = new Map();
  private suspiciousPatterns: RegExp[] = [
    // SQL Injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|EXEC|EXECUTE)\b)/i,
    /(';|";|--|\/\*|\*\/|xp_|sp_)/i,
    // XSS patterns
    /(<script|<\/script>|javascript:|vbscript:|onload=|onerror=|eval\(|setTimeout\()/i,
    // Command injection
    /(\||;|&|`|\$\(|exec|system|shell_exec|passthru)/i,
    // Path traversal
    /(\.\.\/|\.\.\\|\.\.\%2f|\.\.\%5c)/i,
    // LDAP injection
    /(\*\)|&\(|\|\(|\)|\(cn=|\(uid=|\(mail=)/i,
    // NoSQL injection
    /(\$where|\$ne|\$in|\$nin|\$or|\$and|\$not|\$nor|\$exists|\$type|\$mod|\$regex|\$text|\$search)/i
  ];

  private constructor() {
    // Initialize monitoring
    this.startMonitoring();
  }

  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  private startMonitoring(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);

    // Generate security report every 5 minutes
    setInterval(() => {
      this.generateSecurityReport();
    }, 5 * 60 * 1000);
  }

  public analyzeRequest(req: Request): SecurityThreat[] {
    const threats: SecurityThreat[] = [];
    const timestamp = new Date();
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const endpoint = req.originalUrl;

    // Track request statistics
    this.requestCounts.set(ipAddress, (this.requestCounts.get(ipAddress) || 0) + 1);
    this.userAgents.set(userAgent, (this.userAgents.get(userAgent) || 0) + 1);
    this.endpoints.set(endpoint, (this.endpoints.get(endpoint) || 0) + 1);

    // Check for SQL injection patterns
    const requestData = JSON.stringify({ body: req.body, query: req.query, params: req.params });
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(requestData)) {
        threats.push({
          id: `${timestamp.getTime()}-injection-${threats.length}`,
          type: 'injection',
          severity: 'high',
          ipAddress,
          userAgent,
          timestamp,
          details: {
            pattern: pattern.source,
            requestData: requestData.substring(0, 500), // Limit log size
            method: req.method,
            headers: req.headers
          },
          endpoint,
          action: 'injection_attempt'
        });
      }
    }

    // Check for brute force patterns
    const requestCount = this.requestCounts.get(ipAddress) || 0;
    if (requestCount > 100) { // More than 100 requests from same IP
      threats.push({
        id: `${timestamp.getTime()}-brute-${threats.length}`,
        type: 'brute_force',
        severity: 'medium',
        ipAddress,
        userAgent,
        timestamp,
        details: {
          requestCount,
          timeWindow: '1 hour'
        },
        endpoint,
        action: 'brute_force_attempt'
      });
    }

    // Check for suspicious user agents
    if (!userAgent || userAgent.length < 10 || 
        userAgent.includes('bot') || 
        userAgent.includes('crawler') ||
        userAgent.includes('scanner') ||
        userAgent.includes('hack') ||
        userAgent.includes('exploit')) {
      threats.push({
        id: `${timestamp.getTime()}-ua-${threats.length}`,
        type: 'unknown_user_agent',
        severity: 'low',
        ipAddress,
        userAgent,
        timestamp,
        details: {
          suspiciousAgent: userAgent,
          reason: 'Suspicious or missing user agent'
        },
        endpoint,
        action: 'suspicious_user_agent'
      });
    }

    // Check for unusual request patterns
    if (req.body && typeof req.body === 'object') {
      const bodyStr = JSON.stringify(req.body);
      if (bodyStr.length > 10000) { // Large payload
        threats.push({
          id: `${timestamp.getTime()}-payload-${threats.length}`,
          type: 'suspicious_pattern',
          severity: 'medium',
          ipAddress,
          userAgent,
          timestamp,
          details: {
            payloadSize: bodyStr.length,
            reason: 'Unusually large payload'
          },
          endpoint,
          action: 'large_payload'
        });
      }
    }

    // Store threats
    this.threats.push(...threats);
    
    // Log high-severity threats immediately
    threats.forEach(threat => {
      if (threat.severity === 'high' || threat.severity === 'critical') {
        this.logThreat(threat, req);
      }
    });

    return threats;
  }

  private async logThreat(threat: SecurityThreat, req: Request): Promise<void> {
    try {
      await auditService.logSuspiciousActivity(req, `${threat.type}: ${threat.action}`, {
        threatId: threat.id,
        severity: threat.severity,
        details: threat.details
      });
      
      console.warn(`🚨 SECURITY THREAT DETECTED:`, {
        id: threat.id,
        type: threat.type,
        severity: threat.severity,
        ip: threat.ipAddress,
        endpoint: threat.endpoint,
        timestamp: threat.timestamp.toISOString(),
        details: threat.details
      });

      // Send email notification for high and critical threats
      if (threat.severity === 'high' || threat.severity === 'critical') {
        await internalNotifications.sendInternalNotification({
          type: 'security_threat',
          data: {
            threatId: threat.id,
            threatType: threat.type,
            severity: threat.severity,
            ipAddress: threat.ipAddress,
            userAgent: threat.userAgent || 'Unknown',
            endpoint: threat.endpoint,
            action: threat.action,
            timestamp: threat.timestamp.toISOString(),
            details: threat.details
          },
          priority: threat.severity === 'critical' ? 'critical' : 'high'
        });
      }
    } catch (error) {
      console.error('Failed to log security threat:', error);
    }
  }

  public async getCurrentMetrics(): Promise<SecurityMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get recent threats
    const recentThreats = this.threats.filter(threat => 
      threat.timestamp >= oneHourAgo
    ).slice(0, 20); // Latest 20 threats

    // Calculate threat level
    const criticalThreats = recentThreats.filter(t => t.severity === 'critical').length;
    const highThreats = recentThreats.filter(t => t.severity === 'high').length;
    const mediumThreats = recentThreats.filter(t => t.severity === 'medium').length;

    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalThreats > 0) threatLevel = 'critical';
    else if (highThreats > 5) threatLevel = 'high';
    else if (highThreats > 0 || mediumThreats > 10) threatLevel = 'medium';

    // Get top endpoints
    const topEndpoints = Array.from(this.endpoints.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    // Get database metrics
    const dbMetrics = await auditService.getSecurityMetrics(1);

    return {
      activeUsers: this.userAgents.size,
      totalRequests: Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0),
      failedRequests: dbMetrics.totalEvents - dbMetrics.totalEvents, // Approximation
      suspiciousActivity: recentThreats.length,
      blockedIPs: Array.from(this.blockedIPs),
      topEndpoints,
      threatLevel,
      recentThreats
    };
  }

  public blockIP(ipAddress: string): void {
    this.blockedIPs.add(ipAddress);
    console.warn(`🚫 IP BLOCKED: ${ipAddress}`);
  }

  public unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    console.log(`✅ IP UNBLOCKED: ${ipAddress}`);
  }

  public isBlocked(ipAddress: string): boolean {
    return this.blockedIPs.has(ipAddress);
  }

  private cleanupOldData(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Clean up old threats
    this.threats = this.threats.filter(threat => threat.timestamp >= oneHourAgo);
    
    // Reset request counts
    this.requestCounts.clear();
    this.userAgents.clear();
    this.endpoints.clear();
    
    console.log('🧹 Security monitoring data cleaned up');
  }

  private async generateSecurityReport(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics();
      
      if (metrics.threatLevel === 'high' || metrics.threatLevel === 'critical') {
        console.warn('🚨 HIGH THREAT LEVEL DETECTED:', {
          level: metrics.threatLevel,
          recentThreats: metrics.recentThreats.length,
          suspiciousActivity: metrics.suspiciousActivity,
          timestamp: new Date().toISOString()
        });
      }
      
      // Log summary every 15 minutes
      if (new Date().getMinutes() % 15 === 0) {
        console.log('📊 Security Summary:', {
          activeUsers: metrics.activeUsers,
          totalRequests: metrics.totalRequests,
          threatLevel: metrics.threatLevel,
          blockedIPs: metrics.blockedIPs.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to generate security report:', error);
    }
  }

  public async getDetailedUserTrace(ipAddress?: string): Promise<{
    userSessions: any[];
    requestHistory: any[];
    threatHistory: SecurityThreat[];
    riskAssessment: string;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // Get threat history for IP
    const threatHistory = ipAddress 
      ? this.threats.filter(t => t.ipAddress === ipAddress)
      : this.threats.filter(t => t.timestamp >= oneHourAgo);

    // Get audit logs from database
    let userSessions: any[] = [];
    let requestHistory: any[] = [];
    
    try {
      if (ipAddress) {
        userSessions = await db.select()
          .from(securityAuditLogs)
          .where(and(
            eq(securityAuditLogs.ipAddress, ipAddress),
            gte(securityAuditLogs.timestamp, oneHourAgo)
          ))
          .orderBy(desc(securityAuditLogs.timestamp))
          .limit(50);
      } else {
        userSessions = await db.select()
          .from(securityAuditLogs)
          .where(gte(securityAuditLogs.timestamp, oneHourAgo))
          .orderBy(desc(securityAuditLogs.timestamp))
          .limit(100);
      }
      
      requestHistory = userSessions.map(session => ({
        timestamp: session.timestamp,
        action: session.action,
        resource: session.resource,
        riskLevel: session.riskLevel,
        success: session.success,
        userAgent: session.userAgent
      }));
    } catch (error) {
      console.error('Failed to get user trace from database:', error);
    }

    // Risk assessment
    const highRiskCount = threatHistory.filter(t => t.severity === 'high' || t.severity === 'critical').length;
    const mediumRiskCount = threatHistory.filter(t => t.severity === 'medium').length;
    
    let riskAssessment: string;
    if (highRiskCount > 0) {
      riskAssessment = 'HIGH RISK - Immediate attention required';
    } else if (mediumRiskCount > 5) {
      riskAssessment = 'MEDIUM RISK - Monitor closely';
    } else if (threatHistory.length > 10) {
      riskAssessment = 'LOW RISK - Normal activity with minor flags';
    } else {
      riskAssessment = 'MINIMAL RISK - Clean activity';
    }

    return {
      userSessions,
      requestHistory,
      threatHistory,
      riskAssessment
    };
  }
}

// Security monitoring middleware
export function securityMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const monitor = SecurityMonitor.getInstance();
  
  // Check if IP is blocked
  if (monitor.isBlocked(req.ip || '')) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Your IP address has been blocked due to suspicious activity'
    });
  }
  
  // Analyze request for threats
  const threats = monitor.analyzeRequest(req);
  
  // Block IP if critical threats detected
  if (threats.some(t => t.severity === 'critical')) {
    monitor.blockIP(req.ip || '');
    return res.status(403).json({
      error: 'Security Violation',
      message: 'Request blocked due to security policy violation'
    });
  }
  
  // Add security headers
  res.setHeader('X-Security-Level', threats.length > 0 ? 'elevated' : 'normal');
  res.setHeader('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  next();
}

export const securityMonitor = SecurityMonitor.getInstance();