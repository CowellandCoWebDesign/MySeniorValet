// Feature Access Control Service
// Centralized tier-based feature access management for MySeniorValet

import { db } from '../db';
import { communities, communitySubscriptions, stripeProducts } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface FeatureAccess {
  // Free Tier - Basic Features
  basicListing: boolean;
  contactDisplay: boolean;
  searchVisibility: boolean;
  
  // Starter Tier ($99/mo) - Priority 1: Financial Transparency
  billingManagement: boolean;
  financialReporting: boolean;
  invoiceGeneration: boolean;
  paymentTracking: boolean;
  costCalculator: boolean;
  
  // Professional Tier ($499/mo) - Priority 2 & 3: Care Coordination + Daily Life
  careCoordination: boolean;
  healthRecords: boolean;
  medicationManagement: boolean;
  carePlans: boolean;
  dailyLifeActivities: boolean;
  mealPlanning: boolean;
  transportationScheduling: boolean;
  familyMessaging: boolean;
  
  // Premium Tier ($999/mo) - Priority 4 & 5: Staff Management + Marketing
  staffManagement: boolean;
  hrTools: boolean;
  trainingPrograms: boolean;
  performanceTracking: boolean;
  marketingCRM: boolean;
  leadTracking: boolean;
  tourScheduler: boolean;
  occupancyManagement: boolean;
  campaignAnalytics: boolean;
  
  // Enterprise Tier ($3,999/mo) - Advanced Enterprise Features
  multiPropertyDashboard: boolean;
  whiteLabeling: boolean;
  apiIntegration: boolean;
  customReporting: boolean;
  dedicatedSuccess: boolean;
  aiPoweredInsights: boolean;
  advancedAnalytics: boolean;
  revenueForecasting: boolean;
  
  // Meta information
  currentTier: 'free' | 'starter' | 'professional' | 'premium' | 'enterprise';
  tierName: string;
  monthlyPrice: number;
  upgradeAvailable: boolean;
}

export class FeatureAccessControl {
  // Tier hierarchy for upgrade path
  private static readonly tierHierarchy = {
    free: 0,
    starter: 1,
    professional: 2,
    premium: 3,
    enterprise: 4
  };

