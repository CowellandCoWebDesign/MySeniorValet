import { Router } from 'express';
import { atriaExpansionService } from '../atria-expansion-service';
import { atriaStateExpansionService } from '../atria-state-expansion';

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

// ===== STATE-BASED EXPANSION ROUTES =====
// NEW: Organized state-by-state expansion system for systematic growth toward 1000+ properties

/**
 * Expand Atria properties for a specific state
 */
router.post('/expand-state/:state', async (req, res) => {
  try {
    const { state } = req.params;
    console.log(`🏔️ Starting ${state} Atria expansion...`);
    
    const addedCount = await atriaStateExpansionService.expandState(state);
    
    res.json({
      success: true,
      addedCount,
      state: state.toUpperCase(),
      message: `Successfully added ${addedCount} new Atria properties in ${state.toUpperCase()}`
    });
    
  } catch (error) {
    console.error(`❌ ${req.params.state} expansion failed:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to expand ${req.params.state} Atria properties`
    });
  }
});

/**
 * Expand all target states (WI, MN, IA, UT, MT, ID, WY)
 */
router.post('/expand-all-target-states', async (req, res) => {
  try {
    console.log('🚀 Starting comprehensive target state expansion...');
    
    const results = await atriaStateExpansionService.expandAllTargetStates();
    
    res.json({
      success: true,
      totalAdded: results.total,
      byState: results.byState,
      targetStates: ['WI', 'MN', 'IA', 'UT', 'MT', 'ID', 'WY'],
      message: `Successfully added ${results.total} new Atria properties across target states`
    });
    
  } catch (error) {
    console.error('❌ Target state expansion failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to expand target state Atria properties'
    });
  }
});

/**
 * Get state-based expansion statistics
 */
router.get('/expansion-stats', async (req, res) => {
  try {
    console.log('📊 Generating state-based expansion statistics...');
    
    const stats = await atriaStateExpansionService.getExpansionStats();
    
    res.json({
      success: true,
      stats,
      progress: {
        currentTotal: stats.totalAtria,
        targetGoal: 1000,
        percentComplete: Math.round((stats.totalAtria / 1000) * 100),
        remaining: stats.remainingToTarget
      },
      targetStates: {
        states: ['WI', 'MN', 'IA', 'UT', 'MT', 'ID', 'WY'],
        currentCount: stats.totalTargetStates,
        breakdown: stats.targetStatesCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating expansion stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate expansion statistics'
    });
  }
});

export { router as atriaRoutes };