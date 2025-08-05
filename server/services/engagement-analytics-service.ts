import { db } from "../db";
import { communities, users } from "../../shared/schema";
import { 
  communityEngagementMetrics, 
  userInteractions, 
  engagementAlerts,
  scorecardConfigurations,
  type CommunityEngagementMetrics,
  type UserInteraction,
  type EngagementScoreBreakdown
} from "../../shared/engagementSchemas";
import { eq, and, gte, lte, desc, asc, avg, sum, count, sql } from "drizzle-orm";
export class EngagementAnalyticsService {
  constructor() {
    // Initialize service
  }

  // Track user interaction with communities
  async trackInteraction(interaction: {
    userId?: string;
    sessionId: string;
    communityId: number;
    interactionType: UserInteraction['interactionType'];
    sourceUrl?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    interactionValue?: number;
    timeSpent?: number;
    searchQuery?: string;
    searchPosition?: number;
    city?: string;
    state?: string;
    pageLoadTime?: number;
  }): Promise<UserInteraction> {
    const [newInteraction] = await db.insert(userInteractions)
      .values({
        ...interaction,
        timestamp: new Date(),
      })
      .returning();

    // Update real-time metrics for the community
    await this.updateRealTimeMetrics(interaction.communityId, interaction.interactionType);

    return newInteraction;
  }

  // Update real-time metrics based on interaction
  private async updateRealTimeMetrics(communityId: number, interactionType: string): Promise<void> {
    const updates: { [key: string]: number } = {};

    switch (interactionType) {
      case 'profile_view':
        updates.monthlyViews = 1;
        break;
      case 'inquiry':
      case 'tour_request':
        updates.monthlyLeads = 1;
        break;
      case 'phone_click':
      case 'website_click':
      case 'directions_click':
        updates.monthlyMessages = 1;
        break;
    }

    if (Object.keys(updates).length > 0) {
      await db.update(communities)
        .set(updates)
        .where(eq(communities.id, communityId));
    }
  }

  // Calculate comprehensive engagement metrics for a community
  async calculateEngagementMetrics(
    communityId: number, 
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): Promise<CommunityEngagementMetrics> {
    const periodStartDate = this.getPeriodStartDate(periodType);
    const periodEndDate = new Date();

    // Get interaction counts by type
    const interactionStats = await db
      .select({
        interactionType: userInteractions.interactionType,
        count: count(),
        totalTimeSpent: sum(userInteractions.timeSpent),
        uniqueUsers: sql<number>`COUNT(DISTINCT ${userInteractions.userId})`,
      })
      .from(userInteractions)
      .where(
        and(
          eq(userInteractions.communityId, communityId),
          gte(userInteractions.timestamp, periodStartDate),
          lte(userInteractions.timestamp, periodEndDate)
        )
      )
      .groupBy(userInteractions.interactionType);

    // Calculate metrics from interactions
    const metrics = this.processInteractionStats(interactionStats);

    // Get previous period for comparison
    const previousPeriodStart = this.getPreviousPeriodStartDate(periodType);
    const previousMetrics = await this.getPreviousPeriodMetrics(
      communityId, 
      previousPeriodStart, 
      periodStartDate
    );

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(metrics);

    // Calculate trends
    const previousPeriodComparison = previousMetrics && previousMetrics.engagementScore ? 
      ((engagementScore - (previousMetrics.engagementScore as number)) / (previousMetrics.engagementScore as number)) * 100 : 0;

    const trendDirection = previousPeriodComparison > 5 ? 'increasing' : 
                          previousPeriodComparison < -5 ? 'decreasing' : 'stable';

    // Create or update engagement metrics record
    const engagementMetricsData: typeof communityEngagementMetrics.$inferInsert = {
      communityId,
      reportingPeriod: periodStartDate,
      periodType,
      ...metrics,
      engagementScore: engagementScore.toString(),
      trendDirection,
      previousPeriodComparison: previousPeriodComparison.toString(),
      lastCalculated: new Date(),
      dataQuality: this.calculateDataQuality(metrics),
    };

    const [savedMetrics] = await db.insert(communityEngagementMetrics)
      .values(engagementMetricsData)
      .onConflictDoUpdate({
        target: [
          communityEngagementMetrics.communityId,
          communityEngagementMetrics.reportingPeriod,
          communityEngagementMetrics.periodType
        ],
        set: engagementMetricsData,
      })
      .returning();

    // Check for alerts
    await this.checkEngagementAlerts(communityId, savedMetrics, previousMetrics);

    return savedMetrics;
  }

