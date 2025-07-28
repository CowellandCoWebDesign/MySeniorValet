import { type Express } from "express";
import { db } from "../db";
import { communities, reviews, communityClaims, claimedCommunities, pendingCommunities } from "@shared/schema";
import { eq, and, or, desc, inArray, sql, between, gte, lte, isNotNull } from "drizzle-orm";
import { insertCommunitySchema } from "@shared/schema";
import { isAuthenticated as requireAuth, isAdmin, checkRole } from "../replitAuth";
import { storage } from "../storage";
import { enhancedSearchService } from "../enhanced-search-service";
import { dataQualityEnhancement } from "../data-quality-enhancement";
import { careTypeClassifier } from "../care-type-classifier";
import { googlePlacesReviews } from "../google-places-reviews";
import { comprehensivePhotoEnrichment } from "../comprehensive-photo-enrichment";
import { systematicPhotoEnrichment } from "../systematic-photo-enrichment";
import { emergencyEnrichment } from "../emergency-enrichment";
import { pricingTransparencyService } from "../pricing-transparency-badges";
import { intelligentPricingService } from "../intelligent-pricing-service";
import { nationwidePricingResearch } from "../nationwide-pricing-research";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { googlePlacesIntegration } from "../google-places-integration";
import { realDataAnalyzer } from "../real-data-analyzer";
import { z } from "zod";

