/**
 * API Cost Protection - Scalability & User Growth Module
 * Handles dynamic scaling, per-user quotas, and predictive cost modeling
 */

import { apiCostProtection } from './api-cost-protection';

export interface UserTier {
  name: 'free' | 'premium' | 'vendor' | 'enterprise';
  dailyApiCostLimit: number;
  monthlyApiCostLimit: number;
  burstMultiplier: number;
  priorityLevel: number;
  concurrentRequestLimit: number;
}

export interface ScalabilityMetrics {
  activeUsers: number;
  peakConcurrentUsers: number;
  averageCostPerUser: number;
  projectedMonthlyCost: number;
  userGrowthRate: number;
  apiUsageGrowthRate: number;
  recommendedLimits: {
    daily: number;
    perUser: number;
    burst: number;
  };
}

export class ApiCostScalabilityManager {
  private userTiers: Map<string, UserTier> = new Map([
    ['free', {
      name: 'free',
      dailyApiCostLimit: 0.10,  // $0.10/day for free users
      monthlyApiCostLimit: 3,    // $3/month
      burstMultiplier: 1,
      priorityLevel: 1,
      concurrentRequestLimit: 2
    }],
    ['premium', {
      name: 'premium',
      dailyApiCostLimit: 1,      // $1/day for premium users
      monthlyApiCostLimit: 30,   // $30/month
      burstMultiplier: 2,
      priorityLevel: 2,
      concurrentRequestLimit: 5
    }],
    ['vendor', {
      name: 'vendor',
      dailyApiCostLimit: 5,      // $5/day for vendors
      monthlyApiCostLimit: 150,  // $150/month
      burstMultiplier: 3,
      priorityLevel: 3,
      concurrentRequestLimit: 10
    }],
    ['enterprise', {
      name: 'enterprise',
      dailyApiCostLimit: 20,     // $20/day for enterprise
      monthlyApiCostLimit: 600,  // $600/month
      burstMultiplier: 5,
      priorityLevel: 4,
      concurrentRequestLimit: 50
    }]
  ]);

  private userQuotas: Map<string, {
    userId: string;
    tier: UserTier;
    dailyUsage: number;
    monthlyUsage: number;
    lastReset: Date;
    concurrentRequests: number;
  }> = new Map();

  private scalabilityMetrics: ScalabilityMetrics = {
    activeUsers: 0,
    peakConcurrentUsers: 0,
    averageCostPerUser: 0,
    projectedMonthlyCost: 0,
    userGrowthRate: 0,
    apiUsageGrowthRate: 0,
    recommendedLimits: {
      daily: 50,
      perUser: 0.5,
      burst: 20
    }
  };

