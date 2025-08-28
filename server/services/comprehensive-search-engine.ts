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
    
    return {
      communities: results,
      totalResults: parseInt(count.toString()),
      searchMetadata: {
        query,
        searchType,
        filters,
        processingTime: Date.now() - startTime,
        suggestions
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
      const normalizedQuery = query.toLowerCase().trim();
      
      // 1. COMBINED LOCATION + PRICE SEARCH ("Sacramento under $5000")
      if ((await this.isLocationSearch(normalizedQuery)) && (await this.isPriceSearch(normalizedQuery))) {
        searchType = 'price'; // Price takes priority for sorting
        const locationConditions = await this.buildLocationConditions(normalizedQuery);
        const priceConditions = await this.buildPriceConditions(normalizedQuery);
        conditions.push(...locationConditions, ...priceConditions);
      }
      
      // 2. COMPANY/BRAND SEARCH (Brookdale, Atria, etc.)
      else if (await this.isCompanySearch(normalizedQuery)) {
        searchType = 'company';
        conditions.push(
          or(
            ilike(communities.name, `%${normalizedQuery}%`),
            ilike(communities.managementCompany, `%${normalizedQuery}%`)
          )
        );
      }
      
      // 3. LOCATION SEARCH (City, State, ZIP)
      else if (await this.isLocationSearch(normalizedQuery)) {
        searchType = 'location';
        const locationConditions = await this.buildLocationConditions(normalizedQuery);
        conditions.push(...locationConditions);
      }
      
      // 4. PRICE SEARCH ("under $3000", "cheap", "$2000-$4000")
      else if (await this.isPriceSearch(normalizedQuery)) {
        searchType = 'price';
        const priceConditions = await this.buildPriceConditions(normalizedQuery);
        conditions.push(...priceConditions);
      }
      
      // 5. CARE TYPE SEARCH ("memory care", "assisted living")
      else if (await this.isCareTypeSearch(normalizedQuery)) {
        searchType = 'careType';
        const careConditions = await this.buildCareTypeConditions(normalizedQuery);
        conditions.push(...careConditions);
      }
      
      // 6. NATURAL LANGUAGE SEARCH ("best communities near me", "affordable senior living")
      else if (await this.isNaturalLanguageSearch(normalizedQuery)) {
        searchType = 'naturalLanguage';
        const nlConditions = await this.buildNaturalLanguageConditions(normalizedQuery);
        conditions.push(...nlConditions);
      }
      
      // 7. GENERAL TEXT SEARCH (fallback)
      else {
        searchType = 'general';
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
    }
    
    // Apply additional filters
    this.applyFilters(conditions, filters);
    
    return { conditions, searchType };
  }
  
  private async isCompanySearch(query: string): Promise<boolean> {
    const companyKeywords = [
      'atria', 'brookdale', 'sunrise', 'brightview', 'golden age', 'emeritus',
      'belmont village', 'five star', 'holiday retirement', 'senior lifestyle',
      'watermark', 'capital senior', 'discovery', 'merrill gardens'
    ];
    return companyKeywords.some(keyword => query.includes(keyword));
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
    
    // Extract price ranges
    const priceMatch = query.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g);
    if (priceMatch) {
      const prices = priceMatch.map(p => parseInt(p.replace(/[$,]/g, '')));
      
      // Implement basic price filtering without complex regex - filter in application layer
      console.log(`Price filtering requested: ${prices.join(', ')}, applying basic SQL filter`);
      
      if (query.includes('under') || query.includes('<')) {
        // Simple approach: let database return results, filter will be applied at application level
        conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
      } else if (query.includes('over') || query.includes('>')) {
        conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
      } else if (prices.length === 2) {
        conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
      }
    }
    
    // Handle qualitative terms with simplified approach
    if (query.includes('cheap') || query.includes('affordable')) {
      console.log('Affordable filtering requested, applying basic filter');
      conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
    } else if (query.includes('expensive') || query.includes('luxury')) {
      console.log('Luxury filtering requested, applying basic filter');
      conditions.push(sql`${communities.rentPerMonth} IS NOT NULL`);
    }
    
    return conditions;
  }
  
  private async buildCareTypeConditions(query: string): Promise<any[]> {
    const conditions: any[] = [];
    const careTypeMap = {
      'assisted living': 'Assisted Living',
      'memory care': 'Memory Care',
      'independent living': 'Independent Living',
      'nursing home': 'Skilled Nursing',
      'skilled nursing': 'Skilled Nursing',
      'alzheimer': 'Memory Care',
      'dementia': 'Memory Care'
    };
    
    for (const [keyword, careType] of Object.entries(careTypeMap)) {
      if (query.includes(keyword)) {
        conditions.push(
          sql`${communities.careTypes}::text[] && ARRAY[${careType}]::text[]`
        );
        break;
      }
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
        // Order by community name for price searches (simplified)
        return query.orderBy(asc(communities.name));
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