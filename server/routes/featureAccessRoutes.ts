// Feature Access Routes
// Tier-based feature access control endpoints

import { Router } from 'express';
import { FeatureAccessControl } from '../services/feature-access-control';
import { requireAuth } from '../auth';

const router = Router();

// Get community feature access
router.get('/communities/:communityId/features', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const featureAccess = await FeatureAccessControl.checkCommunityAccess(communityId);
    res.json(featureAccess);
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Check specific feature access
router.get('/communities/:communityId/features/:feature', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const feature = req.params.feature as any;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const hasAccess = await FeatureAccessControl.hasFeature(communityId, feature);
    res.json({ feature, hasAccess });
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({ error: 'Failed to check feature' });
  }
});

// Get upgrade information
router.get('/communities/:communityId/upgrade-info', requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const upgradeInfo = await FeatureAccessControl.getUpgradeInfo(communityId);
    res.json(upgradeInfo || { upgradeAvailable: false });
  } catch (error) {
    console.error('Error getting upgrade info:', error);
    res.status(500).json({ error: 'Failed to get upgrade info' });
  }
});

// Get tier comparison for upgrade flow - Fortune 500 Enterprise Tiers
router.get('/tiers/comparison', async (req, res) => {
  try {
    const tiers = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          'Basic listing visibility',
          'Contact information display',
          'Search accessibility',
          'Family can view your community',
          'Claim your listing'
        ],
        priorities: []
      },
      {
        id: 'starter',
        name: 'Starter',
        price: 99,
        features: [
          'Everything in Free',
          '✅ Priority 1: Complete Financial Transparency',
          'Billing & invoice management',
          'Payment tracking & processing',
          'Financial reporting dashboard',
          'Family cost calculator',
          'Dual-sided financial portal'
        ],
        priorities: ['Financial Transparency']
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 499,
        features: [
          'Everything in Starter',
          '✅ Priority 2: Care Coordination Platform',
          'Electronic health records',
          'Medication management',
          'Personalized care plans',
          '✅ Priority 3: Daily Life Connection',
          'Activity calendar & planning',
          'Meal planning & dietary management',
          'Transportation scheduling',
          'Family messaging portal'
        ],
        priorities: ['Financial Transparency', 'Care Coordination', 'Daily Life Connection']
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 999,
        features: [
          'Everything in Professional',
          '✅ Priority 4: Staff Management Suite',
          'Complete HR tools',
          'Staff scheduling & time tracking',
          'Training program management',
          'Performance reviews & tracking',
          '✅ Priority 5: Marketing & Occupancy',
          'Full CRM system',
          'Lead tracking & conversion',
          'Tour scheduling & management',
          'Real-time occupancy tracking',
          'Marketing campaign analytics'
        ],
        priorities: ['Financial', 'Care', 'Daily Life', 'Staff', 'Marketing']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 3999,
        features: [
          'Everything in Premium',
          '🚀 Multi-property management dashboard',
          '🎨 White-label branding',
          '🔌 Full API integration access',
          '📊 Custom report builder',
          '👨‍💼 Dedicated success manager',
          '🤖 AI-powered business insights',
          '📈 Predictive analytics',
          '💰 Revenue forecasting & optimization',
          '🏢 Corporate account management',
          '🌐 Global expansion support'
        ],
        priorities: ['All 5 Priorities', 'Plus Enterprise Features']
      }
    ];

    res.json({ tiers });
  } catch (error) {
    console.error('Error getting tier comparison:', error);
    res.status(500).json({ error: 'Failed to get tier comparison' });
  }
});

export { router as featureAccessRouter };