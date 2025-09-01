// Community Subscription Tier Management Service
// Enforces feature restrictions based on subscription tiers

export interface SubscriptionTier {
  name: 'starter' | 'growth' | 'professional' | 'premium' | 'enterprise';
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
  tourScheduling: boolean; // Always enabled if email verified
  
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
}

// Tier Definitions
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  starter: {
    name: 'starter',
    price: 99,
    displayName: 'Community Starter',
    features: {
      // Basic
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true, // If email verified
      
      // Media
      maxPhotos: 1, // Logo or exterior only
      maxVideos: 0,
      maxVideoLength: 0,
      
      // Documents
      maxPdfs: 0, // No PDF uploads
      
      // Engagement
      respondToReviews: false, // Cannot respond to reviews
      inAppMessaging: false, // No in-app messaging
      aiResponseAssist: false,
      
      // Analytics
      basicAnalytics: false, // No analytics
      advancedAnalytics: false,
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: false,
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      seasonalBadges: false,
      
      // Advanced
      tourCalendarLink: false, // No external calendar link
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      multiPropertyDashboard: false,
    }
  },
  
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
      maxPhotos: 10, // Up to 10 photos
      maxVideos: 0,
      maxVideoLength: 0,
      
      // Documents
      maxPdfs: 1, // 1 brochure/PDF
      
      // Engagement
      respondToReviews: true, // Can respond to reviews
      inAppMessaging: false,
      aiResponseAssist: false,
      
      // Analytics
      basicAnalytics: true, // Access basic listing analytics
      advancedAnalytics: false,
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: false,
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
    }
  },
  
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
      maxPhotos: 25, // Up to 25 photos
      maxVideos: 1, // 1 video
      maxVideoLength: 2, // Max 2 minutes
      
      // Documents
      maxPdfs: 3, // Up to 3 PDFs
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: false,
      
      // Visibility
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      seasonalBadges: true,
      
      // Advanced
      tourCalendarLink: true,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      multiPropertyDashboard: false,
    }
  },
  
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
      maxPhotos: 50, // Up to 50 photos
      maxVideos: 3, // Up to 3 videos
      maxVideoLength: 5, // Max 5 mins each
      
      // Documents
      maxPdfs: 999, // Unlimited PDFs
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: true, // Monthly performance review call
      
      // Visibility
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      seasonalBadges: true,
      
      // Advanced
      tourCalendarLink: true,
      staffBios: true, // Upload staff bios
      menus: true, // Upload menus
      carePhilosophy: true, // Upload care philosophy
      jobListings: true, // Upload job listings
      realTimeAvailability: true, // Real-time availability syncing
      multiPropertyDashboard: true, // Multi-property admin dashboard
    }
  },
  
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
      maxPhotos: 999, // Unlimited photos
      maxVideos: 999, // Unlimited videos
      maxVideoLength: 999, // Unlimited length
      
      // Documents
      maxPdfs: 999, // Unlimited PDFs
      
      // Engagement
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: true, // Quarterly business reviews
      
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
      multiPropertyDashboard: true, // White-label platform
    }
  }
};

// Helper Functions
export function getTierFeatures(tier: string): TierFeatures {
  const subscription = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.starter;
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
  return features[feature] === true;
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
  const subscription = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.starter;
  return subscription.displayName;
}

// Get tier price
export function getTierPrice(tier: string): number {
  const subscription = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.starter;
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
  const tierOrder = ['starter', 'growth', 'professional', 'premium', 'enterprise'];
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
  verified: string | boolean;
  standard: string | boolean;
  featured: string | boolean;
  platinum: string | boolean;
}> {
  return [
    {
      feature: 'Monthly Price',
      description: 'Subscription cost',
      verified: '$0',
      standard: '$149',
      featured: '$249',
      platinum: '$349'
    },
    {
      feature: 'Photo Uploads',
      description: 'Maximum photos allowed',
      verified: '1',
      standard: '10',
      featured: '25',
      platinum: '50'
    },
    {
      feature: 'Video Uploads',
      description: 'Maximum videos allowed',
      verified: '0',
      standard: '0',
      featured: '1 (2 min)',
      platinum: '3 (5 min each)'
    },
    {
      feature: 'PDF/Brochures',
      description: 'Document uploads',
      verified: '0',
      standard: '1',
      featured: '3',
      platinum: 'Unlimited'
    },
    {
      feature: 'Review Responses',
      description: 'Respond to user reviews',
      verified: false,
      standard: true,
      featured: true,
      platinum: true
    },
    {
      feature: 'In-App Messaging',
      description: 'Chat with families',
      verified: false,
      standard: false,
      featured: true,
      platinum: true
    },
    {
      feature: 'AI Response Assist',
      description: 'AI-powered message drafts',
      verified: false,
      standard: false,
      featured: true,
      platinum: true
    },
    {
      feature: 'Analytics',
      description: 'Performance insights',
      verified: false,
      standard: 'Basic',
      featured: 'Advanced',
      platinum: 'Advanced'
    },
    {
      feature: 'Featured Placement',
      description: 'Priority in search & maps',
      verified: false,
      standard: false,
      featured: true,
      platinum: true
    },
    {
      feature: 'Tour Calendar Link',
      description: 'External calendar integration',
      verified: false,
      standard: true,
      featured: true,
      platinum: true
    },
    {
      feature: 'Staff & Menus',
      description: 'Additional content sections',
      verified: false,
      standard: false,
      featured: false,
      platinum: true
    },
    {
      feature: 'Real-Time Availability',
      description: 'Live unit updates',
      verified: false,
      standard: false,
      featured: false,
      platinum: true
    },
    {
      feature: 'Multi-Property Dashboard',
      description: 'Manage multiple locations',
      verified: false,
      standard: false,
      featured: false,
      platinum: true
    },
    {
      feature: 'Monthly Performance Call',
      description: 'Dedicated support',
      verified: false,
      standard: false,
      featured: false,
      platinum: true
    }
  ];
}