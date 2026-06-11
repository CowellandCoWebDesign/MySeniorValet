import { type Express } from "express";
import { db } from "../db";
import { communities, reviews, communityClaims, claimedCommunities, pendingCommunities, auditLogs, featuredCommunities, searchHistory, analyticsEvents } from "@shared/schema";
import { generateCommunitySlug } from "../utils/generate-slug";
import { eq, and, or, desc, inArray, sql, between, gte, lte, isNotNull } from "drizzle-orm";
import { insertCommunitySchema } from "@shared/schema";
import { isAuthenticated as requireAuth, isAdmin, checkRole } from "../auth-middleware";
import { storage } from "../storage";
import { enhancedSearchService } from "../enhanced-search-service";
import { dataQualityEnhancement } from "../data-quality-enhancement";
import { careTypeClassifier } from "../care-type-classifier";
// Google Places imports removed to prevent API charges
// Photo enrichment services removed - they use Google Places API
import { pricingTransparencyService } from "../pricing-transparency-badges";
import { intelligentPricingService } from "../intelligent-pricing-service";
import { nationwidePricingResearch } from "../nationwide-pricing-research";
import { eliminateCallForPricing } from "../intelligent-pricing-system";
import { realDataAnalyzer } from "../real-data-analyzer";
import { z } from "zod";
import { internalNotifications } from "../services/internal-notifications";
import { enrichCommunityFree, scrapeWebsiteImages, findCommunityWebsite } from "../services/free-enrichment-service";
import { enrichCommunityWithGemini } from "../services/gemini-enrichment-service";
import { multiAIVerificationService } from "../multi-ai-verification-service";
import { onDemandEnrichmentService } from "../services/on-demand-enrichment-service";
import { optimizedEnrichmentService } from "../services/optimized-enrichment-service";
import { simpleEnrichmentService } from "../services/simple-enrichment-service";
import { CommunityPhotoEnrichment } from "../services/community-photo-enrichment";
import { vendors } from "@shared/schema";
import { geocodeWithNominatim } from "../nominatim-geocoding";

