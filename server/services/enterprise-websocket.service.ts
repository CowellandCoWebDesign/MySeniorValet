import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';
import { db } from '../db';
import { analyticsEvents, financialTransactions, complianceAudits, enterpriseMetrics } from '@shared/schema';
import { desc, eq, gte, and, sql } from 'drizzle-orm';
import { analyticsService } from './analytics.service';
import { financialService } from './financial.service';
import { complianceService } from './compliance.service';

interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  communityId?: number;
  role?: string;
  subscriptions: Set<string>;
}

interface RealtimeEvent {
  type: 'analytics' | 'financial' | 'compliance' | 'metrics' | 'notification';
  action: 'update' | 'create' | 'delete';
  data: any;
  timestamp: Date;
  communityId?: number;
}

class EnterpriseWebSocketService extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private eventInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupEventListeners();
  }

  initialize(server: Server) {
    // Create WebSocket server on /enterprise-ws path
    this.wss = new WebSocketServer({ 
      server, 
      path: '/enterprise-ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));

    // Start real-time monitoring
    this.startRealtimeMonitoring();

    console.log('✅ Enterprise WebSocket service initialized on /enterprise-ws');
  }

  private verifyClient(info: any, cb: (result: boolean) => void) {
    // In production, verify JWT token or session
    // For now, allow all connections for testing
    cb(true);
  }

  private handleConnection(ws: WebSocket, request: any) {
    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      ws,
      subscriptions: new Set()
    };

    this.clients.set(clientId, client);

    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleDisconnect(clientId));
    ws.on('error', (error) => console.error('WebSocket error:', error));

    // Send initial connection confirmation
    this.sendToClient(clientId, {
      type: 'connection',
      status: 'connected',
      clientId,
      timestamp: new Date()
    });
  }

  private handleMessage(clientId: string, data: any) {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      if (!client) return;

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: new Date() });
          break;
        case 'authenticate':
          this.handleAuthentication(clientId, message);
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleSubscription(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel, communityId } = message;
    const subscription = communityId ? `${channel}:${communityId}` : channel;
    
    client.subscriptions.add(subscription);
    if (communityId) {
      client.communityId = communityId;
    }

    this.sendToClient(clientId, {
      type: 'subscription',
      status: 'subscribed',
      channel: subscription,
      timestamp: new Date()
    });

    // Send initial data for the subscription
    this.sendInitialData(clientId, channel, communityId);
  }

  private handleUnsubscription(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel, communityId } = message;
    const subscription = communityId ? `${channel}:${communityId}` : channel;
    
    client.subscriptions.delete(subscription);

    this.sendToClient(clientId, {
      type: 'subscription',
      status: 'unsubscribed',
      channel: subscription,
      timestamp: new Date()
    });
  }

  private handleAuthentication(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Store user info for targeted updates
    client.userId = message.userId;
    client.role = message.role;

    this.sendToClient(clientId, {
      type: 'authentication',
      status: 'authenticated',
      timestamp: new Date()
    });
  }

  private handleDisconnect(clientId: string) {
    this.clients.delete(clientId);
  }

  private async sendInitialData(clientId: string, channel: string, communityId?: number) {
    try {
      switch (channel) {
        case 'analytics':
          await this.sendAnalyticsSnapshot(clientId, communityId);
          break;
        case 'financial':
          await this.sendFinancialSnapshot(clientId, communityId);
          break;
        case 'compliance':
          await this.sendComplianceSnapshot(clientId, communityId);
          break;
        case 'metrics':
          await this.sendMetricsSnapshot(clientId, communityId);
          break;
      }
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private async sendAnalyticsSnapshot(clientId: string, communityId?: number) {
    // Get real analytics data from database
    const recentEvents = await db.select()
      .from(analyticsEvents)
      .where(communityId ? eq(analyticsEvents.communityId, communityId) : undefined)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(10);

    this.sendToClient(clientId, {
      type: 'analytics',
      action: 'snapshot',
      data: {
        recentEvents,
        totalEvents: recentEvents.length,
        timestamp: new Date()
      }
    });
  }

  private async sendFinancialSnapshot(clientId: string, communityId?: number) {
    // Get real financial data from database
    const recentTransactions = await db.select()
      .from(financialTransactions)
      .where(communityId ? eq(financialTransactions.communityId, communityId) : undefined)
      .orderBy(desc(financialTransactions.createdAt))
      .limit(10);

    const totalRevenue = recentTransactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    this.sendToClient(clientId, {
      type: 'financial',
      action: 'snapshot',
      data: {
        recentTransactions,
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        timestamp: new Date()
      }
    });
  }

  private async sendComplianceSnapshot(clientId: string, communityId?: number) {
    // Get real compliance data from database
    const recentAudits = await db.select()
      .from(complianceAudits)
      .where(communityId ? eq(complianceAudits.communityId, communityId) : undefined)
      .orderBy(desc(complianceAudits.createdAt))
      .limit(5);

    const criticalIssues = recentAudits.filter(a => a.criticalFindings && a.criticalFindings > 0).length;
    const avgScore = recentAudits.length > 0
      ? recentAudits.reduce((sum, a) => sum + (a.score || 0), 0) / recentAudits.length
      : 100;

    this.sendToClient(clientId, {
      type: 'compliance',
      action: 'snapshot',
      data: {
        recentAudits,
        criticalIssues,
        averageScore: avgScore,
        timestamp: new Date()
      }
    });
  }

  private async sendMetricsSnapshot(clientId: string, communityId?: number) {
    // Get real metrics from database
    const metrics = await db.select()
      .from(enterpriseMetrics)
      .where(communityId ? eq(enterpriseMetrics.communityId, communityId) : undefined)
      .orderBy(desc(enterpriseMetrics.date))
      .limit(1);

    const currentMetrics = metrics[0] || {
      occupancyRate: 0,
      avgRevenuePerUnit: 0,
      customerSatisfaction: 0,
      staffTurnover: 0
    };

    this.sendToClient(clientId, {
      type: 'metrics',
      action: 'snapshot',
      data: {
        currentMetrics,
        timestamp: new Date()
      }
    });
  }

  private startRealtimeMonitoring() {
    // Monitor for new events every 5 seconds
    this.eventInterval = setInterval(async () => {
      await this.checkForNewEvents();
    }, 5000);

    // Update metrics every 30 seconds
    this.metricsInterval = setInterval(async () => {
      await this.broadcastMetricsUpdate();
    }, 30000);
  }

  private async checkForNewEvents() {
    try {
      const fiveSecondsAgo = new Date(Date.now() - 5000);

      // Check for new analytics events
      const newAnalytics = await db.select()
        .from(analyticsEvents)
        .where(gte(analyticsEvents.timestamp, fiveSecondsAgo))
        .limit(10);

      if (newAnalytics.length > 0) {
        this.broadcastToSubscribers('analytics', {
          type: 'analytics',
          action: 'update',
          data: { newEvents: newAnalytics },
          timestamp: new Date()
        });
      }

      // Check for new financial transactions
      const newTransactions = await db.select()
        .from(financialTransactions)
        .where(gte(financialTransactions.createdAt, fiveSecondsAgo))
        .limit(10);

      if (newTransactions.length > 0) {
        this.broadcastToSubscribers('financial', {
          type: 'financial',
          action: 'update',
          data: { newTransactions },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error checking for new events:', error);
    }
  }

  private async broadcastMetricsUpdate() {
    try {
      // Get latest metrics for all communities with active subscribers
      const activeCommunitiesIds = Array.from(this.clients.values())
        .filter(c => c.communityId)
        .map(c => c.communityId as number);

      if (activeCommunitiesIds.length === 0) return;

      for (const communityId of activeCommunitiesIds) {
        const metrics = await db.select()
          .from(enterpriseMetrics)
          .where(eq(enterpriseMetrics.communityId, communityId))
          .orderBy(desc(enterpriseMetrics.date))
          .limit(1);

        if (metrics.length > 0) {
          this.broadcastToSubscribers(`metrics:${communityId}`, {
            type: 'metrics',
            action: 'update',
            data: { metrics: metrics[0] },
            timestamp: new Date(),
            communityId
          });
        }
      }
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
    }
  }

  private broadcastToSubscribers(channel: string, message: any) {
    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(channel) || 
          (message.communityId && client.subscriptions.has(`${channel.split(':')[0]}:${message.communityId}`))) {
        this.sendToClient(clientId, message);
      }
    });
  }

  public broadcast(event: RealtimeEvent) {
    const channel = event.communityId ? `${event.type}:${event.communityId}` : event.type;
    this.broadcastToSubscribers(channel, event);
  }

  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Listen for service events to broadcast
    analyticsService.on('event', (data: any) => {
      this.broadcast({
        type: 'analytics',
        action: 'create',
        data,
        timestamp: new Date(),
        communityId: data.communityId
      });
    });

    financialService.on('transaction', (data: any) => {
      this.broadcast({
        type: 'financial',
        action: 'create',
        data,
        timestamp: new Date(),
        communityId: data.communityId
      });
    });

    complianceService.on('audit', (data: any) => {
      this.broadcast({
        type: 'compliance',
        action: 'create',
        data,
        timestamp: new Date(),
        communityId: data.communityId
      });
    });
  }

  public shutdown() {
    if (this.eventInterval) clearInterval(this.eventInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);
    
    this.clients.forEach(client => {
      client.ws.close();
    });
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const enterpriseWebSocketService = new EnterpriseWebSocketService();