/**
 * Single Source of Truth for Subscription Tiers
 * This file contains all tier definitions for communities and vendors
 * All components should import from this file to ensure consistency
 */

// ============================================
// COMMUNITY SUBSCRIPTION TIERS
// ============================================

export interface CommunityTierFeatures {
  // Basic Features
  editContactInfo: boolean;
  claimListing: boolean;
  displayReviews: boolean;
  tourScheduling: boolean;
  
  // Media Limits
  maxPhotos: number;
  maxVideos: number;
  maxVideoLength: number; // in minutes
  maxPdfs: number;
  
  // Engagement
  respondToReviews: boolean;
  inAppMessaging: boolean;
  aiResponseAssist: boolean;
  
  // Analytics
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  monthlyPerformanceCall: boolean;
  
  // Visibility
  featuredPlacement: boolean;
  mapPriority: boolean;
  searchBoost: boolean;
  conciergePreferred: boolean;
  
  // Advanced Features
  tourMate: boolean;
  aiLeaseGeneration: boolean;
  paymentProcessing: boolean;
  healthcareIntegrations: boolean;
  residentManagement: boolean;
  whiteLabelOptions: boolean;
  apiAccess: boolean;
  multiPropertyCount: number;
  
  // Additional Features
  staffBios: boolean;
  menus: boolean;
  carePhilosophy: boolean;
  jobListings: boolean;
  realTimeAvailability: boolean;
  tourCalendarLink: boolean;
}

export interface CommunityTier {
  id: string;
  name: string;
  displayName: string;
  price: number;
  priceDisplay: string;
  stripePriceId?: string;
  badge?: string;
  popular?: boolean;
  features: CommunityTierFeatures;
  highlights: string[]; // Key selling points to display
  description: string;
}

