import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { searchCommunitySchema } from "@shared/schema";
import { enhancedSearchService } from "../enhanced-search-service";
import { superclusterService } from "../services/supercluster";
import { geocodeLocation, getZoomLevel } from "../geocoding-data";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { z } from "zod";

export function registerSearchRoutes(app: Express) {
  // Basic search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const searchParams = searchCommunitySchema.parse({
        location: req.query.location || '',
        careType: req.query.careType || 'All Types',
        budget: req.query.budget || 'all',
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : [],
        availability: req.query.availability || 'all',
        distance: req.query.distance ? parseInt(req.query.distance as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      });

      console.log('Search parameters received:', searchParams);

      const result = await enhancedSearchService.searchCommunities(searchParams);
      
      // Apply intelligent pricing to eliminate "call for pricing"
      result.communities = result.communities.map(community => eliminateCallForPricing(community));
      
      console.log(`Search returned ${result.communities.length} communities`);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid search parameters", details: error.errors });
      }
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Enhanced search with ZIP code intelligence
  app.get('/api/communities/search/enhanced', async (req, res) => {
    try {
      console.log('Enhanced search request received:', req.query);
      
      const searchParams = {
        location: req.query.location as string,
        careType: req.query.careType as string,
        budget: req.query.budget as string,
        amenities: req.query.amenities ? (req.query.amenities as string).split(',') : undefined,
        availability: req.query.availability as string,
        distance: req.query.distance ? parseInt(req.query.distance as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      };

      const result = await enhancedSearchService.searchCommunities(searchParams);
      
      // Apply intelligent pricing system to all communities
      result.communities = result.communities.map(community => eliminateCallForPricing(community));
      
      // Try to geocode the location if provided
      if (searchParams.location) {
        try {
          const geocoded = await geocodeLocation(searchParams.location);
          if (geocoded) {
            const zoomLevel = await getZoomLevel(geocoded.type);
            result.geocoded = {
              coordinates: geocoded.coordinates,
              displayName: geocoded.displayName,
              type: geocoded.type,
              zoomLevel
            };
          }
        } catch (error) {
          console.error('Geocoding failed:', error);
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error('Enhanced search error:', error);
      res.status(500).json({ 
        error: 'Enhanced search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PostGIS-enabled spatial search endpoint
  app.get('/api/communities/search/spatial', async (req, res) => {
    try {
      console.log('PostGIS spatial search request received:', req.query);
      
      const {
        swLat,
        swLng,
        neLat,
        neLng,
        limit = 4000,
        careTypes,
        priceRanges,
        livePricing,
        minRating,
        amenities
      } = req.query;

      // Validate required bounding box parameters
      if (!swLat || !swLng || !neLat || !neLng) {
        return res.status(400).json({ 
          error: 'Missing bounding box parameters. Required: swLat, swLng, neLat, neLng' 
        });
      }

      const startTime = Date.now();
      
      // Parse coordinates
      const swLatFloat = parseFloat(swLat as string);
      const swLngFloat = parseFloat(swLng as string);
      const neLatFloat = parseFloat(neLat as string);
      const neLngFloat = parseFloat(neLng as string);
      
      console.log(`Bounds: [${swLngFloat}, ${swLatFloat}, ${neLngFloat}, ${neLatFloat}]`);
      
      // Build where conditions
      let whereConditions = [
        sql`${communities.latitude}::float >= ${swLatFloat}`,
        sql`${communities.latitude}::float <= ${neLatFloat}`,
        sql`${communities.longitude}::float >= ${swLngFloat}`,
        sql`${communities.longitude}::float <= ${neLngFloat}`
      ];

      // Add care type filter
      if (careTypes && careTypes !== 'All Types') {
        const careTypeList = (careTypes as string).split(',').map(ct => ct.trim());
        if (careTypeList.length > 0) {
          const careTypeConditions = careTypeList.map(ct => 
            sql`${ct} = ANY(${communities.careTypes})`
          );
          whereConditions.push(sql`(${sql.join(careTypeConditions, sql` OR `)})`);
        }
      }

      // Add rating filter
      if (minRating) {
        whereConditions.push(sql`${communities.rating}::float >= ${parseFloat(minRating as string)}`);
      }

      // Add price range filter
      if (priceRanges && priceRanges !== 'all') {
        const priceRangeList = (priceRanges as string).split(',').map(pr => pr.trim());
        const priceConditions = [];
        
        for (const range of priceRangeList) {
          if (range === 'under1500') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int < 1500`);
          } else if (range === '1500to2500') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int >= 1500 AND (${communities.priceRange}->>'min')::int <= 2500`);
          } else if (range === '2500to3500') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int >= 2500 AND (${communities.priceRange}->>'min')::int <= 3500`);
          } else if (range === '3500to5000') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int >= 3500 AND (${communities.priceRange}->>'min')::int <= 5000`);
          } else if (range === 'over5000') {
            priceConditions.push(sql`(${communities.priceRange}->>'min')::int > 5000`);
          }
        }
        
        if (priceConditions.length > 0) {
          whereConditions.push(sql`(${sql.join(priceConditions, sql` OR `)})`);
        }
      }

      // Add live pricing filter
      if (livePricing === 'true') {
        whereConditions.push(sql`(
          (${communities.hudPropertyId} IS NOT NULL AND ${communities.rentPerMonth} IS NOT NULL) OR
          (${communities.claimedBy} IS NOT NULL AND ${communities.pricingType} = 'live' AND ${communities.pricingLastUpdated} > NOW() - INTERVAL '30 days')
        )`);
      }

      const query = db.select()
        .from(communities)
        .where(and(...whereConditions))
        .limit(parseInt(limit as string));
      
      console.log('Executing Drizzle ORM spatial query...');
      
      const result = await Promise.race([
        query,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 2 seconds')), 2000)
        )
      ]) as any;
      
      const communitiesData = Array.isArray(result) ? result : result.rows || [];
      
      // Apply intelligent pricing system
      const communitiesWithPricing = communitiesData.map((community: any) => eliminateCallForPricing(community));
      
      console.log(`✅ PostGIS spatial search returned ${communitiesWithPricing.length} communities in ${Date.now() - startTime}ms`);
      
      res.json(communitiesWithPricing);
    } catch (error) {
      console.error('PostGIS spatial search error:', error);
      res.status(500).json({ 
        error: 'PostGIS spatial search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Nearest communities search
  app.get('/api/communities/search/nearest', async (req, res) => {
    try {
      console.log('Nearest communities search request received:', req.query);
      
      const {
        lat,
        lng,
        radius = 100, // Default 100km radius
        limit = 20
      } = req.query;

      // Validate required parameters
      if (!lat || !lng) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Required: lat, lng' 
        });
      }

      const startTime = Date.now();
      
      // Convert radius from km to degrees (rough estimation)
      const centerLat = parseFloat(lat as string);
      const centerLng = parseFloat(lng as string);
      const kmToDegrees = parseFloat(radius as string) / 111.0;
      
      const query = db.select()
        .from(communities)
        .where(
          and(
            sql`${communities.latitude}::float BETWEEN ${centerLat - kmToDegrees} AND ${centerLat + kmToDegrees}`,
            sql`${communities.longitude}::float BETWEEN ${centerLng - kmToDegrees} AND ${centerLng + kmToDegrees}`
          )
        )
        .orderBy(
          sql`SQRT(
            POWER(${communities.latitude}::float - ${centerLat}, 2) + 
            POWER(${communities.longitude}::float - ${centerLng}, 2)
          )`
        )
        .limit(parseInt(limit as string));

      const result = await query;
      
      console.log(`Nearest communities search returned ${result.length} communities in ${Date.now() - startTime}ms`);
      
      res.json(result);
    } catch (error) {
      console.error('Nearest communities search error:', error);
      res.status(500).json({ 
        error: 'Nearest communities search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Supercluster endpoint for map clustering
  app.get('/api/communities/clusters', async (req, res) => {
    try {
      const { swLat, swLng, neLat, neLng, zoom } = req.query;
      
      if (!swLat || !swLng || !neLat || !neLng || !zoom) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Required: swLat, swLng, neLat, neLng, zoom' 
        });
      }

      const bounds = {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      };
      
      const clusters = await superclusterService.getClusters(
        bounds,
        parseInt(zoom as string)
      );
      
      res.json(clusters);
    } catch (error) {
      console.error('Cluster error:', error);
      res.status(500).json({ error: 'Failed to get clusters' });
    }
  });

  // Get cluster details
  app.get('/api/communities/clusters/:clusterId/expand', async (req, res) => {
    try {
      const clusterId = parseInt(req.params.clusterId);
      const communities = await superclusterService.getClusterCommunities(clusterId);
      res.json(communities);
    } catch (error) {
      console.error('Cluster expansion error:', error);
      res.status(500).json({ error: 'Failed to expand cluster' });
    }
  });

  // Autocomplete search suggestions
  app.get('/api/search/suggestions', async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || (query as string).length < 2) {
        return res.json([]);
      }

      const searchTerm = (query as string).toLowerCase();
      
      // Get city suggestions
      const citySuggestions = await db
        .selectDistinct({ city: communities.city, state: communities.state })
        .from(communities)
        .where(sql`LOWER(${communities.city}) LIKE ${searchTerm + '%'}`)
        .limit(5);

      // Get state suggestions
      const stateSuggestions = await db
        .selectDistinct({ state: communities.state })
        .from(communities)
        .where(sql`LOWER(${communities.state}) LIKE ${searchTerm + '%'}`)
        .limit(3);

      // Get community name suggestions
      const communitySuggestions = await db
        .select({ id: communities.id, name: communities.name, city: communities.city, state: communities.state })
        .from(communities)
        .where(sql`LOWER(${communities.name}) LIKE ${'%' + searchTerm + '%'}`)
        .limit(5);

      const suggestions = [
        ...citySuggestions.map(s => ({
          type: 'city',
          value: `${s.city}, ${s.state}`,
          display: `${s.city}, ${s.state}`
        })),
        ...stateSuggestions.map(s => ({
          type: 'state',
          value: s.state,
          display: s.state
        })),
        ...communitySuggestions.map(s => ({
          type: 'community',
          value: s.id.toString(),
          display: `${s.name} - ${s.city}, ${s.state}`
        }))
      ];

      res.json(suggestions);
    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ error: 'Failed to get search suggestions' });
    }
  });
}