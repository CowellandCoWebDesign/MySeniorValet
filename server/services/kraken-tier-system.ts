/**
 * THE KRAKEN TIER SYSTEM
 * =====================
 * MySeniorValet's $50M AI Platform Revenue Architecture
 * 
 * Core Principle: FAMILIES ALWAYS FREE
 * Revenue: B2B Only (Communities, Professionals, Healthcare, Vendors)
 * 
 * Neural Network Capabilities:
 * - Multi-AI Orchestration (Claude, ChatGPT, Perplexity)
 * - Self-Healing Data Systems
 * - Predictive Analytics & Forecasting
 * - CRM/RMS Integrations (6+ providers)
 * - Real-time Market Intelligence
 */

export interface KrakenTier {
  id: string;
  name: string;
  category: 'family' | 'professional' | 'community' | 'enterprise' | 'vendor' | 'api';
  price: number; // Monthly price in dollars
  annual_discount?: number; // Percentage discount for annual payment
  features: Record<string, any>;
  api_calls?: number; // Monthly API call limit
  overage_rate?: number; // Cost per additional API call
  setup_fee?: number; // One-time setup fee
}

// ==========================================
// FAMILY TIER - ALWAYS FREE (CORE PRINCIPLE)
// ==========================================
export const FAMILY_TIER: KrakenTier = {
  id: 'family_free',
  name: 'Family (Always Free)',
  category: 'family',
  price: 0,
  features: {
    // Full Platform Access
    unified_ai_search: true,
    multi_ai_insights: true, // Claude, ChatGPT, Perplexity
    neural_search: true,
    semantic_understanding: true,
    trilingual_support: true, // English, French, Spanish
    
    // Core Tools
    save_searches: -1, // Unlimited
    saved_communities: -1, // Unlimited
    comparison_table: -1, // Unlimited
    tour_scheduling: true,
    emergency_contacts: true,
    map_visualization: true,
    photo_viewing: true,
    messaging: true,
    notifications: 'email',
    
    // Data Access
    community_data: true,
    pricing_info: true,
    availability: true,
    photos: true,
    reviews: true,
    
    // What Families DON'T Get
    api_access: false,
    bulk_exports: false,
    white_label: false,
    professional_dashboard: false,
    market_analysis: false,
    crm_integration: false,
    rms_integration: false,
    custom_branding: false,
    team_members: 1
  }
};

// ==========================================
// PROFESSIONAL TIERS (Advisors, Consultants, Social Workers)
// ==========================================
export const PROFESSIONAL_TIERS: KrakenTier[] = [
  {
    id: 'professional_starter',
    name: 'Professional Starter',
    category: 'professional',
    price: 99,
    annual_discount: 10,
    features: {
      // Core Platform
      unified_ai_search: true,
      multi_ai_insights: true,
      professional_dashboard: true,
      
      // Client Management
      client_management: 10,
      client_reports: true,
      branded_reports: false,
      bulk_exports: 10, // per month
      
      // Analytics
      market_analysis: true,
      territory_reports: true,
      competitor_analysis: false,
      predictive_analytics: false,
      
      // Support
      priority_support: false,
      training_included: '2 hours',
      team_members: 1,
      
      // Integration
      calendar_sync: true,
      email_integration: false,
      crm_integration: false
    }
  },
  {
    id: 'professional_growth',
    name: 'Professional Growth',
    category: 'professional',
    price: 299,
    annual_discount: 15,
    features: {
      // Everything from Starter plus:
      client_management: 50,
      branded_reports: true,
      white_label: true,
      bulk_exports: 100,
      
      // Advanced Analytics
      competitor_analysis: true,
      predictive_analytics: true,
      care_progression_modeling: true,
      
      // Virtual Tours
      matterport_viewer: true, // View all 3D tours
      tour_embedding: false,
      
      // Team Features
      team_members: 5,
      team_collaboration: true,
      shared_workspace: true,
      
      // Integration
      email_integration: true,
      basic_crm_sync: true,
      zapier_integration: true,
      
      // Support
      priority_support: true,
      training_included: '10 hours',
      quarterly_reviews: true
    }
  },
  {
    id: 'professional_scale',
    name: 'Professional Scale',
    category: 'professional',
    price: 699,
    annual_discount: 20,
    features: {
      // Everything from Growth plus:
      client_management: -1, // Unlimited
      bulk_exports: -1, // Unlimited
      
      // Premium Features
      tour_embedding: true, // Embed 3D tours in reports
      custom_integrations: true,
      api_access: true,
      api_calls: 10000,
      
      // AI Features
      ai_lead_scoring: true,
      ai_recommendations: true,
      sentiment_analysis: true,
      
      // Team & Support
      team_members: 20,
      dedicated_account_manager: true,
      monthly_strategy_calls: true,
      custom_training: true,
      sla_guarantee: true,
      
      // Full CRM Integration
      full_crm_integration: ['salesforce', 'hubspot', 'custom'],
      workflow_automation: true,
      custom_reporting: true
    }
  }
];

