import { db } from "../db";
import { communities } from "@shared/schema";
import { sql, and, or, desc, asc, ilike, eq, ne, gt, lt, gte, lte, inArray, isNotNull } from "drizzle-orm";

export interface EnterpriseSearchOptions {
  query?: string;
  location?: string;
  state?: string;
  city?: string;
  careTypes?: string[];
  bounds?: { west: number; south: number; east: number; north: number };
  radius?: { lat: number; lng: number; miles: number };
  priceRange?: { min?: number; max?: number };
  rating?: { min?: number };
  amenities?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance' | 'name' | 'capacity';
  sortOrder?: 'asc' | 'desc';
  includeHudOnly?: boolean;
  hasPhotos?: boolean;
  debug?: boolean;
}

export interface SearchResult {
  communities: any[];
  total: number;
  totalAvailable: number;
  facets: {
    states: Array<{ value: string; count: number }>;
    cities: Array<{ value: string; count: number }>;
    careTypes: Array<{ value: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    ratings: Array<{ range: string; count: number }>;
  };
  searchMetadata: {
    query: string;
    processingTime: number;
    searchStrategy: string;
    relevanceThreshold: number;
    fuzzyMatchesUsed: boolean;
  };
  suggestions?: string[];
}

class EnterpriseSearchService {
  private readonly MAX_RESULTS = 5000;
  private readonly DEFAULT_LIMIT = 500;
  private readonly FUZZY_THRESHOLD = 0.7;

