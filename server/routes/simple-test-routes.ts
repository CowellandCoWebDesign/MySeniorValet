import { Router } from 'express';
import { ProductionEmailTester } from '../services/production-email-tester';
import { NotificationMonitor } from '../services/notification-monitor';
import ComprehensiveNotificationService from '../services/comprehensive-notifications';
import { sendEmail } from '../sendgrid-service';

const router = Router();

// Super simple test endpoint - no auth at all
router.get('/test/status', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Simple email test - no auth but requires secret key
router.post('/test/email', async (req, res) => {
  try {
    const { key } = req.body || {};
    
    if (key !== 'msv-admin-2025') {
      return res.status(403).json({ 
        error: 'Invalid key',
        received: key || 'none'
      });
    }

    console.log('🧪 Running simple email test...');
    
    // Send a simple test email
    const success = await sendEmail({
      to: 'admin@myseniorvalet.com',
      from: 'hello@myseniorvalet.com',
      subject: '[PRODUCTION TEST] MySeniorValet Email System',
      html: `
        <h2>Production Email Test</h2>
        <p>This is a test of the MySeniorValet production email system.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <hr>
        <p style="color: #666;">If you received this email, the system is working correctly.</p>
      `
    });

    res.json({
      success,
      message: success ? 'Email sent successfully' : 'Email failed to send',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      error: 'Email test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get notification monitoring stats - no auth
router.get('/test/monitor', (req, res) => {
  try {
    const dashboard = NotificationMonitor.getDashboard();
    const health = NotificationMonitor.checkHealthStatus();

    res.json({
      success: true,
      monitoring: {
        healthy: health.healthy,
        totalSent: dashboard.summary.totalSent,
        totalFailed: dashboard.summary.totalFailed,
        successRate: dashboard.summary.successRate,
        lastHourCount: dashboard.summary.lastHourCount,
        issues: health.issues
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to get monitoring stats',
      details: error.message
    });
  }
});

// Run comprehensive test suite - requires key
router.post('/test/comprehensive', async (req, res) => {
  try {
    const { key, email } = req.body || {};
    
    if (key !== 'msv-admin-2025') {
      return res.status(403).json({ error: 'Invalid key' });
    }

    console.log('🧪 Starting comprehensive email test suite...');
    
    const results = [];
    
    // Test 1: Direct email
    try {
      const directSuccess = await sendEmail({
        to: email || 'admin@myseniorvalet.com',
        from: 'hello@myseniorvalet.com',
        subject: '[TEST 1/3] Direct Email Test',
        html: '<h3>Test 1: Direct Email</h3><p>Testing direct SendGrid delivery.</p>'
      });
      results.push({ test: 'direct', success: directSuccess });
    } catch (error: any) {
      results.push({ test: 'direct', success: false, error: error.message });
    }

    // Test 2: Notification service
    try {
      await ComprehensiveNotificationService.notifyCommunityClaimSubmitted({
        communityId: 99999,
        communityName: 'Test Community',
        claimantName: 'Test User',
        claimantEmail: email || 'admin@myseniorvalet.com',
        claimantPhone: '555-TEST',
        message: 'Comprehensive test suite'
      });
      results.push({ test: 'notification_service', success: true });
    } catch (error: any) {
      results.push({ test: 'notification_service', success: false, error: error.message });
    }

    // Test 3: Emergency notification
    try {
      await ComprehensiveNotificationService.notifyEmergencyContact({
        userName: 'Test User',
        userEmail: email || 'admin@myseniorvalet.com',
        userLocation: 'Test Location',
        message: 'TEST ONLY - Not a real emergency',
        contactNumber: '555-TEST',
        urgency: 'low'
      });
      results.push({ test: 'emergency', success: true });
    } catch (error: any) {
      results.push({ test: 'emergency', success: false, error: error.message });
    }

    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;

    res.json({
      success: successCount === totalTests,
      summary: `${successCount}/${totalTests} tests passed`,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Comprehensive test error:', error);
    res.status(500).json({ 
      error: 'Test suite failed',
      details: error.message
    });
  }
});

export default router;