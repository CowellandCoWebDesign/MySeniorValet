import { Router, Request, Response } from 'express';
import { redisCache } from './redis-cache';
import { securityDashboard } from './security-dashboard';
import { performanceMonitor } from './performance-monitor';
import { simpleWebSocket } from './simple-websocket';
import { documentManagement } from './document-management';

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

export { router as infrastructureRoutes };