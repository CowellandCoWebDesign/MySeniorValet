import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, jsonb, date, varchar, real, numeric, index, customType, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PostGIS geography point type for efficient spatial queries
const geographyPoint = customType<{ data: { lat: number; lng: number } }>({
  dataType() {
    return 'geography(Point,4326)';
  },
});

// Session storage table for Replit Auth (MANDATORY)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Changed to varchar for Replit Auth
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Legacy fields for existing functionality
  username: text("username").unique(),
  password: text("password"),
  phone: text("phone"),
  // relationshipToCare: text("relationship_to_care", {
  //   enum: ["Seeking for Self", "Seeking for Parent", "Seeking for Spouse", "Seeking for Other Family", "Healthcare Professional"]
  // }), // Field doesn't exist in database
  // careNeeds: text("care_needs").array().default([]), // ['Independent Living', 'Assisted Living', 'Memory Care'] - Field doesn't exist in database
  // searchPreferences: json("search_preferences").$type<{
  //   preferredLocation?: string;
  //   budgetRange?: { min: number; max: number };
  //   preferredAmenities?: string[];
  //   mustHaveFeatures?: string[];
  //   dealBreakers?: string[];
  // }>().default({}), // Field doesn't exist in database
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // notifications: json("notifications").$type<{
  //   emailNotifications: boolean;
  //   smsNotifications: boolean;
  //   newListings: boolean;
  //   priceAlerts: boolean;
  //   messageAlerts: boolean;
  //   reviewReminders: boolean;
  // }>().default({
  //   emailNotifications: true,
  //   smsNotifications: false,
  //   newListings: false,
  //   priceAlerts: false,
  //   messageAlerts: true,
  //   reviewReminders: false,
  // }), // Field doesn't exist in database
  // dashboardPreferences: json("dashboard_preferences").$type<{
  //   layoutType: 'simple' | 'detailed' | 'visual';
  //   fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  //   highContrast: boolean;
  //   reducedMotion: boolean;
  //   cardSize: 'compact' | 'comfortable' | 'spacious';
  //   showHelpTips: boolean;
  //   quickActions: string[];
  //   dashboardSections: {
  //     favorites: { visible: boolean; order: number };
  //     recentSearches: { visible: boolean; order: number };
  //     recommendations: { visible: boolean; order: number };
  //     savedCommunities: { visible: boolean; order: number };
  //     tourSchedule: { visible: boolean; order: number };
  //     familyNotes: { visible: boolean; order: number };
  //   };
  // }>().default({
  //   layoutType: 'detailed',
  //   fontSize: 'medium',
  //   highContrast: false,
  //   reducedMotion: false,
  //   cardSize: 'comfortable',
  //   showHelpTips: true,
  //   quickActions: ['search', 'favorites', 'schedule-tour', 'family-share'],
  //   dashboardSections: {
  //     favorites: { visible: true, order: 1 },
  //     recentSearches: { visible: true, order: 2 },
  //     recommendations: { visible: true, order: 3 },
  //     savedCommunities: { visible: true, order: 4 },
  //     tourSchedule: { visible: true, order: 5 },
  //     familyNotes: { visible: true, order: 6 }
  //   }
  // }), // Field doesn't exist in database
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  role: text("role", { enum: ["user", "admin", "community_owner", "vendor", "financial_admin", "support_agent", "analytics_viewer", "super_admin"] }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type definitions for Replit Auth (removing duplicate User type)
export type UpsertUser = typeof users.$inferInsert;

// User sessions table for secure session management
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
}, (table) => [
  index("user_sessions_user_id_idx").on(table.userId),
  index("user_sessions_expires_at_idx").on(table.expiresAt),
]);

// Security audit logs for monitoring and compliance
export const securityAuditLogs = pgTable("security_audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, failed_login, password_change, etc.
  resource: text("resource").notNull(), // endpoint or resource accessed
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  details: jsonb("details").$type<{
    sessionId?: string;
    errorMessage?: string;
    requestId?: string;
    riskScore?: number;
    metadata?: Record<string, any>;
  }>(),
  riskLevel: text("risk_level", { enum: ["low", "medium", "high", "critical"] }).default("low"),
  success: boolean("success").default(true),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("security_audit_logs_user_id_idx").on(table.userId),
  index("security_audit_logs_timestamp_idx").on(table.timestamp),
  index("security_audit_logs_risk_level_idx").on(table.riskLevel),
  index("security_audit_logs_action_idx").on(table.action),
]);

