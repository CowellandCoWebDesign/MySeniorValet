import { Router } from 'express';
import { DuplicateDetectionService } from '../services/duplicate-detection-service';

const router = Router();
const duplicateService = new DuplicateDetectionService();

// Get duplicate statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await duplicateService.getDuplicateStats();
    res.json({
      ...stats,
      _version: 'v4_streaming'
    });
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    res.status(500).json({ 
      error: 'Failed to get duplicate statistics',
      _version: 'v4_streaming'
    });
  }
});

// Find all duplicate groups
router.get('/find', async (req, res) => {
  try {
    const similarityThreshold = parseInt(req.query.threshold as string) || 85;
    const groups = await duplicateService.findDuplicates(similarityThreshold);
    
    // Limit response for performance
    const limitedGroups = groups.slice(0, 100);
    
    res.json({
      groups: limitedGroups,
      totalGroups: groups.length,
      totalDuplicates: groups.reduce((sum, g) => sum + g.duplicates.length, 0),
      similarityThreshold,
      _version: 'v4_streaming'
    });
  } catch (error) {
    console.error('Error finding duplicates:', error);
    res.status(500).json({ 
      error: 'Failed to find duplicates',
      _version: 'v4_streaming'
    });
  }
});

// Merge specific duplicates
router.post('/merge', async (req, res) => {
  try {
    const { primaryId, duplicateIds } = req.body;
    
    if (!primaryId || !duplicateIds || !Array.isArray(duplicateIds)) {
      return res.status(400).json({ 
        error: 'Invalid request: primaryId and duplicateIds array required',
        _version: 'v4_streaming'
      });
    }
    
    const result = await duplicateService.mergeDuplicates(primaryId, duplicateIds);
    
    res.json({
      success: true,
      result,
      _version: 'v4_streaming'
    });
  } catch (error) {
    console.error('Error merging duplicates:', error);
    res.status(500).json({ 
      error: 'Failed to merge duplicates',
      _version: 'v4_streaming'
    });
  }
});

// Auto-merge obvious duplicates (95%+ similarity)
router.post('/auto-merge', async (req, res) => {
  try {
    const result = await duplicateService.autoMergeObviousDuplicates();
    
    res.json({
      success: true,
      ...result,
      message: `Successfully auto-merged ${result.merged} obvious duplicates`,
      _version: 'v4_streaming'
    });
  } catch (error) {
    console.error('Error auto-merging duplicates:', error);
    res.status(500).json({ 
      error: 'Failed to auto-merge duplicates',
      _version: 'v4_streaming'
    });
  }
});

export { router as duplicateRoutes };