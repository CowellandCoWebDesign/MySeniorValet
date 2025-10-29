import { chromium, Browser, Page } from 'playwright';

interface CrawlResult {
  virtualTourUrl?: string;
  galleryUrls?: string[];
  videoUrls?: string[];
  photoGalleryUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  foundElements: string[];
}

export class CommunityWebsiteCrawler {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Crawl a community website to find virtual tour links
   */
  async crawlForVirtualTour(websiteUrl: string, communityName: string): Promise<CrawlResult> {
    if (!websiteUrl || websiteUrl === '-') {
      return {
        confidence: 'low',
        foundElements: []
      };
    }

    await this.initialize();
    const page = await this.browser!.newPage();
    const result: CrawlResult = {
      confidence: 'low',
      foundElements: []
    };

    try {
      console.log(`🕷️ Crawling ${websiteUrl} for virtual tours...`);
      
      // Navigate to the website with a reasonable timeout
      await page.goto(websiteUrl, { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      });

      // Wait a bit for JavaScript to render
      await page.waitForTimeout(2000);

      // Strategy 1: Look for virtual tour buttons and links
      const tourButtons = await this.findTourButtons(page);
      if (tourButtons.length > 0) {
        result.virtualTourUrl = tourButtons[0];
        result.confidence = 'high';
        result.foundElements.push('Virtual tour button/link');
        console.log(`✅ Found virtual tour button: ${tourButtons[0]}`);
      }

      // Strategy 2: Check for gallery links (often contain tours)
      const galleryLinks = await this.findGalleryLinks(page);
      if (galleryLinks.length > 0) {
        result.galleryUrls = galleryLinks;
        result.foundElements.push(`${galleryLinks.length} gallery links`);
        
        // Visit gallery pages to look for tours
        for (const galleryUrl of galleryLinks.slice(0, 3)) { // Check first 3 galleries
          const tourInGallery = await this.checkGalleryForTour(page, galleryUrl);
          if (tourInGallery) {
            result.virtualTourUrl = tourInGallery;
            result.confidence = 'high';
            result.foundElements.push('Tour found in gallery');
            console.log(`✅ Found tour in gallery: ${tourInGallery}`);
            break;
          }
        }
      }

      // Strategy 3: Look for video sections
      const videoLinks = await this.findVideoLinks(page);
      if (videoLinks.length > 0) {
        result.videoUrls = videoLinks;
        result.foundElements.push(`${videoLinks.length} video links`);
        if (!result.virtualTourUrl && videoLinks[0]) {
          result.virtualTourUrl = videoLinks[0];
          result.confidence = 'medium';
        }
      }

      // Strategy 4: Check navigation menu for tour sections
      const navTourLink = await this.checkNavigationForTours(page);
      if (navTourLink && !result.virtualTourUrl) {
        result.virtualTourUrl = navTourLink;
        result.confidence = 'medium';
        result.foundElements.push('Navigation menu tour link');
      }

      // Strategy 5: Look for Matterport or other tour platform embeds
      const embedUrls = await this.findTourEmbeds(page);
      if (embedUrls.length > 0 && !result.virtualTourUrl) {
        result.virtualTourUrl = embedUrls[0];
        result.confidence = 'high';
        result.foundElements.push('Embedded tour found');
        console.log(`✅ Found embedded tour: ${embedUrls[0]}`);
      }

      // Update confidence based on what was found
      if (result.virtualTourUrl) {
        if (result.virtualTourUrl.includes('matterport') || 
            result.virtualTourUrl.includes('youvisit') ||
            result.virtualTourUrl.includes('360')) {
          result.confidence = 'high';
        }
      }

    } catch (error) {
      console.error(`Error crawling ${websiteUrl}:`, error);
    } finally {
      await page.close();
    }

    return result;
  }

