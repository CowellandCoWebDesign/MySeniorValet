/**
 * COMPREHENSIVE SEARCH API ROUTES
 * Zillow-level search functionality for MySeniorValet
 */

import { Router } from 'express';
import { comprehensiveSearchEngine, SearchFilters } from '../services/comprehensive-search-engine';
import { cache } from '../cache';

const router = Router();

/**
 * Main comprehensive search endpoint
 * Handles ALL search types like Zillow
 */
router.post('/api/search/comprehensive', async (req, res) => {
  try {
    const { 
      query = '', 
      filters = {},
      limit = 20, 
      offset = 0 
    } = req.body;
    
    // Execute comprehensive search
    const results = await comprehensiveSearchEngine.search(
      query, 
      filters as SearchFilters,
      { limit, offset }
    );
    
    res.json({
      success: true,
      ...results,
      _version: 'comprehensive_v1',
      _timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Comprehensive search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      _version: 'comprehensive_v1'
    });
  }
});

/**
 * GET version for simple searches
 */
router.get('/api/search/comprehensive', async (req, res) => {
  try {
    const { 
      q: query = '', 
      state,
      city,
      careTypes,
      priceMin,
      priceMax,
      rating,
      limit = '20', 
      offset = '0' 
    } = req.query;
    
    const filters: SearchFilters = {};
    
    if (state) filters.state = state as string;
    if (city) filters.city = city as string;
    if (careTypes) filters.careTypes = (careTypes as string).split(',');
    if (priceMin) filters.priceMin = parseInt(priceMin as string);
    if (priceMax) filters.priceMax = parseInt(priceMax as string);
    if (rating) filters.rating = parseFloat(rating as string);
    
    const results = await comprehensiveSearchEngine.search(
      query as string,
      filters,
      { limit: parseInt(limit as string), offset: parseInt(offset as string) }
    );
    
    res.json({
      success: true,
      ...results,
      _version: 'comprehensive_v1',
      _timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Comprehensive search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Enhanced Search suggestions endpoint with intelligent prediction
 */
router.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q: query = '' } = req.query;
    const queryStr = (query as string).toLowerCase().trim();
    
    // Starter suggestions for empty or very short queries
    if (!queryStr || queryStr.length < 1) {
      return res.json({
        suggestions: [
          'Assisted living near me',
          'Memory care facilities',
          'Independent living communities',
          'Senior living under $3000',
          'Nursing homes with high ratings',
          'Active adult communities 55+',
          'Dementia care specialists',
          'Senior housing with amenities'
        ]
      });
    }
    
    // Generate fresh suggestions for better user experience
    // Temporarily disable cache for immediate improvement
    // const cacheKey = `enhanced_suggestions:${queryStr}`;
    // const cached = await cache.get(cacheKey);
    // if (cached) {
    //   return res.json(JSON.parse(cached));
    // }
    
    // Generate intelligent suggestions
    const suggestions = await generateSearchSuggestions(queryStr);
    const response = { suggestions };
    
    // Cache for 2 minutes for performance
    const cacheKey = `enhanced_suggestions:${queryStr}`;
    await cache.set(cacheKey, JSON.stringify(response), 120);
    res.json(response);
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

async function generateSearchSuggestions(query: string): Promise<string[]> {
  const suggestions: string[] = [];
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  
  // INTELLIGENT DATABASE-DRIVEN SUGGESTIONS
  
  // 1. REAL CITY MATCHES (from actual data)
  try {
    const { db } = await import('../db');
    const { communities } = await import('@shared/schema');
    const { ilike, sql } = await import('drizzle-orm');
    
    // Get actual cities that match the query
    const cityMatches = await db
      .selectDistinct({
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)::int`.as('count')
      })
      .from(communities)
      .where(ilike(communities.city, `${normalizedQuery}%`))
      .groupBy(communities.city, communities.state)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);
    
    cityMatches.forEach(city => {
      suggestions.push(
        `${city.city}, ${city.state}`,
        `Assisted living in ${city.city}`,
        `Memory care ${city.city}`,
        `Senior living ${city.city} under $5000`
      );
    });
    
    // 2. REAL COMMUNITY NAME MATCHES
    const communityMatches = await db
      .select({
        name: communities.name,
        city: communities.city,
        state: communities.state
      })
      .from(communities)
      .where(ilike(communities.name, `${normalizedQuery}%`))
      .limit(5);
    
    communityMatches.forEach(community => {
      suggestions.push(community.name);
    });
    
  } catch (error) {
    console.error('Database suggestion error:', error);
  }
  
  // 3. SMART CONTEXTUAL SUGGESTIONS
  
  // Location-based intelligence
  const stateAbbreviations = ['CA', 'FL', 'TX', 'NY', 'PA', 'OH', 'IL', 'MI', 'NC', 'GA'];
  const isLocationQuery = queryWords.some(word => 
    word.length >= 3 && /^[a-zA-Z]+$/.test(word) && !['the', 'and', 'for'].includes(word)
  );
  
  if (isLocationQuery) {
    suggestions.push(
      `${query} senior living communities`,
      `Best assisted living in ${query}`,
      `Memory care facilities ${query}`,
      `${query} nursing homes`,
      `Luxury senior living ${query}`,
      `Affordable senior housing ${query}`
    );
  }
  
  // Care type intelligence
  const careTypeMapping = {
    'memory': ['Memory care communities', 'Alzheimer care facilities', 'Dementia care units'],
    'assisted': ['Assisted living communities', 'Assisted living with amenities', 'Assisted living pricing'],
    'independent': ['Independent living communities', 'Active adult communities', 'Senior apartments'],
    'nursing': ['Nursing homes', 'Skilled nursing facilities', 'Long-term care'],
    'alzheimer': ['Alzheimer care facilities', 'Memory care units', 'Dementia care specialists'],
    'dementia': ['Dementia care facilities', 'Memory care communities', 'Specialized dementia units']
  };
  
  Object.entries(careTypeMapping).forEach(([keyword, suggestionList]) => {
    if (normalizedQuery.includes(keyword)) {
      suggestions.push(...suggestionList);
    }
  });
  
  // Price-based intelligence
  const priceKeywords = ['cheap', 'affordable', 'budget', 'expensive', 'luxury', 'premium'];
  const hasPriceIntent = priceKeywords.some(keyword => normalizedQuery.includes(keyword)) || 
                        normalizedQuery.includes('$') || normalizedQuery.includes('under');
  
  if (hasPriceIntent) {
    suggestions.push(
      'Senior living under $3000',
      'Affordable assisted living',
      'Budget memory care',
      'Senior living under $5000',
      'Luxury senior communities',
      'Premium assisted living'
    );
  }
  
  // Company-based intelligence (real senior living companies)
  const companies = [
    'Atria', 'Brookdale', 'Sunrise', 'Brightview', 'Belmont Village',
    'Vi Living', 'Five Star', 'LCS', 'Capital Senior Living', 'Erickson Living'
  ];
  
  companies.forEach(company => {
    if (company.toLowerCase().startsWith(normalizedQuery) || 
        normalizedQuery.includes(company.toLowerCase())) {
      suggestions.push(
        `${company} senior living`,
        `${company} communities`,
        `${company} locations near me`,
        `${company} pricing and amenities`
      );
    }
  });
  
  // 4. QUESTION-BASED SUGGESTIONS (Natural Language)
  const questionWords = ['what', 'how', 'where', 'which', 'best', 'top'];
  const hasQuestionIntent = questionWords.some(word => normalizedQuery.includes(word));
  
  if (hasQuestionIntent || normalizedQuery.includes('?')) {
    suggestions.push(
      'What is the best senior living community?',
      'How much does assisted living cost?',
      'What amenities do senior communities offer?',
      'How do I choose memory care?',
      'Best senior living communities near me'
    );
  }
  
  // 5. INTELLIGENT COMPLETION SUGGESTIONS
  if (normalizedQuery.length >= 2) {
    const completionSuggestions = [
      `${query} near me`,
      `${query} with amenities`,
      `${query} reviews and ratings`,
      `${query} cost and pricing`,
      `${query} availability`
    ];
    suggestions.push(...completionSuggestions);
  }
  
  // Remove duplicates and rank by relevance
  const uniqueSuggestions = [...new Set(suggestions)];
  
  // Smart ranking: prioritize exact matches, then startsWith, then contains
  const ranked = uniqueSuggestions.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // Exact match gets highest priority
    if (aLower === normalizedQuery) return -1;
    if (bLower === normalizedQuery) return 1;
    
    // Starts with gets second priority
    if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
    if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
    
    // Shorter suggestions are often better
    return a.length - b.length;
  });
  
  return ranked.slice(0, 8); // Return top 8 suggestions
}

/**
 * Search suggestions endpoint
 * Enhanced geographic intelligence for better UX
 */
router.post('/api/search/suggestions', async (req, res) => {
  try {
    const { query = '' } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        suggestions: [
          'assisted living near me',
          'memory care communities',
          'senior living under $5000',
          'affordable senior housing',
          'luxury senior communities'
        ]
      });
    }
    
    // Use the enhanced suggestion engine
    const suggestions = await comprehensiveSearchEngine.generateSearchSuggestions(query);
    
    res.json({
      success: true,
      suggestions,
      query,
      _timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions',
      suggestions: []
    });
  }
});

export default router;