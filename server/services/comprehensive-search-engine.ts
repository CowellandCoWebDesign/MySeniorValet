/**
 * COMPREHENSIVE SEARCH ENGINE - Zillow-level Search Capability
 * Handles ALL search types: natural language, locations, companies, prices, care types
 */

import { db } from '../db';
import { communities, healthcareServiceTypes } from '@shared/schema';
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
  healthcareServices?: any[]; // Optional healthcare services results
  totalResults: number;
  searchMetadata: {
    query: string;
    searchType: string;
    filters: SearchFilters;
    processingTime: number;
    suggestions?: string[];
    fallbackApplied?: boolean;
    fallbackMessage?: string;
    originalFiltersRequested?: SearchFilters;
    includesHealthcare?: boolean; // Indicates if healthcare results are included
  };
  facets: {
    states: { name: string; count: number }[];
    careTypes: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    ratings: { rating: number; count: number }[];
    healthcareTypes?: { name: string; count: number }[]; // Optional healthcare facets
  };
}

export class ComprehensiveSearchEngine {
  
  async search(query: string, filters: SearchFilters = {}, options: { limit?: number; offset?: number } = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const { limit = 100, offset = 0 } = options;
    
    // Store original filters for fallback message
    const originalFilters = { ...filters };
    const hasFilters = filters.priceMin || filters.priceMax || filters.rating || 
                      (filters.features && filters.features.length > 0) ||
                      (filters.careTypes && filters.careTypes.length > 0);
    
    // Check if this is a healthcare-related search
    const isHealthcareSearch = await this.isHealthcareSearch(query.toLowerCase());
    
    // Detect search type and build conditions
    const { conditions, searchType } = await this.buildSearchConditions(query, filters);
    console.log(`🔍 Total conditions built: ${conditions.length}, searchType: ${searchType}, isHealthcare: ${isHealthcareSearch}`);
    

    
    // Execute main search
    let searchQuery = db.select().from(communities);
    
    if (conditions.length > 0) {
      console.log(`🔍 Applying ${conditions.length} search conditions for query: "${query}"`);
      searchQuery = searchQuery.where(and(...conditions));
    } else {
      console.log(`⚠️ No search conditions applied for query: "${query}"`);
    }
    
    // Add sorting based on search type
    searchQuery = this.applySorting(searchQuery, searchType, query);
    
    // Execute with pagination
    let results = await searchQuery
      .limit(limit)
      .offset(offset);
    
    // Get total count
    let countQuery = db.select({ count: sql`count(*)` }).from(communities);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    let [{ count }] = await countQuery;
    let totalResults = parseInt(count.toString());
    
    // GRACEFUL FALLBACK: If we have filters but too few results, show location-only results
    let fallbackApplied = false;
    let fallbackMessage = '';
    
    if (hasFilters && totalResults < 5) {
      console.log('Applying graceful fallback - too few results with filters');
      
      // Build location-only conditions
      const locationOnlyConditions = await this.buildLocationConditions(query);
      
      if (locationOnlyConditions.length > 0) {
        // Re-run search with only location filters
        let fallbackQuery = db.select().from(communities)
          .where(and(...locationOnlyConditions));
        
        fallbackQuery = this.applySorting(fallbackQuery, 'location', query);
        
        results = await fallbackQuery
          .limit(limit)
          .offset(offset);
        
        // Get new count
        const fallbackCountQuery = db.select({ count: sql`count(*)` }).from(communities)
          .where(and(...locationOnlyConditions));
        [{ count }] = await fallbackCountQuery;
        totalResults = parseInt(count.toString());
        
        fallbackApplied = true;
        fallbackMessage = "Oh no! We didn't find many communities matching all your filters, but here's what we found in your area! Most detailed information (pricing, amenities, photos) becomes available when you click on a community through our live enrichment system.";
      }
    }
    
    // Build facets for filtering
    const facets = await this.buildFacets(conditions);
    
    // Generate search suggestions
    const suggestions = await this.generateSuggestions(query, searchType);
    
    // Get intent scores for metadata
    const normalizedQuery = query ? query.toLowerCase().trim() : '';
    const intentScores = normalizedQuery ? await this.calculateIntentScores(normalizedQuery) : null;
    
    // If this is a healthcare search, also get healthcare services
    let healthcareServices: any[] | undefined;
    let healthcareTypeFacets: { name: string; count: number }[] | undefined;
    
    if (isHealthcareSearch) {
      const healthcareResults = await this.searchHealthcareServices(query, limit, offset);
      healthcareServices = healthcareResults.services;
      healthcareTypeFacets = healthcareResults.facets;
    }
    
    return {
      communities: results,
      healthcareServices,
      totalResults,
      searchMetadata: {
        query,
        searchType,
        filters,
        processingTime: Date.now() - startTime,
        suggestions,

        fallbackApplied,
        fallbackMessage: fallbackApplied ? fallbackMessage : undefined,
        originalFiltersRequested: fallbackApplied ? originalFilters : undefined,
        includesHealthcare: isHealthcareSearch
      },
      facets: {
        ...facets,
        healthcareTypes: healthcareTypeFacets
      }
    };
  }
  
