import { Router } from "express";
import { amazonLinkManager } from "../amazon-link-manager";
import { db } from "../db";
import { services } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

// Check link health and get recommendations
router.get("/health-check", async (req, res) => {
  try {
    const linkStatus = await amazonLinkManager.updateToStableLinks();
    const recommendations = amazonLinkManager.getRecommendations();
    
    res.json({
      success: true,
      linkStatus,
      recommendations,
      message: "See recommendations for preventing link expiration"
    });
  } catch (error: any) {
    console.error("Error checking link health:", error);
    res.status(500).json({ 
      error: "Failed to check link health",
      message: error?.message 
    });
  }
});

// Update a specific product link
router.post("/update-link", async (req, res) => {
  try {
    const { productId, newUrl, asin } = req.body;
    
    if (!productId || !newUrl) {
      return res.status(400).json({ error: "Missing productId or newUrl" });
    }
    
    // Create stable affiliate link
    const stableUrl = amazonLinkManager.createAffiliateLink(newUrl, asin);
    
    // Update in database
    const [updated] = await db
      .update(services)
      .set({ 
        externalUrl: stableUrl,
        // Store ASIN if provided for future use
        metadata: sql`jsonb_set(COALESCE(metadata, '{}'), '{asin}', ${JSON.stringify(asin || '')})` 
      })
      .where(eq(services.id, productId))
      .returning();
    
    res.json({
      success: true,
      product: updated,
      stableUrl,
      tip: "This link format is less likely to expire"
    });
  } catch (error: any) {
    console.error("Error updating link:", error);
    res.status(500).json({ 
      error: "Failed to update link",
      message: error?.message 
    });
  }
});

export default router;