  // Process interaction statistics into metrics
  private processInteractionStats(stats: any[]): Partial<CommunityEngagementMetrics> {
    const metrics: any = {
      profileViews: 0,
      uniqueVisitors: 0,
      photoViews: 0,
      videoViews: 0,
      virtualTourViews: 0,
      brochureDownloads: 0,
      inquiries: 0,
      tourRequests: 0,
      directMessages: 0,
      phoneCallClicks: 0,
      websiteClicks: 0,
      directionsClicks: 0,
      reviewsReceived: 0,
      reviewResponses: 0,
      socialShares: 0,
      favorites: 0,
      searchImpressions: 0,
      searchClicks: 0,
      featuredImpressions: 0,
    };

    let totalTimeSpent = 0;
    let totalUniqueVisitors = 0;

    stats.forEach(stat => {
      switch (stat.interactionType) {
        case 'profile_view':
          metrics.profileViews = stat.count;
          break;
        case 'photo_view':
          metrics.photoViews = stat.count;
          break;
        case 'video_view':
          metrics.videoViews = stat.count;
          break;
        case 'virtual_tour':
          metrics.virtualTourViews = stat.count;
          break;
        case 'brochure_download':
          metrics.brochureDownloads = stat.count;
          break;
        case 'inquiry':
          metrics.inquiries = stat.count;
          break;
        case 'tour_request':
          metrics.tourRequests = stat.count;
          break;
        case 'phone_click':
          metrics.phoneCallClicks = stat.count;
          break;
        case 'website_click':
          metrics.websiteClicks = stat.count;
          break;
        case 'directions_click':
          metrics.directionsClicks = stat.count;
          break;
        case 'review_submission':
          metrics.reviewsReceived = stat.count;
          break;
        case 'social_share':
          metrics.socialShares = stat.count;
          break;
        case 'favorite_add':
          metrics.favorites = stat.count;
          break;
        case 'search_result_click':
          metrics.searchClicks = stat.count;
          break;
        case 'featured_click':
          metrics.featuredImpressions = stat.count;
          break;
      }

      totalTimeSpent += stat.totalTimeSpent || 0;
      totalUniqueVisitors = Math.max(totalUniqueVisitors, stat.uniqueUsers || 0);
    });

    metrics.uniqueVisitors = totalUniqueVisitors;
    metrics.timeOnProfile = Math.round(totalTimeSpent / Math.max(metrics.profileViews, 1));

    // Calculate derived metrics
    metrics.clickThroughRate = metrics.searchImpressions > 0 ? 
      metrics.searchClicks / metrics.searchImpressions : 0;
    
    metrics.conversionRate = metrics.profileViews > 0 ? 
      (metrics.inquiries + metrics.tourRequests) / metrics.profileViews : 0;

    metrics.bounceRate = metrics.profileViews > 0 ? 
      (metrics.profileViews - metrics.photoViews - metrics.videoViews) / metrics.profileViews : 0;

    return metrics;
  }

