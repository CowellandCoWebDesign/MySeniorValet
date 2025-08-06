import { Router } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { multiAIOrchestrator } from '../services/multi-ai-orchestrator';
import { spatialIntelligence } from '../services/spatial-intelligence';
import { smartClusteringService } from '../services/smart-clustering-service';
import { sql, and, isNotNull, between } from 'drizzle-orm';

const router = Router();

// Analyze location with multi-AI orchestration
router.post('/api/ai-map/analyze-location', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Find nearby communities - simplified query
    const nearbyCommunities = await db
      .select()
      .from(communities)
      .where(
        and(
          isNotNull(communities.latitude),
          isNotNull(communities.longitude)
        )
      )
      .limit(100);

    // Run multi-AI analysis
    const analysis = await multiAIOrchestrator.analyzeLocation(lat, lng, nearbyCommunities);

    // Add community details to the analysis
    analysis.nearbyCommunities = nearbyCommunities.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      state: c.state,
      type: c.communitySubtype || 'Senior Living',
      latitude: c.latitude,
      longitude: c.longitude
    }));
    
    analysis.statistics = {
      totalFound: nearbyCommunities.length,
      byType: nearbyCommunities.reduce((acc: any, c) => {
        const type = c.communitySubtype || 'Senior Living';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      hudCommunities: nearbyCommunities.filter(c => c.isHudProperty).length
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
        sql`${communities.communitySubtype} = ${enhancements.suggestedFilters.careType}`
      );
    }

    // Note: Price filtering disabled as price columns don't exist in current schema

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

    // Note: Price filtering disabled as price columns don't exist in current schema

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

// Get optimized communities based on viewport
router.get('/api/ai-map/viewport-communities', async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng, zoom } = req.query;
    
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({ error: 'Viewport bounds required' });
    }

    const bounds = {
      minLat: Number(minLat),
      maxLat: Number(maxLat),
      minLng: Number(minLng),
      maxLng: Number(maxLng)
    };

    const communities = await spatialIntelligence.getCommunitiesInViewport(
      bounds,
      Number(zoom) || 10
    );

    res.json({
      type: 'FeatureCollection',
      features: communities,
      total: communities.length
    });
  } catch (error) {
    console.error('Failed to fetch viewport communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Smart clustered communities endpoint
router.get('/api/ai-map/clustered-communities', async (req, res) => {
  try {
    const { zoom = 4, west, south, east, north } = req.query;
    
    // Initialize clustering service if needed
    await smartClusteringService.initialize();
    
    const bounds = {
      west: Number(west) || -130,
      south: Number(south) || 24,
      east: Number(east) || -65,
      north: Number(north) || 50
    };
    
    const clusteredData = await smartClusteringService.getClusteredData({
      zoom: Number(zoom),
      bounds,
      maxClusters: zoom < 5 ? 50 : (zoom < 8 ? 100 : 200)
    });
    
    res.json(clusteredData);
  } catch (error) {
    console.error('Failed to get clustered communities:', error);
    res.status(500).json({ 
      error: 'Failed to get clustered communities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all communities for map display (legacy endpoint - now uses smart clustering)
router.get('/api/ai-map/all-communities', async (req, res) => {
  try {
    // Initialize clustering service if needed
    await smartClusteringService.initialize();
    
    // Return 50 clusters for country view
    const clusteredData = await smartClusteringService.getClusteredData({
      zoom: 4,
      bounds: {
        west: -130,
        south: 24,
        east: -65,
        north: 50
      },
      maxClusters: 50
    });
    
    res.json(clusteredData);
  } catch (error) {
    console.error('Failed to fetch communities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch communities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Spatial analytics endpoint
router.post('/api/ai-map/spatial-analytics', async (req, res) => {
  try {
    const { center, radius } = req.body;
    
    if (!center || !radius) {
      return res.status(400).json({ error: 'Center and radius required' });
    }

    const statistics = await spatialIntelligence.calculateSpatialStatistics(
      [center.lng, center.lat],
      radius
    );

    res.json(statistics);
  } catch (error) {
    console.error('Spatial analytics failed:', error);
    res.status(500).json({ error: 'Failed to perform spatial analysis' });
  }
});

// Find optimal locations
router.post('/api/ai-map/optimal-locations', async (req, res) => {
  try {
    const { criteria } = req.body;
    
    const locations = await spatialIntelligence.findOptimalLocations(criteria || {});

    res.json({ locations });
  } catch (error) {
    console.error('Failed to find optimal locations:', error);
    res.status(500).json({ error: 'Failed to find optimal locations' });
  }
});

// Viewshed analysis
router.post('/api/ai-map/viewshed', async (req, res) => {
  try {
    const { viewpoint, maxDistance } = req.body;
    
    if (!viewpoint) {
      return res.status(400).json({ error: 'Viewpoint required' });
    }

    const visible = await spatialIntelligence.performViewshedAnalysis(
      [viewpoint.lng, viewpoint.lat],
      maxDistance || 50
    );

    res.json({ visibleCommunities: visible });
  } catch (error) {
    console.error('Viewshed analysis failed:', error);
    res.status(500).json({ error: 'Failed to perform viewshed analysis' });
  }
});

export default router;