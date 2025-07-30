import { db } from "./db";
import { services } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Amazon Link Manager - Handles sustainable affiliate link management
 * Prevents expiration issues by using full URLs with affiliate tags
 */

export class AmazonLinkManager {
  private affiliateTag = 'myseniorvalet-20';
  
  /**
   * Convert any Amazon URL to a proper affiliate link
   * Works with both short (amzn.to) and full Amazon URLs
   */
  createAffiliateLink(productUrl: string, asin?: string): string {
    // If it's a short URL, we need the ASIN to create a stable link
    if (productUrl.includes('amzn.to') && asin) {
      return `https://www.amazon.com/dp/${asin}?tag=${this.affiliateTag}`;
    }
    
    // Extract ASIN from full Amazon URL
    const asinMatch = productUrl.match(/\/dp\/([A-Z0-9]{10})/);
    if (asinMatch) {
      return `https://www.amazon.com/dp/${asinMatch[1]}?tag=${this.affiliateTag}`;
    }
    
    // If URL already has a tag, replace it with ours
    if (productUrl.includes('tag=')) {
      return productUrl.replace(/tag=[^&]+/, `tag=${this.affiliateTag}`);
    }
    
    // Add our tag to the URL
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}tag=${this.affiliateTag}`;
  }
  
  /**
   * Update all Amazon product links to use stable format
   * This prevents expiration issues
   */
  async updateToStableLinks() {
    const amazonProducts = await db
      .select()
      .from(services)
      .where(eq(services.providerId, 4));
    
    const updates = [];
    
    for (const product of amazonProducts) {
      if (product.externalUrl) {
        // For now, keep existing URLs but log which ones need ASINs
        updates.push({
          id: product.id,
          name: product.name,
          currentUrl: product.externalUrl,
          needsAsin: product.externalUrl.includes('amzn.to'),
          recommendation: 'Use full Amazon URL with ASIN for stability'
        });
      }
    }
    
    return {
      total: amazonProducts.length,
      needingUpdate: updates.filter(u => u.needsAsin).length,
      products: updates
    };
  }
  
  /**
   * Validate that a link is still working
   * Returns true if link redirects to a product page
   */
  async validateLink(url: string): Promise<boolean> {
    try {
      // For now, just check if URL is properly formatted
      // In production, you'd want to check HTTP response
      return url.includes('amazon.com') || url.includes('amzn.to');
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get stable link format recommendations
   */
  getRecommendations() {
    return {
      bestPractices: [
        "Use full Amazon URLs instead of shortened amzn.to links",
        "Always include the ASIN in the URL structure",
        "Format: https://www.amazon.com/dp/[ASIN]?tag=myseniorvalet-20",
        "Store ASINs separately in database for rebuilding links",
        "Implement monthly link validation checks"
      ],
      exampleFormats: {
        stable: "https://www.amazon.com/dp/B08XYZ123?tag=myseniorvalet-20",
        unstable: "https://amzn.to/4dMNpQR",
        withDescription: "https://www.amazon.com/Senior-Walker-Seat/dp/B08XYZ123?tag=myseniorvalet-20"
      },
      howToGetAsin: [
        "Find ASIN on Amazon product page (under Product Details)",
        "Extract from full Amazon URL (/dp/[ASIN])",
        "Use Amazon Product Advertising API",
        "Ask user to provide ASIN when adding products"
      ]
    };
  }
}

export const amazonLinkManager = new AmazonLinkManager();