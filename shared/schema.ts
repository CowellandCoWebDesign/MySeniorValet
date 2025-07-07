import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, jsonb, date, varchar, real, numeric, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  relationshipToCare: text("relationship_to_care", {
    enum: ["Seeking for Self", "Seeking for Parent", "Seeking for Spouse", "Seeking for Other Family", "Healthcare Professional"]
  }),
  careNeeds: text("care_needs").array().default([]), // ['Independent Living', 'Assisted Living', 'Memory Care']
  searchPreferences: json("search_preferences").$type<{
    preferredLocation?: string;
    budgetRange?: { min: number; max: number };
    preferredAmenities?: string[];
    mustHaveFeatures?: string[];
    dealBreakers?: string[];
  }>().default({}),
  notifications: json("notifications").$type<{
    emailNotifications: boolean;
    smsNotifications: boolean;
    newListings: boolean;
    priceAlerts: boolean;
    messageAlerts: boolean;
    reviewReminders: boolean;
  }>().default({
    emailNotifications: true,
    smsNotifications: false,
    newListings: false,
    priceAlerts: false,
    messageAlerts: true,
    reviewReminders: false,
  }),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions table for secure session management
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  userId: integer("user_id").references(() => users.id),
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

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  description: text("description"),
  careTypes: text("care_types").array().notNull(), // ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing']
  amenities: text("amenities").array().default([]),
  services: text("services").array().default([]), // ['24/7 Nursing', 'Physical Therapy', 'Transportation', 'Meal Service']
  careServices: text("care_services").array().default([]), // ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing']
  medicalRestrictions: text("medical_restrictions").array().default([]), // ['No Insulin Patients', 'No Dialysis', 'No Ventilators']
  photos: text("photos").array().default([]), // Array of photo URLs
  virtualTourUrl: text("virtual_tour_url"),
  
  // Detailed Services & Amenities
  spaServices: text("spa_services").array().default([]), // ['Massage Therapy', 'Aromatherapy', 'Facials', 'Manicure/Pedicure']
  healthcareServices: text("healthcare_services").array().default([]), // ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Hospice Care Available']
  fitnessServices: text("fitness_services").array().default([]), // ['Personal Training', 'Water Aerobics', 'Yoga Classes', 'Strength Training']
  diningServices: text("dining_services").array().default([]), // ['Chef-Prepared Meals', 'Special Diets', '24/7 Room Service', 'Private Dining']
  transportationServices: text("transportation_services").array().default([]), // ['Medical Appointments', 'Shopping Trips', 'Airport Shuttle', 'Local Errands']
  socialServices: text("social_services").array().default([]), // ['Activity Director', 'Support Groups', 'Family Counseling', 'Spiritual Care']
  
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
  availabilityStatus: text("availability_status", { enum: ["Available Now", "Waitlist", "Full", "Contact for Availability"] }).default("Contact for Availability"),
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
  googleReviewSnippets: json("google_review_snippets").$type<Array<{
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
  licenseNumber: text("license_number"),
  licenseStatus: text("license_status"), // 'Licensed', 'Under Review', 'Expired'
  lastInspection: timestamp("last_inspection"),
  violations: integer("violations").default(0),
  isVerified: boolean("is_verified").default(false),
  isClaimed: boolean("is_claimed").default(false),
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
});

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

// Tours/Visits Scheduling
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
  notes: text("notes"), // Internal notes for community staff
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  userId: integer("user_id").references(() => users.id), // Can be null for system actions
  adminId: integer("admin_id").references(() => adminUsers.id), // For admin actions
  action: varchar("action", { length: 255 }).notNull(), // e.g., "user_created", "community_updated", "flag_resolved"
  resourceType: varchar("resource_type", { length: 100 }).notNull(), // e.g., "user", "community", "flag", "system"
  resourceId: varchar("resource_id", { length: 255 }), // ID of the affected resource
  details: jsonb("details").$type<{
    previousValues?: any;
    newValues?: any;
    reason?: string;
    additionalInfo?: any;
  }>(), // Additional action details
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 255 }),
  severity: varchar("severity", {
    enum: ["Low", "Medium", "High", "Critical"]
  }).notNull().default("Low"),
  outcome: varchar("outcome", {
    enum: ["Success", "Failure", "Partial"]
  }).notNull().default("Success"),
  createdAt: timestamp("created_at").defaultNow(),
  indexedAt: timestamp("indexed_at").defaultNow() // For search optimization
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  adminIdIdx: index("audit_logs_admin_id_idx").on(table.adminId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  resourceTypeIdx: index("audit_logs_resource_type_idx").on(table.resourceType),
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

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  dateOfBirth: true,
  relationshipToCare: true,
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
