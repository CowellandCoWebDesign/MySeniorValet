/**
 * 🚀 OPTIMIZED SEARCH ENGINE - Fast and Efficient Search
 * ======================================================
 * Replaces the slow multi-strategy search with a streamlined approach
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, ilike, and, or, sql } from 'drizzle-orm';
import { cache } from '../cache';
import type { Community } from '@shared/schema';

export class OptimizedSearchEngine {
  /**
   * Main search entry point - OPTIMIZED FOR SPEED
   */
  async search(query: string, options?: {
    limit?: number;
    offset?: number;
    filters?: any;
    searchType?: string;
  }): Promise<any> {
    const startTime = Date.now();
    
    // Normalize and validate query
    const normalizedQuery = query?.trim();
    if (!normalizedQuery) {
      return {
        communities: [],
        totalResults: 0,
        searchMetadata: {
          query,
          processingTime: 0,
          message: 'Empty query'
        }
      };
    }
    
    // Check cache first with shorter TTL
    const cacheKey = `optimized_search:${normalizedQuery}:${options?.limit}:${options?.offset}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      const result = JSON.parse(cached);
      result.searchMetadata.fromCache = true;
      return result;
    }
    
    try {
      // Perform optimized database search
      const results = await this.performOptimizedSearch(normalizedQuery, options);
      
      const response = {
        communities: results,
        totalResults: results.length,
        searchMetadata: {
          query: normalizedQuery,
          processingTime: Date.now() - startTime,
          sourcesUsed: ['database'],
          optimized: true
        }
      };
      
      // Cache successful results for 2 minutes
      if (results.length > 0) {
        await cache.set(cacheKey, JSON.stringify(response), 120);
      }
      
      return response;
    } catch (error) {
      console.error('Optimized search error:', error);
      return {
        communities: [],
        totalResults: 0,
        searchMetadata: {
          query: normalizedQuery,
          processingTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Search failed'
        }
      };
    }
  }
  
  private async performOptimizedSearch(query: string, options?: any): Promise<Community[]> {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    
    if (searchTerms.length === 0) {
      return [];
    }
    
    // Build optimized search conditions
    const conditions = [];
    
    // Check if it looks like a location search (city, state pattern)
    const locationMatch = query.match(/^([^,]+),\s*([A-Z]{2}|\w+)$/i);
    if (locationMatch) {
      const [, city, stateOrCountry] = locationMatch;
      
      // Exact location match first
      conditions.push(
        and(
          sql`LOWER(city) = LOWER(${city.trim()})`,
          or(
            sql`LOWER(state) = LOWER(${stateOrCountry.trim()})`,
            sql`LOWER(country) = LOWER(${stateOrCountry.trim()})`
          )
        )
      );
    } else {
      // Use the GIN indexes for fast text search
      // Build a single search pattern for all terms
      const searchPattern = searchTerms.join(' ');
      
      // Use the composite GIN index for efficient search
      conditions.push(
        sql`(
          LOWER(name) || ' ' || 
          COALESCE(LOWER(city), '') || ' ' || 
          COALESCE(LOWER(state), '') || ' ' || 
          COALESCE(LOWER(management_company), '')
        ) LIKE '%' || LOWER(${searchPattern}) || '%'`
      );
      
      // Also check individual fields for better relevance
      const fieldConditions = searchTerms.map(term => 
        or(
          sql`LOWER(name) LIKE '%' || LOWER(${term}) || '%'`,
          sql`LOWER(city) LIKE '%' || LOWER(${term}) || '%'`,
          sql`LOWER(state) LIKE '%' || LOWER(${term}) || '%'`,
          sql`LOWER(management_company) LIKE '%' || LOWER(${term}) || '%'`
        )
      );
      
      if (fieldConditions.length > 0) {
        conditions.push(or(...fieldConditions));
      }
    }
    
    // Build and execute the query
    const whereClause = conditions.length > 0 ? or(...conditions) : undefined;
    
    const results = await db
      .select()
      .from(communities)
      .where(whereClause)
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
    
    // Sort results by relevance (exact matches first)
    return this.sortByRelevance(results, query);
  }
  
  private sortByRelevance(results: Community[], query: string): Community[] {
    const lowerQuery = query.toLowerCase();
    
    return results.sort((a, b) => {
      // Exact name match gets highest priority
      const aExactName = a.name.toLowerCase() === lowerQuery ? 100 : 0;
      const bExactName = b.name.toLowerCase() === lowerQuery ? 100 : 0;
      
      // Name starts with query
      const aNameStarts = a.name.toLowerCase().startsWith(lowerQuery) ? 50 : 0;
      const bNameStarts = b.name.toLowerCase().startsWith(lowerQuery) ? 50 : 0;
      
      // Name contains query
      const aNameContains = a.name.toLowerCase().includes(lowerQuery) ? 25 : 0;
      const bNameContains = b.name.toLowerCase().includes(lowerQuery) ? 25 : 0;
      
      // City match
      const aCityMatch = a.city?.toLowerCase().includes(lowerQuery) ? 10 : 0;
      const bCityMatch = b.city?.toLowerCase().includes(lowerQuery) ? 10 : 0;
      
      // Calculate total scores
      const aScore = aExactName + aNameStarts + aNameContains + aCityMatch;
      const bScore = bExactName + bNameStarts + bNameContains + bCityMatch;
      
      return bScore - aScore;
    });
  }
}

export const optimizedSearchEngine = new OptimizedSearchEngine();