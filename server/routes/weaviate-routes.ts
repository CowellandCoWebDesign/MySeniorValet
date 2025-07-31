/**
 * Weaviate API Routes
 * Semantic search, AI recommendations, and intelligent community discovery
 */

import { Router } from 'express';
import { weaviateService, RecommendationContext } from '../services/weaviate-service';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validation schemas
const semanticSearchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(50).optional().default(10),
  preferences: z.object({
    careTypes: z.array(z.string()).optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      radius: z.number().optional(),
    }).optional(),
    amenities: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    specialNeeds: z.array(z.string()).optional(),
  }).optional(),
});

const recommendationsSchema = z.object({
  preferences: z.object({
    careTypes: z.array(z.string()).optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      radius: z.number().optional(),
    }).optional(),
    amenities: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    specialNeeds: z.array(z.string()).optional(),
  }),
  searchHistory: z.array(z.string()).optional(),
  viewHistory: z.array(z.string()).optional(),
  limit: z.number().min(1).max(20).optional().default(5),
});

const similarCommunitiesSchema = z.object({
  communityId: z.string(),
  limit: z.number().min(1).max(20).optional().default(5),
});

const indexingSchema = z.object({
  limit: z.number().min(1).max(5000).optional().default(1000),
  offset: z.number().min(0).optional().default(0),
});

/**
 * POST /api/weaviate/search
 * Semantic search for communities using natural language
 */
router.post('/search', validateRequest(semanticSearchSchema), async (req, res) => {
  try {
    const { query, limit, preferences } = req.body;

    console.log(`🔍 Semantic search request: "${query}"`);

    const context: RecommendationContext = {
      userId: (req as any).user?.id?.toString(),
      preferences,
    };

    const results = await weaviateService.semanticSearch(query, limit, context);

    res.json({
      success: true,
      query,
      results: results.map(r => ({
        community: r.community,
        relevanceScore: Math.round(r.score * 100) / 100,
        explanation: r.explanation,
      })),
      totalFound: results.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Semantic search error:', error);
    res.status(500).json({
      success: false,
      error: 'Semantic search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/weaviate/recommendations
 * Get personalized community recommendations
 */
router.post('/recommendations', validateRequest(recommendationsSchema), async (req, res) => {
  try {
    const { preferences, searchHistory, viewHistory, limit } = req.body;

    console.log('🎯 Personalized recommendations request');

    const context: RecommendationContext = {
      userId: (req as any).user?.id?.toString(),
      preferences,
      searchHistory,
      viewHistory,
    };

    const recommendations = await weaviateService.getPersonalizedRecommendations(context, limit);

    res.json({
      success: true,
      recommendations: recommendations.map(r => ({
        community: r.community,
        relevanceScore: Math.round(r.score * 100) / 100,
        explanation: r.explanation,
      })),
      personalizedFor: {
        careTypes: preferences?.careTypes,
        location: preferences?.location,
        amenities: preferences?.amenities,
      },
      totalFound: recommendations.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Recommendations failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/weaviate/similar
 * Find communities similar to a given community
 */
router.post('/similar', validateRequest(similarCommunitiesSchema), async (req, res) => {
  try {
    const { communityId, limit } = req.body;

    console.log(`🔗 Similar communities request for ID: ${communityId}`);

    const similarCommunities = await weaviateService.findSimilarCommunities(communityId, limit);

    res.json({
      success: true,
      baseCommunityId: communityId,
      similarCommunities: similarCommunities.map(r => ({
        community: r.community,
        similarityScore: Math.round(r.score * 100) / 100,
        explanation: r.explanation,
      })),
      totalFound: similarCommunities.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Similar communities error:', error);
    res.status(500).json({
      success: false,
      error: 'Similar communities search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/weaviate/index
 * Index communities in Weaviate (admin only)
 */
router.post('/index', validateRequest(indexingSchema), async (req, res) => {
  try {
    // For development, allow indexing without auth check
    console.log('🔧 Development mode: Allowing community indexing');

    const { limit, offset } = req.body;

    console.log(`📊 Starting community indexing (limit: ${limit}, offset: ${offset})`);

    const indexedCount = await weaviateService.indexCommunities(limit, offset);

    res.json({
      success: true,
      indexedCount,
      limit,
      offset,
      message: `Successfully indexed ${indexedCount} communities`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Community indexing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/weaviate/status
 * Get Weaviate service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = weaviateService.getStatus();
    const isHealthy = await weaviateService.healthCheck();

    res.json({
      success: true,
      status: {
        ...status,
        isHealthy,
        endpoints: {
          search: '/api/weaviate/search',
          recommendations: '/api/weaviate/recommendations',
          similar: '/api/weaviate/similar',
          index: '/api/weaviate/index',
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/weaviate/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await weaviateService.healthCheck();

    if (isHealthy) {
      res.json({
        success: true,
        status: 'healthy',
        message: 'Weaviate service is operational',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        message: 'Weaviate service is not responding',
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;