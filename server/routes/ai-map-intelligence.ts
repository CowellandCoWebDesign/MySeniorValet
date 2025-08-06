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
      hudCommunities: nearbyCommunities.filter(c => c.hudPropertyId).length
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

// Get communities within viewport bounds for efficient map display
router.get('/api/ai-map/all-communities', async (req, res) => {
  try {
    const { 
      north, 
      south, 
      east, 
      west,
      zoom 
    } = req.query;

    // Determine clustering level based on zoom
    const zoomLevel = parseInt(zoom as string) || 4;
    
    console.log('AI Map request - zoom level:', zoomLevel);
    
    // For country-wide view (zoom <= 5), return state-level clusters only
    if (zoomLevel <= 5) {
      const result = await db.execute(sql`
        SELECT 
          MIN(id) as id,
          state,
          AVG(latitude) as latitude,
          AVG(longitude) as longitude,
          COUNT(*) as count,
          STRING_AGG(DISTINCT community_subtype, ',') as types
        FROM communities 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        GROUP BY state
        ORDER BY COUNT(*) DESC
      `);
      
      return res.json({
        type: 'FeatureCollection',
        clustered: true,
        zoomLevel,
        features: result.rows.map((c: any) => ({
          type: 'Feature',
          properties: {
            id: c.id,
            name: c.state,
            state: c.state,
            count: c.count,
            types: c.types,
            cluster: true,
            clusterLevel: 'state'
          },
          geometry: {
            type: 'Point',
            coordinates: [Number(c.longitude), Number(c.latitude)]
          }
        })),
        total: result.rows.length
      });
    }
    
    // For state view (zoom 6-8), return major cities in view
    if (zoomLevel >= 6 && zoomLevel <= 8) {
      const result = await db.execute(sql`
        SELECT 
          MIN(id) as id,
          city,
          state,
          AVG(latitude) as latitude,
          AVG(longitude) as longitude,
          COUNT(*) as count,
          STRING_AGG(DISTINCT community_subtype, ',') as types
        FROM communities 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        GROUP BY state, city
        HAVING COUNT(*) > 2
        ORDER BY COUNT(*) DESC
        LIMIT 300
      `);
      
      return res.json({
        type: 'FeatureCollection',
        clustered: true,
        zoomLevel,
        features: result.rows.map((c: any) => ({
          type: 'Feature',
          properties: {
            id: c.id,
            name: `${c.city}, ${c.state}`,
            city: c.city,
            state: c.state,
            count: c.count,
            types: c.types,
            cluster: true,
            clusterLevel: 'city'
          },
          geometry: {
            type: 'Point',
            coordinates: [Number(c.longitude), Number(c.latitude)]
          }
        })),
        total: result.rows.length
      });
    }
    
    // For city view (zoom > 8), return all cities
    const result = await db.execute(sql`
      SELECT 
        MIN(id) as id,
        city,
        state,
        AVG(latitude) as latitude,
        AVG(longitude) as longitude,
        COUNT(*) as count,
        STRING_AGG(DISTINCT community_subtype, ',') as types
      FROM communities 
      WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL
      GROUP BY state, city
      ORDER BY COUNT(*) DESC
      LIMIT 500
    `);

    res.json({
      type: 'FeatureCollection',
      clustered: true,
      features: result.rows.map((c: any) => ({
        type: 'Feature',
        properties: {
          id: c.id,
          name: `${c.city}, ${c.state}`,
          city: c.city,
          state: c.state,
          count: c.count,
          types: c.types,
          cluster: true
        },
        geometry: {
          type: 'Point',
          coordinates: [Number(c.longitude), Number(c.latitude)]
        }
      })),
      total: result.rows.length
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