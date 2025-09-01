import { db } from '../db';
import { 
  analyticsEvents, 
  analyticsSessions, 
  enterpriseMetrics,
  InsertAnalyticsEvent,
  InsertAnalyticsSession,
  InsertEnterpriseMetric
} from '@shared/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';
import { Request } from 'express';
import crypto from 'crypto';

export class AnalyticsService {
  // Track a real user event
  async trackEvent(data: {
    communityId?: number;
    userId?: number;
    sessionId: string;
    eventType: string;
    eventCategory?: string;
    eventAction?: string;
    eventLabel?: string;
    eventValue?: number;
    pageUrl?: string;
    pageTitle?: string;
    customData?: Record<string, any>;
    req?: Request;
  }): Promise<void> {
    try {
      const event: InsertAnalyticsEvent = {
        communityId: data.communityId,
        userId: data.userId,
        sessionId: data.sessionId,
        eventType: data.eventType,
        eventCategory: data.eventCategory,
        eventAction: data.eventAction,
        eventLabel: data.eventLabel,
        eventValue: data.eventValue,
        pageUrl: data.pageUrl || data.req?.url,
        pageTitle: data.pageTitle,
        referrerUrl: data.req?.get('referer'),
        userAgent: data.req?.get('user-agent'),
        ipAddress: data.req?.ip,
        customData: data.customData || {},
        timestamp: new Date()
      };

      // Extract device info from user agent
      if (data.req) {
        const userAgent = data.req.get('user-agent') || '';
        event.deviceType = this.getDeviceType(userAgent);
        event.browserName = this.getBrowserName(userAgent);
        event.operatingSystem = this.getOS(userAgent);
      }

      await db.insert(analyticsEvents).values(event);
      
      // Update session activity
      await this.updateSessionActivity(data.sessionId, data.eventType);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Create or update a session
  async createOrUpdateSession(data: {
    sessionId: string;
    userId?: number;
    communityId?: number;
    entryPage?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }): Promise<void> {
    try {
      const existingSession = await db
        .select()
        .from(analyticsSessions)
        .where(eq(analyticsSessions.sessionId, data.sessionId))
        .limit(1);

      if (existingSession.length === 0) {
        // Create new session
        const session: InsertAnalyticsSession = {
          sessionId: data.sessionId,
          userId: data.userId,
          communityId: data.communityId,
          startTime: new Date(),
          pageViews: 1,
          events: 0,
          entryPage: data.entryPage,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign
        };
        await db.insert(analyticsSessions).values(session);
      } else {
        // Update existing session
        await db
          .update(analyticsSessions)
          .set({
            pageViews: sql`${analyticsSessions.pageViews} + 1`,
            endTime: new Date()
          })
          .where(eq(analyticsSessions.sessionId, data.sessionId));
      }
    } catch (error) {
      console.error('Error managing session:', error);
    }
  }

  // Get real analytics for a community
  async getCommunityAnalytics(communityId: number, startDate: Date, endDate: Date) {
    // Get real view counts
    const viewStats = await db
      .select({
        totalViews: count(),
        uniqueVisitors: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})`
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.communityId, communityId),
          eq(analyticsEvents.eventType, 'page_view'),
          gte(analyticsEvents.timestamp, startDate),
          lte(analyticsEvents.timestamp, endDate)
        )
      );

    // Get real engagement metrics
    const engagementStats = await db
      .select({
        phoneClicks: count(),
        eventAction: analyticsEvents.eventAction
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.communityId, communityId),
          sql`${analyticsEvents.eventAction} IN ('phone_click', 'website_click', 'directions_click')`,
          gte(analyticsEvents.timestamp, startDate),
          lte(analyticsEvents.timestamp, endDate)
        )
      )
      .groupBy(analyticsEvents.eventAction);

    // Get session statistics
    const sessionStats = await db
      .select({
        avgDuration: sql<number>`AVG(${analyticsSessions.duration})`,
        bounceRate: sql<number>`
          ROUND(
            100.0 * COUNT(CASE WHEN ${analyticsSessions.bounced} = true THEN 1 END) / 
            NULLIF(COUNT(*), 0), 
            2
          )`
      })
      .from(analyticsSessions)
      .where(
        and(
          eq(analyticsSessions.communityId, communityId),
          gte(analyticsSessions.startTime, startDate),
          lte(analyticsSessions.startTime, endDate)
        )
      );

    // Get conversion metrics
    const conversionStats = await db
      .select({
        conversions: count(),
        goalType: analyticsSessions.goalType
      })
      .from(analyticsSessions)
      .where(
        and(
          eq(analyticsSessions.communityId, communityId),
          eq(analyticsSessions.goalCompleted, true),
          gte(analyticsSessions.startTime, startDate),
          lte(analyticsSessions.startTime, endDate)
        )
      )
      .groupBy(analyticsSessions.goalType);

    // Get traffic sources
    const trafficSources = await db
      .select({
        source: analyticsSessions.entrySource,
        visits: count()
      })
      .from(analyticsSessions)
      .where(
        and(
          eq(analyticsSessions.communityId, communityId),
          gte(analyticsSessions.startTime, startDate),
          lte(analyticsSessions.startTime, endDate)
        )
      )
      .groupBy(analyticsSessions.entrySource);

    // Get top pages
    const topPages = await db
      .select({
        page: analyticsEvents.pageTitle,
        pageUrl: analyticsEvents.pageUrl,
        views: count()
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.communityId, communityId),
          eq(analyticsEvents.eventType, 'page_view'),
          gte(analyticsEvents.timestamp, startDate),
          lte(analyticsEvents.timestamp, endDate)
        )
      )
      .groupBy(analyticsEvents.pageTitle, analyticsEvents.pageUrl)
      .orderBy(desc(count()))
      .limit(10);

    // Get device breakdown
    const deviceStats = await db
      .select({
        deviceType: analyticsEvents.deviceType,
        count: count()
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.communityId, communityId),
          gte(analyticsEvents.timestamp, startDate),
          lte(analyticsEvents.timestamp, endDate)
        )
      )
      .groupBy(analyticsEvents.deviceType);

    // Calculate engagement metrics from real data
    const phoneClicks = engagementStats.find(e => e.eventAction === 'phone_click')?.phoneClicks || 0;
    const websiteClicks = engagementStats.find(e => e.eventAction === 'website_click')?.phoneClicks || 0;
    const directionsRequests = engagementStats.find(e => e.eventAction === 'directions_click')?.phoneClicks || 0;

    // Format and return real analytics
    return {
      summary: {
        totalViews: viewStats[0]?.totalViews || 0,
        uniqueVisitors: viewStats[0]?.uniqueVisitors || 0,
        avgTimeOnPage: this.formatDuration(sessionStats[0]?.avgDuration || 0),
        bounceRate: `${sessionStats[0]?.bounceRate || 0}%`,
        conversionRate: this.calculateConversionRate(
          viewStats[0]?.totalViews || 0,
          conversionStats.reduce((sum, c) => sum + c.conversions, 0)
        )
      },
      engagement: {
        phoneClicks,
        websiteClicks,
        directionsRequests
      },
      traffic: {
        sources: this.formatTrafficSources(trafficSources),
        topPages: topPages.map(p => ({
          page: p.page || p.pageUrl || 'Unknown',
          views: p.views
        })),
        devices: this.formatDeviceStats(deviceStats)
      },
      conversions: conversionStats
    };
  }

  // Update aggregated metrics daily
  async updateDailyMetrics(communityId: number, date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const analytics = await this.getCommunityAnalytics(communityId, startOfDay, endOfDay);

    const metric: InsertEnterpriseMetric = {
      communityId,
      date: startOfDay.toISOString().split('T')[0] as any,
      period: 'daily',
      uniqueVisitors: analytics.summary.uniqueVisitors,
      totalPageViews: analytics.summary.totalViews,
      bounceRate: parseFloat(analytics.summary.bounceRate),
      conversionRate: parseFloat(analytics.summary.conversionRate)
    };

    // Upsert metric
    await db
      .insert(enterpriseMetrics)
      .values(metric)
      .onConflictDoUpdate({
        target: [enterpriseMetrics.communityId, enterpriseMetrics.date, enterpriseMetrics.period],
        set: metric
      });
  }

  // Helper methods
  private getDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private getBrowserName(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Other';
  }

  private getOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Other';
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  private calculateConversionRate(views: number, conversions: number): string {
    if (views === 0) return '0%';
    return `${((conversions / views) * 100).toFixed(1)}%`;
  }

  private formatTrafficSources(sources: any[]): any[] {
    const total = sources.reduce((sum, s) => sum + s.visits, 0);
    return sources.map(s => ({
      source: s.source || 'Direct',
      visits: s.visits,
      percentage: Math.round((s.visits / total) * 100)
    }));
  }

  private formatDeviceStats(devices: any[]): any {
    const total = devices.reduce((sum, d) => sum + d.count, 0);
    const result: any = { desktop: 0, mobile: 0, tablet: 0 };
    
    devices.forEach(d => {
      if (d.deviceType) {
        result[d.deviceType] = Math.round((d.count / total) * 100);
      }
    });
    
    return result;
  }

  private async updateSessionActivity(sessionId: string, eventType: string): Promise<void> {
    try {
      await db
        .update(analyticsSessions)
        .set({
          events: sql`${analyticsSessions.events} + 1`,
          endTime: new Date(),
          bounced: eventType === 'page_view' ? false : sql`${analyticsSessions.bounced}`
        })
        .where(eq(analyticsSessions.sessionId, sessionId));
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Generate a unique session ID
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export const analyticsService = new AnalyticsService();