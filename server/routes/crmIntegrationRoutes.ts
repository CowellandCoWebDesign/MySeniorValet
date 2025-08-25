import { type Express } from "express";
import { isAuthenticated, isAdmin } from "../auth-middleware";
import { crmIntegrationService, type CRMProvider } from "../services/crm-integration-service";
import { z } from "zod";

// Configuration schemas for each CRM provider
const AlineConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url("Valid base URL is required"),
  webhookUrl: z.string().url().optional(),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('hourly')
});

const YardiConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  baseUrl: z.string().url("Valid base URL is required"),
  webhookUrl: z.string().url().optional(),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('hourly'),
  dataMapping: z.record(z.string()).optional()
});

const VitalsConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url("Valid base URL is required"),
  webhookUrl: z.string().url().optional(),
  syncFrequency: z.enum(['real_time', 'hourly', 'daily']).default('daily'),
  dataMapping: z.record(z.string()).optional()
});

export function registerCRMIntegrationRoutes(app: Express) {
  
  // Get all CRM integrations for a community
  app.get("/api/crm-integrations/:communityId", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const integrations = await crmIntegrationService.getCommunityIntegrations(communityId);
      
      // Remove sensitive configuration data from response
      const sanitizedIntegrations = integrations.map(integration => ({
        ...integration,
        configuration: {
          baseUrl: integration.configuration.baseUrl,
          syncFrequency: integration.configuration.syncFrequency,
          hasWebhook: !!integration.configuration.webhookUrl
        }
      }));

      res.json({ integrations: sanitizedIntegrations });
    } catch (error) {
      console.error("Error fetching CRM integrations:", error);
      res.status(500).json({ error: "Failed to fetch CRM integrations" });
    }
  });

  // Configure ALINE integration
  app.post("/api/crm-integrations/:communityId/aline", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const config = AlineConfigSchema.parse(req.body);
      
      const result = await crmIntegrationService.configureCRMIntegration(
        communityId, 
        'aline', 
        config
      );

      res.json({ 
        success: true, 
        message: "ALINE integration configured successfully",
        integration: {
          id: result.integration.id,
          provider: result.integration.provider,
          status: result.integration.status,
          lastSync: result.integration.lastSync
        },
        testResult: result.testResult
      });
    } catch (error) {
      console.error("ALINE integration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid configuration", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to configure ALINE integration",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Configure Yardi integration
  app.post("/api/crm-integrations/:communityId/yardi", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const config = YardiConfigSchema.parse(req.body);
      
      const result = await crmIntegrationService.configureCRMIntegration(
        communityId, 
        'yardi', 
        config
      );

      res.json({ 
        success: true, 
        message: "Yardi integration configured successfully",
        integration: {
          id: result.integration.id,
          provider: result.integration.provider,
          status: result.integration.status,
          lastSync: result.integration.lastSync
        },
        testResult: result.testResult
      });
    } catch (error) {
      console.error("Yardi integration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid configuration", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to configure Yardi integration",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Configure Vitals integration
  app.post("/api/crm-integrations/:communityId/vitals", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const config = VitalsConfigSchema.parse(req.body);
      
      const result = await crmIntegrationService.configureCRMIntegration(
        communityId, 
        'vitals', 
        config
      );

      res.json({ 
        success: true, 
        message: "Vitals integration configured successfully",
        integration: {
          id: result.integration.id,
          provider: result.integration.provider,
          status: result.integration.status,
          lastSync: result.integration.lastSync
        },
        testResult: result.testResult
      });
    } catch (error) {
      console.error("Vitals integration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid configuration", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to configure Vitals integration",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test CRM connection
  app.post("/api/crm-integrations/:communityId/:provider/test", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const provider = req.params.provider as CRMProvider;

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      if (!['aline', 'yardi', 'vitals'].includes(provider)) {
        return res.status(400).json({ error: "Invalid CRM provider" });
      }

      const testResult = await crmIntegrationService.testConnection(provider, req.body);
      res.json({ testResult });
    } catch (error) {
      console.error("CRM connection test error:", error);
      res.status(500).json({ 
        error: "Connection test failed",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync data from CRM
  app.post("/api/crm-integrations/:communityId/:provider/sync", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const provider = req.params.provider as CRMProvider;

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      if (!['aline', 'yardi', 'vitals'].includes(provider)) {
        return res.status(400).json({ error: "Invalid CRM provider" });
      }

      let syncResult;
      switch (provider) {
        case 'aline':
          syncResult = await crmIntegrationService.syncAlineLeads(communityId);
          break;
        case 'yardi':
          syncResult = await crmIntegrationService.syncYardiProspects(communityId);
          break;
        case 'vitals':
          syncResult = await crmIntegrationService.syncVitalsPatients(communityId);
          break;
      }

      if (syncResult.success) {
        res.json({
          success: true,
          message: `${provider.toUpperCase()} data synced successfully`,
          dataCount: Array.isArray(syncResult.leads) ? syncResult.leads.length : 
                     Array.isArray(syncResult.prospects) ? syncResult.prospects.length :
                     Array.isArray(syncResult.patients) ? syncResult.patients.length : 0
        });
      } else {
        res.status(500).json({
          error: `Failed to sync ${provider.toUpperCase()} data`,
          message: syncResult.error
        });
      }
    } catch (error) {
      console.error("CRM sync error:", error);
      res.status(500).json({ 
        error: "Sync operation failed",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Disable CRM integration
  app.delete("/api/crm-integrations/:communityId/:provider", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      const provider = req.params.provider as CRMProvider;

      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      if (!['aline', 'yardi', 'vitals'].includes(provider)) {
        return res.status(400).json({ error: "Invalid CRM provider" });
      }

      await crmIntegrationService.disableIntegration(communityId, provider);
      
      res.json({ 
        success: true, 
        message: `${provider.toUpperCase()} integration disabled successfully` 
      });
    } catch (error) {
      console.error("CRM disable integration error:", error);
      res.status(500).json({ 
        error: "Failed to disable integration",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get sync statistics
  app.get("/api/crm-integrations/:communityId/stats", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const stats = await crmIntegrationService.getSyncStats(communityId);
      res.json({ stats });
    } catch (error) {
      console.error("Error fetching CRM stats:", error);
      res.status(500).json({ error: "Failed to fetch CRM statistics" });
    }
  });

  // Webhook endpoints for real-time data sync
  app.post("/api/crm-webhooks/aline/:communityId", async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      console.log(`Received ALINE webhook for community ${communityId}:`, req.body);
      
      // TODO: Process ALINE webhook data
      // This would typically validate the webhook signature and process the incoming data
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("ALINE webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  app.post("/api/crm-webhooks/yardi/:communityId", async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      console.log(`Received Yardi webhook for community ${communityId}:`, req.body);
      
      // TODO: Process Yardi webhook data
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Yardi webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  app.post("/api/crm-webhooks/vitals/:communityId", async (req, res) => {
    try {
      const communityId = parseInt(req.params.communityId);
      console.log(`Received Vitals webhook for community ${communityId}:`, req.body);
      
      // TODO: Process Vitals webhook data
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Vitals webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}