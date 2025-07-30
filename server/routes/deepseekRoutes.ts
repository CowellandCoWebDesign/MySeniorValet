import { Router, type Request, type Response } from "express";
import { deepSeekService } from "../deepseek-ai-service";
import { db } from "../db";
import { communities } from "../../shared/schema";
import { ilike, or, and, sql, eq } from "drizzle-orm";

const router = Router();

// Enhanced search with DeepSeek AI analysis
router.post('/enhanced-search', async (req: Request, res: Response) => {
  try {
    const { query, location } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Search database first
    const searchTerms = query.toLowerCase().split(' ').filter((term: string) => term.length > 2);
    
    let whereClause;
    if (location) {
      const locationTerms = location.toLowerCase().split(' ').filter((term: string) => term.length > 2);
      whereClause = and(
        or(
          ...searchTerms.map((term: string) => 
            or(
              ilike(communities.name, `%${term}%`),
              ilike(communities.description, `%${term}%`),
              ilike(communities.careType, `%${term}%`)
            )
          )
        ),
        or(
          ...locationTerms.map((term: string) =>
            or(
              ilike(communities.city, `%${term}%`),
              ilike(communities.state, `%${term}%`),
              ilike(communities.zipCode, `%${term}%`)
            )
          )
        )
      );
    } else {
      whereClause = or(
        ...searchTerms.map((term: string) => 
          or(
            ilike(communities.name, `%${term}%`),
            ilike(communities.description, `%${term}%`),
            ilike(communities.careType, `%${term}%`),
            ilike(communities.city, `%${term}%`),
            ilike(communities.state, `%${term}%`)
          )
        )
      );
    }

    const dbCommunities = await db
      .select()
      .from(communities)
      .where(whereClause)
      .limit(20);

    // Get DeepSeek AI insights
    let deepSeekInsights = null;
    try {
      deepSeekInsights = await deepSeekService.enhanceCommunitySearch(
        query, 
        dbCommunities, 
        location
      );
    } catch (error) {
      console.error('DeepSeek analysis failed:', error);
    }

    res.json({
      query,
      location,
      databaseResults: dbCommunities.length,
      communities: dbCommunities,
      deepSeekInsights,
      enhanced: !!deepSeekInsights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Community analysis endpoint
router.post('/analyze-community/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userNeeds } = req.body;

    const community = await db
      .select()
      .from(communities)
      .where(eq(communities.id, parseInt(id)))
      .limit(1);

    if (!community.length) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const analysis = await deepSeekService.analyzeCommunity(
      community[0], 
      userNeeds
    );

    res.json({
      community: community[0],
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Community analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Market analysis endpoint
router.post('/market-analysis', async (req: Request, res: Response) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Get communities in the specified location
    const locationTerms = location.toLowerCase().split(' ').filter((term: string) => term.length > 2);
    
    const locationCommunities = await db
      .select()
      .from(communities)
      .where(
        or(
          ...locationTerms.map((term: string) =>
            or(
              ilike(communities.city, `%${term}%`),
              ilike(communities.state, `%${term}%`),
              ilike(communities.zipCode, `%${term}%`)
            )
          )
        )
      )
      .limit(100);

    const marketAnalysis = await deepSeekService.analyzeMarket(
      location, 
      locationCommunities
    );

    res.json({
      location,
      communitiesAnalyzed: locationCommunities.length,
      marketAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    res.status(500).json({ error: 'Market analysis failed' });
  }
});

// Multi-AI consensus endpoint (combines with other AI responses)
router.post('/consensus', async (req: Request, res: Response) => {
  try {
    const { query, aiResponses } = req.body;

    if (!query || !aiResponses || !Array.isArray(aiResponses)) {
      return res.status(400).json({ error: 'Query and AI responses are required' });
    }

    const consensus = await deepSeekService.buildConsensus(query, aiResponses);

    res.json({
      query,
      aiResponsesCount: aiResponses.length,
      consensus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Consensus building error:', error);
    res.status(500).json({ error: 'Consensus building failed' });
  }
});

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isHealthy = await deepSeekService.healthCheck();
    
    res.json({
      service: 'DeepSeek AI',
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      service: 'DeepSeek AI',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export function registerDeepSeekRoutes(app: any): void {
  app.use('/api/deepseek', router);
}