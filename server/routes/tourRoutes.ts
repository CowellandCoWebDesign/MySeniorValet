import { Router } from "express";
import { db } from "../db";
import { tours, tourAvailability, tourFeedback, communities, users } from "@shared/schema";
import { eq, and, gte, lte, or, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";
import { isAuthenticated } from "../auth-middleware";
import sgMail from "@sendgrid/mail";
import { format, addDays, parseISO } from "date-fns";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const router = Router();

// Generate unique confirmation code
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TM-'; // TourMate™ prefix
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Schedule Tour Request Schema
const scheduleTourSchema = z.object({
  communityId: z.number(),
  preferredDate: z.string(),
  preferredTime: z.string(),
  alternativeDate: z.string().optional(),
  alternativeTime: z.string().optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10),
  tourType: z.enum(["in-person", "virtual", "self-guided"]).default("in-person"),
  partySize: z.number().min(1).max(10).default(1),
  specialRequests: z.string().optional(),
  interestedInCareLevel: z.array(z.string()).optional(),
  source: z.enum(["website", "mobile", "phone", "email", "partner"]).default("website"),
  utmParams: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
  }).optional(),
});

// Schedule a new tour
router.post("/schedule", async (req, res) => {
  try {
    console.log("Received tour data:", JSON.stringify(req.body, null, 2));
    
    // Validate and parse tour data
    let tourData;
    try {
      tourData = scheduleTourSchema.parse(req.body);
    } catch (zodError: any) {
      console.error("Validation error details:", JSON.stringify(zodError.errors, null, 2));
      console.error("Problem field:", zodError.errors[0]?.path);
      return res.status(400).json({ error: zodError.errors });
    }
    
    const userId = (req as any).user?.claims?.sub || null;
    
    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();
    
    // Create the tour - using snake_case field names as defined in schema
    const tourInsertData = {
      user_id: userId,
      community_id: tourData.communityId,
      preferred_date: tourData.preferredDate,
      preferred_time: tourData.preferredTime,
      alternative_date: tourData.alternativeDate || null,
      alternative_time: tourData.alternativeTime || null,
      contact_name: tourData.contactName,
      contact_email: tourData.contactEmail,
      contact_phone: tourData.contactPhone,
      tour_type: tourData.tourType as "in-person" | "virtual" | "self-guided",
      party_size: tourData.partySize,
      special_requests: tourData.specialRequests || null,
      interested_in_care_level: tourData.interestedInCareLevel || [],
      source: tourData.source as "website" | "mobile" | "phone" | "email" | "partner",
      utm_params: tourData.utmParams || null,
      confirmation_code: confirmationCode,
      status: "pending" as const,
    };
    
    console.log("Inserting tour data:", JSON.stringify(tourInsertData, null, 2));
    
    const [newTour] = await db.insert(tours).values(tourInsertData).returning();
    
    // Get community details for email
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, tourData.communityId));
    
    // Send confirmation email to user
    if (process.env.SENDGRID_API_KEY) {
      const userEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Tour Request Received!</h2>
          <p>Thank you for scheduling a tour with <strong>${community?.name}</strong>.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">Tour Details:</h3>
            <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
            <p><strong>Community:</strong> ${community?.name}</p>
            <p><strong>Address:</strong> ${community?.address}, ${community?.city}, ${community?.state}</p>
            <p><strong>Preferred Date:</strong> ${format(parseISO(tourData.preferredDate), 'MMMM d, yyyy')}</p>
            <p><strong>Preferred Time:</strong> ${tourData.preferredTime}</p>
            <p><strong>Tour Type:</strong> ${tourData.tourType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            <p><strong>Party Size:</strong> ${tourData.partySize} ${tourData.partySize === 1 ? 'person' : 'people'}</p>
            ${tourData.specialRequests ? `<p><strong>Special Requests:</strong> ${tourData.specialRequests}</p>` : ''}
          </div>
          
          <p>The community will contact you within 24-48 hours to confirm your tour.</p>
          
          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400E; margin: 0;"><strong>Need to reschedule?</strong> Please reference your confirmation code when contacting the community.</p>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            This tour was scheduled through MySeniorValet - The trusted platform for authentic senior living community information.
          </p>
        </div>
      `;
      
      await sgMail.send({
        to: tourData.contactEmail,
        from: "hello@myseniorvalet.com",
        subject: `Tour Confirmation - ${community?.name} - ${confirmationCode}`,
        html: userEmailHtml,
      });
      
      // Send notification to community (if they have email configured)
      if (community?.email) {
        const communityEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">New Tour Request!</h2>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1F2937; margin-top: 0;">Contact Information:</h3>
              <p><strong>Name:</strong> ${tourData.contactName}</p>
              <p><strong>Email:</strong> ${tourData.contactEmail}</p>
              <p><strong>Phone:</strong> ${tourData.contactPhone}</p>
              <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
            </div>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1F2937; margin-top: 0;">Tour Preferences:</h3>
              <p><strong>Preferred Date:</strong> ${format(parseISO(tourData.preferredDate), 'MMMM d, yyyy')}</p>
              <p><strong>Preferred Time:</strong> ${tourData.preferredTime}</p>
              ${tourData.alternativeDate ? `<p><strong>Alternative Date:</strong> ${format(parseISO(tourData.alternativeDate), 'MMMM d, yyyy')}</p>` : ''}
              ${tourData.alternativeTime ? `<p><strong>Alternative Time:</strong> ${tourData.alternativeTime}</p>` : ''}
              <p><strong>Tour Type:</strong> ${tourData.tourType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p><strong>Party Size:</strong> ${tourData.partySize} ${tourData.partySize === 1 ? 'person' : 'people'}</p>
              ${tourData.interestedInCareLevel?.length ? `<p><strong>Interested in:</strong> ${tourData.interestedInCareLevel.join(', ')}</p>` : ''}
              ${tourData.specialRequests ? `<p><strong>Special Requests:</strong> ${tourData.specialRequests}</p>` : ''}
            </div>
            
            <div style="background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1E40AF; margin: 0;"><strong>Action Required:</strong> Please contact this family within 24-48 hours to confirm their tour.</p>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              This tour request was submitted through MySeniorValet's TourMate™ system.
            </p>
          </div>
        `;
        
        await sgMail.send({
          to: community.email,
          from: "hello@myseniorvalet.com",
          subject: `New Tour Request - ${tourData.contactName} - ${confirmationCode}`,
          html: communityEmailHtml,
        });
      }
    }
    
    res.json({
      success: true,
      tour: newTour,
      confirmationCode,
      message: "Tour scheduled successfully! Check your email for confirmation.",
    });
  } catch (error: any) {
    console.error("Error scheduling tour:", error);
    res.status(400).json({
      error: error instanceof z.ZodError ? error.errors : "Failed to schedule tour",
    });
  }
});

