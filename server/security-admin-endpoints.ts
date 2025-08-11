import { Request, Response } from 'express';
import { securityMonitor } from './security-monitor';
import { auditService } from './audit';
import { db } from './db';
import { securityAuditLogs } from '@shared/schema';
import { desc, gte, eq, and, or, count, countDistinct } from 'drizzle-orm';

// Security dashboard endpoint
export async function getSecurityDashboard(req: Request, res: Response) {
  try {
    const metrics = await securityMonitor.getCurrentMetrics();
    const dbMetrics = await auditService.getSecurityMetrics(24);
    
    // Get active IP addresses
    const activeIPs = await db.select({ 
      ipAddress: securityAuditLogs.ipAddress,
      count: count()
    })
    .from(securityAuditLogs)
    .where(gte(securityAuditLogs.timestamp, new Date(Date.now() - 60 * 60 * 1000)))
    .groupBy(securityAuditLogs.ipAddress)
    .orderBy(desc(count()))
    .limit(20);

    // Get recent security events
    const recentEvents = await db.select()
      .from(securityAuditLogs)
      .where(gte(securityAuditLogs.timestamp, new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .orderBy(desc(securityAuditLogs.timestamp))
      .limit(50);

    const dashboard = {
      overview: {
        threatLevel: metrics.threatLevel,
        activeUsers: metrics.activeUsers,
        totalRequests: metrics.totalRequests,
        suspiciousActivity: metrics.suspiciousActivity,
        blockedIPs: metrics.blockedIPs.length,
        uptime: process.uptime(),
        lastUpdate: new Date().toISOString()
      },
      threats: {
        recent: metrics.recentThreats.map(threat => ({
          ...threat,
          timestamp: threat.timestamp.toISOString()
        })),
        byType: metrics.recentThreats.reduce((acc, threat) => {
          acc[threat.type] = (acc[threat.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySeverity: metrics.recentThreats.reduce((acc, threat) => {
          acc[threat.severity] = (acc[threat.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      database: {
        totalEvents: dbMetrics.totalEvents,
        failedLogins: dbMetrics.failedLogins,
        suspiciousActivity: dbMetrics.suspiciousActivity,
        highRiskEvents: dbMetrics.highRiskEvents,
        uniqueIPs: dbMetrics.uniqueIPs
      },
      network: {
        activeIPs: activeIPs.map(ip => ({
          address: ip.ipAddress,
          requestCount: ip.count,
          blocked: metrics.blockedIPs.includes(ip.ipAddress)
        })),
        topEndpoints: metrics.topEndpoints,
        blockedIPs: metrics.blockedIPs
      },
      events: recentEvents.map(event => ({
        id: event.id,
        timestamp: event.timestamp.toISOString(),
        action: event.action,
        resource: event.resource,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        riskLevel: event.riskLevel,
        success: event.success,
        details: event.details
      }))
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Failed to get security dashboard:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to retrieve security dashboard'
    });
  }
}

// Get security metrics for dashboard
export async function getSecurityMetrics(req: Request, res: Response) {
  try {
    const { securityDashboard } = await import('./infrastructure/security-dashboard');
    const metrics = securityDashboard.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Failed to get security metrics:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to retrieve security metrics'
    });
  }
}

// Get security alerts for dashboard
export async function getSecurityAlerts(req: Request, res: Response) {
  try {
    const { securityDashboard } = await import('./infrastructure/security-dashboard');
    const alerts = securityDashboard.getAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Failed to get security alerts:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to retrieve security alerts'
    });
  }
}

// Resolve security alert
export async function resolveSecurityAlert(req: Request, res: Response) {
  try {
    const { alertId } = req.params;
    const { securityDashboard } = await import('./infrastructure/security-dashboard');
    securityDashboard.resolveAlert(alertId);
    res.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('Failed to resolve security alert:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to resolve security alert'
    });
  }
}

// User trace endpoint
export async function getUserTrace(req: Request, res: Response) {
  try {
    const { ipAddress } = req.query;
    
    if (!ipAddress || typeof ipAddress !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'IP address is required'
      });
    }

    const trace = await securityMonitor.getDetailedUserTrace(ipAddress);
    
    res.json({
      ipAddress,
      traceTime: new Date().toISOString(),
      ...trace,
      threatHistory: trace.threatHistory.map(threat => ({
        ...threat,
        timestamp: threat.timestamp.toISOString()
      }))
    });
  } catch (error) {
    console.error('Failed to get user trace:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to retrieve user trace'
    });
  }
}

// Block IP endpoint
export async function blockIP(req: Request, res: Response) {
  try {
    const { ipAddress, reason } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'IP address is required'
      });
    }

    securityMonitor.blockIP(ipAddress);
    
    // Log the admin action
    await auditService.logSuspiciousActivity(req, `IP blocked by admin: ${ipAddress}`, {
      blockedIP: ipAddress,
      reason: reason || 'Manual admin action',
      adminAction: true
    });

    res.json({
      success: true,
      message: `IP ${ipAddress} has been blocked`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to block IP:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to block IP address'
    });
  }
}

