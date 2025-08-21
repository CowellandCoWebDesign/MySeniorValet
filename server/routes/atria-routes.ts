import { Router } from 'express';
import { atriaExpansionService } from '../atria-expansion-service';

const router = Router();

/**
 * Get all existing Atria properties
 */
router.get('/existing', async (req, res) => {
  try {
    console.log('📊 Fetching existing Atria properties...');
    const atriaProperties = await atriaExpansionService.findExistingAtriaProperties();
    
    res.json({
      success: true,
      properties: atriaProperties,
      count: atriaProperties.length,
      message: `Found ${atriaProperties.length} existing Atria properties`
    });
    
  } catch (error) {
    console.error('❌ Error fetching Atria properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Atria properties'
    });
  }
});

/**
 * Add missing Atria properties to database
 */
router.post('/expand', async (req, res) => {
  try {
    console.log('🚀 Starting Atria expansion process...');
    const addedCount = await atriaExpansionService.addMissingAtriaProperties();
    
    res.json({
      success: true,
      addedCount,
      message: `Successfully added ${addedCount} new Atria properties to MySeniorValet`
    });
    
  } catch (error) {
    console.error('❌ Atria expansion failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to expand Atria properties'
    });
  }
});

/**
 * Get comprehensive Atria statistics
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('📈 Generating Atria statistics...');
    const stats = await atriaExpansionService.getAtriaStats();
    
    res.json({
      success: true,
      stats,
      summary: {
        totalProperties: stats.total,
        statesCovered: Object.keys(stats.byState).length,
        topStates: Object.entries(stats.byState)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([state, count]) => ({ state, count })),
        careTypesAvailable: Object.keys(stats.careTypesOffered).length
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating Atria stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Atria statistics'
    });
  }
});

/**
 * Get Atria property database (reference data)
 */
router.get('/database', async (req, res) => {
  try {
    const atriaDatabase = atriaExpansionService.getAtriaPropertiesDatabase();
    
    res.json({
      success: true,
      database: atriaDatabase,
      count: atriaDatabase.length,
      coverage: {
        states: [...new Set(atriaDatabase.map(p => p.state))].length,
        cities: [...new Set(atriaDatabase.map(p => p.city))].length,
        careTypes: [...new Set(atriaDatabase.flatMap(p => p.careTypes))].length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching Atria database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Atria database'
    });
  }
});

export { router as atriaRoutes };