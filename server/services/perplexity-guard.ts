/**
 * PerplexityGuard - Centralized control system for all Perplexity API calls
 * 
 * Features:
 * - $100/month budget enforcement
 * - Database caching with 7-day TTL
 * - Rate limiting (1 hour cooldown per community)
 * - Call tracking and monitoring
 * - Whitelisted endpoints only
 * - Emergency stop capability
 */

import { db } from '../db';
import { communities, perplexityUsage } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { PerplexityAIService } from '../perplexity-ai-service';

// Budget Configuration
const MONTHLY_BUDGET_USD = 100;
const COST_PER_CALL_USD = 0.001; // Approximate cost with "low" context
const MAX_CALLS_PER_MONTH = Math.floor(MONTHLY_BUDGET_USD / COST_PER_CALL_USD); // 100,000 calls

// Cache Configuration
const CACHE_DURATIONS = {
  communityEnrichment: 7 * 24 * 60 * 60 * 1000, // 7 days
  marketPricing: 7 * 24 * 60 * 60 * 1000,      // 7 days for regional
  specificPricing: 24 * 60 * 60 * 1000,         // 24 hours for specific communities
  reviews: 7 * 24 * 60 * 60 * 1000,             // 7 days
  availability: 24 * 60 * 60 * 1000,            // 24 hours
  cityVerification: 30 * 24 * 60 * 60 * 1000,   // 30 days (cities don't change)
  searchResults: 60 * 60 * 1000,                // 1 hour
};

// Rate Limiting
const COOLDOWN_PERIOD_MS = 60 * 60 * 1000; // 1 hour between refreshes for same data

// Whitelisted Call Types
export enum AllowedCallType {
  USER_TRIGGERED_ANALYSIS = 'user_triggered_analysis',
  DISCOVERY_MODE = 'discovery_mode',
  AI_ASSISTANT = 'ai_assistant',
  USER_REFRESH = 'user_refresh',
  REVIEW_EXTRACTION = 'review_extraction',
}

interface GuardedCallOptions {
  query: string;
  context?: string;
  callType: AllowedCallType;
  communityId?: number;
  userId?: number;
  forceRefresh?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

interface GuardResponse {
  success: boolean;
  data?: any;
  fromCache: boolean;
  error?: string;
  remainingBudget?: number;
  nextRefreshAvailable?: Date;
}

export class PerplexityGuard {
  private perplexityService: PerplexityAIService;
  private isEnabled: boolean = false; // Start disabled until explicitly enabled
  
  constructor() {
    this.perplexityService = new PerplexityAIService();
  }

