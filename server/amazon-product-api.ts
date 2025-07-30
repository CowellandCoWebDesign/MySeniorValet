import axios from 'axios';
import crypto from 'crypto';
import { db } from './db';
import { services } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Amazon Product Advertising API v5 Integration
// This provides REAL product data, prices, and availability
export class AmazonProductAPI {
  private accessKey: string;
  private secretKey: string;
  private associateTag: string;
  private region: string = 'us-east-1';
  private host: string = 'webservices.amazon.com';
  
  constructor() {
    // These need to be set in environment variables
    this.accessKey = process.env.AMAZON_ACCESS_KEY || '';
    this.secretKey = process.env.AMAZON_SECRET_KEY || '';
    this.associateTag = process.env.AMAZON_ASSOCIATE_TAG || 'myseniorvalet-20';
  }

  // Check if API credentials are configured
  isConfigured(): boolean {
    return !!(this.accessKey && this.secretKey);
  }

  // Generate signature for API requests (required by Amazon)
  private generateSignature(method: string, path: string, headers: any, payload: string): string {
    const canonicalRequest = this.createCanonicalRequest(method, path, headers, payload);
    const stringToSign = this.createStringToSign(canonicalRequest, headers);
    const signature = this.calculateSignature(stringToSign);
    return signature;
  }

  private createCanonicalRequest(method: string, path: string, headers: any, payload: string): string {
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key].trim()}`)
      .join('\n');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');
    
    const hashedPayload = crypto.createHash('sha256').update(payload).digest('hex');
    
    return [
      method,
      path,
      '',
      canonicalHeaders,
      '',
      signedHeaders,
      hashedPayload
    ].join('\n');
  }

  private createStringToSign(canonicalRequest: string, headers: any): string {
    const credentialScope = `${headers['X-Amz-Date'].substring(0, 8)}/${this.region}/ProductAdvertisingAPI/aws4_request`;
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    return [
      'AWS4-HMAC-SHA256',
      headers['X-Amz-Date'],
      credentialScope,
      hashedCanonicalRequest
    ].join('\n');
  }

  private calculateSignature(stringToSign: string): string {
    const dateKey = crypto.createHmac('sha256', `AWS4${this.secretKey}`)
      .update(new Date().toISOString().substring(0, 10).replace(/-/g, ''))
      .digest();
    const regionKey = crypto.createHmac('sha256', dateKey).update(this.region).digest();
    const serviceKey = crypto.createHmac('sha256', regionKey).update('ProductAdvertisingAPI').digest();
    const signingKey = crypto.createHmac('sha256', serviceKey).update('aws4_request').digest();
    
    return crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  }

  // Get real-time product data by ASIN
  async getProductByASIN(asin: string): Promise<any> {
    if (!this.isConfigured()) {
      console.log('Amazon Product API not configured - using database data');
      return null;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Amz-Date': timestamp,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
        'Host': this.host
      };

      const payload = JSON.stringify({
        ItemIds: [asin],
        PartnerTag: this.associateTag,
        PartnerType: 'Associates',
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
          'Offers.Listings.Availability.Message',
          'Images.Primary.Large',
          'ItemInfo.ProductInfo'
        ]
      });

      const signature = this.generateSignature('POST', '/paapi5/getitems', headers, payload);
      
      headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${timestamp.substring(0, 8)}/${this.region}/ProductAdvertisingAPI/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=${signature}`;

      const response = await axios.post(`https://${this.host}/paapi5/getitems`, payload, { headers });
      
      if (response.data && response.data.ItemsResult && response.data.ItemsResult.Items) {
        const item = response.data.ItemsResult.Items[0];
        return {
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue,
          price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount,
          availability: item.Offers?.Listings?.[0]?.Availability?.Message,
          features: item.ItemInfo?.Features?.DisplayValues,
          imageUrl: item.Images?.Primary?.Large?.URL,
          detailPageURL: `https://www.amazon.com/dp/${asin}?tag=${this.associateTag}`
        };
      }
    } catch (error: any) {
      console.error('Amazon API error:', error.response?.data || error.message);
      return null;
    }
  }

  // Update database with real-time Amazon data
  async syncProductData(): Promise<number> {
    if (!this.isConfigured()) {
      console.log('Amazon Product API not configured - skipping sync');
      return 0;
    }

    let updated = 0;
    
    try {
      // Get all Amazon products from database
      const amazonServices = await db
        .select()
        .from(services)
        .where(eq(services.providerId, 4)); // Amazon provider ID
      
      for (const service of amazonServices) {
        if (service.productId) {
          // Extract ASIN from product ID or external URL
          let asin = service.productId;
          
          // If productId looks like a URL, extract ASIN
          if (service.externalUrl && service.externalUrl.includes('/dp/')) {
            const match = service.externalUrl.match(/\/dp\/([A-Z0-9]{10})/);
            if (match) asin = match[1];
          }
          
          const productData = await this.getProductByASIN(asin);
          
          if (productData && productData.price) {
            // Update service with real Amazon data
            const priceMatch = productData.price.match(/\$?([\d,]+\.?\d*)/);
            const priceValue = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;
            
            await db.update(services)
              .set({
                pricing: {
                  type: 'fixed',
                  amount: priceValue || undefined,
                  currency: 'USD',
                  description: productData.price
                },
                externalUrl: productData.detailPageURL,
                metadata: {
                  ...service.metadata as any,
                  lastUpdated: new Date().toISOString()
                },
                updatedAt: new Date()
              })
              .where(eq(services.id, service.id));
            
            updated++;
            console.log(`Updated ${service.name} with real-time price: ${productData.price}`);
          }
          
          // Rate limit - Amazon allows 1 request per second
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`Amazon Product sync complete: ${updated} products updated`);
    } catch (error) {
      console.error('Error syncing Amazon products:', error);
    }
    
    return updated;
  }

  // Get affiliate link with proper tracking
  getAffiliateLink(productUrl: string): string {
    if (!productUrl) return '';
    
    // If it's already a short link with affiliate tag, return as is
    if (productUrl.includes('amzn.to') || productUrl.includes('tag=')) {
      return productUrl;
    }
    
    // Add affiliate tag to regular Amazon URLs
    const separator = productUrl.includes('?') ? '&' : '?';
    return `${productUrl}${separator}tag=${this.associateTag}`;
  }

  // Validate that affiliate links are working correctly
  async validateAffiliateLinks(): Promise<{valid: number, invalid: number, results: any[]}> {
    const results = [];
    let valid = 0;
    let invalid = 0;
    
    const amazonServices = await db
      .select()
      .from(services)
      .where(eq(services.providerId, 4));
    
    for (const service of amazonServices) {
      if (service.externalUrl) {
        try {
          // Check if URL redirects properly
          const response = await axios.head(service.externalUrl, {
            maxRedirects: 0,
            validateStatus: (status) => status === 301 || status === 302
          });
          
          if (response.headers.location && response.headers.location.includes('tag=')) {
            valid++;
            results.push({
              name: service.name,
              status: 'valid',
              url: service.externalUrl
            });
          } else {
            invalid++;
            results.push({
              name: service.name,
              status: 'invalid',
              url: service.externalUrl,
              issue: 'Missing affiliate tag'
            });
          }
        } catch (error) {
          invalid++;
          results.push({
            name: service.name,
            status: 'error',
            url: service.externalUrl,
            issue: 'Failed to validate'
          });
        }
      }
    }
    
    return { valid, invalid, results };
  }
}

// Export singleton instance
export const amazonProductAPI = new AmazonProductAPI();