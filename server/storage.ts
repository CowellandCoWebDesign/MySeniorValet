import { 
  users, communities, inspections, reviews, reviewHelpfulness, favorites, searchHistory, 
  messages, tours, userSessions, listingFlags, adminUsers, userActivity, leads, leadActivities,
  type User, type InsertUser, type Community, type InsertCommunity, 
  type Inspection, type InsertInspection, type Review, type InsertReview, 
  type InsertReviewHelpfulness, type SearchCommunity, type Favorite, type InsertFavorite,
  type SearchHistoryEntry, type InsertSearchHistory, type Message, type InsertMessage,
  type Tour, type InsertTour, type UserSession, type ListingFlag, type InsertListingFlag,
  type AdminUser, type InsertAdminUser, type UserActivity, type InsertUserActivity,
  type Lead, type InsertLead, type LeadActivity, type InsertLeadActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, like, ilike, gte, and, or, sql, inArray, desc, isNotNull, gt } from "drizzle-orm";
import { zipCodeService } from "./zip-code-mapping";
import { cache } from "./cache";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Authentication methods
  createSession(userId: number): Promise<UserSession>;
  getSessionById(sessionId: string): Promise<UserSession | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<void>;

  // Community methods
  getCommunity(id: number): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  getTrendingCommunities(limit?: number): Promise<Community[]>;
  searchCommunities(params: SearchCommunity): Promise<Community[]>;
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

  // Search suggestions
  getSearchSuggestions(query: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
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
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample communities for demonstration
    const sampleCommunities: InsertCommunity[] = [
      {
        name: "Sunrise Manor",
        address: "123 Oak Street",
        city: "Denver",
        state: "CO",
        zipCode: "80202",
        phone: "(303) 555-0101",
        email: "info@sunrisemanor.com",
        website: "www.sunrisemanor.com",
        description: "Premier senior living community with comprehensive care services and beautiful amenities.",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pet Friendly", "Transportation", "Fitness Center", "Dining Options"],
        priceRange: { min: 4200, max: 8500 },
        rating: "4.8",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3",
        latitude: "39.7392358",
        longitude: "-104.9902719",
        licenseNumber: "CO-SL-001",
        licenseStatus: "Licensed",
        lastInspection: new Date("2024-01-15"),
        violations: 0,
        isVerified: true,
        isClaimed: false,
      },
      {
        name: "Golden Years Community",
        address: "456 Pine Avenue",
        city: "Colorado Springs",
        state: "CO",
        zipCode: "80903",
        phone: "(719) 555-0202",
        email: "contact@goldenyears.com",
        website: "www.goldenyears.com",
        description: "Affordable assisted living and memory care in a warm, family-like environment.",
        careTypes: ["Assisted Living", "Memory Care"],
        amenities: ["Pet Friendly", "Transportation", "Activities"],
        priceRange: { min: 3800, max: 6200 },
        rating: "4.6",
        imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
        latitude: "38.8338816",
        longitude: "-104.8213634",
        licenseNumber: "CO-SL-002",
        licenseStatus: "Under Review",
        lastInspection: new Date("2023-12-10"),
        violations: 2,
        isVerified: true,
        isClaimed: false,
      },
      {
        name: "Heritage Hills Senior Living",
        address: "789 Mountain View Drive",
        city: "Boulder",
        state: "CO",
        zipCode: "80301",
        phone: "(303) 555-0303",
        email: "info@heritagehills.com",
        website: "www.heritagehills.com",
        description: "Luxury senior living with stunning mountain views and premium amenities.",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Fitness Center", "Dining Options", "Spa Services", "Golf Course"],
        priceRange: { min: 5200, max: 12000 },
        rating: "4.9",
        imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3",
        latitude: "40.0149856",
        longitude: "-105.2705456",
        licenseNumber: "CO-SL-003",
        licenseStatus: "Licensed",
        lastInspection: new Date("2024-02-20"),
        violations: 0,
        isVerified: true,
        isClaimed: true,
      },
    ];

    sampleCommunities.forEach(community => {
      this.createCommunity(community);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
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
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      profileImage: null,
      dateOfBirth: null,
      emergencyContact: null,
      preferences: null,
      notifications: null,
      emailVerified: false,
      emailVerificationToken: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLogin: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
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

  // Stub implementations for other methods
  async createSession(): Promise<any> { throw new Error("Not implemented"); }
  async getSessionById(): Promise<any> { throw new Error("Not implemented"); }
  async deleteSession(): Promise<boolean> { throw new Error("Not implemented"); }
  async cleanupExpiredSessions(): Promise<void> { throw new Error("Not implemented"); }
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    // Use raw SQL query to avoid schema mismatch issues
    const result = await db.execute(
      sql`SELECT id, username, password FROM users WHERE id = ${id}`
    );
    const userRow = result.rows[0];
    if (userRow) {
      return {
        id: userRow.id as number,
        username: userRow.username as string,
        password: userRow.password as string
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
      sql`SELECT id, username, password FROM users WHERE username = ${email}`
    );
    const userRow = result.rows[0];
    if (userRow) {
      return {
        id: userRow.id as number,
        username: userRow.username as string,
        password: userRow.password as string
      } as User;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community || undefined;
  }

  async getAllCommunities(): Promise<Community[]> {
    return await db.select().from(communities);
  }

  async getTrendingCommunities(limit: number = 8): Promise<Community[]> {
    const cacheKey = `trending_communities:${limit}`;
    
    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Optimized query using pre-calculated trending_score
    const result = await db.select()
      .from(communities)
      .where(and(
        isNotNull(communities.latitude),
        isNotNull(communities.longitude),
        sql`${communities.trendingScore} > 0`
      ))
      .orderBy(
        desc(communities.trendingScore),
        desc(communities.id)
      )
      .limit(limit);
    
    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);
    return result;
  }

  async searchCommunities(params: SearchCommunity): Promise<Community[]> {
    console.log('Search parameters received:', params);
    
    // Create cache key from search parameters
    const cacheKey = `search:${JSON.stringify(params)}`;
    
    // Check cache first (shorter TTL for search results)
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
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
      // Handle other care types normally
      const careType = params.careType.trim();
      conditions.push(sql.raw(`'${careType}' = ANY(care_types)`));
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
    
    // Cache search results for 2 minutes
    await cache.set(cacheKey, results, 120);
    return results;
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
}

export const storage = new DatabaseStorage();
