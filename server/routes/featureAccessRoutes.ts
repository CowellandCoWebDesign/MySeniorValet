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
        id: 'verified',
        name: 'Verified',
        price: 0,
        features: [
          'Basic listing visibility',
          'Contact information display',
          'Search accessibility',
          'Verified badge',
          '1 photo',
          'Tour scheduling (if email verified)'
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 149,
        features: [
          'Everything in Verified',
          'Up to 10 photos',
          '1 brochure/PDF',
          'Respond to reviews',
          'Basic analytics',
          'Tour calendar link'
        ]
      },
      {
        id: 'featured',
        name: 'Featured',
        price: 249,
        features: [
          'Everything in Standard',
          'Up to 25 photos',
          '1 video (max 2 mins)',
          'Up to 3 PDFs',
          'In-app messaging',
          'AI response assist',
          'Advanced analytics',
          'Featured placement',
          'Map priority',
          'Search boost',
          'Concierge preferred',
          'Seasonal badges'
        ]
      },
      {
        id: 'platinum',
        name: 'Platinum',
        price: 349,
        features: [
          'Everything in Featured',
          'Up to 50 photos',
          'Up to 3 videos (max 5 mins each)',
          'Unlimited PDFs',
          'Monthly performance review call',
          'Staff bios',
          'Menus',
          'Care philosophy',
          'Job listings',
          'Real-time availability syncing',
          'Multi-property dashboard'
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