import { Router } from "express";
import { db } from "../db";
import { communities } from "../../shared/schema";
import { sql, eq, and, ilike, desc, asc } from "drizzle-orm";

const router = Router();

// Get location statistics
router.get("/api/locations/stats", async (req, res) => {
  try {
    const { state, city } = req.query;
    
    let conditions = [];
    if (state) {
      conditions.push(eq(communities.state, state as string));
    }
    if (city) {
      conditions.push(eq(communities.city, city as string));
    }
    
    // Get community count and pricing stats
    const stats = await db
      .select({
        totalCommunities: sql<number>`COUNT(*)`,
        hudCount: sql<number>`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
        minPrice: sql<number>`MIN(CASE 
          WHEN ${communities.rentPerMonth} IS NOT NULL THEN CAST(${communities.rentPerMonth} AS DECIMAL)
          WHEN ${communities.priceRange} IS NOT NULL THEN (${communities.priceRange}->>'min')::DECIMAL
          ELSE NULL END)`,
        maxPrice: sql<number>`MAX(CASE 
          WHEN ${communities.rentPerMonth} IS NOT NULL THEN CAST(${communities.rentPerMonth} AS DECIMAL)
          WHEN ${communities.priceRange} IS NOT NULL THEN (${communities.priceRange}->>'max')::DECIMAL
          ELSE NULL END)`,
        avgPrice: sql<number>`AVG(CASE 
          WHEN ${communities.rentPerMonth} IS NOT NULL THEN CAST(${communities.rentPerMonth} AS DECIMAL)
          WHEN ${communities.priceRange} IS NOT NULL THEN ((${communities.priceRange}->>'min')::DECIMAL + (${communities.priceRange}->>'max')::DECIMAL) / 2
          ELSE NULL END)`,
        avgRating: sql<number>`AVG(${communities.rating})`,
      })
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    // Get care types
    const careTypesResult = await db
      .selectDistinct({ careTypes: communities.careTypes })
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const allCareTypes = new Set<string>();
    careTypesResult.forEach(row => {
      if (row.careTypes && Array.isArray(row.careTypes)) {
        row.careTypes.forEach(type => allCareTypes.add(type));
      }
    });
    
    // Get popular cities (for state pages)
    let popularCities = [];
    if (state && !city) {
      popularCities = await db
        .select({
          name: communities.city,
          count: sql<number>`COUNT(*)`,
        })
        .from(communities)
        .where(eq(communities.state, state as string))
        .groupBy(communities.city)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);
    }
    
    // Get nearby cities (for city pages)
    let nearbyCities = [];
    if (city && state) {
      // Get cities in the same state, excluding current city
      nearbyCities = await db
        .select({
          name: communities.city,
          count: sql<number>`COUNT(*)`,
        })
        .from(communities)
        .where(and(
          eq(communities.state, state as string),
          sql`${communities.city} != ${city}`
        ))
        .groupBy(communities.city)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(5);
      
      // Add mock distance for now (in production, would calculate real distance)
      nearbyCities = nearbyCities.map((city, index) => ({
        ...city,
        distance: Math.round(10 + index * 15), // Mock distances
      }));
    }
    
    res.json({
      ...stats[0],
      careTypes: Array.from(allCareTypes),
      popularCities,
      nearbyCities,
      hudMinPrice: stats[0].hudCount > 0 ? 300 : null, // HUD typically starts around $300
    });
  } catch (error) {
    console.error("Error fetching location stats:", error);
    res.status(500).json({ error: "Failed to fetch location statistics" });
  }
});

// Search communities by location
router.get("/api/communities/search", async (req, res) => {
  try {
    const { state, city, limit = "20", offset = "0" } = req.query;
    
    let conditions = [];
    if (state) {
      conditions.push(eq(communities.state, state as string));
    }
    if (city) {
      conditions.push(eq(communities.city, city as string));
    }
    
    const results = await db
      .select()
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        desc(communities.rating),
        asc(communities.name)
      )
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    const total = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communities)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    res.json({
      results,
      total: total[0].count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Error searching communities:", error);
    res.status(500).json({ error: "Failed to search communities" });
  }
});

// Get all states for sitemap
router.get("/api/locations/states", async (req, res) => {
  try {
    const states = await db
      .selectDistinct({ 
        state: communities.state,
        count: sql<number>`COUNT(*)`,
      })
      .from(communities)
      .where(sql`${communities.state} IS NOT NULL`)
      .groupBy(communities.state)
      .orderBy(communities.state);
    
    res.json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ error: "Failed to fetch states" });
  }
});

// Get all cities for sitemap
router.get("/api/locations/cities", async (req, res) => {
  try {
    const { limit = "5000" } = req.query;
    
    const cities = await db
      .select({ 
        city: communities.city,
        state: communities.state,
        count: sql<number>`COUNT(*)`,
      })
      .from(communities)
      .where(sql`${communities.city} IS NOT NULL AND ${communities.state} IS NOT NULL`)
      .groupBy(communities.city, communities.state)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(parseInt(limit as string));
    
    res.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

export default router;