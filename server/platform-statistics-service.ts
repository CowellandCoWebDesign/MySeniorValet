import { db } from "./db";
import { communities, hospitals, services, marketplaceVendors } from "@shared/schema";
import { sql, isNotNull, eq, and, or } from "drizzle-orm";

export interface PlatformStatistics {
  totalCommunities: number;
  communitiesWithPricing: number;
  hudCommunities: number;
  mexicoCommunities: number;
  canadaCommunities: number;
  usCommunities: number;
  totalHospitals: number;
  totalCareServices: number;
  totalVendors: number;
  pricingCoveragePercentage: number;
  lastUpdated: string;
  version: string;
}

class PlatformStatisticsService {
  private cache: PlatformStatistics | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  
  async getStatistics(forceRefresh: boolean = false): Promise<PlatformStatistics> {
    const now = Date.now();
    
    if (!forceRefresh && this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    console.log("Refreshing platform statistics cache...");

    try {
      // Get total communities count
      const [{ totalCommunities }] = await db
        .select({ totalCommunities: sql<number>`COUNT(*)::int` })
        .from(communities);

      // Get communities by country
      const [{ usCommunities }] = await db
        .select({ usCommunities: sql<number>`COUNT(*)::int` })
        .from(communities)
        .where(sql`COALESCE(${communities.country}, 'US') = 'US'`);

      const [{ mexicoCommunities }] = await db
        .select({ mexicoCommunities: sql<number>`COUNT(*)::int` })
        .from(communities)
        .where(eq(communities.country, 'MX'));

      const [{ canadaCommunities }] = await db
        .select({ canadaCommunities: sql<number>`COUNT(*)::int` })
        .from(communities)
        .where(eq(communities.country, 'CA'));

      // Get communities with pricing (simplified for compatibility)
      const allCommunities = await db.select().from(communities);
      const communitiesWithPricing = allCommunities.filter(c => 
        c.rentPerMonth || c.priceRange || c.monthlyRentStart || c.monthlyRentEnd
      ).length;

      // Get HUD communities
      const [{ hudCommunities }] = await db
        .select({ hudCommunities: sql<number>`COUNT(*)::int` })
        .from(communities)
        .where(isNotNull(communities.hudPropertyId));

      // Get hospital count
      const [{ totalHospitals }] = await db
        .select({ totalHospitals: sql<number>`COUNT(*)::int` })
        .from(hospitals);

      // Get care services count
      const [{ totalCareServices }] = await db
        .select({ totalCareServices: sql<number>`COUNT(*)::int` })
        .from(services);

      // Get vendor count
      const [{ totalVendors }] = await db
        .select({ totalVendors: sql<number>`COUNT(*)::int` })
        .from(marketplaceVendors);

      const pricingCoveragePercentage = Math.round((communitiesWithPricing / totalCommunities) * 100);

      this.cache = {
        totalCommunities,
        communitiesWithPricing,
        hudCommunities,
        mexicoCommunities,
        canadaCommunities,
        usCommunities,
        totalHospitals,
        totalCareServices,
        totalVendors,
        pricingCoveragePercentage,
        lastUpdated: new Date().toISOString(),
        version: "v4_centralized_statistics_complete"
      };

      this.cacheExpiry = now + this.CACHE_DURATION;
      
      console.log(`Platform statistics updated: ${totalCommunities} total communities (US: ${usCommunities}, MX: ${mexicoCommunities}, CA: ${canadaCommunities})`);
      
      return this.cache;
    } catch (error) {
      console.error("Error refreshing platform statistics:", error);
      
      // Return cached data if available, otherwise return fallback
      if (this.cache) {
        return this.cache;
      }

      throw error;
    }
  }

  async getTotalCommunityCount(): Promise<number> {
    const stats = await this.getStatistics();
    return stats.totalCommunities;
  }

  async getFormattedCount(): Promise<string> {
    const count = await this.getTotalCommunityCount();
    return count.toLocaleString();
  }

  // Force cache refresh when new data is added
  invalidateCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
    console.log("Platform statistics cache invalidated");
  }
}

export const platformStatisticsService = new PlatformStatisticsService();