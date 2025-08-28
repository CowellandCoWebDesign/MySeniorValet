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
 * Search suggestions endpoint
 */
router.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q: query = '' } = req.query;
    
    if (!query || (query as string).length < 2) {
      return res.json({
        suggestions: [
          'Atria senior living',
          'Brookdale communities',
          'Memory care near me',
          'Assisted living under $3000',
          'Best senior living in California',
          'Independent living Florida'
        ]
      });
    }
    
    // Get suggestions based on partial query
    const cacheKey = `suggestions:${query}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Generate dynamic suggestions
    const suggestions = await generateSearchSuggestions(query as string);
    const response = { suggestions };
    
    await cache.set(cacheKey, JSON.stringify(response), 300); // 5 minutes
    res.json(response);
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

async function generateSearchSuggestions(query: string): Promise<string[]> {
  const suggestions: string[] = [];
  const normalizedQuery = query.toLowerCase().trim();
  
  // Location-based suggestions
  if (normalizedQuery.match(/^[a-zA-Z\s]{2,}$/)) {
    suggestions.push(
      `${query} senior living`,
      `${query} assisted living`,
      `${query} memory care`,
      `Best senior communities in ${query}`,
      `Affordable senior living ${query}`
    );
  }
  
  // Company-based suggestions
  const companies = ['Atria', 'Brookdale', 'Sunrise', 'Brightview'];
  for (const company of companies) {
    if (company.toLowerCase().startsWith(normalizedQuery)) {
      suggestions.push(
        `${company} senior living`,
        `${company} locations`,
        `${company} pricing`,
        `${company} reviews`
      );
    }
  }
  
  // Care type suggestions
  if (normalizedQuery.includes('memory') || normalizedQuery.includes('alzheimer')) {
    suggestions.push(
      'Memory care communities',
      'Alzheimer care facilities',
      'Memory care pricing',
      'Best memory care near me'
    );
  }
  
  if (normalizedQuery.includes('assisted')) {
    suggestions.push(
      'Assisted living communities',
      'Assisted living costs',
      'Assisted living near me',
      'Best assisted living facilities'
    );
  }
  
  // Price-based suggestions
  if (normalizedQuery.includes('cheap') || normalizedQuery.includes('affordable')) {
    suggestions.push(
      'Affordable senior living',
      'Senior living under $3000',
      'Cheap assisted living',
      'Budget senior communities'
    );
  }
  
  return suggestions.slice(0, 8); // Limit to 8 suggestions
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