// Get user's tours
router.get("/my-tours", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub;
    
    const userTours = await db.select({
      tour: tours,
      community: communities,
    })
      .from(tours)
      .leftJoin(communities, eq(tours.communityId, communities.id))
      .where(eq(tours.userId, userId))
      .orderBy(desc(tours.createdAt));
    
    res.json(userTours);
  } catch (error) {
    console.error("Error fetching user tours:", error);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// Get community's tours (for community dashboard)
router.get("/community/:communityId", isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const userId = (req as any).user?.claims?.sub;
    
    // Check if user has permission to view this community's tours
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId));
    
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
    
    // TODO: Add proper permission check for community owners/managers
    
    const communityTours = await db.select({
      tour: tours,
      user: users,
    })
      .from(tours)
      .leftJoin(users, eq(tours.userId, users.id))
      .where(eq(tours.communityId, communityId))
      .orderBy(desc(tours.createdAt));
    
    res.json(communityTours);
  } catch (error) {
    console.error("Error fetching community tours:", error);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// Update tour status
router.patch("/:tourId/status", isAuthenticated, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const { status, communityResponse, confirmedDate, confirmedTime } = req.body;
    
    const [updatedTour] = await db.update(tours)
      .set({
        status,
        communityResponse,
        confirmedDate,
        confirmedTime,
        updatedAt: new Date(),
      })
      .where(eq(tours.id, tourId))
      .returning();
    
    // Send email notification if status changed to confirmed
    if (status === "confirmed" && updatedTour) {
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, updatedTour.communityId));
      
      if (process.env.SENDGRID_API_KEY && updatedTour.contactEmail) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Tour Confirmed!</h2>
            <p>Great news! Your tour with <strong>${community?.name}</strong> has been confirmed.</p>
            
            <div style="background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065F46; margin-top: 0;">Confirmed Details:</h3>
              <p><strong>Date:</strong> ${format(parseISO(confirmedDate || updatedTour.preferredDate), 'MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> ${confirmedTime || updatedTour.preferredTime}</p>
              <p><strong>Location:</strong> ${community?.address}, ${community?.city}, ${community?.state}</p>
              <p><strong>Confirmation Code:</strong> ${updatedTour.confirmationCode}</p>
            </div>
            
            ${communityResponse ? `<p><strong>Message from the community:</strong> ${communityResponse}</p>` : ''}
            
            <p>We look forward to seeing you!</p>
          </div>
        `;
        
        await sgMail.send({
          to: updatedTour.contactEmail,
          from: "hello@myseniorvalet.com",
          subject: `Tour Confirmed - ${community?.name}`,
          html: emailHtml,
        });
      }
    }
    
    res.json({
      success: true,
      tour: updatedTour,
    });
  } catch (error) {
    console.error("Error updating tour status:", error);
    res.status(500).json({ error: "Failed to update tour status" });
  }
});

// Submit tour feedback
router.post("/:tourId/feedback", isAuthenticated, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const userId = (req as any).user?.claims?.sub;
    
    const [tour] = await db.select()
      .from(tours)
      .where(and(
        eq(tours.id, tourId),
        eq(tours.userId, userId)
      ));
    
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }
    
    const [feedback] = await db.insert(tourFeedback).values({
      tourId,
      userId,
      communityId: tour.communityId,
      ...req.body,
    }).returning();
    
    // Update tour to mark feedback submitted
    await db.update(tours)
      .set({
        tourCompleted: true,
        tourRating: req.body.overallRating,
        tourFeedback: req.body.tourNotes,
        updatedAt: new Date(),
      })
      .where(eq(tours.id, tourId));
    
    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Error submitting tour feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Get tour availability for a community
router.get("/availability/:communityId", async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { startDate, endDate } = req.query;
    
    const availability = await db.select()
      .from(tourAvailability)
      .where(and(
        eq(tourAvailability.communityId, communityId),
        eq(tourAvailability.isActive, true)
      ));
    
    // Get existing tours in the date range to check capacity
    const existingTours = await db.select()
      .from(tours)
      .where(and(
        eq(tours.communityId, communityId),
        gte(tours.preferredDate, startDate as string),
        lte(tours.preferredDate, endDate as string),
        or(
          eq(tours.status, "confirmed"),
          eq(tours.status, "pending")
        )
      ));
    
    res.json({
      availability,
      existingTours,
    });
  } catch (error) {
    console.error("Error fetching tour availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Set tour availability (for community owners)
router.post("/availability", isAuthenticated, async (req, res) => {
  try {
    const { communityId, availability } = req.body;
    
    // TODO: Verify user has permission to manage this community
    
    // Clear existing availability
    await db.delete(tourAvailability)
      .where(eq(tourAvailability.communityId, communityId));
    
    // Insert new availability
    const newAvailability = await db.insert(tourAvailability)
      .values(availability.map((slot: any) => ({
        ...slot,
        communityId,
      })))
      .returning();
    
    res.json({
      success: true,
      availability: newAvailability,
    });
  } catch (error) {
    console.error("Error setting tour availability:", error);
    res.status(500).json({ error: "Failed to set availability" });
  }
});

// Get tour statistics for dashboard
router.get("/stats/:communityId", isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    const stats = await db.select({
      totalTours: sql<number>`count(*)`,
      pendingTours: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
      confirmedTours: sql<number>`sum(case when status = 'confirmed' then 1 else 0 end)`,
      completedTours: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`,
      averageRating: sql<number>`avg(tour_rating)`,
      thisMonthTours: sql<number>`sum(case when created_at >= date_trunc('month', current_date) then 1 else 0 end)`,
      lastMonthTours: sql<number>`sum(case when created_at >= date_trunc('month', current_date - interval '1 month') 
        and created_at < date_trunc('month', current_date) then 1 else 0 end)`,
    })
      .from(tours)
      .where(eq(tours.communityId, communityId));
    
    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching tour statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// =============================================
// 3D TOUR MANAGEMENT ROUTES (Matterport Integration)
// =============================================

// 3D Tour validation schemas
const uploadTourSchema = z.object({
  tourUrl: z.string().url("Invalid tour URL"),
  provider: z.enum(["matterport", "kuula", "panotour", "other"]).default("matterport")
});

const updateTourSchema = z.object({
  matterportTourUrl: z.string().url("Invalid tour URL").optional(),
  tourStatus: z.enum(["active", "processing", "failed", "pending"]).optional(),
  tourPreviewImage: z.string().url().optional(),
  tourMetadata: z.object({
    duration: z.number().optional(),
    roomCount: z.number().optional(),
    totalViews: z.number().optional(),
    uploadedAt: z.string().optional(),
    uploadedBy: z.string().optional(),
    tourDescription: z.string().optional(),
    roomLabels: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
  }).optional()
});

// Helper function to validate Matterport URL and extract tour ID
function extractMatterportId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different Matterport URL formats
    if (urlObj.hostname.includes('matterport.com')) {
      // Extract from my.matterport.com/show/?m=TOUR_ID
      const mParam = urlObj.searchParams.get('m');
      if (mParam) return mParam;
      
      // Extract from direct path /show/TOUR_ID
      const pathMatch = urlObj.pathname.match(/\/show\/([^\/]+)/);
      if (pathMatch) return pathMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

// Helper function to generate embed URL from share URL
function generateEmbedUrl(shareUrl: string): string {
  try {
    const tourId = extractMatterportId(shareUrl);
    if (tourId) {
      return `https://my.matterport.com/embed/${tourId}?play=1&qs=1`;
    }
    return shareUrl;
  } catch {
    return shareUrl;
  }
}

// Get 3D tour data for a community
router.get("/communities/:id/tour", isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    // Verify user owns this community or is admin
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user has permission to view this community's tours
    const userId = (req as any).user?.claims?.sub;
    if ((req as any).user?.role !== 'admin' && 
        (req as any).user?.role !== 'super_admin' && 
        community.claimedBy !== parseInt(userId)) {
      return res.status(403).json({ message: "Not authorized to view this community's tours" });
    }

    // Check if community has access to 3D tours
    const hasAccess = ['featured', 'platinum'].includes(community.subscriptionTier || '');
    if (!hasAccess) {
      return res.status(403).json({ 
        message: "3D tours are available for Featured and Platinum tiers",
        upgradeRequired: true
      });
    }

    // Return tour data
    const tourData = {
      id: community.id,
      matterportTourId: community.matterportTourId,
      matterportTourUrl: community.matterportTourUrl,
      tourProvider: community.tourProvider,
      tourStatus: community.tourStatus,
      tourPreviewImage: community.tourPreviewImage,
      tourMetadata: community.tourMetadata || {}
    };

    res.json(tourData);
  } catch (error) {
    console.error("Error fetching 3D tour:", error);
    res.status(500).json({ message: "Failed to fetch tour data" });
  }
});

