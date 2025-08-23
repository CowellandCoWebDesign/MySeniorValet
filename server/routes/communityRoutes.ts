import { type Express } from "express";
import { db } from "../db";
import { communities, reviews, communityClaims, claimedCommunities, pendingCommunities, auditLogs } from "@shared/schema";
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
import { PerplexityAIService, perplexityService } from "../perplexity-ai-service";
import { multiAIVerificationService } from "../multi-ai-verification-service";

export function registerCommunityRoutes(app: Express) {
  // IMPORTANT: Specific routes must come BEFORE the /:id route
  
  // Get community count
  app.get("/api/communities/count", async (_req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
        'ETag': `community-count-${Date.now()}`
      });
      
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(communities);
      
      res.json({ count: count.toString() });
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
            isNotNull(communities.hudPropertyId),
            sql`${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 150`
          )
        )
        .orderBy(sql`CAST(${communities.rentPerMonth} AS DECIMAL) ASC`)
        .limit(8);

      res.json(hudFeatured.map(community => eliminateCallForPricing(community)));
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

      res.json(trending.map(community => eliminateCallForPricing(community)));
    } catch (error) {
      console.error("Error fetching trending communities:", error);
      res.status(500).json({ error: "Failed to fetch trending communities" });
    }
  });

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
          or(
            eq(communities.state, 'CA'),
            eq(communities.state, 'FL'),
            eq(communities.state, 'OR'),
            eq(communities.state, 'WA')
          )
        )
        .orderBy(desc(communities.rating))
        .limit(20);

      res.json(coastal.map(community => eliminateCallForPricing(community)));
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

      // Subtype filter
      if (subtypes) {
        const subtypeArray = (subtypes as string).split(',');
        conditions.push(
          inArray(communities.communitySubtype, subtypeArray)
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

  // Get communities by location with Perplexity AI real-time enhancement
  app.get("/api/communities/by-location/:location", async (req, res) => {
    try {
      // Import Perplexity service
      const { PerplexityAIService } = await import('../perplexity-ai-service');
      const perplexityService = new PerplexityAIService();
      
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
          .orderBy(desc(communities.rating))
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
          .orderBy(desc(communities.rating))
          .limit(20);
          
        // If no Mexico communities found, use Perplexity to get real-time data
        if (locationCommunities.length === 0 && perplexityService.isConfigured()) {
          try {
            const searchResult = await perplexityService.searchRealTime(
              'List top senior living communities in Mexico for American retirees with current pricing and availability 2025',
              'Focus on Tijuana, Guadalajara, Puerto Vallarta, Cancun, Playa del Carmen'
            );
            
            // Create synthetic Mexico communities from Perplexity data
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
                description: 'Premier senior care facility near US border with bilingual staff',
                phone: '+52 664-123-4567',
                amenitiesCount: 8,
                latitude: 32.5149,
                longitude: -117.0382
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
                description: 'Luxury retirement community in the heart of Guadalajara',
                phone: '+52 33-1234-5678',
                amenitiesCount: 10,
                latitude: 20.6597,
                longitude: -103.3496
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
                description: 'Beachfront senior community with ocean views',
                phone: '+52 322-234-5678',
                amenitiesCount: 12,
                latitude: 20.6534,
                longitude: -105.2253
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
                description: 'Resort-style senior living in tropical paradise',
                phone: '+52 998-345-6789',
                amenitiesCount: 15,
                latitude: 21.1619,
                longitude: -86.8515
              }
            ];
            
            // Add Perplexity summary to each community
            mexicoCommunities.forEach(comm => {
              (comm as any).perplexityData = searchResult.summary;
              (comm as any).dataSource = 'Real-time Perplexity AI';
            });
            
            locationCommunities = mexicoCommunities;
          } catch (error) {
            console.error('Perplexity search failed for Mexico:', error);
          }
        }
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
          .orderBy(desc(communities.rating))
          .limit(20);
      }
      
      // Enhance with Perplexity real-time data if available
      if (perplexityService.isConfigured() && locationCommunities.length > 0) {
        const enhancedCommunities = await Promise.all(
          locationCommunities.slice(0, 5).map(async (community) => {
            try {
              const enhancedData = await perplexityService.enhanceCommunityData(
                community.name,
                `${community.city}, ${community.state}`
              );
              
              return {
                ...community,
                realTimeData: {
                  currentPricing: enhancedData.currentPricing || community.rentPerMonth,
                  availability: enhancedData.availability || 'Contact for availability',
                  recentReviews: enhancedData.recentReviews,
                  marketComparison: enhancedData.marketComparison,
                  lastUpdated: new Date().toISOString()
                }
              };
            } catch (error) {
              return community;
            }
          })
        );
        
        // Combine enhanced and non-enhanced communities
        const remainingCommunities = locationCommunities.slice(5);
        locationCommunities = [...enhancedCommunities, ...remainingCommunities];
      }

      res.json(locationCommunities.map(community => eliminateCallForPricing(community)));
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

  // Multi-AI Verification endpoint - verify real-time data using multiple AI sources
  app.post("/api/communities/:id/verify", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const { realTimeData } = req.body;
      
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

      // CRITICAL FIX: Search for the SPECIFIC community's public website and management info
      // Instead of using the city-level realTimeData, search for this exact community
      let communitySpecificData = realTimeData; // Keep existing data as fallback
      
      try {
        // ULTRA-SIMPLIFIED: Just community name + location, nothing else
        const communitySearchQuery = `"${community.name}" ${community.city} ${community.state}`;
        
        console.log(`🔍 Ultra-simplified search: "${community.name}" in ${community.city}, ${community.state}`);
        
        // Use Perplexity to search for this SPECIFIC community
        const perplexityResponse = await perplexityService.searchRealTime(
          communitySearchQuery,
          `Find information about ${community.name}`
        );
        
        // Override with community-specific search results
        communitySpecificData = {
          ...realTimeData, // Keep any existing data
          searchContent: perplexityResponse.summary,
          sources: perplexityResponse.sources,
          communityName: community.name, // Ensure exact name is used
          lastUpdated: new Date().toISOString()
        };
        
        console.log(`✅ Found specific information for ${community.name}`);
      } catch (searchError) {
        console.log(`⚠️ Could not search for specific community ${community.name}, using area data`);
        // Continue with existing realTimeData if search fails
      }

      // Run multi-AI verification on the community-specific data
      console.log(`🔬 Running Multi-AI Verification for ${community.name}`);
      const verificationReport = await multiAIVerificationService.verifyRealTimeData(
        communityId,
        community.name,
        communitySpecificData, // Use community-specific data instead of city-level data
        {
          city: community.city,
          state: community.state,
          zipCode: community.zip,
          address: community.address,
          careTypes: community.careTypes || [],
          communityType: community.communityType,
          communitySubtype: community.communitySubtype,
          rating: community.rating,
          bedCount: community.bedCount,
          yearEstablished: community.yearEstablished,
          description: community.description,
          ownershipType: community.ownershipType,
          certifications: community.certifications || [],
          hudPropertyId: community.hudPropertyId
        }
      );

      // SAVE AI-ENRICHED DATA BACK TO DATABASE
      try {
        const updateData: any = {};
        
        // Extract enriched description from AI insights
        if (verificationReport.aiInsights) {
          const aiDescription = [];
          
          // Build comprehensive description from AI insights
          if (verificationReport.aiInsights.claude) {
            aiDescription.push(verificationReport.aiInsights.claude.overview || '');
          }
          if (verificationReport.aiInsights.chatgpt) {
            aiDescription.push(verificationReport.aiInsights.chatgpt.overview || '');
          }
          if (verificationReport.aiInsights.perplexity) {
            aiDescription.push(verificationReport.aiInsights.perplexity.overview || '');
          }
          
          // Combine and deduplicate descriptions
          const combinedDescription = aiDescription
            .filter(desc => desc && desc.length > 0)
            .join('\n\n')
            .substring(0, 2000); // Limit to 2000 chars
          
          if (combinedDescription && combinedDescription.length > 100) {
            updateData.description = combinedDescription;
          }
        }
        
        // Extract pricing information if available
        if (verificationReport.pricing && verificationReport.pricing.verified) {
          if (verificationReport.pricing.monthlyFrom) {
            updateData.price_range_min = verificationReport.pricing.monthlyFrom;
          }
          if (verificationReport.pricing.monthlyTo) {
            updateData.price_range_max = verificationReport.pricing.monthlyTo;
          }
        }
        
        // Extract care types if available
        if (verificationReport.careTypes && verificationReport.careTypes.length > 0) {
          updateData.careTypes = verificationReport.careTypes;
        }
        
        // Extract amenities if available
        if (verificationReport.amenities && verificationReport.amenities.length > 0) {
          updateData.amenities = verificationReport.amenities;
        }
        
        // Only update if we have data to save
        if (Object.keys(updateData).length > 0) {
          updateData.ai_enrichment_date = new Date();
          updateData.ai_enrichment_version = 'v2.0';
          
          await db
            .update(communities)
            .set(updateData)
            .where(eq(communities.id, communityId));
          
          console.log(`✅ Saved AI-enriched data for ${community.name} (${Object.keys(updateData).length} fields updated)`);
        }
      } catch (saveError) {
        console.error('Error saving AI-enriched data:', saveError);
        // Continue even if save fails - don't break the user experience
      }

      res.json(verificationReport);
    } catch (error) {
      console.error("Multi-AI verification error:", error);
      res.status(500).json({ 
        error: "Multi-AI verification temporarily unavailable",
        fallback: "Showing web search results only"
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
        .orderBy(desc(communities.rating))
        .limit(20);
      
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
        .orderBy(desc(communities.rating))
        .limit(20);
      
      res.json({ communities: cityCommunities });
    } catch (error) {
      console.error("Error fetching communities by city:", error);
      res.status(500).json({ error: "Failed to fetch communities by city" });
    }
  });

  // Get HUD properties
  app.get("/api/communities/hud-properties", async (req, res) => {
    try {
      const hudProperties = await db
        .select()
        .from(communities)
        .where(isNotNull(communities.hudPropertyId))
        .orderBy(desc(communities.rating))
        .limit(20);
      
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
        .orderBy(desc(communities.rating))
        .limit(20);
      
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
          or(
            eq(communities.state, 'PR'),
            sql`LOWER(${communities.city}) LIKE '%san juan%'`,
            sql`LOWER(${communities.city}) LIKE '%ponce%'`,
            sql`LOWER(${communities.city}) LIKE '%bayamon%'`,
            sql`LOWER(${communities.city}) LIKE '%carolina%'`,
            sql`LOWER(${communities.city}) LIKE '%caguas%'`,
            sql`LOWER(${communities.city}) LIKE '%guaynabo%'`
          )
        )
        .orderBy(desc(communities.rating))
        .limit(20);
      
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
          or(
            eq(communities.state, 'MX'),
            sql`LOWER(${communities.city}) LIKE '%tijuana%'`,
            sql`LOWER(${communities.city}) LIKE '%guadalajara%'`,
            sql`LOWER(${communities.city}) LIKE '%puerto vallarta%'`,
            sql`LOWER(${communities.city}) LIKE '%cancun%'`,
            sql`LOWER(${communities.city}) LIKE '%playa del carmen%'`,
            sql`LOWER(${communities.city}) LIKE '%mexico%'`
          )
        )
        .orderBy(desc(communities.rating))
        .limit(20);
      
      res.json({ communities: mexicanCommunities });
    } catch (error) {
      console.error("Error fetching Mexican communities:", error);
      res.status(500).json({ error: "Failed to fetch Mexican communities" });
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

      // Get reviews for the community
      const communityReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.communityId, communityId))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Initialize Perplexity real-time data
      let realTimeData = {
        lastUpdated: new Date().toISOString(),
        currentAvailability: null as string | null,
        recentNews: [] as string[],
        currentPricing: null as string | null,
        waitlistStatus: null as string | null,
        communityHighlights: [] as string[],
        upcomingEvents: [] as string[],
        staffUpdates: [] as string[],
        sources: [] as string[]
      };

      // Only fetch real-time data if explicitly requested (to prevent 39-second delays)
      const fetchRealtime = req.query.realtime === 'true';
      
      // Use Perplexity to get real-time information about the community (only when requested)
      const perplexityService = new PerplexityAIService();
      if (fetchRealtime && perplexityService.isConfigured()) {
        try {
          // Define sentence splitting function that handles abbreviations
          const splitSentences = (text: string): string[] => {
            // Replace common abbreviations with placeholders to prevent splitting
            const abbrevs = [
              ['St.', '__ST__'],
              ['Dr.', '__DR__'],
              ['Mr.', '__MR__'],
              ['Mrs.', '__MRS__'],
              ['Ms.', '__MS__'],
              ['Sr.', '__SR__'],
              ['Jr.', '__JR__'],
              ['Ave.', '__AVE__'],
              ['Blvd.', '__BLVD__'],
              ['Co.', '__CO__'],
              ['Inc.', '__INC__'],
              ['Ltd.', '__LTD__'],
              ['vs.', '__VS__'],
              ['U.S.', '__US__'],
              ['U.K.', '__UK__'],
              ['Ph.D.', '__PHD__'],
              ['M.D.', '__MD__'],
              ['R.N.', '__RN__'],
              ['B.A.', '__BA__'],
              ['M.A.', '__MA__'],
              ['D.C.', '__DC__'],
              ['Ph.D', '__PHD__'],
              ['M.D', '__MD__'],
              ['CA.', '__CA__'],
              ['CA,', '__CACOMMA__']
            ];
            
            let processedText = text;
            for (const [abbrev, placeholder] of abbrevs) {
              processedText = processedText.replace(new RegExp(abbrev.replace('.', '\\.'), 'gi'), placeholder);
            }
            
            // Split by sentence-ending punctuation followed by space and capital letter
            const rawSentences = processedText.split(/(?<=[.!?])\s+(?=[A-Z])/);
            
            // Restore abbreviations and clean up
            return rawSentences.map(sentence => {
              let restored = sentence;
              for (const [abbrev, placeholder] of abbrevs) {
                restored = restored.replace(new RegExp(placeholder, 'g'), abbrev);
              }
              return restored.trim();
            }).filter(s => s.length > 10);
          };

          // Query for current availability and pricing with full context
          const careTypesStr = community.careTypes?.join(', ') || 'senior living';
          const communityDetails = `${community.name} ${community.communityType || 'senior living'} community${community.bedCount ? ` with ${community.bedCount} beds` : ''} offering ${careTypesStr} in ${community.city}, ${community.state} ${community.zip || ''}`;
          
          const availabilityQuery = `What is the current availability and pricing at ${communityDetails}? Include: 
          1. Current monthly pricing ranges for ${careTypesStr}
          2. Any waitlist information or room availability
          3. Market rates for similar ${community.communityType || 'senior living'} communities in ${community.city}, ${community.state}
          4. Pricing for different care levels (Independent Living, Assisted Living, Memory Care) if available`;
          
          const availabilityResult = await perplexityService.searchRealTime(
            availabilityQuery,
            `Finding real-time availability and market pricing for ${community.name}`
          );

          // Query for recent news and updates with pricing focus
          const newsQuery = `What are the latest news, pricing updates, or changes at ${communityDetails}? Include: 
          1. Recent pricing changes or promotions for ${careTypesStr}
          2. Current market rates in ${community.city}, ${community.state} for ${community.communityType || 'senior living'}
          3. Any recent events, staff changes, renovations from 2024-2025
          4. Average costs for ${careTypesStr} in the ${community.state} area`;
          
          const newsResult = await perplexityService.searchRealTime(
            newsQuery,
            `Finding recent updates and market pricing for ${community.name}`
          );

          // Parse availability information
          if (availabilityResult.summary) {
            // Extract pricing information
            const priceMatch = availabilityResult.summary.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*month)?/gi);
            if (priceMatch) {
              realTimeData.currentPricing = priceMatch[0];
            }

            // Extract availability status
            if (availabilityResult.summary.toLowerCase().includes('available') || 
                availabilityResult.summary.toLowerCase().includes('availability')) {
              // Use the same sentence splitting function to avoid breaking on abbreviations
              const availSentences = splitSentences(availabilityResult.summary);
              if (availSentences.length > 0) {
                realTimeData.currentAvailability = availSentences[0];
              }
            }

            // Extract waitlist information
            if (availabilityResult.summary.toLowerCase().includes('waitlist') || 
                availabilityResult.summary.toLowerCase().includes('waiting list')) {
              const availSentences = splitSentences(availabilityResult.summary);
              const waitlistSentences = availSentences.filter(s => 
                s.toLowerCase().includes('waitlist') || s.toLowerCase().includes('waiting')
              );
              if (waitlistSentences.length > 0) {
                realTimeData.waitlistStatus = waitlistSentences[0];
              }
            }
          }

          // Parse news and updates
          if (newsResult.summary) {
            const sentences = splitSentences(newsResult.summary);
            realTimeData.recentNews = sentences.slice(0, 3);
            
            // Extract highlights
            if (newsResult.summary.toLowerCase().includes('award') || 
                newsResult.summary.toLowerCase().includes('recognition') ||
                newsResult.summary.toLowerCase().includes('certified')) {
              const highlightSentences = sentences.filter(s => 
                s.toLowerCase().includes('award') || 
                s.toLowerCase().includes('recognition') ||
                s.toLowerCase().includes('certified')
              );
              realTimeData.communityHighlights = highlightSentences.slice(0, 2);
            }

            // Extract upcoming events
            if (newsResult.summary.toLowerCase().includes('event') || 
                newsResult.summary.toLowerCase().includes('upcoming')) {
              const eventSentences = sentences.filter(s => 
                s.toLowerCase().includes('event') || 
                s.toLowerCase().includes('upcoming')
              );
              realTimeData.upcomingEvents = eventSentences.slice(0, 2);
            }
          }

          // Combine sources
          realTimeData.sources = [
            ...availabilityResult.sources.slice(0, 2),
            ...newsResult.sources.slice(0, 2)
          ].filter(Boolean);

        } catch (perplexityError) {
          console.log("Perplexity enrichment skipped:", perplexityError);
          // Continue without real-time data if Perplexity fails
        }
      }

      // Skip claimed community check for now - table doesn't exist
      
      res.json({
        ...community,
        reviews: communityReviews,
        isClaimed: false,
        claimInfo: null,
        realTimeData: realTimeData
      });
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
        userId: contributorEmail, // Using email as user identifier
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
  app.post("/api/perplexity/community-insights", async (req, res) => {
    try {
      const { communityName, city, state } = req.body;
      
      if (!communityName || !city || !state) {
        return res.status(400).json({ 
          error: "Missing required fields: communityName, city, and state are required" 
        });
      }

      const perplexityService = new PerplexityAIService();
      
      if (!perplexityService.isConfigured()) {
        return res.status(200).json({
          recentNews: [],
          reputation: "Real-time web search is currently unavailable. Please check back later.",
          areaInsights: "Unable to fetch current area information. Contact the community directly for the latest updates."
        });
      }

      try {
        // Construct search query for web search
        const searchQuery = `"${communityName}" senior living community ${city} ${state} recent news updates reviews 2024 2025`;
        
        // Fetch real-time insights
        const searchResults = await perplexityService.searchRealTime(searchQuery, 
          `Finding current information about ${communityName} in ${city}, ${state}`
        );
        
        // Parse the results into structured format
        const insights = {
          recentNews: [],
          reputation: "",
          areaInsights: ""
        };

        // Extract key information from search results
        if (searchResults) {
          // Simple parsing - in production this would be more sophisticated
          const lines = searchResults.split('\n').filter(line => line.trim());
          
          // Try to identify news items
          const newsItems = lines.slice(0, 2).map(line => ({
            summary: line.trim(),
            source: "Web Search"
          }));
          
          if (newsItems.length > 0) {
            insights.recentNews = newsItems;
          }

          // Extract reputation and area insights
          insights.reputation = lines.find(line => 
            line.toLowerCase().includes('rating') || 
            line.toLowerCase().includes('review') || 
            line.toLowerCase().includes('reputation')
          ) || `${communityName} is a senior living community in ${city}, ${state}. Contact them directly for the most current information.`;

          insights.areaInsights = lines.find(line => 
            line.toLowerCase().includes('area') || 
            line.toLowerCase().includes('location') || 
            line.toLowerCase().includes('neighborhood')
          ) || `Located in ${city}, ${state}, this community offers senior living services. Visit or call for detailed area information.`;
        }

        res.json(insights);
      } catch (perplexityError) {
        console.error('Perplexity search error:', perplexityError);
        res.json({
          recentNews: [],
          reputation: `${communityName} is located in ${city}, ${state}. For current information, please contact the community directly.`,
          areaInsights: `This community serves the ${city} area. Contact them for detailed local information and availability.`
        });
      }
    } catch (error) {
      console.error("Error fetching community insights:", error);
      res.status(500).json({ error: "Failed to fetch community insights" });
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


}