// ==========================================
// COMMUNITY TIERS (Senior Living Communities)
// ==========================================
export const COMMUNITY_TIERS: KrakenTier[] = [
  {
    id: 'community_essential',
    name: 'Community Essential',
    category: 'community',
    price: 99,
    annual_discount: 10,
    features: {
      // Listing Features
      enhanced_listing: true,
      photo_gallery: 10, // max photos
      pricing_display: true,
      availability_updates: true,
      
      // Analytics
      view_analytics: true,
      family_engagement: true,
      search_ranking: 'standard',
      
      // Tools
      tour_scheduler: false,
      messaging_center: false,
      
      // Integration
      basic_api: false,
      rms_integration: false,
      crm_integration: false
    }
  },
  {
    id: 'community_premium',
    name: 'Community Premium',
    category: 'community',
    price: 299,
    annual_discount: 15,
    features: {
      // Everything from Essential plus:
      photo_gallery: -1, // Unlimited
      video_tours: true,
      search_ranking: 'featured',
      
      // Matterport Integration
      matterport_tours: 1, // One 3D tour included
      additional_tours: '$99/tour',
      
      // Advanced Tools
      tour_scheduler: true,
      messaging_center: true,
      lead_management: true,
      
      // Analytics
      advanced_analytics: true,
      competitor_insights: true,
      market_positioning: true,
      
      // Basic Integration
      basic_api: true,
      api_calls: 1000,
      crm_integration: ['aline', 'yardi'],
      
      // Support
      priority_support: true,
      monthly_optimization: true
    }
  },
  {
    id: 'community_enterprise',
    name: 'Community Enterprise',
    category: 'community',
    price: 599,
    annual_discount: 20,
    features: {
      // Everything from Premium plus:
      search_ranking: 'platinum', // Top placement
      matterport_tours: 5, // Five 3D tours included
      
      // Full Integration Suite
      full_api_access: true,
      api_calls: 10000,
      rms_integration: ['all'], // All 6 RMS providers
      crm_integration: ['all'], // All CRM providers
      
      // Revenue Optimization
      dynamic_pricing: true,
      occupancy_forecasting: true,
      revenue_analytics: true,
      market_intelligence: true,
      
      // AI Features
      ai_lead_scoring: true,
      predictive_analytics: true,
      care_matching: true,
      
      // Multi-Property
      portfolio_management: true,
      cross_property_analytics: true,
      centralized_dashboard: true,
      
      // Premium Support
      dedicated_success_manager: true,
      quarterly_business_reviews: true,
      custom_reporting: true,
      sla_guarantee: true
    }
  }
];

// ==========================================
// ENTERPRISE TIERS (Healthcare Systems, Insurance)
// ==========================================
export const ENTERPRISE_TIERS: KrakenTier[] = [
  {
    id: 'enterprise_health_system',
    name: 'Healthcare System',
    category: 'enterprise',
    price: 2499,
    annual_discount: 20,
    setup_fee: 5000,
    features: {
      // Full Platform Access
      unlimited_users: true,
      unlimited_searches: true,
      unlimited_exports: true,
      
      // Hospital Integration
      hospital_data_service: true,
      ehr_integration: true,
      discharge_planning: true,
      
      // CRM/RMS Suite
      full_crm_access: ['aline', 'yardi', 'vitals'],
      full_rms_access: ['all'],
      
      // AI Capabilities
      care_progression_ai: true,
      readmission_prevention: true,
      placement_optimization: true,
      
      // Compliance
      hipaa_compliant: true,
      audit_trails: true,
      compliance_reporting: true,
      
      // Analytics
      population_health: true,
      outcome_tracking: true,
      cost_analysis: true,
      
      // API & Integration
      unlimited_api: true,
      custom_integration: true,
      real_time_sync: true,
      
      // Support
      dedicated_team: true,
      24_7_support: true,
      custom_training: true,
      implementation_support: true
    }
  },
  {
    id: 'enterprise_insurance',
    name: 'Insurance Network',
    category: 'enterprise',
    price: 4999,
    annual_discount: 25,
    setup_fee: 10000,
    features: {
      // Everything from Health System plus:
      
      // Insurance Specific
      claims_integration: true,
      prior_auth_workflow: true,
      network_management: true,
      provider_verification: true,
      
      // Risk Management
      risk_assessment_ai: true,
      actuarial_modeling: true,
      fraud_detection: true,
      predictive_claims: true,
      
      // Compliance
      regulatory_compliance: true,
      state_reporting: true,
      medicare_advantage: true,
      
      // Advanced Analytics
      member_attribution: true,
      quality_metrics: true,
      star_ratings_optimization: true,
      
      // Infrastructure
      dedicated_environment: true,
      custom_security: true,
      disaster_recovery: true,
      
      // Premium Support
      dedicated_infrastructure: true,
      white_glove_service: true,
      executive_briefings: true
    }
  },
  {
    id: 'enterprise_government',
    name: 'Government Agency',
    category: 'enterprise',
    price: 9999,
    annual_discount: 30,
    setup_fee: 25000,
    features: {
      // Full Platform Customization
      custom_deployment: true,
      on_premise_option: true,
      
      // Government Compliance
      fedramp_compliant: true,
      section_508: true,
      state_local_compliance: true,
      
      // Data Sovereignty
      data_residency: true,
      encryption_at_rest: true,
      custom_security_controls: true,
      
      // Population Management
      territory_management: true,
      demographic_analysis: true,
      resource_allocation: true,
      
      // Reporting
      legislative_reporting: true,
      public_dashboards: true,
      transparency_tools: true,
      
      // Integration
      government_systems: true,
      legacy_integration: true,
      custom_apis: true,
      
      // Support
      clearance_support: true,
      dedicated_team: true,
      on_site_training: true
    }
  }
];

