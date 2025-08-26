import * as playwright from 'playwright';
import { Browser, Page } from 'playwright';

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
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await playwright.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async scrapeWebsite(url: string): Promise<ScrapedCommunityData> {
    console.log(`🕸️ Scraping website: ${url}`);
    await this.initialize();
    
    const page = await this.browser!.newPage();
    
    try {
      // Set a reasonable timeout and viewport
      page.setDefaultTimeout(15000);
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to the website
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 20000 
      });

      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);

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

      // Extract all images (photos and floor plans)
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .map(img => ({
            src: img.src,
            alt: img.alt || '',
            title: img.title || '',
            dataAttr: img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || ''
          }))
          .filter(img => img.src && !img.src.includes('logo') && !img.src.includes('icon'));
      });

      // Categorize images
      for (const img of images) {
        const imgInfo = `${img.alt} ${img.title}`.toLowerCase();
        if (imgInfo.includes('floor') || imgInfo.includes('plan') || imgInfo.includes('layout')) {
          data.floorPlans.push(img.src);
        } else if (img.src.includes('floorplan') || img.src.includes('floor-plan')) {
          data.floorPlans.push(img.src);
        } else if (img.src.includes('/photos/') || img.src.includes('/gallery/') || 
                   img.src.includes('/images/')) {
          data.photos.push(img.src);
        }
      }

      // Look for virtual tour links
      const virtualTourLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, iframe'));
        const tours: string[] = [];
        
        links.forEach(el => {
          const href = el.getAttribute('href') || el.getAttribute('src') || '';
          const text = el.textContent || '';
          
          if (href.includes('matterport') || href.includes('3d-tour') || 
              href.includes('virtual-tour') || href.includes('360')) {
            tours.push(href);
          } else if (text.toLowerCase().includes('virtual tour') || 
                     text.toLowerCase().includes('3d tour')) {
            if (href) tours.push(href);
          }
        });
        
        return tours;
      });
      data.virtualTours = [...new Set(virtualTourLinks)];

      // Look for video content
      const videos = await page.evaluate(() => {
        const videoElements = Array.from(document.querySelectorAll('video, iframe'));
        const videoUrls: string[] = [];
        
        videoElements.forEach(el => {
          const src = el.getAttribute('src') || '';
          if (src.includes('youtube') || src.includes('vimeo') || src.includes('video')) {
            videoUrls.push(src);
          }
        });
        
        return videoUrls;
      });
      data.videos = [...new Set(videos)];

      // Extract pricing information
      const pricingText = await page.evaluate(() => {
        const pricePatterns = [/\$[\d,]+/g, /starting at/gi, /from \$/gi];
        const body = document.body.innerText;
        const prices: string[] = [];
        
        // Look for price sections
        const priceElements = document.querySelectorAll('*');
        priceElements.forEach(el => {
          const text = el.textContent || '';
          if (text.match(/\$[\d,]+/) && text.length < 200) {
            prices.push(text);
          }
        });
        
        return prices.slice(0, 5); // Return top 5 price mentions
      });
      
      // Parse pricing
      const priceNumbers = pricingText
        .join(' ')
        .match(/\$[\d,]+/g);
      if (priceNumbers && priceNumbers.length > 0) {
        const sortedPrices = priceNumbers
          .map(p => parseInt(p.replace(/[$,]/g, '')))
          .sort((a, b) => a - b);
        data.pricing.min = `$${sortedPrices[0].toLocaleString()}`;
        data.pricing.max = `$${sortedPrices[sortedPrices.length - 1].toLocaleString()}`;
      }

      // Extract amenities
      const amenities = await page.evaluate(() => {
        const amenityKeywords = ['amenity', 'amenities', 'features', 'services'];
        const foundAmenities: string[] = [];
        
        // Look for lists near amenity headings
        amenityKeywords.forEach(keyword => {
          const elements = Array.from(document.querySelectorAll(`h2, h3, h4`));
          elements.forEach(heading => {
            if (heading.textContent?.toLowerCase().includes(keyword)) {
              const nextElement = heading.nextElementSibling;
              if (nextElement?.tagName === 'UL' || nextElement?.tagName === 'OL') {
                const items = Array.from(nextElement.querySelectorAll('li'));
                items.forEach(item => {
                  foundAmenities.push(item.textContent?.trim() || '');
                });
              }
            }
          });
        });
        
        return foundAmenities.filter(a => a.length > 0);
      });
      data.amenities = [...new Set(amenities)].slice(0, 20);

      // Extract care levels
      const careLevels = await page.evaluate(() => {
        const careKeywords = [
          'independent living', 'assisted living', 'memory care', 
          'skilled nursing', 'hospice', 'respite care', 'rehabilitation'
        ];
        const bodyText = document.body.innerText.toLowerCase();
        const found: string[] = [];
        
        careKeywords.forEach(care => {
          if (bodyText.includes(care)) {
            found.push(care);
          }
        });
        
        return found;
      });
      data.careLevels = careLevels.map(c => 
        c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      );

      // Extract contact information
      const contactInfo = await page.evaluate(() => {
        const info: any = {};
        
        // Phone
        const phoneRegex = /(\d{3})[-.\s]?(\d{3})[-.\s]?(\d{4})/;
        const phoneMatch = document.body.innerText.match(phoneRegex);
        if (phoneMatch) {
          info.phone = phoneMatch[0];
        }
        
        // Email
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const emailMatch = document.body.innerText.match(emailRegex);
        if (emailMatch) {
          info.email = emailMatch[0];
        }
        
        // Address (look for common patterns)
        const addressElements = document.querySelectorAll('address');
        if (addressElements.length > 0) {
          info.address = addressElements[0].textContent?.trim();
        }
        
        return info;
      });
      data.contactInfo = contactInfo;

      // Extract description
      const description = await page.evaluate(() => {
        // Look for meta description first
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          return metaDesc.getAttribute('content');
        }
        
        // Look for about section
        const aboutSection = document.querySelector('section.about, div.about, .community-description');
        if (aboutSection) {
          return aboutSection.textContent?.trim().substring(0, 500);
        }
        
        return null;
      });
      if (description) {
        data.description = description;
      }

      console.log(`✅ Successfully scraped ${url}:`);
      console.log(`   - ${data.photos.length} photos`);
      console.log(`   - ${data.floorPlans.length} floor plans`);
      console.log(`   - ${data.virtualTours.length} virtual tours`);
      console.log(`   - ${data.amenities.length} amenities`);
      console.log(`   - Care levels: ${data.careLevels.join(', ')}`);

      return data;

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
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
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const websiteScraperService = new WebsiteScraperService();