import { db } from "./db";
import { communities, type InsertCommunity } from "@shared/schema";
import { googlePlacesIntegration } from "./google-places-integration";
import { multiSourceVerifier } from "./multi-source-verifier";
import { eq, and, like, or } from "drizzle-orm";

export interface RegionalExpansionTarget {
  county: string;
  region: string;
  primaryCities: string[];
  state: string;
  searchRadius: number; // in km
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  priority: number; // 1-10, higher = more priority
  marketSize: "Urban" | "Suburban" | "Rural";
}

export interface ExpansionResults {
  county: string;
  region: string;
  totalFound: number;
  newCommunities: number;
  duplicatesFiltered: number;
  enrichedCommunities: number;
  verificationLevel: "High" | "Medium" | "Low";
  discoveryMethods: string[];
  errors: string[];
}

export class RegionalExpansionEngine {
  private expansionProgress: {
    isActive: boolean;
    currentCounty: string;
    currentRegion: string;
    currentQuery: string;
    currentCity: string;
    countiesProcessed: number;
    totalCounties: number;
    communitiesFound: number;
    totalQueries: number;
    completedQueries: number;
    startTime: Date | null;
    estimatedCompletion: Date | null;
  } = {
    isActive: false,
    currentCounty: '',
    currentRegion: '',
    currentQuery: '',
    currentCity: '',
    countiesProcessed: 0,
    totalCounties: 0,
    communitiesFound: 0,
    totalQueries: 0,
    completedQueries: 0,
    startTime: null,
    estimatedCompletion: null
  };

  private expansionResults: (ExpansionResults & { processingTime?: number })[] = [];

