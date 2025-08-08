import { Router } from "express";
import { db } from "../db";
import { 
  communities, 
  users, 
  tours, 
  searchHistory,
  services,
  vendorLeads,
  reviews,
  auditLogs,
  messages
} from "@shared/schema";
import { eq, sql, desc, gte, between, and, count, sum } from "drizzle-orm";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const analyticsRouter = Router();

// Helper function to get date range
function getDateRange(range: string) {
  const now = new Date();
  let start: Date;
  
  switch (range) {
    case "24h":
      start = subDays(now, 1);
      break;
    case "7d":
      start = subDays(now, 7);
      break;
    case "30d":
      start = subDays(now, 30);
      break;
    case "90d":
      start = subDays(now, 90);
      break;
    case "1y":
      start = subDays(now, 365);
      break;
    default:
      start = subDays(now, 7);
  }
  
  return { start, end: now };
}

// Get comprehensive analytics data
analyticsRouter.get("/comprehensive", async (req, res) => {
  try {
    const range = req.query.range as string || "7d";
    const { start, end } = getDateRange(range);

    // Community Analytics
    const [communityStats] = await db
      .select({
        total: count(),
        avgRating: sql<number>`AVG(CAST(${communities.rating} AS FLOAT))`,
      })
      .from(communities)
      .execute();

    const communityByState = await db
      .select({
        state: communities.state,
        count: count(),
      })
      .from(communities)
      .groupBy(communities.state)
      .orderBy(desc(count()))
      .execute();

    const communityByCareType = await db
      .select({
        careType: communities.careType,
        count: count(),
      })
      .from(communities)
      .groupBy(communities.careType)
      .execute();

    // Price range analysis
    const priceRanges = await db
      .select({
        range: sql<string>`
          CASE 
            WHEN CAST(REPLACE(REPLACE(${communities.pricing}, '$', ''), ',', '') AS INTEGER) < 2000 THEN 'Under $2,000'
            WHEN CAST(REPLACE(REPLACE(${communities.pricing}, '$', ''), ',', '') AS INTEGER) < 4000 THEN '$2,000-$4,000'
            WHEN CAST(REPLACE(REPLACE(${communities.pricing}, '$', ''), ',', '') AS INTEGER) < 6000 THEN '$4,000-$6,000'
            ELSE 'Over $6,000'
          END
        `,
        count: count(),
      })
      .from(communities)
      .where(sql`${communities.pricing} IS NOT NULL AND ${communities.pricing} != ''`)
      .groupBy(sql`range`)
      .execute();

    // User Analytics
    const [userStats] = await db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${users.lastActiveAt} > ${start} THEN 1 END`),
        new: count(sql`CASE WHEN ${users.createdAt} > ${start} THEN 1 END`),
      })
      .from(users)
      .execute();

    // User engagement funnel
    const engagementData = await db
      .select({
        searches: count(searchHistory.id),
      })
      .from(searchHistory)
      .where(gte(searchHistory.searchedAt, start))
      .execute();

    const [tourStats] = await db
      .select({
        tours: count(),
      })
      .from(tours)
      .where(gte(tours.createdAt, start))
      .execute();

    // Peak usage hours (mock data for now - would need proper tracking)
    const peakHours: Record<string, number> = {};
    for (let i = 0; i < 24; i++) {
      peakHours[i.toString().padStart(2, '0')] = Math.floor(Math.random() * 100) + 20;
    }

    // Financial Analytics with real subscription data
    // Count communities by subscription tier
    const [verifiedListings] = await db
      .select({ count: count() })
      .from(communities)
      .where(eq(communities.subscriptionTier, 'verified'))
      .execute();
    
    const [standardListings] = await db
      .select({ count: count() })
      .from(communities)
      .where(eq(communities.subscriptionTier, 'standard'))
      .execute();
    
    const [featuredListings] = await db
      .select({ count: count() })
      .from(communities)
      .where(eq(communities.subscriptionTier, 'featured'))
      .execute();
    
    const [platinumListings] = await db
      .select({ count: count() })
      .from(communities)
      .where(eq(communities.subscriptionTier, 'platinum'))
      .execute();
    
    // Calculate revenue based on subscription tiers
    const verifiedRevenue = (verifiedListings?.count || 0) * 0; // Free tier
    const standardRevenue = (standardListings?.count || 0) * 149;
    const featuredRevenue = (featuredListings?.count || 0) * 249;
    const platinumRevenue = (platinumListings?.count || 0) * 349;
    
    // Count active vendors and calculate vendor revenue
    const [activeVendors] = await db
      .select({ count: count() })
      .from(vendors)
      .where(eq(vendors.status, 'active'))
      .execute();
    
    const vendorRevenue = (activeVendors?.count || 0) * 99; // Basic vendor tier average
    
    const totalRevenue = standardRevenue + featuredRevenue + platinumRevenue + vendorRevenue;
    
    const financialData = {
      revenue: {
        total: totalRevenue,
        byService: {
          "Standard Listings": standardRevenue,
          "Featured Listings": featuredRevenue,
          "Platinum Listings": platinumRevenue,
          "Vendor Services": vendorRevenue,
        },
        trend: Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 30 - i), "yyyy-MM-dd"),
          amount: Math.floor(totalRevenue / 30) + Math.floor(Math.random() * 1000),
        })),
      },
      commissions: {
        total: Math.floor(totalRevenue * 0.12), // 12% commission rate
        pending: Math.floor(totalRevenue * 0.03), // 3% pending
        paid: Math.floor(totalRevenue * 0.09), // 9% paid
      },
      subscriptions: {
        verified: verifiedListings?.count || 0,
        standard: standardListings?.count || 0,
        featured: featuredListings?.count || 0,
        platinum: platinumListings?.count || 0,
        vendors: activeVendors?.count || 0,
      },
    };

    // AI Usage Analytics (mock data - would need proper tracking)
    const aiUsage = {
      usage: {
        claude: Math.floor(Math.random() * 5000) + 1000,
        openai: Math.floor(Math.random() * 3000) + 500,
        perplexity: Math.floor(Math.random() * 2000) + 200,
      },
      costs: {
        claude: Math.random() * 100 + 50,
        openai: Math.random() * 80 + 30,
        perplexity: Math.random() * 50 + 10,
      },
      performance: {
        avgResponseTime: Math.floor(Math.random() * 200) + 100,
        successRate: 95 + Math.random() * 4,
      },
    };

    // Community growth trend
    const growthTrend = await db
      .select({
        date: sql<string>`DATE(${communities.createdAt})`,
        count: count(),
      })
      .from(communities)
      .where(gte(communities.createdAt, start))
      .groupBy(sql`DATE(${communities.createdAt})`)
      .orderBy(sql`DATE(${communities.createdAt})`)
      .execute();

    // Format response
    const analytics = {
      communities: {
        total: communityStats.total,
        byState: communityByState.reduce((acc, item) => {
          acc[item.state || "Unknown"] = item.count;
          return acc;
        }, {} as Record<string, number>),
        byCareType: communityByCareType.reduce((acc, item) => {
          acc[item.careType || "Unknown"] = item.count;
          return acc;
        }, {} as Record<string, number>),
        byPriceRange: priceRanges.reduce((acc, item) => {
          acc[item.range] = item.count;
          return acc;
        }, {} as Record<string, number>),
        growth: growthTrend.map(item => ({
          date: item.date,
          count: item.count,
        })),
        avgRating: communityStats.avgRating || 0,
        avgOccupancy: 85 + Math.random() * 10, // Mock data
      },
      users: {
        total: userStats.total,
        active: userStats.active,
        new: userStats.new,
        engagement: {
          searches: engagementData[0]?.searches || 0,
          views: Math.floor(Math.random() * 10000) + 5000, // Mock data
          saves: Math.floor(Math.random() * 1000) + 200, // Mock data
          tours: tourStats.tours,
        },
        behavior: {
          avgSessionDuration: Math.floor(Math.random() * 600) + 300, // seconds
          bounceRate: 20 + Math.random() * 15,
          conversionRate: 2 + Math.random() * 3,
        },
        peakHours,
      },
      financial: financialData,
      ai: aiUsage,
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get platform overview stats
analyticsRouter.get("/platform-overview", async (req, res) => {
  try {
    const [stats] = await db
      .select({
        totalCommunities: count(communities.id),
        totalUsers: count(users.id),
        totalTours: count(tours.id),
        totalReviews: count(reviews.id),
      })
      .from(communities)
      .leftJoin(users, sql`true`)
      .leftJoin(tours, sql`true`)
      .leftJoin(reviews, sql`true`)
      .execute();

    res.json(stats);
  } catch (error) {
    console.error("Error fetching platform overview:", error);
    res.status(500).json({ error: "Failed to fetch platform overview" });
  }
});

// Get real-time activity feed
analyticsRouter.get("/activity-feed", async (req, res) => {
  try {
    const recentActivity = await db
      .select({
        type: sql<string>`'tour'`,
        description: sql<string>`'Tour scheduled at ' || ${communities.name}`,
        timestamp: tours.createdAt,
        userId: tours.userId,
      })
      .from(tours)
      .innerJoin(communities, eq(tours.communityId, communities.id))
      .orderBy(desc(tours.createdAt))
      .limit(10)
      .execute();

    res.json(recentActivity);
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
});

// Get predictive analytics
analyticsRouter.get("/predictions", async (req, res) => {
  try {
    // Mock predictive data - in production, this would use ML models
    const predictions = {
      demandForecast: {
        nextWeek: Math.floor(Math.random() * 200) + 800,
        nextMonth: Math.floor(Math.random() * 1000) + 3000,
        trend: "increasing",
        confidence: 0.85,
      },
      priceTrends: {
        avgIncrease: 3.2,
        hotMarkets: ["California", "Florida", "Texas"],
        coolMarkets: ["Wyoming", "Montana"],
      },
      userGrowth: {
        projection: Math.floor(Math.random() * 500) + 2000,
        churnRisk: 0.12,
        ltv: 2500,
      },
    };

    res.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

// Get geographic heatmap data
analyticsRouter.get("/geographic-heatmap", async (req, res) => {
  try {
    const heatmapData = await db
      .select({
        lat: communities.latitude,
        lng: communities.longitude,
        intensity: count(),
      })
      .from(communities)
      .where(and(
        sql`${communities.latitude} IS NOT NULL`,
        sql`${communities.longitude} IS NOT NULL`
      ))
      .groupBy(communities.latitude, communities.longitude)
      .execute();

    res.json(heatmapData);
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    res.status(500).json({ error: "Failed to fetch heatmap data" });
  }
});

// Get conversion funnel analytics
analyticsRouter.get("/conversion-funnel", async (req, res) => {
  try {
    const range = req.query.range as string || "7d";
    const { start, end } = getDateRange(range);

    // Mock funnel data - in production, this would track actual user journeys
    const funnel = {
      stages: [
        { name: "Site Visit", count: 10000, percentage: 100 },
        { name: "Search Performed", count: 6500, percentage: 65 },
        { name: "Community Viewed", count: 4200, percentage: 42 },
        { name: "Community Saved", count: 1800, percentage: 18 },
        { name: "Tour Scheduled", count: 450, percentage: 4.5 },
        { name: "Tour Completed", count: 320, percentage: 3.2 },
        { name: "Move-in", count: 85, percentage: 0.85 },
      ],
      dropoffPoints: [
        { from: "Site Visit", to: "Search Performed", rate: 35 },
        { from: "Search Performed", to: "Community Viewed", rate: 35.4 },
        { from: "Community Viewed", to: "Community Saved", rate: 57.1 },
        { from: "Community Saved", to: "Tour Scheduled", rate: 75 },
      ],
    };

    res.json(funnel);
  } catch (error) {
    console.error("Error fetching conversion funnel:", error);
    res.status(500).json({ error: "Failed to fetch conversion funnel" });
  }
});

// Export register function to match pattern in index.ts
export function registerAnalyticsRoutes(app: any) {
  app.use("/api/analytics", analyticsRouter);
}