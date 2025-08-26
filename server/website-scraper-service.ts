interface ScrapedCommunityData {
  photos: string[];
  floorPlans: string[];
  virtualTours: string[];
  videos: string[];
  amenities: string[];
  pricing: {
    min?: string;
    max?: string;
    details?: string;
  };
  careLevels: string[];
  description?: string;
  features: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export class WebsiteScraperService {
  async scrapeWebsite(url: string): Promise<ScrapedCommunityData> {
    console.log(`🕸️ Scraping website: ${url}`);
    
    try {
      // Fetch the HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }
      
      const html = await response.text();

      // Initialize data structure
      const data: ScrapedCommunityData = {
        photos: [],
        floorPlans: [],
        virtualTours: [],
        videos: [],
        amenities: [],
        pricing: {},
        careLevels: [],
        features: [],
        contactInfo: {}
      };

      // First try to find images in gallery/photos sections
      const imageUrls: string[] = [];
      let match;
      
      // Look for gallery sections and extract images from them
      const galleryPatterns = [
        /<(?:div|section|article)[^>]*(?:class|id)=["'][^"']*(?:gallery|photos|images|carousel)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/gi,
        /<(?:div|section)[^>]*data-(?:gallery|photos)["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi
      ];
      
      for (const pattern of galleryPatterns) {
        while ((match = pattern.exec(html)) !== null) {
          const galleryContent = match[1];
          const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
          const lazyRegex = /data-(?:src|lazy|original)=["']([^"']+)["']/gi;
          
          let imgMatch;
          while ((imgMatch = imgRegex.exec(galleryContent)) !== null) {
            if (!imageUrls.includes(imgMatch[1])) {
              imageUrls.push(imgMatch[1]);
            }
          }
          while ((imgMatch = lazyRegex.exec(galleryContent)) !== null) {
            if (!imageUrls.includes(imgMatch[1])) {
              imageUrls.push(imgMatch[1]);
            }
          }
        }
      }
      
      // If we didn't find enough in galleries, look for all images (but be selective)
      if (imageUrls.length < 10) {
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const lazyImgRegex = /data-(?:src|lazy|original)=["']([^"']+)["']/gi;
        
        while ((match = imgRegex.exec(html)) !== null) {
          if (!imageUrls.includes(match[1])) {
            imageUrls.push(match[1]);
          }
        }
        
        while ((match = lazyImgRegex.exec(html)) !== null) {
          if (!imageUrls.includes(match[1])) {
            imageUrls.push(match[1]);
          }
        }
      }
      
      // Process and categorize images
      for (let imgUrl of imageUrls) {
        const imgLower = imgUrl.toLowerCase();
        
        // Skip marketing materials, logos, banners, and ads
        if (imgLower.includes('logo') || imgLower.includes('icon') || 
            imgLower.includes('favicon') || imgLower.includes('sprite') ||
            imgLower.includes('.svg') || imgLower.includes('banner') ||
            imgLower.includes('slider') || imgLower.includes('campaign') ||
            imgLower.includes('ad_') || imgLower.includes('_ad') ||
            imgLower.includes('promo') || imgLower.includes('podcast') ||
            imgLower.includes('newsletter') || imgLower.includes('header') ||
            imgLower.includes('footer') || imgLower.includes('background')) {
          continue;
        }
        
        // Skip images with marketing dimensions (likely ads)
        if (imgLower.includes('1200_x_1000') || imgLower.includes('1200x1000') ||
            imgLower.includes('width=250') || imgLower.includes('width=540') ||
            imgLower.includes('height=73') || imgLower.includes('height=450')) {
          continue;
        }
        
        // Make absolute URL if relative
        if (!imgUrl.startsWith('http')) {
          const baseUrl = new URL(url);
          imgUrl = new URL(imgUrl, baseUrl).href;
        }
        
        // Categorize images - be more selective
        if (imgLower.includes('floor') || imgLower.includes('plan') || imgLower.includes('layout')) {
          if (!data.floorPlans.includes(imgUrl)) {
            data.floorPlans.push(imgUrl);
          }
        } else if (
          // Look for images in gallery/photo sections
          (imgLower.includes('/photos/') || imgLower.includes('/gallery/') || 
           imgLower.includes('/images/')) ||
          // Or images with facility-related keywords
          (imgLower.includes('community') && !imgLower.includes('_wht')) ||
          imgLower.includes('resident') || imgLower.includes('dining') ||
          imgLower.includes('living') || imgLower.includes('bedroom') ||
          imgLower.includes('apartment') || imgLower.includes('facility') ||
          imgLower.includes('amenity') || imgLower.includes('activity') ||
          imgLower.includes('lounge') || imgLower.includes('kitchen') ||
          imgLower.includes('bathroom') || imgLower.includes('exterior') ||
          imgLower.includes('interior') || imgLower.includes('room')
        ) {
          // Additional check: must be an image file
          if (imgUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)) {
            if (!data.photos.includes(imgUrl)) {
              data.photos.push(imgUrl);
            }
          }
        }
      }
      
      // Limit photos to reasonable amount
      data.photos = data.photos.slice(0, 20);
      data.floorPlans = data.floorPlans.slice(0, 10);
      
      // Look for virtual tour links
      const virtualTourRegex = /(matterport\.com[^"'\s]+|3d-?tour[^"'\s]*|virtual-?tour[^"'\s]*)/gi;
      while ((match = virtualTourRegex.exec(html)) !== null) {
        if (match[1].startsWith('http')) {
          data.virtualTours.push(match[1]);
        }
      }
      
      // Look for video content
      const videoRegex = /(youtube\.com\/embed\/[^"'\s]+|vimeo\.com\/video\/[^"'\s]+|\.mp4["'\s])/gi;
      while ((match = videoRegex.exec(html)) !== null) {
        if (match[1].endsWith('.mp4')) {
          const mp4Match = html.substring(Math.max(0, html.indexOf(match[1]) - 100), html.indexOf(match[1])).match(/["']([^"']*\.mp4)/);
          if (mp4Match) {
            data.videos.push(mp4Match[1]);
          }
        } else {
          data.videos.push(match[1]);
        }
      }
      
      // Extract pricing information with enhanced patterns
      const extractPricing = () => {
        const pricingInfo: any = {};
        
        // Multiple pricing pattern variations found on senior living sites
        const pricingPatterns = [
          // Comprehensive patterns for senior living pricing
          /(?:starting\s+at|from|as\s+low\s+as|begins?\s+at)\s*\$?([\d,]+)(?:\s*(?:\/|per)\s*month)?/gi,
          /\$?([\d,]+)\s*(?:-|–|to)\s*\$?([\d,]+)\s*(?:\/|per)?\s*month/gi,
          /monthly\s+(?:rent|cost|fee|price|rate)s?\s*(?:of|:)?\s*\$?([\d,]+)/gi,
          /\$?([\d,]+)\s*(?:monthly|\/mo|per\s+month)/gi,
          /(?:base\s+)?(?:rent|price|cost|rate)\s*(?:is|:)?\s*\$?([\d,]+)/gi,
          /(?:independent|assisted|memory\s+care).{0,50}\$?([\d,]+)/gi,
          // Look for pricing in structured data
          /<(?:span|div|p)[^>]*(?:class|id)=["'][^"']*price[^"']*["'][^>]*>\s*\$?([\d,]+)/gi,
          // Pricing tables
          /<td[^>]*>\s*\$?([\d,]+)\s*(?:<\/td>|\/mo)/gi
        ];
        
        const foundPrices: number[] = [];
        const priceDetails: string[] = [];
        
        pricingPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            // Extract the numeric price
            const priceText = match[match.length - 1] || match[1]; // Last capture group
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            
            // Validate price is in reasonable range for senior living (monthly)
            if (price >= 1500 && price <= 25000) {
              foundPrices.push(price);
              
              // Capture the full context around the price
              const contextStart = Math.max(0, match.index - 50);
              const contextEnd = Math.min(html.length, match.index + match[0].length + 50);
              const context = html.substring(contextStart, contextEnd).replace(/<[^>]*>/g, ' ').trim();
              
              // Check what type of pricing this is
              if (context.toLowerCase().includes('independent')) {
                if (!pricingInfo.independentLiving) {
                  pricingInfo.independentLiving = `$${price.toLocaleString()}`;
                }
              } else if (context.toLowerCase().includes('assisted')) {
                if (!pricingInfo.assistedLiving) {
                  pricingInfo.assistedLiving = `$${price.toLocaleString()}`;
                }
              } else if (context.toLowerCase().includes('memory')) {
                if (!pricingInfo.memoryCare) {
                  pricingInfo.memoryCare = `$${price.toLocaleString()}`;
                }
              }
              
              priceDetails.push(context);
            }
          }
        });
        
        // Also look for pricing in JSON-LD structured data (often used by senior living sites)
        const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            if (jsonData.priceRange || jsonData.offers?.price || jsonData.offers?.priceRange) {
              const priceRange = jsonData.priceRange || jsonData.offers?.priceRange || jsonData.offers?.price;
              pricingInfo.structuredData = priceRange;
              
              // Try to extract numeric values
              const structuredPrices = priceRange.match(/\d+/g);
              if (structuredPrices) {
                structuredPrices.forEach((p: string) => {
                  const price = parseInt(p);
                  if (price >= 1500 && price <= 25000) {
                    foundPrices.push(price);
                  }
                });
              }
            }
          } catch (e) {
            // Invalid JSON, skip
          }
        }
        
        // Set min/max if we found prices
        if (foundPrices.length > 0) {
          const uniquePrices = [...new Set(foundPrices)].sort((a, b) => a - b);
          data.pricing.min = `$${uniquePrices[0].toLocaleString()}/month`;
          if (uniquePrices.length > 1) {
            data.pricing.max = `$${uniquePrices[uniquePrices.length - 1].toLocaleString()}/month`;
          }
          
          // Add detailed pricing information
          if (priceDetails.length > 0) {
            data.pricing.details = `Official Website Pricing - ${priceDetails[0].substring(0, 200)}`;
          }
          
          // Add care-level specific pricing if found
          if (pricingInfo.independentLiving || pricingInfo.assistedLiving || pricingInfo.memoryCare) {
            data.pricing.details = (data.pricing.details || '') + ' | Care Levels: ';
            if (pricingInfo.independentLiving) data.pricing.details += `IL: ${pricingInfo.independentLiving} `;
            if (pricingInfo.assistedLiving) data.pricing.details += `AL: ${pricingInfo.assistedLiving} `;
            if (pricingInfo.memoryCare) data.pricing.details += `MC: ${pricingInfo.memoryCare}`;
          }
        }
        
        console.log(`💰 Extracted pricing:`, data.pricing);
      };
      
      extractPricing();

      // Extract text content for analysis
      const textContent = html.replace(/<[^>]*>/g, ' ').toLowerCase();

      // Look for amenities
      const amenityKeywords = [
        'pool', 'gym', 'fitness', 'dining', 'restaurant', 'spa', 'salon',
        'library', 'theater', 'garden', 'patio', 'balcony', 'parking',
        'transportation', 'wifi', 'internet', 'laundry', 'housekeeping'
      ];
      
      amenityKeywords.forEach(keyword => {
        if (textContent.includes(keyword)) {
          data.amenities.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
      });

      // Look for care levels
      const careKeywords = [
        'independent living', 'assisted living', 'memory care', 
        'alzheimer', 'dementia', 'skilled nursing', 'rehabilitation',
        'hospice', 'respite'
      ];
      
      careKeywords.forEach(keyword => {
        if (textContent.includes(keyword)) {
          data.careLevels.push(keyword.split(' ').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' '));
        }
      });

      // Extract contact information
      const phoneMatch = html.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      if (phoneMatch) {
        data.contactInfo.phone = phoneMatch[0];
      }

      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        data.contactInfo.email = emailMatch[0];
      }

      console.log(`  Found ${data.photos.length} photos, ${data.floorPlans.length} floor plans`);
      
      return data;

    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      // Return empty data on error
      return {
        photos: [],
        floorPlans: [],
        virtualTours: [],
        videos: [],
        amenities: [],
        pricing: {},
        careLevels: [],
        features: [],
        contactInfo: {}
      };
    }
  }

  async close() {
    // No cleanup needed for fetch-based scraping
  }
}

// Export singleton instance
export const websiteScraperService = new WebsiteScraperService();