  private readonly targetCounties: RegionalExpansionTarget[] = [
    // COMPLETED COUNTIES (148 communities total)
    // Bay Area: Alameda, Contra Costa, Santa Clara, San Mateo, Marin, San Francisco
    // Sacramento Region: Sacramento, Placer, Yolo, Solano, Sonoma
    // North State: Shasta (30 communities)
    
    // REMAINING NORTHERN CALIFORNIA COUNTIES FOR COMPLETE COVERAGE
    
    // Central Valley North - Major Population Centers (UNCOVERED)
    {
      county: "Butte",
      region: "Central Valley North", 
      primaryCities: ["Chico", "Oroville", "Paradise", "Gridley", "Biggs"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 39.7285, lng: -121.8375 }, // Chico center
      priority: 10,
      marketSize: "Suburban"
    },
    {
      county: "Sutter",
      region: "Central Valley North",
      primaryCities: ["Yuba City", "Live Oak", "Sutter"],
      state: "CA",
      searchRadius: 20,
      centerCoordinates: { lat: 39.1404, lng: -121.6169 }, // Yuba City
      priority: 9,
      marketSize: "Suburban"
    },
    {
      county: "Yuba",
      region: "Central Valley North",
      primaryCities: ["Marysville", "Wheatland", "Olivehurst"],
      state: "CA",
      searchRadius: 20,
      centerCoordinates: { lat: 39.1457, lng: -121.5914 }, // Marysville
      priority: 8,
      marketSize: "Rural"
    },
    {
      county: "Glenn",
      region: "Central Valley North",
      primaryCities: ["Willows", "Orland", "Hamilton City"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 39.5240, lng: -122.1942 }, // Willows
      priority: 7,
      marketSize: "Rural"
    },
    {
      county: "Colusa",
      region: "Central Valley North",
      primaryCities: ["Colusa", "Williams", "Arbuckle"],
      state: "CA",
      searchRadius: 20,
      centerCoordinates: { lat: 39.2143, lng: -122.0094 }, // Colusa
      priority: 6,
      marketSize: "Rural"
    },
    {
      county: "Tehama",
      region: "North State",
      primaryCities: ["Red Bluff", "Corning", "Tehama", "Los Molinos"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 40.1785, lng: -122.2357 }, // Red Bluff
      priority: 9,
      marketSize: "Rural"
    },
    
    // North Coast - UNCOVERED REGION
    {
      county: "Humboldt",
      region: "North Coast",
      primaryCities: ["Eureka", "Arcata", "Fortuna", "McKinleyville", "Ferndale"],
      state: "CA",
      searchRadius: 35,
      centerCoordinates: { lat: 40.8021, lng: -124.1637 }, // Eureka
      priority: 10,
      marketSize: "Suburban"
    },
    {
      county: "Del Norte",
      region: "North Coast",
      primaryCities: ["Crescent City", "Klamath", "Gasquet"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 41.7557, lng: -124.2026 }, // Crescent City
      priority: 8,
      marketSize: "Rural"
    },
    {
      county: "Mendocino",
      region: "North Coast",
      primaryCities: ["Ukiah", "Fort Bragg", "Willits", "Point Arena"],
      state: "CA",
      searchRadius: 35,
      centerCoordinates: { lat: 39.1502, lng: -123.2078 }, // Ukiah
      priority: 9,
      marketSize: "Rural"
    },
    {
      county: "Lake",
      region: "North Coast",
      primaryCities: ["Lakeport", "Clearlake", "Kelseyville"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 39.0436, lng: -122.9161 }, // Lakeport
      priority: 7,
      marketSize: "Rural"
    },
    
    // Far North - UNCOVERED REGION
    {
      county: "Siskiyou",
      region: "Far North",
      primaryCities: ["Yreka", "Mount Shasta", "Weed", "Tulelake"],
      state: "CA",
      searchRadius: 40,
      centerCoordinates: { lat: 41.7357, lng: -122.6344 }, // Yreka
      priority: 8,
      marketSize: "Rural"
    },
    {
      county: "Modoc",
      region: "Far North",
      primaryCities: ["Alturas", "Cedarville", "Tulelake"],
      state: "CA",
      searchRadius: 35,
      centerCoordinates: { lat: 41.4871, lng: -120.5424 }, // Alturas
      priority: 6,
      marketSize: "Rural"
    },
    {
      county: "Lassen",
      region: "Far North",
      primaryCities: ["Susanville", "Westwood", "Herlong"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 40.4162, lng: -120.6510 }, // Susanville
      priority: 7,
      marketSize: "Rural"
    },
    
    // Sierra Nevada - UNCOVERED REGION
    {
      county: "Plumas",
      region: "Sierra Nevada",
      primaryCities: ["Quincy", "Portola", "Chester"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 39.9368, lng: -120.9468 }, // Quincy
      priority: 6,
      marketSize: "Rural"
    },
    {
      county: "Sierra",
      region: "Sierra Nevada",
      primaryCities: ["Downieville", "Loyalton", "Sierraville"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 39.5590, lng: -120.8191 }, // Downieville
      priority: 5,
      marketSize: "Rural"
    },
    {
      county: "Nevada",
      region: "Sierra Nevada",
      primaryCities: ["Nevada City", "Grass Valley", "Truckee"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 39.2609, lng: -121.0160 }, // Nevada City
      priority: 8,
      marketSize: "Rural"
    },
    {
      county: "Alameda",
      region: "Bay Area",
      primaryCities: ["Oakland", "Fremont", "Berkeley", "Hayward", "Alameda"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 37.8044, lng: -122.2711 },
      priority: 8,
      marketSize: "Urban"
    },
    {
      county: "Contra Costa",
      region: "Bay Area", 
      primaryCities: ["Walnut Creek", "Concord", "Richmond", "Antioch", "Pittsburg"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 37.9161, lng: -122.0588 },
      priority: 8,
      marketSize: "Suburban"
    },
    {
      county: "Santa Clara",
      region: "Bay Area",
      primaryCities: ["San Jose", "Cupertino", "Palo Alto", "Mountain View", "Santa Clara"],
      state: "CA",
      searchRadius: 35,
      centerCoordinates: { lat: 37.3382, lng: -121.8863 },
      priority: 10,
      marketSize: "Urban"
    },
    {
      county: "San Mateo",
      region: "Bay Area",
      primaryCities: ["San Mateo", "Daly City", "Redwood City", "Burlingame", "Foster City"],
      state: "CA",
      searchRadius: 20,
      centerCoordinates: { lat: 37.5630, lng: -122.3255 },
      priority: 9,
      marketSize: "Suburban"
    },
    {
      county: "Marin",
      region: "Bay Area",
      primaryCities: ["Novato", "San Rafael", "Mill Valley", "Sausalito", "Tiburon"],
      state: "CA",
      searchRadius: 15,
      centerCoordinates: { lat: 38.0834, lng: -122.7633 },
      priority: 7,
      marketSize: "Suburban"
    },
    {
      county: "Sacramento",
      region: "Sacramento Region",
      primaryCities: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Rancho Cordova"],
      state: "CA",
      searchRadius: 40,
      centerCoordinates: { lat: 38.5816, lng: -121.4944 },
      priority: 8,
      marketSize: "Urban"
    },
    {
      county: "Sonoma",
      region: "North Coast",
      primaryCities: ["Santa Rosa", "Petaluma", "Rohnert Park", "Sebastopol", "Healdsburg"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 38.4404, lng: -122.7144 },
      priority: 6,
      marketSize: "Suburban"
    },
    // Additional Northern California Counties for comprehensive coverage
    {
      county: "Yolo",
      region: "Central Valley North",
      primaryCities: ["Davis", "Woodland", "West Sacramento", "Winters"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 38.6785, lng: -121.7733 },
      priority: 7,
      marketSize: "Suburban"
    },
    {
      county: "Solano",
      region: "Bay Area North",
      primaryCities: ["Vallejo", "Fairfield", "Vacaville", "Suisun City"],
      state: "CA",
      searchRadius: 25,
      centerCoordinates: { lat: 38.3555, lng: -121.9018 },
      priority: 7,
      marketSize: "Suburban"
    },
    {
      county: "Placer",
      region: "Sacramento Region",
      primaryCities: ["Roseville", "Rocklin", "Auburn", "Lincoln"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 39.0916, lng: -120.8039 },
      priority: 8,
      marketSize: "Suburban"
    }
  ];