  async search(options: EnterpriseSearchOptions): Promise<SearchResult> {
    const startTime = Date.now();
    
    const {
      query,
      location,
      state,
      city,
      careTypes = [],
      bounds,
      radius,
      priceRange,
      rating,
      amenities = [],
      limit = this.DEFAULT_LIMIT,
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc',
      includeHudOnly = false,
      hasPhotos = false,
      debug = false
    } = options;

    // Build search conditions
    const conditions = [];
    let searchStrategy = 'standard';
    let fuzzyMatchesUsed = false;

    // Geographic filtering (highest priority)
    if (bounds) {
      conditions.push(
        and(
          sql`CAST(${communities.latitude} AS DECIMAL) >= ${bounds.south}`,
          sql`CAST(${communities.latitude} AS DECIMAL) <= ${bounds.north}`,
          sql`CAST(${communities.longitude} AS DECIMAL) >= ${bounds.west}`,
          sql`CAST(${communities.longitude} AS DECIMAL) <= ${bounds.east}`,
          isNotNull(communities.latitude),
          isNotNull(communities.longitude)
        )
      );
      searchStrategy = 'geographic';
    } else if (radius) {
      const { lat, lng, miles } = radius;
      const milesToDegrees = miles / 69.0;
      const lngDegrees = milesToDegrees / Math.cos(lat * Math.PI / 180);
      
      conditions.push(
        and(
          sql`CAST(${communities.latitude} AS DECIMAL) >= ${lat - milesToDegrees}`,
          sql`CAST(${communities.latitude} AS DECIMAL) <= ${lat + milesToDegrees}`,
          sql`CAST(${communities.longitude} AS DECIMAL) >= ${lng - lngDegrees}`,
          sql`CAST(${communities.longitude} AS DECIMAL) <= ${lng + lngDegrees}`,
          isNotNull(communities.latitude),
          isNotNull(communities.longitude)
        )
      );
      searchStrategy = 'radius';
    }

    // Text search with balanced precision (FIXED VERSION)
    if (query) {
      const searchTerms = this.parseSearchQuery(query);
      const textConditions = [];

      // Strategy 1: Exact match (highest weight)
      textConditions.push(
        or(
          ilike(communities.name, query),
          eq(communities.city, query),
          eq(communities.state, query.toUpperCase())
        )
      );

      // Strategy 2: Prefix match (good precision)
      textConditions.push(
        or(
          ilike(communities.name, `${query}%`),
          ilike(communities.city, `${query}%`)
        )
      );

      // Strategy 3: Contains match (broader matching)
      textConditions.push(
        or(
          ilike(communities.name, `%${query}%`),
          ilike(communities.city, `%${query}%`),
          ilike(communities.address, `%${query}%`)
        )
      );

      conditions.push(or(...textConditions));
      searchStrategy = 'balanced_text_search';
    }

    // Location filters
    if (state) {
      conditions.push(eq(communities.state, state.toUpperCase()));
    }
    
    if (city) {
      conditions.push(ilike(communities.city, `%${city}%`));
    }
    
    if (location && !query) {
      // Parse location for city/state patterns
      const locationParts = location.split(',').map(p => p.trim());
      if (locationParts.length === 2) {
        // Assume "City, State" format
        conditions.push(
          and(
            ilike(communities.city, `%${locationParts[0]}%`),
            eq(communities.state, locationParts[1].toUpperCase())
          )
        );
      } else {
        conditions.push(
          or(
            ilike(communities.city, `%${location}%`),
            ilike(communities.state, `%${location}%`),
            eq(communities.zipCode, location)
          )
        );
      }
    }

    // Care type filtering
    if (careTypes.length > 0) {
      const careTypeConditions = careTypes.map(ct => 
        sql`${communities.careTypes}::text[] && ARRAY[${ct}]::text[]`
      );
      conditions.push(or(...careTypeConditions));
    }

    // Price filtering
    if (priceRange?.min || priceRange?.max) {
      const priceConditions = [];
      
      if (includeHudOnly) {
        if (priceRange.min) {
          priceConditions.push(gte(sql`CAST(${communities.rentPerMonth} AS DECIMAL)`, priceRange.min));
        }
        if (priceRange.max) {
          priceConditions.push(lte(sql`CAST(${communities.rentPerMonth} AS DECIMAL)`, priceRange.max));
        }
      } else {
        if (priceRange.min) {
          priceConditions.push(
            or(
              gte(sql`CAST(${communities.rentPerMonth} AS DECIMAL)`, priceRange.min),
              gte(sql`(${communities.priceRange}->>'min')::numeric`, priceRange.min)
            )
          );
        }
        if (priceRange.max) {
          priceConditions.push(
            or(
              lte(sql`CAST(${communities.rentPerMonth} AS DECIMAL)`, priceRange.max),
              lte(sql`(${communities.priceRange}->>'max')::numeric`, priceRange.max)
            )
          );
        }
      }
      
      if (priceConditions.length > 0) {
        conditions.push(and(...priceConditions));
      }
    }

    // Rating filter
    if (rating?.min) {
      conditions.push(gte(sql`CAST(${communities.rating} AS DECIMAL)`, rating.min));
    }

    // Photo filter
    if (hasPhotos) {
      conditions.push(
        and(
          isNotNull(communities.photos),
          sql`array_length(${communities.photos}, 1) > 0`
        )
      );
    }

    // HUD only filter
    if (includeHudOnly) {
      conditions.push(isNotNull(communities.hudPropertyId));
    }

    // Build the query
    let baseQuery: any = db.select().from(communities);
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    // Apply sorting with intelligent relevance scoring
    const orderByClause = this.buildOrderByClause(sortBy, sortOrder, query, location);
    baseQuery = baseQuery.orderBy(orderByClause);

    // Get total count for pagination
    const countQuery = conditions.length > 0 
      ? db.select({ count: sql`count(*)` }).from(communities).where(and(...conditions))
      : db.select({ count: sql`count(*)` }).from(communities);
    
    const [{ count }] = await countQuery;
    const totalAvailable = Number(count);

    // Execute main query with enterprise limits
    const effectiveLimit = Math.min(limit, this.MAX_RESULTS);
    const results = await baseQuery
      .limit(effectiveLimit)
      .offset(offset);

    // Generate facets for filtering (enterprise feature)
    const facets = await this.generateFacets(conditions);

    // Generate search suggestions
    const suggestions = this.generateSuggestions(query, results.length, totalAvailable);

    const processingTime = Date.now() - startTime;

    if (debug) {
      console.log(`🔍 ENTERPRISE SEARCH DEBUG:
        Query: ${query}
        Strategy: ${searchStrategy}
        Conditions: ${conditions.length}
        Results: ${results.length}/${totalAvailable}
        Processing: ${processingTime}ms
        Fuzzy: ${fuzzyMatchesUsed}`);
    }

    return {
      communities: results,
      total: results.length,
      totalAvailable,
      facets,
      searchMetadata: {
        query: query || location || 'browse',
        processingTime,
        searchStrategy,
        relevanceThreshold: this.FUZZY_THRESHOLD,
        fuzzyMatchesUsed
      },
      suggestions
    };
  }