  private async buildSearchConditions(query: string, filters: SearchFilters) {
    const conditions: any[] = [];
    let searchType = 'general';
    
    if (!query || query.trim() === '') {
      searchType = 'browse';
    } else {
      // Normalize query
      const normalizedQuery = query.toLowerCase().trim();
      
      // MULTI-INTENT DETECTION: Based on Zillow's approach, detect multiple intents simultaneously
      const intentScores = await this.calculateIntentScores(normalizedQuery);
      const dominantIntent = this.getDominantIntent(intentScores);
      
      console.log(`Query: "${query}" | Intent scores:`, intentScores, `| Dominant: ${dominantIntent}`);
      
      // Apply conditions based on ALL detected intents (not just dominant)
      let isCountrySearch = false;
      
      if (intentScores.location >= 0.3) {
        const locationConditions = await this.buildLocationConditions(normalizedQuery);
        console.log(`🔍 Raw location conditions built: ${locationConditions.length}`);
        
        // Only add location conditions if they exist
        if (locationConditions.length > 0) {
          // Combine multiple location conditions with OR, not AND
          if (locationConditions.length > 1) {
            conditions.push(or(...locationConditions));
            console.log(`🔍 Combined ${locationConditions.length} location conditions with OR`);
          } else {
            conditions.push(...locationConditions);
            console.log(`🔍 Added single location condition`);
          }
        }
        // Check if this was a country search
        isCountrySearch = (locationConditions as any).__isCountrySearch;
        console.log(`🔍 After location: conditions.length=${conditions.length}, isCountrySearch=${isCountrySearch}`);
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
        console.log(`🔍 Added company search conditions for "${normalizedQuery}"`);
      }
      
      // CRITICAL FIX: Always search by community name to find specific communities
      // This ensures searches like "Hilltop Estates" always work
      const nameSearchCondition = ilike(communities.name, `%${normalizedQuery}%`);
      
      // If no specific intent detected strongly AND not a country search, use general search
      // BUT don't add general search if we already added location conditions
      const hasLocationConditions = intentScores.location >= 0.3;
      const hasCompanyConditions = intentScores.company > 0.3;
      
      if (!hasCompanyConditions) {
        // Always include name search unless we already added it via company search
        if (Math.max(...Object.values(intentScores)) < 0.4 && !isCountrySearch && !hasLocationConditions) {
          // Full general search for low-intent queries
          conditions.push(
            or(
              nameSearchCondition,
              ilike(communities.city, `%${normalizedQuery}%`),
              ilike(communities.state, `%${normalizedQuery}%`),
              ilike(communities.managementCompany, `%${normalizedQuery}%`),
              ilike(communities.address, `%${normalizedQuery}%`)
            )
          );
          console.log(`🔍 Added general search conditions for "${normalizedQuery}"`);
        } else {
          // For high-intent queries, still add name search to ensure we find specific communities
          conditions.push(nameSearchCondition);
          console.log(`🔍 Added name search condition for "${normalizedQuery}" to ensure specific communities are found`);
        }
      }
      
      searchType = dominantIntent;
    }
    
    // Apply additional filters
    console.log(`🔍 Before applyFilters: ${conditions.length} conditions`);
    this.applyFilters(conditions, filters);
    console.log(`🔍 After applyFilters: ${conditions.length} conditions`);
    
    console.log(`🔍 Final conditions count before return: ${conditions.length}`);
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
      /^[a-zA-Z\s]+,\s*[A-Z]{2}$/,     // "Sacramento, CA" - ONLY if it has comma and state
      /^\d{5}(-\d{4})?$/,              // ZIP codes
      /\b(in|near|around)\s+/,         // "memory care in Sacramento"
      /\b(city|state|county|zip)\b/,
      /\b(california|texas|florida|new york|illinois|ohio|pennsylvania|arizona|georgia|north carolina|michigan|new jersey|virginia|washington|massachusetts|indiana|tennessee|missouri|maryland|wisconsin|minnesota|colorado|alabama|south carolina|louisiana|kentucky|oregon|oklahoma|connecticut|iowa|mississippi|arkansas|utah|kansas|nevada|new mexico|nebraska|west virginia|idaho|hawaii|maine|new hampshire|rhode island|montana|delaware|south dakota|alaska|north dakota|vermont|wyoming)\b/i,  // State names
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
    
    // Handle "City, State" format (e.g., "Miami, Florida" or "Miami, FL")
    if (query.includes(',')) {
      const [city, state] = query.split(',').map(s => s.trim());
      console.log(`🔍 Parsing location: city="${city}", state="${state}"`);
      
      // Build condition for city and state - simplified approach
      const stateUpper = state.toUpperCase();
      
      // Use a single condition that works
      conditions.push(
        and(
          ilike(communities.city, `%${city}%`),
          eq(communities.state, stateUpper) // Most states in DB are uppercase abbreviations
        )
      );
      
      console.log(`🔍 Added city-state condition for "${city}" in state="${stateUpper}"`);
      return conditions; // Return early to avoid adding extra conditions
    }
    // ZIP code
    else if (query.match(/^\d{5}/)) {
      conditions.push(ilike(communities.zipCode, `${query}%`));
    }
    // General location - be more inclusive
    else {
      // Split query to handle multi-word locations better
      const words = query.toLowerCase().split(/\s+/);
      
      // Check for state names and abbreviations
      const stateAbbreviations: Record<string, string> = {
        'alaska': 'AK', 'alabama': 'AL', 'arkansas': 'AR', 'arizona': 'AZ',
        'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT',
        'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
        'hawaii': 'HI', 'iowa': 'IA', 'idaho': 'ID', 'illinois': 'IL',
        'indiana': 'IN', 'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA',
        'massachusetts': 'MA', 'maryland': 'MD', 'maine': 'ME', 'michigan': 'MI',
        'minnesota': 'MN', 'missouri': 'MO', 'mississippi': 'MS', 'montana': 'MT',
        'north carolina': 'NC', 'north dakota': 'ND', 'nebraska': 'NE',
        'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
        'nevada': 'NV', 'new york': 'NY', 'ohio': 'OH', 'oklahoma': 'OK',
        'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI',
        'south carolina': 'SC', 'south dakota': 'SD', 'tennessee': 'TN',
        'texas': 'TX', 'utah': 'UT', 'virginia': 'VA', 'vermont': 'VT',
        'washington': 'WA', 'wisconsin': 'WI', 'west virginia': 'WV', 'wyoming': 'WY'
      };
      
      // Check if query contains a state name
      let stateCode = null;
      let cityName = query;
      
      // Country mapping for international search (matches database format)
      const countryMapping: Record<string, string> = {
        'canada': 'CA',
        'australia': 'AU', 
        'mexico': 'Mexico',
        'japan': 'Japan',
        'united states': 'US',
        'usa': 'US',
        'us': 'US'
      };
      
      // Check for countries first
      let countryCode = null;
      const lowerQuery = query.toLowerCase().trim();
      for (const [countryName, code] of Object.entries(countryMapping)) {
        if (lowerQuery === countryName) {
          countryCode = code;
          break;
        }
      }
      
      // If it's a country search, handle differently
      if (countryCode) {
        console.log(`🌍 Country search detected: "${query}" → "${countryCode}"`);
        conditions.push(eq(communities.country, countryCode));
        // Mark this as a specific country search to avoid general fallback
        (conditions as any).__isCountrySearch = true;
        return conditions;
      }

      // Check each state name
      for (const [stateName, code] of Object.entries(stateAbbreviations)) {
        if (query.toLowerCase().includes(stateName)) {
          stateCode = code;
          // Extract city name by removing state from query
          cityName = query.toLowerCase().replace(stateName, '').trim();
          break;
        }
      }
      
      // Build flexible conditions
      const locationConditions = [];
      
      // If we have both city and state, search for that combination
      if (stateCode && cityName) {
        locationConditions.push(
          and(
            ilike(communities.city, `%${cityName}%`),
            ilike(communities.state, stateCode)  // Use state abbreviation
          )
        );
        // Also add fallback to just search the city
        locationConditions.push(ilike(communities.city, `%${cityName}%`));
      }
      
      // Enhanced location search with international administrative divisions
      locationConditions.push(
        ilike(communities.city, `%${query}%`),
        ilike(communities.state, `%${query}%`),
        ilike(communities.name, `%${query}%`)  // Community names
      );
      
      // Enhanced county/administrative division search
      // Handle variations: "Harris County", "Orange County", "Cook County" etc.
      const countyVariations = [
        query,  // Exact query
        query.replace(/\s+county$/i, ''),  // Remove "County" suffix
        query.replace(/\s+parish$/i, ''),  // Remove "Parish" suffix (Louisiana)
        query.replace(/\s+borough$/i, ''), // Remove "Borough" suffix (Alaska, NYC)
        `${query.replace(/\s+(county|parish|borough)$/i, '')} County`, // Add County if missing
      ];
      
      const countyConditions = countyVariations.map(variation => 
        ilike(communities.county, `%${variation}%`)
      );
      locationConditions.push(or(...countyConditions));
      
      // International administrative divisions
      // Canada: Provinces, Territories
      // Australia: States, Territories  
      // Mexico: States (Estados)
      // Japan: Prefectures
      if (query.toLowerCase().includes('province') || 
          query.toLowerCase().includes('territory') || 
          query.toLowerCase().includes('prefecture') ||
          query.toLowerCase().includes('estado')) {
        locationConditions.push(
          ilike(communities.state, `%${query}%`),
          ilike(communities.county, `%${query}%`)
        );
      }
      
      // Add state abbreviation condition if we found one
      if (stateCode) {
        locationConditions.push(ilike(communities.state, stateCode));
      }
      
      conditions.push(or(...locationConditions));
    }
    
    return conditions;
  }
  
