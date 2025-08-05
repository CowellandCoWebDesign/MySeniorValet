import { pgTable, serial, integer, timestamp, text, boolean, decimal, json, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { communities, users } from "./schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Community Engagement Metrics - Comprehensive analytics tracking
export const communityEngagementMetrics = pgTable("community_engagement_metrics", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Time period tracking
  reportingPeriod: timestamp("reporting_period").notNull(), // Start of the period
  periodType: text("period_type", { enum: ["daily", "weekly", "monthly", "quarterly"] }).default("monthly"),
  
  // Core engagement metrics
  profileViews: integer("profile_views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  photoViews: integer("photo_views").default(0),
  videoViews: integer("video_views").default(0),
  virtualTourViews: integer("virtual_tour_views").default(0),
  brochureDownloads: integer("brochure_downloads").default(0),
  
  // Interaction metrics
  inquiries: integer("inquiries").default(0),
  tourRequests: integer("tour_requests").default(0),
  directMessages: integer("direct_messages").default(0),
  phoneCallClicks: integer("phone_call_clicks").default(0),
  websiteClicks: integer("website_clicks").default(0),
  directionsClicks: integer("directions_clicks").default(0),
  
  // Social and review metrics
  reviewsReceived: integer("reviews_received").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // 0.00 to 5.00
  reviewResponses: integer("review_responses").default(0),
  socialShares: integer("social_shares").default(0),
  favorites: integer("favorites").default(0),
  
  // Search and discovery metrics
  searchImpressions: integer("search_impressions").default(0),
  searchClicks: integer("search_clicks").default(0),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 4 }), // 0.0000 to 1.0000
  averageSearchPosition: decimal("average_search_position", { precision: 5, scale: 2 }),
  featuredImpressions: integer("featured_impressions").default(0),
  
  // Content engagement
  photoEngagementRate: decimal("photo_engagement_rate", { precision: 5, scale: 4 }),
  contentCompletionRate: decimal("content_completion_rate", { precision: 5, scale: 4 }),
  timeOnProfile: integer("time_on_profile"), // Seconds
  bounceRate: decimal("bounce_rate", { precision: 5, scale: 4 }),
  
  // Lead quality metrics
  qualifiedLeads: integer("qualified_leads").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }),
  leadScore: decimal("lead_score", { precision: 5, scale: 2 }), // 0-100 score
  responseTime: integer("response_time"), // Average response time in minutes
  
  // Competitive metrics
  marketShareRank: integer("market_share_rank"),
  categoryRank: integer("category_rank"),
  localCompetitorCount: integer("local_competitor_count"),
  
  // Performance tracking
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }), // 0-100 overall score
  trendDirection: text("trend_direction", { enum: ["increasing", "stable", "decreasing"] }),
  previousPeriodComparison: decimal("previous_period_comparison", { precision: 5, scale: 2 }), // Percentage change
  
  // Metadata
  dataQuality: decimal("data_quality", { precision: 3, scale: 2 }).default(1.00), // 0.00 to 1.00
  lastCalculated: timestamp("last_calculated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("engagement_metrics_community_idx").on(table.communityId),
  index("engagement_metrics_period_idx").on(table.reportingPeriod),
  index("engagement_metrics_score_idx").on(table.engagementScore),
  index("engagement_metrics_composite_idx").on(table.communityId, table.reportingPeriod),
]);

// User interaction tracking for detailed analytics
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // Can be null for anonymous users
  sessionId: text("session_id").notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Interaction details
  interactionType: text("interaction_type", {
    enum: [
      "profile_view", "photo_view", "video_view", "virtual_tour", "brochure_download",
      "inquiry", "tour_request", "phone_click", "website_click", "directions_click",
      "review_submission", "favorite_add", "favorite_remove", "social_share",
      "search_result_click", "featured_click", "map_view", "pricing_view"
    ]
  }).notNull(),
  
  // Context data
  sourceUrl: text("source_url"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  deviceType: text("device_type", { enum: ["desktop", "mobile", "tablet"] }),
  
  // Interaction metadata
  interactionValue: integer("interaction_value"), // For quantifiable interactions
  timeSpent: integer("time_spent"), // Seconds spent on interaction
  searchQuery: text("search_query"), // If came from search
  searchPosition: integer("search_position"), // Position in search results
  
  // Geographic data
  city: text("city"),
  state: text("state"),
  country: text("country").default("US"),
  
  // Performance data
  pageLoadTime: integer("page_load_time"), // Milliseconds
  responseTime: integer("response_time"), // For interactions requiring response
  
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("user_interactions_community_idx").on(table.communityId),
  index("user_interactions_type_idx").on(table.interactionType),
  index("user_interactions_timestamp_idx").on(table.timestamp),
  index("user_interactions_session_idx").on(table.sessionId),
]);

