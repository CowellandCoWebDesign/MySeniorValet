import { db } from '../db';
import { 
  enterpriseMetrics, 
  analyticsEvents,
  communities
} from '@shared/schema';

interface EnterpriseAlert {
  id: number;
  communityId: number | null;
  type: 'system' | 'revenue' | 'occupancy' | 'compliance' | 'performance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  metadata?: Record<string, any>;
  createdAt: Date;
  acknowledgedAt: Date | null;
  acknowledgedBy: number | null;
  resolvedAt: Date | null;
  resolvedBy: number | null;
}
import { eq, and, gte, lte, desc, sql, lt, gt, or, isNull } from 'drizzle-orm';
import { EnterpriseWebSocketService } from './enterprise-websocket.service';
import EventEmitter from 'events';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid for email notifications
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface AlertThreshold {
  metric: string;
  condition: 'above' | 'below' | 'equals' | 'change';
  value: number;
  severity: 'info' | 'warning' | 'critical';
  notificationChannels: ('email' | 'websocket' | 'webhook')[];
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  communityId?: number;
  thresholds: AlertThreshold[];
  cooldownMinutes: number;
  enabled: boolean;
}

export class EnterpriseAlertService extends EventEmitter {
  private static instance: EnterpriseAlertService;
  private wsService: EnterpriseWebSocketService;
  private alertRules: Map<string, AlertRule> = new Map();
  private lastAlertTime: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.wsService = EnterpriseWebSocketService.getInstance();
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  static getInstance(): EnterpriseAlertService {
    if (!EnterpriseAlertService.instance) {
      EnterpriseAlertService.instance = new EnterpriseAlertService();
    }
    return EnterpriseAlertService.instance;
  }

  private initializeDefaultRules() {
    // Financial Alert Rules
    this.alertRules.set('high-revenue', {
      id: 'high-revenue',
      name: 'High Revenue Transaction',
      description: 'Alert when a transaction exceeds threshold',
      thresholds: [{
        metric: 'transaction_amount',
        condition: 'above',
        value: 10000,
        severity: 'info',
        notificationChannels: ['websocket', 'email']
      }],
      cooldownMinutes: 60,
      enabled: true
    });

    this.alertRules.set('low-occupancy', {
      id: 'low-occupancy',
      name: 'Low Occupancy Alert',
      description: 'Alert when occupancy drops below threshold',
      thresholds: [{
        metric: 'occupancy_rate',
        condition: 'below',
        value: 70,
        severity: 'warning',
        notificationChannels: ['websocket', 'email']
      }],
      cooldownMinutes: 240,
      enabled: true
    });

    this.alertRules.set('compliance-violation', {
      id: 'compliance-violation',
      name: 'Compliance Violation',
      description: 'Alert on failed compliance audits',
      thresholds: [{
        metric: 'compliance_status',
        condition: 'equals',
        value: 0, // 0 = failed
        severity: 'critical',
        notificationChannels: ['websocket', 'email', 'webhook']
      }],
      cooldownMinutes: 30,
      enabled: true
    });

    this.alertRules.set('high-traffic', {
      id: 'high-traffic',
      name: 'High Traffic Alert',
      description: 'Alert when page views exceed normal patterns',
      thresholds: [{
        metric: 'page_views',
        condition: 'above',
        value: 1000,
        severity: 'info',
        notificationChannels: ['websocket']
      }],
      cooldownMinutes: 120,
      enabled: true
    });

    this.alertRules.set('performance-degradation', {
      id: 'performance-degradation',
      name: 'Performance Degradation',
      description: 'Alert when response times increase significantly',
      thresholds: [{
        metric: 'avg_session_duration',
        condition: 'above',
        value: 600, // 10 minutes
        severity: 'warning',
        notificationChannels: ['websocket', 'email']
      }],
      cooldownMinutes: 60,
      enabled: true
    });

    console.log('📊 Alert rules initialized:', this.alertRules.size, 'rules configured');
  }

  private startMonitoring() {
    // Monitor every 30 seconds for real-time alerts
    this.monitoringInterval = setInterval(() => {
      this.checkAllAlerts();
    }, 30000);

    // Also check immediately
    this.checkAllAlerts();
    console.log('🚨 Alert monitoring started - checking every 30 seconds');
  }