  private async buildPriceConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    
    // IMPORTANT: Most communities don't have pricing until enrichment
    // So we should NOT filter out communities without pricing by default
    // Only apply price filters when explicitly requested
    
    const priceMatch = query.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
    if (priceMatch) {
      const prices = priceMatch.map(p => parseInt(p.replace(/[$,]/g, '')));
      console.log(`Price filtering requested: ${prices.join(', ')}`);
      console.log(`Note: Only showing communities with pricing data. Many communities require enrichment for pricing.`);
      
      if (query.includes('under') || query.includes('below') || query.includes('<')) {
        // Only filter communities that HAVE pricing data
        conditions.push(
          and(
            isNotNull(communities.rentPerMonth),
            sql`${communities.rentPerMonth} > 0`,  // Ensure it's a real price
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
    
    // Handle qualitative terms
    if (query.includes('cheap') || query.includes('affordable')) {
      console.log('Affordable filtering: showing communities under $4000/month (where pricing is available)');
      conditions.push(
        and(
          isNotNull(communities.rentPerMonth),
          sql`${communities.rentPerMonth} > 0`,
          sql`${communities.rentPerMonth} < 4000`
        )
      );
    } else if (query.includes('expensive') || query.includes('luxury') || query.includes('premium')) {
      console.log('Luxury filtering: showing communities over $7000/month (where pricing is available)');
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
      
      // Use correct column name: careTypes (camelCase, not snake_case)
      const careTypeConditions = matchedCareTypes.map(careType => 
        sql`${communities.careTypes}::text ILIKE '%' || ${careType} || '%'`
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
  
  // Check if the query is healthcare-related
  private async isHealthcareSearch(query: string): Promise<boolean> {
    const healthcareKeywords = [
      'hospital', 'hospitals', 'medical', 'clinic', 'urgent care', 
      'therapy', 'therapist', 'physical therapy', 'occupational therapy',
      'speech therapy', 'adult day', 'respite', 'home care', 'home health',
      'personal care', 'emergency', 'surgery', 'diagnostic', 'radiology',
      'cardiology', 'neurology', 'oncology', 'pediatric', 'maternity',
      'trauma', 'rehabilitation', 'rehab', 'hospice', 'palliative',
      'dialysis', 'infusion', 'wound care', 'pain management',
      'mental health', 'behavioral health', 'psychiatric', 'counseling',
      'pharmacy', 'laboratory', 'lab', 'imaging', 'x-ray', 'mri', 'ct scan',
      'specialist', 'primary care', 'doctor', 'physician', 'nurse',
      'healthcare', 'health care', 'medical center', 'health center',
      'community health', 'wellness', 'preventive care', 'screening',
      'vaccine', 'immunization', 'testing', 'diagnosis', 'treatment',
      // Additional healthcare services
      'dental', 'dentist', 'dentistry', 'orthodontic', 'oral',
      'vision', 'eye', 'optometry', 'optometrist', 'ophthalmology', 'optical',
      'hearing', 'audiology', 'audiologist', 'ear',
      'podiatry', 'podiatrist', 'foot', 'chiropractor', 'chiropractic',
      'acupuncture', 'nutritionist', 'dietitian', 'nutrition',
      'substance abuse', 'addiction', 'detox', 'recovery',
      'outpatient', 'inpatient', 'ambulatory', 'telemedicine', 'telehealth'
    ];
    
    const lowerQuery = query.toLowerCase();
    return healthcareKeywords.some(keyword => lowerQuery.includes(keyword));
  }
  
  // Search healthcare services
  private async searchHealthcareServices(query: string, limit: number, offset: number): Promise<{
    services: any[];
    facets: { name: string; count: number }[];
  }> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // Search healthcare service types
      const searchQuery = db
        .select()
        .from(healthcareServiceTypes)
        .where(
          or(
            ilike(healthcareServiceTypes.name, `%${lowerQuery}%`),
            ilike(healthcareServiceTypes.displayName, `%${lowerQuery}%`),
            ilike(healthcareServiceTypes.serviceType, `%${lowerQuery}%`)
          )
        )
        .orderBy(desc(healthcareServiceTypes.count))
        .limit(limit)
        .offset(offset);
      
      const services = await searchQuery;
      
      // Build facets from results
      const facets = services
        .filter(s => s.count > 0)
        .map(s => ({
          name: s.displayName,
          count: s.count
        }))
        .slice(0, 10); // Top 10 facets
      
      return { services, facets };
    } catch (error) {
      console.error('Healthcare services search error:', error);
      return { services: [], facets: [] };
    }
  }
  
  // Add dedicated suggestions method for the suggestions endpoint
  async generateSearchSuggestions(query: string): Promise<string[]> {
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions: string[] = [];
    
    // Don't provide suggestions for very short queries
    if (normalizedQuery.length < 2) {
      return [];
    }
    
    try {
      // 1. Search for actual community names (highest priority)
      const communityNameResults = await db
        .select({
          name: communities.name,
          city: communities.city,
          state: communities.state
        })
        .from(communities)
        .where(
          or(
            ilike(communities.name, `${normalizedQuery}%`),  // Starts with
            ilike(communities.name, `%${normalizedQuery}%`)  // Contains
          )
        )
        .orderBy(sql`
          CASE 
            WHEN LOWER(${communities.name}) LIKE LOWER(${normalizedQuery}) || '%' THEN 1
            ELSE 2
          END,
          LENGTH(${communities.name})
        `)
        .limit(5);
      
      // Add community names to suggestions
      communityNameResults.forEach(community => {
        if (!suggestions.includes(community.name)) {
          suggestions.push(community.name);
        }
      });
      
      // 2. Search for cities that match
      const cityResults = await db
        .select({
          city: communities.city,
          state: communities.state,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          ilike(communities.city, `${normalizedQuery}%`)  // Cities starting with query
        )
        .groupBy(communities.city, communities.state)
        .having(sql`COUNT(*) > 0`)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(3);
      
      // Add city suggestions
      cityResults.forEach(location => {
        const cityStateSuggestion = `${location.city}, ${location.state}`;
        if (!suggestions.includes(cityStateSuggestion)) {
          suggestions.push(cityStateSuggestion);
        }
      });
      
      // 3. Search for states (if query is 2+ chars)
      if (normalizedQuery.length >= 2) {
        const stateResults = await db
          .select({
            state: communities.state,
            count: sql<number>`COUNT(*)::int`.as('count')
          })
          .from(communities)
          .where(
            or(
              ilike(communities.state, `${normalizedQuery}%`),  // State abbreviation
              ilike(communities.state, `%${normalizedQuery}%`)  // State name contains
            )
          )
          .groupBy(communities.state)
          .having(sql`COUNT(*) > 0`)
          .orderBy(desc(sql`COUNT(*)`))
          .limit(2);
        
        stateResults.forEach(state => {
          if (!suggestions.includes(state.state)) {
            suggestions.push(state.state);
          }
        });
      }
      
      // 4. Search for management companies
      const companyResults = await db
        .select({
          managementCompany: communities.managementCompany,
          count: sql<number>`COUNT(*)::int`.as('count')
        })
        .from(communities)
        .where(
          and(
            ilike(communities.managementCompany, `%${normalizedQuery}%`),
            sql`${communities.managementCompany} IS NOT NULL`,
            sql`${communities.managementCompany} != ''`
          )
        )
        .groupBy(communities.managementCompany)
        .having(sql`COUNT(*) > 0`)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(2);
      
      companyResults.forEach(company => {
        if (company.managementCompany && !suggestions.includes(company.managementCompany)) {
          suggestions.push(company.managementCompany);
        }
      });
      
    } catch (error) {
      console.error('Database suggestion error:', error);
      // Return basic fallback suggestions if database fails
      return [
        `${query} senior living`,
        `${query} communities`,
        `senior living near ${query}`
      ].slice(0, 5);
    }
    
    // Remove duplicates and limit to 8 suggestions
    return [...new Set(suggestions)].slice(0, 8);
  }
}

export const comprehensiveSearchEngine = new ComprehensiveSearchEngine();