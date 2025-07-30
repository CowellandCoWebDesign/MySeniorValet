import { Router } from "express";
import { db } from "../db";
import { services, serviceCategories } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { checkAmazonAffiliateLinkHealth, batchCheckAmazonLinks, fixAmazonLink } from "../amazon-link-health-checker";
import { generateSeniorProductSummary } from "../amazon-ai-summary-generator";

const router = Router();

/**
 * Check health of a single Amazon link
 */
router.post("/check-link", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    
    const healthResult = checkAmazonAffiliateLinkHealth(url);
    
    res.json({
      ...healthResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking link health:", error);
    res.status(500).json({ error: "Failed to check link health" });
  }
});

/**
 * Batch check multiple Amazon links
 */
router.post("/check-links", async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: "URLs array is required" });
    }
    
    const results = await batchCheckAmazonLinks(urls);
    
    res.json({
      results: Object.fromEntries(results),
      summary: {
        total: urls.length,
        healthy: Array.from(results.values()).filter(r => r.isHealthy).length,
        needsFixing: Array.from(results.values()).filter(r => !r.isHealthy).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error batch checking links:", error);
    res.status(500).json({ error: "Failed to check links" });
  }
});

/**
 * Generate AI summary for a product
 */
router.post("/generate-summary", async (req, res) => {
  try {
    const { productName, category, description } = req.body;
    
    if (!productName) {
      return res.status(400).json({ error: "Product name is required" });
    }
    
    const summaryResult = await generateSeniorProductSummary({
      productName,
      category: category || "Home Essentials",
      generalDescription: description
    });
    
    res.json({
      ...summaryResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

/**
 * Get compliance status for all Amazon products
 */
router.get("/status", async (req, res) => {
  try {
    const products = await db
      .select({
        id: services.id,
        productId: services.productId,
        name: services.name,
        externalUrl: services.externalUrl,
        description: services.description,
        metadata: services.metadata,
        categoryName: serviceCategories.name
      })
      .from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
      .where(eq(services.providerId, 4));
    
    const complianceReport = {
      totalProducts: products.length,
      healthyLinks: 0,
      brokenLinks: 0,
      withAISummaries: 0,
      needsEnrichment: 0,
      products: [] as Array<{
        id: number;
        name: string;
        linkHealth: string;
        hasAISummary: boolean;
        needsEnrichment: boolean;
        lastChecked: string | null;
      }>
    };
    
    for (const product of products) {
      const linkHealth = checkAmazonAffiliateLinkHealth(product.externalUrl || '');
      // Check for AI summary in description or metadata
      const metadata = product.metadata as any || {};
      const hasAISummary = (metadata.ai_summary_generated === true) || 
                          (product.description && product.description.length > 100 && 
                           !product.description.includes('TBD'));
      const needsWork = !linkHealth.isHealthy || !hasAISummary;
      
      if (linkHealth.isHealthy) complianceReport.healthyLinks++;
      else complianceReport.brokenLinks++;
      
      if (hasAISummary) complianceReport.withAISummaries++;
      if (needsWork) complianceReport.needsEnrichment++;
      
      complianceReport.products.push({
        id: product.id,
        name: product.name,
        linkHealth: linkHealth.status,
        hasAISummary: !!hasAISummary,
        needsEnrichment: needsWork,
        lastChecked: metadata.link_health_checked || null
      });
    }
    
    res.json({
      report: complianceReport,
      timestamp: new Date().toISOString(),
      recommendations: {
        immediate: complianceReport.brokenLinks > 0 ? "Fix broken links immediately" : null,
        enhancement: complianceReport.withAISummaries < complianceReport.totalProducts ? 
          "Generate AI summaries for remaining products" : null,
        status: complianceReport.needsEnrichment === 0 ? "✅ Fully compliant" : "⚠️ Needs enrichment"
      }
    });
  } catch (error) {
    console.error("Error getting compliance status:", error);
    res.status(500).json({ error: "Failed to get compliance status" });
  }
});

/**
 * Fix a broken Amazon link
 */
router.post("/fix-link/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Get the product
    const [product] = await db
      .select()
      .from(services)
      .where(and(
        eq(services.productId, productId),
        eq(services.providerId, 4)
      ))
      .limit(1);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Fix the link
    const fixedUrl = fixAmazonLink(product.externalUrl || '');
    
    // Update the database
    await db
      .update(services)
      .set({
        externalUrl: fixedUrl,
        metadata: {
          ...((product.metadata as any) || {}),
          link_health_checked: new Date().toISOString(),
          link_fixed_at: new Date().toISOString()
        },
        updatedAt: new Date()
      })
      .where(eq(services.id, product.id));
    
    res.json({
      success: true,
      productId: product.productId,
      oldUrl: product.externalUrl,
      newUrl: fixedUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fixing link:", error);
    res.status(500).json({ error: "Failed to fix link" });
  }
});

export default router;