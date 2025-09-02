import { type Express } from "express";
import { isAuthenticated, isAdmin } from "../auth-middleware";
import { salesforceCRM } from "../salesforce-crm-integration";
import { z } from "zod";

// Validation schemas
const CreateLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  company: z.string().default("Senior Living Inquiry"),
  interestedCommunities: z.array(z.string()),
  careLevel: z.string(),
  budget: z.string(),
  timeline: z.string(),
  source: z.string().default("MySeniorValet")
});

const UpdateActivitySchema = z.object({
  leadId: z.string(),
  type: z.enum(['tour_scheduled', 'tour_completed', 'application_started', 'moved_in']),
  details: z.any()
});

const CreateOpportunitySchema = z.object({
  communityId: z.number(),
  leadId: z.string(),
  name: z.string(),
  stage: z.string(),
  amount: z.number(),
  closeDate: z.string()
});

export function registerSalesforceRoutes(app: Express) {
  
  // Create a new lead in Salesforce
  app.post("/api/salesforce/leads", isAuthenticated, async (req, res) => {
    try {
      const leadData = CreateLeadSchema.parse(req.body);
      
      const leadId = await salesforceCRM.createLead(leadData);
      
      res.json({
        success: true,
        message: "Lead created in Salesforce",
        leadId
      });
    } catch (error) {
      console.error("Salesforce lead creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid lead data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to create lead in Salesforce",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update lead activity in Salesforce
  app.post("/api/salesforce/leads/activity", isAuthenticated, async (req, res) => {
    try {
      const activityData = UpdateActivitySchema.parse(req.body);
      
      await salesforceCRM.updateLeadActivity(activityData.leadId, {
        type: activityData.type,
        details: activityData.details
      });
      
      res.json({
        success: true,
        message: "Lead activity updated in Salesforce"
      });
    } catch (error) {
      console.error("Salesforce activity update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid activity data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to update lead activity",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create opportunity in Salesforce
  app.post("/api/salesforce/opportunities", isAuthenticated, async (req, res) => {
    try {
      const opportunityData = CreateOpportunitySchema.parse(req.body);
      
      const opportunityId = await salesforceCRM.createOpportunity(
        opportunityData.communityId,
        opportunityData.leadId,
        {
          name: opportunityData.name,
          stage: opportunityData.stage,
          amount: opportunityData.amount,
          closeDate: opportunityData.closeDate
        }
      );
      
      res.json({
        success: true,
        message: "Opportunity created in Salesforce",
        opportunityId
      });
    } catch (error) {
      console.error("Salesforce opportunity creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid opportunity data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to create opportunity",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Check Salesforce integration status
  app.get("/api/salesforce/status", isAuthenticated, async (req, res) => {
    try {
      const isConfigured = !!(
        process.env.SALESFORCE_USERNAME && 
        process.env.SALESFORCE_PASSWORD && 
        process.env.SALESFORCE_TOKEN
      );
      
      res.json({
        success: true,
        provider: 'salesforce',
        configured: isConfigured,
        features: [
          'lead_management',
          'opportunity_tracking',
          'activity_logging',
          'automated_workflows',
          'revenue_tracking'
        ]
      });
    } catch (error) {
      console.error("Salesforce status error:", error);
      res.status(500).json({ 
        error: "Failed to check Salesforce status"
      });
    }
  });

  // Sync leads from MySeniorValet to Salesforce (batch operation)
  app.post("/api/salesforce/sync/leads", isAdmin, async (req, res) => {
    try {
      const { leads } = req.body;
      
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: "Leads must be an array" });
      }
      
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const lead of leads) {
        try {
          const leadId = await salesforceCRM.createLead(lead);
          results.push({ success: true, leadId, email: lead.email });
          successCount++;
        } catch (error) {
          results.push({ 
            success: false, 
            email: lead.email, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          errorCount++;
        }
      }
      
      res.json({
        success: true,
        message: `Synced ${successCount} leads to Salesforce`,
        totalProcessed: leads.length,
        successCount,
        errorCount,
        results
      });
    } catch (error) {
      console.error("Salesforce batch sync error:", error);
      res.status(500).json({ 
        error: "Failed to sync leads to Salesforce",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Salesforce CRM routes registered');
}