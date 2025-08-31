// Feature Access Control Service
// Centralized tier-based feature access management for MySeniorValet

import { db } from '../db';
import { communities, communitySubscriptions, stripeProducts } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface FeatureAccess {
  // Basic Features (Free Tier)
  basicListing: boolean;
  contactDisplay: boolean;
  searchVisibility: boolean;
  
  // Standard Features ($149/mo)
  profileEditing: boolean;
  featuredPlacement: boolean;
  redTagSpecials: boolean;
  photoTools: boolean; // 5 photos max
  customForms: boolean;
  basicAnalytics: boolean;
  
  // Featured Features ($249/mo)
  brandedIntake: boolean;
  availabilityManagement: boolean;
  tourScheduler: boolean;
  unlimitedPhotos: boolean;
  advancedAnalytics: boolean;
  familyMessaging: boolean;
  prioritySupport: boolean;
  
  // Platinum Features ($349/mo)
  homepageFeatured: boolean;
  conciergeService: boolean;
  sponsoredContent: boolean;
  aiAccess: boolean;
  apiIntegration: boolean;
  whiteLabeling: boolean;
  customReporting: boolean;
  dedicatedSuccess: boolean;
  
  // Add-on Features
  additionalLocations: boolean;
  aiTourAssistant: boolean;
  billPayTools: boolean;
  
  // Meta information
  currentTier: 'verified' | 'standard' | 'featured' | 'platinum';
  tierName: string;
  monthlyPrice: number;
  upgradeAvailable: boolean;
}

export class FeatureAccessControl {
  // Tier hierarchy for upgrade path
  private static readonly tierHierarchy = {
    verified: 0,
    standard: 1,
    featured: 2,
    platinum: 3
  };

  // Feature mapping by tier
  private static readonly tierFeatures = {
    verified: [
      'basicListing',
      'contactDisplay',
      'searchVisibility'
    ],
    standard: [
      // Includes all verified features plus:
      'profileEditing',
      'featuredPlacement',
      'redTagSpecials',
      'photoTools',
      'customForms',
      'basicAnalytics'
    ],
    featured: [
      // Includes all standard features plus:
      'brandedIntake',
      'availabilityManagement',
      'tourScheduler',
      'unlimitedPhotos',
      'advancedAnalytics',
      'familyMessaging',
      'prioritySupport'
    ],
    platinum: [
      // Includes all featured features plus:
      'homepageFeatured',
      'conciergeService',
      'sponsoredContent',
      'aiAccess',
      'apiIntegration',
      'whiteLabeling',
      'customReporting',
      'dedicatedSuccess'
    ]
  };

  // Check community's feature access
  static async checkCommunityAccess(communityId: number): Promise<FeatureAccess> {
    try {
      // Get community subscription details
      const subscription = await db
        .select({
          status: communitySubscriptions.status,
          productId: communitySubscriptions.productId,
          tierLevel: stripeProducts.tierLevel,
          productName: stripeProducts.name,
          price: stripeProducts.price
        })
        .from(communitySubscriptions)
        .leftJoin(stripeProducts, eq(communitySubscriptions.productId, stripeProducts.id))
        .where(eq(communitySubscriptions.communityId, communityId))
        .limit(1);

      // Default to verified tier if no subscription
      if (!subscription.length || subscription[0].status !== 'active') {
        return this.getFeatureAccessForTier('verified');
      }

      const { tierLevel, productName, price } = subscription[0];
      const tier = this.mapTierLevel(tierLevel || 'basic-listing');
      
      return {
        ...this.getFeatureAccessForTier(tier),
        tierName: productName || 'Free Listing',
        monthlyPrice: price ? price / 100 : 0,
        currentTier: tier
      };
    } catch (error) {
      console.error('Error checking community access:', error);
      return this.getFeatureAccessForTier('verified');
    }
  }

  // Get feature access for a specific tier
  private static getFeatureAccessForTier(tier: 'verified' | 'standard' | 'featured' | 'platinum'): FeatureAccess {
    const allFeatures: FeatureAccess = {
      // Initialize all features as false
      basicListing: false,
      contactDisplay: false,
      searchVisibility: false,
      profileEditing: false,
      featuredPlacement: false,
      redTagSpecials: false,
      photoTools: false,
      customForms: false,
      basicAnalytics: false,
      brandedIntake: false,
      availabilityManagement: false,
      tourScheduler: false,
      unlimitedPhotos: false,
      advancedAnalytics: false,
      familyMessaging: false,
      prioritySupport: false,
      homepageFeatured: false,
      conciergeService: false,
      sponsoredContent: false,
      aiAccess: false,
      apiIntegration: false,
      whiteLabeling: false,
      customReporting: false,
      dedicatedSuccess: false,
      additionalLocations: false,
      aiTourAssistant: false,
      billPayTools: false,
      currentTier: tier,
      tierName: this.getTierDisplayName(tier),
      monthlyPrice: this.getTierPrice(tier),
      upgradeAvailable: tier !== 'platinum'
    };

    // Enable features based on tier hierarchy
    const tierLevel = this.tierHierarchy[tier];
    
    // Enable all features up to current tier
    Object.entries(this.tierHierarchy).forEach(([tierName, level]) => {
      if (level <= tierLevel) {
        const features = this.tierFeatures[tierName as keyof typeof this.tierFeatures];
        features.forEach(feature => {
          (allFeatures as any)[feature] = true;
        });
      }
    });

    return allFeatures;
  }

