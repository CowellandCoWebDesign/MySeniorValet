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
      
      // Get total count
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(communities);
      const totalCommunities = totalResult[0]?.count || 0;

      // Get counts by state
      const stateResults = await db
        .select({ 
          state: communities.state, 
          count: sql<number>`count(*)` 
        })
        .from(communities)
        .where(sql`${communities.state} IS NOT NULL`)
        .groupBy(communities.state);

      const byState: Record<string, number> = {};
      stateResults.forEach(row => {
        if (row.state) {
          byState[row.state] = row.count;
        }
      });

      // Get counts by care type (simplified - just count communities with care types)
      const careTypeResults = await db
        .select({ count: sql<number>`count(*)` })
        .from(communities)
        .where(sql`${communities.careTypes} IS NOT NULL AND array_length(${communities.careTypes}, 1) > 0`);

      const byCareType = {
        'with_care_types': careTypeResults[0]?.count || 0,
        'total': totalCommunities
      };

      this.stats = {
        totalCommunities,
        lastUpdated: new Date(),
        byState,
        byCareType
      };

      console.log(`Community stats cache refreshed: ${totalCommunities} total communities`);
    } catch (error) {
      console.error('Error refreshing community stats cache:', error);
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
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Cache initialization timeout')), 10000); // 10 second timeout
    });
    
    try {
      await Promise.race([this.refreshCache(), timeoutPromise]);
    } catch (error) {
      console.error('Cache initialization failed:', error);
      // Set fallback stats
      this.stats = {
        totalCommunities: 0,
        lastUpdated: new Date(),
        byState: {},
        byCareType: {}
      };
    }
  }
}

export const communityStatsCache = new CommunityStatsCache();