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
        
        // Skip marketing materials, logos, and obvious promotional content
        if (imgLower.includes('logo') || imgLower.includes('favicon') || 
            imgLower.includes('.svg') || imgLower.includes('sprite') ||
            imgLower.includes('twitter-x-20') || imgLower.includes('facebook-20') ||
            imgLower.includes('instagram-20') || imgLower.includes('youtube-20') ||
            imgLower.includes('linkedin-20') || imgLower.includes('pinterest-20') ||
            imgLower.includes('podcast') || imgLower.includes('newsletter')) {
          continue;
        }
        
        // Skip only very small icon sizes
        if (imgLower.includes('20-20') || imgLower.includes('20x20') ||
            imgLower.includes('50x50')) {
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
        } else {
          // Score images based on quality indicators
          let score = 0;
          
          // High priority: Images in gallery/photo sections
          if (imgLower.includes('/photos/') || imgLower.includes('/gallery/') || 
              imgLower.includes('/uploads/')) {
            score += 10;
          }
          
          // Medium priority: Facility-specific keywords
          const facilityKeywords = ['dining', 'bedroom', 'apartment', 'lounge', 
                                   'kitchen', 'bathroom', 'activity', 'amenity',
                                   'resident', 'living', 'room', 'suite', 
                                   'exterior', 'interior', 'courtyard', 'patio'];
          facilityKeywords.forEach(keyword => {
            if (imgLower.includes(keyword)) score += 5;
          });
          
          // Low priority: Generic community keywords
          if (imgLower.includes('community') && !imgLower.includes('_wht')) {
            score += 2;
          }
          if (imgLower.includes('facility')) {
            score += 2;
          }
          
          // Must be an image file with some score
          if (score > 0 && imgUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)) {
            // Check for duplicates properly
            const isDuplicate = data.photos.some((p: any) => {
              if (typeof p === 'string') return p === imgUrl;
              if (typeof p === 'object' && p.url) return p.url === imgUrl;
              return false;
            });
            
            if (!isDuplicate) {
              // Store with score for sorting later
              (data.photos as any).push({ url: imgUrl, score });
            }
          }
        }
      }
      
      // Sort photos by score and extract URLs
      const photoObjects: any[] = [];
      
      // Convert all photos to objects with scores
      for (const photo of data.photos as any[]) {
        if (typeof photo === 'string') {
          photoObjects.push({ url: photo, score: 1 });
        } else if (photo && typeof photo === 'object' && 'url' in photo) {
          photoObjects.push(photo);
        }
      }
      
      // Sort by score and extract URLs
      data.photos = photoObjects
        .sort((a, b) => b.score - a.score)
        .map(item => item.url)
        .slice(0, 20);
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