// Upload/update 3D tour for a community
router.post("/communities/:id/tour/upload", isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { tourUrl, provider } = uploadTourSchema.parse(req.body);
    
    // Verify user owns this community
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const userId = (req as any).user?.claims?.sub;
    if ((req as any).user?.role !== 'admin' && 
        (req as any).user?.role !== 'super_admin' && 
        community.claimedBy !== parseInt(userId)) {
      return res.status(403).json({ message: "Not authorized to manage this community's tours" });
    }

    // Check if community has access to 3D tours
    const hasAccess = ['featured', 'platinum'].includes(community.subscriptionTier || '');
    if (!hasAccess) {
      return res.status(403).json({ 
        message: "3D tours are available for Featured and Platinum tiers",
        upgradeRequired: true
      });
    }

    // Extract Matterport ID and generate embed URL
    const matterportId = extractMatterportId(tourUrl);
    const embedUrl = generateEmbedUrl(tourUrl);

    // Update community with tour data
    await db.update(communities)
      .set({
        matterportTourId: matterportId,
        matterportTourUrl: embedUrl,
        tourProvider: provider,
        tourStatus: "processing", // Will be updated to "active" once processed
        tourMetadata: {
          uploadedAt: new Date().toISOString(),
          uploadedBy: (req as any).user?.email || 'Unknown',
          totalViews: 0
        },
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));

    res.json({ 
      message: "Tour upload started successfully",
      tourId: matterportId,
      embedUrl: embedUrl
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid input", 
        errors: error.errors 
      });
    }

    console.error("Error uploading 3D tour:", error);
    res.status(500).json({ message: "Failed to upload tour" });
  }
});

