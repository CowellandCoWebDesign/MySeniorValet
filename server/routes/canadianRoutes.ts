import { Router } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";

const router = Router();

// Get all Canadian communities
router.get("/canadian", async (req, res) => {
  try {
    const canadianCommunities = await db
      .select()
      .from(communities)
      .where(eq(communities.county, 'Canada'))
      .orderBy(communities.state, communities.city);
    
    res.json(canadianCommunities);
  } catch (error) {
    console.error("Error fetching Canadian communities:", error);
    res.status(500).json({ error: "Failed to fetch Canadian communities" });
  }
});

// Get bilingual communities
router.get("/bilingual", async (req, res) => {
  try {
    const bilingualCommunities = await db
      .select()
      .from(communities)
      .where(eq(communities.bilingual, true))
      .orderBy(communities.state, communities.city);
    
    res.json(bilingualCommunities);
  } catch (error) {
    console.error("Error fetching bilingual communities:", error);
    res.status(500).json({ error: "Failed to fetch bilingual communities" });
  }
});

// Get Canadian stats
router.get("/canadian/stats", async (req, res) => {
  try {
    const [stats] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN bilingual = true THEN 1 END) as bilingual_count,
        COUNT(DISTINCT state) as province_count
      FROM communities 
      WHERE county = 'Canada'
    `);
    
    res.json({
      total: parseInt(stats.total as string),
      bilingualCount: parseInt(stats.bilingual_count as string),
      provinceCount: parseInt(stats.province_count as string)
    });
  } catch (error) {
    console.error("Error fetching Canadian stats:", error);
    res.status(500).json({ error: "Failed to fetch Canadian stats" });
  }
});

// Get communities by province
router.get("/canadian/province/:province", async (req, res) => {
  try {
    const { province } = req.params;
    
    const provinceCommunities = await db
      .select()
      .from(communities)
      .where(
        and(
          eq(communities.county, 'Canada'),
          eq(communities.state, province)
        )
      )
      .orderBy(communities.city, communities.name);
    
    res.json(provinceCommunities);
  } catch (error) {
    console.error("Error fetching communities by province:", error);
    res.status(500).json({ error: "Failed to fetch communities by province" });
  }
});

// Get featured Canadian communities
router.get("/canadian/featured", async (req, res) => {
  try {
    const featuredCanadian = await db
      .select()
      .from(communities)
      .where(eq(communities.county, 'Canada'))
      .orderBy(communities.state, communities.city)
      .limit(12);
    
    res.json(featuredCanadian);
  } catch (error) {
    console.error("Error fetching featured Canadian communities:", error);
    res.status(500).json({ error: "Failed to fetch featured Canadian communities" });
  }
});

export default router;