/**
 * Data Quality Admin Routes
 * =========================
 * Admin-only endpoints to detect, flag, and (with explicit confirmation) remediate
 * suspect AI-guessed community data. Mounted under /api.
 *
 *   GET  /api/admin/data-quality/report   — READ-ONLY counts + examples
 *   POST /api/admin/data-quality/flag     — write non-destructive markers
 *   POST /api/admin/data-quality/cleanup  — opt-in remediation, requires confirm:true
 *
 * Cleanup NEVER deletes records (Golden Data Rule + removal-authorization rule).
 */

import { Router } from "express";
import cookieParser from "cookie-parser";
import {
  scanDataQuality,
  flagDataQuality,
  flagUnreachableWebsites,
  cleanupDataQuality,
} from "../services/data-quality-scan-service";

const router = Router();
router.use(cookieParser());

// Mirror the admin auth pattern used across the admin community routes.
const requireAdmin = async (req: any, res: any, next: any) => {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId && process.env.NODE_ENV === "development") {
    req.adminUser = {
      id: "test-user-123",
      email: "William.cowell01@gmail.com",
      role: "super_admin",
    };
    return next();
  }

  if (!sessionId || !global.activeSessions?.[sessionId]) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const session = global.activeSessions[sessionId];
  if (session.role !== "admin" && session.role !== "super_admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.adminUser = { id: session.userId, email: session.email, role: session.role };
  next();
};

// Data-quality report. Read-only by default; pass ?scanWebsites=N to first run a
// bounded, non-destructive reachability pass (flags unreachable websites, never
// deletes) so unreachable_website counts reflect freshly-detected results.
// Continue through the catalog with ?scanWebsitesAfterId= using the returned
// websiteScan.nextAfterId.
router.get("/admin/data-quality/report", requireAdmin, async (req, res) => {
  try {
    const exampleLimit = Math.max(1, Math.min(parseInt(String(req.query.examples ?? "10"), 10) || 10, 50));
    const websiteScanLimit = req.query.scanWebsites
      ? Math.max(0, Math.min(parseInt(String(req.query.scanWebsites), 10) || 0, 500))
      : 0;
    const websiteScanAfterId = req.query.scanWebsitesAfterId
      ? Math.max(0, parseInt(String(req.query.scanWebsitesAfterId), 10) || 0)
      : undefined;
    const report = await scanDataQuality({ exampleLimit, websiteScanLimit, websiteScanAfterId });
    res.json({ success: true, report });
  } catch (error: any) {
    console.error("Data quality report error:", error);
    res.status(500).json({ success: false, message: error?.message || "Scan failed" });
  }
});

// Apply non-destructive data-quality markers to all communities.
router.post("/admin/data-quality/flag", requireAdmin, async (req, res) => {
  try {
    const result = await flagDataQuality();
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Data quality flag error:", error);
    res.status(500).json({ success: false, message: error?.message || "Flagging failed" });
  }
});

// Non-destructive unreachable-website detection. Resolves stored website URLs
// for a bounded, resumable batch and appends the 'unreachable_website' flag to
// any that do not resolve (the website field itself is left untouched).
// Pass back the returned nextAfterId as afterId to continue through the catalog.
router.post("/admin/data-quality/scan-websites", requireAdmin, async (req, res) => {
  try {
    const { limit, afterId } = req.body || {};
    const result = await flagUnreachableWebsites({
      limit: limit ? Number(limit) : undefined,
      afterId: afterId ? Number(afterId) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Data quality website scan error:", error);
    res.status(500).json({ success: false, message: error?.message || "Website scan failed" });
  }
});

// Opt-in remediation. Requires explicit { confirm: true }. Never deletes records.
router.post("/admin/data-quality/cleanup", requireAdmin, async (req, res) => {
  try {
    const { confirm, cleanCitations, dropUnreachableWebsites, websiteCheckLimit } = req.body || {};
    if (confirm !== true) {
      return res.status(400).json({
        success: false,
        message:
          "Cleanup requires explicit authorization. Send { confirm: true } along with the actions to perform (cleanCitations, dropUnreachableWebsites).",
      });
    }
    const result = await cleanupDataQuality({
      confirm: true,
      cleanCitations: !!cleanCitations,
      dropUnreachableWebsites: !!dropUnreachableWebsites,
      websiteCheckLimit: websiteCheckLimit ? Number(websiteCheckLimit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Data quality cleanup error:", error);
    res.status(500).json({ success: false, message: error?.message || "Cleanup failed" });
  }
});

export default router;
