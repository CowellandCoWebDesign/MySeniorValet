import { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "../replitAuth";
import { setupAuthBypass } from "../auth-bypass";
import { communityStatsCache } from "../community-stats-cache";

// Import route modules
import { registerCommunityRoutes } from "./communityRoutes";
import { registerUserRoutes } from "./userRoutes";
import { registerAIRoutes } from "./aiRoutes";
import { registerPerplexityRoutes } from "./perplexityRoutes";
import { registerPerplexityTestRoutes } from "./perplexityTestRoutes";
import { registerAIInsightsRoutes } from "./aiInsightsRoutes";
import { registerSemanticSearchRoutes } from "./semanticSearchRoutes";
import autocompleteRoutes from "./autocompleteRoutes";

import { registerAdminRoutes } from "./adminRoutes";
import { registerVendorRoutes } from "./vendorRoutes";
import { registerSearchRoutes } from "./searchRoutes";
import { registerUnifiedSearchRoutes } from "./unifiedSearchRoutes";
import { registerMappingRoutes } from "./mappingRoutes";
import { registerMappingFixRoutes } from "./mappingFixRoutes";
import { registerMultiAITestRoutes } from "./multiAiTestRoutes";
import { registerAuthRoutes } from "./authRoutes";
import { registerQuickAuthRoutes } from "./quickAuthRoutes";
import { registerTourRoutes } from "./tourRoutes";
import { registerClaimRoutes } from "./claimRoutes";
import { registerReviewRoutes } from "./reviewRoutes";
import { registerFamilyRoutes } from "./familyRoutes";
import { registerPaymentRoutes } from "./paymentRoutes";
import { registerStatsRoutes } from "./statsRoutes";
import { registerPricingRoutes } from "./pricingRoutes";
import notificationRoutes from "./notificationRoutes";
import { registerDocumentRoutes } from "./documentRoutes";
import { registerSecurityRoutes } from "./securityRoutes";
import { registerInfrastructureRoutes } from "./infrastructureRoutes";
import { registerEmailRoutes } from "./emailRoutes";
import { registerFloralRoutes } from "./floralRoutes";
import { registerMoveInServicesRoutes } from "./moveInServicesRoutes";
import movingRoutes from "./movingRoutes";
import transportationRoutes from "./transportationRoutes";
import familyConnectRoutes from "./familyConnectRoutes";
import amazonProductRoutes from "./amazonProductRoutes";
import servicesManagementRoutes from "./servicesManagementRoutes";
import { featureAccessRouter } from "./featureAccessRoutes";
import { analyticsRoutes } from "./analyticsRoutes";
import { setupVAResourcesRoutes } from "./vaResourcesRoutes";
import { setupSeniorResourcesRoutes } from "./seniorResourcesRoutes";
import authenticPricingRoutes from "./authentic-pricing-routes";
import weaviateRoutes from "./weaviate-routes";
import enhancedWeaviateRoutes from "./enhanced-weaviate-routes";
import { registerPlatformRoutes } from "./platformRoutes";
import { registerCommunityOnboardingRoutes } from "./communityOnboardingRoutes";
// DISABLED: Old Stripe routes - replaced by unifiedPaymentRoutes
// import { registerStripeTestRoutes } from "./stripe-test";
// import { registerStripeRealChargeRoutes } from "./stripe-real-charge-test";
// import { registerCommunityStripeRoutes } from "./community-stripe";
// import { registerVendorStripeRoutes } from "./vendor-stripe";
import unifiedPaymentRoutes from "./unifiedPaymentRoutes";

// Import existing routers
import { quizRouter } from "./quiz";
import reservationRoutes from "./reservations";
import financialRoutes from "./financial-api";
import { registerLegalRoutes } from "./legal-api";
import seniorServicesRoutes from "./senior-services";
import realDataRoutes from "./real-data-api";
import socialMediaRoutes from "./social-media-api";
import emailCampaignRoutes from "./email-campaign-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Replit Auth before other routes
  await setupAuth(app);

  // Initialize community stats cache on startup (non-blocking)
  communityStatsCache.initialize().catch(error => {
    console.error('Failed to initialize community stats cache:', error);
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Register all route modules - ORDER MATTERS!
  registerAuthRoutes(app);
  registerQuickAuthRoutes(app);
  registerPlatformRoutes(app);
  
  // Register community onboarding routes
  registerCommunityOnboardingRoutes(app);
  // CRITICAL: Register mapping routes BEFORE community routes to prevent /:id interception
  registerMappingRoutes(app);
  registerMappingFixRoutes(app);
  registerUnifiedSearchRoutes(app); // Unified search handles both text and map searches
  registerMultiAITestRoutes(app);
  registerCommunityRoutes(app);
  registerUserRoutes(app);
  registerSearchRoutes(app);
  registerAIRoutes(app);
  registerPerplexityRoutes(app);
  registerPerplexityTestRoutes(app);
  registerAIInsightsRoutes(app);
  registerSemanticSearchRoutes(app); // Register semantic search for natural language understanding
  app.use('/api', autocompleteRoutes); // Register autocomplete routes

  registerAdminRoutes(app);
  registerVendorRoutes(app);
  registerTourRoutes(app);
  registerClaimRoutes(app);
  registerReviewRoutes(app);
  registerFamilyRoutes(app);
  
  // Payment Routes - DISABLED to prevent conflicts with unifiedPaymentRoutes
  // registerPaymentRoutes(app); // DISABLED - using unifiedPaymentRoutes instead
  // registerStripeTestRoutes(app); // DISABLED - replaced by unified system
  // registerStripeRealChargeRoutes(app); // DISABLED - replaced by unified system
  // registerCommunityStripeRoutes(app); // DISABLED - replaced by unified system
  // registerVendorStripeRoutes(app); // DISABLED - replaced by unified system
  
  // Unified Payment System (handles all tiers with Stripe Elements & Webhooks)
  app.use('/api/payments', unifiedPaymentRoutes);
  
  registerStatsRoutes(app);
  registerPricingRoutes(app);
  app.use(notificationRoutes);
  registerDocumentRoutes(app);
  registerSecurityRoutes(app);
  registerInfrastructureRoutes(app);
  registerEmailRoutes(app);
  registerFloralRoutes(app);
  registerMoveInServicesRoutes(app);
  app.use(analyticsRoutes);
  setupVAResourcesRoutes(app);
  setupSeniorResourcesRoutes(app);
  
  // Register moving services routes
  movingRoutes(app);
  
  // Register transportation services routes
  app.use('/api/transportation', transportationRoutes);
  
  // Register family connect routes
  app.use('/api/family-connect', familyConnectRoutes);
  
  // Register Amazon product routes
  app.use('/api/amazon-products', amazonProductRoutes);
  
  // Register services management routes
  app.use('/api/services-management', servicesManagementRoutes);
  
  // Register feature access routes
  app.use('/api/features', featureAccessRouter);
  
  // Register authentic pricing routes
  app.use('/api/authentic-pricing', authenticPricingRoutes);

  // Register Weaviate semantic search routes
  app.use('/api/weaviate', weaviateRoutes);
  
  // Register Enhanced Weaviate AI-native routes
  app.use('/api/weaviate-enhanced', enhancedWeaviateRoutes);
  
  // Register Canadian community routes
  const canadianRoutes = await import('./canadianRoutes');
  app.use('/api/communities', canadianRoutes.default);

  // Register existing specialized routers
  app.use('/api/quiz', quizRouter);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/financial', financialRoutes);
  registerLegalRoutes(app);
  app.use('/api/services', seniorServicesRoutes);
  app.use('/api/real-data', realDataRoutes);
  app.use('/api/social-media', socialMediaRoutes);
  app.use('/api/email-campaign', emailCampaignRoutes);

  return httpServer;
}