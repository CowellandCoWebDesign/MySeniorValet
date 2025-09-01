import { Router } from 'express';
import { db } from '../db';
import { communityFeatures, featureUsageTracking, communities } from '@shared/schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

/**
 * Phase 5 Community Features Management
 * Complete CRUD operations for community features with tier-based access control
 * 
 * Feature tiers and their corresponding features:
 * - Starter ($99): basic_profile, photo_gallery, lead_capture, analytics_basic
 * - Growth ($299): tour_3d, reservation_system, priority_support, analytics_enhanced
 * - Professional ($999): multi_property, lead_tracking, crm_integration, analytics_advanced
 * - Premium ($1,999): payment_processing, ai_insights, expanded_properties, dedicated_support
 * - Enterprise ($3,999): white_label, api_access, unlimited_properties, custom_integrations
 */

// Feature definitions with tier requirements
const FEATURE_DEFINITIONS: Record<string, {
  tier: string;
  name: string;
  description: string;
  category: string;
  limit?: number;
}> = {
  // Starter features
  basic_profile: {
    tier: 'starter',
    name: 'Basic Profile',
    description: 'Community profile with basic information',
    category: 'profile'
  },
  photo_gallery: {
    tier: 'starter',
    name: 'Photo Gallery',
    description: 'Upload and display up to 10 photos',
    category: 'media',
    limit: 10
  },
  lead_capture: {
    tier: 'starter',
    name: 'Lead Capture Forms',
    description: 'Basic contact forms for inquiries',
    category: 'marketing'
  },
  analytics_basic: {
    tier: 'starter',
    name: 'Basic Analytics',
    description: 'View counts and basic engagement metrics',
    category: 'analytics'
  },
  
  // Growth features
  tour_3d: {
    tier: 'growth',
    name: '3D Virtual Tours',
    description: 'Embed interactive 3D tours',
    category: 'media'
  },
  reservation_system: {
    tier: 'growth',
    name: 'Online Reservations',
    description: 'Accept online room reservations',
    category: 'operations'
  },
  priority_support: {
    tier: 'growth',
    name: 'Priority Support',
    description: '24-hour response time guarantee',
    category: 'support'
  },
  analytics_enhanced: {
    tier: 'growth',
    name: 'Enhanced Analytics',
    description: 'Conversion tracking and detailed reports',
    category: 'analytics'
  },
  
  // Professional features
  multi_property: {
    tier: 'professional',
    name: 'Multi-Property Management',
    description: 'Manage up to 25 properties',
    category: 'management',
    limit: 25
  },
  lead_tracking: {
    tier: 'professional',
    name: 'Advanced Lead Tracking',
    description: 'Full lead lifecycle management',
    category: 'marketing'
  },
  crm_integration: {
    tier: 'professional',
    name: 'CRM Integration',
    description: 'Connect with popular CRM systems',
    category: 'integrations'
  },
  analytics_advanced: {
    tier: 'professional',
    name: 'Advanced Analytics',
    description: 'Predictive analytics and custom reports',
    category: 'analytics'
  },
  
  // Premium features
  payment_processing: {
    tier: 'premium',
    name: 'Payment Processing',
    description: 'Accept online payments via Stripe',
    category: 'financial'
  },
  ai_insights: {
    tier: 'premium',
    name: 'AI-Powered Insights',
    description: 'Machine learning predictions and recommendations',
    category: 'intelligence'
  },
  expanded_properties: {
    tier: 'premium',
    name: 'Expanded Properties',
    description: 'Manage up to 100 properties',
    category: 'management',
    limit: 100
  },
  dedicated_support: {
    tier: 'premium',
    name: 'Dedicated Support',
    description: 'Dedicated account manager',
    category: 'support'
  },
  
  // Enterprise features
  white_label: {
    tier: 'enterprise',
    name: 'White-Label Platform',
    description: 'Custom branding and domain',
    category: 'branding'
  },
  api_access: {
    tier: 'enterprise',
    name: 'Full API Access',
    description: 'Complete API access for custom integrations',
    category: 'integrations'
  },
  unlimited_properties: {
    tier: 'enterprise',
    name: 'Unlimited Properties',
    description: 'No limit on property management',
    category: 'management',
    limit: -1
  },
  custom_integrations: {
    tier: 'enterprise',
    name: 'Custom Integrations',
    description: 'Custom-built integrations for your needs',
    category: 'integrations'
  }
};

