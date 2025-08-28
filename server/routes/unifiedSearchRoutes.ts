/**
 * 🚀 UNIFIED SEARCH ROUTES - Single Entry Point for All Search
 * ===========================================================
 * Consolidates all search endpoints into one intelligent interface
 * Part of the KRAKEN RELEASE - August 27, 2025
 */

import { Router } from 'express';
import { unifiedSearchEngine } from '../services/unified-search-engine';
import { cache } from '../cache';
import { isAuthenticated } from '../replitAuth';

const router = Router();

/**
 * Main unified search endpoint - THE BRAIN
 * Handles all search types through intent detection
 */
router.get('/api/search/unified', async (req, res) => {
  try {
    const { 
      q: query, 
      limit = 20, 
      offset = 0,
      filters,
      userId
    } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required',
        _version: 'unified_v1'
      });
    }
    
    // Execute unified search
    const results = await unifiedSearchEngine.search(query, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      filters: filters ? JSON.parse(filters as string) : undefined,
      userId: userId as string
    });
    
    res.json({
      ...results,
      _version: 'unified_v1_kraken'
    });
    
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'unified_v1'
    });
  }
});

/**
 * POST version of unified search endpoint
 * Accepts search parameters in request body
 */
router.post('/api/search/unified', async (req, res) => {
  try {
    const { 
      query, 
      limit = 20, 
      offset = 0,
      filters,
      userId
    } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required',
        _version: 'unified_v1'
      });
    }
    
    // Execute unified search
    const results = await unifiedSearchEngine.search(query, {
      limit,
      offset,
      filters,
      userId
    });
    
    res.json({
      ...results,
      _version: 'unified_v1_kraken'
    });
    
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'unified_v1'
    });
  }
});

/**
 * Search suggestions endpoint
 * Provides real-time suggestions as user types
 */
router.get('/api/search/suggestions', async (req, res) => {
  try {
    const query = req.query.query || req.query.q;
    
    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.json({ 
        suggestions: [],
        _version: 'v4_streamlined_hero_' + Date.now(),
        _timestamp: Date.now()
      });
    }
    
    // Get cached suggestions
    const cacheKey = `suggestions:${query}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ 
        suggestions: JSON.parse(cached),
        _version: 'v4_streamlined_hero_' + Date.now(),
        _timestamp: Date.now()
      });
    }
    
    // Generate suggestions from unified search
    const searchResults = await unifiedSearchEngine.search(query as string, { limit: 5 });
    const suggestions = searchResults.suggestions || [];
    
    // Add query-based suggestions
    const autoComplete = [
      `${query} assisted living`,
      `${query} memory care`,
      `${query} under $5000`
    ].filter(s => s.length > query.toString().length);
    
    const allSuggestions = [...new Set([...autoComplete, ...suggestions])].slice(0, 10);
    
    // Cache for 1 minute
    await cache.set(cacheKey, JSON.stringify(allSuggestions), 60);
    
    res.json({ 
      suggestions: allSuggestions,
      _version: 'v4_streamlined_hero_' + Date.now(),
      _timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ 
      suggestions: [],
      _version: 'v4_streamlined_hero_' + Date.now(),
      _timestamp: Date.now()
    });
  }
});

/**
 * Search insights endpoint
 * Provides AI-generated insights about search results
 */
router.post('/api/search/insights', async (req, res) => {
  try {
    const { query, communityIds } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Get full search results with insights
    const results = await unifiedSearchEngine.search(query, {
      limit: 50
    });
    
    res.json({
      insights: results.insights || {},
      metadata: results.searchMetadata,
      _version: 'insights_v1'
    });
    
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Predictive search endpoint
 * Uses AI to predict what user is looking for
 */
router.post('/api/search/predictive', isAuthenticated, async (req: any, res) => {
  try {
    const { partialQuery, searchHistory } = req.body;
    const userId = req.user?.id;
    
    // Use search history and patterns to predict
    const predictions = await unifiedSearchEngine.search(partialQuery || '', {
      limit: 10,
      userId
    });
    
    res.json({
      predictions: predictions.communities.slice(0, 5),
      confidence: predictions.searchMetadata.confidenceScore,
      _version: 'predictive_v1'
    });
    
  } catch (error) {
    console.error('Predictive search error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

/**
 * Natural language search endpoint
 * Handles complex queries like "Find me a pet-friendly community 
 * near the beach under $5000 with good reviews"
 */
router.post('/api/search/natural-language', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Process through unified search with NLP flag
    const results = await unifiedSearchEngine.search(query, {
      limit: 30
    });
    
    res.json({
      results: results.communities,
      interpretation: results.searchMetadata.intent,
      confidence: results.searchMetadata.confidenceScore,
      suggestions: results.suggestions,
      _version: 'nlp_v1'
    });
    
  } catch (error) {
    console.error('NLP search error:', error);
    res.status(500).json({ error: 'Natural language processing failed' });
  }
});

/**
 * Deprecated endpoint redirects
 * Redirect old endpoints to unified search
 */
router.get('/api/search', async (req, res) => {
  // Redirect to unified search
  const query = req.query.q || req.query.query || '';
  res.redirect(`/api/search/unified?q=${encodeURIComponent(query as string)}`);
});

router.get('/api/communities/search', async (req, res) => {
  // Redirect to unified search
  const query = req.query.q || req.query.query || req.query.name || '';
  res.redirect(`/api/search/unified?q=${encodeURIComponent(query as string)}`);
});

router.post('/api/ai/search', async (req, res) => {
  // Redirect to natural language search
  res.redirect(307, '/api/search/natural-language');
});

/**
 * Search analytics endpoint
 * Track search patterns and success rates
 */
router.post('/api/search/analytics', async (req, res) => {
  try {
    const { query, resultClicked, searchTime, resultsShown } = req.body;
    
    // Log search analytics for learning
    console.log('Search Analytics:', {
      query,
      resultClicked,
      searchTime,
      resultsShown,
      timestamp: new Date()
    });
    
    res.json({ recorded: true });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.json({ recorded: false });
  }
});

export default router;

// Also export as named export for routes/index.ts
export function registerUnifiedSearchRoutes(app: any) {
  app.use(router);
}