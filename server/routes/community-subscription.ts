import { Router } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { 
  loadCommunitySubscription, 
  requireFeature, 
  checkPhotoUploadLimit,
  checkVideoUploadLimit,
  checkPdfUploadLimit,
  canRespondToReviews,
  canUseMessaging,
  checkAnalyticsAccess,
  requirePlatinumFeature,
  getSubscriptionStatus
} from '../middleware/subscription-tier';
import {
  SUBSCRIPTION_TIERS,
  getTierComparison,
  getTierDisplayName,
  getTierPrice,
  getUpgradeOptionsForFeature
} from '../services/community-subscription';

const router = Router();

// Get available subscription tiers and pricing
router.get('/api/subscription/tiers', (req, res) => {
  const tiers = Object.values(SUBSCRIPTION_TIERS).map(tier => ({
    id: tier.name,
    name: tier.displayName,
    price: tier.price,
    badge: tier.badge,
    features: tier.features,
    popular: tier.name === 'featured' // Mark Featured as popular
  }));

  res.json({
    tiers,
    comparison: getTierComparison()
  });
});

// Get current subscription status for a community
router.get('/api/subscription/status/:communityId', 
  isAuthenticated,
  loadCommunitySubscription,
  getSubscriptionStatus
);

// Upload endpoints with tier restrictions
router.post('/api/communities/:communityId/photos',
  isAuthenticated,
  loadCommunitySubscription,
  checkPhotoUploadLimit,
  async (req, res) => {
    // Photo upload logic here
    res.json({ success: true, message: 'Photo upload allowed' });
  }
);

router.post('/api/communities/:communityId/videos',
  isAuthenticated,
  loadCommunitySubscription,
  checkVideoUploadLimit,
  async (req, res) => {
    // Video upload logic here
    res.json({ success: true, message: 'Video upload allowed' });
  }
);

router.post('/api/communities/:communityId/pdfs',
  isAuthenticated,
  loadCommunitySubscription,
  checkPdfUploadLimit,
  async (req, res) => {
    // PDF upload logic here
    res.json({ success: true, message: 'PDF upload allowed' });
  }
);

// Review response endpoint
router.post('/api/communities/:communityId/reviews/:reviewId/respond',
  isAuthenticated,
  loadCommunitySubscription,
  canRespondToReviews,
  async (req, res) => {
    // Review response logic here
    res.json({ success: true, message: 'Review response allowed' });
  }
);

// Messaging endpoint
router.post('/api/communities/:communityId/messages',
  isAuthenticated,
  loadCommunitySubscription,
  canUseMessaging,
  async (req, res) => {
    // Messaging logic here
    res.json({ success: true, message: 'Messaging allowed' });
  }
);

// Analytics endpoints
router.get('/api/communities/:communityId/analytics/basic',
  isAuthenticated,
  loadCommunitySubscription,
  checkAnalyticsAccess('basic'),
  async (req, res) => {
    // Basic analytics logic here
    res.json({ 
      views: 150,
      searches: 45,
      contacts: 12,
      period: 'last_30_days'
    });
  }
);

router.get('/api/communities/:communityId/analytics/advanced',
  isAuthenticated,
  loadCommunitySubscription,
  checkAnalyticsAccess('advanced'),
  async (req, res) => {
    // Advanced analytics logic here
    res.json({ 
      demographics: {},
      searchTerms: [],
      conversionFunnel: {},
      competitorAnalysis: {},
      period: 'last_30_days'
    });
  }
);

// Platinum features
router.post('/api/communities/:communityId/staff',
  isAuthenticated,
  loadCommunitySubscription,
  requirePlatinumFeature('Staff Bios'),
  async (req, res) => {
    // Staff management logic
    res.json({ success: true, message: 'Staff bio added' });
  }
);

router.post('/api/communities/:communityId/availability/sync',
  isAuthenticated,
  loadCommunitySubscription,
  requirePlatinumFeature('Real-Time Availability'),
  async (req, res) => {
    // Availability sync logic
    res.json({ success: true, message: 'Availability synced' });
  }
);

// Check feature availability
router.get('/api/subscription/check-feature/:communityId/:feature',
  isAuthenticated,
  async (req, res) => {
    try {
      const { communityId, feature } = req.params;
      
      const [community] = await db
        .select({ subscriptionTier: communities.subscriptionTier })
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)));

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const tier = community.subscriptionTier || 'verified';
      const tierData = SUBSCRIPTION_TIERS[tier];
      const hasAccess = tierData.features[feature as keyof typeof tierData.features];

      if (!hasAccess || hasAccess === 0 || hasAccess === false) {
        const upgradeOptions = getUpgradeOptionsForFeature(tier, feature as any);
        return res.json({
          hasAccess: false,
          currentTier: tier,
          upgradeOptions: upgradeOptions.map(opt => ({
            tier: opt.name,
            name: opt.displayName,
            price: opt.price,
            featureValue: opt.features[feature as keyof typeof opt.features]
          }))
        });
      }

      res.json({
        hasAccess: true,
        currentTier: tier,
        featureValue: hasAccess
      });
    } catch (error) {
      console.error('Error checking feature:', error);
      res.status(500).json({ error: 'Failed to check feature availability' });
    }
  }
);

// Update subscription tier (admin only)
router.put('/api/subscription/update-tier/:communityId',
  isAuthenticated,
  async (req, res) => {
    try {
      // TODO: Add admin check middleware
      const { communityId } = req.params;
      const { tier } = req.body;

      if (!SUBSCRIPTION_TIERS[tier]) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }

      await db
        .update(communities)
        .set({ 
          subscriptionTier: tier,
          updatedAt: new Date()
        })
        .where(eq(communities.id, parseInt(communityId)));

      res.json({ 
        success: true, 
        message: `Community upgraded to ${getTierDisplayName(tier)} tier`
      });
    } catch (error) {
      console.error('Error updating tier:', error);
      res.status(500).json({ error: 'Failed to update subscription tier' });
    }
  }
);

export default router;