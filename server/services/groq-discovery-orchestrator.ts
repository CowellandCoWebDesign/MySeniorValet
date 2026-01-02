/**
 * Groq Discovery Orchestrator
 * ============================
 * Connects Groq Compound (source discovery) with Crawlee (structured data extraction)
 * 
 * Pipeline:
 * 1. Groq Compound searches for communities in a location
 * 2. Returns URLs from trusted senior living directories
 * 3. Crawlee scrapes each URL for structured facility data
 * 4. Validated data becomes discovered communities
 */

import { PlaywrightCrawler, Configuration } from 'crawlee';
import { groqLlamaService } from './groq-llama-service';

interface DiscoveredFacility {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  website: string;
  email: string;
  description: string;
  careTypes: string[];
  amenities: string[];
  photos: string[];
  sourceUrl: string;
  sourceDomain: string;
  scrapedAt: string;
  confidence: number;
}

interface DirectoryPlaybook {
  domain: string;
  selectors: {
    name: string[];
    address: string[];
    city: string[];
    state: string[];
    phone: string[];
    website: string[];
    description: string[];
    careTypes: string[];
    amenities: string[];
    photos: string[];
  };
}

const TRUSTED_DIRECTORIES: DirectoryPlaybook[] = [
  {
    domain: 'aplaceformom.com',
    selectors: {
      name: ['h1[data-testid="community-name"]', 'h1.community-name', '.CommunityHeader h1', 'h1'],
      address: ['.community-address', '.CommunityDetails__address', '[data-testid="address"]', '.address'],
      city: ['.community-city', '[data-testid="city"]'],
      state: ['.community-state', '[data-testid="state"]'],
      phone: ['[data-testid="phone"]', 'a[href^="tel:"]', '.phone-number', '.contact-phone'],
      website: ['.community-website a', '[data-testid="website"]'],
      description: ['.community-description', '.about-community', '[data-testid="description"]', '.description'],
      careTypes: ['.care-types li', '.service-types span', '[data-testid="care-type"]'],
      amenities: ['.amenities li', '.amenity-item', '[data-testid="amenity"]'],
      photos: ['.gallery img', '.community-photos img', '.photo-carousel img', 'img[src*="community"]']
    }
  },
  {
    domain: 'senioradvisor.com',
    selectors: {
      name: ['h1.CommunityName-title', '.community-title h1', 'h1'],
      address: ['.CommunityAddress', '.community-address', '.address-line'],
      city: ['.city-name', '.CommunityCity'],
      state: ['.state-abbrev', '.CommunityState'],
      phone: ['[data-track="phone_call"]', 'a[href^="tel:"]', '.phone'],
      website: ['.community-website', 'a[data-track="website"]'],
      description: ['.community-overview', '.description-text', '.about'],
      careTypes: ['.care-levels li', '.care-type-badge', '.service-type'],
      amenities: ['.amenities-list li', '.amenity'],
      photos: ['.photo-gallery img', '.main-photo img', 'img[alt*="photo"]']
    }
  },
  {
    domain: 'caring.com',
    selectors: {
      name: ['h1.facility-name', '.provider-name h1', 'h1'],
      address: ['.facility-address', '.provider-address', '.street-address'],
      city: ['.locality', '.city'],
      state: ['.region', '.state'],
      phone: ['.provider-phone a', 'a[href^="tel:"]', '.phone'],
      website: ['.provider-website a', '.website-link'],
      description: ['.provider-description', '.facility-overview', '.about-section'],
      careTypes: ['.care-services li', '.service-tag'],
      amenities: ['.amenities li', '.feature-list li'],
      photos: ['.photo-gallery img', '.facility-photo', 'img.provider-image']
    }
  },
  {
    domain: 'brookdale.com',
    selectors: {
      name: ['h1.community-name', '.hero-title h1', 'h1'],
      address: ['.community-address', '.location-address', '[itemprop="streetAddress"]'],
      city: ['[itemprop="addressLocality"]', '.city'],
      state: ['[itemprop="addressRegion"]', '.state'],
      phone: ['a[href^="tel:"]', '.community-phone', '[itemprop="telephone"]'],
      website: [],
      description: ['.community-overview', '.about-section p', '.description'],
      careTypes: ['.care-levels li', '.services-offered li'],
      amenities: ['.amenities-list li', '.features li'],
      photos: ['.gallery-image img', '.community-photo', '.hero-image img']
    }
  },
  {
    domain: 'newlifestyles.com',
    selectors: {
      name: ['h1.provider-name', '.facility-header h1', 'h1'],
      address: ['.facility-address', '.address-line'],
      city: ['.city'],
      state: ['.state'],
      phone: ['a[href^="tel:"]', '.phone-number'],
      website: ['.website-link a'],
      description: ['.facility-description', '.about-text'],
      careTypes: ['.services li', '.care-type'],
      amenities: ['.amenities li'],
      photos: ['.gallery img', '.facility-photo']
    }
  }
];

