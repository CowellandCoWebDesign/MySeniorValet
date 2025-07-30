import { Router } from "express";
import { db } from "../db";
import { services, serviceClicks, serviceCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Amazon Product Redirect System
 * Provides stable URLs that never expire and can be updated anytime
 * Preserves affiliate commission tracking through proper redirects
 */

// Main redirect handler - /go/amazon/:productId
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Find product by string product_id (not numeric id) and join with category
    const [productData] = await db
      .select({
        id: services.id,
        name: services.name,
        externalUrl: services.externalUrl,
        categoryName: serviceCategories.name
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.productId, productId))
      .limit(1);
    
    if (!productData || !productData.externalUrl) {
      // Fallback to Amazon homepage with affiliate tag
      return res.redirect("https://www.amazon.com/?tag=myseniorvalet-20");
    }
    
    // Track the click for analytics using serviceClicks
    try {
      await db.insert(serviceClicks).values({
        serviceId: productData.id,
        userId: null,
        ipAddress: req.ip || '',
        userAgent: req.get("User-Agent") || '',
        referrer: req.get("Referer") || '',
      });
    } catch (trackError) {
      console.error("Error tracking click:", trackError);
      // Don't block redirect if tracking fails
    }
    
    // Perform 302 redirect to preserve affiliate tracking
    // 302 is temporary redirect, preserves referrer for commission tracking
    res.redirect(302, productData.externalUrl);
    
  } catch (error) {
    console.error("Error in Amazon redirect:", error);
    // Fallback redirect to Amazon with affiliate tag
    res.redirect("https://www.amazon.com/?tag=myseniorvalet-20");
  }
});

// Get all redirect URLs for management
router.get("/", async (req, res) => {
  try {
    const amazonProducts = await db
      .select({
        id: services.id,
        name: services.name,
        externalUrl: services.externalUrl,
        categoryName: serviceCategories.name
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.providerId, 4));
    
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    
    const redirectUrls = amazonProducts.map(product => ({
      id: product.id,
      name: product.name,
      internalUrl: `${baseUrl}/go/amazon/${product.id}`,
      amazonUrl: product.externalUrl,
      status: product.externalUrl ? "active" : "needs_url"
    }));
    
    res.json({
      success: true,
      total: redirectUrls.length,
      redirectUrls,
      instructions: {
        usage: "Use the internalUrl in your application instead of direct Amazon links",
        updating: "Update amazonUrl in database to change destination without affecting your site",
        tracking: "All clicks are automatically tracked for analytics",
        example: "Replace amzn.to/4dMNpQR with /go/amazon/20"
      }
    });
    
  } catch (error: any) {
    console.error("Error fetching redirect URLs:", error);
    res.status(500).json({ 
      error: "Failed to fetch redirect URLs",
      message: error?.message 
    });
  }
});



// Update product with new URL
router.post("/update", async (req, res) => {
  try {
    const { productId, newAmazonUrl } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }
    
    // Get current product
    const [product] = await db
      .select()
      .from(services)
      .where(eq(services.id, productId))
      .limit(1);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Ensure affiliate tag is present
    let finalUrl = newAmazonUrl;
    if (newAmazonUrl && !finalUrl.includes("tag=")) {
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${separator}tag=myseniorvalet-20`;
    }
    
    // Update product with new URL
    const [updated] = await db
      .update(services)
      .set({ 
        externalUrl: finalUrl,
        metadata: db.raw(`
          COALESCE(metadata, '{}'::json) || 
          '{"lastUrlUpdate": "${new Date().toISOString()}"}'::json
        `)
      })
      .where(eq(services.id, productId))
      .returning();
    
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    
    res.json({
      success: true,
      product: {
        id: updated.id,
        name: updated.name,
        internalUrl: `${baseUrl}/go/amazon/${updated.id}`,
        amazonUrl: updated.externalUrl
      },
      message: "Product redirect updated successfully"
    });
    
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ 
      error: "Failed to update product",
      message: error?.message 
    });
  }
});

export default router;