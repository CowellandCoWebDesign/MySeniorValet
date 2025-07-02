import { db } from "./db";
import { communities, type InsertCommunity } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingCommunities = await db.select().from(communities);
    if (existingCommunities.length > 0) {
      console.log("Database already seeded with", existingCommunities.length, "communities");
      return;
    }

    console.log("Seeding database with sample communities...");

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

    // Insert the communities
    for (const community of sampleCommunities) {
      await db.insert(communities).values(community);
    }

    console.log("Successfully seeded database with", sampleCommunities.length, "communities");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}