  // Map Stripe tier levels to internal tiers
  private static mapTierLevel(tierLevel: string): 'verified' | 'standard' | 'featured' | 'platinum' {
    const mapping: Record<string, 'verified' | 'standard' | 'featured' | 'platinum'> = {
      'basic-listing': 'verified',
      'verified': 'verified',
      'standard': 'standard',
      'featured-spotlight': 'standard',
      'featured': 'featured',
      'premium-tools': 'featured',
      'platinum-partner': 'platinum',
      'platinum': 'platinum'
    };
    return mapping[tierLevel] || 'verified';
  }

  // Get display name for tier
  private static getTierDisplayName(tier: 'verified' | 'standard' | 'featured' | 'platinum'): string {
    const names = {
      verified: 'Verified',
      standard: 'Standard',
      featured: 'Featured',
      platinum: 'Platinum'
    };
    return names[tier];
  }

  // Get monthly price for tier
  private static getTierPrice(tier: 'verified' | 'standard' | 'featured' | 'platinum'): number {
    const prices = {
      verified: 0,
      standard: 149,
      featured: 249,
      platinum: 349
    };
    return prices[tier];
  }

  // Check if community has access to specific feature
  static async hasFeature(communityId: number, feature: keyof Omit<FeatureAccess, 'currentTier' | 'tierName' | 'monthlyPrice' | 'upgradeAvailable'>): Promise<boolean> {
    const access = await this.checkCommunityAccess(communityId);
    return access[feature] as boolean;
  }

  // Get next tier upgrade information
  static async getUpgradeInfo(communityId: number): Promise<{
    currentTier: string;
    nextTier: string | null;
    nextTierPrice: number;
    nextTierFeatures: string[];
  } | null> {
    const access = await this.checkCommunityAccess(communityId);
    
    if (!access.upgradeAvailable) {
      return null;
    }

    const tierOrder: Array<'verified' | 'standard' | 'featured' | 'platinum'> = ['verified', 'standard', 'featured', 'platinum'];
    const currentIndex = tierOrder.indexOf(access.currentTier);
    const nextTier = tierOrder[currentIndex + 1];

    if (!nextTier) return null;

    // Get features exclusive to next tier
    const currentFeatures = this.tierFeatures[access.currentTier] || [];
    const nextFeatures = this.tierFeatures[nextTier] || [];
    const newFeatures = nextFeatures.filter(f => !currentFeatures.includes(f));

    return {
      currentTier: access.tierName,
      nextTier: this.getTierDisplayName(nextTier),
      nextTierPrice: this.getTierPrice(nextTier),
      nextTierFeatures: this.getFeatureDisplayNames(newFeatures)
    };
  }

  // Get human-readable feature names
  private static getFeatureDisplayNames(features: string[]): string[] {
    const displayNames: Record<string, string> = {
      profileEditing: 'Profile Editing Tools',
      featuredPlacement: 'Featured Search Placement',
      redTagSpecials: 'Red Tag Special Promotions',
      photoTools: 'Photo Gallery Management',
      customForms: 'Custom Intake Forms',
      basicAnalytics: 'Basic Analytics Dashboard',
      brandedIntake: 'Branded Intake Forms',
      availabilityManagement: 'Real-time Availability',
      tourScheduler: 'Tour Scheduling System',
      unlimitedPhotos: 'Unlimited Photo Storage',
      advancedAnalytics: 'Advanced Analytics & Insights',
      familyMessaging: 'Family Messaging Platform',
      prioritySupport: 'Priority Support Access',
      homepageFeatured: 'Homepage Featured Placement',
      conciergeService: 'Dedicated Concierge Service',
      sponsoredContent: 'Sponsored Content Creation',
      aiAccess: 'AI-Powered Tools Suite',
      apiIntegration: 'API Integration Access',
      whiteLabeling: 'White Label Branding',
      customReporting: 'Custom Report Builder',
      dedicatedSuccess: 'Dedicated Success Manager'
    };

    return features.map(f => displayNames[f] || f);
  }
}

export default FeatureAccessControl;