  /**
   * Check if a user can make an API call based on their tier and usage
   */
  async checkUserQuota(
    userId: string,
    userTier: string,
    estimatedCost: number,
    apiProvider: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    remainingQuota?: number;
    upgradeRecommended?: boolean;
  }> {
    const tier = this.userTiers.get(userTier) || this.userTiers.get('free')!;
    
    // Get or create user quota tracking
    let userQuota = this.userQuotas.get(userId);
    if (!userQuota) {
      userQuota = {
        userId,
        tier,
        dailyUsage: 0,
        monthlyUsage: 0,
        lastReset: new Date(),
        concurrentRequests: 0
      };
      this.userQuotas.set(userId, userQuota);
    }

    // Reset daily/monthly counters if needed
    const now = new Date();
    const daysSinceReset = (now.getTime() - userQuota.lastReset.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceReset >= 1) {
      userQuota.dailyUsage = 0;
      if (daysSinceReset >= 30) {
        userQuota.monthlyUsage = 0;
      }
      userQuota.lastReset = now;
    }

    // Check concurrent request limit
    if (userQuota.concurrentRequests >= tier.concurrentRequestLimit) {
      return {
        allowed: false,
        reason: `Concurrent request limit reached (${tier.concurrentRequestLimit} for ${tier.name} tier)`,
        upgradeRecommended: tier.name !== 'enterprise'
      };
    }

    // Check daily limit
    if (userQuota.dailyUsage + estimatedCost > tier.dailyApiCostLimit) {
      return {
        allowed: false,
        reason: `Daily API cost limit exceeded ($${tier.dailyApiCostLimit} for ${tier.name} tier)`,
        remainingQuota: Math.max(0, tier.dailyApiCostLimit - userQuota.dailyUsage),
        upgradeRecommended: tier.name !== 'enterprise'
      };
    }

    // Check monthly limit
    if (userQuota.monthlyUsage + estimatedCost > tier.monthlyApiCostLimit) {
      return {
        allowed: false,
        reason: `Monthly API cost limit exceeded ($${tier.monthlyApiCostLimit} for ${tier.name} tier)`,
        remainingQuota: Math.max(0, tier.monthlyApiCostLimit - userQuota.monthlyUsage),
        upgradeRecommended: tier.name !== 'enterprise'
      };
    }

    // Update usage tracking
    userQuota.dailyUsage += estimatedCost;
    userQuota.monthlyUsage += estimatedCost;
    userQuota.concurrentRequests++;

    // Schedule concurrent request decrement
    setTimeout(() => {
      if (userQuota) {
        userQuota.concurrentRequests = Math.max(0, userQuota.concurrentRequests - 1);
      }
    }, 5000); // Release after 5 seconds

    return {
      allowed: true,
      remainingQuota: tier.dailyApiCostLimit - userQuota.dailyUsage
    };
  }

  /**
   * Calculate dynamic limits based on current user scale
   */
  calculateDynamicLimits(activeUserCount: number): {
    platformDailyLimit: number;
    perUserDailyLimit: number;
    burstThreshold: number;
    emergencyStopThreshold: number;
  } {
    // Base limits for up to 100 users
    const baseLimits = {
      platform: 50,
      perUser: 0.50,
      burst: 20,
      emergency: 75
    };

    // Scale factors based on user count
    const scaleFactor = Math.ceil(activeUserCount / 100);
    const logarithmicScale = Math.log10(Math.max(10, activeUserCount));

    return {
      platformDailyLimit: baseLimits.platform * scaleFactor,
      perUserDailyLimit: baseLimits.perUser / logarithmicScale, // Decreases per user as scale increases
      burstThreshold: baseLimits.burst + (scaleFactor * 5), // Increases slightly with scale
      emergencyStopThreshold: baseLimits.emergency * scaleFactor * 1.5
    };
  }

  /**
   * Predict costs based on user growth projections
   */
  predictMonthlyCosts(
    currentUsers: number,
    monthlyGrowthRate: number,
    monthsAhead: number = 6
  ): Array<{
    month: number;
    projectedUsers: number;
    projectedCost: number;
    recommendedBudget: number;
  }> {
    const predictions = [];
    let users = currentUsers;
    
    for (let month = 1; month <= monthsAhead; month++) {
      users = Math.ceil(users * (1 + monthlyGrowthRate));
      
      // Estimate cost based on user tier distribution
      // Assume: 70% free, 20% premium, 8% vendor, 2% enterprise
      const freeCost = users * 0.70 * 3;        // $3/month per free user
      const premiumCost = users * 0.20 * 30;    // $30/month per premium
      const vendorCost = users * 0.08 * 150;    // $150/month per vendor
      const enterpriseCost = users * 0.02 * 600; // $600/month per enterprise
      
      const totalCost = freeCost + premiumCost + vendorCost + enterpriseCost;
      
      predictions.push({
        month,
        projectedUsers: users,
        projectedCost: Math.round(totalCost),
        recommendedBudget: Math.round(totalCost * 1.3) // 30% buffer
      });
    }
    
    return predictions;
  }

