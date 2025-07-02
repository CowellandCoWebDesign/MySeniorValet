import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
  }>().default({}),
  availabilityStatus: text("availability_status", { enum: ["Available Now", "Waitlist", "Full", "Contact for Availability"] }).default("Contact for Availability"),
  availableUnits: integer("available_units"),
  totalUnits: integer("total_units"),
  unitTypes: json("unit_types").$type<Array<{
    type: string; // 'Studio', '1BR', '2BR'
    available: number;
    priceRange: { min: number; max: number };
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
export type SearchCommunity = z.infer<typeof searchCommunitySchema>;
