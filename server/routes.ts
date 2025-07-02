import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchCommunitySchema, insertCommunitySchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { aiRecommendationEngine, RecommendationRequest } from "./ai-recommendations";
import { ComprehensiveScraper } from "./scraper";
import { licensingScraper } from "./licensing-scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all communities
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  // Search communities
  app.get("/api/communities/search", async (req, res) => {
    try {
      const searchParams = searchCommunitySchema.parse(req.query);
      const communities = await storage.searchCommunities(searchParams);
      res.json(communities);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid search parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to search communities" });
      }
    }
  });

  // Get single community
  app.get("/api/communities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid community ID" });
      }

      const community = await storage.getCommunity(id);
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
        timestamp: new Date().toISOString()
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
  
  // Scrape all state licensing databases
  app.post('/api/admin/scrape-licensing', async (req, res) => {
    try {
      console.log('Starting comprehensive state licensing database scraping...');
      
      // Start licensing scraping in background
      licensingScraper.scrapeAllStateLicensing().catch(error => {
        console.error("Background licensing scrape error:", error);
      });

      res.json({ 
        success: true,
        message: "State licensing database scraping initiated",
        sources: ["California CCLD", "Texas HHS", "Florida AHCA", "New York DOH", "Pennsylvania DHS"],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error initiating licensing scrape:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate licensing database scraping',
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

  const httpServer = createServer(app);
  return httpServer;
}
