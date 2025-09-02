import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, jsonb, date, varchar, real, numeric, index, customType, unique, time } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PostGIS geography point type for efficient spatial queries
const geographyPoint = customType<{ data: { lat: number; lng: number } }>({
  dataType() {
    return 'geography(Point,4326)';
  },
});

// Educational Resources table for senior care guides and information
export const educationalResources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  category: text("category").notNull(), // 'Medicare', 'Long-Term Care', 'Legal', 'Financial', 'Health', 'Caregiving'
  subcategory: text("subcategory"),
  content_type: text("content_type").notNull(), // 'article', 'guide', 'checklist', 'video', 'infographic', 'ebook'
  description: text("description").notNull(),
  content: text("content"), // Full article content in markdown
  summary: text("summary"), // Brief summary
  author: text("author"),
  source: text("source"), // Original source if external
  source_url: text("source_url"),
  difficulty_level: text("difficulty_level"), // 'beginner', 'intermediate', 'advanced'
  reading_time: integer("reading_time"), // Estimated reading time in minutes
  tags: text("tags").array().default([]),
  featured_image: text("featured_image"),
  related_resources: integer("related_resources").array().default([]), // IDs of related resources
  external_links: jsonb("external_links").$type<{url: string; title: string; description: string}[]>().default([]),
  is_featured: boolean("is_featured").default(false),
  is_active: boolean("is_active").default(true),
  view_count: integer("view_count").default(0),
  helpful_count: integer("helpful_count").default(0),
  share_count: integer("share_count").default(0),
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  published_at: timestamp("published_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_educational_resources_category").on(table.category),
  index("idx_educational_resources_slug").on(table.slug),
  index("idx_educational_resources_featured").on(table.is_featured),
]);

export const insertEducationalResourceSchema = createInsertSchema(educationalResources)
  .omit({ id: true, created_at: true, updated_at: true });
export type InsertEducationalResource = z.infer<typeof insertEducationalResourceSchema>;
export type SelectEducationalResource = typeof educationalResources.$inferSelect;

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
  id: serial("id").primaryKey(), // Using integer to match actual database
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Legacy fields for existing functionality
  username: text("username").unique(),
  password: text("password"),
  phone: text("phone"),
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
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
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
  dashboardPreferences: json("dashboard_preferences").$type<{
    layoutType: 'simple' | 'detailed' | 'visual';
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    highContrast: boolean;
    reducedMotion: boolean;
    cardSize: 'compact' | 'comfortable' | 'spacious';
    showHelpTips: boolean;
    quickActions: string[];
    dashboardSections: {
      favorites: { visible: boolean; order: number };
      recentSearches: { visible: boolean; order: number };
      recommendations: { visible: boolean; order: number };
      savedCommunities: { visible: boolean; order: number };
      tourSchedule: { visible: boolean; order: number };
      familyNotes: { visible: boolean; order: number };
    };
  }>().default({
    layoutType: 'detailed',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    cardSize: 'comfortable',
    showHelpTips: true,
    quickActions: ['search', 'favorites', 'schedule-tour', 'family-share'],
    dashboardSections: {
      favorites: { visible: true, order: 1 },
      recentSearches: { visible: true, order: 2 },
      recommendations: { visible: true, order: 3 },
      savedCommunities: { visible: true, order: 4 },
      tourSchedule: { visible: true, order: 5 },
      familyNotes: { visible: true, order: 6 }
    }
  }),
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

// Messaging type exports (removed duplicates - defined later in file)

// Family collaboration type exports
export type FamilyPoll = typeof familyPolls.$inferSelect;
export type InsertFamilyPoll = typeof familyPolls.$inferInsert;
export type FamilyPollVote = typeof familyPollVotes.$inferSelect;
export type InsertFamilyPollVote = typeof familyPollVotes.$inferInsert;
export type FamilyDecision = typeof familyDecisions.$inferSelect;
export type InsertFamilyDecision = typeof familyDecisions.$inferInsert;
export type TourConversation = typeof tourConversations.$inferSelect;
export type InsertTourConversation = typeof tourConversations.$inferInsert;

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

// TourMate™ Tours Table - For scheduling and managing community tours
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }).notNull(),
  
  // Tour Details
  preferredDate: date("preferred_date").notNull(),
  preferredTime: text("preferred_time", { 
    enum: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"] 
  }).notNull(),
  alternativeDate: date("alternative_date"),
  alternativeTime: text("alternative_time"),
  
  // Contact Information
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  
  // Tour Preferences
  tourType: text("tour_type", { 
    enum: ["in-person", "virtual", "self-guided"] 
  }).default("in-person"),
  partySize: integer("party_size").default(1),
  specialRequests: text("special_requests"),
  interestedInCareLevel: text("interested_in_care_level").array(),
  
  // Tour Status
  status: text("status", { 
    enum: ["pending", "confirmed", "rescheduled", "completed", "cancelled", "no-show"] 
  }).default("pending"),
  confirmedDate: date("confirmed_date"),
  confirmedTime: text("confirmed_time"),
  confirmationCode: text("confirmation_code"),
  
  // Community Response
  communityResponse: text("community_response"),
  communityNotes: text("community_notes"),
  assignedRepId: varchar("assigned_rep_id").references(() => users.id),
  assignedRepName: text("assigned_rep_name"),
  
  // Follow-up & Feedback
  tourCompleted: boolean("tour_completed").default(false),
  tourRating: integer("tour_rating"), // 1-5 stars
  tourFeedback: text("tour_feedback"),
  followUpScheduled: boolean("follow_up_scheduled").default(false),
  followUpDate: date("follow_up_date"),
  
  // Integration with TourTracker™
  tourTrackerLinked: boolean("tour_tracker_linked").default(false),
  tourTrackerScore: integer("tour_tracker_score"), // 1-100 comprehensive score
  
  // Metadata
  source: text("source", { 
    enum: ["website", "mobile", "phone", "email", "partner"] 
  }).default("website"),
  referralSource: text("referral_source"),
  utmParams: jsonb("utm_params").$type<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("tours_user_id_idx").on(table.userId),
  index("tours_community_id_idx").on(table.communityId),
  index("tours_status_idx").on(table.status),
  index("tours_preferred_date_idx").on(table.preferredDate),
  index("tours_created_at_idx").on(table.createdAt),
]);

// Tour Availability Slots - Communities set their available tour times
export const tourAvailability = pgTable("tour_availability", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }).notNull(),
  
  // Availability Settings
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  slotDuration: integer("slot_duration").default(60), // minutes
  maxToursPerSlot: integer("max_tours_per_slot").default(1),
  
  // Blackout Dates
  blackoutDates: date("blackout_dates").array().default([]),
  
  // Special Hours
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from"),
  effectiveUntil: date("effective_until"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("tour_availability_community_id_idx").on(table.communityId),
  index("tour_availability_day_of_week_idx").on(table.dayOfWeek),
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

// Legal Document Version Control System
export const legalDocumentVersions = pgTable("legal_document_versions", {
  id: serial("id").primaryKey(),
  documentType: varchar("document_type", { enum: ["terms", "privacy", "cookie"] }).notNull(),
  version: varchar("version").notNull(), // e.g., "2.1", "3.0"
  title: varchar("title").notNull(),
  content: text("content").notNull(), // Full document content
  contentHash: varchar("content_hash").notNull(), // SHA-256 hash for integrity
  effectiveDate: timestamp("effective_date").notNull(),
  publishedDate: timestamp("published_date"),
  status: varchar("status", { enum: ["draft", "review", "approved", "active", "superseded", "archived"] }).default("draft"),
  changes: json("changes").$type<string[]>().default([]), // List of changes made
  authorId: varchar("author_id").references(() => users.id).notNull(),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  reviewDate: timestamp("review_date"),
  approvalDate: timestamp("approval_date"),
  complianceNotes: json("compliance_notes").$type<string[]>().default([]),
  regulatoryRequirements: json("regulatory_requirements").$type<{
    gdpr?: boolean;
    ccpa?: boolean;
    pipeda?: boolean; // Canada
    stateSpecific?: string[]; // State-specific requirements
    industryStandards?: string[];
  }>().default({}),
  metadata: json("metadata").$type<{
    fileSize?: number;
    wordCount?: number;
    sections?: string[];
    lastModified?: string;
    template?: string;
  }>().default({}),
  supersededVersionId: integer("superseded_version_id").references(() => legalDocumentVersions.id),
  isActive: boolean("is_active").default(false),
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("legal_document_versions_document_type_idx").on(table.documentType),
  index("legal_document_versions_status_idx").on(table.status),
  index("legal_document_versions_effective_date_idx").on(table.effectiveDate),
  index("legal_document_versions_is_active_idx").on(table.isActive),
]);

// Legal Document Audit Trail
export const legalDocumentAuditTrail = pgTable("legal_document_audit_trail", {
  id: serial("id").primaryKey(),
  documentVersionId: integer("document_version_id").references(() => legalDocumentVersions.id).notNull(),
  documentType: varchar("document_type", { enum: ["terms", "privacy", "cookie"] }).notNull(),
  version: varchar("version").notNull(),
  action: varchar("action", { 
    enum: ["created", "updated", "reviewed", "approved", "published", "superseded", "archived", "viewed", "downloaded", "accessed", "printed"] 
  }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  userName: varchar("user_name"),
  userRole: varchar("user_role"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  details: text("details"), // Additional context about the action
  severity: varchar("severity", { enum: ["info", "warning", "critical"] }).default("info"),
  location: varchar("location"), // Geographic location if available
  deviceInfo: json("device_info").$type<{
    browser?: string;
    os?: string;
    device?: string;
    mobile?: boolean;
  }>(),
  referrer: varchar("referrer"), // How they accessed the document
  previousVersion: varchar("previous_version"),
  changesSummary: json("changes_summary").$type<{
    added?: string[];
    modified?: string[];
    removed?: string[];
    sections?: string[];
  }>(),
  complianceFlags: json("compliance_flags").$type<{
    requiresReview?: boolean;
    breakingChange?: boolean;
    regulatoryImpact?: string[];
    notificationRequired?: boolean;
  }>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("legal_document_audit_trail_document_type_idx").on(table.documentType),
  index("legal_document_audit_trail_action_idx").on(table.action),
  index("legal_document_audit_trail_timestamp_idx").on(table.timestamp),
  index("legal_document_audit_trail_user_id_idx").on(table.userId),
  index("legal_document_audit_trail_severity_idx").on(table.severity),
]);

// Family Groups for collaboration
export const familyGroups = pgTable("family_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  members: json("members").$type<{
    userId: string;
    role: "owner" | "admin" | "member" | "viewer";
    relationship?: string;
    permissions: {
      canMessage: boolean;
      canInvite: boolean;
      canRemove: boolean;
      canViewAll: boolean;
      canEditNotes: boolean;
    };
    joinedAt: string;
    invitedBy?: string;
  }[]>().notNull(),
  sharedCommunities: integer("shared_communities").array().default([]),
  sharedNotes: json("shared_notes").$type<{
    id: string;
    authorId: string;
    content: string;
    communityId?: number;
    createdAt: string;
    updatedAt?: string;
    tags?: string[];
  }[]>().default([]),
  sharedDocuments: json("shared_documents").$type<{
    id: string;
    name: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
    type: string;
    size: number;
  }[]>().default([]),
  settings: json("settings").$type<{
    allowJoinRequests?: boolean;
    requireApproval?: boolean;
    shareLocation?: boolean;
    shareCalendar?: boolean;
    notifyOnActivity?: boolean;
  }>().default({}),
  inviteCode: text("invite_code").unique(),
  inviteCodeExpiry: timestamp("invite_code_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("family_groups_owner_id_idx").on(table.ownerId),
  index("family_groups_invite_code_idx").on(table.inviteCode),
]);

// Conversations table for organizing messages
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: varchar("type", { enum: ["user_to_community", "user_to_user", "family_group", "community_broadcast"] }).notNull(),
  title: text("title"),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }),
  participants: json("participants").$type<{
    userId: string;
    role: "owner" | "member" | "admin" | "community_rep";
    joinedAt: string;
    lastSeenAt?: string;
    notifications: boolean;
  }[]>().notNull(),
  familyGroupId: integer("family_group_id").references(() => familyGroups.id),
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"),
  unreadCounts: json("unread_counts").$type<Record<string, number>>().default({}),
  settings: json("settings").$type<{
    muted?: boolean;
    archived?: boolean;
    pinned?: boolean;
    autoTranslate?: boolean;
    allowAttachments?: boolean;
  }>().default({}),
  metadata: json("metadata").$type<{
    subject?: string;
    tags?: string[];
    priority?: "low" | "normal" | "high" | "urgent";
    communityContact?: string;
    departmentName?: string;
  }>().default({}),
  status: varchar("status", { enum: ["active", "archived", "closed"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("conversations_type_idx").on(table.type),
  index("conversations_community_id_idx").on(table.communityId),
  index("conversations_family_group_id_idx").on(table.familyGroupId),
  index("conversations_last_message_at_idx").on(table.lastMessageAt),
  index("conversations_status_idx").on(table.status),
]);

// Messages table for real-time communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  senderType: varchar("sender_type", { enum: ["user", "community"] }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { 
    enum: ["text", "image", "file", "system", "tour_completed", "deposit_made", "application_started", "unit_reserved", "move_in_completed", "tour_reference"] 
  }).default("text"),
  attachments: json("attachments").$type<{
    url: string;
    name: string;
    type: string;
    size: number;
  }[]>().default([]),
  readBy: json("read_by").$type<{
    userId: string;
    readAt: string;
  }[]>().default([]),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  metadata: json("metadata").$type<{
    replyTo?: number;
    forwarded?: boolean;
    urgent?: boolean;
    aiTranslated?: boolean;
    originalLanguage?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("messages_conversation_id_idx").on(table.conversationId),
  index("messages_sender_id_idx").on(table.senderId),
  index("messages_created_at_idx").on(table.createdAt),
]);

