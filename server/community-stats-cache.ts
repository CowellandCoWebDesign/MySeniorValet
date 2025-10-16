/**
 * Community Statistics Cache
 * Maintains cached counts to avoid expensive database queries on every home page load
 */

import { db } from "./db";
import { communities } from "@shared/schema";
import { sql } from "drizzle-orm";

interface CommunityStats {
  totalCommunities: number;
  lastUpdated: Date;
  byState: Record<string, number>;
  byCareType: Record<string, number>;
}

class CommunityStatsCache {
  private stats: CommunityStats | null = null;
  private cacheExpiry = 12 * 60 * 60 * 1000; // 12 hours for better performance

  /**
   * Get cached community statistics
   */
  async getStats(): Promise<CommunityStats> {
    // Skip cache in development for real-time updates
    if (process.env.NODE_ENV === 'development') {
      await this.refreshCache();
      return this.stats!;
    }

    // Return cached stats if valid and recent
    if (this.stats && this.isValidCache()) {
      return this.stats;
    }

    // Refresh cache if expired or missing
    await this.refreshCache();
    return this.stats!;
  }

  /**
   * Get just the total count (fastest operation)
   */
  async getTotalCount(): Promise<number> {
    // Skip cache in development for real-time updates
    if (process.env.NODE_ENV === 'development') {
      const result = await db.select({ count: sql<number>`count(*)` }).from(communities);
      return result[0]?.count || 0;
    }

    if (this.stats && this.isValidCache()) {
      return this.stats.totalCommunities;
    }

    // Quick count query if cache is invalid
    const result = await db.select({ count: sql<number>`count(*)` }).from(communities);
    const count = result[0]?.count || 0;

    // Update cache in background if needed
    if (!this.stats || !this.isValidCache()) {
      this.refreshCache().catch(console.error);
    }

    return count;
  }

  /**
   * Force refresh of cache statistics
   */
  async refreshCache(): Promise<void> {
    try {
      console.log('Refreshing community stats cache...');
      
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000); // 5 second timeout
      });
      
      // Get total count - optimized with direct SQL for speed
      const totalResult = await Promise.race([
        db.execute(sql`
          SELECT COUNT(*)::integer as count FROM communities
        `),
        timeoutPromise
      ]) as any;
      const totalCommunities = totalResult.rows?.[0]?.count || 0;

      // Get counts by state - using raw SQL for better performance
      // Limit to top 10 states to prevent timeout
      const stateResults = await Promise.race([
        db.execute(sql`
          SELECT state, COUNT(*)::integer as count 
          FROM communities 
          WHERE state IS NOT NULL 
          GROUP BY state 
          ORDER BY count DESC 
          LIMIT 10
        `),
        timeoutPromise
      ]) as any;

      const byState: Record<string, number> = {};
      stateResults.rows?.forEach((row: any) => {
        if (row.state) {
          byState[row.state] = row.count;
        }
      });

      // Simplified care type count - just check if populated
      const careTypeResult = await Promise.race([
        db.execute(sql`
          SELECT COUNT(*)::integer as count 
          FROM communities 
          WHERE care_types IS NOT NULL 
          AND array_length(care_types, 1) > 0
          LIMIT 1
        `),
        timeoutPromise
      ]) as any;

      const byCareType = {
        'with_care_types': careTypeResult.rows?.[0]?.count || 0,
        'total': totalCommunities
      };

      this.stats = {
        totalCommunities,
        lastUpdated: new Date(),
        byState,
        byCareType
      };

      console.log(`Community stats cache refreshed: ${totalCommunities} total communities`);
    } catch (error: any) {
      console.error('Error refreshing community stats cache:', error.message || error);
      // Use fallback stats if refresh fails
      if (!this.stats) {
        // Provide fallback stats to prevent crashes
        this.stats = {
          totalCommunities: 33837, // Known count from development
          lastUpdated: new Date(),
          byState: {},
          byCareType: { 'with_care_types': 0, 'total': 33837 }
        };
        console.log('Using fallback community stats to prevent crash');
      }
      // Keep existing cache if refresh fails
    }
  }

  /**
   * Invalidate cache when database changes
   */
  invalidateCache(): void {
    console.log('Invalidating community stats cache');
    this.stats = null;
  }

  /**
   * Update count incrementally (for additions/deletions)
   */
  updateCount(delta: number): void {
    if (this.stats) {
      this.stats.totalCommunities += delta;
      this.stats.lastUpdated = new Date();
      console.log(`Community count updated by ${delta} to ${this.stats.totalCommunities}`);
    }
  }

  /**
   * Check if current cache is still valid
   */
  private isValidCache(): boolean {
    if (!this.stats) return false;
    
    const age = Date.now() - this.stats.lastUpdated.getTime();
    return age < this.cacheExpiry;
  }

  /**
   * Initialize cache on startup
   */
  async initialize(): Promise<void> {
    console.log('Initializing community stats cache...');
    
    // Set immediate fallback stats to prevent blocking
    this.stats = {
      totalCommunities: 0,
      lastUpdated: new Date(),
      byState: {},
      byCareType: {}
    };
    
    // Load cache asynchronously without blocking
    this.refreshCache().catch(error => {
      console.error('Cache refresh failed:', error);
    });
  }
}

export const communityStatsCache = new CommunityStatsCache();