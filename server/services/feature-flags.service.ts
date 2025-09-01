import { db } from '../db';
import { communities, communityFeatures, featureUsageTracking } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Enterprise Feature Flag Service
 * Fortune 500-level feature management with:
 * - Dynamic feature gates without deployments
 * - Usage tracking and metering
 * - A/B testing capabilities
 * - Kill switches for problematic features
 */

// Tier definitions matching your pricing screenshots
export const COMMUNITY_TIERS = {
  starter: {
    id: 'starter',
    name: 'Community Starter',
    price: 99,
    features: {
      // Basic Features
      verifiedBadge: true,
      photoLimit: 5,
      videoLimit: 0,
      pdfLimit: 2,
      leadLimit: 10,
      analytics: 'basic',
      searchRanking: 1, // 1x visibility
      tourEmbed: false,
      reservationSystem: false,
      messagingLimit: 10,
      staffBios: false,
      customDomain: false,
      apiAccess: false,
      whiteLabel: false
    }
  },
  growth: {
    id: 'growth',
    name: 'Community Growth',
    price: 299,
    badge: '3D TOUR EMBED',
    features: {
      // Enhanced Features
      verifiedBadge: true,
      photoLimit: 25,
      videoLimit: 2,
      pdfLimit: 5,
      leadLimit: 50,
      analytics: 'enhanced',
      searchRanking: 3, // 3x visibility
      tourEmbed: true, // KEY FEATURE: 3D Tour Embed
      reservationSystem: true, // Unit reservation
      messagingLimit: 100,
      crmIntegration: true,
      staffBios: false,
      customDomain: false,
      apiAccess: false,
      whiteLabel: false
    }
  },
  professional: {
    id: 'professional',
    name: 'Community Professional',
    price: 999,
    badge: 'AI LEASE SYSTEM',
    features: {
      // Professional Features
      verifiedBadge: true,
      photoLimit: 100,
      videoLimit: 10,
      pdfLimit: 20,
      leadLimit: -1, // Unlimited
      analytics: 'advanced',
      searchRanking: 5, // 5x visibility
      tourEmbed: 'multiple', // Multiple 3D tours
      reservationSystem: 'advanced', // AI-powered lease management
      messagingLimit: -1, // Unlimited
      crmIntegration: true,
      staffBios: true,
      customDomain: false,
      apiAccess: true,
      apiCallsLimit: 1000,
      whiteLabel: false,
      leadScoring: true,
      competitorAnalysis: true
    }
  },
  premium: {
    id: 'premium',
    name: 'Community Premium',
    price: 1999,
    badge: 'PAYMENT PROCESSING',
    features: {
      // Premium Features
      verifiedBadge: true,
      photoLimit: -1, // Unlimited
      videoLimit: -1, // Unlimited
      pdfLimit: -1, // Unlimited
      leadLimit: -1, // Unlimited
      analytics: 'enterprise',
      searchRanking: 10, // 10x visibility
      tourEmbed: 'unlimited',
      reservationSystem: 'full', // Full integration with payments
      paymentProcessing: true, // KEY FEATURE: Move-in & rent payments
      messagingLimit: -1,
      crmIntegration: true,
      staffBios: true,
      customDomain: true,
      apiAccess: true,
      apiCallsLimit: 10000,
      whiteLabel: false,
      leadScoring: true,
      competitorAnalysis: true,
      moveInCalculator: true,
      multiProperty: 3 // Up to 3 properties
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Community Enterprise',
    price: 3999,
    badge: 'WHITE LABEL',
    features: {
      // Enterprise Features
      verifiedBadge: true,
      photoLimit: -1,
      videoLimit: -1,
      pdfLimit: -1,
      leadLimit: -1,
      analytics: 'enterprise',
      searchRanking: 20, // 20x visibility
      tourEmbed: 'unlimited',
      reservationSystem: 'enterprise', // Full APIs & integrations
      paymentProcessing: true,
      messagingLimit: -1,
      crmIntegration: true,
      staffBios: true,
      customDomain: true,
      apiAccess: true,
      apiCallsLimit: -1, // Unlimited
      whiteLabel: true, // KEY FEATURE: White-label platform
      leadScoring: true,
      competitorAnalysis: true,
      moveInCalculator: true,
      multiProperty: -1, // Unlimited properties
      dedicatedSupport: true,
      customIntegrations: true,
      sla: '99.9%'
    }
  }
};

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private featureCache: Map<string, any> = new Map();
  private usageCache: Map<string, number> = new Map();

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): FeatureFlagService {
    if (!this.instance) {
      this.instance = new FeatureFlagService();
    }
    return this.instance;
  }

  private async initializeCache() {
    // Preload feature flags for active communities
    try {
      const activeFeatures = await db
        .select({
          communityId: communityFeatures.communityId,
          featureKey: communityFeatures.featureKey,
          enabled: communityFeatures.enabled,
          value: communityFeatures.value
        })
        .from(communityFeatures)
        .where(eq(communityFeatures.enabled, true))
        .limit(1000);

      for (const feature of activeFeatures) {
        const cacheKey = `${feature.communityId}:${feature.featureKey}`;
        this.featureCache.set(cacheKey, feature);
      }

      console.log(`🚀 Feature flags initialized: ${this.featureCache.size} features cached`);
    } catch (error) {
      console.error('Error initializing feature cache:', error);
    }
  }

  /**
   * Check if a community has access to a specific feature
   */
  async hasFeature(communityId: number, featureKey: string): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `${communityId}:${featureKey}`;
      if (this.featureCache.has(cacheKey)) {
        const cached = this.featureCache.get(cacheKey);
        return cached.enabled;
      }

      // Get community tier
      const [community] = await db
        .select({ subscriptionTier: communities.subscriptionTier })
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) return false;

      const tier = community.subscriptionTier || 'starter';
      const tierConfig = COMMUNITY_TIERS[tier as keyof typeof COMMUNITY_TIERS];
      
      if (!tierConfig) return false;

      const featureValue = tierConfig.features[featureKey as keyof typeof tierConfig.features];
      
      // Check if feature exists and is enabled
      if (featureValue === undefined || featureValue === false || featureValue === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking feature:', error);
      return false;
    }
  }

  /**
   * Get feature value (for features with limits)
   */
  async getFeatureValue(communityId: number, featureKey: string): Promise<any> {
    try {
      const [community] = await db
        .select({ subscriptionTier: communities.subscriptionTier })
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) return null;

      const tier = community.subscriptionTier || 'starter';
      const tierConfig = COMMUNITY_TIERS[tier as keyof typeof COMMUNITY_TIERS];
      
      if (!tierConfig) return null;

      return tierConfig.features[featureKey as keyof typeof tierConfig.features];
    } catch (error) {
      console.error('Error getting feature value:', error);
      return null;
    }
  }

  /**
   * Track feature usage for metering
   */
  async trackUsage(communityId: number, featureKey: string, quantity: number = 1) {
    try {
      await db.insert(featureUsageTracking).values({
        communityId,
        featureKey,
        usageCount: quantity,
        timestamp: new Date()
      });

      // Update cache
      const cacheKey = `usage:${communityId}:${featureKey}`;
      const current = this.usageCache.get(cacheKey) || 0;
      this.usageCache.set(cacheKey, current + quantity);
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  /**
   * Check if community has exceeded feature limit
   */
  async checkLimit(communityId: number, featureKey: string): Promise<{
    allowed: boolean;
    limit: number;
    used: number;
    remaining: number;
  }> {
    try {
      const limit = await this.getFeatureValue(communityId, featureKey);
      
      // -1 means unlimited
      if (limit === -1) {
        return { allowed: true, limit: -1, used: 0, remaining: -1 };
      }

      // 0 or false means not allowed
      if (!limit || limit === 0) {
        return { allowed: false, limit: 0, used: 0, remaining: 0 };
      }

      // Get current month's usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [usage] = await db
        .select({
          total: sql<number>`COALESCE(SUM(usage_count), 0)`
        })
        .from(featureUsageTracking)
        .where(
          and(
            eq(featureUsageTracking.communityId, communityId),
            eq(featureUsageTracking.featureKey, featureKey),
            gte(featureUsageTracking.timestamp, startOfMonth)
          )
        );

      const used = Number(usage?.total || 0);
      const remaining = limit - used;

      return {
        allowed: remaining > 0,
        limit,
        used,
        remaining: Math.max(0, remaining)
      };
    } catch (error) {
      console.error('Error checking limit:', error);
      return { allowed: false, limit: 0, used: 0, remaining: 0 };
    }
  }

  /**
   * Get upgrade options for a feature
   */
  getUpgradeOptions(currentTier: string, featureKey: string): Array<{
    tier: string;
    name: string;
    price: number;
    featureValue: any;
  }> {
    const options = [];
    const tierOrder = ['starter', 'growth', 'professional', 'premium', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);

    for (let i = currentIndex + 1; i < tierOrder.length; i++) {
      const tier = tierOrder[i];
      const tierConfig = COMMUNITY_TIERS[tier as keyof typeof COMMUNITY_TIERS];
      const featureValue = tierConfig.features[featureKey as keyof typeof tierConfig.features];

      // Check if feature has value and is not disabled
      if (featureValue !== undefined && featureValue !== 0 && featureValue !== false) {
        options.push({
          tier,
          name: tierConfig.name,
          price: tierConfig.price,
          featureValue
        });
      }
    }

    return options;
  }

  /**
   * Enable A/B testing for a feature
   */
  async enableABTest(communityId: number, featureKey: string, variant: 'A' | 'B') {
    try {
      await db
        .insert(communityFeatures)
        .values({
          communityId,
          featureKey: `${featureKey}:variant`,
          enabled: true,
          value: variant,
          metadata: {
            testStarted: new Date().toISOString(),
            variant
          }
        })
        .onConflictDoUpdate({
          target: [communityFeatures.communityId, communityFeatures.featureKey],
          set: {
            value: variant,
            metadata: {
              testStarted: new Date().toISOString(),
              variant
            },
            updatedAt: new Date()
          }
        });

      // Update cache
      const cacheKey = `${communityId}:${featureKey}:variant`;
      this.featureCache.set(cacheKey, { variant });
    } catch (error) {
      console.error('Error enabling A/B test:', error);
    }
  }

  /**
   * Kill switch - immediately disable a feature
   */
  async killSwitch(featureKey: string, reason: string) {
    try {
      await db
        .update(communityFeatures)
        .set({
          enabled: false,
          metadata: sql`jsonb_set(metadata, '{killSwitch}', '${JSON.stringify({
            disabled: true,
            reason,
            timestamp: new Date().toISOString()
          })}'::jsonb)`,
          updatedAt: new Date()
        })
        .where(eq(communityFeatures.featureKey, featureKey));

      // Clear cache for this feature
      for (const [key] of this.featureCache) {
        if (key.includes(`:${featureKey}`)) {
          this.featureCache.delete(key);
        }
      }

      console.log(`🔴 Kill switch activated for feature: ${featureKey} - Reason: ${reason}`);
    } catch (error) {
      console.error('Error activating kill switch:', error);
    }
  }

  /**
   * Get feature usage analytics
   */
  async getUsageAnalytics(communityId: number, startDate?: Date, endDate?: Date) {
    try {
      const conditions = [eq(featureUsageTracking.communityId, communityId)];
      
      if (startDate) {
        conditions.push(gte(featureUsageTracking.timestamp, startDate));
      }
      if (endDate) {
        conditions.push(lte(featureUsageTracking.timestamp, endDate));
      }

      const usage = await db
        .select({
          featureKey: featureUsageTracking.featureKey,
          totalUsage: sql<number>`SUM(usage_count)`,
          lastUsed: sql<Date>`MAX(timestamp)`
        })
        .from(featureUsageTracking)
        .where(and(...conditions))
        .groupBy(featureUsageTracking.featureKey);

      return usage;
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      return [];
    }
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagService.getInstance();