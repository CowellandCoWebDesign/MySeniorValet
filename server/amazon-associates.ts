// Amazon Associates Integration
// Product recommendations for senior living needs

import { AmazonProduct, SeniorProductCategories } from './senior-services';

interface AmazonAssociatesConfig {
  associateTag: string;
  accessKey?: string;
  secretKey?: string;
  partnerTag?: string;
  marketplace?: string;
}

export class AmazonAssociatesService {
  private config: AmazonAssociatesConfig;
  
  constructor(config: AmazonAssociatesConfig) {
    this.config = {
      marketplace: 'US',
      ...config
    };
  }
  
  // Generate SiteStripe compliant links
  generateSiteStripeLink(asin: string): string {
    return `https://www.amazon.com/dp/${asin}?tag=${this.config.associateTag}&linkCode=osi&th=1&psc=1`;
  }
  
  // Generate text link
  generateTextLink(asin: string, text: string): string {
    const url = this.generateSiteStripeLink(asin);
    return `<a href="${url}" target="_blank" rel="nofollow sponsored noopener">${text}</a>`;
  }
  
  // Generate image link
  generateImageLink(asin: string, imageUrl: string, altText: string): string {
    const url = this.generateSiteStripeLink(asin);
    return `<a href="${url}" target="_blank" rel="nofollow sponsored noopener">
      <img src="${imageUrl}" alt="${altText}" loading="lazy" />
    </a>`;
  }
  
  // Get recommended products for senior needs
  async getRecommendedProducts(category: keyof typeof SeniorProductCategories): Promise<AmazonProduct[]> {
    // Sample product data structure
    // In production, this would use Amazon Product Advertising API
    const sampleProducts: AmazonProduct[] = [
      {
        asin: 'B07DHSQMBT',
        title: 'Drive Medical Folding Walker with Wheels',
        price: '$89.99',
        rating: 4.5,
        reviewCount: 12453,
        imageUrl: 'https://m.media-amazon.com/images/I/71HfVzCmNSL._AC_SL1500_.jpg',
        productUrl: this.generateSiteStripeLink('B07DHSQMBT'),
        category: 'MOBILITY',
        features: ['Adjustable height', 'Foldable', '5" wheels', 'Tool-free assembly'],
        prime: true
      },
      {
        asin: 'B07YNL4K9R',
        title: 'MedCenter Monthly Pill Organizer',
        price: '$34.95',
        rating: 4.6,
        reviewCount: 8921,
        imageUrl: 'https://m.media-amazon.com/images/I/81YZR5DmCYL._AC_SL1500_.jpg',
        productUrl: this.generateSiteStripeLink('B07YNL4K9R'),
        category: 'DAILY_LIVING',
        features: ['31 daily compartments', 'Talking alarm', 'Large print'],
        prime: true
      },
      {
        asin: 'B08GFQ1F76',
        title: 'Vaunn Medical Adjustable Shower Chair',
        price: '$49.99',
        rating: 4.4,
        reviewCount: 6234,
        imageUrl: 'https://m.media-amazon.com/images/I/71qFt5LgJvL._AC_SL1500_.jpg',
        productUrl: this.generateSiteStripeLink('B08GFQ1F76'),
        category: 'SAFETY',
        features: ['Non-slip feet', 'Tool-free assembly', 'Drainage holes'],
        prime: true
      }
    ];
    
    return sampleProducts.filter(p => p.category === category);
  }
  
  // Get products based on community type
  async getProductsForCommunityType(careTypes: string[]): Promise<AmazonProduct[]> {
    const recommendedCategories: string[] = [];
    
    if (careTypes.includes('Memory Care')) {
      recommendedCategories.push('SAFETY', 'MEDICAL', 'COMMUNICATION');
    }
    
    if (careTypes.includes('Assisted Living')) {
      recommendedCategories.push('MOBILITY', 'DAILY_LIVING', 'COMFORT');
    }
    
    if (careTypes.includes('Independent Living')) {
      recommendedCategories.push('DAILY_LIVING', 'MEDICAL', 'COMFORT');
    }
    
    // Get products from recommended categories
    const allProducts: AmazonProduct[] = [];
    for (const category of recommendedCategories) {
      const products = await this.getRecommendedProducts(category as any);
      allProducts.push(...products);
    }
    
    return allProducts;
  }
  
  // Format product for display
  formatProductCard(product: AmazonProduct): string {
    return `
      <div class="amazon-product-card">
        <a href="${product.productUrl}" target="_blank" rel="nofollow sponsored noopener">
          <img src="${product.imageUrl}" alt="${product.title}" />
          <h4>${product.title}</h4>
          <div class="price">${product.price}</div>
          <div class="rating">⭐ ${product.rating} (${product.reviewCount.toLocaleString()} reviews)</div>
          ${product.prime ? '<span class="prime-badge">Prime</span>' : ''}
        </a>
      </div>
    `;
  }
  
  // Disclosure text for FTC compliance
  getDisclosureText(): string {
    return 'As an Amazon Associate, MySeniorValet earns from qualifying purchases. Product prices and availability are accurate as of the date/time indicated and are subject to change.';
  }
}

// Helper function to initialize the service
export function createAmazonAssociatesService(associateTag: string): AmazonAssociatesService {
  return new AmazonAssociatesService({ associateTag });
}