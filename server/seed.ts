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
        services: ["24/7 Nursing", "Physical Therapy", "Memory Care", "Medication Management"],
        medicalRestrictions: ["No Ventilators"],
        priceRange: { min: 4200, max: 8500 },
        availabilityStatus: "Available",
        availableUnits: 8,
        totalUnits: 120,
        rating: "4.8",
        reviewCount: 156,
        googleRating: "4.7",
        googleReviewCount: 89,
        trustedReviews: [
          { source: "Google", rating: 4.7, reviewCount: 89, url: "https://google.com/reviews" },
          { source: "Yelp", rating: 4.5, reviewCount: 23, url: "https://yelp.com/reviews" },
          { source: "Care.com", rating: 4.9, reviewCount: 44 }
        ],
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3",
        imageGallery: [
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3"
        ],
        latitude: "39.7392358",
        longitude: "-104.9902719",
        licenseNumber: "CO-SL-001",
        licenseStatus: "Licensed",
        lastInspection: new Date("2024-01-15"),
        violations: 0,
        isVerified: true,
        isClaimed: false,
        lastPriceUpdate: new Date("2024-06-15"),
        lastAvailabilityUpdate: new Date("2024-07-01"),
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
        services: ["Meal Service", "Housekeeping", "Medication Management", "Social Activities"],
        medicalRestrictions: ["No Insulin Patients", "No Dialysis"],
        priceRange: { min: 3800, max: 6200 },
        availabilityStatus: "Waitlist",
        availableUnits: 0,
        totalUnits: 85,
        rating: "4.6",
        reviewCount: 98,
        googleRating: "4.4",
        googleReviewCount: 67,
        trustedReviews: [
          { source: "Google", rating: 4.4, reviewCount: 67, url: "https://google.com/reviews" },
          { source: "A Place for Mom", rating: 4.8, reviewCount: 31 }
        ],
        imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
        imageGallery: [
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3"
        ],
        latitude: "38.8338816",
        longitude: "-104.8213634",
        licenseNumber: "CO-SL-002",
        licenseStatus: "Under Review",
        lastInspection: new Date("2023-12-10"),
        violations: 2,
        isVerified: true,
        isClaimed: false,
        lastPriceUpdate: new Date("2024-05-20"),
        lastAvailabilityUpdate: new Date("2024-06-28"),
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
        services: ["Concierge Service", "Housekeeping", "Transportation", "Wellness Programs"],
        medicalRestrictions: [],
        priceRange: { min: 5200, max: 12000 },
        availabilityStatus: "Available",
        availableUnits: 15,
        totalUnits: 200,
        rating: "4.9",
        reviewCount: 234,
        googleRating: "4.8",
        googleReviewCount: 156,
        trustedReviews: [
          { source: "Google", rating: 4.8, reviewCount: 156, url: "https://google.com/reviews" },
          { source: "Yelp", rating: 4.7, reviewCount: 43, url: "https://yelp.com/reviews" },
          { source: "Care.com", rating: 5.0, reviewCount: 35 }
        ],
        imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3",
        imageGallery: [
          "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1594736797933-d0301ba2fe65?ixlib=rb-4.0.3"
        ],
        latitude: "40.0149856",
        longitude: "-105.2705456",
        licenseNumber: "CO-SL-003",
        licenseStatus: "Licensed",
        lastInspection: new Date("2024-02-20"),
        violations: 0,
        isVerified: true,
        isClaimed: true,
        lastPriceUpdate: new Date("2024-06-30"),
        lastAvailabilityUpdate: new Date("2024-07-02"),
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