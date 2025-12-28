/**
 * 🚀 Crawlee Web Scraper Service
 * ================================
 * Production-grade scraper using Crawlee with Playwright
 * Handles JavaScript-rendered sites that Cheerio cannot process
 * 
 * Features:
 * - Auto-retry with smart backoff
 * - Proxy rotation support
 * - Anti-bot fingerprint handling
 * - Works on React/Angular/Vue sites
 */

import { PlaywrightCrawler, Dataset, Configuration } from 'crawlee';

interface ScrapedPhoto {
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  context: string;
  isGallery?: boolean;
}

interface ScrapedData {
  url: string;
  title: string;
  photos: ScrapedPhoto[];
  content: string;
  pricing?: string[];
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  metadata: {
    scrapedAt: string;
    renderTime: number;
    success: boolean;
    error?: string;
  };
}

export class CrawleeScraperService {
  private isInitialized = false;

  constructor() {
    console.log('🚀 Crawlee Scraper Service initialized');
    Configuration.set('headless', true);
    Configuration.set('logLevel', 'WARNING');
  }

  async scrapeWebsite(
    url: string,
    options: {
      timeout?: number;
      extractPhotos?: boolean;
      extractPricing?: boolean;
      extractContact?: boolean;
      waitForSelector?: string;
      minPhotoWidth?: number;
      minPhotoHeight?: number;
    } = {}
  ): Promise<ScrapedData> {
    const startTime = Date.now();
    const results: ScrapedData[] = [];

    const {
      timeout = 30000,
      extractPhotos = true,
      extractPricing = true,
      extractContact = true,
      minPhotoWidth = 200,
      minPhotoHeight = 150,
    } = options;

    console.log(`🕷️ Crawlee scraping: ${url}`);

    try {
      const crawler = new PlaywrightCrawler({
        maxRequestsPerCrawl: 1,
        requestHandlerTimeoutSecs: timeout / 1000,
        navigationTimeoutSecs: timeout / 1000,
        headless: true,
        launchContext: {
          launchOptions: {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
            ],
          },
        },
        async requestHandler({ page, request, log }) {
          const pageStartTime = Date.now();

          try {
            await page.setViewportSize({ width: 1920, height: 1080 });

            if (options.waitForSelector) {
              try {
                await page.waitForSelector(options.waitForSelector, { timeout: 5000 });
              } catch {
                log.warning(`Selector not found: ${options.waitForSelector}`);
              }
            }

            await page.waitForTimeout(2000);

            const title = await page.title();
            const content = await page.content();

            const photos: ScrapedPhoto[] = [];
            if (extractPhotos) {
              const imageData = await page.$$eval('img', (imgs) => {
                return imgs
                  .filter((img) => {
                    const rect = img.getBoundingClientRect();
                    return rect.width >= 100 && rect.height >= 75;
                  })
                  .map((img) => ({
                    url: img.src || img.getAttribute('data-src') || '',
                    alt: img.alt || '',
                    title: img.title || '',
                    width: img.naturalWidth || img.width,
                    height: img.naturalHeight || img.height,
                    isGallery:
                      img.closest('[class*="gallery"]') !== null ||
                      img.closest('[class*="slider"]') !== null ||
                      img.closest('[class*="carousel"]') !== null,
                  }));
              });

              for (const img of imageData) {
                if (
                  img.url &&
                  img.url.startsWith('http') &&
                  !img.url.includes('data:image') &&
                  !img.url.includes('placeholder') &&
                  !img.url.includes('loading') &&
                  !img.url.includes('spinner') &&
                  (img.width || 0) >= minPhotoWidth &&
                  (img.height || 0) >= minPhotoHeight
                ) {
                  photos.push({
                    url: img.url,
                    alt: img.alt,
                    title: img.title,
                    width: img.width,
                    height: img.height,
                    context: img.isGallery ? 'gallery' : 'page',
                    isGallery: img.isGallery,
                  });
                }
              }

              const bgImages = await page.$$eval('[style*="background"]', (els) => {
                return els
                  .map((el) => {
                    const style = window.getComputedStyle(el);
                    const bgImage = style.backgroundImage;
                    const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                    return match ? match[1] : null;
                  })
                  .filter((url) => url && url.startsWith('http'));
              });

              for (const bgUrl of bgImages) {
                if (
                  bgUrl &&
                  !photos.some((p) => p.url === bgUrl) &&
                  !bgUrl.includes('placeholder') &&
                  !bgUrl.includes('pattern')
                ) {
                  photos.push({
                    url: bgUrl,
                    context: 'background',
                    isGallery: false,
                  });
                }
              }
            }

            const pricing: string[] = [];
            if (extractPricing) {
              const priceTexts = await page.$$eval('body', ([body]) => {
                const text = body.innerText;
                const pricePatterns = [
                  /\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*\/?\s*(?:month|mo|per month))?/gi,
                  /(?:starting|from|rates?)\s*(?:at|from)?\s*\$[\d,]+/gi,
                  /[\d,]+\s*(?:per|a)\s*month/gi,
                ];
                const matches: string[] = [];
                for (const pattern of pricePatterns) {
                  const found = text.match(pattern) || [];
                  matches.push(...found);
                }
                return [...new Set(matches)].slice(0, 10);
              });
              pricing.push(...priceTexts);
            }

            const contact: ScrapedData['contact'] = {};
            if (extractContact) {
              const phoneMatch = content.match(
                /(?:\+1[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
              );
              if (phoneMatch) contact.phone = phoneMatch[0];

              const emailMatch = content.match(
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
              );
              if (emailMatch) contact.email = emailMatch[0];

              const addressMatch = await page.$eval(
                '[itemprop="address"], .address, [class*="address"]',
                (el) => el.textContent?.trim() || ''
              ).catch(() => '');
              if (addressMatch) contact.address = addressMatch;
            }

            const renderTime = Date.now() - pageStartTime;
            log.info(`Scraped ${url} in ${renderTime}ms - Found ${photos.length} photos`);

            results.push({
              url: request.url,
              title,
              photos,
              content: content.substring(0, 5000),
              pricing,
              contact,
              metadata: {
                scrapedAt: new Date().toISOString(),
                renderTime,
                success: true,
              },
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log.error(`Error scraping ${url}: ${errorMessage}`);
            results.push({
              url: request.url,
              title: '',
              photos: [],
              content: '',
              metadata: {
                scrapedAt: new Date().toISOString(),
                renderTime: Date.now() - pageStartTime,
                success: false,
                error: errorMessage,
              },
            });
          }
        },
        failedRequestHandler({ request, log }) {
          log.error(`Request failed: ${request.url}`);
          results.push({
            url: request.url,
            title: '',
            photos: [],
            content: '',
            metadata: {
              scrapedAt: new Date().toISOString(),
              renderTime: 0,
              success: false,
              error: 'Request failed after retries',
            },
          });
        },
      });

      await crawler.run([url]);

      const totalTime = Date.now() - startTime;
      console.log(`✅ Crawlee completed in ${totalTime}ms`);

      return (
        results[0] || {
          url,
          title: '',
          photos: [],
          content: '',
          metadata: {
            scrapedAt: new Date().toISOString(),
            renderTime: totalTime,
            success: false,
            error: 'No results returned',
          },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Crawlee error: ${errorMessage}`);

      return {
        url,
        title: '',
        photos: [],
        content: '',
        metadata: {
          scrapedAt: new Date().toISOString(),
          renderTime: Date.now() - startTime,
          success: false,
          error: errorMessage,
        },
      };
    }
  }

  async scrapePhotosFromWebsite(
    websiteUrl: string,
    communityName: string,
    options?: {
      maxPhotos?: number;
      timeout?: number;
      minWidth?: number;
      minHeight?: number;
    }
  ): Promise<ScrapedPhoto[]> {
    console.log(`📸 Crawlee photo extraction for: ${communityName}`);

    const result = await this.scrapeWebsite(websiteUrl, {
      timeout: options?.timeout || 30000,
      extractPhotos: true,
      extractPricing: false,
      extractContact: false,
      minPhotoWidth: options?.minWidth || 300,
      minPhotoHeight: options?.minHeight || 200,
    });

    const photos = result.photos.slice(0, options?.maxPhotos || 50);
    console.log(`📸 Crawlee extracted ${photos.length} photos from ${websiteUrl}`);

    return photos;
  }

  async scrapeMultiplePages(
    urls: string[],
    options?: {
      timeout?: number;
      maxConcurrency?: number;
    }
  ): Promise<ScrapedData[]> {
    const results: ScrapedData[] = [];
    const { timeout = 30000, maxConcurrency = 3 } = options || {};

    console.log(`🕷️ Crawlee batch scraping ${urls.length} URLs`);

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: urls.length,
      maxConcurrency,
      requestHandlerTimeoutSecs: timeout / 1000,
      headless: true,
      async requestHandler({ page, request, log }) {
        const startTime = Date.now();
        const title = await page.title();

        await page.waitForTimeout(1500);

        const imageData = await page.$$eval('img', (imgs) =>
          imgs
            .filter((img) => img.width >= 200 && img.height >= 150)
            .map((img) => ({
              url: img.src,
              alt: img.alt,
              width: img.naturalWidth,
              height: img.naturalHeight,
            }))
        );

        const photos: ScrapedPhoto[] = imageData
          .filter((img) => img.url && img.url.startsWith('http'))
          .map((img) => ({
            url: img.url,
            alt: img.alt,
            width: img.width,
            height: img.height,
            context: 'page',
          }));

        results.push({
          url: request.url,
          title,
          photos,
          content: '',
          metadata: {
            scrapedAt: new Date().toISOString(),
            renderTime: Date.now() - startTime,
            success: true,
          },
        });

        log.info(`Scraped ${request.url} - ${photos.length} photos`);
      },
    });

    await crawler.run(urls);

    console.log(`✅ Crawlee batch complete: ${results.length}/${urls.length} pages`);
    return results;
  }
}

export const crawleeScraper = new CrawleeScraperService();
