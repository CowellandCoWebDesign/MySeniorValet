/**
 * Enhanced Search Engine with Industry Best Practices
 * Implements advanced NLP, intent classification, and multi-database federation
 */

import { db } from '../db';
import { communities, services, healthcareProviders } from '@shared/schema';
import { and, or, ilike, gte, lte, eq, sql } from 'drizzle-orm';
import { weaviateService } from './weaviate-service';

// Search Intent Types
interface SearchIntent {
  type: 'location' | 'care_type' | 'price' | 'amenity' | 'question' | 'comparison' | 'general';
  confidence: number;
  extractedEntities: {
    location?: string;
    state?: string;
    city?: string;
    careType?: string;
    priceRange?: { min?: number; max?: number };
    amenities?: string[];
    quality?: boolean;
    availability?: boolean;
  };
  requiresRAG?: boolean;
  searchStrategy: 'vector' | 'keyword' | 'hybrid' | 'rag';
}

// Query Enhancement
class QueryEnhancer {
  private synonyms = {
    'memory care': ['dementia care', 'alzheimer care', 'cognitive care', 'memory support'],
    'assisted living': ['personal care', 'supportive living', 'residential care', 'senior living'],
    'independent living': ['senior apartments', 'retirement community', 'active adult'],
    'nursing home': ['skilled nursing', 'long term care', 'care facility'],
    'cheap': ['affordable', 'budget', 'low cost', 'economical', 'inexpensive'],
    'near': ['close to', 'nearby', 'around', 'in the area of', 'by']
  };
  
  private stateAbbreviations = {
    'TX': 'Texas',
    'CA': 'California',
    'NY': 'New York',
    'FL': 'Florida',
    'PA': 'Pennsylvania',
    'IL': 'Illinois',
    'OH': 'Ohio',
    'GA': 'Georgia',
    'NC': 'North Carolina',
    'MI': 'Michigan'
  };
  
  enhanceQuery(originalQuery: string): string[] {
    const queries = [originalQuery];
    const lowerQuery = originalQuery.toLowerCase();
    
    // Add synonym variations
    Object.entries(this.synonyms).forEach(([term, synonymList]) => {
      if (lowerQuery.includes(term)) {
        synonymList.forEach(synonym => {
          queries.push(originalQuery.replace(new RegExp(term, 'gi'), synonym));
        });
      }
    });
    
    // Expand state abbreviations
    Object.entries(this.stateAbbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');
      if (regex.test(originalQuery)) {
        queries.push(originalQuery.replace(regex, full));
      }
    });
    
    return [...new Set(queries)].slice(0, 5); // Return max 5 variations
  }
  
  generateSuggestions(partialQuery: string): string[] {
    const suggestions = [];
    const lower = partialQuery.toLowerCase();
    
    // Location-based suggestions
    if (lower.length >= 2) {
      // Add state suggestions
      Object.values(this.stateAbbreviations).forEach(state => {
        if (state.toLowerCase().startsWith(lower)) {
          suggestions.push(`${state} assisted living`);
          suggestions.push(`${state} memory care`);
        }
      });
      
      // Add care type completions
      const careTypes = ['assisted living', 'memory care', 'independent living', 'nursing home'];
      careTypes.forEach(type => {
        if (type.startsWith(lower)) {
          suggestions.push(type);
        }
      });
      
      // Add common search patterns
      suggestions.push(`${partialQuery} under $5000`);
      suggestions.push(`${partialQuery} near me`);
      suggestions.push(`${partialQuery} with availability`);
    }
    
    return suggestions.slice(0, 10);
  }
}

// Intent Classification
class IntentClassifier {
  private patterns = {
    location: /\b(in|near|around|at|close to)\s+([A-Z][a-zA-Z\s]+)/,
    state: new RegExp(`\\b(${Object.keys(new QueryEnhancer().stateAbbreviations).join('|')}|${Object.values(new QueryEnhancer().stateAbbreviations).join('|')})\\b`, 'i'),
    priceRange: /\b(under|below|less than|cheaper than|max|maximum)\s+\$?(\d+(?:,\d{3})?)/i,
    priceRangeMinMax: /\$?(\d+(?:,\d{3})?)\s*(?:to|-)\s*\$?(\d+(?:,\d{3})?)/i,
    careType: /\b(memory care|assisted living|independent living|nursing home|skilled nursing|dementia care|alzheimer)/i,
    amenities: /\b(pool|gym|parking|wifi|pet[s]?|garden|library|salon|spa|dining|restaurant)\b/i,
    quality: /\b(best|top|highest rated|premium|luxury|five star|5 star|excellent)\b/i,
    availability: /\b(available|opening|vacancy|immediate|now|today)\b/i,
    comparison: /\b(versus|vs|compare|between|or|difference)\b/i,
    question: /^(what|where|when|who|how|why|is|are|can|does|do you)/i
  };
  