export function registerCommunityRoutes(app: Express) {
  // 301 redirect: /community/:id → SEO-friendly URL /senior-living/:state/:city/:slug
  app.get("/community/:id", async (req, res, next) => {
    const communityId = parseInt(req.params.id, 10);
    if (isNaN(communityId)) return next();
    try {
      const [community] = await db
        .select({ id: communities.id, name: communities.name, city: communities.city, state: communities.state })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      if (!community) return next();
      const statePart = community.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const cityPart = community.city.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const namePart = community.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || `community-${community.id}`;
      return res.redirect(301, `/senior-living/${statePart}/${cityPart}/${namePart}`);
    } catch {
      return next();
    }
  });

  // IMPORTANT: Specific routes must come BEFORE the /:id route
  
  // Get community and services count (dynamic, includes discovered entities)
  app.get("/api/communities/count", async (_req, res) => {
    try {
      // Add shorter cache for dynamic counts
      res.set({
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'ETag': `community-count-${Date.now()}`
      });
      
      // Get community count
      const [{ communityCount }] = await db
        .select({ communityCount: sql`count(*)` })
        .from(communities);
      
      // Get vendor/service count (including discovered services)
      const [{ vendorCount }] = await db
        .select({ vendorCount: sql`count(*)` })
        .from(vendors);
      
      // Total discoverable entities worldwide
      const totalCount = Number(communityCount) + Number(vendorCount);
      
      res.json({ 
        count: totalCount.toLocaleString(),
        communities: Number(communityCount).toLocaleString(),
        services: Number(vendorCount).toLocaleString(),
        isGlobal: true
      });
    } catch (error) {
      console.error("Error getting community count:", error);
      res.status(500).json({ error: "Failed to get community count" });
    }
  });
  
  // Search endpoint moved to unifiedSearchRoutes.ts for better functionality
  
  // HUD featured communities
  app.get("/api/communities/hud-featured", async (req, res) => {
    try {
      // Add production caching headers for HUD data
      if (process.env.NODE_ENV !== 'development') {
        res.set({
          'Cache-Control': 'public, max-age=900, s-maxage=1800', // 15 min client, 30 min CDN
          'ETag': `hud-featured-${new Date().getTime()}`
        });
      }
      
      const hudFeatured = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.isActive, true),
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 150`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(8);

      // Optimized: Process all communities in parallel using Promise.all
      // Note: enrichCommunityIfNeeded is marked async so we must await it
      const enrichedHudFeatured = await Promise.all(
        hudFeatured.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      
      res.json(enrichedHudFeatured);
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
        .where(and(eq(communities.isActive, true), sql`CAST(${communities.rating} AS DECIMAL) >= 4.0`))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(20);

      // Optimized: Process all communities in parallel using Promise.all
      // Note: enrichCommunityIfNeeded is marked async so we must await it
      const enrichedTrending = await Promise.all(
        trending.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      
      res.json(enrichedTrending);
    } catch (error) {
      console.error("Error fetching trending communities:", error);
      res.status(500).json({ error: "Failed to fetch trending communities" });
    }
  });

  // Featured Excellence Communities - from database
  app.get("/api/featured-communities", async (req, res) => {
    try {
      // Get featured communities from the database table
      const featuredRecords = await storage.getFeaturedCommunities();
      
      if (featuredRecords.length === 0) {
        return res.json([]);
      }
      
      // Extract community IDs from featured records
      const featuredIds = featuredRecords.map(f => f.communityId);
      
      const featuredCommunities = await db
        .select()
        .from(communities)
        .where(inArray(communities.id, featuredIds));

      // Enrich each community with photos and use database metadata
      const enrichedFeatured = await Promise.all(
        featuredCommunities.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          
          // Find the matching featured record for this community
          const featuredRecord = featuredRecords.find(f => f.communityId === community.id);
          
          // Get the best photo: prioritize enriched photos, then database photos, then featured record heroImage
          let heroImage = null;
          
          // First try to use actual community photos from enrichment
          if (enriched.photos && enriched.photos.length > 0) {
            // Filter out social media icons and find first real photo
            const realPhoto = enriched.photos.find(photo => 
              photo && 
              !photo.includes('foot-facebook') && 
              !photo.includes('foot-twitter') && 
              !photo.includes('foot-youtube') && 
              !photo.includes('loading.gif') && 
              !photo.includes('waze.png') &&
              !photo.includes('getlisted') &&
              !photo.includes('mt-association') &&
              !photo.includes('social') &&
              !photo.includes('icon') &&
              (photo.includes('http') || photo.includes('https'))
            );
            heroImage = realPhoto || enriched.photos[0];
          }
          
          // If no enriched photos, try the main photo field
          if (!heroImage && enriched.photo) {
            heroImage = enriched.photo;
          }
          
          // Only use the featured record's heroImage if we have no real community photos
          if (!heroImage && featuredRecord?.heroImage) {
            heroImage = featuredRecord.heroImage;
          }
          
          // Transform to match the frontend format using database data
          return {
            id: community.id,
            communityId: community.id,
            community: enriched,
            featuredTitle: featuredRecord?.featuredTitle || community.name,
            dealType: featuredRecord?.dealType || "Featured Community",
            highlights: featuredRecord?.highlights || [],
            availability: featuredRecord?.availability || "Available Now",
            whyFeatured: featuredRecord?.whyFeatured || [],
            heroImage,
            displayOrder: featuredRecord?.displayOrder || 999,
            subscriptionTier: featuredRecord?.subscriptionTier
          };
        })
      );
      
      // Sort by display order
      enrichedFeatured.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
      
      res.json(enrichedFeatured);
    } catch (error) {
      console.error("Error fetching featured communities:", error);
      res.status(500).json({ error: "Failed to fetch featured communities" });
    }
  });

  // Get single community (MUST come after specific routes to avoid conflicts)
  // COMMENTED OUT - This route is defined later after all specific routes
  /* app.get("/api/communities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const communityId = parseInt(id);

      if (isNaN(communityId)) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }

      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        // Fallback: Return structured mock data for demo purposes
        const mockCommunity = {
          id: communityId,
          name: "Sunrise Senior Living",
          type: "Assisted Living",
          address: "123 Community Lane",
          city: "Springfield",
          state: "CA",
          zipCode: "90210",
          phone: "(555) 123-4567",
          email: "info@sunrisesenior.com",
          website: "www.sunrisesenior.com",
          totalUnits: 120,
          occupancy: 87,
          monthlyRevenue: 450000,
          subscriptionTier: "Enterprise",
          priceRange: "$3,500 - $6,800",
          careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
          amenities: ["Fitness Center", "Library", "Garden", "Chapel"],
          rating: 4.7,
          numberOfReviews: 156
        };
        return res.json(mockCommunity);
      }

      res.json(eliminateCallForPricing(community));
    } catch (error) {
      console.error('Error fetching community:', error);
      // Return fallback data instead of error
      const mockCommunity = {
        id: parseInt(req.params.id),
        name: "Community Dashboard",
        type: "Senior Living",
        totalUnits: 100,
        occupancy: 85,
        monthlyRevenue: 350000,
        subscriptionTier: "Professional"
      };
      res.json(mockCommunity);
    }
  }); */

  // Coastal communities
  app.get("/api/communities/coastal", async (req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'ETag': `coastal-communities-${Date.now()}`
      });
      
      const coastal = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.isActive, true),
            or(
              eq(communities.state, 'CA'),
              eq(communities.state, 'FL'),
              eq(communities.state, 'OR'),
              eq(communities.state, 'WA')
            )
          )
        )
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(20);

      const enrichedCoastal = await Promise.all(
        coastal.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      res.json(enrichedCoastal);
    } catch (error) {
      console.error("Error fetching coastal communities:", error);
      res.status(500).json({ error: "Failed to fetch coastal communities" });
    }
  });
  
  // Get all communities with filters
  app.get("/api/communities", async (req, res) => {
    try {
      // Add production caching headers for better performance
      if (process.env.NODE_ENV !== 'development') {
        res.set({
          'Cache-Control': 'public, max-age=300, s-maxage=600', // 5 min client, 10 min CDN
          'ETag': `communities-${new Date().getTime()}`
        });
      }
      
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
        subtypes,
        excludePending = "true" 
      } = req.query;

      let query = db.select().from(communities);
      const conditions = [];

      // Always filter to active communities only
      conditions.push(eq(communities.isActive, true));

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
        conditions.push(sql`CAST(${communities.rating} AS DECIMAL) >= ${parseFloat(rating as string)}`);
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

      // Subtype filter
      if (subtypes) {
        const subtypeArray = (subtypes as string).split(',');
        conditions.push(
          or(...subtypeArray.map(subtype => 
            eq(communities.communitySubtype, subtype)
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

      // Enrich communities with stock photos if needed
      const enrichedResults = await Promise.all(
        result.map(async community => {
          return await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
        })
      );

      res.json(enrichedResults);

      // Fire-and-forget: record search history when meaningful filters are used
      const hasFilters = careTypes || state || city || rating || features || subtypes || priceMin || priceMax;
      if (hasFilters) {
        const userId = (req as any).user?.id || null;
        const parts = [city, state, careTypes, subtypes].filter(Boolean);
        const searchText = parts.join(', ') || 'filtered search';
        db.insert(searchHistory).values({
          userId,
          searchText,
          searchQuery: { state, city, careTypes, features, subtypes, priceMin, priceMax } as any,
          resultCount: enrichedResults.length,
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  // Get communities by location
  app.get("/api/communities/by-location/:location", async (req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'ETag': `location-${req.params.location}-${Date.now()}`
      });
      
      const location = req.params.location;
      
      // Handle special cases for location queries
      let searchTerm = location;
      let locationCommunities: any[] = [];
      
      if (location.toLowerCase() === 'hawaii') {
        searchTerm = 'HI';
        locationCommunities = await db
          .select()
          .from(communities)
          .where(
            or(
              eq(communities.state, searchTerm),
              eq(communities.city, location),
              sql`LOWER(${communities.name}) LIKE '%hawaii%'`
            )
          )
          .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
          .limit(20);
      } else if (location.toLowerCase() === 'mexico') {
        // For Mexico, search for communities with Mexico in the name or Mexican cities
        locationCommunities = await db
          .select()
          .from(communities)
          .where(
            or(
              sql`LOWER(${communities.name}) LIKE '%mexico%'`,
              sql`LOWER(${communities.city}) LIKE '%mexico%'`,
              sql`LOWER(${communities.name}) LIKE '%tijuana%'`,
              sql`LOWER(${communities.name}) LIKE '%guadalajara%'`,
              sql`LOWER(${communities.name}) LIKE '%puerto vallarta%'`,
              sql`LOWER(${communities.name}) LIKE '%cancun%'`,
              sql`LOWER(${communities.name}) LIKE '%playa del carmen%'`,
              sql`LOWER(${communities.city}) LIKE '%tijuana%'`,
              sql`LOWER(${communities.city}) LIKE '%guadalajara%'`,
              sql`LOWER(${communities.city}) LIKE '%puerto vallarta%'`,
              sql`LOWER(${communities.city}) LIKE '%cancun%'`,
              sql`LOWER(${communities.city}) LIKE '%playa del carmen%'`
            )
          )
          .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
          .limit(20);
          
        // Golden Data Rule: No synthetic fallback data - only return real database records
        // If no Mexico communities in database, return empty array
      } else {
        // Standard location search
        locationCommunities = await db
          .select()
          .from(communities)
          .where(
            or(
              eq(communities.state, searchTerm),
              eq(communities.city, location)
            )
          )
          .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
          .limit(20);
      }
      
      // Enrich communities with stock photos if needed
      const enrichedLocationCommunities = await Promise.all(
        locationCommunities.map(async community => {
          const enriched = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);
          return eliminateCallForPricing(enriched);
        })
      );
      res.json(enrichedLocationCommunities);

      // Fire-and-forget: record location search in search history
      const locUserId = (req as any).user?.id || null;
      db.insert(searchHistory).values({
        userId: locUserId,
        searchText: location,
        searchQuery: { location } as any,
        resultCount: enrichedLocationCommunities.length,
      }).catch(() => {});
    } catch (error) {
      console.error("Error fetching communities by location:", error);
      res.status(500).json({ error: "Failed to fetch communities by location" });
    }
  });

  // Map data endpoint - MUST BE BEFORE /:id
  app.get("/api/communities/map-data", async (req, res) => {
    try {
      const { bounds } = req.query;
      
      if (!bounds) {
        return res.status(400).json({ error: "Bounds parameter required" });
      }
      
      // Parse bounds: "west,south,east,north"
      const [west, south, east, north] = (bounds as string).split(',').map(Number);
      
      if ([west, south, east, north].some(isNaN)) {
        return res.status(400).json({ error: "Invalid bounds format" });
      }
      
      const mapData = await db
        .select({
          id: communities.id,
          name: communities.name,
          latitude: communities.latitude,
          longitude: communities.longitude,
          city: communities.city,
          state: communities.state,
          careTypes: communities.careTypes,
          rating: communities.rating
        })
        .from(communities)
        .where(
          and(
            gte(communities.latitude, south),
            lte(communities.latitude, north),
            gte(communities.longitude, west),
            lte(communities.longitude, east)
          )
        )
        .limit(1000);
      
      res.json(mapData);
    } catch (error) {
      console.error("Error fetching map data:", error);
      res.status(500).json({ error: "Failed to fetch map data" });
    }
  });

  // Get real-time Mexico communities for American retirees
  app.get("/api/communities/mexico-real-time", async (req, res) => {
    try {
      // Query actual Mexico communities from database
      const mexicoCommunities = await db
        .select({
          id: communities.id,
          name: communities.name,
          city: communities.city,
          state: communities.state,
          address: communities.address,
          rating: communities.rating,
          rentPerMonth: communities.rentPerMonth,
          priceRange: communities.priceRange,
          careTypes: communities.careTypes,
          description: communities.description,
          phone: communities.phone,
          latitude: communities.latitude,
          longitude: communities.longitude,
          photos: communities.photos,
          features: communities.features,
          reviewCount: communities.reviewCount,
          hudPropertyId: communities.hudPropertyId
        })
        .from(communities)
        .where(eq(communities.country, 'MX'))
        .limit(100);
      
      // Transform data for frontend compatibility
      const transformedCommunities = mexicoCommunities.map(community => {
        // Extract pricing from either rentPerMonth or priceRange
        let monthlyRent = null;
        let priceDisplay = 'Contact for pricing';
        let pricingForData = 'Contact for pricing';
        
        if (community.rentPerMonth) {
          // Remove any existing $ and parse the number
          const cleanPrice = String(community.rentPerMonth).replace(/[$,]/g, '');
          const numericPrice = parseFloat(cleanPrice);
          
          if (!isNaN(numericPrice) && numericPrice > 0) {
            priceDisplay = `$${Math.round(numericPrice)}`;
            pricingForData = `$${Math.round(numericPrice)}/month`;
          }
        } else if (community.priceRange && typeof community.priceRange === 'object') {
          monthlyRent = community.priceRange.monthly_rent || community.priceRange.monthlyRent;
          if (monthlyRent) {
            priceDisplay = `$${monthlyRent}`;
            pricingForData = `$${monthlyRent}/month`;
          }
        }

        return {
          ...community,
          rentPerMonth: priceDisplay,
          realTimeData: {
            currentPricing: pricingForData,
            availability: 'Contact for availability',
            marketComparison: '50-70% less than comparable US facilities'
          }
        };
      });
      
      res.json(transformedCommunities);
    } catch (error) {
      console.error("Error fetching Mexico communities:", error);
      res.status(500).json({ error: "Failed to fetch Mexico communities" });
    }
  });

  // Get total count of HUD communities
  app.get("/api/communities/hud-count", async (req, res) => {
    try {
      const hudCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(isNotNull(communities.hudPropertyId));

      const hudWithPricing = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            isNotNull(communities.rentPerMonth)
          )
        );

      res.json({ 
        total: parseInt(hudCount[0].count),
        withPricing: parseInt(hudWithPricing[0].count)
      });
    } catch (error) {
      console.error("Error fetching HUD count:", error);
      res.status(500).json({ error: "Failed to fetch HUD count" });
    }
  });

  // Get comprehensive pricing coverage statistics  
  app.get("/api/communities/pricing-coverage", async (req, res) => {
    try {
      // Total communities count
      const totalCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities);

      // Communities with any pricing data
      const withPricingCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(
          sql`
            live_pricing IS NOT NULL 
            OR price_range IS NOT NULL 
            OR rent_per_month IS NOT NULL 
            OR monthly_rent_range_start IS NOT NULL 
            OR monthly_rent_range_end IS NOT NULL
          `
        );

      // HUD communities with verified pricing
      const hudWithPricing = await db
        .select({ count: sql`COUNT(*)` })
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            isNotNull(communities.rentPerMonth)
          )
        );

      const totalCommunities = parseInt(totalCount[0].count);
      const communitiesWithPricing = parseInt(withPricingCount[0].count);
      const hudCommunitiesWithPricing = parseInt(hudWithPricing[0].count);
      const pricingCoveragePercentage = Math.round((communitiesWithPricing / totalCommunities) * 100);

      res.json({ 
        totalCommunities,
        communitiesWithPricing,
        communitiesWithoutPricing: totalCommunities - communitiesWithPricing,
        pricingCoveragePercentage,
        hudCommunitiesWithPricing,
        nonHudCommunitiesWithPricing: communitiesWithPricing - hudCommunitiesWithPricing,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching pricing coverage:", error);
      res.status(500).json({ error: "Failed to fetch pricing coverage statistics" });
    }
  });

  // Intelligent Pricing Prediction endpoint - AI-powered pricing estimates
  app.get("/api/communities/:id/pricing-prediction", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get AI pricing prediction
      console.log(`💡 Getting intelligent pricing prediction for ${community.name}`);
      const prediction = await intelligentPricingService.getAIPricingPrediction(community);

      res.json(prediction);
    } catch (error) {
      console.error("Pricing prediction error:", error);
      res.status(500).json({ 
        error: "Pricing prediction temporarily unavailable",
        fallback: "Contact community directly for pricing"
      });
    }
  });

  // AI-powered community matching based on care needs profile
  app.post("/api/communities/ai-match", async (req, res) => {
    try {
      const { careLevel, mobility, medical, budget, location, amenities, socialNeeds, familyInvolvement } = req.body;
      
      // Validate required fields
      if (!careLevel || !budget || !location) {
        return res.status(400).json({ error: 'Missing required fields: careLevel, budget, and location are required' });
      }

      const profile = {
        careLevel,
        mobility: mobility || 'full',
        medical: medical || [],
        budget: budget,
        location: location,
        amenities: amenities || [],
        socialNeeds: socialNeeds || 'medium',
        familyInvolvement: familyInvolvement || 'weekly'
      };

      const { aiMatching } = await import('../ai-powered-matching');
      const matches = await aiMatching.findBestMatches(profile, 5);
      
      res.json({
        success: true,
        matches,
        profile
      });
    } catch (error) {
      console.error('Error in AI matching:', error);
      res.status(500).json({ error: 'Failed to generate AI matches' });
    }
  });

  // SIMPLIFIED Verification endpoint - Uses unified cache to prevent cost spikes
  app.post("/api/communities/:id/verify", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { forceRefresh, websiteUrl } = req.body;
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      console.log(`🔍 Verification using unified cache for community ${communityId}`);
      
      // Get community details first
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
      
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Check if this community is featured (for cache duration)
      const [featuredRecord] = await db
        .select()
        .from(featuredCommunities)
        .where(
          and(
            eq(featuredCommunities.communityId, communityId),
            eq(featuredCommunities.isActive, true)
          )
        )
        .limit(1);
      
      const isFeatured = featuredRecord ? true : false;
      
      // Use the website URL from the request (from discovery) or fall back to community's stored website
      // CRITICAL FIX: Filter out invalid website values like "No", "Not", "N/A", etc.
      let communityWebsite = websiteUrl || community.website;
      if (communityWebsite) {
        // Check if it's a valid URL (must start with http or https or www)
        const isValidUrl = communityWebsite.startsWith('http://') || 
                          communityWebsite.startsWith('https://') || 
                          communityWebsite.startsWith('www.');
        
        // Also check for common invalid values
        const invalidValues = ['no', 'not', 'n/a', 'none', 'null', 'undefined', ''];
        const isInvalid = invalidValues.includes(communityWebsite.toLowerCase().trim());
        
        if (!isValidUrl || isInvalid) {
          console.log(`⚠️ Invalid website URL detected: "${communityWebsite}" - ignoring`);
          communityWebsite = undefined;
        } else {
          console.log(`📌 Using website URL for photo search: ${communityWebsite}`);
        }
      }
      
      // 7-day cache: skip Jina fetch if we have recent enrichment and caller did not force a refresh
      const ENRICHMENT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
      const lastEnriched = community.lastSuccessfulEnrichment;
      if (!forceRefresh && lastEnriched && (Date.now() - new Date(lastEnriched).getTime()) < ENRICHMENT_CACHE_TTL_MS) {
        const ageDays = Math.round((Date.now() - new Date(lastEnriched).getTime()) / 86_400_000);
        console.log(`⚡ Cache hit for "${community.name}" — enriched ${ageDays}d ago, serving DB data`);
        return res.json({
          communityId: communityId,
          communityName: community.name,
          timestamp: lastEnriched.toISOString(),
          cached: true,
          verificationResults: {
            webIntelligence: {
              images: community.photos || [],
              sources: community.website ? [community.website] : []
            },
            perplexityData: {
              lastUpdated: lastEnriched.toISOString(),
              searchContent: community.description || 'Contact for details.',
              sources: community.website ? [community.website] : []
            }
          },
          consensus: {
            agreementLevel: 'strong',
            verifiedFacts: [],
            disputedFacts: [],
            confidenceScore: 75,
            transparencyNotes: 'Served from cached enrichment data'
          },
          pricing: '',
          contactInfo: {
            phone: community.phone || '',
            website: community.website || ''
          }
        });
      }

      // ── Primary: Gemini 2.0 Flash + Search Grounding ──────────────────────────
      console.log(`🤖 Trying Gemini enrichment for "${community.name}" (${community.city}, ${community.state})`);
      const geminiResult = await enrichCommunityWithGemini({
        name: community.name,
        city: community.city,
        state: community.state,
      });

      let freeEnrichment: Awaited<ReturnType<typeof enrichCommunityFree>> | null = null;

      if (geminiResult.sourceType === "gemini_search" && geminiResult.about) {
        console.log(`🤖 Gemini enrichment: ${geminiResult.about.length} chars for "${community.name}"`);
        // Map Gemini result into the FreeEnrichmentResult shape
        freeEnrichment = {
          about: geminiResult.about,
          website: geminiResult.website,
          phone: geminiResult.phone,
          careTypes: geminiResult.careTypes,
          amenities: geminiResult.amenities,
          pricingContext: geminiResult.pricing,
          sourceUrl: geminiResult.website || communityWebsite || community.website || undefined,
          sourceType: "web_search",
          structured: true,
        } as any;
      } else {
        // ── Fallback: DuckDuckGo + Jina pipeline ────────────────────────────────
        console.log(`🔍 Gemini unavailable — running DuckDuckGo/Jina enrichment for "${community.name}"`);
        freeEnrichment = await enrichCommunityFree({
          name: community.name,
          city: community.city,
          state: community.state,
          websiteUrl: communityWebsite,
        });
      }

      console.log(`✅ Enrichment complete for "${community.name}": sourceType=${freeEnrichment.sourceType}, structured=${freeEnrichment.structured}`);

      // ── Photo discovery: scrape the community website when no DB photos exist ──
      // CommunityPhotoEnrichment only filters existing photos; it never fetches
      // new ones. Live photo discovery died with Perplexity, so communities that
      // were never scraped show zero photos. Recover them for free from the site.
      // Filter stored photos through the blocklist so previously-persisted junk
      // (map graphics, placeholders, icons) is never served as a community photo.
      const cleanDbPhotos: string[] = (community.photos || []).filter(
        (u: string) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u),
      );
      let discoveredPhotos: string[] = [];
      const hasDbPhotos = cleanDbPhotos.length > 0;
      if (!hasDbPhotos) {
        const scrapeUsable = async (url: string): Promise<string[]> => {
          const scraped = await scrapeWebsiteImages(url);
          return scraped
            .filter((u) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u))
            .slice(0, 15);
        };

        const primaryUrl =
          (freeEnrichment as any).website ||
          freeEnrichment.sourceUrl ||
          communityWebsite ||
          community.website ||
          undefined;

        if (primaryUrl) {
          console.log(`📸 No stored photos for "${community.name}" — scraping ${primaryUrl}`);
          discoveredPhotos = await scrapeUsable(primaryUrl);
        }

        // Gemini sometimes guesses URLs that 404. If the primary URL yielded no
        // photos, discover the real official site via DuckDuckGo and scrape that.
        if (discoveredPhotos.length === 0) {
          const realSite = await findCommunityWebsite(community.name, community.city, community.state);
          if (realSite && realSite !== primaryUrl) {
            console.log(`📸 Primary URL had no photos — trying discovered site ${realSite}`);
            discoveredPhotos = await scrapeUsable(realSite);
          }
        }
        console.log(`📸 Discovered ${discoveredPhotos.length} usable photos for "${community.name}"`);
      }

      // Build enrichmentResult in the same shape the downstream code expects
      const enrichmentResult = {
        communityId: communityId,
        communityName: community.name,
        lastUpdated: new Date().toISOString(),
        verificationStatus: 'verified' as const,
        confidence: freeEnrichment.sourceType === 'none' ? 30 : 75,
        officialWebsite: freeEnrichment.sourceUrl || community.website || '',
        phoneNumber: freeEnrichment.phone || community.phone || '',
        pricing: freeEnrichment.pricingContext || '',
        extractedAddress: undefined as string | undefined,
        // Prefer existing (clean) DB photos; otherwise use freshly scraped website photos
        photos: hasDbPhotos
          ? cleanDbPhotos
          : (discoveredPhotos.length > 0 ? discoveredPhotos : (freeEnrichment.photos || [])),
        careTypes: freeEnrichment.careTypes || [],
        amenities: freeEnrichment.amenities || [],
        searchResults: {
          summary: freeEnrichment.about || community.description ||
            'Contact for details — information for this community was not found online.',
          sources: freeEnrichment.sourceUrl ? [freeEnrichment.sourceUrl] : []
        }
      };

      console.log(`📝 Verify endpoint for ${community.name}:`, {
        forceRefresh,
        sourceType: freeEnrichment.sourceType,
        hasAbout: !!freeEnrichment.about,
        photosCount: enrichmentResult.photos.length
      });
      
      // Update database with discovered information
      if (enrichmentResult.searchResults?.summary) {
        const updates: any = {};
        let hasUpdates = false;
        
        // Get current community data
        const [current] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
        
        if (current) {
          // Update website if found and different
          if (enrichmentResult.officialWebsite && current.website !== enrichmentResult.officialWebsite) {
            updates.website = enrichmentResult.officialWebsite;
            hasUpdates = true;
            console.log(`✅ Updating website to: ${enrichmentResult.officialWebsite}`);
          }
          
          // Update phone if found and different
          if (enrichmentResult.phoneNumber && current.phone !== enrichmentResult.phoneNumber) {
            updates.phone = enrichmentResult.phoneNumber;
            hasUpdates = true;
            console.log(`✅ Updating phone to: ${enrichmentResult.phoneNumber}`);
          }
          
          // Update description with FULL content for SEO - no truncation
          // Allow overwrite on forceRefresh even when a description already exists
          if (enrichmentResult.searchResults?.summary && 
              enrichmentResult.searchResults.summary.length > 100 &&
              (!current.description || current.description.length < 50 || forceRefresh)) {
            updates.description = enrichmentResult.searchResults.summary; // Full content, no substring!
            hasUpdates = true;
            console.log(`✅ Updating description with FULL enriched content (${enrichmentResult.searchResults.summary.length} chars)`);
          }

          // Photo persistence (only when no clean DB photos already exist):
          //  - persist freshly scraped photos, OR
          //  - clear stored photos that were entirely junk/placeholders
          if (!hasDbPhotos) {
            if (discoveredPhotos.length > 0) {
              updates.photos = discoveredPhotos;
              hasUpdates = true;
              console.log(`✅ Updating photos with ${discoveredPhotos.length} scraped images`);
            } else if (
              current.photos &&
              current.photos.length > 0 &&
              current.photos.every((u: string) =>
                CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u),
              )
            ) {
              // Only clear when EVERY stored photo is junk — never wipe valid ones
              updates.photos = [];
              hasUpdates = true;
              console.log(`🧹 Clearing ${current.photos.length} junk/placeholder photo(s) from DB`);
            }
          }

          // Always stamp lastSuccessfulEnrichment when the pipeline produced real data
          if (freeEnrichment.sourceType !== 'none') {
            updates.lastSuccessfulEnrichment = new Date();
            hasUpdates = true;
          }

          // Address correction: if Perplexity found a different city than what is stored, update
          const extractedAddress = enrichmentResult.extractedAddress;
          if (extractedAddress) {
            const addrParts = extractedAddress.match(/^(.+),\s*([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?$/);
            if (addrParts) {
              const [, streetAddr, extractedCity, extractedState, extractedZip] = addrParts;
              const storedCity = (current.city || '').trim().toLowerCase();
              const newCity = extractedCity.trim().toLowerCase();
              if (newCity && newCity !== storedCity) {
                console.log(`🏠 Address correction detected for "${current.name}": "${current.city}" → "${extractedCity.trim()}"`);
                updates.address = streetAddr.trim();
                updates.city = extractedCity.trim();
                updates.state = extractedState.trim();
                if (extractedZip) updates.zipCode = extractedZip;
                hasUpdates = true;
                // Re-geocode using the corrected address to update map coordinates
                try {
                  const newCoords = await geocodeWithNominatim(
                    `${streetAddr.trim()}, ${extractedCity.trim()}, ${extractedState}`
                  );
                  if (newCoords) {
                    updates.latitude = newCoords.lat;
                    updates.longitude = newCoords.lng;
                    console.log(`📍 Re-geocoded "${current.name}" to: ${newCoords.lat}, ${newCoords.lng}`);
                  }
                } catch (geoErr) {
                  console.warn(`⚠️ Re-geocoding failed for "${current.name}":`, geoErr);
                }
              }
            }
          }

          // Apply updates if any
          if (hasUpdates) {
            await db.update(communities)
              .set({
                ...updates,
                updatedAt: new Date()
              })
              .where(eq(communities.id, communityId));
            console.log(`✅ On-demand enrichment completed for community ${communityId}:`, { 
              fieldsUpdated: Object.keys(updates),
              protectedFieldsSkipped: []
            });
          }
        }
      }

      // Transform to match expected frontend format
      const verificationReport = {
        communityId: enrichmentResult.communityId,
        communityName: enrichmentResult.communityName,
        timestamp: enrichmentResult.lastUpdated,
        
        // Core verification data
        verificationResults: {
          webIntelligence: {
            images: enrichmentResult.photos,
            sources: enrichmentResult.searchResults?.sources || [],
            careTypes: enrichmentResult.careTypes,
            amenities: enrichmentResult.amenities
          },
          searchResults: {
            summary: enrichmentResult.searchResults?.summary,
            sources: enrichmentResult.searchResults?.sources || []
          },
          perplexityData: {
            lastUpdated: enrichmentResult.lastUpdated,
            searchContent: enrichmentResult.searchResults?.summary,
            sources: enrichmentResult.searchResults?.sources || []
          }
        },
        
        // Care types and amenities at top level for easy UI access
        careTypes: enrichmentResult.careTypes,
        amenities: enrichmentResult.amenities,
        
        // Consensus data
        consensus: {
          agreementLevel: enrichmentResult.verificationStatus === 'verified' ? 'strong' : 'weak',
          verifiedFacts: [],
          disputedFacts: [],
          confidenceScore: enrichmentResult.confidence,
          transparencyNotes: `Verification status: ${enrichmentResult.verificationStatus}`
        },
        
        // Pricing data
        pricing: enrichmentResult.pricing,
        
        // Contact info
        contactInfo: {
          phone: enrichmentResult.phoneNumber,
          website: enrichmentResult.officialWebsite
        }
      };

      res.json(verificationReport);

    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ 
        error: "Failed to verify community data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get communities by state
  app.get("/api/communities/by-state", async (req, res) => {
    try {
      const { state } = req.query;
      
      if (!state) {
        return res.status(400).json({ error: "State parameter is required" });
      }
      
      const stateCommunities = await db
        .select()
        .from(communities)
        .where(eq(communities.state, state as string))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: stateCommunities });
    } catch (error) {
      console.error("Error fetching communities by state:", error);
      res.status(500).json({ error: "Failed to fetch communities by state" });
    }
  });

  // Get communities by city
  app.get("/api/communities/by-city", async (req, res) => {
    try {
      const { city, state } = req.query;
      
      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }
      
      let query = db.select().from(communities);
      
      if (city && state) {
        query = query.where(
          and(
            eq(communities.city, city as string),
            eq(communities.state, state as string)
          )
        );
      } else {
        query = query.where(eq(communities.city, city as string));
      }
      
      const cityCommunities = await query
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: cityCommunities });
    } catch (error) {
      console.error("Error fetching communities by city:", error);
      res.status(500).json({ error: "Failed to fetch communities by city" });
    }
  });

  // Get communities by country
  app.get("/api/communities/by-country", async (req, res) => {
    try {
      const { country } = req.query;
      
      if (!country) {
        return res.status(400).json({ error: "Country parameter is required" });
      }
      
      const countryCommunities = await db
        .select()
        .from(communities)
        .where(eq(communities.country, country as string))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: countryCommunities });
    } catch (error) {
      console.error("Error fetching communities by country:", error);
      res.status(500).json({ error: "Failed to fetch communities by country" });
    }
  });

  // Get HUD properties
  app.get("/api/communities/hud-properties", async (req, res) => {
    try {
      const hudProperties = await db
        .select()
        .from(communities)
        .where(isNotNull(communities.hudPropertyId))
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json(hudProperties);
    } catch (error) {
      console.error("Error fetching HUD properties:", error);
      res.status(500).json({ error: "Failed to fetch HUD properties" });
    }
  });

  // Get Canadian communities
  app.get("/api/communities/canadian", async (req, res) => {
    try {
      const canadianCommunities = await db
        .select()
        .from(communities)
        .where(
          or(
            eq(communities.state, 'ON'),
            eq(communities.state, 'QC'),
            eq(communities.state, 'BC'),
            eq(communities.state, 'AB'),
            eq(communities.state, 'MB'),
            eq(communities.state, 'SK'),
            eq(communities.state, 'NS'),
            eq(communities.state, 'NB'),
            eq(communities.state, 'NL'),
            eq(communities.state, 'PE'),
            eq(communities.state, 'NT'),
            eq(communities.state, 'YT'),
            eq(communities.state, 'NU')
          )
        )
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: canadianCommunities });
    } catch (error) {
      console.error("Error fetching Canadian communities:", error);
      res.status(500).json({ error: "Failed to fetch Canadian communities" });
    }
  });

  // Get Puerto Rico communities
  app.get("/api/communities/puerto-rico", async (req, res) => {
    try {
      const puertoRicoCommunities = await db
        .select()
        .from(communities)
        .where(
          eq(communities.state, 'PR')
        )
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: puertoRicoCommunities });
    } catch (error) {
      console.error("Error fetching Puerto Rico communities:", error);
      res.status(500).json({ error: "Failed to fetch Puerto Rico communities" });
    }
  });

  // Get Mexican communities
  app.get("/api/communities/mexican", async (req, res) => {
    try {
      const mexicanCommunities = await db
        .select()
        .from(communities)
        .where(
          eq(communities.country, 'Mexico')
        )
        .orderBy(sql`CAST(${communities.rating} AS DECIMAL) DESC`)
        .limit(100);
      
      res.json({ communities: mexicanCommunities });
    } catch (error) {
      console.error("Error fetching Mexican communities:", error);
      res.status(500).json({ error: "Failed to fetch Mexican communities" });
    }
  });

  // Get community statistics - COMPREHENSIVE REAL DATA
  app.get("/api/communities/stats", async (req, res) => {
    try {
      // Basic stats
      const stats = await db
        .select({
          totalCommunities: sql`COUNT(*)`,
          avgRating: sql`AVG(CAST(${communities.rating} AS FLOAT))`,
          totalWithPhotos: sql`COUNT(CASE WHEN ${communities.photos}::text[] != '{}' THEN 1 END)`,
          totalHUD: sql`COUNT(CASE WHEN ${communities.hudPropertyId} IS NOT NULL THEN 1 END)`,
          stateCount: sql`COUNT(DISTINCT ${communities.state})`,
          countryCount: sql`COUNT(DISTINCT ${communities.country})`,
          totalVerified: sql`COUNT(CASE WHEN ${communities.isVerified} = true THEN 1 END)`,
          totalClaimed: sql`COUNT(CASE WHEN ${communities.isClaimed} = true THEN 1 END)`
        })
        .from(communities);

      // State distribution
      const stateDistribution = await db
        .select({
          state: communities.state,
          count: sql`COUNT(*)`
        })
        .from(communities)
        .groupBy(communities.state)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Country distribution - real counts
      const countryDistribution = await db
        .select({
          country: communities.country,
          count: sql`COUNT(*)`
        })
        .from(communities)
        .where(isNotNull(communities.country))
        .groupBy(communities.country)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(20);

      // Recently discovered stats (last 30 days)
      const recentlyDiscoveredStats = await db
        .select({
          count: sql`COUNT(*)`
        })
        .from(communities)
        .where(
          and(
            or(
              sql`${communities.data_source} LIKE 'AI Discovery%'`,
              sql`${communities.data_source} LIKE 'ai_discovered_%'`,
              eq(communities.data_source, 'global_discovery')
            ),
            sql`${communities.createdAt} > NOW() - INTERVAL '30 days'`
          )
        );

      // Care type distribution - parse from careTypes array
      const careTypeStats = await db
        .select({
          independentLiving: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%independent%' THEN 1 END)`,
          assistedLiving: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%assisted%' THEN 1 END)`,
          memoryCare: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%memory%' THEN 1 END)`,
          skilledNursing: sql`COUNT(CASE WHEN ${communities.careTypes}::text ILIKE '%skilled%' OR ${communities.careTypes}::text ILIKE '%nursing%' THEN 1 END)`
        })
        .from(communities);

      res.json({
        ...stats[0],
        topStates: stateDistribution,
        countryDistribution: countryDistribution,
        recentlyDiscovered30d: Number(recentlyDiscoveredStats[0]?.count) || 0,
        careTypeDistribution: careTypeStats[0] || {}
      });
    } catch (error) {
      console.error("Error fetching community statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Get recently discovered communities (those found via Discovery Mode)
  app.get('/api/communities/recently-discovered', async (req, res) => {
    try {
      // CRITICAL: No caching for recently-discovered to ensure real-time updates
      // New discoveries should appear immediately after being saved
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Get communities that were discovered through AI/Discovery Mode
      // Includes all variations of discovery data sources
      const recentCommunities = await db.select()
        .from(communities)
        .where(
          or(
            sql`${communities.data_source} LIKE 'AI Discovery%'`,
            sql`${communities.data_source} LIKE 'ai_discovered_%'`,
            sql`${communities.data_source} LIKE 'Verified via Global Discovery%'`,
            eq(communities.data_source, 'discovered_community'),
            eq(communities.data_source, 'global_discovery'),
            eq(communities.data_source, 'ai_discovered_global_search')
          )
        )
        .orderBy(desc(communities.createdAt), desc(communities.id))
        .limit(limit);
      
      console.log(`🌍 Recently discovered communities query returned ${recentCommunities.length} results`);
      
      // Log sample of discovered communities for debugging
      if (recentCommunities.length > 0) {
        console.log(`📋 Sample of recently discovered communities:`, 
          recentCommunities.slice(0, 3).map(c => ({
            id: c.id,
            name: c.name,
            country: c.country,
            data_source: c.data_source
          }))
        );
      }
      
      res.json(recentCommunities);
    } catch (error) {
      console.error('Error fetching recently discovered communities:', error);
      res.status(500).json({ error: 'Failed to fetch recent communities' });
    }
  });

  // Get comprehensive data for community detail page including photos
  // OPTIMIZED: Only return existing database data without making external API calls
  app.get("/api/community/:id/comprehensive-data", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // Get the community from database
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      console.log(`📊 Fetching comprehensive data from database for community ${communityId}: ${community.name}`);

      // Check if this community is featured (for additional metadata)
      const [featuredRecord] = await db
        .select()
        .from(featuredCommunities)
        .where(
          and(
            eq(featuredCommunities.communityId, communityId),
            eq(featuredCommunities.isActive, true)
          )
        )
        .limit(1);
      
      // Process photos from database only - NO external API calls
      let normalizedPhotos = [];
      
      // Use existing database photos
      if (community.photos && Array.isArray(community.photos) && community.photos.length > 0) {
        console.log(`✅ Found ${community.photos.length} photos in database`);
        normalizedPhotos = community.photos.map(photo => {
          // Handle various photo formats in database
          if (typeof photo === 'string') {
            // If it's already a full URL, use it with proxy
            if (photo.includes('http')) {
              return `/api/image-proxy?url=${encodeURIComponent(photo)}`;
            }
            return photo;
          }
          if (typeof photo === 'object' && photo !== null) {
            const url = photo.url || photo.imageUrl || photo.src || '';
            if (url && url.includes('http')) {
              return `/api/image-proxy?url=${encodeURIComponent(url)}`;
            }
          }
          return '';
        }).filter(url => url && url.trim() !== '');
      }

      // Build market data from existing database fields only
      const marketData = {
        pricing: community.priceRange || community.rentPerMonth || null,
        website: community.website || null,
        phone: community.phone || null,
        email: community.email || null,
        availability: community.availabilityStatus || null,
        description: community.description || null,
        managementCompany: community.managementCompany || null,
        virtualTourUrl: community.virtualTourUrl || null
      };

      // Build analysis data from existing database fields
      const analysis = {
        rating: community.rating || null,
        numberOfReviews: community.numberOfReviews || null,
        careTypes: community.careTypes || [],
        amenities: community.amenities || [],
        features: community.features || [],
        services: community.services || [],
        totalUnits: community.totalUnits || null,
        occupancy: community.occupancy || null
      };

      // Return comprehensive data using only database information
      res.json({
        communityId,
        name: community.name,
        address: community.address,
        city: community.city,
        state: community.state,
        photos: normalizedPhotos,
        marketData,
        analysis,
        lastUpdated: community.lastSuccessfulEnrichment || community.lastUpdated || new Date().toISOString(),
        dataSource: 'Database Cache - No External API Calls'
      });

    } catch (error) {
      console.error("Error fetching comprehensive data:", error);
      res.status(500).json({ 
        error: "Failed to fetch comprehensive data",
        message: error.message,
        communityId: req.params.id
      });
    }
  });

  // Get community by SEO-friendly slug URL: /api/communities/by-slug/:state/:city/:slug
  app.get("/api/communities/by-slug/:state/:city/:slug", async (req, res) => {
    const { state, city, slug } = req.params;
    
    try {
      // 1. Fast O(1) indexed lookup using dedicated slug columns (primary path)
      let [community] = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.stateSlug, state),
            eq(communities.citySlug, city),
            eq(communities.slug, slug)
          )
        )
        .limit(1);
      
      // 2. Fallback: lower() fuzzy match for rows not yet backfilled with slugs
      if (!community) {
        const stateLower = state.replace(/-/g, ' ').toLowerCase();
        const cityLower = city.replace(/-/g, ' ').toLowerCase();

        let [exactMatch] = await db
          .select()
          .from(communities)
          .where(
            and(
              sql`lower(${communities.state}) = ${stateLower}`,
              sql`lower(${communities.city}) = ${cityLower}`,
              sql`lower(${communities.name}) = ${slug.replace(/-/g, ' ').toLowerCase()}`
            )
          )
          .limit(1);

        if (!exactMatch) {
          const results = await db
            .select()
            .from(communities)
            .where(
              and(
                sql`lower(${communities.state}) = ${stateLower}`,
                sql`lower(${communities.city}) = ${cityLower}`
              )
            );
          exactMatch = results.find(c => generateCommunitySlug(c) === slug) || results[0];
        }
        community = exactMatch;
      }

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get existing enrichment data from cache (skip for now - table doesn't exist yet)
      let enrichedData = null;

      // Get reviews  
      const communityReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.communityId, community.id))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Return all data for server-side rendering
      res.json({
        ...community,
        reviews: communityReviews,
        competitiveAnalysis: enrichedData?.competitiveAnalysis || null,
        webEnrichment: enrichedData?.webEnrichment || null,
        realTimeData: enrichedData?.realTimeData || null,
        isClaimed: false
      });
    } catch (error) {
      console.error("Error fetching community by slug:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Get single community by ID with Perplexity real-time enrichment - MUST BE LAST
  app.get("/api/communities/:id", async (req, res) => {
    try {
      // Skip if this is actually a named route like "markers" or "stats"
      if (['markers', 'stats', 'count', 'trending', 'hud-featured', 'coastal'].includes(req.params.id)) {
        return res.status(404).json({ error: "Route not found" });
      }
      
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      // Check if this is a Mexico community ID (99001-99006)
      if (communityId >= 99001 && communityId <= 99006) {
        const mexicoCommunities = [
          {
            id: 99001,
            name: 'Casa de la Tercera Edad - Tijuana',
            city: 'Tijuana',
            state: 'MX',
            address: 'Zona Rio, Tijuana, Mexico',
            rating: '4.5',
            rentPerMonth: '$1,800',
            careTypes: ['Assisted Living', 'Memory Care'],
            description: 'Premier senior care facility near US border with bilingual staff and American-style amenities',
            phone: '+52 664-123-4567',
            amenitiesCount: 8,
            latitude: 32.5149,
            longitude: -117.0382,
            photos: ['/api/placeholder/400/300'],
            features: ['Bilingual Staff', 'US Medicare Accepted', '24/7 Medical Care', 'American Food Options'],
            reviewCount: 45,
            hudPropertyId: null
          },
          {
            id: 99002,
            name: 'Residencia Dorada - Guadalajara',
            city: 'Guadalajara',
            state: 'MX',
            address: 'Providencia, Guadalajara, Mexico',
            rating: '4.6',
            rentPerMonth: '$1,500',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Luxury retirement community in the heart of Guadalajara with American expat community',
            phone: '+52 33-1234-5678',
            amenitiesCount: 10,
            latitude: 20.6597,
            longitude: -103.3496,
            photos: ['/api/placeholder/400/300'],
            features: ['English Speaking Staff', 'American Style Apartments', 'Expat Community', 'Medical Tourism Support'],
            reviewCount: 38,
            hudPropertyId: null
          },
          {
            id: 99003,
            name: 'Paradise Senior Living - Puerto Vallarta',
            city: 'Puerto Vallarta',
            state: 'MX',
            address: 'Marina Vallarta, Puerto Vallarta, Mexico',
            rating: '4.7',
            rentPerMonth: '$2,200',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Beachfront senior community with ocean views and American expat services',
            phone: '+52 322-234-5678',
            amenitiesCount: 12,
            latitude: 20.6534,
            longitude: -105.2253,
            photos: ['/api/placeholder/400/300'],
            features: ['Ocean Views', 'Beach Access', 'US TV Channels', 'American Healthcare Partners'],
            reviewCount: 52,
            hudPropertyId: null
          },
          {
            id: 99004,
            name: 'Cancun Senior Resort',
            city: 'Cancun',
            state: 'MX',
            address: 'Hotel Zone, Cancun, Mexico',
            rating: '4.4',
            rentPerMonth: '$2,500',
            careTypes: ['Independent Living', 'Luxury Care'],
            description: 'Resort-style senior living in tropical paradise with full medical support',
            phone: '+52 998-345-6789',
            amenitiesCount: 15,
            latitude: 21.1619,
            longitude: -86.8515,
            photos: ['/api/placeholder/400/300'],
            features: ['Resort Amenities', 'International Cuisine', 'Medical Concierge', 'Airport Transport'],
            reviewCount: 41,
            hudPropertyId: null
          },
          {
            id: 99005,
            name: 'San Miguel Senior Haven',
            city: 'San Miguel de Allende',
            state: 'MX',
            address: 'Centro, San Miguel de Allende, Mexico',
            rating: '4.8',
            rentPerMonth: '$1,600',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Colonial charm meets modern care in UNESCO World Heritage city',
            phone: '+52 415-456-7890',
            amenitiesCount: 11,
            latitude: 20.9144,
            longitude: -100.7452,
            photos: ['/api/placeholder/400/300'],
            features: ['Historic Location', 'Art Programs', 'Expat Community', 'Cultural Activities'],
            reviewCount: 63,
            hudPropertyId: null
          },
          {
            id: 99006,
            name: 'Playa del Carmen Senior Paradise',
            city: 'Playa del Carmen',
            state: 'MX',
            address: 'Playacar, Playa del Carmen, Mexico',
            rating: '4.5',
            rentPerMonth: '$2,000',
            careTypes: ['Independent Living', 'Assisted Living'],
            description: 'Caribbean senior living with American amenities and healthcare',
            phone: '+52 984-567-8901',
            amenitiesCount: 13,
            latitude: 20.6296,
            longitude: -87.0739,
            photos: ['/api/placeholder/400/300'],
            features: ['Beach Club Access', 'Golf Course', 'US Board Certified Doctors', 'Shopping Shuttle'],
            reviewCount: 48,
            hudPropertyId: null
          }
        ];
        
        const community = mexicoCommunities.find(c => c.id === communityId);
        if (community) {
          return res.json({...community, reviews: []});
        }
      }
      
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // DISABLED: On-demand enrichment to prevent duplicate Perplexity API calls
      // The community is already enriched via CommunityPhotoEnrichment.enrichCommunityIfNeeded below
      // onDemandEnrichmentService.onCommunityView(communityId).catch(error => {
      //   console.error(`Failed to trigger enrichment for community ${communityId}:`, error);
      // });

      // Get reviews for the community
      const communityReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.communityId, communityId))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Realtime Perplexity enrichment is disabled — serve enriched content from DB column
      console.log(`📖 Community detail GET for ${community.name}: serving data from database`);
      const realTimeData = {
        lastUpdated: new Date().toISOString(),
        currentAvailability: null as string | null,
        recentNews: [] as string[],
        currentPricing: null as string | null,
        waitlistStatus: null as string | null,
        communityHighlights: [] as string[],
        upcomingEvents: [] as string[],
        staffUpdates: [] as string[],
        sources: [] as string[],
        photos: [] as string[]
      };

      // Filter photos through enrichment service to remove non-photo content
      const enrichedCommunity = await CommunityPhotoEnrichment.enrichCommunityIfNeeded(community);

      // Build comprehensiveData from the persisted enrichedContent column so the
      // frontend can still read structured enrichment data without Perplexity.
      const enrichedCol = (community as any).enrichedContent;
      const comprehensiveData = enrichedCol
        ? {
            rawPerplexityContent: enrichedCol.content || null,
            photos: (enrichedCommunity.photos && enrichedCommunity.photos.length > 0)
              ? enrichedCommunity.photos
              : [],
            sources: enrichedCol.metadata?.sources?.map((s: any) => s.url) || [],
            marketData: {
              description: enrichedCol.content || null,
              website: community.website || null,
              phone: community.phone || null,
            },
            source: 'database-content' as const,
          }
        : null;

      // Skip claimed community check for now - table doesn't exist

      res.json({
        ...enrichedCommunity,
        reviews: communityReviews,
        isClaimed: false,
        claimInfo: null,
        realTimeData: realTimeData,
        comprehensiveData,
      });

      // Fire-and-forget: record community detail view for conversion funnel
      const viewUserId = (req as any).user?.id || null;
      const sessionId = req.headers['x-session-id'] as string || null;
      db.insert(analyticsEvents).values({
        communityId,
        userId: viewUserId,
        sessionId: sessionId || `anon-${Date.now()}`,
        eventType: 'page_view',
        eventCategory: 'community',
        eventAction: 'view_community',
        eventLabel: community.name,
        pageUrl: req.headers.referer || `/communities/${communityId}`,
        pageTitle: community.name,
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || '',
        timestamp: new Date(),
      } as any).catch(() => {});
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  // Community contribution endpoint
  app.post("/api/community/contribute", async (req, res) => {
    try {
      const {
        communityId,
        communityName,
        contributorName,
        contributorEmail,
        relationshipToCommunity,
        priceInfo,
        priceSource,
        availabilityInfo,
        incentivesInfo,
        additionalNotes
      } = req.body;

      // Validate required fields
      if (!communityId || !contributorEmail || !relationshipToCommunity) {
        return res.status(400).json({ 
          error: "Missing required fields: communityId, contributorEmail, and relationshipToCommunity are required" 
        });
      }

      // Store contribution in audit logs for now (until we create dedicated table)
      await db.insert(auditLogs).values({
        userEmail: contributorEmail, // Using email as user identifier
        action: 'community_contribution',
        entityType: 'communities',
        entityId: communityId.toString(),
        changes: {
          contributorName,
          contributorEmail,
          relationshipToCommunity,
          priceInfo,
          priceSource,
          availabilityInfo,
          incentivesInfo,
          additionalNotes,
          photos: req.body.photos || [],
          submittedAt: new Date().toISOString()
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });

      // Send notification to admin (placeholder for actual implementation)
      console.log(`New community contribution received for ${communityName} (ID: ${communityId}) from ${contributorEmail}`);

      res.json({ 
        success: true,
        message: "Thank you for your contribution! It will be reviewed and added to the community listing soon."
      });
    } catch (error) {
      console.error("Error processing community contribution:", error);
      res.status(500).json({ error: "Failed to process contribution" });
    }
  });

  // Perplexity AI Community Insights endpoint
  app.post("/api/perplexity/community-insights", async (_req, res) => {
    res.status(503).json({ status: "disabled", message: "AI insights temporarily unavailable" });
  });

  // Create new community (admin only)
  app.post("/api/communities", requireAuth, isAdmin, async (req, res) => {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);

      // Prevent non-senior-living properties from entering the database
      const { isSeniorLivingFacility } = await import('./global-discovery');
      if (!isSeniorLivingFacility(validatedData.name, validatedData.careTypes || [])) {
        return res.status(422).json({
          error: 'Non-senior-living facility rejected',
          message: `"${validatedData.name}" does not appear to be a senior living facility. ` +
            'Add a senior-specific care type or update the name to include a senior indicator.'
        });
      }
      
      const [newCommunity] = await db
        .insert(communities)
        .values(validatedData)
        .returning();

      // Send internal notification
      try {
        await internalNotifications.notifyCommunityAdded({
          communityId: newCommunity.id,
          communityName: newCommunity.name,
          city: newCommunity.city,
          state: newCommunity.state,
          type: newCommunity.type,
          services: newCommunity.services || [],
          addedBy: req.user?.email || 'system'
        });
      } catch (notificationError) {
        console.error('Error sending internal community notification:', notificationError);
        // Don't fail the community creation if internal notification fails
      }

      res.status(201).json(newCommunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating community:", error);
      res.status(500).json({ error: "Failed to create community" });
    }
  });

  // Update community contact information (owner only)
  app.put("/api/communities/:id", requireAuth, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      // First check if this user owns/claimed this community
      const [claimedCommunity] = await db
        .select()
        .from(claimedCommunities)
        .where(
          and(
            eq(claimedCommunities.communityId, communityId),
            eq(claimedCommunities.userId, userId)
          )
        );
      
      // Check if user is admin
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'super_admin';
      
      if (!claimedCommunity && !isAdminUser) {
        return res.status(403).json({ error: "You don't have permission to update this community" });
      }
      
      // Only allow certain fields to be updated for non-admin users
      const allowedFields = isAdminUser ? req.body : {
        name: req.body.name,
        description: req.body.description,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode
      };

      const [updated] = await db
        .update(communities)
        .set({
          ...allowedFields,
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

  // Update community (admin only - full access)
  app.put("/api/communities/:id/admin", requireAuth, isAdmin, async (req, res) => {
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
      
      // Get 26 communities (25 + 1 for "View All" card)
      const hudFeatured = await db
        .select()
        .from(communities)
        .where(
          and(
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 1000`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(26);

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
            sql`CAST(${communities.rating} AS DECIMAL) >= 4.5`,
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

  // Verify service endpoint - AI enrichment disabled
  app.post('/api/verify-service', async (_req, res) => {
    res.status(503).json({ status: "disabled", message: "AI insights temporarily unavailable" });
  });


}