import { Router } from 'express';
import { NotificationMonitor } from '../services/notification-monitor';
import { ProductionEmailTester } from '../services/production-email-tester';
import { RateLimitManager } from '../services/rate-limit-manager';
import { NotificationPreferencesService } from '../services/notification-preferences';
import { requireAuth } from '../custom-auth';

const router = Router();

// Notification monitoring dashboard
router.get('/api/admin/notifications/monitor', requireAuth, async (req, res) => {
  try {
    // Check admin access
    const userEmail = (req as any).user?.email;
    if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const dashboard = NotificationMonitor.getDashboard();
    const health = NotificationMonitor.checkHealthStatus();

    res.json({
      success: true,
      dashboard,
      health,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching notification monitor:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
});

// Production email test endpoint
router.post('/api/admin/test/production-email', requireAuth, async (req, res) => {
  try {
    // Check admin access
    const userEmail = (req as any).user?.email;
    if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { recipientEmail } = req.body;
    const testResult = await ProductionEmailTester.runProductionTest(
      recipientEmail || 'admin@myseniorvalet.com'
    );

    res.json({
      success: true,
      testResult,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error running production email test:', error);
    res.status(500).json({ error: 'Failed to run email test' });
  }
});

// Get email test history
router.get('/api/admin/test/email-history', requireAuth, async (req, res) => {
  try {
    // Check admin access
    const userEmail = (req as any).user?.email;
    if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const history = ProductionEmailTester.getTestHistory();
    const stats = ProductionEmailTester.getTestStats();

    res.json({
      success: true,
      history,
      stats,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching email test history:', error);
    res.status(500).json({ error: 'Failed to fetch test history' });
  }
});

// Rate limit status endpoint
router.get('/api/admin/rate-limits', requireAuth, async (req, res) => {
  try {
    // Check admin access
    const userEmail = (req as any).user?.email;
    if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userIdentifier = req.query.user as string || userEmail;
    const usage = await RateLimitManager.getUsageStats(userIdentifier);

    // Get system metrics for recommendations
    const metrics = {
      avgResponseTime: 250, // This would come from performance monitoring
      errorRate: 0.02, // This would come from error tracking
      activeUsers: 50 // This would come from session tracking
    };

    const recommendations = RateLimitManager.getDynamicRecommendations(metrics);

    res.json({
      success: true,
      usage,
      recommendations,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching rate limit status:', error);
    res.status(500).json({ error: 'Failed to fetch rate limit status' });
  }
});

// Adjust rate limits dynamically
router.post('/api/admin/rate-limits/adjust', requireAuth, async (req, res) => {
  try {
    // Check admin access
    const userEmail = (req as any).user?.email;
    if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { endpoint, points, duration, blockDuration } = req.body;
    
    if (!endpoint || !points || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    RateLimitManager.adjustLimit(endpoint, { points, duration, blockDuration });

    res.json({
      success: true,
      message: `Rate limit adjusted for ${endpoint}`,
      newConfig: { points, duration, blockDuration },
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error adjusting rate limits:', error);
    res.status(500).json({ error: 'Failed to adjust rate limits' });
  }
});

// User notification preferences
router.get('/api/user/notification-preferences', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const preferences = await NotificationPreferencesService.getUserPreferences(userId);
    const summary = await NotificationPreferencesService.getPreferenceSummary(userId);

    res.json({
      success: true,
      preferences,
      summary,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user notification preferences
router.put('/api/user/notification-preferences', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updatedPrefs = await NotificationPreferencesService.updateUserPreferences(
      userId,
      req.body
    );

    res.json({
      success: true,
      preferences: updatedPrefs,
      message: 'Notification preferences updated',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get preset notification templates
router.get('/api/user/notification-presets', async (req, res) => {
  try {
    const presets = NotificationPreferencesService.getPresetTemplates();

    res.json({
      success: true,
      presets,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching notification presets:', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

// Apply preset notification template
router.post('/api/user/notification-presets/apply', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { presetName } = req.body;
    const presets = NotificationPreferencesService.getPresetTemplates();
    const preset = presets[presetName as keyof typeof presets];

    if (!preset) {
      return res.status(400).json({ error: 'Invalid preset name' });
    }

    const updatedPrefs = await NotificationPreferencesService.updateUserPreferences(
      userId,
      preset.preferences
    );

    res.json({
      success: true,
      preferences: updatedPrefs,
      message: `Applied "${preset.name}" notification preset`,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error applying notification preset:', error);
    res.status(500).json({ error: 'Failed to apply preset' });
  }
});

// System health check endpoint
router.get('/api/admin/system-health', requireAuth, async (req, res) => {
  try {
    // Check admin access
    const userEmail = (req as any).user?.email;
    if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const notificationHealth = NotificationMonitor.checkHealthStatus();
    const emailTestStats = ProductionEmailTester.getTestStats();
    
    const overallHealth = {
      notifications: notificationHealth,
      emailDelivery: {
        totalTests: emailTestStats.totalTests,
        successful: emailTestStats.successful,
        failed: emailTestStats.failed,
        successRate: emailTestStats.totalTests > 0 
          ? ((emailTestStats.successful / emailTestStats.totalTests) * 100).toFixed(1) + '%'
          : 'No tests run'
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      health: overallHealth,
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ error: 'Failed to check system health' });
  }
});

export default router;