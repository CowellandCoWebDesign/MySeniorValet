import { db } from "../db";
import { eq } from "drizzle-orm";
import { vendors } from "@shared/schema";

// Vendor subscription tier definitions
export const VENDOR_SUBSCRIPTION_TIERS = {
  basic: {
    name: "Basic Listing",
    price: 99,
    features: {
      listingVisible: true,
      regionalCoverage: 1, // 1 zip cluster
      leadGeneration: -1, // No lead tracking at basic
      featuredPlacement: false,
      prioritySupport: false,
      analyticsAccess: 'none',
      profileCustomization: 'basic', // Name, phone, category, description only
      productListings: 0, // No products at basic
      monthlyClicks: -1, // No click tracking at basic
      responseTime: '72 hours',
      verifiedBadge: false, // Optional $25 add-on
      promotionalOffers: 0, // No promotions at basic
      userReviews: true,
      affiliateTracking: true, // Optional
      photos: false,
      callToAction: false,
      logo: false,
    }
  },
  featured: {
    name: "Featured Vendor", 
    price: 249,
    features: {
      listingVisible: true,
      regionalCoverage: 5, // Coverage across 5 regions
      leadGeneration: -1, // Tracking enabled but no limit
      featuredPlacement: true,
      prioritySupport: false,
      analyticsAccess: 'basic', // Views, clicks, leads
      profileCustomization: 'advanced',
      productListings: -1, // Unlimited products
      monthlyClicks: -1, // Unlimited clicks tracked
      responseTime: '24 hours',
      verifiedBadge: true, // Must have affiliate link for "Approved" badge
      promotionalOffers: -1, // Can post vendor promos
      userReviews: true,
      affiliateTracking: true, // Required at this tier
      photos: true,
      callToAction: true,
      logo: true,
      featuredCarousel: true,
    }
  },
  national: {
    name: "National Partner (Premium)",
    price: 499,
    features: {
      listingVisible: true,
      regionalCoverage: -1, // Nationwide visibility (no geo cap)
      leadGeneration: -1, // Unlimited
      featuredPlacement: true,
      prioritySupport: true,
      analyticsAccess: 'advanced',
      profileCustomization: 'full',
      productListings: -1, // Unlimited
      monthlyClicks: -1, // Unlimited
      responseTime: '12 hours',
      verifiedBadge: true,
      promotionalOffers: -1, // Unlimited
      userReviews: true,
      affiliateTracking: true, // Required
      photos: true,
      callToAction: true,
      logo: true,
      featuredCarousel: true,
      bannerRotation: true,
      dedicatedProfilePage: true, // Dedicated vendor microsite
      apiLeadPassback: true, // Optional API or CSV lead passback
      quarterlyReport: true, // Quarterly performance report
      topConciergeMatch: true, // Concierge system priority & routing
      aiLeadSummaries: true, // AI-generated lead summaries + scoring
      successCalls: true, // Optional vendor success call
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