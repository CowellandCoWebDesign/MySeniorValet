import { Router } from 'express';
import { photoValidationService } from '../services/photo-validation';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, isNotNull } from 'drizzle-orm';

const router = Router();

/**
 * Validate photos for a specific community
 */
router.get('/communities/:id/photos/validate', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const report = await photoValidationService.validateCommunityPhotos(communityId);
    
    res.json({
      success: true,
      report,
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Photo validation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Photo validation failed',
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });
  }
});

/**
 * Clean up invalid photos for a specific community
 */
router.post('/communities/:id/photos/cleanup', async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }

    const result = await photoValidationService.cleanupInvalidPhotos(communityId);
    
    res.json({
      success: true,
      message: `Removed ${result.removed} invalid photos, ${result.remaining} photos remaining`,
      removed: result.removed,
      remaining: result.remaining,
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Photo cleanup error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Photo cleanup failed',
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });
  }
});

/**
 * Bulk validate photos for multiple communities
 */
router.post('/photos/validate-bulk', async (req, res) => {
  try {
    const { communityIds, batchSize = 10 } = req.body;
    
    if (!Array.isArray(communityIds) || communityIds.length === 0) {
      return res.status(400).json({ error: 'Invalid community IDs array' });
    }

    const reports = await photoValidationService.validateMultipleCommunities(communityIds, batchSize);
    
    const summary = {
      totalCommunities: reports.length,
      totalPhotos: reports.reduce((sum, r) => sum + r.totalPhotos, 0),
      totalValidPhotos: reports.reduce((sum, r) => sum + r.validPhotos, 0),
      totalInvalidPhotos: reports.reduce((sum, r) => sum + r.invalidPhotos, 0),
      communitiesWithIssues: reports.filter(r => r.invalidPhotos > 0).length
    };

    res.json({
      success: true,
      summary,
      reports,
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Bulk photo validation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Bulk photo validation failed',
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });
  }
});

/**
 * Get platform-wide photo health statistics
 */
router.get('/photos/platform-stats', async (req, res) => {
  try {
    const stats = await photoValidationService.getPlatformPhotoStats();
    
    res.json({
      success: true,
      stats,
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Platform photo stats error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get platform photo stats',
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });
  }
});

/**
 * Get communities that need photo attention
 */
router.get('/photos/communities-needing-attention', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Get communities with photos to validate
    const communitiesWithPhotos = await db
      .select({
        id: communities.id,
        name: communities.name,
        photos: communities.photos,
        city: communities.city,
        state: communities.state
      })
      .from(communities)
      .where(isNotNull(communities.photos))
      .limit(limit);

    const communitiesNeedingAttention = [];

    for (const community of communitiesWithPhotos) {
      const photos = community.photos || [];
      if (photos.length === 0) continue;

      // Quick validation check
      let hasIssues = false;
      let issueCount = 0;

      for (const photo of photos.slice(0, 3)) { // Check first 3 photos for performance
        try {
          const validation = await photoValidationService.validatePhoto(photo);
          if (!validation.isValid) {
            hasIssues = true;
            issueCount++;
          }
        } catch (error) {
          hasIssues = true;
          issueCount++;
        }
      }

      if (hasIssues) {
        communitiesNeedingAttention.push({
          id: community.id,
          name: community.name,
          city: community.city,
          state: community.state,
          totalPhotos: photos.length,
          estimatedIssues: issueCount,
          priority: issueCount === photos.length ? 'high' : issueCount > photos.length / 2 ? 'medium' : 'low'
        });
      }
    }

    // Sort by priority and estimated issues
    communitiesNeedingAttention.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder] ||
             b.estimatedIssues - a.estimatedIssues;
    });

    res.json({
      success: true,
      communities: communitiesNeedingAttention,
      summary: {
        total: communitiesNeedingAttention.length,
        highPriority: communitiesNeedingAttention.filter(c => c.priority === 'high').length,
        mediumPriority: communitiesNeedingAttention.filter(c => c.priority === 'medium').length,
        lowPriority: communitiesNeedingAttention.filter(c => c.priority === 'low').length
      },
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Communities needing attention error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get communities needing attention',
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });
  }
});

/**
 * Run automatic photo cleanup for communities with high invalid photo rates
 */
router.post('/photos/auto-cleanup', async (req, res) => {
  try {
    const { dryRun = true, maxCommunities = 20 } = req.body;
    
    // Get communities that need attention
    const communitiesWithPhotos = await db
      .select({
        id: communities.id,
        name: communities.name,
        photos: communities.photos
      })
      .from(communities)
      .where(isNotNull(communities.photos))
      .limit(maxCommunities * 2); // Get more to filter down

    const cleanupResults = [];
    let processedCount = 0;

    for (const community of communitiesWithPhotos) {
      if (processedCount >= maxCommunities) break;

      const photos = community.photos || [];
      if (photos.length === 0) continue;

      // Validate photos first
      const report = await photoValidationService.validateCommunityPhotos(community.id);
      
      // Only cleanup if more than 50% of photos are invalid
      const invalidPercentage = (report.invalidPhotos / report.totalPhotos) * 100;
      
      if (invalidPercentage > 50) {
        if (!dryRun) {
          const cleanupResult = await photoValidationService.cleanupInvalidPhotos(community.id);
          cleanupResults.push({
            communityId: community.id,
            communityName: community.name,
            originalPhotos: report.totalPhotos,
            removedPhotos: cleanupResult.removed,
            remainingPhotos: cleanupResult.remaining,
            invalidPercentage: Math.round(invalidPercentage)
          });
        } else {
          cleanupResults.push({
            communityId: community.id,
            communityName: community.name,
            originalPhotos: report.totalPhotos,
            wouldRemove: report.invalidPhotos,
            wouldRemain: report.validPhotos,
            invalidPercentage: Math.round(invalidPercentage)
          });
        }
        processedCount++;
      }
    }

    res.json({
      success: true,
      dryRun,
      processedCommunities: processedCount,
      results: cleanupResults,
      summary: {
        totalCommunities: cleanupResults.length,
        totalPhotosProcessed: cleanupResults.reduce((sum, r) => sum + r.originalPhotos, 0),
        totalPhotosRemoved: dryRun ? 0 : cleanupResults.reduce((sum, r) => sum + (r.removedPhotos || 0), 0),
        totalPhotosRemaining: dryRun 
          ? cleanupResults.reduce((sum, r) => sum + (r.wouldRemain || 0), 0)
          : cleanupResults.reduce((sum, r) => sum + (r.remainingPhotos || 0), 0)
      },
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });

  } catch (error) {
    console.error('Auto cleanup error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Auto cleanup failed',
      _version: "v4_photo_validation",
      _timestamp: Date.now()
    });
  }
});

export default router;