import { 
  users, communities, inspections, reviews, reviewHelpfulness, favorites, searchHistory, 
  messages, tours, userSessions, listingFlags, adminUsers, userActivity, leads, leadActivities,
  removalRequests, auditLogs,
  type User, type InsertUser, type UpsertUser, type Community, type InsertCommunity, 
  type Inspection, type InsertInspection, type Review, type InsertReview, 
  type InsertReviewHelpfulness, type SearchCommunity, type Favorite, type InsertFavorite,
  type SearchHistoryEntry, type InsertSearchHistory, type Message, type InsertMessage,
  type Tour, type InsertTour, type UserSession, type ListingFlag, type InsertListingFlag,
  type AdminUser, type InsertAdminUser, type UserActivity, type InsertUserActivity,
  type Lead, type InsertLead, type LeadActivity, type InsertLeadActivity,
  type RemovalRequest, type InsertRemovalRequest,
  chatConversations, chatParticipants, chatMessages,
  type ChatConversation, type InsertChatConversation,
  type ChatParticipant, type InsertChatParticipant,
  type ChatMessage, type InsertChatMessage,
  marketplaceCategories, marketplaceVendors, marketplaceVendorClicks,
  type MarketplaceCategory, type InsertMarketplaceCategory,
  type MarketplaceVendor, type InsertMarketplaceVendor,
  type MarketplaceVendorClick, type InsertMarketplaceVendorClick
} from "@shared/schema";
import { db } from "./db";

// Export db for build compatibility
export { db };
import { eq, like, ilike, gte, and, or, sql, inArray, desc, isNotNull, gt } from "drizzle-orm";
import { zipCodeService } from "./zip-code-mapping";
import { cache } from "./cache";
import { HudDataExtractor } from "./hud-data-extractor";

export interface IStorage {
  // User methods - Updated for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>; // Required for Replit Auth

  // Authentication methods
  createSession(userId: string): Promise<UserSession>;
  getSessionById(sessionId: string): Promise<UserSession | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<void>;

  // Community methods
  getCommunity(id: number): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  getAllCommunitiesForClustering(): Promise<Community[]>;
  getTrendingCommunities(limit?: number): Promise<Community[]>;
  searchCommunities(params: SearchCommunity): Promise<Community[]>;
  searchCommunitiesByName(name: string): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined>;
  deleteCommunity(id: number): Promise<boolean>;

  // Inspection methods
  getInspectionsByCommunity(communityId: number): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;

  // Review methods
  getReviewsByCommunity(communityId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  markReviewHelpful(reviewId: number, userId: number, isHelpful: boolean): Promise<void>;
  getReviewHelpfulness(reviewId: number, userId: number): Promise<boolean | null>;
  moderateReview(id: number, status: string, notes?: string): Promise<Review | undefined>;

  // Favorites methods
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, communityId: number): Promise<boolean>;
  isFavorited(userId: number, communityId: number): Promise<boolean>;

  // Search history methods
  getSearchHistory(userId: number): Promise<SearchHistoryEntry[]>;
  saveSearch(searchHistory: InsertSearchHistory): Promise<SearchHistoryEntry>;
  deleteSearchHistory(userId: number, searchId: number): Promise<boolean>;

  // Messaging methods
  getMessagesByUser(userId: number, type: 'sent' | 'received' | 'all'): Promise<Message[]>;
  getConversation(conversationId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageRead(messageId: number, userId: number): Promise<void>;
  markMessageStarred(messageId: number, userId: number, starred: boolean): Promise<void>;

  // Tour methods
  getToursByUser(userId: number): Promise<Tour[]>;
  getToursByCommunity(communityId: number): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, updates: Partial<InsertTour>): Promise<Tour | undefined>;
  cancelTour(id: number): Promise<boolean>;

  // Listing flag methods
  createListingFlag(flag: InsertListingFlag): Promise<ListingFlag>;
  getListingFlags(params: { status?: string; page?: number; limit?: number }): Promise<ListingFlag[]>;
  updateListingFlag(id: number, updates: Partial<InsertListingFlag>): Promise<ListingFlag | undefined>;