// Community Dashboard Analytics Tables
export const communityDashboardStats = pgTable("community_dashboard_stats", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  date: date("date").notNull(),
  // Profile & Listing Analytics
  profileViews: integer("profile_views").default(0),
  searchImpressions: integer("search_impressions").default(0),
  searchClicks: integer("search_clicks").default(0),
  familyInquiries: integer("family_inquiries").default(0),
  tourRequests: integer("tour_requests").default(0),
  phoneCallClicks: integer("phone_call_clicks").default(0),
  // Photo & Review Analytics
  photoViews: integer("photo_views").default(0),
  reviewClicks: integer("review_clicks").default(0),
  shareActions: integer("share_actions").default(0),
  favoriteActions: integer("favorite_actions").default(0),
  // Lead Quality Metrics
  qualifiedLeads: integer("qualified_leads").default(0),
  tourConversions: integer("tour_conversions").default(0),
  moveInConversions: integer("move_in_conversions").default(0),
  // Engagement Metrics
  avgTimeOnPage: integer("avg_time_on_page").default(0), // seconds
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 2 }),
  returnVisitors: integer("return_visitors").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityMessages = pgTable("community_messages", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  senderName: varchar("sender_name").notNull(),
  senderEmail: varchar("sender_email").notNull(),
  senderPhone: varchar("sender_phone"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type").notNull(), // 'inquiry', 'tour_request', 'pricing_question', 'availability_check'
  priority: varchar("priority").default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status").default('unread'), // 'unread', 'read', 'responded', 'archived'
  tags: json("tags").$type<string[]>().default([]),
  familySize: integer("family_size"),
  careLevel: varchar("care_level"),
  moveInTimeline: varchar("move_in_timeline"),
  budget: json("budget").$type<{ min: number; max: number }>(),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  responseTime: integer("response_time"), // minutes to first response
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityUpdates = pgTable("community_updates", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  updatedBy: integer("updated_by").references(() => users.id).notNull(),
  updateType: varchar("update_type").notNull(), // 'pricing', 'availability', 'photos', 'amenities', 'contact'
  fieldChanged: varchar("field_changed"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changeDescription: text("change_description"),
  autoGenerated: boolean("auto_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityReports = pgTable("community_reports", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  reportType: varchar("report_type").notNull(), // 'performance', 'analytics', 'leads', 'financial'
  reportDate: date("report_date").notNull(),
  reportData: json("report_data").notNull(),
  generatedBy: integer("generated_by").references(() => users.id),
  scheduledReport: boolean("scheduled_report").default(false),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr"), // French name for bilingual communities
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  description: text("description"),
  descriptionFr: text("description_fr"), // French description
  bilingual: boolean("bilingual").default(false), // Indicates if facility offers bilingual services
  primaryLanguage: text("primary_language").default("English"), // Primary service language
  careTypes: text("care_types").array().notNull(), // ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing']
  amenities: text("amenities").array().default([]),
  services: text("services").array().default([]), // ['24/7 Nursing', 'Physical Therapy', 'Transportation', 'Meal Service']
  careServices: text("care_services").array().default([]), // ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing']
  medicalRestrictions: text("medical_restrictions").array().default([]), // ['No Insulin Patients', 'No Dialysis', 'No Ventilators']
  photos: text("photos").array().default([]), // Array of photo URLs
  photoAttributions: text("photo_attributions").array().default([]), // Google Photos API attributions
  virtualTourUrl: text("virtual_tour_url"),
  
  // Detailed Services & Amenities
  spaServices: text("spa_services").array().default([]), // ['Massage Therapy', 'Aromatherapy', 'Facials', 'Manicure/Pedicure']
  healthcareServices: text("healthcare_services").array().default([]), // ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Hospice Care Available']
  fitnessServices: text("fitness_services").array().default([]), // ['Personal Training', 'Water Aerobics', 'Yoga Classes', 'Strength Training']
  diningServices: text("dining_services").array().default([]), // ['Chef-Prepared Meals', 'Special Diets', '24/7 Room Service', 'Private Dining']
  transportationServices: text("transportation_services").array().default([]), // ['Medical Appointments', 'Shopping Trips', 'Airport Shuttle', 'Local Errands']
  socialServices: text("social_services").array().default([]), // ['Activity Director', 'Support Groups', 'Family Counseling', 'Spiritual Care']
  
  // New fields for expanded senior living types
  communitySubtype: text("community_subtype", { 
    enum: [
      "hud_senior_housing",
      "senior_mobile_park",
      "active_adult_55plus",
      "independent_living",
      "assisted_living",
      "memory_care",
      "skilled_nursing",
      "board_and_care",
      "va_housing",
      "unlicensed_senior_housing",
      "traditional_assisted_living",
      "mobile_home_park",
      "manufactured_home_community",
      "rv_retirement_park",
      "senior_coop",
      "norc",
      "ccah_program",
      "independent_living_facility"
    ]
  }),
  ageRestriction: integer("age_restriction"), // Minimum age requirement (55, 62, etc.)
  
  // Mobile Home / Manufactured Home specific fields
  lotRent: decimal("lot_rent", { precision: 10, scale: 2 }),
  hoaFee: decimal("hoa_fee", { precision: 10, scale: 2 }),
  hasHomesForSale: boolean("has_homes_for_sale").default(false),
  hasRentals: boolean("has_rentals").default(true),
  allowsDoubleWides: boolean("allows_double_wides").default(true),
  allowsSingleWides: boolean("allows_single_wides").default(true),
  
  // Active Adult Community fields
  gatedCommunity: boolean("gated_community").default(false),
  golfCourse: boolean("golf_course").default(false),
  resortStyle: boolean("resort_style").default(false),
  masterPlanned: boolean("master_planned").default(false),
  
  // RV Park specific fields
  allowsRvs: boolean("allows_rvs").default(false),
  rvSitesAvailable: integer("rv_sites_available"),
  rvHookups: text("rv_hookups").array().default([]), // ['Electric', 'Water', 'Sewer', 'Cable', 'WiFi']
  parkModelHomes: boolean("park_model_homes").default(false),
  
  // General community features
  petFriendly: boolean("pet_friendly").default(true),
  petRestrictions: text("pet_restrictions").array().default([]),
  activeLifestyle: boolean("active_lifestyle").default(false),
  
  // Multiple Review Sources
  yelpReviews: json("yelp_reviews").$type<Array<{
    rating: number;
    text: string;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  careComReviews: json("care_com_reviews").$type<Array<{
    rating: number;
    text: string;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  seniorAdvisorReviews: json("senior_advisor_reviews").$type<Array<{
    rating: number;
    text: string;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  aplaceformomReviews: json("aplaceformom_reviews").$type<Array<{
    rating: number;
    text: string;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  priceRange: json("price_range").$type<{ min: number; max: number }>(),
  pricingDetails: json("pricing_details").$type<{
    basePrice?: number;
    specialOffers?: Array<{
      title: string;
      description: string;
      savings: number;
      expiresAt?: Date;
    }>;
    priceBreakdown?: {
      rent: number;
      careServices?: number;
      meals?: number;
      utilities?: number;
    };
    moveinSpecials?: string[];
    moveInCosts?: {
      securityDeposit?: number;
      communityFee?: number;
      applicationFee?: number;
      petFee?: number;
      parkingFee?: number;
      administrativeFee?: number;
      totalEstimatedMoveIn?: number;
    };
    monthlyFees?: {
      baseRent: number;
      careLevel?: number;
      meals?: number;
      housekeeping?: number;
      laundry?: number;
      utilities?: number;
      activities?: number;
      transportation?: number;
      personalCare?: number;
      medication?: number;
    };
    feeWaivers?: Array<{
      feeType: string;
      discountType: 'percentage' | 'fixed' | 'waived';
      discountValue?: number;
      description: string;
      conditions?: string;
    }>;
    specialPromotions?: Array<{
      title: string;
      description: string;
      monthsWaived?: number;
      percentageOff?: number;
      conditions?: string;
      validUntil?: string;
    }>;
  }>().default({}),
  // Claim system fields
  isClaimed: boolean("is_claimed").default(false),
  claimedBy: integer("claimed_by_user_id").references(() => users.id),
  claimToken: text("claim_token"),
  claimVerified: boolean("claim_verified").default(false),
  claimDate: timestamp("claim_date"),
  
  // Live pricing system (claimed communities only)
  livePricing: json("live_pricing").$type<{
    independentLiving?: { min: number; max: number };
    assistedLiving?: { min: number; max: number };
    memoryCare?: { min: number; max: number };
    skilledNursing?: { min: number; max: number };
    updatedAt?: string;
    updatedBy?: string;
  }>(),
  pricingType: text("pricing_type", { enum: ["estimated", "live"] }).default("estimated"),
  pricingLastUpdated: timestamp("pricing_last_updated").defaultNow(),
  
  // Availability tracking (claimed communities only)
  availabilityStatus: text("availability_status", { 
    enum: ["Available", "Waitlist", "Full", "Unknown"] 
  }).default("Unknown"),
  availabilityLastUpdated: timestamp("availability_last_updated"),
  availableUnits: integer("available_units"),
  totalUnits: integer("total_units"),
  unitTypes: json("unit_types").$type<Array<{
    id: string;
    type: string; // 'Studio', '1BR', '2BR'
    name: string; // 'Deluxe Studio', 'Garden View 1BR'
    available: number;
    priceRange: { min: number; max: number };
    photos: string[];
    floorPlan?: string;
    squareFootage: number;
    features: string[];
    amenities: string[];
    availability: Array<{
      unitNumber: string;
      availableDate: string;
      moveInReady: boolean;
      price: number;
      specialOffers?: string[];
    }>;
  }>>().default([]),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  googleRating: decimal("google_rating", { precision: 3, scale: 2 }),
  googleReviewCount: integer("google_review_count").default(0),
  googlePlaceId: text("google_place_id"), // Google Places API place ID
  googleReviewSnippets: json("google_review_snippets").$type<Array<{
    text: string;
    rating: number;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  googlePlaceReviews: json("google_place_reviews").$type<Array<{
    text: string;
    rating: number;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  reviews: json("reviews").$type<Array<{
    text: string;
    rating: number;
    author: string;
    date: string;
    isPositive: boolean;
  }>>().default([]),
  trustedReviews: json("trusted_reviews").$type<Array<{
    source: string;
    rating: number;
    reviewCount: number;
    url?: string;
    snippets?: Array<{
      text: string;
      rating: number;
      author: string;
    }>;
  }>>().default([]),
  imageUrl: text("image_url"),
  imageGallery: text("image_gallery").array().default([]),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  location: geographyPoint('location'), // PostGIS geography point for efficient spatial queries
  licenseNumber: text("license_number"),
  licenseStatus: text("license_status"), // 'Licensed', 'Under Review', 'Expired'
  lastInspection: timestamp("last_inspection"),
  violations: integer("violations").default(0),
  isVerified: boolean("is_verified").default(false),
  lastPriceUpdate: timestamp("last_price_update"),
  lastAvailabilityUpdate: timestamp("last_availability_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Yelp integration fields
  yelpId: varchar("yelp_id"),
  yelpRating: real("yelp_rating"),
  yelpReviewCount: integer("yelp_review_count"),
  yelpPhotos: json("yelp_photos").$type<string[]>().default([]),
  yelpUrl: varchar("yelp_url"),
  yelpCategories: json("yelp_categories").$type<string[]>().default([]),
  
  // Regional expansion fields
  region: text("region"), // 'Bay Area', 'Central Valley', 'Sacramento Region', 'North Coast'
  county: text("county"), // 'Alameda', 'Contra Costa', 'Santa Clara', 'San Mateo', 'Marin', 'Sacramento', 'Sonoma'
  discoverySource: text("discovery_source"), // 'Google Places', 'Yelp', 'State Licensing', 'Directory Scraping'
  discoveryDate: timestamp("discovery_date").defaultNow(),
  lastEnrichmentDate: timestamp("last_enrichment_date"),
  
  // Enrichment completion tracking
  enrichmentCompleted: boolean("enrichment_completed").default(false), // Tracks if community has been fully enriched
  
  // Performance optimization fields
  trendingScore: decimal("trending_score", { precision: 10, scale: 2 }).default("0"), // Pre-calculated trending score for fast sorting
  
  // Subscription and billing fields for communities
  subscriptionTier: text("subscription_tier", {
    enum: ["free", "standard", "featured", "platinum"]
  }).default("free"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  billingStatus: text("billing_status", {
    enum: ["active", "past_due", "canceled", "trialing", "incomplete"]
  }).default("active"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  features: json("features").$type<string[]>().default([]),
  activeAddOns: json("active_add_ons").$type<Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    status: string;
    addedAt: string;
  }>>().default([]),
  
  // Veterans Housing / HUD-VASH fields
  facilityType: text("facility_type", { 
    enum: ["Senior Living", "HUD-VASH", "Affordable Senior", "VA CLC", "Veterans Housing"] 
  }).default("Senior Living"),
  veteranPrograms: text("veteran_programs").array().default([]), // ['HUD-VASH', 'SSVF', 'GPD', 'VA CLC']
  eligibilityRequirements: text("eligibility_requirements").array().default([]), // ['Veteran Status', 'Income Qualified', 'Chronically Homeless']
  hudProperties: json("hud_properties").$type<{
    phaName?: string; // Public Housing Authority name
    phaPhone?: string;
    phaEmail?: string;
    phaWebsite?: string;
    voucherAllocation?: number;
    utilizationRate?: number;
    waitlistStatus?: string;
    applicationUrl?: string;
    vaOfficeDistance?: number; // Distance to nearest VA medical center in miles
    vaOfficeName?: string;
    lastDataUpdate?: string;
  }>().default({}),
  acceptsHudVouchers: boolean("accepts_hud_vouchers").default(false),
  isVeteranFriendly: boolean("is_veteran_friendly").default(false),
  
  // HUD API Comprehensive Data Fields - Rich property information from official HUD APIs
  hudPropertyId: text("hud_property_id"), // Official HUD Property ID
  totalUnitsHud: integer("total_units_hud"), // TOTAL_UNIT_COUNT from HUD
  totalAssistedUnits: integer("total_assisted_units"), // TOTAL_ASSISTED_UNIT_COUNT
  maximumContractUnits: integer("maximum_contract_units"), // MAXIMUM_CONTRACT_UNIT_COUNT
  availableUnitsHud: integer("available_units_hud"), // TOTAL_AVBL_UNITS
  marketRateUnits: integer("market_rate_units"), // UNIT_MRKT_RENT_CNT
  occupancyRateHud: decimal("occupancy_rate_hud", { precision: 5, scale: 2 }), // PCT_OCCUPIED
  reportedOccupancy: decimal("reported_occupancy", { precision: 5, scale: 2 }), // PCT_REPORTED
  moveInRate: decimal("move_in_rate", { precision: 5, scale: 2 }), // PCT_MOVEIN
  peoplePerUnit: decimal("people_per_unit", { precision: 5, scale: 2 }), // PEOPLE_PER_UNIT
  totalPeople: integer("total_people"), // PEOPLE_TOTAL
  
  // HUD Rent and Financial Data - Critical for filtering and comparison
  rentPerMonth: decimal("rent_per_month", { precision: 10, scale: 2 }), // RENT_PER_MONTH
  spendingPerMonth: decimal("spending_per_month", { precision: 10, scale: 2 }), // SPENDING_PER_MONTH
  householdIncome: decimal("household_income", { precision: 10, scale: 2 }), // HH_INCOME
  personIncome: decimal("person_income", { precision: 10, scale: 2 }), // PERSON_INCOME
  isRentSupplement: boolean("is_rent_supplement"), // IS_RENT_SUPPLEMENT_IND
  rentToFmrRatio: decimal("rent_to_fmr_ratio", { precision: 5, scale: 2 }), // RENT_TO_FMR_RATIO1
  
  // HUD Income Demographics - Valuable for targeting and filtering
  incomeLessThan5k: decimal("income_lt_5k_pct", { precision: 5, scale: 2 }), // PCT_LT5K
  income5kTo10k: decimal("income_5k_10k_pct", { precision: 5, scale: 2 }), // PCT_5K_LT10K
  income10kTo15k: decimal("income_10k_15k_pct", { precision: 5, scale: 2 }), // PCT_10K_LT15K
  income15kTo20k: decimal("income_15k_20k_pct", { precision: 5, scale: 2 }), // PCT_15K_LT20K
  incomeOver20k: decimal("income_over_20k_pct", { precision: 5, scale: 2 }), // PCT_GE20K
  wageMajorSource: decimal("wage_major_pct", { precision: 5, scale: 2 }), // PCT_WAGE_MAJOR
  welfareMajorSource: decimal("welfare_major_pct", { precision: 5, scale: 2 }), // PCT_WELFARE_MAJOR
  otherMajorSource: decimal("other_major_pct", { precision: 5, scale: 2 }), // PCT_OTHER_MAJOR
  
  // HUD Age Demographics - Essential for senior living targeting
  age62Plus: decimal("age_62_plus_pct", { precision: 5, scale: 2 }), // PCT_AGE62PLUS
  age85Plus: decimal("age_85_plus_pct", { precision: 5, scale: 2 }), // PCT_AGE85PLUS
  ageUnder24Head: decimal("age_under_24_head_pct", { precision: 5, scale: 2 }), // PCT_LT24_HEAD
  age25To50: decimal("age_25_50_pct", { precision: 5, scale: 2 }), // PCT_AGE25_50
  age51To61: decimal("age_51_61_pct", { precision: 5, scale: 2 }), // PCT_AGE51_61
  elderlyPercent: decimal("elderly_percent", { precision: 5, scale: 2 }), // ELDLY_PRCNT
  
  // HUD Disability and Family Demographics - Important for care matching
  disabledUnder62: decimal("disabled_under_62_pct", { precision: 5, scale: 2 }), // PCT_DISABLED_LT62
  disabledOver62: decimal("disabled_over_62_pct", { precision: 5, scale: 2 }), // PCT_DISABLED_GE62
  disabledAll: decimal("disabled_all_pct", { precision: 5, scale: 2 }), // PCT_DISABLED_ALL
  twoAdults: decimal("two_adults_pct", { precision: 5, scale: 2 }), // PCT_2ADULTS
  oneAdult: decimal("one_adult_pct", { precision: 5, scale: 2 }), // PCT_1ADULT
  femaleHead: decimal("female_head_pct", { precision: 5, scale: 2 }), // PCT_FEMALE_HEAD
  femaleHeadWithChildren: decimal("female_head_child_pct", { precision: 5, scale: 2 }), // PCT_FEMALE_HEAD_CHILD
  
  // HUD Racial/Ethnic Demographics - For diversity and compliance reporting
  minorityPercent: decimal("minority_percent", { precision: 5, scale: 2 }), // PCT_MINORITY
  blackPercent: decimal("black_percent", { precision: 5, scale: 2 }), // PCT_BLACK
  nativeAmericanPercent: decimal("native_american_percent", { precision: 5, scale: 2 }), // PCT_NATIVE_AMERICAN
  asianPercent: decimal("asian_percent", { precision: 5, scale: 2 }), // PCT_ASIAN
  hispanicPercent: decimal("hispanic_percent", { precision: 5, scale: 2 }), // PCT_HISPANIC
  
  // HUD Management and Property Details - Contact and operational info
  managementCompany: text("management_company"), // MGMT_AGENT_ORG_NAME
  managementContact: text("management_contact"), // MGMT_CONTACT_FULL_NAME
  managementPhone: text("management_phone"), // MGMT_CONTACT_MAIN_PHN_NBR
  managementEmail: text("management_email"), // MGMT_CONTACT_EMAIL_TEXT
  hubName: text("hub_name"), // HUB_NAME_TEXT
  servicingSite: text("servicing_site"), // SERVICING_SITE_NAME_TEXT
  projectManager: text("project_manager"), // PROJECT_MANAGER_NAME_TEXT
  propertyCategory: text("property_category"), // PROPERTY_CATEGORY_NAME
  clientGroup: text("client_group"), // CLIENT_GROUP_NAME
  
  // HUD Dates and Timeline Data - Operational history
  occupancyDate: date("occupancy_date"), // OCCUPANCY_DATE
  lastReacInspection: date("last_reac_inspection"), // REAC_LAST_INSPECTION_DATE
  lastDataUpdate: date("last_data_update"), // LAST_UPDT_DTTM
  monthsWaiting: decimal("months_waiting", { precision: 5, scale: 2 }), // MONTHS_WAITING
  monthsFromMoveIn: decimal("months_from_move_in", { precision: 5, scale: 2 }), // MONTHS_FROM_MOVEIN
  
  // HUD Unit Mix and Housing Details - Unit composition for filtering
  studioUnits: decimal("studio_units_pct", { precision: 5, scale: 2 }), // PCT_BED1 (studio/1br)
  oneBedroomUnits: decimal("one_bedroom_pct", { precision: 5, scale: 2 }), // PCT_BED2
  twoBedroomUnits: decimal("two_bedroom_pct", { precision: 5, scale: 2 }), // PCT_BED3
  overHousedPercent: decimal("over_housed_pct", { precision: 5, scale: 2 }), // PCT_OVERHOUSED
  utilityAllowancePercent: decimal("utility_allowance_pct", { precision: 5, scale: 2 }), // PCT_UTILITY_ALLOW
  averageUtilityAllowance: decimal("avg_utility_allowance", { precision: 10, scale: 2 }), // AVE_UTIL_ALLOW
  
  // Extended Tier System fields (extending existing isClaimed)
  claimApprovalStatus: text("claim_approval_status", { 
    enum: ["Pending", "Approved", "Rejected", "Under Review"] 
  }).default("Pending"),
  
  // Community-managed content (available based on tier)
  communityDescription: text("community_description"), // Community-written description
  communityPhotos: text("community_photos").array().default([]), // Community-uploaded photos
  communityVideos: text("community_videos").array().default([]), // Community-uploaded videos
  virtualTours: text("virtual_tours").array().default([]), // Virtual tour embeds
  brandedBanner: text("branded_banner"), // Custom banner for Platinum tier
  customFeatureTags: text("custom_feature_tags").array().default([]), // Custom tags for Platinum
  
  // Community contact and settings
  communityManagerName: text("community_manager_name"),
  communityManagerEmail: text("community_manager_email"),
  communityManagerPhone: text("community_manager_phone"),
  allowDirectMessaging: boolean("allow_direct_messaging").default(false),
  autoRespondEnabled: boolean("auto_respond_enabled").default(false),
  autoRespondMessage: text("auto_respond_message"),
  
  // Performance tracking
  monthlyViews: integer("monthly_views").default(0),
  monthlyLeads: integer("monthly_leads").default(0),
  monthlyMessages: integer("monthly_messages").default(0),
  lastReportingPeriod: timestamp("last_reporting_period"),
}, (table) => [
  // Performance indexes for fast search
  index("communities_city_idx").on(table.city),
  index("communities_state_idx").on(table.state),
  index("communities_zip_code_idx").on(table.zipCode),
  index("communities_care_types_idx").on(table.careTypes),
  index("communities_location_composite_idx").on(table.city, table.state, table.zipCode),
  index("communities_coordinates_idx").on(table.latitude, table.longitude),
  index("communities_rating_idx").on(table.rating),
  index("communities_trending_score_idx").on(table.trendingScore),
  // PostGIS spatial index for efficient geo queries (created manually in SQL)
  // index("communities_location_gist_idx").on(table.location).using("gist"),
]);

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  inspectionDate: timestamp("inspection_date").notNull(),
  inspectionType: text("inspection_type").notNull(),
  violations: json("violations").$type<Array<{
    type: string;
    description: string;
    severity: 'Minor' | 'Major' | 'Critical';
    status: 'Active' | 'Resolved';
  }>>().default([]),
  overallScore: integer("overall_score"),
  reportUrl: text("report_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  reviewText: text("review_text").notNull(),
  pros: text("pros").array().default([]),
  cons: text("cons").array().default([]),
  relationshipType: text("relationship_type", { 
    enum: ["Current Resident", "Former Resident", "Family Member", "Visitor"] 
  }).notNull(),
  stayDuration: text("stay_duration"), // "6 months", "2 years", etc.
  careLevel: text("care_level"), // Which care type they experienced
  wouldRecommend: boolean("would_recommend"),
  verified: boolean("verified").default(false),
  helpful: integer("helpful").default(0), // helpful votes
  notHelpful: integer("not_helpful").default(0),
  moderationStatus: text("moderation_status", {
    enum: ["Pending", "Approved", "Rejected", "Flagged"]
  }).default("Pending"),
  moderationNotes: text("moderation_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewHelpfulness = pgTable("review_helpfulness", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isHelpful: boolean("is_helpful").notNull(), // true = helpful, false = not helpful
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  notes: text("notes"), // User's personal notes about this community
  tags: text("tags").array().default([]), // User's custom tags
  priority: text("priority", { enum: ["High", "Medium", "Low"] }).default("Medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Searches/History Table  
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  searchQuery: json("search_query").$type<SearchCommunity>().notNull(),
  resultCount: integer("result_count").notNull(),
  searchName: text("search_name"), // User can save and name searches
  isBookmarked: boolean("is_bookmarked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages Table - For communication between users and communities
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  conversationId: text("conversation_id").notNull(), // Groups messages in a conversation
  messageType: text("message_type", { 
    enum: ["inquiry", "tour_request", "pricing_question", "availability_check", "general", "follow_up"] 
  }).default("general"),
  subject: text("subject"),
  content: text("content").notNull(),
  attachments: json("attachments").$type<Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>>().default([]),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  isStarred: boolean("is_starred").default(false),
  isArchived: boolean("is_archived").default(false),
  priority: text("priority", { enum: ["Low", "Normal", "High", "Urgent"] }).default("Normal"),
  metadata: json("metadata").$type<{
    userAgent?: string;
    ipAddress?: string;
    source?: string; // 'web', 'mobile', 'email'
    tourDate?: string;
    preferredContactTime?: string;
    phoneNumber?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message Templates for Communities
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  templateName: text("template_name").notNull(),
  templateType: text("template_type", {
    enum: ["welcome", "tour_confirmation", "pricing_info", "availability_update", "follow_up", "custom"]
  }).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  useCount: integer("use_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tours/Visits Scheduling and Tracking - Minimal schema matching actual database
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  tourDate: timestamp("tour_date").notNull(),
  tourType: text("tour_type", { 
    enum: ["in_person", "virtual", "group", "private"] 
  }).default("in_person"),
  status: text("status", {
    enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled", "no_show"]
  }).default("scheduled"),
  attendeeCount: integer("attendee_count").default(1),
  specialRequests: text("special_requests"),
  contactPreference: text("contact_preference", { enum: ["email", "phone", "text"] }).default("email"),
  reminderSent: boolean("reminder_sent").default(false),
  feedbackSubmitted: boolean("feedback_submitted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User favorites for communities
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  notes: text("notes"), // Personal notes about the community
  priority: integer("priority").default(0), // 1 = High, 2 = Medium, 3 = Low
  tags: text("tags").array().default([]), // Custom tags like 'tour-scheduled', 'contacted'
  addedAt: timestamp("added_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_favorites_user_idx").on(table.userId),
  index("user_favorites_community_idx").on(table.communityId),
]);

// User saved searches
export const userSavedSearches = pgTable("user_saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  searchName: text("search_name").notNull(),
  searchParams: json("search_params").$type<{
    location?: string;
    careType?: string;
    budget?: { min: number; max: number };
    amenities?: string[];
    radius?: number;
  }>().notNull(),
  alertsEnabled: boolean("alerts_enabled").default(false),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_saved_searches_user_idx").on(table.userId),
]);



// Listing flags for user reports
export const listingFlags = pgTable("listing_flags", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  flagType: text("flag_type", {
    enum: ["Incorrect Information", "Duplicate Listing", "Inappropriate Content", "Spam", "Closed/Out of Business", "Wrong Location", "Pricing Error", "Other"]
  }).notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", {
    enum: ["Pending", "Under Review", "Resolved", "Dismissed"]
  }).default("Pending"),
  reporterEmail: text("reporter_email"), // For anonymous reports
  reporterName: text("reporter_name"), // For anonymous reports
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users and roles
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role", {
    enum: ["Super Admin", "Admin", "Moderator", "Support"]
  }).notNull(),
  permissions: json("permissions").$type<{
    canReviewFlags: boolean;
    canManageUsers: boolean;
    canManageCommunities: boolean;
    canViewAnalytics: boolean;
    canManageAdmins: boolean;
    canAccessCRM: boolean;
    canModerateReviews: boolean;
    canManageContent: boolean;
  }>().default({
    canReviewFlags: true,
    canManageUsers: false,
    canManageCommunities: false,
    canViewAnalytics: false,
    canManageAdmins: false,
    canAccessCRM: false,
    canModerateReviews: false,
    canManageContent: false,
  }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User activity tracking for analytics
export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  activityType: text("activity_type", {
    enum: ["Search", "View Community", "Add Favorite", "Remove Favorite", "Send Message", "Flag Listing", "Update Profile", "Schedule Tour", "Write Review", "Login", "Signup"]
  }).notNull(),
  details: json("details").$type<{
    communityId?: number;
    searchQuery?: string;
    location?: string;
    filters?: any;
    flagType?: string;
    messageId?: number;
    tourId?: number;
    reviewId?: number;
    ipAddress?: string;
    userAgent?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment transactions table for Stripe integration
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Stripe fields
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeChargeId: text("stripe_charge_id"),
  stripeCustomerId: text("stripe_customer_id"),
  
  // Transaction details
  paymentType: text("payment_type", {
    enum: ["tour", "application", "deposit", "document", "priority_support"]
  }).notNull(),
  amount: integer("amount").notNull(), // Always 195 cents ($1.95)
  currency: text("currency").default("usd"),
  processingFee: integer("processing_fee").default(195), // Our fee
  netAmount: integer("net_amount").default(0), // Always 0 as we don't handle actual payments
  
  // Status
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"]
  }).default("pending"),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    communityName?: string;
    description?: string;
    originalAmount?: number;
    userEmail?: string;
    userName?: string;
    notes?: string;
  }>().default({}),
  
  // Error handling
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  refundedAt: timestamp("refunded_at"),
}, (table) => [
  index("payment_transactions_user_idx").on(table.userId),
  index("payment_transactions_community_idx").on(table.communityId),
  index("payment_transactions_status_idx").on(table.status),
  index("payment_transactions_created_idx").on(table.createdAt),
]);

// Subscriptions - Community subscription management
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Stripe Integration
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  
  // Subscription Details
  productId: text("product_id").notNull(), // 'basic-listing', 'featured-spotlight', etc.
  status: text("status", {
    enum: ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]
  }).default("active"),
  
  // Billing
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    communityName?: string;
    managerEmail?: string;
    features?: string[];
    addOns?: string[];
  }>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("subscriptions_community_idx").on(table.communityId),
  index("subscriptions_stripe_idx").on(table.stripeSubscriptionId),
  index("subscriptions_status_idx").on(table.status),
]);

// Community Claims - Operator verification system
export const communityClaims = pgTable("community_claims", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  claimerUserId: integer("claimer_user_id").references(() => users.id),
  
  // Claim Status
  status: text("status", {
    enum: ["Pending", "Under Review", "Approved", "Rejected", "Cancelled"]
  }).default("Pending"),
  
  // Claimer Information
  claimerName: text("claimer_name").notNull(),
  claimerEmail: text("claimer_email").notNull(),
  claimerPhone: text("claimer_phone"),
  position: text("position").notNull(), // "Executive Director", "Marketing Director", "Owner", etc.
  companyName: text("company_name"), // Parent company if different
  
  // Verification Information
  businessLicenseNumber: text("business_license_number"),
  businessAddress: text("business_address"),
  verificationDocuments: json("verification_documents").$type<Array<{
    type: string; // "Business License", "ID", "Employment Verification", "Power of Attorney"
    filename: string;
    uploadedAt: string;
    verified: boolean;
  }>>().default([]),
  
  // Additional Details
  reasonForClaim: text("reason_for_claim").notNull(),
  additionalNotes: text("additional_notes"),
  
  // Admin Review
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Follow-up
  followUpDate: timestamp("follow_up_date"),
  priority: text("priority", {
    enum: ["Low", "Medium", "High", "Urgent"]
  }).default("Medium"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("community_claims_community_idx").on(table.communityId),
  index("community_claims_claimer_idx").on(table.claimerUserId),
  index("community_claims_status_idx").on(table.status),
]);

// Community enrichments table for AI-generated content
export const enrichments = pgTable("enrichments", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  enrichmentType: text("enrichment_type", {
    enum: ["ai_summary", "care_type_explanation", "suggested_tags", "subtype_classification"]
  }).notNull(),
  data: jsonb("data").$type<{
    description?: string;
    careTypeExplanation?: string;
    suggestedTags?: string[];
    suggestedSubtype?: string;
    dataSource?: string;
    confidence?: number;
  }>().notNull(),
  source: text("source").notNull(), // 'public_metadata_ai', 'hud_csv', 'cms_data', 'user_input'
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.00"),
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("enrichments_community_idx").on(table.communityId),
  index("enrichments_type_idx").on(table.enrichmentType),
]);

// Pending Communities - Approval queue for communities that can't be auto-added
export const pendingCommunities = pgTable("pending_communities", {
  id: serial("id").primaryKey(),
  
  // Community Data
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  phone: text("phone"),
  website: text("website"),
  
  // Google Places Data
  googlePlacesId: text("google_places_id"),
  googleRating: numeric("google_rating", { precision: 3, scale: 2 }),
  googleReviewCount: integer("google_review_count"),
  
  // Care Types
  careTypes: text("care_types").array().default([]),
  
  // Coordinates
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  
  // Approval Status
  status: text("status", {
    enum: ["Pending", "Under Review", "Approved", "Rejected", "Duplicate"]
  }).default("Pending"),
  
  // Reason for manual review
  reviewReason: text("review_reason").notNull(), // "Security Filter", "Duplicate Check", "Data Quality", "Missing Info"
  reviewNotes: text("review_notes"),
  
  // Source Information
  discoverySource: text("discovery_source").notNull(), // "Google Places", "Regional Expansion", "Manual Entry"
  discoveryQuery: text("discovery_query"),
  discoveryLocation: text("discovery_location"),
  
  // Admin Review
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("pending_communities_status_idx").on(table.status),
  index("pending_communities_created_idx").on(table.createdAt),
  index("pending_communities_city_idx").on(table.city),
]);

// Claimed Communities - Verified operator accounts
export const claimedCommunities = pgTable("claimed_communities", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull().unique(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  claimId: integer("claim_id").references(() => communityClaims.id).notNull(),
  
  // Operator Profile
  businessName: text("business_name").notNull(),
  operatorType: text("operator_type", {
    enum: ["Independent", "Regional Chain", "National Chain", "Non-Profit", "Government", "Other"]
  }).notNull(),
  licenseNumbers: text("license_numbers").array().default([]),
  
  // Verification Status
  isVerified: boolean("is_verified").default(false),
  verificationLevel: text("verification_level", {
    enum: ["Basic", "Enhanced", "Premium"]
  }).default("Basic"),
  
  // Subscription & Billing
  subscriptionPlan: text("subscription_plan", {
    enum: ["Free", "Basic", "Professional", "Enterprise"]
  }).default("Free"),
  subscriptionStatus: text("subscription_status", {
    enum: ["Active", "Cancelled", "Suspended", "Trial", "Past Due"]
  }).default("Trial"),
  subscriptionStarted: timestamp("subscription_started"),
  subscriptionExpires: timestamp("subscription_expires"),
  
  // Profile Management Permissions
  canUpdatePhotos: boolean("can_update_photos").default(true),
  canUpdatePricing: boolean("can_update_pricing").default(true),
  canUpdateAmenities: boolean("can_update_amenities").default(true),
  canRespondToReviews: boolean("can_respond_to_reviews").default(true),
  canReceiveLeads: boolean("can_receive_leads").default(true),
  
  claimedAt: timestamp("claimed_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("claimed_communities_owner_idx").on(table.ownerId),
  index("claimed_communities_subscription_idx").on(table.subscriptionStatus),
]);

// Leasing Applications
export const leasingApplications = pgTable("leasing_applications", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  
  // Application Status
  status: text("status", {
    enum: ["Draft", "Submitted", "Under Review", "Documents Requested", "Approved", "Rejected", "Cancelled", "Expired"]
  }).default("Draft"),
  
  // Applicant Information
  applicantFirstName: text("applicant_first_name").notNull(),
  applicantLastName: text("applicant_last_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  applicantPhone: text("applicant_phone").notNull(),
  applicantDateOfBirth: date("applicant_date_of_birth"),
  applicantSSN: text("applicant_ssn"), // Encrypted
  
  // Co-Applicant Information (if applicable)
  coApplicantFirstName: text("co_applicant_first_name"),
  coApplicantLastName: text("co_applicant_last_name"),
  coApplicantEmail: text("co_applicant_email"),
  coApplicantPhone: text("co_applicant_phone"),
  coApplicantDateOfBirth: date("co_applicant_date_of_birth"),
  coApplicantSSN: text("co_applicant_ssn"), // Encrypted
  
  // Emergency Contact Information
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  emergencyContactEmail: text("emergency_contact_email"),
  emergencyContactAddress: text("emergency_contact_address"),
  
  // Secondary Emergency Contact
  secondaryEmergencyContactName: text("secondary_emergency_contact_name"),
  secondaryEmergencyContactPhone: text("secondary_emergency_contact_phone"),
  secondaryEmergencyContactEmail: text("secondary_emergency_contact_email"),
  
  // Background Check Information
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  backgroundCheckProvider: text("background_check_provider"), // "Checkr", "GoodHire", "Sterling", etc.
  backgroundCheckRequestId: text("background_check_request_id"),
  backgroundCheckStatus: text("background_check_status", {
    enum: ["Not Started", "Pending", "In Progress", "Completed", "Failed", "Expired"]
  }).default("Not Started"),
  backgroundCheckCompletedAt: timestamp("background_check_completed_at"),
  backgroundCheckResults: jsonb("background_check_results").$type<{
    criminalRecord?: string;
    creditScore?: number;
    evictionHistory?: boolean;
    sexOffenderRegistry?: boolean;
    verificationStatus?: string;
    reportUrl?: string;
  }>(),
  
  // Care Recipient (if different from applicant)
  residentFirstName: text("resident_first_name"),
  residentLastName: text("resident_last_name"),
  residentDateOfBirth: date("resident_date_of_birth"),
  residentRelationship: text("resident_relationship"),
  
  // Care Needs
  careLevel: text("care_level", {
    enum: ["Independent Living", "Assisted Living", "Memory Care", "Skilled Nursing"]
  }).notNull(),
  medicalConditions: text("medical_conditions").array().default([]),
  medications: text("medications").array().default([]),
  mobilityLevel: text("mobility_level"),
  specialNeeds: text("special_needs"),
  
  // Financial Information
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }),
  incomeSources: jsonb("income_sources").$type<Array<{
    source: string;
    amount: number;
    verified: boolean;
  }>>().default([]),
  hasLongTermCareInsurance: boolean("has_long_term_care_insurance").default(false),
  insuranceProvider: text("insurance_provider"),
  
  // Unit Preferences
  preferredMoveInDate: date("preferred_move_in_date"),
  preferredUnitType: text("preferred_unit_type"),
  preferredFloor: text("preferred_floor"),
  petInfo: jsonb("pet_info").$type<{
    hasPets: boolean;
    petType?: string;
    petBreed?: string;
    petWeight?: number;
  }>(),
  
  // DocuSign Integration
  docusignEnvelopeId: text("docusign_envelope_id"),
  docusignStatus: text("docusign_status", {
    enum: ["Not Started", "Sent", "Delivered", "Signed", "Completed", "Declined", "Voided"]
  }).default("Not Started"),
  docusignSentAt: timestamp("docusign_sent_at"),
  docusignCompletedAt: timestamp("docusign_completed_at"),
  
  // Documents
  documents: jsonb("documents").$type<Array<{
    type: string; // "ID", "Income Verification", "Medical Records", "Insurance Card"
    filename: string;
    uploadedAt: string;
    verified: boolean;
    verifiedBy?: number;
    verifiedAt?: string;
  }>>().default([]),
  
  // Internal Notes
  internalNotes: text("internal_notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  
  // Timestamps
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("leasing_applications_community_idx").on(table.communityId),
  index("leasing_applications_user_idx").on(table.userId),
  index("leasing_applications_status_idx").on(table.status),
  index("leasing_applications_docusign_idx").on(table.docusignEnvelopeId),
]);

// Lease Agreements
export const leaseAgreements = pgTable("lease_agreements", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => leasingApplications.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  residentId: integer("resident_id").references(() => users.id),
  
  // Lease Details
  leaseNumber: text("lease_number").notNull().unique(),
  unitNumber: text("unit_number").notNull(),
  unitType: text("unit_type").notNull(),
  
  // Lease Terms
  leaseStartDate: date("lease_start_date").notNull(),
  leaseEndDate: date("lease_end_date"),
  leaseTermMonths: integer("lease_term_months").default(12),
  
  // Financial Terms
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  communityFee: decimal("community_fee", { precision: 10, scale: 2 }).default("0"),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).default("0"),
  petDeposit: decimal("pet_deposit", { precision: 10, scale: 2 }).default("0"),
  
  // Care Level Pricing
  careLevelFee: decimal("care_level_fee", { precision: 10, scale: 2 }).default("0"),
  additionalServicesFees: jsonb("additional_services_fees").$type<Array<{
    service: string;
    fee: number;
    frequency: string; // "monthly", "one-time", "as-needed"
  }>>().default([]),
  
  // Payment Terms
  paymentDueDay: integer("payment_due_day").default(1),
  lateFeeAmount: decimal("late_fee_amount", { precision: 10, scale: 2 }).default("50"),
  lateFeeGracePeriod: integer("late_fee_grace_period").default(5),
  
  // DocuSign
  docusignEnvelopeId: text("docusign_envelope_id"),
  docusignStatus: text("docusign_status", {
    enum: ["Draft", "Sent", "Delivered", "Signed", "Completed", "Declined", "Voided"]
  }).default("Draft"),
  signedDate: timestamp("signed_date"),
  
  // Status
  status: text("status", {
    enum: ["Draft", "Pending Signature", "Active", "Expired", "Terminated", "Renewed"]
  }).default("Draft"),
  
  // Move-in Checklist
  moveInChecklistCompleted: boolean("move_in_checklist_completed").default(false),
  moveInDate: date("move_in_date"),
  moveInInspectionNotes: text("move_in_inspection_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("lease_agreements_application_idx").on(table.applicationId),
  index("lease_agreements_community_idx").on(table.communityId),
  index("lease_agreements_resident_idx").on(table.residentId),
  index("lease_agreements_status_idx").on(table.status),
]);

// DocuSign Templates
export const docusignTemplates = pgTable("docusign_templates", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  
  // Template Information
  templateName: text("template_name").notNull(),
  templateType: text("template_type", {
    enum: ["Lease Agreement", "Application", "Addendum", "Move-in Checklist", "Financial Agreement", "HIPAA Release", "Custom"]
  }).notNull(),
  docusignTemplateId: text("docusign_template_id").notNull(),
  
  // Configuration
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  requiredFields: jsonb("required_fields").$type<Array<{
    fieldName: string;
    fieldType: string;
    required: boolean;
    defaultValue?: string;
  }>>().default([]),
  
  // Versioning
  version: integer("version").default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("docusign_templates_community_idx").on(table.communityId),
  index("docusign_templates_type_idx").on(table.templateType),
]);

// Leasing Tasks & Workflow
export const leasingTasks = pgTable("leasing_tasks", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => leasingApplications.id),
  leaseId: integer("lease_id").references(() => leaseAgreements.id),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Task Details
  taskType: text("task_type", {
    enum: ["Application Review", "Document Collection", "Background Check", "Financial Verification", "Medical Review", "Unit Assignment", "Lease Preparation", "Move-in Coordination", "Follow-up", "Custom"]
  }).notNull(),
  taskTitle: text("task_title").notNull(),
  taskDescription: text("task_description"),
  
  // Assignment
  assignedTo: integer("assigned_to").references(() => users.id),
  assignedBy: integer("assigned_by").references(() => users.id),
  
  // Status
  status: text("status", {
    enum: ["Pending", "In Progress", "Waiting", "Completed", "Cancelled", "Overdue"]
  }).default("Pending"),
  priority: text("priority", {
    enum: ["Low", "Medium", "High", "Urgent"]
  }).default("Medium"),
  
  // Timing
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by").references(() => users.id),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("leasing_tasks_application_idx").on(table.applicationId),
  index("leasing_tasks_lease_idx").on(table.leaseId),
  index("leasing_tasks_assigned_idx").on(table.assignedTo),
  index("leasing_tasks_status_idx").on(table.status),
]);