  classifyIntent(query: string): SearchIntent {
    const intent: SearchIntent = {
      type: 'general',
      confidence: 0.5,
      extractedEntities: {},
      requiresRAG: false,
      searchStrategy: 'hybrid'
    };
    
    // Check for question pattern (needs Q&A system)
    if (this.patterns.question.test(query)) {
      intent.type = 'question';
      intent.requiresRAG = true;
      intent.confidence = 0.9;
      intent.searchStrategy = 'rag';
      return intent;
    }
    
    // Check for comparison
    if (this.patterns.comparison.test(query)) {
      intent.type = 'comparison';
      intent.confidence = 0.85;
      intent.searchStrategy = 'hybrid';
    }
    
    // Extract location entities
    const locationMatch = query.match(this.patterns.location);
    if (locationMatch) {
      intent.extractedEntities.location = locationMatch[2].trim();
      intent.type = 'location';
      intent.confidence += 0.2;
    }
    
    // Extract state
    const stateMatch = query.match(this.patterns.state);
    if (stateMatch) {
      intent.extractedEntities.state = stateMatch[0];
      intent.type = 'location';
      intent.confidence += 0.15;
    }
    
    // Extract price constraints
    const priceRangeMatch = query.match(this.patterns.priceRangeMinMax);
    if (priceRangeMatch) {
      intent.extractedEntities.priceRange = {
        min: parseInt(priceRangeMatch[1].replace(/,/g, '')),
        max: parseInt(priceRangeMatch[2].replace(/,/g, ''))
      };
      intent.type = 'price';
      intent.confidence += 0.2;
    } else {
      const priceMatch = query.match(this.patterns.priceRange);
      if (priceMatch) {
        intent.extractedEntities.priceRange = {
          max: parseInt(priceMatch[2].replace(/,/g, ''))
        };
        intent.type = 'price';
        intent.confidence += 0.2;
      }
    }
    
    // Extract care type
    const careTypeMatch = query.match(this.patterns.careType);
    if (careTypeMatch) {
      intent.extractedEntities.careType = careTypeMatch[0].toLowerCase();
      intent.type = 'care_type';
      intent.confidence += 0.2;
    }
    
    // Extract amenities
    const amenityMatches = query.match(new RegExp(this.patterns.amenities, 'gi'));
    if (amenityMatches) {
      intent.extractedEntities.amenities = amenityMatches;
      intent.type = 'amenity';
      intent.confidence += 0.1;
    }
    
    // Check for quality indicators
    if (this.patterns.quality.test(query)) {
      intent.extractedEntities.quality = true;
      intent.confidence += 0.1;
    }
    
    // Check for availability
    if (this.patterns.availability.test(query)) {
      intent.extractedEntities.availability = true;
      intent.confidence += 0.1;
    }
    
    // Determine search strategy
    if (intent.confidence > 0.8 && Object.keys(intent.extractedEntities).length > 2) {
      intent.searchStrategy = 'keyword'; // Specific enough for keyword search
    } else if (intent.type === 'location' || intent.type === 'care_type') {
      intent.searchStrategy = 'hybrid'; // Best of both worlds
    } else {
      intent.searchStrategy = 'vector'; // Semantic understanding needed
    }
    
    // Cap confidence at 1.0
    intent.confidence = Math.min(intent.confidence, 1.0);
    
    return intent;
  }
}

// Result Fusion and Ranking
class ResultFusion {
  fuseResults(
    resultSets: { source: string; results: any[]; weight: number }[]
  ): any[] {
    const fusedMap = new Map<string, any>();
    
    resultSets.forEach(({ source, results, weight }) => {
      results.forEach((result, index) => {
        const id = result.id || `${source}_${index}`;
        const score = (1 / (index + 1)) * weight; // Rank-based scoring
        
        if (fusedMap.has(id)) {
          const existing = fusedMap.get(id);
          existing.score += score;
          existing.sources.push(source);
        } else {
          fusedMap.set(id, {
            ...result,
            score,
            sources: [source]
          });
        }
      });
    });
    
    // Sort by combined score
    return Array.from(fusedMap.values())
      .sort((a, b) => b.score - a.score);
  }
  