// Message Templates for communities
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  category: varchar("category", { 
    enum: ["welcome", "tour_confirmation", "pricing", "availability", "follow_up", "general"] 
  }).notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  variables: json("variables").$type<string[]>().default([]), // ["{user_name}", "{tour_date}", "{community_name}"]
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("message_templates_community_id_idx").on(table.communityId),
  index("message_templates_category_idx").on(table.category),
]);

// Notification Preferences for messaging
export const messagingNotifications = pgTable("messaging_notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  notificationType: varchar("notification_type", { 
    enum: ["email", "sms", "push", "in_app"] 
  }).notNull(),
  enabled: boolean("enabled").default(true),
  frequency: varchar("frequency", { 
    enum: ["instant", "hourly", "daily", "weekly", "never"] 
  }).default("instant"),
  quietHoursStart: text("quiet_hours_start"), // "22:00"
  quietHoursEnd: text("quiet_hours_end"), // "08:00"
  preferences: json("preferences").$type<{
    newMessage?: boolean;
    mentionOnly?: boolean;
    urgentOnly?: boolean;
    familyActivity?: boolean;
    communityUpdates?: boolean;
    tourReminders?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("messaging_notifications_user_id_idx").on(table.userId),
  index("messaging_notifications_conversation_id_idx").on(table.conversationId),
]);

// Family Polls/Voting system for collaborative decision-making
export const familyPolls = pgTable("family_polls", {
  id: serial("id").primaryKey(),
  familyGroupId: integer("family_group_id").references(() => familyGroups.id, { onDelete: "cascade" }).notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  tourId: integer("tour_id").references(() => tours.id), // Optional link to tour
  communityId: integer("community_id").references(() => communities.id), // Optional link to community
  
  // Poll Details
  pollType: varchar("poll_type", { 
    enum: ["tour_decision", "community_preference", "schedule_preference", "care_level", "budget_range", "general"] 
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Options & Settings
  options: json("options").$type<{
    id: string;
    text: string;
    description?: string;
    metadata?: {
      tourDate?: string;
      communityName?: string;
      price?: number;
      careLevel?: string;
    };
  }[]>().notNull(),
  
  allowMultipleChoices: boolean("allow_multiple_choices").default(false),
  anonymousVoting: boolean("anonymous_voting").default(false),
  requireAllVotes: boolean("require_all_votes").default(false),
  showResultsRealtime: boolean("show_results_realtime").default(true),
  
  // Timing
  expiresAt: timestamp("expires_at"),
  status: varchar("status", { 
    enum: ["active", "closed", "cancelled", "decided"] 
  }).default("active"),
  
  // Results
  winningOptionId: text("winning_option_id"),
  finalDecision: text("final_decision"),
  decisionNotes: text("decision_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("family_polls_family_group_id_idx").on(table.familyGroupId),
  index("family_polls_tour_id_idx").on(table.tourId),
  index("family_polls_community_id_idx").on(table.communityId),
  index("family_polls_status_idx").on(table.status),
]);

// Individual votes in family polls
export const familyPollVotes = pgTable("family_poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").references(() => familyPolls.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Vote Details
  selectedOptions: json("selected_options").$type<string[]>().notNull(), // Array of option IDs
  comment: text("comment"),
  voteWeight: integer("vote_weight").default(1), // For weighted voting (e.g., primary decision maker)
  
  // Metadata
  votedAt: timestamp("voted_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
}, (table) => [
  index("family_poll_votes_poll_id_idx").on(table.pollId),
  index("family_poll_votes_user_id_idx").on(table.userId),
  // Ensure one vote per user per poll
  unique("unique_user_poll_vote").on(table.pollId, table.userId),
]);

// Family Decision History for tracking collaborative decisions
export const familyDecisions = pgTable("family_decisions", {
  id: serial("id").primaryKey(),
  familyGroupId: integer("family_group_id").references(() => familyGroups.id, { onDelete: "cascade" }).notNull(),
  
  // Decision Context
  decisionType: varchar("decision_type", { 
    enum: ["community_selection", "tour_schedule", "care_level", "budget", "move_in_date", "amenities", "location", "other"] 
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Related Entities
  communityIds: integer("community_ids").array().default([]),
  tourIds: integer("tour_ids").array().default([]),
  pollId: integer("poll_id").references(() => familyPolls.id),
  
  // Decision Details
  decision: text("decision").notNull(),
  rationale: text("rationale"),
  consensus: boolean("consensus").default(false),
  
  // Participants & Agreement
  participants: json("participants").$type<{
    userId: string;
    agreed: boolean;
    notes?: string;
  }[]>().notNull(),
  
  // Timeline
  discussionStarted: timestamp("discussion_started"),
  decisionMade: timestamp("decision_made").defaultNow(),
  implementBy: timestamp("implement_by"),
  
  // Status
  status: varchar("status", { 
    enum: ["pending", "decided", "implemented", "revised", "cancelled"] 
  }).default("decided"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("family_decisions_family_group_id_idx").on(table.familyGroupId),
  index("family_decisions_poll_id_idx").on(table.pollId),
  index("family_decisions_status_idx").on(table.status),
]);

// Tour-Conversation Link table to connect tours with family discussions
export const tourConversations = pgTable("tour_conversations", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").references(() => tours.id, { onDelete: "cascade" }).notNull(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  familyGroupId: integer("family_group_id").references(() => familyGroups.id),
  
  // Link Type
  linkType: varchar("link_type", { 
    enum: ["planning", "discussion", "feedback", "follow_up"] 
  }).notNull(),
  
  // Metadata
  linkedBy: integer("linked_by").references(() => users.id),
  linkedAt: timestamp("linked_at").defaultNow(),
}, (table) => [
  index("tour_conversations_tour_id_idx").on(table.tourId),
  index("tour_conversations_conversation_id_idx").on(table.conversationId),
  index("tour_conversations_family_group_id_idx").on(table.familyGroupId),
  // Unique constraint to prevent duplicate links
  unique("unique_tour_conversation").on(table.tourId, table.conversationId),
]);

// User Consent Records for GDPR/CCPA compliance
export const userConsentRecords = pgTable("user_consent_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  consentType: varchar("consent_type", { 
    enum: ["cookie", "privacy_policy", "terms_of_service", "marketing", "analytics"] 
  }).notNull(),
  consentStatus: boolean("consent_status").notNull(), // true = granted, false = denied
  consentDetails: json("consent_details").$type<{
    essential?: boolean;
    analytics?: boolean;
    marketing?: boolean;
    personalization?: boolean;
    specificCookies?: string[];
    optOutMethods?: string[];
  }>(),
  legalBasis: varchar("legal_basis"), // GDPR legal basis (consent, legitimate interest, etc.)
  documentVersion: varchar("document_version"), // Version of document consented to
  jurisdiction: varchar("jurisdiction"), // User's jurisdiction (US-CA, EU, etc.)
  withdrawalDate: timestamp("withdrawal_date"), // When consent was withdrawn
  withdrawalMethod: varchar("withdrawal_method"), // How consent was withdrawn
  renewalDate: timestamp("renewal_date"), // When consent needs renewal
  isActive: boolean("is_active").default(true),
  metadata: json("metadata").$type<{
    pageUrl?: string;
    referrer?: string;
    campaignSource?: string;
    consentMethod?: string; // banner, form, settings page
  }>(),
  consentedAt: timestamp("consented_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_consent_records_user_id_idx").on(table.userId),
  index("user_consent_records_consent_type_idx").on(table.consentType),
  index("user_consent_records_consented_at_idx").on(table.consentedAt),
  index("user_consent_records_is_active_idx").on(table.isActive),
]);

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr"), // French name for bilingual communities
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").default("US"), // Country code: US, MX, CA, PE, CU, PR
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
  
  // 3D Tour & Matterport Integration (Featured tier and above) - TEMPORARILY DISABLED
  // matterportTourId: text("matterport_tour_id"), // Matterport unique tour ID
  // matterportTourUrl: text("matterport_tour_url"), // Direct embed URL for Matterport tour
  // tourProvider: text("tour_provider", { enum: ["matterport", "kuula", "panotour", "other"] }), // 3D tour provider
  // tourStatus: text("tour_status", { enum: ["active", "processing", "failed", "pending"] }).default("pending"),
  // tourPreviewImage: text("tour_preview_image"), // Preview thumbnail for the 3D tour
  // tourMetadata: json("tour_metadata").$type<{
  //   duration?: number; // Estimated tour time in minutes
  //   roomCount?: number; // Number of rooms/spaces in tour
  //   totalViews?: number; // Total tour views
  //   uploadedAt?: string; // When tour was uploaded
  //   uploadedBy?: string; // User who uploaded tour
  //   tourDescription?: string; // Description of tour content
  //   roomLabels?: string[]; // Labels for different rooms/areas
  //   features?: string[]; // Highlighted features in tour
  // }>().default({}),
  
  // Detailed Services & Amenities
  spaServices: text("spa_services").array().default([]), // ['Massage Therapy', 'Aromatherapy', 'Facials', 'Manicure/Pedicure']
  healthcareServices: text("healthcare_services").array().default([]), // ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Hospice Care Available']
  fitnessServices: text("fitness_services").array().default([]), // ['Personal Training', 'Water Aerobics', 'Yoga Classes', 'Strength Training']
  diningServices: text("dining_services").array().default([]), // ['Chef-Prepared Meals', 'Special Diets', '24/7 Room Service', 'Private Dining']
  transportationServices: text("transportation_services").array().default([]), // ['Medical Appointments', 'Shopping Trips', 'Airport Shuttle', 'Local Errands']
  socialServices: text("social_services").array().default([]), // ['Activity Director', 'Support Groups', 'Family Counseling', 'Spiritual Care']
  
  // Data source tracking for Golden Rule compliance
  data_source: text("data_source").default("Government Database"), // Source of community data for transparency
  
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
  enrichmentStatus: text("enrichment_status", { enum: ["pending", "in_progress", "completed", "failed"] }).default("pending"),
  enrichmentAttempts: integer("enrichment_attempts").default(0),
  lastEnrichmentAttempt: timestamp("last_enrichment_attempt"),
  enrichmentHistory: json("enrichment_history").$type<Array<{
    timestamp: string;
    source: string;
    fieldsUpdated: string[];
    protectedFieldsSkipped?: string[];
    error?: string;
  }>>().default([]),
  lastPhotoEnrichment: timestamp("last_photo_enrichment"),
  protectedFields: text("protected_fields").array().default([]), // Fields protected from overwrites after verification
  enrichmentSources: json("enrichment_sources").$type<Array<{
    source: string;
    timestamp: string;
    fieldsEnriched: string[];
    confidence?: number;
  }>>().default([]),
  
  // Performance optimization fields
  trendingScore: decimal("trending_score", { precision: 10, scale: 2 }).default("0"), // Pre-calculated trending score for fast sorting
  
  // Subscription and billing fields for communities
  subscriptionTier: text("subscription_tier", {
    enum: ["verified", "standard", "featured", "platinum"]
  }),
  stripeCustomerId: text("stripe_customer_id"),
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
  
  // Successful enrichment tracking
  lastSuccessfulEnrichment: timestamp("last_successful_enrichment"),
  
  // Field Verification Counts - Protect after multiple confirmations
  phoneVerificationCount: integer("phone_verification_count").default(0),
  emailVerificationCount: integer("email_verification_count").default(0),
  addressVerificationCount: integer("address_verification_count").default(0),
  websiteVerificationCount: integer("website_verification_count").default(0),
  licenseVerificationCount: integer("license_verification_count").default(0),
  contactVerificationCount: integer("contact_verification_count").default(0),
  
  // Protected Field Indicators - True means field is locked from overwrite
  phoneProtected: boolean("phone_protected").default(false),
  emailProtected: boolean("email_protected").default(false),
  addressProtected: boolean("address_protected").default(false),
  websiteProtected: boolean("website_protected").default(false),
  licenseProtected: boolean("license_protected").default(false),
  contactProtected: boolean("contact_protected").default(false),
  
  // Dynamic Content Tracking - Always update these fields
  lastPhotoUpdate: timestamp("last_photo_update"),
  lastAvailabilityCheck: timestamp("last_availability_check"),
  lastPromotionsUpdate: timestamp("last_promotions_update"),
  lastReviewsUpdate: timestamp("last_reviews_update"),
  
  
  // View-triggered Enrichment Tracking
  viewCount: integer("view_count").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  popularityScore: decimal("popularity_score", { precision: 10, scale: 2 }).default("0"),
  enrichmentPriority: integer("enrichment_priority").default(0), // Higher = more urgent to enrich
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

// Pricing Alerts Table - User-defined pricing alerts
export const pricingAlerts = pgTable("pricing_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  alertType: text("alert_type", { 
    enum: ["price_drop", "price_increase", "threshold", "availability"] 
  }).notNull(),
  threshold: integer("threshold"), // Price threshold for alerts
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  triggerCount: integer("trigger_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("pricing_alerts_user_idx").on(table.userId),
  index("pricing_alerts_community_idx").on(table.communityId)
]);

// Photo Validation Log Table - Track photo validation results
export const photoValidationLog = pgTable("photo_validation_log", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  isValid: boolean("is_valid").notNull(),
  validationError: text("validation_error"),
  source: text("source"),
  validatedAt: timestamp("validated_at").defaultNow().notNull(),
}, (table) => [
  index("photo_validation_community_idx").on(table.communityId),
  index("photo_validation_validated_idx").on(table.validatedAt)
]);

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

// Note: messages and messageTemplates tables are defined earlier in the schema

// TourMate™ Type Exports (removed duplicates - defined later in file)
export type TourAvailability = typeof tourAvailability.$inferSelect;
export type InsertTourAvailability = typeof tourAvailability.$inferInsert;

