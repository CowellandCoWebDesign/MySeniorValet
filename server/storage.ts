import { users, communities, inspections, type User, type InsertUser, type Community, type InsertCommunity, type Inspection, type InsertInspection, type SearchCommunity } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Community methods
  getCommunity(id: number): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  searchCommunities(params: SearchCommunity): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined>;
  deleteCommunity(id: number): Promise<boolean>;

  // Inspection methods
  getInspectionsByCommunity(communityId: number): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async getAllCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
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
        params.amenities!.some(amenity => community.amenities.includes(amenity))
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

export const storage = new MemStorage();
