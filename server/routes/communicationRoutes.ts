import { type Express } from "express";
import { isAuthenticated, isAdmin } from "../auth-middleware";
import { ZoomIntegration } from "../zoom-integration";
import { WhatsAppBusinessIntegration } from "../whatsapp-business-integration";
import { z } from "zod";

// Initialize integrations
const zoomIntegration = new ZoomIntegration();
const whatsappIntegration = new WhatsAppBusinessIntegration();

// Validation schemas
const VirtualTourSchema = z.object({
  communityName: z.string(),
  tourDateTime: z.string(),
  familyMembers: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['primary', 'secondary'])
  })),
  communityContact: z.object({
    name: z.string(),
    email: z.string().email(),
    title: z.string()
  }),
  tourType: z.enum(['live_guided', 'self_guided', 'hybrid']),
  duration: z.number().min(15).max(120),
  specialRequests: z.array(z.string()).optional().default([])
});

const WhatsAppUpdateSchema = z.object({
  recipientNumbers: z.array(z.string()),
  familyMemberName: z.string(),
  updateType: z.enum(['tour_scheduled', 'application_submitted', 'move_in_confirmed', 'emergency_alert']),
  communityName: z.string(),
  details: z.string(),
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh']).default('en')
});

export function registerCommunicationRoutes(app: Express) {
  
  // ===== ZOOM INTEGRATION ROUTES =====
  
  // Create virtual tour via Zoom
  app.post("/api/communications/zoom/virtual-tour", isAuthenticated, async (req, res) => {
    try {
      const tourData = VirtualTourSchema.parse(req.body);
      
      const result = await zoomIntegration.createVirtualTour(tourData);
      
      res.json({
        success: true,
        message: "Virtual tour scheduled successfully",
        tour: result
      });
    } catch (error) {
      console.error("Zoom virtual tour error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid tour data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to schedule virtual tour",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Schedule family consultation via Zoom
  app.post("/api/communications/zoom/consultation", isAuthenticated, async (req, res) => {
    try {
      const consultationData = req.body;
      
      const meetingUrl = await zoomIntegration.setupFamilyConsultation(consultationData);
      
      res.json({
        success: true,
        message: "Family consultation scheduled successfully",
        meetingUrl
      });
    } catch (error) {
      console.error("Zoom consultation error:", error);
      res.status(500).json({ 
        error: "Failed to schedule consultation",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get Zoom meeting status (placeholder - method needs implementation)
  app.get("/api/communications/zoom/meeting/:meetingId", isAuthenticated, async (req, res) => {
    try {
      const { meetingId } = req.params;
      
      // TODO: Implement getMeetingStatus method in ZoomIntegration
      res.json({
        success: true,
        meetingId,
        status: 'pending_implementation'
      });
    } catch (error) {
      console.error("Zoom meeting status error:", error);
      res.status(500).json({ 
        error: "Failed to get meeting status",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== WHATSAPP INTEGRATION ROUTES =====
  
  // Send family update via WhatsApp
  app.post("/api/communications/whatsapp/family-update", isAuthenticated, async (req, res) => {
    try {
      const updateData = WhatsAppUpdateSchema.parse(req.body);
      
      const result = await whatsappIntegration.sendFamilyUpdate(updateData);
      
      res.json({
        success: true,
        message: "WhatsApp updates sent",
        result
      });
    } catch (error) {
      console.error("WhatsApp update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid update data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: "Failed to send WhatsApp updates",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Send tour invitation via WhatsApp
  app.post("/api/communications/whatsapp/tour-invitation", isAuthenticated, async (req, res) => {
    try {
      const invitationData = req.body;
      
      const result = await whatsappIntegration.sendTourInvitation(invitationData);
      
      res.json({
        success: true,
        message: "Tour invitations sent via WhatsApp",
        result
      });
    } catch (error) {
      console.error("WhatsApp invitation error:", error);
      res.status(500).json({ 
        error: "Failed to send tour invitations",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Send emergency alert via WhatsApp
  app.post("/api/communications/whatsapp/emergency-alert", isAuthenticated, async (req, res) => {
    try {
      const alertData = req.body;
      
      // Use sendFamilyUpdate with emergency_alert type
      const result = await whatsappIntegration.sendFamilyUpdate({
        ...alertData,
        updateType: 'emergency_alert'
      });
      
      res.json({
        success: true,
        message: "Emergency alerts sent via WhatsApp",
        result
      });
    } catch (error) {
      console.error("WhatsApp emergency alert error:", error);
      res.status(500).json({ 
        error: "Failed to send emergency alerts",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get WhatsApp message status (placeholder - method needs implementation)
  app.get("/api/communications/whatsapp/status/:messageId", isAuthenticated, async (req, res) => {
    try {
      const { messageId } = req.params;
      
      // TODO: Implement getMessageStatus method in WhatsAppBusinessIntegration
      res.json({
        success: true,
        messageId,
        status: 'pending_implementation'
      });
    } catch (error) {
      console.error("WhatsApp status error:", error);
      res.status(500).json({ 
        error: "Failed to get message status",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== INTEGRATION STATUS ROUTES =====
  
  // Check Zoom integration status
  app.get("/api/communications/zoom/status", isAuthenticated, async (req, res) => {
    try {
      const isConfigured = !!process.env.ZOOM_ACCESS_TOKEN && !!process.env.ZOOM_ACCOUNT_ID;
      
      res.json({
        success: true,
        provider: 'zoom',
        configured: isConfigured,
        features: [
          'virtual_tours',
          'family_consultations',
          'group_meetings',
          'recording',
          'screen_sharing'
        ]
      });
    } catch (error) {
      console.error("Zoom status error:", error);
      res.status(500).json({ 
        error: "Failed to check Zoom status"
      });
    }
  });

  // Check WhatsApp integration status
  app.get("/api/communications/whatsapp/status", isAuthenticated, async (req, res) => {
    try {
      const isConfigured = !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      res.json({
        success: true,
        provider: 'whatsapp',
        configured: isConfigured,
        features: [
          'family_updates',
          'tour_invitations',
          'emergency_alerts',
          'multilingual_support',
          'international_messaging'
        ]
      });
    } catch (error) {
      console.error("WhatsApp status error:", error);
      res.status(500).json({ 
        error: "Failed to check WhatsApp status"
      });
    }
  });

  console.log('✅ Communication routes (Zoom, WhatsApp) registered');
}