// Tour Feedback - Stores detailed feedback after tour completion
export const tourFeedback = pgTable("tour_feedback", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").references(() => tours.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  
  // Feedback fields
  overallImpression: text("overall_impression"),
  tourNotes: text("tour_notes"),
  pricingInfo: text("pricing_info"),
  staffNotes: text("staff_notes"),
  
  // Ratings
  overallRating: integer("overall_rating"), // 1-5
  wouldRecommend: boolean("would_recommend"),
  likelihood: text("likelihood", { 
    enum: ["very_likely", "likely", "neutral", "unlikely", "very_unlikely"] 
  }),
  
  // Data sharing preferences
  shareContactInfo: boolean("share_contact_info").default(true),
  shareNotes: boolean("share_notes").default(false),
  sharePricing: boolean("share_pricing").default(false),
  
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

// Emergency Contacts - Quick access emergency contact system
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  relationship: text("relationship"),
  phone: text("phone").notNull(),
  isPrimary: boolean("is_primary").default(false),
  contactType: text("contact_type", {
    enum: ["personal", "medical", "facility", "emergency_service"]
  }).default("personal"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("emergency_contacts_user_idx").on(table.userId),
  index("emergency_contacts_primary_idx").on(table.userId, table.isPrimary),
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
// Pricing History Tracking
export const pricingHistory = pgTable("pricing_history", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  priceType: text("price_type").notNull(), // 'base', 'assisted_living', 'memory_care', etc.
  priceAmount: decimal("price_amount", { precision: 10, scale: 2 }),
  priceMin: decimal("price_min", { precision: 10, scale: 2 }),
  priceMax: decimal("price_max", { precision: 10, scale: 2 }),
  effectiveDate: date("effective_date").notNull().default(sql`CURRENT_DATE`),
  endDate: date("end_date"), // NULL if current price
  source: text("source").notNull(), // 'HUD', 'community_reported', 'market_intel', 'verified_claim'
  verificationStatus: text("verification_status", {
    enum: ["unverified", "pending", "verified", "disputed"]
  }).default("unverified"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  metadata: jsonb("metadata").$type<{
    currency?: string;
    paymentTerms?: string;
    includesUtilities?: boolean;
    includesMeals?: boolean;
    [key: string]: any;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_pricing_history_community").on(table.communityId),
  index("idx_pricing_history_effective").on(table.effectiveDate),
  index("idx_pricing_history_source").on(table.source),
  index("idx_pricing_history_verification").on(table.verificationStatus),
]);

// Price Change Alerts
export const priceChangeAlerts = pgTable("price_change_alerts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: text("user_id").references(() => users.id),
  priceType: text("price_type"),
  oldPrice: decimal("old_price", { precision: 10, scale: 2 }),
  newPrice: decimal("new_price", { precision: 10, scale: 2 }),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }),
  changePercentage: decimal("change_percentage", { precision: 5, scale: 2 }),
  alertType: text("alert_type", {
    enum: ["price_change", "price_drop", "price_increase"]
  }).default("price_change"),
  alertSent: boolean("alert_sent").default(false),
  sentAt: timestamp("sent_at"),
  alertMethod: text("alert_method", {
    enum: ["email", "sms", "push", "in_app"]
  }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_price_alerts_community").on(table.communityId),
  index("idx_price_alerts_user").on(table.userId),
  index("idx_price_alerts_sent").on(table.alertSent),
]);

// Enhanced Verified Community Profiles
export const verifiedCommunityProfiles = pgTable("verified_community_profiles", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).unique().notNull(),
  claimId: integer("claim_id").references(() => communityClaims.id),
  
  // Verification Details
  verificationBadge: boolean("verification_badge").default(true),
  verificationTier: text("verification_tier", {
    enum: ["basic", "enhanced", "premium", "platinum"]
  }).default("basic"),
  verificationExpires: date("verification_expires"),
  
  // Enhanced Business Information
  businessHours: jsonb("business_hours").$type<{
    [day: string]: { open: string; close: string; closed?: boolean };
  }>().default({}),
  responseTimeHours: integer("response_time_hours"),
  responseRatePercent: integer("response_rate_percent"),
  
  // Direct Booking & Tours
  virtualTourUrl: text("virtual_tour_url"),
  bookingUrl: text("booking_url"),
  calendarLink: text("calendar_link"),
  tourSchedulingEnabled: boolean("tour_scheduling_enabled").default(false),
  instantTourBooking: boolean("instant_tour_booking").default(false),
  
  // Payment & Insurance
  acceptsMedicare: boolean("accepts_medicare"),
  acceptsMedicaid: boolean("accepts_medicaid"),
  acceptsVaBenefits: boolean("accepts_va_benefits"),
  acceptsPrivateInsurance: boolean("accepts_private_insurance"),
  insurancePartners: jsonb("insurance_partners").$type<string[]>().default([]),
  paymentOptions: jsonb("payment_options").$type<string[]>().default([]),
  
  // Transparency Features
  priceTransparencyEnabled: boolean("price_transparency_enabled").default(false),
  availabilityTransparencyEnabled: boolean("availability_transparency_enabled").default(false),
  staffRatiosPublic: boolean("staff_ratios_public").default(false),
  inspectionReportsPublic: boolean("inspection_reports_public").default(false),
  
  // Marketing Features
  specialOffers: jsonb("special_offers").$type<Array<{
    title: string;
    description: string;
    validUntil?: string;
    terms?: string;
  }>>().default([]),
  featuredAmenities: jsonb("featured_amenities").$type<string[]>().default([]),
  awardsCertifications: jsonb("awards_certifications").$type<Array<{
    name: string;
    issuer: string;
    year: number;
    imageUrl?: string;
  }>>().default([]),
  promotionalVideoUrl: text("promotional_video_url"),
  
  // Analytics Access
  analyticsEnabled: boolean("analytics_enabled").default(true),
  leadNotificationsEnabled: boolean("lead_notifications_enabled").default(true),
  competitorInsightsEnabled: boolean("competitor_insights_enabled").default(false),
  
  // Metadata
  lastUpdatedBy: text("last_updated_by"),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_verified_profiles_tier").on(table.verificationTier),
  index("idx_verified_profiles_expires").on(table.verificationExpires),
]);

// Verification Activity Log
export const verificationActivityLog = pgTable("verification_activity_log", {
  id: serial("id").primaryKey(),
  claimId: integer("claim_id").references(() => communityClaims.id),
  communityId: integer("community_id").references(() => communities.id),
  action: text("action").notNull(), // 'claim_submitted', 'email_sent', 'verified', etc.
  performedBy: text("performed_by"),
  performedByRole: text("performed_by_role", {
    enum: ["user", "admin", "system"]
  }),
  details: jsonb("details").$type<Record<string, any>>().default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_verification_log_claim").on(table.claimId),
  index("idx_verification_log_community").on(table.communityId),
  index("idx_verification_log_action").on(table.action),
  index("idx_verification_log_created").on(table.createdAt),
]);

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

// ============ ANALYTICS & INTELLIGENCE TABLES ============

// Market Intelligence Cache table for aggregated market data
export const marketIntelligenceCache = pgTable("market_intelligence_cache", {
  id: serial("id").primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  careLevel: varchar("care_level", { length: 50 }).notNull(), // 'Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing'
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }), // Percentage as decimal (e.g., 85.50 for 85.5%)
  lastUpdated: timestamp("last_updated").defaultNow(),
  dataSources: jsonb("data_sources").$type<{
    hudData?: boolean;
    stateReports?: boolean;
    aiVerified?: boolean;
    communityReported?: boolean;
    sources?: string[];
  }>().default({}),
  priceRange: jsonb("price_range").$type<{
    min: number;
    max: number;
    median: number;
    percentile25?: number;
    percentile75?: number;
  }>(),
  marketTrends: jsonb("market_trends").$type<{
    priceChange30Days?: number;
    priceChange90Days?: number;
    demandLevel?: 'high' | 'medium' | 'low';
    supplyLevel?: 'high' | 'medium' | 'low';
    competitorCount?: number;
  }>(),
  dataQuality: varchar("data_quality", { length: 20 }).default('estimated'), // 'verified', 'estimated', 'outdated'
  sampleSize: integer("sample_size"), // Number of communities in this aggregation
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("market_intelligence_location_idx").on(table.city, table.state),
  index("market_intelligence_care_level_idx").on(table.careLevel),
  index("market_intelligence_last_updated_idx").on(table.lastUpdated),
  unique("market_intelligence_unique_location_care").on(table.city, table.state, table.careLevel),
]);

// Search Intent Analysis table for tracking user search patterns
export const searchIntentAnalysis = pgTable("search_intent_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 100 }),
  searchQuery: text("search_query"),
  searchType: varchar("search_type", { length: 50 }), // 'location', 'community_name', 'care_type', 'price_range', 'amenities'
  searchFilters: jsonb("search_filters").$type<{
    careLevel?: string[];
    priceRange?: { min: number; max: number };
    amenities?: string[];
    distance?: number;
    rating?: number;
  }>(),
  searchLocation: jsonb("search_location").$type<{
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }>(),
  resultsCount: integer("results_count"),
  clickedResults: integer("clicked_results").array().default([]), // Array of community IDs clicked
  timeSpent: integer("time_spent"), // Seconds spent on search results
  conversionType: varchar("conversion_type", { length: 50 }), // 'tour_scheduled', 'contact_made', 'saved', 'shared'
  conversionCommunityId: integer("conversion_community_id").references(() => communities.id),
  deviceType: varchar("device_type", { length: 20 }), // 'desktop', 'mobile', 'tablet'
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("search_intent_user_idx").on(table.userId),
  index("search_intent_session_idx").on(table.sessionId),
  index("search_intent_created_idx").on(table.createdAt),
  index("search_intent_conversion_idx").on(table.conversionType),
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
  
  // Geographic Coverage (State-based and International)
  coverageType: varchar("coverage_type", { length: 50 }).default('state'), // 'state', 'multi-state', 'national', 'international'
  coverageStates: text("coverage_states").array().default([]), // Array of state codes covered
  coverageCountries: text("coverage_countries").array().default(['US']), // Array of country codes covered
  serviceAreas: text("service_areas").array().default([]), // Specific cities/regions served
  serviceRadius: integer("service_radius"), // Miles from business location (for local vendors)
  
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
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default('basic'), // 'basic', 'featured', 'national'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  
  // Vendor subscription tracking
  monthlyLeadsCount: integer("monthly_leads_count").default(0),
  monthlyClicksCount: integer("monthly_clicks_count").default(0),
  totalLeadsGenerated: integer("total_leads_generated").default(0),
  lastResetDate: timestamp("last_reset_date").default(sql`CURRENT_TIMESTAMP`),
  
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
// Vendor messaging system tables
export const vendorConversations = pgTable("vendor_conversations", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["vendor_support", "customer_vendor", "admin_support"] }).notNull(),
  status: text("status", { enum: ["active", "resolved", "archived"] }).default("active"),
  subject: text("subject").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  metadata: jsonb("metadata").$type<{
    vendorId?: number;
    customerId?: string;
    communityId?: number;
    serviceType?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
}, (table) => [
  index("vendor_conversations_type_idx").on(table.type),
  index("vendor_conversations_status_idx").on(table.status),
  index("vendor_conversations_last_message_idx").on(table.lastMessageAt),
]);

export const vendorConversationParticipants = pgTable("vendor_conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => vendorConversations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  vendorId: integer("vendor_id").references(() => vendorRegistrations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["customer", "vendor", "admin", "support"] }).notNull(),
  lastReadAt: timestamp("last_read_at"),
  notificationEnabled: boolean("notification_enabled").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  index("vendor_participants_conversation_idx").on(table.conversationId),
  index("vendor_participants_user_idx").on(table.userId),
  index("vendor_participants_vendor_idx").on(table.vendorId),
  unique("vendor_unique_participant").on(table.conversationId, table.userId, table.vendorId),
]);

export const vendorMessages = pgTable("vendor_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => vendorConversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").references(() => users.id, { onDelete: "set null" }),
  senderVendorId: integer("sender_vendor_id").references(() => vendorRegistrations.id, { onDelete: "set null" }),
  senderType: text("sender_type", { enum: ["user", "vendor", "admin", "system"] }).notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>>().default([]),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  readBy: jsonb("read_by").$type<Array<{
    userId?: string;
    vendorId?: number;
    readAt: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("vendor_messages_conversation_idx").on(table.conversationId),
  index("vendor_messages_sender_idx").on(table.senderId),
  index("vendor_messages_created_idx").on(table.createdAt),
]);

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
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages"
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
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
  // Only include fields that actually exist in the database
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

// Note: Family Connect tables are defined earlier in the schema

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