const GENERIC_SELECTORS: DirectoryPlaybook = {
  domain: '*',
  selectors: {
    name: ['h1', '.facility-name', '.community-name', '.provider-name', '[itemprop="name"]'],
    address: ['.address', '.street-address', '[itemprop="streetAddress"]', '.location'],
    city: ['.city', '[itemprop="addressLocality"]', '.locality'],
    state: ['.state', '[itemprop="addressRegion"]', '.region'],
    phone: ['a[href^="tel:"]', '.phone', '[itemprop="telephone"]', '.contact-phone'],
    website: ['.website a', '[itemprop="url"]'],
    description: ['.description', '.about', '.overview', 'meta[name="description"]'],
    careTypes: ['.services li', '.care-types li', '.service-type'],
    amenities: ['.amenities li', '.features li'],
    photos: ['img[src*="community"]', 'img[src*="facility"]', '.gallery img', '.photo img']
  }
};

export class GroqDiscoveryOrchestrator {
  constructor() {
    console.log('🔄 Groq Discovery Orchestrator initialized');
    console.log('   Pipeline: Groq Compound → Crawlee Scraper → Validated Data');
    Configuration.set('headless', true);
    Configuration.set('logLevel', 'WARNING');
  }

  async discoverCommunities(
    query: string,
    options: { maxResults?: number; scrapeTimeout?: number } = {}
  ): Promise<DiscoveredFacility[]> {
    const { maxResults = 10, scrapeTimeout = 15000 } = options;
    const discovered: DiscoveredFacility[] = [];

    console.log(`\n🔍 Starting Groq Discovery Pipeline for: "${query}"`);

    if (!groqLlamaService.isConfigured()) {
      console.error('❌ Groq not configured');
      return [];
    }

    try {
      console.log('   Step 1: Groq Compound searching for directory sources...');
      const groqResult = await groqLlamaService.discoveryCommunitySearch(query);

      if (!groqResult.sources || groqResult.sources.length === 0) {
        console.log('   ⚠️ No sources found from Groq');
        console.log('   Raw content:', groqResult.rawContent?.substring(0, 500));
        return [];
      }

      console.log(`   ✅ Groq found ${groqResult.sources.length} sources`);

      const trustedSources = groqResult.sources.filter(source => {
        const urlLower = source.url.toLowerCase();
        return TRUSTED_DIRECTORIES.some(d => urlLower.includes(d.domain)) ||
               urlLower.includes('seniorhousingnet.com') ||
               urlLower.includes('seniorliving.org') ||
               urlLower.includes('assistedliving.com');
      });

      console.log(`   📋 ${trustedSources.length} sources from trusted directories`);

      if (trustedSources.length === 0) {
        console.log('   ⚠️ No trusted directory sources, using all sources with generic extraction');
        trustedSources.push(...groqResult.sources.slice(0, 5));
      }

      console.log('   Step 2: Crawlee scraping each source for structured data...');

      for (const source of trustedSources.slice(0, maxResults)) {
        try {
          console.log(`   🕷️ Scraping: ${source.url.substring(0, 60)}...`);
          const facility = await this.scrapeFacilityPage(source.url, source.title, scrapeTimeout);

          if (facility && facility.name && facility.name.length > 3) {
            discovered.push(facility);
            console.log(`   ✅ Extracted: "${facility.name}" in ${facility.city || 'unknown'}, ${facility.state || 'unknown'}`);
          }
        } catch (scrapeError) {
          console.log(`   ⚠️ Failed to scrape ${source.url.substring(0, 40)}: ${(scrapeError as Error).message}`);
        }
      }

      console.log(`\n✅ Discovery Pipeline Complete: ${discovered.length} facilities extracted`);
      return discovered;

    } catch (error) {
      console.error('❌ Discovery pipeline error:', error);
      return [];
    }
  }

