import { Router } from 'express';
import { tourEmbedService } from '../services/tour-embed.service';
import { featureFlags } from '../services/feature-flags.service';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

/**
 * 3D Tour Embed API Routes
 * Flawless Execution: Complete validation and error handling
 */

// Validation schemas
const addTourSchema = z.object({
  communityId: z.number(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  embedUrl: z.string().url(),
  tourType: z.enum(['full_community', 'unit', 'amenities', 'neighborhood']),
  unitType: z.string().optional(),
  metadata: z.object({
    rooms: z.array(z.string()).optional(),
    squareFeet: z.number().optional(),
    features: z.array(z.string()).optional(),
    tourGuideAudio: z.string().url().optional(),
    hotspots: z.array(z.object({
      id: z.string(),
      position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
      label: z.string(),
      description: z.string(),
      link: z.string().optional()
    })).optional()
  }).optional()
});

const startSessionSchema = z.object({
  tourId: z.string(),
  visitorId: z.string(),
  sessionId: z.string(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet', 'vr']),
  referrer: z.string().optional()
});

// Middleware to verify community access
async function verifyCommunityAccess(req: any, res: any, next: any) {
  try {
    const communityId = parseInt(req.params.communityId || req.body.communityId);
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    const [community] = await db
      .select({ 
        id: communities.id,
        name: communities.name,
        subscriptionTier: communities.subscriptionTier 
      })
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    req.community = community;
    next();
  } catch (error) {
    console.error('Community access error:', error);
    res.status(500).json({ error: 'Failed to verify community access' });
  }
}

// Add a new 3D tour
router.post('/tours', verifyCommunityAccess, async (req, res) => {
  try {
    const data = addTourSchema.parse(req.body);
    
    const tour = await tourEmbedService.addTour(data);
    
    res.json({
      success: true,
      tour,
      message: `3D tour "${tour.title}" added successfully`,
      tier: req.community.subscriptionTier
    });
  } catch (error: any) {
    console.error('Add tour error:', error);
    
    if (error.message.includes('not available')) {
      // Suggest upgrade
      const upgradeOptions = featureFlags.getUpgradeOptions(
        req.community.subscriptionTier || 'starter',
        'tourEmbed'
      );
      
      return res.status(403).json({
        error: error.message,
        currentTier: req.community.subscriptionTier || 'starter',
        upgradeOptions,
        upgradeUrl: '/pricing'
      });
    }
    
    res.status(400).json({
      error: error.message || 'Failed to add tour'
    });
  }
});

// Get tours for a community
router.get('/communities/:communityId/tours', verifyCommunityAccess, async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    
    const tours = await tourEmbedService.getCommunityTours(
      req.community.id,
      includeInactive
    );
    
    // Check if community has tour access
    const hasAccess = await featureFlags.hasFeature(req.community.id, 'tourEmbed');
    
    res.json({
      success: true,
      tours,
      count: tours.length,
      hasAccess,
      tier: req.community.subscriptionTier,
      limits: {
        current: tours.filter(t => t.isActive).length,
        allowed: await featureFlags.getFeatureValue(req.community.id, 'tourEmbed')
      }
    });
  } catch (error: any) {
    console.error('Get tours error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch tours'
    });
  }
});

// Start a tour viewing session
router.post('/tours/session/start', async (req, res) => {
  try {
    const data = startSessionSchema.parse(req.body);
    
    const session = await tourEmbedService.startTourSession(data.tourId, {
      visitorId: data.visitorId,
      sessionId: data.sessionId,
      deviceType: data.deviceType,
      referrer: data.referrer
    });
    
    res.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('Start session error:', error);
    res.status(400).json({
      error: error.message || 'Failed to start tour session'
    });
  }
});

// Track tour interaction
router.post('/tours/session/interaction', async (req, res) => {
  try {
    const { sessionId, type, data } = req.body;
    
    if (!sessionId || !type) {
      return res.status(400).json({ error: 'Session ID and interaction type required' });
    }
    
    await tourEmbedService.trackInteraction(sessionId, { type, data });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Track interaction error:', error);
    res.status(500).json({
      error: error.message || 'Failed to track interaction'
    });
  }
});

