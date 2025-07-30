import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, desc, sql, between, isNotNull } from "drizzle-orm";
import { superclusterService } from "../services/supercluster";

export function registerMappingRoutes(app: Express) {
  
  // FIXED: Comprehensive bounds-based community search for mapping
  app.get("/api/communities/search", async (req, res) => {
    try {
      const { bounds, limit = 1000, careTypes, priceRange, minRating } = req.query;
      
      if (!bounds) {
        return res.status(400).json({ 
          error: "Bounds parameter required for map search",
          format: "bounds=west,south,east,north"
        });
      }
      
      const boundsArray = (bounds as string).split(',').map(Number);
      if (boundsArray.length !== 4) {
        return res.status(400).json({ 
          error: "Invalid bounds format. Use: bounds=west,south,east,north" 
        });
      }
      
      const [west, south, east, north] = boundsArray;
      
      // Build query conditions with proper numeric casting
      let whereConditions = and(
        sql`${communities.longitude}::numeric BETWEEN ${west} AND ${east}`,
        sql`${communities.latitude}::numeric BETWEEN ${south} AND ${north}`,
        isNotNull(communities.latitude),
        isNotNull(communities.longitude)
      );
      
      // Add care type filter
      if (careTypes && careTypes !== 'All Types') {
        const careTypeArray = Array.isArray(careTypes) ? careTypes : [careTypes];
        const careTypeConditions = careTypeArray.map(type => 
          sql`${communities.careTypes}::text ILIKE ${`%${type}%`}`
        );
        whereConditions = and(whereConditions, or(...careTypeConditions));
      }
      
      // Add rating filter
      if (minRating && parseFloat(minRating as string) > 0) {
        whereConditions = and(whereConditions, 
          sql`${communities.rating} >= ${parseFloat(minRating as string)}`
        );
      }
      
      const searchResults = await db
        .select({
          id: communities.id,
          name: communities.name,
          latitude: communities.latitude,
          longitude: communities.longitude,
          address: communities.address,
          city: communities.city,
          state: communities.state,
          zipCode: communities.zipCode,
          careTypes: communities.careTypes,
          rating: communities.rating,
          reviewCount: communities.reviewCount,
          phone: communities.phone,
          website: communities.website,
          priceRange: communities.priceRange,
          // availability: communities.availability, // Field may not exist
          photos: communities.photos,
          description: communities.description,
          hudPropertyId: communities.hudPropertyId,
          rentPerMonth: communities.rentPerMonth
        })
        .from(communities)
        .where(whereConditions)
        .limit(parseInt(limit as string))
        .orderBy(desc(communities.rating));
      
      console.log(`Map search found ${searchResults.length} communities in bounds`);
      
      res.json({
        communities: searchResults,
        total: searchResults.length,
        bounds: { west, south, east, north },
        _version: "mapping_fix_v1",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Map search error:", error);
      res.status(500).json({ 
        error: "Map search failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // FIXED: Supercluster-powered clustering endpoint
  app.get("/api/communities/clusters", async (req, res) => {
    try {
      const { west, south, east, north, zoom = 10, limit = 5000 } = req.query;
      
      if (!west || !south || !east || !north) {
        return res.status(400).json({ 
          error: "Missing bounding box parameters. Required: west, south, east, north" 
        });
      }
      
      const westFloat = parseFloat(west as string);
      const southFloat = parseFloat(south as string);
      const eastFloat = parseFloat(east as string);
      const northFloat = parseFloat(north as string);
      const zoomInt = parseInt(zoom as string);
      
      console.log(`Clustering request: zoom=${zoomInt}, bounds=[${westFloat},${southFloat},${eastFloat},${northFloat}]`);
      
      // Initialize supercluster if needed
      await superclusterService.initialize();
      
      // Get clusters from supercluster
      const clusters = await superclusterService.getClusters([westFloat, southFloat, eastFloat, northFloat], zoomInt);
      
      console.log(`Supercluster returned ${clusters.length} clusters/points for zoom ${zoomInt}`);
      
      res.json({
        clusters,
        zoom: zoomInt,
        bounds: { west: westFloat, south: southFloat, east: eastFloat, north: northFloat },
        _version: "clustering_fix_v1",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Clustering error:", error);
      res.status(500).json({ 
        error: "Clustering failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI-POWERED: Intelligent location search with multi-AI validation
  app.get("/api/communities/search/ai-enhanced", async (req, res) => {
    try {
      const { location, careTypes, budget, limit = 50 } = req.query;
      
      if (!location) {
        return res.status(400).json({ error: "Location parameter required" });
      }
      
      console.log(`AI-enhanced search for: ${location}`);
      
      // Use AI to interpret and enhance the search query
      const { aiMappingOrchestrator } = await import("../ai-mapping-orchestrator");
      
      const aiAnalysis = await aiMappingOrchestrator.analyzeSearchQuery({
        query: location as string,
        context: "senior_living_search",
        careTypes: careTypes as string,
        budget: budget as string
      });
      
      // Build smart search conditions based on AI analysis
      let searchConditions = isNotNull(communities.latitude);
      
      // Add location intelligence 
      if (aiAnalysis.detectedLocations?.length > 0) {
        const locationConditions = aiAnalysis.detectedLocations.map((loc: string) => 
          or(
            sql`LOWER(${communities.city}) LIKE ${`%${loc.toLowerCase()}%`}`,
            sql`LOWER(${communities.state}) LIKE ${`%${loc.toLowerCase()}%`}`,
            sql`LOWER(${communities.address}) LIKE ${`%${loc.toLowerCase()}%`}`
          )
        );
        searchConditions = and(searchConditions, or(...locationConditions));
      }
      
      // Add AI-detected care type preferences
      if (aiAnalysis.suggestedCareTypes?.length > 0) {
        const careConditions = aiAnalysis.suggestedCareTypes.map((type: string) =>
          sql`${communities.careTypes}::text ILIKE ${`%${type}%`}`
        );
        searchConditions = and(searchConditions, or(...careConditions));
      }
      
      const results = await db
        .select()
        .from(communities)
        .where(searchConditions)
        .limit(parseInt(limit as string))
        .orderBy(desc(communities.rating));
      
      res.json({
        communities: results,
        aiAnalysis: {
          interpretedQuery: aiAnalysis.interpretation,
          detectedLocations: aiAnalysis.detectedLocations,
          suggestedCareTypes: aiAnalysis.suggestedCareTypes,
          confidence: aiAnalysis.confidence
        },
        total: results.length,
        _version: "ai_search_v1",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("AI-enhanced search error:", error);
      res.status(500).json({ 
        error: "AI search failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Quick community details endpoint for map popups
  app.get("/api/communities/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      
      const community = await db
        .select()
        .from(communities)
        .where(eq(communities.id, parseInt(id)))
        .limit(1);
      
      if (community.length === 0) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      res.json({
        community: community[0],
        _version: "community_details_v1",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Community details error:", error);
      res.status(500).json({ error: "Failed to fetch community details" });
    }
  });

  // Map statistics endpoint
  app.get("/api/mapping/stats", async (req, res) => {
    try {
      const stats = await db
        .select({
          totalCommunities: sql<number>`count(*)`,
          withCoordinates: sql<number>`count(*) filter (where latitude is not null and longitude is not null)`,
          withHudData: sql<number>`count(*) filter (where hud_property_id is not null)`,
          avgRating: sql<number>`avg(rating)`,
          stateCount: sql<number>`count(distinct state)`
        })
        .from(communities);
      
      res.json({
        stats: stats[0],
        _version: "mapping_stats_v1",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Mapping stats error:", error);
      res.status(500).json({ error: "Failed to fetch mapping stats" });
    }
  });
}