export const COMMUNITY_TIERS: Record<string, CommunityTier> = {
  free: {
    id: 'free',
    name: 'free',
    displayName: 'Free Claim',
    price: 0,
    priceDisplay: 'FREE',
    badge: 'Claim Your Listing',
    description: 'Correct your basic information and claim your community listing',
    highlights: [
      'Claim & verify your listing',
      'Edit contact information',
      'Add 1 photo for verification',
      'Display existing reviews',
      'Basic listing visibility'
    ],
    features: {
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: false,
      maxPhotos: 1,
      maxVideos: 0,
      maxVideoLength: 0,
      maxPdfs: 0,
      respondToReviews: false,
      inAppMessaging: false,
      aiResponseAssist: false,
      basicAnalytics: false,
      advancedAnalytics: false,
      monthlyPerformanceCall: false,
      featuredPlacement: false,
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      tourMate: false,
      aiLeaseGeneration: false,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      tourCalendarLink: false,
    }
  },
  
  starter: {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    price: 99,
    priceDisplay: '$99/mo',
    stripePriceId: 'price_1S53IkEQ489MwJ34ktvmZFHk',
    description: 'Essential online presence for single communities',
    highlights: [
      '5 photos for your listing',
      'Tour scheduling system',
      'Basic analytics & view counts',
      'Contact information display',
      'Standard search placement',
      'Email support'
    ],
    features: {
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      maxPhotos: 5,
      maxVideos: 0,
      maxVideoLength: 0,
      maxPdfs: 0,
      respondToReviews: false,
      inAppMessaging: false,
      aiResponseAssist: false,
      basicAnalytics: true,
      advancedAnalytics: false,
      monthlyPerformanceCall: false,
      featuredPlacement: false,
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      tourMate: false,
      aiLeaseGeneration: false,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      tourCalendarLink: false,
    }
  },
  
  growth: {
    id: 'growth',
    name: 'growth',
    displayName: 'Growth',
    price: 299,
    priceDisplay: '$299/mo',
    stripePriceId: 'price_1S53IlEQ489MwJ34c6h8MRG8',
    badge: 'Most Popular',
    popular: true,
    description: 'Enhanced visibility & engagement tools',
    highlights: [
      '💬 Live messaging with families',
      '20 photos + 1 video (2 min)',
      '3 PDF brochures',
      'Featured search placement',
      'TourMate™ advanced scheduling',
      'Respond to reviews',
      'Advanced analytics',
      'Priority support'
    ],
    features: {
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      maxPhotos: 20,
      maxVideos: 1,
      maxVideoLength: 2,
      maxPdfs: 3,
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: false,
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: false,
      featuredPlacement: true,
      mapPriority: false,
      searchBoost: false,
      conciergePreferred: false,
      tourMate: true,
      aiLeaseGeneration: false,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1,
      staffBios: false,
      menus: false,
      carePhilosophy: false,
      jobListings: false,
      realTimeAvailability: false,
      tourCalendarLink: true,
    }
  },
  
  professional: {
    id: 'professional',
    name: 'professional',
    displayName: 'Professional',
    price: 999,
    priceDisplay: '$999/mo',
    stripePriceId: 'price_1S53ImEQ489MwJ34haImoDqJ',
    description: 'Complete suite for multi-property management',
    highlights: [
      '⭐ Manage up to 5 properties',
      'Unlimited photos & PDFs',
      '5 videos (5 min each)',
      '🤖 AI lease generation',
      'AI response assistant',
      'Priority map placement',
      'SEO boost & concierge preferred',
      'Staff bios, menus, care philosophy',
      'Dedicated success manager'
    ],
    features: {
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      maxPhotos: 999,
      maxVideos: 5,
      maxVideoLength: 5,
      maxPdfs: 999,
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: false,
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: false,
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 5,
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: false,
      realTimeAvailability: false,
      tourCalendarLink: true,
    }
  },
  
  premium: {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium',
    price: 1999,
    priceDisplay: '$1,999/mo',
    stripePriceId: 'price_1S53InEQ489MwJ34Be6qsJBz',
    description: 'Enterprise features for large portfolios',
    highlights: [
      '💎 Manage up to 10 properties',
      '10 videos (10 min each)',
      '💳 Payment & deposit processing',
      '🏥 Healthcare integrations (Epic, Cerner)',
      'Job listings board',
      'Real-time availability sync',
      'Monthly strategy calls',
      'Quarterly business reviews'
    ],
    features: {
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      maxPhotos: 999,
      maxVideos: 10,
      maxVideoLength: 10,
      maxPdfs: 999,
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: true,
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: true,
      healthcareIntegrations: true,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 10,
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: true,
      realTimeAvailability: true,
      tourCalendarLink: true,
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 3999,
    priceDisplay: '$3,999/mo',
    stripePriceId: 'price_1S53InEQ489MwJ34FMoJIocA',
    badge: 'White Label',
    description: 'Fortune 500 infrastructure & unlimited scale',
    highlights: [
      '🚀 Manage 25+ properties',
      'Everything unlimited',
      '👥 Full resident management portal',
      'White-label platform options',
      'Full API access & webhooks',
      'Custom domain & branding',
      'Dedicated infrastructure',
      'SLA guarantees',
      'Executive partnership team'
    ],
    features: {
      editContactInfo: true,
      claimListing: true,
      displayReviews: true,
      tourScheduling: true,
      maxPhotos: 999,
      maxVideos: 999,
      maxVideoLength: 999,
      maxPdfs: 999,
      respondToReviews: true,
      inAppMessaging: true,
      aiResponseAssist: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      monthlyPerformanceCall: true,
      featuredPlacement: true,
      mapPriority: true,
      searchBoost: true,
      conciergePreferred: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: true,
      healthcareIntegrations: true,
      residentManagement: true,
      whiteLabelOptions: true,
      apiAccess: true,
      multiPropertyCount: 25,
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: true,
      realTimeAvailability: true,
      tourCalendarLink: true,
    }
  }
};

// ============================================
// VENDOR SUBSCRIPTION TIERS
// ============================================

export interface VendorTierFeatures {
  listingVisible: boolean;
  regionalCoverage: number; // -1 for unlimited
  leadGeneration: number;
  featuredPlacement: boolean;
  prioritySupport: boolean;
  analyticsAccess: string;
  profileCustomization: string;
  productListings: number;
  monthlyClicks: number;
  responseTime: string;
  verifiedBadge: boolean;
  promotionalOffers: number;
  userReviews: boolean;
  apiAccess: boolean;
  customIntegrations: boolean;
  dedicatedAccountManager: boolean;
}

export interface VendorTier {
  id: string;
  name: string;
  displayName: string;
  price: number;
  priceDisplay: string;
  stripePriceId?: string;
  badge?: string;
  popular?: boolean;
  features: VendorTierFeatures;
  highlights: string[];
  description: string;
}

export const VENDOR_TIERS: Record<string, VendorTier> = {
  basic: {
    id: 'basic',
    name: 'basic',
    displayName: 'Basic Vendor',
    price: 99,
    priceDisplay: '$99/mo',
    stripePriceId: 'price_vendor_basic',
    description: 'Essential vendor listing with lead generation',
    highlights: [
      'Enhanced vendor listing',
      '5 qualified leads per month',
      'Service area targeting',
      'Basic company profile',
      'Contact information display',
      'Standard search visibility',
      'Email support'
    ],
    features: {
      listingVisible: true,
      regionalCoverage: 1,
      leadGeneration: 5,
      featuredPlacement: false,
      prioritySupport: false,
      analyticsAccess: 'basic',
      profileCustomization: 'basic',
      productListings: 10,
      monthlyClicks: 100,
      responseTime: '48 hours',
      verifiedBadge: false,
      promotionalOffers: 0,
      userReviews: true,
      apiAccess: false,
      customIntegrations: false,
      dedicatedAccountManager: false,
    }
  },
  
  featured: {
    id: 'featured',
    name: 'featured',
    displayName: 'Featured Vendor',
    price: 399,
    priceDisplay: '$399/mo',
    stripePriceId: 'price_vendor_featured',
    badge: 'Most Popular',
    popular: true,
    description: 'Featured placement with advanced lead generation',
    highlights: [
      'Everything in Basic, plus:',
      'Featured vendor placement',
      '25 qualified leads per month',
      'Priority support & analytics',
      'Custom landing page',
      'Advanced lead scoring',
      'Company logo & branding',
      'Promotional campaigns',
      'Phone support'
    ],
    features: {
      listingVisible: true,
      regionalCoverage: 3,
      leadGeneration: 25,
      featuredPlacement: true,
      prioritySupport: true,
      analyticsAccess: 'advanced',
      profileCustomization: 'advanced',
      productListings: 50,
      monthlyClicks: 500,
      responseTime: '24 hours',
      verifiedBadge: true,
      promotionalOffers: 3,
      userReviews: true,
      apiAccess: false,
      customIntegrations: false,
      dedicatedAccountManager: false,
    }
  },
  
  national: {
    id: 'national',
    name: 'national',
    displayName: 'National Partner',
    price: 999,
    priceDisplay: '$999/mo',
    stripePriceId: 'price_vendor_national',
    badge: 'Enterprise',
    description: 'Nationwide coverage with unlimited leads',
    highlights: [
      'Everything in Featured, plus:',
      'Unlimited leads nationwide',
      'API integration access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Quarterly business reviews',
      'Priority routing in AI system',
      'International expansion ready'
    ],
    features: {
      listingVisible: true,
      regionalCoverage: -1, // Unlimited
      leadGeneration: 999, // Unlimited
      featuredPlacement: true,
      prioritySupport: true,
      analyticsAccess: 'enterprise',
      profileCustomization: 'custom',
      productListings: 999,
      monthlyClicks: 999,
      responseTime: 'Immediate',
      verifiedBadge: true,
      promotionalOffers: 999,
      userReviews: true,
      apiAccess: true,
      customIntegrations: true,
      dedicatedAccountManager: true,
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCommunityTier(tierId: string): CommunityTier {
  return COMMUNITY_TIERS[tierId] || COMMUNITY_TIERS.free;
}

export function getVendorTier(tierId: string): VendorTier {
  return VENDOR_TIERS[tierId] || VENDOR_TIERS.basic;
}

export function getCommunityTierByPrice(price: number): CommunityTier | undefined {
  return Object.values(COMMUNITY_TIERS).find(tier => tier.price === price);
}

export function getVendorTierByPrice(price: number): VendorTier | undefined {
  return Object.values(VENDOR_TIERS).find(tier => tier.price === price);
}

export function formatTierPrice(price: number, billingCycle: 'monthly' | 'annual' = 'monthly'): string {
  if (price === 0) return 'FREE';
  
  const displayPrice = billingCycle === 'annual' ? Math.floor(price * 12 * 0.8) : price;
  const period = billingCycle === 'annual' ? '/year' : '/mo';
  
  return `$${displayPrice.toLocaleString()}${period}`;
}

// Export tier arrays for iteration
export const COMMUNITY_TIER_LIST = Object.values(COMMUNITY_TIERS);
export const VENDOR_TIER_LIST = Object.values(VENDOR_TIERS);

// Legacy mapping for backward compatibility (will be removed)
export const LEGACY_TIER_MAPPING: Record<string, string> = {
  'verified': 'free',
  'standard': 'starter',
  'featured': 'growth',
  'platinum': 'professional',
  'basic-vendor': 'basic',
  'featured-vendor': 'featured',
  'national-partner': 'national'
};