// Unblock IP endpoint
export async function unblockIP(req: Request, res: Response) {
  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'IP address is required'
      });
    }

    securityMonitor.unblockIP(ipAddress);
    
    // Log the admin action
    await auditService.logSuspiciousActivity(req, `IP unblocked by admin: ${ipAddress}`, {
      unblockedIP: ipAddress,
      adminAction: true
    });

    res.json({
      success: true,
      message: `IP ${ipAddress} has been unblocked`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to unblock IP:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to unblock IP address'
    });
  }
}

// Security events endpoint
export async function getSecurityEvents(req: Request, res: Response) {
  try {
    const { hours = 24, limit = 100, riskLevel, action } = req.query;
    
    const hoursNumber = parseInt(hours as string) || 24;
    const limitNumber = parseInt(limit as string) || 100;
    const since = new Date(Date.now() - hoursNumber * 60 * 60 * 1000);
    
    let query = db.select()
      .from(securityAuditLogs)
      .where(gte(securityAuditLogs.timestamp, since))
      .orderBy(desc(securityAuditLogs.timestamp))
      .limit(limitNumber);
    
    // Add filters if provided
    if (riskLevel) {
      query = query.where(and(
        gte(securityAuditLogs.timestamp, since),
        eq(securityAuditLogs.riskLevel, riskLevel as string)
      ));
    }
    
    if (action) {
      query = query.where(and(
        gte(securityAuditLogs.timestamp, since),
        eq(securityAuditLogs.action, action as string)
      ));
    }

    const events = await query;
    
    res.json({
      events: events.map(event => ({
        id: event.id,
        timestamp: event.timestamp.toISOString(),
        action: event.action,
        resource: event.resource,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        riskLevel: event.riskLevel,
        success: event.success,
        details: event.details
      })),
      totalCount: events.length,
      timeRange: {
        since: since.toISOString(),
        until: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to get security events:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to retrieve security events'
    });
  }
}

// Generate security report
export async function generateSecurityReport(req: Request, res: Response) {
  try {
    const { format = 'json', hours = 24 } = req.query;
    
    const metrics = await securityMonitor.getCurrentMetrics();
    const dbMetrics = await auditService.getSecurityMetrics(parseInt(hours as string) || 24);
    
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange: `${hours} hours`,
      summary: {
        threatLevel: metrics.threatLevel,
        totalRequests: metrics.totalRequests,
        suspiciousActivity: metrics.suspiciousActivity,
        blockedIPs: metrics.blockedIPs.length,
        activeUsers: metrics.activeUsers
      },
      threats: {
        byType: metrics.recentThreats.reduce((acc, threat) => {
          acc[threat.type] = (acc[threat.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySeverity: metrics.recentThreats.reduce((acc, threat) => {
          acc[threat.severity] = (acc[threat.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recent: metrics.recentThreats.slice(0, 10).map(threat => ({
          type: threat.type,
          severity: threat.severity,
          timestamp: threat.timestamp.toISOString(),
          ipAddress: threat.ipAddress,
          endpoint: threat.endpoint
        }))
      },
      database: dbMetrics,
      recommendations: generateSecurityRecommendations(metrics, dbMetrics)
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertReportToCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=security-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      res.json(report);
    }
  } catch (error) {
    console.error('Failed to generate security report:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to generate security report'
    });
  }
}

function generateSecurityRecommendations(metrics: any, dbMetrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.threatLevel === 'high' || metrics.threatLevel === 'critical') {
    recommendations.push('URGENT: High threat level detected. Review and block suspicious IPs immediately.');
  }
  
  if (metrics.blockedIPs.length > 10) {
    recommendations.push('WARNING: Large number of blocked IPs. Review blocking criteria.');
  }
  
  if (dbMetrics.failedLogins > 50) {
    recommendations.push('Monitor for brute force attacks. Consider implementing CAPTCHA.');
  }
  
  if (metrics.suspiciousActivity > 20) {
    recommendations.push('High suspicious activity detected. Review recent threats and patterns.');
  }
  
  if (metrics.activeUsers > 1000) {
    recommendations.push('High traffic detected. Monitor server performance and scaling.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Security status normal. Continue monitoring.');
  }
  
  return recommendations;
}

function convertReportToCSV(report: any): string {
  const lines = [
    'Timestamp,Type,Severity,IP Address,Endpoint,Action',
    ...report.threats.recent.map((threat: any) => 
      `${threat.timestamp},${threat.type},${threat.severity},${threat.ipAddress},${threat.endpoint},${threat.action || 'N/A'}`
    )
  ];
  
  return lines.join('\n');
}