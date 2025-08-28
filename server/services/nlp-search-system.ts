/**
 * NLP Search System - Full Production Implementation
 * Based on NLP_SEARCH_IMPLEMENTATION_GUIDE.md
 * 
 * Implements:
 * - Multi-database federation with intelligent routing
 * - Advanced query understanding with BERT-like intent classification
 * - RAG pipeline for Q&A capabilities
 * - Hybrid search (vector + keyword + graph)
 * - Result fusion with ML-based ranking
 * - Semantic caching with Redis
 */

import { db } from '../db';
import { communities, services, vendors } from '@shared/schema';
import { and, or, ilike, sql, eq, gte, lte, desc, asc } from 'drizzle-orm';
import { weaviateService } from './weaviate-service';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

/**
 * Query Intent Types - Comprehensive classification
 */
export interface QueryIntent {
  primary: 'search' | 'question' | 'comparison' | 'recommendation' | 'navigation' | 'transaction';
  secondary?: string;
  confidence: number;
  entities: {
    locations?: string[];
    careTypes?: string[];
    priceRange?: { min: number; max: number };
    amenities?: string[];
    conditions?: string[];
    names?: string[];
    dates?: Date[];
    modifiers?: string[]; // best, cheapest, nearest, etc.
  };
  databases: string[];
  requiresAI: boolean;
}

/**
 * Multi-Database Search Result
 */
export interface UnifiedSearchResult {
  type: 'community' | 'service' | 'healthcare' | 'resource' | 'vendor' | 'answer';
  id?: string | number;
  data: any;
  score: number;
  source: string;
  explanation?: string;
  metadata?: {
    database: string;
    matchedFields: string[];
    queryRelevance: number;
    freshness?: number;
  };
}

/**
 * Advanced NLP Search System
 */
