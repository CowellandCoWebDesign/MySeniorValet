import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

// Import route registrations
import { registerRoutes as registerModularRoutes } from "./routes/index";

// Import remaining services needed for middleware and specific routes
import { setupAuth } from "./replitAuth";
import { communityStatsCache } from "./community-stats-cache";
import reservationRoutes from "./routes/reservations";
import { quizRouter } from "./routes/quiz";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { db } from "./db";
import { eq } from "drizzle-orm";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { vendors } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: Webhook raw body handling is done in server/index.ts before JSON parsing

  // Initialize Replit Auth before other routes
  await setupAuth(app);

  // Initialize community stats cache on startup (non-blocking)
  communityStatsCache.initialize().catch(error => {
    console.error('Failed to initialize community stats cache:', error);
  });

  // Register all modular routes
  registerModularRoutes(app);
  
  // Register test routes
  const { registerTestRoutes } = await import('./test-system');
  registerTestRoutes(app);

  // Register remaining special routes
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/quiz', quizRouter);
  
  // Register tour routes
  const { tourRouter } = await import('./routes/tourRoutes');
  app.use(tourRouter);
  
  // Import and register webhook routes
  const webhookRoutes = await import('./routes/webhookRoutes');
  const webhookDevelopment = await import('./routes/webhookDevelopment');
  const subscriptionStatusRoutes = await import('./routes/subscriptionStatusRoutes');
  const subscriptionIntegrationRoutes = await import('./routes/subscriptionIntegrationRoutes');
  const careServicesRoutes = await import('./routes/careServicesRoutes');
  const amazonRedirectRoutes = await import('./routes/amazonRedirectRoutes');
  const amazonComplianceRoutes = await import('./routes/amazonComplianceRoutes');
  const stripeWebhookProxy = await import('./routes/stripeWebhookProxy');
  app.use('/api/webhooks', webhookRoutes.default);
  app.use('/api/payments', stripeWebhookProxy.default); // Handle Stripe's configured webhook URL
  app.use('/api/webhook-dev', webhookDevelopment.default);
  app.use('/api/subscription-status', subscriptionStatusRoutes.default);
  app.use('/api', subscriptionIntegrationRoutes.default);
  app.use('/api', careServicesRoutes.default);
  app.use('/go/amazon', amazonRedirectRoutes.default);
  app.use('/api/amazon-compliance', amazonComplianceRoutes.default);
  
  // Register messaging routes
  const messagingRoutes = await import('./routes/messagingRoutes');
  app.use('/api/messaging', messagingRoutes.default);
  
  // Register engagement routes
  const { registerEngagementRoutes } = await import('./routes/engagementRoutes');
  registerEngagementRoutes(app);
  
  // Register marketplace routes
  const marketplaceRoutes = await import('./routes/marketplaceRoutes');
  app.use('/api/marketplace', marketplaceRoutes.default);
  
  // Register vendor subscription routes
  const { vendorSubscriptionRouter } = await import('./routes/vendor-subscription');
  app.use('/api', vendorSubscriptionRouter);
  
  // Register hospital routes
  const { registerHospitalRoutes } = await import('./routes/hospitalRoutes');
  registerHospitalRoutes(app);
  
  // Register vendor Stripe payment routes
  const { registerVendorStripeRoutes } = await import('./routes/vendor-stripe');
  registerVendorStripeRoutes(app);
  
  // Register AI Map Intelligence routes
  const aiMapIntelligenceRoutes = await import('./routes/ai-map-intelligence');
  app.use(aiMapIntelligenceRoutes.default);
  
  // Register community Stripe payment routes
  const { registerCommunityStripeRoutes } = await import('./routes/community-stripe');
  registerCommunityStripeRoutes(app);

  // Vendor dashboard API routes
  app.get("/api/vendors/:vendorId/dashboard", isAuthenticated, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get vendor details
      const [vendor] = await db.select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor || vendor.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get subscription status with features
      const VENDOR_SUBSCRIPTION_TIERS = {
        basic: {
          features: {
            maxLeadsPerMonth: 50,
            commissionRate: 20,
            featuredListingDays: 0,
            analyticsAccess: false,
            prioritySupport: false,
            customBranding: false,
            apiAccess: false,
            teamMembers: 1,
          }
        },
        featured: {
          features: {
            maxLeadsPerMonth: 250,
            commissionRate: 15,
            featuredListingDays: 30,
            analyticsAccess: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: false,
            teamMembers: 3,
          }
        },
        national: {
          features: {
            maxLeadsPerMonth: 1000,
            commissionRate: 10,
            featuredListingDays: 365,
            analyticsAccess: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            teamMembers: 10,
          }
        },
        enterprise: {
          features: {
            maxLeadsPerMonth: -1, // Unlimited
            commissionRate: 5,
            featuredListingDays: 365,
            analyticsAccess: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            teamMembers: -1, // Unlimited
          }
        }
      };

      let subscriptionInfo = {
        hasSubscription: vendor.stripeSubscriptionId ? true : false,
        tier: vendor.subscriptionTier || 'basic',
        status: vendor.subscriptionStatus || 'trial',
        currentPeriodEnd: vendor.subscriptionEndDate,
        features: VENDOR_SUBSCRIPTION_TIERS[vendor.subscriptionTier as keyof typeof VENDOR_SUBSCRIPTION_TIERS]?.features || VENDOR_SUBSCRIPTION_TIERS.basic.features
      };

      // Get analytics (placeholder for now)
      const analytics = {
        views: Math.floor(Math.random() * 1000),
        clicks: vendor.monthlyClicksCount || 0,
        leads: vendor.monthlyLeadsCount || 0,
        conversions: Math.floor(Math.random() * 50),
        revenue: parseFloat(vendor.lifetimeRevenue || '0')
      };

      // Get recent leads (placeholder for now)
      const recentLeads = [];

      res.json({
        vendor: {
          id: vendor.id,
          businessName: vendor.businessName,
          businessType: vendor.businessType,
          subscriptionTier: vendor.subscriptionTier || 'basic',
          subscriptionStatus: vendor.subscriptionStatus || 'trial',
          isVerified: vendor.isVerified,
          averageRating: parseFloat(vendor.averageRating || '0'),
          totalReviews: vendor.totalReviews || 0,
          monthlyLeadsCount: vendor.monthlyLeadsCount || 0,
          monthlyClicksCount: vendor.monthlyClicksCount || 0,
          totalLeadsGenerated: vendor.totalLeadsGenerated || 0,
          lifetimeRevenue: vendor.lifetimeRevenue || '0',
        },
        subscription: subscriptionInfo,
        analytics,
        recentLeads
      });
    } catch (error: any) {
      console.error('Vendor dashboard error:', error);
      res.status(500).json({ 
        message: "Error loading dashboard", 
        error: error.message 
      });
    }
  });
  
  // Register notification routes
  const notificationRoutes = await import('./routes/notificationRoutes');
  app.use(notificationRoutes.default);
  
  // Register vendor image generation routes
  const { vendorImageRoutes } = await import('./routes/vendorImageRoutes');
  app.use(vendorImageRoutes);
  
  // Register community subscription tier routes
  const communitySubscriptionRoutes = await import('./routes/community-subscription');
  app.use(communitySubscriptionRoutes.default);
  
  // Register community claim routes
  const communityClaimRoutes = await import('./routes/community-claim-routes');
  app.use('/api/community-claims', communityClaimRoutes.default);
  
  // Register removal request routes
  const removalRequestRoutes = await import('./routes/removalRequestRoutes');
  app.use(removalRequestRoutes.default);
  
  // Register vendor signup routes
  const vendorSignupRoutes = await import('./routes/vendorSignupRoutes');
  app.use(vendorSignupRoutes.default);
  
  // Register community enrichment routes
  const communityEnrichmentRoutes = await import('./routes/community-enrichment-routes');
  app.use('/api/community-enrichment', communityEnrichmentRoutes.default);

  // AI Status checking endpoint
  app.get('/api/ai/status', async (req, res) => {
    try {
      const { checkAllAIStatus } = await import('./ai-status-checker');
      const status = await checkAllAIStatus();
      res.json(status);
    } catch (error) {
      console.error('AI status check failed:', error);
      res.status(500).json({ error: 'Failed to check AI status' });
    }
  });

  // Debug endpoint to check authentication status
  app.get('/api/auth/debug', (req: any, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      userDetails: req.user ? {
        hasExpires: !!(req.user as any).expires_at,
        hasClaims: !!(req.user as any).claims,
        keys: Object.keys(req.user)
      } : null,
      sessionID: req.sessionID,
      session: req.session
    });
  });

  // Production Replit Auth endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("✅ Replit Auth - Fetching user with ID:", userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("❌ User not found in database for ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("✅ Replit Auth - User found:", user.id, user.email, user.role);
      res.json(user);
    } catch (error) {
      console.error("❌ Error fetching authenticated user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Data quality analysis endpoint
  app.get('/api/data-quality/report', async (req, res) => {
    try {
      const { generateDataQualityReport } = await import("./data-quality-report");
      const report = await generateDataQualityReport();
      res.json(report);
    } catch (error) {
      console.error("Data quality report error:", error);
      res.status(500).json({ error: "Failed to generate data quality report" });
    }
  });

  // Remove duplicate communities endpoint
  app.post('/api/data-quality/remove-duplicates', async (req, res) => {
    try {
      const { removeDuplicateCommunities } = await import("./data-quality-report");
      const result = await removeDuplicateCommunities();
      res.json({
        success: true,
        message: `Successfully removed ${result.deletedCount} duplicate communities`,
        ...result
      });
    } catch (error) {
      console.error("Duplicate removal error:", error);
      res.status(500).json({ error: "Failed to remove duplicates" });
    }
  });

  // In development, Vite handles static files
  // In production, serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist/public'));
    
    // Fallback route for production SPA
    app.get("/*", (_req, res) => {
      res.sendFile("index.html", { root: "dist/public" });
    });
  }

  // Development cache clearing endpoints
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/dev/clear-caches', async (_req, res) => {
      try {
        console.log('🔥 DEVELOPMENT: Clearing all caches for instant changes');
        
        // Clear community stats cache
        await communityStatsCache.initialize();
        
        res.json({ 
          message: 'All development caches cleared',
          timestamp: new Date().toISOString(),
          cachesCleared: ['community-stats']
        });
      } catch (error) {
        console.error('Error clearing development caches:', error);
        res.status(500).json({ message: 'Failed to clear caches' });
      }
    });
  }

  const httpServer = createServer(app);

  // WebSocket functionality temporarily disabled - wsConnections table needs to be added to schema
  console.log('✅ Simple WebSocket communication initialized (mock)');

  return httpServer;
}