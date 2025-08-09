import { Express } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { enhancedWeaviateService } from '../enhanced-weaviate-service';

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
        searchType = 'hybrid', // 'semantic', 'hybrid', or 'keyword'
        limit = 20,
        includeRAG = false // Include AI-generated recommendations
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

      // Use Weaviate's enhanced semantic search
      const searchResults = await enhancedWeaviateService.enhancedSemanticSearch({
        query,
        limit,
        filters,
        searchType,
        alpha: searchType === 'hybrid' ? 0.75 : undefined,
        minScore: 0.6
      });

      // If semantic search returns results, enhance them with database data
      if (searchResults && searchResults.length > 0) {
        const communityIds = searchResults.map(r => r.community.id);
        
        // Fetch full community data from database
        const fullCommunities = await db
          .select()
          .from(communities)
          .where(sql`${communities.id} = ANY(${communityIds})`);

        // Merge semantic search scores with full data
        const enhancedResults = fullCommunities.map(community => {
          const semanticResult = searchResults.find(r => r.community.id === community.id);
          return {
            ...community,
            semanticScore: semanticResult?.score || 0,
            matchExplanation: semanticResult?.explanation || '',
            relevance: semanticResult?.relevance || {}
          };
        });

        // Sort by semantic score
        enhancedResults.sort((a, b) => b.semanticScore - a.semanticScore);

        // Generate RAG recommendations if requested
        let ragRecommendations = null;
        if (includeRAG) {
          try {
            ragRecommendations = await enhancedWeaviateService.generateRAGRecommendations(
              query,
              undefined, // User profile - could be passed from frontend
              5
            );
          } catch (ragError) {
            console.error('RAG generation failed:', ragError);
          }
        }

        // Analyze the query to provide insights
        const queryInsights = analyzeQuery(query);

        return res.json({
          success: true,
          query,
          searchType,
          totalResults: enhancedResults.length,
          communities: enhancedResults,
          queryInsights,
          ragRecommendations,
          semanticUnderstanding: {
            detectedIntent: queryInsights.intent,
            extractedCriteria: queryInsights.criteria,
            suggestedFilters: queryInsights.suggestedFilters
          }
        });
      }

      // Fallback to database search if semantic search returns no results
      console.log('⚠️ Semantic search returned no results, falling back to database search');
      
      // Parse location from query
      const locationMatch = query.match(/in\s+([^,]+(?:,\s*\w{2})?)/i);
      const location = locationMatch ? locationMatch[1].trim() : '';

      // Basic database search
      const conditions = [];
      if (location) {
        conditions.push(
          sql`LOWER(${communities.city}) LIKE LOWER(${'%' + location + '%'}) OR 
              LOWER(${communities.state}) LIKE LOWER(${'%' + location + '%'})`
        );
      }

      const dbResults = await db
        .select()
        .from(communities)
        .where(conditions.length > 0 ? sql`${conditions[0]}` : sql`1=1`)
        .limit(limit);

      return res.json({
        success: true,
        query,
        searchType: 'database_fallback',
        totalResults: dbResults.length,
        communities: dbResults,
        queryInsights: analyzeQuery(query),
        semanticUnderstanding: {
          note: 'Semantic search unavailable, showing keyword matches'
        }
      });

    } catch (error) {
      console.error('Semantic search error:', error);
      return res.status(500).json({ 
        error: 'Search failed',
        message: error.message 
      });
    }
  });

  /**
   * Get semantic search suggestions based on partial query
   */
  app.get('/api/semantic/suggestions', async (req, res) => {
    try {
      const { q = '' } = req.query;
      
      if (q.length < 3) {
        return res.json({ suggestions: [] });
      }

      // Generate intelligent suggestions based on common queries
      const suggestions = generateSmartSuggestions(q as string);
      
      return res.json({ suggestions });
    } catch (error) {
      console.error('Suggestion error:', error);
      return res.json({ suggestions: [] });
    }
  });

  /**
   * Test semantic search capabilities
   */
  app.get('/api/semantic/test', async (req, res) => {
    try {
      const isInitialized = await weaviateService.testConnection();
      const status = await weaviateService.getStatus();
      
      return res.json({
        available: isInitialized,
        status,
        capabilities: {
          semanticSearch: true,
          hybridSearch: true,
          ragGeneration: true,
          personalization: true,
          geoFiltering: true
        },
        exampleQueries: [
          "Memory care facility near Mayo Clinic in Rochester",
          "Affordable housing for veterans with wheelchair access",
          "Safe community for someone with dementia who wanders",
          "Pet-friendly independent living under $3000 in warm climate",
          "Skilled nursing near family in Brooklyn with good ratings"
        ]
      });
    } catch (error) {
      return res.json({
        available: false,
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
  
  const intent = {
    isUrgent: /urgent|asap|immediately|emergency|quickly/i.test(query),
    isAffordability: /affordable|cheap|budget|low cost|economical/i.test(query),
    isSafety: /safe|secure|wander|exit|locked/i.test(query),
    isQuality: /best|top|rated|quality|premium|excellent/i.test(query),
    isProximity: /near|close|nearby|walking distance|next to/i.test(query),
    isSpecialized: /memory|dementia|alzheimer|parkinson|stroke/i.test(query),
    isVeteran: /veteran|va|military|service/i.test(query),
    isAccessibility: /wheelchair|accessible|disability|mobility/i.test(query)
  };

  const criteria = {
    careTypes: [],
    amenities: [],
    budget: null,
    location: null,
    specialNeeds: []
  };

  // Extract care types
  if (/memory care|dementia|alzheimer/i.test(query)) {
    criteria.careTypes.push('Memory Care');
    criteria.specialNeeds.push('Dementia Support');
  }
  if (/assisted living/i.test(query)) {
    criteria.careTypes.push('Assisted Living');
  }
  if (/independent|retirement/i.test(query)) {
    criteria.careTypes.push('Independent Living');
  }
  if (/skilled nursing|nursing home/i.test(query)) {
    criteria.careTypes.push('Skilled Nursing');
  }
  if (/hospice|palliative/i.test(query)) {
    criteria.careTypes.push('Hospice Care');
  }

  // Extract amenities
  if (/pet|dog|cat/i.test(query)) {
    criteria.amenities.push('Pet Friendly');
  }
  if (/pool|swim/i.test(query)) {
    criteria.amenities.push('Swimming Pool');
  }
  if (/gym|fitness|exercise/i.test(query)) {
    criteria.amenities.push('Fitness Center');
  }

  // Extract budget
  const priceMatch = query.match(/\$?([\d,]+)/);
  if (priceMatch) {
    criteria.budget = parseInt(priceMatch[1].replace(',', ''));
  }

  // Extract location
  const locationPatterns = [
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/,
    /near\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})(?:\s|$)/
  ];

  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match) {
      criteria.location = match[1];
      break;
    }
  }

  // Generate suggested filters based on intent
  const suggestedFilters = [];
  if (intent.isAffordability) {
    suggestedFilters.push({ type: 'budget', value: 'Under $3000' });
  }
  if (intent.isSafety) {
    suggestedFilters.push({ type: 'feature', value: 'Secure Memory Unit' });
  }
  if (intent.isVeteran) {
    suggestedFilters.push({ type: 'program', value: 'VA Benefits Accepted' });
  }

  return {
    intent,
    criteria,
    suggestedFilters,
    queryComplexity: Object.values(intent).filter(v => v).length
  };
}

/**
 * Generate smart suggestions based on partial input
 */
function generateSmartSuggestions(partial: string): string[] {
  const suggestions = [];
  const lower = partial.toLowerCase();

  // Location-based suggestions
  if (lower.includes('near') || lower.includes('in')) {
    suggestions.push(
      `${partial} Mayo Clinic`,
      `${partial} Baptist Hospital`,
      `${partial} downtown`,
      `${partial} medical district`
    );
  }

  // Care type suggestions
  if (lower.includes('memory') || lower.includes('dem')) {
    suggestions.push(
      'Memory care for wandering',
      'Memory care with secure unit',
      'Dementia care near family'
    );
  }

  // Budget suggestions
  if (lower.includes('afford') || lower.includes('cheap')) {
    suggestions.push(
      'Affordable senior housing under $2000',
      'Affordable assisted living with Medicaid',
      'Affordable HUD housing for seniors'
    );
  }

  // Special needs suggestions
  if (lower.includes('wheel') || lower.includes('access')) {
    suggestions.push(
      'Wheelchair accessible communities',
      'Accessible housing with ramps',
      'Disability-friendly senior living'
    );
  }

  return suggestions.slice(0, 5);
}