  private async findTourButtons(page: Page): Promise<string[]> {
    const tourUrls: string[] = [];

    try {
      // Look for buttons and links with tour-related text
      const tourSelectors = [
        'a:has-text("virtual tour")',
        'a:has-text("360 tour")',
        'a:has-text("3d tour")',
        'a:has-text("view tour")',
        'a:has-text("take a tour")',
        'a:has-text("online tour")',
        'button:has-text("virtual tour")',
        'button:has-text("360 tour")',
        '[class*="tour"][href]',
        '[id*="tour"][href]',
        'a[href*="matterport"]',
        'a[href*="youvisit"]',
        'a[href*="360"]',
        'a[href*="virtual-tour"]'
      ];

      for (const selector of tourSelectors) {
        try {
          const elements = await page.$$(selector);
          for (const element of elements) {
            const href = await element.getAttribute('href');
            const onclick = await element.getAttribute('onclick');
            
            if (href && href !== '#' && href !== 'javascript:void(0)') {
              const url = this.resolveUrl(href, page.url());
              if (url && !tourUrls.includes(url)) {
                tourUrls.push(url);
              }
            }
            
            // Check onclick for URLs
            if (onclick) {
              const urlMatch = onclick.match(/(?:window\.open|location\.href)\s*[=(]\s*['"]([^'"]+)['"]/);
              if (urlMatch && urlMatch[1]) {
                const url = this.resolveUrl(urlMatch[1], page.url());
                if (url && !tourUrls.includes(url)) {
                  tourUrls.push(url);
                }
              }
            }
          }
        } catch (e) {
          // Selector might not be valid, continue
        }
      }
    } catch (error) {
      console.error('Error finding tour buttons:', error);
    }

    return tourUrls;
  }

  private async findGalleryLinks(page: Page): Promise<string[]> {
    const galleryUrls: string[] = [];

    try {
      const gallerySelectors = [
        'a:has-text("gallery")',
        'a:has-text("photos")',
        'a:has-text("media")',
        'a[href*="gallery"]',
        'a[href*="photos"]',
        'a[href*="media"]',
        '[class*="gallery"] a[href]'
      ];

      for (const selector of gallerySelectors) {
        try {
          const elements = await page.$$(selector);
          for (const element of elements) {
            const href = await element.getAttribute('href');
            if (href && href !== '#') {
              const url = this.resolveUrl(href, page.url());
              if (url && !galleryUrls.includes(url)) {
                galleryUrls.push(url);
              }
            }
          }
        } catch (e) {
          // Continue if selector fails
        }
      }
    } catch (error) {
      console.error('Error finding gallery links:', error);
    }

    return galleryUrls;
  }

  private async findVideoLinks(page: Page): Promise<string[]> {
    const videoUrls: string[] = [];

    try {
      const videoSelectors = [
        'a:has-text("video")',
        'a:has-text("watch")',
        'iframe[src*="youtube"]',
        'iframe[src*="vimeo"]',
        'video source',
        '[class*="video"] a[href]'
      ];

      for (const selector of videoSelectors) {
        try {
          const elements = await page.$$(selector);
          for (const element of elements) {
            const src = await element.getAttribute('src');
            const href = await element.getAttribute('href');
            
            const url = src || href;
            if (url && !videoUrls.includes(url)) {
              videoUrls.push(this.resolveUrl(url, page.url()));
            }
          }
        } catch (e) {
          // Continue if selector fails
        }
      }
    } catch (error) {
      console.error('Error finding video links:', error);
    }

    return videoUrls.filter(url => url !== null) as string[];
  }

  private async checkGalleryForTour(mainPage: Page, galleryUrl: string): Promise<string | null> {
    // Create a new page for gallery checking to avoid navigating away from the main page
    const galleryPage = await this.browser!.newPage();
    
    try {
      // Navigate to gallery page
      await galleryPage.goto(galleryUrl, { 
        waitUntil: 'networkidle', 
        timeout: 20000 
      });
      
      await galleryPage.waitForTimeout(1500);

      // Look for tour links within the gallery
      const tourInGallery = await this.findTourButtons(galleryPage);
      if (tourInGallery.length > 0) {
        return tourInGallery[0];
      }

      // Check for tour embeds in gallery
      const embeds = await this.findTourEmbeds(galleryPage);
      if (embeds.length > 0) {
        return embeds[0];
      }

    } catch (error) {
      console.error(`Error checking gallery ${galleryUrl}:`, error);
    } finally {
      // Always close the gallery page to avoid memory leaks
      await galleryPage.close();
    }

    return null;
  }

  private async checkNavigationForTours(page: Page): Promise<string | null> {
    try {
      // Check main navigation, dropdown menus, etc.
      const navSelectors = [
        'nav a:has-text("tour")',
        'header a:has-text("tour")',
        '.menu a:has-text("tour")',
        '[class*="nav"] a:has-text("tour")',
        'a:has-text("amenities")', // Tours often under amenities
        'a:has-text("floor plans")' // Sometimes tours are with floor plans
      ];

      for (const selector of navSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const href = await element.getAttribute('href');
            if (href && href !== '#') {
              return this.resolveUrl(href, page.url());
            }
          }
        } catch (e) {
          // Continue if selector fails
        }
      }
    } catch (error) {
      console.error('Error checking navigation:', error);
    }

    return null;
  }

  private async findTourEmbeds(page: Page): Promise<string[]> {
    const embedUrls: string[] = [];

    try {
      // Look for iframe embeds from tour platforms
      const iframes = await page.$$('iframe');
      
      for (const iframe of iframes) {
        const src = await iframe.getAttribute('src');
        if (src) {
          // Check if it's a tour platform
          const tourPlatforms = ['matterport', 'youvisit', 'kuula', 'roundme', '360'];
          if (tourPlatforms.some(platform => src.toLowerCase().includes(platform))) {
            embedUrls.push(src);
          }
        }
      }

      // Also look for data attributes that might contain tour IDs
      const tourElements = await page.$$('[data-matterport-id], [data-tour-id], [data-virtual-tour]');
      for (const element of tourElements) {
        const tourId = await element.getAttribute('data-matterport-id') || 
                      await element.getAttribute('data-tour-id') ||
                      await element.getAttribute('data-virtual-tour');
        if (tourId) {
          // Construct Matterport URL if we have an ID
          if (await element.getAttribute('data-matterport-id')) {
            embedUrls.push(`https://my.matterport.com/show/?m=${tourId}`);
          }
        }
      }

    } catch (error) {
      console.error('Error finding tour embeds:', error);
    }

    return embedUrls;
  }

  private resolveUrl(url: string, baseUrl: string): string | null {
    try {
      // Handle absolute URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // Handle protocol-relative URLs
      if (url.startsWith('//')) {
        return 'https:' + url;
      }
      
      // Handle relative URLs
      const base = new URL(baseUrl);
      if (url.startsWith('/')) {
        return `${base.protocol}//${base.host}${url}`;
      } else {
        // Relative to current path
        const pathParts = base.pathname.split('/');
        pathParts.pop(); // Remove current file
        pathParts.push(url);
        return `${base.protocol}//${base.host}${pathParts.join('/')}`;
      }
    } catch (error) {
      console.error('Error resolving URL:', url, error);
      return null;
    }
  }
}

// Singleton instance
export const communityWebsiteCrawler = new CommunityWebsiteCrawler();