// Tier hierarchy for feature access
const TIER_HIERARCHY = {
  starter: 0,
  growth: 1,
  professional: 2,
  premium: 3,
  enterprise: 4
};

// Helper function to check if a tier has access to a feature
function tierHasAccess(userTier: string, featureTier: string): boolean {
  const userLevel = TIER_HIERARCHY[userTier as keyof typeof TIER_HIERARCHY] ?? 0;
  const featureLevel = TIER_HIERARCHY[featureTier as keyof typeof TIER_HIERARCHY] ?? 0;
  return userLevel >= featureLevel;
}

// Validation schemas
const enableFeatureSchema = z.object({
  communityId: z.number(),
  featureKey: z.string(),
  value: z.any().optional(),
  metadata: z.record(z.any()).optional()
});

const updateFeatureSchema = z.object({
  enabled: z.boolean().optional(),
  value: z.any().optional(),
  metadata: z.record(z.any()).optional()
});

// GET /api/community-features/definitions
// Get all available feature definitions
router.get('/definitions', async (req, res) => {
  try {
    res.json({
      success: true,
      features: FEATURE_DEFINITIONS,
      tiers: TIER_HIERARCHY
    });
  } catch (error) {
    console.error('Error fetching feature definitions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feature definitions' 
    });
  }
});

// GET /api/community-features/:communityId
// Get all features for a community
router.get('/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Fetch community to get tier
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
    
    if (!community) {
      return res.status(404).json({ 
        success: false, 
        message: 'Community not found' 
      });
    }
    
    // Fetch enabled features
    const features = await db
      .select()
      .from(communityFeatures)
      .where(eq(communityFeatures.communityId, communityId));
    
    // Get current tier (default to starter if not set)
    const currentTier = (community as any).subscriptionTier || 'starter';
    
    // Build feature status map
    const featureStatus = Object.entries(FEATURE_DEFINITIONS).reduce((acc, [key, def]) => {
      const feature = features.find(f => f.featureKey === key);
      const hasAccess = tierHasAccess(currentTier, def.tier);
      
      acc[key] = {
        ...def,
        enabled: feature?.enabled ?? false,
        hasAccess,
        value: feature?.value,
        metadata: feature?.metadata,
        status: hasAccess ? (feature?.enabled ? 'active' : 'available') : 'locked'
      };
      return acc;
    }, {} as Record<string, any>);
    
    res.json({
      success: true,
      communityId,
      currentTier,
      features: featureStatus
    });
  } catch (error) {
    console.error('Error fetching community features:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch community features' 
    });
  }
});

// POST /api/community-features/enable
// Enable a feature for a community
router.post('/enable', async (req, res) => {
  try {
    const data = enableFeatureSchema.parse(req.body);
    
    // Check if community exists and get tier
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, data.communityId))
      .limit(1);
    
    if (!community) {
      return res.status(404).json({ 
        success: false, 
        message: 'Community not found' 
      });
    }
    
    // Check if feature exists
    const featureDef = FEATURE_DEFINITIONS[data.featureKey];
    if (!featureDef) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid feature key' 
      });
    }
    
    // Check tier access
    const currentTier = (community as any).subscriptionTier || 'starter';
    if (!tierHasAccess(currentTier, featureDef.tier)) {
      return res.status(403).json({ 
        success: false, 
        message: `Feature requires ${featureDef.tier} tier or higher` 
      });
    }
    
    // Check if feature already exists
    const [existing] = await db
      .select()
      .from(communityFeatures)
      .where(
        and(
          eq(communityFeatures.communityId, data.communityId),
          eq(communityFeatures.featureKey, data.featureKey)
        )
      );
    
    if (existing) {
      // Update existing feature
      const [updated] = await db
        .update(communityFeatures)
        .set({
          enabled: true,
          value: data.value || existing.value,
          metadata: data.metadata || existing.metadata,
          updatedAt: new Date()
        })
        .where(eq(communityFeatures.id, existing.id))
        .returning();
      
      res.json({
        success: true,
        message: 'Feature enabled',
        feature: updated
      });
    } else {
      // Create new feature entry
      const [created] = await db
        .insert(communityFeatures)
        .values({
          communityId: data.communityId,
          featureKey: data.featureKey,
          enabled: true,
          value: data.value || null,
          metadata: data.metadata || {}
        })
        .returning();
      
      res.json({
        success: true,
        message: 'Feature enabled',
        feature: created
      });
    }
    
    // Track feature usage
    await db.insert(featureUsageTracking).values({
      communityId: data.communityId,
      featureKey: data.featureKey,
      usageCount: 1,
      metadata: { action: 'enabled' }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data',
        errors: error.errors 
      });
    }
    console.error('Error enabling feature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to enable feature' 
    });
  }
});