// Engagement scorecard configurations for different tiers
export const scorecardConfigurations = pgTable("scorecard_configurations", {
  id: serial("id").primaryKey(),
  subscriptionTier: text("subscription_tier", { 
    enum: ["verified", "standard", "featured", "platinum"] 
  }).notNull(),
  
  // Scorecard visibility settings
  showEngagementScore: boolean("show_engagement_score").default(true),
  showTrafficMetrics: boolean("show_traffic_metrics").default(true),
  showLeadMetrics: boolean("show_lead_metrics").default(false), // Premium tiers only
  showCompetitiveMetrics: boolean("show_competitive_metrics").default(false), // Platinum only
  showDetailedAnalytics: boolean("show_detailed_analytics").default(false), // Featured+ only
  
  // Data retention periods
  dataRetentionDays: integer("data_retention_days").default(90),
  historicalDataAccess: boolean("historical_data_access").default(false),
  
  // Report frequency
  reportFrequency: text("report_frequency", { 
    enum: ["daily", "weekly", "monthly"] 
  }).default("monthly"),
  autoReportsEnabled: boolean("auto_reports_enabled").default(false),
  
  // Alert thresholds
  lowEngagementThreshold: decimal("low_engagement_threshold", { precision: 5, scale: 2 }).default(25.00),
  highEngagementThreshold: decimal("high_engagement_threshold", { precision: 5, scale: 2 }).default(75.00),
  alertsEnabled: boolean("alerts_enabled").default(true),
  
  // Customization options
  customMetrics: json("custom_metrics").$type<Array<{
    name: string;
    description: string;
    formula: string;
    enabled: boolean;
  }>>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Engagement alerts and notifications
export const engagementAlerts = pgTable("engagement_alerts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Alert details
  alertType: text("alert_type", {
    enum: [
      "low_engagement", "high_engagement", "traffic_spike", "lead_increase",
      "review_received", "ranking_change", "competitor_alert", "goal_achieved"
    ]
  }).notNull(),
  
  alertSeverity: text("alert_severity", { 
    enum: ["info", "warning", "critical"] 
  }).default("info"),
  
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Alert data
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  previousValue: decimal("previous_value", { precision: 10, scale: 2 }),
  thresholdValue: decimal("threshold_value", { precision: 10, scale: 2 }),
  changePercentage: decimal("change_percentage", { precision: 5, scale: 2 }),
  
  // Status tracking
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  readAt: timestamp("read_at"),
  resolvedAt: timestamp("resolved_at"),
  
  // Notification tracking
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  inAppNotified: boolean("in_app_notified").default(false),
  
  metadata: json("metadata").$type<{
    relatedMetrics?: string[];
    actionSuggestions?: string[];
    reportUrl?: string;
    dashboardUrl?: string;
  }>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("engagement_alerts_community_idx").on(table.communityId),
  index("engagement_alerts_type_idx").on(table.alertType),
  index("engagement_alerts_severity_idx").on(table.alertSeverity),
  index("engagement_alerts_unread_idx").on(table.isRead),
]);

// Relations
export const communityEngagementMetricsRelations = relations(communityEngagementMetrics, ({ one }) => ({
  community: one(communities, {
    fields: [communityEngagementMetrics.communityId],
    references: [communities.id],
  }),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  community: one(communities, {
    fields: [userInteractions.communityId],
    references: [communities.id],
  }),
}));

export const engagementAlertsRelations = relations(engagementAlerts, ({ one }) => ({
  community: one(communities, {
    fields: [engagementAlerts.communityId],
    references: [communities.id],
  }),
}));

// Zod schemas for validation
export const insertCommunityEngagementMetricsSchema = createInsertSchema(communityEngagementMetrics);
export const insertUserInteractionSchema = createInsertSchema(userInteractions);
export const insertScorecardConfigurationSchema = createInsertSchema(scorecardConfigurations);
export const insertEngagementAlertSchema = createInsertSchema(engagementAlerts);

// TypeScript types
export type CommunityEngagementMetrics = typeof communityEngagementMetrics.$inferSelect;
export type InsertCommunityEngagementMetrics = typeof communityEngagementMetrics.$inferInsert;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = typeof userInteractions.$inferInsert;
export type ScorecardConfiguration = typeof scorecardConfigurations.$inferSelect;
export type InsertScorecardConfiguration = typeof scorecardConfigurations.$inferInsert;
export type EngagementAlert = typeof engagementAlerts.$inferSelect;
export type InsertEngagementAlert = typeof engagementAlerts.$inferInsert;

// Engagement score calculation interface
export interface EngagementScoreBreakdown {
  totalScore: number;
  components: {
    trafficScore: number;
    interactionScore: number;
    contentScore: number;
    leadQualityScore: number;
    responseScore: number;
  };
  trends: {
    weekOverWeek: number;
    monthOverMonth: number;
    quarterOverQuarter: number;
  };
  recommendations: string[];
  benchmarks: {
    industryAverage: number;
    topPercentile: number;
    peerComparison: number;
  };
}