  private async scrapeFacilityPage(
    url: string,
    fallbackTitle: string,
    timeout: number
  ): Promise<DiscoveredFacility | null> {
    const domain = new URL(url).hostname.replace('www.', '');
    const playbook = TRUSTED_DIRECTORIES.find(d => domain.includes(d.domain)) || GENERIC_SELECTORS;

    let result: DiscoveredFacility | null = null;

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: timeout / 1000,
      navigationTimeoutSecs: timeout / 1000,
      headless: true,
      launchContext: {
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        },
      },
      async requestHandler({ page }) {
        await page.waitForTimeout(1500);

        const extractText = async (selectors: string[]): Promise<string> => {
          for (const selector of selectors) {
            try {
              const el = await page.$(selector);
              if (el) {
                const text = await el.textContent();
                if (text && text.trim().length > 0) {
                  return text.trim();
                }
              }
            } catch {}
          }
          return '';
        };

        const extractMultiple = async (selectors: string[]): Promise<string[]> => {
          const results: string[] = [];
          for (const selector of selectors) {
            try {
              const elements = await page.$$(selector);
              for (const el of elements.slice(0, 10)) {
                const text = await el.textContent();
                if (text && text.trim().length > 0) {
                  results.push(text.trim());
                }
              }
            } catch {}
          }
          return [...new Set(results)];
        };

        const extractPhotos = async (selectors: string[]): Promise<string[]> => {
          const photos: string[] = [];
          for (const selector of selectors) {
            try {
              const images = await page.$$(selector);
              for (const img of images.slice(0, 10)) {
                const src = await img.getAttribute('src') || await img.getAttribute('data-src');
                if (src && src.startsWith('http') && !src.includes('placeholder') && !src.includes('icon')) {
                  photos.push(src);
                }
              }
            } catch {}
          }
          return [...new Set(photos)];
        };

        let name = await extractText(playbook.selectors.name);
        if (!name && fallbackTitle) {
          const titleParts = fallbackTitle.split(/\s*[-–|]\s*/);
          name = titleParts[0]?.trim() || '';
        }

        const address = await extractText(playbook.selectors.address);
        let city = await extractText(playbook.selectors.city);
        let state = await extractText(playbook.selectors.state);

        if ((!city || !state) && address) {
          const addressMatch = address.match(/,\s*([^,]+),\s*([A-Z]{2})/i);
          if (addressMatch) {
            city = city || addressMatch[1].trim();
            state = state || addressMatch[2].trim();
          }
        }

        let phone = await extractText(playbook.selectors.phone);
        if (!phone) {
          const phoneLinks = await page.$$('a[href^="tel:"]');
          if (phoneLinks.length > 0) {
            const href = await phoneLinks[0].getAttribute('href');
            phone = href?.replace('tel:', '').replace(/\D/g, '') || '';
            if (phone.length === 10) {
              phone = `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
            }
          }
        }

        const description = await extractText(playbook.selectors.description);
        const careTypes = await extractMultiple(playbook.selectors.careTypes);
        const amenities = await extractMultiple(playbook.selectors.amenities);
        const photos = await extractPhotos(playbook.selectors.photos);

        result = {
          name,
          address,
          city,
          state,
          country: 'United States',
          phone,
          website: url,
          email: '',
          description: description.substring(0, 500),
          careTypes: careTypes.slice(0, 10),
          amenities: amenities.slice(0, 20),
          photos: photos.slice(0, 10),
          sourceUrl: url,
          sourceDomain: domain,
          scrapedAt: new Date().toISOString(),
          confidence: name && (city || state) ? 80 : 50
        };
      },
    });

    try {
      await crawler.run([url]);
    } catch (error) {
      console.log(`   Crawl error for ${url}: ${(error as Error).message}`);
    }

    return result;
  }
}

export const groqDiscoveryOrchestrator = new GroqDiscoveryOrchestrator();
