import * as cheerio from 'cheerio';

interface ScrapedPhoto {
  url: string;
  alt?: string;
  title?: string;
  context?: string;
}

interface ScrapedVideo {
  url: string;
  platform?: string;
  title?: string;
  embedUrl?: string;
}

interface ScrapeResult {
  photos: ScrapedPhoto[];
  videos: ScrapedVideo[];
}

export class CheerioPhotoScraper {
  
  async scrapePhotosFromWebsite(
    websiteUrl: string,
    communityName: string,
    options?: {
      maxPhotos?: number;
      timeout?: number;
    }
  ): Promise<ScrapedPhoto[]> {
    const photos: ScrapedPhoto[] = [];
    
    // Normalize URL to HTTPS
    let normalizedUrl = websiteUrl;
    if (normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }
    if (!normalizedUrl.startsWith('https://') && !normalizedUrl.startsWith('http://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // URLs to try (original + HTTPS version if different)
    const urlsToTry = [normalizedUrl];
    if (websiteUrl !== normalizedUrl) {
      urlsToTry.push(websiteUrl); // Fallback to original if normalized fails
    }
    
    let lastError: Error | null = null;
    let response: Response | null = null;
    
    // Retry logic with multiple URL attempts
    for (const url of urlsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`🌐 Fetching ${url} with Cheerio (attempt ${attempt})...`);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), options?.timeout || 15000);
          
          response = await fetch(url, {
            signal: controller.signal,
            redirect: 'follow', // Follow redirects automatically
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Cache-Control': 'max-age=0'
            }
          });
          
          clearTimeout(timeout);
          
