import { Router } from 'express';
import { advancedAnalytics } from '../advanced-analytics-system';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Comprehensive analytics endpoint
router.get('/api/analytics/comprehensive', isAuthenticated, async (req, res) => {
  try {
    console.log('📊 Generating comprehensive analytics report...');
    const analytics = await advancedAnalytics.generateComprehensiveAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error generating comprehensive analytics:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cohort analysis endpoint
router.get('/api/analytics/cohorts', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    
    const cohortAnalysis = await advancedAnalytics.performCohortAnalysis(start, end);
    res.json(cohortAnalysis);
  } catch (error) {
    console.error('Error performing cohort analysis:', error);
    res.status(500).json({ 
      error: 'Failed to perform cohort analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User segmentation endpoint
router.get('/api/analytics/segmentation', isAuthenticated, async (req, res) => {
  try {
    const segmentation = await advancedAnalytics.performUserSegmentation();
    res.json(segmentation);
  } catch (error) {
    console.error('Error performing user segmentation:', error);
    res.status(500).json({ 
      error: 'Failed to perform user segmentation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Revenue forecasting endpoint
router.get('/api/analytics/forecast', isAuthenticated, async (req, res) => {
  try {
    const forecast = await advancedAnalytics.performRevenueForecast();
    res.json(forecast);
  } catch (error) {
    console.error('Error generating revenue forecast:', error);
    res.status(500).json({ 
      error: 'Failed to generate revenue forecast',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Behavioral analytics endpoint
router.get('/api/analytics/behavioral', isAuthenticated, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const behavioralAnalytics = await advancedAnalytics.performBehavioralAnalytics(limit);
    res.json(behavioralAnalytics);
  } catch (error) {
    console.error('Error performing behavioral analytics:', error);
    res.status(500).json({ 
      error: 'Failed to perform behavioral analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for analytics system
router.get('/api/analytics/health', async (req, res) => {
  try {
    res.json({
      status: 'operational',
      features: {
        cohortAnalysis: 'enabled',
        userSegmentation: 'enabled',
        revenueForecasting: 'enabled',
        behavioralAnalytics: 'enabled'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const analyticsRoutes = router;