// Tier-Protected Analytics Routes
// All analytics endpoints check subscription tier before returning data

import { Router } from 'express';
import { requireAuth } from '../auth';
import { TierProtectedAnalytics } from '../services/tier-protected-analytics';
import { FeatureAccessControl } from '../services/feature-access-control';

const router = Router();
const analyticsService = new TierProtectedAnalytics();

// Get community analytics (tier-protected)
router.get('/communities/:communityId/analytics', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    // Get analytics based on tier
    const analytics = await analyticsService.getCommunityAnalytics(communityId);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Check analytics feature availability
router.get('/communities/:communityId/analytics/available', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const hasBasic = await FeatureAccessControl.hasFeature(communityId, 'basicAnalytics');
    const hasAdvanced = await FeatureAccessControl.hasFeature(communityId, 'advancedAnalytics');
    
    res.json({
      basicAnalytics: hasBasic,
      advancedAnalytics: hasAdvanced,
      currentAccess: hasAdvanced ? 'advanced' : hasBasic ? 'basic' : 'none'
    });
  } catch (error) {
    console.error('Error checking analytics availability:', error);
    res.status(500).json({ error: 'Failed to check analytics availability' });
  }
});

// Get specific metric (tier-protected)
router.get('/communities/:communityId/analytics/:metric', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const metric = req.params.metric;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    // Check if they have analytics access at all
    const hasBasic = await FeatureAccessControl.hasFeature(communityId, 'basicAnalytics');
    if (!hasBasic) {
      return res.status(403).json({ 
        error: 'Analytics access denied',
        requiresTier: 'featured',
        message: 'Upgrade to Featured Spotlight to access analytics'
      });
    }

    // For advanced metrics, check advanced analytics access
    const advancedMetrics = ['dailyTrends', 'sourceBreakdown', 'peakTimes', 'conversionFunnel'];
    if (advancedMetrics.includes(metric)) {
      const hasAdvanced = await FeatureAccessControl.hasFeature(communityId, 'advancedAnalytics');
      if (!hasAdvanced) {
        return res.status(403).json({ 
          error: 'Advanced analytics access denied',
          requiresTier: 'premium',
          message: 'Upgrade to Premium Tools for advanced analytics'
        });
      }
    }

    // Get full analytics
    const analytics = await analyticsService.getCommunityAnalytics(communityId);
    
    // Return specific metric
    if (metric in analytics) {
      res.json({ [metric]: analytics[metric as keyof typeof analytics] });
    } else {
      res.status(404).json({ error: 'Metric not found' });
    }
  } catch (error) {
    console.error('Error fetching metric:', error);
    res.status(500).json({ error: 'Failed to fetch metric' });
  }
});

// Export the router function
export function registerAnalyticsRoutes(app: any) {
  app.use('/api/analytics', router);
}

export default router;