  private async checkAllAlerts() {
    try {
      // Check financial alerts
      await this.checkFinancialAlerts();
      
      // Check occupancy alerts
      await this.checkOccupancyAlerts();
      
      // Check compliance alerts
      await this.checkComplianceAlerts();
      
      // Check traffic alerts
      await this.checkTrafficAlerts();
      
      // Check performance alerts
      await this.checkPerformanceAlerts();
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  private async checkFinancialAlerts() {
    const rule = this.alertRules.get('high-revenue');
    if (!rule?.enabled) return;

    // Check recent high-value metrics from real database
    const recentMetrics = await db
      .select()
      .from(enterpriseMetrics)
      .where(
        and(
          gt(enterpriseMetrics.occupancyRate, rule.thresholds[0].value),
          eq(enterpriseMetrics.period, 'daily'),
          gte(enterpriseMetrics.date, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] as any)
        )
      )
      .limit(5);

    for (const metric of recentMetrics) {
      const alertKey = `high-revenue-${metric.id}`;
      if (!this.shouldTriggerAlert(alertKey, rule.cooldownMinutes)) continue;

      await this.createAlert({
        communityId: metric.communityId,
        type: 'revenue',
        severity: rule.thresholds[0].severity,
        title: 'High Occupancy Detected',
        message: `High occupancy rate of ${metric.occupancyRate}% recorded for community on ${metric.date}`,
        metadata: {
          metricId: metric.id,
          occupancyRate: metric.occupancyRate,
          date: metric.date
        },
        status: 'active',
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      });

      this.lastAlertTime.set(alertKey, new Date());
    }
  }

  private async checkOccupancyAlerts() {
    const rule = this.alertRules.get('low-occupancy');
    if (!rule?.enabled) return;

    // Check communities with low occupancy from real metrics
    const lowOccupancyMetrics = await db
      .select()
      .from(enterpriseMetrics)
      .where(
        and(
          lt(enterpriseMetrics.occupancyRate, rule.thresholds[0].value),
          eq(enterpriseMetrics.period, 'daily'),
          gte(enterpriseMetrics.date, new Date().toISOString().split('T')[0] as any)
        )
      )
      .limit(10);

    for (const metric of lowOccupancyMetrics) {
      const alertKey = `low-occupancy-${metric.communityId}-${metric.date}`;
      if (!this.shouldTriggerAlert(alertKey, rule.cooldownMinutes)) continue;

      await this.createAlert({
        communityId: metric.communityId,
        type: 'occupancy',
        severity: rule.thresholds[0].severity,
        title: 'Low Occupancy Warning',
        message: `Occupancy rate dropped to ${metric.occupancyRate}% on ${metric.date}`,
        metadata: {
          occupancyRate: metric.occupancyRate,
          date: metric.date,
          avgLengthOfStay: metric.avgLengthOfStay
        },
        status: 'active',
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      });

      this.lastAlertTime.set(alertKey, new Date());
    }
  }

  private async checkComplianceAlerts() {
    const rule = this.alertRules.get('compliance-violation');
    if (!rule?.enabled) return;

    // Check communities without websites (potential compliance issue)
    const communitiesWithoutWebsites = await db
      .select()
      .from(communities)
      .where(
        or(
          isNull(communities.website),
          eq(communities.website, '')
        )
      )
      .limit(5);

    for (const community of communitiesWithoutWebsites) {
      const alertKey = `compliance-${community.id}`;
      if (!this.shouldTriggerAlert(alertKey, rule.cooldownMinutes)) continue;

      await this.createAlert({
        communityId: community.id,
        type: 'compliance',
        severity: 'warning',
        title: 'Community Missing Website',
        message: `${community.name} does not have a website URL on file`,
        metadata: {
          communityId: community.id,
          communityName: community.name,
          address: community.address
        },
        status: 'active',
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      });

      this.lastAlertTime.set(alertKey, new Date());
    }
  }

  private async checkTrafficAlerts() {
    const rule = this.alertRules.get('high-traffic');
    if (!rule?.enabled) return;

    // Check high traffic patterns from real analytics
    const highTrafficEvents = await db
      .select({
        pageViews: sql<number>`COUNT(*)`,
        path: analyticsEvents.path
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'page_view'),
          gte(analyticsEvents.timestamp, new Date(Date.now() - 60 * 60 * 1000))
        )
      )
      .groupBy(analyticsEvents.path)
      .having(sql`COUNT(*) > ${rule.thresholds[0].value}`)
      .limit(5);

    for (const traffic of highTrafficEvents) {
      const alertKey = `high-traffic-${traffic.path}`;
      if (!this.shouldTriggerAlert(alertKey, rule.cooldownMinutes)) continue;

      await this.createAlert({
        communityId: null,
        type: 'system',
        severity: rule.thresholds[0].severity,
        title: 'High Traffic Detected',
        message: `Page ${traffic.path} received ${traffic.pageViews} views in the last hour`,
        metadata: {
          path: traffic.path,
          pageViews: traffic.pageViews
        },
        status: 'active',
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      });

      this.lastAlertTime.set(alertKey, new Date());
    }
  }

