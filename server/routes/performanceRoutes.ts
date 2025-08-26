/**
 * Performance Monitoring and Optimization Routes
 */

import { Router, Request, Response } from "express";
import { performanceOptimizer } from "../performance-optimizer";
import { requireAdminAuth } from "../middleware/auth";

const router = Router();

/**
 * Get performance metrics summary
 */
router.get("/api/admin/performance/metrics", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const metrics = performanceOptimizer.getMetricsSummary();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({ 
      error: "Failed to fetch performance metrics",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Analyze database performance
 */
router.get("/api/admin/performance/analyze-db", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const analysis = await performanceOptimizer.analyzeDatabasePerformance();
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("Error analyzing database performance:", error);
    res.status(500).json({ 
      error: "Failed to analyze database performance",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Create performance indexes
 */
router.post("/api/admin/performance/create-indexes", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const results = await performanceOptimizer.createPerformanceIndexes();
    res.json({
      success: true,
      data: {
        indexes: results,
        message: "Performance indexes created successfully"
      }
    });
  } catch (error) {
    console.error("Error creating indexes:", error);
    res.status(500).json({ 
      error: "Failed to create performance indexes",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Warm cache with frequently accessed data
 */
router.post("/api/admin/performance/warm-cache", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const results = await performanceOptimizer.warmCache();
    res.json({
      success: true,
      data: {
        warmed: results,
        message: "Cache warmed successfully"
      }
    });
  } catch (error) {
    console.error("Error warming cache:", error);
    res.status(500).json({ 
      error: "Failed to warm cache",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get cache statistics
 */
router.get("/api/admin/cache/stats", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { cacheService } = await import("../cache-service");
    const stats = cacheService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching cache stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch cache statistics",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Optimize API response with field filtering and pagination
 */
router.post("/api/performance/optimize-response", async (req: Request, res: Response) => {
  try {
    const { data, fields, limit, compress } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }
    
    const optimized = performanceOptimizer.optimizeApiResponse(data, {
      fields,
      limit,
      compress
    });
    
    res.json({
      success: true,
      data: optimized,
      metadata: {
        original_size: JSON.stringify(data).length,
        optimized_size: JSON.stringify(optimized).length,
        reduction: `${Math.round((1 - JSON.stringify(optimized).length / JSON.stringify(data).length) * 100)}%`
      }
    });
  } catch (error) {
    console.error("Error optimizing response:", error);
    res.status(500).json({ 
      error: "Failed to optimize response",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

export function registerPerformanceRoutes(app: Router) {
  app.use(router);
}