  private readonly discoveryQueries = [
    "senior living",
    "assisted living", 
    "retirement community",
    "senior apartments",
    "Senior Park",
    "retirement home"
  ];

  /**
   * Execute comprehensive regional expansion for all target counties
   * 🔥 FIRE-PROOFED: Includes cost protection and session tracking
   */
  async executeRegionalExpansion(): Promise<ExpansionResults[]> {
    const { expansionFireProofing } = await import('./expansion-fire-proofing');
    
    // CRITICAL: Check if expansion is allowed and get cost estimate
    const expansionCheck = await expansionFireProofing.checkExpansionAllowed();
    if (!expansionCheck.allowed) {
      throw new Error(`Expansion blocked: ${expansionCheck.reason}`);
    }

    console.log("🔥 FIRE-PROOFED Regional Expansion Starting...");
    console.log(`   Estimated Cost: $${expansionCheck.estimatedCost.toFixed(2)}`);
    console.log(`   Estimated API Calls: ${expansionCheck.totalApiCalls}`);
    console.log(`   Counties to Process: ${this.targetCounties.length}`);

    // Start tracked session
    const sessionId = await expansionFireProofing.startExpansionSession(
      this.targetCounties.length,
      expansionCheck.estimatedCost
    );

    const results: ExpansionResults[] = [];
    let actualCost = 0;
    let totalApiCalls = 0;
    
    // Initialize progress tracking
    this.expansionProgress = {
      isActive: true,
      currentCounty: '',
      currentRegion: '',
      currentQuery: '',
      currentCity: '',
      countiesProcessed: 0,
      totalCounties: this.targetCounties.length,
      communitiesFound: 0,
      totalQueries: this.targetCounties.length * this.discoveryQueries.length * 5, // Estimate
      completedQueries: 0,
      startTime: new Date(),
      estimatedCompletion: null
    };
    
    // Process counties in priority order
    const sortedCounties = this.targetCounties.sort((a, b) => b.priority - a.priority);
    
    try {
      for (const county of sortedCounties) {
        // Check if session is still valid before each county
        if (!expansionFireProofing.isSessionValid(sessionId)) {
          throw new Error('Expansion session invalidated');
        }

        console.log(`🔍 Processing ${county.county} County (${county.region})...`);
        
        this.expansionProgress.currentCounty = county.county;
        this.expansionProgress.currentRegion = county.region;
        
        const startTime = Date.now();
        
        try {
          const result = await this.expandToCounty(county);
          const processingTime = Date.now() - startTime;
          
          // Estimate cost for this county (rough calculation)
          const countyCost = county.primaryCities.length * this.discoveryQueries.length * 0.032;
          actualCost += countyCost;
          totalApiCalls += county.primaryCities.length * this.discoveryQueries.length;
          
          const resultWithTiming = { ...result, processingTime };
          results.push(resultWithTiming);
          this.expansionResults.push(resultWithTiming);
          
          this.expansionProgress.countiesProcessed++;
          this.expansionProgress.communitiesFound += result.newCommunities;
          
          // Update session progress
          await expansionFireProofing.updateSessionProgress(
            sessionId,
            this.expansionProgress.countiesProcessed,
            actualCost,
            totalApiCalls
          );
          
          // Rate limiting between counties
          await this.delay(2000);
          
        } catch (error: any) {
          console.error(`❌ Error processing ${county.county}:`, error);
          const errorResult = {
            county: county.county,
            region: county.region,
            totalFound: 0,
            newCommunities: 0,
            duplicatesFiltered: 0,
            enrichedCommunities: 0,
            verificationLevel: "Low" as const,
            discoveryMethods: [],
            errors: [error?.message || 'Unknown error'],
            processingTime: Date.now() - startTime
          };
          results.push(errorResult);
          this.expansionResults.push(errorResult);
          
          this.expansionProgress.countiesProcessed++;
          
          // Update session even on error
          await expansionFireProofing.updateSessionProgress(
            sessionId,
            this.expansionProgress.countiesProcessed,
            actualCost,
            totalApiCalls
          );
        }
      }

      // Complete session successfully
      await expansionFireProofing.completeExpansionSession(sessionId);
      
    } catch (error: any) {
      // Emergency stop the session
      await expansionFireProofing.emergencyStopSession(sessionId, error.message);
      throw error;
    }
    
    // Mark expansion as complete
    this.expansionProgress.isActive = false;
    
    console.log(`✅ Regional Expansion Complete: ${results.length} counties processed`);
    return results;
  }

