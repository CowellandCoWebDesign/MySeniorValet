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
  private readonly targetCounties: RegionalExpansionTarget[] = [
    // Adjacent to Shasta County - Next logical expansion
    {
      county: "Tehama",
      region: "Northern California",
      primaryCities: ["Red Bluff", "Corning", "Tehama", "Los Molinos"],
      state: "CA", 
      searchRadius: 25,
      centerCoordinates: { lat: 40.1785, lng: -122.2357 },
      priority: 10,
      marketSize: "Rural"
    },
    {
      county: "Butte",
      region: "Northern California", 
      primaryCities: ["Chico", "Oroville", "Paradise", "Gridley"],
      state: "CA",
      searchRadius: 30,
      centerCoordinates: { lat: 39.6285, lng: -121.6077 },
      priority: 9,
      marketSize: "Suburban"
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
   */
  async executeRegionalExpansion(): Promise<ExpansionResults[]> {
    const results: ExpansionResults[] = [];
    
    console.log("🌍 Starting Regional Expansion for 7 Target Counties...");
    
    // Process counties in priority order
    const sortedCounties = this.targetCounties.sort((a, b) => b.priority - a.priority);
    
    for (const county of sortedCounties) {
      console.log(`🔍 Processing ${county.county} County (${county.region})...`);
      
      try {
        const result = await this.expandToCounty(county);
        results.push(result);
        
        // Rate limiting between counties
        await this.delay(2000);
        
      } catch (error) {
        console.error(`❌ Error processing ${county.county}:`, error);
        results.push({
          county: county.county,
          region: county.region,
          totalFound: 0,
          newCommunities: 0,
          duplicatesFiltered: 0,
          enrichedCommunities: 0,
          verificationLevel: "Low",
          discoveryMethods: [],
          errors: [error.message]
        });
      }
    }
    
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const regionalExpansionEngine = new RegionalExpansionEngine();