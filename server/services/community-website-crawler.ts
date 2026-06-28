import { chromium, Browser, Page } from 'playwright';

interface CrawlResult {
  virtualTourUrl?: string;
  galleryUrls?: string[];
  videoUrls?: string[];
  photoGalleryUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  foundElements: string[];
}

// Enhanced result for deep website crawl
export interface DeepCrawlResult {
  // Virtual tours (3D, Matterport, etc.)
  virtualTours: {
    url: string;
    platform?: string;
    embedCode?: string;
  }[];
  
  // Photo galleries from the website
  photoGalleries: {
    url: string;
    title?: string;
    imageCount?: number;
  }[];
  
  // Individual photos found
  photos: {
    url: string;
    alt?: string;
    context?: string;
    isHeroImage?: boolean;
  }[];
  
  // Floor plans
  floorPlans: {
    url: string;
    unitType?: string;
    squareFootage?: string;
    bedrooms?: string;
    price?: string;
    imageUrl?: string;
  }[];
  
  // Videos (YouTube, Vimeo, etc.)
  videos: {
    url: string;
    platform?: string;
    embedUrl?: string;
    title?: string;
  }[];
  
  // Pricing information extracted
  pricing: {
    independentLiving?: string;
    assistedLiving?: string;
    memoryCare?: string;
    skilledNursing?: string;
    respiteCare?: string;
    generalRange?: string;
    entryFee?: string;
    additionalFees?: string[];
  };
  
  // Contact info found
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  
  // Amenities extracted
  amenities: string[];
  
  // Source pages explored
  pagesExplored: string[];
  
  // Confidence and metadata
  confidence: 'high' | 'medium' | 'low';
  crawlDate: Date;
  errors: string[];
}

export class CommunityWebsiteCrawler {
  private browser: Browser | null = null;
  private initializationFailed: boolean = false;

