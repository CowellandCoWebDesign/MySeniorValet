import { Router } from "express";
import { VendorSubscriptionService, VENDOR_SUBSCRIPTION_TIERS } from "../services/vendor-subscription";
import { isAuthenticated } from "../replitAuth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { vendors } from "@shared/schema";

const router = Router();

// Get vendor subscription tiers and pricing
router.get("/vendor-subscription/tiers", (req, res) => {
  res.json(VENDOR_SUBSCRIPTION_TIERS);
});

// Get vendor subscription status
router.get("/vendors/:vendorId/subscription-status", isAuthenticated, async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const usageStats = await VendorSubscriptionService.getUsageStats(vendorId);
    
    if (!usageStats) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    res.json(usageStats);
  } catch (error) {
    console.error("Error fetching vendor subscription status:", error);
    res.status(500).json({ error: "Failed to fetch subscription status" });
  }
});

// Check if vendor can generate a lead
router.get("/vendors/:vendorId/can-generate-lead", isAuthenticated, async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const leadLimit = await VendorSubscriptionService.checkLeadLimit(vendorId);
    res.json(leadLimit);
  } catch (error) {
    console.error("Error checking lead limit:", error);
    res.status(500).json({ error: "Failed to check lead limit" });
  }
});

// Track vendor click (for click limits)
router.post("/vendors/:vendorId/track-click", async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const clickLimit = await VendorSubscriptionService.checkClickLimit(vendorId);
    
    if (clickLimit.allowed) {
      await VendorSubscriptionService.incrementClickCount(vendorId);
      res.json({ success: true, remaining: clickLimit.remaining - 1 });
    } else {
      res.status(429).json({ error: "Click limit exceeded", remaining: 0 });
    }
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// Generate a lead (for contact forms, inquiries, etc.)
router.post("/vendors/:vendorId/generate-lead", isAuthenticated, async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const leadLimit = await VendorSubscriptionService.checkLeadLimit(vendorId);
    
    if (leadLimit.allowed) {
      await VendorSubscriptionService.incrementLeadCount(vendorId);
      res.json({ success: true, remaining: leadLimit.remaining - 1 });
    } else {
      res.status(429).json({ error: "Lead generation limit exceeded", remaining: 0 });
    }
  } catch (error) {
    console.error("Error generating lead:", error);
    res.status(500).json({ error: "Failed to generate lead" });
  }
});

// Get vendor tier features
router.get("/vendors/:vendorId/features", isAuthenticated, async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const tier = await VendorSubscriptionService.getVendorTier(vendorId);
    const features = VENDOR_SUBSCRIPTION_TIERS[tier].features;
    
    res.json({
      tier,
      tierName: VENDOR_SUBSCRIPTION_TIERS[tier].name,
      price: VENDOR_SUBSCRIPTION_TIERS[tier].price,
      features
    });
  } catch (error) {
    console.error("Error fetching vendor features:", error);
    res.status(500).json({ error: "Failed to fetch vendor features" });
  }
});

// Check feature access
router.get("/vendors/:vendorId/check-feature/:feature", isAuthenticated, async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const feature = req.params.feature;
    const hasAccess = await VendorSubscriptionService.checkFeatureAccess(vendorId, feature);
    
    res.json({ hasAccess });
  } catch (error) {
    console.error("Error checking feature access:", error);
    res.status(500).json({ error: "Failed to check feature access" });
  }
});

// Upgrade vendor subscription (placeholder for Stripe integration)
router.post("/vendors/:vendorId/upgrade", isAuthenticated, async (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const { targetTier } = req.body;
    
    // TODO: Integrate with Stripe for payment processing
    // For now, just update the tier
    await db
      .update(vendors)
      .set({ 
        subscriptionTier: targetTier,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date()
      })
      .where(eq(vendors.id, vendorId));
    
    res.json({ success: true, message: "Subscription upgraded successfully" });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    res.status(500).json({ error: "Failed to upgrade subscription" });
  }
});

export { router as vendorSubscriptionRouter };