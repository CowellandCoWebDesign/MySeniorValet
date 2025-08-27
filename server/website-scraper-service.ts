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
  private async fetchPage(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`⚠️ Failed to fetch ${url}: ${response.status}`);
        return null;
      }
      
      return await response.text();
    } catch (error) {
      console.log(`⚠️ Error fetching ${url}: ${error}`);
      return null;
    }
  }
  
  private extractGalleryLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkPatterns = [
      /<a[^>]+href=["']([^"']*(?:gallery|photos|tour|amenities|floor-plans|virtual-tour)[^"']*)["']/gi,
      /<a[^>]+href=["']([^"']*)["'][^>]*>(?:[^<]*(?:photos|gallery|tour|amenities|floor|virtual)[^<]*)<\/a>/gi
    ];
    
    for (const pattern of linkPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let link = match[1];
        // Convert relative URLs to absolute
        if (link.startsWith('/')) {
          const urlObj = new URL(baseUrl);
          link = `${urlObj.protocol}//${urlObj.host}${link}`;
        } else if (!link.startsWith('http')) {
          const urlObj = new URL(baseUrl);
          link = `${urlObj.protocol}//${urlObj.host}/${link}`;
        }
        
        if (!links.includes(link) && link.includes(new URL(baseUrl).host)) {
          links.push(link);
        }
      }
    }
    
    return links;
  }

  async scrapeWebsite(url: string, communityName?: string): Promise<ScrapedCommunityData> {
    console.log(`🕸️ Scraping website: ${url}`);
    
    // Check if this is a seniorlivingnearme listing (official community listing service)
    const isSeniorLivingNearMe = url.includes('seniorlivingnearme.com');
    if (isSeniorLivingNearMe) {
      console.log('✅ Detected official seniorlivingnearme.com community listing');
    }
    
    try {
      // Fetch the main page
      const html = await this.fetchPage(url);
      if (!html) {
        throw new Error(`Failed to fetch ${url}`);
      }
      
      // Find and explore gallery/photo pages
      const galleryLinks = this.extractGalleryLinks(html, url);
      console.log(`📁 Found ${galleryLinks.length} potential gallery/photo pages`);
      
      // Fetch all gallery pages in parallel
      const pagePromises = galleryLinks.slice(0, 5).map(link => this.fetchPage(link)); // Limit to 5 pages
      const additionalPages = await Promise.all(pagePromises);
      
      // Combine all HTML for photo extraction
      let allHtml = html;
      let pageCount = 1;
      for (let i = 0; i < additionalPages.length; i++) {
        if (additionalPages[i]) {
          allHtml += '\n' + additionalPages[i];
          pageCount++;
          console.log(`📄 Processing page ${pageCount}: ${galleryLinks[i]}`);
        }
      }

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

      // Extract all images from all pages
      const imageUrls: string[] = [];
      let match;
      
      // Enhanced patterns to find images in various contexts
      const imgPatterns = [
        /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
        /data-(?:src|lazy|original|lazy-src)=["']([^"']+)["']/gi,
        /<source[^>]+srcset=["']([^"']+)["'][^>]*>/gi,
        /background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi,
        /data-background=["']([^"']+)["']/gi
      ];
      
      console.log(`🔍 Searching for images across ${pageCount} pages...`);
      
      for (const pattern of imgPatterns) {
        while ((match = pattern.exec(allHtml)) !== null) {
          let imgUrl = match[1];
          
          // Handle srcset (take first image)
          if (imgUrl.includes(',')) {
            imgUrl = imgUrl.split(',')[0].trim().split(' ')[0];
          }
          
          if (!imageUrls.includes(imgUrl)) {
            imageUrls.push(imgUrl);
          }
        }
      }
      
      console.log(`📷 Found ${imageUrls.length} total image URLs`);
      
      // Process and categorize images  
      const baseUrlObj = new URL(url);
      const processedPhotos: string[] = [];
      const processedFloorPlans: string[] = [];
      const processedVirtual: string[] = [];
      
      for (let imgUrl of imageUrls) {
        // Convert relative URLs to absolute
        if (imgUrl.startsWith('//')) {
          imgUrl = `https:${imgUrl}`;
        } else if (imgUrl.startsWith('/')) {
          imgUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${imgUrl}`;
        } else if (!imgUrl.startsWith('http')) {
          imgUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}/${imgUrl}`;
        }
        
        const imgLower = imgUrl.toLowerCase();
        
        // Skip marketing materials, logos, banners, and ads
        if (imgLower.includes('logo') || imgLower.includes('icon') || 
            imgLower.includes('favicon') || imgLower.includes('sprite') ||
            imgLower.includes('.svg') || imgLower.includes('banner') ||
            imgLower.includes('slider') || imgLower.includes('campaign') ||
            imgLower.includes('ad_') || imgLower.includes('_ad') ||
            imgLower.includes('promo') || imgLower.includes('podcast') ||
            imgLower.includes('newsletter') || imgLower.includes('header') ||
            imgLower.includes('footer') || imgLower.includes('background') ||
            imgLower.includes('button') || imgLower.includes('arrow')) {
          continue;
        }
        
        // Skip images with marketing dimensions (likely ads)
        if (imgLower.includes('1200_x_1000') || imgLower.includes('1200x1000') ||
            imgLower.includes('width=250') || imgLower.includes('width=540') ||
            imgLower.includes('height=73') || imgLower.includes('height=450')) {
          continue;
        }
        
        // Categorize images
        if (imgLower.includes('floor') || imgLower.includes('plan') || imgLower.includes('layout')) {
          if (!processedFloorPlans.includes(imgUrl)) {
            processedFloorPlans.push(imgUrl);
          }
        } else if (imgUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)) {
          // Since we're on the official community website, be inclusive with photos
          // Only exclude obvious non-community images (which we already filtered above)
          if (!processedPhotos.includes(imgUrl)) {
            processedPhotos.push(imgUrl);
          }
        }
      }
      
      // Transfer processed photos to data structure
      data.photos = processedPhotos.slice(0, 30); // Allow up to 30 photos from official site
      data.floorPlans = processedFloorPlans.slice(0, 10);
      
      console.log(`✅ Extracted ${data.photos.length} community photos from ${pageCount} pages`);
      console.log(`📐 Found ${data.floorPlans.length} floor plans`);
      
      // Look for virtual tour links
      const virtualTourRegex = /(matterport\.com[^"'\s]+|3d-?tour[^"'\s]*|virtual-?tour[^"'\s]*)/gi;
      while ((match = virtualTourRegex.exec(allHtml)) !== null) {
        if (match[1].startsWith('http')) {
          data.virtualTours.push(match[1]);
        }
      }
      
      // Look for video content
      const videoRegex = /(youtube\.com\/embed\/[^"'\s]+|vimeo\.com\/video\/[^"'\s]+|\.mp4["'\s])/gi;
      while ((match = videoRegex.exec(allHtml)) !== null) {
        if (match[1].endsWith('.mp4')) {
          const mp4Match = allHtml.substring(Math.max(0, allHtml.indexOf(match[1]) - 100), allHtml.indexOf(match[1])).match(/["']([^"']*\.mp4)/);
          if (mp4Match) {
            data.videos.push(mp4Match[1]);
          }
        } else {
          data.videos.push(match[1]);
        }
      }
      
      // Extract pricing information with enhanced patterns and community name verification
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
        const verifiedPrices: number[] = []; // Prices verified to be for THIS community
        const priceDetails: string[] = [];
        
        pricingPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            // Extract the numeric price
            const priceText = match[match.length - 1] || match[1]; // Last capture group
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            
            // Validate price is in reasonable range for senior living (monthly)
            if (price >= 1500 && price <= 25000) {
              // Capture wider context to verify this is for the right community
              const contextStart = Math.max(0, match.index - 200);
              const contextEnd = Math.min(html.length, match.index + match[0].length + 200);
              const context = html.substring(contextStart, contextEnd).replace(/<[^>]*>/g, ' ').trim();
              
              // Check if community name is mentioned nearby (if provided)
              let isVerifiedPrice = false;
              if (communityName) {
                // Check if this price is associated with our community name
                const nameWords = communityName.toLowerCase().split(/\s+/);
                const contextLower = context.toLowerCase();
                
                // Check if all significant words from community name are present
                const significantWords = nameWords.filter(word => word.length > 3);
                if (significantWords.length > 0) {
                  const matchedWords = significantWords.filter(word => contextLower.includes(word));
                  if (matchedWords.length === significantWords.length) {
                    isVerifiedPrice = true;
                    verifiedPrices.push(price);
                  }
                }
              }
              
              // Always add to found prices, but track if verified
              if (!isVerifiedPrice) {
                foundPrices.push(price);
              }
              
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
              
              // Only save price details if verified or no community name provided
              if (isVerifiedPrice || !communityName) {
                priceDetails.push(context.substring(0, 300));
              }
            }
          }
        });
        
        // Also look for pricing in JSON-LD structured data (often used by senior living sites)
        const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            
            // Check if this JSON-LD is for our community
            let isOurCommunity = true;
            if (communityName && jsonData.name) {
              const nameWords = communityName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
              const jsonName = jsonData.name.toLowerCase();
              const matchedWords = nameWords.filter(word => jsonName.includes(word));
              isOurCommunity = matchedWords.length === nameWords.length;
            }
            
            if (isOurCommunity && (jsonData.priceRange || jsonData.offers?.price || jsonData.offers?.priceRange)) {
              const priceRange = jsonData.priceRange || jsonData.offers?.priceRange || jsonData.offers?.price;
              pricingInfo.structuredData = priceRange;
              
              // Try to extract numeric values
              const structuredPrices = priceRange.match(/\d+/g);
              if (structuredPrices) {
                structuredPrices.forEach((p: string) => {
                  const price = parseInt(p);
                  if (price >= 1500 && price <= 25000) {
                    verifiedPrices.push(price);
                  }
                });
              }
            }
          } catch (e) {
            // Invalid JSON, skip
          }
        }
        
        // Prioritize verified prices over general prices
        const pricesToUse = verifiedPrices.length > 0 ? verifiedPrices : foundPrices;
        
        // Set min/max if we found prices
        if (pricesToUse.length > 0) {
          const uniquePrices = [...new Set(pricesToUse)].sort((a, b) => a - b);
          data.pricing.min = `$${uniquePrices[0].toLocaleString()}/month`;
          if (uniquePrices.length > 1) {
            data.pricing.max = `$${uniquePrices[uniquePrices.length - 1].toLocaleString()}/month`;
          }
          
          // Add detailed pricing information
          if (priceDetails.length > 0) {
            const source = isSeniorLivingNearMe ? 'Official SeniorLivingNearMe Listing' : 'Official Website';
            data.pricing.details = `${source} Pricing - ${priceDetails[0].substring(0, 200)}`;
          }
          
          // Add care-level specific pricing if found
          if (pricingInfo.independentLiving || pricingInfo.assistedLiving || pricingInfo.memoryCare) {
            data.pricing.details = (data.pricing.details || '') + ' | Care Levels: ';
            if (pricingInfo.independentLiving) data.pricing.details += `IL: ${pricingInfo.independentLiving} `;
            if (pricingInfo.assistedLiving) data.pricing.details += `AL: ${pricingInfo.assistedLiving} `;
            if (pricingInfo.memoryCare) data.pricing.details += `MC: ${pricingInfo.memoryCare}`;
          }
        }
        
        console.log(`💰 Extracted pricing (${verifiedPrices.length} verified, ${foundPrices.length} general):`, data.pricing);
      };
      
      extractPricing();

      // Extract text content for analysis
      const textContent = html.replace(/<[^>]*>/g, ' ').toLowerCase();

      // Extract community description from meta tags or page content
      const extractDescription = () => {
        // Try meta description first
        const metaDescMatch = html.match(/<meta\s+(?:name=["']description["']|property=["']og:description["'])\s+content=["']([^"']+)["']/i);
        if (metaDescMatch) {
          data.description = metaDescMatch[1];
        }
        
        // Look for about/description sections
        const aboutPatterns = [
          /<(?:div|section|article)[^>]*(?:class|id)=["'][^"']*(?:about|description|overview|intro)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/gi,
          /<(?:h[1-3])[^>]*>(?:About|Overview|Welcome)[^<]*<\/h[1-3]>\s*<(?:p|div)[^>]*>([\s\S]*?)<\/(?:p|div)>/gi,
        ];
        
        if (!data.description) {
          for (const pattern of aboutPatterns) {
            const match = pattern.exec(html);
            if (match) {
              const cleaned = match[1].replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 500);
              if (cleaned.length > 50) {
                data.description = cleaned;
                break;
              }
            }
          }
        }
      };
      
      extractDescription();

      // Enhanced amenity extraction with more comprehensive keywords
      const extractAmenities = () => {
        const amenityPatterns = [
          // Look for amenity lists
          /<(?:ul|ol)[^>]*(?:class|id)=["'][^"']*(?:amenities|features|services)[^"']*["'][^>]*>([\s\S]*?)<\/(?:ul|ol)>/gi,
          // Look for amenity sections
          /<(?:div|section)[^>]*(?:class|id)=["'][^"']*amenities[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
        ];
        
        const foundAmenities = new Set<string>();
        
        // Extract from structured sections first
        amenityPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            const listContent = match[1];
            // Extract list items
            const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(listContent)) !== null) {
              const amenity = itemMatch[1].replace(/<[^>]*>/g, ' ').trim();
              if (amenity.length > 2 && amenity.length < 100) {
                foundAmenities.add(amenity);
              }
            }
          }
        });
        
        // Comprehensive amenity keywords
        const amenityKeywords = [
          // Living amenities
          'pool', 'swimming pool', 'gym', 'fitness center', 'exercise room',
          'library', 'theater', 'movie theater', 'garden', 'patio', 'balcony',
          'courtyard', 'walking paths', 'outdoor space',
          
          // Dining
          'dining room', 'restaurant', 'bistro', 'cafe', 'private dining',
          'chef-prepared meals', 'all-day dining', 'snack bar',
          
          // Services
          'transportation', 'shuttle service', 'wifi', 'internet', 'laundry',
          'housekeeping', 'maintenance', 'concierge', 'valet',
          
          // Health & Wellness
          'spa', 'salon', 'beauty shop', 'barber', 'wellness center',
          'physical therapy', 'occupational therapy', 'speech therapy',
          
          // Social & Activities
          'activity room', 'game room', 'craft room', 'art studio',
          'music room', 'chapel', 'meditation room', 'billiards',
          'card room', 'computer room', 'business center',
          
          // Safety & Security
          '24-hour staff', 'emergency response', 'secure entry',
          'security system', 'call system', 'smoke detectors',
          
          // Pet-friendly
          'pet friendly', 'pets allowed', 'pet park', 'dog park'
        ];
        
        amenityKeywords.forEach(keyword => {
          if (textContent.includes(keyword.toLowerCase())) {
            foundAmenities.add(keyword.split(' ').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' '));
          }
        });
        
        data.amenities = Array.from(foundAmenities).slice(0, 30); // Limit to 30 amenities
      };
      
      extractAmenities();

      // Enhanced care level extraction
      const careKeywords = [
        'independent living', 'assisted living', 'memory care', 
        'alzheimer\'s care', 'dementia care', 'skilled nursing', 
        'rehabilitation', 'rehab services', 'respite care', 
        'hospice care', 'continuing care', 'board and care',
        'residential care', 'personal care'
      ];
      
      const foundCareLevels = new Set<string>();
      careKeywords.forEach(keyword => {
        if (textContent.includes(keyword)) {
          foundCareLevels.add(keyword.split(' ').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' '));
        }
      });
      data.careLevels = Array.from(foundCareLevels);

      // Enhanced features extraction
      const extractFeatures = () => {
        const featureKeywords = [
          'wheelchair accessible', 'ada compliant', 'elevator access',
          'medication management', 'diabetes care', 'incontinence care',
          'behavioral management', 'wound care', 'iv therapy',
          'oxygen therapy', 'pain management', 'fall prevention',
          'nutrition services', 'social services', 'activities program',
          'religious services', 'visiting physicians', 'podiatry services',
          'dental services', 'vision services', 'hearing services'
        ];
        
        const foundFeatures = new Set<string>();
        featureKeywords.forEach(keyword => {
          if (textContent.includes(keyword)) {
            foundFeatures.add(keyword.split(' ').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' '));
          }
        });
        data.features = Array.from(foundFeatures);
      };
      
      extractFeatures();

      // Enhanced contact information extraction
      const phonePatterns = [
        /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
        /\d{3}[\s.-]\d{3}[\s.-]\d{4}/g,
        /\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g
      ];
      
      for (const pattern of phonePatterns) {
        const phoneMatch = html.match(pattern);
        if (phoneMatch) {
          data.contactInfo.phone = phoneMatch[0];
          break;
        }
      }

      const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        data.contactInfo.email = emailMatch[0];
      }
      
      // Extract address if present
      const addressMatch = html.match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Place|Pl)[^<]*/);
      if (addressMatch) {
        data.contactInfo.address = addressMatch[0].trim();
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