// ========== US HOSPITALS DIRECTORY ==========
// Comprehensive US Hospital Database with systematic nationwide coverage
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  county: text("county").notNull(),
  phone: text("phone"),
  website: text("website"),
  
  // Geographic data for mapping
  latitude: decimal("latitude", { precision: 11, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  location: geographyPoint('location'), // PostGIS geography point for efficient spatial queries
  
  // Hospital Classification
  hospitalType: text("hospital_type", {
    enum: [
      "General Acute Care", "Critical Access", "Specialty", "Teaching Hospital", 
      "Children's Hospital", "Psychiatric", "Rehabilitation", "Long-term Care",
      "Veterans Affairs", "Military", "Federal", "Ambulatory Surgery Center"
    ]
  }).notNull(),
  ownership: text("ownership", {
    enum: [
      "Government - Federal", "Government - State", "Government - Local",
      "Private - For Profit", "Private - Non-profit", "Private - Church Related"
    ]
  }),
  
  // Medical Services & Specialties
  services: text("services").array().default([]), // ['Emergency Services', 'ICU', 'Surgery', 'Maternity', 'Cardiology']
  specialties: text("specialties").array().default([]), // ['Cardiac Surgery', 'Neurology', 'Oncology', 'Orthopedics']
  traumaLevel: text("trauma_level", { enum: ["Level I", "Level II", "Level III", "Level IV", "None"] }),
  emergencyServices: boolean("emergency_services").default(false),
  
  // Capacity & Size
  bedCount: integer("bed_count"),
  totalDischarges: integer("total_discharges"), // Annual discharges
  patientDays: integer("patient_days"), // Annual patient days
  grossCharges: numeric("gross_charges", { precision: 15, scale: 2 }), // Annual gross charges
  
  // Quality & Ratings
  cmsRating: integer("cms_rating"), // CMS Hospital Compare overall rating (1-5 stars)
  mortalityRating: text("mortality_rating", { enum: ["Below", "Same", "Above"] }), // Compared to national average
  safetyRating: text("safety_rating", { enum: ["Below", "Same", "Above"] }),
  readmissionRating: text("readmission_rating", { enum: ["Below", "Same", "Above"] }),
  experienceRating: text("experience_rating", { enum: ["Below", "Same", "Above"] }),
  
  // Network & Insurance
  insuranceAccepted: text("insurance_accepted").array().default([]), // ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna']
  networkAffiliations: text("network_affiliations").array().default([]), // ['Mayo Clinic Network', 'Johns Hopkins']
  
  // Administrative Data
  cmsProviderNumber: text("cms_provider_number").unique(), // CMS Certification Number
  npiNumber: text("npi_number"), // National Provider Identifier
  isActive: boolean("is_active").default(true),
  isCertified: boolean("is_certified").default(true), // CMS Certified
  
  // Data Sources & Verification
  dataSource: text("data_source").default("CMS Hospital Compare"), // 'CMS', 'AHA', 'State Licensing', 'Manual Entry'
  dataSourceNote: text("data_source_note"), // Note about data authenticity
  lastVerified: timestamp("last_verified"),
  verificationStatus: text("verification_status", {
    enum: ["Verified", "Pending", "Needs Review", "Outdated"]
  }).default("Pending"),
  
  // Search & Discovery
  searchTerms: text("search_terms").array().default([]), // For search optimization
  tags: text("tags").array().default([]), // ['Level 1 Trauma', 'Magnet Hospital', 'Teaching']
  
  // Performance Metrics
  averageStay: decimal("average_stay", { precision: 5, scale: 2 }), // Average length of stay in days
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }), // Bed occupancy percentage
  
  // Contact & Hours
  emergencyPhone: text("emergency_phone"),
  operatingHours: json("operating_hours").$type<{
    emergency?: string; // "24/7" or specific hours
    general?: string;
    visiting?: string;
  }>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hospital Departments/Services - Detailed breakdown of services offered
export const hospitalDepartments = pgTable("hospital_departments", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  departmentName: text("department_name").notNull(), // 'Cardiology', 'Emergency Medicine', 'Pediatrics'
  departmentType: text("department_type", {
    enum: ["Medical", "Surgical", "Emergency", "Diagnostic", "Support", "Administrative"]
  }).notNull(),
  services: text("services").array().default([]), // Specific services within department
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  hours: text("hours"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hospital Quality Metrics - Detailed CMS quality data
export const hospitalQualityMetrics = pgTable("hospital_quality_metrics", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").references(() => hospitals.id).notNull(),
  metricType: text("metric_type").notNull(), // 'Mortality', 'Safety', 'Readmission', 'Experience'
  measureId: text("measure_id").notNull(), // CMS measure ID
  measureName: text("measure_name").notNull(),
  score: text("score"), // Could be percentage, rating, or text
  nationalAverage: text("national_average"),
  performance: text("performance", { enum: ["Better", "Same", "Worse", "Not Available"] }),
  reportingPeriod: text("reporting_period"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========== COMPREHENSIVE HEALTHCARE SERVICE TYPES ==========
// Master table for all healthcare service types (30+ categories)
export const healthcareServiceTypes = pgTable("healthcare_service_types", {
  id: serial("id").primaryKey(),
  categoryId: text("category_id").unique().notNull(), // Unique identifier for the category
  name: text("name").notNull(),
  displayName: text("display_name").notNull(), // User-friendly name with count
  description: text("description"),
  icon: text("icon"), // Emoji or icon identifier
  serviceType: text("service_type", {
    enum: [
      "hospital", "home_care", "therapy", "hospice", "respite", "personal_care",
      "adult_day", "dental", "vision", "hearing", "medical_equipment", "pharmacy",
      "skilled_nursing", "palliative", "nutrition", "companion", "transportation",
      "mental_health", "substance_abuse", "dialysis", "infusion", "wound_care",
      "pain_management", "sleep_disorder", "cardiac_rehab", "pulmonary_rehab",
      "occupational_health", "urgent_care", "telemedicine", "community_health",
      "preventive_care", "diagnostic", "laboratory", "radiology", "surgery_center"
    ]
  }).notNull(),
  parentCategory: text("parent_category", {
    enum: ["medical_facilities", "home_services", "therapy_rehab", "specialized_care", "support_services", "equipment_supplies"]
  }),
  count: integer("count").default(0), // Number of providers in this category
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0), // Display order
  metadata: jsonb("metadata").$type<{
    searchKeywords?: string[];
    relatedCategories?: string[];
    averageCost?: { min: number; max: number };
    coveredByMedicare?: boolean;
    coveredByMedicaid?: boolean;
    requiresPrescription?: boolean;
    licensingRequirements?: string[];
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_healthcare_service_types_category").on(table.categoryId),
  index("idx_healthcare_service_types_type").on(table.serviceType),
  index("idx_healthcare_service_types_active").on(table.isActive),
]);

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

// Hospital Insert Schemas and Types
export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;

export const insertHospitalDepartmentSchema = createInsertSchema(hospitalDepartments).omit({
  id: true,
  createdAt: true,
});
export type InsertHospitalDepartment = z.infer<typeof insertHospitalDepartmentSchema>;
export type HospitalDepartment = typeof hospitalDepartments.$inferSelect;

export const insertHospitalQualityMetricsSchema = createInsertSchema(hospitalQualityMetrics).omit({
  id: true,
  createdAt: true,
});
export type InsertHospitalQualityMetrics = z.infer<typeof insertHospitalQualityMetricsSchema>;
export type HospitalQualityMetrics = typeof hospitalQualityMetrics.$inferSelect;

// Healthcare Service Types Insert Schemas and Types
export const insertHealthcareServiceTypeSchema = createInsertSchema(healthcareServiceTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHealthcareServiceType = z.infer<typeof insertHealthcareServiceTypeSchema>;
export type HealthcareServiceType = typeof healthcareServiceTypes.$inferSelect;

// ============ SMART NOTIFICATION SYSTEM TABLES ============

// Notifications table for community updates and milestones
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  
  // Notification Details
  type: varchar("type", { length: 50 }).notNull(), // 'community_update', 'milestone', 'review', 'price_change', 'photo_added', 'availability', 'system'
  category: varchar("category", { length: 50 }).notNull(), // 'updates', 'milestones', 'reviews', 'pricing', 'media', 'general'
  priority: varchar("priority", { length: 20 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
  
  // Content
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url", { length: 500 }), // Link to relevant page
  iconType: varchar("icon_type", { length: 50 }), // Icon identifier for UI
  
  // Target
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  communityId: integer("community_id").references(() => communities.id, { onDelete: "cascade" }),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    oldValue?: any;
    newValue?: any;
    milestone?: string;
    threshold?: number;
    contributorName?: string;
    changeType?: string;
  }>().default({}),
  
  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For auto-cleanup of old notifications
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_community_id_idx").on(table.communityId),
  index("notifications_is_read_idx").on(table.isRead),
  index("notifications_created_at_idx").on(table.createdAt),
  index("notifications_type_idx").on(table.type),
]);

// User notification preferences
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Email Preferences
  emailEnabled: boolean("email_enabled").default(true),
  emailFrequency: varchar("email_frequency", { length: 20 }).default('immediate'), // 'immediate', 'daily', 'weekly', 'never'
  
  // Notification Type Preferences
  communityUpdates: boolean("community_updates").default(true),
  priceChanges: boolean("price_changes").default(true),
  newPhotos: boolean("new_photos").default(true),
  newReviews: boolean("new_reviews").default(true),
  availabilityChanges: boolean("availability_changes").default(true),
  milestones: boolean("milestones").default(true),
  systemAnnouncements: boolean("system_announcements").default(true),
  
  // Community Tracking
  watchedCommunities: integer("watched_communities").array().default([]), // Array of community IDs to watch
  
  // Quiet Hours
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // "22:00"
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }), // "08:00"
  timezone: varchar("timezone", { length: 50 }).default('America/New_York'),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("user_notification_preferences_user_id_idx").on(table.userId),
]);

// Community milestones tracking
export const communityMilestones = pgTable("community_milestones", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  
  // Milestone Details
  type: varchar("type", { length: 50 }).notNull(), // 'reviews', 'photos', 'verified', 'rating', 'popularity'
  milestone: varchar("milestone", { length: 100 }).notNull(), // '10_reviews', '50_photos', 'fully_verified', '4_star_rating'
  threshold: integer("threshold").notNull(), // Numeric threshold for the milestone
  
  // Achievement
  achievedAt: timestamp("achieved_at"),
  currentValue: integer("current_value").default(0),
  notificationSent: boolean("notification_sent").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("community_milestones_community_id_idx").on(table.communityId),
  index("community_milestones_type_idx").on(table.type),
  unique("community_milestones_unique").on(table.communityId, table.type, table.milestone),
]);

// Notification queue for batch processing
export const notificationQueue = pgTable("notification_queue", {
  id: serial("id").primaryKey(),
  
  // Queue Details
  notificationId: integer("notification_id").references(() => notifications.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Processing
  status: varchar("status", { length: 20 }).default('pending'), // 'pending', 'processing', 'sent', 'failed'
  attempts: integer("attempts").default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  error: text("error"),
  
  // Email Details
  emailTo: varchar("email_to", { length: 255 }),
  emailSubject: varchar("email_subject", { length: 255 }),
  emailBody: text("email_body"),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for").defaultNow(),
  sentAt: timestamp("sent_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notification_queue_status_idx").on(table.status),
  index("notification_queue_scheduled_for_idx").on(table.scheduledFor),
  index("notification_queue_user_id_idx").on(table.userId),
]);

// Insert schemas for notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
  emailSentAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const insertUserNotificationPreferencesSchema = createInsertSchema(userNotificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserNotificationPreferences = z.infer<typeof insertUserNotificationPreferencesSchema>;
export type UserNotificationPreferences = typeof userNotificationPreferences.$inferSelect;

export const insertCommunityMilestoneSchema = createInsertSchema(communityMilestones).omit({
  id: true,
  createdAt: true,
  achievedAt: true,
});
export type InsertCommunityMilestone = z.infer<typeof insertCommunityMilestoneSchema>;
export type CommunityMilestone = typeof communityMilestones.$inferSelect;

export const insertNotificationQueueSchema = createInsertSchema(notificationQueue).omit({
  id: true,
  createdAt: true,
  lastAttemptAt: true,
  sentAt: true,
});
export type InsertNotificationQueue = z.infer<typeof insertNotificationQueueSchema>;
export type NotificationQueue = typeof notificationQueue.$inferSelect;

// Availability Heatmap Types
export interface AvailabilityHeatmapData {
  latitude: number;
  longitude: number;
  availabilityScore: number; // 0-100 scale
  communityCount: number;
  averageAvailability: number;
  regionName: string;
  lastUpdated: string;
}

export interface HeatmapRegion {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  data: AvailabilityHeatmapData[];
  zoomLevel: number;
}

// CRM Integrations Table
export const crmIntegrations = pgTable("crm_integrations", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  provider: text("provider", { enum: ["aline", "yardi", "vitals"] }).notNull(),
  configuration: jsonb("configuration").$type<{
    apiKey: string;
    apiSecret?: string;
    baseUrl: string;
    webhookUrl?: string;
    syncFrequency?: 'real_time' | 'hourly' | 'daily';
    dataMapping?: Record<string, string>;
  }>().notNull(),
  status: text("status", { enum: ["active", "inactive", "error"] }).notNull().default("active"),
  lastSync: timestamp("last_sync"),
  syncCount: integer("sync_count").default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_community_provider").on(table.communityId, table.provider),
  index("crm_integrations_community_idx").on(table.communityId),
  index("crm_integrations_provider_idx").on(table.provider)
]);

// CRM Integration Relations
export const crmIntegrationsRelations = relations(crmIntegrations, ({ one }) => ({
  community: one(communities, {
    fields: [crmIntegrations.communityId],
    references: [communities.id],
  }),
}));

// CRM Integration Schema Types
export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCrmIntegration = z.infer<typeof insertCrmIntegrationSchema>;
export type CrmIntegration = typeof crmIntegrations.$inferSelect;

// ==========================================
// RMS (Revenue Management System) INTEGRATIONS
// ==========================================

// RMS Integrations Table - Separate from CRM for specialized revenue data
export const rmsIntegrations = pgTable("rms_integrations", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  provider: text("provider", { enum: ["aline", "yardi", "lcs", "reps", "onesite", "entrata"] }).notNull(),
  configuration: jsonb("configuration").$type<{
    apiKey: string;
    apiSecret?: string;
    baseUrl: string;
    revenueEndpoint?: string;
    pricingEndpoint?: string;
    occupancyEndpoint?: string;
    syncFrequency?: 'real_time' | 'hourly' | 'daily';
    enabledFeatures?: Array<'pricing' | 'occupancy' | 'revenue' | 'forecasting' | 'competitive'>;
  }>().notNull(),
  status: text("status", { enum: ["active", "inactive", "error", "testing"] }).notNull().default("testing"),
  lastSync: timestamp("last_sync"),
  syncCount: integer("sync_count").default(0),
  lastError: text("last_error"),
  
  // RMS-specific tracking
  dataQualityScore: integer("data_quality_score").default(0), // 0-100 score
  pricingAccuracy: integer("pricing_accuracy").default(0), // 0-100 score
  lastPriceUpdate: timestamp("last_price_update"),
  lastOccupancyUpdate: timestamp("last_occupancy_update"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_community_rms_provider").on(table.communityId, table.provider),
  index("rms_integrations_community_idx").on(table.communityId),
  index("rms_integrations_provider_idx").on(table.provider)
]);

// RMS Revenue Data Table - Store fetched revenue/pricing data
export const rmsRevenueData = pgTable("rms_revenue_data", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  provider: text("provider", { enum: ["aline", "yardi", "lcs", "reps", "onesite", "entrata"] }).notNull(),
  
  // Pricing Data
  unitType: text("unit_type").notNull(), // "studio", "1br", "2br", "memory_care", etc.
  baseRate: decimal("base_rate", { precision: 10, scale: 2 }), // Monthly base rent
  careRate: decimal("care_rate", { precision: 10, scale: 2 }), // Additional care costs
  totalRate: decimal("total_rate", { precision: 10, scale: 2 }), // All-inclusive rate
  
  // Occupancy Data
  totalUnits: integer("total_units"),
  occupiedUnits: integer("occupied_units"),
  availableUnits: integer("available_units"),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }), // Percentage
  
  // Revenue Metrics
  revpar: decimal("revpar", { precision: 10, scale: 2 }), // Revenue Per Available Room
  adr: decimal("adr", { precision: 10, scale: 2 }), // Average Daily Rate
  monthlyRevenue: decimal("monthly_revenue", { precision: 12, scale: 2 }),
  
  // Market Intelligence
  marketRate: decimal("market_rate", { precision: 10, scale: 2 }), // Competitive market rate
  pricePosition: text("price_position", { enum: ["below", "at", "above"] }), // vs market
  demandScore: integer("demand_score"), // 1-100 demand indicator
  
  // Forecasting Data
  projectedOccupancy: decimal("projected_occupancy", { precision: 5, scale: 2 }),
  seasonalAdjustment: decimal("seasonal_adjustment", { precision: 5, scale: 2 }),
  
  // Metadata
  dataDate: date("data_date").notNull(), // Date this data represents
  fetchedAt: timestamp("fetched_at").defaultNow(),
  isLatest: boolean("is_latest").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("rms_revenue_community_idx").on(table.communityId),
  index("rms_revenue_provider_idx").on(table.provider),
  index("rms_revenue_date_idx").on(table.dataDate),
  index("rms_revenue_latest_idx").on(table.isLatest, table.communityId)
]);

