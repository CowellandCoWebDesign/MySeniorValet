import { Router, Request, Response } from 'express';
import { virtualTourDetector } from '../services/virtual-tour-detector.service';
import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Detect virtual tour for a community
 */
router.get('/api/communities/:id/virtual-tour', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    // Get community details
    const community = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community || community.length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const communityData = community[0];
    const forceRefresh = req.query.refresh === 'true';

    // Detect virtual tour
    const result = await virtualTourDetector.detectVirtualTour(
      communityId,
      communityData.name,
      communityData.website || undefined,
      forceRefresh
    );

    // Store the result in database if found
    if (result.found && result.tourUrl) {
      // Update community with virtual tour URL
      await db
        .update(communities)
        .set({ 
          virtualTourUrl: result.tourUrl,
          virtualTourPlatform: result.platform,
          virtualTourLastChecked: new Date()
        })
        .where(eq(communities.id, communityId));
    }

    res.json(result);
  } catch (error) {
    console.error('Error detecting virtual tour:', error);
    res.status(500).json({ 
      error: 'Failed to detect virtual tour',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Batch detect virtual tours for multiple communities
 */
router.post('/api/communities/virtual-tours/batch', async (req: Request, res: Response) => {
  try {
    const { communityIds, forceRefresh = false } = req.body;
    
    if (!Array.isArray(communityIds) || communityIds.length === 0) {
      return res.status(400).json({ error: 'Invalid community IDs' });
    }

    // Limit batch size
    if (communityIds.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 communities per batch' });
    }

    // Get community details
    const communitiesData = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityIds[0]))
      .limit(communityIds.length);

    const results = [];

    for (const community of communitiesData) {
      const result = await virtualTourDetector.detectVirtualTour(
        community.id,
        community.name,
        community.website || undefined,
        forceRefresh
      );

      results.push({
        communityId: community.id,
        communityName: community.name,
        ...result
      });

      // Store successful detections
      if (result.found && result.tourUrl) {
        await db
          .update(communities)
          .set({ 
            virtualTourUrl: result.tourUrl,
            virtualTourPlatform: result.platform,
            virtualTourLastChecked: new Date()
          })
          .where(eq(communities.id, community.id));
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({ results });
  } catch (error) {
    console.error('Error batch detecting virtual tours:', error);
    res.status(500).json({ 
      error: 'Failed to batch detect virtual tours',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clear virtual tour cache for a community
 */
router.delete('/api/communities/:id/virtual-tour/cache', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    virtualTourDetector.clearCache(communityId);
    
    res.json({ 
      success: true, 
      message: `Cache cleared for community ${communityId}` 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Clear all virtual tour cache
 */
router.delete('/api/virtual-tours/cache', async (req: Request, res: Response) => {
  try {
    virtualTourDetector.clearAllCache();
    
    res.json({ 
      success: true, 
      message: 'All virtual tour cache cleared' 
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear all cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;