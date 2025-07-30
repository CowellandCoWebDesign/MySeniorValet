import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, desc, sql, isNotNull } from "drizzle-orm";
import { superclusterService } from "../services/supercluster";

export function registerMappingFixRoutes(app: Express) {
  
  // WORKING: Fix the broken clustering endpoint that keeps returning "Invalid community ID"
  app.get("/api/communities/clusters-fixed", async (req, res) => {
    try {
      const { west, south, east, north, zoom = 10 } = req.query;
      
      if (!west || !south || !east || !north) {
        return res.status(400).json({ 
          error: "Missing bounding box. Required: west, south, east, north",
          example: "?west=-122.5&south=37.7&east=-122.3&north=37.8&zoom=10"
        });
      }
      
      const westFloat = parseFloat(west as string);
      const southFloat = parseFloat(south as string);
      const eastFloat = parseFloat(east as string);
      const northFloat = parseFloat(north as string);
      const zoomInt = parseInt(zoom as string);
      
      console.log(`Fixed clustering request: zoom=${zoomInt}, bounds=[${westFloat},${southFloat},${eastFloat},${northFloat}]`);
      
      // Initialize supercluster 
      try {
        await superclusterService.initialize();
        const clusters = await superclusterService.getClusters([westFloat, southFloat, eastFloat, northFloat], zoomInt);
        
        console.log(`✅ Fixed clustering successful: ${clusters.length} clusters/points`);
        
        res.json({
          type: "FeatureCollection",
          features: clusters,
          zoom: zoomInt,
          bounds: { west: westFloat, south: southFloat, east: eastFloat, north: northFloat },
          status: "success",
          count: clusters.length,
          _version: "clustering_fix_v2",
          _timestamp: Date.now()
        });
        
      } catch (superclusterError) {
        console.error('Supercluster failed, falling back to direct DB query:', superclusterError);
        
        // Fallback: Direct database query without clustering
        const directResults = await db
          .select({
            id: communities.id,
            name: communities.name,
            latitude: communities.latitude,
            longitude: communities.longitude,
            address: communities.address,
            city: communities.city,
            state: communities.state,
            careTypes: communities.careTypes,
            rating: communities.rating,
            phone: communities.phone,
            website: communities.website,
            priceRange: communities.priceRange,
            hudPropertyId: communities.hudPropertyId,
            rentPerMonth: communities.rentPerMonth
          })
          .from(communities)
          .where(and(
            sql`${communities.longitude}::numeric BETWEEN ${westFloat} AND ${eastFloat}`,
            sql`${communities.latitude}::numeric BETWEEN ${southFloat} AND ${northFloat}`,
            isNotNull(communities.latitude),
            isNotNull(communities.longitude)
          ))
          .limit(500)
          .orderBy(desc(communities.rating));
        
        // Convert to GeoJSON features
        const features = directResults.map(community => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(community.longitude as string), parseFloat(community.latitude as string)]
          },
          properties: {
            cluster: false,
            id: community.id,
            name: community.name,
            address: community.address,
            city: community.city,
            state: community.state,
            careTypes: community.careTypes,
            rating: community.rating,
            phone: community.phone,
            website: community.website,
            priceRange: community.priceRange,
            hudPropertyId: community.hudPropertyId,
            rentPerMonth: community.rentPerMonth
          }
        }));
        
        console.log(`✅ Fallback direct query successful: ${features.length} communities`);
        
        res.json({
          type: "FeatureCollection", 
          features,
          zoom: zoomInt,
          bounds: { west: westFloat, south: southFloat, east: eastFloat, north: northFloat },
          status: "fallback_success",
          count: features.length,
          _version: "direct_query_fallback_v1",
          _timestamp: Date.now()
        });
      }
      
    } catch (error) {
      console.error("Fixed clustering error:", error);
      res.status(500).json({ 
        error: "Fixed clustering failed",
        message: error instanceof Error ? error.message : "Unknown error",
        _version: "error_v1",
        _timestamp: Date.now()
      });
    }
  });

  // WORKING: Simple bounds-based search that doesn't depend on broken endpoints
  app.get("/api/communities/search-fixed", async (req, res) => {
    try {
      const { bounds, limit = 100, careTypes, priceRange, minRating } = req.query;
      
      if (!bounds) {
        return res.status(400).json({ 
          error: "Bounds parameter required",
          format: "bounds=west,south,east,north", 
          example: "bounds=-122.5,37.7,-122.3,37.8"
        });
      }
      
      const boundsArray = (bounds as string).split(',').map(Number);
      if (boundsArray.length !== 4) {
        return res.status(400).json({ 
          error: "Invalid bounds format. Use: bounds=west,south,east,north" 
        });
      }
      
      const [west, south, east, north] = boundsArray;
      
      console.log(`Fixed search request: bounds=[${west},${south},${east},${north}], limit=${limit}`);
      
      // Build query conditions
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
          sql`${communities.rating}::numeric >= ${parseFloat(minRating as string)}`
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
          photos: communities.photos,
          description: communities.description,
          hudPropertyId: communities.hudPropertyId,
          rentPerMonth: communities.rentPerMonth
        })
        .from(communities)
        .where(whereConditions)
        .limit(parseInt(limit as string))
        .orderBy(desc(communities.rating));
      
      console.log(`✅ Fixed search successful: ${searchResults.length} communities found`);
      
      res.json({
        communities: searchResults,
        total: searchResults.length,
        bounds: { west, south, east, north },
        filters: { careTypes, priceRange, minRating },
        status: "success",
        _version: "search_fix_v2",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Fixed search error:", error);
      res.status(500).json({ 
        error: "Fixed search failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI-ENHANCED: Map search with Claude analysis
  app.get("/api/communities/search-ai", async (req, res) => {
    try {
      const { location, bounds, careTypes, budget, limit = 50 } = req.query;
      
      console.log(`AI-enhanced map search: location="${location}", bounds="${bounds}"`);
      
      let searchResults: any[] = [];
      let aiAnalysis: any = null;
      
      // If bounds provided, use geographic search
      if (bounds) {
        const boundsArray = (bounds as string).split(',').map(Number);
        if (boundsArray.length === 4) {
          const [west, south, east, north] = boundsArray;
          
          searchResults = await db
            .select()
            .from(communities)
            .where(and(
              sql`${communities.longitude}::numeric BETWEEN ${west} AND ${east}`,
              sql`${communities.latitude}::numeric BETWEEN ${south} AND ${north}`,
              isNotNull(communities.latitude),
              isNotNull(communities.longitude)
            ))
            .limit(parseInt(limit as string))
            .orderBy(desc(communities.rating));
        }
      }
      
      // If location text provided, use AI analysis
      if (location && searchResults.length === 0) {
        try {
          const anthropicAIService = await import('../anthropic-ai-service');
          
          const analysisPrompt = `Analyze this senior living search: "${location}"
          
Please provide insights in JSON format:
{
  "interpretation": "What the user is looking for",  
  "suggestedLocations": ["city1", "state1"],
  "suggestedCareTypes": ["Assisted Living", "Memory Care"],
  "confidence": 0.85
}`;
          
          const aiResponse = await anthropicAIService.default.generateResponse(analysisPrompt, {
            maxTokens: 500
          });
          
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiAnalysis = JSON.parse(jsonMatch[0]);
            
            // Use AI analysis for search
            if (aiAnalysis.suggestedLocations?.length > 0) {
              const locationConditions = aiAnalysis.suggestedLocations.map((loc: string) => 
                or(
                  sql`LOWER(${communities.city}) LIKE ${`%${loc.toLowerCase()}%`}`,
                  sql`LOWER(${communities.state}) LIKE ${`%${loc.toLowerCase()}%`}`
                )
              );
              
              searchResults = await db
                .select()
                .from(communities)
                .where(and(
                  or(...locationConditions),
                  isNotNull(communities.latitude),
                  isNotNull(communities.longitude)
                ))
                .limit(parseInt(limit as string))
                .orderBy(desc(communities.rating));
            }
          }
        } catch (aiError) {
          console.error('AI analysis failed:', aiError);
        }
      }
      
      console.log(`✅ AI search complete: ${searchResults.length} communities found`);
      
      res.json({
        communities: searchResults,
        aiAnalysis: aiAnalysis ? {
          interpretation: aiAnalysis.interpretation,
          suggestedLocations: aiAnalysis.suggestedLocations,
          suggestedCareTypes: aiAnalysis.suggestedCareTypes,
          confidence: aiAnalysis.confidence
        } : null,
        total: searchResults.length,
        status: "success",
        _version: "ai_search_v1",
        _timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("AI search error:", error);
      res.status(500).json({ 
        error: "AI search failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}