  // Enhanced favorites methods
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  getUserFavorites(userId: number): Promise<Favorite[]>;
  removeFromFavorites(userId: number, communityId: number): Promise<boolean>;
  updateFavoriteNotes(userId: number, communityId: number, notes: string): Promise<boolean>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: number): Promise<Message[]>;

  // User activity methods
  trackUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivity(userId: number, limit: number): Promise<UserActivity[]>;

  // Admin methods
  getAdminAnalytics(): Promise<any>;
  getRecentActivity(limit: number): Promise<UserActivity[]>;

  // CRM methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(params: { status?: string; priority?: string; page?: number; limit?: number }): Promise<Lead[]>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  addLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;

  // Claim system methods
  createClaim(claim: any): Promise<any>;
  updateCommunityPricing(communityId: number, pricingData: any): Promise<void>;
  updateCommunityAvailability(communityId: number, availabilityData: any): Promise<void>;

  // Consolidated homepage data
  getHomepageData(): Promise<{
    totalCommunities: number;
    trendingCommunities: Community[];
    coastalCommunities: Community[];
    locationCommunities: {
      [key: string]: Community[];
    };
  }>;
  
  // Super admin count
  getSuperAdminCount(): Promise<number>;

  // Search suggestions
  getSearchSuggestions(query: string): Promise<string[]>;

  // Messaging operations
  createConversation(data: InsertChatConversation, participantIds: string[]): Promise<ChatConversation>;
  getConversationsByUser(userId: string): Promise<Array<ChatConversation & { unreadCount: number; lastMessage?: ChatMessage }>>;
  getConversationById(conversationId: number, userId: string): Promise<ChatConversation | undefined>;
  addParticipantToConversation(conversationId: number, userId: string, role?: string): Promise<ChatParticipant>;
  removeParticipantFromConversation(conversationId: number, userId: string): Promise<void>;
  
  sendMessage(data: InsertChatMessage): Promise<ChatMessage>;
  getMessagesByConversation(conversationId: number, limit?: number, offset?: number): Promise<ChatMessage[]>;
  markMessagesAsRead(conversationId: number, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  deleteMessage(messageId: number, userId: string): Promise<void>;
  editMessage(messageId: number, userId: string, newContent: string): Promise<ChatMessage | undefined>;

  // Marketplace vendor methods
  getMarketplaceCategories(): Promise<MarketplaceCategory[]>;
  getMarketplaceCategoryBySlug(slug: string): Promise<MarketplaceCategory | undefined>;
  createMarketplaceCategory(category: InsertMarketplaceCategory): Promise<MarketplaceCategory>;
  updateMarketplaceCategory(id: number, updates: Partial<InsertMarketplaceCategory>): Promise<MarketplaceCategory | undefined>;
  
  getMarketplaceVendors(params?: { categoryId?: number; featured?: boolean; hidden?: boolean }): Promise<MarketplaceVendor[]>;
  getMarketplaceVendorBySlug(slug: string): Promise<MarketplaceVendor | undefined>;
  createMarketplaceVendor(vendor: InsertMarketplaceVendor): Promise<MarketplaceVendor>;
  updateMarketplaceVendor(id: number, updates: Partial<InsertMarketplaceVendor>): Promise<MarketplaceVendor | undefined>;
  deleteMarketplaceVendor(id: number): Promise<boolean>;
  
  trackMarketplaceVendorClick(click: InsertMarketplaceVendorClick): Promise<MarketplaceVendorClick>;
  getMarketplaceVendorClicks(vendorId: number, days?: number): Promise<MarketplaceVendorClick[]>;
  getMarketplaceAnalytics(): Promise<{
    totalVendors: number;
    totalClicks: number;
    topVendors: Array<{ vendor: MarketplaceVendor; clicks: number }>;
    categoryBreakdown: Array<{ category: MarketplaceCategory; vendorCount: number; totalClicks: number }>;
  }>;

  // Removal request methods
  createRemovalRequest(request: InsertRemovalRequest): Promise<RemovalRequest>;
  getRemovalRequests(params?: { status?: string; requestType?: string }): Promise<RemovalRequest[]>;
  getRemovalRequestById(id: number): Promise<RemovalRequest | undefined>;
  updateRemovalRequest(id: number, updates: Partial<RemovalRequest>): Promise<RemovalRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private communities: Map<number, Community>;
  private inspections: Map<number, Inspection>;
  private currentUserId: number;
  private currentCommunityId: number;
  private currentInspectionId: number;

  constructor() {
    this.users = new Map();
    this.communities = new Map();
    this.inspections = new Map();
    this.currentUserId = 1;
    this.currentCommunityId = 1;
    this.currentInspectionId = 1;
    
    // No sample data - only real data allowed
  }

  // NO SAMPLE DATA - GOLDEN DATA RULE ENFORCED

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || `user_${this.currentUserId++}`;
    const user: User = { 
      ...insertUser, 
      id,
      phone: insertUser.phone || null,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      username: insertUser.username || null,
      password: insertUser.password || null,
      dateOfBirth: insertUser.dateOfBirth || null,
      relationshipToCare: insertUser.relationshipToCare || null,
      careNeeds: insertUser.careNeeds || [],
      searchPreferences: insertUser.searchPreferences || {},
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      notifications: insertUser.notifications || {
        emailNotifications: true,
        smsNotifications: false,
        newListings: false,
        priceAlerts: false,
        messageAlerts: true,
        reviewReminders: false,
      },
      dashboardPreferences: insertUser.dashboardPreferences || {
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
      },
      emailVerified: insertUser.emailVerified || false,
      emailVerificationToken: insertUser.emailVerificationToken || null,
      passwordResetToken: insertUser.passwordResetToken || null,
      passwordResetExpires: insertUser.passwordResetExpires || null,
      lastLoginAt: insertUser.lastLoginAt || null,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      createdAt: insertUser.createdAt || new Date(),
      updatedAt: insertUser.updatedAt || new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = this.users.get(user.id);
    if (existingUser) {
      return this.updateUser(user.id, user) as Promise<User>;
    } else {
      return this.createUser(user);
    }
  }

  // Session management implementation
  private sessions = new Map<string, UserSession>();
  private currentSessionId = 1;

  async createSession(userId: string): Promise<UserSession> {
    const sessionId = `sess_${this.currentSessionId++}`;
    const session: UserSession = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<UserSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }
  async getReviewsByCommunity(): Promise<any[]> { return []; }
  async getReviewsByUser(): Promise<any[]> { return []; }
  async createReview(): Promise<any> { throw new Error("Not implemented"); }
  async updateReview(): Promise<any> { throw new Error("Not implemented"); }
  async deleteReview(): Promise<boolean> { throw new Error("Not implemented"); }
  async markReviewHelpful(): Promise<void> { throw new Error("Not implemented"); }
  async getReviewHelpfulness(): Promise<boolean | null> { return null; }
  async moderateReview(): Promise<any> { throw new Error("Not implemented"); }
  async getFavoritesByUser(): Promise<any[]> { return []; }
  async addFavorite(): Promise<any> { throw new Error("Not implemented"); }
  async removeFavorite(): Promise<boolean> { throw new Error("Not implemented"); }
  async isFavorited(): Promise<boolean> { return false; }
  async getSearchHistory(userId: number): Promise<SearchHistoryEntry[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(sql`${searchHistory.createdAt} DESC`)
      .limit(20);
  }
  async saveSearch(insertSearch: InsertSearchHistory): Promise<SearchHistoryEntry> {
    const [search] = await db
      .insert(searchHistory)
      .values(insertSearch)
      .returning();
    return search;
  }
  async deleteSearchHistory(userId: number, searchId: number): Promise<boolean> {
    const result = await db
      .delete(searchHistory)
      .where(and(
        eq(searchHistory.userId, userId),
        eq(searchHistory.id, searchId)
      ));
    return (result.rowCount || 0) > 0;
  }
  async getMessagesByUser(): Promise<any[]> { return []; }
  async getConversation(): Promise<any[]> { return []; }
  async sendMessage(): Promise<any> { throw new Error("Not implemented"); }
  async markMessageRead(): Promise<void> { throw new Error("Not implemented"); }
  async markMessageStarred(): Promise<void> { throw new Error("Not implemented"); }
  async getToursByUser(userId: number): Promise<Tour[]> {
    return await db
      .select({
        id: tours.id,
        userId: tours.userId,
        communityId: tours.communityId,
        tourDate: tours.tourDate,
        tourTime: tours.tourTime,
        status: tours.status,
        notes: tours.notes,
        createdAt: tours.createdAt,
        updatedAt: tours.updatedAt,
        community: {
          id: communities.id,
          name: communities.name,
          address: communities.address,
          city: communities.city,
          state: communities.state,
          phone: communities.phone,
          website: communities.website,
          photos: communities.photos,
          rating: communities.rating,
          reviewCount: communities.reviewCount,
          careTypes: communities.careTypes,
          priceRange: communities.priceRange,
        }
      })
      .from(tours)
      .leftJoin(communities, eq(tours.communityId, communities.id))
      .where(eq(tours.userId, userId))
      .orderBy(tours.tourDate);
  }
  async getToursByCommunity(): Promise<any[]> { return []; }
  async createTour(insertTour: InsertTour): Promise<Tour> {
    const [tour] = await db
      .insert(tours)
      .values(insertTour)
      .returning();
    return tour;
  }
  async updateTour(id: number, updates: Partial<InsertTour>): Promise<Tour | undefined> {
    const [tour] = await db
      .update(tours)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tours.id, id))
      .returning();
    return tour;
  }
  async cancelTour(id: number): Promise<boolean> {
    const [tour] = await db
      .update(tours)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(tours.id, id))
      .returning();
    return !!tour;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async getCommunityByName(name: string): Promise<Community | undefined> {
    return Array.from(this.communities.values()).find(
      (community) => community.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getAllCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }

  async getTrendingCommunities(limit: number = 8): Promise<Community[]> {
    // For in-memory storage, simulate the same logic
    const communities = Array.from(this.communities.values());
    
    return communities
      .filter(c => c.latitude && c.longitude && c.googleRating && c.googleRating > 3.0)
      .sort((a, b) => {
        const aScore = (a.googleRating || 0) * (a.googleReviewCount || 1);
        const bScore = (b.googleRating || 0) * (b.googleReviewCount || 1);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  async searchCommunitiesByName(name: string): Promise<Community[]> {
    const searchTerm = name.toLowerCase().trim();
    const results = Array.from(this.communities.values()).filter(community => 
      community.name.toLowerCase().includes(searchTerm)
    );
    return results.slice(0, 10); // Limit to 10 results for performance
  }

  async searchCommunities(params: SearchCommunity): Promise<Community[]> {
    let results = Array.from(this.communities.values());

    if (params.careType && params.careType !== "All Types") {
      results = results.filter(community => 
        community.careTypes.includes(params.careType!)
      );
    }

    if (params.location) {
      // Simple text search in city, state, or zip
      const searchTerm = params.location.toLowerCase();
      results = results.filter(community =>
        community.city.toLowerCase().includes(searchTerm) ||
        community.state.toLowerCase().includes(searchTerm) ||
        community.zipCode.includes(searchTerm)
      );
    }

    if (params.minRating) {
      results = results.filter(community =>
        parseFloat(community.rating || "0") >= params.minRating!
      );
    }

    if (params.amenities && params.amenities.length > 0) {
      results = results.filter(community =>
        community.amenities && params.amenities!.some(amenity => community.amenities.includes(amenity))
      );
    }

    if (params.availability && params.availability !== "All Status") {
      results = results.filter(community =>
        community.availabilityStatus === params.availability
      );
    }

    return results;
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const id = this.currentCommunityId++;
    const community: Community = {
      ...insertCommunity,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.communities.set(id, community);
    return community;
  }

  async updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined> {
    const community = this.communities.get(id);
    if (!community) return undefined;

    const updatedCommunity: Community = {
      ...community,
      ...updates,
      updatedAt: new Date(),
    };
    this.communities.set(id, updatedCommunity);
    return updatedCommunity;
  }

  async deleteCommunity(id: number): Promise<boolean> {
    return this.communities.delete(id);
  }

  async getInspectionsByCommunity(communityId: number): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(
      inspection => inspection.communityId === communityId
    );
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const id = this.currentInspectionId++;
    const inspection: Inspection = {
      ...insertInspection,
      id,
      createdAt: new Date(),
    };
    this.inspections.set(id, inspection);
    return inspection;
  }

  // Implement all missing IStorage methods to fix compilation errors
  async getAllCommunitiesForClustering(): Promise<Community[]> {
    return Array.from(this.communities.values()).filter(c => c.latitude && c.longitude);
  }

  async createListingFlag(flag: InsertListingFlag): Promise<ListingFlag> {
    return { ...flag, id: Date.now(), createdAt: new Date(), updatedAt: new Date() } as ListingFlag;
  }

  async getListingFlags(params: { status?: string; page?: number; limit?: number }): Promise<ListingFlag[]> {
    return [];
  }

  async updateListingFlag(id: number, updates: Partial<InsertListingFlag>): Promise<ListingFlag | undefined> {
    return undefined;
  }

  async createConversation(data: InsertChatConversation, participantIds: string[]): Promise<ChatConversation> {
    return { ...data, id: Date.now() } as ChatConversation;
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    return [];
  }

  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return { ...message, id: Date.now() } as ChatMessage;
  }

  async getMessages(conversationId: number): Promise<ChatMessage[]> {
    return [];
  }

  async updateMessageReadStatus(messageId: number, readByUserId: string): Promise<void> {}

  async getSuperAdminCount(): Promise<number> {
    return Array.from(this.users.values()).filter(u => u.role === 'super_admin').length;
  }

  async updateMarketplaceVendor(id: number, updates: Partial<InsertMarketplaceVendor>): Promise<MarketplaceVendor | undefined> {
    return undefined;
  }

  async deleteMarketplaceVendor(id: number): Promise<boolean> {
    return false;
  }

  async trackMarketplaceVendorClick(click: InsertMarketplaceVendorClick): Promise<MarketplaceVendorClick> {
    return { ...click, id: Date.now(), createdAt: new Date() } as MarketplaceVendorClick;
  }

  async getMarketplaceVendorClicks(vendorId: number, days?: number): Promise<MarketplaceVendorClick[]> {
    return [];
  }

  async getMarketplaceAnalytics(): Promise<{
    totalVendors: number;
    totalClicks: number;
    topVendors: Array<{ vendor: MarketplaceVendor; clicks: number }>;
    categoryBreakdown: Array<{ category: MarketplaceCategory; vendorCount: number; totalClicks: number }>;
  }> {
    return {
      totalVendors: 0,
      totalClicks: 0,
      topVendors: [],
      categoryBreakdown: []
    };
  }

  async createRemovalRequest(request: InsertRemovalRequest): Promise<RemovalRequest> {
    return { ...request, id: Date.now(), createdAt: new Date(), updatedAt: new Date() } as RemovalRequest;
  }

  async getRemovalRequests(params?: { status?: string; requestType?: string }): Promise<RemovalRequest[]> {
    return [];
  }

  async getRemovalRequestById(id: number): Promise<RemovalRequest | undefined> {
    return undefined;
  }

  async updateRemovalRequest(id: number, updates: Partial<RemovalRequest>): Promise<RemovalRequest | undefined> {
    return undefined;
  }

  async getCommunityPhotoUrls(communityId: number): Promise<string[]> {
    return [];
  }

  async searchCommunitiesWithCoordinates(params: any): Promise<any> {
    return { communities: [], total: 0 };
  }

  async getCommunitiesByIds(ids: number[]): Promise<Community[]> {
    return [];
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    return [];
  }

  async getToursForUser(userId: string): Promise<Tour[]> {
    return [];
  }

  async getTourById(id: number): Promise<Tour | undefined> {
    return undefined;
  }

  async deleteTour(id: number): Promise<boolean> {
    return false;
  }

  async createMarketplaceCategory(category: InsertMarketplaceCategory): Promise<MarketplaceCategory> {
    return { ...category, id: Date.now() } as MarketplaceCategory;
  }

  async updateMarketplaceCategory(id: number, updates: Partial<InsertMarketplaceCategory>): Promise<MarketplaceCategory | undefined> {
    return undefined;
  }

  async getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
    return [];
  }

  async getMarketplaceCategoryBySlug(slug: string): Promise<MarketplaceCategory | undefined> {
    return undefined;
  }

  async getMarketplaceVendors(params?: { categoryId?: number; featured?: boolean; hidden?: boolean }): Promise<MarketplaceVendor[]> {
    return [];
  }

  async getMarketplaceVendorBySlug(slug: string): Promise<MarketplaceVendor | undefined> {
    return undefined;
  }

  async createMarketplaceVendor(vendor: InsertMarketplaceVendor): Promise<MarketplaceVendor> {
    return { ...vendor, id: Date.now() } as MarketplaceVendor;
  }

  async getCommunityStats(): Promise<any> {
    return { total: 0, trending: 0 };
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    // Use raw SQL to avoid schema mismatch issues with date_of_birth
    const result = await db.execute(
      sql`SELECT id, email, username, password, role, first_name, last_name, phone, profile_image_url 
          FROM users WHERE id = ${id}`
    );
    const userRow = result.rows[0];
    if (userRow) {
      return {
        id: userRow.id as string,
        email: userRow.email as string,
        username: userRow.username as string,
        password: userRow.password as string,
        role: userRow.role as string,
        firstName: userRow.first_name as string,
        lastName: userRow.last_name as string,
        phone: userRow.phone as string,
        profileImageUrl: userRow.profile_image_url as string
      } as User;
    }
    return undefined;
  }

  async getCommunityByName(name: string): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.name, name));
    return community || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Since our current database only has username, we'll treat email as username
    // Use raw SQL query to avoid schema mismatch issues
    const result = await db.execute(
      sql`SELECT id, username, password, role FROM users WHERE username = ${email}`
    );
    const userRow = result.rows[0];
    if (userRow) {
      return {
        id: userRow.id as number,
        username: userRow.username as string,
        password: userRow.password as string,
        role: userRow.role as string
      } as User;
    }
    return undefined;
  }

  async createUser(insertUser: any): Promise<User> {
    // Handle Replit auth user creation with proper fields
    // If ID is provided and it's not an integer, omit it and let database auto-generate
    const isNumericId = insertUser.id && !isNaN(parseInt(insertUser.id));
    
    const result = await db.execute(
      isNumericId 
        ? sql`INSERT INTO users (id, username, email, password, role, first_name, last_name) 
              VALUES (${insertUser.id}, ${insertUser.username}, ${insertUser.email}, ${insertUser.password || 'replit_auth'}, ${insertUser.role || 'user'}, ${insertUser.firstName || null}, ${insertUser.lastName || null}) 
              RETURNING id, username, email, password, role, first_name, last_name`
        : sql`INSERT INTO users (username, email, password, role, first_name, last_name) 
              VALUES (${insertUser.username}, ${insertUser.email}, ${insertUser.password || 'replit_auth'}, ${insertUser.role || 'user'}, ${insertUser.firstName || null}, ${insertUser.lastName || null}) 
              RETURNING id, username, email, password, role, first_name, last_name`
    );
    
    const userRow = result.rows[0];
    return {
      id: userRow.id as number,
      username: userRow.username as string,
      email: userRow.email as string,
      password: userRow.password as string,
      role: userRow.role as string,
      firstName: userRow.first_name as string,
      lastName: userRow.last_name as string
    } as User;
  }

  async getSuperAdminCount(): Promise<number> {
    try {
      const result = await db.execute(
        sql`SELECT COUNT(*) as count FROM users WHERE role = 'super_admin'`
      );
      return parseInt(result.rows[0].count as string) || 0;
    } catch (error) {
      console.error("Error getting super admin count:", error);
      return 0;
    }
  }

  async updateUser(id: string, updates: Partial<any>): Promise<User | undefined> {
    try {
      // Build update fields dynamically
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (updates.username) {
        updateFields.push(`username = $${paramIndex++}`);
        values.push(updates.username);
      }
      if (updates.email) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }
      if (updates.firstName !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        values.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        values.push(updates.lastName);
      }
      if (updates.password) {
        updateFields.push(`password = $${paramIndex++}`);
        values.push(updates.password);
      }
      if (updates.role) {
        updateFields.push(`role = $${paramIndex++}`);
        values.push(updates.role);
      }
      
      if (updateFields.length === 0) {
        // No updates provided
        return this.getUser(id);
      }
      
      // Add the ID parameter
      values.push(id);
      const idParamIndex = paramIndex; // Use the current index for the WHERE clause
      
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${idParamIndex}
        RETURNING id, username, email, password, role, first_name, last_name
      `;
      
      const result = await db.execute(sql.raw(query, values));
      
      if (result.rows[0]) {
        const row = result.rows[0];
        return {
          id: row.id as string,
          username: row.username as string,
          email: row.email as string,
          password: row.password as string,
          role: row.role as string,
          firstName: row.first_name as string,
          lastName: row.last_name as string
        } as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    try {
      // Use only essential columns that definitely exist in database
      const result = await db.execute(sql`
        SELECT id, name, city, state, latitude, longitude, 
               care_types, price_range, rating, review_count, 
               photos, description, total_units, availability_status,
               monthly_rent_range_start, monthly_rent_range_end,
               hud_property_id, price_tier, size_category, 
               occupancy_rate, phone, email, website, address, 
               amenities, zip_code, rent_per_month,
               total_units_hud, available_units_hud, occupancy_rate_hud,
               management_company, management_phone, management_email
        FROM communities 
        WHERE id = ${id} 
        LIMIT 1
      `);
      
      const community = (result as any).rows?.[0] || (result as any)[0];
      if (community) {
        // Map database column names to expected property names for frontend
        const baseCommunity = {
          ...community,
          careTypes: community.care_types || [],
          priceRange: community.price_range,
          reviewCount: community.review_count || 0,
          totalUnits: community.total_units,
          availabilityStatus: community.availability_status,
          monthlyRentRangeStart: community.monthly_rent_range_start,
          monthlyRentRangeEnd: community.monthly_rent_range_end,
          hudPropertyId: community.hud_property_id,
          priceTier: community.price_tier,
          sizeCategory: community.size_category,
          occupancyRate: community.occupancy_rate,
          rentPerMonth: community.rent_per_month,
          totalUnitsHud: community.total_units_hud,
          availableUnitsHud: community.available_units_hud,
          occupancyRateHud: community.occupancy_rate_hud,
          managementCompany: community.management_company,
          managementPhone: community.management_phone,
          managementEmail: community.management_email,
          zipCode: community.zip_code
        };

        // Apply HUD data extraction to get authentic pricing and occupancy data
        const enhancedCommunity = HudDataExtractor.sanitizeForProduction(baseCommunity);
        
        return enhancedCommunity;
      }
      return undefined;
    } catch (error) {
      console.error('Community detail error:', error);
      return undefined;
    }
  }

  async getAllCommunities(): Promise<Community[]> {
    return await db.select().from(communities);
  }

  async getAllCommunitiesForClustering(): Promise<Community[]> {
    // Get all communities with coordinates using simpler query
    const result = await db.select()
      .from(communities)
      .where(sql`${communities.latitude} IS NOT NULL AND ${communities.longitude} IS NOT NULL`);
    
    return result.map(row => ({
      ...row,
      // Ensure numeric fields are properly typed
      rating: row.rating || 0,
      reviewCount: row.reviewCount || 0,
      careTypes: row.careTypes || [],
      photos: row.photos || [],
      priceRange: row.priceRange || { min: 0, max: 0 },
      availabilityStatus: row.availabilityStatus || 'Contact for Availability',
      description: row.description || ''
    })) as Community[];
  }

  async getTrendingCommunities(limit: number = 8): Promise<Community[]> {
    const cacheKey = `trending_communities:${limit}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      // Apply HUD data extraction to cached results to ensure authentic pricing
      return cached.map((community: any) => HudDataExtractor.sanitizeForProduction(community));
    }
    
    try {
      // Use raw SQL query to avoid complex field mapping issues
      const result = await db.execute(sql`
        SELECT id, name, city, state, latitude, longitude, 
               care_types as "careTypes", price_range as "priceRange",
               rating, review_count as "reviewCount", photos, description,
               total_units as "totalUnits", availability_status as "availabilityStatus",
               monthly_rent_range_start as "monthlyRentRangeStart",
               monthly_rent_range_end as "monthlyRentRangeEnd",
               hud_property_id as "hudPropertyId", price_tier as "priceTier",
               size_category as "sizeCategory", occupancy_rate as "occupancyRate"
        FROM communities 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL 
        AND trending_score > 0
        ORDER BY trending_score DESC, id DESC
        LIMIT ${limit}
      `);
      
      const communities = (result as any).rows || (result as any);
      
      // Apply HUD data extraction to ensure authentic pricing in trending results
      const enhancedCommunities = communities.map((community: any) => 
        HudDataExtractor.sanitizeForProduction(community)
      );
      
      // Cache for 5 minutes
      await cache.set(cacheKey, enhancedCommunities, 300);
      return enhancedCommunities;
    } catch (error) {
      console.error('Error in getTrendingCommunities:', error);
      // Fallback to basic communities
      try {
        const fallback = await db.execute(sql`
          SELECT id, name, city, state, latitude, longitude, 
                 care_types as "careTypes", price_range as "priceRange",
                 rating, review_count as "reviewCount", photos, description,
                 total_units as "totalUnits", availability_status as "availabilityStatus",
                 monthly_rent_range_start as "monthlyRentRangeStart",
                 monthly_rent_range_end as "monthlyRentRangeEnd",
                 hud_property_id as "hudPropertyId", price_tier as "priceTier",
                 size_category as "sizeCategory", occupancy_rate as "occupancyRate"
          FROM communities 
          WHERE latitude IS NOT NULL 
          AND longitude IS NOT NULL
          ORDER BY id DESC
          LIMIT ${limit}
        `);
        
        const fallbackResults = (fallback as any).rows || (fallback as any);
        return fallbackResults.map((community: any) => 
          HudDataExtractor.sanitizeForProduction(community)
        );
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  async searchCommunities(params: SearchCommunity): Promise<Community[]> {
    console.log('Search parameters received:', params);
    
    // Create cache key from search parameters
    const cacheKey = `search:${JSON.stringify(params)}`;
    
    // Check cache first (shorter TTL for search results)
    const cached = await cache.get(cacheKey);
    if (cached) {
      // Apply HUD data extraction to cached search results
      return cached.map((community: any) => HudDataExtractor.sanitizeForProduction(community));
    }

    // Handle HUD specifically to avoid SQL issues
    if (params.careType === "HUD") {
      console.log('Searching for HUD communities...');
      const hudResults = await db.execute(
        sql`SELECT * FROM communities WHERE 'Veterans Housing' = ANY(care_types) LIMIT ${params.limit || 10000} OFFSET ${params.offset || 0}`
      );
      return hudResults.rows || hudResults;
    }

    let query = db.select().from(communities);
    const conditions = [];

    if (params.careType && params.careType !== "All Types" && params.careType !== "Veterans Housing") {
      // Handle other care types normally - check for both exact match and lowercase input
      const careType = params.careType.trim();
      
      // Map common lowercase variants to proper care type names
      const careTypeMap: Record<string, string> = {
        // Complete 10-level care spectrum mapping
        'hud_housing': 'HUD Housing',
        'hud housing': 'HUD Housing',
        'subsidized': 'HUD Housing',
        'va_housing': 'Veterans Housing',
        'va housing': 'Veterans Housing',
        'veterans': 'Veterans Housing',
        'mobile_rv': 'Mobile Home & RV',
        'mobile rv': 'Mobile Home & RV',
        'mobile home': 'Mobile Home & RV',
        'rv park': 'Mobile Home & RV',
        '55_active': '55+ Active',
        '55 active': '55+ Active',
        '55+': '55+ Active',
        'active adult': '55+ Active',
        'independent': 'Independent Living',
        'board_care': 'Board & Care',
        'board care': 'Board & Care',
        'board and care': 'Board & Care',
        'board & care': 'Board & Care',
        'assisted': 'Assisted Living',
        'memory_care': 'Memory Care',
        'memory care': 'Memory Care',
        'ccrc': 'Continuing Care',
        'continuing care': 'Continuing Care',
        'skilled_nursing': 'Skilled Nursing',
        'skilled nursing': 'Skilled Nursing',
        // Keep existing mappings for other care types
        'adult day care': 'Adult Day Care',
        'hospice care': 'Hospice Care',
        'respite care': 'Respite Care',
        'home care': 'Home Care'
      };
      
      // Use mapped care type if available, otherwise use original
      const mappedCareType = careTypeMap[careType.toLowerCase()] || careType;
      
      // Handle special case for HUD Housing which is stored as affordable_senior_housing
      if (mappedCareType === 'HUD Housing' || careType.toLowerCase() === 'hud_housing') {
        conditions.push(sql`(${'HUD Housing'} = ANY(care_types) OR ${'affordable_senior_housing'} = ANY(care_types))`);
      } else {
        conditions.push(sql`${mappedCareType} = ANY(care_types)`);
      }
    }

    if (params.location) {
      const locationConditions = this.buildLocationSearchConditions(params.location, params.distance);
      if (locationConditions) {
        conditions.push(locationConditions);
      }
    }

    if (params.minRating) {
      conditions.push(sql`${communities.rating} >= ${params.minRating}`);
    }

    if (params.availability && params.availability !== "All Status") {
      conditions.push(sql`${communities.availabilityStatus} = ${params.availability}`);
    }

    // Budget filtering
    if (params.budget) {
      if (params.budget.includes(' - ')) {
        // Range: "$3000 - $5000"
        const [minStr, maxStr] = params.budget.replace(/\$/g, '').split(' - ');
        const minBudget = parseInt(minStr);
        const maxBudget = parseInt(maxStr);
        conditions.push(sql`(
          (${communities.priceRange}->>'min')::numeric <= ${maxBudget} AND 
          (${communities.priceRange}->>'max')::numeric >= ${minBudget}
        )`);
      } else if (params.budget.includes('+')) {
        // Minimum: "$3000+"
        const minBudget = parseInt(params.budget.replace(/\$|\+/g, ''));
        conditions.push(sql`(${communities.priceRange}->>'min')::numeric <= ${minBudget}`);
      } else if (params.budget.includes('Under')) {
        // Maximum: "Under $5000"
        const maxBudget = parseInt(params.budget.replace(/Under \$/g, ''));
        conditions.push(sql`(${communities.priceRange}->>'max')::numeric <= ${maxBudget}`);
      }
    }

    // Photos filtering
    if (params.hasPhotos === true) {
      conditions.push(sql`${communities.photos} IS NOT NULL AND array_length(${communities.photos}, 1) > 0`);
    }

    // Skip amenities filtering for now to avoid array search issues
    if (params.amenities && params.amenities.length > 0) {
      // TODO: Fix PostgreSQL array search for amenities
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add pagination support for performance
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.offset(params.offset);
    }

    const results = await query;
    console.log(`Search returned ${results.length} communities`);
    
    // Apply HUD data extraction to search results to ensure authentic pricing
    const enhancedResults = results.map((community: any) => 
      HudDataExtractor.sanitizeForProduction(community)
    );
    
    // Cache search results for 2 minutes
    await cache.set(cacheKey, enhancedResults, 120);
    return enhancedResults;
  }

  // Enhanced location search logic that handles cities, states, ZIP codes, and counties
  private buildLocationSearchConditions(location: string, distance?: number) {
    const locationLower = location.toLowerCase().trim();
    console.log('Building location conditions for:', locationLower, 'with distance:', distance);

    // Detect location type and build appropriate conditions
    const locationType = this.detectLocationType(locationLower);
    console.log('Detected location type:', locationType);

    switch (locationType) {
      case 'city_state':
        return this.buildCityStateSearch(locationLower, distance);
      
      case 'state_only':
        return this.buildStateSearch(locationLower, distance);
      
      case 'zip_code':
        return this.buildZipCodeSearch(locationLower, distance);
      
      case 'county':
        return this.buildCountySearch(locationLower, distance);
      
      case 'city_only':
        return this.buildCityOnlySearch(locationLower, distance);
      
      default:
        // Fallback: broad search across all location fields AND community name
        const searchTerm = `%${locationLower}%`;
        return or(
          ilike(communities.name, searchTerm),
          ilike(communities.city, searchTerm),
          ilike(communities.state, searchTerm),
          ilike(communities.zipCode, searchTerm),
          ilike(communities.county, searchTerm)
        );
    }
  }

  private detectLocationType(location: string): string {
    // ZIP code patterns
    if (/^\d{5}$/.test(location) || /^\d{2}$/.test(location) || /^\d{3}$/.test(location)) {
      return 'zip_code';
    }

    // County patterns
    if (location.includes('county')) {
      return 'county';
    }

    // State abbreviations and full names
    const stateAbbrevs = ['ca', 'california', 'tx', 'texas', 'fl', 'florida', 'ny', 'new york', 'az', 'arizona', 'nv', 'nevada', 'hi', 'hawaii', 'id', 'idaho', 'mt', 'montana', 'or', 'oregon', 'wa', 'washington', 'wy', 'wyoming', 'ut', 'utah', 'nm', 'new mexico', 'co', 'colorado', 'ga', 'georgia', 'al', 'alabama', 'ms', 'mississippi', 'la', 'louisiana', 'tn', 'tennessee'];
    if (stateAbbrevs.includes(location)) {
      return 'state_only';
    }

    // City, State pattern
    if (location.includes(',')) {
      return 'city_state';
    }

    // Default to city only
    return 'city_only';
  }

  private buildCityStateSearch(location: string, distance?: number) {
    const [cityPart, statePart] = location.split(',').map(s => s.trim());
    const normalizedState = statePart.toUpperCase();
    
    if (distance) {
      // For distance searches, expand geographical coverage
      if (cityPart.includes('redding') || cityPart.includes('sacramento')) {
        // Northern California regional search
        return and(
          eq(communities.state, 'CA'),
          or(
            ilike(communities.city, `%${cityPart}%`),
            ilike(communities.region, '%northern%'),
            ilike(communities.county, '%shasta%'),
            ilike(communities.county, '%sacramento%'),
            ilike(communities.county, '%butte%'),
            ilike(communities.county, '%tehama%'),
            ilike(communities.zipCode, '96%'),
            ilike(communities.zipCode, '95%')
          )
        );
      }
      
      // Default distance search for other cities
      return and(
        ilike(communities.city, `%${cityPart}%`),
        ilike(communities.state, `%${normalizedState}%`)
      );
    }

    // Try exact match first, then fallback to state-wide search if no exact match
    return or(
      // Primary: exact city and state match
      and(
        ilike(communities.city, `%${cityPart}%`),
        ilike(communities.state, `%${normalizedState}%`)
      ),
      // Fallback: if no exact city match, show other communities in the same state
      and(
        eq(communities.state, normalizedState),
        // Prioritize communities with similar names or in major cities
        or(
          ilike(communities.city, `%${cityPart.substring(0, 3)}%`), // Partial city name match
          ilike(communities.city, '%phoenix%'),    // Major AZ cities
          ilike(communities.city, '%tucson%'),
          ilike(communities.city, '%mesa%'),
          ilike(communities.city, '%scottsdale%'),
          ilike(communities.city, '%chandler%'),
          ilike(communities.city, '%tempe%'),
          ilike(communities.city, '%flagstaff%'),
          ilike(communities.city, '%yuma%')
        )
      )
    );
  }

  private buildStateSearch(location: string, distance?: number) {
    // Normalize state input
    const stateMap: Record<string, string> = {
      'ca': 'CA',
      'california': 'CA',
      'tx': 'TX', 
      'texas': 'TX',
      'fl': 'FL',
      'florida': 'FL',
      'ny': 'NY',
      'new york': 'NY',
      'az': 'AZ',
      'arizona': 'AZ',
      'nv': 'NV',
      'nevada': 'NV',
      'hi': 'HI',
      'hawaii': 'HI',
      'id': 'ID',
      'idaho': 'ID',
      'mt': 'MT',
      'montana': 'MT',
      'or': 'OR',
      'oregon': 'OR',
      'wa': 'WA',
      'washington': 'WA',
      'wy': 'WY',
      'wyoming': 'WY',
      'ut': 'UT',
      'utah': 'UT',
      'nm': 'NM',
      'new mexico': 'NM',
      'co': 'CO',
      'colorado': 'CO',
      'ga': 'GA',
      'georgia': 'GA',
      'al': 'AL',
      'alabama': 'AL',
      'ms': 'MS',
      'mississippi': 'MS',
      'la': 'LA',
      'louisiana': 'LA',
      'tn': 'TN',
      'tennessee': 'TN'
    };

    const stateCode = stateMap[location] || location.toUpperCase();
    
    if (distance) {
      // For distance searches in states, include neighboring regions
      if (stateCode === 'CA') {
        return eq(communities.state, 'CA');
      }
    }

    return eq(communities.state, stateCode);
  }

  private buildZipCodeSearch(location: string, distance?: number) {
    console.log(`ZIP code search for: ${location}`);
    
    if (location.length === 5) {
      // Full ZIP code search with intelligent geographic expansion
      console.log(`Full ZIP code search for: ${location}`);
      
      // Use the comprehensive ZIP code service for geographic expansion
      const expandedZips = zipCodeService.expandZipSearch(location);
      console.log(`ZIP expansion: ${location} -> ${expandedZips.join(', ')}`);
      
      if (expandedZips.length > 1) {
        // Multiple ZIP codes found - search all related ZIPs for geographic equivalence
        return inArray(communities.zipCode, expandedZips);
      } else if (expandedZips.length === 1) {
        // Single ZIP code - exact match
        return eq(communities.zipCode, expandedZips[0]);
      } else {
        // No ZIP codes found in mapping - try broader geographic search
        console.log(`No ZIP mapping found for ${location}, trying broader search`);
        const zipPrefix = location.substring(0, 4); // First 4 digits for geographic area
        return or(
          eq(communities.zipCode, location),
          ilike(communities.zipCode, `${zipPrefix}%`)
        );
      }
    }
    
    // Partial ZIP code search (2-3 digits)
    const zipPattern = `${location}%`;
    
    if (distance) {
      // For distance searches, expand to nearby ZIP patterns
      const zipPrefix = location.substring(0, 2);
      return or(
        ilike(communities.zipCode, zipPattern),
        ilike(communities.zipCode, `${zipPrefix}%`)
      );
    }

    return ilike(communities.zipCode, zipPattern);
  }

  private buildCountySearch(location: string, distance?: number) {
    // Extract county name (remove "county" suffix if present)
    const countyName = location.replace(/\s+county.*$/i, '').trim();
    const countyPattern = `%${countyName}%`;
    
    if (distance) {
      // For distance searches, include neighboring counties
      if (countyName.includes('shasta')) {
        return or(
          ilike(communities.county, countyPattern),
          ilike(communities.county, '%butte%'),
          ilike(communities.county, '%tehama%'),
          ilike(communities.county, '%siskiyou%')
        );
      }
    }

    return ilike(communities.county, countyPattern);
  }

  private buildCityOnlySearch(location: string, distance?: number) {
    const searchPattern = `%${location}%`;
    
    if (distance) {
      // For distance searches from a city, search broadly
      return or(
        ilike(communities.name, searchPattern),
        ilike(communities.city, searchPattern),
        ilike(communities.county, searchPattern),
        // If it's a major city, include regional search
        ...(location.includes('los angeles') ? [eq(communities.state, 'CA')] : []),
        ...(location.includes('san francisco') ? [ilike(communities.zipCode, '94%')] : []),
        ...(location.includes('redding') ? [ilike(communities.zipCode, '96%')] : [])
      );
    }

    // Search both community name and city for single term searches
    return or(
      ilike(communities.name, searchPattern),
      ilike(communities.city, searchPattern)
    );
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const [community] = await db
      .insert(communities)
      .values(insertCommunity)
      .returning();
    return community;
  }

  async updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined> {
    const [community] = await db
      .update(communities)
      .set(updates)
      .where(eq(communities.id, id))
      .returning();
    return community || undefined;
  }

  async deleteCommunity(id: number): Promise<boolean> {
    const result = await db
      .delete(communities)
      .where(eq(communities.id, id));
    return result.rowCount > 0;
  }

  async getInspectionsByCommunity(communityId: number): Promise<Inspection[]> {
    return await db
      .select()
      .from(inspections)
      .where(eq(inspections.communityId, communityId));
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const [inspection] = await db
      .insert(inspections)
      .values(insertInspection)
      .returning();
    return inspection;
  }

  // Review methods
  async getReviewsByCommunity(communityId: number): Promise<Review[]> {
    return await db
      .select({
        id: reviews.id,
        communityId: reviews.communityId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        reviewText: reviews.reviewText,
        pros: reviews.pros,
        cons: reviews.cons,
        relationshipType: reviews.relationshipType,
        stayDuration: reviews.stayDuration,
        careLevel: reviews.careLevel,
        wouldRecommend: reviews.wouldRecommend,
        verified: reviews.verified,
        helpful: reviews.helpful,
        notHelpful: reviews.notHelpful,
        moderationStatus: reviews.moderationStatus,
        moderationNotes: reviews.moderationNotes,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: {
          id: users.id,
          username: users.username,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(
        eq(reviews.communityId, communityId),
        eq(reviews.moderationStatus, "Approved")
      ))
      .orderBy(reviews.createdAt);
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(reviews.createdAt);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db
      .delete(reviews)
      .where(eq(reviews.id, id));
    return (result.rowCount || 0) > 0;
  }

  async markReviewHelpful(reviewId: number, userId: number, isHelpful: boolean): Promise<void> {
    // First check if user already rated this review
    const existing = await db
      .select()
      .from(reviewHelpfulness)
      .where(and(
        eq(reviewHelpfulness.reviewId, reviewId),
        eq(reviewHelpfulness.userId, userId)
      ));

    if (existing.length > 0) {
      // Update existing rating
      await db
        .update(reviewHelpfulness)
        .set({ isHelpful })
        .where(and(
          eq(reviewHelpfulness.reviewId, reviewId),
          eq(reviewHelpfulness.userId, userId)
        ));
    } else {
      // Create new rating
      await db
        .insert(reviewHelpfulness)
        .values({ reviewId, userId, isHelpful });
    }

    // Update the review's helpful/notHelpful counters
    const helpfulCount = await db
      .select()
      .from(reviewHelpfulness)
      .where(and(
        eq(reviewHelpfulness.reviewId, reviewId),
        eq(reviewHelpfulness.isHelpful, true)
      ));

    const notHelpfulCount = await db
      .select()
      .from(reviewHelpfulness)
      .where(and(
        eq(reviewHelpfulness.reviewId, reviewId),
        eq(reviewHelpfulness.isHelpful, false)
      ));

    await db
      .update(reviews)
      .set({
        helpful: helpfulCount.length,
        notHelpful: notHelpfulCount.length
      })
      .where(eq(reviews.id, reviewId));
  }

  async getReviewHelpfulness(reviewId: number, userId: number): Promise<boolean | null> {
    const [helpfulness] = await db
      .select()
      .from(reviewHelpfulness)
      .where(and(
        eq(reviewHelpfulness.reviewId, reviewId),
        eq(reviewHelpfulness.userId, userId)
      ));
    
    return helpfulness ? helpfulness.isHelpful : null;
  }

  async moderateReview(id: number, status: string, notes?: string): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set({ 
        moderationStatus: status as any,
        moderationNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  // Listing flag methods
  async createListingFlag(flag: InsertListingFlag): Promise<ListingFlag> {
    const [newFlag] = await db
      .insert(listingFlags)
      .values(flag)
      .returning();
    return newFlag;
  }

  async getListingFlags(params: { status?: string; page?: number; limit?: number }): Promise<ListingFlag[]> {
    const { status = 'Pending', page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = db.select().from(listingFlags);
    
    if (status) {
      query = query.where(eq(listingFlags.status, status as any));
    }

    return await query.limit(limit).offset(offset);
  }

  async updateListingFlag(id: number, updates: Partial<InsertListingFlag>): Promise<ListingFlag | undefined> {
    const [flag] = await db
      .update(listingFlags)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listingFlags.id, id))
      .returning();
    return flag;
  }

  // Enhanced favorites methods (simplified for current database)
  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    // For now, return a mock favorite until the favorites table is created
    return {
      id: Date.now(),
      userId: favorite.userId,
      communityId: favorite.communityId,
      createdAt: new Date(),
      notes: favorite.notes || null,
    } as Favorite;
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    // For now, return empty array until the favorites table is created
    return [];
  }

  async removeFromFavorites(userId: number, communityId: number): Promise<boolean> {
    // For now, return true until the favorites table is created
    return true;
  }

  async updateFavoriteNotes(userId: number, communityId: number, notes: string): Promise<boolean> {
    // For now, return true until the favorites table is created
    return true;
  }

  // Tours methods (enhanced for comprehensive tour tracking)
  async getToursByUser(userId: number): Promise<Tour[]> {
    // For now, return empty array until the tours table is created
    return [];
  }

  async getTour(tourId: number): Promise<Tour | undefined> {
    // For now, return undefined until the tours table is created
    return undefined;
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    // For now, return a mock tour with all the enhanced fields
    return {
      id: Date.now(),
      userId: tour.userId,
      communityId: tour.communityId,
      tourDate: tour.tourDate,
      tourType: tour.tourType || 'in_person',
      status: tour.status || 'scheduled',
      attendeeCount: tour.attendeeCount || 1,
      specialRequests: tour.specialRequests || null,
      contactPreference: tour.contactPreference || 'email',
      reminderSent: false,
      feedbackSubmitted: false,
      tourNotes: tour.tourNotes || null,
      staffNotes: tour.staffNotes || null,
      overallImpression: tour.overallImpression || null,
      pricingInfo: tour.pricingInfo || {},
      unitsViewed: tour.unitsViewed || [],
      highlights: tour.highlights || {},
      staffInteraction: tour.staffInteraction || {},
      tourPhotos: tour.tourPhotos || [],
      followUpActions: tour.followUpActions || [],
      overallRating: tour.overallRating || null,
      wouldRecommend: tour.wouldRecommend || null,
      likelihood: tour.likelihood || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Tour;
  }

  async updateTour(id: number, updates: Partial<InsertTour>): Promise<Tour | undefined> {
    // For now, return a mock updated tour
    return {
      id,
      userId: updates.userId || 1,
      communityId: updates.communityId || 1,
      tourDate: updates.tourDate || new Date(),
      tourType: updates.tourType || 'in_person',
      status: updates.status || 'completed',
      attendeeCount: updates.attendeeCount || 1,
      specialRequests: updates.specialRequests || null,
      contactPreference: updates.contactPreference || 'email',
      reminderSent: false,
      feedbackSubmitted: false,
      tourNotes: updates.tourNotes || null,
      staffNotes: updates.staffNotes || null,
      overallImpression: updates.overallImpression || null,
      pricingInfo: updates.pricingInfo || {},
      unitsViewed: updates.unitsViewed || [],
      highlights: updates.highlights || {},
      staffInteraction: updates.staffInteraction || {},
      tourPhotos: updates.tourPhotos || [],
      followUpActions: updates.followUpActions || [],
      overallRating: updates.overallRating || null,
      wouldRecommend: updates.wouldRecommend || null,
      likelihood: updates.likelihood || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Tour;
  }

  async cancelTour(id: number): Promise<boolean> {
    // For now, return true until the tours table is created
    return true;
  }

  // Search history methods (simplified for current database)
  async getSearchHistory(userId: number): Promise<SearchHistoryEntry[]> {
    // For now, return empty array until the search_history table is created
    return [];
  }

  async saveSearch(searchHistory: InsertSearchHistory): Promise<SearchHistoryEntry> {
    // For now, return a mock search entry until the search_history table is created
    return {
      id: Date.now(),
      userId: searchHistory.userId,
      query: searchHistory.query,
      filters: searchHistory.filters,
      resultCount: searchHistory.resultCount || 0,
      createdAt: new Date(),
    } as SearchHistoryEntry;
  }

  async deleteSearchHistory(userId: number, searchId: number): Promise<boolean> {
    // For now, return true until the search_history table is created
    return true;
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getUserMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.fromUserId, userId));
  }

  // User activity methods
  async trackUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db
      .insert(userActivity)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getUserActivity(userId: number, limit: number): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, userId))
      .limit(limit)
      .orderBy(sql`${userActivity.createdAt} DESC`);
  }

  // Admin methods
  async getAdminAnalytics(): Promise<any> {
    const totalUsers = await db
      .select({ count: sql`count(*)` })
      .from(users);
    
    const totalCommunities = await db
      .select({ count: sql`count(*)` })
      .from(communities);
    
    const totalFlags = await db
      .select({ count: sql`count(*)` })
      .from(listingFlags);

    const pendingFlags = await db
      .select({ count: sql`count(*)` })
      .from(listingFlags)
      .where(eq(listingFlags.status, 'Pending'));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalCommunities: totalCommunities[0]?.count || 0,
      totalFlags: totalFlags[0]?.count || 0,
      pendingFlags: pendingFlags[0]?.count || 0
    };
  }

  async getRecentActivity(limit: number): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivity)
      .limit(limit)
      .orderBy(sql`${userActivity.createdAt} DESC`);
  }

  // CRM methods
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db
      .insert(leads)
      .values(lead)
      .returning();
    return newLead;
  }

  async getLeads(params: { status?: string; priority?: string; page?: number; limit?: number }): Promise<Lead[]> {
    const { status, priority, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = db.select().from(leads);
    
    const conditions = [];
    if (status) {
      conditions.push(eq(leads.status, status as any));
    }
    if (priority) {
      conditions.push(eq(leads.priority, priority as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.limit(limit).offset(offset);
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async addLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const [newActivity] = await db
      .insert(leadActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Claim system methods
  async createClaim(claim: any): Promise<any> {
    const [newClaim] = await db
      .insert(communityClaims)
      .values(claim)
      .returning();
    return newClaim;
  }

  async updateCommunityPricing(communityId: number, pricingData: any): Promise<void> {
    await db
      .update(communities)
      .set(pricingData)
      .where(eq(communities.id, communityId));
  }

  async updateCommunityAvailability(communityId: number, availabilityData: any): Promise<void> {
    await db
      .update(communities)
      .set(availabilityData)
      .where(eq(communities.id, communityId));
  }

  // Consolidated homepage data endpoint
  async getHomepageData(): Promise<{
    totalCommunities: number;
    trendingCommunities: Community[];
    coastalCommunities: Community[];
    locationCommunities: {
      [key: string]: Community[];
    };
  }> {
    const cacheKey = 'homepage_data';
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Fetch all data in parallel
    const [
      totalCount,
      trending,
      coastal,
      california,
      sacramento,
      sanFrancisco,
      santaMonica,
      monterey,
      santaBarbara,
      carmel
    ] = await Promise.all([
      // Total communities count
      db.execute(sql`SELECT COUNT(*) as count FROM communities`),
      // Trending communities
      this.getTrendingCommunities(8),
      // Coastal communities 
      this.searchCommunities({ location: 'Santa Barbara', limit: 5 }),
      // Location-specific communities
      this.searchCommunities({ location: 'California', limit: 20 }),
      this.searchCommunities({ location: 'Sacramento', limit: 20 }),
      this.searchCommunities({ location: 'San Francisco', limit: 5 }),
      this.searchCommunities({ location: 'Santa Monica', limit: 5 }),
      this.searchCommunities({ location: 'Monterey', limit: 5 }),
      this.searchCommunities({ location: 'Santa Barbara', limit: 5 }),
      this.searchCommunities({ location: 'Carmel', limit: 5 })
    ]);
    
    const result = {
      totalCommunities: totalCount.rows[0].count,
      trendingCommunities: trending,
      coastalCommunities: coastal,
      locationCommunities: {
        California: california,
        Sacramento: sacramento,
        'San Francisco': sanFrancisco,
        'Santa Monica': santaMonica,
        Monterey: monterey,
        'Santa Barbara': santaBarbara,
        Carmel: carmel
      }
    };
    
    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);
    return result;
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const searchTerm = query.toLowerCase().trim();
    
    try {
      // Simple query to get matching locations
      const results = await db
        .select({
          city: communities.city,
          state: communities.state,
          zipCode: communities.zipCode
        })
        .from(communities)
        .where(
          or(
            ilike(communities.city, `%${searchTerm}%`),
            ilike(communities.state, `%${searchTerm}%`),
            like(communities.zipCode, `${searchTerm}%`)
          )
        )
        .limit(50);

      // Use a Set to track unique suggestions
      const uniqueSuggestions = new Set<string>();
      
      // Process results and add unique city/state combinations
      results.forEach(row => {
        if (row.city && row.state) {
          const cityLower = row.city.toLowerCase();
          const stateLower = row.state.toLowerCase();
          
          // Add city, state if it matches
          if (cityLower.includes(searchTerm) || stateLower.includes(searchTerm)) {
            uniqueSuggestions.add(`${row.city}, ${row.state}`);
          }
        }
        
        // Add state if it matches
        if (row.state && row.state.toLowerCase().includes(searchTerm)) {
          uniqueSuggestions.add(row.state);
        }
        
        // Add zip code if it matches
        if (row.zipCode && row.zipCode.startsWith(searchTerm)) {
          uniqueSuggestions.add(row.zipCode);
        }
      });

      // Convert Set to Array and limit results
      return Array.from(uniqueSuggestions).slice(0, 8);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  async getCommunitiesByIds(ids: number[]): Promise<Community[]> {
    if (ids.length === 0) return [];
    return await db
      .select()
      .from(communities)
      .where(inArray(communities.id, ids));
  }



  // Session management methods (required for authentication)
  async createSession(userId: string): Promise<UserSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const session: UserSession = {
      id: sessionId,
      userId,
      expiresAt,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };
    
    await db.insert(userSessions).values(session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.id, sessionId));
    return session || undefined;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await db.delete(userSessions).where(eq(userSessions.id, sessionId));
    return (result as any).rowCount > 0;
  }

  async cleanupExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(sql`expires_at < NOW()`);
  }

  // These methods are already defined above, removed duplicates

  // Stub implementations for missing methods to prevent interface errors

  async createConversation(data: InsertChatConversation, participantIds: string[]): Promise<ChatConversation> {
    const [conversation] = await db.insert(chatConversations).values(data).returning();
    for (const userId of participantIds) {
      await db.insert(chatParticipants).values({
        conversationId: conversation.id,
        userId,
        role: 'member'
      });
    }
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Array<ChatConversation & { unreadCount: number; lastMessage?: ChatMessage }>> {
    return []; // Stub implementation
  }

  async getConversationById(conversationId: number, userId: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, conversationId));
    return conversation || undefined;
  }

  async addParticipantToConversation(conversationId: number, userId: string, role: string = 'member'): Promise<ChatParticipant> {
    const [participant] = await db.insert(chatParticipants).values({
      conversationId,
      userId,
      role
    }).returning();
    return participant;
  }

  async removeParticipantFromConversation(conversationId: number, userId: string): Promise<void> {
    await db.delete(chatParticipants).where(
      and(
        eq(chatParticipants.conversationId, conversationId),
        eq(chatParticipants.userId, userId)
      )
    );
  }

  async sendMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(data).returning();
    return message;
  }

  async getMessagesByConversation(conversationId: number, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    // Stub implementation
  }

  async getUnreadCount(userId: string): Promise<number> {
    return 0; // Stub implementation
  }

  async deleteMessage(messageId: number, userId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
  }

  async editMessage(messageId: number, userId: string, newContent: string): Promise<ChatMessage | undefined> {
    const [updated] = await db.update(chatMessages)
      .set({ content: newContent, updatedAt: new Date() })
      .where(eq(chatMessages.id, messageId))
      .returning();
    return updated || undefined;
  }

  // Marketplace vendor methods implementation
  async getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
    return db.select().from(marketplaceCategories).orderBy(marketplaceCategories.displayOrder);
  }

  async getMarketplaceCategoryBySlug(slug: string): Promise<MarketplaceCategory | undefined> {
    const [category] = await db.select().from(marketplaceCategories).where(eq(marketplaceCategories.slug, slug));
    return category || undefined;
  }

  async createMarketplaceCategory(category: InsertMarketplaceCategory): Promise<MarketplaceCategory> {
    const [created] = await db.insert(marketplaceCategories).values(category).returning();
    return created;
  }

  async updateMarketplaceCategory(id: number, updates: Partial<InsertMarketplaceCategory>): Promise<MarketplaceCategory | undefined> {
    const [updated] = await db.update(marketplaceCategories).set(updates).where(eq(marketplaceCategories.id, id)).returning();
    return updated || undefined;
  }

  async getMarketplaceVendors(params?: { categoryId?: number; featured?: boolean; hidden?: boolean }): Promise<MarketplaceVendor[]> {
    let query = db.select().from(marketplaceVendors);
    const conditions: any[] = [];
    
    if (params?.categoryId) {
      conditions.push(eq(marketplaceVendors.categoryId, params.categoryId));
    }
    if (params?.featured !== undefined) {
      conditions.push(eq(marketplaceVendors.isFeatured, params.featured));
    }
    if (params?.hidden !== undefined) {
      conditions.push(eq(marketplaceVendors.isHidden, params.hidden));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(marketplaceVendors.displayOrder);
  }

  async getMarketplaceVendorBySlug(slug: string): Promise<MarketplaceVendor | undefined> {
    const [vendor] = await db.select().from(marketplaceVendors).where(eq(marketplaceVendors.slug, slug));
    return vendor || undefined;
  }

  async createMarketplaceVendor(vendor: InsertMarketplaceVendor): Promise<MarketplaceVendor> {
    const [created] = await db.insert(marketplaceVendors).values(vendor).returning();
    return created;
  }

  async updateMarketplaceVendor(id: number, updates: Partial<InsertMarketplaceVendor>): Promise<MarketplaceVendor | undefined> {
    const [updated] = await db.update(marketplaceVendors).set(updates).where(eq(marketplaceVendors.id, id)).returning();
    return updated || undefined;
  }

  async deleteMarketplaceVendor(id: number): Promise<boolean> {
    const result = await db.delete(marketplaceVendors).where(eq(marketplaceVendors.id, id));
    return (result as any).rowCount > 0;
  }

  async trackMarketplaceVendorClick(click: InsertMarketplaceVendorClick): Promise<MarketplaceVendorClick> {
    const [created] = await db.insert(marketplaceVendorClicks).values(click).returning();
    return created;
  }

  async getMarketplaceVendorClicks(vendorId: number, days?: number): Promise<MarketplaceVendorClick[]> {
    let query = db.select().from(marketplaceVendorClicks).where(eq(marketplaceVendorClicks.vendorId, vendorId));
    
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = query.where(gte(marketplaceVendorClicks.createdAt, cutoffDate));
    }
    
    return query.orderBy(desc(marketplaceVendorClicks.createdAt));
  }

  async getMarketplaceAnalytics(): Promise<{
    totalVendors: number;
    totalClicks: number;
    topVendors: Array<{ vendor: MarketplaceVendor; clicks: number }>;
    categoryBreakdown: Array<{ category: MarketplaceCategory; vendorCount: number; totalClicks: number }>;
  }> {
    // Get total vendors
    const [vendorCountResult] = await db.select({ count: sql<number>`count(*)` }).from(marketplaceVendors);
    const totalVendors = Number(vendorCountResult.count);

    // Get total clicks
    const [clickCountResult] = await db.select({ count: sql<number>`count(*)` }).from(marketplaceVendorClicks);
    const totalClicks = Number(clickCountResult.count);

    // Get top vendors by clicks
    const topVendorsData = await db
      .select({
        vendor: marketplaceVendors,
        clicks: sql<number>`count(${marketplaceVendorClicks.id})::int`
      })
      .from(marketplaceVendors)
      .leftJoin(marketplaceVendorClicks, eq(marketplaceVendors.id, marketplaceVendorClicks.vendorId))
      .groupBy(marketplaceVendors.id)
      .orderBy(desc(sql`count(${marketplaceVendorClicks.id})`))
      .limit(10);

    const topVendors = topVendorsData.map(row => ({
      vendor: row.vendor,
      clicks: Number(row.clicks)
    }));

    // Get category breakdown
    const categoryData = await db
      .select({
        category: marketplaceCategories,
        vendorCount: sql<number>`count(distinct ${marketplaceVendors.id})::int`,
        totalClicks: sql<number>`count(${marketplaceVendorClicks.id})::int`
      })
      .from(marketplaceCategories)
      .leftJoin(marketplaceVendors, eq(marketplaceCategories.id, marketplaceVendors.categoryId))
      .leftJoin(marketplaceVendorClicks, eq(marketplaceVendors.id, marketplaceVendorClicks.vendorId))
      .groupBy(marketplaceCategories.id)
      .orderBy(marketplaceCategories.displayOrder);

    const categoryBreakdown = categoryData.map(row => ({
      category: row.category,
      vendorCount: Number(row.vendorCount),
      totalClicks: Number(row.totalClicks)
    }));

    return {
      totalVendors,
      totalClicks,
      topVendors,
      categoryBreakdown
    };
  }

  // Removal request methods
  async createRemovalRequest(request: InsertRemovalRequest): Promise<RemovalRequest> {
    const [created] = await db.insert(removalRequests).values({
      ...request,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Log audit event
    await db.insert(auditLogs).values({
      userId: 'system',
      entityType: 'removal_request',
      entityId: created.id.toString(),
      action: 'create',
      metadata: {
        requestType: request.requestType,
        entityName: request.entityName,
        requestorEmail: request.requestorEmail
      }
    });
    
    return created;
  }

  async getRemovalRequests(params?: { status?: string; requestType?: string }): Promise<RemovalRequest[]> {
    let query = db.select().from(removalRequests);
    const conditions = [];
    
    if (params?.status) {
      conditions.push(eq(removalRequests.status, params.status));
    }
    
    if (params?.requestType) {
      conditions.push(eq(removalRequests.requestType, params.requestType));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(removalRequests.createdAt));
  }

  async getRemovalRequestById(id: number): Promise<RemovalRequest | undefined> {
    const [request] = await db.select().from(removalRequests).where(eq(removalRequests.id, id));
    return request || undefined;
  }

  async updateRemovalRequest(id: number, updates: Partial<RemovalRequest>): Promise<RemovalRequest | undefined> {
    const [updated] = await db.update(removalRequests)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(removalRequests.id, id))
      .returning();
    
    if (updated) {
      // Log audit event
      await db.insert(auditLogs).values({
        userId: updates.processedBy || 'system',
        entityType: 'removal_request',
        entityId: id.toString(),
        action: 'update',
        metadata: {
          status: updates.status,
          processingNotes: updates.processingNotes
        }
      });
    }
    
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