// ==========================================
// VENDOR TIERS (Service Providers, Suppliers)
// ==========================================
export const VENDOR_TIERS: KrakenTier[] = [
  {
    id: 'vendor_local',
    name: 'Local Vendor',
    category: 'vendor',
    price: 99,
    annual_discount: 10,
    features: {
      territory_coverage: '1 city',
      community_directory: true,
      lead_notifications: true,
      monthly_leads: 20,
      
      // Visibility
      vendor_profile: true,
      service_listings: 3,
      
      // Analytics
      basic_analytics: true,
      lead_tracking: true
    }
  },
  {
    id: 'vendor_regional',
    name: 'Regional Vendor',
    category: 'vendor',
    price: 299,
    annual_discount: 15,
    features: {
      territory_coverage: 'multi-state',
      monthly_leads: 100,
      
      // Enhanced Features
      service_listings: -1, // Unlimited
      priority_placement: true,
      lead_routing: true,
      
      // Integration
      crm_export: true,
      api_access: true,
      api_calls: 1000,
      
      // Analytics
      advanced_analytics: true,
      roi_tracking: true,
      competitor_analysis: true
    }
  },
  {
    id: 'vendor_national',
    name: 'National Vendor',
    category: 'vendor',
    price: 999,
    annual_discount: 20,
    features: {
      territory_coverage: 'nationwide',
      monthly_leads: -1, // Unlimited
      
      // Premium Features
      featured_vendor: true,
      sponsored_content: true,
      webinar_hosting: true,
      
      // Advanced Lead Management
      lead_scoring_ai: true,
      automated_routing: true,
      team_distribution: true,
      
      // Full Integration
      full_api_access: true,
      api_calls: 50000,
      custom_integration: true,
      
      // Partnership Benefits
      co_marketing: true,
      thought_leadership: true,
      event_sponsorship: true,
      
      // Support
      dedicated_manager: true,
      quarterly_reviews: true
    }
  }
];

// ==========================================
// API MARKETPLACE TIERS
// ==========================================
export const API_TIERS: KrakenTier[] = [
  {
    id: 'api_developer',
    name: 'Developer API',
    category: 'api',
    price: 99,
    features: {
      api_calls: 10000,
      rate_limit: '100/minute',
      endpoints: ['basic'],
      data_access: 'standard',
      support: 'community'
    },
    overage_rate: 0.02 // $0.02 per additional call
  },
  {
    id: 'api_business',
    name: 'Business API',
    category: 'api',
    price: 499,
    features: {
      api_calls: 100000,
      rate_limit: '1000/minute',
      endpoints: ['all'],
      data_access: 'enhanced',
      webhooks: true,
      bulk_export: true,
      support: 'priority'
    },
    overage_rate: 0.01 // $0.01 per additional call
  },
  {
    id: 'api_enterprise',
    name: 'Enterprise API',
    category: 'api',
    price: 2499,
    features: {
      api_calls: 1000000,
      rate_limit: 'unlimited',
      endpoints: ['all'],
      data_access: 'premium',
      real_time_sync: true,
      custom_endpoints: true,
      dedicated_infrastructure: true,
      sla_guarantee: true,
      support: 'dedicated'
    },
    overage_rate: 0.005 // $0.005 per additional call
  }
];

