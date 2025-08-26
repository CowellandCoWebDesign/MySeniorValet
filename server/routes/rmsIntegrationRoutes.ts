import { type Express } from "express";
import { isAuthenticated, isAdmin } from "../auth-middleware";
import { rmsIntegrationService, type RMSProvider } from "../services/rms-integration-service";
import { z } from "zod";

// Configuration schemas for each RMS provider
const AlineRMSConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url("Valid base URL is required"),
  revenueEndpoint: z.string().url().optional(),
  pricingEndpoint: z.string().url().optional(),
  occupancyEndpoint: z.string().url().optional(),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('hourly'),
  enabledFeatures: z.array(z.enum(['pricing', 'occupancy', 'revenue', 'forecasting', 'competitive'])).default(['pricing', 'occupancy', 'revenue'])
});

const YardiRMSConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  baseUrl: z.string().url("Valid base URL is required"),
  revenueEndpoint: z.string().url().optional(),
  pricingEndpoint: z.string().url().optional(),
  occupancyEndpoint: z.string().url().optional(),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('hourly'),
  enabledFeatures: z.array(z.enum(['pricing', 'occupancy', 'revenue', 'forecasting', 'competitive'])).default(['pricing', 'occupancy', 'revenue'])
});

const LCSRMSConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url("Valid base URL is required"),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('daily'),
  enabledFeatures: z.array(z.enum(['pricing', 'occupancy', 'revenue', 'forecasting', 'competitive'])).default(['pricing', 'occupancy'])
});

const REPSRMSConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url("Valid base URL is required"),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('hourly'),
  enabledFeatures: z.array(z.enum(['pricing', 'occupancy', 'revenue', 'forecasting', 'competitive'])).default(['pricing', 'revenue', 'competitive'])
});

