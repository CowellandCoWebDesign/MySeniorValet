import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getTierFeatures, hasFeature, canUseFeature } from '../services/community-subscription';

// Extended Request interface with community data
interface CommunityRequest extends Request {
  community?: {
    id: number;
    subscriptionTier: string;
    billingStatus: string;
  };
}

// Middleware to load community data and subscription tier
export async function loadCommunitySubscription(req: CommunityRequest, res: Response, next: NextFunction) {
  try {
    const communityId = parseInt(req.params.communityId || req.body.communityId);
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const [community] = await db
      .select({
        id: communities.id,
        subscriptionTier: communities.subscriptionTier,
        billingStatus: communities.billingStatus,
      })
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if subscription is active
    if (community.billingStatus !== 'active' && community.billingStatus !== 'trialing') {
      community.subscriptionTier = 'verified'; // Downgrade to free tier if not active
    }

    req.community = community;
    next();
  } catch (error) {
    console.error('Error loading community subscription:', error);
    res.status(500).json({ error: 'Failed to load subscription data' });
  }
}

// Middleware factory to check specific features
export function requireFeature(feature: keyof ReturnType<typeof getTierFeatures>) {
  return (req: CommunityRequest, res: Response, next: NextFunction) => {
    if (!req.community) {
      return res.status(401).json({ error: 'Community data not loaded' });
    }

    const tier = req.community.subscriptionTier || 'verified';
    
    if (!hasFeature(tier, feature)) {
      return res.status(403).json({ 
        error: 'Feature not available in current subscription tier',
        feature,
        currentTier: tier,
        upgradeRequired: true
      });
    }

    next();
  };
}

// Middleware to check photo upload limits
export async function checkPhotoUploadLimit(req: CommunityRequest, res: Response, next: NextFunction) {
  if (!req.community) {
    return res.status(401).json({ error: 'Community data not loaded' });
  }

  try {
    const [communityData] = await db
      .select({ imageGallery: communities.imageGallery })
      .from(communities)
      .where(eq(communities.id, req.community.id));

    const currentPhotoCount = communityData?.imageGallery?.length || 0;
    const uploadCount = parseInt(req.body.uploadCount || '1');
    
    if (!canUseFeature(req.community.subscriptionTier, 'maxPhotos', currentPhotoCount + uploadCount)) {
      const features = getTierFeatures(req.community.subscriptionTier);
      return res.status(403).json({
        error: 'Photo upload limit reached',
        currentCount: currentPhotoCount,
        limit: features.maxPhotos,
        tier: req.community.subscriptionTier,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking photo limit:', error);
    res.status(500).json({ error: 'Failed to check photo limits' });
  }
}

// Middleware to check video upload limits
export async function checkVideoUploadLimit(req: CommunityRequest, res: Response, next: NextFunction) {
  if (!req.community) {
    return res.status(401).json({ error: 'Community data not loaded' });
  }

  const features = getTierFeatures(req.community.subscriptionTier);
  
  if (features.maxVideos === 0) {
    return res.status(403).json({
      error: 'Video uploads not available in current tier',
      tier: req.community.subscriptionTier,
      upgradeRequired: true
    });
  }

  // Check video length
  const videoLength = parseInt(req.body.videoLength || '0');
  if (videoLength > features.maxVideoLength * 60) { // Convert minutes to seconds
    return res.status(403).json({
      error: 'Video exceeds maximum length',
      maxLength: `${features.maxVideoLength} minutes`,
      tier: req.community.subscriptionTier,
      upgradeRequired: true
    });
  }

  next();
}

// Middleware to check PDF upload limits
export async function checkPdfUploadLimit(req: CommunityRequest, res: Response, next: NextFunction) {
  if (!req.community) {
    return res.status(401).json({ error: 'Community data not loaded' });
  }

  const features = getTierFeatures(req.community.subscriptionTier);
  
  if (features.maxPdfs === 0) {
    return res.status(403).json({
      error: 'PDF uploads not available in current tier',
      tier: req.community.subscriptionTier,
      upgradeRequired: true
    });
  }

  // TODO: Check current PDF count from storage
  next();
}

// Check if community can respond to reviews
export function canRespondToReviews(req: CommunityRequest, res: Response, next: NextFunction) {
  if (!req.community) {
    return res.status(401).json({ error: 'Community data not loaded' });
  }

  if (!hasFeature(req.community.subscriptionTier, 'respondToReviews')) {
    return res.status(403).json({
      error: 'Review responses not available in current tier',
      tier: req.community.subscriptionTier,
      minTier: 'standard',
      upgradeRequired: true
    });
  }

  next();
}

// Check messaging access
export function canUseMessaging(req: CommunityRequest, res: Response, next: NextFunction) {
  if (!req.community) {
    return res.status(401).json({ error: 'Community data not loaded' });
  }

  if (!hasFeature(req.community.subscriptionTier, 'inAppMessaging')) {
    return res.status(403).json({
      error: 'In-app messaging not available in current tier',
      tier: req.community.subscriptionTier,
      minTier: 'featured',
      upgradeRequired: true
    });
  }

  next();
}

// Check analytics access
export function checkAnalyticsAccess(level: 'basic' | 'advanced') {
  return (req: CommunityRequest, res: Response, next: NextFunction) => {
    if (!req.community) {
      return res.status(401).json({ error: 'Community data not loaded' });
    }

    const feature = level === 'basic' ? 'basicAnalytics' : 'advancedAnalytics';
    
    if (!hasFeature(req.community.subscriptionTier, feature)) {
      return res.status(403).json({
        error: `${level} analytics not available in current tier`,
        tier: req.community.subscriptionTier,
        minTier: level === 'basic' ? 'standard' : 'featured',
        upgradeRequired: true
      });
    }

    next();
  };
}

// Check advanced features (Platinum tier)
export function requirePlatinumFeature(feature: string) {
  return (req: CommunityRequest, res: Response, next: NextFunction) => {
    if (!req.community) {
      return res.status(401).json({ error: 'Community data not loaded' });
    }

    if (req.community.subscriptionTier !== 'platinum') {
      return res.status(403).json({
        error: `${feature} requires Platinum tier`,
        currentTier: req.community.subscriptionTier,
        requiredTier: 'platinum',
        upgradeRequired: true
      });
    }

    next();
  };
}

// Helper to get subscription status for frontend
export function getSubscriptionStatus(req: CommunityRequest, res: Response) {
  if (!req.community) {
    return res.status(401).json({ error: 'Community data not loaded' });
  }

  const features = getTierFeatures(req.community.subscriptionTier);
  
  res.json({
    tier: req.community.subscriptionTier,
    billingStatus: req.community.billingStatus,
    features,
    limits: {
      photosUsed: 0, // TODO: Get actual count
      photosLimit: features.maxPhotos,
      videosUsed: 0, // TODO: Get actual count
      videosLimit: features.maxVideos,
      pdfsUsed: 0, // TODO: Get actual count
      pdfsLimit: features.maxPdfs,
    }
  });
}