// Tenant payments table for tracking all payment transactions
export const tenantPayments = pgTable("tenant_payments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  leaseId: integer("lease_id").references(() => leaseAgreements.id),
  paymentType: varchar("payment_type", { length: 50 }).notNull(), // deposit, moveIn, rent, fee, other
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed, refunded
  paymentMethod: varchar("payment_method", { length: 50 }), // card, ach, check
  processorTransactionId: varchar("processor_transaction_id", { length: 255 }),
  processorResponse: jsonb("processor_response"),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("tenant_payments_tenant_idx").on(table.tenantId),
  index("tenant_payments_community_idx").on(table.communityId),
  index("tenant_payments_lease_idx").on(table.leaseId),
  index("tenant_payments_status_idx").on(table.status),
]);

// Tenant move-in checklist items
export const tenantMoveInChecklist = pgTable("tenant_move_in_checklist", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  leaseId: integer("lease_id").references(() => leaseAgreements.id),
  task: varchar("task", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }), // documents, payments, coordination, inspection
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  dueDate: date("due_date"),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("tenant_checklist_tenant_idx").on(table.tenantId),
  index("tenant_checklist_community_idx").on(table.communityId),
  index("tenant_checklist_completed_idx").on(table.completed),
]);

// Vendor connections for move-in services
export const vendorConnections = pgTable("vendor_connections", {
  id: serial("id").primaryKey(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(), // moving, furniture, cleaning, utilities
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  serviceAreas: text("service_areas").array(),
  specialRates: boolean("special_rates").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("vendor_connections_service_type_idx").on(table.serviceType),
  index("vendor_connections_active_idx").on(table.isActive),
]);

// ============ VENDOR MARKETPLACE TABLES ============

// Vendors - Main vendor account table
// Role permissions table for dashboard access control
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: text("role", { 
    enum: ["user", "admin", "community_owner", "vendor", "financial_admin", "support_agent", "analytics_viewer", "super_admin"] 
  }).notNull(),
  dashboard: text("dashboard", {
    enum: ["admin", "community", "user", "vendor", "financial", "analytics", "integration", "security", "all"]
  }).notNull(),
  permissions: json("permissions").$type<{
    view: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    manage_users?: boolean;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("role_permissions_role_idx").on(table.role),
]);

