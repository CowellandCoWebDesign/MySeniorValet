import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, desc, sql, isNotNull, gte } from "drizzle-orm";
import { enhancedSearchService } from "../enhanced-search-service";
import { enterpriseSearchService } from "../services/enterprise-search-service";
import { cache } from "../cache";
import { eliminateCallForPricing } from "../intelligent-pricing-system";

interface SearchParams {
  // Text search params
  q?: string;              // General query
  query?: string;          // Alias for q
  location?: string;       // City, state, or zip
  careType?: string;       // Care type filter
  state?: string;          // State filter (FL, NY, TX, etc.)
  city?: string;           // City filter
  
  // Map search params
  bounds?: string;         // west,south,east,north
  
  // Common params
  limit?: number;
  offset?: number;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  hasPhotos?: boolean;
  hudOnly?: boolean;
  
  // Sorting
  sortBy?: 'rating' | 'price' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export function registerUnifiedSearchRoutes(app: Express) {
  // ENTERPRISE SEARCH ENDPOINT - Primary search with advanced features
  app.get("/api/search/enterprise", async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Parse all possible search parameters
      const {
        q, query, location, state, city,
        careTypes, bounds, radius,
        priceMin, priceMax, minRating,
        amenities, hasPhotos, hudOnly,
        limit = '1000', offset = '0',
        sortBy = 'relevance', sortOrder = 'desc',
        debug = 'false'
      } = req.query;

      // Parse bounds if provided
      let parsedBounds;
      if (bounds) {
        const [west, south, east, north] = (bounds as string).split(',').map(Number);
        parsedBounds = { west, south, east, north };
      }

      // Parse radius if provided
      let parsedRadius;
      if (radius && req.query.lat && req.query.lng) {
        parsedRadius = {
          lat: parseFloat(req.query.lat as string),
          lng: parseFloat(req.query.lng as string),
          miles: parseFloat(radius as string)
        };
      }

      // Use enterprise search service
      const results = await enterpriseSearchService.search({
        query: (q || query) as string,
        location: location as string,
        state: state as string,
        city: city as string,
        careTypes: careTypes ? (careTypes as string).split(',') : [],
        bounds: parsedBounds,
        radius: parsedRadius,
        priceRange: {
          min: priceMin ? parseFloat(priceMin as string) : undefined,
          max: priceMax ? parseFloat(priceMax as string) : undefined
        },
        rating: {
          min: minRating ? parseFloat(minRating as string) : undefined
        },
        amenities: amenities ? (amenities as string).split(',') : [],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        includeHudOnly: hudOnly === 'true',
        hasPhotos: hasPhotos === 'true',
        debug: debug === 'true'
      });

      // Apply pricing intelligence
      results.communities = results.communities.map(c => eliminateCallForPricing(c));

      // Add performance metrics
      const totalTime = Date.now() - startTime;
      
      res.json({
        ...results,
        performance: {
          totalTime,
          cached: false,
          version: 'enterprise_v1'
        }
      });
      
    } catch (error) {
      console.error('Enterprise search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: '/api/communities/search'
      });
    }
  });

  // AI-powered natural language search
  app.get("/api/search/ai", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Query required' });
      }

      const results = await enterpriseSearchService.searchWithAI(q as string);
      results.communities = results.communities.map(c => eliminateCallForPricing(c));
      
      res.json(results);
    } catch (error) {
      console.error('AI search error:', error);
      res.status(500).json({ error: 'AI search failed' });
    }
  });

  // Find similar communities
  app.get("/api/search/similar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const results = await enterpriseSearchService.searchSimilar(parseInt(id));
      results.communities = results.communities.map(c => eliminateCallForPricing(c));
      
      res.json(results);
    } catch (error) {
      console.error('Similar search error:', error);
      res.status(500).json({ error: 'Similar search failed' });
    }
  });

  // Get trending communities
  app.get("/api/search/trending", async (req, res) => {
    try {
      const results = await enterpriseSearchService.getTrending();
      results.communities = results.communities.map(c => eliminateCallForPricing(c));
      
      res.json(results);
    } catch (error) {
      console.error('Trending search error:', error);
      res.status(500).json({ error: 'Trending search failed' });
    }
  });
  // Geocoding endpoint for location searches
  app.get("/api/geocode", async (req, res) => {
    try {
      const { location } = req.query;
      if (!location) {
        return res.status(400).json({ error: "Location parameter required" });
      }
      
      // Import geocoding function
      const { geocodeLocation } = await import('../geocoding-data');
      const coords = geocodeLocation(location as string);
      
      if (coords) {
        console.log(`📍 Geocoded "${location}" to:`, coords);
        return res.json({ 
          success: true,
          location: location,
          coordinates: coords,
          lat: coords.lat,
          lng: coords.lng
        });
      } else {
        console.log(`❌ Could not geocode "${location}"`);
        return res.json({ 
          success: false,
          location: location,
          message: "Location not found in geocoding database"
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Geocoding failed" });
    }
  });

  // Main search handler function
  const handleUnifiedSearch = async (req: any, res: any) => {
    try {
      const params = req.query as unknown as SearchParams;
      const { 
        q, query, location, careType, state, city, bounds,
        limit = 500, offset = 0,  // ENTERPRISE: Default to 500 results for comprehensive coverage
        minRating, priceMin, priceMax,
        hasPhotos, hudOnly,
        sortBy = 'relevance', sortOrder = 'desc'
      } = params;
      
      console.log('Search request with params:', { q, query, location, careType, state, city, bounds });
      
      // Determine search type
      const searchQuery = q || query;
      const isMapSearch = !!bounds;
      const isTextSearch = !!(searchQuery || location || careType);
      
      // Cache key for results
      const cacheKey = `search:${JSON.stringify(params)}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      let whereConditions = [];
      
      // Handle map bounds search
      if (isMapSearch) {
        const boundsArray = bounds.split(',').map(Number);
        if (boundsArray.length !== 4) {
          return res.status(400).json({ 
            error: "Invalid bounds format. Use: bounds=west,south,east,north" 
          });
        }
        
        const [west, south, east, north] = boundsArray;
        whereConditions.push(
          and(
            sql`${communities.longitude}::numeric BETWEEN ${west} AND ${east}`,
            sql`${communities.latitude}::numeric BETWEEN ${south} AND ${north}`,
            isNotNull(communities.latitude),
            isNotNull(communities.longitude)
          )
        );
      }
      
      // Handle text search with intelligent parsing
      if (searchQuery) {
        // Check if query matches "City State" pattern (e.g., "Norman OK", "Laval QC")
        const cityStatePattern = /^([a-zA-Z\s-]+)\s+([A-Z]{2})$/;
        const match = searchQuery.trim().match(cityStatePattern);
        
        if (match) {
          // It's a city + state query
          const [, cityPart, statePart] = match;
          console.log(`📍 Detected city-state search: city="${cityPart}", state="${statePart}"`);
          whereConditions.push(
            and(
              sql`${communities.city} ILIKE ${`%${cityPart.trim()}%`}`,
              sql`${communities.state} = ${statePart.toUpperCase()}`
            )
          );
        } else {
          // Regular text search
          const searchTerm = `%${searchQuery}%`;
          whereConditions.push(
            or(
              sql`${communities.name} ILIKE ${searchTerm}`,
              sql`${communities.description} ILIKE ${searchTerm}`,
              sql`${communities.city} ILIKE ${searchTerm}`,
              sql`${communities.state} ILIKE ${searchTerm}`,
              sql`${communities.address} ILIKE ${searchTerm}`
            )
          );
        }
      }
      
      // Handle location search
      if (location && !searchQuery) {
        const locationTerm = `%${location}%`;
        whereConditions.push(
          or(
            sql`${communities.city} ILIKE ${locationTerm}`,
            sql`${communities.state} ILIKE ${locationTerm}`,
            sql`${communities.zipCode} = ${location}`, // Exact zip match
            sql`${communities.address} ILIKE ${locationTerm}`
          )
        );
      }
      
      // State filter - CRITICAL FIX for state-specific searches
      if (state) {
        console.log(`🔍 Filtering by state: ${state}`);
        whereConditions.push(
          sql`${communities.state} = ${state.toUpperCase()}`
        );
      }
      
      // City filter
      if (city) {
        console.log(`🔍 Filtering by city: ${city}`);
        whereConditions.push(
          sql`${communities.city} ILIKE ${`%${city}%`}`
        );
      }
      
      // Care type filter
      if (careType && careType !== 'All Types') {
        whereConditions.push(
          sql`${communities.careTypes}::text[] && ARRAY[${careType}]::text[]`
        );
      }
      
      // Rating filter
      if (minRating && minRating > 0) {
        whereConditions.push(
          sql`${communities.rating}::numeric >= ${minRating}`
        );
      }
      
      // Price filters
      if (priceMin || priceMax) {
        if (hudOnly) {
          // For HUD properties, use rentPerMonth
          if (priceMin) {
            whereConditions.push(
              sql`CAST(${communities.rentPerMonth} AS DECIMAL) >= ${priceMin}`
            );
          }
          if (priceMax) {
            whereConditions.push(
              sql`CAST(${communities.rentPerMonth} AS DECIMAL) <= ${priceMax}`
            );
          }
        } else {
          // For regular properties, use priceRange JSON
          if (priceMin) {
            whereConditions.push(
              sql`(${communities.priceRange}->>'min')::numeric >= ${priceMin}`
            );
          }
          if (priceMax) {
            whereConditions.push(
              sql`(${communities.priceRange}->>'max')::numeric <= ${priceMax}`
            );
          }
        }
      }
      
      // Photo filter
      if (hasPhotos === true) {
        whereConditions.push(
          sql`${communities.photos} IS NOT NULL AND array_length(${communities.photos}, 1) > 0`
        );
      }
      
      // HUD only filter
      if (hudOnly === true) {
        whereConditions.push(
          isNotNull(communities.hudPropertyId)
        );
      }
      
      // Build the database query
      let dbQuery = db.select().from(communities);
      
      if (whereConditions.length > 0) {
        dbQuery = dbQuery.where(and(...whereConditions));
      }
      
      // Apply sorting
      let orderByClause;
      switch (sortBy) {
        case 'rating':
          orderByClause = sortOrder === 'asc' 
            ? sql`CAST(${communities.rating} AS DECIMAL) ASC NULLS LAST`
            : sql`CAST(${communities.rating} AS DECIMAL) DESC NULLS LAST`;
          break;
        case 'price':
          if (hudOnly) {
            orderByClause = sortOrder === 'asc'
              ? sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC NULLS LAST`
              : sql`CAST(${communities.rentPerMonth} AS DECIMAL) DESC NULLS LAST`;
          } else {
            orderByClause = sortOrder === 'asc'
              ? sql`(${communities.priceRange}->>'min')::numeric ASC NULLS LAST`
              : sql`(${communities.priceRange}->>'max')::numeric DESC NULLS LAST`;
          }
          break;
        case 'relevance':
        default:
          // For relevance, prioritize exact matches, then ratings
          if (searchQuery || location) {
            orderByClause = sql`
              CASE 
                WHEN LOWER(${communities.name}) = LOWER(${searchQuery || location || ''}) THEN 1
                WHEN LOWER(${communities.name}) LIKE LOWER(${`%${searchQuery || location || ''}%`}) THEN 2
                WHEN LOWER(${communities.city}) = LOWER(${searchQuery || location || ''}) THEN 3
                ELSE 4
              END,
              CAST(${communities.rating} AS DECIMAL) DESC NULLS LAST
            `;
          } else {
            orderByClause = sql`CAST(${communities.rating} AS DECIMAL) DESC NULLS LAST`;
          }
      }
      
      dbQuery = dbQuery.orderBy(orderByClause);
      
      // Get total count for pagination
      const countQuery = whereConditions.length > 0 
        ? db.select({ count: sql`count(*)` }).from(communities).where(and(...whereConditions))
        : db.select({ count: sql`count(*)` }).from(communities);
      
      const [{ count }] = await countQuery;
      const totalCount = Number(count);
      
      // Apply pagination with enterprise-grade limits
      const maxLimit = 2000; // Maximum results per query for performance
      const effectiveLimit = Math.min(Number(limit), maxLimit);
      const results = await dbQuery
        .limit(effectiveLimit)
        .offset(Number(offset));
      
      // For text searches with few results, try enhanced search  
      if (isTextSearch && results.length < 50 && (searchQuery || location)) { // ENTERPRISE: More aggressive fallback
        console.log('Few results found, trying enhanced search...');
        try {
          const enhancedResults = await enhancedSearchService.searchCommunities({
            location: location || searchQuery || '',
            careType: careType,
            budget: priceMax ? `Under $${priceMax}` : undefined,
            limit: Number(limit)
          });
          
          if (enhancedResults.communities.length > results.length) {
            const response = {
              communities: enhancedResults.communities.map(community => eliminateCallForPricing(community)),
              total: enhancedResults.communities.length,
              totalAvailable: totalCount,
              searchType: 'enhanced',
              searchMetadata: enhancedResults.searchMetadata,
              query: params,
              message: 'Enhanced search found additional results'
            };
            
            // Cache for 5 minutes
            await cache.set(cacheKey, response, 300);
            return res.json(response);
          }
        } catch (error) {
          console.error('Enhanced search failed, using regular results:', error);
        }
      }
      
      const response = {
        communities: results.map(community => eliminateCallForPricing(community)),
        total: results.length,
        totalAvailable: totalCount,
        searchType: isMapSearch ? 'map' : 'text',
        query: params,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          hasMore: totalCount > Number(offset) + results.length
        }
      };
      
      // Cache for 5 minutes
      await cache.set(cacheKey, response, 300);
      
      res.json(response);
      
    } catch (error) {
      console.error('Unified search error:', error);
      res.status(500).json({ 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  // Register both endpoint paths to handle frontend compatibility
  app.get("/api/communities/search", handleUnifiedSearch);
  app.get("/api/communities/search/unified", handleUnifiedSearch);
  
  // Quick search suggestions endpoint
  app.get("/api/communities/search/suggestions", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || (q as string).length < 2) {
        return res.json({ suggestions: [] });
      }
      
      const searchTerm = `${q}%`; // Prefix match for suggestions
      
      // Get unique cities and states that match
      const cityResults = await db
        .selectDistinct({ 
          value: communities.city,
          type: sql`'city'`
        })
        .from(communities)
        .where(sql`${communities.city} ILIKE ${searchTerm}`)
        .limit(20); // ENTERPRISE: More city suggestions
      
      const stateResults = await db
        .selectDistinct({ 
          value: communities.state,
          type: sql`'state'`
        })
        .from(communities)
        .where(sql`${communities.state} ILIKE ${searchTerm}`)
        .limit(10); // ENTERPRISE: More state suggestions
      
      const communityResults = await db
        .select({ 
          value: communities.name,
          type: sql`'community'`
        })
        .from(communities)
        .where(sql`${communities.name} ILIKE ${searchTerm}`)
        .limit(25); // ENTERPRISE: More community suggestions
      
      const suggestions = [
        ...cityResults,
        ...stateResults,
        ...communityResults
      ];
      
      res.json({ suggestions });
      
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });
  
  // Search analytics endpoint
  app.post("/api/communities/search/analytics", async (req, res) => {
    try {
      const { query, resultCount, searchType, userId } = req.body;
      
      // Log search analytics (could be stored in database)
      console.log('Search analytics:', {
        query,
        resultCount,
        searchType,
        userId,
        timestamp: new Date()
      });
      
      res.json({ success: true });
      
    } catch (error) {
      console.error('Search analytics error:', error);
      res.status(500).json({ error: 'Failed to log analytics' });
    }
  });
}