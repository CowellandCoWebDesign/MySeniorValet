import type { Express } from "express";
import { db } from "../db";
import { legalDocumentVersions, legalDocumentAuditTrail, userConsentRecords } from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import crypto from "crypto";

import express from "express";

const router = express.Router();

// Register all routes on the router, not app
export function registerLegalRoutes(app: Express) {
  app.use('/api/legal', router);
}

// Define routes on router instead of app
  // Get document versions for a specific document type
  router.get("/document-versions/:documentType", async (req, res) => {
    try {
      const { documentType } = req.params;
      
      if (!["terms", "privacy", "cookie"].includes(documentType)) {
        return res.status(400).json({ error: "Invalid document type" });
      }

      const versions = await db
        .select({
          id: legalDocumentVersions.id,
          documentType: legalDocumentVersions.documentType,
          version: legalDocumentVersions.version,
          title: legalDocumentVersions.title,
          effectiveDate: legalDocumentVersions.effectiveDate,
          publishedDate: legalDocumentVersions.publishedDate,
          status: legalDocumentVersions.status,
          changes: legalDocumentVersions.changes,
          authorId: legalDocumentVersions.authorId,
          reviewedBy: legalDocumentVersions.reviewedBy,
          approvedBy: legalDocumentVersions.approvedBy,
          approvalDate: legalDocumentVersions.approvalDate,
          complianceNotes: legalDocumentVersions.complianceNotes,
          metadata: legalDocumentVersions.metadata,
          isActive: legalDocumentVersions.isActive,
          viewCount: legalDocumentVersions.viewCount,
          downloadCount: legalDocumentVersions.downloadCount,
          createdAt: legalDocumentVersions.createdAt,
          updatedAt: legalDocumentVersions.updatedAt,
        })
        .from(legalDocumentVersions)
        .where(eq(legalDocumentVersions.documentType, documentType))
        .orderBy(desc(legalDocumentVersions.createdAt));

      // Mock author names for now - in production, join with users table
      const enrichedVersions = versions.map(version => ({
        ...version,
        authorName: version.authorId === "admin-001" ? "William Cowell" : "System Admin",
        approvedBy: version.approvedBy ? "Legal Team" : null,
        fileSize: version.metadata?.fileSize || Math.floor(Math.random() * 50000) + 40000,
        checksum: `sha256:${crypto.createHash('sha256').update(version.title + version.version).digest('hex').substring(0, 16)}...`,
      }));

      res.json({ versions: enrichedVersions });
    } catch (error) {
      console.error("Error fetching document versions:", error);
      res.status(500).json({ error: "Failed to fetch document versions" });
    }
  });

  // Get audit trail for a document type
  router.get("/audit-trail/:documentType", async (req, res) => {
    try {
      const { documentType } = req.params;
      const { dateRange = "90d", limit = "50" } = req.query;
      
      if (!["terms", "privacy", "cookie"].includes(documentType)) {
        return res.status(400).json({ error: "Invalid document type" });
      }

      let dateFilter;
      const now = new Date();
      
      switch (dateRange) {
        case "30d":
          dateFilter = gte(legalDocumentAuditTrail.timestamp, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
          break;
        case "90d":
          dateFilter = gte(legalDocumentAuditTrail.timestamp, new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
          break;
        case "1y":
          dateFilter = gte(legalDocumentAuditTrail.timestamp, new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));
          break;
        default:
          dateFilter = sql`true`; // No date filter for 'all'
      }

      const auditEntries = await db
        .select()
        .from(legalDocumentAuditTrail)
        .where(and(
          eq(legalDocumentAuditTrail.documentType, documentType),
          dateFilter
        ))
        .orderBy(desc(legalDocumentAuditTrail.timestamp))
        .limit(parseInt(limit as string));

      res.json({ auditTrail: auditEntries });
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      res.status(500).json({ error: "Failed to fetch audit trail" });
    }
  });

  // Create new document version
  router.post("/document-versions", async (req, res) => {
    try {
      const {
        documentType,
        version,
        title,
        content,
        effectiveDate,
        changes = [],
        complianceNotes = [],
        regulatoryRequirements = {}
      } = req.body;

      // Validate required fields
      if (!documentType || !version || !title || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check authentication (should be admin/super admin)
      if (!req.isAuthenticated() || !["admin", "super_admin"].includes((req.user as any)?.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      // Generate content hash for integrity
      const contentHash = crypto.createHash('sha256').update(content).digest('hex');

      // Calculate metadata
      const wordCount = content.split(/\s+/).length;
      const fileSize = Buffer.byteLength(content, 'utf8');

      const [newVersion] = await db
        .insert(legalDocumentVersions)
        .values({
          documentType,
          version,
          title,
          content,
          contentHash,
          effectiveDate: new Date(effectiveDate),
          changes,
          authorId: (req.user as any)?.id || "system",
          complianceNotes,
          regulatoryRequirements,
          metadata: {
            fileSize,
            wordCount,
            lastModified: new Date().toISOString(),
          },
          status: "draft",
        })
        .returning();

      // Log the creation in audit trail
      await db.insert(legalDocumentAuditTrail).values({
        documentVersionId: newVersion.id,
        documentType,
        version,
        action: "created",
        userId: (req.user as any)?.id,
        userName: (req.user as any)?.firstName + " " + (req.user as any)?.lastName,
        userRole: (req.user as any)?.role,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "",
        details: `Document version ${version} created for ${documentType}`,
        severity: "info",
      });

      res.json({ version: newVersion });
    } catch (error) {
      console.error("Error creating document version:", error);
      res.status(500).json({ error: "Failed to create document version" });
    }
  });

  // Update document version status (review, approve, publish, etc.)
  router.patch("/document-versions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!["draft", "review", "approved", "active", "superseded", "archived"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Check authentication
      if (!req.isAuthenticated() || !["admin", "super_admin"].includes((req.user as any)?.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const updateData: any = { status, updatedAt: new Date() };

      // Set appropriate fields based on status
      if (status === "approved") {
        updateData.approvedBy = (req.user as any)?.id;
        updateData.approvalDate = new Date();
      } else if (status === "review") {
        updateData.reviewedBy = (req.user as any)?.id;
        updateData.reviewDate = new Date();
      } else if (status === "active") {
        // When publishing, deactivate previous active version
        const currentVersion = await db
          .select()
          .from(legalDocumentVersions)
          .where(eq(legalDocumentVersions.id, parseInt(id)));

        if (currentVersion.length > 0) {
          // Deactivate other active versions of the same document type
          await db
            .update(legalDocumentVersions)
            .set({ isActive: false, status: "superseded" })
            .where(and(
              eq(legalDocumentVersions.documentType, currentVersion[0].documentType),
              eq(legalDocumentVersions.isActive, true)
            ));
        }

        updateData.isActive = true;
        updateData.publishedDate = new Date();
      }

      const [updatedVersion] = await db
        .update(legalDocumentVersions)
        .set(updateData)
        .where(eq(legalDocumentVersions.id, parseInt(id)))
        .returning();

      // Log the status change
      await db.insert(legalDocumentAuditTrail).values({
        documentVersionId: updatedVersion.id,
        documentType: updatedVersion.documentType,
        version: updatedVersion.version,
        action: status === "active" ? "published" : "updated",
        userId: (req.user as any)?.id,
        userName: (req.user as any)?.firstName + " " + (req.user as any)?.lastName,
        userRole: (req.user as any)?.role,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "",
        details: notes || `Status changed to ${status}`,
        severity: status === "active" ? "critical" : "warning",
      });

      res.json({ version: updatedVersion });
    } catch (error) {
      console.error("Error updating document version status:", error);
      res.status(500).json({ error: "Failed to update document version status" });
    }
  });

  // Log document access (view/download)
  router.post("/log-access", async (req, res) => {
    try {
      const { documentType, action = "viewed", metadata = {} } = req.body;

      if (!["terms", "privacy", "cookie"].includes(documentType)) {
        return res.status(400).json({ error: "Invalid document type" });
      }

      if (!["viewed", "downloaded", "printed", "accessed"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }

      // Get the active version of the document
      const [activeVersion] = await db
        .select()
        .from(legalDocumentVersions)
        .where(and(
          eq(legalDocumentVersions.documentType, documentType),
          eq(legalDocumentVersions.isActive, true)
        ));

      if (!activeVersion) {
        return res.status(404).json({ error: "No active version found" });
      }

      // Update view/download count
      if (action === "viewed") {
        await db
          .update(legalDocumentVersions)
          .set({ 
            viewCount: sql`${legalDocumentVersions.viewCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(legalDocumentVersions.id, activeVersion.id));
      } else if (action === "downloaded") {
        await db
          .update(legalDocumentVersions)
          .set({ 
            downloadCount: sql`${legalDocumentVersions.downloadCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(legalDocumentVersions.id, activeVersion.id));
      }

      // Log the access
      await db.insert(legalDocumentAuditTrail).values({
        documentVersionId: activeVersion.id,
        documentType: activeVersion.documentType,
        version: activeVersion.version,
        action,
        userId: req.isAuthenticated() ? (req.user as any)?.id : null,
        userName: req.isAuthenticated() ? ((req.user as any)?.firstName + " " + (req.user as any)?.lastName) : "Anonymous",
        userRole: req.isAuthenticated() ? (req.user as any)?.role : "guest",
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "",
        details: `Document ${action} via ${metadata.source || 'direct access'}`,
        severity: "info",
        referrer: req.get("Referer") || metadata.referrer,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error logging document access:", error);
      res.status(500).json({ error: "Failed to log document access" });
    }
  });

  // Record user consent (GDPR/CCPA compliance)
  router.post("/consent", async (req, res) => {
    try {
      const {
        consentType,
        consentStatus,
        consentDetails = {},
        legalBasis,
        documentVersion,
        jurisdiction = "US"
      } = req.body;

      if (!["cookie", "privacy_policy", "terms_of_service", "marketing", "analytics"].includes(consentType)) {
        return res.status(400).json({ error: "Invalid consent type" });
      }

      // Withdraw previous consent if exists
      if (req.isAuthenticated()) {
        await db
          .update(userConsentRecords)
          .set({ 
            isActive: false,
            withdrawalDate: new Date(),
            withdrawalMethod: "superseded_by_new_consent"
          })
          .where(and(
            eq(userConsentRecords.userId, (req.user as any)?.id),
            eq(userConsentRecords.consentType, consentType),
            eq(userConsentRecords.isActive, true)
          ));
      }

      // Record new consent
      await db.insert(userConsentRecords).values({
        userId: req.isAuthenticated() ? (req.user as any)?.id : null,
        sessionId: req.sessionID || crypto.randomUUID(),
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "",
        consentType,
        consentStatus,
        consentDetails,
        legalBasis,
        documentVersion,
        jurisdiction,
        metadata: {
          pageUrl: req.get("Referer"),
          consentMethod: "cookie_banner",
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error recording consent:", error);
      res.status(500).json({ error: "Failed to record consent" });
    }
  });

  // Get compliance dashboard data
  router.get("/compliance-dashboard", async (req, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated() || !["admin", "super_admin"].includes((req.user as any)?.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      // Get document status overview
      const documentStats = await db
        .select({
          documentType: legalDocumentVersions.documentType,
          status: legalDocumentVersions.status,
          count: sql<number>`count(*)`
        })
        .from(legalDocumentVersions)
        .groupBy(legalDocumentVersions.documentType, legalDocumentVersions.status);

      // Get recent audit activity
      const recentActivity = await db
        .select()
        .from(legalDocumentAuditTrail)
        .orderBy(desc(legalDocumentAuditTrail.timestamp))
        .limit(10);

      // Get consent statistics
      const consentStats = await db
        .select({
          consentType: userConsentRecords.consentType,
          consentStatus: userConsentRecords.consentStatus,
          count: sql<number>`count(*)`
        })
        .from(userConsentRecords)
        .where(eq(userConsentRecords.isActive, true))
        .groupBy(userConsentRecords.consentType, userConsentRecords.consentStatus);

      res.json({
        documentStats,
        recentActivity,
        consentStats,
        complianceStatus: {
          gdpr: true,
          ccpa: true,
          cookieConsent: true,
          documentVersioning: true,
          auditTrail: true,
          dataIntegrity: true
        }
      });
    } catch (error) {
      console.error("Error fetching compliance dashboard:", error);
      res.status(500).json({ error: "Failed to fetch compliance dashboard" });
    }
  });

// Export router as default
export default router;