// User role assignments for flexible permission management
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  role: text("role", { 
    enum: ["user", "admin", "community_owner", "vendor", "financial_admin", "support_agent", "analytics_viewer", "super_admin"] 
  }).notNull(),
  dashboardAccess: text("dashboard_access").array().default([]),
  notes: text("notes"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_role_assignments_user_id_idx").on(table.userId),
  index("user_role_assignments_assigned_by_idx").on(table.assignedBy),
]);

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).unique(), // Link to user account
  
  // Business Information
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 50 }).notNull(), // 'individual', 'company', 'franchise'
  taxId: varchar("tax_id", { length: 100 }), // EIN or SSN (encrypted)
  
  // Contact Information
  primaryContactName: varchar("primary_contact_name", { length: 255 }).notNull(),
  primaryContactEmail: varchar("primary_contact_email", { length: 255 }).notNull(),
  primaryContactPhone: varchar("primary_contact_phone", { length: 20 }).notNull(),
  businessAddress: text("business_address"),
  businessCity: varchar("business_city", { length: 100 }),
  businessState: varchar("business_state", { length: 2 }),
  businessZip: varchar("business_zip", { length: 10 }),
  
  // Profile Information
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  yearsInBusiness: integer("years_in_business"),
  employeeCount: varchar("employee_count", { length: 50 }), // '1-5', '6-20', '21-50', '51-100', '100+'
  website: varchar("website", { length: 255 }),
  socialLinks: jsonb("social_links").$type<{
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  }>().default({}),
  
  // Service Coverage
  serviceAreas: text("service_areas").array().default([]), // Cities/regions served
  serviceRadius: integer("service_radius"), // Miles from business location
  
  // Verification & Compliance
  isVerified: boolean("is_verified").default(false),
  verificationDate: timestamp("verification_date"),
  verificationDocuments: jsonb("verification_documents").$type<Array<{
    type: string; // 'business_license', 'insurance', 'certification'
    fileName: string;
    uploadedAt: string;
    verifiedAt?: string;
    expiresAt?: string;
  }>>().default([]),
  insuranceExpiry: date("insurance_expiry"),
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseState: varchar("license_state", { length: 2 }),
  
  // Subscription & Status
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default('trial'), // 'trial', 'active', 'past_due', 'cancelled'
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('basic'), // 'basic', 'professional', 'enterprise'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  
  // Performance Metrics
  totalLeads: integer("total_leads").default(0),
  totalConversions: integer("total_conversions").default(0),
  lifetimeRevenue: decimal("lifetime_revenue", { precision: 10, scale: 2 }).default("0"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  responseTime: integer("response_time"), // Average hours to respond
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // Percentage of jobs completed
  
  // Commission & Payments
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("15"), // Percentage
  paymentMethod: varchar("payment_method", { length: 50 }), // 'bank_transfer', 'check', 'paypal'
  paymentDetails: jsonb("payment_details").$type<{
    bankName?: string;
    accountLast4?: string;
    routingNumber?: string;
    paypalEmail?: string;
  }>(),
  
  // Status & Flags
  status: varchar("status", { length: 50 }).default('pending'), // 'pending', 'active', 'suspended', 'banned'
  statusReason: text("status_reason"),
  featured: boolean("featured").default(false),
  featuredUntil: timestamp("featured_until"),
  
  // Settings
  notificationPreferences: jsonb("notification_preferences").$type<{
    emailLeads: boolean;
    smsLeads: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
    paymentAlerts: boolean;
  }>().default({
    emailLeads: true,
    smsLeads: false,
    weeklyReport: true,
    monthlyReport: true,
    paymentAlerts: true,
  }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("vendors_user_id_idx").on(table.userId),
  index("vendors_status_idx").on(table.status),
  index("vendors_subscription_status_idx").on(table.subscriptionStatus),
  index("vendors_featured_idx").on(table.featured),
]);

