import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, date, varchar, real } from "drizzle-orm/pg-core";
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

// User Sessions for tracking login state
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const communitiesRelations = relations(communities, ({ many }) => ({
  inspections: many(inspections),
  reviews: many(reviews),
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
  favorites: many(favorites),
  searchHistory: many(searchHistory),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  tours: many(tours),
  sessions: many(userSessions),
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
export type UserSession = typeof userSessions.$inferSelect;
export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type SearchCommunity = z.infer<typeof searchCommunitySchema>;
