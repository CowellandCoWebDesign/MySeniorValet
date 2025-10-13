import { db } from "../db";
import { communities } from "@shared/schema";
import type { InsertCommunity } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Quick insertion of Kentucky & Nebraska facilities
 * Targeting major cities in most underserved states
 * Data from web searches - August 26, 2025
 */

async function insertKentuckyNebraskaFacilities() {
  console.log("=== KENTUCKY & NEBRASKA EXPANSION ===");
  console.log("Addressing critical coverage gaps\n");

  const facilities: InsertCommunity[] = [
    // ========== KENTUCKY MAJOR CITIES ==========
    // Louisville Metro (population 630,000)
    {
      name: "Signature HealthCARE of Cherokee Park",
      address: "4910 Bardstown Road",
      city: "Louisville",
      state: "KY",
      zipCode: "40291",
      country: "US",
      latitude: 38.1663,
      longitude: -85.6485,
      phone: "(502) 499-6066",
      website: "https://ltclouisville.com/",
      description: "Skilled nursing and rehabilitation center in Louisville metro area",
      careTypes: ["Skilled Nursing", "Rehabilitation"],
      amenities: ["Therapy Services", "Medicare Certified"],
      services: ["Physical Therapy", "Occupational Therapy", "Speech Therapy"],
      careServices: ["Skilled Nursing"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Signature HealthCARE",
      hasAcceptedTerms: true,
      rating: 3.8
    },
    {
      name: "Wesley Manor Retirement Community",
      address: "5012 E Manslick Road",
      city: "Louisville",
      state: "KY",
      zipCode: "40219",
      country: "US",
      latitude: 38.1889,
      longitude: -85.6897,
      phone: "(502) 969-3277",
      website: "https://www.wesleymanor.org/",
      description: "Methodist-affiliated senior living community",
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      amenities: ["Chapel", "Activity Programs", "Dining Services"],
      services: ["Social Activities", "Transportation", "Housekeeping"],
      careServices: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Wesley Manor",
      hasAcceptedTerms: true,
      rating: 4.2
    },
    {
      name: "Nazareth Home Louisville",
      address: "2000 Newburg Road",
      city: "Louisville",
      state: "KY",
      zipCode: "40205",
      country: "US",
      latitude: 38.2184,
      longitude: -85.6981,
      phone: "(502) 459-9681",
      website: "https://www.nazarethhome.org/",
      description: "Catholic healthcare ministry serving seniors since 1869",
      careTypes: ["Assisted Living", "Memory Care", "Skilled Nursing"],
      amenities: ["Chapel", "Gardens", "Activity Center"],
      services: ["Spiritual Care", "Memory Support", "Rehabilitation"],
      careServices: ["Assisted Living", "Memory Care", "Skilled Nursing"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Nazareth Home",
      hasAcceptedTerms: true,
      rating: 4.5
    },
    
    // Lexington (population 323,000)
    {
      name: "Richmond Place Senior Living",
      address: "3051 Rio Dosa Drive",
      city: "Lexington",
      state: "KY",
      zipCode: "40509",
      country: "US",
      latitude: 38.0026,
      longitude: -84.4378,
      phone: "(859) 269-6308",
      website: "https://richmondplacelex.com/",
      description: "Premier senior living community in Lexington",
      careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
      amenities: ["Fitness Center", "Library", "Theater"],
      services: ["Concierge", "Fine Dining", "Wellness Programs"],
      careServices: ["Independent Living", "Assisted Living", "Memory Care"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Richmond Place",
      hasAcceptedTerms: true,
      rating: 4.3
    },
    {
      name: "Morning Pointe of Lexington",
      address: "150 Shoreside Drive",
      city: "Lexington",
      state: "KY",
      zipCode: "40515",
      country: "US",
      latitude: 38.0498,
      longitude: -84.5416,
      phone: "(859) 273-4813",
      website: "https://morningpointe.com/",
      description: "Assisted living and Alzheimer's care community",
      careTypes: ["Assisted Living", "Memory Care"],
      amenities: ["Secured Memory Unit", "Activity Programs", "Gardens"],
      services: ["Alzheimer's Care", "24/7 Care", "Life Enrichment"],
      careServices: ["Assisted Living", "Memory Care"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Morning Pointe",
      hasAcceptedTerms: true,
      rating: 4.1
    },

    // Bowling Green (population 72,000)
    {
      name: "The Medical Center at Bowling Green",
      address: "250 Park Street",
      city: "Bowling Green",
      state: "KY",
      zipCode: "42101",
      country: "US",
      latitude: 36.9878,
      longitude: -86.4436,
      phone: "(270) 745-1000",
      website: "https://www.themedicalcenter.org/",
      description: "Regional healthcare facility with senior care services",
      careTypes: ["Skilled Nursing", "Rehabilitation"],
      amenities: ["Medical Services", "Therapy Center"],
      services: ["Post-Acute Care", "Rehabilitation", "Medical Care"],
      careServices: ["Skilled Nursing"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "The Medical Center",
      hasAcceptedTerms: true,
      rating: 3.9
    },
    {
      name: "Bowling Green Retirement Village",
      address: "1007 Westen Street",
      city: "Bowling Green",
      state: "KY",
      zipCode: "42104",
      country: "US",
      latitude: 36.9685,
      longitude: -86.4808,
      phone: "(270) 843-0233",
      website: "https://www.bgretirement.com/",
      description: "Full-service retirement community",
      careTypes: ["Independent Living", "Assisted Living"],
      amenities: ["Pool", "Fitness Center", "Library"],
      services: ["Activities", "Transportation", "Dining"],
      careServices: ["Independent Living", "Assisted Living"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "BGRV",
      hasAcceptedTerms: true,
      rating: 4.0
    },

    // Owensboro (population 60,000)
    {
      name: "Carmel Home",
      address: "2501 Old Hartford Road",
      city: "Owensboro",
      state: "KY",
      zipCode: "42303",
      country: "US",
      latitude: 37.7456,
      longitude: -87.0917,
      phone: "(270) 683-0227",
      website: "https://www.carmelhome.org/",
      description: "Catholic senior living community founded in 1869",
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      amenities: ["Chapel", "Gardens", "Activity Center"],
      services: ["Spiritual Care", "Social Services", "Healthcare"],
      careServices: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Carmel Home",
      hasAcceptedTerms: true,
      rating: 4.4
    },

    // ========== NEBRASKA MAJOR CITIES ==========
    // Omaha Metro (population 487,000)
    {
      name: "Brookestone Village",
      address: "11901 Stone Plaza",
      city: "Omaha",
      state: "NE",
      zipCode: "68164",
      country: "US",
      latitude: 41.2874,
      longitude: -96.1153,
      phone: "(402) 496-0003",
      website: "https://www.brookestonevillage.com/",
      description: "Premier retirement community in West Omaha",
      careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
      amenities: ["Wellness Center", "Pool", "Restaurant"],
      services: ["Concierge", "Transportation", "Life Enrichment"],
      careServices: ["Independent Living", "Assisted Living", "Memory Care"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Brookestone Village",
      hasAcceptedTerms: true,
      rating: 4.5
    },
    {
      name: "Immanuel Village",
      address: "6901 North 72nd Street",
      city: "Omaha",
      state: "NE",
      zipCode: "68122",
      country: "US",
      latitude: 41.3194,
      longitude: -96.0248,
      phone: "(402) 572-2700",
      website: "https://www.immanuel.com/",
      description: "Faith-based senior living community with full continuum of care",
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing", "Memory Care"],
      amenities: ["Chapel", "Fitness Center", "Gardens"],
      services: ["Healthcare", "Spiritual Care", "Activities"],
      careServices: ["Independent Living", "Assisted Living", "Skilled Nursing", "Memory Care"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Immanuel",
      hasAcceptedTerms: true,
      rating: 4.3
    },
    {
      name: "Aksarben Village Senior Living",
      address: "1055 Pine Street",
      city: "Omaha",
      state: "NE",
      zipCode: "68106",
      country: "US",
      latitude: 41.2455,
      longitude: -96.0000,
      phone: "(402) 281-3900",
      website: "https://aksarbenliving.com/",
      description: "Modern senior living in vibrant Aksarben Village",
      careTypes: ["Independent Living", "Assisted Living"],
      amenities: ["Rooftop Terrace", "Fitness Center", "Theater"],
      services: ["Dining", "Transportation", "Wellness Programs"],
      careServices: ["Independent Living", "Assisted Living"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Aksarben Village",
      hasAcceptedTerms: true,
      rating: 4.4
    },

    // Lincoln (population 295,000)
    {
      name: "The Landing at Williamsburg Village",
      address: "4000 South 84th Street",
      city: "Lincoln",
      state: "NE",
      zipCode: "68506",
      country: "US",
      latitude: 40.7668,
      longitude: -96.6285,
      phone: "(402) 434-3200",
      website: "https://www.thelandingatwilliamsburg.com/",
      description: "Lincoln's premier senior living community",
      careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
      amenities: ["Pool", "Fitness Center", "Library"],
      services: ["Fine Dining", "Concierge", "Activities"],
      careServices: ["Independent Living", "Assisted Living", "Memory Care"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "The Landing",
      hasAcceptedTerms: true,
      rating: 4.6
    },
    {
      name: "Eastmont Towers",
      address: "6315 O Street",
      city: "Lincoln",
      state: "NE",
      zipCode: "68510",
      country: "US",
      latitude: 40.8138,
      longitude: -96.6419,
      phone: "(402) 489-6591",
      website: "https://www.eastmonttowers.com/",
      description: "Independent and assisted living high-rise community",
      careTypes: ["Independent Living", "Assisted Living"],
      amenities: ["City Views", "Community Spaces", "Gardens"],
      services: ["24/7 Staff", "Activities", "Transportation"],
      careServices: ["Independent Living", "Assisted Living"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Eastmont Towers",
      hasAcceptedTerms: true,
      rating: 4.2
    },
    {
      name: "Legacy Terrace",
      address: "5700 Fremont Street",
      city: "Lincoln",
      state: "NE",
      zipCode: "68507",
      country: "US",
      latitude: 40.8476,
      longitude: -96.6500,
      phone: "(402) 436-4444",
      website: "https://legacyretirement.com/",
      description: "Rehabilitation and long-term care facility",
      careTypes: ["Skilled Nursing", "Rehabilitation"],
      amenities: ["Therapy Center", "Medicare Certified"],
      services: ["Physical Therapy", "Occupational Therapy", "Speech Therapy"],
      careServices: ["Skilled Nursing"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Legacy",
      hasAcceptedTerms: true,
      rating: 3.9
    },

    // Grand Island (population 53,000)
    {
      name: "Riverside Lodge",
      address: "2222 West Faidley Avenue",
      city: "Grand Island",
      state: "NE",
      zipCode: "68803",
      country: "US",
      latitude: 40.9264,
      longitude: -98.3664,
      phone: "(308) 385-5225",
      website: "https://www.riversidelodge.org/",
      description: "Senior living community serving central Nebraska",
      careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
      amenities: ["Activity Center", "Gardens", "Dining Room"],
      services: ["Activities", "Transportation", "Healthcare"],
      careServices: ["Independent Living", "Assisted Living", "Memory Care"],
      medicalRestrictions: [],
      photos: [],
      photoAttributions: [],
      data_source: "Riverside Lodge",
      hasAcceptedTerms: true,
      rating: 4.1
    }
  ];

  console.log(`📊 Facilities to insert: ${facilities.length}`);
  console.log("Kentucky cities: Louisville (3), Lexington (2), Bowling Green (2), Owensboro (1)");
  console.log("Nebraska cities: Omaha (3), Lincoln (3), Grand Island (1)\n");

  let inserted = 0, skipped = 0;

  for (const facility of facilities) {
    try {
      const existing = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.name, facility.name),
            eq(communities.city, facility.city)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️ Skipping: ${facility.name}, ${facility.city}`);
        skipped++;
        continue;
      }

      await db.insert(communities).values(facility);
      console.log(`✅ Inserted: ${facility.name}, ${facility.city}, ${facility.state}`);
      inserted++;
    } catch (error) {
      console.error(`❌ Error: ${facility.name}:`, error);
    }
  }

  // Get updated totals
  const [kyTotal] = await db
    .select({ count: sql`count(*)::int` })
    .from(communities)
    .where(eq(communities.state, "KY"));
    
  const [neTotal] = await db
    .select({ count: sql`count(*)::int` })
    .from(communities)
    .where(eq(communities.state, "NE"));

  const [globalTotal] = await db
    .select({ count: sql`count(*)::int` })
    .from(communities);

  console.log("\n📈 SUMMARY");
  console.log("==========");
  console.log(`Inserted: ${inserted}, Skipped: ${skipped}`);
  console.log(`\nKentucky: ${kyTotal?.count || 0} total facilities`);
  console.log(`Nebraska: ${neTotal?.count || 0} total facilities`);
  console.log(`Global total: ${globalTotal?.count || 0} facilities`);
  
  process.exit(0);
}

insertKentuckyNebraskaFacilities().catch(console.error);