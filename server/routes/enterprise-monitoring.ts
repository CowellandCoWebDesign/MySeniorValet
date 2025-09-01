import { Router } from 'express';
import { EnterpriseAlertService } from '../services/alert.service';
import { PerformanceMonitorService } from '../services/performance.service';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Initialize services
const alertService = EnterpriseAlertService.getInstance();
const performanceService = PerformanceMonitorService.getInstance();

// Alert endpoints
router.get('/alerts', isAuthenticated, async (req, res) => {
  try {
    const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
    const alerts = await alertService.getActiveAlerts(communityId);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/alerts/stats', isAuthenticated, async (req, res) => {
  try {
    const stats = await alertService.getAlertStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

router.post('/alerts/:id/acknowledge', isAuthenticated, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const updated = await alertService.acknowledgeAlert(alertId, userId);
    res.json(updated);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

router.post('/alerts/:id/resolve', isAuthenticated, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const updated = await alertService.resolveAlert(alertId, userId);
    res.json(updated);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

router.get('/alerts/rules', isAuthenticated, async (req, res) => {
  try {
    const rules = alertService.getRules();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    res.status(500).json({ error: 'Failed to fetch alert rules' });
  }
});

router.put('/alerts/rules/:id', isAuthenticated, async (req, res) => {
  try {
    const ruleId = req.params.id;
    alertService.updateRule(ruleId, req.body);
    res.json({ success: true, message: 'Rule updated successfully' });
  } catch (error) {
    console.error('Error updating alert rule:', error);
    res.status(500).json({ error: 'Failed to update alert rule' });
  }
});

// Performance monitoring endpoints
router.get('/performance/snapshot', isAuthenticated, async (req, res) => {
  try {
    const report = await performanceService.getPerformanceReport();
    res.json(report);
  } catch (error) {
    console.error('Error fetching performance snapshot:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

router.get('/performance/metrics/:name/history', isAuthenticated, async (req, res) => {
  try {
    const metricName = req.params.name;
    const duration = req.query.duration ? parseInt(req.query.duration as string) : 3600000;
    const history = await performanceService.getMetricHistory(metricName, duration);
    res.json(history);
  } catch (error) {
    console.error('Error fetching metric history:', error);
    res.status(500).json({ error: 'Failed to fetch metric history' });
  }
});

router.get('/performance/aggregated', isAuthenticated, async (req, res) => {
  try {
    const aggregated = await performanceService.getAggregatedMetrics();
    res.json(aggregated);
  } catch (error) {
    console.error('Error fetching aggregated metrics:', error);
    res.status(500).json({ error: 'Failed to fetch aggregated metrics' });
  }
});

// Cache performance tracking endpoints
router.post('/performance/cache/hit', isAuthenticated, async (req, res) => {
  try {
    performanceService.recordCacheHit();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record cache hit' });
  }
});

router.post('/performance/cache/miss', isAuthenticated, async (req, res) => {
  try {
    performanceService.recordCacheMiss();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record cache miss' });
  }
});

// Track API performance
router.post('/performance/api/track', isAuthenticated, async (req, res) => {
  try {
    const { endpoint, duration } = req.body;
    performanceService.trackAPITime(endpoint || 'unknown', duration || 0);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track API performance' });
  }
});

// Track database query performance
router.post('/performance/db/track', isAuthenticated, async (req, res) => {
  try {
    const { query, duration } = req.body;
    performanceService.trackQueryTime(query || 'unknown', duration || 0);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track query performance' });
  }
});

export default router;