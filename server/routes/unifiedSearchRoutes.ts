import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, desc, sql, isNotNull, gte } from "drizzle-orm";
import { enhancedSearchService } from "../enhanced-search-service";
import { cache } from "../cache";
import { eliminateCallForPricing } from "../intelligent-pricing-system";

interface SearchParams {
  // Text search params
  q?: string;              // General query
  query?: string;          // Alias for q
  location?: string;       // City, state, or zip
  careType?: string;       // Care type filter
  
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
  // Unified intelligent search endpoint
  app.get("/api/communities/search", async (req, res) => {
    try {
      const params = req.query as unknown as SearchParams;
      const { 
        q, query, location, careType, bounds,
        limit = 50, offset = 0,
        minRating, priceMin, priceMax,
        hasPhotos, hudOnly,
        sortBy = 'relevance', sortOrder = 'desc'
      } = params;
      
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
      
      // Handle text search
      if (searchQuery) {
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
      
      // Apply pagination
      const results = await dbQuery
        .limit(Number(limit))
        .offset(Number(offset));
      
      // For text searches with few results, try enhanced search
      if (isTextSearch && results.length < 5 && (searchQuery || location)) {
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
  });
  
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
        .limit(5);
      
      const stateResults = await db
        .selectDistinct({ 
          value: communities.state,
          type: sql`'state'`
        })
        .from(communities)
        .where(sql`${communities.state} ILIKE ${searchTerm}`)
        .limit(3);
      
      const communityResults = await db
        .select({ 
          value: communities.name,
          type: sql`'community'`
        })
        .from(communities)
        .where(sql`${communities.name} ILIKE ${searchTerm}`)
        .limit(5);
      
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