          if (response.ok) {
            console.log(`✅ Successfully fetched ${url}`);
            break; // Success, exit retry loop
          } else {
            console.log(`⚠️ HTTP ${response.status} for ${url}, ${attempt < 2 ? 'retrying...' : 'trying next URL...'}`);
            response = null;
          }
        } catch (fetchError) {
          lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
          console.log(`⚠️ Fetch error for ${url}: ${lastError.message}, ${attempt < 2 ? 'retrying...' : 'trying next URL...'}`);
          response = null;
        }
      }
      
      if (response && response.ok) break; // Success, exit URL loop
    }
    
    if (!response || !response.ok) {
      console.log(`❌ All fetch attempts failed for ${websiteUrl}`);
      return [];
    }
    
    try {
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      console.log('📸 Extracting images from HTML...');
      
      // Extract all img tags
      $('img').each((index, element) => {
        const $img = $(element);
        const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
        const alt = $img.attr('alt');
        const title = $img.attr('title');
        const width = $img.attr('width');
        const height = $img.attr('height');
        
        // Don't skip anything - show all images
        // User requested to see everything
        
        // Skip small images (likely icons)
        if (width && height) {
          const w = parseInt(width);
          const h = parseInt(height);
          if (!isNaN(w) && !isNaN(h) && (w < 100 || h < 100)) return;
        }
        
        if (src && this.isValidPhotoUrl(src) && !this.isStockPhoto(src)) {
          photos.push({
            url: this.resolveUrl(src, websiteUrl),
            alt,
            title,
            context: `Image: ${alt || title || 'facility photo'}`
          });
        }
      });
      
      console.log(`  Found ${photos.length} images from <img> tags`);
      
      // Extract background images
      const styleElements = $('[style*="background-image"]');
      styleElements.each((index, element) => {
        const $el = $(element);
        const style = $el.attr('style') || '';
        const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
        
        if (urlMatch && urlMatch[1]) {
          const bgUrl = urlMatch[1];
          if (this.isValidPhotoUrl(bgUrl) && !this.isStockPhoto(bgUrl)) {
            photos.push({
              url: this.resolveUrl(bgUrl, websiteUrl),
              context: `Background image on ${element.name}`
            });
          }
        }
      });
      
      // Look for images in links that point to images
      $('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"]').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        
        if (href && this.isValidPhotoUrl(href) && !this.isStockPhoto(href)) {
          photos.push({
            url: this.resolveUrl(href, websiteUrl),
            context: 'Linked image'
          });
        }
      });
      
      // Extract Open Graph and meta images
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage && this.isValidPhotoUrl(ogImage) && !this.isStockPhoto(ogImage)) {
        photos.push({
          url: this.resolveUrl(ogImage, websiteUrl),
          context: 'Open Graph image'
        });
      }
      
      const twitterImage = $('meta[name="twitter:image"]').attr('content');
      if (twitterImage && this.isValidPhotoUrl(twitterImage) && !this.isStockPhoto(twitterImage)) {
        photos.push({
          url: this.resolveUrl(twitterImage, websiteUrl),
          context: 'Twitter card image'
        });
      }
      
      // Look for images in picture elements
      $('picture source, picture img').each((index, element) => {
        const $el = $(element);
        const srcset = $el.attr('srcset');
        const src = $el.attr('src');
        
        if (srcset) {
          // Extract first URL from srcset
          const firstUrl = srcset.split(',')[0].trim().split(' ')[0];
          if (this.isValidPhotoUrl(firstUrl) && !this.isStockPhoto(firstUrl)) {
            photos.push({
              url: this.resolveUrl(firstUrl, websiteUrl),
              context: 'Picture element'
            });
          }
        } else if (src && this.isValidPhotoUrl(src) && !this.isStockPhoto(src)) {
          photos.push({
            url: this.resolveUrl(src, websiteUrl),
            context: 'Picture element'
          });
        }
      });
      
      // Look for JSON-LD structured data
      $('script[type="application/ld+json"]').each((index, element) => {
        try {
          const jsonText = $(element).html();
          if (jsonText) {
            const jsonData = JSON.parse(jsonText);
            this.extractImagesFromJson(jsonData, photos, websiteUrl);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      });
      
      // Remove duplicates
      const uniquePhotos = this.deduplicatePhotos(photos);
      
      // USER REQUEST: Show ALL photos without filtering
      console.log(`✅ Found ${uniquePhotos.length} photos from ${websiteUrl} (showing all without filtering)`);
      
      // Apply maxPhotos limit
      const limit = options?.maxPhotos || 30;
      return uniquePhotos.slice(0, limit);
      
    } catch (error) {
      console.error(`❌ Error scraping ${websiteUrl}:`, error instanceof Error ? error.message : error);
      return [];
    }
  }
  
  private extractImagesFromJson(obj: any, photos: ScrapedPhoto[], baseUrl: string): void {
    if (!obj) return;
    
    // Check if obj has image property
    if (obj.image) {
      if (typeof obj.image === 'string' && this.isValidPhotoUrl(obj.image) && !this.isStockPhoto(obj.image)) {
        photos.push({
          url: this.resolveUrl(obj.image, baseUrl),
          context: 'Structured data image'
        });
      } else if (Array.isArray(obj.image)) {
        obj.image.forEach((img: any) => {
          if (typeof img === 'string' && this.isValidPhotoUrl(img) && !this.isStockPhoto(img)) {
            photos.push({
              url: this.resolveUrl(img, baseUrl),
              context: 'Structured data image'
            });
          } else if (img?.url && this.isValidPhotoUrl(img.url) && !this.isStockPhoto(img.url)) {
            photos.push({
              url: this.resolveUrl(img.url, baseUrl),
              context: 'Structured data image'
            });
          }
        });
      } else if (obj.image?.url && this.isValidPhotoUrl(obj.image.url) && !this.isStockPhoto(obj.image.url)) {
        photos.push({
          url: this.resolveUrl(obj.image.url, baseUrl),
          context: 'Structured data image'
        });
      }
    }
    
    // Recursively check nested objects
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          this.extractImagesFromJson(obj[key], photos, baseUrl);
        }
      }
    }
  }
  
  private isValidPhotoUrl(url: string): boolean {
    if (!url || url.length < 10) return false;
    const urlLower = url.toLowerCase();
    
    // Always reject these file types
    if (/\.(svg|ico)(\?|#|$)/i.test(url)) {
      return false;
    }
    
    // STRONG REJECTION PATTERNS - definitely not facility photos
    const strongRejectPatterns = [
      // Logo/Icon indicators
      'logo', 'icon', 'badge', 'button', 'avatar', 'favicon',
      'brand', 'symbol', 'emblem', 'seal', 'crest', 'mark',
      // Technical/UI elements
      'spinner', 'loader', 'placeholder', 'thumbnail', 'sprite',
      // Social media profile pics
      'profile-pic', 'profile_pic', 'profilepic', 'user-avatar',
      // Ads and banners
      'banner', 'advertisement', 'ad-', 'promo',
      // Graphics and illustrations
      'illustration', 'cartoon', 'clipart', 'drawing',
      // Listing-site placeholder/template images shared across thousands of communities
      'no_photo', 'nophoto', 'no-photo', 'divider-half', '/divider',
      'default_community_property', 'templates/homely'
    ];
    
    // Check for strong rejection patterns
    for (const pattern of strongRejectPatterns) {
      if (urlLower.includes(pattern)) {
        return false;
      }
    }
    
    // POSITIVE INDICATORS - likely facility photos
    const positivePatterns = [
      // Building/facility terms
      'facility', 'building', 'exterior', 'interior', 'entrance',
      'lobby', 'reception', 'hallway', 'corridor',
      // Room types
      'room', 'bedroom', 'bathroom', 'dining', 'kitchen',
      'lounge', 'library', 'chapel', 'gym', 'fitness',
      'activity', 'recreation', 'therapy', 'salon',
      // Amenities
      'garden', 'patio', 'courtyard', 'pool', 'grounds',
      'amenity', 'amenities', 'outdoor', 'indoor',
      // Care-related
      'resident', 'senior', 'living', 'care', 'nursing',
      'assisted', 'memory', 'alzheimer', 'dementia',
      // Tours and galleries
      'tour', 'gallery', 'photo', 'image', 'picture',
      'view', 'community', 'home'
    ];
    
    // Check if URL contains positive indicators
    const hasPositiveIndicator = positivePatterns.some(pattern => urlLower.includes(pattern));
    
    // Check if it's from a known good source
    const goodSources = [
      'seniorliving', 'assistedliving', 'nursinghome',
      'caring.com', 'aplaceformom', 'senioradvisor',
      'seniorhousing', 'retirement'
    ];
    const fromGoodSource = goodSources.some(source => urlLower.includes(source));
    
    // MODERATE REJECTION - only reject if no positive indicators
    const moderateRejectPatterns = [
      'headshot', 'portrait', 'staff', 'team', 'employee',
      'manager', 'director', 'executive', 'realtor', 'agent'
    ];
    
    // Check for staff/people photos
    const hasModerateReject = moderateRejectPatterns.some(pattern => urlLower.includes(pattern));
    
    // Decision logic
    if (hasPositiveIndicator || fromGoodSource) {
      // Has positive indicators - likely a good photo
      return true;
    } else if (hasModerateReject) {
      // Has moderate rejection patterns and no positive indicators
      return false;
    } else {
      // Default: accept if it's an image file
      const isImageFile = /\.(jpg|jpeg|png|gif|webp|bmp)(\?|#|$)/i.test(urlLower);
      return isImageFile;
    }
  }
  
  private isStockPhoto(url: string): boolean {
    const stockDomains = [
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'shutterstock.com',
      'gettyimages.com',
      'istockphoto.com',
      'depositphotos.com',
      'stock.adobe.com',
      'freepik.com',
      'stocksnap.io',
      'burst.shopify.com',
      'placeholder.com',
      'picsum.photos',
      'lorem.picsum',
      'via.placeholder.com',
      'dummyimage.com',
      'placehold.it'
    ];
    
    const lowerUrl = url.toLowerCase();
    return stockDomains.some(domain => lowerUrl.includes(domain));
  }
  
  private resolveUrl(url: string, baseUrl: string): string {
    if (!url) return '';
    
    // Already absolute
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Protocol-relative
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    
    // Relative to domain
    try {
      const base = new URL(baseUrl);
      if (url.startsWith('/')) {
        return base.origin + url;
      }
      // Relative to current path
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }
  
  private deduplicatePhotos(photos: ScrapedPhoto[]): ScrapedPhoto[] {
    const seen = new Set<string>();
    const unique: ScrapedPhoto[] = [];
    
    for (const photo of photos) {
      const normalizedUrl = photo.url?.toLowerCase().replace(/[?#].*$/, '');
      if (normalizedUrl && !seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        unique.push(photo);
      }
    }
    
    return unique;
  }
  
  private isIconOrLogo(text: string): boolean {
    // Disabled - user wants to see all images
    return false;
  }
  
  private scorePhotoRelevance(photo: ScrapedPhoto, communityName: string): number {
    let score = 1; // Start with a slightly positive score to be more inclusive
    const nameParts = communityName.toLowerCase().split(/\s+/);
    
    // PENALIZE photos with people in them (but less severely)
    const peoplePatterns = [
      /headshot/i, /portrait/i, /staff-photo/i, /team-member/i,
      /realtor/i, /agent-photo/i, /broker/i, 
      /testimonial/i, /smile/i, /smiling/i
    ];
    
    const urlLower = photo.url.toLowerCase();
    const altLower = (photo.alt || '').toLowerCase();
    const contextLower = (photo.context || '').toLowerCase();
    const combinedText = urlLower + ' ' + altLower + ' ' + contextLower;
    
    // Moderate penalty for people photos
    if (peoplePatterns.some(pattern => pattern.test(combinedText))) {
      score -= 8;
    }
    
    // PENALIZE unrelated domains (but less severely)
    const unrelatedDomains = [
      'chamber', 'realtor.com', 'remax', 'coldwell',
      'keller', 'century21'
    ];
    
    if (unrelatedDomains.some(domain => urlLower.includes(domain))) {
      score -= 10;
    }
    
    // Check URL for community name parts
    nameParts.forEach(part => {
      if (part.length > 3 && urlLower.includes(part)) score += 2;
    });
    
    // Check alt text
    if (photo.alt) {
      nameParts.forEach(part => {
        if (part.length > 3 && altLower.includes(part)) score += 3;
      });
      
      // Boost for specific BUILDING keywords
      if (altLower.includes('building') || 
          altLower.includes('exterior') || 
          altLower.includes('interior') ||
          altLower.includes('room') ||
          altLower.includes('dining') ||
          altLower.includes('common') ||
          altLower.includes('lobby') ||
          altLower.includes('apartment') ||
          altLower.includes('facility') ||
          altLower.includes('entrance')) {
        score += 2;
      }
    }
    
    // Check context
    if (photo.context) {
      const contextLower = photo.context.toLowerCase();
      if (contextLower.includes('gallery') || 
          contextLower.includes('facility') ||
          contextLower.includes('property')) {
        score += 1;
      }
    }
    
    return score;
  }

  /**
   * Comprehensive scrape that extracts both photos AND videos
   */
  async scrapePhotosAndVideos(
    websiteUrl: string,
    communityName: string,
    options?: {
      maxPhotos?: number;
      timeout?: number;
    }
  ): Promise<ScrapeResult> {
    const result: ScrapeResult = { photos: [], videos: [] };
    
    // Normalize URL to HTTPS
    let normalizedUrl = websiteUrl;
    if (normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }
    if (!normalizedUrl.startsWith('https://') && !normalizedUrl.startsWith('http://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // URLs to try (original + HTTPS version if different)
    const urlsToTry = [normalizedUrl];
    if (websiteUrl !== normalizedUrl) {
      urlsToTry.push(websiteUrl);
    }
    
    let response: Response | null = null;
    
    // Retry logic with multiple URL attempts
    for (const url of urlsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`🌐 Full scrape of ${url} (attempt ${attempt})...`);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), options?.timeout || 15000);
          
          response = await fetch(url, {
            signal: controller.signal,
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5'
            }
          });
          
          clearTimeout(timeout);
          
          if (response.ok) break;
          response = null;
        } catch (e) {
          response = null;
        }
      }
      if (response && response.ok) break;
    }
    
    if (!response || !response.ok) {
      return result;
    }
    
    try {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract photos (reuse existing logic)
      result.photos = await this.extractPhotosFromHtml($, websiteUrl, communityName, options?.maxPhotos || 30);
      
      // Extract videos
      result.videos = this.extractVideosFromHtml($, websiteUrl);
      
      console.log(`✅ Full scrape complete: ${result.photos.length} photos, ${result.videos.length} videos`);
      
    } catch (error) {
      console.error(`❌ Error in full scrape:`, error instanceof Error ? error.message : error);
    }
    
    return result;
  }
  
  private extractPhotosFromHtml($: cheerio.CheerioAPI, websiteUrl: string, communityName: string, maxPhotos: number): ScrapedPhoto[] {
    const photos: ScrapedPhoto[] = [];
    
    // Extract all img tags
    $('img').each((index, element) => {
      const $img = $(element);
      const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
      const alt = $img.attr('alt');
      const title = $img.attr('title');
      const width = $img.attr('width');
      const height = $img.attr('height');
      
      if (width && height) {
        const w = parseInt(width);
        const h = parseInt(height);
        if (!isNaN(w) && !isNaN(h) && (w < 100 || h < 100)) return;
      }
      
      if (src && this.isValidPhotoUrl(src) && !this.isStockPhoto(src)) {
        photos.push({
          url: this.resolveUrl(src, websiteUrl),
          alt,
          title,
          context: `Image: ${alt || title || 'facility photo'}`
        });
      }
    });
    
    // Extract background images
    $('[style*="background-image"]').each((index, element) => {
      const $el = $(element);
      const style = $el.attr('style') || '';
      const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
      
      if (urlMatch && urlMatch[1]) {
        const bgUrl = urlMatch[1];
        if (this.isValidPhotoUrl(bgUrl) && !this.isStockPhoto(bgUrl)) {
          photos.push({
            url: this.resolveUrl(bgUrl, websiteUrl),
            context: 'Background image'
          });
        }
      }
    });
    
    // Extract Open Graph image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && this.isValidPhotoUrl(ogImage) && !this.isStockPhoto(ogImage)) {
      photos.push({
        url: this.resolveUrl(ogImage, websiteUrl),
        context: 'Open Graph image'
      });
    }
    
    return this.deduplicatePhotos(photos).slice(0, maxPhotos);
  }
  
  private extractVideosFromHtml($: cheerio.CheerioAPI, websiteUrl: string): ScrapedVideo[] {
    const videos: ScrapedVideo[] = [];
    const seenUrls = new Set<string>();
    
    // Extract YouTube iframes
    $('iframe[src*="youtube"], iframe[data-src*="youtube"]').each((index, element) => {
      const $iframe = $(element);
      const src = $iframe.attr('src') || $iframe.attr('data-src');
      if (src && !seenUrls.has(src)) {
        seenUrls.add(src);
        videos.push({
          url: src,
          platform: 'youtube',
          embedUrl: src,
          title: $iframe.attr('title') || 'YouTube Video'
        });
      }
    });
    
    // Extract Vimeo iframes
    $('iframe[src*="vimeo"], iframe[data-src*="vimeo"]').each((index, element) => {
      const $iframe = $(element);
      const src = $iframe.attr('src') || $iframe.attr('data-src');
      if (src && !seenUrls.has(src)) {
        seenUrls.add(src);
        videos.push({
          url: src,
          platform: 'vimeo',
          embedUrl: src,
          title: $iframe.attr('title') || 'Vimeo Video'
        });
      }
    });
    
    // Extract Wistia videos
    $('iframe[src*="wistia"], div[class*="wistia"], script[src*="wistia"]').each((index, element) => {
      const $el = $(element);
      const src = $el.attr('src') || '';
      const wistiaId = $el.attr('class')?.match(/wistia_embed.*?wistia_async_([a-z0-9]+)/i)?.[1];
      
      if (src && src.includes('wistia') && !seenUrls.has(src)) {
        seenUrls.add(src);
        videos.push({
          url: src,
          platform: 'wistia',
          embedUrl: src,
          title: 'Wistia Video'
        });
      } else if (wistiaId && !seenUrls.has(wistiaId)) {
        seenUrls.add(wistiaId);
        videos.push({
          url: `https://fast.wistia.net/embed/iframe/${wistiaId}`,
          platform: 'wistia',
          embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaId}`,
          title: 'Wistia Video'
        });
      }
    });
    
    // Extract HTML5 video elements
    $('video source, video').each((index, element) => {
      const $el = $(element);
      const src = $el.attr('src');
      if (src && !seenUrls.has(src)) {
        seenUrls.add(src);
        videos.push({
          url: this.resolveUrl(src, websiteUrl),
          platform: 'html5',
          title: 'Video'
        });
      }
    });
    
    // Extract video links (YouTube, Vimeo URLs in href)
    $('a[href*="youtube.com/watch"], a[href*="youtu.be/"], a[href*="vimeo.com/"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      if (href && !seenUrls.has(href)) {
        seenUrls.add(href);
        const platform = href.includes('youtube') || href.includes('youtu.be') ? 'youtube' : 'vimeo';
        videos.push({
          url: href,
          platform,
          title: $link.text().trim() || `${platform} Video`
        });
      }
    });
    
    // Extract Open Graph video
    const ogVideo = $('meta[property="og:video"]').attr('content');
    if (ogVideo && !seenUrls.has(ogVideo)) {
      seenUrls.add(ogVideo);
      videos.push({
        url: ogVideo,
        platform: 'og',
        title: 'Video'
      });
    }
    
    console.log(`🎬 Found ${videos.length} videos from HTML`);
    return videos;
  }
}

// Export singleton instance
export const cheerioPhotoScraper = new CheerioPhotoScraper();