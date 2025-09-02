import { type Express } from "express";
import { leadTrackingService } from "../services/lead-tracking.service";

export function registerLeadTrackingRoutes(app: Express) {
  const leadService = leadTrackingService;

  // Get leads for a specific community
  app.get("/api/communities/:id/leads", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const leads = await leadService.getLeads(communityId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Get lead analytics for a specific community
  app.get("/api/communities/:id/leads/analytics", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const analytics = await leadService.getAnalytics(communityId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching lead analytics:", error);
      res.status(500).json({ error: "Failed to fetch lead analytics" });
    }
  });

  // Create a new lead
  app.post("/api/communities/:id/leads", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const leadData = {
        ...req.body,
        communityId
      };

      const newLead = await leadService.createLead(leadData);
      res.status(201).json(newLead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Update a lead
  app.put("/api/leads/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      const updatedLead = await leadService.updateLead(leadId, req.body);
      
      if (!updatedLead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Delete a lead - Not implemented yet
  app.delete("/api/leads/:leadId", async (req, res) => {
    // TODO: Implement lead deletion in service
    res.status(501).json({ error: "Lead deletion not yet implemented" });
  });

  // Track lead activity
  app.post("/api/leads/:leadId/activity", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      await leadService.trackActivity(leadId, req.body);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error tracking lead activity:", error);
      res.status(500).json({ error: "Failed to track activity" });
    }
  });

  // Get lead activities
  app.get("/api/leads/:leadId/activities", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      const activities = await leadService.getActivities(leadId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Configure CRM integration
  app.post("/api/communities/:id/leads/crm-integration", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const integration = await leadService.setupCRMIntegration(communityId, req.body);
      res.json(integration);
    } catch (error) {
      console.error("Error configuring CRM integration:", error);
      res.status(500).json({ error: "Failed to configure CRM integration" });
    }
  });

  // Get CRM integration status
  app.get("/api/communities/:id/leads/crm-integration", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // TODO: Implement getCRMIntegration method in service
      // For now, return default status
      res.json({ enabled: false, provider: null });
    } catch (error) {
      console.error("Error fetching CRM integration:", error);
      res.status(500).json({ error: "Failed to fetch CRM integration" });
    }
  });

  console.log("✅ Lead tracking routes registered");
}