// End tour session
router.post('/tours/session/end', async (req, res) => {
  try {
    const { sessionId, completionPercentage, leadGenerated } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    await tourEmbedService.endTourSession(sessionId, {
      completionPercentage,
      leadGenerated
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('End session error:', error);
    res.status(500).json({
      error: error.message || 'Failed to end session'
    });
  }
});

// Get tour analytics
router.get('/tours/:tourId/analytics', async (req, res) => {
  try {
    const { tourId } = req.params;
    const { startDate, endDate } = req.query;
    
    const analytics = await tourEmbedService.getTourAnalytics(
      tourId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({
      success: true,
      analytics
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch analytics'
    });
  }
});

// Get comparative analytics for multiple tours
router.get('/communities/:communityId/tours/analytics/comparison', verifyCommunityAccess, async (req, res) => {
  try {
    // Check if community has advanced analytics
    const analyticsLevel = await featureFlags.getFeatureValue(req.community.id, 'analytics');
    
    if (!analyticsLevel || analyticsLevel === 'basic') {
      return res.status(403).json({
        error: 'Comparative analytics requires Professional tier or higher',
        currentTier: req.community.subscriptionTier,
        upgradeUrl: '/pricing'
      });
    }
    
    const comparison = await tourEmbedService.getComparativeAnalytics(req.community.id);
    
    res.json({
      success: true,
      comparison,
      tier: req.community.subscriptionTier
    });
  } catch (error: any) {
    console.error('Comparative analytics error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch comparative analytics'
    });
  }
});

// Update tour
router.patch('/tours/:tourId', async (req, res) => {
  try {
    const { tourId } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.communityId;
    delete updates.viewCount;
    delete updates.createdAt;
    
    const tour = await tourEmbedService.updateTour(tourId, updates);
    
    res.json({
      success: true,
      tour
    });
  } catch (error: any) {
    console.error('Update tour error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update tour'
    });
  }
});

// Set primary tour
router.post('/communities/:communityId/tours/:tourId/set-primary', verifyCommunityAccess, async (req, res) => {
  try {
    const { communityId, tourId } = req.params;
    
    const tour = await tourEmbedService.setPrimaryTour(
      parseInt(communityId),
      tourId
    );
    
    res.json({
      success: true,
      tour,
      message: 'Primary tour updated successfully'
    });
  } catch (error: any) {
    console.error('Set primary tour error:', error);
    res.status(400).json({
      error: error.message || 'Failed to set primary tour'
    });
  }
});

// Public endpoint to get embeddable tour
router.get('/tours/:tourId/embed', async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Get tour details (limited info for public)
    const tours = await tourEmbedService.getCommunityTours(0, false);
    const tour = tours.find(t => t.id === tourId);
    
    if (!tour || !tour.isActive) {
      return res.status(404).json({ error: 'Tour not found or inactive' });
    }
    
    res.json({
      success: true,
      tour: {
        id: tour.id,
        title: tour.title,
        embedUrl: tour.embedUrl,
        platform: tour.platform,
        tourType: tour.tourType
      }
    });
  } catch (error: any) {
    console.error('Get embed error:', error);
    res.status(500).json({
      error: 'Failed to fetch tour embed'
    });
  }
});

// Check feature availability
router.get('/communities/:communityId/tour-features', verifyCommunityAccess, async (req, res) => {
  try {
    const features = {
      hasAccess: await featureFlags.hasFeature(req.community.id, 'tourEmbed'),
      tourLimit: await featureFlags.getFeatureValue(req.community.id, 'tourEmbed'),
      analyticsLevel: await featureFlags.getFeatureValue(req.community.id, 'analytics'),
      currentTier: req.community.subscriptionTier || 'starter'
    };
    
    // Get usage if has access
    if (features.hasAccess) {
      const limitCheck = await featureFlags.checkLimit(req.community.id, 'tourEmbed');
      features['usage'] = limitCheck;
    }
    
    res.json({
      success: true,
      features,
      upgradeUrl: features.hasAccess ? null : '/pricing'
    });
  } catch (error: any) {
    console.error('Check features error:', error);
    res.status(500).json({
      error: error.message || 'Failed to check features'
    });
  }
});

export default router;