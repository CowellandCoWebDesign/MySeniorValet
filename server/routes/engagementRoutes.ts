import type { Express } from "express";
import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "../db";
import { communities } from "../../shared/schema";
import { 
  communityEngagementMetrics, 
  engagementAlerts,
  scorecardConfigurations 
} from "../../shared/engagementSchemas";
import { EngagementAnalyticsService } from "../services/engagement-analytics-service";
import { isAuthenticated } from "../replitAuth";

const engagementService = new EngagementAnalyticsService();

export function registerEngagementRoutes(app: Express) {
  
  // Track user interaction with community
  app.post('/api/engagement/track', async (req, res) => {
    try {
      const {
        communityId,
        interactionType,
        sessionId,
        sourceUrl,
        referrer,
        deviceType,
        interactionValue,
        timeSpent,
        searchQuery,
        searchPosition,
      } = req.body;

      if (!communityId || !interactionType || !sessionId) {
        return res.status(400).json({ 
          error: 'Community ID, interaction type, and session ID are required' 
        });
      }

      // Extract user info from request
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip;
      const userId = req.isAuthenticated() ? (req.user as any)?.claims?.sub : undefined;

      const interaction = await engagementService.trackInteraction({
        userId,
        sessionId,
        communityId: parseInt(communityId),
        interactionType,
        sourceUrl,
        referrer,
        userAgent,
        ipAddress,
        deviceType,
        interactionValue,
        timeSpent,
        searchQuery,
        searchPosition,
        // Extract location from IP if available (simplified)
        city: req.get('CF-IPCity') || undefined,
        state: req.get('CF-IPCountryRegion') || undefined,
      });

      res.json({ 
        success: true, 
        interactionId: interaction.id,
        message: 'Interaction tracked successfully' 
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      res.status(500).json({ 
        error: 'Failed to track interaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get engagement scorecard for a community
  app.get('/api/engagement/scorecard/:communityId', isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = (req.user as any)?.claims?.sub;

      // Verify user owns this community or is admin
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      // Check if user has access (community owner or admin)
      const isOwner = community.claimedBy === userId;
      const isAdmin = (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'super_admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied. You must own this community to view analytics.' });
      }

      const subscriptionTier = community.subscriptionTier || 'verified';
      const scorecard = await engagementService.getEngagementScorecard(
        parseInt(communityId), 
        subscriptionTier
      );

      res.json({
        success: true,
        communityId: parseInt(communityId),
        communityName: community.name,
        subscriptionTier,
        scorecard
      });
    } catch (error) {
      console.error('Error fetching engagement scorecard:', error);
      res.status(500).json({ 
        error: 'Failed to fetch engagement scorecard',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Calculate/refresh engagement metrics for a community
  app.post('/api/engagement/calculate/:communityId', isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.params;
      const { periodType = 'monthly' } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      // Verify user owns this community or is admin
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const isOwner = community.claimedBy === userId;
      const isAdmin = (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'super_admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const metrics = await engagementService.calculateEngagementMetrics(
        parseInt(communityId),
        periodType
      );

      res.json({
        success: true,
        message: 'Engagement metrics calculated successfully',
        metrics: {
          engagementScore: metrics.engagementScore,
          reportingPeriod: metrics.reportingPeriod,
          periodType: metrics.periodType,
          trendDirection: metrics.trendDirection,
          previousPeriodComparison: metrics.previousPeriodComparison,
        }
      });
    } catch (error) {
      console.error('Error calculating engagement metrics:', error);
      res.status(500).json({ 
        error: 'Failed to calculate engagement metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get engagement alerts for a community
  app.get('/api/engagement/alerts/:communityId', isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.params;
      const { limit = 10 } = req.query;
      const userId = (req.user as any)?.claims?.sub;

      // Verify user owns this community or is admin
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const isOwner = community.claimedBy === userId;
      const isAdmin = (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'super_admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const alerts = await engagementService.getEngagementAlerts(
        parseInt(communityId),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        alerts
      });
    } catch (error) {
      console.error('Error fetching engagement alerts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch engagement alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mark engagement alert as read
  app.patch('/api/engagement/alerts/:alertId/read', isAuthenticated, async (req, res) => {
    try {
      const { alertId } = req.params;
      
      await engagementService.markAlertAsRead(parseInt(alertId));

      res.json({
        success: true,
        message: 'Alert marked as read'
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      res.status(500).json({ 
        error: 'Failed to mark alert as read',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get engagement metrics history for a community
  app.get('/api/engagement/history/:communityId', isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.params;
      const { periodType = 'monthly', limit = 12 } = req.query;
      const userId = (req.user as any)?.claims?.sub;

      // Verify user owns this community or is admin
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const isOwner = community.claimedBy === userId;
      const isAdmin = (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'super_admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if tier allows historical data
      const subscriptionTier = community.subscriptionTier || 'verified';
      const allowedTiers = ['featured', 'platinum'];
      
      if (!allowedTiers.includes(subscriptionTier) && !isAdmin) {
        return res.status(403).json({ 
          error: 'Historical data access requires Featured or Platinum subscription' 
        });
      }

      const metricsHistory = await db.select()
        .from(communityEngagementMetrics)
        .where(
          and(
            eq(communityEngagementMetrics.communityId, parseInt(communityId)),
            eq(communityEngagementMetrics.periodType, periodType as string)
          )
        )
        .orderBy(desc(communityEngagementMetrics.reportingPeriod))
        .limit(parseInt(limit as string));

      res.json({
        success: true,
        communityId: parseInt(communityId),
        periodType,
        history: metricsHistory.map(metric => ({
          reportingPeriod: metric.reportingPeriod,
          engagementScore: metric.engagementScore,
          profileViews: metric.profileViews,
          uniqueVisitors: metric.uniqueVisitors,
          inquiries: metric.inquiries,
          tourRequests: metric.tourRequests,
          conversionRate: metric.conversionRate,
          trendDirection: metric.trendDirection,
          previousPeriodComparison: metric.previousPeriodComparison,
        }))
      });
    } catch (error) {
      console.error('Error fetching engagement history:', error);
      res.status(500).json({ 
        error: 'Failed to fetch engagement history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get scorecard configuration for subscription tier
  app.get('/api/engagement/config/:tier', async (req, res) => {
    try {
      const { tier } = req.params;

      const [config] = await db.select()
        .from(scorecardConfigurations)
        .where(eq(scorecardConfigurations.subscriptionTier, tier))
        .limit(1);

      res.json({
        success: true,
        tier,
        configuration: config || {
          showEngagementScore: true,
          showTrafficMetrics: true,
          showLeadMetrics: tier !== 'verified',
          showCompetitiveMetrics: tier === 'platinum',
          showDetailedAnalytics: ['featured', 'platinum'].includes(tier),
          dataRetentionDays: tier === 'verified' ? 30 : 90,
          historicalDataAccess: ['featured', 'platinum'].includes(tier),
        }
      });
    } catch (error) {
      console.error('Error fetching scorecard configuration:', error);
      res.status(500).json({ 
        error: 'Failed to fetch scorecard configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Analytics dashboard summary for admin
  app.get('/api/engagement/admin/dashboard', isAuthenticated, async (req, res) => {
    try {
      const userRole = (req.user as any)?.role;
      
      if (!['admin', 'super_admin', 'analytics_viewer'].includes(userRole)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get summary statistics
      const [totalCommunitiesWithMetrics] = await db.select({
        count: sql<number>`COUNT(DISTINCT ${communityEngagementMetrics.communityId})`
      })
      .from(communityEngagementMetrics)
      .where(gte(communityEngagementMetrics.reportingPeriod, thirtyDaysAgo));

      const [averageEngagementScore] = await db.select({
        avgScore: sql<number>`ROUND(AVG(${communityEngagementMetrics.engagementScore}), 2)`
      })
      .from(communityEngagementMetrics)
      .where(gte(communityEngagementMetrics.reportingPeriod, thirtyDaysAgo));

      const [totalInteractions] = await db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(userInteractions)
      .where(gte(userInteractions.timestamp, thirtyDaysAgo));

      const [unreadAlerts] = await db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(engagementAlerts)
      .where(eq(engagementAlerts.isRead, false));

      res.json({
        success: true,
        dashboard: {
          totalCommunitiesWithMetrics: totalCommunitiesWithMetrics?.count || 0,
          averageEngagementScore: averageEngagementScore?.avgScore || 0,
          totalInteractionsLast30Days: totalInteractions?.count || 0,
          unreadAlerts: unreadAlerts?.count || 0,
        }
      });
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      res.status(500).json({ 
        error: 'Failed to fetch admin dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}