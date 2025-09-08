import express from "express";
import { db } from "../db";
import { sql, desc, gte } from "drizzle-orm";
import { isAuthenticated as requireAuth, isAdmin } from "../auth-middleware";

const router = express.Router();

// Apply admin authentication to all routes
router.use(requireAuth);
router.use(isAdmin);

// Store in-memory metrics for real-time tracking
const liveMetrics = {
  apiCalls: 0,
  dbQueries: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgResponseTime: 0,
  totalResponseTime: 0,
  requestCount: 0,
  errorCount: 0,
  lastReset: new Date()
};

// Middleware to track API performance
export const trackPerformance = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // Track API call
  liveMetrics.apiCalls++;
  liveMetrics.requestCount++;
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const responseTime = Date.now() - startTime;
    liveMetrics.totalResponseTime += responseTime;
    liveMetrics.avgResponseTime = liveMetrics.totalResponseTime / liveMetrics.requestCount;
    
    // Track errors
    if (res.statusCode >= 400) {
      liveMetrics.errorCount++;
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
};

// Get real-time performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const { timeRange = '1h' } = req.query;
    
    // Calculate uptime
    const uptime = process.uptime();
    const uptimePercentage = 99.9; // Placeholder - implement real monitoring
    
    // Get database metrics
    const [dbStats] = await db.execute(sql`
      SELECT 
        COUNT(*) as total_queries,
        AVG(EXTRACT(EPOCH FROM (NOW() - query_start))) as avg_query_time
      FROM pg_stat_activity
      WHERE state = 'active'
    `);
    
    // Calculate error rate
    const errorRate = liveMetrics.requestCount > 0 
      ? (liveMetrics.errorCount / liveMetrics.requestCount) * 100 
      : 0;
    
    // Calculate cache hit rate
    const totalCacheRequests = liveMetrics.cacheHits + liveMetrics.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 
      ? (liveMetrics.cacheHits / totalCacheRequests) * 100 
      : 0;
    
    res.json({
      responseTime: Math.round(liveMetrics.avgResponseTime),
      uptime: uptimePercentage,
      errorRate: errorRate.toFixed(2),
      apiCalls: liveMetrics.apiCalls,
      cacheHitRate: cacheHitRate.toFixed(2),
      dbQueries: liveMetrics.dbQueries,
      metrics: {
        uptime: {
          seconds: uptime,
          percentage: uptimePercentage
        },
        requests: {
          total: liveMetrics.requestCount,
          errors: liveMetrics.errorCount,
          errorRate: errorRate.toFixed(2)
        },
        performance: {
          avgResponseTime: Math.round(liveMetrics.avgResponseTime),
          totalResponseTime: liveMetrics.totalResponseTime
        },
        cache: {
          hits: liveMetrics.cacheHits,
          misses: liveMetrics.cacheMisses,
          hitRate: cacheHitRate.toFixed(2)
        },
        database: {
          queries: liveMetrics.dbQueries,
          avgQueryTime: dbStats.rows[0]?.avg_query_time || 0
        }
      },
      lastReset: liveMetrics.lastReset,
      _version: 'v4_performance_metrics',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get historical performance data
router.get('/history', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    // For now, return synthetic historical data since we don't have a performance_metrics table
    // In production, this would query a real metrics table
    const history = [];
    const now = Date.now();
    const intervals = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : 48; // 5-min intervals
    
    for (let i = 0; i < intervals; i++) {
      history.push({
        timestamp: new Date(now - (i * 5 * 60 * 1000)), // 5 minute intervals
        responseTime: Math.floor(Math.random() * 50) + 100,
        uptime: 99.9 + (Math.random() * 0.1),
        errorRate: Math.random() * 2,
        apiCalls: Math.floor(Math.random() * 1000) + 500,
        cacheHitRate: 85 + (Math.random() * 10)
      });
    }
    
    res.json({
      history: history.reverse(),
      timeRange,
      _version: 'v4_performance_history',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance history:', error);
    res.status(500).json({ error: 'Failed to fetch performance history' });
  }
});

// Reset performance metrics
router.post('/reset', async (req, res) => {
  try {
    // Reset live metrics
    liveMetrics.apiCalls = 0;
    liveMetrics.dbQueries = 0;
    liveMetrics.cacheHits = 0;
    liveMetrics.cacheMisses = 0;
    liveMetrics.avgResponseTime = 0;
    liveMetrics.totalResponseTime = 0;
    liveMetrics.requestCount = 0;
    liveMetrics.errorCount = 0;
    liveMetrics.lastReset = new Date();
    
    res.json({ 
      success: true, 
      message: 'Performance metrics reset successfully',
      lastReset: liveMetrics.lastReset
    });
  } catch (error) {
    console.error('Error resetting performance metrics:', error);
    res.status(500).json({ error: 'Failed to reset performance metrics' });
  }
});

// Export metrics tracking functions
export const incrementDbQueries = () => {
  liveMetrics.dbQueries++;
};

export const incrementCacheHit = () => {
  liveMetrics.cacheHits++;
};

export const incrementCacheMiss = () => {
  liveMetrics.cacheMisses++;
};

export default router;