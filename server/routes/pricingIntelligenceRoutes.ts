import type { Express } from 'express';
import { PricingIntelligenceService } from '../pricing-intelligence-service';
import { db } from '../db';
import { communities, pricingAlerts } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export function registerPricingIntelligenceRoutes(app: Express): void {
  const pricingService = new PricingIntelligenceService();

  /**
   * Get enhanced pricing intelligence for a community
   */
  app.get('/api/pricing-intelligence/:communityId', async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      
      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community) {
        return res.status(404).json({ 
          success: false,
          error: 'Community not found' 
        });
      }
      
      // Get enhanced pricing with confidence scores and trends
      const pricingData = await pricingService.getEnhancedPricing(
        community.id,
        community.name,
        community.city,
        community.state
      );
      
      res.json({
        success: true,
        data: {
          communityId: community.id,
          communityName: community.name,
          pricing: pricingData,
          metadata: {
            confidence: pricingData.confidence,
            source: pricingData.source,
            lastUpdated: pricingData.lastUpdated,
            trend: pricingData.trend,
            percentChange: pricingData.percentChange
          }
        }
      });
    } catch (error) {
      console.error('Error fetching pricing intelligence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pricing intelligence'
      });
    }
  });

  /**
   * Set a pricing alert for a community
   */
  app.post('/api/pricing-alerts', async (req, res) => {
    try {
      const { userId, communityId, alertType, threshold } = req.body;
      
      if (!userId || !communityId || !alertType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Create pricing alert
      const [alert] = await db
        .insert(pricingAlerts)
        .values({
          userId: parseInt(userId),
          communityId: parseInt(communityId),
          alertType,
          threshold: threshold ? parseInt(threshold) : null,
          isActive: true,
          triggerCount: 0
        })
        .returning();
      
      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error creating pricing alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create pricing alert'
      });
    }
  });

  /**
   * Get user's pricing alerts
   */
  app.get('/api/pricing-alerts/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const alerts = await db
        .select({
          alert: pricingAlerts,
          community: communities
        })
        .from(pricingAlerts)
        .leftJoin(communities, eq(pricingAlerts.communityId, communities.id))
        .where(eq(pricingAlerts.userId, userId));
      
      res.json({
        success: true,
        data: alerts.map(({ alert, community }) => ({
          ...alert,
          communityName: community?.name,
          communityCity: community?.city,
          communityState: community?.state
        }))
      });
    } catch (error) {
      console.error('Error fetching pricing alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pricing alerts'
      });
    }
  });

  /**
   * Delete a pricing alert
   */
  app.delete('/api/pricing-alerts/:alertId', async (req, res) => {
    try {
      const alertId = parseInt(req.params.alertId);
      
      await db
        .update(pricingAlerts)
        .set({ isActive: false })
        .where(eq(pricingAlerts.id, alertId));
      
      res.json({
        success: true,
        message: 'Alert deactivated successfully'
      });
    } catch (error) {
      console.error('Error deleting pricing alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete pricing alert'
      });
    }
  });

  /**
   * Check alerts for a specific user (trigger notifications)
   */
  app.post('/api/pricing-alerts/check/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      await pricingService.checkPricingAlerts(userId);
      
      res.json({
        success: true,
        message: 'Alerts checked successfully'
      });
    } catch (error) {
      console.error('Error checking pricing alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check pricing alerts'
      });
    }
  });
}