  reRankByIntent(results: any[], intent: SearchIntent): any[] {
    return results.map(result => {
      let boost = 1.0;
      
      // Boost based on intent match
      if (intent.extractedEntities.careType && 
          result.careTypes?.toLowerCase().includes(intent.extractedEntities.careType)) {
        boost *= 1.5;
      }
      
      if (intent.extractedEntities.priceRange) {
        const price = parseFloat(result.rentPerMonth || result.priceRangeMin || 0);
        if (price > 0 && price <= (intent.extractedEntities.priceRange.max || Infinity)) {
          boost *= 1.3;
        }
      }
      
      if (intent.extractedEntities.quality && result.overallRating >= 4.0) {
        boost *= 1.2;
      }
      
      return {
        ...result,
        score: (result.score || 1) * boost
      };
    }).sort((a, b) => b.score - a.score);
  }
}

// Main Enhanced Search Engine
export class EnhancedSearchEngine {
  private weaviate: any;
  private queryEnhancer: QueryEnhancer;
  private intentClassifier: IntentClassifier;
  private resultFusion: ResultFusion;
  
  constructor() {
    this.weaviate = weaviateService;
    this.queryEnhancer = new QueryEnhancer();
    this.intentClassifier = new IntentClassifier();
    this.resultFusion = new ResultFusion();
  }
  
  /**
   * Main search method with all enhancements
   */
  async search(query: string, options?: any): Promise<any> {
    console.log(`🔍 Enhanced Search Query: "${query}"`);
    
    // Step 1: Classify intent
    const intent = this.intentClassifier.classifyIntent(query);
    console.log(`📊 Classified Intent:`, intent);
    
    // Step 2: Enhance query
    const enhancedQueries = this.queryEnhancer.enhanceQuery(query);
    console.log(`🔧 Enhanced Queries:`, enhancedQueries);
    
    // Step 3: Execute search based on strategy
    const resultSets = [];
    
    if (intent.searchStrategy === 'hybrid' || intent.searchStrategy === 'vector') {
      const vectorResults = await this.vectorSearch(enhancedQueries[0], intent, options);
      resultSets.push({ source: 'vector', results: vectorResults, weight: 0.5 });
    }
    
    if (intent.searchStrategy === 'hybrid' || intent.searchStrategy === 'keyword') {
      const keywordResults = await this.keywordSearch(query, intent, options);
      resultSets.push({ source: 'keyword', results: keywordResults, weight: 0.3 });
    }
    
    // Always add database search as fallback
    const dbResults = await this.databaseSearch(query, intent, options);
    resultSets.push({ source: 'database', results: dbResults, weight: 0.2 });
    
    // Step 4: Fuse results
    let fusedResults = this.resultFusion.fuseResults(resultSets);
    
    // Step 5: Re-rank based on intent
    fusedResults = this.resultFusion.reRankByIntent(fusedResults, intent);
    
    // Step 6: Generate suggestions
    const suggestions = this.queryEnhancer.generateSuggestions(query);
    
    // Step 7: Generate insights
    const insights = await this.generateInsights(fusedResults, query, intent);
    
    return {
      communities: fusedResults.slice(0, options?.limit || 50),
      totalResults: fusedResults.length,
      searchMetadata: {
        query,
        intent,
        enhancedQueries,
        searchStrategy: intent.searchStrategy,
        processingTime: Date.now() - (options?.startTime || Date.now()),
        confidence: intent.confidence
      },
      suggestions,
      insights
    };
  }
  
  /**
   * Vector/Semantic search using Weaviate
   */
  private async vectorSearch(query: string, intent: SearchIntent, options?: any): Promise<any[]> {
    try {
      // Ensure limit is a number
      const limit = typeof options?.limit === 'number' ? options.limit : 50;
      
      const results = await this.weaviate.semanticSearch(query, {
        limit: limit,
        certainty: 0.7
      });
      
      return results.map((r: any) => ({
        id: r.community?.id || r.id,
        name: r.community?.name || r.name,
        city: r.community?.city || r.city,
        state: r.community?.state || r.state,
        careTypes: r.community?.careTypes || r.careTypes,
        rentPerMonth: r.community?.pricing || r.priceRange,
        ...r.community,
        ...r
      }));
    } catch (error) {
      console.error('Vector search error:', error);
      return [];
    }
  }
  