  async initialize() {
    if (this.initializationFailed) {
      throw new Error('Playwright initialization previously failed - use Cheerio fallback');
    }
    
    if (!this.browser) {
      try {
        this.browser = await chromium.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--mute-audio',
            '--hide-scrollbars'
          ]
        });
        console.log('✅ Playwright browser initialized successfully');
      } catch (error) {
        this.initializationFailed = true;
        console.log('⚠️ Playwright browser initialization failed:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
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

  /**
   * Deep crawl a community website to extract comprehensive information
   * This is the PRIMARY source of truth for community data
   */
  async deepCrawlCommunityWebsite(
    websiteUrl: string,
    communityName: string,
    options?: {
      maxPagesToExplore?: number;
      timeout?: number;
      includeFloorPlans?: boolean;
      includePricing?: boolean;
    }
  ): Promise<DeepCrawlResult> {
    const result: DeepCrawlResult = {
      virtualTours: [],
      photoGalleries: [],
      photos: [],
      floorPlans: [],
      videos: [],
      pricing: {},
      contact: {},
      amenities: [],
      pagesExplored: [],
      confidence: 'low',
      crawlDate: new Date(),
      errors: []
    };

    if (!websiteUrl || websiteUrl === '-') {
      return result;
    }

    await this.initialize();
    const page = await this.browser!.newPage();
    const maxPages = options?.maxPagesToExplore || 10;
    const exploredUrls = new Set<string>();
    const urlsToExplore: string[] = [websiteUrl];

    try {
      console.log(`🕷️ Deep crawling ${websiteUrl} for ${communityName}...`);
      
      // First, crawl the main page
      await page.goto(websiteUrl, { 
        waitUntil: 'networkidle', 
        timeout: options?.timeout || 30000 
      });
      await page.waitForTimeout(2000);
      
      result.pagesExplored.push(websiteUrl);
      exploredUrls.add(websiteUrl);

      // Extract main page data
      await this.extractPageData(page, result, true);
      
      // Find internal links to key pages
      const keyPageLinks = await this.findKeyPages(page, websiteUrl);
      
      // Add key pages to exploration queue
      for (const link of keyPageLinks) {
        if (!exploredUrls.has(link) && urlsToExplore.length < maxPages) {
          urlsToExplore.push(link);
        }
      }

      // Explore additional pages
      for (let i = 1; i < Math.min(urlsToExplore.length, maxPages); i++) {
        const url = urlsToExplore[i];
        if (exploredUrls.has(url)) continue;
        
        try {
          console.log(`  📄 Exploring: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
          await page.waitForTimeout(1000);
          
          result.pagesExplored.push(url);
          exploredUrls.add(url);
          
          await this.extractPageData(page, result, false);
          
          // Find more links from this page
          const moreLinks = await this.findKeyPages(page, websiteUrl);
          for (const link of moreLinks) {
            if (!exploredUrls.has(link) && urlsToExplore.length < maxPages * 2) {
              urlsToExplore.push(link);
            }
          }
        } catch (error) {
          result.errors.push(`Failed to crawl ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Determine confidence based on what was found
      const hasVirtualTour = result.virtualTours.length > 0;
      const hasPhotos = result.photos.length >= 5;
      const hasFloorPlans = result.floorPlans.length > 0;
      const hasPricing = Object.keys(result.pricing).length > 0;
      
      if (hasVirtualTour && hasPhotos && (hasFloorPlans || hasPricing)) {
        result.confidence = 'high';
      } else if (hasPhotos || hasVirtualTour) {
        result.confidence = 'medium';
      }

      console.log(`✅ Deep crawl complete for ${communityName}:`);
      console.log(`   - Virtual Tours: ${result.virtualTours.length}`);
      console.log(`   - Photos: ${result.photos.length}`);
      console.log(`   - Floor Plans: ${result.floorPlans.length}`);
      console.log(`   - Videos: ${result.videos.length}`);
      console.log(`   - Pages Explored: ${result.pagesExplored.length}`);
      console.log(`   - Confidence: ${result.confidence}`);

    } catch (error) {
      console.error(`Error deep crawling ${websiteUrl}:`, error);
      result.errors.push(`Main crawl error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }

    return result;
  }

  /**
   * Extract all relevant data from a single page
   */
  private async extractPageData(page: Page, result: DeepCrawlResult, isMainPage: boolean): Promise<void> {
    try {
      // 1. Find virtual tours/3D tours
      const tours = await this.extractVirtualTours(page);
      for (const tour of tours) {
        if (!result.virtualTours.some(t => t.url === tour.url)) {
          result.virtualTours.push(tour);
        }
      }

      // 2. Find photos (prioritize hero images on main page)
      const photos = await this.extractPhotos(page, isMainPage);
      for (const photo of photos) {
        if (!result.photos.some(p => p.url === photo.url)) {
          result.photos.push(photo);
        }
      }

      // 3. Find photo galleries
      const galleries = await this.extractPhotoGalleries(page);
      for (const gallery of galleries) {
        if (!result.photoGalleries.some(g => g.url === gallery.url)) {
          result.photoGalleries.push(gallery);
        }
      }

      // 4. Find floor plans
      const floorPlans = await this.extractFloorPlans(page);
      for (const plan of floorPlans) {
        if (!result.floorPlans.some(f => f.url === plan.url)) {
          result.floorPlans.push(plan);
        }
      }

      // 5. Find videos
      const videos = await this.extractVideos(page);
      for (const video of videos) {
        if (!result.videos.some(v => v.url === video.url)) {
          result.videos.push(video);
        }
      }

      // 6. Extract pricing (only on main page or pricing pages)
      const url = page.url().toLowerCase();
      if (isMainPage || url.includes('pricing') || url.includes('rates') || url.includes('cost')) {
        const pricing = await this.extractPricing(page);
        result.pricing = { ...result.pricing, ...pricing };
      }

      // 7. Extract contact info (mainly on main page)
      if (isMainPage) {
        const contact = await this.extractContactInfo(page);
        result.contact = { ...result.contact, ...contact };
      }

      // 8. Extract amenities
      const amenities = await this.extractAmenities(page);
      for (const amenity of amenities) {
        if (!result.amenities.includes(amenity)) {
          result.amenities.push(amenity);
        }
      }

    } catch (error) {
      console.error('Error extracting page data:', error);
    }
  }

  /**
   * Find links to key pages (gallery, floor plans, pricing, tours, amenities)
   */
  private async findKeyPages(page: Page, baseUrl: string): Promise<string[]> {
    const keyUrls: string[] = [];
    
    const keySelectors = [
      // Virtual tours
      'a[href*="tour"]', 'a[href*="virtual"]', 'a[href*="3d"]', 'a[href*="360"]',
      'a:has-text("tour")', 'a:has-text("virtual")', 'a:has-text("3D")',
      
      // Galleries
      'a[href*="gallery"]', 'a[href*="photos"]', 'a[href*="images"]',
      'a:has-text("gallery")', 'a:has-text("photos")', 'a:has-text("images")',
      
      // Floor plans
      'a[href*="floor"]', 'a[href*="plan"]', 'a[href*="floorplan"]',
      'a:has-text("floor plan")', 'a:has-text("floorplan")', 'a:has-text("layouts")',
      
      // Pricing
      'a[href*="pricing"]', 'a[href*="rates"]', 'a[href*="cost"]', 'a[href*="fee"]',
      'a:has-text("pricing")', 'a:has-text("rates")', 'a:has-text("costs")',
      
      // Amenities
      'a[href*="amenities"]', 'a[href*="services"]', 'a[href*="features"]',
      'a:has-text("amenities")', 'a:has-text("services")', 'a:has-text("features")',
      
      // Living options
      'a[href*="living"]', 'a[href*="apartments"]', 'a[href*="rooms"]',
      'a:has-text("independent living")', 'a:has-text("assisted living")', 'a:has-text("memory care")',
      
      // About/Community
      'a[href*="about"]', 'a[href*="community"]',
      'a:has-text("about")', 'a:has-text("our community")'
    ];

    try {
      const baseUrlParsed = new URL(baseUrl);
      
      for (const selector of keySelectors) {
        try {
          const elements = await page.$$(selector);
          for (const element of elements) {
            const href = await element.getAttribute('href');
            if (href && href !== '#' && href !== 'javascript:void(0)') {
              const fullUrl = this.resolveUrl(href, page.url());
              if (fullUrl) {
                // Only include internal links
                try {
                  const linkUrl = new URL(fullUrl);
                  if (linkUrl.host === baseUrlParsed.host && !keyUrls.includes(fullUrl)) {
                    keyUrls.push(fullUrl);
                  }
                } catch (e) {
                  // Invalid URL, skip
                }
              }
            }
          }
        } catch (e) {
          // Selector failed, continue
        }
      }
    } catch (error) {
      console.error('Error finding key pages:', error);
    }

    // Limit to most relevant pages
    return keyUrls.slice(0, 20);
  }

  /**
   * Extract virtual tour URLs and embeds
   */
  private async extractVirtualTours(page: Page): Promise<{ url: string; platform?: string; embedCode?: string }[]> {
    const tours: { url: string; platform?: string; embedCode?: string }[] = [];
    
    try {
      // Find tour buttons/links
      const tourButtons = await this.findTourButtons(page);
      for (const url of tourButtons) {
        const platform = this.detectTourPlatform(url);
        tours.push({ url, platform });
      }

      // Find tour embeds (iframes)
      const embeds = await this.findTourEmbeds(page);
      for (const url of embeds) {
        const platform = this.detectTourPlatform(url);
        if (!tours.some(t => t.url === url)) {
          tours.push({ url, platform, embedCode: `<iframe src="${url}" allowfullscreen></iframe>` });
        }
      }

      // Look for Matterport, YouVisit, etc. in scripts
      const scripts = await page.$$eval('script', scripts => 
        scripts.map(s => s.innerHTML || '').filter(s => 
          s.includes('matterport') || s.includes('youvisit') || s.includes('kuula') || s.includes('360')
        )
      );
      
      for (const script of scripts) {
        const matterportMatch = script.match(/matterport\.com\/show\/\?m=([\w-]+)/);
        if (matterportMatch) {
          const url = `https://my.matterport.com/show/?m=${matterportMatch[1]}`;
          if (!tours.some(t => t.url === url)) {
            tours.push({ url, platform: 'Matterport' });
          }
        }
      }

    } catch (error) {
      console.error('Error extracting virtual tours:', error);
    }

    return tours;
  }

  /**
   * Extract photos from the page
   */
  private async extractPhotos(page: Page, isMainPage: boolean): Promise<{ url: string; alt?: string; context?: string; isHeroImage?: boolean }[]> {
    const photos: { url: string; alt?: string; context?: string; isHeroImage?: boolean }[] = [];
    
    try {
      // Find hero images first (usually large images at the top)
      if (isMainPage) {
        const heroSelectors = [
          '.hero img', '[class*="hero"] img', '[class*="banner"] img',
          'header img', '.slider img', '[class*="slider"] img',
          '.carousel img', '[class*="carousel"] img'
        ];
        
        for (const selector of heroSelectors) {
          try {
            const elements = await page.$$(selector);
            for (const element of elements) {
              const src = await element.getAttribute('src') || await element.getAttribute('data-src');
              const alt = await element.getAttribute('alt');
              if (src && this.isValidImageUrl(src)) {
                photos.push({
                  url: this.resolveUrl(src, page.url()) || src,
                  alt,
                  context: 'Hero image',
                  isHeroImage: true
                });
              }
            }
          } catch (e) {
            // Continue
          }
        }
      }

      // Find all significant images
      const allImages = await page.$$('img');
      for (const img of allImages) {
        try {
          const src = await img.getAttribute('src') || await img.getAttribute('data-src') || await img.getAttribute('data-lazy-src');
          const alt = await img.getAttribute('alt');
          const width = await img.getAttribute('width');
          const height = await img.getAttribute('height');
          
          if (src && this.isValidImageUrl(src)) {
            // Skip small images (icons, logos)
            if (width && height) {
              const w = parseInt(width);
              const h = parseInt(height);
              if (!isNaN(w) && !isNaN(h) && (w < 150 || h < 150)) continue;
            }
            
            const fullUrl = this.resolveUrl(src, page.url()) || src;
            if (!photos.some(p => p.url === fullUrl)) {
              photos.push({
                url: fullUrl,
                alt,
                context: this.getImageContext(alt || '', fullUrl)
              });
            }
          }
        } catch (e) {
          // Continue
        }
      }

      // Find background images
      const elementsWithBg = await page.$$('[style*="background-image"]');
      for (const element of elementsWithBg) {
        try {
          const style = await element.getAttribute('style');
          if (style) {
            const match = style.match(/url\(['"]?(.*?)['"]?\)/);
            if (match && match[1] && this.isValidImageUrl(match[1])) {
              const fullUrl = this.resolveUrl(match[1], page.url()) || match[1];
              if (!photos.some(p => p.url === fullUrl)) {
                photos.push({ url: fullUrl, context: 'Background image' });
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }

    } catch (error) {
      console.error('Error extracting photos:', error);
    }

    return photos;
  }

  /**
   * Extract photo gallery page URLs
   */
  private async extractPhotoGalleries(page: Page): Promise<{ url: string; title?: string; imageCount?: number }[]> {
    const galleries: { url: string; title?: string; imageCount?: number }[] = [];
    
    try {
      const galleryLinks = await this.findGalleryLinks(page);
      for (const url of galleryLinks) {
        galleries.push({ url });
      }

      // Also look for inline galleries
      const galleryContainers = await page.$$('[class*="gallery"], [class*="lightbox"], [class*="photo-grid"]');
      for (const container of galleryContainers) {
        const images = await container.$$('img');
        if (images.length > 3) {
          galleries.push({
            url: page.url() + '#gallery',
            title: 'Inline Gallery',
            imageCount: images.length
          });
        }
      }

    } catch (error) {
      console.error('Error extracting galleries:', error);
    }

    return galleries;
  }

  /**
   * Extract floor plan information
   */
  private async extractFloorPlans(page: Page): Promise<{ url: string; unitType?: string; squareFootage?: string; bedrooms?: string; price?: string; imageUrl?: string }[]> {
    const floorPlans: { url: string; unitType?: string; squareFootage?: string; bedrooms?: string; price?: string; imageUrl?: string }[] = [];
    
    try {
      // Look for floor plan containers
      const floorPlanSelectors = [
        '[class*="floor-plan"]', '[class*="floorplan"]', '[class*="unit-type"]',
        '[class*="apartment"]', '[class*="layout"]', '.floor-plans', '#floor-plans'
      ];

      for (const selector of floorPlanSelectors) {
        try {
          const containers = await page.$$(selector);
          for (const container of containers) {
            const text = await container.textContent();
            const img = await container.$('img');
            const imgSrc = img ? await img.getAttribute('src') : undefined;
            
            if (text) {
              // Extract unit type
              const unitMatch = text.match(/(?:studio|one|two|three|1|2|3)\s*(?:bed(?:room)?|br)/i);
              // Extract square footage
              const sqftMatch = text.match(/(\d{3,4})\s*(?:sq\.?\s*ft|square\s*feet)/i);
              // Extract price
              const priceMatch = text.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/);
              
              if (unitMatch || sqftMatch) {
                floorPlans.push({
                  url: page.url(),
                  unitType: unitMatch ? unitMatch[0] : undefined,
                  squareFootage: sqftMatch ? sqftMatch[1] : undefined,
                  price: priceMatch ? priceMatch[0] : undefined,
                  imageUrl: imgSrc ? this.resolveUrl(imgSrc, page.url()) || imgSrc : undefined
                });
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }

      // Look for floor plan images
      const floorPlanImages = await page.$$('img[src*="floor"], img[alt*="floor"], img[src*="plan"], img[alt*="plan"]');
      for (const img of floorPlanImages) {
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        if (src && !floorPlans.some(f => f.imageUrl === src)) {
          floorPlans.push({
            url: page.url(),
            unitType: alt || undefined,
            imageUrl: this.resolveUrl(src, page.url()) || src
          });
        }
      }

    } catch (error) {
      console.error('Error extracting floor plans:', error);
    }

    return floorPlans;
  }

  /**
   * Extract video URLs
   */
  private async extractVideos(page: Page): Promise<{ url: string; platform?: string; embedUrl?: string; title?: string }[]> {
    const videos: { url: string; platform?: string; embedUrl?: string; title?: string }[] = [];
    
    try {
      // Find YouTube iframes
      const youtubeIframes = await page.$$('iframe[src*="youtube"]');
      for (const iframe of youtubeIframes) {
        const src = await iframe.getAttribute('src');
        if (src) {
          videos.push({ url: src, platform: 'YouTube', embedUrl: src });
        }
      }

      // Find Vimeo iframes
      const vimeoIframes = await page.$$('iframe[src*="vimeo"]');
      for (const iframe of vimeoIframes) {
        const src = await iframe.getAttribute('src');
        if (src) {
          videos.push({ url: src, platform: 'Vimeo', embedUrl: src });
        }
      }

      // Find video elements
      const videoElements = await page.$$('video source');
      for (const source of videoElements) {
        const src = await source.getAttribute('src');
        if (src) {
          videos.push({ url: this.resolveUrl(src, page.url()) || src, platform: 'HTML5' });
        }
      }

      // Find video links
      const videoLinks = await page.$$('a[href*="youtube.com/watch"], a[href*="youtu.be"], a[href*="vimeo.com"]');
      for (const link of videoLinks) {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        if (href) {
          const platform = href.includes('youtube') || href.includes('youtu.be') ? 'YouTube' : 'Vimeo';
          videos.push({ url: href, platform, title: text?.trim() });
        }
      }

    } catch (error) {
      console.error('Error extracting videos:', error);
    }

    return videos;
  }

  /**
   * Extract pricing information from the page
   */
  private async extractPricing(page: Page): Promise<DeepCrawlResult['pricing']> {
    const pricing: DeepCrawlResult['pricing'] = {};
    
    try {
      const pageText = await page.textContent('body') || '';
      
      // Look for pricing patterns with type-safe key mapping
      const pricingPatterns: Array<{ key: keyof DeepCrawlResult['pricing']; regex: RegExp }> = [
        { key: 'independentLiving', regex: /independent\s*living[^$]*?\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/gi },
        { key: 'assistedLiving', regex: /assisted\s*living[^$]*?\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/gi },
        { key: 'memoryCare', regex: /memory\s*care[^$]*?\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/gi },
        { key: 'skilledNursing', regex: /skilled\s*nursing[^$]*?\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/gi },
        { key: 'respiteCare', regex: /respite[^$]*?\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/gi },
        { key: 'entryFee', regex: /(?:entry|community)\s*fee[^$]*?\$[\d,]+/gi },
        { key: 'generalRange', regex: /(?:starting|from|rates?)\s+(?:at\s+)?\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/gi }
      ];

      for (const { key, regex } of pricingPatterns) {
        const match = pageText.match(regex);
        if (match) {
          const priceMatch = match[0].match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/);
          if (priceMatch && key !== 'additionalFees') {
            pricing[key] = priceMatch[0];
          }
        }
      }

    } catch (error) {
      console.error('Error extracting pricing:', error);
    }

    return pricing;
  }

  /**
   * Extract contact information
   */
  private async extractContactInfo(page: Page): Promise<DeepCrawlResult['contact']> {
    const contact: DeepCrawlResult['contact'] = {};
    
    try {
      const pageText = await page.textContent('body') || '';
      
      // Phone
      const phoneMatch = pageText.match(/(?:\+1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        contact.phone = phoneMatch[0];
      }

      // Email
      const emailMatch = pageText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
      if (emailMatch) {
        contact.email = emailMatch[0];
      }

      // Address from structured data
      const addressElement = await page.$('[itemtype*="PostalAddress"], address, .address, [class*="address"]');
      if (addressElement) {
        const address = await addressElement.textContent();
        if (address) {
          contact.address = address.trim().replace(/\s+/g, ' ');
        }
      }

    } catch (error) {
      console.error('Error extracting contact info:', error);
    }

    return contact;
  }

  /**
   * Extract amenities
   */
  private async extractAmenities(page: Page): Promise<string[]> {
    const amenities: string[] = [];
    
    try {
      // Look for amenity lists
      const amenitySelectors = [
        '[class*="amenity"] li', '[class*="amenities"] li',
        '[class*="feature"] li', '[class*="features"] li',
        '.amenity-list li', '#amenities li'
      ];

      for (const selector of amenitySelectors) {
        try {
          const items = await page.$$(selector);
          for (const item of items) {
            const text = await item.textContent();
            if (text && text.trim().length > 0 && text.trim().length < 100) {
              const cleaned = text.trim().replace(/\s+/g, ' ');
              if (!amenities.includes(cleaned)) {
                amenities.push(cleaned);
              }
            }
          }
        } catch (e) {
          // Continue
        }
      }

    } catch (error) {
      console.error('Error extracting amenities:', error);
    }

    return amenities;
  }

  // Helper methods
  private detectTourPlatform(url: string): string | undefined {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('matterport')) return 'Matterport';
    if (urlLower.includes('youvisit')) return 'YouVisit';
    if (urlLower.includes('kuula')) return 'Kuula';
    if (urlLower.includes('360')) return '360 Tour';
    if (urlLower.includes('roundme')) return 'Roundme';
    if (urlLower.includes('pano2vr')) return 'Pano2VR';
    return undefined;
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || url.length < 10) return false;
    const urlLower = url.toLowerCase();
    
    // Skip SVGs, icons, logos
    if (urlLower.includes('.svg') || urlLower.includes('icon') || 
        urlLower.includes('logo') || urlLower.includes('favicon')) {
      return false;
    }
    
    // Check for valid image extensions
    return /\.(jpg|jpeg|png|webp|gif)/i.test(url) || 
           url.includes('/image') || url.includes('/photo') ||
           url.startsWith('data:image');
  }

  private getImageContext(alt: string, url: string): string {
    const altLower = alt.toLowerCase();
    const urlLower = url.toLowerCase();
    
    if (altLower.includes('bedroom') || urlLower.includes('bedroom')) return 'Bedroom';
    if (altLower.includes('dining') || urlLower.includes('dining')) return 'Dining';
    if (altLower.includes('living') || urlLower.includes('living')) return 'Living Room';
    if (altLower.includes('exterior') || urlLower.includes('exterior')) return 'Exterior';
    if (altLower.includes('lobby') || urlLower.includes('lobby')) return 'Lobby';
    if (altLower.includes('amenity') || altLower.includes('amenities')) return 'Amenities';
    if (altLower.includes('garden') || urlLower.includes('garden')) return 'Garden';
    if (altLower.includes('pool') || urlLower.includes('pool')) return 'Pool';
    
    return alt || 'Facility Photo';
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