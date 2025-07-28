import { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "../replitAuth";
import { communityStatsCache } from "../community-stats-cache";

// Import route modules
import { registerCommunityRoutes } from "./communityRoutes";
import { registerUserRoutes } from "./userRoutes";
import { registerAIRoutes } from "./aiRoutes";
import { registerAdminRoutes } from "./adminRoutes";
import { registerVendorRoutes } from "./vendorRoutes";
import { registerSearchRoutes } from "./searchRoutes";
import { registerAuthRoutes } from "./authRoutes";
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
import movingRoutes from "./movingRoutes";

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

  // Register all route modules
  registerAuthRoutes(app);
  registerCommunityRoutes(app);
  registerUserRoutes(app);
  registerSearchRoutes(app);
  registerAIRoutes(app);
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
  
  // Register moving services routes
  movingRoutes(app);

  // Register existing specialized routers
  app.use('/api/quiz', quizRouter);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/financial', financialRoutes);
  app.use('/api/senior-services', seniorServicesRoutes);
  app.use('/api/real-data', realDataRoutes);

  return httpServer;
}