  /**
   * Auto-scale protection limits based on real-time metrics
   */
  async autoScaleProtection(): Promise<void> {
    const activeUsers = this.userQuotas.size;
    const dynamicLimits = this.calculateDynamicLimits(activeUsers);
    
    // Update global API protection limits
    const currentStatus = apiCostProtection.getUsageStatus();
    
    console.log('🔄 AUTO-SCALING API PROTECTION:');
    console.log(`  Active Users: ${activeUsers}`);
    console.log(`  New Daily Limit: $${dynamicLimits.platformDailyLimit}`);
    console.log(`  Per-User Limit: $${dynamicLimits.perUserDailyLimit.toFixed(2)}`);
    console.log(`  Burst Threshold: ${dynamicLimits.burstThreshold} calls`);
    console.log(`  Emergency Stop: $${dynamicLimits.emergencyStopThreshold}`);
    
    // Update metrics
    this.scalabilityMetrics.activeUsers = activeUsers;
    this.scalabilityMetrics.recommendedLimits = {
      daily: dynamicLimits.platformDailyLimit,
      perUser: dynamicLimits.perUserDailyLimit,
      burst: dynamicLimits.burstThreshold
    };
  }

  /**
   * Get comprehensive scalability report
   */
  getScalabilityReport(): {
    currentScale: {
      activeUsers: number;
      userDistribution: Record<string, number>;
      totalDailyUsage: number;
      averageCostPerUser: number;
    };
    projections: Array<{
      month: number;
      projectedUsers: number;
      projectedCost: number;
      recommendedBudget: number;
    }>;
    recommendations: string[];
  } {
    const usersByTier: Record<string, number> = {
      free: 0,
      premium: 0,
      vendor: 0,
      enterprise: 0
    };
    
    let totalDailyUsage = 0;
    
    for (const quota of this.userQuotas.values()) {
      usersByTier[quota.tier.name]++;
      totalDailyUsage += quota.dailyUsage;
    }
    
    const activeUsers = this.userQuotas.size;
    const averageCost = activeUsers > 0 ? totalDailyUsage / activeUsers : 0;
    
    const projections = this.predictMonthlyCosts(
      Math.max(100, activeUsers), // Minimum 100 for projections
      0.20, // 20% monthly growth assumption
      6
    );
    
    const recommendations = [];
    
    // Generate recommendations based on current metrics
    if (averageCost > 0.50) {
      recommendations.push('Consider implementing stricter rate limits for free tier users');
    }
    
    if (usersByTier.free > usersByTier.premium * 5) {
      recommendations.push('Focus on converting free users to premium for better cost distribution');
    }
    
    if (totalDailyUsage > 30) {
      recommendations.push('Review API caching strategies to reduce redundant calls');
    }
    
    if (activeUsers > 1000) {
      recommendations.push('Consider implementing API request queuing for non-critical operations');
    }
    
    return {
      currentScale: {
        activeUsers,
        userDistribution: usersByTier,
        totalDailyUsage,
        averageCostPerUser: averageCost
      },
      projections,
      recommendations
    };
  }

  /**
   * Implement smart caching based on user patterns
   */
  getCacheStrategy(userTier: string, apiProvider: string): {
    ttl: number;
    strategy: 'aggressive' | 'moderate' | 'minimal';
    shouldCache: boolean;
  } {
    const tier = this.userTiers.get(userTier);
    
    // More aggressive caching for free users
    if (tier?.name === 'free') {
      return {
        ttl: 3600, // 1 hour cache
        strategy: 'aggressive',
        shouldCache: true
      };
    }
    
    if (tier?.name === 'premium') {
      return {
        ttl: 900, // 15 minute cache
        strategy: 'moderate',
        shouldCache: true
      };
    }
    
    // Minimal caching for enterprise
    return {
      ttl: 60, // 1 minute cache
      strategy: 'minimal',
      shouldCache: apiProvider !== 'stripe' // Don't cache payment APIs
    };
  }
}

// Export singleton instance
export const apiScalability = new ApiCostScalabilityManager();