/**
 * Amazon Affiliate Link Health Checker
 * Ensures all Amazon links are stable, safe, and revenue-generating
 * Complies with Amazon Associates Program Operating Agreement
 */

export interface LinkHealthResult {
  isHealthy: boolean;
  status: 'healthy' | 'missing-tag' | 'not-product' | 'shortened' | 'broken' | 'invalid';
  message: string;
  fixedUrl?: string;
}

/**
 * Check Amazon affiliate link health according to compliance rules
 */
export function checkAmazonAffiliateLinkHealth(url: string): LinkHealthResult {
  try {
    // Basic URL validation
    if (!url || typeof url !== 'string') {
      return {
        isHealthy: false,
        status: 'invalid',
        message: '❌ Invalid URL provided'
      };
    }

    // Check for shortened links
    if (url.includes('amzn.to/') || url.includes('amzn.com/')) {
      return {
        isHealthy: false,
        status: 'shortened',
        message: '⚠️ Shortened link detected - must be expanded before use'
      };
    }

    // Check if it's an Amazon URL
    if (!url.includes('amazon.com')) {
      return {
        isHealthy: false,
        status: 'invalid',
        message: '❌ Not an Amazon URL'
      };
    }

    // Check for product page (must include /dp/ or /gp/product/)
    const isProductPage = url.includes('/dp/') || url.includes('/gp/product/');
    if (!isProductPage) {
      return {
        isHealthy: false,
        status: 'not-product',
        message: '❌ Not a product link - must link to specific products only'
      };
    }

    // Check for affiliate tag
    const affiliateTag = 'tag=myseniorvalet-20';
    if (!url.includes(affiliateTag)) {
      // Try to fix by adding the tag
      const separator = url.includes('?') ? '&' : '?';
      const fixedUrl = `${url}${separator}${affiliateTag}`;
      
      return {
        isHealthy: false,
        status: 'missing-tag',
        message: '❌ Missing affiliate tag',
        fixedUrl
      };
    }

    // Check for homepage fallback patterns
    if (url.endsWith('amazon.com/') || url.endsWith('amazon.com/?tag=myseniorvalet-20')) {
      return {
        isHealthy: false,
        status: 'broken',
        message: '❌ Redirects to homepage - link is broken'
      };
    }

    // All checks passed
    return {
      isHealthy: true,
      status: 'healthy',
      message: '✅ Link is healthy and compliant'
    };
  } catch (error) {
    return {
      isHealthy: false,
      status: 'invalid',
      message: '❌ Error checking link health'
    };
  }
}

/**
 * Batch check multiple Amazon links
 */
export async function batchCheckAmazonLinks(urls: string[]): Promise<Map<string, LinkHealthResult>> {
  const results = new Map<string, LinkHealthResult>();
  
  for (const url of urls) {
    results.set(url, checkAmazonAffiliateLinkHealth(url));
  }
  
  return results;
}

/**
 * Fix common Amazon link issues
 */
export function fixAmazonLink(url: string): string {
  const result = checkAmazonAffiliateLinkHealth(url);
  
  if (result.fixedUrl) {
    return result.fixedUrl;
  }
  
  if (result.isHealthy) {
    return url;
  }
  
  // Default fallback with affiliate tag
  return 'https://www.amazon.com/?tag=myseniorvalet-20';
}

/**
 * Extract ASIN from Amazon URL
 */
export function extractASIN(url: string): string | null {
  // Match patterns like /dp/B08XYZ123/ or /gp/product/B08XYZ123/
  const asinMatch = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : null;
}

/**
 * Build compliant Amazon product URL from ASIN
 */
export function buildAmazonProductUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=myseniorvalet-20`;
}