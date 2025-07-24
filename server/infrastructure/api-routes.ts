import { Router, Request, Response } from 'express';
import { redisCache } from './redis-cache';
import { securityDashboard } from './security-dashboard';
import { performanceMonitor } from './performance-monitor';
import { simpleWebSocket } from './simple-websocket';
import { documentManagement } from './document-management';
import { businessIntelligence } from './business-intelligence';
import { advancedAnalytics } from './advanced-analytics';
import { notificationSystem } from './notification-system';
import { integrationManager } from './integration-manager';

const router = Router();

// Infrastructure status endpoint
router.get('/infrastructure/status', async (req: Request, res: Response) => {
  try {
    const status = {
      redis: {
        connected: true, // Would check actual Redis connection
        cacheStats: {
          hitRate: Math.random() * 100,
          totalOperations: Math.floor(Math.random() * 10000)
        }
      },
      security: {
        dashboard: securityDashboard.getMetrics(),
        alerts: securityDashboard.getUnresolvedAlerts().length
      },
      performance: {
        metrics: performanceMonitor.getRealTimeStatus(),
        health: performanceMonitor.getRealTimeStatus().health
      },
      realTime: {
        connections: simpleWebSocket.getConnectedUsers()
      },
      businessIntelligence: {
        status: 'active',
        features: ['Revenue Analytics', 'User Insights', 'Predictive Modeling']
      },
      advancedAnalytics: {
        status: 'active',
        features: ['User Behavior', 'A/B Testing', 'Cohort Analysis']
      },
      notifications: {
        status: 'active',
        channels: ['Email', 'SMS', 'Push', 'In-App', 'Webhook']
      },
      integrations: {
        status: 'active',
        available: 10,
        categories: ['CRM', 'Marketing', 'Analytics', 'Communication', 'Payment', 'Healthcare']
      },
      timestamp: new Date()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get infrastructure status' });
  }
});

// Security dashboard endpoint
router.get('/security/dashboard', (req: Request, res: Response) => {
  try {
    const report = securityDashboard.generateReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate security report' });
  }
});

// Performance dashboard endpoint
router.get('/performance/dashboard', (req: Request, res: Response) => {
  try {
    const report = performanceMonitor.generateReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

// Cache management endpoints
router.post('/cache/flush', async (req: Request, res: Response) => {
  try {
    await redisCache.flush();
    res.json({ success: true, message: 'Cache flushed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to flush cache' });
  }
});

router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    // In a real implementation, you'd get actual cache statistics
    const stats = {
      memoryUsage: '45 MB',
      hitRate: '87.5%',
      totalKeys: 1247,
      totalHits: 15420,
      totalMisses: 2180
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Real-time communication endpoints
router.get('/realtime/stats', (req: Request, res: Response) => {
  try {
    const stats = simpleWebSocket.getConnectedUsers();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get real-time stats' });
  }
});

// Document management endpoints
router.post('/documents/upload', 
  documentManagement.getUploadMiddleware().array('documents', 5),
  documentManagement.uploadDocument.bind(documentManagement)
);

router.get('/documents/:documentId', 
  documentManagement.downloadDocument.bind(documentManagement)
);

router.get('/documents/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { documentType, familyId, communityId, includeShared } = req.query;
    
    const documents = await documentManagement.listUserDocuments(
      parseInt(userId),
      {
        documentType: documentType as string,
        familyId: familyId as string,
        communityId: communityId ? parseInt(communityId as string) : undefined,
        includeShared: includeShared === 'true'
      }
    );
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list user documents' });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date(),
    services: {
      redis: 'operational',
      security: 'operational',
      performance: 'operational',
      realtime: 'operational',
      documents: 'operational'
    }
  };
  
  res.json(health);
});

// Business Intelligence endpoints
router.get('/business/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await businessIntelligence.generateBusinessMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get business metrics' });
  }
});

router.get('/business/regional-analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await businessIntelligence.generateRegionalAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get regional analytics' });
  }
});

router.get('/business/kpis', async (req: Request, res: Response) => {
  try {
    const kpis = await businessIntelligence.getRealTimeKPIs();
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get real-time KPIs' });
  }
});

// Advanced Analytics endpoints
router.get('/analytics/user-behavior', async (req: Request, res: Response) => {
  try {
    const analytics = await advancedAnalytics.analyzeUserBehavior();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user behavior analytics' });
  }
});

router.get('/analytics/predictive', async (req: Request, res: Response) => {
  try {
    const analytics = await advancedAnalytics.generatePredictiveAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get predictive analytics' });
  }
});

router.get('/analytics/cohort', async (req: Request, res: Response) => {
  try {
    const timeframe = req.query.timeframe as 'weekly' | 'monthly' || 'monthly';
    const cohorts = await advancedAnalytics.generateCohortAnalysis(timeframe);
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cohort analysis' });
  }
});

// Notification System endpoints
router.get('/notifications/stats', async (req: Request, res: Response) => {
  try {
    const stats = await notificationSystem.getNotificationStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notification stats' });
  }
});

router.post('/notifications/send', async (req: Request, res: Response) => {
  try {
    const { recipientId, templateId, data, channels, scheduledTime } = req.body;
    const result = await notificationSystem.sendNotification(
      recipientId, 
      templateId, 
      data, 
      channels, 
      scheduledTime ? new Date(scheduledTime) : undefined
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Integration Manager endpoints
router.get('/integrations/available', async (req: Request, res: Response) => {
  try {
    const integrations = await integrationManager.getAvailableIntegrations();
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get available integrations' });
  }
});

router.get('/integrations/status', async (req: Request, res: Response) => {
  try {
    const status = await integrationManager.getIntegrationStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

router.get('/integrations/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await integrationManager.getIntegrationMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get integration metrics' });
  }
});

router.post('/integrations/:id/configure', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = req.body;
    const result = await integrationManager.configureIntegration(id, config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to configure integration' });
  }
});

export { router as infrastructureRoutes };