// ==========================================
// SPECIAL NEURAL API ACCESS (The Kraken Brain)
// ==========================================
export const NEURAL_API_TIERS: KrakenTier[] = [
  {
    id: 'neural_basic',
    name: 'Neural API Basic',
    category: 'api',
    price: 999,
    features: {
      ai_endpoints: ['search', 'insights'],
      multi_ai_access: false,
      neural_calls: 1000,
      response_time: 'standard',
      accuracy_level: 'standard'
    },
    overage_rate: 0.10 // $0.10 per neural call
  },
  {
    id: 'neural_advanced',
    name: 'Neural API Advanced',
    category: 'api',
    price: 4999,
    features: {
      ai_endpoints: ['all'],
      multi_ai_access: true, // Access to Claude, ChatGPT, Perplexity
      neural_calls: 10000,
      response_time: 'priority',
      accuracy_level: 'enhanced',
      predictive_models: true,
      custom_training: true
    },
    overage_rate: 0.05 // $0.05 per neural call
  },
  {
    id: 'neural_unlimited',
    name: 'Neural API Unlimited',
    category: 'api',
    price: 19999,
    features: {
      ai_endpoints: ['all'],
      multi_ai_access: true,
      neural_calls: -1, // Unlimited
      response_time: 'real-time',
      accuracy_level: 'maximum',
      predictive_models: true,
      custom_training: true,
      white_label_ai: true,
      dedicated_gpu: true,
      custom_models: true
    }
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function calculateMonthlyRevenue(
  activeTiers: Map<string, number> // tier_id -> count
): number {
  let totalRevenue = 0;
  
  const allTiers = [
    FAMILY_TIER,
    ...PROFESSIONAL_TIERS,
    ...COMMUNITY_TIERS,
    ...ENTERPRISE_TIERS,
    ...VENDOR_TIERS,
    ...API_TIERS,
    ...NEURAL_API_TIERS
  ];
  
  activeTiers.forEach((count, tierId) => {
    const tier = allTiers.find(t => t.id === tierId);
    if (tier) {
      totalRevenue += tier.price * count;
    }
  });
  
  return totalRevenue;
}

export function projectAnnualRevenue(
  monthlyRevenue: number,
  growthRate: number = 0.15 // 15% monthly growth default
): number {
  let annualRevenue = 0;
  let currentMonthly = monthlyRevenue;
  
  for (let month = 0; month < 12; month++) {
    annualRevenue += currentMonthly;
    currentMonthly *= (1 + growthRate);
  }
  
  return annualRevenue;
}

// Target: $210k/month = $2.52M/year base
// With 15% monthly growth = $5.3M annual run rate
export function getRevenueTargets() {
  return {
    monthly_target: 210000,
    annual_target: 2520000,
    projected_with_growth: 5300000,
    
    // Example customer mix to hit $210k/month:
    suggested_mix: {
      professional_growth: 200, // 200 * $299 = $59,800
      professional_scale: 50, // 50 * $699 = $34,950
      community_premium: 150, // 150 * $299 = $44,850
      community_enterprise: 25, // 25 * $599 = $14,975
      enterprise_health: 10, // 10 * $2,499 = $24,990
      vendor_regional: 50, // 50 * $299 = $14,950
      api_business: 30, // 30 * $499 = $14,970
      // Total: $209,485/month
    }
  };
}

// Check if user has access to a feature
export function hasFeatureAccess(
  tier: KrakenTier,
  feature: string
): boolean {
  if (tier.features[feature] === undefined) return false;
  if (tier.features[feature] === false) return false;
  if (tier.features[feature] === 0) return false;
  return true;
}

// Get tier by ID
export function getTierById(tierId: string): KrakenTier | null {
  const allTiers = [
    FAMILY_TIER,
    ...PROFESSIONAL_TIERS,
    ...COMMUNITY_TIERS,
    ...ENTERPRISE_TIERS,
    ...VENDOR_TIERS,
    ...API_TIERS,
    ...NEURAL_API_TIERS
  ];
  
  return allTiers.find(t => t.id === tierId) || null;
}

export default {
  FAMILY_TIER,
  PROFESSIONAL_TIERS,
  COMMUNITY_TIERS,
  ENTERPRISE_TIERS,
  VENDOR_TIERS,
  API_TIERS,
  NEURAL_API_TIERS,
  calculateMonthlyRevenue,
  projectAnnualRevenue,
  getRevenueTargets,
  hasFeatureAccess,
  getTierById
};