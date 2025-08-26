/**
 * Photo Management API Routes
 * Provides endpoints for photo validation, quality checking, and statistics
 */

import { Router } from "express";
import { PhotoManagementService } from "../photo-management-service";
import { requireAuth, requireAdminAuth } from "../middleware/auth";

const router = Router();
const photoService = new PhotoManagementService();

/**
 * Validate photos for a specific community
 */
router.post("/api/photos/validate/:communityId", requireAdminAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: "Invalid community ID" });
    }

    const validation = await photoService.validateCommunityPhotos(communityId);
    
    res.json({
      success: true,
      data: {
        communityId,
        validPhotos: validation.valid.length,
        invalidPhotos: validation.invalid.length,
        qualityScore: validation.qualityScore,
        details: validation
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Photo validation error:", error);
    res.status(500).json({ 
      error: "Failed to validate photos",
      message: errorMessage 
    });
  }
});

/**
 * Get photo statistics across all communities
 */
router.get("/api/photos/statistics", async (req, res) => {
  try {
    const stats = await photoService.getPhotoStatistics();
    
    res.json({
      success: true,
      data: stats,
      summary: {
        coverage: `${Math.round((stats.communitiesWithPhotos / stats.totalCommunities) * 100)}%`,
        validity: `${Math.round((stats.validPhotos / stats.totalPhotos) * 100)}%`,
        averageQuality: `${stats.averageQualityScore}/100`
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Photo statistics error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve photo statistics",
      message: errorMessage 
    });
  }
});

/**
 * Clean up invalid photos for a community
 */
router.post("/api/photos/cleanup/:communityId", requireAdminAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { dryRun = true } = req.body;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ error: "Invalid community ID" });
    }

    const result = await photoService.cleanupInvalidPhotos(communityId, dryRun);
    
    res.json({
      success: true,
      data: {
        communityId,
        dryRun,
        removed: result.removed,
        kept: result.kept,
        message: dryRun 
          ? `Would remove ${result.removed.length} invalid photos` 
          : `Removed ${result.removed.length} invalid photos`
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Photo cleanup error:", error);
    res.status(500).json({ 
      error: "Failed to cleanup photos",
      message: errorMessage 
    });
  }
});

/**
 * Optimize photo URL for CDN delivery
 */
router.post("/api/photos/optimize", async (req, res) => {
  try {
    const { url, width, height, quality, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "Photo URL is required" });
    }

    const optimizedUrl = photoService.optimizePhotoUrl(url, {
      width,
      height,
      quality,
      format
    });
    
    res.json({
      success: true,
      data: {
        original: url,
        optimized: optimizedUrl
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Photo optimization error:", error);
    res.status(500).json({ 
      error: "Failed to optimize photo",
      message: errorMessage 
    });
  }
});

export function registerPhotoManagementRoutes(app: Router) {
  app.use(router);
}

export default router;