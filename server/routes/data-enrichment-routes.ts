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

/**
 * Regional enrichment endpoint
 */
router.post('/api/admin/enrichment/regional', adminAuth, async (req, res) => {
  try {
    const { region, states, country, cachePolicy, batchSize = 25, respectCacheExpiry = true } = req.body;

    if (!states || states.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No states provided for regional enrichment'
      });
    }

    console.log(`Starting regional enrichment for ${region} (${country}) with ${states.length} states`);

    // Get communities in the specified states
    const communities = await dataEnrichmentService.getCommunitiesByStates(states);
    
    // Run enrichment with cache compliance
    const result = await dataEnrichmentService.enrichWithCompliance(
      communities.map(c => c.id),
      {
        country,
        cachePolicy,
        batchSize,
        respectCacheExpiry
      }
    );

    res.json({
      success: true,
      region,
      states,
      totalCommunities: communities.length,
      ...result
    });
  } catch (error) {
    console.error('Error in regional enrichment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enrich region'
    });
  }
});

/**
 * Get regional statistics
 */
router.post('/api/admin/enrichment/region-stats', adminAuth, async (req, res) => {
  try {
    const { states, country } = req.body;

    if (!states || states.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No states provided'
      });
    }

    const stats = await dataEnrichmentService.getRegionalStats(states);
    
    res.json({
      success: true,
      country,
      states,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching regional stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regional statistics'
    });
  }
});

export function registerDataEnrichmentRoutes(app: any) {
  app.use(router);
}

export default router;