  /**
   * Keyword search using database
   */
  private async keywordSearch(query: string, intent: SearchIntent, options?: any): Promise<any[]> {
    try {
      const conditions = [];
      
      // Build keyword search conditions
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      if (searchTerms.length > 0) {
        const keywordConditions = searchTerms.map(term => 
          or(
            ilike(communities.name, `%${term}%`),
            ilike(communities.city, `%${term}%`),
            ilike(communities.state, `%${term}%`),
            ilike(communities.description, `%${term}%`),
            ilike(communities.careTypes, `%${term}%`)
          )
        );
        conditions.push(or(...keywordConditions));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const results = await db
        .select()
        .from(communities)
        .where(whereClause)
        .limit(options?.limit || 100);
      
      return results;
    } catch (error) {
      console.error('Keyword search error:', error);
      return [];
    }
  }
  
  /**
   * Database search with intent-based filtering
   */
  private async databaseSearch(query: string, intent: SearchIntent, options?: any): Promise<any[]> {
    try {
      const conditions = [];
      
      // Apply intent-based filters
      if (intent.extractedEntities.state) {
        conditions.push(
          or(
            ilike(communities.state, `%${intent.extractedEntities.state}%`),
            ilike(communities.state, `%${intent.extractedEntities.location}%`)
          )
        );
      }
      
      if (intent.extractedEntities.city) {
        conditions.push(ilike(communities.city, `%${intent.extractedEntities.city}%`));
      }
      
      if (intent.extractedEntities.careType) {
        const careType = intent.extractedEntities.careType;
        conditions.push(
          or(
            ilike(communities.careTypes, `%${careType}%`),
            ilike(communities.description, `%${careType}%`)
          )
        );
      }
      
      // Note: Price filtering with proper type handling
      if (intent.extractedEntities.priceRange) {
        const { min, max } = intent.extractedEntities.priceRange;
        if (max) {
          conditions.push(sql`CAST(${communities.rentPerMonth} AS DECIMAL) <= ${max}`);
        }
        if (min) {
          conditions.push(sql`CAST(${communities.rentPerMonth} AS DECIMAL) >= ${min}`);
        }
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const results = await db
        .select()
        .from(communities)
        .where(whereClause)
        .limit(options?.limit || 100);
      
      return results;
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }
  
  /**
   * Generate insights about search results
   */
  private async generateInsights(communities: any[], query: string, intent: SearchIntent): Promise<any> {
    if (communities.length === 0) return null;
    
    try {
      // Calculate price statistics
      const prices = communities
        .map(c => {
          if (typeof c.rentPerMonth === 'string') return parseFloat(c.rentPerMonth);
          if (typeof c.rentPerMonth === 'number') return c.rentPerMonth;
          return 0;
        })
        .filter(p => p > 0);
      
      const avgPrice = prices.length > 0 
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
        : 0;
      
      const priceRange = prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 0 };
      
      // Location analysis
      const states = [...new Set(communities.map(c => c.state).filter(Boolean))];
      const cities = [...new Set(communities.map(c => c.city).filter(Boolean))];
      
      // Care type analysis
      const careTypes = new Map<string, number>();
      communities.forEach(c => {
        if (c.careTypes) {
          const types = c.careTypes.toLowerCase().split(',');
          types.forEach(type => {
            const trimmed = type.trim();
            careTypes.set(trimmed, (careTypes.get(trimmed) || 0) + 1);
          });
        }
      });
      
      return {
        summary: {
          totalOptions: communities.length,
          averagePrice: Math.round(avgPrice),
          priceRange,
          statesCovered: states.length,
          citiesCovered: cities.length,
          topStates: states.slice(0, 3),
          topCities: cities.slice(0, 5)
        },
        priceDistribution: {
          affordable: prices.filter(p => p < avgPrice * 0.8).length,
          moderate: prices.filter(p => p >= avgPrice * 0.8 && p <= avgPrice * 1.2).length,
          premium: prices.filter(p => p > avgPrice * 1.2).length
        },
        careTypeDistribution: Object.fromEntries(
          Array.from(careTypes.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
        ),
        recommendations: this.generateRecommendations(communities, intent)
      };
    } catch (error) {
      console.error('Insight generation error:', error);
      return null;
    }
  }
  
  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(communities: any[], intent: SearchIntent): string[] {
    const recommendations = [];
    
    if (intent.extractedEntities.priceRange && communities.length > 0) {
      const underBudget = communities.filter(c => {
        const price = parseFloat(c.rentPerMonth || '0');
        return price > 0 && price <= (intent.extractedEntities.priceRange?.max || Infinity);
      });
      
      if (underBudget.length > 0) {
        recommendations.push(
          `Found ${underBudget.length} communities within your budget of $${intent.extractedEntities.priceRange.max}`
        );
      }
    }
    
    if (intent.extractedEntities.quality) {
      const highRated = communities.filter(c => c.overallRating >= 4.0);
      if (highRated.length > 0) {
        recommendations.push(
          `${highRated.length} communities have excellent ratings (4+ stars)`
        );
      }
    }
    
    if (communities.length > 20) {
      recommendations.push(
        'Consider adding more filters to narrow down your search'
      );
    } else if (communities.length < 5) {
      recommendations.push(
        'Try broadening your search criteria for more options'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(partialQuery: string): Promise<string[]> {
    return this.queryEnhancer.generateSuggestions(partialQuery);
  }
}

// Export singleton instance
export const enhancedSearchEngine = new EnhancedSearchEngine();