// RMS Integration Relations
export const rmsIntegrationsRelations = relations(rmsIntegrations, ({ one, many }) => ({
  community: one(communities, {
    fields: [rmsIntegrations.communityId],
    references: [communities.id],
  }),
  revenueData: many(rmsRevenueData),
}));

export const rmsRevenueDataRelations = relations(rmsRevenueData, ({ one }) => ({
  community: one(communities, {
    fields: [rmsRevenueData.communityId],
    references: [communities.id],
  }),
  integration: one(rmsIntegrations, {
    fields: [rmsRevenueData.communityId, rmsRevenueData.provider],
    references: [rmsIntegrations.communityId, rmsIntegrations.provider],
  }),
}));

// RMS Integration Schema Types
export const insertRmsIntegrationSchema = createInsertSchema(rmsIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRmsIntegration = z.infer<typeof insertRmsIntegrationSchema>;
export type RmsIntegration = typeof rmsIntegrations.$inferSelect;

export const insertRmsRevenueDataSchema = createInsertSchema(rmsRevenueData).omit({
  id: true,
  createdAt: true,
});
export type InsertRmsRevenueData = z.infer<typeof insertRmsRevenueDataSchema>;
export type RmsRevenueData = typeof rmsRevenueData.$inferSelect;

// ==========================================
// ENTERPRISE FEATURE SCHEMAS
// ==========================================

// Community Analytics tracking
export const communityAnalytics = pgTable('community_analytics', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  date: date('date').notNull(),
  occupancyRate: real('occupancy_rate'),
  revenue: real('revenue'),
  expenses: real('expenses'),
  residentCount: integer('resident_count'),
  staffCount: integer('staff_count'),
  incidentCount: integer('incident_count'),
  satisfactionScore: real('satisfaction_score'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type CommunityAnalytics = typeof communityAnalytics.$inferSelect;
export type InsertCommunityAnalytics = typeof communityAnalytics.$inferInsert;

// Financial Records
export const financialRecords = pgTable('financial_records', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  type: varchar('type', { length: 20 }).notNull(), // 'revenue' or 'expense'
  category: varchar('category', { length: 100 }).notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  date: date('date').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  referenceNumber: varchar('reference_number', { length: 100 }),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

// Compliance Records
export const complianceRecords = pgTable('compliance_records', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  regulationType: varchar('regulation_type', { length: 100 }).notNull(), // 'State', 'Federal', 'HIPAA', etc
  checkType: varchar('check_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'passed', 'failed', 'pending'
  severity: varchar('severity', { length: 20 }), // 'critical', 'high', 'medium', 'low'
  checkDate: date('check_date').notNull(),
  dueDate: date('due_date'),
  notes: text('notes'),
  inspector: varchar('inspector', { length: 100 }),
  documentUrl: text('document_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = typeof complianceRecords.$inferInsert;

// ==========================================
// PHASE 2: PEOPLE SYSTEMS
// ==========================================

// Enterprise Residents table
export const enterpriseResidents = pgTable('enterprise_residents', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  
  // Basic Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  preferredName: varchar('preferred_name', { length: 100 }),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: varchar('gender', { length: 20 }),
  photoUrl: text('photo_url'),
  
  // Contact Information
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  emergencyContact: varchar('emergency_contact', { length: 255 }),
  emergencyPhone: varchar('emergency_phone', { length: 20 }),
  
  // Room & Care Information
  roomNumber: varchar('room_number', { length: 20 }),
  buildingSection: varchar('building_section', { length: 50 }),
  careLevel: varchar('care_level', { length: 50 }).notNull(), // 'Independent', 'Assisted', 'Memory Care', 'Skilled'
  admissionDate: date('admission_date').notNull(),
  dischargeDate: date('discharge_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'discharged', 'temporary_leave', 'deceased'
  
  // Medical Information
  primaryDiagnosis: text('primary_diagnosis'),
  medications: json('medications').$type<Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescriber: string;
  }>>().default([]),
  allergies: text('allergies').array().default([]),
  dietaryRestrictions: text('dietary_restrictions').array().default([]),
  mobilityLevel: varchar('mobility_level', { length: 50 }), // 'independent', 'walker', 'wheelchair', 'bedbound'
  cognitiveStatus: varchar('cognitive_status', { length: 50 }), // 'alert', 'mild_impairment', 'moderate_impairment', 'severe_impairment'
  
  // Financial Information
  paymentSource: varchar('payment_source', { length: 50 }), // 'private', 'medicare', 'medicaid', 'insurance'
  monthlyRate: real('monthly_rate'),
  billingCycle: varchar('billing_cycle', { length: 20 }), // 'monthly', 'quarterly', 'annual'
  accountBalance: real('account_balance').default(0),
  
  // Additional Information
  specialNeeds: text('special_needs'),
  preferences: json('preferences').$type<{
    activities?: string[];
    roomTemperature?: string;
    mealPreferences?: string[];
    visitingHours?: string;
  }>().default({}),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('enterprise_residents_community_id_idx').on(table.communityId),
  index('enterprise_residents_status_idx').on(table.status),
  index('enterprise_residents_care_level_idx').on(table.careLevel)
]);

export type EnterpriseResident = typeof enterpriseResidents.$inferSelect;
export type InsertEnterpriseResident = typeof enterpriseResidents.$inferInsert;

// Enterprise Staff table
export const enterpriseStaff = pgTable('enterprise_staff', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: varchar('user_id').references(() => users.id), // Link to user account if they have one
  
  // Basic Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  photoUrl: text('photo_url'),
  employeeId: varchar('employee_id', { length: 50 }).unique(),
  
  // Employment Information
  department: varchar('department', { length: 100 }).notNull(), // 'Nursing', 'Administration', 'Maintenance', 'Dietary', etc
  position: varchar('position', { length: 100 }).notNull(),
  employmentType: varchar('employment_type', { length: 20 }).notNull(), // 'full_time', 'part_time', 'per_diem', 'contract'
  shift: varchar('shift', { length: 20 }), // 'day', 'evening', 'night', 'rotating'
  hireDate: date('hire_date').notNull(),
  terminationDate: date('termination_date'),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'on_leave', 'terminated', 'suspended'
  
  // Qualifications
  certifications: json('certifications').$type<Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
  }>>().default([]),
  licenses: json('licenses').$type<Array<{
    type: string;
    number: string;
    state: string;
    expiryDate: string;
  }>>().default([]),
  trainings: json('trainings').$type<Array<{
    name: string;
    completedDate: string;
    nextDueDate: string;
  }>>().default([]),
  
  // Compensation
  hourlyRate: real('hourly_rate'),
  salary: real('salary'),
  overtimeRate: real('overtime_rate'),
  bonusEligible: boolean('bonus_eligible').default(false),
  
  // Scheduling
  weeklyHours: real('weekly_hours'),
  availableDays: text('available_days').array().default([]), // ['monday', 'tuesday', ...]
  vacationDays: integer('vacation_days').default(0),
  sickDays: integer('sick_days').default(0),
  
  // Performance
  lastReviewDate: date('last_review_date'),
  nextReviewDate: date('next_review_date'),
  performanceRating: real('performance_rating'), // 1-5 scale
  
  // Access & Permissions
  accessLevel: varchar('access_level', { length: 50 }), // 'basic', 'supervisor', 'manager', 'director'
  canAdministerMeds: boolean('can_administer_meds').default(false),
  backgroundCheckDate: date('background_check_date'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('enterprise_staff_community_id_idx').on(table.communityId),
  index('enterprise_staff_department_idx').on(table.department),
  index('enterprise_staff_status_idx').on(table.status),
  index('enterprise_staff_email_idx').on(table.email)
]);

export type EnterpriseStaff = typeof enterpriseStaff.$inferSelect;
export type InsertEnterpriseStaff = typeof enterpriseStaff.$inferInsert;

// Enterprise Families table (for resident family members)
export const enterpriseFamilies = pgTable('enterprise_families', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').notNull().references(() => enterpriseResidents.id, { onDelete: 'cascade' }),
  userId: varchar('user_id').references(() => users.id), // Link to user account if they have one
  
  // Basic Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  relationship: varchar('relationship', { length: 50 }).notNull(), // 'spouse', 'child', 'sibling', 'parent', 'guardian', 'other'
  
  // Contact Information
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  alternatePhone: varchar('alternate_phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  zipCode: varchar('zip_code', { length: 10 }),
  
  // Permissions & Responsibilities
  isPrimaryContact: boolean('is_primary_contact').default(false),
  isEmergencyContact: boolean('is_emergency_contact').default(false),
  isPowerOfAttorney: boolean('is_power_of_attorney').default(false),
  isHealthcareProxy: boolean('is_healthcare_proxy').default(false),
  isFinancialResponsible: boolean('is_financial_responsible').default(false),
  
  // Portal Access
  hasPortalAccess: boolean('has_portal_access').default(true),
  lastPortalLogin: timestamp('last_portal_login'),
  portalPermissions: json('portal_permissions').$type<{
    viewMedical: boolean;
    viewFinancial: boolean;
    viewActivities: boolean;
    requestVisits: boolean;
    communicateStaff: boolean;
  }>().default({
    viewMedical: true,
    viewFinancial: false,
    viewActivities: true,
    requestVisits: true,
    communicateStaff: true
  }),
  
  // Communication Preferences
  preferredContactMethod: varchar('preferred_contact_method', { length: 20 }), // 'email', 'phone', 'text', 'portal'
  contactFrequency: varchar('contact_frequency', { length: 20 }), // 'daily', 'weekly', 'monthly', 'as_needed'
  receiveUpdates: boolean('receive_updates').default(true),
  receiveNewsletter: boolean('receive_newsletter').default(true),
  
  // Visit Information
  lastVisitDate: date('last_visit_date'),
  visitFrequency: varchar('visit_frequency', { length: 50 }), // 'daily', 'weekly', 'biweekly', 'monthly', 'occasional'
  visitRestrictions: text('visit_restrictions'),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('enterprise_families_resident_id_idx').on(table.residentId),
  index('enterprise_families_user_id_idx').on(table.userId),
  index('enterprise_families_is_primary_idx').on(table.isPrimaryContact)
]);

export type EnterpriseFamily = typeof enterpriseFamilies.$inferSelect;
export type InsertEnterpriseFamily = typeof enterpriseFamilies.$inferInsert;

// Staff Schedules table
export const staffSchedules = pgTable('staff_schedules', {
  id: serial('id').primaryKey(),
  staffId: integer('staff_id').notNull().references(() => enterpriseStaff.id, { onDelete: 'cascade' }),
  communityId: integer('community_id').notNull().references(() => communities.id),
  
  // Schedule Information
  date: date('date').notNull(),
  shiftType: varchar('shift_type', { length: 20 }).notNull(), // 'day', 'evening', 'night'
  startTime: varchar('start_time', { length: 10 }).notNull(), // Format: 'HH:MM'
  endTime: varchar('end_time', { length: 10 }).notNull(), // Format: 'HH:MM'
  breakMinutes: integer('break_minutes').default(0),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('scheduled'), // 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  actualStartTime: varchar('actual_start_time', { length: 10 }), // Format: 'HH:MM'
  actualEndTime: varchar('actual_end_time', { length: 10 }), // Format: 'HH:MM'
  
  // Coverage
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  isCoverage: boolean('is_coverage').default(false), // If covering for someone else
  coveringForId: integer('covering_for_id').references(() => enterpriseStaff.id),
  
  // Overtime & Pay
  isOvertime: boolean('is_overtime').default(false),
  overtimeHours: real('overtime_hours'),
  holidayPay: boolean('holiday_pay').default(false),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('staff_schedules_staff_id_idx').on(table.staffId),
  index('staff_schedules_community_id_idx').on(table.communityId),
  index('staff_schedules_date_idx').on(table.date),
  index('staff_schedules_status_idx').on(table.status)
]);

export type StaffSchedule = typeof staffSchedules.$inferSelect;
export type InsertStaffSchedule = typeof staffSchedules.$inferInsert;

// ==========================================
// PRODUCTION ANALYTICS INFRASTRUCTURE
// ==========================================

// Real-time Analytics Events for tracking all user interactions
export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id),
  userId: integer('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  
  // Event Details
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'page_view', 'click', 'form_submit', 'conversion', 'search'
  eventCategory: varchar('event_category', { length: 50 }), // 'navigation', 'engagement', 'transaction'
  eventAction: varchar('event_action', { length: 100 }), // Specific action like 'view_pricing', 'schedule_tour'
  eventLabel: varchar('event_label', { length: 255 }), // Additional context
  eventValue: real('event_value'), // Numeric value if applicable
  
  // Page & Interaction Data
  pageUrl: text('page_url'),
  pageTitle: varchar('page_title', { length: 255 }),
  referrerUrl: text('referrer_url'),
  elementId: varchar('element_id', { length: 100 }), // DOM element ID if click event
  elementClass: varchar('element_class', { length: 255 }), // DOM element class
  
  // User Context
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }), // Support IPv6
  country: varchar('country', { length: 2 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  
  // Device Information
  deviceType: varchar('device_type', { length: 20 }), // 'desktop', 'mobile', 'tablet'
  browserName: varchar('browser_name', { length: 50 }),
  browserVersion: varchar('browser_version', { length: 20 }),
  operatingSystem: varchar('operating_system', { length: 50 }),
  screenResolution: varchar('screen_resolution', { length: 20 }),
  
  // Performance Metrics
  pageLoadTime: integer('page_load_time'), // milliseconds
  domReadyTime: integer('dom_ready_time'), // milliseconds
  timeOnPage: integer('time_on_page'), // seconds
  
  // Custom Properties
  customData: jsonb('custom_data').$type<Record<string, any>>().default({}),
  
  timestamp: timestamp('timestamp').defaultNow().notNull()
}, (table) => [
  index('analytics_events_community_id_idx').on(table.communityId),
  index('analytics_events_user_id_idx').on(table.userId),
  index('analytics_events_session_id_idx').on(table.sessionId),
  index('analytics_events_timestamp_idx').on(table.timestamp),
  index('analytics_events_event_type_idx').on(table.eventType)
]);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// Analytics Sessions for tracking user behavior patterns
export const analyticsSessions = pgTable('analytics_sessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 100 }).unique().notNull(),
  userId: integer('user_id').references(() => users.id),
  communityId: integer('community_id').references(() => communities.id),
  
  // Session Details
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // seconds
  pageViews: integer('page_views').default(0),
  events: integer('events').default(0),
  bounced: boolean('bounced').default(false),
  
  // Entry & Exit
  entryPage: text('entry_page'),
  exitPage: text('exit_page'),
  entrySource: varchar('entry_source', { length: 50 }), // 'direct', 'organic', 'paid', 'social', 'referral'
  
  // Campaign Attribution
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  utmContent: varchar('utm_content', { length: 100 }),
  
  // Conversion Tracking
  goalCompleted: boolean('goal_completed').default(false),
  goalType: varchar('goal_type', { length: 50 }), // 'tour_scheduled', 'contact_form', 'brochure_download'
  goalValue: real('goal_value'),
  
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('analytics_sessions_user_id_idx').on(table.userId),
  index('analytics_sessions_community_id_idx').on(table.communityId),
  index('analytics_sessions_start_time_idx').on(table.startTime)
]);

export type AnalyticsSession = typeof analyticsSessions.$inferSelect;
export type InsertAnalyticsSession = typeof analyticsSessions.$inferInsert;

// Detailed Financial Transactions for real money tracking
export const financialTransactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  
  // Transaction Details
  transactionId: varchar('transaction_id', { length: 100 }).unique().notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'revenue', 'expense', 'refund', 'adjustment'
  category: varchar('category', { length: 50 }).notNull(), // 'subscription', 'addon', 'service', 'maintenance'
  subcategory: varchar('subcategory', { length: 50 }),
  
  // Financial Data
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }),
  feeAmount: numeric('fee_amount', { precision: 10, scale: 2 }),
  netAmount: numeric('net_amount', { precision: 12, scale: 2 }),
  
  // Payment Information
  paymentMethod: varchar('payment_method', { length: 30 }), // 'credit_card', 'ach', 'check', 'wire'
  paymentProcessor: varchar('payment_processor', { length: 30 }), // 'stripe', 'square', 'manual'
  processorTransactionId: varchar('processor_transaction_id', { length: 255 }),
  processorFee: numeric('processor_fee', { precision: 10, scale: 2 }),
  
  // Status & Reconciliation
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'completed', 'failed', 'cancelled'
  reconciled: boolean('reconciled').default(false),
  reconciledDate: date('reconciled_date'),
  reconciledBy: integer('reconciled_by').references(() => users.id),
  
  // Related Entities
  relatedResidentId: integer('related_resident_id').references(() => enterpriseResidents.id),
  relatedInvoiceId: integer('related_invoice_id'),
  relatedUserId: integer('related_user_id').references(() => users.id),
  
  // Metadata
  description: text('description'),
  notes: text('notes'),
  attachments: text('attachments').array().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Dates
  transactionDate: timestamp('transaction_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('financial_transactions_community_id_idx').on(table.communityId),
  index('financial_transactions_date_idx').on(table.transactionDate),
  index('financial_transactions_type_idx').on(table.type),
  index('financial_transactions_status_idx').on(table.status)
]);

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