// PUT /api/community-features/:communityId/:featureKey
// Update a feature configuration
router.put('/:communityId/:featureKey', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const featureKey = req.params.featureKey;
    const updates = updateFeatureSchema.parse(req.body);
    
    // Check if feature exists
    const [existing] = await db
      .select()
      .from(communityFeatures)
      .where(
        and(
          eq(communityFeatures.communityId, communityId),
          eq(communityFeatures.featureKey, featureKey)
        )
      );
    
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feature not found for this community' 
      });
    }
    
    // Update feature
    const [updated] = await db
      .update(communityFeatures)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(communityFeatures.id, existing.id))
      .returning();
    
    // Track usage if disabling
    if (updates.enabled === false) {
      await db.insert(featureUsageTracking).values({
        communityId,
        featureKey,
        usageCount: 1,
        metadata: { action: 'disabled' }
      });
    }
    
    res.json({
      success: true,
      message: 'Feature updated',
      feature: updated
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data',
        errors: error.errors 
      });
    }
    console.error('Error updating feature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update feature' 
    });
  }
});

// DELETE /api/community-features/:communityId/:featureKey
// Disable a feature for a community
router.delete('/:communityId/:featureKey', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const featureKey = req.params.featureKey;
    
    // Update feature to disabled instead of deleting
    const result = await db
      .update(communityFeatures)
      .set({
        enabled: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(communityFeatures.communityId, communityId),
          eq(communityFeatures.featureKey, featureKey)
        )
      );
    
    // Track usage
    await db.insert(featureUsageTracking).values({
      communityId,
      featureKey,
      usageCount: 1,
      metadata: { action: 'disabled' }
    });
    
    res.json({
      success: true,
      message: 'Feature disabled'
    });
    
  } catch (error) {
    console.error('Error disabling feature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disable feature' 
    });
  }
});

// GET /api/community-features/usage/:communityId
// Get feature usage statistics for a community
router.get('/usage/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const timeRange = req.query.range || '30d'; // Default to 30 days
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      startDate.setDate(now.getDate() - 90);
    }
    
    // Fetch usage data
    const usage = await db
      .select({
        featureKey: featureUsageTracking.featureKey,
        totalUsage: sql<number>`SUM(${featureUsageTracking.usageCount})`,
        lastUsed: sql<Date>`MAX(${featureUsageTracking.timestamp})`
      })
      .from(featureUsageTracking)
      .where(
        and(
          eq(featureUsageTracking.communityId, communityId),
          sql`${featureUsageTracking.timestamp} >= ${startDate}`
        )
      )
      .groupBy(featureUsageTracking.featureKey);
    
    res.json({
      success: true,
      communityId,
      timeRange,
      usage: usage.map(u => ({
        featureKey: u.featureKey,
        totalUsage: Number(u.totalUsage),
        lastUsed: u.lastUsed,
        featureName: FEATURE_DEFINITIONS[u.featureKey]?.name || u.featureKey
      }))
    });
    
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch usage statistics' 
    });
  }
});

export default router;