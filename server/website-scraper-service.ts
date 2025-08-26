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

      // Use regex to find all image URLs in the HTML
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const lazyImgRegex = /data-(?:src|lazy|original)=["']([^"']+)["']/gi;
      const backgroundRegex = /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi;
      
      const imageUrls: string[] = [];
      let match;
      
      // Extract from img src
      while ((match = imgRegex.exec(html)) !== null) {
        imageUrls.push(match[1]);
      }
      
      // Extract from lazy loading attributes
      while ((match = lazyImgRegex.exec(html)) !== null) {
        imageUrls.push(match[1]);
      }
      
      // Extract from CSS background images
      while ((match = backgroundRegex.exec(html)) !== null) {
        imageUrls.push(match[1]);
      }
      
      // Process and categorize images
      for (let imgUrl of imageUrls) {
        // Skip logos, icons, and tiny images
        if (imgUrl.includes('logo') || imgUrl.includes('icon') || 
            imgUrl.includes('favicon') || imgUrl.includes('sprite') ||
            imgUrl.includes('.svg')) {
          continue;
        }
        
        // Make absolute URL if relative
        if (!imgUrl.startsWith('http')) {
          const baseUrl = new URL(url);
          imgUrl = new URL(imgUrl, baseUrl).href;
        }
        
        // Categorize images
        const imgLower = imgUrl.toLowerCase();
        if (imgLower.includes('floor') || imgLower.includes('plan') || imgLower.includes('layout')) {
          if (!data.floorPlans.includes(imgUrl)) {
            data.floorPlans.push(imgUrl);
          }
        } else if (imgLower.includes('/photos/') || imgLower.includes('/gallery/') || 
                   imgLower.includes('/images/') || imgLower.includes('community') ||
                   imgLower.includes('resident') || imgLower.includes('dining') ||
                   imgLower.includes('living') || imgLower.includes('bedroom') ||
                   imgLower.includes('apartment') || imgLower.includes('facility')) {
          if (!data.photos.includes(imgUrl)) {
            data.photos.push(imgUrl);
          }
        } else if (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || 
                   imgUrl.includes('.png') || imgUrl.includes('.webp')) {
          // Generic image that might be a photo
          if (!data.photos.includes(imgUrl)) {
            data.photos.push(imgUrl);
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
      
      // Extract pricing information
      const priceRegex = /\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/\s*mo(?:nth)?)?/gi;
      const priceMatches = html.match(priceRegex) || [];
      
      if (priceMatches.length > 0) {
        // Try to find min/max pricing
        const prices = priceMatches
          .map(p => parseInt(p.replace(/[^\d]/g, '')))
          .filter(p => p > 500 && p < 50000); // Reasonable monthly price range
        
        if (prices.length > 0) {
          data.pricing.min = `$${Math.min(...prices).toLocaleString()}`;
          data.pricing.max = `$${Math.max(...prices).toLocaleString()}`;
        }
      }

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