// Compliance Audit Trail for detailed regulatory tracking
export const complianceAudits = pgTable('compliance_audits', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  
  // Audit Information
  auditType: varchar('audit_type', { length: 50 }).notNull(), // 'state_inspection', 'federal_review', 'internal_audit'
  auditCategory: varchar('audit_category', { length: 100 }).notNull(), // 'HIPAA', 'ADA', 'fire_safety', 'infection_control'
  auditScope: text('audit_scope'),
  
  // Regulatory Details
  regulatoryBody: varchar('regulatory_body', { length: 100 }), // 'CMS', 'State Health Dept', 'OSHA'
  regulationCode: varchar('regulation_code', { length: 50 }), // Specific regulation reference
  complianceStandard: varchar('compliance_standard', { length: 100 }),
  
  // Audit Results
  status: varchar('status', { length: 20 }).notNull(), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  result: varchar('result', { length: 20 }), // 'passed', 'failed', 'conditional', 'pending'
  score: integer('score'), // Numerical score if applicable
  maxScore: integer('max_score'),
  
  // Findings
  findingsCount: integer('findings_count').default(0),
  criticalFindings: integer('critical_findings').default(0),
  majorFindings: integer('major_findings').default(0),
  minorFindings: integer('minor_findings').default(0),
  
  // Detailed Findings
  findings: jsonb('findings').$type<Array<{
    id: string;
    category: string;
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location: string;
    recommendation: string;
    deadline: string;
    status: 'open' | 'resolved' | 'in_progress';
  }>>().default([]),
  
  // Corrective Actions
  correctiveActions: jsonb('corrective_actions').$type<Array<{
    id: string;
    findingId: string;
    action: string;
    responsibleParty: string;
    dueDate: string;
    completedDate?: string;
    status: 'pending' | 'in_progress' | 'completed';
    evidence?: string;
  }>>().default([]),
  
  // Documentation
  reportUrl: text('report_url'),
  certificateUrl: text('certificate_url'),
  evidenceUrls: text('evidence_urls').array().default([]),
  
  // People Involved
  leadAuditor: varchar('lead_auditor', { length: 100 }),
  auditTeam: text('audit_team').array().default([]),
  responsibleManager: integer('responsible_manager').references(() => users.id),
  
  // Dates
  scheduledDate: date('scheduled_date'),
  startDate: date('start_date'),
  completionDate: date('completion_date'),
  nextAuditDate: date('next_audit_date'),
  certificateExpiryDate: date('certificate_expiry_date'),
  
  // Metadata
  notes: text('notes'),
  tags: text('tags').array().default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('compliance_audits_community_id_idx').on(table.communityId),
  index('compliance_audits_status_idx').on(table.status),
  index('compliance_audits_scheduled_date_idx').on(table.scheduledDate),
  index('compliance_audits_audit_type_idx').on(table.auditType)
]);

export type ComplianceAudit = typeof complianceAudits.$inferSelect;
export type InsertComplianceAudit = typeof complianceAudits.$inferInsert;

// Aggregated Metrics for dashboard performance
export const enterpriseMetrics = pgTable('enterprise_metrics', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  
  // Time Period
  date: date('date').notNull(),
  period: varchar('period', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly', 'quarterly'
  
  // Analytics Metrics
  uniqueVisitors: integer('unique_visitors').default(0),
  totalPageViews: integer('total_page_views').default(0),
  avgSessionDuration: integer('avg_session_duration'), // seconds
  bounceRate: real('bounce_rate'),
  conversionRate: real('conversion_rate'),
  
  // Financial Metrics
  totalRevenue: numeric('total_revenue', { precision: 12, scale: 2 }).default('0'),
  totalExpenses: numeric('total_expenses', { precision: 12, scale: 2 }).default('0'),
  netIncome: numeric('net_income', { precision: 12, scale: 2 }).default('0'),
  avgRevenuePerResident: numeric('avg_revenue_per_resident', { precision: 10, scale: 2 }),
  outstandingBalance: numeric('outstanding_balance', { precision: 12, scale: 2 }).default('0'),
  
  // Operational Metrics
  occupancyRate: real('occupancy_rate'),
  avgLengthOfStay: real('avg_length_of_stay'), // days
  residentTurnover: real('resident_turnover'),
  staffTurnover: real('staff_turnover'),
  staffToResidentRatio: real('staff_to_resident_ratio'),
  
  // Compliance Metrics
  complianceScore: integer('compliance_score'),
  openFindings: integer('open_findings').default(0),
  overdueActions: integer('overdue_actions').default(0),
  incidentCount: integer('incident_count').default(0),
  
  // Quality Metrics
  residentSatisfaction: real('resident_satisfaction'),
  familySatisfaction: real('family_satisfaction'),
  staffSatisfaction: real('staff_satisfaction'),
  qualityScore: real('quality_score'),
  
  // Marketing Metrics
  leadCount: integer('lead_count').default(0),
  tourScheduled: integer('tours_scheduled').default(0),
  toursCompleted: integer('tours_completed').default(0),
  tourConversionRate: real('tour_conversion_rate'),
  
  // Calculated Fields
  calculations: jsonb('calculations').$type<Record<string, any>>().default({}),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('enterprise_metrics_community_id_idx').on(table.communityId),
  index('enterprise_metrics_date_idx').on(table.date),
  index('enterprise_metrics_period_idx').on(table.period),
  unique('enterprise_metrics_unique').on(table.communityId, table.date, table.period)
]);

export type EnterpriseMetric = typeof enterpriseMetrics.$inferSelect;
export type InsertEnterpriseMetric = typeof enterpriseMetrics.$inferInsert;

// Enterprise Alerts Table
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id),
  
  // Alert Details
  type: varchar('type', { length: 50 }).notNull(), // 'revenue', 'occupancy', 'compliance', 'performance', 'security'
  severity: varchar('severity', { length: 20 }).notNull(), // 'critical', 'warning', 'info'
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'acknowledged', 'resolved', 'expired'
  
  // Content
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  // Tracking
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: integer('acknowledged_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: integer('resolved_by').references(() => users.id),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at')
}, (table) => [
  index('alerts_community_id_idx').on(table.communityId),
  index('alerts_type_idx').on(table.type),
  index('alerts_severity_idx').on(table.severity),
  index('alerts_status_idx').on(table.status),
  index('alerts_created_at_idx').on(table.createdAt)
]);

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// ===================== PHASE 5B: BILLING & INVOICING TABLES =====================

// Invoices table for billing management
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: integer('user_id').references(() => users.id), // For user-based billing
  
  // Invoice Details
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'
  type: varchar('type', { length: 30 }).notNull().default('monthly'), // 'monthly', 'one-time', 'deposit', 'adjustment'
  
  // Dates
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  
  // Financial Details
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).default('0'),
  balanceDue: numeric('balance_due', { precision: 12, scale: 2 }).default('0'),
  
  // Billing Information
  billingName: varchar('billing_name', { length: 255 }),
  billingEmail: varchar('billing_email', { length: 255 }),
  billingPhone: varchar('billing_phone', { length: 50 }),
  billingAddress: jsonb('billing_address').$type<{
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  }>(),
  
  // Payment Information
  paymentMethod: varchar('payment_method', { length: 50 }), // 'credit_card', 'ach', 'check', 'cash', 'wire'
  paymentReference: varchar('payment_reference', { length: 255 }), // Transaction ID, check number, etc.
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
  
  // Notes and Metadata
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  terms: text('terms'),
  
  // Automated Billing
  recurringScheduleId: integer('recurring_schedule_id'),
  
  // Timestamps
  sentAt: timestamp('sent_at'),
  reminderSentAt: timestamp('reminder_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('invoices_community_id_idx').on(table.communityId),
  index('invoices_user_id_idx').on(table.userId),
  index('invoices_status_idx').on(table.status),
  index('invoices_due_date_idx').on(table.dueDate),
  index('invoices_invoice_number_idx').on(table.invoiceNumber)
]);