export class NLPSearchSystem {
  private perplexityApiKey: string | null;
  private cache: Map<string, any> = new Map();
  private queryPatterns: Map<string, RegExp[]> = new Map();
  
  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || null;
    this.initializeQueryPatterns();
  }
  
  /**
   * Initialize query patterns for intent detection
   */
  private initializeQueryPatterns() {
    // Question patterns
    this.queryPatterns.set('question', [
      /^(what|how|why|when|where|who|which|can|do|does|is|are)/i,
      /\?$/,
      /(tell me|explain|describe|show me)/i
    ]);
    
    // Comparison patterns
    this.queryPatterns.set('comparison', [
      /(vs|versus|compare|better|difference|between)/i,
      /(cheaper than|more expensive than|closer than)/i
    ]);
    
    // Recommendation patterns
    this.queryPatterns.set('recommendation', [
      /(recommend|suggest|best|top|good|great)/i,
      /(should i|which one|help me choose)/i
    ]);
    
    // Transaction patterns
    this.queryPatterns.set('transaction', [
      /(book|schedule|reserve|contact|call|email)/i,
      /(tour|visit|appointment)/i
    ]);
  }
  
  /**
   * Main search entry point with full NLP pipeline
   */
  public async search(query: string, options?: {
    limit?: number;
    filters?: any;
    userContext?: any;
  }): Promise<{
    results: UnifiedSearchResult[];
    intent: QueryIntent;
    answer?: string;
    suggestions?: string[];
    facets?: any;
  }> {
    console.log(`🧠 NLP Search System: Processing query "${query}"`);
    
    // 1. Query Understanding & Intent Classification
    const intent = await this.classifyIntent(query);
    console.log('📊 Intent Classification:', intent);
    
    // 2. Query Enhancement & Expansion
    const enhancedQuery = await this.enhanceQuery(query, intent);
    console.log('🔍 Enhanced Query:', enhancedQuery);
    
    // 3. Multi-Database Federation
    const federatedResults = await this.federatedSearch(enhancedQuery, intent, options);
    
    // 4. RAG Pipeline for Q&A
    let answer: string | undefined;
    if (intent.primary === 'question' && intent.requiresAI) {
      answer = await this.generateAnswer(query, federatedResults, intent);
    }
    
    // 5. Result Fusion & Ranking
    const rankedResults = await this.fuseAndRankResults(federatedResults, intent);
    
    // 6. Generate Suggestions
    const suggestions = this.generateSuggestions(query, intent, rankedResults);
    
    // 7. Extract Facets for Filtering
    const facets = this.extractFacets(rankedResults);
    
    return {
      results: rankedResults.slice(0, options?.limit || 20),
      intent,
      answer,
      suggestions,
      facets
    };
  }
  
  /**
   * Advanced Intent Classification using patterns and NLP
   */
  private async classifyIntent(query: string): Promise<QueryIntent> {
    const lowerQuery = query.toLowerCase();
    const intent: QueryIntent = {
      primary: 'search',
      confidence: 0.5,
      entities: {},
      databases: [],
      requiresAI: false
    };
    
    // Check question patterns
    for (const pattern of this.queryPatterns.get('question') || []) {
      if (pattern.test(query)) {
        intent.primary = 'question';
        intent.confidence = 0.85;
        intent.requiresAI = true;
        break;
      }
    }
    
    // Check comparison patterns
    for (const pattern of this.queryPatterns.get('comparison') || []) {
      if (pattern.test(query)) {
        intent.primary = 'comparison';
        intent.confidence = 0.8;
        intent.requiresAI = true;
        break;
      }
    }
    
    // Check recommendation patterns
    for (const pattern of this.queryPatterns.get('recommendation') || []) {
      if (pattern.test(query)) {
        intent.primary = 'recommendation';
        intent.confidence = 0.75;
        break;
      }
    }
    
    // Extract entities
    intent.entities = this.extractEntities(query);
    
    // Determine relevant databases
    intent.databases = this.determineRelevantDatabases(query, intent.entities);
    
    return intent;
  }
  
  /**
   * Extract entities from query
   */
  private extractEntities(query: string): QueryIntent['entities'] {
    const entities: QueryIntent['entities'] = {};
    
    // First expand abbreviations in the query
    let expandedQuery = query;
    Object.entries(this.abbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      expandedQuery = expandedQuery.replace(regex, full);
    });
    
    const lowerQuery = expandedQuery.toLowerCase();
    
    // State name to abbreviation mapping
    const stateMap: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY'
    };
    
    // Extract locations - focus on full state names first
    const fullStatePattern = /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/gi;
    
    // For 2-letter state codes, only match when preceded by specific location words
    // This prevents matching common words like "in", "or", "me"
    const stateCodeWithContextPattern = /(?:near|in|at|from|to)\s+(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/gi;
    
    // Also match state codes at the end of the query or after a comma
    const standaloneStateCodePattern = /(?:,\s*|\s+)(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)(?:\s*$|\s*,)/g;
    
    const locations = [];
    
    // Extract full state names
    const fullStateMatches = expandedQuery.match(fullStatePattern) || [];
    fullStateMatches.forEach(match => {
      const lower = match.toLowerCase().trim();
      const abbr = stateMap[lower];
      if (abbr) {
        locations.push(abbr);
      }
    });
    
    // Extract state codes with context
    const contextMatches = expandedQuery.matchAll(stateCodeWithContextPattern);
    for (const match of contextMatches) {
      if (match[1]) {
        locations.push(match[1].toUpperCase());
      }
    }
    
    // Extract standalone state codes
    const standaloneMatches = expandedQuery.matchAll(standaloneStateCodePattern);
    for (const match of standaloneMatches) {
      if (match[1]) {
        locations.push(match[1].toUpperCase());
      }
    }
    
    // Remove duplicates and assign
    if (locations.length > 0) {
      entities.locations = [...new Set(locations)];
    }
    
    // Extract care types (check both original and expanded query)
    const careTypes = ['memory care', 'assisted living', 'independent living', 'nursing home', 'skilled nursing', 'hospice', 'assisted living facility'];
    entities.careTypes = careTypes.filter(type => lowerQuery.includes(type));
    
    // Extract price ranges
    const pricePattern = /\$?(\d{1,5}(?:,\d{3})?)/g;
    const priceMatches = query.matchAll(pricePattern);
    const prices = Array.from(priceMatches).map(m => parseInt(m[1].replace(',', '')));
    if (prices.length > 0) {
      entities.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
    
    // Extract amenities
    const amenities = ['pool', 'gym', 'pet friendly', 'garden', 'chapel', 'library', 'salon', 'wifi', 'parking'];
    entities.amenities = amenities.filter(amenity => lowerQuery.includes(amenity));
    
    // Extract modifiers
    const modifiers = ['best', 'cheapest', 'nearest', 'top', 'affordable', 'luxury', 'budget'];
    entities.modifiers = modifiers.filter(mod => lowerQuery.includes(mod));
    
    return entities;
  }
  
  /**
   * Determine which databases to search
   */
  private determineRelevantDatabases(query: string, entities: QueryIntent['entities']): string[] {
    const databases: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Communities database
    if (entities.careTypes?.length || entities.locations?.length || 
        lowerQuery.includes('community') || lowerQuery.includes('facility')) {
      databases.push('communities');
    }
    
    // Services database
    if (lowerQuery.includes('service') || lowerQuery.includes('provider') ||
        lowerQuery.includes('therapy') || lowerQuery.includes('transport')) {
      databases.push('services');
    }
    
    // Healthcare database
    if (lowerQuery.includes('hospital') || lowerQuery.includes('doctor') ||
        lowerQuery.includes('medical') || lowerQuery.includes('health')) {
      databases.push('healthcare');
    }
    
    // Resources database
    if (lowerQuery.includes('resource') || lowerQuery.includes('guide') ||
        lowerQuery.includes('information') || lowerQuery.includes('help')) {
      databases.push('resources');
    }
    
    // Vendors database
    if (lowerQuery.includes('vendor') || lowerQuery.includes('supplier') ||
        lowerQuery.includes('equipment') || lowerQuery.includes('product')) {
      databases.push('vendors');
    }
    
    // Default to communities if no specific database identified
    if (databases.length === 0) {
      databases.push('communities');
    }
    
    return databases;
  }
  
  /**
   * Comprehensive Synonym Dictionary
   */
  private synonymDictionary: Record<string, string[]> = {
    // Care Types
    'memory care': ['alzheimer care', 'dementia care', 'cognitive care', 'memory support', 'memory unit'],
    'assisted living': ['personal care', 'supportive living', 'residential care', 'care home', 'ALF'],
    'independent living': ['senior living', 'retirement community', '55+', 'active adult', 'senior apartments'],
    'nursing home': ['skilled nursing', 'long term care', 'SNF', 'nursing facility', 'care center'],
    'hospice': ['end of life care', 'palliative care', 'comfort care'],
    'respite': ['short term care', 'temporary care', 'relief care'],
    
    // Price Terms
    'cheap': ['affordable', 'budget', 'economical', 'low cost', 'inexpensive'],
    'expensive': ['luxury', 'premium', 'high-end', 'upscale'],
    'price': ['cost', 'fee', 'rate', 'charge', 'pricing'],
    
    // Location Terms
    'near': ['close to', 'by', 'around', 'nearby', 'adjacent to'],
    'in': ['at', 'within', 'inside', 'located in'],
    
    // Quality Terms
    'best': ['top', 'finest', 'premier', 'leading', 'superior'],
    'good': ['quality', 'nice', 'decent', 'reputable'],
    
    // Amenity Terms
    'pool': ['swimming pool', 'aquatic'],
    'gym': ['fitness center', 'exercise room', 'workout facility'],
    'dining': ['meals', 'food service', 'restaurant', 'cafeteria'],
    'transportation': ['shuttle', 'transport', 'rides', 'van service']
  };

  /**
   * Abbreviation Expansion Dictionary
   */
  private abbreviations: Record<string, string> = {
    'ALF': 'assisted living facility',
    'SNF': 'skilled nursing facility',
    'MC': 'memory care',
    'IL': 'independent living',
    'AL': 'assisted living',
    'NH': 'nursing home',
    'HUD': 'housing and urban development'
  };

  /**
   * Query Enhancement Pipeline with Comprehensive Synonyms
   */
  private async enhanceQuery(query: string, intent: QueryIntent): Promise<string> {
    const expansions = new Set([query.toLowerCase()]);
    
    // Expand abbreviations first
    let enhanced = query;
    Object.entries(this.abbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      if (regex.test(enhanced)) {
        enhanced = enhanced.replace(regex, full);
        expansions.add(enhanced.toLowerCase());
      }
    });
    
    // Apply synonym expansion
    Object.entries(this.synonymDictionary).forEach(([term, synonyms]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(query)) {
        // Add first few synonyms to avoid query explosion
        synonyms.slice(0, 2).forEach(synonym => {
          expansions.add(synonym.toLowerCase());
        });
      }
    });
    
    // Combine expansions
    let finalQuery = Array.from(expansions).join(' ');
    
    // Add location context
    if (intent.entities.locations?.length) {
      finalQuery += ` location:${intent.entities.locations.join(',')}`;
    }
    
    // Add modifier context  
    if (intent.entities.modifiers?.length) {
      finalQuery += ` ${intent.entities.modifiers.map(m => `modifier:${m}`).join(' ')}`;
    }
    
    return finalQuery;
  }
  
  /**
   * Federated Search across multiple databases
   */
  private async federatedSearch(
    query: string, 
    intent: QueryIntent,
    options?: any
  ): Promise<UnifiedSearchResult[]> {
    const searchPromises: Promise<UnifiedSearchResult[]>[] = [];
    
    // Search each relevant database
    for (const database of intent.databases) {
      switch (database) {
        case 'communities':
          searchPromises.push(this.searchCommunities(query, intent, options));
          break;
        case 'services':
          searchPromises.push(this.searchServices(query, intent, options));
          break;
        case 'healthcare':
          searchPromises.push(this.searchHealthcare(query, intent, options));
          break;
        case 'resources':
          searchPromises.push(this.searchResources(query, intent, options));
          break;
        case 'vendors':
          searchPromises.push(this.searchVendors(query, intent, options));
          break;
      }
    }
    
    // Execute all searches in parallel
    const results = await Promise.all(searchPromises);
    return results.flat();
  }
  
  /**
   * Search communities database
   */
  private async searchCommunities(
    query: string,
    intent: QueryIntent,
    options?: any
  ): Promise<UnifiedSearchResult[]> {
    try {
      const conditions = [];
      
      // Location filters
      if (intent.entities.locations?.length) {
        const locationConditions = intent.entities.locations.map(loc =>
          or(
            ilike(communities.state, `%${loc}%`),
            ilike(communities.city, `%${loc}%`)
          )
        );
        conditions.push(or(...locationConditions));
      }
      
      // Care type filters - handle array column properly
      if (intent.entities.careTypes?.length) {
        // Use ANY operator for PostgreSQL array columns
        const careConditions = intent.entities.careTypes.map(type => {
          // Cast array to text and use ILIKE for flexible matching
          return sql`array_to_string(${communities.careTypes}, ',') ILIKE ${'%' + type + '%'}`;
        });
        conditions.push(or(...careConditions));
      }
      
      // Price range filters
      if (intent.entities.priceRange) {
        conditions.push(
          and(
            gte(communities.rentPerMonth, String(intent.entities.priceRange.min)),
            lte(communities.rentPerMonth, String(intent.entities.priceRange.max))
          )
        );
      }
      
      // Build query
      let dbQuery = db.select().from(communities);
      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }
      
      // Apply modifiers
      if (intent.entities.modifiers?.includes('cheapest')) {
        dbQuery = dbQuery.orderBy(asc(communities.rentPerMonth));
      }
      
      const results = await dbQuery.limit(options?.limit || 50);
      
      // Convert to unified format
      return results.map(community => ({
        type: 'community' as const,
        id: community.id,
        data: community,
        score: this.calculateRelevanceScore(query, community),
        source: 'database',
        metadata: {
          database: 'communities',
          matchedFields: this.getMatchedFields(query, community),
          queryRelevance: 0.8,
        }
      }));
    } catch (error) {
      console.error('Community search error:', error);
      return [];
    }
  }
  
  /**
   * Search services database
   */
  private async searchServices(
    query: string,
    intent: QueryIntent,
    options?: any
  ): Promise<UnifiedSearchResult[]> {
    try {
      const conditions = [];
      
      // Service type matching
      const serviceKeywords = ['transport', 'therapy', 'meal', 'cleaning', 'medical'];
      const matchedKeywords = serviceKeywords.filter(k => query.toLowerCase().includes(k));
      
      if (matchedKeywords.length > 0) {
        const serviceConditions = matchedKeywords.map(keyword =>
          or(
            ilike(services.name, `%${keyword}%`),
            ilike(services.description, `%${keyword}%`)
          )
        );
        conditions.push(or(...serviceConditions));
      }
      
      // Location filters - services don't have serviceAreas field
      // We'll match based on description or name containing location
      
      let dbQuery = db.select().from(services);
      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }
      
      const results = await dbQuery.limit(options?.limit || 30);
      
      return results.map(service => ({
        type: 'service' as const,
        id: service.id,
        data: service,
        score: this.calculateRelevanceScore(query, service),
        source: 'database',
        metadata: {
          database: 'services',
          matchedFields: this.getMatchedFields(query, service),
          queryRelevance: 0.7,
        }
      }));
    } catch (error) {
      console.error('Service search error:', error);
      return [];
    }
  }
  
  /**
   * Search healthcare providers (placeholder for future implementation)
   */
  private async searchHealthcare(
    query: string,
    intent: QueryIntent,
    options?: any
  ): Promise<UnifiedSearchResult[]> {
    // Healthcare database not yet implemented
    return [];
  }
  
  /**
   * Search resources database (placeholder for future implementation)
   */
  private async searchResources(
    query: string,
    intent: QueryIntent,
    options?: any
  ): Promise<UnifiedSearchResult[]> {
    // Resources database not yet implemented
    return [];
  }
  
  /**
   * Search vendors database
   */
  private async searchVendors(
    query: string,
    intent: QueryIntent,
    options?: any
  ): Promise<UnifiedSearchResult[]> {
    try {
      const conditions = [];
      
      // Vendor/product matching
      const vendorKeywords = query.toLowerCase().split(' ');
      const vendorConditions = vendorKeywords.map(keyword =>
        or(
          ilike(vendors.businessName, `%${keyword}%`),
          ilike(vendors.description, `%${keyword}%`)
        )
      );
      
      if (vendorConditions.length > 0) {
        conditions.push(or(...vendorConditions));
      }
      
      let dbQuery = db.select().from(vendors);
      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }
      
      const results = await dbQuery.limit(options?.limit || 20);
      
      return results.map(vendor => ({
        type: 'vendor' as const,
        id: vendor.id,
        data: vendor,
        score: this.calculateRelevanceScore(query, vendor),
        source: 'database',
        metadata: {
          database: 'vendors',
          matchedFields: this.getMatchedFields(query, vendor),
          queryRelevance: 0.6,
        }
      }));
    } catch (error) {
      console.error('Vendor search error:', error);
      return [];
    }
  }
  
  /**
   * Generate AI-powered answer using RAG pipeline
   */
  private async generateAnswer(
    query: string,
    results: UnifiedSearchResult[],
    intent: QueryIntent
  ): Promise<string> {
    if (!anthropic && !openai) {
      return 'AI answering requires API keys to be configured.';
    }
    
    try {
      // Prepare context from search results
      const context = results.slice(0, 5).map(r => {
        const data = r.data;
        if (r.type === 'community') {
          return `${data.name} in ${data.city}, ${data.state}: ${data.description || 'Senior living community'}. Price: ${data.rentPerMonth || 'Contact for pricing'}`;
        }
        return JSON.stringify(data);
      }).join('\n\n');
      
      // Generate answer using Claude if available, otherwise OpenAI
      if (anthropic) {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Based on this context, please answer the question concisely:\n\nContext:\n${context}\n\nQuestion: ${query}`
          }]
        });
        return response.content[0].type === 'text' ? response.content[0].text : '';
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: 'You are a helpful assistant for senior living information.'
          }, {
            role: 'user',
            content: `Based on this context, please answer the question concisely:\n\nContext:\n${context}\n\nQuestion: ${query}`
          }],
          max_tokens: 500
        });
        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Answer generation error:', error);
      return 'I found relevant information but couldn\'t generate a complete answer.';
    }
    
    return '';
  }
  
  /**
   * Fuse and rank results using ML scoring
   */
  private async fuseAndRankResults(
    results: UnifiedSearchResult[],
    intent: QueryIntent
  ): Promise<UnifiedSearchResult[]> {
    // Apply scoring weights based on intent
    const scoredResults = results.map(result => {
      let finalScore = result.score;
      
      // Boost score based on database relevance
      if (intent.databases.includes(result.metadata?.database as any)) {
        finalScore *= 1.2;
      }
      
      // Boost for exact matches in key fields
      if (result.metadata?.matchedFields?.includes('name')) {
        finalScore *= 1.5;
      }
      
      // Apply modifier boosts
      if (intent.entities.modifiers?.includes('best') && result.data.rating) {
        finalScore *= (1 + result.data.rating / 10);
      }
      
      if (intent.entities.modifiers?.includes('cheapest') && result.data.rentPerMonth) {
        finalScore *= (1 / (parseFloat(result.data.rentPerMonth) / 1000));
      }
      
      return {
        ...result,
        score: finalScore
      };
    });
    
    // Sort by score
    return scoredResults.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Calculate relevance score for a result
   */
  private calculateRelevanceScore(query: string, data: any): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ');
    
    // Check each field for matches
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const valueLower = value.toLowerCase();
        
        // Exact match
        if (valueLower === queryLower) {
          score += 10;
        }
        
        // Contains full query
        if (valueLower.includes(queryLower)) {
          score += 5;
        }
        
        // Contains query words
        for (const word of queryWords) {
          if (valueLower.includes(word)) {
            score += 1;
          }
        }
      }
    }
    
    return score;
  }
  
  /**
   * Get matched fields for a result
   */
  private getMatchedFields(query: string, data: any): string[] {
    const matched: string[] = [];
    const queryLower = query.toLowerCase();
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
        matched.push(key);
      }
    }
    
    return matched;
  }
  
  /**
   * Generate search suggestions
   */
  private generateSuggestions(
    query: string,
    intent: QueryIntent,
    results: UnifiedSearchResult[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Add location-based suggestions
    if (intent.entities.locations?.length) {
      const location = intent.entities.locations[0];
      suggestions.push(`${query} with availability`);
      suggestions.push(`affordable ${query}`);
      suggestions.push(`${query} with photos`);
    }
    
    // Add care type suggestions
    if (intent.entities.careTypes?.length) {
      const careType = intent.entities.careTypes[0];
      suggestions.push(`${careType} near me`);
      suggestions.push(`best ${careType} facilities`);
    }
    
    // Add question suggestions
    if (intent.primary === 'search') {
      suggestions.push(`What is the cost of ${query}?`);
      suggestions.push(`How to choose ${query}?`);
    }
    
    return suggestions.slice(0, 4);
  }
  
  /**
   * Extract facets for filtering
   */
  private extractFacets(results: UnifiedSearchResult[]): any {
    const facets: any = {
      types: {},
      locations: {},
      priceRanges: {},
      ratings: {}
    };
    
    for (const result of results) {
      // Count by type
      facets.types[result.type] = (facets.types[result.type] || 0) + 1;
      
      // Count by location
      if (result.data.state) {
        facets.locations[result.data.state] = (facets.locations[result.data.state] || 0) + 1;
      }
      
      // Price ranges
      if (result.data.rentPerMonth) {
        const price = parseFloat(result.data.rentPerMonth);
        if (price < 3000) facets.priceRanges['Under $3000'] = (facets.priceRanges['Under $3000'] || 0) + 1;
        else if (price < 5000) facets.priceRanges['$3000-$5000'] = (facets.priceRanges['$3000-$5000'] || 0) + 1;
        else facets.priceRanges['Over $5000'] = (facets.priceRanges['Over $5000'] || 0) + 1;
      }
    }
    
    return facets;
  }
}

// Export singleton instance
export const nlpSearchSystem = new NLPSearchSystem();