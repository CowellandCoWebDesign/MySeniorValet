import { Router } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { multiAIOrchestrator } from '../services/multi-ai-orchestrator';
import { sql, and, isNotNull, between } from 'drizzle-orm';

const router = Router();

// Analyze location with multi-AI orchestration
router.post('/api/ai-map/analyze-location', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Find nearby communities using PostGIS (if available) or basic distance calculation
    const nearbyCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        latitude: communities.latitude,
        longitude: communities.longitude,
        communityType: communities.communityType,
        monthlyRentMin: communities.monthlyRentMin,
        monthlyRentMax: communities.monthlyRentMax,
        hudStatus: communities.hudStatus
      })
      .from(communities)
      .where(
        sql`
          ${communities.latitude} IS NOT NULL 
          AND ${communities.longitude} IS NOT NULL
          AND (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(${communities.latitude})) *
              cos(radians(${communities.longitude}) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(${communities.latitude}))
            )
          ) <= ${radius}
        `
      )
      .limit(50);

    // Run multi-AI analysis
    const analysis = await multiAIOrchestrator.analyzeLocation(lat, lng, nearbyCommunities);

    // Add community details to the analysis
    analysis.nearbyCommunities = nearbyCommunities;
    analysis.statistics = {
      totalFound: nearbyCommunities.length,
      byType: nearbyCommunities.reduce((acc: any, c) => {
        acc[c.communityType || 'Unknown'] = (acc[c.communityType || 'Unknown'] || 0) + 1;
        return acc;
      }, {}),
      hudCommunities: nearbyCommunities.filter(c => c.hudStatus).length,
      priceRange: {
        min: Math.min(...nearbyCommunities.map(c => c.monthlyRentMin || 0).filter(p => p > 0)),
        max: Math.max(...nearbyCommunities.map(c => c.monthlyRentMax || 0).filter(p => p > 0))
      }
    };

    res.json(analysis);
  } catch (error) {
    console.error('Location analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze location',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced search with multi-AI
router.post('/api/ai-map/enhance-search', async (req, res) => {
  try {
    const { query, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get AI-enhanced search suggestions
    const enhancements = await multiAIOrchestrator.enhanceSearch(query, filters);

    // Execute enhanced search
    const searchConditions: any[] = [];
    
    // Add enhanced queries to search
    if (enhancements.enhancedQueries.length > 0) {
      const searchTerms = [...new Set([query, ...enhancements.enhancedQueries])];
      searchConditions.push(
        sql`(
          ${searchTerms.map(term => 
            sql`${communities.name} ILIKE ${'%' + term + '%'} 
                OR ${communities.city} ILIKE ${'%' + term + '%'}
                OR ${communities.state} ILIKE ${'%' + term + '%'}`
          ).reduce((a, b) => sql`${a} OR ${b}`)}
        )`
      );
    }

    // Apply suggested filters
    if (enhancements.suggestedFilters.careType) {
      searchConditions.push(
        sql`${communities.communityType} = ${enhancements.suggestedFilters.careType}`
      );
    }

    if (enhancements.suggestedFilters.maxPrice) {
      searchConditions.push(
        sql`${communities.monthlyRentMin} <= ${enhancements.suggestedFilters.maxPrice}`
      );
    }

    // Execute search
    const results = await db
      .select()
      .from(communities)
      .where(searchConditions.length > 0 ? 
        searchConditions.reduce((a, b) => sql`${a} AND ${b}`) : 
        sql`1=1`
      )
      .limit(100);

    res.json({
      originalQuery: query,
      enhancements,
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Search enhancement error:', error);
    res.status(500).json({ 
      error: 'Failed to enhance search',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Community matching with AI
router.post('/api/ai-map/match-communities', async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'User preferences are required' });
    }

    // Get communities based on basic filters
    let query = db.select().from(communities);

    // Apply basic filters
    if (preferences.state) {
      query = query.where(sql`${communities.state} = ${preferences.state}`) as any;
    }

    if (preferences.maxPrice) {
      query = query.where(sql`${communities.monthlyRentMin} <= ${preferences.maxPrice}`) as any;
    }

    const potentialMatches = await query.limit(100);

    // Use AI to score and rank matches
    const matches = await multiAIOrchestrator.matchCommunities(preferences, potentialMatches);

    res.json({
      preferences,
      matches,
      totalAnalyzed: potentialMatches.length
    });
  } catch (error) {
    console.error('Community matching error:', error);
    res.status(500).json({ 
      error: 'Failed to match communities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all communities for map display
router.get('/api/ai-map/all-communities', async (req, res) => {
  try {
    const { bounds } = req.query;
    
    // Build query based on bounds
    let baseQuery = db
      .select({
        id: communities.id,
        name: communities.name,
        latitude: communities.latitude,
        longitude: communities.longitude,
        city: communities.city,
        state: communities.state,
        communityType: communities.communityType,
        monthlyRentMin: communities.monthlyRentMin,
        monthlyRentMax: communities.monthlyRentMax,
        hudStatus: communities.hudStatus
      })
      .from(communities)
      .where(
        and(
          isNotNull(communities.latitude),
          isNotNull(communities.longitude)
        )
      );
    
    // Apply bounds filter if provided
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = (bounds as string).split(',').map(Number);
      baseQuery = db
        .select({
          id: communities.id,
          name: communities.name,
          latitude: communities.latitude,
          longitude: communities.longitude,
          city: communities.city,
          state: communities.state,
          communityType: communities.communityType,
          monthlyRentMin: communities.monthlyRentMin,
          monthlyRentMax: communities.monthlyRentMax,
          hudStatus: communities.hudStatus
        })
        .from(communities)
        .where(
          and(
            isNotNull(communities.latitude),
            isNotNull(communities.longitude),
            between(communities.latitude, swLat, neLat),
            between(communities.longitude, swLng, neLng)
          )
        );
    }
    
    const allCommunities = await baseQuery;

    res.json({
      type: 'FeatureCollection',
      features: allCommunities.map(c => ({
        type: 'Feature',
        properties: {
          id: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          type: c.communityType,
          priceMin: c.monthlyRentMin,
          priceMax: c.monthlyRentMax,
          isHUD: c.hudStatus
        },
        geometry: {
          type: 'Point',
          coordinates: [c.longitude, c.latitude]
        }
      })),
      total: allCommunities.length
    });
  } catch (error) {
    console.error('Failed to fetch communities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch communities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;