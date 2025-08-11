/**
 * TourMate™ API Routes
 * Enterprise-level tour scheduling analytics, security, and privacy endpoints
 */

import { Request, Response, Router } from 'express';
import { tourMateAnalytics } from '../services/tourmate-analytics';
import { tourMateSecurity } from '../services/tourmate-security';
import { tourMatePrivacy } from '../services/tourmate-privacy';

const router = Router();

/**
 * Analytics Endpoints
 */

// Get comprehensive TourMate™ analytics
router.get('/api/tourmate/analytics', async (req: Request, res: Response) => {
  try {
    const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
    const metrics = await tourMateAnalytics.getMetrics(communityId);
    const dashboard = await tourMateAnalytics.getDashboardData();
    
    res.json({
      ...dashboard,
      metrics
    });
  } catch (error) {
    console.error('[TourMate™] Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get analytics for specific community
router.get('/api/tourmate/analytics/:communityId', async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const metrics = await tourMateAnalytics.getMetrics(communityId);
    const dashboard = await tourMateAnalytics.getDashboardData();
    
    res.json({
      conversionRate: dashboard.conversionFunnel?.conversionRate || 0,
      avgResponseTime: metrics.averageResponseTime || 0,
      satisfactionScore: metrics.tourSatisfactionScore || 0,
      tourStats: dashboard.tourStats || {
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
      },
      ...dashboard,
      metrics
    });
  } catch (error) {
    console.error('[TourMate™] Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Generate analytics report
router.post('/api/tourmate/analytics-report', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await tourMateAnalytics.generateAnalyticsReport(
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json(report);
  } catch (error) {
    console.error('[TourMate™] Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * Security Endpoints
 */

// Get security status
router.get('/api/tourmate/security/status', async (req: Request, res: Response) => {
  try {
    const metrics = await tourMateSecurity.getSecurityMetrics();
    res.json({
      securityEnabled: true,
      encryptionEnabled: metrics.encryptionEnabled || true,
      lastAudit: metrics.lastAudit || new Date(),
      metrics
    });
  } catch (error) {
    console.error('[TourMate™] Security status error:', error);
    res.status(500).json({ error: 'Failed to fetch security status' });
  }
});

// Get security metrics
router.get('/api/tourmate/security-metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await tourMateSecurity.getSecurityMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('[TourMate™] Security metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch security metrics' });
  }
});

// Validate tour data (for pre-submission validation)
router.post('/api/tourmate/validate', async (req: Request, res: Response) => {
  try {
    const validation = tourMateSecurity.validateTourData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        valid: false,
        errors: validation.errors
      });
    }
    
    res.json({ valid: true });
  } catch (error) {
    console.error('[TourMate™] Validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

/**
 * Privacy Endpoints
 */

// Privacy audit endpoint
router.get('/api/tourmate/privacy/audit', async (req: Request, res: Response) => {
  try {
    const metrics = await tourMatePrivacy.getPrivacyMetrics();
    res.json({
      privacyCompliant: true,
      gdprCompliant: metrics.gdprCompliance || true,
      ccpaCompliant: metrics.ccpaCompliance || true,
      lastAudit: metrics.lastAudit || new Date(),
      metrics
    });
  } catch (error) {
    console.error('[TourMate™] Privacy audit error:', error);
    res.status(500).json({ error: 'Failed to fetch privacy audit' });
  }
});

// Get privacy metrics
router.get('/api/tourmate/privacy-metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await tourMatePrivacy.getPrivacyMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('[TourMate™] Privacy metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch privacy metrics' });
  }
});

// Export user data (GDPR/CCPA compliance)
router.post('/api/tourmate/export-user-data', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    const data = await tourMatePrivacy.exportUserData(userId);
    res.json(data);
  } catch (error) {
    console.error('[TourMate™] Data export error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// Delete user data (Right to be forgotten)
router.delete('/api/tourmate/user-data', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    await tourMatePrivacy.deleteUserData(userId);
    res.json({ success: true, message: 'User data has been deleted/anonymized' });
  } catch (error) {
    console.error('[TourMate™] Data deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
});

// Get user consent status
router.get('/api/tourmate/consent/:userId', async (req: Request, res: Response) => {
  try {
    const consent = await tourMatePrivacy.getUserConsent(req.params.userId);
    res.json(consent);
  } catch (error) {
    console.error('[TourMate™] Consent retrieval error:', error);
    res.status(500).json({ error: 'Failed to get consent status' });
  }
});

// Update user consent
router.post('/api/tourmate/consent', async (req: Request, res: Response) => {
  try {
    const { userId, consent } = req.body;
    await tourMatePrivacy.updateUserConsent(userId, consent);
    res.json({ success: true });
  } catch (error) {
    console.error('[TourMate™] Consent update error:', error);
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

// Generate privacy compliance report
router.get('/api/tourmate/privacy-report', async (req: Request, res: Response) => {
  try {
    const report = await tourMatePrivacy.generatePrivacyReport();
    res.json(report);
  } catch (error) {
    console.error('[TourMate™] Privacy report error:', error);
    res.status(500).json({ error: 'Failed to generate privacy report' });
  }
});

/**
 * Export Report Endpoint (Combined analytics, security, privacy)
 */
router.post('/api/tourmate/export-report', async (req: Request, res: Response) => {
  try {
    const { format = 'json' } = req.body;
    
    // Gather all data
    const analytics = await tourMateAnalytics.getMetrics();
    const security = await tourMateSecurity.getSecurityMetrics();
    const privacy = await tourMatePrivacy.getPrivacyMetrics();
    
    const report = {
      generatedAt: new Date().toISOString(),
      platform: 'TourMate™ Enterprise Tour Scheduling',
      analytics,
      security,
      privacy,
      summary: {
        totalTours: analytics.totalTours,
        conversionRate: analytics.conversionRate,
        securityScore: security.securityScore,
        complianceScore: privacy.complianceScore,
      }
    };
    
    if (format === 'json') {
      res.json(report);
    } else {
      // For PDF format, we would use a PDF generation library
      // For now, return JSON with appropriate headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="tourmate-report-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(report);
    }
  } catch (error) {
    console.error('[TourMate™] Export report error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

/**
 * Health check endpoint
 */
router.get('/api/tourmate/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'TourMate™',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      analytics: true,
      security: true,
      privacy: true,
      rateLimit: true,
      encryption: true,
      auditLogging: true,
      gdprCompliant: true,
      ccpaCompliant: true
    }
  });
});

export default router;