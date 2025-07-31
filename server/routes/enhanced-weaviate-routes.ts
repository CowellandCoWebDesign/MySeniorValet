/**
 * Enhanced Weaviate API Routes for MySeniorValet
 * Provides AI-native search, RAG, and personalization endpoints
 */

import { Router } from 'express';
import { enhancedWeaviateService } from '../enhanced-weaviate-service';
import { z } from 'zod';

const router = Router();

// Validation schemas
const SemanticSearchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(50).optional().default(10),
  minScore: z.number().min(0).max(1).optional().default(0.7),
  searchType: z.enum(['semantic', 'hybrid', 'keyword']).optional().default('hybrid'),
  alpha: z.number().min(0).max(1).optional().default(0.75),
  filters: z.object({
    careTypes: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    location: z.object({
      city: z.string().optional(),
      state: z.string().optional(),
      radius: z.number().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }).optional()
    }).optional(),
    availability: z.enum(['available', 'waitlist', 'any']).optional(),
    qualityMin: z.number().min(0).max(100).optional()
  }).optional(),
  userProfile: z.object({
    userId: z.string(),
    preferences: z.object({
      careTypes: z.array(z.string()),
      priceRange: z.object({
        min: z.number(),
        max: z.number()
      }),
      location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        radius: z.number().optional(),
        coordinates: z.object({
          lat: z.number(),
          lng: z.number()
        }).optional()
      }),
      mustHave: z.array(z.string()),
      dealBreakers: z.array(z.string()),
      specialNeeds: z.array(z.string()),
      lifestyle: z.array(z.string())
    }),
    searchHistory: z.array(z.object({
      query: z.string(),
      timestamp: z.date(),
      clickedResults: z.array(z.string())
    })).optional().default([]),
    interactions: z.array(z.object({
      communityId: z.string(),
      action: z.enum(['view', 'favorite', 'tour_request', 'call', 'share']),
      timestamp: z.date(),
      duration: z.number().optional()
    })).optional().default([]),
    familyContext: z.object({
      relationshipToCare: z.string(),
      decisionMakers: z.number(),
      timeframe: z.enum(['immediate', '1-3months', '3-6months', '6months+']),
      currentSituation: z.string()
    })
  }).optional()
});

const RAGQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  limit: z.number().int().min(1).max(10).optional().default(5),
  userProfile: z.object({
    userId: z.string(),
    preferences: z.object({
      careTypes: z.array(z.string()),
      priceRange: z.object({
        min: z.number(),
        max: z.number()
      }),
      location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        radius: z.number().optional()
      }),
      mustHave: z.array(z.string()),
      dealBreakers: z.array(z.string()).optional().default([]),
      specialNeeds: z.array(z.string()),
      lifestyle: z.array(z.string())
    }),
    searchHistory: z.array(z.object({
      query: z.string(),
      timestamp: z.date(),
      clickedResults: z.array(z.string())
    })).optional().default([]),
    interactions: z.array(z.object({
      communityId: z.string(),
      action: z.enum(['view', 'favorite', 'tour_request', 'call', 'share']),
      timestamp: z.date(),
      duration: z.number().optional()
    })).optional().default([]),
    familyContext: z.object({
      relationshipToCare: z.string(),
      timeframe: z.enum(['immediate', '1-3months', '3-6months', '6months+']),
      currentSituation: z.string()
    })
  }).optional()
});

/**
 * POST /api/weaviate-enhanced/search
 * Enhanced semantic search with hybrid capabilities
 */
router.post('/search', async (req, res) => {
  try {
    const searchData = SemanticSearchSchema.parse(req.body);
    
    console.log(`🔍 Enhanced search: "${searchData.query}" (${searchData.searchType})`);
    
    const results = await enhancedWeaviateService.enhancedSemanticSearch(searchData);
    
    res.json({
      success: true,
      query: searchData.query,
      searchType: searchData.searchType,
      results: results,
      meta: {
        count: results.length,
        maxScore: Math.max(...results.map(r => r.score), 0),
        avgScore: results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0
      }
    });

  } catch (error) {
    console.error('Enhanced search error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Search service temporarily unavailable',
      message: 'Please try again or use the standard search'
    });
  }
});

/**
 * POST /api/weaviate-enhanced/rag
 * RAG-powered natural language recommendations
 */
router.post('/rag', async (req, res) => {
  try {
    const ragData = RAGQuerySchema.parse(req.body);
    
    console.log(`🤖 RAG query: "${ragData.query}"`);
    
    const response = await enhancedWeaviateService.generateRAGRecommendations(
      ragData.query,
      ragData.userProfile,
      ragData.limit
    );
    
    res.json({
      success: true,
      query: ragData.query,
      response
    });

  } catch (error) {
    console.error('RAG generation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'AI recommendation service temporarily unavailable',
      message: 'Please try the standard search or contact support'
    });
  }
});

/**
 * GET /api/weaviate-enhanced/recommendations/:userId
 * Get personalized community recommendations
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit cannot exceed 50'
      });
    }

    console.log(`🎯 Getting personalized recommendations for: ${userId}`);
    
    const recommendations = await enhancedWeaviateService.getPersonalizedRecommendations(userId, limit);
    
    res.json({
      success: true,
      userId,
      recommendations,
      meta: {
        count: recommendations.length,
        personalized: true
      }
    });

  } catch (error) {
    console.error('Personalized recommendations error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Recommendation service temporarily unavailable'
    });
  }
});

/**
 * POST /api/weaviate-enhanced/sync
 * Sync communities from database to vector database
 */
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Starting community vector sync...');
    
    // This could be a long-running operation, so we'll start it and return immediately
    enhancedWeaviateService.syncCommunitiesToVector().catch(error => {
      console.error('Background sync failed:', error);
    });
    
    res.json({
      success: true,
      message: 'Community sync started',
      note: 'This process runs in the background and may take several minutes'
    });

  } catch (error) {
    console.error('Sync initialization error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to start sync process'
    });
  }
});

/**
 * GET /api/weaviate-enhanced/health
 * Check Weaviate service health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await enhancedWeaviateService.healthCheck();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 206 : 503;
    
    res.status(statusCode).json({
      success: health.status !== 'unhealthy',
      status: health.status,
      details: health.details,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/weaviate-enhanced/similar/:communityId
 * Find similar communities to a given community
 */
router.get('/similar/:communityId', async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const limit = parseInt(req.query.limit as string) || 5;
    
    console.log(`🔗 Finding communities similar to: ${communityId}`);
    
    // Use the community's features as a search query
    const results = await enhancedWeaviateService.enhancedSemanticSearch({
      query: `community similar to ${communityId}`,
      limit: limit + 1, // +1 to exclude the original
      searchType: 'semantic'
    });
    
    // Filter out the original community
    const similarCommunities = results.filter(r => r.community.id !== communityId);
    
    res.json({
      success: true,
      originalCommunityId: communityId,
      similar: similarCommunities.slice(0, limit),
      meta: {
        count: similarCommunities.length
      }
    });

  } catch (error) {
    console.error('Similar communities error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Similar communities service temporarily unavailable'
    });
  }
});

export default router;