  // Calculate overall engagement score (0-100)
  private calculateEngagementScore(metrics: any): number {
    const weights = {
      traffic: 0.25,      // 25% - views, visitors
      interaction: 0.30,  // 30% - clicks, actions
      content: 0.20,      // 20% - content engagement
      leads: 0.25,        // 25% - conversion metrics
    };

    // Traffic Score (0-100)
    const trafficScore = Math.min(100, 
      (metrics.profileViews * 0.6 + metrics.uniqueVisitors * 0.4) / 10
    );

    // Interaction Score (0-100)
    const totalInteractions = metrics.phoneCallClicks + metrics.websiteClicks + 
                             metrics.directionsClicks + metrics.photoViews + metrics.videoViews;
    const interactionScore = Math.min(100, totalInteractions * 2);

    // Content Score (0-100)
    const contentScore = Math.min(100, 
      (metrics.photoViews * 0.4 + metrics.videoViews * 0.4 + metrics.virtualTourViews * 0.2) / 5
    );

    // Lead Score (0-100)
    const leadScore = Math.min(100, 
      (metrics.inquiries * 10 + metrics.tourRequests * 8 + metrics.favorites * 3)
    );

    const totalScore = 
      trafficScore * weights.traffic +
      interactionScore * weights.interaction +
      contentScore * weights.content +
      leadScore * weights.leads;

    return Math.round(totalScore);
  }