export function registerCommunityRoutes(app: Express) {
  // IMPORTANT: Specific routes must come BEFORE the /:id route
  
  // Get community count
  app.get("/api/communities/count", async (_req, res) => {
    try {
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(communities);
      
      res.json({ count: count.toString() });
    } catch (error) {
      console.error("Error getting community count:", error);
      res.status(500).json({ error: "Failed to get community count" });
    }
  });
  
  // HUD featured communities
  app.get("/api/communities/hud-featured", async (req, res) => {
    try {
      const hudFeatured = await db
        .select()
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 150`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(8);

      res.json(hudFeatured);
    } catch (error) {
      console.error("Error fetching HUD featured communities:", error);
      res.status(500).json({ error: "Failed to fetch HUD featured communities" });
    }
  });

  // Trending communities
  app.get("/api/communities/trending", async (req, res) => {
    try {
      const trending = await db
        .select()
        .from(communities)
        .where(gte(communities.rating, 4.0))
        .orderBy(desc(communities.rating))
        .limit(20);

      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending communities:", error);
      res.status(500).json({ error: "Failed to fetch trending communities" });
    }
  });

  // Coastal communities
  app.get("/api/communities/coastal", async (req, res) => {
    try {
      const coastal = await db
        .select()
        .from(communities)
        .where(
          or(
            eq(communities.state, 'CA'),
            eq(communities.state, 'FL'),
            eq(communities.state, 'OR'),
            eq(communities.state, 'WA')
          )
        )
        .orderBy(desc(communities.rating))
        .limit(20);

      res.json(coastal);
    } catch (error) {
      console.error("Error fetching coastal communities:", error);
      res.status(500).json({ error: "Failed to fetch coastal communities" });
    }
  });
  
  // Get all communities with filters
  app.get("/api/communities", async (req, res) => {
    try {
      const { 
        limit = "20", 
        offset = "0", 
        careTypes, 
        priceMin, 
        priceMax, 
        state,
        city,
        rating,
        features,
        excludePending = "true" 
      } = req.query;

      let query = db.select().from(communities);
      const conditions = [];

      // Exclude pending communities - status field doesn't exist
      // All communities are considered active

      // Care type filter
      if (careTypes) {
        const careTypeArray = (careTypes as string).split(',');
        conditions.push(
          or(...careTypeArray.map(ct => 
            sql`${communities.careTypes}::text[] && ARRAY[${ct}]`
          ))
        );
      }

      // Price filter - using rentPerMonth field which exists
      if (priceMin) {
        conditions.push(sql`CAST(${communities.rentPerMonth} AS DECIMAL) >= ${parseInt(priceMin as string)}`);
      }
      if (priceMax) {
        conditions.push(sql`CAST(${communities.rentPerMonth} AS DECIMAL) <= ${parseInt(priceMax as string)}`);
      }

      // Location filters
      if (state) {
        conditions.push(eq(communities.state, state as string));
      }
      if (city) {
        conditions.push(eq(communities.city, city as string));
      }

      // Rating filter
      if (rating) {
        conditions.push(gte(communities.rating, parseFloat(rating as string)));
      }

      // Features filter
      if (features) {
        const featureArray = (features as string).split(',');
        conditions.push(
          and(...featureArray.map(f => 
            sql`${communities.features}::text[] && ARRAY[${f}]`
          ))
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json(result);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  // Get communities by location
  app.get("/api/communities/by-location/:location", async (req, res) => {
    try {
      const location = req.params.location;
      const locationCommunities = await db
        .select()
        .from(communities)
        .where(
          or(
            eq(communities.state, location),
            eq(communities.city, location)
          )
        )
        .orderBy(desc(communities.rating))
        .limit(20);

      res.json(locationCommunities);
    } catch (error) {
      console.error("Error fetching communities by location:", error);
      res.status(500).json({ error: "Failed to fetch communities by location" });
    }
  });

  // Get single community by ID - MUST BE LAST
  app.get("/api/communities/:id", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get reviews for the community
      const communityReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.communityId, communityId))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Check if community is claimed
      const [claim] = await db
        .select()
        .from(claimedCommunities)
        .where(eq(claimedCommunities.communityId, communityId))
        .limit(1);

      res.json({
        ...community,
        reviews: communityReviews,
        isClaimed: !!claim,
        claimInfo: claim ? {
          businessName: claim.businessName,
          operatorType: claim.operatorType,
          subscriptionPlan: claim.subscriptionPlan
        } : null
      });
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Create new community (admin only)
  app.post("/api/communities", requireAuth, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);
      
      const [newCommunity] = await db
        .insert(communities)
        .values(validatedData)
        .returning();

      res.status(201).json(newCommunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating community:", error);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  // Update community (admin only)
  app.put("/api/communities/:id", requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const updates = req.body;

      const [updated] = await db
        .update(communities)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Community not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating community:", error);
      res.status(500).json({ error: "Failed to update community" });
    }
  });

  // Delete community (admin only)
  app.delete("/api/communities/:id", requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);

      await db
        .delete(communities)
        .where(eq(communities.id, communityId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting community:", error);
      res.status(500).json({ error: "Failed to delete community" });
    }
  });

  // HUD featured communities
  app.get("/api/communities/hud-featured", async (req, res) => {
    try {
      const startTime = Date.now();
      
      const hudFeatured = await db
        .select()
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 150`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(8);

      console.log(`HUD featured communities loaded in ${Date.now() - startTime}ms - Found ${hudFeatured.length} communities`);
      res.json(hudFeatured);
    } catch (error) {
      console.error("Error fetching HUD featured communities:", error);
      res.status(500).json({ error: "Failed to fetch HUD featured communities" });
    }
  });

  // Trending communities
  app.get("/api/communities/trending", async (req, res) => {
    try {
      const startTime = Date.now();
      
      const trending = await db
        .select()
        .from(communities)
        .where(
          and(
            gte(communities.rating, 4.5),
            sql`${communities.photos}::text[] != '{}' AND array_length(${communities.photos}::text[], 1) > 0`
          )
        )
        .orderBy(desc(communities.rating), desc(communities.reviewCount))
        .limit(12);

      console.log(`Trending communities loaded in ${Date.now() - startTime}ms`);
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending communities:", error);
      res.status(500).json({ error: "Failed to fetch trending communities" });
    }
  });

  // Coastal communities
  app.get("/api/communities/coastal", async (req, res) => {
    try {
      const startTime = Date.now();
      
      const coastalCities = ['Santa Monica', 'Monterey', 'San Francisco', 'Santa Barbara', 'Carmel'];
      const coastalPromises = coastalCities.map(city => 
        db
          .select()
          .from(communities)
          .where(eq(communities.city, city))
          .limit(5)
      );

      const coastalResults = await Promise.all(coastalPromises);
      const coastal = coastalResults.flat();

      console.log(`Coastal communities loaded in ${Date.now() - startTime}ms`);
      res.json(coastal);
    } catch (error) {
      console.error("Error fetching coastal communities:", error);
      res.status(500).json({ error: "Failed to fetch coastal communities" });
    }
  });

  // Get communities by location
  app.get("/api/communities/by-location/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const { limit = "10", offset = "0" } = req.query;
      const startTime = Date.now();

      const result = await db
        .select()
        .from(communities)
        .where(
          or(
            eq(communities.city, location),
            eq(communities.state, location)
          )
        )
        .orderBy(desc(communities.rating))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      console.log(`Location communities (${location}) loaded in ${Date.now() - startTime}ms`);
      res.json(result);
    } catch (error) {
      console.error("Error fetching communities by location:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  // Enrich community data (admin only)
  app.post("/api/communities/:id/enrich", requireAuth, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { enrichmentType = 'all' } = req.body;

      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      const enrichmentResults: any = {};

      // Google Places enrichment
      if (enrichmentType === 'all' || enrichmentType === 'google') {
        try {
          const googleData = await googlePlacesIntegration.enrichCommunityWithGooglePlaces(community);
          enrichmentResults.google = {
            success: !!googleData,
            data: googleData
          };
        } catch (error) {
          enrichmentResults.google = {
            success: false,
            error: error.message
          };
        }
      }

      // Photo enrichment
      if (enrichmentType === 'all' || enrichmentType === 'photos') {
        try {
          const photoData = await systematicPhotoEnrichment.enrichSingleCommunity(community);
          enrichmentResults.photos = {
            success: !!photoData,
            photosAdded: photoData?.photosAdded || 0
          };
        } catch (error) {
          enrichmentResults.photos = {
            success: false,
            error: error.message
          };
        }
      }

      // Care type classification
      if (enrichmentType === 'all' || enrichmentType === 'careTypes') {
        try {
          const careTypes = await careTypeClassifier.classifyCommunity(community);
          if (careTypes && careTypes.length > 0) {
            await db
              .update(communities)
              .set({ careTypes })
              .where(eq(communities.id, communityId));
            
            enrichmentResults.careTypes = {
              success: true,
              careTypes
            };
          }
        } catch (error) {
          enrichmentResults.careTypes = {
            success: false,
            error: error.message
          };
        }
      }

      res.json({
        communityId,
        enrichmentType,
        results: enrichmentResults,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error enriching community:", error);
      res.status(500).json({ error: "Failed to enrich community data" });
    }
  });

  // Batch enrich communities (admin only)
  app.post("/api/communities/batch-enrich", requireAuth, isAdmin, async (req, res) => {
    try {
      const { limit = 10, enrichmentType = 'all' } = req.body;

      // Get communities that need enrichment
      const communitiesToEnrich = await db
        .select()
        .from(communities)
        .where(
          or(
            sql`${communities.photos}::text[] = '{}' OR ${communities.photos} IS NULL`,
            sql`${communities.careTypes}::text[] = '{}' OR ${communities.careTypes} IS NULL`
          )
        )
        .limit(limit);

      const results = {
        total: communitiesToEnrich.length,
        successful: 0,
        failed: 0,
        details: [] as any[]
      };

      for (const community of communitiesToEnrich) {
        try {
          let enriched = false;

          // Enrich based on type
          if (enrichmentType === 'all' || enrichmentType === 'photos') {
            await systematicPhotoEnrichment.enrichSingleCommunity(community);
            enriched = true;
          }

          if (enrichmentType === 'all' || enrichmentType === 'careTypes') {
            const careTypes = await careTypeClassifier.classifyCommunity(community);
            if (careTypes && careTypes.length > 0) {
              await db
                .update(communities)
                .set({ careTypes })
                .where(eq(communities.id, community.id));
              enriched = true;
            }
          }

          if (enriched) {
            results.successful++;
            results.details.push({
              id: community.id,
              name: community.name,
              status: 'success'
            });
          }
        } catch (error) {
          results.failed++;
          results.details.push({
            id: community.id,
            name: community.name,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error batch enriching communities:", error);
      res.status(500).json({ error: "Failed to batch enrich communities" });
    }
  });

  // Get community statistics
  app.get("/api/communities/stats", async (req, res) => {
    try {
      const stats = await db
        .select({
          totalCommunities: sql`COUNT(*)`,
          avgRating: sql`AVG(CAST(${communities.rating} AS FLOAT))`,
          totalWithPhotos: sql`COUNT(CASE WHEN ${communities.photos}::text[] != '{}' THEN 1 END)`,
          totalHUD: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
          stateCount: sql`COUNT(DISTINCT ${communities.state})`
        })
        .from(communities);

      const stateDistribution = await db
        .select({
          state: communities.state,
          count: sql`COUNT(*)`
        })
        .from(communities)
        .groupBy(communities.state)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      res.json({
        ...stats[0],
        topStates: stateDistribution
      });
    } catch (error) {
      console.error("Error fetching community statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
}