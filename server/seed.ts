import { db } from "./db";
import { communities, users, reviews, type InsertCommunity, type InsertUser, type InsertReview } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingCommunities = await db.select().from(communities);
    if (existingCommunities.length > 0) {
      console.log("Database already seeded with", existingCommunities.length, "communities");
      return;
    }

    console.log("Seeding database with sample data...");

    // First seed users
    const sampleUsers: InsertUser[] = [
      {
        username: "john_doe",
        password: "password123"
      },
      {
        username: "mary_smith",
        password: "password123"
      },
      {
        username: "robert_johnson",
        password: "password123"
      }
    ];

    const insertedUsers = await db.insert(users).values(sampleUsers).returning();
    console.log("Seeded", insertedUsers.length, "users");

    const sampleCommunities: InsertCommunity[] = [
      {
        name: "Cascades of the North State",
        address: "2345 Babbling Brook Drive",
        city: "Redding",
        state: "CA",
        zipCode: "96002",
        phone: "(530) 224-6000",
        email: "info@cascadesnorthstate.com",
        website: "www.cascadesnorthstate.com",
        description: "Premium senior living community featuring independent living apartments with resort-style amenities and exceptional dining.",
        careTypes: ["Independent Living"],
        amenities: ["WiFi", "Parking", "Dining", "Fitness", "Restaurant", "Activities", "Library", "Pool", "Gardens", "Spa"],
        services: ["Concierge", "Housekeeping", "Maintenance", "Transportation", "Wellness Programs"],
        careServices: ["Independent Living Apartments", "24/7 Emergency Response", "Medication Reminders", "Wellness Checks"],
        photos: [
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        virtualTourUrl: "https://virtualtour.example.com/cascades-north-state",
        
        // Detailed Service Categories
        spaServices: ["Full-Service Spa", "Massage Therapy", "Manicure & Pedicure", "Hair Salon"],
        healthcareServices: ["Physical Therapy", "Occupational Therapy", "Hospice Care Coordination", "Medication Management", "Health Monitoring"],
        fitnessServices: ["Fitness Center", "Personal Training", "Water Aerobics", "Chair Yoga", "Walking Trails"],
        diningServices: ["Chef-Prepared Meals", "Special Dietary Accommodations", "Private Dining Room", "Bistro & Cafe"],
        transportationServices: ["Medical Appointments", "Shopping Excursions", "Local Errands", "Airport Transportation"],
        socialServices: ["Activity Director", "Life Enrichment Programs", "Spiritual Care", "Pet Therapy"],
        medicalRestrictions: [],
        priceRange: { min: 3200, max: 5800 },
        availabilityStatus: "Available Now",
        availableUnits: 7,
        googleRating: "4.2",
        googleReviewCount: 28,
        googleReviewSnippets: [
          {
            rating: 5,
            author: "Sarah M.",
            text: "My mother has been living here for 8 months and loves it. The staff is incredibly caring and the dining room food is restaurant quality. The activities keep her engaged and she's made wonderful friends.",
            date: "2024-11-15",
            isPositive: true
          },
          {
            rating: 4,
            author: "David K.",
            text: "Beautiful facility with great amenities. The staff goes above and beyond to make residents feel at home. Only minor complaint is parking can be limited during events.",
            date: "2024-10-22",
            isPositive: true
          }
        ],
        
        // Multiple Review Sources
        yelpReviews: [
          {
            rating: 4,
            author: "Jennifer R.",
            text: "Excellent spa services and the physical therapy team is outstanding. My father recovered so well from his knee surgery with their help.",
            date: "2024-12-01",
            isPositive: true
          },
          {
            rating: 5,
            author: "Mark T.",
            text: "The dining is truly exceptional - like a fine restaurant. The chef accommodates all dietary needs and the staff is incredibly professional.",
            date: "2024-11-28",
            isPositive: true
          }
        ],
        careComReviews: [
          {
            rating: 4,
            author: "Lisa K.",
            text: "Great care team and wonderful activities. The memory care program is excellent and the staff is well-trained in dealing with dementia patients.",
            date: "2024-11-20",
            isPositive: true
          }
        ],
        seniorAdvisorReviews: [
          {
            rating: 5,
            author: "Robert P.",
            text: "Top-notch facility with excellent healthcare coordination. They work seamlessly with our family's hospice provider when needed.",
            date: "2024-10-15",
            isPositive: true
          }
        ],
        aplaceformomReviews: [
          {
            rating: 4,
            author: "Carol D.",
            text: "Beautiful gardens and the spa services are a real treat. The transportation service is reliable for medical appointments.",
            date: "2024-11-05",
            isPositive: true
          }
        ],
        pricingDetails: {
          specialOffers: [
            {
              title: "Move-in Special",
              savings: 1500,
              description: "First month free with 12-month lease"
            }
          ]
        },
        totalUnits: 120,
        isClaimed: true
      },
      {
        name: "Prestige Senior Living Redding",
        address: "1570 Hartnell Avenue",
        city: "Redding",
        state: "CA",
        zipCode: "96002",
        phone: "(530) 221-1000",
        email: "redding@prestigecare.com",
        website: "www.prestigecare.com/redding",
        description: "Full-service senior living with assisted living and memory care in a warm, family-oriented environment.",
        careTypes: ["Assisted Living", "Memory Care"],
        amenities: ["WiFi", "Parking", "Dining", "Activities", "Garden", "Beauty Salon"],
        services: ["24/7 Care", "Medication Management", "Physical Therapy", "Memory Support", "Medical Services"],
        careServices: ["Assisted Living", "Memory Care", "24/7 Emergency Response", "Medication Management", "Personal Care Assistance"],
        medicalRestrictions: ["No Ventilators"],
        photos: [
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        virtualTourUrl: "https://virtualtour.example.com/prestige-redding",
        
        // Detailed Service Categories
        spaServices: ["Hair Salon", "Manicure Services", "Relaxation Therapy"],
        healthcareServices: ["Physical Therapy", "Occupational Therapy", "Memory Care Specialists", "Hospice Care Partnership", "Medication Management"],
        fitnessServices: ["Chair Exercises", "Balance Training", "Memory-Safe Walking Paths", "Gentle Stretching"],
        diningServices: ["Memory-Friendly Dining", "Nutritionist Consultation", "Special Dietary Plans", "Family Dining Room"],
        transportationServices: ["Medical Appointments", "Family Visits", "Local Outings"],
        socialServices: ["Memory Care Activities", "Family Support Groups", "Spiritual Care", "Pet Visits"],
        priceRange: { min: 4800, max: 7200 },
        availabilityStatus: "Waitlist",
        availableUnits: 0,
        googleRating: "4.6",
        googleReviewCount: 42,
        googleReviewSnippets: [
          {
            rating: 5,
            author: "Jennifer L.",
            text: "The care my father receives here is exceptional. The staff knows every resident by name and truly cares about their wellbeing. The memory care program has been a blessing for our family.",
            date: "2024-11-10",
            isPositive: true
          },
          {
            rating: 5,
            author: "Mark R.",
            text: "Clean, well-maintained facility with caring staff. The activities coordinator does an amazing job keeping residents engaged. Highly recommend this place.",
            date: "2024-10-18",
            isPositive: true
          }
        ],
        
        // Multiple Review Sources for Prestige Senior Living
        yelpReviews: [
          {
            rating: 5,
            author: "Sarah K.",
            text: "Outstanding memory care program. The staff is highly trained and compassionate. My grandmother feels safe and loved here.",
            date: "2024-11-25",
            isPositive: true
          }
        ],
        careComReviews: [
          {
            rating: 4,
            author: "Tom H.",
            text: "Great assisted living services and the physical therapy team has helped my wife regain her mobility. Professional staff all around.",
            date: "2024-11-12",
            isPositive: true
          }
        ],
        seniorAdvisorReviews: [
          {
            rating: 5,
            author: "Maria S.",
            text: "Family-oriented environment with excellent memory care. They work well with hospice providers when needed.",
            date: "2024-10-28",
            isPositive: true
          }
        ],
        aplaceformomReviews: [
          {
            rating: 4,
            author: "David W.",
            text: "Well-maintained facility with caring staff. The hair salon services are a nice touch for the residents.",
            date: "2024-11-03",
            isPositive: true
          }
        ],
        pricingDetails: {
          specialOffers: []
        },
        totalUnits: 85,
        isClaimed: true
      },
      {
        name: "Brookdale Redding",
        address: "2280 Benton Drive",
        city: "Redding",
        state: "CA",
        zipCode: "96003",
        phone: "(530) 244-3564",
        email: "redding@brookdale.com",
        website: "www.brookdale.com/redding",
        description: "Assisted living and memory care community offering personalized care plans and engaging lifestyle programs.",
        careTypes: ["Assisted Living", "Memory Care"],
        amenities: ["WiFi", "Parking", "Dining", "Fitness", "Activities", "Library", "Beauty Salon"],
        services: ["Personal Care", "Medication Management", "24/7 Support", "Memory Care Programs", "Wellness Services"],
        medicalRestrictions: ["No Skilled Nursing"],
        priceRange: { min: 5200, max: 8400 },
        availabilityStatus: "Available Now",
        availableUnits: 3,
        googleRating: "3.8",
        googleReviewCount: 67,
        googleReviewSnippets: [
          {
            rating: 4,
            author: "Linda S.",
            text: "Good facility with professional staff. My mom has been happy here for over a year. The dining options are varied and the activities keep her busy."
          },
          {
            rating: 3,
            author: "Tom H.",
            text: "Decent care but expensive. Staff turnover can be an issue. The facility is clean and well-maintained though."
          }
        ],
        pricingDetails: {
          specialOffers: [
            {
              title: "Winter Special",
              savings: 2000,
              description: "Two months free with annual commitment"
            }
          ]
        },
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
        availabilityStatus: "Available Now",
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
      
      // BAY AREA COMMUNITIES (EXPANDED NORTHERN CALIFORNIA MARKET)
      {
        name: "Jewish Home & Rehab Center",
        address: "302 Silver Avenue",
        city: "San Francisco",
        state: "CA",
        zipCode: "94112",
        phone: "(415) 334-2500",
        email: "info@jhrehab.org",
        website: "www.jhrehab.org",
        description: "Comprehensive senior care facility offering skilled nursing, rehabilitation, and memory care in San Francisco's Mission District.",
        careTypes: ["Skilled Nursing", "Memory Care", "Rehabilitation"],
        amenities: ["WiFi", "Parking", "Dining", "Therapy", "Activities", "Chapel", "Garden"],
        services: ["Physical Therapy", "Occupational Therapy", "Speech Therapy", "24/7 Nursing", "Memory Care"],
        careServices: ["Skilled Nursing", "Post-Acute Care", "Rehabilitation Services", "Memory Care", "Hospice Care"],
        medicalRestrictions: [],
        photos: [
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        virtualTourUrl: "https://virtualtour.example.com/jewish-home-sf",
        
        spaServices: ["Massage Therapy", "Hair Salon", "Manicure Services"],
        healthcareServices: ["Physical Therapy", "Occupational Therapy", "Speech Therapy", "24/7 Nursing Care", "Memory Care Specialists"],
        fitnessServices: ["Physical Therapy Gym", "Rehabilitation Equipment", "Walking Programs"],
        diningServices: ["Kosher Dining", "Nutritionist Consultation", "Special Dietary Plans"],
        transportationServices: ["Medical Appointments", "Local Transportation"],
        socialServices: ["Activity Programs", "Spiritual Care", "Family Support Groups"],
        
        yelpReviews: [
          {
            rating: 4,
            author: "Sarah R.",
            text: "Quality care facility. The rehabilitation team is excellent and helped my father recover quickly.",
            date: "2024-11-08",
            isPositive: true
          }
        ],
        careComReviews: [
          {
            rating: 5,
            author: "David L.",
            text: "Professional staff and excellent medical care. Would recommend for skilled nursing needs.",
            date: "2024-10-25",
            isPositive: true
          }
        ],
        seniorAdvisorReviews: [],
        aplaceformomReviews: [],
        
        priceRange: { min: 8200, max: 12500 },
        pricingDetails: {
          specialOffers: [
            {
              title: "Assessment Special",
              savings: 500,
              description: "Free assessment for new residents"
            }
          ]
        },
        availabilityStatus: "Available Now",
        availableUnits: 5,
        totalUnits: 180,
        rating: "4.3",
        reviewCount: 67,
        googleRating: "4.3",
        googleReviewCount: 67,
        googleReviewSnippets: [
          {
            rating: 5,
            author: "Lisa C.",
            text: "Excellent care for my mother. The staff is compassionate and professional. The rehabilitation services helped her regain mobility after surgery.",
            date: "2024-11-20",
            isPositive: true
          },
          {
            rating: 4,
            author: "Michael D.",
            text: "Good facility with skilled nursing care. The kosher dining options are appreciated. Staff could be more responsive at times.",
            date: "2024-10-15",
            isPositive: true
          }
        ],
        trustedReviews: [
          { source: "Google", rating: 4.3, reviewCount: 67, url: "https://google.com/reviews" },
          { source: "Yelp", rating: 4.2, reviewCount: 23, url: "https://yelp.com/reviews" }
        ],
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3",
        imageGallery: [
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3"
        ],
        latitude: "37.7353307",
        longitude: "-122.4066274",
        licenseNumber: "CA-SN-1234",
        licenseStatus: "Licensed",
        lastInspection: new Date("2024-08-15"),
        violations: 0,
        isVerified: true,
        isClaimed: true,
        lastPriceUpdate: new Date("2024-11-01"),
        lastAvailabilityUpdate: new Date("2024-11-15"),
      },
      
      {
        name: "The Heritage on the Marina",
        address: "3400 Laguna Street", 
        city: "San Francisco",
        state: "CA",
        zipCode: "94123",
        phone: "(415) 567-8800",
        email: "info@heritagemarina.com",
        website: "www.heritagemarina.com",
        description: "Luxury senior living in the heart of the Marina District with spectacular bay views and premium amenities.",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["WiFi", "Parking", "Fine Dining", "Fitness", "Concierge", "Bay Views", "Library", "Spa"],
        services: ["Concierge", "Housekeeping", "Transportation", "Wellness Programs", "Personal Care"],
        careServices: ["Independent Living", "Assisted Living", "Personal Care Services", "Wellness Programs"],
        medicalRestrictions: ["No Skilled Nursing"],
        photos: [
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1576091160501-bbe57469278f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        virtualTourUrl: "https://virtualtour.example.com/heritage-marina-sf",
        
        spaServices: ["Full-Service Spa", "Massage Therapy", "Facial Treatments", "Hair & Nail Salon"],
        healthcareServices: ["Wellness Clinic", "Physical Therapy", "Health Monitoring", "Medication Management"],
        fitnessServices: ["State-of-the-Art Fitness Center", "Personal Training", "Water Aerobics", "Yoga Classes"],
        diningServices: ["Fine Dining Restaurant", "Private Dining", "Wine Cellar", "Chef-Prepared Meals"],
        transportationServices: ["Luxury Transportation", "Airport Service", "Shopping Trips", "Theater Outings"],
        socialServices: ["Activity Director", "Cultural Events", "Social Clubs", "Educational Programs"],
        
        yelpReviews: [
          {
            rating: 5,
            author: "Monica W.",
            text: "Luxury senior living at its finest. The Marina location is perfect and the amenities are outstanding.",
            date: "2024-11-12",
            isPositive: true
          }
        ],
        careComReviews: [],
        seniorAdvisorReviews: [],
        aplaceformomReviews: [],
        
        priceRange: { min: 12000, max: 18500 },
        pricingDetails: {
          specialOffers: []
        },
        availabilityStatus: "Waitlist",
        availableUnits: 0,
        totalUnits: 95,
        rating: "4.7",
        reviewCount: 124,
        googleRating: "4.7",
        googleReviewCount: 124,
        googleReviewSnippets: [
          {
            rating: 5,
            author: "Elizabeth M.",
            text: "Absolutely stunning facility with incredible bay views. The staff treats residents like family. Worth every penny for the luxury and care.",
            date: "2024-11-18",
            isPositive: true
          },
          {
            rating: 5,
            author: "James P.",
            text: "My mother loves living here. The dining is exceptional and the concierge service is top-notch. Highly recommend.",
            date: "2024-10-30",
            isPositive: true
          }
        ],
        trustedReviews: [
          { source: "Google", rating: 4.7, reviewCount: 124, url: "https://google.com/reviews" },
          { source: "Yelp", rating: 4.8, reviewCount: 89, url: "https://yelp.com/reviews" }
        ],
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3",
        imageGallery: [
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1576091160501-bbe57469278f?ixlib=rb-4.0.3"
        ],
        latitude: "37.8044557",
        longitude: "-122.4412784",
        licenseNumber: "CA-AL-5678",
        licenseStatus: "Licensed",
        lastInspection: new Date("2024-09-20"),
        violations: 0,
        isVerified: true,
        isClaimed: true,
        lastPriceUpdate: new Date("2024-10-15"),
        lastAvailabilityUpdate: new Date("2024-11-10"),
      },
    ];

    // Insert the communities
    const insertedCommunities = await db.insert(communities).values(sampleCommunities).returning();
    console.log("Seeded", insertedCommunities.length, "communities");

    // Now seed some sample reviews
    const sampleReviews: InsertReview[] = [
      {
        communityId: insertedCommunities[0].id, // Sunrise Manor
        userId: insertedUsers[0].id,
        rating: 5,
        title: "Excellent care for my mother",
        reviewText: "My mother has been at Sunrise Manor for 8 months now and we couldn't be happier. The staff is attentive, the facilities are clean and modern, and there are plenty of activities to keep residents engaged. The memory care unit is particularly well-run.",
        pros: ["Excellent staff", "Clean facilities", "Great activities", "Good memory care"],
        cons: ["Parking can be limited"],
        relationshipType: "Family Member",
        stayDuration: "6-12 months",
        careLevel: "Memory Care",
        wouldRecommend: true
      },
      {
        communityId: insertedCommunities[0].id, // Sunrise Manor
        userId: insertedUsers[1].id,
        rating: 4,
        title: "Good community with minor issues",
        reviewText: "Overall, we're satisfied with the care my father receives here. The dining options are varied and the physical therapy team is excellent. However, communication could be better and some maintenance issues take a while to resolve.",
        pros: ["Good dining", "Excellent PT", "Nice location"],
        cons: ["Communication issues", "Slow maintenance response"],
        relationshipType: "Family Member",
        stayDuration: "1-2 years",
        careLevel: "Assisted Living",
        wouldRecommend: true
      },
      {
        communityId: insertedCommunities[1].id, // Golden Years
        userId: insertedUsers[2].id,
        rating: 5,
        title: "Feels like home",
        reviewText: "I moved here 6 months ago and it truly feels like home. The staff knows everyone by name, the food is restaurant quality, and I've made wonderful friends. The fitness center and pool are well-maintained and there's always something fun happening.",
        pros: ["Personal attention", "Great food", "Active community", "Good amenities"],
        cons: [],
        relationshipType: "Current Resident",
        stayDuration: "3-6 months",
        careLevel: "Independent Living",
        wouldRecommend: true
      }
    ];

    await db.insert(reviews).values(sampleReviews);
    console.log("Seeded", sampleReviews.length, "reviews");

    console.log("Successfully seeded database with sample data");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}