  // Get engagement scorecard with tier-appropriate data
  async getEngagementScorecard(
    communityId: number, 
    subscriptionTier: string = 'verified'
  ): Promise<EngagementScoreBreakdown> {
    // Get scorecard configuration for tier
    const configs = await db.select()
      .from(scorecardConfigurations)
      .where(eq(scorecardConfigurations.subscriptionTier, subscriptionTier as any))
      .limit(1);
    const config = configs[0];

    // Get latest metrics
    const [latestMetrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(eq(communityEngagementMetrics.communityId, communityId))
      .orderBy(desc(communityEngagementMetrics.reportingPeriod))
      .limit(1);

    if (!latestMetrics) {
      // Calculate metrics if none exist
      await this.calculateEngagementMetrics(communityId);
      return this.getEngagementScorecard(communityId, subscriptionTier);
    }

    // Calculate component scores
    const components = this.calculateComponentScores(latestMetrics);

    // Get trend data based on tier permissions
    const trends = await this.calculateTrends(communityId, config?.historicalDataAccess || false);

    // Generate recommendations
    const recommendations = this.generateRecommendations(latestMetrics, components);

    // Get benchmarks (tier permitting)
    const benchmarks = await this.calculateBenchmarks(
      communityId, 
      config?.showCompetitiveMetrics || false
    );

    return {
      totalScore: latestMetrics.engagementScore || 0,
      components,
      trends,
      recommendations,
      benchmarks,
    };
  }

  // Calculate component scores for detailed breakdown
  private calculateComponentScores(metrics: CommunityEngagementMetrics) {
    const trafficScore = Math.min(100, 
      ((metrics.profileViews || 0) * 0.6 + (metrics.uniqueVisitors || 0) * 0.4) / 10
    );

    const totalInteractions = (metrics.phoneCallClicks || 0) + (metrics.websiteClicks || 0) + 
                             (metrics.directionsClicks || 0) + (metrics.photoViews || 0) + 
                             (metrics.videoViews || 0);
    const interactionScore = Math.min(100, totalInteractions * 2);

    const contentScore = Math.min(100, 
      ((metrics.photoViews || 0) * 0.4 + (metrics.videoViews || 0) * 0.4 + 
       (metrics.virtualTourViews || 0) * 0.2) / 5
    );

    const leadQualityScore = Math.min(100, 
      ((metrics.inquiries || 0) * 10 + (metrics.tourRequests || 0) * 8 + (metrics.favorites || 0) * 3)
    );

    const responseScore = metrics.responseTime ? 
      Math.max(0, 100 - (metrics.responseTime / 60)) : 50; // Default 50 if no data

    return {
      trafficScore: Math.round(trafficScore),
      interactionScore: Math.round(interactionScore),
      contentScore: Math.round(contentScore),
      leadQualityScore: Math.round(leadQualityScore),
      responseScore: Math.round(responseScore),
    };
  }

  // Calculate trends based on historical data
  private async calculateTrends(communityId: number, hasHistoricalAccess: boolean) {
    if (!hasHistoricalAccess) {
      return {
        weekOverWeek: 0,
        monthOverMonth: 0,
        quarterOverQuarter: 0,
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneQuarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [weekMetrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(
        and(
          eq(communityEngagementMetrics.communityId, communityId),
          gte(communityEngagementMetrics.reportingPeriod, oneWeekAgo)
        )
      )
      .orderBy(desc(communityEngagementMetrics.reportingPeriod))
      .limit(1);

    const [monthMetrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(
        and(
          eq(communityEngagementMetrics.communityId, communityId),
          gte(communityEngagementMetrics.reportingPeriod, oneMonthAgo)
        )
      )
      .orderBy(desc(communityEngagementMetrics.reportingPeriod))
      .limit(1);

    const [quarterMetrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(
        and(
          eq(communityEngagementMetrics.communityId, communityId),
          gte(communityEngagementMetrics.reportingPeriod, oneQuarterAgo)
        )
      )
      .orderBy(desc(communityEngagementMetrics.reportingPeriod))
      .limit(1);

    return {
      weekOverWeek: Number(weekMetrics?.previousPeriodComparison || 0),
      monthOverMonth: Number(monthMetrics?.previousPeriodComparison || 0),
      quarterOverQuarter: Number(quarterMetrics?.previousPeriodComparison || 0),
    };
  }

  // Generate actionable recommendations
  private generateRecommendations(
    metrics: CommunityEngagementMetrics, 
    components: any
  ): string[] {
    const recommendations: string[] = [];

    if (Number(components.trafficScore) < 30) {
      recommendations.push("Consider improving your search visibility and online presence");
    }

    if (Number(components.interactionScore) < 40) {
      recommendations.push("Add more engaging content like photos and virtual tours");
    }

    if (Number(components.contentScore) < 30) {
      recommendations.push("Upload high-quality photos and consider adding a video tour");
    }

    if (Number(components.leadQualityScore) < 25) {
      recommendations.push("Optimize your profile to encourage more inquiries and tour requests");
    }

    if (Number(components.responseScore) < 50) {
      recommendations.push("Improve response time to inquiries for better engagement");
    }

    if (Number(metrics.conversionRate || 0) < 0.05) {
      recommendations.push("Review your profile content to improve inquiry conversion rate");
    }

    if (Number(metrics.bounceRate || 0) > 0.7) {
      recommendations.push("Add more compelling content to keep visitors engaged longer");
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  // Calculate industry benchmarks
  private async calculateBenchmarks(communityId: number, showCompetitive: boolean) {
    if (!showCompetitive) {
      return {
        industryAverage: 0,
        topPercentile: 0,
        peerComparison: 0,
      };
    }

    // Get community details for comparison context
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      return {
        industryAverage: 0,
        topPercentile: 0,
        peerComparison: 0,
      };
    }

    // Calculate industry benchmarks
    const industryStats = await db.select({
      avgScore: avg(communityEngagementMetrics.engagementScore),
      maxScore: sql<number>`MAX(${communityEngagementMetrics.engagementScore})`,
    })
    .from(communityEngagementMetrics)
    .where(
      gte(communityEngagementMetrics.reportingPeriod, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    );

    // Calculate peer comparison (same state/care type)
    const peerStats = await db.select({
      avgScore: avg(communityEngagementMetrics.engagementScore),
    })
    .from(communityEngagementMetrics)
    .innerJoin(communities, eq(communities.id, communityEngagementMetrics.communityId))
    .where(
      and(
        eq(communities.state, community.state),
        gte(communityEngagementMetrics.reportingPeriod, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      )
    );

    return {
      industryAverage: Math.round(Number(industryStats[0]?.avgScore || 0)),
      topPercentile: Math.round(Number(industryStats[0]?.maxScore || 0) * 0.9), // 90th percentile approximation
      peerComparison: Math.round(Number(peerStats[0]?.avgScore || 0)),
    };
  }

  // Utility methods for date calculations
  private getPeriodStartDate(periodType: string): Date {
    const now = new Date();
    switch (periodType) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private getPreviousPeriodStartDate(periodType: string): Date {
    const current = this.getPeriodStartDate(periodType);
    switch (periodType) {
      case 'daily':
        return new Date(current.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(current.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(current.getFullYear(), current.getMonth() - 1, 1);
      case 'quarterly':
        return new Date(current.getFullYear(), current.getMonth() - 3, 1);
      default:
        return new Date(current.getFullYear(), current.getMonth() - 1, 1);
    }
  }

  private async getPreviousPeriodMetrics(
    communityId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<CommunityEngagementMetrics | null> {
    const [metrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(
        and(
          eq(communityEngagementMetrics.communityId, communityId),
          gte(communityEngagementMetrics.reportingPeriod, startDate),
          lte(communityEngagementMetrics.reportingPeriod, endDate)
        )
      )
      .orderBy(desc(communityEngagementMetrics.reportingPeriod))
      .limit(1);

    return metrics || null;
  }

  private calculateDataQuality(metrics: any): number {
    let qualityScore = 1.0;
    
    // Reduce quality if key metrics are missing
    if (!metrics.profileViews) qualityScore -= 0.2;
    if (!metrics.uniqueVisitors) qualityScore -= 0.1;
    if (!metrics.timeOnProfile) qualityScore -= 0.1;
    
    return Math.max(0, qualityScore);
  }

  // Check for engagement alerts
  private async checkEngagementAlerts(
    communityId: number, 
    currentMetrics: CommunityEngagementMetrics,
    previousMetrics: CommunityEngagementMetrics | null
  ): Promise<void> {
    const alerts: any[] = [];

    // Low engagement alert
    if (Number(currentMetrics.engagementScore || 0) < 25) {
      alerts.push({
        communityId,
        alertType: 'low_engagement',
        alertSeverity: 'warning',
        title: 'Low Engagement Score',
        message: `Your engagement score is ${currentMetrics.engagementScore}. Consider optimizing your profile.`,
        currentValue: currentMetrics.engagementScore,
        thresholdValue: 25,
      });
    }

    // Traffic spike alert
    if (previousMetrics && (currentMetrics.profileViews || 0) > (previousMetrics.profileViews || 0) * 1.5) {
      alerts.push({
        communityId,
        alertType: 'traffic_spike',
        alertSeverity: 'info',
        title: 'Traffic Increase Detected',
        message: `Your profile views increased by ${Math.round(((currentMetrics.profileViews || 0) - (previousMetrics.profileViews || 0)) / (previousMetrics.profileViews || 1) * 100)}%`,
        currentValue: currentMetrics.profileViews,
        previousValue: previousMetrics.profileViews,
        changePercentage: Math.round(((currentMetrics.profileViews || 0) - (previousMetrics.profileViews || 0)) / (previousMetrics.profileViews || 1) * 100),
      });
    }

    // Save alerts
    if (alerts.length > 0) {
      await db.insert(engagementAlerts).values(alerts);
    }
  }

  // Get alerts for a community
  async getEngagementAlerts(communityId: number, limit: number = 10) {
    return await db.select()
      .from(engagementAlerts)
      .where(eq(engagementAlerts.communityId, communityId))
      .orderBy(desc(engagementAlerts.createdAt))
      .limit(limit);
  }

  // Mark alert as read
  async markAlertAsRead(alertId: number): Promise<void> {
    await db.update(engagementAlerts)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(engagementAlerts.id, alertId));
  }
}