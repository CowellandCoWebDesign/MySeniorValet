import { Request, Response, Router } from "express";
import { storage } from "../storage";
import { insertMarketplaceVendorSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all marketplace categories
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await storage.getMarketplaceCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching marketplace categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get all marketplace vendors
router.get("/vendors", async (req: Request, res: Response) => {
  try {
    const { categoryId, featured, hidden } = req.query;
    
    const params: any = {};
    if (categoryId) params.categoryId = parseInt(categoryId as string);
    if (featured !== undefined) params.featured = featured === 'true';
    if (hidden !== undefined) params.hidden = hidden === 'true';
    
    let vendors = await storage.getMarketplaceVendors(params);
    
    // Filter out senior resources that should only appear in the Senior Resources section
    const seniorResourceNames = [
      'Social Security Administration',
      'Adult Protective Services (APS)',
      'Long-Term Care Ombudsman',
      'Senior Centers',
      'National Council on Aging - Senior Centers',
      'Disability Action Centers',
      'AARP',
      'AARP Technology Training',
      "Alzheimer's Association",
      "Parkinson's Foundation",
      'American Cancer Society',
      'Elder Abuse Hotline',
      'Meals on Wheels',
      'PACE Programs',
      'MediGap/Supplemental',
      'Area Agency on Aging',
      'SHIP (Medicare Counseling)',
      'Veterans Crisis Line',
      'OLLI (Lifelong Learning)',
      'Senior Planet',
      'Relay Services (711)',
      'Language Line',
      'NEMT Services',
      'Medicare.gov',
      'VA Benefits & Healthcare',
      'Health Education for Seniors'
    ];
    
    vendors = vendors.filter(vendor => 
      !seniorResourceNames.includes(vendor.name)
    );
    
    res.json(vendors);
  } catch (error) {
    console.error("Error fetching marketplace vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// Get vendor by slug
router.get("/vendors/:slug", async (req: Request, res: Response) => {
  try {
    const vendor = await storage.getMarketplaceVendorBySlug(req.params.slug);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

// Track vendor click (redirect)
router.get("/out/:vendorId", async (req: Request, res: Response) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    
    // Get vendor by ID
    const vendors = await storage.getMarketplaceVendors();
    const vendor = vendors.find(v => v.id === vendorId);
    
    if (!vendor) {
      return res.status(404).send("Vendor not found");
    }

    // Track the click
    await storage.trackMarketplaceVendorClick({
      vendorId: vendor.id,
      userId: req.user?.id || null,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      referrer: req.get('referrer') || null,
    });

    // Redirect to vendor's external URL
    res.redirect(vendor.externalUrl);
  } catch (error) {
    console.error("Error tracking vendor click:", error);
    res.status(500).send("Failed to redirect");
  }
});

// Get marketplace analytics
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const analytics = await storage.getMarketplaceAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching marketplace analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Admin routes (protected)
router.post("/vendors", async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const vendorData = insertMarketplaceVendorSchema.parse(req.body);
    const vendor = await storage.createMarketplaceVendor(vendorData);
    res.json(vendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid vendor data", details: error.errors });
    }
    console.error("Error creating vendor:", error);
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

router.patch("/vendors/:id", async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const vendorId = parseInt(req.params.id);
    const updates = req.body;
    
    const vendor = await storage.updateMarketplaceVendor(vendorId, updates);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

router.delete("/vendors/:id", async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const vendorId = parseInt(req.params.id);
    const deleted = await storage.deleteMarketplaceVendor(vendorId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

export default router;