// Vendor Service Categories
export const vendorServiceCategories = pgTable("vendor_service_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }), // Icon name for UI
  parentId: integer("parent_id"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("vendor_service_categories_slug_idx").on(table.slug),
  index("vendor_service_categories_parent_idx").on(table.parentId),
]);

// Vendor Services Offered
export const vendorServices = pgTable("vendor_services", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  categoryId: integer("category_id").references(() => vendorServiceCategories.id).notNull(),
  
  // Service Details
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  serviceDescription: text("service_description"),
  
  // Pricing
  pricingType: varchar("pricing_type", { length: 50 }).notNull(), // 'fixed', 'hourly', 'quote', 'subscription'
  price: decimal("price", { precision: 10, scale: 2 }),
  priceUnit: varchar("price_unit", { length: 50 }), // 'per_hour', 'per_room', 'per_month', etc.
  priceRange: jsonb("price_range").$type<{ min: number; max: number }>(),
  
  // Service Specifics
  duration: integer("duration"), // Estimated minutes
  includedFeatures: text("included_features").array().default([]),
  addOns: jsonb("add_ons").$type<Array<{
    name: string;
    price: number;
    description?: string;
  }>>().default([]),
  
  // Availability
  isActive: boolean("is_active").default(true),
  availabilityType: varchar("availability_type", { length: 50 }).default('always'), // 'always', 'scheduled', 'limited'
  availabilitySchedule: jsonb("availability_schedule").$type<{
    days?: string[]; // ['monday', 'tuesday', etc.]
    hours?: { start: string; end: string };
    blackoutDates?: string[];
  }>(),
  
  // Service Area
  serviceAreaOverride: text("service_area_override").array(), // Override vendor's default service areas
  
  // Performance
  totalBookings: integer("total_bookings").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("vendor_services_vendor_idx").on(table.vendorId),
  index("vendor_services_category_idx").on(table.categoryId),
  index("vendor_services_active_idx").on(table.isActive),
]);

// Vendor Subscription Plans
export const vendorSubscriptionPlans = pgTable("vendor_subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  
  // Pricing
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }),
  setupFee: decimal("setup_fee", { precision: 10, scale: 2 }).default("0"),
  
  // Features
  features: jsonb("features").$type<{
    maxLeadsPerMonth: number;
    commissionRate: number;
    featuredListingDays: number;
    analyticsAccess: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    teamMembers: number;
  }>().notNull(),
  
  // Stripe Integration
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
  stripePriceIdAnnual: varchar("stripe_price_id_annual", { length: 255 }),
  
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("vendor_subscription_plans_slug_idx").on(table.slug),
  index("vendor_subscription_plans_active_idx").on(table.isActive),
]);

// Vendor Leads & Commissions
export const vendorLeads = pgTable("vendor_leads", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  serviceId: integer("service_id").references(() => vendorServices.id),
  
  // Lead Information
  leadType: varchar("lead_type", { length: 50 }).notNull(), // 'inquiry', 'quote_request', 'booking'
  status: varchar("status", { length: 50 }).default('new'), // 'new', 'contacted', 'quoted', 'won', 'lost'
  
  // Customer Information
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  
  // Service Details
  serviceDetails: jsonb("service_details").$type<{
    serviceDate?: string;
    location?: string;
    description?: string;
    specialRequests?: string;
    budget?: { min: number; max: number };
  }>().notNull(),
  
  // Tracking
  source: varchar("source", { length: 50 }).default('platform'), // 'platform', 'direct', 'referral'
  referralCommunityId: integer("referral_community_id").references(() => communities.id),
  
  // Response & Conversion
  respondedAt: timestamp("responded_at"),
  responseTime: integer("response_time"), // Minutes
  quotedAmount: decimal("quoted_amount", { precision: 10, scale: 2 }),
  wonAmount: decimal("won_amount", { precision: 10, scale: 2 }),
  convertedAt: timestamp("converted_at"),
  
  // Commission
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  commissionStatus: varchar("commission_status", { length: 50 }).default('pending'), // 'pending', 'approved', 'paid', 'cancelled'
  commissionPaidAt: timestamp("commission_paid_at"),
  
  // Notes
  vendorNotes: text("vendor_notes"),
  internalNotes: text("internal_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("vendor_leads_vendor_idx").on(table.vendorId),
  index("vendor_leads_user_idx").on(table.userId),
  index("vendor_leads_service_idx").on(table.serviceId),
  index("vendor_leads_status_idx").on(table.status),
  index("vendor_leads_commission_status_idx").on(table.commissionStatus),
]);

// Vendor Reviews
export const vendorReviews = pgTable("vendor_reviews", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  leadId: integer("lead_id").references(() => vendorLeads.id),
  
  // Review Details
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  review: text("review").notNull(),
  
  // Service Information
  serviceId: integer("service_id").references(() => vendorServices.id),
  serviceDate: date("service_date"),
  
  // Review Aspects
  aspects: jsonb("aspects").$type<{
    quality?: number;
    value?: number;
    punctuality?: number;
    communication?: number;
    professionalism?: number;
  }>(),
  
  // Media
  photos: text("photos").array().default([]),
  
  // Verification
  isVerified: boolean("is_verified").default(false), // Verified purchase/service
  verificationMethod: varchar("verification_method", { length: 50 }), // 'booking', 'receipt', 'admin'
  
  // Response
  vendorResponse: text("vendor_response"),
  vendorRespondedAt: timestamp("vendor_responded_at"),
  
  // Moderation
  status: varchar("status", { length: 50 }).default('published'), // 'pending', 'published', 'hidden', 'removed'
  moderationNotes: text("moderation_notes"),
  
  // Helpful votes
  helpfulVotes: integer("helpful_votes").default(0),
  unhelpfulVotes: integer("unhelpful_votes").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("vendor_reviews_vendor_idx").on(table.vendorId),
  index("vendor_reviews_user_idx").on(table.userId),
  index("vendor_reviews_rating_idx").on(table.rating),
  index("vendor_reviews_status_idx").on(table.status),
]);

// Vendor Analytics
export const vendorAnalytics = pgTable("vendor_analytics", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  date: date("date").notNull(),
  
  // Profile Metrics
  profileViews: integer("profile_views").default(0),
  searchImpressions: integer("search_impressions").default(0),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 2 }),
  
  // Lead Metrics
  leadsReceived: integer("leads_received").default(0),
  leadsResponded: integer("leads_responded").default(0),
  leadsConverted: integer("leads_converted").default(0),
  averageResponseTime: integer("average_response_time"), // Minutes
  
  // Revenue Metrics
  quotesProvided: integer("quotes_provided").default(0),
  totalQuotedAmount: decimal("total_quoted_amount", { precision: 10, scale: 2 }).default("0"),
  jobsWon: integer("jobs_won").default(0),
  revenueGenerated: decimal("revenue_generated", { precision: 10, scale: 2 }).default("0"),
  commissionsOwed: decimal("commissions_owed", { precision: 10, scale: 2 }).default("0"),
  
  // Service Metrics
  servicesViewed: jsonb("services_viewed").$type<Record<string, number>>().default({}),
  topPerformingServices: jsonb("top_performing_services").$type<Array<{
    serviceId: number;
    views: number;
    leads: number;
    conversions: number;
  }>>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("vendor_analytics_vendor_date_idx").on(table.vendorId, table.date),
]);

// Operator Team Members
export const operatorTeamMembers = pgTable("operator_team_members", {
  id: serial("id").primaryKey(),
  claimedCommunityId: integer("claimed_community_id").references(() => claimedCommunities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  role: text("role", {
    enum: ["Owner", "Administrator", "Marketing Manager", "Tour Coordinator", "Customer Service", "Read Only"]
  }).notNull(),
  
  permissions: json("permissions").$type<{
    canUpdateProfile: boolean;
    canUpdatePhotos: boolean;
    canUpdatePricing: boolean;
    canRespondToReviews: boolean;
    canViewAnalytics: boolean;
    canManageTeam: boolean;
    canReceiveLeads: boolean;
  }>().default({
    canUpdateProfile: false,
    canUpdatePhotos: false,
    canUpdatePricing: false,
    canRespondToReviews: false,
    canViewAnalytics: false,
    canManageTeam: false,
    canReceiveLeads: false,
  }),
  
  isActive: boolean("is_active").default(true),
  invitedBy: integer("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("operator_team_members_community_idx").on(table.claimedCommunityId),
  index("operator_team_members_user_idx").on(table.userId),
]);

// CRM Integration - Lead tracking
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  claimedCommunityId: integer("claimed_community_id").references(() => claimedCommunities.id),
  source: text("source", {
    enum: ["Website", "Direct", "Referral", "Advertisement", "Google", "Social Media", "Other"]
  }).default("Website"),
  status: text("status", {
    enum: ["New", "Contacted", "Qualified", "Tour Scheduled", "Tour Completed", "Application Submitted", "Converted", "Lost", "Archived"]
  }).default("New"),
  priority: text("priority", {
    enum: ["Low", "Medium", "High", "Urgent"]
  }).default("Medium"),
  assignedTo: integer("assigned_to").references(() => users.id),
  contactDetails: json("contact_details").$type<{
    email?: string;
    phone?: string;
    preferredContactMethod?: string;
    bestTimeToCall?: string;
    urgency?: string;
    timeline?: string;
    budget?: string;
    careNeeds?: string[];
    notes?: string;
  }>().default({}),
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  conversionDate: timestamp("conversion_date"),
  conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead activities/notes
export const leadActivities = pgTable("lead_activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type", {
    enum: ["Email", "Phone Call", "Text Message", "Meeting", "Tour", "Follow-up", "Note", "Status Change", "Assignment"]
  }).notNull(),
  subject: text("subject"),
  description: text("description").notNull(),
  outcome: text("outcome"),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Log table for compliance and security tracking
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Can be null for system actions - changed to varchar for Replit Auth
  adminId: integer("admin_id").references(() => adminUsers.id), // For admin actions
  action: varchar("action", { length: 255 }).notNull(), // e.g., "user_created", "community_updated", "flag_resolved"
  entityType: varchar("entity_type", { length: 100 }).notNull(), // e.g., "user", "community", "flag", "system"
  entityId: varchar("entity_id", { length: 255 }), // ID of the affected entity
  metadata: jsonb("metadata").$type<{
    previousValues?: any;
    newValues?: any;
    reason?: string;
    additionalInfo?: any;
  }>(), // Additional action details
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  severity: varchar("severity", { length: 20 }).notNull().default("Low"),
  outcome: varchar("outcome", { length: 20 }).notNull().default("Success"),
  createdAt: timestamp("created_at").defaultNow(),
  indexedAt: timestamp("indexed_at").defaultNow() // For search optimization
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  adminIdIdx: index("audit_logs_admin_id_idx").on(table.adminId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  severityIdx: index("audit_logs_severity_idx").on(table.severity)
}));