  private async checkPerformanceAlerts() {
    const rule = this.alertRules.get('performance-degradation');
    if (!rule?.enabled) return;

    // Check performance metrics from real data
    const performanceIssues = await db
      .select()
      .from(enterpriseMetrics)
      .where(
        and(
          gt(enterpriseMetrics.avgSessionDuration, rule.thresholds[0].value),
          eq(enterpriseMetrics.period, 'daily'),
          gte(enterpriseMetrics.date, new Date().toISOString().split('T')[0] as any)
        )
      )
      .limit(5);

    for (const issue of performanceIssues) {
      const alertKey = `performance-${issue.communityId}-${issue.date}`;
      if (!this.shouldTriggerAlert(alertKey, rule.cooldownMinutes)) continue;

      await this.createAlert({
        communityId: issue.communityId,
        type: 'system',
        severity: rule.thresholds[0].severity,
        title: 'Performance Degradation Detected',
        message: `Average session duration increased to ${Math.round(issue.avgSessionDuration / 60)} minutes`,
        metadata: {
          avgSessionDuration: issue.avgSessionDuration,
          bounceRate: issue.bounceRate,
          date: issue.date
        },
        status: 'active',
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      });

      this.lastAlertTime.set(alertKey, new Date());
    }
  }

  private shouldTriggerAlert(key: string, cooldownMinutes: number): boolean {
    const lastAlert = this.lastAlertTime.get(key);
    if (!lastAlert) return true;
    
    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlert.getTime() > cooldownMs;
  }

  private async createAlert(alert: Omit<EnterpriseAlert, 'id' | 'createdAt'>) {
    try {
      // Create in-memory alert (database table will be added in Phase 5)
      const newAlert: EnterpriseAlert = {
        id: Date.now(),
        ...alert,
        createdAt: new Date()
      };

      // Broadcast via WebSocket
      this.wsService.broadcast('alerts', {
        type: 'new_alert',
        alert: newAlert
      });

      // Send email notification for critical alerts
      if (alert.severity === 'critical' && process.env.SENDGRID_API_KEY) {
        await this.sendEmailAlert(newAlert);
      }

      // Emit event for other services
      this.emit('alert_created', newAlert);

      console.log(`🚨 Alert created: ${alert.title} (${alert.severity})`);
      return newAlert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  private async sendEmailAlert(alert: EnterpriseAlert) {
    if (!process.env.SENDGRID_API_KEY) return;

    const msg = {
      to: 'admin@myseniorvalet.com',
      from: 'alerts@myseniorvalet.com',
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: `
        <h2>Enterprise Alert</h2>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Type:</strong> ${alert.type}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${new Date(alert.createdAt).toLocaleString()}</p>
        ${alert.communityId ? `<p><strong>Community ID:</strong> ${alert.communityId}</p>` : ''}
        <hr>
        <p>Login to the enterprise dashboard to acknowledge this alert.</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('📧 Alert email sent successfully');
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  }

  async acknowledgeAlert(alertId: number, userId: number) {
    try {
      const [updated] = await db
        .update(enterprise_alerts)
        .set({
          status: 'acknowledged',
          acknowledgedAt: new Date(),
          acknowledgedBy: userId
        })
        .where(eq(enterprise_alerts.id, alertId))
        .returning();

      this.wsService.broadcast('alerts', {
        type: 'alert_acknowledged',
        alertId,
        userId
      });

      return updated;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  async resolveAlert(alertId: number, userId: number) {
    try {
      const [updated] = await db
        .update(enterprise_alerts)
        .set({
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: userId
        })
        .where(eq(enterprise_alerts.id, alertId))
        .returning();

      this.wsService.broadcast('alerts', {
        type: 'alert_resolved',
        alertId,
        userId
      });

      return updated;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  async getActiveAlerts(communityId?: number) {
    try {
      const conditions = [eq(enterprise_alerts.status, 'active')];
      if (communityId) {
        conditions.push(eq(enterprise_alerts.communityId, communityId));
      }

      const alerts = await db
        .select()
        .from(enterprise_alerts)
        .where(and(...conditions))
        .orderBy(desc(enterprise_alerts.createdAt))
        .limit(50);

      return alerts;
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  async getAlertStats() {
    try {
      const stats = await db
        .select({
          total: sql<number>`COUNT(*)`,
          active: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`,
          acknowledged: sql<number>`COUNT(*) FILTER (WHERE status = 'acknowledged')`,
          resolved: sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')`,
          critical: sql<number>`COUNT(*) FILTER (WHERE severity = 'critical')`,
          warning: sql<number>`COUNT(*) FILTER (WHERE severity = 'warning')`,
          info: sql<number>`COUNT(*) FILTER (WHERE severity = 'info')`
        })
        .from(enterprise_alerts)
        .where(gte(enterprise_alerts.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

      return stats[0];
    } catch (error) {
      console.error('Error fetching alert stats:', error);
      throw error;
    }
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const existing = this.alertRules.get(ruleId);
    if (existing) {
      this.alertRules.set(ruleId, { ...existing, ...updates });
      console.log(`📝 Alert rule updated: ${ruleId}`);
    }
  }

  getRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Alert monitoring stopped');
    }
  }
}