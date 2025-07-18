/**
 * Real Data API Routes - Authentic Pricing Intelligence
 * 
 * Provides endpoints for real database analysis and external market data
 */

import { Router } from "express";
import { realDataAnalyzer } from "../real-data-analyzer";

const router = Router();

/**
 * GET /api/real-data/analysis
 * Returns comprehensive analysis of actual database pricing
 */
router.get('/analysis', async (req, res) => {
  try {
    const analysis = await realDataAnalyzer.analyzeDatabasePricing();
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing database pricing:', error);
    res.status(500).json({ error: 'Failed to analyze database pricing' });
  }
});

/**
 * GET /api/real-data/market-data
 * Returns external market research data
 */
router.get('/market-data', async (req, res) => {
  try {
    const marketData = await realDataAnalyzer.getExternalMarketData();
    res.json(marketData);
  } catch (error) {
    console.error('Error getting market data:', error);
    res.status(500).json({ error: 'Failed to get market data' });
  }
});

/**
 * GET /api/real-data/combined-intelligence
 * Returns combined database analysis + external market data
 */
router.get('/combined-intelligence', async (req, res) => {
  try {
    const intelligence = await realDataAnalyzer.getCombinedPricingIntelligence();
    res.json(intelligence);
  } catch (error) {
    console.error('Error getting combined intelligence:', error);
    res.status(500).json({ error: 'Failed to get combined intelligence' });
  }
});

/**
 * GET /api/real-data/state-analysis/:state
 * Returns specific state analysis
 */
router.get('/state-analysis/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const analysis = await realDataAnalyzer.analyzeDatabasePricing();
    
    const stateData = analysis.stateBreakdown.find(s => s.state === state.toUpperCase());
    if (!stateData) {
      return res.status(404).json({ error: `State ${state} not found` });
    }

    const marketData = await realDataAnalyzer.getExternalMarketData();
    const externalStateData = marketData.stateData[state.toUpperCase()];

    res.json({
      databaseData: stateData,
      externalData: externalStateData,
      combined: {
        totalCommunities: stateData.communityCount,
        avgDatabasePrice: stateData.avgPricing,
        avgMarketPrice: externalStateData ? 
          (externalStateData.avgAssistedLiving + externalStateData.avgIndependentLiving) / 2 : null,
        hasExternalValidation: !!externalStateData
      }
    });
  } catch (error) {
    console.error('Error getting state analysis:', error);
    res.status(500).json({ error: 'Failed to get state analysis' });
  }
});

export default router;