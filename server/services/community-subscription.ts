// Community Subscription Tier Management Service
// Enforces feature restrictions based on subscription tiers

export interface SubscriptionTier {
  name: 'free' | 'starter' | 'growth' | 'professional' | 'premium' | 'enterprise';
  price: number;
  displayName: string;
  badge?: string;
  features: TierFeatures;
}

export interface TierFeatures {
  // Basic Listing Features
  editContactInfo: boolean;
  claimListing: boolean;
  displayReviews: boolean;
  tourScheduling: boolean;
  
  // Photo & Media
  maxPhotos: number;
  maxVideos: number;
  maxVideoLength: number; // in minutes
  
  // Documents
  maxPdfs: number;
  
  // Engagement Features
  respondToReviews: boolean;
  inAppMessaging: boolean;
  aiResponseAssist: boolean;
  
  // Analytics & Insights
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  monthlyPerformanceCall: boolean;
  
  // Visibility & Placement
  featuredPlacement: boolean;
  mapPriority: boolean;
  searchBoost: boolean;
  conciergePreferred: boolean;
  seasonalBadges: boolean;
  
  // Advanced Features
  tourCalendarLink: boolean;
  staffBios: boolean;
  menus: boolean;
  carePhilosophy: boolean;
  jobListings: boolean;
  realTimeAvailability: boolean;
  multiPropertyDashboard: boolean;
  tourMate: boolean;
  aiLeaseGeneration: boolean;
  paymentProcessing: boolean;
  healthcareIntegrations: boolean;
  residentManagement: boolean;
  whiteLabelOptions: boolean;
  apiAccess: boolean;
  multiPropertyCount: number;
}

// Tier Definitions with Fortune 500-level features
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  // FREE CLAIM TIER - Basic information correction
  free: {
    name: 'free',
    price: 0,
    displayName: 'Free Claim',
    features: {
      // Basic
      editContactInfo: true, // Can correct basic info
      claimListing: true,
      displayReviews: true, // Shows existing reviews
      tourScheduling: false, // No tour scheduling
      
      // Media
      maxPhotos: 1, // 1 photo for verification
      maxVideos: 0,
      maxVideoLength: 0,
      
      // Documents
      maxPdfs: 0,
      
      // Engagement
      respondToReviews: false,
      inAppMessaging: false,
      aiResponseAssist: false,
      
      // Analytics
      basicAnalytics: false,
      advancedAnalytics: false,
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: false,
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      seasonalBadges: false,
      
      // Advanced
      tourCalendarLink: false,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      multiPropertyDashboard: false,
      tourMate: false,
      aiLeaseGeneration: false,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1,
    }
  },
  
  // STARTER - $99/month
  starter: {
    name: 'starter',
    price: 99,
    displayName: 'Community Starter',
    badge: 'Starter',
    features: {
      // Basic
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true, // Basic tour scheduling
      
      // Media
      maxPhotos: 5, // Increased from 1 to 5
      maxVideos: 0,
      maxVideoLength: 0,
      
      // Documents
      maxPdfs: 0,
      
      // Engagement
      respondToReviews: false,
      inAppMessaging: false, // No messaging at this tier
      aiResponseAssist: false,
      
      // Analytics
      basicAnalytics: true, // Basic view counts
      advancedAnalytics: false,
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: false,
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      seasonalBadges: false,
      
      // Advanced
      tourCalendarLink: false,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      multiPropertyDashboard: false,
      tourMate: false,
      aiLeaseGeneration: false,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1,
    }
  },
  
  // GROWTH - $299/month
  growth: {
    name: 'growth',
    price: 299,
    displayName: 'Community Growth',
    badge: 'Growth Partner',
    features: {
      // Basic
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      
      // Media
      maxPhotos: 20, // Increased from 10 to 20
      maxVideos: 1, // Added 1 video
      maxVideoLength: 2, // 2 minute video
      
      // Documents
      maxPdfs: 3, // Increased from 1 to 3
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true, // MOVED HERE - Messaging with families
      aiResponseAssist: false,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true, // Advanced analytics
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: true, // Featured in search
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      seasonalBadges: false,
      
      // Advanced
      tourCalendarLink: true,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      multiPropertyDashboard: false,
      tourMate: true, // TourMate™ scheduling system
      aiLeaseGeneration: false,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1,
    }
  },
  
  // PROFESSIONAL - $999/month
  professional: {
    name: 'professional',
    price: 999,
    displayName: 'Community Professional',
    badge: 'Professional Partner',
    features: {
      // Basic
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      
      // Media
      maxPhotos: 999, // Unlimited photos
      maxVideos: 5, // 5 videos
      maxVideoLength: 5, // 5 minutes each
      
      // Documents
      maxPdfs: 999, // Unlimited PDFs
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true, // AI-powered responses
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: true,
      mapPriority: true, // Priority on map
      searchBoost: true, // SEO boost
      conciergePreferred: true, // Preferred by AI concierge
      seasonalBadges: true,
      
      // Advanced
      tourCalendarLink: true,
      staffBios: true, // Staff profiles
      menus: true, // Dining menus
      carePhilosophy: true, // Care philosophy
      jobListings: false,
      realTimeAvailability: false,
      multiPropertyDashboard: true, // Multi-property support
      tourMate: true,
      aiLeaseGeneration: true, // AI lease documents
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 5, // Up to 5 properties
    }
  },
  
  // PREMIUM - $1999/month
  premium: {
    name: 'premium',
    price: 1999,
    displayName: 'Community Premium',
    badge: 'Premium Partner',
    features: {
      // Basic
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      
      // Media
      maxPhotos: 999, // Unlimited
      maxVideos: 10, // 10 videos
      maxVideoLength: 10, // 10 minutes each
      
      // Documents
      maxPdfs: 999, // Unlimited
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: true, // Monthly strategy calls
      
      // Visibility
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      seasonalBadges: true,
      
      // Advanced
      tourCalendarLink: true,
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: true, // Job board
      realTimeAvailability: true, // Live availability
      multiPropertyDashboard: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: true, // Accept payments online
      healthcareIntegrations: true, // EHR integrations
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 10, // Up to 10 properties
    }
  },
  
  // ENTERPRISE - $3999/month
  enterprise: {
    name: 'enterprise',
    price: 3999,
    displayName: 'Community Enterprise',
    badge: 'Enterprise Partner',
    features: {
      // Basic
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      
      // Media
      maxPhotos: 999, // Unlimited
      maxVideos: 999, // Unlimited
      maxVideoLength: 999, // Unlimited length
      
      // Documents
      maxPdfs: 999, // Unlimited
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: true, // Dedicated account manager
      
      // Visibility
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      seasonalBadges: true,
      
      // Advanced
      tourCalendarLink: true,
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: true,
      realTimeAvailability: true,
      multiPropertyDashboard: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: true,
      healthcareIntegrations: true,
      residentManagement: true, // Full resident portal
      whiteLabelOptions: true, // White-label platform
      apiAccess: true, // API access
      multiPropertyCount: 25, // 25+ properties
    }
  }
};