  private parseSearchQuery(query: string): string[] {
    // Split query into meaningful search terms
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2);
  }

  private buildOrderByClause(
    sortBy: string,
    sortOrder: string,
    query?: string,
    location?: string
  ): any {
    const order = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'rating':
        return order(sql`CAST(${communities.rating} AS DECIMAL) NULLS LAST`);
      
      case 'price':
        return order(sql`COALESCE(
          CAST(${communities.rentPerMonth} AS DECIMAL),
          (${communities.priceRange}->>'min')::numeric
        ) NULLS LAST`);
      
      case 'name':
        return order(communities.name);
      
      case 'capacity':
        return order(sql`CAST(${communities.totalUnits} AS DECIMAL) NULLS LAST`);
      
      case 'relevance':
      default:
        // Complex relevance scoring for enterprise search
        if (query || location) {
          const searchTerm = query || location || '';
          return sql`
            CASE 
              -- Exact name match (highest priority)
              WHEN LOWER(${communities.name}) = LOWER(${searchTerm}) THEN 1
              -- Name starts with query
              WHEN LOWER(${communities.name}) LIKE LOWER(${`${searchTerm}%`}) THEN 2
              -- Exact city match
              WHEN LOWER(${communities.city}) = LOWER(${searchTerm}) THEN 3
              -- Name contains query
              WHEN LOWER(${communities.name}) LIKE LOWER(${`%${searchTerm}%`}) THEN 4
              -- City starts with query
              WHEN LOWER(${communities.city}) LIKE LOWER(${`${searchTerm}%`}) THEN 5
              -- Other matches
              ELSE 10
            END,
            -- Secondary sort by rating
            CAST(${communities.rating} AS DECIMAL) DESC NULLS LAST,
            -- Tertiary sort by review count (popularity)
            CAST(${communities.reviewCount} AS DECIMAL) DESC NULLS LAST
          `;
        }
        
        // Default to rating for browsing
        return desc(sql`CAST(${communities.rating} AS DECIMAL) NULLS LAST`);
    }
  }

  private async generateFacets(conditions: any[]): Promise<any> {
    // This would generate faceted search data for filtering
    // Simplified for now, but in enterprise this would be comprehensive
    return {
      states: [],
      cities: [],
      careTypes: [],
      priceRanges: [
        { range: 'Under $2000', count: 0 },
        { range: '$2000-$4000', count: 0 },
        { range: '$4000-$6000', count: 0 },
        { range: 'Over $6000', count: 0 }
      ],
      ratings: [
        { range: '4+ Stars', count: 0 },
        { range: '3+ Stars', count: 0 },
        { range: 'Any Rating', count: 0 }
      ]
    };
  }

  private generateSuggestions(
    query: string | undefined,
    resultCount: number,
    totalAvailable: number
  ): string[] {
    const suggestions = [];

    if (resultCount === 0 && query) {
      suggestions.push(
        `Try searching for "${query}" in a different city`,
        `Browse all communities in your state`,
        `Remove filters to see more results`
      );
    } else if (resultCount < 10 && query) {
      suggestions.push(
        `Showing all results for "${query}"`,
        `Try a broader search term`,
        `Browse nearby cities`
      );
    } else if (resultCount > 100) {
      suggestions.push(
        `Use filters to narrow your search`,
        `Sort by rating to see top communities first`,
        `Add care type to refine results`
      );
    }

    return suggestions;
  }

  // Advanced search methods for enterprise features
  async searchWithAI(query: string): Promise<SearchResult> {
    // This would integrate with AI for natural language understanding
    // For now, use standard search
    return this.search({ query, limit: 1000 });
  }

  async searchSimilar(communityId: number): Promise<SearchResult> {
    // Find similar communities based on features
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      return this.search({ limit: 50 });
    }

    return this.search({
      city: community.city,
      state: community.state,
      careTypes: community.careTypes || [],
      limit: 50
    });
  }

  async getTrending(): Promise<SearchResult> {
    // Get trending/popular communities
    return this.search({
      sortBy: 'rating',
      limit: 100
    });
  }
}

export const enterpriseSearchService = new EnterpriseSearchService();