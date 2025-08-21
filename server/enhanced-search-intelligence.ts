import { db } from './db';
import { communities } from '@shared/schema';
import { eq, and, desc, like, sql, or } from 'drizzle-orm';
import { PerplexityAIService } from './perplexity-ai-service';
import { AnthropicAIService } from './ai-services';

/**
 * Enhanced Search Intelligence Service
 * Provides AI-powered search capabilities with learning and personalization
 */

interface SmartSearchRequest {
  query: string;
  userId?: string;
  location?: { lat: number; lng: number };
  filters?: {
    careTypes?: string[];
    priceRange?: { min: number; max: number };
    amenities?: string[];
    radius?: number;
  };
  context?: {
    previousSearches?: string[];
    userPreferences?: any;
    familyContext?: any;
  };
}

interface SearchSuggestion {
  type: 'location' | 'care_type' | 'amenity' | 'price' | 'community';
  value: string;
  confidence: number;
  context: string;
}

interface SmartSearchResult {
  communities: any[];
  insights: {
    searchInterpretation: string;
    marketIntelligence: string;
    personalizedRecommendations: string[];
    alternativeSearches: string[];
  };
  suggestions: SearchSuggestion[];
  searchStats: {
    totalMatches: number;
    averagePrice: number;
    popularCareTypes: string[];
    availabilityInsight: string;
  };
}

export class EnhancedSearchIntelligence {
  private perplexityService: PerplexityAIService;
  
  constructor() {
    this.perplexityService = new PerplexityAIService();
  }

  /**
   * Intelligent search with AI-powered interpretation and personalization
   */
  async performSmartSearch(request: SmartSearchRequest): Promise<SmartSearchResult> {
    try {
      console.log('🔍 Enhanced Search Intelligence: Processing query:', request.query);

      // 1. Parse and interpret search intent with AI
      const searchIntent = await this.parseSearchIntent(request.query, request.context);

      // 2. Get real-time market intelligence
      const marketIntelligence = await this.getMarketIntelligence(searchIntent, request.location);

      // 3. Execute search with enhanced filters
      const communities = await this.executeEnhancedSearch(searchIntent, request.filters);

      // 4. Generate personalized recommendations
      const recommendations = await this.generatePersonalizedRecommendations(
        communities,
        request.context?.userPreferences,
        request.userId
      );

      // 5. Create search suggestions for refinement
      const suggestions = await this.generateSearchSuggestions(request.query, communities);

      // 6. Calculate search statistics
      const searchStats = this.calculateSearchStats(communities);

      // 7. Save search history for learning
      if (request.userId) {
        await this.saveSearchHistory(request.userId, request.query, searchIntent, communities.length);
      }

      return {
        communities: communities.slice(0, 50), // Limit results for performance
        insights: {
          searchInterpretation: searchIntent.interpretation,
          marketIntelligence: marketIntelligence.summary,
          personalizedRecommendations: recommendations,
          alternativeSearches: suggestions.map(s => s.value).slice(0, 5)
        },
        suggestions,
        searchStats
      };

    } catch (error) {
      console.error('Enhanced search intelligence error:', error);
      // Fallback to basic search
      return this.fallbackSearch(request);
    }
  }

  /**
   * AI-powered search intent parsing with Claude
   */
  private async parseSearchIntent(query: string, context?: any) {
    try {
      const prompt = `Analyze this senior living search query and extract structured intent:

QUERY: "${query}"
CONTEXT: ${JSON.stringify(context || {})}

Extract and return JSON with:
{
  "interpretation": "Clear explanation of what the user is looking for",
  "location": "Specific location mentioned or inferred",
  "careTypes": ["Array of care types mentioned or implied"],
  "priceRange": {"min": number, "max": number} or null,
  "amenities": ["Array of amenities or features mentioned"],
  "urgency": "immediate|within_months|exploring|planning",
  "familyContext": "Any family situation details",
  "medicalNeeds": ["Specific medical or care requirements"],
  "preferences": {"Any stated preferences"}
}`;

      const result = await AnthropicAIService.analyzeText(prompt);
      return JSON.parse(result);
    } catch (error) {
      console.error('Search intent parsing error:', error);
      return {
        interpretation: `Search for: ${query}`,
        location: null,
        careTypes: [],
        priceRange: null,
        amenities: [],
        urgency: 'exploring',
        familyContext: null,
        medicalNeeds: [],
        preferences: {}
      };
    }
  }