// Update existing 3D tour
router.put("/communities/:id/tour", isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const updateData = updateTourSchema.parse(req.body);
    
    // Verify user owns this community
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const userId = (req as any).user?.claims?.sub;
    if ((req as any).user?.role !== 'admin' && 
        (req as any).user?.role !== 'super_admin' && 
        community.claimedBy !== parseInt(userId)) {
      return res.status(403).json({ message: "Not authorized to manage this community's tours" });
    }

    // Check if community has access to 3D tours
    const hasAccess = ['featured', 'platinum'].includes(community.subscriptionTier || '');
    if (!hasAccess) {
      return res.status(403).json({ 
        message: "3D tours are available for Featured and Platinum tiers",
        upgradeRequired: true
      });
    }

    // Prepare update object
    const updateObject: any = {
      updatedAt: new Date()
    };

    if (updateData.matterportTourUrl) {
      const matterportId = extractMatterportId(updateData.matterportTourUrl);
      const embedUrl = generateEmbedUrl(updateData.matterportTourUrl);
      
      updateObject.matterportTourId = matterportId;
      updateObject.matterportTourUrl = embedUrl;
    }

    if (updateData.tourStatus) {
      updateObject.tourStatus = updateData.tourStatus;
    }

    if (updateData.tourPreviewImage) {
      updateObject.tourPreviewImage = updateData.tourPreviewImage;
    }

    if (updateData.tourMetadata) {
      // Merge with existing metadata
      const existingMetadata = community.tourMetadata || {};
      updateObject.tourMetadata = {
        ...existingMetadata,
        ...updateData.tourMetadata
      };
    }

    // Update community
    await db.update(communities)
      .set(updateObject)
      .where(eq(communities.id, communityId));

    res.json({ message: "Tour updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid input", 
        errors: error.errors 
      });
    }

    console.error("Error updating 3D tour:", error);
    res.status(500).json({ message: "Failed to update tour" });
  }
});

