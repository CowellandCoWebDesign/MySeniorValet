import { Router, Request, Response } from 'express';
import { enhancedSearchIntelligence } from '../enhanced-search-intelligence';

const router = Router();

/**
 * Enhanced Search Intelligence API Routes
 * Provides AI-powered search with personalization and real-time insights
 */

// Smart search with AI interpretation and personalization
router.post('/smart-search', async (req: Request, res: Response) => {
  try {
    const {
      query,
      userId,
      location,
      filters,
      context
    } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Search query is required',
        success: false
      });
    }

    console.log('🔍 Smart search request:', { query, userId: userId ? 'authenticated' : 'anonymous' });

    const results = await enhancedSearchIntelligence.performSmartSearch({
      query: query.trim(),
      userId,
      location,
      filters,
      context
    });

    res.json({
      success: true,
      data: results,
      meta: {
        searchType: 'smart_search',
        timestamp: new Date().toISOString(),
        version: 'v1.0'
      }
    });

  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search intelligence temporarily unavailable',
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
});

// Voice search processing (speech-to-text)
router.post('/voice-search', async (req: Request, res: Response) => {
  try {
    const { audioData, userId } = req.body;

    if (!audioData) {
      return res.status(400).json({
        error: 'Audio data is required for voice search',
        success: false
      });
    }

    // This would integrate with a speech-to-text service
    // For now, return a mock response indicating the feature is coming soon
    res.json({
      success: true,
      message: 'Voice search processing - coming soon!',
      textQuery: 'Voice search will convert your speech to text here',
      nextStep: 'Use the text query for smart search',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Voice search error:', error);
    res.status(500).json({
      success: false,
      error: 'Voice search temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Search suggestions and autocomplete
router.get('/search-suggestions', async (req: Request, res: Response) => {
  try {
    const { q: query, limit = 10, userId } = req.query;

    if (!query || typeof query !== 'string') {
      return res.json({
        success: true,
        suggestions: [
          'assisted living near me',
          'memory care communities',
          'independent living apartments',
          'skilled nursing facilities',
          'senior living with pets allowed'
        ]
      });
    }

    // Generate dynamic suggestions based on the query
    const baseSuggestions = [
      `${query} near me`,
      `${query} with dining services`,
      `${query} under $5000`,
      `${query} with memory care`,
      `affordable ${query}`,
      `luxury ${query}`,
      `${query} with transportation`,
      `${query} accepting medicaid`
    ];

    const suggestions = baseSuggestions
      .slice(0, parseInt(limit as string))
      .filter(s => s.toLowerCase().includes(query.toLowerCase()));

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Search suggestions temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Search analytics for authenticated users
router.get('/search-history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        success: false
      });
    }

    // Mock search history - in production this would query the database
    const mockHistory = [
      {
        query: 'assisted living in California',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        resultCount: 45,
        searchType: 'smart_search'
      },
      {
        query: 'memory care near San Francisco',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        resultCount: 23,
        searchType: 'smart_search'
      },
      {
        query: 'independent living apartments under $4000',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        resultCount: 31,
        searchType: 'smart_search'
      }
    ];

    res.json({
      success: true,
      data: {
        searchHistory: mockHistory.slice(0, parseInt(limit as string)),
        totalSearches: mockHistory.length,
        mostRecentSearch: mockHistory[0]?.timestamp
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({
      success: false,
      error: 'Search history temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Search trends and popular queries
router.get('/search-trends', async (req: Request, res: Response) => {
  try {
    const trendingSearches = [
      {
        query: 'memory care communities',
        searchCount: 1247,
        trend: 'up',
        percentage: 15.3
      },
      {
        query: 'assisted living near me',
        searchCount: 2156,
        trend: 'stable',
        percentage: 2.1
      },
      {
        query: 'independent living apartments',
        searchCount: 987,
        trend: 'up',
        percentage: 8.7
      },
      {
        query: 'skilled nursing facilities',
        searchCount: 654,
        trend: 'down',
        percentage: -3.2
      },
      {
        query: 'senior living with pets',
        searchCount: 432,
        trend: 'up',
        percentage: 22.4
      }
    ];

    const locationTrends = [
      { location: 'California', searches: 3421, trend: 'up' },
      { location: 'Florida', searches: 2987, trend: 'stable' },
      { location: 'Texas', searches: 2654, trend: 'up' },
      { location: 'New York', searches: 1876, trend: 'down' },
      { location: 'Pennsylvania', searches: 1543, trend: 'stable' }
    ];

    res.json({
      success: true,
      data: {
        trendingSearches,
        locationTrends,
        period: 'last_30_days',
        totalSearches: 12547
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Search trends temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;