import { Router } from "express";
import { db } from "../db";
import { communityNotificationConfig, communityEmploymentVerification, communities } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { isAuthenticated, checkRole } from "../replitAuth";
import { z } from "zod";

const router = Router();

const notificationConfigSchema = z.object({
  notificationOrder: z.array(z.string()).default(['owner', 'regional_director', 'sales_director']),
  ownerEmail: z.string().email().optional(),
  ownerPhone: z.string().optional(),
  ownerName: z.string().optional(),
  regionalDirectorEmail: z.string().email().optional(),
  regionalDirectorPhone: z.string().optional(),
  regionalDirectorName: z.string().optional(),
  salesDirectorEmail: z.string().email().optional(),
  salesDirectorPhone: z.string().optional(),
  salesDirectorName: z.string().optional(),
  customRecipients: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.string()
  })).default([]),
  sendToAll: z.boolean().default(false),
  includeBackupNotifications: z.boolean().default(true),
  autoConfirmTours: z.boolean().default(false)
});

const employmentVerificationSchema = z.object({
  employeeRole: z.string(),
  employeeEmail: z.string().email(),
  employeePhone: z.string().optional(),
  department: z.string().optional(),
  verificationMethod: z.enum(["email_domain", "manual_review", "document_upload", "phone_verification", "reference_check"]),
  verificationEvidence: z.object({
    emailDomain: z.string().optional(),
    documentUrl: z.string().optional(),
    verifierNotes: z.string().optional(),
    referenceContact: z.string().optional(),
    verificationCode: z.string().optional()
  }).optional()
});

// Get notification configuration for a community
router.get("/communities/:id/notification-config", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;

      // Check if user has permission to view this community's config
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Get existing config or return defaults
      const [config] = await db
        .select()
        .from(communityNotificationConfig)
        .where(eq(communityNotificationConfig.communityId, communityId));

      if (!config) {
        return res.json({
          communityId,
          notificationOrder: ['owner', 'regional_director', 'sales_director'],
          customRecipients: [],
          sendToAll: false,
          includeBackupNotifications: true,
          autoConfirmTours: false
        });
      }

      res.json(config);
    } catch (error) {
      console.error("Error fetching notification config:", error);
      res.status(500).json({ error: "Failed to fetch notification configuration" });
    }
});

// Update notification configuration for a community
router.post("/communities/:id/notification-config", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;

      // Validate request body
      const validatedData = notificationConfigSchema.parse(req.body);

      // Check if user has permission to update this community
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Check if config exists
      const [existingConfig] = await db
        .select()
        .from(communityNotificationConfig)
        .where(eq(communityNotificationConfig.communityId, communityId));

      let result;
      if (existingConfig) {
        // Update existing config
        [result] = await db
          .update(communityNotificationConfig)
          .set({
            ...validatedData,
            updatedAt: new Date()
          })
          .where(eq(communityNotificationConfig.communityId, communityId))
          .returning();
      } else {
        // Create new config
        [result] = await db
          .insert(communityNotificationConfig)
          .values({
            communityId,
            ...validatedData
          })
          .returning();
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating notification config:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update notification configuration" });
    }
});

// Request employment verification for community claim
router.post("/communities/:id/request-verification", isAuthenticated, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Validate request body
      const validatedData = employmentVerificationSchema.parse(req.body);

      // Check if community exists
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Check if verification already exists
      const [existingVerification] = await db
        .select()
        .from(communityEmploymentVerification)
        .where(
          and(
            eq(communityEmploymentVerification.communityId, communityId),
            eq(communityEmploymentVerification.userId, userId)
          )
        );

      if (existingVerification && existingVerification.verificationStatus === 'verified') {
        return res.status(400).json({ error: "Already verified for this community" });
      }

      // Auto-verify if email domain matches community domain
      let verificationStatus = 'pending';
      const verificationEvidence: any = validatedData.verificationEvidence || {};

      if (validatedData.verificationMethod === 'email_domain' && community.website) {
        const communityDomain = new URL(community.website).hostname.replace('www.', '');
        const emailDomain = validatedData.employeeEmail.split('@')[1];
        
        if (emailDomain === communityDomain) {
          verificationStatus = 'verified';
          verificationEvidence.emailDomain = emailDomain;
        }
      }

      // Create or update verification request
      let result;
      if (existingVerification) {
        [result] = await db
          .update(communityEmploymentVerification)
          .set({
            ...validatedData,
            verificationStatus,
            verificationEvidence,
            verifiedAt: verificationStatus === 'verified' ? new Date() : null,
            updatedAt: new Date()
          })
          .where(eq(communityEmploymentVerification.id, existingVerification.id))
          .returning();
      } else {
        [result] = await db
          .insert(communityEmploymentVerification)
          .values({
            communityId,
            userId,
            ...validatedData,
            verificationStatus,
            verificationEvidence,
            verifiedAt: verificationStatus === 'verified' ? new Date() : null
          })
          .returning();
      }

      // If verified, update community claim status
      if (verificationStatus === 'verified') {
        await db
          .update(communities)
          .set({
            isClaimed: true,
            claimApprovalStatus: 'Approved',
            communityManagerName: validatedData.employeeRole,
            communityManagerEmail: validatedData.employeeEmail,
            communityManagerPhone: validatedData.employeePhone
          })
          .where(eq(communities.id, communityId));
      }

      res.json({
        ...result,
        message: verificationStatus === 'verified' 
          ? 'Successfully verified and claimed community' 
          : 'Verification request submitted for manual review'
      });
    } catch (error) {
      console.error("Error processing verification request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid verification data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process verification request" });
    }
});

// Admin endpoint to review and approve/reject verifications
router.post("/admin/verify-employment/:id", isAuthenticated, checkRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const verificationId = parseInt(req.params.id);
      const { status, notes } = req.body;
      const verifierId = req.user?.id;

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'verified' or 'rejected'" });
      }

      // Update verification status
      const [verification] = await db
        .update(communityEmploymentVerification)
        .set({
          verificationStatus: status,
          verifiedAt: status === 'verified' ? new Date() : null,
          verifiedBy: verifierId,
          verificationEvidence: db.raw(`
            jsonb_set(
              COALESCE(verification_evidence, '{}'),
              '{verifierNotes}',
              '"${notes}"'
            )
          `),
          updatedAt: new Date()
        })
        .where(eq(communityEmploymentVerification.id, verificationId))
        .returning();

      if (!verification) {
        return res.status(404).json({ error: "Verification request not found" });
      }

      // If approved, update community claim
      if (status === 'verified') {
        await db
          .update(communities)
          .set({
            isClaimed: true,
            claimApprovalStatus: 'Approved',
            communityManagerEmail: verification.employeeEmail,
            communityManagerPhone: verification.employeePhone
          })
          .where(eq(communities.id, verification.communityId));
      }

      res.json({
        ...verification,
        message: status === 'verified' 
          ? 'Employment verified and community claim approved' 
          : 'Employment verification rejected'
      });
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ error: "Failed to update verification status" });
    }
});

// Get all pending verifications (admin only)
router.get("/admin/pending-verifications", isAuthenticated, checkRole(['admin', 'super_admin']), async (_req, res) => {
    try {
      const pendingVerifications = await db
        .select({
          verification: communityEmploymentVerification,
          community: communities
        })
        .from(communityEmploymentVerification)
        .leftJoin(communities, eq(communityEmploymentVerification.communityId, communities.id))
        .where(eq(communityEmploymentVerification.verificationStatus, 'pending'));

      res.json(pendingVerifications);
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ error: "Failed to fetch pending verifications" });
    }
});

export default router;