  /**
   * Enable or disable Perplexity API calls globally
   */
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`🔒 PerplexityGuard: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Main guard function - all Perplexity calls must go through this
   */
  public async makeGuardedCall(options: GuardedCallOptions): Promise<GuardResponse> {
    const startTime = Date.now();
    
    // Step 1: Check if globally enabled
    if (!this.isEnabled) {
      return {
        success: false,
        fromCache: false,
        error: 'Perplexity API is currently disabled for cost control',
      };
    }

    // Step 2: Validate call type is whitelisted
    if (!Object.values(AllowedCallType).includes(options.callType)) {
      console.error(`❌ Unauthorized call type: ${options.callType}`);
      return {
        success: false,
        fromCache: false,
        error: 'This type of API call is not authorized',
      };
    }

    // Step 3: Check monthly budget
    const budgetCheck = await this.checkMonthlyBudget();
    if (!budgetCheck.withinBudget) {
      console.error(`💸 Monthly budget exceeded: ${budgetCheck.usedThisMonth}/${MAX_CALLS_PER_MONTH} calls`);
      return {
        success: false,
        fromCache: false,
        error: `Monthly budget exceeded. Used ${budgetCheck.usedThisMonth} of ${MAX_CALLS_PER_MONTH} allowed calls`,
        remainingBudget: 0,
      };
    }

    // Step 4: Check cache (unless force refresh)
    if (!options.forceRefresh) {
      const cachedData = await this.checkCache(options);
      if (cachedData) {
        console.log(`✅ Cache hit for: ${options.cacheKey || options.query.substring(0, 50)}`);
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          remainingBudget: budgetCheck.remaining,
        };
      }
    }

    // Step 5: Check rate limiting (cooldown period)
    if (options.communityId) {
      const cooldownCheck = await this.checkCooldown(options.communityId);
      if (!cooldownCheck.canProceed) {
        console.log(`⏳ Rate limited: ${options.communityId} - Next refresh: ${cooldownCheck.nextAvailable}`);
        
        // Return stale cache if available during cooldown
        const staleCache = await this.checkCache(options, true);
        if (staleCache) {
          return {
            success: true,
            data: staleCache,
            fromCache: true,
            error: `Data refresh available after ${cooldownCheck.nextAvailable?.toLocaleTimeString()}`,
            nextRefreshAvailable: cooldownCheck.nextAvailable,
          };
        }
        
        return {
          success: false,
          fromCache: false,
          error: `Please wait before refreshing. Next refresh available at ${cooldownCheck.nextAvailable?.toLocaleTimeString()}`,
          nextRefreshAvailable: cooldownCheck.nextAvailable,
        };
      }
    }

    // Step 6: Make the actual API call
    try {
      console.log(`🔍 PerplexityGuard: Making API call for ${options.callType}`);
      
      // The perplexityService should already be configured with "low" context
      const result = await this.perplexityService.searchRealTime(options.query, options.context);
      
      // Step 7: Track usage
      await this.trackUsage(options);
      
      // Step 8: Cache the result
      if (result && result.summary) {
        await this.cacheResult(options, result);
      }
      
      // Step 9: Update cooldown timestamp
      if (options.communityId) {
        await this.updateCooldown(options.communityId);
      }
      
      const elapsed = Date.now() - startTime;
      console.log(`✅ PerplexityGuard: Call completed in ${elapsed}ms`);
      
      return {
        success: true,
        data: result,
        fromCache: false,
        remainingBudget: budgetCheck.remaining - 1,
      };
      
    } catch (error: any) {
      console.error(`❌ PerplexityGuard: API call failed:`, error.message);
      
      // Try to return stale cache on error
      const staleCache = await this.checkCache(options, true);
      if (staleCache) {
        return {
          success: true,
          data: staleCache,
          fromCache: true,
          error: 'Using cached data due to API error',
        };
      }
      
      return {
        success: false,
        fromCache: false,
        error: error.message || 'API call failed',
      };
    }
  }

  /**
   * Check if we're within monthly budget
   */
  private async checkMonthlyBudget(): Promise<{
    withinBudget: boolean;
    usedThisMonth: number;
    remaining: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    try {
      const result = await db
        .select({
          count: sql<number>`count(*)::int`
        })
        .from(perplexityUsage)
        .where(gte(perplexityUsage.createdAt, startOfMonth));
      
      const usedThisMonth = result[0]?.count || 0;
      const remaining = MAX_CALLS_PER_MONTH - usedThisMonth;
      
      return {
        withinBudget: usedThisMonth < MAX_CALLS_PER_MONTH,
        usedThisMonth,
        remaining: Math.max(0, remaining),
      };
    } catch (error) {
      console.error('Budget check failed:', error);
      // Be conservative - assume we're at limit if check fails
      return {
        withinBudget: false,
        usedThisMonth: MAX_CALLS_PER_MONTH,
        remaining: 0,
      };
    }
  }

  /**
   * Check cache for existing data
   */
  private async checkCache(options: GuardedCallOptions, allowStale = false): Promise<any | null> {
    if (!options.communityId || !options.cacheKey) {
      return null;
    }
    
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, options.communityId))
        .limit(1);
      
      if (!community?.enrichmentData || !community.enrichmentDataExpiry) {
        return null;
      }
      
      const expiryDate = new Date(community.enrichmentDataExpiry);
      const now = new Date();
      
      // Check if cache is still valid (or if we allow stale data)
      if (allowStale || expiryDate > now) {
        return community.enrichmentData;
      }
      
      return null;
    } catch (error) {
      console.error('Cache check failed:', error);
      return null;
    }
  }

  /**
   * Cache the result in database
   */
  private async cacheResult(options: GuardedCallOptions, data: any): Promise<void> {
    if (!options.communityId) {
      return;
    }
    
    try {
      const cacheDuration = options.cacheDuration || CACHE_DURATIONS.communityEnrichment;
      const expiryDate = new Date(Date.now() + cacheDuration);
      
      await db
        .update(communities)
        .set({
          enrichmentData: data as any,
          enrichmentDataExpiry: expiryDate,
          lastEnrichmentDate: new Date(),
        })
        .where(eq(communities.id, options.communityId));
      
      console.log(`💾 Cached data for community ${options.communityId} until ${expiryDate.toLocaleDateString()}`);
    } catch (error) {
      console.error('Failed to cache result:', error);
    }
  }

  /**
   * Check cooldown period for rate limiting
   */
  private async checkCooldown(communityId: number): Promise<{
    canProceed: boolean;
    nextAvailable?: Date;
  }> {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community?.lastEnrichmentAttempt) {
        return { canProceed: true };
      }
      
      const lastAttempt = new Date(community.lastEnrichmentAttempt);
      const nextAvailable = new Date(lastAttempt.getTime() + COOLDOWN_PERIOD_MS);
      const now = new Date();
      
      if (now < nextAvailable) {
        return {
          canProceed: false,
          nextAvailable,
        };
      }
      
      return { canProceed: true };
    } catch (error) {
      console.error('Cooldown check failed:', error);
      // Be conservative - allow the call if check fails
      return { canProceed: true };
    }
  }

  /**
   * Update cooldown timestamp
   */
  private async updateCooldown(communityId: number): Promise<void> {
    try {
      await db
        .update(communities)
        .set({
          lastEnrichmentAttempt: new Date(),
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('Failed to update cooldown:', error);
    }
  }

  /**
   * Track API usage for monitoring
   */
  private async trackUsage(options: GuardedCallOptions): Promise<void> {
    try {
      await db.insert(perplexityUsage).values({
        callType: options.callType,
        query: options.query.substring(0, 500),
        communityId: options.communityId,
        userId: options.userId,
        cost: COST_PER_CALL_USD,
        createdAt: new Date(),
      });
      
      console.log(`📊 Usage tracked: ${options.callType} - $${COST_PER_CALL_USD}`);
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  /**
   * Get current month's usage statistics
   */
  public async getUsageStats(): Promise<{
    callsThisMonth: number;
    costThisMonth: number;
    remainingBudget: number;
    percentUsed: number;
    topCallTypes: Array<{ type: string; count: number }>;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    try {
      // Get total calls this month
      const totalResult = await db
        .select({
          count: sql<number>`count(*)::int`,
          totalCost: sql<number>`sum(cost)::float`
        })
        .from(perplexityUsage)
        .where(gte(perplexityUsage.createdAt, startOfMonth));
      
      const callsThisMonth = totalResult[0]?.count || 0;
      const costThisMonth = totalResult[0]?.totalCost || 0;
      
      // Get breakdown by call type
      const typeBreakdown = await db
        .select({
          callType: perplexityUsage.callType,
          count: sql<number>`count(*)::int`
        })
        .from(perplexityUsage)
        .where(gte(perplexityUsage.createdAt, startOfMonth))
        .groupBy(perplexityUsage.callType)
        .orderBy(sql`count(*) desc`)
        .limit(5);
      
      return {
        callsThisMonth,
        costThisMonth,
        remainingBudget: MONTHLY_BUDGET_USD - costThisMonth,
        percentUsed: (costThisMonth / MONTHLY_BUDGET_USD) * 100,
        topCallTypes: typeBreakdown.map(row => ({
          type: row.callType || 'unknown',
          count: row.count,
        })),
      };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return {
        callsThisMonth: 0,
        costThisMonth: 0,
        remainingBudget: MONTHLY_BUDGET_USD,
        percentUsed: 0,
        topCallTypes: [],
      };
    }
  }
}

// Export singleton instance
export const perplexityGuard = new PerplexityGuard();