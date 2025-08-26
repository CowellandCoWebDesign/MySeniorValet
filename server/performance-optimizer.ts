/**
 * Performance Optimizer Service
 * Provides comprehensive performance monitoring and optimization for MySeniorValet
 */

import { db } from "./db";
import { sql } from "drizzle-orm";
import { communities, vendors, users } from "../shared/schema";

export class PerformanceOptimizer {
  private queryMetrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();
  private cacheHitRate: Map<string, { hits: number; misses: number }> = new Map();

  /**
   * Analyze database performance and suggest optimizations
   */
  async analyzeDatabasePerformance() {
    console.log("🔍 Analyzing database performance...");

    // Check for missing indexes
    const indexAnalysis = await this.checkIndexes();
    
    // Analyze slow queries
    const slowQueries = await this.identifySlowQueries();
    
    // Check table sizes and suggest partitioning
    const tableSizes = await this.analyzeTableSizes();

    return {
      indexes: indexAnalysis,
      slowQueries,
      tableSizes,
      recommendations: this.generateRecommendations(indexAnalysis, slowQueries, tableSizes)
    };
  }

  /**
   * Check for missing indexes on frequently queried columns
   */
  private async checkIndexes() {
    const results: any[] = [];

    // Check indexes on communities table
    const communityIndexes = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'communities'
    `);

    // Identify missing indexes for common query patterns
    const recommendedIndexes = [
      { table: 'communities', columns: ['state', 'city'], reason: 'Frequent location-based queries' },
      { table: 'communities', columns: ['care_types'], reason: 'Care type filtering' },
      { table: 'communities', columns: ['price_range_min', 'price_range_max'], reason: 'Price range queries' },
      { table: 'searches', columns: ['user_id', 'created_at'], reason: 'User search history' },
      { table: 'vendors', columns: ['status', 'created_at'], reason: 'Active vendor queries' }
    ];

    return {
      existing: communityIndexes.rows,
      recommended: recommendedIndexes
    };
  }

  /**
   * Identify slow-running queries
   */
  private async identifySlowQueries() {
    try {
      // Get query statistics from pg_stat_statements if available
      const slowQueries = await db.execute(sql`
        SELECT 
          calls,
          total_exec_time,
          mean_exec_time,
          query
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `).catch(() => ({ rows: [] }));

      return slowQueries.rows;
    } catch (error) {
      console.log("pg_stat_statements extension not available");
      return [];
    }
  }

  /**
   * Analyze table sizes for optimization opportunities
   */
  private async analyzeTableSizes() {
    const tableSizes = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return tableSizes.rows;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(indexes: any, slowQueries: any[], tableSizes: any[]) {
    const recommendations = [];

    // Index recommendations
    if (indexes.recommended.length > 0) {
      recommendations.push({
        type: 'INDEX',
        priority: 'HIGH',
        description: 'Create missing indexes for frequently queried columns',
        actions: indexes.recommended.map((idx: any) => 
          `CREATE INDEX idx_${idx.table}_${idx.columns.join('_')} ON ${idx.table} (${idx.columns.join(', ')})`
        )
      });
    }

    // Query optimization recommendations
    if (slowQueries.length > 0) {
      recommendations.push({
        type: 'QUERY',
        priority: 'MEDIUM',
        description: 'Optimize slow queries',
        actions: ['Review and optimize queries with mean execution time > 100ms']
      });
    }

    // Table optimization recommendations
    const largeTables = tableSizes.filter((t: any) => parseInt(t.row_count) > 100000);
    if (largeTables.length > 0) {
      recommendations.push({
        type: 'TABLE',
        priority: 'LOW',
        description: 'Consider partitioning large tables',
        actions: largeTables.map((t: any) => `Consider partitioning ${t.tablename} (${t.row_count} rows)`)
      });
    }

    return recommendations;
  }

  /**
   * Optimize API response times
   */
  optimizeApiResponse(data: any, options: {
    fields?: string[];
    limit?: number;
    compress?: boolean;
  } = {}) {
    let optimized = data;

    // Field filtering
    if (options.fields && Array.isArray(data)) {
      optimized = data.map(item => {
        const filtered: any = {};
        options.fields!.forEach(field => {
          if (item[field] !== undefined) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    }

    // Pagination limit
    if (options.limit && Array.isArray(optimized)) {
      optimized = optimized.slice(0, options.limit);
    }

    return optimized;
  }

  /**
   * Cache warming for frequently accessed data
   */
  async warmCache() {
    console.log("🔥 Warming cache for frequently accessed data...");

    const warmupQueries = [
      // Popular states
      { key: 'popular_states', query: async () => {
        return await db.select({
          state: communities.state,
          count: sql<number>`COUNT(*)`
        })
        .from(communities)
        .groupBy(communities.state)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10);
      }},
      
      // HUD properties count
      { key: 'hud_count', query: async () => {
        return await db.select({
          count: sql<number>`COUNT(*)`
        })
        .from(communities)
        .where(sql`hud_property_id IS NOT NULL`);
      }},

      // Recent searches trends
      { key: 'search_trends', query: async () => {
        return await db.select({
          query: searches.query,
          count: sql<number>`COUNT(*)`
        })
        .from(searches)
        .where(sql`created_at > NOW() - INTERVAL '7 days'`)
        .groupBy(searches.query)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(20);
      }}
    ];

    const results = [];
    for (const warmup of warmupQueries) {
      try {
        const start = Date.now();
        const data = await warmup.query();
        const time = Date.now() - start;
        results.push({ key: warmup.key, time, success: true });
      } catch (error) {
        results.push({ key: warmup.key, error: error.message, success: false });
      }
    }

    return results;
  }

  /**
   * Monitor and log query performance
   */
  trackQueryPerformance(queryName: string, executionTime: number) {
    const current = this.queryMetrics.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
    
    current.count++;
    current.totalTime += executionTime;
    current.avgTime = current.totalTime / current.count;
    
    this.queryMetrics.set(queryName, current);

    // Log slow queries
    if (executionTime > 1000) {
      console.warn(`⚠️ Slow query detected: ${queryName} took ${executionTime}ms`);
    }
  }

  /**
   * Track cache hit rates
   */
  trackCacheHit(cacheKey: string, hit: boolean) {
    const current = this.cacheHitRate.get(cacheKey) || { hits: 0, misses: 0 };
    
    if (hit) {
      current.hits++;
    } else {
      current.misses++;
    }
    
    this.cacheHitRate.set(cacheKey, current);
  }

  /**
   * Get performance metrics summary
   */
  getMetricsSummary() {
    const queryMetrics = Array.from(this.queryMetrics.entries()).map(([name, metrics]) => ({
      name,
      ...metrics
    }));

    const cacheMetrics = Array.from(this.cacheHitRate.entries()).map(([key, metrics]) => ({
      key,
      hitRate: metrics.hits / (metrics.hits + metrics.misses) * 100,
      ...metrics
    }));

    return {
      queries: queryMetrics.sort((a, b) => b.avgTime - a.avgTime),
      cache: cacheMetrics.sort((a, b) => a.hitRate - b.hitRate),
      summary: {
        slowestQuery: queryMetrics[0],
        worstCache: cacheMetrics[0],
        avgQueryTime: queryMetrics.reduce((sum, q) => sum + q.avgTime, 0) / queryMetrics.length,
        avgCacheHitRate: cacheMetrics.reduce((sum, c) => sum + c.hitRate, 0) / cacheMetrics.length
      }
    };
  }

  /**
   * Create database indexes for performance
   */
  async createPerformanceIndexes() {
    const indexCreations = [
      // Location-based indexes
      sql`CREATE INDEX IF NOT EXISTS idx_communities_state_city ON communities(state, city)`,
      sql`CREATE INDEX IF NOT EXISTS idx_communities_coordinates ON communities(latitude, longitude)`,
      
      // Price indexes
      sql`CREATE INDEX IF NOT EXISTS idx_communities_price_range ON communities(price_range_min, price_range_max)`,
      
      // Care type index (GIN for JSONB)
      sql`CREATE INDEX IF NOT EXISTS idx_communities_care_types ON communities USING GIN(care_types)`,
      
      // Search performance
      sql`CREATE INDEX IF NOT EXISTS idx_searches_user_created ON searches(user_id, created_at DESC)`,
      sql`CREATE INDEX IF NOT EXISTS idx_searches_query ON searches(query)`,
      
      // Vendor queries
      sql`CREATE INDEX IF NOT EXISTS idx_vendors_status_created ON vendors(status, created_at DESC)`,
      
      // User favorites (if exists)
      sql`CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id) WHERE user_favorites EXISTS`
    ];

    const results = [];
    for (const indexSql of indexCreations) {
      try {
        await db.execute(indexSql);
        results.push({ index: indexSql.toString().match(/idx_\w+/)?.[0], status: 'created' });
      } catch (error: any) {
        results.push({ index: indexSql.toString().match(/idx_\w+/)?.[0], status: 'failed', error: error.message });
      }
    }

    return results;
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();