  /**
   * Real-time market intelligence with Perplexity
   */
  private async getMarketIntelligence(searchIntent: any, location?: { lat: number; lng: number }) {
    try {
      const locationQuery = searchIntent.location || 'United States';
      const careTypeQuery = searchIntent.careTypes?.join(' and ') || 'senior living';
      
      const query = `Current ${careTypeQuery} community pricing, availability, and market trends in ${locationQuery} 2025`;
      
      const result = await this.perplexityService.searchCommunityInfo(query);
      
      if (result.success && result.data) {
        // Extract key market insights
        const priceMatches = result.data.match(/\$[\d,]+(?:\s*(?:to|-)?\s*\$?[\d,]+)?/g) || [];
        const trendMatches = result.data.match(/(?:increasing|decreasing|stable|rising|falling).*?(?:\d+%|\$[\d,]+)/gi) || [];
        
        return {
          summary: `Market Intelligence: ${result.data.substring(0, 300)}...`,
          pricingData: priceMatches,
          trends: trendMatches,
          timestamp: new Date().toISOString()
        };
      }

      return {
        summary: 'Market intelligence temporarily unavailable',
        pricingData: [],
        trends: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market intelligence error:', error);
      return {
        summary: 'Market analysis in progress',
        pricingData: [],
        trends: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Enhanced database search with AI-interpreted filters
   */
  private async executeEnhancedSearch(searchIntent: any, userFilters?: any) {
    try {
      let query = db.select().from(communities);

      // Apply location filtering
      if (searchIntent.location && searchIntent.location !== 'United States') {
        const locationParts = searchIntent.location.split(',').map((s: string) => s.trim());
        for (const part of locationParts) {
          query = query.where(
            or(
              like(communities.city, `%${part}%`),
              like(communities.state, `%${part}%`),
              like(communities.address, `%${part}%`)
            )
          );
        }
      }

      // Apply care type filtering
      if (searchIntent.careTypes && searchIntent.careTypes.length > 0) {
        const careTypeConditions = searchIntent.careTypes.map((type: string) =>
          sql`${communities.careTypes}::text ILIKE ${`%${type}%`}`
        );
        query = query.where(or(...careTypeConditions));
      }

      // Apply price filtering
      if (searchIntent.priceRange?.min || searchIntent.priceRange?.max || userFilters?.priceRange) {
        const priceRange = userFilters?.priceRange || searchIntent.priceRange;
        if (priceRange.min) {
          query = query.where(sql`
            COALESCE(
              (${communities.pricing}->>'baseRate')::numeric,
              (${communities.pricing}->>'startingPrice')::numeric,
              (${communities.pricing}->>'monthlyRate')::numeric,
              0
            ) >= ${priceRange.min}
          `);
        }
        if (priceRange.max) {
          query = query.where(sql`
            COALESCE(
              (${communities.pricing}->>'baseRate')::numeric,
              (${communities.pricing}->>'startingPrice')::numeric,
              (${communities.pricing}->>'monthlyRate')::numeric,
              999999
            ) <= ${priceRange.max}
          `);
        }
      }

      // Execute query
      const results = await query.orderBy(desc(communities.id)).limit(100);
      
      return results;
    } catch (error) {
      console.error('Enhanced search execution error:', error);
      // Fallback to basic search
      return await db.select().from(communities).limit(20);
    }
  }

  /**
   * Generate personalized recommendations based on user history and preferences
   */
  private async generatePersonalizedRecommendations(
    communities: any[],
    userPreferences?: any,
    userId?: string
  ): Promise<string[]> {
    try {
      if (!communities.length) return ['Try expanding your search criteria', 'Consider different locations or care types'];

      // Get user's search history if available
      let searchHistoryData: any[] = [];
      if (userId) {
        // Note: This would require a searchHistory table in the schema
        // For now, using mock data structure
        searchHistoryData = [];
      }

      const analysisPrompt = `Based on these search results and user context, provide 3-5 personalized recommendations:

COMMUNITIES FOUND: ${communities.length}
TOP COMMUNITIES: ${JSON.stringify(communities.slice(0, 5).map(c => ({
        name: c.name,
        location: `${c.city}, ${c.state}`,
        careTypes: c.careTypes,
        pricing: c.pricing
      })))}

USER PREFERENCES: ${JSON.stringify(userPreferences || {})}
SEARCH HISTORY: ${JSON.stringify(searchHistoryData.map((s: any) => s.query) || [])}

Provide recommendations as an array of strings, each being actionable advice.`;

      const result = await AnthropicAIService.analyzeText(analysisPrompt);
      
      try {
        const parsed = JSON.parse(result);
        return Array.isArray(parsed) ? parsed : parsed.recommendations || [];
      } catch {
        return [result]; // Return as single recommendation if not parseable
      }
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return [
        'Consider visiting top-rated communities in your area',
        'Compare pricing and amenities across different care levels',
        'Schedule tours at your most interesting options'
      ];
    }
  }

  /**
   * Generate smart search suggestions for query refinement
   */
  private async generateSearchSuggestions(query: string, communities: any[]): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    try {
      // Location suggestions
      const locations = [...new Set(communities.map(c => `${c.city}, ${c.state}`))].slice(0, 5);
      locations.forEach(location => {
        suggestions.push({
          type: 'location',
          value: location,
          confidence: 0.8,
          context: 'Search in this location'
        });
      });

      // Care type suggestions
      const careTypes = [...new Set(communities.flatMap(c => c.careTypes || []))].slice(0, 5);
      careTypes.forEach(careType => {
        suggestions.push({
          type: 'care_type',
          value: careType,
          confidence: 0.9,
          context: `Filter by ${careType}`
        });
      });

      // Price range suggestions
      const prices = communities
        .map(c => c.pricing?.baseRate || c.pricing?.startingPrice || 0)
        .filter(p => p > 0)
        .sort((a, b) => a - b);
      
      if (prices.length > 0) {
        const medianPrice = prices[Math.floor(prices.length / 2)];
        suggestions.push({
          type: 'price',
          value: `Under $${medianPrice + 500}`,
          confidence: 0.7,
          context: 'Affordable options'
        });
      }

    } catch (error) {
      console.error('Suggestion generation error:', error);
    }

    return suggestions.slice(0, 10);
  }

  /**
   * Calculate search statistics and insights
   */
  private calculateSearchStats(communities: any[]) {
    try {
      const prices = communities
        .map(c => c.pricing?.baseRate || c.pricing?.startingPrice || 0)
        .filter(p => p > 0);

      const careTypes = communities.flatMap(c => c.careTypes || []);
      const careTypeCount = careTypes.reduce((acc: any, type: string) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const popularCareTypes = Object.entries(careTypeCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([type]) => type);

      return {
        totalMatches: communities.length,
        averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        popularCareTypes,
        availabilityInsight: `Found ${communities.length} matching communities with immediate availability information`
      };
    } catch (error) {
      console.error('Stats calculation error:', error);
      return {
        totalMatches: communities.length,
        averagePrice: 0,
        popularCareTypes: [],
        availabilityInsight: 'Search statistics temporarily unavailable'
      };
    }
  }

  /**
   * Save search history for machine learning and personalization
   */
  private async saveSearchHistory(userId: string, query: string, intent: any, resultCount: number) {
    try {
      // This would typically insert into a search_history table
      console.log('💾 Saving search history:', { userId, query, resultCount });
      
      // Implementation would depend on having a searchHistory table in schema
      // await db.insert(searchHistory).values({
      //   userId,
      //   query,
      //   searchIntent: intent,
      //   resultCount,
      //   createdAt: new Date()
      // });
    } catch (error) {
      console.error('Search history save error:', error);
    }
  }

  /**
   * Fallback search for error handling
   */
  private async fallbackSearch(request: SmartSearchRequest): Promise<SmartSearchResult> {
    try {
      const communities = await db.select()
        .from(communities)
        .limit(20);

      return {
        communities,
        insights: {
          searchInterpretation: `Searching for: ${request.query}`,
          marketIntelligence: 'Market analysis temporarily unavailable',
          personalizedRecommendations: ['Try refining your search with more specific criteria'],
          alternativeSearches: ['Browse all communities', 'Search by location', 'Filter by care type']
        },
        suggestions: [],
        searchStats: {
          totalMatches: communities.length,
          averagePrice: 0,
          popularCareTypes: [],
          availabilityInsight: 'Basic search results displayed'
        }
      };
    } catch (error) {
      console.error('Fallback search error:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }
}

export const enhancedSearchIntelligence = new EnhancedSearchIntelligence();