// Data Protection Tables
export const dataProtectionLogs = pgTable("data_protection_logs", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 100 }).notNull(),
  totalAttempted: integer("total_attempted").notNull(),
  allowedCount: integer("allowed_count").notNull(),
  blockedCount: integer("blocked_count").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemFlags = pgTable("system_flags", {
  flagName: varchar("flag_name", { length: 50 }).primaryKey(),
  flagValue: varchar("flag_value", { length: 100 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dataBackups = pgTable("data_backups", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  backupData: jsonb("backup_data").notNull(),
  backupType: varchar("backup_type", { length: 50 }).notNull(), // 'daily', 'before_update', 'manual'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendor Registrations - for vendor signup and subscriptions
export const vendorRegistrations = pgTable("vendor_registrations", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  website: varchar("website", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  serviceAreas: text("service_areas").array().notNull(),
  planType: text("plan_type", {
    enum: ["basic", "professional", "enterprise"]
  }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull(),
  status: text("status", {
    enum: ["active", "inactive", "pending", "cancelled"]
  }).default("pending"),
  verifiedPartner: boolean("verified_partner").default(false),
  monthlyAmount: decimal("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("vendor_registrations_email_idx").on(table.email),
  stripeCustomerIdx: index("vendor_registrations_stripe_customer_idx").on(table.stripeCustomerId),
  statusIdx: index("vendor_registrations_status_idx").on(table.status),
  planTypeIdx: index("vendor_registrations_plan_type_idx").on(table.planType)
}));

// Relations
export const communitiesRelations = relations(communities, ({ many }) => ({
  inspections: many(inspections),
  reviews: many(reviews),
  flags: many(listingFlags),
  leads: many(leads),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  community: one(communities, {
    fields: [inspections.communityId],
    references: [communities.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  reviewHelpfulness: many(reviewHelpfulness),
  oldFavorites: many(favorites),
  searchHistory: many(searchHistory),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  tours: many(tours),
  sessions: many(userSessions),
  userFavorites: many(userFavorites),
  savedSearches: many(userSavedSearches),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  community: one(communities, {
    fields: [reviews.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  helpfulness: many(reviewHelpfulness),
}));

export const reviewHelpfulnessRelations = relations(reviewHelpfulness, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpfulness.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewHelpfulness.userId],
    references: [users.id],
  }),
}));

// New relations for new tables
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [favorites.communityId],
    references: [communities.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: "sentMessages"
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: "receivedMessages"
  }),
  community: one(communities, {
    fields: [messages.communityId],
    references: [communities.id],
  }),
}));

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
  community: one(communities, {
    fields: [messageTemplates.communityId],
    references: [communities.id],
  }),
}));