export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Invoice Items table for line items
export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  
  // Item Details
  itemType: varchar('item_type', { length: 50 }).notNull(), // 'room_rent', 'care_services', 'meals', 'medication', 'supplies', 'other'
  description: text('description').notNull(),
  
  // Pricing
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  
  // Tax and Discounts
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).default('0'),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  
  // Service Period
  serviceStartDate: date('service_start_date'),
  serviceEndDate: date('service_end_date'),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('invoice_items_invoice_id_idx').on(table.invoiceId),
  index('invoice_items_item_type_idx').on(table.itemType)
]);

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems)
  .omit({ id: true, createdAt: true });
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Billing Schedules for automated recurring billing
export const billingSchedules = pgTable('billing_schedules', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: integer('user_id').references(() => users.id), // For user-based billing
  
  // Schedule Details
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'paused', 'cancelled', 'completed'
  frequency: varchar('frequency', { length: 20 }).notNull(), // 'monthly', 'quarterly', 'semi-annual', 'annual'
  
  // Billing Details
  billingDay: integer('billing_day'), // Day of month (1-31)
  nextBillingDate: date('next_billing_date').notNull(),
  lastBillingDate: date('last_billing_date'),
  
  // Amounts
  baseAmount: numeric('base_amount', { precision: 10, scale: 2 }).notNull(),
  
  // Schedule Period
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  
  // Items Template (what to include in each invoice)
  itemsTemplate: jsonb('items_template').$type<Array<{
    itemType: string;
    description: string;
    amount: number;
    quantity?: number;
  }>>().default([]),
  
  // Auto-send Settings
  autoSend: boolean('auto_send').default(true),
  sendDaysBefore: integer('send_days_before').default(5), // Send invoice X days before due
  
  // Payment Settings
  autoCharge: boolean('auto_charge').default(false),
  paymentMethodId: varchar('payment_method_id', { length: 255 }), // Stripe payment method
  
  // Metadata
  notes: text('notes'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
}, (table) => [
  index('billing_schedules_community_id_idx').on(table.communityId),
  index('billing_schedules_user_id_idx').on(table.userId),
  index('billing_schedules_status_idx').on(table.status),
  index('billing_schedules_next_billing_date_idx').on(table.nextBillingDate)
]);

export const insertBillingScheduleSchema = createInsertSchema(billingSchedules)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBillingSchedule = z.infer<typeof insertBillingScheduleSchema>;
export type BillingSchedule = typeof billingSchedules.$inferSelect;

// Accounts Receivable for tracking outstanding balances
export const accountsReceivable = pgTable('accounts_receivable', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: integer('user_id').references(() => users.id), // For user-based billing
  
  // Account Details
  accountNumber: varchar('account_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('current'), // 'current', '30_days', '60_days', '90_days', '120_plus', 'collections'
  
  // Balances
  currentBalance: numeric('current_balance', { precision: 12, scale: 2 }).notNull().default('0'),
  pastDue30: numeric('past_due_30', { precision: 12, scale: 2 }).default('0'),
  pastDue60: numeric('past_due_60', { precision: 12, scale: 2 }).default('0'),
  pastDue90: numeric('past_due_90', { precision: 12, scale: 2 }).default('0'),
  pastDue120Plus: numeric('past_due_120_plus', { precision: 12, scale: 2 }).default('0'),
  totalOutstanding: numeric('total_outstanding', { precision: 12, scale: 2 }).notNull().default('0'),
  
  // Credit Information
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }),
  availableCredit: numeric('available_credit', { precision: 12, scale: 2 }),
  
  // Last Activity
  lastPaymentDate: date('last_payment_date'),
  lastPaymentAmount: numeric('last_payment_amount', { precision: 10, scale: 2 }),
  lastInvoiceDate: date('last_invoice_date'),
  
  // Collections
  inCollections: boolean('in_collections').default(false),
  collectionAgency: varchar('collection_agency', { length: 255 }),
  collectionStartDate: date('collection_start_date'),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('accounts_receivable_community_id_idx').on(table.communityId),
  index('accounts_receivable_user_id_idx').on(table.userId),
  index('accounts_receivable_status_idx').on(table.status),
  index('accounts_receivable_account_number_idx').on(table.accountNumber)
]);

export const insertAccountsReceivableSchema = createInsertSchema(accountsReceivable)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAccountsReceivable = z.infer<typeof insertAccountsReceivableSchema>;
export type AccountsReceivable = typeof accountsReceivable.$inferSelect;

// Community Features - Feature flag management for subscription tiers
export const communityFeatures = pgTable('community_features', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  featureKey: varchar('feature_key', { length: 100 }).notNull(),
  enabled: boolean('enabled').default(true),
  value: jsonb('value'), // Can store any type of value (number, string, object)
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('community_features_community_idx').on(table.communityId),
  index('community_features_key_idx').on(table.featureKey),
  index('community_features_enabled_idx').on(table.enabled),
  // Unique constraint on community + feature combination
  index('community_features_unique').on(table.communityId, table.featureKey)
]);

// Feature Usage Tracking - Track usage for metered features
export const featureUsageTracking = pgTable('feature_usage_tracking', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  featureKey: varchar('feature_key', { length: 100 }).notNull(),
  usageCount: integer('usage_count').notNull().default(1),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({})
}, (table) => [
  index('usage_tracking_community_idx').on(table.communityId),
  index('usage_tracking_feature_idx').on(table.featureKey),
  index('usage_tracking_timestamp_idx').on(table.timestamp)
]);

export type CommunityFeature = typeof communityFeatures.$inferSelect;
export type InsertCommunityFeature = typeof communityFeatures.$inferInsert;
export type FeatureUsage = typeof featureUsageTracking.$inferSelect;
export type InsertFeatureUsage = typeof featureUsageTracking.$inferInsert;

// ============================================
// PHASE 5B WEEK 2: RESIDENT & FAMILY FEATURES
// ============================================

// Resident Mobile App - User profiles for mobile app
export const residentProfiles = pgTable('resident_profiles', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id).notNull(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  
  // Personal Information
  roomNumber: varchar('room_number', { length: 50 }),
  careLevel: varchar('care_level', { length: 50 }), // 'independent', 'assisted', 'memory_care', 'skilled_nursing'
  admissionDate: date('admission_date'),
  
  // Emergency Contacts
  emergencyContacts: jsonb('emergency_contacts').$type<Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }>>().default([]),
  
  // Medical Information
  allergies: text('allergies').array().default([]),
  medications: jsonb('medications').$type<Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribedBy: string;
  }>>().default([]),
  dietaryRestrictions: text('dietary_restrictions').array().default([]),
  mobilityStatus: varchar('mobility_status', { length: 50 }), // 'independent', 'walker', 'wheelchair', 'bedridden'
  
  // Preferences
  preferredActivities: text('preferred_activities').array().default([]),
  communicationPreferences: jsonb('communication_preferences').$type<{
    preferredLanguage?: string;
    hearingImpaired?: boolean;
    visualImpaired?: boolean;
    preferredContactMethod?: string;
  }>().default({}),
  
  // Mobile App Settings
  deviceTokens: jsonb('device_tokens').$type<Array<{
    platform: 'ios' | 'android';
    token: string;
    lastActive: Date;
  }>>().default([]),
  appSettings: jsonb('app_settings').$type<{
    notificationsEnabled: boolean;
    locationSharingEnabled: boolean;
    emergencyAlertEnabled: boolean;
    activityReminders: boolean;
    medicationReminders: boolean;
    mealReminders: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    highContrast: boolean;
  }>().default({
    notificationsEnabled: true,
    locationSharingEnabled: false,
    emergencyAlertEnabled: true,
    activityReminders: true,
    medicationReminders: true,
    mealReminders: true,
    fontSize: 'medium',
    highContrast: false
  }),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('active'), // 'active', 'inactive', 'transferred', 'discharged'
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('resident_profiles_user_idx').on(table.userId),
  index('resident_profiles_community_idx').on(table.communityId),
  index('resident_profiles_status_idx').on(table.status)
]);

export const insertResidentProfileSchema = createInsertSchema(residentProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResidentProfile = z.infer<typeof insertResidentProfileSchema>;
export type ResidentProfile = typeof residentProfiles.$inferSelect;

// Family Communication Portal - Messages between families and residents
export const familyMessages = pgTable('family_messages', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  
  // Participants
  senderId: varchar('sender_id').references(() => users.id).notNull(),
  recipientId: varchar('recipient_id').references(() => users.id),
  recipientGroupId: integer('recipient_group_id'), // For group messages
  
  // Message Content
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 50 }).notNull().default('text'), // 'text', 'photo', 'video', 'voice', 'document'
  attachments: jsonb('attachments').$type<Array<{
    type: string;
    url: string;
    thumbnail?: string;
    size: number;
    filename: string;
  }>>().default([]),
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('sent'), // 'draft', 'sent', 'delivered', 'read'
  readAt: timestamp('read_at'),
  
  // Threading
  threadId: varchar('thread_id', { length: 100 }),
  replyToId: integer('reply_to_id'),
  
  // Priority & Tags
  priority: varchar('priority', { length: 20 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
  tags: text('tags').array().default([]),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('family_messages_community_idx').on(table.communityId),
  index('family_messages_sender_idx').on(table.senderId),
  index('family_messages_recipient_idx').on(table.recipientId),
  index('family_messages_thread_idx').on(table.threadId),
  index('family_messages_status_idx').on(table.status)
]);

export const insertFamilyMessageSchema = createInsertSchema(familyMessages)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFamilyMessage = z.infer<typeof insertFamilyMessageSchema>;
export type FamilyMessage = typeof familyMessages.$inferSelect;

