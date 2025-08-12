/**
 * Data Enrichment API Routes
 * Admin-controlled endpoints for enriching community data with live pricing
 */

import { Router } from 'express';
import { dataEnrichmentService } from '../services/data-enrichment-service';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * Get enrichment service status
 */
router.get('/api/admin/enrichment/status', adminAuth, async (req, res) => {
  try {
    const status = dataEnrichmentService.getStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Error getting enrichment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get enrichment status'
    });
  }
});

/**
 * Start data enrichment process
 */
router.post('/api/admin/enrichment/start', adminAuth, async (req, res) => {
  try {
    const {
      batchSize = 50,
      targetStates = [],
      onlyMissingPricing = true
    } = req.body;

    // Start enrichment process
    const result = await dataEnrichmentService.enrichCommunitiesData({
      batchSize,
      targetStates,
      onlyMissingPricing,
      adminOverride: true
    });

    res.json(result);
  } catch (error) {
    console.error('Error starting enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start enrichment process'
    });
  }
});

/**
 * Enrich specific communities by ID
 */
router.post('/api/admin/enrichment/specific', adminAuth, async (req, res) => {
  try {
    const { communityIds } = req.body;

    if (!Array.isArray(communityIds) || communityIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of community IDs'
      });
    }

    const result = await dataEnrichmentService.enrichSpecificCommunities(communityIds);
    res.json(result);
  } catch (error) {
    console.error('Error enriching specific communities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enrich specific communities'
    });
  }
});

/**
 * Test enrichment on a single community (dry run)
 */
router.post('/api/admin/enrichment/test', adminAuth, async (req, res) => {
  try {
    const { communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a community ID'
      });
    }

    // Run enrichment for single community as a test
    const result = await dataEnrichmentService.enrichSpecificCommunities([communityId]);
    res.json({
      success: true,
      test: true,
      ...result
    });
  } catch (error) {
    console.error('Error testing enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test enrichment'
    });
  }
});

export function registerDataEnrichmentRoutes(app: any) {
  app.use(router);
}

export default router;