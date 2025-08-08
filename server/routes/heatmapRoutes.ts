import { Router } from "express";
import { availabilityHeatmapService } from "../availability-heatmap-service";
import { z } from "zod";

const router = Router();

// Validation schemas
const heatmapQuerySchema = z.object({
  north: z.string().transform(Number),
  south: z.string().transform(Number),
  east: z.string().transform(Number),
  west: z.string().transform(Number),
  zoom: z.string().transform(Number).optional().default(10)
});

const regionDataSchema = z.object({
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }),
  zoomLevel: z.number().min(1).max(15).default(10)
});

/**
 * POST /api/heatmap/region-data
 * Get heatmap data for a specific region (POST for complex parameters)
 */
router.post("/region-data", async (req, res) => {
  try {
    const { bounds, zoomLevel } = regionDataSchema.parse(req.body);

    // Validate bounds
    if (bounds.north <= bounds.south || bounds.east <= bounds.west) {
      return res.status(400).json({ 
        message: "Invalid bounds: north must be > south, east must be > west" 
      });
    }

    // Limit area size to prevent performance issues
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    if (latDiff > 10 || lngDiff > 10) {
      return res.status(400).json({ 
        message: "Area too large: maximum 10 degrees in each direction" 
      });
    }

    const heatmapData = await availabilityHeatmapService.generateHeatmapData(
      bounds, 
      zoomLevel
    );

    res.json({
      success: true,
      region: heatmapData,
      dataPoints: heatmapData.data.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating region heatmap data:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request parameters", 
        errors: error.errors 
      });
    }

    res.status(500).json({ 
      message: "Failed to generate region heatmap data",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/heatmap/availability
 * Get availability heatmap data for a geographic region
 */
router.get("/availability", async (req, res) => {
  try {
    const query = heatmapQuerySchema.parse(req.query);
    
    const bounds = {
      north: query.north,
      south: query.south,
      east: query.east,
      west: query.west
    };

    // Validate bounds
    if (bounds.north <= bounds.south || bounds.east <= bounds.west) {
      return res.status(400).json({ 
        message: "Invalid bounds: north must be > south, east must be > west" 
      });
    }

    // Limit area size to prevent performance issues
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    if (latDiff > 10 || lngDiff > 10) {
      return res.status(400).json({ 
        message: "Area too large: maximum 10 degrees in each direction" 
      });
    }

    const heatmapData = await availabilityHeatmapService.generateHeatmapData(
      bounds, 
      query.zoom
    );

    res.json({
      success: true,
      region: heatmapData,
      dataPoints: heatmapData.data.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating availability heatmap:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid query parameters", 
        errors: error.errors 
      });
    }

    res.status(500).json({ 
      message: "Failed to generate availability heatmap",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/heatmap/trends
 * Get overall availability trends for dashboard
 */
router.get("/trends", async (req, res) => {
  try {
    const trends = await availabilityHeatmapService.getAvailabilityTrends();
    
    res.json({
      success: true,
      trends,
      lastUpdated: trends.lastUpdated
    });

  } catch (error) {
    console.error("Error getting availability trends:", error);
    res.status(500).json({ 
      message: "Failed to get availability trends",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/heatmap/refresh
 * Clear cache and refresh heatmap data (admin only)
 */
router.post("/refresh", async (req, res) => {
  try {
    // Check if user is admin (basic check for demo)
    const isAdmin = req.headers['x-admin-key'] === 'demo-admin' || 
                   req.user?.role === 'super_admin';
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    availabilityHeatmapService.clearCache();
    
    res.json({
      success: true,
      message: "Heatmap cache cleared successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error refreshing heatmap cache:", error);
    res.status(500).json({ 
      message: "Failed to refresh heatmap cache",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/heatmap/status
 * Get heatmap service status and performance metrics
 */
router.get("/status", async (req, res) => {
  try {
    // Get some basic performance metrics
    const trends = await availabilityHeatmapService.getAvailabilityTrends();
    
    res.json({
      success: true,
      status: "operational",
      metrics: {
        totalCommunities: trends.totalCommunities,
        availabilityDistribution: {
          available: trends.availableNow,
          limited: trends.limitedAvailability,
          waitlist: trends.waitlistOnly,
          none: trends.noAvailability
        },
        lastDataUpdate: trends.lastUpdated
      },
      serviceInfo: {
        cacheEnabled: true,
        cacheDuration: "5 minutes",
        maxAreaSize: "10x10 degrees",
        supportedZoomLevels: "1-15"
      }
    });

  } catch (error) {
    console.error("Error getting heatmap status:", error);
    res.status(500).json({ 
      success: false,
      status: "error",
      message: "Failed to get heatmap status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;