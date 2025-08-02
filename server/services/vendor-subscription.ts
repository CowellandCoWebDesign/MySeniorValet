import { db } from "../db";
import { eq } from "drizzle-orm";
import { vendors } from "@shared/schema";

// Vendor subscription tier definitions
export const VENDOR_SUBSCRIPTION_TIERS = {
  basic: {
    name: "Basic Vendor",
    price: 199,
    features: {
      listingVisible: true,
      leadGeneration: 10, // leads per month
      featuredPlacement: false,
      prioritySupport: false,
      analyticsAccess: 'basic',
      profileCustomization: 'limited',
      productListings: 5,
      monthlyClicks: 100,
      responseTime: '48 hours',
      verifiedBadge: false,
      promotionalOffers: 1,
    }
  },
  professional: {
    name: "Professional Vendor",
    price: 399,
    features: {
      listingVisible: true,
      leadGeneration: 50, // leads per month
      featuredPlacement: true,
      prioritySupport: false,
      analyticsAccess: 'detailed',
      profileCustomization: 'advanced',
      productListings: 25,
      monthlyClicks: 500,
      responseTime: '24 hours',
      verifiedBadge: true,
      promotionalOffers: 3,
    }
  },
  enterprise: {
    name: "Enterprise Vendor",
    price: 799,
    features: {
      listingVisible: true,
      leadGeneration: 200, // leads per month
      featuredPlacement: true,
      prioritySupport: true,
      analyticsAccess: 'advanced',
      profileCustomization: 'full',
      productListings: 100,
      monthlyClicks: 2000,
      responseTime: '12 hours',
      verifiedBadge: true,
      promotionalOffers: 10,
    }
  },
  platinum: {
    name: "Platinum Partner",
    price: 1499,
    features: {
      listingVisible: true,
      leadGeneration: -1, // unlimited
      featuredPlacement: true,
      prioritySupport: true,
      analyticsAccess: 'platinum',
      profileCustomization: 'white-label',
      productListings: -1, // unlimited
      monthlyClicks: -1, // unlimited
      responseTime: 'Priority (4 hours)',
      verifiedBadge: true,
      promotionalOffers: -1, // unlimited
      dedicatedAccountManager: true,
      apiAccess: true,
      customIntegrations: true,
    }
  }
} as const;

export type VendorTier = keyof typeof VENDOR_SUBSCRIPTION_TIERS;

export class VendorSubscriptionService {
  static async getVendorTier(vendorId: number): Promise<VendorTier> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    
    return (vendor?.subscriptionTier as VendorTier) || 'basic';
  }

  static async checkFeatureAccess(vendorId: number, feature: string): Promise<boolean> {
    const tier = await this.getVendorTier(vendorId);
    const tierFeatures = VENDOR_SUBSCRIPTION_TIERS[tier].features;
    
    if (feature in tierFeatures) {
      const value = tierFeatures[feature as keyof typeof tierFeatures];
      return value === true || value === -1 || (typeof value === 'number' && value > 0);
    }
    
    return false;
  }

  static async checkLeadLimit(vendorId: number): Promise<{ allowed: boolean; remaining: number }> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    
    if (!vendor) return { allowed: false, remaining: 0 };
    
    const tier = vendor.subscriptionTier as VendorTier;
    const limit = VENDOR_SUBSCRIPTION_TIERS[tier].features.leadGeneration;
    
    // Unlimited for platinum
    if (limit === -1) return { allowed: true, remaining: -1 };
    
    const currentCount = vendor.monthlyLeadsCount || 0;
    const remaining = limit - currentCount;
    
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining)
    };
  }

  static async incrementLeadCount(vendorId: number): Promise<void> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    
    if (vendor) {
      await db
        .update(vendors)
        .set({
          monthlyLeadsCount: (vendor.monthlyLeadsCount || 0) + 1,
          totalLeadsGenerated: (vendor.totalLeadsGenerated || 0) + 1
        })
        .where(eq(vendors.id, vendorId));
    }
  }

  static async checkClickLimit(vendorId: number): Promise<{ allowed: boolean; remaining: number }> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    
    if (!vendor) return { allowed: false, remaining: 0 };
    
    const tier = vendor.subscriptionTier as VendorTier;
    const limit = VENDOR_SUBSCRIPTION_TIERS[tier].features.monthlyClicks;
    
    // Unlimited for platinum
    if (limit === -1) return { allowed: true, remaining: -1 };
    
    const currentCount = vendor.monthlyClicksCount || 0;
    const remaining = limit - currentCount;
    
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining)
    };
  }

  static async incrementClickCount(vendorId: number): Promise<void> {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    
    if (vendor) {
      await db
        .update(vendors)
        .set({
          monthlyClicksCount: (vendor.monthlyClicksCount || 0) + 1
        })
        .where(eq(vendors.id, vendorId));
    }
  }

  static async resetMonthlyCounters(): Promise<void> {
    // This should be called by a cron job monthly
    await db
      .update(vendors)
      .set({
        monthlyLeadsCount: 0,
        monthlyClicksCount: 0,
        lastResetDate: new Date()
      });
  }

  static async getUsageStats(vendorId: number) {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId));
    
    if (!vendor) return null;
    
    const tier = vendor.subscriptionTier as VendorTier;
    const tierFeatures = VENDOR_SUBSCRIPTION_TIERS[tier].features;
    
    return {
      tier,
      leads: {
        used: vendor.monthlyLeadsCount || 0,
        limit: tierFeatures.leadGeneration,
        unlimited: tierFeatures.leadGeneration === -1
      },
      clicks: {
        used: vendor.monthlyClicksCount || 0,
        limit: tierFeatures.monthlyClicks,
        unlimited: tierFeatures.monthlyClicks === -1
      },
      products: {
        limit: tierFeatures.productListings,
        unlimited: tierFeatures.productListings === -1
      },
      totalLeadsAllTime: vendor.totalLeadsGenerated || 0,
      lastReset: vendor.lastResetDate
    };
  }
}