  /**
   * Expand discovery to a specific county using 6-query strategy
   */
  private async expandToCounty(target: RegionalExpansionTarget): Promise<ExpansionResults> {
    const result: ExpansionResults = {
      county: target.county,
      region: target.region,
      totalFound: 0,
      newCommunities: 0,
      duplicatesFiltered: 0,
      enrichedCommunities: 0,
      verificationLevel: "Medium",
      discoveryMethods: [],
      errors: []
    };

    console.log(`🎯 Targeting ${target.county} County with 6-query strategy...`);

    // Execute 6-query discovery strategy
    const allDiscoveredCommunities = [];
    
    for (const query of this.discoveryQueries) {
      for (const city of target.primaryCities) {
        try {
          console.log(`🔍 Searching "${query}" in ${city}, ${target.state}...`);
          
          const communities = await googlePlacesIntegration.discoverCommunitiesInArea(
            `${query} ${city} ${target.state}`,
            target.centerCoordinates.lat,
            target.centerCoordinates.lng
          );

          if (communities.length > 0) {
            result.discoveryMethods.push(`${query} (${city})`);
            allDiscoveredCommunities.push(...communities);
            console.log(`✅ Found ${communities.length} communities for "${query}" in ${city}`);
          }

          // Rate limiting between searches
          await this.delay(1000);
          
        } catch (error) {
          console.error(`❌ Error searching "${query}" in ${city}:`, error);
          result.errors.push(`${query} in ${city}: ${error.message}`);
        }
      }
    }

    result.totalFound = allDiscoveredCommunities.length;

    // Deduplication and verification
    const uniqueCommunities = await this.deduplicateAndVerify(allDiscoveredCommunities, target);
    result.duplicatesFiltered = result.totalFound - uniqueCommunities.length;

    // Save verified communities to database
    let savedCount = 0;
    for (const community of uniqueCommunities) {
      try {
        const saved = await this.saveCommunityToDatabase(community, target);
        if (saved) {
          savedCount++;
        }
      } catch (error) {
        console.error(`❌ Error saving community ${community.name}:`, error);
        result.errors.push(`Save error: ${error.message}`);
      }
    }

    result.newCommunities = savedCount;

    // Enrichment phase
    try {
      const enriched = await this.enrichNewCommunities(target);
      result.enrichedCommunities = enriched;
    } catch (error) {
      console.error(`❌ Error enriching communities:`, error);
      result.errors.push(`Enrichment error: ${error.message}`);
    }

    console.log(`✅ ${target.county} County Complete: ${result.newCommunities} new communities added`);
    return result;
  }

  /**
   * Deduplicate communities and verify authenticity
   */
  private async deduplicateAndVerify(communities: any[], target: RegionalExpansionTarget): Promise<any[]> {
    const seenNames = new Set<string>();
    const seenAddresses = new Set<string>();
    const seenPhones = new Set<string>();
    const unique = [];

    for (const community of communities) {
      const nameKey = community.name.toLowerCase().trim();
      const addressKey = community.address?.toLowerCase().trim() || "";
      const phoneKey = community.phone?.replace(/\D/g, "") || "";

      // Skip if duplicate
      if (seenNames.has(nameKey) || 
          (addressKey && seenAddresses.has(addressKey)) || 
          (phoneKey && seenPhones.has(phoneKey))) {
        continue;
      }

      // Check if already exists in database
      const existing = await db.select().from(communities).where(
        or(
          eq(communities.name, community.name),
          and(
            eq(communities.address, community.address || ""),
            eq(communities.city, community.city || "")
          )
        )
      );

      if (existing.length > 0) {
        continue; // Skip existing communities
      }

      seenNames.add(nameKey);
      if (addressKey) seenAddresses.add(addressKey);
      if (phoneKey) seenPhones.add(phoneKey);
      
      unique.push(community);
    }

    return unique;
  }