// Helper Functions
export function getTierFeatures(tier: string): TierFeatures {
  const subscription = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  return subscription.features;
}

export function canUploadPhotos(tier: string, currentCount: number): boolean {
  const features = getTierFeatures(tier);
  return currentCount < features.maxPhotos;
}

export function canUploadVideos(tier: string, currentCount: number): boolean {
  const features = getTierFeatures(tier);
  return currentCount < features.maxVideos;
}

export function canUploadPdfs(tier: string, currentCount: number): boolean {
  const features = getTierFeatures(tier);
  return currentCount < features.maxPdfs;
}

export function hasFeature(tier: string, feature: keyof TierFeatures): boolean {
  const features = getTierFeatures(tier);
  const value = features[feature];
  return value === true || (typeof value === 'number' && value > 0);
}

export function getMaximumValue(tier: string, feature: keyof TierFeatures): number {
  const features = getTierFeatures(tier);
  const value = features[feature];
  return typeof value === 'number' ? value : 0;
}

// Get tier badge for display
export function getTierBadge(tier: string): string | undefined {
  const subscription = SUBSCRIPTION_TIERS[tier];
  return subscription?.badge;
}

// Get tier display name
export function getTierDisplayName(tier: string): string {
  const subscription = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  return subscription.displayName;
}

// Get tier price
export function getTierPrice(tier: string): number {
  const subscription = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  return subscription.price;
}

// Check if community can use a specific feature
export function canUseFeature(communityTier: string, feature: keyof TierFeatures, currentUsage?: number): boolean {
  const features = getTierFeatures(communityTier);
  const featureValue = features[feature];
  
  // Boolean features
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // Numeric features (limits)
  if (typeof featureValue === 'number' && currentUsage !== undefined) {
    return currentUsage < featureValue;
  }
  
  return false;
}