export function registerRMSIntegrationRoutes(app: Express) {
  
  // Get all RMS integrations for a community
  app.get("/api/rms/integrations/:communityId", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const integrations = await rmsIntegrationService.getRMSIntegrationStatus(communityId);
      
      // Remove sensitive configuration data from response
      const sanitizedIntegrations = integrations.map(integration => ({
        ...integration,
        configuration: {
          baseUrl: integration.configuration.baseUrl,
          syncFrequency: integration.configuration.syncFrequency,
          enabledFeatures: integration.configuration.enabledFeatures,
          hasWebhook: !!integration.configuration.webhookUrl
        }
      }));

      res.json(sanitizedIntegrations);
    } catch (error) {
      console.error("Error fetching RMS integrations:", error);
      res.status(500).json({ error: "Failed to fetch RMS integrations" });
    }
  });

  // Configure RMS integration
  app.post("/api/rms/configure", isAuthenticated, async (req, res) => {
    try {
      const { communityId, provider, config } = req.body;

      if (!communityId || !provider || !config) {
        return res.status(400).json({ error: "Missing required fields: communityId, provider, config" });
      }

      // Validate configuration based on provider
      let validatedConfig;
      try {
        switch (provider) {
          case 'aline':
            validatedConfig = AlineRMSConfigSchema.parse(config);
            break;
          case 'yardi':
            validatedConfig = YardiRMSConfigSchema.parse(config);
            break;
          case 'lcs':
            validatedConfig = LCSRMSConfigSchema.parse(config);
            break;
          case 'reps':
            validatedConfig = REPSRMSConfigSchema.parse(config);
            break;
          default:
            return res.status(400).json({ error: `Unsupported RMS provider: ${provider}` });
        }
      } catch (validationError: any) {
        return res.status(400).json({ 
          error: "Invalid configuration", 
          details: validationError.errors 
        });
      }

      const result = await rmsIntegrationService.configureRMSIntegration(
        parseInt(communityId), 
        provider as RMSProvider, 
        validatedConfig
      );

      res.json({ 
        success: true, 
        integration: {
          ...result.integration,
          configuration: {
            baseUrl: result.integration.configuration.baseUrl,
            syncFrequency: result.integration.configuration.syncFrequency,
            enabledFeatures: result.integration.configuration.enabledFeatures
          }
        },
        testResult: result.testResult 
      });
    } catch (error) {
      console.error("Error configuring RMS integration:", error);
      res.status(500).json({ 
        error: "Failed to configure RMS integration",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Manually sync RMS data
  app.post("/api/rms/sync", isAuthenticated, async (req, res) => {
    try {
      const { communityId, provider } = req.body;

      if (!communityId || !provider) {
        return res.status(400).json({ error: "Missing required fields: communityId, provider" });
      }

      await rmsIntegrationService.fetchRMSData(parseInt(communityId), provider as RMSProvider);

      res.json({ success: true, message: "RMS data synced successfully" });
    } catch (error) {
      console.error("Error syncing RMS data:", error);
      res.status(500).json({ 
        error: "Failed to sync RMS data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get RMS revenue data for a community
  app.get("/api/rms/revenue-data/:communityId", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const provider = req.query.provider as RMSProvider | undefined;

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const revenueData = await rmsIntegrationService.getLatestRMSData(communityId, provider);

      res.json(revenueData);
    } catch (error) {
      console.error("Error fetching RMS revenue data:", error);
      res.status(500).json({ error: "Failed to fetch RMS revenue data" });
    }
  });

  // Get RMS analytics summary for a community
  app.get("/api/rms/analytics/:communityId", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const analytics = await rmsIntegrationService.getRMSAnalyticsSummary(communityId);

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching RMS analytics:", error);
      res.status(500).json({ error: "Failed to fetch RMS analytics" });
    }
  });

  // Test RMS connection (admin only)
  app.post("/api/rms/test-connection", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { provider, config } = req.body;

      if (!provider || !config) {
        return res.status(400).json({ error: "Missing required fields: provider, config" });
      }

      const testResult = await rmsIntegrationService.testRMSConnection(provider as RMSProvider, config);

      res.json(testResult);
    } catch (error) {
      console.error("Error testing RMS connection:", error);
      res.status(500).json({ 
        error: "Failed to test RMS connection",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Sync all active RMS integrations (admin only)
  app.post("/api/rms/sync-all", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await rmsIntegrationService.syncAllActiveRMSIntegrations();

      res.json({ 
        success: true, 
        message: "All RMS integrations have been synced" 
      });
    } catch (error) {
      console.error("Error syncing all RMS integrations:", error);
      res.status(500).json({ 
        error: "Failed to sync all RMS integrations",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete RMS integration (admin only)
  app.delete("/api/rms/integrations/:communityId/:provider", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const provider = req.params.provider as RMSProvider;

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // TODO: Implement delete functionality in RMSIntegrationService
      res.status(501).json({ error: "Delete functionality not yet implemented" });
    } catch (error) {
      console.error("Error deleting RMS integration:", error);
      res.status(500).json({ error: "Failed to delete RMS integration" });
    }
  });

  // Get RMS provider capabilities
  app.get("/api/rms/providers", async (req, res) => {
    try {
      const providers = [
        {
          id: 'aline',
          name: 'ALINE (formerly Glennis)',
          description: 'Complete revenue management with dynamic pricing and market intelligence',
          capabilities: ['pricing', 'occupancy', 'revenue', 'forecasting', 'competitive'],
          supportedFeatures: [
            'Real-time pricing updates',
            'Market analysis and competitive intelligence',
            'Revenue forecasting and demand prediction',
            'Occupancy optimization',
            'Dynamic pricing recommendations'
          ],
          icon: '💰',
          color: '#10b981'
        },
        {
          id: 'yardi',
          name: 'Yardi RMS',
          description: 'Comprehensive property revenue management with rent optimization',
          capabilities: ['pricing', 'occupancy', 'revenue', 'forecasting'],
          supportedFeatures: [
            'Rent optimization algorithms',
            'Market rent analysis',
            'Lease management integration',
            'Revenue analytics and reporting',
            'Concession management'
          ],
          icon: '📊',
          color: '#3b82f6'
        },
        {
          id: 'lcs',
          name: 'LCS RMS',
          description: 'Senior living specific revenue management and pricing optimization',
          capabilities: ['pricing', 'occupancy', 'revenue'],
          supportedFeatures: [
            'Care level based pricing',
            'Senior living occupancy analytics',
            'Specialized senior care metrics',
            'Market positioning analysis'
          ],
          icon: '🏠',
          color: '#8b5cf6'
        },
        {
          id: 'reps',
          name: 'REPS',
          description: 'Real Estate Portfolio Solutions revenue management platform',
          capabilities: ['pricing', 'revenue', 'competitive', 'forecasting'],
          supportedFeatures: [
            'Portfolio-wide analytics',
            'Multi-property revenue optimization',
            'Competitive market intelligence',
            'Performance benchmarking'
          ],
          icon: '📈',
          color: '#f97316'
        },
        {
          id: 'onesite',
          name: 'OneSite RMS',
          description: 'Integrated property management with revenue optimization',
          capabilities: ['pricing', 'occupancy', 'revenue'],
          supportedFeatures: [
            'Integrated PMS and RMS',
            'Automated pricing adjustments',
            'Occupancy trend analysis',
            'Revenue performance tracking'
          ],
          icon: '🏢',
          color: '#06b6d4'
        },
        {
          id: 'entrata',
          name: 'Entrata RMS',
          description: 'AI-powered revenue management for multifamily properties',
          capabilities: ['pricing', 'occupancy', 'revenue', 'forecasting'],
          supportedFeatures: [
            'AI-driven pricing recommendations',
            'Demand forecasting',
            'Market analysis',
            'Revenue optimization'
          ],
          icon: '🤖',
          color: '#ec4899'
        }
      ];

      res.json(providers);
    } catch (error) {
      console.error("Error fetching RMS providers:", error);
      res.status(500).json({ error: "Failed to fetch RMS providers" });
    }
  });

  // RMS health check endpoint
  app.get("/api/rms/health", async (req, res) => {
    try {
      const healthStatus = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        capabilities: [
          'Revenue Management Integration',
          'Real-time Pricing Data',
          'Occupancy Analytics',
          'Market Intelligence',
          'Competitive Analysis',
          'Demand Forecasting'
        ],
        supportedProviders: ['aline', 'yardi', 'lcs', 'reps', 'onesite', 'entrata']
      };

      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'RMS service unavailable'
      });
    }
  });
}