export const toursRelations = relations(tours, ({ one }) => ({
  user: one(users, {
    fields: [tours.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [tours.communityId],
    references: [communities.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [userFavorites.communityId],
    references: [communities.id],
  }),
}));

export const userSavedSearchesRelations = relations(userSavedSearches, ({ one }) => ({
  user: one(users, {
    fields: [userSavedSearches.userId],
    references: [users.id],
  }),
}));

export const listingFlagsRelations = relations(listingFlags, ({ one }) => ({
  community: one(communities, {
    fields: [listingFlags.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [listingFlags.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [listingFlags.reviewedBy],
    references: [users.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id],
  }),
}));

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [leads.communityId],
    references: [communities.id],
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  activities: many(leadActivities),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [leadActivities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [leadActivities.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  admin: one(adminUsers, {
    fields: [auditLogs.adminId],
    references: [adminUsers.id],
  }),
}));

// Community Claims Relations
export const communityClaimsRelations = relations(communityClaims, ({ one }) => ({
  community: one(communities, {
    fields: [communityClaims.communityId],
    references: [communities.id],
  }),
  claimer: one(users, {
    fields: [communityClaims.claimerUserId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [communityClaims.reviewedBy],
    references: [users.id],
  }),
}));

export const claimedCommunitiesRelations = relations(claimedCommunities, ({ one, many }) => ({
  community: one(communities, {
    fields: [claimedCommunities.communityId],
    references: [communities.id],
  }),
  owner: one(users, {
    fields: [claimedCommunities.ownerId],
    references: [users.id],
  }),
  claim: one(communityClaims, {
    fields: [claimedCommunities.claimId],
    references: [communityClaims.id],
  }),
  teamMembers: many(operatorTeamMembers),
  leads: many(leads),
}));

export const operatorTeamMembersRelations = relations(operatorTeamMembers, ({ one }) => ({
  claimedCommunity: one(claimedCommunities, {
    fields: [operatorTeamMembers.claimedCommunityId],
    references: [claimedCommunities.id],
  }),
  user: one(users, {
    fields: [operatorTeamMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [operatorTeamMembers.invitedBy],
    references: [users.id],
  }),
}));

// Leasing Management Relations
export const leasingApplicationsRelations = relations(leasingApplications, ({ one, many }) => ({
  community: one(communities, {
    fields: [leasingApplications.communityId],
    references: [communities.id],
  }),
  user: one(users, {
    fields: [leasingApplications.userId],
    references: [users.id],
  }),
  assignedUser: one(users, {
    fields: [leasingApplications.assignedTo],
    references: [users.id],
    relationName: "assignedApplications",
  }),
  reviewer: one(users, {
    fields: [leasingApplications.reviewedBy],
    references: [users.id],
    relationName: "reviewedApplications",
  }),
  leaseAgreements: many(leaseAgreements),
  tasks: many(leasingTasks),
}));

export const leaseAgreementsRelations = relations(leaseAgreements, ({ one, many }) => ({
  application: one(leasingApplications, {
    fields: [leaseAgreements.applicationId],
    references: [leasingApplications.id],
  }),
  community: one(communities, {
    fields: [leaseAgreements.communityId],
    references: [communities.id],
  }),
  resident: one(users, {
    fields: [leaseAgreements.residentId],
    references: [users.id],
  }),
  tasks: many(leasingTasks),
}));

export const docusignTemplatesRelations = relations(docusignTemplates, ({ one }) => ({
  community: one(communities, {
    fields: [docusignTemplates.communityId],
    references: [communities.id],
  }),
}));

export const leasingTasksRelations = relations(leasingTasks, ({ one }) => ({
  application: one(leasingApplications, {
    fields: [leasingTasks.applicationId],
    references: [leasingApplications.id],
  }),
  lease: one(leaseAgreements, {
    fields: [leasingTasks.leaseId],
    references: [leaseAgreements.id],
  }),
  community: one(communities, {
    fields: [leasingTasks.communityId],
    references: [communities.id],
  }),
  assignedUser: one(users, {
    fields: [leasingTasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  assignedByUser: one(users, {
    fields: [leasingTasks.assignedBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
  completedByUser: one(users, {
    fields: [leasingTasks.completedBy],
    references: [users.id],
    relationName: "completedTasks",
  }),
}));

// Removal Requests Table
export const removalRequests = pgTable("removal_requests", {
  id: serial("id").primaryKey(),
  
  // Request Type
  requestType: varchar("request_type", { length: 50 }).notNull(), // 'community', 'vendor', 'service'
  entityId: integer("entity_id").notNull(), // ID of the community, vendor, or service
  entityName: varchar("entity_name", { length: 500 }).notNull(), // Name for display purposes
  
  // Requestor Information
  requestorName: varchar("requestor_name", { length: 255 }).notNull(),
  requestorEmail: varchar("requestor_email", { length: 255 }).notNull(),
  requestorPhone: varchar("requestor_phone", { length: 20 }),
  requestorRole: varchar("requestor_role", { length: 100 }).notNull(), // 'owner', 'authorized_representative', 'legal_counsel'
  
  // Request Details
  reason: text("reason").notNull(),
  legalBasis: varchar("legal_basis", { length: 100 }), // 'copyright', 'trademark', 'privacy', 'accuracy', 'other'
  additionalNotes: text("additional_notes"),
  
  // Supporting Documentation
  supportingDocuments: jsonb("supporting_documents").$type<Array<{
    fileName: string;
    fileType: string;
    uploadedAt: string;
    url: string;
  }>>().default([]),
  
  // Processing
  status: varchar("status", { length: 50 }).default('pending'), // 'pending', 'reviewing', 'approved', 'rejected', 'completed'
  processedBy: varchar("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  processingNotes: text("processing_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Metadata
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("removal_requests_status_idx").on(table.status),
  index("removal_requests_entity_idx").on(table.requestType, table.entityId),
  index("removal_requests_created_idx").on(table.createdAt),
]);

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  // dateOfBirth: true, // Field doesn't exist in database
  // relationshipToCare: true, // Field doesn't exist in database
  careNeeds: true,
  searchPreferences: true,
  notifications: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpful: true,
  notHelpful: true,
  moderationStatus: true,
  moderationNotes: true,
  verified: true,
}).extend({
  rating: z.number().min(1).max(5),
  title: z.string().min(5).max(100),
  reviewText: z.string().min(20).max(2000),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
});

export const insertReviewHelpfulnessSchema = createInsertSchema(reviewHelpfulness).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
  readAt: true,
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  useCount: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reminderSent: true,
  feedbackSubmitted: true,
});

// Enhanced tour creation schema for the comprehensive tour tracker
export const createTourSchema = insertTourSchema.extend({
  tourPhotos: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    category: z.enum(["unit", "common_area", "amenity", "exterior", "dining", "activity", "staff", "document", "other"]),
    timestamp: z.string(),
    notes: z.string().optional(),
  })).optional(),
  pricingInfo: z.object({
    quotedPrice: z.object({
      min: z.number(),
      max: z.number(),
      unit: z.string(),
      careLevel: z.string().optional(),
      includedServices: z.array(z.string()).optional(),
    }).optional(),
    moveInCosts: z.object({
      securityDeposit: z.number().optional(),
      firstMonthRent: z.number().optional(),
      lastMonthRent: z.number().optional(),
      applicationFee: z.number().optional(),
      adminFee: z.number().optional(),
      petDeposit: z.number().optional(),
      other: z.array(z.object({
        name: z.string(),
        amount: z.number(),
        required: z.boolean(),
      })).optional(),
      totalEstimate: z.number().optional(),
    }).optional(),
    specialDeals: z.array(z.object({
      title: z.string(),
      description: z.string(),
      value: z.number(),
      type: z.enum(["discount", "waived_fee", "free_months", "other"]),
      conditions: z.string().optional(),
      validUntil: z.string().optional(),
    })).optional(),
    rentIncrease: z.object({
      frequency: z.enum(["annual", "biannual", "as_needed"]),
      averagePercentage: z.number().optional(),
      nextPlannedIncrease: z.string().optional(),
      historicalIncreases: z.array(z.object({
        date: z.string(),
        percentage: z.number(),
        amount: z.number(),
      })).optional(),
    }).optional(),
  }).optional(),
  unitsViewed: z.array(z.object({
    unitNumber: z.string().optional(),
    unitType: z.string(),
    floorPlan: z.string().optional(),
    squareFootage: z.number().optional(),
    price: z.number(),
    availability: z.string(),
    impressions: z.string(),
    photos: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    condition: z.enum(["excellent", "good", "fair", "needs_improvement"]).optional(),
  })).optional(),
  highlights: z.object({
    positives: z.array(z.string()).optional(),
    concerns: z.array(z.string()).optional(),
    standoutFeatures: z.array(z.string()).optional(),
    comparisonNotes: z.string().optional(),
  }).optional(),
  staffInteraction: z.object({
    tourGuide: z.string().optional(),
    professionalism: z.number().min(1).max(5).optional(),
    knowledgeLevel: z.number().min(1).max(5).optional(),
    responsiveness: z.number().min(1).max(5).optional(),
    followUpCommitment: z.string().optional(),
    additionalContacts: z.array(z.object({
      name: z.string(),
      role: z.string(),
      contact: z.string(),
    })).optional(),
  }).optional(),
  followUpActions: z.array(z.object({
    action: z.string(),
    dueDate: z.string().optional(),
    completed: z.boolean(),
    notes: z.string().optional(),
  })).optional(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
});

export const insertUserSavedSearchSchema = createInsertSchema(userSavedSearches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRunAt: true,
});

// Data Protection Types
export type DataProtectionLog = typeof dataProtectionLogs.$inferSelect;
export type InsertDataProtectionLog = typeof dataProtectionLogs.$inferInsert;
export type SystemFlag = typeof systemFlags.$inferSelect;
export type InsertSystemFlag = typeof systemFlags.$inferInsert;
export type DataBackup = typeof dataBackups.$inferSelect;
export type InsertDataBackup = typeof dataBackups.$inferInsert;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  relationshipToCare: z.enum([
    "Seeking for Self",
    "Seeking for Parent", 
    "Seeking for Spouse",
    "Seeking for Other Family",
    "Healthcare Professional"
  ]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const searchCommunitySchema = z.object({
  location: z.string().optional(),
  careType: z.string().optional(),
  budget: z.string().optional(),
  availability: z.string().optional(),
  distance: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  minRating: z.number().optional(),
  hasPhotos: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReviewHelpfulness = z.infer<typeof insertReviewHelpfulnessSchema>;
export type ReviewHelpfulness = typeof reviewHelpfulness.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistoryEntry = typeof searchHistory.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type CreateTour = z.infer<typeof createTourSchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserSavedSearch = z.infer<typeof insertUserSavedSearchSchema>;
export type UserSavedSearch = typeof userSavedSearches.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type SearchCommunity = z.infer<typeof searchCommunitySchema>;

// Claim System Types
export type InsertCommunityClaim = z.infer<typeof insertCommunityClaimSchema>;
export type CommunityClaim = typeof communityClaims.$inferSelect;
export type InsertClaimedCommunity = z.infer<typeof insertClaimedCommunitySchema>;
export type ClaimedCommunity = typeof claimedCommunities.$inferSelect;
export type InsertOperatorTeamMember = z.infer<typeof insertOperatorTeamMemberSchema>;
export type OperatorTeamMember = typeof operatorTeamMembers.$inferSelect;
export type CommunityClaimForm = z.infer<typeof communityClaimFormSchema>;

// New schema types
export const insertListingFlagSchema = createInsertSchema(listingFlags).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivity).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

// Community Claims Schemas
export const insertCommunityClaimSchema = createInsertSchema(communityClaims).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewNotes: true,
  rejectionReason: true,
  followUpDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClaimedCommunitySchema = createInsertSchema(claimedCommunities).omit({
  id: true,
  isVerified: true,
  subscriptionStarted: true,
  subscriptionExpires: true,
  claimedAt: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOperatorTeamMemberSchema = createInsertSchema(operatorTeamMembers).omit({
  id: true,
  isActive: true,
  invitedAt: true,
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Community Claim Form Schema (for frontend)
export const communityClaimFormSchema = z.object({
  communityId: z.number(),
  claimerName: z.string().min(2, "Name must be at least 2 characters"),
  claimerEmail: z.string().email("Please enter a valid email address"),
  claimerPhone: z.string().optional(),
  position: z.string().min(2, "Position is required"),
  companyName: z.string().optional(),
  businessLicenseNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  reasonForClaim: z.string().min(10, "Please provide a detailed reason for claiming this community"),
  additionalNotes: z.string().optional(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
  indexedAt: true,
});

export const insertRemovalRequestSchema = createInsertSchema(removalRequests).omit({
  id: true,
  status: true,
  processedBy: true,
  processedAt: true,
  processingNotes: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertListingFlag = z.infer<typeof insertListingFlagSchema>;
export type ListingFlag = typeof listingFlags.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivity.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type PendingCommunity = typeof pendingCommunities.$inferSelect;
export type InsertPendingCommunity = typeof pendingCommunities.$inferInsert;
export type InsertRemovalRequest = z.infer<typeof insertRemovalRequestSchema>;
export type RemovalRequest = typeof removalRequests.$inferSelect;

// Emotional Support Resource Tables
export const supportResourceCategories = pgTable("support_resource_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(), // lucide icon name
  colorScheme: text("color_scheme").notNull().default("blue"), // for UI theming
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportResources = pgTable("support_resources", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => supportResourceCategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Markdown content
  resourceType: text("resource_type", {
    enum: ["article", "guide", "checklist", "video", "audio", "worksheet", "external_link"]
  }).notNull(),
  tags: text("tags").array().default([]),
  targetAudience: text("target_audience").array().default([]), // ['family_members', 'caregivers', 'seniors', 'professionals']
  careStage: text("care_stage", {
    enum: ["exploration", "evaluation", "transition", "adjustment", "ongoing_care", "crisis_support"]
  }),
  emotionalThemes: text("emotional_themes").array().default([]), // ['guilt', 'overwhelm', 'grief', 'hope', 'acceptance']
  readingTime: integer("reading_time"), // in minutes
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced"]
  }).default("beginner"),
  authorName: text("author_name"),
  authorCredentials: text("author_credentials"),
  sourceUrl: text("source_url"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  downloadUrl: text("download_url"),
  isHelpful: boolean("is_helpful").default(true),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  helpfulCount: integer("helpful_count").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSupportResourceInteractions = pgTable("user_support_resource_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  resourceId: integer("resource_id").references(() => supportResources.id),
  interactionType: text("interaction_type", {
    enum: ["viewed", "bookmarked", "shared", "completed", "helpful", "not_helpful"]
  }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support Resource Relations
export const supportResourceCategoriesRelations = relations(supportResourceCategories, ({ many }) => ({
  resources: many(supportResources),
}));

export const supportResourcesRelations = relations(supportResources, ({ one, many }) => ({
  category: one(supportResourceCategories, {
    fields: [supportResources.categoryId],
    references: [supportResourceCategories.id],
  }),
  interactions: many(userSupportResourceInteractions),
}));

export const userSupportResourceInteractionsRelations = relations(userSupportResourceInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userSupportResourceInteractions.userId],
    references: [users.id],
  }),
  resource: one(supportResources, {
    fields: [userSupportResourceInteractions.resourceId],
    references: [supportResources.id],
  }),
}));

// Support Resource Insert schemas
export const insertSupportResourceCategorySchema = createInsertSchema(supportResourceCategories);
export const insertSupportResourceSchema = createInsertSchema(supportResources);
export const insertUserSupportResourceInteractionSchema = createInsertSchema(userSupportResourceInteractions);

// Leasing Management Insert schemas and types
export const insertLeasingApplicationSchema = createInsertSchema(leasingApplications).omit({
  id: true,
  status: true,
  docusignStatus: true,
  docusignSentAt: true,
  docusignCompletedAt: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaseAgreementSchema = createInsertSchema(leaseAgreements).omit({
  id: true,
  status: true,
  docusignStatus: true,
  signedDate: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocusignTemplateSchema = createInsertSchema(docusignTemplates).omit({
  id: true,
  version: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeasingTaskSchema = createInsertSchema(leasingTasks).omit({
  id: true,
  status: true,
  completedAt: true,
  completedBy: true,
  createdAt: true,
  updatedAt: true,
});

// Leasing Management Types
export type LeasingApplication = typeof leasingApplications.$inferSelect;
export type InsertLeasingApplication = z.infer<typeof insertLeasingApplicationSchema>;
export type LeaseAgreement = typeof leaseAgreements.$inferSelect;
export type InsertLeaseAgreement = z.infer<typeof insertLeaseAgreementSchema>;
export type DocusignTemplate = typeof docusignTemplates.$inferSelect;
export type InsertDocusignTemplate = z.infer<typeof insertDocusignTemplateSchema>;
export type LeasingTask = typeof leasingTasks.$inferSelect;
export type InsertLeasingTask = z.infer<typeof insertLeasingTaskSchema>;

// Support Resource Types
export type SupportResourceCategory = typeof supportResourceCategories.$inferSelect;
export type InsertSupportResourceCategory = typeof supportResourceCategories.$inferInsert;
export type SupportResource = typeof supportResources.$inferSelect;
export type InsertSupportResource = typeof supportResources.$inferInsert;
export type UserSupportResourceInteraction = typeof userSupportResourceInteractions.$inferSelect;
export type InsertUserSupportResourceInteraction = typeof userSupportResourceInteractions.$inferInsert;

// Community Activities Calendar
export const communityActivities = pgTable("community_activities", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  activityName: text("activity_name").notNull(),
  activityType: text("activity_type", {
    enum: ["meal", "entertainment", "exercise", "social", "educational", "religious", "outdoor", "crafts", "games", "music", "therapy", "special_event", "holiday", "other"]
  }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"), // Where in the community
  capacity: integer("capacity"),
  currentAttendees: integer("current_attendees").default(0),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // "daily", "weekly", "monthly", "custom"
  leadStaff: text("lead_staff"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  requiresRegistration: boolean("requires_registration").default(false),
  activityLevel: text("activity_level", {
    enum: ["low", "medium", "high"]
  }).default("medium"),
  targetAudience: text("target_audience"), // "all_residents", "memory_care", "independent_living", "assisted_living"
  specialNotes: text("special_notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Community Activities schema and types
export const insertCommunityActivitySchema = createInsertSchema(communityActivities);
export type CommunityActivity = typeof communityActivities.$inferSelect;
export type InsertCommunityActivity = typeof communityActivities.$inferInsert;

// Stripe Products table - stores the 4 core tiers + add-ons
export const stripeProducts = pgTable("stripe_products", {
  id: serial("id").primaryKey(),
  stripeProductId: text("stripe_product_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  tierLevel: text("tier_level", {
    enum: ["free", "standard", "featured", "platinum"]
  }),
  billingType: text("billing_type", {
    enum: ["none", "monthly", "yearly", "one_time"]
  }).notNull(),
  price: integer("price").notNull(), // in cents
  currency: text("currency").default("usd"),
  isActive: boolean("is_active").default(true),
  isAddOn: boolean("is_add_on").default(false),
  addOnType: text("add_on_type", {
    enum: ["onboarding", "media", "exposure_boost", "visibility_ai"]
  }),
  features: json("features").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Subscriptions table - tracks active subscriptions
export const communitySubscriptions = pgTable("community_subscriptions", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  productId: integer("product_id").references(() => stripeProducts.id),
  status: text("status", {
    enum: ["active", "past_due", "canceled", "trialing", "incomplete", "incomplete_expired"]
  }).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tour Reviews table - comprehensive tour tracking and review system
export const tourReviews = pgTable("tour_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  tourType: text("tour_type", {
    enum: ["virtual", "in_person", "self_guided", "family_visit"]
  }).notNull(),
  visitDate: timestamp("visit_date").notNull(),
  duration: integer("duration_minutes"),
  
  // Location and GPS data
  gpsLocation: json("gps_location").$type<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  }>(),
  
  // Comprehensive evaluation categories
  cleanliness: json("cleanliness").$type<{
    rating: number; // 1-5 stars
    notes: string;
    photos: string[];
  }>(),
  staff: json("staff").$type<{
    rating: number;
    notes: string;
    staffMembersMet: string[];
  }>(),
  food: json("food").$type<{
    rating: number;
    notes: string;
    mealsExperienced: string[];
    photos: string[];
  }>(),
  amenities: json("amenities").$type<{
    rating: number;
    notes: string;
    amenitiesUsed: string[];
    photos: string[];
  }>(),
  safety: json("safety").$type<{
    rating: number;
    notes: string;
    safetyFeatures: string[];
  }>(),
  overall: json("overall").$type<{
    rating: number;
    notes: string;
    wouldRecommend: boolean;
    highlights: string[];
    concerns: string[];
  }>(),
  
  // Family collaboration
  familyMembers: json("family_members").$type<Array<{
    name: string;
    relationship: string;
    present: boolean;
  }>>().default([]),
  familyNotes: text("family_notes"),
  
  // Review publication settings
  isPublic: boolean("is_public").default(false),
  isVerified: boolean("is_verified").default(false),
  publishedAt: timestamp("published_at"),
  moderationStatus: text("moderation_status", {
    enum: ["pending", "approved", "rejected", "flagged"]
  }).default("pending"),
  
  // Media attachments
  photos: json("photos").$type<Array<{
    url: string;
    caption: string;
    category: string;
    timestamp: string;
  }>>().default([]),
  videos: json("videos").$type<Array<{
    url: string;
    caption: string;
    duration: number;
    timestamp: string;
  }>>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reservations Table - For Expedia-like booking functionality
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  reservationId: varchar("reservation_id", { length: 50 }).notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  communityName: text("community_name").notNull(),
  
  // Reservation Details
  unitType: text("unit_type").default("Standard"),
  status: text("status", {
    enum: ["active", "cancelled", "expired", "confirmed", "checked_in"]
  }).default("active"),
  
  // Timing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  moveInDate: date("move_in_date"),
  
  // Contact Information
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  
  // Tracking
  updatedAt: timestamp("updated_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
  
  // Future fields for payment integration
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "refunded", "failed"]
  }),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
}, (table) => [
  index("reservations_user_idx").on(table.userId),
  index("reservations_community_idx").on(table.communityId),
  index("reservations_status_idx").on(table.status),
  index("reservations_expires_idx").on(table.expiresAt),
]);

// Feature access control utility types
export const subscriptionTiers = {
  free: {
    name: "Free Listing",
    price: 0,
    features: ["basic_listing", "photo_upload", "license_verified"]
  },
  standard: {
    name: "Standard",
    price: 79,
    features: ["pricing_display", "availability_display", "incentive_display", "5_photos", "basic_insights"]
  },
  featured: {
    name: "Featured",
    price: 149,
    features: ["priority_placement", "featured_badge", "tour_tools", "unlimited_photos", "analytics_dashboard", "staff_profiles", "responsive_badge", "smart_lead_routing"]
  },
  platinum: {
    name: "Platinum",
    price: 249,
    features: ["branding_customization", "api_sync", "admin_portal", "homepage_priority", "featured_badge", "priority_placement", "hipaa_intake"]
  }
} as const;

export const addOnProducts = {
  concierge_setup: {
    name: "Concierge Setup",
    price: 99,
    type: "onboarding",
    features: ["profile_setup", "photo_upload", "pricing_entry", "community_verification"]
  },
  verified_video: {
    name: "Verified Video Upload",
    price: 49,
    type: "media", 
    features: ["video_hosting", "verified_video_badge", "priority_in_search"]
  },
  boosted_spot: {
    name: "Boosted Featured Spot",
    price: 99,
    type: "exposure_boost",
    recurring: "monthly",
    features: ["homepage_carousel", "category_top", "boosted_visibility"]
  },
  ai_smart_match: {
    name: "AI Smart Match Boost",
    price: 29,
    type: "visibility_ai",
    recurring: "monthly",
    features: ["enhanced_matching", "user_context_priority", "tag_relevance_boost"]
  }
} as const;

export const insertStripeProductSchema = createInsertSchema(stripeProducts);
export type InsertStripeProduct = z.infer<typeof insertStripeProductSchema>;
export type SelectStripeProduct = typeof stripeProducts.$inferSelect;

export const insertCommunitySubscriptionSchema = createInsertSchema(communitySubscriptions);
export type InsertCommunitySubscription = z.infer<typeof insertCommunitySubscriptionSchema>;
export type SelectCommunitySubscription = typeof communitySubscriptions.$inferSelect;

export const insertTourReviewSchema = createInsertSchema(tourReviews);
export type InsertTourReview = z.infer<typeof insertTourReviewSchema>;
export type SelectTourReview = typeof tourReviews.$inferSelect;

// ============ VENDOR MARKETPLACE TYPES ============

// Vendor types
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  isVerified: true,
  verificationDate: true,
  totalLeads: true,
  totalConversions: true,
  lifetimeRevenue: true,
  averageRating: true,
  totalReviews: true,
  responseTime: true,
  completionRate: true,
  featured: true,
  featuredUntil: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// Vendor Service Category types
export const insertVendorServiceCategorySchema = createInsertSchema(vendorServiceCategories).omit({
  id: true,
  createdAt: true,
});
export type InsertVendorServiceCategory = z.infer<typeof insertVendorServiceCategorySchema>;
export type VendorServiceCategory = typeof vendorServiceCategories.$inferSelect;

// Vendor Service types
export const insertVendorServiceSchema = createInsertSchema(vendorServices).omit({
  id: true,
  totalBookings: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendorService = z.infer<typeof insertVendorServiceSchema>;
export type VendorService = typeof vendorServices.$inferSelect;

// Vendor Subscription Plan types
export const insertVendorSubscriptionPlanSchema = createInsertSchema(vendorSubscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendorSubscriptionPlan = z.infer<typeof insertVendorSubscriptionPlanSchema>;
export type VendorSubscriptionPlan = typeof vendorSubscriptionPlans.$inferSelect;

// Vendor Lead types
export const insertVendorLeadSchema = createInsertSchema(vendorLeads).omit({
  id: true,
  respondedAt: true,
  responseTime: true,
  convertedAt: true,
  commissionAmount: true,
  commissionPaidAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendorLead = z.infer<typeof insertVendorLeadSchema>;
export type VendorLead = typeof vendorLeads.$inferSelect;

// Vendor Review types
export const insertVendorReviewSchema = createInsertSchema(vendorReviews).omit({
  id: true,
  vendorRespondedAt: true,
  helpfulVotes: true,
  unhelpfulVotes: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendorReview = z.infer<typeof insertVendorReviewSchema>;
export type VendorReview = typeof vendorReviews.$inferSelect;

// Vendor Analytics types
export const insertVendorAnalyticsSchema = createInsertSchema(vendorAnalytics).omit({
  id: true,
  createdAt: true,
});
export type InsertVendorAnalytics = z.infer<typeof insertVendorAnalyticsSchema>;
export type VendorAnalytics = typeof vendorAnalytics.$inferSelect;

// Family Connect Tables
export const familyGroups = pgTable('family_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  primaryUserId: integer('primary_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  inviteCode: text('invite_code').unique(),
});

export const familyMembers = pgTable('family_members', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => familyGroups.id).notNull(),
  userId: integer('user_id').references(() => users.id),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('member'), // admin, member
  status: text('status').notNull().default('pending'), // pending, active
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  joinedAt: timestamp('joined_at'),
});

export const familyMessages = pgTable('family_messages', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => familyGroups.id).notNull(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  attachments: jsonb('attachments').$type<Array<{url: string; name: string; type: string}>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  editedAt: timestamp('edited_at'),
});

export const familyNotes = pgTable('family_notes', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => familyGroups.id).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  communityId: integer('community_id').references(() => communities.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const familyTasks = pgTable('family_tasks', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => familyGroups.id).notNull(),
  assignedTo: integer('assigned_to').references(() => users.id),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  status: text('status').notNull().default('pending'), // pending, in_progress, completed
  priority: text('priority').notNull().default('medium'), // low, medium, high
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Insert schemas for Family Connect
export const insertFamilyGroupSchema = createInsertSchema(familyGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFamilyGroup = z.infer<typeof insertFamilyGroupSchema>;
export type FamilyGroup = typeof familyGroups.$inferSelect;

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  invitedAt: true,
  joinedAt: true,
});
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export const insertFamilyMessageSchema = createInsertSchema(familyMessages).omit({
  id: true,
  createdAt: true,
  editedAt: true,
});
export type InsertFamilyMessage = z.infer<typeof insertFamilyMessageSchema>;
export type FamilyMessage = typeof familyMessages.$inferSelect;

export const insertFamilyNoteSchema = createInsertSchema(familyNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFamilyNote = z.infer<typeof insertFamilyNoteSchema>;
export type FamilyNote = typeof familyNotes.$inferSelect;

export const insertFamilyTaskSchema = createInsertSchema(familyTasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});
export type InsertFamilyTask = z.infer<typeof insertFamilyTaskSchema>;
export type FamilyTask = typeof familyTasks.$inferSelect;

// ========== SERVICES MANAGEMENT SYSTEM ==========
// Service Categories and Products Management
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isPartner: boolean("is_partner").default(false),
  isActive: boolean("is_active").default(true),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  partnershipLevel: text("partnership_level", {
    enum: ["featured", "premium", "standard", "affiliate"]
  }).default("standard"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  providerId: integer("provider_id").references(() => serviceProviders.id),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  features: text("features").array().default([]),
  pricing: json("pricing").$type<{
    type: 'fixed' | 'range' | 'variable' | 'quote';
    amount?: number;
    min?: number;
    max?: number;
    currency: string;
    unit?: string;
    description?: string;
  }>(),
  serviceType: text("service_type", {
    enum: ["product", "service", "consultation", "subscription", "one-time"]
  }).notNull(),
  deliveryMethod: text("delivery_method", {
    enum: ["in-person", "online", "phone", "mail", "pickup", "delivery"]
  }).array().default([]),
  availability: json("availability").$type<{
    schedule?: string;
    regions?: string[];
    restrictions?: string[];
  }>(),
  externalUrl: text("external_url"),
  affiliateCode: text("affiliate_code"),
  productId: text("product_id"), // For tracking Amazon or other external products
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  metadata: json("metadata").$type<{
    aiGenerated?: boolean;
    source?: string;
    lastUpdated?: string;
    tags?: string[];
    asin?: string; // Store Amazon ASIN for rebuilding links
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceAnalytics = pgTable("service_analytics", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id),
  providerId: integer("provider_id").references(() => serviceProviders.id),
  date: date("date").notNull(),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: numeric("revenue", { precision: 10, scale: 2 }).default('0'),
  impressions: integer("impressions").default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceClicks = pgTable("service_clicks", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id),
  userId: varchar("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

// Service Relations
export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ many }) => ({
  services: many(services),
  analytics: many(serviceAnalytics),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  provider: one(serviceProviders, {
    fields: [services.providerId],
    references: [serviceProviders.id],
  }),
  analytics: many(serviceAnalytics),
  clicks: many(serviceClicks),
}));

// Chat/Messaging system tables
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "direct", "community_inquiry", "group"
  subject: text("subject"),
  communityId: integer("community_id").references(() => communities.id),
  metadata: jsonb("metadata"), // Store additional info like tour dates, etc
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("member"), // "member", "admin", "community_rep"
  unreadCount: integer("unread_count").default(0),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
}, (table) => ({
  uniqueParticipant: unique().on(table.conversationId, table.userId),
}));

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // "text", "system", "tour_info", "community_info"
  metadata: jsonb("metadata"), // Store attachments, links, etc
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace vendor tables (renamed to avoid conflict with service vendors)
export const marketplaceCategories = pgTable("marketplace_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceVendors = pgTable("marketplace_vendors", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => marketplaceCategories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  logoUrl: text("logo_url"),
  externalUrl: text("external_url").notNull(),
  linkType: text("link_type").default("standard"), // standard, affiliate, paid_placement
  trackingCode: text("tracking_code"), // For future affiliate tracking
  isFeatured: boolean("is_featured").default(false),
  isHidden: boolean("is_hidden").default(false),
  displayOrder: integer("display_order").default(0),
  metadata: jsonb("metadata"), // Additional vendor-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceVendorClicks = pgTable("marketplace_vendor_clicks", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => marketplaceVendors.id),
  userId: text("user_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

// Relations for chat messaging
export const chatConversationsRelations = relations(chatConversations, ({ many, one }) => ({
  participants: many(chatParticipants),
  messages: many(chatMessages),
  community: one(communities, {
    fields: [chatConversations.communityId],
    references: [communities.id],
  }),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatParticipants.conversationId],
    references: [chatConversations.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// Relations for marketplace vendors
export const marketplaceCategoriesRelations = relations(marketplaceCategories, ({ many }) => ({
  vendors: many(marketplaceVendors),
}));

export const marketplaceVendorsRelations = relations(marketplaceVendors, ({ one, many }) => ({
  category: one(marketplaceCategories, {
    fields: [marketplaceVendors.categoryId],
    references: [marketplaceCategories.id],
  }),
  clicks: many(marketplaceVendorClicks),
}));

export const marketplaceVendorClicksRelations = relations(marketplaceVendorClicks, ({ one }) => ({
  vendor: one(marketplaceVendors, {
    fields: [marketplaceVendorClicks.vendorId],
    references: [marketplaceVendors.id],
  }),
}));

// Insert schemas for services management
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Insert schemas for chat messaging
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  id: true,
  joinedAt: true,
});
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Insert schemas for marketplace vendors
export const insertMarketplaceCategorySchema = createInsertSchema(marketplaceCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMarketplaceCategory = z.infer<typeof insertMarketplaceCategorySchema>;
export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;

export const insertMarketplaceVendorSchema = createInsertSchema(marketplaceVendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMarketplaceVendor = z.infer<typeof insertMarketplaceVendorSchema>;
export type MarketplaceVendor = typeof marketplaceVendors.$inferSelect;

export const insertMarketplaceVendorClickSchema = createInsertSchema(marketplaceVendorClicks).omit({
  id: true,
  clickedAt: true,
});
export type InsertMarketplaceVendorClick = z.infer<typeof insertMarketplaceVendorClickSchema>;
export type MarketplaceVendorClick = typeof marketplaceVendorClicks.$inferSelect;
