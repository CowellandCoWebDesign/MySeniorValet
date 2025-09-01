import { Router } from "express";
import { ExecutiveAnalyticsService } from "../services/executive-analytics.service";
import { requireAdminAuth } from "../middleware/auth";

const router = Router();
const executiveService = ExecutiveAnalyticsService.getInstance();

// All executive routes require admin authentication
router.use(requireAdminAuth);

// Get executive KPIs
router.get('/kpis', async (req, res) => {
  try {
    const kpis = await executiveService.getExecutiveKPIs();
    res.json(kpis);
  } catch (error) {
    console.error('Error fetching executive KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch executive KPIs' });
  }
});

// Get market intelligence
router.get('/market-intelligence', async (req, res) => {
  try {
    const marketData = await executiveService.getMarketIntelligence();
    res.json(marketData);
  } catch (error) {
    console.error('Error fetching market intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch market intelligence' });
  }
});

// Get strategic metrics
router.get('/strategic-metrics', async (req, res) => {
  try {
    const metrics = await executiveService.getStrategicMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching strategic metrics:', error);
    res.status(500).json({ error: 'Failed to fetch strategic metrics' });
  }
});

// Get revenue metrics
router.get('/revenue', async (req, res) => {
  try {
    const revenue = await executiveService.getRevenueMetrics();
    res.json(revenue);
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue metrics' });
  }
});

// Generate board report
router.get('/board-report', async (req, res) => {
  try {
    const report = await executiveService.generateBoardReport();
    res.json(report);
  } catch (error) {
    console.error('Error generating board report:', error);
    res.status(500).json({ error: 'Failed to generate board report' });
  }
});

// Get competitive analysis
router.get('/competitive-analysis', async (req, res) => {
  try {
    const analysis = await executiveService.getCompetitiveAnalysis();
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching competitive analysis:', error);
    res.status(500).json({ error: 'Failed to fetch competitive analysis' });
  }
});

// Get risk metrics
router.get('/risk-metrics', async (req, res) => {
  try {
    const risks = await executiveService.getRiskMetrics();
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risk metrics:', error);
    res.status(500).json({ error: 'Failed to fetch risk metrics' });
  }
});

export default router;