// Video Calling Sessions
export const videoCallSessions = pgTable('video_call_sessions', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  
  // Session Details
  sessionId: varchar('session_id', { length: 100 }).notNull().unique(),
  roomName: varchar('room_name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull().default('jitsi'), // 'jitsi', 'zoom', 'teams', 'webrtc'
  
  // Participants
  hostId: varchar('host_id').references(() => users.id).notNull(),
  participants: jsonb('participants').$type<Array<{
    userId: string;
    userName: string;
    joinedAt: Date;
    leftAt?: Date;
    deviceType: string;
  }>>().default([]),
  maxParticipants: integer('max_participants').default(10),
  
  // Scheduling
  scheduledAt: timestamp('scheduled_at'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  duration: integer('duration'), // in seconds
  
  // Status & Settings
  status: varchar('status', { length: 20 }).notNull().default('scheduled'), // 'scheduled', 'active', 'completed', 'cancelled'
  isRecorded: boolean('is_recorded').default(false),
  recordingUrl: varchar('recording_url', { length: 500 }),
  
  // Access Control
  accessCode: varchar('access_code', { length: 20 }),
  requiresApproval: boolean('requires_approval').default(false),
  
  // Metadata
  purpose: varchar('purpose', { length: 100 }), // 'family_visit', 'medical_consultation', 'activity', 'celebration'
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('video_sessions_community_idx').on(table.communityId),
  index('video_sessions_host_idx').on(table.hostId),
  index('video_sessions_status_idx').on(table.status),
  index('video_sessions_scheduled_idx').on(table.scheduledAt),
  index('video_sessions_session_id_idx').on(table.sessionId)
]);

export const insertVideoCallSessionSchema = createInsertSchema(videoCallSessions)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideoCallSession = z.infer<typeof insertVideoCallSessionSchema>;
export type VideoCallSession = typeof videoCallSessions.$inferSelect;

// Budget Planning & Variance Tracking
export const budgetPlans = pgTable('budget_plans', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  
  // Budget Information
  budgetName: varchar('budget_name', { length: 255 }).notNull(),
  fiscalYear: integer('fiscal_year').notNull(),
  quarter: integer('quarter'), // 1-4
  month: integer('month'), // 1-12
  
  // Budget Categories
  categories: jsonb('categories').$type<Array<{
    categoryId: string;
    categoryName: string;
    parentCategory?: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
    notes?: string;
  }>>().default([]),
  
  // Revenue Budget
  revenueItems: jsonb('revenue_items').$type<Array<{
    itemId: string;
    itemName: string;
    source: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    recurringType?: 'one-time' | 'monthly' | 'quarterly' | 'annual';
  }>>().default([]),
  
  // Expense Budget
  expenseItems: jsonb('expense_items').$type<Array<{
    itemId: string;
    itemName: string;
    category: string;
    vendor?: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    isFixed: boolean;
    recurringType?: 'one-time' | 'monthly' | 'quarterly' | 'annual';
  }>>().default([]),
  
  // Totals
  totalBudgetedRevenue: numeric('total_budgeted_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  totalActualRevenue: numeric('total_actual_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  totalBudgetedExpenses: numeric('total_budgeted_expenses', { precision: 12, scale: 2 }).notNull().default('0'),
  totalActualExpenses: numeric('total_actual_expenses', { precision: 12, scale: 2 }).notNull().default('0'),
  
  // Variance Analysis
  revenueVariance: numeric('revenue_variance', { precision: 12, scale: 2 }).notNull().default('0'),
  expenseVariance: numeric('expense_variance', { precision: 12, scale: 2 }).notNull().default('0'),
  netIncomeVariance: numeric('net_income_variance', { precision: 12, scale: 2 }).notNull().default('0'),
  
  // Forecasting
  forecastedRevenue: numeric('forecasted_revenue', { precision: 12, scale: 2 }),
  forecastedExpenses: numeric('forecasted_expenses', { precision: 12, scale: 2 }),
  forecastConfidence: numeric('forecast_confidence', { precision: 5, scale: 2 }), // 0-100%
  
  // Status & Approval
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft', 'pending_approval', 'approved', 'active', 'closed'
  approvedBy: varchar('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  
  // Notes & Attachments
  notes: text('notes'),
  attachments: jsonb('attachments').$type<Array<{
    filename: string;
    url: string;
    uploadedAt: Date;
  }>>().default([]),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('budget_plans_community_idx').on(table.communityId),
  index('budget_plans_fiscal_year_idx').on(table.fiscalYear),
  index('budget_plans_status_idx').on(table.status),
  index('budget_plans_quarter_idx').on(table.quarter),
  index('budget_plans_month_idx').on(table.month)
]);

export const insertBudgetPlanSchema = createInsertSchema(budgetPlans)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBudgetPlan = z.infer<typeof insertBudgetPlanSchema>;
export type BudgetPlan = typeof budgetPlans.$inferSelect;

// Activity Participation Tracking (for mobile app)
// NOTE: Commented out until activities table is created
/*
export const activityParticipation = pgTable('activity_participation', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residentProfiles.id).notNull(),
  activityId: integer('activity_id').references(() => activitiesEvents.id).notNull(),
  
  // Participation Details
  participationStatus: varchar('participation_status', { length: 20 }).notNull().default('registered'), // 'registered', 'attended', 'missed', 'cancelled'
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  
  // Feedback
  enjoymentRating: integer('enjoyment_rating'), // 1-5
  feedback: text('feedback'),
  
  // Health Monitoring
  vitalsBefore: jsonb('vitals_before').$type<{
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenLevel?: number;
  }>(),
  vitalsAfter: jsonb('vitals_after').$type<{
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenLevel?: number;
  }>(),
  
  // Notes
  staffNotes: text('staff_notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('activity_participation_resident_idx').on(table.residentId),
  index('activity_participation_activity_idx').on(table.activityId),
  index('activity_participation_status_idx').on(table.participationStatus)
]);

*/

// NOTE: Commented out until activities table is created
/*
export const insertActivityParticipationSchema = createInsertSchema(activityParticipation)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertActivityParticipation = z.infer<typeof insertActivityParticipationSchema>;
export type ActivityParticipation = typeof activityParticipation.$inferSelect;
*/

// Week 3: Operational Excellence Tables

// Supply Chain Management
export const communityVendors = pgTable("community_vendors", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  vendorType: varchar("vendor_type", { length: 100 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: text("address"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  rating: integer("rating"),
  status: varchar("status", { length: 50 }).default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  vendorId: integer("vendor_id").references(() => communityVendors.id),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(),
  orderDate: timestamp("order_date").notNull(),
  expectedDelivery: timestamp("expected_delivery"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  approvedBy: varchar("approved_by", { length: 255 }),
  receivedDate: timestamp("received_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  sku: varchar("sku", { length: 100 }),
  quantityOnHand: integer("quantity_on_hand").default(0),
  reorderPoint: integer("reorder_point"),
  reorderQuantity: integer("reorder_quantity"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  location: varchar("location", { length: 255 }),
  vendorId: integer("vendor_id").references(() => communityVendors.id),
  lastOrderDate: timestamp("last_order_date"),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Food Service Management
export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  menuName: varchar("menu_name", { length: 255 }).notNull(),
  mealType: varchar("meal_type", { length: 50 }), // breakfast, lunch, dinner, snack
  menuDate: date("menu_date"),
  weekNumber: integer("week_number"),
  cycleNumber: integer("cycle_number"),
  status: varchar("status", { length: 50 }).default("draft"),
  approvedBy: varchar("approved_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").references(() => menus.id).notNull(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // entree, side, dessert, beverage
  allergens: text("allergens").array(),
  nutritionInfo: jsonb("nutrition_info"),
  cost: decimal("cost", { precision: 8, scale: 2 }),
  preparationTime: integer("preparation_time"), // in minutes
  servingSize: varchar("serving_size", { length: 100 }),
  dietaryFlags: text("dietary_flags").array(), // vegetarian, vegan, gluten-free, etc.
  createdAt: timestamp("created_at").defaultNow()
});

export const mealOrders = pgTable("meal_orders", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  residentId: integer("resident_id").references(() => residentProfiles.id),
  menuItemId: integer("menu_item_id").references(() => menuItems.id),
  mealDate: date("meal_date").notNull(),
  mealType: varchar("meal_type", { length: 50 }),
  specialRequests: text("special_requests"),
  deliveryLocation: varchar("delivery_location", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Energy & Utility Tracking
export const utilityMeters = pgTable("utility_meters", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  meterType: varchar("meter_type", { length: 50 }).notNull(), // electric, gas, water, sewer
  meterNumber: varchar("meter_number", { length: 100 }),
  location: varchar("location", { length: 255 }),
  provider: varchar("provider", { length: 255 }),
  accountNumber: varchar("account_number", { length: 100 }),
  installDate: date("install_date"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow()
});

export const utilityReadings = pgTable("utility_readings", {
  id: serial("id").primaryKey(),
  meterId: integer("meter_id").references(() => utilityMeters.id).notNull(),
  readingDate: timestamp("reading_date").notNull(),
  readingValue: decimal("reading_value", { precision: 15, scale: 3 }),
  usage: decimal("usage", { precision: 15, scale: 3 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  billingPeriodStart: date("billing_period_start"),
  billingPeriodEnd: date("billing_period_end"),
  peakDemand: decimal("peak_demand", { precision: 10, scale: 3 }),
  powerFactor: decimal("power_factor", { precision: 5, scale: 3 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const energyTargets = pgTable("energy_targets", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  targetYear: integer("target_year").notNull(),
  targetMonth: integer("target_month"),
  utilityType: varchar("utility_type", { length: 50 }),
  targetUsage: decimal("target_usage", { precision: 15, scale: 3 }),
  targetCost: decimal("target_cost", { precision: 10, scale: 2 }),
  reductionPercentage: decimal("reduction_percentage", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Predictive Maintenance
export const maintenanceAssets = pgTable("maintenance_assets", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  assetType: varchar("asset_type", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  model: varchar("model", { length: 255 }),
  serialNumber: varchar("serial_number", { length: 255 }),
  installDate: date("install_date"),
  warrantyExpiry: date("warranty_expiry"),
  location: varchar("location", { length: 255 }),
  criticality: varchar("criticality", { length: 50 }), // critical, high, medium, low
  maintenanceFrequency: integer("maintenance_frequency"), // days between maintenance
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  status: varchar("status", { length: 50 }).default("operational"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const maintenanceWorkOrders = pgTable("maintenance_work_orders", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  assetId: integer("asset_id").references(() => maintenanceAssets.id),
  workOrderNumber: varchar("work_order_number", { length: 100 }).notNull().unique(),
  workType: varchar("work_type", { length: 50 }), // preventive, corrective, emergency
  priority: varchar("priority", { length: 50 }),
  description: text("description"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  laborHours: decimal("labor_hours", { precision: 6, scale: 2 }),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Transportation Management
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  vehicleNumber: varchar("vehicle_number", { length: 100 }).notNull(),
  make: varchar("make", { length: 100 }),
  model: varchar("model", { length: 100 }),
  year: integer("year"),
  licensePlate: varchar("license_plate", { length: 50 }),
  vin: varchar("vin", { length: 50 }),
  capacity: integer("capacity"),
  wheelchairAccessible: boolean("wheelchair_accessible").default(false),
  mileage: integer("mileage"),
  lastServiceDate: date("last_service_date"),
  nextServiceDue: date("next_service_due"),
  insuranceExpiry: date("insurance_expiry"),
  registrationExpiry: date("registration_expiry"),
  status: varchar("status", { length: 50 }).default("available"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const transportationTrips = pgTable("transportation_trips", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  driverId: varchar("driver_id", { length: 255 }),
  tripDate: timestamp("trip_date").notNull(),
  departureTime: time("departure_time"),
  returnTime: time("return_time"),
  destination: varchar("destination", { length: 500 }),
  purpose: varchar("purpose", { length: 255 }),
  passengerCount: integer("passenger_count"),
  mileage: decimal("mileage", { precision: 8, scale: 2 }),
  fuelCost: decimal("fuel_cost", { precision: 8, scale: 2 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const tripPassengers = pgTable("trip_passengers", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => transportationTrips.id).notNull(),
  residentId: integer("resident_id").references(() => residentProfiles.id),
  pickupLocation: varchar("pickup_location", { length: 255 }),
  dropoffLocation: varchar("dropoff_location", { length: 255 }),
  specialNeeds: text("special_needs"),
  status: varchar("status", { length: 50 }).default("confirmed"),
  createdAt: timestamp("created_at").defaultNow()
});

// ==================== PHASE 5b WEEK 4: MARKETING ENHANCEMENT ====================

// Marketing Campaigns (Overall)
export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'awareness', 'conversion', 'retention', 'seasonal'
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  budget: real('budget'),
  spentAmount: real('spent_amount').default(0),
  goals: jsonb('goals').default('{}'), // target metrics
  channels: text('channels').array(), // ['email', 'social', 'ppc', 'content']
  status: varchar('status', { length: 50 }).notNull().default('planning'), // 'planning', 'active', 'paused', 'completed'
  results: jsonb('results').default('{}'),
  roi: real('roi'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Email Campaign Management
export const emailCampaigns = pgTable('email_campaigns', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  templateId: varchar('template_id', { length: 100 }),
  htmlContent: text('html_content'),
  textContent: text('text_content'),
  recipientSegment: varchar('recipient_segment', { length: 100 }).notNull(), // 'all', 'leads', 'families', 'prospects'
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft', 'scheduled', 'sending', 'sent', 'paused'
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  metrics: jsonb('metrics').default('{}'), // opens, clicks, bounces, unsubscribes
  abTestingEnabled: boolean('ab_testing_enabled').default(false),
  variantB: jsonb('variant_b'), // Alternative subject/content for A/B testing
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Lead Nurturing Workflows
export const leadWorkflows = pgTable('lead_workflows', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  triggerType: varchar('trigger_type', { length: 100 }).notNull(), // 'form_submission', 'tour_scheduled', 'inquiry', 'time_based'
  isActive: boolean('is_active').default(true),
  steps: jsonb('steps').notNull().default('[]'), // Array of workflow steps
  enrollmentCriteria: jsonb('enrollment_criteria').default('{}'),
  exitCriteria: jsonb('exit_criteria').default('{}'),
  metrics: jsonb('metrics').default('{}'), // conversion rates, engagement
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Lead Workflow Enrollments
export const workflowEnrollments = pgTable('workflow_enrollments', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').notNull().references(() => leadWorkflows.id),
  leadId: integer('lead_id').notNull(),
  currentStep: integer('current_step').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'completed', 'exited', 'paused'
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  stepHistory: jsonb('step_history').default('[]'),
  engagementScore: integer('engagement_score').default(0)
});

// Virtual Tours
export const virtualTours = pgTable('virtual_tours', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  title: varchar('title', { length: 255 }).notNull(),
  tourType: varchar('tour_type', { length: 50 }).notNull(), // '360', 'video', 'interactive', 'live'
  embedCode: text('embed_code'),
  matterportId: varchar('matterport_id', { length: 100 }),
  videoUrl: varchar('video_url', { length: 500 }),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  duration: integer('duration'), // in seconds
  viewCount: integer('view_count').default(0),
  avgViewDuration: integer('avg_view_duration'), // in seconds
  hotspots: jsonb('hotspots').default('[]'), // Interactive points in tour
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Virtual Tour Analytics
export const tourAnalytics = pgTable('tour_analytics', {
  id: serial('id').primaryKey(),
  tourId: integer('tour_id').notNull().references(() => virtualTours.id),
  visitorId: varchar('visitor_id', { length: 100 }).notNull(),
  leadId: integer('lead_id'),
  startedAt: timestamp('started_at').defaultNow(),
  endedAt: timestamp('ended_at'),
  viewDuration: integer('view_duration'), // in seconds
  completionRate: real('completion_rate'),
  interactions: jsonb('interactions').default('[]'), // clicks, hotspot views
  deviceType: varchar('device_type', { length: 50 }),
  referrer: varchar('referrer', { length: 500 })
});

// Social Media Posts
export const socialMediaPosts = pgTable('social_media_posts', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  platforms: text('platforms').array(), // ['facebook', 'instagram', 'twitter', 'linkedin']
  content: text('content').notNull(),
  mediaUrls: text('media_urls').array(),
  hashtags: text('hashtags').array(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  publishedAt: timestamp('published_at'),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft', 'scheduled', 'published', 'failed'
  engagement: jsonb('engagement').default('{}'), // likes, shares, comments per platform
  campaignId: integer('campaign_id').references(() => marketingCampaigns.id),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Marketing Leads
export const marketingLeads = pgTable('marketing_leads', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  source: varchar('source', { length: 100 }), // 'website', 'social', 'referral', 'ppc', 'organic'
  campaignId: integer('campaign_id').references(() => marketingCampaigns.id),
  stage: varchar('stage', { length: 50 }).notNull().default('new'), // 'new', 'contacted', 'qualified', 'tour_scheduled', 'converted', 'lost'
  score: integer('score').default(0), // Lead scoring
  interests: text('interests').array(),
  preferredContactMethod: varchar('preferred_contact_method', { length: 50 }),
  assignedTo: integer('assigned_to').references(() => users.id),
  lastContactedAt: timestamp('last_contacted_at'),
  convertedAt: timestamp('converted_at'),
  lostReason: varchar('lost_reason', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ROI Tracking
export const roiTracking = pgTable('roi_tracking', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  campaignId: integer('campaign_id').references(() => marketingCampaigns.id),
  channel: varchar('channel', { length: 100 }).notNull(),
  date: date('date').notNull(),
  spend: real('spend').notNull().default(0),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  revenue: real('revenue').default(0),
  costPerClick: real('cost_per_click'),
  costPerConversion: real('cost_per_conversion'),
  conversionRate: real('conversion_rate'),
  roi: real('roi'),
  attribution: jsonb('attribution').default('{}'), // Multi-touch attribution data
  createdAt: timestamp('created_at').defaultNow()
});

// Marketing Automation Rules
export const automationRules = pgTable('automation_rules', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  name: varchar('name', { length: 255 }).notNull(),
  triggerEvent: varchar('trigger_event', { length: 100 }).notNull(),
  conditions: jsonb('conditions').notNull().default('{}'),
  actions: jsonb('actions').notNull().default('[]'),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0),
  executionCount: integer('execution_count').default(0),
  lastExecutedAt: timestamp('last_executed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ==================== PHASE 5b WEEK 4: MARKETING ENHANCEMENT COMPLETE ====================
