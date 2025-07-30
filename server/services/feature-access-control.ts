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
  
  // Featured Spotlight Features ($149/mo)
  profileEditing: boolean;
  featuredPlacement: boolean;
  redTagSpecials: boolean;
  photoTools: boolean; // 5 photos max
  customForms: boolean;
  basicAnalytics: boolean;
  
  // Premium Tools Features ($249/mo)
  brandedIntake: boolean;
  availabilityManagement: boolean;
  tourScheduler: boolean;
  unlimitedPhotos: boolean;
  advancedAnalytics: boolean;
  familyMessaging: boolean;
  prioritySupport: boolean;
  
  // Platinum Partner Features ($399/mo)
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
  currentTier: 'free' | 'featured' | 'premium' | 'platinum';
  tierName: string;
  monthlyPrice: number;
  upgradeAvailable: boolean;
}

export class FeatureAccessControl {
  // Tier hierarchy for upgrade path
  private static readonly tierHierarchy = {
    free: 0,
    featured: 1,
    premium: 2,  // Coming Q2 2025
    platinum: 3  // 2025 Roadmap
  };

  // Currently available tiers (others are under development)
  private static readonly availableTiers = ['free', 'featured'];

  // Feature mapping by tier
  private static readonly tierFeatures = {
    free: [
      'basicListing',
      'contactDisplay',
      'searchVisibility'
    ],
    featured: [
      // Includes all free features plus:
      'profileEditing',
      'featuredPlacement',
      'redTagSpecials',
      'photoTools',
      'customForms',
      'basicAnalytics'
    ],
    premium: [
      // Includes all featured features plus:
      'brandedIntake',
      'availabilityManagement',
      'tourScheduler',
      'unlimitedPhotos',
      'advancedAnalytics',
      'familyMessaging',
      'prioritySupport'
    ],
    platinum: [
      // Includes all premium features plus:
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

      // Default to free tier if no subscription
      if (!subscription.length || subscription[0].status !== 'active') {
        return this.getFeatureAccessForTier('free');
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
      return this.getFeatureAccessForTier('free');
    }
  }

  // Get feature access for a specific tier
  private static getFeatureAccessForTier(tier: 'free' | 'featured' | 'premium' | 'platinum'): FeatureAccess {
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
  private static mapTierLevel(tierLevel: string): 'free' | 'featured' | 'premium' | 'platinum' {
    const mapping: Record<string, 'free' | 'featured' | 'premium' | 'platinum'> = {
      'basic-listing': 'free',
      'featured-spotlight': 'featured',
      'premium-tools': 'premium',
      'platinum-partner': 'platinum'
    };
    return mapping[tierLevel] || 'free';
  }

  // Get display name for tier
  private static getTierDisplayName(tier: 'free' | 'featured' | 'premium' | 'platinum'): string {
    const names = {
      free: 'Free Listing',
      featured: 'Featured Spotlight',
      premium: 'Premium Tools + Exposure',
      platinum: 'Platinum Marketing Partner'
    };
    return names[tier];
  }

  // Get monthly price for tier
  private static getTierPrice(tier: 'free' | 'featured' | 'premium' | 'platinum'): number {
    const prices = {
      free: 0,
      featured: 149,
      premium: 249,
      platinum: 999
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

    const tierOrder: Array<'free' | 'featured' | 'premium' | 'platinum'> = ['free', 'featured', 'premium', 'platinum'];
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