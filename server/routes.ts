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
import autocompleteRoutes from "./routes/autocompleteRoutes";
import { db } from "./db";
import { eq, or, like, desc } from "drizzle-orm";
import cookieParser from "cookie-parser";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { vendors, users } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: Webhook raw body handling is done in server/index.ts before JSON parsing

  // Initialize custom authentication (no Replit account required)
  const { setupCustomAuth } = await import('./custom-auth');
  setupCustomAuth(app);
  
  // Initialize social authentication (Google & Facebook OAuth)
  const { setupSocialAuth } = await import('./social-auth');
  setupSocialAuth(app);
  
  // Keep auth bypass for super admin access
  const { setupAuthBypass } = await import('./auth-bypass');
  await setupAuthBypass(app);

  // Initialize community stats cache on startup (non-blocking)
  communityStatsCache.initialize().catch(error => {
    console.error('Failed to initialize community stats cache:', error);
  });

  // Register all modular routes
  registerModularRoutes(app);
  
  // Register test routes
  const { registerTestRoutes } = await import('./test-system');
  registerTestRoutes(app);
  
  // Register Perplexity test route
  const testPerplexityRoutes = await import('./routes/test-perplexity');
  app.use(testPerplexityRoutes.default);
  
  // Register Atria expansion routes
  const { atriaRoutes } = await import('./routes/atria-routes');
  app.use('/api/atria', atriaRoutes);

  // Register pricing and claims routes
  const pricingHistoryRoutes = await import('./routes/pricing-history');
  const communityClaimsRoutes = await import('./routes/community-claims');
  const verifiedProfilesRoutes = await import('./routes/verified-profiles');
  app.use('/api', pricingHistoryRoutes.default);
  app.use('/api', communityClaimsRoutes.default);
  app.use('/api', verifiedProfilesRoutes.default);
  
  // Register admin subscription management routes
  const adminSubscriptionRoutes = await import('./routes/admin-subscription-routes');
  app.use('/api', adminSubscriptionRoutes.default);
  
  // Register analytics intelligence routes
  const analyticsIntelligenceRoutes = await import('./routes/analytics-intelligence-routes');
  app.use(analyticsIntelligenceRoutes.default);
  
  // Register web intelligence routes (Perplexity AI-powered)
  const webIntelligenceRoutes = await import('./routes/webIntelligenceRoutes');
  app.use(webIntelligenceRoutes.default);
  
  // Register remaining special routes
  app.use('/api', autocompleteRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/quiz', quizRouter);
  
  // Register TourMate™ tour routes
  const tourRoutes = await import('./routes/tourRoutes');
  app.use('/api/tours', tourRoutes.default);
  
  // Register Family Collaboration routes
  const familyRoutes = await import('./routes/familyRoutes');
  app.use('/api/family', familyRoutes.default);
  
  // Register Enhanced Search Intelligence routes
  const enhancedSearchRoutes = await import('./routes/enhanced-search-routes');
  app.use('/api/search', enhancedSearchRoutes.default);
  
  // Register Feedback routes for beta testing
  const feedbackRoutes = await import('./routes/feedbackRoutes');
  app.use('/api/feedback', feedbackRoutes.default);
  
  // Import and register webhook routes
  const webhookRoutes = await import('./routes/webhookRoutes');
  const webhookDevelopment = await import('./routes/webhookDevelopment');
  const subscriptionStatusRoutes = await import('./routes/subscriptionStatusRoutes');
  const subscriptionIntegrationRoutes = await import('./routes/subscriptionIntegrationRoutes');
  const careServicesRoutes = await import('./routes/careServicesRoutes');
  const amazonRedirectRoutes = await import('./routes/amazonRedirectRoutes');
  const amazonComplianceRoutes = await import('./routes/amazonComplianceRoutes');
  // const stripeWebhookProxy = await import('./routes/stripeWebhookProxy'); // DISABLED - Using unifiedPaymentRoutes
  app.use('/api/webhooks', webhookRoutes.default);
  // app.use('/api/payments', stripeWebhookProxy.default); // DISABLED - Using unifiedPaymentRoutes instead
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
  
  // Register heatmap routes
  const heatmapRoutes = await import('./routes/heatmapRoutes');
  app.use('/api/heatmap', heatmapRoutes.default);
  
  // Register competitive analysis routes
  const competitiveAnalysisRoutes = await import('./routes/competitiveAnalysisRoutes');
  app.use(competitiveAnalysisRoutes.default);
  
  // Register Documenso document signing routes
  const { registerDocumensoRoutes } = await import('./routes/documensoRoutes');
  registerDocumensoRoutes(app);
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
  
  // Register community Stripe payment routes
  const { registerCommunityStripeRoutes } = await import('./routes/community-stripe');
  registerCommunityStripeRoutes(app);
  
  // Register admin community management routes
  const adminCommunityRoutes = await import('./routes/adminCommunityRoutes');
  app.use('/api', adminCommunityRoutes.default);
  
  const adminHeatmapRoutes = await import('./routes/adminHeatmapRoutes');
  app.use('/api', adminHeatmapRoutes.default);

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
      const recentLeads: any[] = [];

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

  // Admin: Get all users
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { page = '1', search = '', role = 'all' } = req.query;
      const pageNum = parseInt(page as string);
      const limit = 20;
      const offset = (pageNum - 1) * limit;
      
      // Build query - only selecting columns that exist in our schema
      let query = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      }).from(users);

      // Apply filters
      if (search) {
        query = query.where(
          or(
            like(users.email, `%${search}%`),
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`)
          )
        );
      }

      if (role !== 'all') {
        query = query.where(eq(users.role, role as string));
      }

      const allUsers = await query.orderBy(desc(users.createdAt));
      
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

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

  // Get user role endpoint - required for admin access control
  app.get('/api/auth/user/role', (req: any, res) => {
    console.log('Auth check - User session:', req.session?.user);
    
    // Check for demo/test user with super admin access
    if (req.session?.user) {
      const user = req.session.user;
      const isAdmin = user.email === 'william.cowell01@gmail.com' || 
                      user.email === 'admin@myseniorvalet.com' ||
                      user.email === 'demo@example.com' ||
                      user.id === 'test-user-123';
      
      return res.json({
        role: isAdmin ? 'super_admin' : (user.role || 'user'),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
    
    // Check for authenticated Replit user
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email || '';
      
      // Grant super admin to specific users
      const isAdmin = userEmail === 'william.cowell01@gmail.com' || 
                      userEmail === 'admin@myseniorvalet.com';
      
      return res.json({
        role: isAdmin ? 'super_admin' : 'user',
        email: userEmail,
        firstName: req.user.claims.given_name || '',
        lastName: req.user.claims.family_name || ''
      });
    }
    
    // No user found
    res.status(401).json({ message: 'Not authenticated' });
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

  // Initialize WebSocket for real-time family messaging
  try {
    const { WebSocketServer } = await import('ws');
    
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    // Track connection states separately to avoid property conflicts
    const connectionStates = new WeakMap();
    
    wss.on('connection', (ws) => {
      console.log('✅ Family messaging WebSocket connection established');
      
      // Use WeakMap to track connection state instead of setting properties directly
      connectionStates.set(ws, { isAlive: true });
      
      ws.on('pong', () => { 
        const state = connectionStates.get(ws);
        if (state) state.isAlive = true;
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'MySeniorValet family messaging ready',
        timestamp: new Date().toISOString()
      }));
      
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📧 Family message received:', message.type);
          
          // Echo message back to confirm receipt
          ws.send(JSON.stringify({
            type: 'message_received',
            originalType: message.type,
            timestamp: new Date().toISOString(),
            status: 'processed'
          }));
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      ws.on('close', () => {
        console.log('Family messaging WebSocket connection closed');
        connectionStates.delete(ws);
      });
      
      ws.on('error', (error: Error) => {
        console.error('Family messaging WebSocket error:', error);
      });
    });
    
    // Keep-alive ping interval
    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        const state = connectionStates.get(ws);
        if (!state || state.isAlive === false) {
          ws.terminate();
          connectionStates.delete(ws);
          return;
        }
        state.isAlive = false;
        ws.ping();
      });
    }, 30000);
    
    wss.on('close', () => {
      clearInterval(interval);
    });
    
    console.log('✅ Family messaging WebSocket service initialized on /ws');
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket service:', error);
  }

  return httpServer;
}