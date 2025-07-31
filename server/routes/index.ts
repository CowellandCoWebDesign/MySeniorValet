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

import { registerAdminRoutes } from "./adminRoutes";
import { registerVendorRoutes } from "./vendorRoutes";
import { registerSearchRoutes } from "./searchRoutes";
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
import { registerNotificationRoutes } from "./notificationRoutes";
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
import { registerAnalyticsRoutes } from "./analyticsRoutes";
import { setupVAResourcesRoutes } from "./vaResourcesRoutes";
import authenticPricingRoutes from "./authentic-pricing-routes";
import weaviateRoutes from "./weaviate-routes";
import enhancedWeaviateRoutes from "./enhanced-weaviate-routes";

// Import existing routers
import { quizRouter } from "./quiz";
import reservationRoutes from "./reservations";
import financialRoutes from "./financial-api";
import seniorServicesRoutes from "./senior-services";
import realDataRoutes from "./real-data-api";

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
  // CRITICAL: Register mapping routes BEFORE community routes to prevent /:id interception
  registerMappingRoutes(app);
  registerMappingFixRoutes(app);
  registerMultiAITestRoutes(app);
  registerCommunityRoutes(app);
  registerUserRoutes(app);
  registerSearchRoutes(app);
  registerAIRoutes(app);
  registerPerplexityRoutes(app);

  registerAdminRoutes(app);
  registerVendorRoutes(app);
  registerTourRoutes(app);
  registerClaimRoutes(app);
  registerReviewRoutes(app);
  registerFamilyRoutes(app);
  registerPaymentRoutes(app);
  registerStatsRoutes(app);
  registerPricingRoutes(app);
  registerNotificationRoutes(app);
  registerDocumentRoutes(app);
  registerSecurityRoutes(app);
  registerInfrastructureRoutes(app);
  registerEmailRoutes(app);
  registerFloralRoutes(app);
  registerMoveInServicesRoutes(app);
  registerAnalyticsRoutes(app);
  setupVAResourcesRoutes(app);
  
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

  // Register existing specialized routers
  app.use('/api/quiz', quizRouter);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/financial', financialRoutes);
  app.use('/api/services', seniorServicesRoutes);
  app.use('/api/real-data', realDataRoutes);

  return httpServer;
}