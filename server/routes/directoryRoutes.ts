import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql, desc, isNotNull } from "drizzle-orm";

export function registerDirectoryRoutes(app: Express) {
  
  // Get communities by state
  app.get("/api/directories/by-state/:state", async (req, res) => {
    try {
      const { state } = req.params;
      
      if (!state) {
        return res.status(400).json({ error: "State parameter is required" });
      }
      
      const communities_result = await db
        .select()
        .from(communities)
        .where(eq(communities.state, state))
        .orderBy(desc(communities.rating))
        .limit(100);
      
      res.json({
        state,
        count: communities_result.length,
        communities: communities_result,
        _version: 'v4_directory'
      });
    } catch (error) {
      console.error("Error fetching communities by state:", error);
      res.status(500).json({ error: "Failed to fetch communities by state" });
    }
  });
  
  // Get communities by city
  app.get("/api/directories/by-city/:city", async (req, res) => {
    try {
      const { city } = req.params;
      
      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }
      
      const communities_result = await db
        .select()
        .from(communities)
        .where(eq(communities.city, city))
        .orderBy(desc(communities.rating))
        .limit(100);
      
      res.json({
        city,
        count: communities_result.length,
        communities: communities_result,
        _version: 'v4_directory'
      });
    } catch (error) {
      console.error("Error fetching communities by city:", error);
      res.status(500).json({ error: "Failed to fetch communities by city" });
    }
  });
  
  // Directory autocomplete
  app.get("/api/directories/autocomplete", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || (query as string).length < 2) {
        return res.json({ suggestions: [], _version: 'v4_directory' });
      }
      
      const searchTerm = (query as string).toLowerCase();
      
      // Search for matching cities and states
      const cities = await db
        .select({
          city: communities.city,
          state: communities.state,
          count: sql<number>`count(*)::int`
        })
        .from(communities)
        .where(sql`LOWER(${communities.city}) LIKE ${`${searchTerm || ''}%`}`)
        .groupBy(communities.city, communities.state)
        .orderBy(desc(sql`count(*)`))
        .limit(10);
      
      const states = await db
        .select({
          state: communities.state,
          count: sql<number>`count(*)::int`
        })
        .from(communities)
        .where(sql`LOWER(${communities.state}) LIKE ${`${searchTerm || ''}%`}`)
        .groupBy(communities.state)
        .orderBy(desc(sql`count(*)`))
        .limit(5);
      
      const suggestions = [
        ...cities.map(c => ({
          type: 'city',
          value: c.city,
          state: c.state,
          count: c.count,
          label: `${c.city}, ${c.state} (${c.count} communities)`
        })),
        ...states.map(s => ({
          type: 'state',
          value: s.state,
          count: s.count,
          label: `${s.state} (${s.count} communities)`
        }))
      ];
      
      res.json({
        suggestions,
        _version: 'v4_directory'
      });
    } catch (error) {
      console.error("Error in directory autocomplete:", error);
      res.status(500).json({ error: "Failed to fetch autocomplete suggestions" });
    }
  });
  
  // HUD communities directory
  app.get("/api/directories/hud-communities", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const hudCommunities = await db
        .select()
        .from(communities)
        .where(isNotNull(communities.hudPropertyId))
        .orderBy(desc(communities.rating))
        .limit(Number(limit))
        .offset(Number(offset));
      
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(communities)
        .where(isNotNull(communities.hudPropertyId));
      
      res.json({
        communities: hudCommunities,
        total: countResult?.count || 0,
        limit: Number(limit),
        offset: Number(offset),
        _version: 'v4_directory'
      });
    } catch (error) {
      console.error("Error fetching HUD communities:", error);
      res.status(500).json({ error: "Failed to fetch HUD communities" });
    }
  });
  
  // Canadian communities directory
  app.get("/api/directories/canadian-communities", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      // Canadian provinces
      const canadianProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
      
      const canadianCommunities = await db
        .select()
        .from(communities)
        .where(sql`${communities.state} = ANY(${canadianProvinces})`)
        .orderBy(desc(communities.rating))
        .limit(Number(limit))
        .offset(Number(offset));
      
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(communities)
        .where(sql`${communities.state} = ANY(${canadianProvinces})`);
      
      res.json({
        communities: canadianCommunities,
        total: countResult?.count || 0,
        limit: Number(limit),
        offset: Number(offset),
        _version: 'v4_directory'
      });
    } catch (error) {
      console.error("Error fetching Canadian communities:", error);
      res.status(500).json({ error: "Failed to fetch Canadian communities" });
    }
  });
  
  // Mexican communities directory
  app.get("/api/directories/mexican-communities", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      // Mexican states/regions
      const mexicanStates = ['MX', 'Mexico', 'MEXICO'];
      const mexicanCities = ['Tijuana', 'Guadalajara', 'Puerto Vallarta', 'Cancun', 'Playa del Carmen', 'Mexico City'];
      
      const mexicanCommunities = await db
        .select()
        .from(communities)
        .where(sql`
          ${communities.state} = ANY(${mexicanStates}) OR
          ${communities.city} = ANY(${mexicanCities}) OR
          LOWER(${communities.name}) LIKE '%mexico%' OR
          LOWER(${communities.name}) LIKE '%tijuana%' OR
          LOWER(${communities.name}) LIKE '%guadalajara%' OR
          LOWER(${communities.name}) LIKE '%puerto vallarta%' OR
          LOWER(${communities.name}) LIKE '%cancun%'
        `)
        .orderBy(desc(communities.rating))
        .limit(Number(limit))
        .offset(Number(offset));
      
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(communities)
        .where(sql`
          ${communities.state} = ANY(${mexicanStates}) OR
          ${communities.city} = ANY(${mexicanCities}) OR
          LOWER(${communities.name}) LIKE '%mexico%' OR
          LOWER(${communities.name}) LIKE '%tijuana%' OR
          LOWER(${communities.name}) LIKE '%guadalajara%' OR
          LOWER(${communities.name}) LIKE '%puerto vallarta%' OR
          LOWER(${communities.name}) LIKE '%cancun%'
        `);
      
      res.json({
        communities: mexicanCommunities,
        total: countResult?.count || 0,
        limit: Number(limit),
        offset: Number(offset),
        _version: 'v4_directory'
      });
    } catch (error) {
      console.error("Error fetching Mexican communities:", error);
      res.status(500).json({ error: "Failed to fetch Mexican communities" });
    }
  });
}