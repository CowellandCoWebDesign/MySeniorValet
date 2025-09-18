import { chromium, Browser, Page } from 'playwright';

/**
 * 🔥 SUPER-POWERED Playwright Photo Scraper
 * Visits actual websites and extracts authentic photos
 */

interface ScrapedPhoto {
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  context: string;
  isGallery?: boolean;
  isBackground?: boolean;
}

export class PlaywrightPhotoScraper {
  private browser: Browser | null = null;
  
  /**
   * Initialize browser instance
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      console.log('🚀 Launching Playwright browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }
  
  /**
   * Close browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * 🔥 SUPER-POWERED: Scrape photos from a website
   */
  async scrapePhotosFromWebsite(
    websiteUrl: string, 
    communityName: string,
    options?: {
      maxPhotos?: number;
      timeout?: number;
      waitForSelector?: string;
    }
  ): Promise<ScrapedPhoto[]> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    const photos: ScrapedPhoto[] = [];
    
    try {
      console.log(`🌐 Visiting ${websiteUrl} with Playwright...`);
      
      // Set viewport and user agent to appear as a real browser
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      // Navigate to the website
      await page.goto(websiteUrl, { 
        waitUntil: 'networkidle',
        timeout: options?.timeout || 30000 
      });
      
      // If specific selector provided, wait for it
      if (options?.waitForSelector) {
        try {
          await page.waitForSelector(options.waitForSelector, { timeout: 5000 });
        } catch (e) {
          console.log(`⚠️ Selector not found: ${options.waitForSelector}, continuing anyway...`);
        }
      }
      
      // Wait for images to load
      await page.waitForTimeout(2000);
      
      console.log('📸 Extracting all images from the page...');
      
      // Extract all <img> tags
      const imgPhotos = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          url: img.src,
          alt: img.alt,
          title: img.title,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          context: 'img-tag',
          dataAttributes: {
            gallery: img.dataset.gallery,
            slide: img.dataset.slide,
            caption: img.dataset.caption
          }
        }));
      });
      
      // Add img photos
      for (const photo of imgPhotos) {
        if (this.isValidPhotoUrl(photo.url) && !this.isStockPhoto(photo.url)) {
          photos.push({
            ...photo,
            context: `IMG: ${photo.alt || 'facility photo'}`,
            isGallery: !!photo.dataAttributes?.gallery
          });
        }
      }
      
      console.log(`  Found ${photos.length} images from <img> tags`);
      
      // Extract background images from divs
      const bgPhotos = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const bgImages: any[] = [];
        
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const bgImage = style.backgroundImage;
          
          if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
            const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
              const classes = el.className || '';
              const id = el.id || '';
              bgImages.push({
                url: urlMatch[1],
                context: `Background on ${el.tagName} ${classes} ${id}`.trim(),
                isBackground: true
              });
            }
          }
        });
        
        return bgImages;
      });
      
      // Add background photos
      for (const photo of bgPhotos) {
        if (this.isValidPhotoUrl(photo.url) && !this.isStockPhoto(photo.url)) {
          photos.push(photo);
        }
      }
      
      console.log(`  Found ${bgPhotos.length} background images`);
      
      // Look for photo galleries and sliders
      const gallerySelectors = [
        '.gallery', '.photo-gallery', '.image-gallery',
        '.slider', '.carousel', '.swiper',
        '[data-gallery]', '[class*="gallery"]', '[id*="gallery"]',
        '.photos', '.images', '.media'
      ];
      
      for (const selector of gallerySelectors) {
        const galleryExists = await page.$(selector);
        if (galleryExists) {
          console.log(`  Found gallery with selector: ${selector}`);
          
          // Try to extract gallery images
          const galleryPhotos = await page.evaluate((sel) => {
            const gallery = document.querySelector(sel);
            if (!gallery) return [];
            
            const imgs = gallery.querySelectorAll('img');
            const links = gallery.querySelectorAll('a[href*=".jpg"], a[href*=".jpeg"], a[href*=".png"]');
            
            const photos: any[] = [];
            
            imgs.forEach(img => {
              photos.push({
                url: img.src,
                alt: img.alt,
                context: 'gallery-image'
              });
            });
            
            links.forEach(link => {
              photos.push({
                url: (link as HTMLAnchorElement).href,
                context: 'gallery-link'
              });
            });
            
            return photos;
          }, selector);
          
          for (const photo of galleryPhotos) {
            if (this.isValidPhotoUrl(photo.url) && !this.isStockPhoto(photo.url)) {
              photos.push({
                ...photo,
                isGallery: true,
                context: `Gallery: ${photo.context}`
              });
            }
          }
        }
      }
      
      // Look for virtual tour links
      const tourLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links
          .filter(link => {
            const text = link.textContent?.toLowerCase() || '';
            const href = link.href?.toLowerCase() || '';
            return text.includes('tour') || text.includes('gallery') || 
                   text.includes('photos') || href.includes('gallery') ||
                   href.includes('tour') || href.includes('photos');
          })
          .map(link => ({
            text: link.textContent,
            href: link.href
          }));
      });
      
      console.log(`  Found ${tourLinks.length} potential photo/tour links`);
      
      // Navigate to photo gallery pages if found
      for (const link of tourLinks.slice(0, 2)) { // Limit to 2 gallery pages
        const href = link.href as string;
        if (href && !href.includes('#') && !href.includes('javascript:')) {
          try {
            console.log(`  📷 Visiting gallery page: ${link.text}`);
            await page.goto(href, { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(1000);
            
            // Extract photos from gallery page
            const galleryPagePhotos = await page.evaluate(() => {
              const images = Array.from(document.querySelectorAll('img'));
              return images.map(img => ({
                url: img.src,
                alt: img.alt,
                context: 'gallery-page'
              }));
            });
            
            for (const photo of galleryPagePhotos) {
              if (this.isValidPhotoUrl(photo.url) && !this.isStockPhoto(photo.url) && 
                  !photos.some(p => p.url === photo.url)) {
                photos.push({
                  ...photo,
                  isGallery: true,
                  context: `Gallery Page: ${link.text}`
                });
              }
            }
          } catch (error) {
            console.log(`  ⚠️ Could not load gallery page: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      // Extract Open Graph and meta images
      await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });
      const metaPhotos = await page.evaluate(() => {
        const metaImages: any[] = [];
        
        // Open Graph image
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          metaImages.push({
            url: ogImage.getAttribute('content'),
            context: 'og:image'
          });
        }
        
        // Twitter card image
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) {
          metaImages.push({
            url: twitterImage.getAttribute('content'),
            context: 'twitter:image'
          });
        }
        
        return metaImages;
      });
      
      for (const photo of metaPhotos) {
        if (photo.url && this.isValidPhotoUrl(photo.url) && !this.isStockPhoto(photo.url)) {
          photos.push(photo);
        }
      }
      
      // Remove duplicates and clean URLs
      const uniquePhotos = this.deduplicatePhotos(photos);
      const cleanedPhotos = uniquePhotos.map(photo => ({
        ...photo,
        url: this.resolveUrl(photo.url, websiteUrl)
      }));
      
      console.log(`✅ Scraped ${cleanedPhotos.length} unique authentic photos from ${websiteUrl}`);
      
      // Sort by relevance (gallery photos first, then regular images)
      cleanedPhotos.sort((a, b) => {
        if (a.isGallery && !b.isGallery) return -1;
        if (!a.isGallery && b.isGallery) return 1;
        if (a.width && b.width) return b.width - a.width; // Larger images first
        return 0;
      });
      
      // Apply maxPhotos limit if specified
      const limit = options?.maxPhotos || 30;
      return cleanedPhotos.slice(0, limit);
      
    } catch (error) {
      console.error(`❌ Error scraping ${websiteUrl}:`, error instanceof Error ? error.message : error);
      return [];
    } finally {
      await page.close();
    }
  }
  
  /**
   * Check if URL is a valid photo URL
   */
  private isValidPhotoUrl(url: string): boolean {
    if (!url || url.length < 10) return false;
    
    // Check for image extensions or image-like patterns
    const imagePatterns = [
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)/i,
      /\/image\//i,
      /\/photo\//i,
      /\/media\//i,
      /\/upload\//i,
      /\/gallery\//i,
      /cloudinary\.com/i,
      /amazonaws\.com/i,
      /googleusercontent\.com/i
    ];
    
    return imagePatterns.some(pattern => pattern.test(url));
  }
  
  /**
   * Check if photo is from a stock photo service
   */
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
  
  /**
   * Resolve relative URLs to absolute
   */
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
  
  /**
   * Remove duplicate photos based on URL
   */
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
  
  /**
   * Take a screenshot of the website
   */
  async takeScreenshot(websiteUrl: string): Promise<Buffer | null> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(websiteUrl, { waitUntil: 'networkidle' });
      const screenshot = await page.screenshot({ 
        fullPage: false,
        type: 'jpeg',
        quality: 80
      });
      return screenshot;
    } catch (error) {
      console.error('Screenshot error:', error);
      return null;
    } finally {
      await page.close();
    }
  }
}

// Export singleton instance
export const playwrightPhotoScraper = new PlaywrightPhotoScraper();