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
  
  // AI & Intelligence (Hidden Features)
  perplexityAI?: boolean;
  claudeAI?: boolean;
  openAI?: boolean;
  grokAI?: boolean;
  multiAIOrchestration?: boolean;
  aiMarketIntelligence?: boolean;
  nlpSearch?: boolean;
  semanticSearch?: boolean;
  
  // Healthcare Systems (Hidden Features)
  epicFHIR?: boolean;
  cernerIntegration?: boolean;
  medicareVerification?: boolean;
  pharmacyIntegration?: boolean;
  
  // Transportation (Hidden Features)  
  uberHealthIntegration?: boolean;
  lyftHealthcareIntegration?: boolean;
  transportationCoordination?: boolean;
  
  // RMS Integrations (Hidden Features)
  yardiIntegration?: boolean;
  realPageIntegration?: boolean;
  entrataIntegration?: boolean;
  oneSiteIntegration?: boolean;
  repsIntegration?: boolean;
  lcsIntegration?: boolean;
  aLineIntegration?: boolean;
  
  // CRM & Marketing (Hidden Features)
  salesforceIntegration?: boolean;
  hubspotIntegration?: boolean;
  mailchimpIntegration?: boolean;
  facebookMarketing?: boolean;
  linkedInSales?: boolean;
  whatsappBusiness?: boolean;
  twilioSMS?: boolean;
  
  // Document Management (Hidden Features)
  docusignIntegration?: boolean;
  documensoIntegration?: boolean;
  documentVersionControl?: boolean;
  backgroundChecks?: boolean;
  
  // Infrastructure (Hidden Features)
  redisCaching?: boolean;
  webSocketSupport?: boolean;
  securityDashboard?: boolean;
  performanceMonitoring?: boolean;
  zapierAutomation?: boolean;
  
  // Data Access (Hidden Features)
  hudDataAccess?: boolean;
  governmentDataAccess?: boolean;
  marketPricingIntelligence?: boolean;
  
  // Communication (Hidden Features)
  sendGridEmail?: boolean;
  zoomIntegration?: boolean;
  googleCalendarSync?: boolean;
  emergencyContactSystem?: boolean;
  
  // E-commerce (Hidden Features)
  amazonAssociates?: boolean;
  affiliateTracking?: boolean;
  
  // Advanced Analytics (Hidden Features)
  businessIntelligence?: boolean;
  executiveDashboard?: boolean;
  heatmapAnalytics?: boolean;
  apiCostAnalyzer?: boolean;
  predictiveAnalytics?: boolean;
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
    badge: 'Unclaimed',
    description: 'Get verified, appear in search, and let our concierge handle your inbound interest',
    highlights: [
      'Claim + verify listing',
      'Display 1 photo (verified)',
      'Read-only public reviews',
      'TourMate™ enabled (via Valet Assist™ concierge fallback)',
      'Reservation requests enabled (Valet Assist™ handles manually)',
      'AI-powered search indexing (NLP only)',
      'View-only HUD properties (4,784)',
      'Real-time enrichment (user-triggered)',
      '"Unclaimed" badge'
    ],
    features: {
      editContactInfo: false, // Free tier can't edit
      claimListing: true,
      displayReviews: true,
      tourScheduling: false, // Handled by Valet Assist
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
      tourMate: false, // Enabled via Valet Assist fallback
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
      valetAssist: true, // New feature for concierge fallback
      realTimeEnrichment: true, // User-triggered enrichment
    }
  },
  
  starter: {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    price: 99,
    priceDisplay: '$99/mo',
    stripePriceId: 'price_1S53IkEQ489MwJ34ktvmZFHk',
    description: 'Professional online presence with TourMate™ scheduling, lead tracking, and basic analytics',
    highlights: [
      '5 photos gallery',
      'TourMate™ tour scheduling system',
      '📊 Basic analytics (view counts & engagement)',
      '🔍 AI-boosted search ranking',
      '💼 Lead capture forms',
      '📄 Basic document templates',
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
      tourMate: true, // TourMate™ scheduling at Starter level
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
    description: 'Enhanced analytics, virtual tours, featured placement, and priority support',
    highlights: [
      '20 photos gallery',
      '📹 1 video (2 min)',
      '3 PDF brochures',
      '⭐ Featured placement + AI optimization',
      '🤖 AI-powered review response assistant',
      '📊 Enhanced analytics + conversion tracking',
      '📱 Facebook pixel + basic email campaigns',
      '🔗 Basic CRM integration (lead capture)',
      '🚗 View transportation options',
      'Priority support (24-hour response)'
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
    }
  },
  
  professional: {
    id: 'professional',
    name: 'professional',
    displayName: 'Professional',
    price: 999,
    priceDisplay: '$999/mo',
    stripePriceId: 'price_1S53ImEQ489MwJ34haImoDqJ',
    description: 'Payment processing, CRM integrations, Zoom virtual tours, and advanced analytics',
    highlights: [
      'Unlimited photos + Matterport 3D tours',
      '5 videos (5 min each) + virtual staging',
      '💳 Stripe payment processing',
      '📹 Zoom integration for virtual tours',
      '💼 Salesforce OR HubSpot CRM integration',
      '📄 DocuSign + Documenso + legal templates',
      '📧 Mailchimp + LinkedIn Sales Navigator',
      '🔌 Basic API access (1,000 calls/day)',
      '🚗 Transportation coordination tools',
      '📊 Executive dashboard + predictive analytics',
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
      paymentProcessing: true, // Payment processing starts at Professional
      healthcareIntegrations: false,
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 1, // No multi-property at Professional
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: false,
      realTimeAvailability: false,
      zoomIntegration: true, // Zoom at Professional and above
      salesforceIntegration: true, // Salesforce CRM at Professional
      hubspotIntegration: true, // HubSpot CRM at Professional
    }
  },
  
  premium: {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium',
    price: 1999,
    priceDisplay: '$1,999/mo',
    stripePriceId: 'price_1S53InEQ489MwJ34Be6qsJBz',
    description: 'Background checks, insurance verification, multiple properties, and advanced business intelligence',
    highlights: [
      '💎 Manage up to 10 properties + advanced portfolio tools',
      '🔒 Background checks + compliance tracking',
      '📋 Renter insurance verification',
      '💳 Stripe payments + commission tracking',
      '💼 ALL CRMs: Salesforce + HubSpot + custom CRM',
      '📱 Facebook Ads + Google Ads + marketing automation',
      '🏛️ Full HUD data access (4,784 properties)',
      '📊 Business intelligence + financial analytics',
      '🔌 Advanced API (10,000 calls/day)',
      'Monthly strategy calls + Quarterly reviews'
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
      backgroundChecks: true, // Background checks at Premium
      renterInsuranceVerification: true, // Insurance verification at Premium
      healthcareIntegrations: false, // Coming soon
      residentManagement: false,
      whiteLabelOptions: false,
      apiAccess: false,
      multiPropertyCount: 10,
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: true,
      realTimeAvailability: true,
      zoomIntegration: true, // Continues from Professional
      salesforceIntegration: true, // Continues from Professional
      hubspotIntegration: true, // Continues from Professional
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
    description: 'White-label platform with RMS integrations, unlimited properties, and enterprise infrastructure',
    highlights: [
      '🚀 UNLIMITED properties with multi-portfolio management',
      '🏢 ALL 7 RMS INTEGRATIONS: Yardi + RealPage + Entrata + OneSite + REPS + LCS + A-Line',
      '🏢 ATRIA-SPECIFIC TOOLS + chain customization',
      '🤖 ALL 5 AI SYSTEMS + custom AI model training',
      '💼 EVERY CRM & MARKETING PLATFORM + Zapier automation',
      '⚡ Redis caching + WebSocket + CDN + monitoring',
      '🏛️ Priority government data + custom reports',
      '🏷️ Full white-label + custom domain + complete branding',
      '🔌 UNLIMITED API + webhooks + real-time data',
      '📊 Predictive AI + custom BI reports + all analytics',
      '👥 Executive partnership team + 24/7 support + SLA guarantees'
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
      healthcareIntegrations: false, // Coming soon
      residentManagement: true,
      whiteLabelOptions: true,
      apiAccess: true,
      multiPropertyCount: 999, // Multi-property management at Enterprise
      staffBios: true,
      menus: true,
      carePhilosophy: true,
      jobListings: true,
      realTimeAvailability: true,
      backgroundChecks: true, // Continues from Premium
      renterInsuranceVerification: true, // Continues from Premium
      zoomIntegration: true, // Continues from Professional
      salesforceIntegration: true, // Continues from Professional
      hubspotIntegration: true, // Continues from Professional
      rmsIntegrations: true, // RMS integrations at Enterprise
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
    description: 'AI-qualified lead generation with conversion tracking, ROI analytics, and SEO-optimized listing',
    highlights: [
      'Enhanced vendor listing with SEO optimization',
      '5 AI-qualified leads per month',
      '🤖 AI-powered lead matching',
      'Service area geographic targeting',
      'Basic company profile + logo',
      '📊 Conversion tracking + ROI analytics',
      'Contact information + click tracking',
      'Standard search visibility',
      'Email support (48-hour response)'
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
    description: 'Featured placement with AI lead scoring, custom landing pages, marketing automation, and verified badge',
    highlights: [
      'Everything in Basic, plus:',
      '⭐ Featured vendor placement with AI optimization',
      '25 AI-qualified & scored leads per month',
      '📊 Advanced analytics with predictive insights',
      '🌐 Custom landing page with conversion tracking',
      '🤖 AI-powered lead scoring & qualification',
      '📧 Email campaigns + marketing automation',
      'Company logo & full branding suite',
      '🎯 3 promotional campaigns per month',
      '✅ Verified vendor badge',
      'Priority phone support (24-hour response)'
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
    description: 'Unlimited AI-scored leads, full API access, priority AI routing, white-label options, and dedicated success team',
    highlights: [
      'Everything in Featured, plus:',
      '🌎 UNLIMITED AI-scored leads nationwide',
      '🔌 Full API access + integration support',
      '💼 Dedicated account manager + success team',
      '🤖 Priority routing in all 5 AI systems',
      '📊 Predictive analytics + Business Intelligence',
      '🗺️ Geographic heat mapping + territory analysis',
      '🏷️ White-label options + custom branding',
      '⚡ Custom integrations + Zapier automation',
      '🌐 International expansion support',
      'Unlimited promotional campaigns',
      'Quarterly business reviews + strategy sessions',
      'Immediate response time + 24/7 support'
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