// Get upgrade suggestions based on requested feature
export function getUpgradeOptionsForFeature(currentTier: string, requestedFeature: keyof TierFeatures): SubscriptionTier[] {
  const upgradeTiers: SubscriptionTier[] = [];
  const tierOrder = ['free', 'starter', 'growth', 'professional', 'premium', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  for (let i = currentIndex + 1; i < tierOrder.length; i++) {
    const tier = SUBSCRIPTION_TIERS[tierOrder[i]];
    const featureValue = tier.features[requestedFeature];
    
    // If this tier has the feature (or higher limit), add it as an option
    if ((typeof featureValue === 'boolean' && featureValue) || 
        (typeof featureValue === 'number' && featureValue > 0)) {
      upgradeTiers.push(tier);
    }
  }
  
  return upgradeTiers;
}

// Format tier comparison for display
export function getTierComparison(): Array<{
  feature: string;
  description: string;
  free: string | boolean;
  starter: string | boolean;
  growth: string | boolean;
  professional: string | boolean;
  premium: string | boolean;
  enterprise: string | boolean;
}> {
  return [
    {
      feature: 'Monthly Price',
      description: 'Subscription cost',
      free: 'FREE',
      starter: '$99',
      growth: '$299',
      professional: '$999',
      premium: '$1,999',
      enterprise: '$3,999'
    },
    {
      feature: 'Photo Uploads',
      description: 'Maximum photos allowed',
      free: '1',
      starter: '5',
      growth: '20',
      professional: 'Unlimited',
      premium: 'Unlimited',
      enterprise: 'Unlimited'
    },
    {
      feature: 'Video Uploads',
      description: 'Maximum videos allowed',
      free: '0',
      starter: '0',
      growth: '1 (2 min)',
      professional: '5 (5 min)',
      premium: '10 (10 min)',
      enterprise: 'Unlimited'
    },
    {
      feature: 'PDF/Brochures',
      description: 'Document uploads',
      free: '0',
      starter: '0',
      growth: '3',
      professional: 'Unlimited',
      premium: 'Unlimited',
      enterprise: 'Unlimited'
    },
    {
      feature: 'Messaging with Families',
      description: 'In-app communication',
      free: false,
      starter: false,
      growth: true, // Moved to Growth
      professional: true,
      premium: true,
      enterprise: true
    },
    {
      feature: 'AI Response Assistant',
      description: 'AI-powered message drafts',
      free: false,
      starter: false,
      growth: false,
      professional: true,
      premium: true,
      enterprise: true
    },
    {
      feature: 'Analytics',
      description: 'Performance insights',
      free: false,
      starter: 'Basic',
      growth: 'Advanced',
      professional: 'Advanced',
      premium: 'Premium',
      enterprise: 'Enterprise'
    },
    {
      feature: 'Featured Placement',
      description: 'Priority in search',
      free: false,
      starter: false,
      growth: true,
      professional: true,
      premium: true,
      enterprise: true
    },
    {
      feature: 'TourMate™ System',
      description: 'Advanced tour scheduling',
      free: false,
      starter: false,
      growth: true,
      professional: true,
      premium: true,
      enterprise: true
    },
    {
      feature: 'AI Lease Generation',
      description: 'Automated documents',
      free: false,
      starter: false,
      growth: false,
      professional: true,
      premium: true,
      enterprise: true
    },
    {
      feature: 'Payment Processing',
      description: 'Accept online payments',
      free: false,
      starter: false,
      growth: false,
      professional: false,
      premium: true,
      enterprise: true
    },
    {
      feature: 'Healthcare Integrations',
      description: 'EHR/EMR connections',
      free: false,
      starter: false,
      growth: false,
      professional: false,
      premium: true,
      enterprise: true
    },
    {
      feature: 'Multi-Property Support',
      description: 'Manage multiple locations',
      free: '1',
      starter: '1',
      growth: '1',
      professional: '5',
      premium: '10',
      enterprise: '25+'
    },
    {
      feature: 'White Label Options',
      description: 'Custom branding',
      free: false,
      starter: false,
      growth: false,
      professional: false,
      premium: false,
      enterprise: true
    },
    {
      feature: 'API Access',
      description: 'Developer integration',
      free: false,
      starter: false,
      growth: false,
      professional: false,
      premium: false,
      enterprise: true
    }
  ];
}