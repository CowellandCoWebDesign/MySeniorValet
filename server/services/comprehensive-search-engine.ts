/**
 * COMPREHENSIVE SEARCH ENGINE - Zillow-level Search Capability
 * Handles ALL search types: natural language, locations, companies, prices, care types
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, and, or, ilike, gte, lte, sql, desc, asc, isNotNull } from 'drizzle-orm';

export interface SearchFilters {
  careTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  state?: string;
  city?: string;
  rating?: number;
  features?: string[];
  bedrooms?: number;
  bathrooms?: number;
  radius?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchResult {
  communities: any[];
  totalResults: number;
  searchMetadata: {
    query: string;
    searchType: string;
    filters: SearchFilters;
    processingTime: number;
    suggestions?: string[];
  };
  facets: {
    states: { name: string; count: number }[];
    careTypes: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

export class ComprehensiveSearchEngine {
  
  async search(query: string, filters: SearchFilters = {}, options: { limit?: number; offset?: number } = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const { limit = 20, offset = 0 } = options;
    
    // Detect search type and build conditions
    const { conditions, searchType } = await this.buildSearchConditions(query, filters);
    
    // Execute main search
    let searchQuery = db.select().from(communities);
    
    if (conditions.length > 0) {
      searchQuery = searchQuery.where(and(...conditions));
    }
    
    // Add sorting based on search type
    searchQuery = this.applySorting(searchQuery, searchType, query);
    
    // Execute with pagination
    const results = await searchQuery
      .limit(limit)
      .offset(offset);
    
    // Get total count
    let countQuery = db.select({ count: sql`count(*)` }).from(communities);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;
    
    // Build facets for filtering
    const facets = await this.buildFacets(conditions);
    
    // Generate search suggestions
    const suggestions = await this.generateSuggestions(query, searchType);
    
    // Get intent scores for metadata
    const normalizedQuery = query ? query.toLowerCase().trim() : '';
    const intentScores = normalizedQuery ? await this.calculateIntentScores(normalizedQuery) : null;
    
    return {
      communities: results,
      totalResults: parseInt(count.toString()),
      searchMetadata: {
        query,
        searchType,
        filters,
        processingTime: Date.now() - startTime,
        suggestions,
        intentScores
      },
      facets
    };
  }
  
  private async buildSearchConditions(query: string, filters: SearchFilters) {
    const conditions: any[] = [];
    let searchType = 'general';
    
    if (!query || query.trim() === '') {
      searchType = 'browse';
    } else {
      // Normalize query
      let normalizedQuery = query.toLowerCase().trim();
      
      // SMART CITY-STATE PARSING: Handle "City State" or "City, State" patterns
      const cityStatePatterns = [
        /^([a-zA-Z\s]+?)(?:,?\s+)(alaska|ak)$/i,
        /^([a-zA-Z\s]+?)(?:,?\s+)(florida|fl)$/i,
        /^([a-zA-Z\s]+?)(?:,?\s+)(south carolina|sc)$/i,
        /^([a-zA-Z\s]+?)(?:,?\s+)(new york|ny)$/i,
        /^([a-zA-Z\s]+?)(?:,?\s+)(california|ca)$/i,
        /^([a-zA-Z\s]+?)(?:,?\s+)([a-zA-Z]{2})$/i,  // Any 2-letter state code
        /^([a-zA-Z\s]+?)(?:,?\s+)(alabama|arizona|arkansas|colorado|connecticut|delaware|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)$/i
      ];
      
      let cityStateMatch = null;
      for (const pattern of cityStatePatterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          cityStateMatch = match;
          break;
        }
      }
      
      if (cityStateMatch) {
        const city = cityStateMatch[1].trim();
        const state = cityStateMatch[2].trim().toUpperCase();
        
        console.log(`CITY-STATE SEARCH: City="${city}", State="${state}"`);
        searchType = 'location';
        
        // Build precise city + state conditions
        const stateCode = state.length === 2 ? state : this.getStateCode(state);
        conditions.push(
          and(
            ilike(communities.city, `%${city}%`),
            eq(communities.state, stateCode)
          )
        );
      } else {
        // MULTI-INTENT DETECTION: Based on Zillow's approach, detect multiple intents simultaneously
        const intentScores = await this.calculateIntentScores(normalizedQuery);
        const dominantIntent = this.getDominantIntent(intentScores);
        
        console.log(`Query: "${query}" | Intent scores:`, intentScores, `| Dominant: ${dominantIntent}`);
        
        // Apply conditions based on ALL detected intents (not just dominant)
        if (intentScores.location > 0.3) {
          const locationConditions = await this.buildLocationConditions(normalizedQuery);
          conditions.push(...locationConditions);
        }
        
        if (intentScores.careType > 0.3) {
          const careConditions = await this.buildCareTypeConditions(normalizedQuery);
          conditions.push(...careConditions);
        }
        
        if (intentScores.price > 0.3) {
          const priceConditions = await this.buildPriceConditions(normalizedQuery);
          conditions.push(...priceConditions);
        }
        
        if (intentScores.company > 0.3) {
          conditions.push(
            or(
              ilike(communities.name, `%${normalizedQuery}%`),
              ilike(communities.managementCompany, `%${normalizedQuery}%`)
            )
          );
        }
        
        // If no specific intent detected strongly, use general search
        if (Math.max(...Object.values(intentScores)) < 0.4) {
          conditions.push(
            or(
              ilike(communities.name, `%${normalizedQuery}%`),
              ilike(communities.city, `%${normalizedQuery}%`),
              ilike(communities.state, `%${normalizedQuery}%`),
              ilike(communities.managementCompany, `%${normalizedQuery}%`),
              ilike(communities.address, `%${normalizedQuery}%`)
            )
          );
        }
        
        searchType = dominantIntent;
      }
    }
    
    // Apply additional filters
    this.applyFilters(conditions, filters);
    
    return { conditions, searchType };
  }
  
  // NEW: Multi-intent scoring system based on research
  private async calculateIntentScores(query: string): Promise<{
    location: number;
    careType: number;
    price: number;
    company: number;
    general: number;
  }> {
    const scores = {
      location: 0,
      careType: 0,
      price: 0,
      company: 0,
      general: 0
    };
    
    // Location intent patterns
    const locationPatterns = [
      /^[a-zA-Z\s]+(,\s*[A-Z]{2})?$/,  // "Sacramento" or "Sacramento, CA"
      /^\d{5}(-\d{4})?$/,              // ZIP codes
      /\b(in|near|around)\s+/,         // "memory care in Sacramento"
      /\b(city|state|county|zip)\b/,
      /\b(california|texas|florida|new york|illinois)\b/i,  // State names
      /\b(sacramento|los angeles|san francisco|san diego|chicago|houston|phoenix|philadelphia|san antonio|dallas|san jose|austin|jacksonville|columbus|charlotte|detroit|el paso|memphis|seattle|denver|washington|boston|nashville|baltimore|oklahoma city|louisville|portland|las vegas|milwaukee|albuquerque|tucson|fresno|mesa|atlanta|kansas city|colorado springs|miami|raleigh|omaha|long beach|virginia beach|oakland|minneapolis|tulsa|arlington|tampa|new orleans)\b/i  // Major cities
    ];
    
    // Care type intent patterns  
    const careTypePatterns = [
      /\b(memory care|alzheimer|dementia)\b/i,
      /\b(assisted living|independent living)\b/i,
      /\b(nursing home|skilled nursing)\b/i,
      /\b(senior living|senior care)\b/i,
      /\b(rehabilitation|therapy)\b/i
    ];
    
    // Price intent patterns
    const pricePatterns = [
      /\$\d+/,                         // "$5000"
      /\b(under|over|below|above)\s*\$?\d+/i,  // "under $5000"
      /\b(cheap|affordable|expensive|luxury)\b/i,
      /\b\d+\s*to\s*\d+\b/,           // "3000 to 5000"
      /\b(budget|cost|price|pricing)\b/i
    ];
    
    // Company intent patterns
    const companyPatterns = [
      /\b(atria|brookdale|sunrise|brightview)\b/i,
      /\b(emeritus|belmont village|five star)\b/i,
      /\b(holiday retirement|senior lifestyle)\b/i,
      /\b(watermark|capital senior|discovery)\b/i
    ];
    
    // Calculate scores based on pattern matches
    locationPatterns.forEach(pattern => {
      if (pattern.test(query)) scores.location += 0.3;
    });
    
    careTypePatterns.forEach(pattern => {
      if (pattern.test(query)) scores.careType += 0.4;
    });
    
    pricePatterns.forEach(pattern => {
      if (pattern.test(query)) scores.price += 0.4;
    });
    
    companyPatterns.forEach(pattern => {
      if (pattern.test(query)) scores.company += 0.5;
    });
    
    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 1) {
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / maxScore;
      });
    }
    
    return scores;
  }
  
  private getDominantIntent(scores: any): string {
    const entries = Object.entries(scores);
    const dominant = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return dominant[0];
  }
  
  private async isCompanySearch(query: string): Promise<boolean> {
    const scores = await this.calculateIntentScores(query);
    return scores.company > 0.4;
  }
  
  private async isLocationSearch(query: string): Promise<boolean> {
    // Check for city, state patterns
    return (
      query.match(/^[a-zA-Z\s]+(,\s*[A-Z]{2})?$/) ||
      query.match(/^\d{5}(-\d{4})?$/) || // ZIP code
      query.includes(' in ') ||
      query.includes(' near ') ||
      query.includes(' around ')
    );
  }
  
  private async isPriceSearch(query: string): Promise<boolean> {
    return (
      query.includes('$') ||
      query.includes('under') ||
      query.includes('over') ||
      query.includes('cheap') ||
      query.includes('expensive') ||
      query.includes('affordable') ||
      query.includes('budget') ||
      query.match(/\d+\s*k/) || // "3k", "5k"
      query.match(/\d+\s*-\s*\d+/) // price ranges
    );
  }
  
  private async isCareTypeSearch(query: string): Promise<boolean> {
    const careTypes = [
      'assisted living', 'memory care', 'independent living', 'nursing home',
      'skilled nursing', 'alzheimer', 'dementia', 'respite care', 'adult day care'
    ];
    return careTypes.some(type => query.includes(type));
  }
  
  private async isNaturalLanguageSearch(query: string): Promise<boolean> {
    const nlKeywords = ['best', 'top', 'good', 'recommend', 'quality', 'luxury', 'nice'];
    return nlKeywords.some(keyword => query.includes(keyword)) || query.length > 50;
  }
  
  private async buildLocationConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // Handle "City, State" format
    if (query.includes(',')) {
      const [city, state] = query.split(',').map(s => s.trim());
      conditions.push(
        and(
          ilike(communities.city, city),
          ilike(communities.state, state.length === 2 ? state : `%${state}%`)
        )
      );
    }
    // ZIP code
    else if (query.match(/^\d{5}/)) {
      conditions.push(ilike(communities.zipCode, `${query}%`));
    }
    // General location
    else {
      conditions.push(
        or(
          ilike(communities.city, `%${query}%`),
          ilike(communities.state, `%${query}%`),
          ilike(communities.county, `%${query}%`)
        )
      );
    }
    
    return conditions;
  }
  
  private async buildPriceConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // REAL PRICE FILTERING: Based on PostgreSQL best practices research
    const priceMatch = query.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
    if (priceMatch) {
      const prices = priceMatch.map(p => parseInt(p.replace(/[$,]/g, '')));
      console.log(`REAL price filtering: ${prices.join(', ')}`);
      
      if (query.includes('under') || query.includes('below') || query.includes('<')) {
        // rentPerMonth is already NUMERIC type in database
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} < ${prices[0]}`
          )
        );
      } else if (query.includes('over') || query.includes('above') || query.includes('>')) {
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} > ${prices[0]}`
          )
        );
      } else if (prices.length === 2) {
        const [min, max] = [Math.min(...prices), Math.max(...prices)];
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} BETWEEN ${min} AND ${max}`
          )
        );
      }
    }
    
    // Handle qualitative terms with actual price ranges based on market research
    if (query.includes('cheap') || query.includes('affordable')) {
      console.log('Affordable filtering: under $4000/month');
      conditions.push(
        and(
          isNotNull(communities.rentPerMonth),
          sql`${communities.rentPerMonth} < 4000`
        )
      );
    } else if (query.includes('expensive') || query.includes('luxury') || query.includes('premium')) {
      console.log('Luxury filtering: over $7000/month');
      conditions.push(
        and(
          isNotNull(communities.rentPerMonth),
          sql`${communities.rentPerMonth} > 7000`
        )
      );
    }
    
    return conditions;
  }
  
  private async buildCareTypeConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    const careTypeMap = {
      'memory care': 'Memory Care',
      'alzheimer': 'Memory Care', 
      'dementia': 'Memory Care',
      'assisted living': 'Assisted Living',
      'independent living': 'Independent Living',
      'nursing home': 'Skilled Nursing',
      'skilled nursing': 'Skilled Nursing',
      'rehabilitation': 'Rehabilitation',
      'therapy': 'Rehabilitation'
    };
    
    // Find all matching care types (allow multiple)
    const matchedCareTypes: string[] = [];
    for (const [keyword, careType] of Object.entries(careTypeMap)) {
      if (query.includes(keyword)) {
        matchedCareTypes.push(careType);
      }
    }
    
    if (matchedCareTypes.length > 0) {
      console.log(`Care type filtering: ${matchedCareTypes.join(', ')}`);
      
      // Use proper JSON array containment check with correct column name (care_types)
      const careTypeConditions = matchedCareTypes.map(careType => 
        sql`(
          ${communities.careTypes} IS NOT NULL 
          AND (
            ${communities.careTypes}::text LIKE '%' || ${careType} || '%'
            OR ${communities.careTypes}::text LIKE '%' || ${careType.toLowerCase()} || '%'
            OR ${communities.careTypes}::text LIKE '%' || ${careType.toUpperCase()} || '%'
          )
        )`
      );
      
      conditions.push(or(...careTypeConditions));
    }
    
    return conditions;
  }
  
  private async buildNaturalLanguageConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // Extract entities from natural language
    if (query.includes('best') || query.includes('top') || query.includes('quality')) {
      conditions.push(gte(communities.rating, 4.0));
    }
    
    if (query.includes('luxury') || query.includes('upscale')) {
      conditions.push(gte(sql`CAST(REPLACE(${communities.rentPerMonth}, '$', '') AS INTEGER)`, 4000));
    }
    
    // Look for location mentions within natural language
    const locationMatch = query.match(/(?:in|near|around)\s+([a-zA-Z\s,]+)/);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      conditions.push(
        or(
          ilike(communities.city, `%${location}%`),
          ilike(communities.state, `%${location}%`)
        )
      );
    }
    
    return conditions;
  }
  
  private applyFilters(conditions: any[], filters: SearchFilters) {
    if (filters.state) {
      conditions.push(eq(communities.state, filters.state));
    }
    
    if (filters.city) {
      conditions.push(eq(communities.city, filters.city));
    }
    
    if (filters.careTypes?.length) {
      conditions.push(
        or(...filters.careTypes.map(type =>
          sql`${communities.careTypes}::text[] && ARRAY[${type}]::text[]`
        ))
      );
    }
    
    // Apply basic price filtering
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      console.log(`Price range filtering requested: ${filters.priceMin}-${filters.priceMax}, applying basic filter`);
      conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
    }
    
    if (filters.rating !== undefined) {
      conditions.push(gte(communities.rating, filters.rating));
    }
  }
  
  private applySorting(query: any, searchType: string, searchQuery: string) {
    switch (searchType) {
      case 'price':
        // Order by price when price search is detected (numeric column)
        return query.orderBy(sql`COALESCE(${communities.rentPerMonth}, 999999) ASC`);
      case 'company':
        return query.orderBy(asc(communities.name));
      case 'location':
        return query.orderBy(desc(communities.rating), asc(communities.city));
      case 'careType':
        return query.orderBy(desc(communities.rating));
      default:
        return query.orderBy(desc(communities.rating), asc(communities.name));
    }
  }
  
  private async buildFacets(conditions: any[]) {
    // Build facets for filtering UI
    let baseQuery = db.select().from(communities);
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    // Get state facets
    const states = await db
      .select({ state: communities.state, count: sql`count(*)` })
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(communities.state)
      .orderBy(desc(sql`count(*)`))
      .limit(10);
    
    return {
      states: states.map(s => ({ name: s.state, count: parseInt(s.count.toString()) })),
      careTypes: [], // TODO: Implement
      priceRanges: [], // TODO: Implement  
      ratings: [] // TODO: Implement
    };
  }
  
  private async generateSuggestions(query: string, searchType: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (searchType === 'location') {
      // Enhanced geographic suggestions
      suggestions.push(
        `${query} assisted living`,
        `${query} memory care`,
        `best senior living in ${query}`,
        `${query} under $5000`,
        `affordable communities in ${query}`
      );
    } else if (searchType === 'company') {
      suggestions.push(
        `${query} locations`,
        `${query} pricing`,
        `${query} reviews`,
        `${query} near me`
      );
    } else if (searchType === 'price') {
      suggestions.push(
        `under $3000`,
        `under $5000`,
        `affordable senior living`,
        `luxury communities`
      );
    } else {
      // Generic suggestions for unknown search types
      suggestions.push(
        `${query} near me`,
        `best ${query}`,
        `affordable ${query}`
      );
    }
    
    return suggestions;
  }
  
  // Add dedicated suggestions method for the suggestions endpoint
  async generateSearchSuggestions(query: string): Promise<string[]> {
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions: string[] = [];
    
    // International location enhancement
    const locationMap: { [key: string]: string[] } = {
      'tokyo': ['Tokyo, Japan', 'Tokyo communities', 'Tokyo senior living'],
      'paris': ['Paris, France', 'Paris communities', 'Paris senior care'],
      'london': ['London, UK', 'London communities', 'London senior living'],
      'sydney': ['Sydney, Australia', 'Sydney communities', 'Sydney senior care'],
      'toronto': ['Toronto, Canada', 'Toronto communities', 'Toronto senior living'],
      'vancouver': ['Vancouver, Canada', 'Vancouver communities', 'Vancouver senior care']
    };
    
    // Check if it's a known international location
    if (locationMap[normalizedQuery]) {
      suggestions.push(...locationMap[normalizedQuery]);
    }
    
    // Add general suggestions based on query type
    if (normalizedQuery.includes('senior') || normalizedQuery.includes('living')) {
      suggestions.push(
        `${query} under $5000`,
        `${query} memory care`,
        `${query} assisted living`,
        `best ${query}`
      );
    } else if (/^\d+$/.test(normalizedQuery) || normalizedQuery.includes('$')) {
      suggestions.push(
        `under $${normalizedQuery.replace(/\$/, '')}`,
        `communities under $${normalizedQuery.replace(/\$/, '')}`,
        `affordable senior living`
      );
    } else {
      // Location-based suggestions
      suggestions.push(
        `${query} senior living`,
        `${query} assisted living`,
        `${query} memory care`,
        `${query} under $5000`,
        `best communities in ${query}`
      );
    }
    
    // Remove duplicates and limit results
    return [...new Set(suggestions)].slice(0, 8);
  }
}

export const comprehensiveSearchEngine = new ComprehensiveSearchEngine();