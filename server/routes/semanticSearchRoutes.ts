import { Express } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { sql, ilike, or, and, gte, lte } from 'drizzle-orm';
import { PerplexityAIService } from '../perplexity-ai-service';

const perplexityService = new PerplexityAIService();

export function registerSemanticSearchRoutes(app: Express) {
  /**
   * Semantic Search Endpoint - Understands natural language queries
   * Examples:
   * - "I need memory care for mom near Baptist hospital in Dallas" 
   * - "Affordable senior housing for veterans in Phoenix"
   * - "Safe place for dad who wanders at night under $4000"
   */
  app.post('/api/semantic/search', async (req, res) => {
    try {
      const { 
        query, 
        filters = {},
        searchType = 'hybrid',
        limit = 20,
        includeRAG = false
      } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Query is required',
          examples: [
            "Memory care near hospital in Dallas",
            "Affordable housing for veterans",
            "Safe community for wandering"
          ]
        });
      }

      console.log(`🧠 Semantic Search: "${query}" (type: ${searchType})`);

      // Parse query for search terms
      const queryInsights = analyzeQuery(query);
      
      // Build database search conditions
      const conditions: any[] = [];
      const lowerQuery = query.toLowerCase();
      
      // Location search
      if (queryInsights.criteria.location) {
        const loc = queryInsights.criteria.location;
        conditions.push(
          or(
            ilike(communities.city, `%${loc}%`),
            ilike(communities.state, `%${loc}%`)
          )
        );
      }
      
      // Care type search
      if (queryInsights.criteria.careTypes && queryInsights.criteria.careTypes.length > 0) {
        const careTypeConditions = queryInsights.criteria.careTypes.map((ct: string) =>
          ilike(communities.careTypes, `%${ct}%`)
        );
        if (careTypeConditions.length > 0) {
          conditions.push(or(...careTypeConditions));
        }
      }
      
      // Price filter
      if (queryInsights.criteria.priceMax) {
        conditions.push(lte(communities.rentPerMonth, String(queryInsights.criteria.priceMax)));
      }
      
      // Text search across multiple fields
      const searchTerms = query.split(' ').filter((t: string) => t.length > 2);
      if (searchTerms.length > 0 && conditions.length === 0) {
        const textConditions = searchTerms.slice(0, 3).map((term: string) =>
          or(
            ilike(communities.name, `%${term}%`),
            ilike(communities.city, `%${term}%`),
            ilike(communities.state, `%${term}%`),
            ilike(communities.description, `%${term}%`)
          )
        );
        if (textConditions.length > 0) {
          conditions.push(or(...textConditions));
        }
      }

      // Execute database search
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const dbResults = await db
        .select()
        .from(communities)
        .where(whereClause)
        .limit(limit);

      // Add semantic-like scoring based on query matching
      const enhancedResults = dbResults.map(community => {
        let score = 0.5;
        const nameLower = community.name.toLowerCase();
        const cityLower = (community.city || '').toLowerCase();
        
        // Boost score for matches
        if (lowerQuery.includes(cityLower) || cityLower.includes(lowerQuery.split(' ')[0])) {
          score += 0.3;
        }
        if (queryInsights.criteria.careTypes?.some((ct: string) => 
          community.careTypes?.includes(ct)
        )) {
          score += 0.2;
        }
        
        return {
          ...community,
          semanticScore: score,
          matchExplanation: `Matched based on ${conditions.length > 0 ? 'query criteria' : 'text search'}`,
          relevance: {}
        };
      });

      // Sort by score
      enhancedResults.sort((a, b) => b.semanticScore - a.semanticScore);

      return res.json({
        success: true,
        query,
        searchType: 'database',
        totalResults: enhancedResults.length,
        communities: enhancedResults,
        queryInsights,
        semanticUnderstanding: {
          detectedIntent: queryInsights.intent,
          extractedCriteria: queryInsights.criteria,
          suggestedFilters: queryInsights.suggestedFilters
        }
      });

    } catch (error: any) {
      console.error('Semantic search error:', error);
      return res.status(500).json({ 
        error: 'Search failed',
        message: error.message 
      });
    }
  });

  /**
   * Get semantic search status
   */
  app.get('/api/semantic/status', async (req, res) => {
    try {
      return res.json({
        success: true,
        status: 'active',
        searchEngine: 'database',
        features: {
          semanticSearch: true,
          hybridSearch: false,
          ragGeneration: false
        }
      });
    } catch (error: any) {
      console.error('Status check error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Analyze query to extract intent and criteria
 */
function analyzeQuery(query: string): any {
  const lowerQuery = query.toLowerCase();
  
  // Extract location
  const locationMatch = lowerQuery.match(/(?:in|near|around|at)\s+([a-zA-Z\s]+?)(?:,|\s+(?:with|under|for|and)|$)/i);
  const stateMatch = lowerQuery.match(/\b([A-Z]{2})\b/);
  
  // Extract care types
  const careTypes: string[] = [];
  if (lowerQuery.includes('memory') || lowerQuery.includes('alzheimer') || lowerQuery.includes('dementia')) {
    careTypes.push('memory-care');
  }
  if (lowerQuery.includes('assisted')) {
    careTypes.push('assisted-living');
  }
  if (lowerQuery.includes('independent')) {
    careTypes.push('independent-living');
  }
  if (lowerQuery.includes('nursing') || lowerQuery.includes('skilled')) {
    careTypes.push('skilled-nursing');
  }
  if (lowerQuery.includes('hud') || lowerQuery.includes('subsidized')) {
    careTypes.push('hud-sponsored');
  }
  
  // Extract price
  const priceMatch = lowerQuery.match(/(?:under|less than|below|max)\s*\$?\s*(\d{1,5}(?:,\d{3})*)/);
  const priceMax = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;
  
  // Determine intent
  let intent = 'general_search';
  if (careTypes.length > 0) intent = 'care_type_search';
  if (locationMatch) intent = 'location_search';
  if (priceMax) intent = 'budget_search';
  
  return {
    intent,
    criteria: {
      location: locationMatch?.[1]?.trim() || stateMatch?.[1] || null,
      careTypes,
      priceMax
    },
    suggestedFilters: {
      location: locationMatch?.[1]?.trim(),
      careTypes: careTypes.length > 0 ? careTypes : undefined,
      maxPrice: priceMax
    }
  };
}
