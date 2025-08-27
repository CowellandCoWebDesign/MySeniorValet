import { type Express } from "express";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, desc, sql, isNull, or, lt, and, gte } from "drizzle-orm";
import { isAdmin } from "../auth-middleware";
import { onDemandEnrichmentService } from "../services/on-demand-enrichment-service";

export function registerCommunityEnrichmentRoutes(app: Express) {
  // Admin endpoint to manually trigger enrichment for a specific community
  app.post("/api/admin/communities/:id/enrich", isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      // Force enrichment regardless of cache
      const result = await onDemandEnrichmentService.enrichCommunity(communityId);
      
      res.json({
        success: result.success,
        fieldsUpdated: result.fieldsUpdated,
        protectedFieldsSkipped: result.protectedFieldsSkipped,
        error: result.error
      });
    } catch (error) {
      console.error("Error triggering enrichment:", error);
      res.status(500).json({ error: "Failed to trigger enrichment" });
    }
  });
  
  // Admin endpoint to refresh dynamic content only (photos, availability, promotions)
  app.post("/api/admin/communities/:id/refresh-dynamic", isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      const result = await onDemandEnrichmentService.refreshDynamicContent(communityId);
      
      res.json({
        success: result.success,
        fieldsUpdated: result.fieldsUpdated,
        error: result.error
      });
    } catch (error) {
      console.error("Error refreshing dynamic content:", error);
      res.status(500).json({ error: "Failed to refresh dynamic content" });
    }
  });
  
  // Admin endpoint to batch enrich high-priority communities
  app.post("/api/admin/enrich-batch", isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.body.limit as string) || 10;
      
      // Start batch enrichment asynchronously
      onDemandEnrichmentService.enrichHighPriorityCommunities(limit).catch(error => {
        console.error("Batch enrichment failed:", error);
      });
      
      res.json({ 
        message: `Batch enrichment started for up to ${limit} communities`,
        status: "processing"
      });
    } catch (error) {
      console.error("Error starting batch enrichment:", error);
      res.status(500).json({ error: "Failed to start batch enrichment" });
    }
  });
  
  // Get enrichment stats for admin dashboard
  app.get("/api/admin/enrichment-stats", isAdmin, async (req, res) => {
    try {
      const stats = await db
        .select({
          total: sql`COUNT(*)`,
          pending: sql`SUM(CASE WHEN enrichment_status = 'pending' THEN 1 ELSE 0 END)`,
          completed: sql`SUM(CASE WHEN enrichment_status = 'completed' THEN 1 ELSE 0 END)`,
          failed: sql`SUM(CASE WHEN enrichment_status = 'failed' THEN 1 ELSE 0 END)`,
          partial: sql`SUM(CASE WHEN enrichment_status = 'partial' THEN 1 ELSE 0 END)`,
          inProgress: sql`SUM(CASE WHEN enrichment_status = 'in_progress' THEN 1 ELSE 0 END)`,
          protectedPhones: sql`SUM(CASE WHEN phone_protected = true THEN 1 ELSE 0 END)`,
          protectedEmails: sql`SUM(CASE WHEN email_protected = true THEN 1 ELSE 0 END)`,
          protectedAddresses: sql`SUM(CASE WHEN address_protected = true THEN 1 ELSE 0 END)`,
          needingEnrichment: sql`SUM(CASE WHEN 
            (enrichment_status = 'pending' OR enrichment_status = 'failed' OR 
             last_successful_enrichment < NOW() - INTERVAL '7 days' OR 
             last_successful_enrichment IS NULL) 
            THEN 1 ELSE 0 END)`
        })
        .from(communities);
      
      // Get top viewed communities needing enrichment
      const topNeeding = await db
        .select({
          id: communities.id,
          name: communities.name,
          viewCount: communities.viewCount,
          enrichmentStatus: communities.enrichmentStatus,
          lastEnrichment: communities.lastSuccessfulEnrichment
        })
        .from(communities)
        .where(
          or(
            eq(communities.enrichmentStatus, 'pending'),
            eq(communities.enrichmentStatus, 'failed'),
            isNull(communities.lastSuccessfulEnrichment),
            lt(communities.lastSuccessfulEnrichment, sql`NOW() - INTERVAL '7 days'`)
          )
        )
        .orderBy(desc(communities.viewCount))
        .limit(10);
      
      res.json({
        stats: stats[0],
        topCommunitiesNeedingEnrichment: topNeeding
      });
    } catch (error) {
      console.error("Error fetching enrichment stats:", error);
      res.status(500).json({ error: "Failed to fetch enrichment stats" });
    }
  });
  
  // Get protected fields report
  app.get("/api/admin/protected-fields-report", isAdmin, async (req, res) => {
    try {
      const protectedCommunities = await db
        .select({
          id: communities.id,
          name: communities.name,
          phoneProtected: communities.phoneProtected,
          emailProtected: communities.emailProtected,
          addressProtected: communities.addressProtected,
          websiteProtected: communities.websiteProtected,
          licenseProtected: communities.licenseProtected,
          contactProtected: communities.contactProtected,
          phoneVerificationCount: communities.phoneVerificationCount,
          emailVerificationCount: communities.emailVerificationCount,
          addressVerificationCount: communities.addressVerificationCount
        })
        .from(communities)
        .where(
          or(
            eq(communities.phoneProtected, true),
            eq(communities.emailProtected, true),
            eq(communities.addressProtected, true),
            eq(communities.websiteProtected, true),
            eq(communities.licenseProtected, true),
            eq(communities.contactProtected, true)
          )
        )
        .limit(100);
      
      res.json({
        totalProtected: protectedCommunities.length,
        communities: protectedCommunities
      });
    } catch (error) {
      console.error("Error fetching protected fields report:", error);
      res.status(500).json({ error: "Failed to fetch protected fields report" });
    }
  });
  
  // Reset protection for a specific field
  app.post("/api/admin/communities/:id/unprotect/:field", isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const field = req.params.field;
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      const validFields = ['phone', 'email', 'address', 'website', 'license', 'contact'];
      if (!validFields.includes(field)) {
        return res.status(400).json({ error: "Invalid field name" });
      }
      
      const protectionField = `${field}Protected` as keyof typeof communities;
      const verificationField = `${field}VerificationCount` as keyof typeof communities;
      
      await db
        .update(communities)
        .set({
          [protectionField]: false,
          [verificationField]: 0
        })
        .where(eq(communities.id, communityId));
      
      res.json({ 
        success: true,
        message: `Protection removed for ${field} on community ${communityId}`
      });
    } catch (error) {
      console.error("Error unprotecting field:", error);
      res.status(500).json({ error: "Failed to unprotect field" });
    }
  });
  
  // Get enrichment history for a community
  app.get("/api/admin/communities/:id/enrichment-history", isAdmin, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }
      
      const [community] = await db
        .select({
          enrichmentStatus: communities.enrichmentStatus,
          lastEnrichmentAttempt: communities.lastEnrichmentAttempt,
          lastSuccessfulEnrichment: communities.lastSuccessfulEnrichment,
          enrichmentAttempts: communities.enrichmentAttempts,
          enrichmentSources: communities.enrichmentSources,
          viewCount: communities.viewCount,
          lastViewedAt: communities.lastViewedAt,
          popularityScore: communities.popularityScore,
          phoneVerificationCount: communities.phoneVerificationCount,
          emailVerificationCount: communities.emailVerificationCount,
          addressVerificationCount: communities.addressVerificationCount,
          phoneProtected: communities.phoneProtected,
          emailProtected: communities.emailProtected,
          addressProtected: communities.addressProtected,
          lastPhotoUpdate: communities.lastPhotoUpdate,
          lastAvailabilityCheck: communities.lastAvailabilityCheck,
          lastPromotionsUpdate: communities.lastPromotionsUpdate,
          lastReviewsUpdate: communities.lastReviewsUpdate
        })
        .from(communities)
        .where(eq(communities.id, communityId));
      
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      res.json(community);
    } catch (error) {
      console.error("Error fetching enrichment history:", error);
      res.status(500).json({ error: "Failed to fetch enrichment history" });
    }
  });
}