/**
 * NLP Search Routes
 * Comprehensive natural language search API endpoints
 */

import { Router } from 'express';
import { nlpSearchSystem } from '../services/nlp-search-system';
import { nlpAnalytics } from '../services/nlp-analytics';

const router = Router();

/**
 * Main NLP search endpoint
 * POST /api/nlp/search
 */
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 20, filters, userContext } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required',
        _version: 'nlp_v1'
      });
    }
    
    // Track search start time
    const startTime = Date.now();
    
    // Perform NLP search
    const results = await nlpSearchSystem.search(query, {
      limit,
      filters,
      userContext
    });
    
    // Track analytics for self-learning
    const searchTime = Date.now() - startTime;
    await nlpAnalytics.trackSearch(
      query,
      results.intent,
      results.results,
      searchTime,
      (req.session as any)?.userId
    );
    
    console.log(`🧠 KRAKEN LEARNS: Query "${query}" processed in ${searchTime}ms with ${results.results.length} results`);
    
    // Add performance metrics
    const response = {
      ...results,
      _version: 'nlp_v1',
      _timestamp: Date.now(),
      _performance: {
        totalResults: results.results.length,
        hasAnswer: !!results.answer,
        intentConfidence: results.intent.confidence,
        databasesSearched: results.intent.databases
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('NLP search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'nlp_v1'
    });
  }
});

/**
 * Intent classification endpoint
 * POST /api/nlp/classify
 */
router.post('/classify', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        _version: 'nlp_v1'
      });
    }
    
    // Just classify intent without performing search
    const nlp = nlpSearchSystem as any;
    const intent = await nlp.classifyIntent(query);
    
    res.json({
      query,
      intent,
      _version: 'nlp_v1',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Intent classification error:', error);
    res.status(500).json({
      error: 'Classification failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'nlp_v1'
    });
  }
});

/**
 * Q&A endpoint
 * POST /api/nlp/ask
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, query, context, userContext } = req.body;
    
    // Accept both 'query' and 'question' for flexibility
    const actualQuery = question || query;
    
    if (!actualQuery) {
      return res.status(400).json({
        error: 'Question is required',
        _version: 'nlp_v1'
      });
    }
    
    // Perform search and generate answer
    const results = await nlpSearchSystem.search(actualQuery, {
      limit: 10,
      userContext: context || userContext
    });
    
    res.json({
      question: actualQuery,
      answer: results.answer || 'I couldn\'t find enough information to answer that question.',
      sources: results.results.slice(0, 3).map(r => ({
        type: r.type,
        title: r.data.name || r.data.title || 'Untitled',
        relevance: r.score
      })),
      confidence: results.intent.confidence,
      _version: 'nlp_v1',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({
      error: 'Question answering failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'nlp_v1'
    });
  }
});

/**
 * Multi-database federation test endpoint
 * GET /api/nlp/federation/test
 */
router.get('/federation/test', async (req, res) => {
  try {
    // Test federated search across all databases
    const testQuery = 'senior care services in California';
    const results = await nlpSearchSystem.search(testQuery, {
      limit: 5
    });
    
    // Group results by database
    const groupedResults = results.results.reduce((acc, result) => {
      const db = result.metadata?.database || 'unknown';
      if (!acc[db]) acc[db] = [];
      acc[db].push({
        type: result.type,
        score: result.score,
        title: result.data.name || result.data.title || 'Untitled'
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    res.json({
      testQuery,
      databasesSearched: results.intent.databases,
      resultsByDatabase: groupedResults,
      totalResults: results.results.length,
      facets: results.facets,
      _version: 'nlp_v1',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Federation test error:', error);
    res.status(500).json({
      error: 'Federation test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'nlp_v1'
    });
  }
});

/**
 * Get real-time search suggestions
 * GET /api/nlp/suggestions?q=query
 */
router.get('/suggestions', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = await nlpSearchSystem.getSuggestions(query);
    
    res.json({
      suggestions,
      _version: 'v4_streamlined_hero_' + Date.now()
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions',
      _version: 'v4_streamlined_hero_' + Date.now()
    });
  }
});

export default router;