import { Express } from 'express';
import { DuplicateManager } from '../services/duplicate-manager';

export function registerDuplicateManagementRoutes(app: Express) {
  /**
   * Get all duplicate communities
   */
  app.get('/api/admin/duplicates', async (req, res) => {
    try {
      console.log('📋 Fetching duplicate communities...');
      const duplicates = await DuplicateManager.findAllDuplicates();
      
      // Calculate summary statistics
      const totalDuplicates = duplicates.reduce((sum, g) => sum + g.duplicates.length, 0);
      const recordsToRemove = duplicates.reduce((sum, g) => sum + g.recommendedRemoveIds.length, 0);
      
      res.json({
        success: true,
        summary: {
          duplicateGroups: duplicates.length,
          totalDuplicates,
          recordsToRemove,
          potentialSavings: recordsToRemove // Each removed record saves storage
        },
        duplicates
      });
    } catch (error) {
      console.error('Error fetching duplicates:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch duplicates' 
      });
    }
  });
  
  /**
   * Get duplicate report
   */
  app.get('/api/admin/duplicates/report', async (req, res) => {
    try {
      console.log('📊 Generating duplicate report...');
      const report = await DuplicateManager.generateReport();
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(report);
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate report' 
      });
    }
  });
  
  /**
   * Merge specific duplicates
   */
  app.post('/api/admin/duplicates/merge', async (req, res) => {
    try {
      const { keepId, removeIds } = req.body;
      
      if (!keepId || !removeIds || !Array.isArray(removeIds) || removeIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters. Need keepId and removeIds array.'
        });
      }
      
      console.log(`🔀 Merging duplicates: keeping ${keepId}, removing ${removeIds.join(', ')}`);
      await DuplicateManager.mergeDuplicates(keepId, removeIds);
      
      res.json({
        success: true,
        message: `Successfully merged ${removeIds.length} duplicates into community ${keepId}`
      });
    } catch (error) {
      console.error('Error merging duplicates:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to merge duplicates' 
      });
    }
  });
  
  /**
   * Run safe cleanup (only removes obvious duplicates)
   */
  app.post('/api/admin/duplicates/safe-cleanup', async (req, res) => {
    try {
      console.log('🧹 Running safe duplicate cleanup...');
      const removedCount = await DuplicateManager.safeCleanup();
      
      res.json({
        success: true,
        message: `Safe cleanup complete. Removed ${removedCount} clear duplicates.`,
        removedCount
      });
    } catch (error) {
      console.error('Error running safe cleanup:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to run safe cleanup' 
      });
    }
  });
  
  /**
   * Check specific community for duplicates
   */
  app.get('/api/admin/duplicates/check/:name', async (req, res) => {
    try {
      const communityName = req.params.name;
      console.log(`🔍 Checking duplicates for: ${communityName}`);
      
      const allDuplicates = await DuplicateManager.findAllDuplicates();
      const matches = allDuplicates.filter(group => 
        group.name.toLowerCase().includes(communityName.toLowerCase())
      );
      
      if (matches.length === 0) {
        return res.json({
          success: true,
          message: `No duplicates found for "${communityName}"`,
          duplicates: []
        });
      }
      
      res.json({
        success: true,
        message: `Found ${matches.length} duplicate groups matching "${communityName}"`,
        duplicates: matches
      });
    } catch (error) {
      console.error('Error checking duplicates:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to check duplicates' 
      });
    }
  });
}