// Get 3D tour analytics
router.get("/communities/:id/tour/analytics", isAuthenticated, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    
    // Verify user owns this community
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const userId = (req as any).user?.claims?.sub;
    if ((req as any).user?.role !== 'admin' && 
        (req as any).user?.role !== 'super_admin' && 
        community.claimedBy !== parseInt(userId)) {
      return res.status(403).json({ message: "Not authorized to view analytics" });
    }

    // Check if community has access to 3D tours
    const hasAccess = ['featured', 'platinum'].includes(community.subscriptionTier || '');
    if (!hasAccess) {
      return res.status(403).json({ 
        message: "Tour analytics are available for Featured and Platinum tiers",
        upgradeRequired: true
      });
    }

    // In a real implementation, these would be calculated from actual usage data
    const analytics = {
      dailyViews: Math.floor(Math.random() * 50) + 10,
      avgDuration: Math.floor(Math.random() * 10) + 3,
      completionRate: Math.floor(Math.random() * 40) + 60,
      tourToLeads: Math.floor(Math.random() * 5) + 1,
      totalViews: community.tourMetadata?.totalViews || 0
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching 3D tour analytics:", error);
    res.status(500).json({ message: "Failed to fetch tour analytics" });
  }
});

// Track 3D tour view (called when someone starts watching a tour)
router.post("/tours/:tourId/view", async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Find community by Matterport tour ID
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.matterportTourId, tourId));

    if (community) {
      // Increment view count in metadata
      const currentMetadata = community.tourMetadata || {};
      const newViewCount = (currentMetadata.totalViews || 0) + 1;
      
      await db.update(communities)
        .set({
          tourMetadata: {
            ...currentMetadata,
            totalViews: newViewCount
          }
        })
        .where(eq(communities.id, community.id));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking 3D tour view:", error);
    res.status(500).json({ message: "Failed to track view" });
  }
});

export default router;