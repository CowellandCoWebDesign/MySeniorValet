/**
 * COMPREHENSIVE SEARCH API ROUTES
 * Zillow-level search functionality for MySeniorValet
 */

import { Router } from 'express';
import { comprehensiveSearchEngine, SearchFilters } from '../services/comprehensive-search-engine';
import { cache } from '../cache';
import fetch from 'node-fetch';

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
      limit = 1000, 
      offset = 0 
    } = req.body;
    
    // NORMAL DATABASE SEARCH ONLY - No global discovery here
    // Global discovery is reserved for the dedicated "🌍 Discovery mode" button
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
      limit = '1000', 
      offset = '0' 
    } = req.query;
    
    const filters: SearchFilters = {};
    
    if (state) filters.state = state as string;
    if (city) filters.city = city as string;
    if (careTypes) filters.careTypes = (careTypes as string).split(',');
    if (priceMin) filters.priceMin = parseInt(priceMin as string);
    if (priceMax) filters.priceMax = parseInt(priceMax as string);
    if (rating) filters.rating = parseFloat(rating as string);
    
    // NORMAL DATABASE SEARCH ONLY - No global discovery here
    // Global discovery is reserved for the dedicated "🌍 Discovery mode" button
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
  
  // REAL DATABASE-DRIVEN SUGGESTIONS - NO HARDCODED OPTIONS
  
  try {
    const { db } = await import('../db');
    const { communities } = await import('@shared/schema');
    const { ilike, sql, or, and, ne } = await import('drizzle-orm');
    
    // 1. EXACT & PREFIX COMMUNITY NAME MATCHES (highest priority)
    const exactMatches = await db
      .select({
        name: communities.name,
        city: communities.city,
        state: communities.state,
        communitySubtype: communities.communitySubtype
      })
      .from(communities)
      .where(
        ilike(communities.name, `${normalizedQuery}%`)  // Starts with (highest priority)
      )
      .orderBy(sql`LENGTH(${communities.name})`)  // Shorter names first (more likely exact matches)
      .limit(5);
    
    exactMatches.forEach(community => {
      // Add the full community name
      if (!suggestions.includes(community.name)) {
        suggestions.push(community.name);
      }
    });
    
    // 2. CONTAINS MATCHES (if we don't have enough exact matches)
    if (suggestions.length < 5) {
      const containsMatches = await db
        .select({
          name: communities.name,
          city: communities.city,
          state: communities.state
        })
        .from(communities)
        .where(
          and(
            ilike(communities.name, `%${normalizedQuery}%`),  // Contains
            // Exclude already found exact matches
            ...(exactMatches.length > 0 ? [
              ne(communities.name, sql`ANY(ARRAY[${sql.join(exactMatches.map(m => sql`${m.name}`), sql`, `)}])`)
            ] : [])
          )
        )
        .orderBy(sql`LENGTH(${communities.name})`)  // Prefer shorter, more relevant names
        .limit(5 - suggestions.length);
      
      containsMatches.forEach(community => {
        if (!suggestions.includes(community.name)) {
          suggestions.push(community.name);
        }
      });
    }
    
    // 3. CITY MATCHES (only if we still need more suggestions)
    if (suggestions.length < 8) {
      const cityMatches = await db
        .select({
          city: communities.city,
          state: communities.state,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          ilike(communities.city, `${normalizedQuery}%`)   // Starts with only for cities
        )
        .groupBy(communities.city, communities.state)
        .orderBy(sql`count DESC`)
        .limit(3);
      
      cityMatches.forEach(city => {
        const cityStr = `${city.city}, ${city.state}`;
        if (!suggestions.includes(cityStr)) {
          suggestions.push(cityStr);
        }
      });
    }
    
    // 4. STATE MATCHES (only if we still need more suggestions)
    if (suggestions.length < 10 && normalizedQuery.length >= 2) {
      const stateMatches = await db
        .select({
          state: communities.state,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          ilike(communities.state, `${normalizedQuery}%`)  // Only prefix match for states
        )
        .groupBy(communities.state)
        .orderBy(sql`count DESC`)
        .limit(2);
      
      stateMatches.forEach(state => {
        if (!suggestions.includes(state.state)) {
          suggestions.push(state.state);
        }
      });
    }
    
    // 5. MANAGEMENT COMPANY MATCHES (for company-specific searches)
    if (suggestions.length < 10) {
      const companyMatches = await db
        .select({
          managementCompany: communities.managementCompany,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          and(
            ilike(communities.managementCompany, `${normalizedQuery}%`),
            sql`${communities.managementCompany} IS NOT NULL`,
            sql`${communities.managementCompany} != ''`
          )
        )
        .groupBy(communities.managementCompany)
        .orderBy(sql`count DESC`)
        .limit(2);
      
      companyMatches.forEach(company => {
        if (company.managementCompany && !suggestions.includes(company.managementCompany)) {
          suggestions.push(company.managementCompany);
        }
      });
    }
    
  } catch (error) {
    console.error('Database suggestion error:', error);
  }
  
  // Remove duplicates and return only unique suggestions
  const uniqueSuggestions = [...new Set(suggestions)];
  
  // Return the suggestions (limit to 10 most relevant)
  return uniqueSuggestions.slice(0, 10);
}

/* REMOVED ALL HARDCODED SUGGESTIONS - Only database-driven results now
  const commonSearches = [
    'Assisted living near me',
    'Memory care facilities', 
    'Senior living under $3000',
    'Independent living communities',
    'Nursing homes with good ratings',
    'Affordable senior housing',
    'Luxury senior communities',
    'Active adult communities 55+',
    'Senior living with amenities',
    'Memory care for Alzheimer\'s',
    'Senior apartments',
    'Continuing care retirement communities',
    // International options
    'Senior living in Canada',
    'Australia aged care facilities',
    'Mexico retirement communities',
    'International senior living',
    'Retirement abroad options'
  ];
  
  // Add common searches that match the query
  commonSearches.forEach(search => {
    if (search.toLowerCase().includes(normalizedQuery) || 
        normalizedQuery.length >= 3 && search.toLowerCase().startsWith(normalizedQuery)) {
      suggestions.push(search);
    }
  });
  
  // 6. LOCATION-BASED COMPLETIONS
  if (normalizedQuery.length >= 2) {
    const isLocationQuery = queryWords.some(word => 
      word.length >= 2 && /^[a-zA-Z]+$/.test(word)
    );
    
    if (isLocationQuery) {
      suggestions.push(
        `Senior living in ${query}`,
        `Assisted living in ${query}`,
        `Memory care in ${query}`,
        `${query} nursing homes`,
        `Best senior communities in ${query}`
      );
    }
  }
  
  // 7. CARE TYPE INTELLIGENCE
  const careTypeMapping = {
    'memory': ['Memory care communities', 'Memory care facilities', 'Alzheimer care facilities'],
    'assisted': ['Assisted living communities', 'Assisted living facilities', 'Assisted living with amenities'],
    'independent': ['Independent living communities', 'Senior apartments', 'Active adult communities 55+'],
    'nursing': ['Nursing homes', 'Skilled nursing facilities', 'Long-term care facilities'],
    'alzheimer': ['Alzheimer care facilities', 'Memory care for Alzheimer\'s', 'Dementia care specialists'],
    'dementia': ['Dementia care facilities', 'Memory care communities', 'Specialized dementia units'],
    'continuing': ['Continuing care retirement communities', 'CCRC communities', 'Life care communities'],
    'active': ['Active adult communities', '55+ communities', 'Senior lifestyle communities'],
    'luxury': ['Luxury senior living', 'Premium senior communities', 'High-end assisted living']
  };
  
  Object.entries(careTypeMapping).forEach(([keyword, suggestionList]) => {
    if (normalizedQuery.includes(keyword)) {
      suggestions.push(...suggestionList.slice(0, 3)); // Limit to top 3 per category
    }
  });
  
  // 9. PRICE-BASED SUGGESTIONS
  const priceKeywords = ['cheap', 'affordable', 'budget', 'expensive', 'luxury', 'premium', 'under'];
  const hasPriceIntent = priceKeywords.some(keyword => normalizedQuery.includes(keyword)) || 
                        normalizedQuery.includes('$');
  
  if (hasPriceIntent || normalizedQuery.includes('cost')) {
    suggestions.push(
      'Senior living under $3000',
      'Senior living under $5000',
      'Affordable assisted living',
      'Budget-friendly memory care',
      'Luxury senior communities',
      'Premium assisted living facilities'
    );
  }
  
  // 8. MAJOR SENIOR LIVING COMPANIES
  const companies = [
    'Atria', 'Brookdale', 'Sunrise', 'Brightview', 'Belmont Village',
    'Vi Living', 'Five Star', 'LCS', 'Capital Senior Living', 'Erickson Living',
    'Holiday Retirement', 'Discovery Senior Living', 'Merrill Gardens', 'Silverado'
  ];
  
  companies.forEach(company => {
    if (company.toLowerCase().startsWith(normalizedQuery) || 
        normalizedQuery.includes(company.toLowerCase())) {
      suggestions.push(
        `${company} communities`,
        `${company} senior living`,
        `${company} locations`
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
  
  // Remove duplicates and apply intelligent ranking
  const uniqueSuggestions = [...new Set(suggestions)];
  
  // SMART RANKING ALGORITHM
  const ranked = uniqueSuggestions.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // 1. Exact match gets highest priority
    if (aLower === normalizedQuery) return -1;
    if (bLower === normalizedQuery) return 1;
    
    // 2. Starts with gets second priority
    const aStartsWith = aLower.startsWith(normalizedQuery);
    const bStartsWith = bLower.startsWith(normalizedQuery);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;
    
    // 3. Community names get priority over generic suggestions
    const aIsGeneric = aLower.includes('senior living') || aLower.includes('assisted living');
    const bIsGeneric = bLower.includes('senior living') || bLower.includes('assisted living');
    if (!aIsGeneric && bIsGeneric) return -1;
    if (!bIsGeneric && aIsGeneric) return 1;
    
    // 4. Shorter suggestions are often better (but not too short)
    if (a.length >= 10 && b.length >= 10) {
      return a.length - b.length;
    }
    
    // 5. Default alphabetical
    return a.localeCompare(b);
  });
  
  return ranked.slice(0, 10); // Return top 10 suggestions
}
*/

/**
 * Search suggestions endpoint
 * Enhanced geographic intelligence for better UX
 */
router.post('/api/search/suggestions', async (req, res) => {
  try {
    const { query = '', category = 'communities' } = req.body;
    
    if (!query || query.trim().length === 0) {
      // Return category-specific default suggestions
      const defaultSuggestions = {
        communities: [
          'assisted living near me',
          'memory care communities',
          'senior living under $5000',
          'affordable senior housing',
          'luxury senior communities'
        ],
        services: [
          'home care services',
          'medical transportation',
          'meal delivery services',
          'housekeeping services',
          'companion care'
        ],
        healthcare: [
          'hospitals near me',
          'urgent care centers',
          'primary care physicians',
          'specialist doctors',
          'rehabilitation centers'
        ],
        resources: [
          'medicare guides',
          'senior living costs',
          'care planning resources',
          'financial assistance programs',
          'legal resources for seniors'
        ]
      };
      
      return res.json({
        success: true,
        suggestions: defaultSuggestions[category as keyof typeof defaultSuggestions] || defaultSuggestions.communities
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