  // Feature mapping by tier - Fortune 500 Enterprise Structure
  private static readonly tierFeatures = {
    free: [
      'basicListing',
      'contactDisplay',
      'searchVisibility'
    ],
    starter: [
      // Priority 1: Financial Transparency ($99/mo)
      'billingManagement',
      'financialReporting',
      'invoiceGeneration',
      'paymentTracking',
      'costCalculator'
    ],
    professional: [
      // Priority 2 & 3: Care Coordination + Daily Life ($499/mo)
      'careCoordination',
      'healthRecords',
      'medicationManagement',
      'carePlans',
      'dailyLifeActivities',
      'mealPlanning',
      'transportationScheduling',
      'familyMessaging'
    ],
    premium: [
      // Priority 4 & 5: Staff Management + Marketing ($999/mo)
      'staffManagement',
      'hrTools',
      'trainingPrograms',
      'performanceTracking',
      'marketingCRM',
      'leadTracking',
      'tourScheduler',
      'occupancyManagement',
      'campaignAnalytics'
    ],
    enterprise: [
      // Advanced Enterprise Features ($3,999/mo)
      'multiPropertyDashboard',
      'whiteLabeling',
      'apiIntegration',
      'customReporting',
      'dedicatedSuccess',
      'aiPoweredInsights',
      'advancedAnalytics',
      'revenueForecasting'
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
  private static getFeatureAccessForTier(tier: 'free' | 'starter' | 'professional' | 'premium' | 'enterprise'): FeatureAccess {
    const allFeatures: FeatureAccess = {
      // Initialize all features as false
      basicListing: false,
      contactDisplay: false,
      searchVisibility: false,
      billingManagement: false,
      financialReporting: false,
      invoiceGeneration: false,
      paymentTracking: false,
      costCalculator: false,
      careCoordination: false,
      healthRecords: false,
      medicationManagement: false,
      carePlans: false,
      dailyLifeActivities: false,
      mealPlanning: false,
      transportationScheduling: false,
      familyMessaging: false,
      staffManagement: false,
      hrTools: false,
      trainingPrograms: false,
      performanceTracking: false,
      marketingCRM: false,
      leadTracking: false,
      tourScheduler: false,
      occupancyManagement: false,
      campaignAnalytics: false,
      multiPropertyDashboard: false,
      whiteLabeling: false,
      apiIntegration: false,
      customReporting: false,
      dedicatedSuccess: false,
      aiPoweredInsights: false,
      advancedAnalytics: false,
      revenueForecasting: false,
      currentTier: tier,
      tierName: this.getTierDisplayName(tier),
      monthlyPrice: this.getTierPrice(tier),
      upgradeAvailable: tier !== 'enterprise'
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
  private static mapTierLevel(tierLevel: string): 'free' | 'starter' | 'professional' | 'premium' | 'enterprise' {
    const mapping: Record<string, 'free' | 'starter' | 'professional' | 'premium' | 'enterprise'> = {
      'basic-listing': 'free',
      'free': 'free',
      'verified': 'free',
      'starter': 'starter',
      'standard': 'starter',
      'professional': 'professional',
      'featured': 'professional',
      'premium': 'premium',
      'featured-spotlight': 'premium',
      'enterprise': 'enterprise',
      'platinum': 'enterprise',
      'platinum-partner': 'enterprise'
    };
    return mapping[tierLevel] || 'free';
  }

  // Get display name for tier
  private static getTierDisplayName(tier: 'free' | 'starter' | 'professional' | 'premium' | 'enterprise'): string {
    const names = {
      free: 'Free',
      starter: 'Starter',
      professional: 'Professional',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };
    return names[tier];
  }

  // Get monthly price for tier - Fortune 500 Enterprise Pricing
  private static getTierPrice(tier: 'free' | 'starter' | 'professional' | 'premium' | 'enterprise'): number {
    const prices = {
      free: 0,
      starter: 99,
      professional: 499,
      premium: 999,
      enterprise: 3999
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

    const tierOrder: Array<'free' | 'starter' | 'professional' | 'premium' | 'enterprise'> = ['free', 'starter', 'professional', 'premium', 'enterprise'];
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

  // Get human-readable feature names - Fortune 500 Enterprise Features
  private static getFeatureDisplayNames(features: string[]): string[] {
    const displayNames: Record<string, string> = {
      // Starter Features
      billingManagement: 'Complete Billing Management System',
      financialReporting: 'Financial Reporting & Analytics',
      invoiceGeneration: 'Automated Invoice Generation',
      paymentTracking: 'Payment Tracking & Processing',
      costCalculator: 'Family Cost Calculator Tool',
      // Professional Features
      careCoordination: 'Care Coordination Platform',
      healthRecords: 'Electronic Health Records',
      medicationManagement: 'Medication Management System',
      carePlans: 'Personalized Care Plans',
      dailyLifeActivities: 'Activity Calendar & Planning',
      mealPlanning: 'Meal Planning & Dietary Management',
      transportationScheduling: 'Transportation Scheduling',
      familyMessaging: 'Family Communication Portal',
      // Premium Features
      staffManagement: 'Complete Staff Management Suite',
      hrTools: 'HR Tools & Document Management',
      trainingPrograms: 'Staff Training Programs',
      performanceTracking: 'Performance Tracking & Reviews',
      marketingCRM: 'Marketing CRM System',
      leadTracking: 'Lead Tracking & Conversion',
      tourScheduler: 'Tour Scheduling & Management',
      occupancyManagement: 'Real-time Occupancy Management',
      campaignAnalytics: 'Marketing Campaign Analytics',
      // Enterprise Features
      multiPropertyDashboard: 'Multi-Property Management Dashboard',
      whiteLabeling: 'White Label Branding',
      apiIntegration: 'Full API Integration Access',
      customReporting: 'Custom Report Builder',
      dedicatedSuccess: 'Dedicated Success Manager',
      aiPoweredInsights: 'AI-Powered Business Insights',
      advancedAnalytics: 'Advanced Predictive Analytics',
      revenueForecasting: 'Revenue Forecasting & Optimization'
    };

    return features.map(f => displayNames[f] || f);
  }
}

export default FeatureAccessControl;