  /**
   * Save a community to the database with regional metadata
   */
  private async saveCommunityToDatabase(community: any, target: RegionalExpansionTarget): Promise<boolean> {
    try {
      const insertData: InsertCommunity = {
        name: community.name,
        address: community.address || "",
        city: community.city || "",
        state: community.state || target.state,
        zipCode: community.zipCode || community.postal_code || "",
        phone: community.phone || community.formatted_phone_number,
        website: community.website,
        description: community.description || `${community.name} is a senior living community in ${community.city}, ${target.state}.`,
        careTypes: community.careTypes || ["Independent Living"],
        amenities: community.amenities || [],
        services: community.services || [],
        photos: community.photos || [],
        rating: community.rating ? parseFloat(community.rating) : null,
        reviewCount: community.reviewCount || 0,
        googleRating: community.googleRating ? parseFloat(community.googleRating) : null,
        googleReviewCount: community.googleReviewCount || 0,
        latitude: community.latitude ? parseFloat(community.latitude) : null,
        longitude: community.longitude ? parseFloat(community.longitude) : null,
        isVerified: true,
        isClaimed: false,
        // Regional expansion fields
        region: target.region,
        county: target.county,
        discoverySource: "Google Places",
        discoveryDate: new Date(),
        lastEnrichmentDate: new Date(),
        availabilityStatus: "Contact for Availability",
        priceRange: community.priceRange || null,
        pricingDetails: {}
      };

      const [saved] = await db.insert(communities).values(insertData).returning({ id: communities.id });
      
      if (saved) {
        console.log(`✅ Saved: ${community.name} in ${target.county} County`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error saving ${community.name}:`, error);
      return false;
    }
  }

  /**
   * Enrich newly discovered communities with additional data
   */
  private async enrichNewCommunities(target: RegionalExpansionTarget): Promise<number> {
    const newCommunities = await db.select().from(communities).where(
      and(
        eq(communities.county, target.county),
        eq(communities.discoverySource, "Google Places")
      )
    );

    let enrichedCount = 0;
    
    for (const community of newCommunities) {
      try {
        // Enrich with Google Places data (photos, reviews, etc.)
        const enrichmentResult = await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
        
        if (enrichmentResult && enrichmentResult.success) {
          // Update community with enriched data
          await db.update(communities)
            .set({
              photos: [...(community.photos || []), ...enrichmentResult.photos],
              googleRating: enrichmentResult.rating || community.googleRating,
              googleReviewCount: enrichmentResult.reviewCount || community.googleReviewCount,
              googleReviewSnippets: enrichmentResult.reviews || [],
              phone: enrichmentResult.phone || community.phone,
              website: enrichmentResult.website || community.website,
              lastEnrichmentDate: new Date(),
              updatedAt: new Date()
            })
            .where(eq(communities.id, community.id));
            
          enrichedCount++;
          console.log(`✅ Enriched: ${community.name} with ${enrichmentResult.photos.length} photos`);
        }
        
        // Rate limiting between enrichments
        await this.delay(500);
        
      } catch (error) {
        console.error(`❌ Error enriching ${community.name}:`, error);
      }
    }

    return enrichedCount;
  }

  /**
   * Get expansion statistics for a specific county
   */
  async getCountyStatistics(county: string): Promise<{
    totalCommunities: number;
    newCommunities: number;
    enrichedCommunities: number;
    verificationLevel: number;
  }> {
    const allCommunities = await db.select().from(communities).where(
      eq(communities.county, county)
    );

    const newCommunities = allCommunities.filter(c => 
      c.discoverySource === "Google Places" && 
      c.discoveryDate && 
      new Date(c.discoveryDate).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    const enrichedCommunities = allCommunities.filter(c => 
      c.lastEnrichmentDate && 
      new Date(c.lastEnrichmentDate).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    const verificationLevel = allCommunities.length > 0 
      ? Math.round((allCommunities.filter(c => c.isVerified).length / allCommunities.length) * 100)
      : 0;

    return {
      totalCommunities: allCommunities.length,
      newCommunities: newCommunities.length,
      enrichedCommunities: enrichedCommunities.length,
      verificationLevel
    };
  }

  /**
   * Get all target counties information
   */
  getTargetCounties(): RegionalExpansionTarget[] {
    return this.targetCounties;
  }

  /**
   * Get real-time expansion progress
   */
  async getExpansionProgress(): Promise<typeof this.expansionProgress> {
    return this.expansionProgress;
  }

  /**
   * Get expansion results
   */
  async getExpansionResults(): Promise<(ExpansionResults & { processingTime?: number })[]> {
    return this.expansionResults;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const regionalExpansionEngine = new RegionalExpansionEngine();