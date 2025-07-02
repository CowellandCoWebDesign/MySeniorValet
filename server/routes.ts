import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchCommunitySchema, insertCommunitySchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { aiRecommendationEngine, RecommendationRequest } from "./ai-recommendations";
import { ComprehensiveScraper } from "./scraper";
import { licensingScraper } from "./licensing-scraper";
import fs from 'fs';
import path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ===============================
  // COMPLIANCE MIDDLEWARE - APPLIED FIRST
  // ===============================

  // Filter validation middleware for non-discrimination compliance
  const validateSearchFilters = (req: any, res: any, next: any) => {
    const allowedFilters = [
      'location', 'careType', 'budget', 'availability', 
      'amenities', 'distance', 'minRating'
    ];
    
    // Check for prohibited filter keys that could enable discrimination
    const prohibitedFilters = [
      'religion', 'ethnicity', 'race', 'gender', 'sexual_orientation',
      'marital_status', 'national_origin', 'disability_status'
    ];

    const queryKeys = Object.keys(req.query);
    const bodyKeys = req.body ? Object.keys(req.body) : [];
    const allKeys = [...queryKeys, ...bodyKeys];

    const hasProhibitedFilters = allKeys.some(key => 
      prohibitedFilters.includes(key.toLowerCase())
    );

    const hasUnsupportedFilters = allKeys.some(key => 
      !allowedFilters.includes(key)
    );

    if (hasProhibitedFilters) {
      return res.status(400).json({
        error: 'Prohibited filter detected',
        message: 'Filters based on protected characteristics are not permitted',
        code: 'DISCRIMINATION_FILTER_BLOCKED'
      });
    }

    if (hasUnsupportedFilters) {
      const unsupported = allKeys.filter(key => !allowedFilters.includes(key));
      return res.status(400).json({
        error: 'Unsupported filter keys',
        message: `The following filters are not supported: ${unsupported.join(', ')}`,
        supportedFilters: allowedFilters,
        code: 'UNSUPPORTED_FILTER'
      });
    }

    next();
  };

  // Apply filter validation to search endpoints
  app.use('/api/communities/search', validateSearchFilters);
  app.use('/api/recommend', validateSearchFilters);

  // Search communities - NORTHERN CALIFORNIA FOCUSED ALGORITHM (MUST BE FIRST)
  app.get("/api/communities/search", async (req, res) => {
    try {
      // Parse and validate search parameters
      const searchParams = searchCommunitySchema.parse(req.query);
      
      // NORTHERN CALIFORNIA MARKET FOCUS: Prioritize Bay Area + Redding
      let communities;
      
      const norcalCities = ['redding', 'san francisco', 'oakland', 'san jose', 'fremont', 'sacramento', 'santa clara', 'sunnyvale', 'berkeley', 'concord', 'antioch', 'richmond', 'hayward', 'santa rosa', 'vallejo', 'fairfield', 'walnut creek', 'livermore', 'san mateo', 'daly city'];
      
      if (!searchParams.location) {
        // Default search - get all Northern California communities
        communities = await storage.searchCommunities({
          ...searchParams,
          location: "CA"
        });
      } else if (norcalCities.some(city => searchParams.location!.toLowerCase().includes(city))) {
        // Searching for a Northern California city
        communities = await storage.searchCommunities(searchParams);
      } else {
        // User searching outside NorCal - use their search but prioritize CA
        communities = await storage.searchCommunities({
          ...searchParams,
          location: searchParams.location.includes('CA') ? searchParams.location : `${searchParams.location}, CA`
        });
      }
      
      // NORTHERN CALIFORNIA ALGORITHM: Sort by market relevance
      const sortedCommunities = communities.sort((a, b) => {
        // Priority 1: Bay Area cities (tech hub, highest demand)
        const bayAreaCities = ['san francisco', 'oakland', 'san jose', 'fremont', 'santa clara', 'sunnyvale', 'berkeley', 'san mateo', 'daly city'];
        const aIsBayArea = bayAreaCities.some(city => a.city.toLowerCase().includes(city));
        const bIsBayArea = bayAreaCities.some(city => b.city.toLowerCase().includes(city));
        
        if (aIsBayArea && !bIsBayArea) return -1;
        if (!aIsBayArea && bIsBayArea) return 1;
        
        // Priority 2: Redding (our original market)
        const aIsRedding = a.city.toLowerCase() === 'redding';
        const bIsRedding = b.city.toLowerCase() === 'redding';
        
        if (aIsRedding && !bIsRedding) return -1;
        if (!aIsRedding && bIsRedding) return 1;
        
        // Then prioritize by availability
        if (a.availabilityStatus === 'Available Now' && b.availabilityStatus !== 'Available Now') return -1;
        if (a.availabilityStatus !== 'Available Now' && b.availabilityStatus === 'Available Now') return 1;
        
        // Then by transparency score (claimed communities with websites)
        const aTransparency = (a.isClaimed ? 1 : 0) + (a.website ? 1 : 0);
        const bTransparency = (b.isClaimed ? 1 : 0) + (b.website ? 1 : 0);
        
        return bTransparency - aTransparency;
      });
      
      res.json(sortedCommunities);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Search validation error:", error.errors);
        res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: error.errors 
        });
      } else {
        console.error("Search error:", error);
        res.status(500).json({ message: "Failed to search communities" });
      }
    }
  });

  // Get all communities
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  // Get similar communities (specific route before :id)
  app.get("/api/communities/similar/:id", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const targetCommunity = await storage.getCommunity(communityId);
      if (!targetCommunity) {
        return res.status(404).json({ message: "Community not found" });
      }

      const allCommunities = await storage.getAllCommunities();
      
      // Find similar communities based on care types, location, and price range
      const similarCommunities = allCommunities
        .filter(community => community.id !== communityId)
        .filter(community => {
          // Same state
          if (community.state !== targetCommunity.state) return false;
          
          // Overlapping care types
          const hasOverlappingCareTypes = community.careTypes.some(type => 
            targetCommunity.careTypes.includes(type)
          );
          if (!hasOverlappingCareTypes) return false;
          
          // Similar price range (within 50% difference)
          if (community.priceRange && targetCommunity.priceRange) {
            const targetMidPrice = (targetCommunity.priceRange.min + targetCommunity.priceRange.max) / 2;
            const communityMidPrice = (community.priceRange.min + community.priceRange.max) / 2;
            const priceDiff = Math.abs(targetMidPrice - communityMidPrice) / targetMidPrice;
            if (priceDiff > 0.5) return false;
          }
          
          return true;
        })
        .slice(0, 6); // Return up to 6 similar communities
      
      res.json(similarCommunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch similar communities" });
    }
  });

  // Get individual community by ID (must be last among community routes)
  app.get("/api/communities/:id", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }
      
      const community = await storage.getCommunity(communityId);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      
      res.json(community);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });



  // Create community
  app.post("/api/communities", async (req, res) => {
    try {
      const communityData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(communityData);
      res.status(201).json(community);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid community data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create community" });
      }
    }
  });

  // Update community
  app.patch("/api/communities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const updates = insertCommunitySchema.partial().parse(req.body);
      const community = await storage.updateCommunity(id, updates);
      
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      res.json(community);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update community" });
      }
    }
  });

  // Delete community
  app.delete("/api/communities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const deleted = await storage.deleteCommunity(id);
      if (!deleted) {
        return res.status(404).json({ message: "Community not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete community" });
    }
  });

  // Get inspections for a community
  app.get("/api/communities/:id/inspections", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const inspections = await storage.getInspectionsByCommunity(id);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  // Claim community endpoint
  app.post("/api/communities/:id/claim", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const community = await storage.updateCommunity(id, { isClaimed: true });
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      res.json({ message: "Community claimed successfully", community });
    } catch (error) {
      res.status(500).json({ message: "Failed to claim community" });
    }
  });

  // Get reviews for a community
  app.get("/api/communities/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const reviews = await storage.getReviewsByCommunity(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Create a new review
  app.post("/api/communities/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      // For now, we'll use a mock user ID. In a real app, this would come from authentication
      const mockUserId = 1;

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        communityId: id,
        userId: mockUserId
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid review data", errors: error.errors });
      } else {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  });

  // Update a review
  app.put("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const updates = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(id, updates);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Failed to update review" });
      }
    }
  });

  // Delete a review
  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const deleted = await storage.deleteReview(id);
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Mark review as helpful/not helpful
  app.post("/api/reviews/:id/helpful", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const { isHelpful } = req.body;
      if (typeof isHelpful !== 'boolean') {
        return res.status(400).json({ message: "isHelpful must be a boolean" });
      }

      // For now, we'll use a mock user ID. In a real app, this would come from authentication
      const mockUserId = 1;

      await storage.markReviewHelpful(id, mockUserId, isHelpful);
      res.json({ message: "Review helpfulness updated" });
    } catch (error) {
      console.error("Error updating review helpfulness:", error);
      res.status(500).json({ message: "Failed to update review helpfulness" });
    }
  });

  // Get user's reviews
  app.get("/api/users/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const reviews = await storage.getReviewsByUser(id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  // Moderate a review (admin only - for future implementation)
  app.patch("/api/reviews/:id/moderate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }

      const { status, notes } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const review = await storage.moderateReview(id, status, notes);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json(review);
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });

  // AI-Powered Recommendation Engine
  app.post("/api/recommendations", async (req, res) => {
    try {
      const requestSchema = z.object({
        careNeeds: z.array(z.string()),
        budget: z.object({
          min: z.number(),
          max: z.number()
        }),
        location: z.object({
          city: z.string().optional(),
          state: z.string().optional(),
          radius: z.number().optional()
        }),
        preferences: z.object({
          communitySize: z.enum(["small", "medium", "large"]).optional(),
          amenityPriorities: z.array(z.string()).optional(),
          careLevel: z.enum(["Independent Living", "Assisted Living", "Memory Care", "Skilled Nursing"]).optional(),
          medicalRestrictions: z.array(z.string()).optional()
        }),
        familyPriorities: z.array(z.string()).optional()
      });

      const request: RecommendationRequest = requestSchema.parse(req.body);
      
      // Get communities that match basic criteria
      let communities = await storage.getAllCommunities();
      
      // Filter by location if specified
      if (request.location.city || request.location.state) {
        communities = communities.filter(c => {
          if (request.location.city && !c.city.toLowerCase().includes(request.location.city.toLowerCase())) {
            return false;
          }
          if (request.location.state && !c.state.toLowerCase().includes(request.location.state.toLowerCase())) {
            return false;
          }
          return true;
        });
      }

      // Get AI-powered recommendations
      const recommendations = await aiRecommendationEngine.getPersonalizedRecommendations(request, communities);
      
      res.json({
        recommendations,
        totalCommunities: communities.length,
        requestId: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        disclaimer: "This ranking is informational. TrueView receives no referral fees and is not a licensed placement agency. Verify suitability directly with each community."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid recommendation request", errors: error.errors });
      } else {
        console.error("Error generating recommendations:", error);
        res.status(500).json({ message: "Failed to generate recommendations" });
      }
    }
  });

  // Community Comparison Tool
  app.post("/api/communities/compare", async (req, res) => {
    try {
      const { communityIds } = req.body;
      
      if (!Array.isArray(communityIds) || communityIds.length < 2 || communityIds.length > 5) {
        return res.status(400).json({ message: "Please provide 2-5 community IDs for comparison" });
      }

      // Fetch communities
      const communities = await Promise.all(
        communityIds.map((id: number) => storage.getCommunity(id))
      );

      // Filter out any null results
      const validCommunities = communities.filter(c => c !== undefined);
      
      if (validCommunities.length < 2) {
        return res.status(404).json({ message: "Some communities not found" });
      }

      // Generate AI comparison insights
      const comparisonInsights = await aiRecommendationEngine.generateComparisonInsights(validCommunities);

      // Organize comparison data
      const comparison = {
        communities: validCommunities.map(community => ({
          id: community.id,
          name: community.name,
          location: `${community.city}, ${community.state}`,
          careTypes: community.careTypes,
          pricing: {
            basePrice: null, // No basePrice field in schema, using priceRange instead
            priceRange: community.priceRange || null,
            lastPriceUpdate: community.lastPriceUpdate
          },
          availability: {
            status: community.availabilityStatus,
            lastUpdated: community.lastAvailabilityUpdate
          },
          licensing: {
            licenseNumber: community.licenseNumber,
            status: community.licenseStatus,
            lastInspection: community.lastInspection
          },
          amenities: community.amenities?.slice(0, 10) || [],
          services: community.services?.slice(0, 10) || [],
          medicalRestrictions: community.medicalRestrictions || [],
          ratings: {
            average: parseFloat(community.rating || "0"),
            reviewCount: community.reviewCount || 0,
            trustedSources: community.trustedReviews
          }
        })),
        insights: comparisonInsights,
        comparisonDate: new Date().toISOString()
      };

      res.json(comparison);
    } catch (error) {
      console.error("Error comparing communities:", error);
      res.status(500).json({ message: "Failed to compare communities" });
    }
  });

  // Comprehensive Data Scraping Endpoints
  app.post("/api/admin/scrape", async (req, res) => {
    try {
      const { state, careType, sources } = req.body;
      
      const scraper = new ComprehensiveScraper();
      
      // Start scraping in background
      scraper.scrapeMultipleDataSources(state, careType).catch(error => {
        console.error("Background scraping error:", error);
      });

      res.json({ 
        message: "Data scraping initiated",
        sources: sources || "all",
        state: state || "all states",
        careType: careType || "all care types"
      });
    } catch (error) {
      console.error("Error initiating scrape:", error);
      res.status(500).json({ message: "Failed to initiate data scraping" });
    }
  });

  // Licensing and Inspection Data
  app.get("/api/communities/:id/licensing", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const community = await storage.getCommunity(id);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const inspections = await storage.getInspectionsByCommunity(id);

      const licensingInfo = {
        community: {
          id: community.id,
          name: community.name,
          careTypes: community.careTypes
        },
        licensing: {
          licenseNumber: community.licenseNumber,
          status: community.licenseStatus,
          issueDate: null, // Not in current schema
          expirationDate: null, // Not in current schema
          lastInspectionDate: community.lastInspection,
          isLicenseRequired: isLicenseRequired(community.careTypes)
        },
        inspections: inspections.map(inspection => ({
          id: inspection.id,
          date: inspection.inspectionDate,
          type: inspection.inspectionType,
          violations: inspection.violations || [],
          overallScore: inspection.overallScore,
          reportUrl: inspection.reportUrl
        })),
        transparency: {
          hasPublicRecords: !!community.licenseNumber,
          lastUpdated: community.lastInspection,
          violationCount: inspections.reduce((count, insp) => count + (insp.violations?.length || 0), 0)
        }
      };

      res.json(licensingInfo);
    } catch (error) {
      console.error("Error fetching licensing info:", error);
      res.status(500).json({ message: "Failed to fetch licensing information" });
    }
  });

  // Helper function to determine if license is required
  function isLicenseRequired(careTypes: string[]): boolean {
    const licensedCareTypes = ['Assisted Living', 'Memory Care', 'Skilled Nursing'];
    return careTypes.some(type => licensedCareTypes.includes(type));
  }

  // Pricing Transparency Endpoint
  app.get("/api/communities/:id/pricing", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const community = await storage.getCommunity(id);
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      const pricingInfo = {
        community: {
          id: community.id,
          name: community.name,
          careTypes: community.careTypes
        },
        pricing: {
          hasPublicPricing: !!community.priceRange,
          basePrice: null, // Not in current schema
          priceRange: community.priceRange,
          lastPriceUpdate: community.lastPriceUpdate,
          pricePerCareType: {}, // Not in current schema
          additionalFees: [], // Not in current schema
          transparencyScore: calculateTransparencyScore(community)
        },
        availability: {
          status: community.availabilityStatus,
          waitlistLength: null, // Not in current schema
          lastUpdated: community.lastAvailabilityUpdate
        }
      };

      res.json(pricingInfo);
    } catch (error) {
      console.error("Error fetching pricing info:", error);
      res.status(500).json({ message: "Failed to fetch pricing information" });
    }
  });

  // Helper function to calculate pricing transparency score
  function calculateTransparencyScore(community: any): number {
    let score = 0;
    if (community.priceRange) score += 50;
    if (community.lastPriceUpdate && new Date(community.lastPriceUpdate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) score += 25;
    if (community.availabilityStatus && community.availabilityStatus !== "Contact") score += 15;
    if (community.rating && parseFloat(community.rating) > 0) score += 10;
    return Math.min(score, 100);
  }

  // Location autocomplete endpoint
  app.get('/api/locations/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.json([]);
      }

      const query = q.toLowerCase().trim();
      const locations = new Set<string>();
      
      // Get unique cities and states from our database
      const communities = await storage.getAllCommunities();
      communities.forEach(community => {
        const cityState = `${community.city}, ${community.state}`;
        const city = community.city.toLowerCase();
        const state = community.state.toLowerCase();
        
        // Prioritize exact matches and starts-with matches
        if (city.startsWith(query) || cityState.toLowerCase().startsWith(query)) {
          locations.add(cityState);
        } else if (city.includes(query) || state.includes(query)) {
          locations.add(cityState);
        }
      });

      // Add popular California cities for better autocomplete experience
      const popularCities = [
        'Los Angeles, CA', 'San Francisco, CA', 'San Diego, CA', 'Sacramento, CA',
        'San Jose, CA', 'Fresno, CA', 'Long Beach, CA', 'Oakland, CA', 
        'Bakersfield, CA', 'Anaheim, CA', 'Santa Ana, CA', 'Riverside, CA',
        'Stockton, CA', 'Irvine, CA', 'Chula Vista, CA', 'Fremont, CA',
        'Santa Clarita, CA', 'Salinas, CA', 'Hayward, CA', 'Sunnyvale, CA',
        'Redding, CA', 'Modesto, CA', 'Visalia, CA', 'Concord, CA'
      ];

      popularCities.forEach(cityState => {
        const city = cityState.split(',')[0].toLowerCase();
        if (city.startsWith(query) || cityState.toLowerCase().includes(query)) {
          locations.add(cityState);
        }
      });

      // Convert to array, sort by relevance, and limit results
      const results = Array.from(locations)
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          // Prioritize starts-with matches
          const aStarts = aLower.startsWith(query);
          const bStarts = bLower.startsWith(query);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 8)
        .map(location => ({
          label: location,
          value: location
        }));
      
      res.json(results);
    } catch (error) {
      console.error('Error in location search:', error);
      res.status(500).json({ error: 'Failed to search locations' });
    }
  });

  // REAL DATA SCRAPING ENDPOINTS FOR NORTHERN CALIFORNIA
  app.post("/api/admin/scrape/norcal", async (req, res) => {
    try {
      const { city, state = 'CA' } = req.body;
      
      if (!city) {
        return res.status(400).json({ message: "City is required" });
      }
      
      // Start scraping real communities for Northern California
      console.log(`Starting real data scraping for ${city}, ${state}`);
      
      const { realDataScraper } = await import('./real-data-scraper');
      const scrapedCount = await realDataScraper.addRealCommunitiesToDatabase(city, state);
      
      res.json({
        success: true,
        message: `Successfully scraped ${scrapedCount} real communities for ${city}, ${state}`,
        scrapedCount
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ 
        message: "Failed to scrape community data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/admin/scrape/licensing", async (req, res) => {
    try {
      const { state = 'CA' } = req.body;
      
      console.log(`Starting licensing data scraping for ${state}`);
      
      const { licensingScraper } = await import('./licensing-scraper');
      await licensingScraper.scrapeAllStateLicensing();
      
      res.json({
        success: true,
        message: `Successfully scraped licensing data for ${state}`
      });
    } catch (error) {
      console.error("Licensing scraping error:", error);
      res.status(500).json({
        message: "Failed to scrape licensing data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/admin/scrape/status", async (req, res) => {
    try {
      const totalCommunities = await storage.getAllCommunities();
      const verifiedCommunities = totalCommunities.filter(c => c.isVerified);
      const claimedCommunities = totalCommunities.filter(c => c.isClaimed);
      
      res.json({
        total: totalCommunities.length,
        verified: verifiedCommunities.length,
        claimed: claimedCommunities.length,
        verificationRate: `${((verifiedCommunities.length / totalCommunities.length) * 100).toFixed(1)}%`,
        lastUpdate: new Date().toISOString(),
        byCity: totalCommunities.reduce((acc, c) => {
          acc[c.city] = (acc[c.city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get scraping status" });
    }
  });

  // Real data collection endpoint
  app.post('/api/collect-real-data/:city/:state', async (req, res) => {
    try {
      const { city, state } = req.params;
      console.log(`Starting real data collection for ${city}, ${state}...`);
      
      const { realDataScraper } = await import('./real-data-scraper');
      const addedCount = await realDataScraper.addRealCommunitiesToDatabase(city, state);
      
      res.json({
        success: true,
        message: `Successfully collected and added ${addedCount} real communities from ${city}, ${state}`,
        addedCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in real data collection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to collect real community data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // State Licensing Database Integration Endpoints
  
  // Scrape all state licensing databases AND general senior living
  app.post('/api/admin/scrape-licensing', async (req, res) => {
    try {
      console.log('Starting comprehensive senior living data collection (licensed + unlicensed)...');
      
      // Start comprehensive scraping in background
      licensingScraper.scrapeAllStateLicensing().catch(error => {
        console.error("Background comprehensive scrape error:", error);
      });

      res.json({ 
        success: true,
        message: "Comprehensive senior living data collection initiated - includes both licensed facilities from state databases and unlicensed communities from general searches",
        licensedSources: ["California CCLD", "Texas HHS", "Florida AHCA", "New York DOH", "Pennsylvania DHS"],
        unlicensedSources: ["Bing Search", "DuckDuckGo Search", "Business Directories"],
        searchTypes: ["Independent Living", "55+ Communities", "Retirement Communities", "Senior Housing", "Active Adult Communities"],
        note: "This hybrid approach captures all senior living options - licensed facilities from official databases and unlicensed communities that market themselves for easy discovery",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error initiating comprehensive scrape:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate comprehensive senior living data collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Scrape specific state licensing database
  app.post('/api/admin/scrape-licensing/:state', async (req, res) => {
    try {
      const { state } = req.params;
      const stateUpper = state.toUpperCase();
      
      console.log(`Starting ${stateUpper} licensing database scraping...`);
      
      let scrapingPromise;
      let sourceName;
      
      switch (stateUpper) {
        case 'CA':
        case 'CALIFORNIA':
          scrapingPromise = licensingScraper.scrapeCalifornaLicensing();
          sourceName = 'California Community Care Licensing';
          break;
        case 'TX':
        case 'TEXAS':
          scrapingPromise = licensingScraper.scrapeTexasLicensing();
          sourceName = 'Texas Health and Human Services';
          break;
        case 'FL':
        case 'FLORIDA':
          scrapingPromise = licensingScraper.scrapeFloridaLicensing();
          sourceName = 'Florida Agency for Health Care Administration';
          break;
        case 'NY':
        case 'NEW_YORK':
          scrapingPromise = licensingScraper.scrapeNewYorkLicensing();
          sourceName = 'New York Department of Health';
          break;
        case 'PA':
        case 'PENNSYLVANIA':
          scrapingPromise = licensingScraper.scrapePennsylvaniaLicensing();
          sourceName = 'Pennsylvania Department of Human Services';
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `State ${state} not supported. Available states: CA, TX, FL, NY, PA`
          });
      }

      // Execute scraping in background
      scrapingPromise.catch(error => {
        console.error(`Error scraping ${sourceName}:`, error);
      });

      res.json({ 
        success: true,
        message: `${sourceName} database scraping initiated`,
        state: stateUpper,
        source: sourceName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error initiating ${req.params.state} licensing scrape:`, error);
      res.status(500).json({
        success: false,
        error: `Failed to initiate ${req.params.state} licensing database scraping`,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get licensing database statistics
  app.get('/api/admin/licensing-stats', async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      
      const licensingStats = {
        total: communities.length,
        licensed: communities.filter(c => c.licenseNumber).length,
        byState: {} as Record<string, { total: number; licensed: number; }>,
        byLicenseStatus: {} as Record<string, number>,
        byDataSource: {} as Record<string, number>,
        lastUpdated: new Date().toISOString()
      };

      // Calculate statistics by state
      communities.forEach(community => {
        const state = community.state;
        if (!licensingStats.byState[state]) {
          licensingStats.byState[state] = { total: 0, licensed: 0 };
        }
        licensingStats.byState[state].total++;
        if (community.licenseNumber) {
          licensingStats.byState[state].licensed++;
        }

        // License status stats
        const status = community.licenseStatus || 'Unknown';
        licensingStats.byLicenseStatus[status] = (licensingStats.byLicenseStatus[status] || 0) + 1;

        // Data source stats
        const source = community.dataSource || 'Unknown';
        licensingStats.byDataSource[source] = (licensingStats.byDataSource[source] || 0) + 1;
      });

      res.json(licensingStats);
    } catch (error) {
      console.error('Error fetching licensing stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch licensing statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===============================
  // COMPLIANCE API ENDPOINTS
  // ===============================

  // Get state compliance information
  app.get('/api/compliance/state/:code', async (req, res) => {
    try {
      const stateCode = req.params.code.toUpperCase();
      
      // Load licensing matrix
      const matrixPath = path.join(process.cwd(), 'server/compliance/licensingMatrix.json');
      const matrixData = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
      
      if (!matrixData[stateCode]) {
        return res.status(404).json({
          error: 'State not found',
          message: `No compliance data available for state: ${stateCode}`
        });
      }

      res.json(matrixData[stateCode]);
    } catch (error) {
      console.error('Error fetching state compliance:', error);
      res.status(500).json({
        error: 'Failed to fetch compliance data',
        message: 'Unable to load state licensing requirements'
      });
    }
  });

  // Get all states compliance summary
  app.get('/api/compliance/states', async (req, res) => {
    try {
      const matrixPath = path.join(process.cwd(), 'server/compliance/licensingMatrix.json');
      const matrixData = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
      
      // Return summary with requiresLicense status for each state
      const summary = Object.entries(matrixData).map(([code, data]: [string, any]) => ({
        state: code,
        requiresLicense: data.requiresLicense,
        statute: data.statute,
        description: data.description
      }));

      res.json(summary);
    } catch (error) {
      console.error('Error fetching states compliance:', error);
      res.status(500).json({
        error: 'Failed to fetch compliance data',
        message: 'Unable to load licensing requirements'
      });
    }
  });

  // Manual database seeding endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      const { seedDatabase } = await import("./seed");
      await seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  // Enhanced data collection and verification endpoints
  app.post("/api/communities/verify-and-collect", async (req, res) => {
    try {
      const { city, state, verificationLevel = 'enhanced', maxResults = 25 } = req.body;
      
      if (!city || !state) {
        return res.status(400).json({ error: "City and state are required" });
      }

      const { enhancedScraper } = await import("./enhanced-scraper");
      
      console.log(`Starting enhanced data collection for ${city}, ${state}`);
      
      const scrapingResult = await enhancedScraper.comprehensiveDataCollection(
        city, 
        state, 
        { 
          verificationLevel: verificationLevel as 'basic' | 'enhanced' | 'comprehensive',
          maxResults: parseInt(maxResults) || 25
        }
      );
      
      // Save verified communities to database
      const savedCount = await enhancedScraper.saveVerifiedCommunities(
        scrapingResult.communities, 
        city, 
        state
      );
      
      res.json({
        success: true,
        message: `Enhanced data collection completed for ${city}, ${state}`,
        results: {
          totalFound: scrapingResult.totalFound,
          verifiedCount: scrapingResult.verifiedCount,
          savedToDatabase: savedCount,
          duplicatesRemoved: scrapingResult.duplicatesRemoved,
          verificationLevel,
          communities: scrapingResult.communities.map(c => ({
            name: c.name,
            address: c.address,
            phone: c.phone,
            website: c.website,
            careTypes: c.careTypes,
            verificationSources: c.verificationSources,
            confidence: c.confidence,
            crossReferencedData: c.crossReferencedData
          }))
        },
        errors: scrapingResult.errors
      });
      
    } catch (error) {
      console.error("Enhanced data collection error:", error);
      res.status(500).json({ 
        error: "Enhanced data collection failed", 
        message: error.message 
      });
    }
  });

  // Multi-source verification endpoint
  app.post("/api/communities/multi-verify", async (req, res) => {
    try {
      const { communityName, city, state } = req.body;
      
      if (!communityName || !city || !state) {
        return res.status(400).json({ error: "Community name, city, and state are required" });
      }

      const { multiSourceVerifier } = await import("./multi-source-verifier");
      
      const verificationResults = await multiSourceVerifier.verifyAndEnrichCommunityData(
        communityName, 
        city, 
        state
      );
      
      res.json({
        success: true,
        community: communityName,
        location: `${city}, ${state}`,
        verificationResults: verificationResults.map(result => ({
          name: result.name,
          address: result.address,
          phone: result.phone,
          website: result.website,
          careTypes: result.careTypes,
          verificationSources: result.verificationSources,
          confidence: result.confidence,
          crossReferencedData: result.crossReferencedData
        }))
      });
      
    } catch (error) {
      console.error("Multi-source verification error:", error);
      res.status(500).json({ 
        error: "Multi-source verification failed", 
        message: error.message 
      });
    }
  });

  // Verification statistics endpoint
  app.get("/api/communities/verification-stats", async (req, res) => {
    try {
      const { city, state } = req.query;
      
      let query = db.select().from(communities);
      
      if (city && state) {
        query = query.where(and(
          eq(communities.city, city as string),
          eq(communities.state, state as string)
        ));
      }
      
      const allCommunities = await query;
      
      const stats = {
        total: allCommunities.length,
        verified: allCommunities.filter(c => c.isVerified).length,
        withLicense: allCommunities.filter(c => c.licenseNumber).length,
        withPhone: allCommunities.filter(c => c.phone).length,
        withWebsite: allCommunities.filter(c => c.website).length,
        averageConfidence: allCommunities.reduce((acc, c) => acc + (c.confidenceScore || 0), 0) / allCommunities.length,
        verificationSources: this.getTopVerificationSources(allCommunities),
        careTypeDistribution: this.getCareTypeDistribution(allCommunities)
      };
      
      res.json({
        success: true,
        location: city && state ? `${city}, ${state}` : 'All locations',
        verificationStatistics: stats
      });
      
    } catch (error) {
      console.error("Verification stats error:", error);
      res.status(500).json({ 
        error: "Failed to get verification statistics", 
        message: error.message 
      });
    }
  });

  // Enhanced search with verification data
  app.get("/api/communities/verified-search", async (req, res) => {
    try {
      const { 
        location, 
        careType, 
        minConfidence = 50,
        verificationLevel = 'basic',
        limit = 20 
      } = req.query;
      
      let query = db.select().from(communities);
      const conditions: any[] = [];
      
      // Location filtering
      if (location) {
        const [city, state] = (location as string).split(',').map(s => s.trim());
        if (city && state) {
          conditions.push(
            and(
              eq(communities.city, city),
              eq(communities.state, state)
            )
          );
        }
      }
      
      // Care type filtering
      if (careType && careType !== 'All') {
        conditions.push(sql`${communities.careTypes} && ARRAY[${careType}]`);
      }
      
      // Confidence filtering
      const confidenceThreshold = parseInt(minConfidence as string) || 50;
      conditions.push(gte(communities.confidenceScore || 0, confidenceThreshold));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query.limit(parseInt(limit as string) || 20);
      
      const results = await query;
      
      res.json({
        success: true,
        searchCriteria: {
          location,
          careType,
          minConfidence: confidenceThreshold,
          verificationLevel
        },
        communities: results.map(community => ({
          ...community,
          verificationDetails: {
            confidenceScore: community.confidenceScore,
            verificationSources: community.verificationSources,
            crossReferencedData: community.crossReferencedData,
            isVerified: community.isVerified,
            licenseStatus: community.licenseStatus
          }
        }))
      });
      
    } catch (error) {
      console.error("Verified search error:", error);
      res.status(500).json({ 
        error: "Verified search failed", 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Yelp enrichment endpoints
  app.post("/api/communities/yelp-enrich", async (req, res) => {
    try {
      const { communityId } = req.body;
      
      if (!communityId) {
        return res.status(400).json({ error: "Community ID is required" });
      }

      const community = await storage.getCommunity(communityId);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      const { yelpIntegration } = await import("./yelp-integration");
      const enrichmentResult = await yelpIntegration.enrichCommunityWithYelp(community);
      
      if (enrichmentResult && enrichmentResult.success) {
        // Update community with Yelp data
        await storage.updateCommunity(communityId, {
          yelpId: enrichmentResult.yelpId,
          yelpRating: enrichmentResult.rating,
          yelpReviewCount: enrichmentResult.reviewCount,
          yelpPhotos: enrichmentResult.photos,
          yelpUrl: enrichmentResult.yelpUrl,
          yelpCategories: enrichmentResult.categories
        });
        
        res.json({
          success: true,
          message: `Successfully enriched ${community.name} with Yelp data`,
          enrichmentData: enrichmentResult,
          usageStats: yelpIntegration.getUsageStats()
        });
      } else {
        res.json({
          success: false,
          message: `No Yelp data found for ${community.name}`,
          error: enrichmentResult?.error,
          usageStats: yelpIntegration.getUsageStats()
        });
      }
      
    } catch (error) {
      console.error("Yelp enrichment error:", error);
      res.status(500).json({ 
        error: "Yelp enrichment failed", 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Batch Yelp enrichment for multiple communities
  app.post("/api/communities/yelp-enrich-batch", async (req, res) => {
    try {
      const { city, state, limit = 10 } = req.body;
      
      if (!city || !state) {
        return res.status(400).json({ error: "City and state are required" });
      }

      // Get communities that need Yelp enrichment (less than 3 photos)
      const communitiesQuery = await storage.searchCommunities({
        city,
        state,
        limit: parseInt(limit)
      });
      
      const communitiesNeedingEnrichment = communitiesQuery.filter(c => 
        !c.photos || c.photos.length < 3
      );

      if (communitiesNeedingEnrichment.length === 0) {
        return res.json({
          success: true,
          message: `No communities in ${city}, ${state} need Yelp enrichment`,
          processed: 0
        });
      }

      const { yelpIntegration } = await import("./yelp-integration");
      const enrichmentResults = await yelpIntegration.enrichCommunitiesBatch(communitiesNeedingEnrichment);
      
      // Update communities with Yelp data
      let updatedCount = 0;
      for (const [communityId, result] of enrichmentResults) {
        if (result.success) {
          await storage.updateCommunity(communityId, {
            yelpId: result.yelpId,
            yelpRating: result.rating,
            yelpReviewCount: result.reviewCount,
            yelpPhotos: result.photos,
            yelpUrl: result.yelpUrl,
            yelpCategories: result.categories
          });
          updatedCount++;
        }
      }
      
      res.json({
        success: true,
        message: `Batch Yelp enrichment completed for ${city}, ${state}`,
        results: {
          totalCommunities: communitiesNeedingEnrichment.length,
          enriched: enrichmentResults.size,
          updated: updatedCount,
          usageStats: yelpIntegration.getUsageStats()
        }
      });
      
    } catch (error) {
      console.error("Batch Yelp enrichment error:", error);
      res.status(500).json({ 
        error: "Batch Yelp enrichment failed", 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Three-market verification test as recommended by OpenAI
  app.post("/api/communities/three-market-test", async (req, res) => {
    try {
      const testMarkets = [
        { city: "San Francisco", state: "CA", type: "Urban" },
        { city: "Phoenix", state: "AZ", type: "Suburban" },
        { city: "Little Rock", state: "AR", type: "Rural" }
      ];
      
      const results = [];
      
      for (const market of testMarkets) {
        console.log(`Testing verification system in ${market.city}, ${market.state}`);
        
        // Get all communities in this market
        const communities = await storage.searchCommunities({
          city: market.city,
          state: market.state,
          limit: 50
        });
        
        // Calculate verification statistics
        const stats = {
          market: `${market.city}, ${market.state}`,
          marketType: market.type,
          totalCommunities: communities.length,
          verifiedCount: communities.filter(c => c.isVerified).length,
          averageConfidence: communities.reduce((acc, c) => acc + (c.confidenceScore || 0), 0) / communities.length,
          lowConfidenceCount: communities.filter(c => (c.confidenceScore || 0) < 60).length,
          withPhoneCount: communities.filter(c => c.phone).length,
          withLicenseCount: communities.filter(c => c.licenseNumber).length,
          lowConfidenceFlag: communities.filter(c => (c.confidenceScore || 0) < 60).length / communities.length > 0.25,
          communities: communities.map(c => ({
            name: c.name,
            confidenceScore: c.confidenceScore || 0,
            sourcesMatched: c.verificationSources?.length || 0,
            phoneValid: c.phone ? 1 : 0,
            lowConfidenceFlag: (c.confidenceScore || 0) < 60
          }))
        };
        
        results.push(stats);
      }
      
      // Overall assessment
      const overallStats = {
        totalMarketsTested: results.length,
        marketsWithLowConfidence: results.filter(r => r.lowConfidenceFlag).length,
        averageConfidenceAcrossMarkets: results.reduce((acc, r) => acc + r.averageConfidence, 0) / results.length,
        recommendSlackAlert: results.some(r => r.lowConfidenceFlag)
      };
      
      res.json({
        success: true,
        message: "Three-market verification test completed",
        testResults: results,
        overallAssessment: overallStats,
        recommendations: overallStats.recommendSlackAlert ? 
          ["Alert: One or more markets have >25% low-confidence listings", "Review verification pipeline"] :
          ["Verification pipeline performing well", "Safe to proceed with wider deployment"]
      });
      
    } catch (error) {
      console.error("Three-market test error:", error);
      res.status(500).json({ 
        error: "Three-market test failed", 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Multi-source verification endpoint
  app.post('/api/verify/multi-source', async (req, res) => {
    try {
      const { communityId, testLevel = 'basic' } = req.body;
      
      const community = await storage.getCommunity(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      console.log(`Starting multi-source verification for: ${community.name}`);
      
      const { multiSourceVerifier } = await import("./multi-source-verifier");
      
      // Run 6-layer verification system
      const verificationData = await multiSourceVerifier.verifyAndEnrichCommunityData(
        community.name,
        community.city,
        community.state
      );

      // Calculate verification confidence score
      let confidenceScore = 0;
      let verificationSources: string[] = [];
      let crossReferences = {
        phoneVerified: false,
        addressVerified: false,
        licenseVerified: false,
        businessRegistrationVerified: false
      };

      if (verificationData.length > 0) {
        const bestMatch = verificationData[0];
        confidenceScore = bestMatch.confidence;
        verificationSources = bestMatch.verificationSources;
        crossReferences = bestMatch.crossReferencedData;
      }

      res.json({
        success: true,
        community: community.name,
        verificationLevel: testLevel,
        results: {
          confidenceScore,
          verificationSources,
          crossReferences,
          isVerified: confidenceScore >= 70,
          verificationData: verificationData.slice(0, 3) // Top 3 matches
        }
      });

    } catch (error) {
      console.error('Multi-source verification error:', error);
      res.status(500).json({ 
        message: 'Verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Google Places enrichment endpoint
  app.post('/api/enrich/google-places', async (req, res) => {
    try {
      const { city, state, limit = 3 } = req.body;
      
      const communities = await storage.searchCommunities({
        location: `${city}, ${state}`,
        limit: limit
      });
      
      if (communities.length === 0) {
        return res.json({
          success: true,
          message: `No communities found in ${city}, ${state}`,
          processed: 0
        });
      }

      const { googlePlacesIntegration } = await import("./google-places-integration");
      const enrichmentResults = await googlePlacesIntegration.enrichCommunitiesBatch(communities);
      
      // Apply enrichment results to database
      let updatedCount = 0;
      for (const [communityId, enrichment] of enrichmentResults) {
        if (enrichment.success) {
          const community = communities.find(c => c.id === communityId);
          const existingPhotos = community?.photos || [];
          
          await storage.updateCommunity(communityId, {
            googlePlacesId: enrichment.placeId,
            googleRating: enrichment.rating,
            googleReviews: enrichment.reviews,
            googlePhotos: enrichment.photos,
            rating: Math.max(community?.rating || 0, enrichment.rating),
            photos: [...existingPhotos, ...enrichment.photos].slice(0, 15)
          });
          updatedCount++;
        }
      }
      
      res.json({
        success: true,
        message: `Google Places enrichment completed for ${city}, ${state}`,
        results: {
          totalCommunities: communities.length,
          enriched: enrichmentResults.size,
          updated: updatedCount,
          usageStats: googlePlacesIntegration.getUsageStats(),
          costBreakdown: Array.from(enrichmentResults.entries()).map(([id, result]) => ({
            communityId: id,
            success: result.success,
            costIncurred: result.costIncurred
          }))
        }
      });
      
    } catch (error) {
      console.error('Google Places enrichment error:', error);
      res.status(500).json({ 
        message: 'Google Places enrichment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  // Enrichment API endpoints
  app.get('/api/enrichTest', async (req, res) => {
    try {
      const { runBatchEnrichment } = await import('./enrichment/runEnrichment.js');
      const { getDailySpendingSummary } = await import('./enrichment/spendGuards.js');
      
      const city = req.query.city as string || 'San Francisco';
      const limit = Math.min(parseInt(req.query.limit as string) || 25, 50); // Max 50 communities
      
      // Get random communities from the specified city
      const communitiesInCity = await storage.getAllCommunities()
        .then(allCommunities => 
          allCommunities
            .filter(c => c.city === city)
            .slice(0, limit)
            .map(c => ({ id: c.id, name: c.name }))
        );
        
      if (communitiesInCity.length === 0) {
        return res.status(404).json({ message: `No communities found in ${city}` });
      }
      
      console.log(`Starting enrichment test for ${communitiesInCity.length} communities in ${city}`);
      
      // Run batch enrichment
      const enrichmentResults = await runBatchEnrichment(
        communitiesInCity.map(c => c.id),
        3 // Max 3 concurrent
      );
      
      // Calculate metrics
      const successful = enrichmentResults.filter(r => r.success);
      const avgPhotos = successful.length > 0 
        ? successful.reduce((sum, r) => sum + (r.totalPhotos || 0), 0) / successful.length 
        : 0;
      const invalidPhones = enrichmentResults.filter(r => r.phoneValid === false).length;
      
      // Get spending summary
      const spendingSummary = await getDailySpendingSummary();
      
      res.json({
        success: true,
        city,
        processed: communitiesInCity.length,
        enriched: successful.length,
        failed: enrichmentResults.filter(r => !r.success).length,
        avgPhotos: Math.round(avgPhotos * 10) / 10,
        invalidPhones,
        spendingSummary,
        results: enrichmentResults
      });
      
    } catch (error) {
      console.error('Enrichment test error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Enrichment test failed',
        error: error.message 
      });
    }
  });

  // Manual enrichment endpoint for single community
  app.post('/api/communities/:id/enrich', async (req, res) => {
    try {
      const { runEnrichment } = await import('./enrichment/runEnrichment.js');
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }
      
      const result = await runEnrichment(communityId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
      
    } catch (error) {
      console.error('Community enrichment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Enrichment failed',
        error: error.message 
      });
    }
  });

  // Spending summary endpoint
  app.get('/api/enrichment/spending', async (req, res) => {
    try {
      const { getDailySpendingSummary } = await import('./enrichment/spendGuards.js');
      const summary = await getDailySpendingSummary();
      res.json(summary);
    } catch (error) {
      console.error('Spending summary error:', error);
      res.status(500).json({ 
        message: 'Failed to get spending summary',
        error: error.message 
      });
    }
  });

  return httpServer;
}
