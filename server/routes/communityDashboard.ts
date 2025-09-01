import { Router } from "express";
import { db } from "../db";
import { communities, claimedCommunities, leads, tours, users, communityDashboardStats } from "@shared/schema";
import { eq, and, desc, gte, sql, count, between } from "drizzle-orm";
import { isAuthenticated } from "../auth-middleware";

const router = Router();

// Get community profile for logged-in community owner
router.get("/api/community/profile", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get claimed community for this user
    const claimedCommunity = await db
      .select({
        claimed: claimedCommunities,
        community: communities
      })
      .from(claimedCommunities)
      .innerJoin(communities, eq(communities.id, claimedCommunities.communityId))
      .where(eq(claimedCommunities.ownerId, userId))
      .limit(1);

    if (!claimedCommunity || claimedCommunity.length === 0) {
      return res.status(404).json({ error: "No community found for this account" });
    }

    const result = {
      ...claimedCommunity[0].community,
      ...claimedCommunity[0].claimed,
      communityId: claimedCommunity[0].community.id,
      subscriptionTier: mapSubscriptionPlanToTier(claimedCommunity[0].claimed.subscriptionPlan)
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching community profile:", error);
    res.status(500).json({ error: "Failed to fetch community profile" });
  }
});

// Get dashboard metrics for community
router.get("/api/community/metrics", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get claimed community for this user
    const claimedCommunity = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.ownerId, userId))
      .limit(1);

    if (!claimedCommunity || claimedCommunity.length === 0) {
      return res.status(404).json({ error: "No community found" });
    }

    const communityId = claimedCommunity[0].communityId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get leads metrics
    const [totalLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.communityId, communityId));

    const [activeLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(
        and(
          eq(leads.communityId, communityId),
          sql`${leads.status} IN ('New', 'Contacted', 'Qualified', 'Tour Scheduled')`
        )
      );

    const [newLeadsThisWeek] = await db
      .select({ count: count() })
      .from(leads)
      .where(
        and(
          eq(leads.communityId, communityId),
          gte(leads.createdAt, sevenDaysAgo)
        )
      );

    // Get tours metrics
    const [totalTours] = await db
      .select({ count: count() })
      .from(tours)
      .where(eq(tours.communityId, communityId));

    const [toursThisWeek] = await db
      .select({ count: count() })
      .from(tours)
      .where(
        and(
          eq(tours.communityId, communityId),
          gte(tours.createdAt, sevenDaysAgo)
        )
      );

    // Get conversion metrics (simplified for now)
    const [convertedLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(
        and(
          eq(leads.communityId, communityId),
          eq(leads.status, "Converted")
        )
      );

    const conversionRate = totalLeads.count > 0 
      ? Math.round((convertedLeads.count / totalLeads.count) * 100)
      : 0;

    // Get community profile views from dashboard stats
    const today = new Date();
    const [todayStats] = await db
      .select({
        profileViews: communityDashboardStats.profileViews,
        monthlyViews: sql<number>`SUM(${communityDashboardStats.profileViews})`
      })
      .from(communityDashboardStats)
      .where(
        and(
          eq(communityDashboardStats.communityId, communityId),
          gte(communityDashboardStats.date, sql`DATE_TRUNC('month', CURRENT_DATE)`)
        )
      )
      .groupBy(communityDashboardStats.communityId);

    const metrics = {
      profileViews: todayStats?.profileViews || 0,
      monthlyViews: todayStats?.monthlyViews || 0,
      activeLeads: activeLeads.count || 0,
      newLeadsThisWeek: newLeadsThisWeek.count || 0,
      toursScheduled: totalTours.count || 0,
      toursThisWeek: toursThisWeek.count || 0,
      conversionRate: conversionRate,
      avgResponseTime: "< 1hr", // Placeholder - would calculate from lead response times
      clickThroughRate: 12, // Placeholder - would calculate from analytics
      savedCount: Math.floor(Math.random() * 50) + 10, // Placeholder - would track saved communities
      avgTimeOnPage: "2:35" // Placeholder - would track from analytics
    };

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching community metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// Get leads for community
router.get("/api/community/leads", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get claimed community for this user
    const claimedCommunity = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.ownerId, userId))
      .limit(1);

    if (!claimedCommunity || claimedCommunity.length === 0) {
      return res.status(404).json({ error: "No community found" });
    }

    const communityId = claimedCommunity[0].communityId;

    // Get leads for this community
    const communityLeads = await db
      .select({
        id: leads.id,
        name: sql`COALESCE(${leads.contactDetails}->>'name', 'Anonymous')`,
        email: sql`${leads.contactDetails}->>'email'`,
        phone: sql`${leads.contactDetails}->>'phone'`,
        message: sql`COALESCE(${leads.contactDetails}->>'notes', 'Interested in learning more about your community')`,
        status: leads.status,
        priority: leads.priority,
        source: leads.source,
        createdAt: leads.createdAt
      })
      .from(leads)
      .where(eq(leads.communityId, communityId))
      .orderBy(desc(leads.createdAt))
      .limit(20);

    res.json(communityLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// Get tours for community
router.get("/api/community/tours", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get claimed community for this user
    const claimedCommunity = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.ownerId, userId))
      .limit(1);

    if (!claimedCommunity || claimedCommunity.length === 0) {
      return res.status(404).json({ error: "No community found" });
    }

    const communityId = claimedCommunity[0].communityId;

    // Get upcoming tours for this community
    const communityTours = await db
      .select({
        id: tours.id,
        visitorName: tours.contactName,
        date: tours.preferredDate,
        time: tours.preferredTime,
        phone: tours.contactPhone,
        email: tours.contactEmail,
        tourType: tours.tourType,
        status: tours.status,
        notes: tours.specialRequests
      })
      .from(tours)
      .where(
        and(
          eq(tours.communityId, communityId),
          gte(tours.preferredDate, sql`CURRENT_DATE`)
        )
      )
      .orderBy(tours.preferredDate, tours.preferredTime)
      .limit(20);

    res.json(communityTours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// Update community profile
router.put("/api/community/profile", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get claimed community for this user
    const claimedCommunity = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.ownerId, userId))
      .limit(1);

    if (!claimedCommunity || claimedCommunity.length === 0) {
      return res.status(404).json({ error: "No community found" });
    }

    const communityId = claimedCommunity[0].communityId;
    const updates = req.body;

    // Update community information
    await db
      .update(communities)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Helper function to map subscription plans to tier names
function mapSubscriptionPlanToTier(plan: string | null): string {
  switch(plan) {
    case 'Basic':
      return 'verified';
    case 'Professional':
      return 'standard';
    case 'Enterprise':
      return 'featured';
    case 'Premium':
      return 'platinum';
    default:
      return 'free';
  }
}

export default router;