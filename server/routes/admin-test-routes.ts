import { Router } from 'express';
import { ProductionEmailTester } from '../services/production-email-tester';
import { NotificationMonitor } from '../services/notification-monitor';
import ComprehensiveNotificationService from '../services/comprehensive-notifications';

const router = Router();

// Simple test endpoint for production email (admin only)
router.post('/api/admin/quick-test/email', async (req, res) => {
  try {
    const { key } = req.body;
    
    // Simple key check for admin access
    if (key !== 'msv-admin-2025') {
      return res.status(403).json({ error: 'Invalid admin key' });
    }

    console.log('🧪 Running quick production email test...');
    
    // Test a simple notification
    await ComprehensiveNotificationService.notifyCommunityClaimSubmitted({
      communityId: 99999,
      communityName: 'Production Test Community',
      claimantName: 'System Test',
      claimantEmail: 'admin@myseniorvalet.com',
      claimantPhone: '555-TEST',
      message: 'This is a production email delivery test'
    });

    // Get monitoring stats
    const dashboard = NotificationMonitor.getDashboard();
    const health = NotificationMonitor.checkHealthStatus();

    res.json({
      success: true,
      message: 'Production email test initiated',
      monitoring: {
        totalSent: dashboard.summary.totalSent,
        totalFailed: dashboard.summary.totalFailed,
        successRate: dashboard.summary.successRate,
        healthy: health.healthy
      },
      _timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      error: 'Email test failed',
      details: error.message 
    });
  }
});

// Get system status without auth (basic info only)
router.get('/api/admin/quick-status', async (req, res) => {
  try {
    const health = NotificationMonitor.checkHealthStatus();
    const dashboard = NotificationMonitor.getDashboard();

    res.json({
      success: true,
      status: {
        notificationSystem: health.healthy ? 'operational' : 'degraded',
        emailsSent: dashboard.summary.totalSent,
        emailsFailed: dashboard.summary.totalFailed,
        successRate: dashboard.summary.successRate,
        lastHourActivity: dashboard.summary.lastHourCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get status',
      timestamp: new Date().toISOString()
    });
  }
});

// Run comprehensive email test with key
router.post('/api/admin/test/comprehensive-email', async (req, res) => {
  try {
    const { key, recipientEmail } = req.body;
    
    if (key !== 'msv-admin-2025') {
      return res.status(403).json({ error: 'Invalid admin key' });
    }

    console.log('🧪 Starting comprehensive email test...');
    const testResult = await ProductionEmailTester.runProductionTest(
      recipientEmail || 'admin@myseniorvalet.com'
    );

    res.json({
      success: true,
      testResult,
      _timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Comprehensive test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
});

export default router;