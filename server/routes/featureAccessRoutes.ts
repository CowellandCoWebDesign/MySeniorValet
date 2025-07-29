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

// Get tier comparison for upgrade flow
router.get('/tiers/comparison', async (req, res) => {
  try {
    const tiers = [
      {
        id: 'free',
        name: 'Free Listing',
        price: 0,
        features: [
          'Basic listing visibility',
          'Contact information display',
          'Search accessibility',
          'Verified badge'
        ]
      },
      {
        id: 'featured',
        name: 'Featured Spotlight',
        price: 149,
        features: [
          'Everything in Free',
          'Profile editing tools',
          'Featured search placement',
          'Red Tag special promotions',
          'Photo gallery (5 photos)',
          'Custom intake forms',
          'Basic analytics dashboard'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Tools + Exposure',
        price: 249,
        features: [
          'Everything in Featured',
          'Branded intake forms',
          'Real-time availability management',
          'Tour scheduling system',
          'Unlimited photo storage',
          'Advanced analytics & insights',
          'Family messaging platform',
          'Priority support'
        ]
      },
      {
        id: 'platinum',
        name: 'Platinum Marketing Partner',
        price: 999,
        features: [
          'Everything in Premium',
          'Homepage featured placement',
          'Dedicated concierge service',
          'Sponsored content creation',
          'AI-powered tools suite',
          'API integration access',
          'White label branding',
          'Custom report builder',
          'Dedicated success manager'
        ]
      }
    ];

    res.json({ tiers });
  } catch (error) {
    console.error('Error getting tier comparison:', error);
    res.status(500).json({ error: 'Failed to get tier comparison' });
  }
});

export { router as featureAccessRouter };