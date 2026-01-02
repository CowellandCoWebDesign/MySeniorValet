/**
 * Free AI Search Pipeline
 * 
 * Perplexity-style search using completely FREE tools:
 * 1. DuckDuckGo HTML search for web discovery
 * 2. Groq + Llama 3.3 70B for query generation and synthesis
 * 3. Crawlee/Playwright for deep scraping of discovered sources
 * 
 * This replaces the paid Perplexity AI service
 */

import { groqLlamaService } from './groq-llama-service';
import { braveSearch } from './brave-search';
import { duckDuckGoSearch } from './duckduckgo-search';
import { crawleeScraper } from './crawlee-scraper';
import { searxngSearch } from './searxng-search';

// NOTE: We do NOT fabricate URLs from these directories
// All URLs must come from actual search results (Golden Data Rule)

interface SearchPipelineResult {
  summary: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
  pricing?: string;
  phone?: string;
  website?: string;
  amenities?: string[];
  careTypes?: string[];
  photos: string[];
  rawContent: string;
  searchQueries: string[];
  timestamp: number;
}

interface PipelineOptions {
  includePhotos?: boolean;
  maxSources?: number;
  deepScrape?: boolean;
}

export class FreeAISearchPipeline {
  private searchCache = new Map<string, { result: SearchPipelineResult; timestamp: number }>();
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  constructor() {
    console.log('🔄 Free AI Search Pipeline initialized');
    console.log('   Components: Brave Search + Groq Llama 3.3 + Crawlee');
    console.log('   Primary: Brave Search API (2000 FREE/month)');
    console.log('   Fallbacks: DuckDuckGo, SearXNG');
    console.log('   Cost: $0.00');
  }
  
  private getCacheKey(communityName: string, location: string): string {
    return `${communityName.toLowerCase().trim()}:${location.toLowerCase().trim()}`;
  }
  
  private getFromCache(key: string): SearchPipelineResult | null {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      console.log(`📦 Pipeline cache hit for: ${key}`);
      return cached.result;
    }
    return null;
  }
  
  private saveToCache(key: string, result: SearchPipelineResult): void {
    // Quality check - don't cache empty/poor results
    const hasUsefulData = result.sources.length >= 1 || 
                          result.photos.length >= 1 || 
                          (result.pricing && result.pricing.length > 5) ||
                          (result.summary && result.summary.length > 200 && !result.summary.includes('contact them directly'));
    
    if (!hasUsefulData) {
      console.log(`⚠️ Not caching poor quality result (no sources, photos, or useful content)`);
      return;
    }
    
    this.searchCache.set(key, { result, timestamp: Date.now() });
    
    // Cleanup old entries
    if (this.searchCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.searchCache.entries()) {
        if (now - v.timestamp > this.CACHE_TTL_MS) {
          this.searchCache.delete(k);
        }
      }
    }
  }
  
  /**
   * Main search pipeline - replaces Perplexity API
   */
  async search(
    communityName: string,
    location: string,
    websiteUrl?: string,
    options: PipelineOptions = {}
  ): Promise<SearchPipelineResult> {
    const { includePhotos = true, maxSources = 10, deepScrape = false } = options;
    
    const cacheKey = this.getCacheKey(communityName, location);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    console.log(`\n🚀 FREE AI Search Pipeline starting for: ${communityName}, ${location}`);
    console.log('   Step 1: Generate search queries with Llama');
    console.log('   Step 2: Search web (Brave → DuckDuckGo → SearXNG)');
    console.log('   Step 3: Synthesize results with Llama');
    if (includePhotos) {
      console.log('   Step 4: Scrape photos with Crawlee');
    }
    
    const searchQueries: string[] = [];
    let allSources: Array<{ title: string; url: string; snippet: string }> = [];
    let photos: string[] = [];
    let websiteContent = '';
    
    try {
      // STEP 1: Generate optimized search queries using Llama
      console.log('\n📝 Step 1: Generating search queries with Llama...');
      let queries: Array<{ query: string; intent: string }>;
      
      if (groqLlamaService.isConfigured()) {
        queries = await groqLlamaService.generateSearchQueries(communityName, location, 'general');
        searchQueries.push(...queries.map(q => q.query));
        console.log(`   Generated ${queries.length} optimized queries`);
      } else {
        // Fallback: use simple queries
        queries = [
          { query: `"${communityName}" ${location} senior living`, intent: 'general' },
          { query: `"${communityName}" ${location} pricing cost`, intent: 'pricing' },
          { query: `"${communityName}" ${location} reviews`, intent: 'reviews' }
        ];
        searchQueries.push(...queries.map(q => q.query));
        console.log('   Using fallback queries (Groq not configured)');
      }
      
      // STEP 2: Multi-tier web search with fallbacks
      console.log('\n🔍 Step 2: Multi-tier web search...');
      
      // Extract city/state from location
      const [city, state] = location.split(',').map(s => s.trim());
      const mainQuery = `"${communityName}" ${city || location} ${state || ''} senior living`;
      
      // TIER 1: Brave Search API (2000 FREE queries/month - most reliable)
      if (braveSearch.isConfigured() && braveSearch.getRemainingQuota() > 0) {
        console.log('   Tier 1: Brave Search API (FREE tier)...');
        try {
          const braveResults = await braveSearch.search(mainQuery, { count: 15 });
          for (const r of braveResults) {
            if (!allSources.find(s => s.url === r.url)) {
              allSources.push({ title: r.title, url: r.url, snippet: r.snippet });
            }
          }
          console.log(`   Brave Search found ${braveResults.length} results`);
          
          // Also search for pricing specifically
          if (braveResults.length > 0) {
            const pricingQuery = `"${communityName}" ${location} pricing cost monthly`;
            const pricingResults = await braveSearch.search(pricingQuery, { count: 5 });
            for (const r of pricingResults) {
              if (!allSources.find(s => s.url === r.url)) {
                allSources.push({ title: r.title, url: r.url, snippet: r.snippet });
              }
            }
          }
        } catch (braveError) {
          console.warn('   Brave Search failed:', (braveError as Error).message);
        }
      } else {
        console.log('   Brave Search not available, using fallbacks...');
      }
      
      // TIER 2: DuckDuckGo (if Brave didn't return enough)
      if (allSources.length < 5) {
        console.log('   Tier 2: DuckDuckGo Lite...');
        try {
          const ddgResults = await duckDuckGoSearch.searchWithVariations(communityName, city || location, state || '');
          for (const r of ddgResults) {
            if (!allSources.find(s => s.url === r.url)) {
              allSources.push({ title: r.title, url: r.url, snippet: r.snippet });
            }
          }
          console.log(`   DuckDuckGo found ${ddgResults.length} results`);
        } catch (ddgError) {
          console.warn('   DuckDuckGo failed');
        }
      }
      
      // TIER 3: SearXNG metasearch (if still need more)
      if (allSources.length < 5) {
        console.log('   Tier 3: SearXNG metasearch...');
        try {
          const searxResult = await searxngSearch.search(mainQuery, { maxResults: 15 });
          for (const r of searxResult.results) {
            if (!allSources.find(s => s.url === r.url)) {
              allSources.push({ title: r.title, url: r.url, snippet: r.snippet });
            }
          }
          console.log(`   SearXNG found ${searxResult.results.length} results`);
        } catch (searxError) {
          console.warn('   SearXNG failed:', (searxError as Error).message);
        }
      }
      
      console.log(`   Total sources: ${allSources.length}`);
      
      // STEP 3: Deep scrape the official website if provided
      if (websiteUrl && deepScrape) {
        console.log('\n🕷️ Step 2b: Scraping official website...');
        try {
          const scrapedContent = await crawleeScraper.scrapeWebsite(websiteUrl);
          if (scrapedContent) {
            websiteContent = scrapedContent.content || '';
            console.log(`   Scraped ${websiteContent.length} characters from website`);
          }
        } catch (scrapeError) {
          console.warn('   Website scrape failed:', scrapeError);
        }
      }
      
      // STEP 4: Synthesize results with Llama
      console.log('\n🧠 Step 3: Synthesizing results with Llama...');
      
      let synthesis: {
        summary: string;
        pricing?: string;
        phone?: string;
        website?: string;
        amenities?: string[];
        careTypes?: string[];
        sources: string[];
      };
      
      if (groqLlamaService.isConfigured() && allSources.length > 0) {
        synthesis = await groqLlamaService.synthesizeSearchResults(
          communityName,
          location,
          allSources.slice(0, maxSources),
          websiteContent
        );
        console.log('   Synthesis complete');
      } else {
        // Fallback: create summary from snippets
        const snippets = allSources.slice(0, 5).map(s => s.snippet).join('\n\n');
        synthesis = {
          summary: snippets || `${communityName} is a senior living community located in ${location}. Please contact them directly for more information.`,
          sources: allSources.map(s => s.url)
        };
        console.log('   Using fallback synthesis (Groq not configured or no sources)');
      }
      
      // STEP 5: Scrape photos if requested - use ALL real discovered URLs
      if (includePhotos) {
        console.log('\n📸 Step 4: Scraping photos from ALL discovered sources...');
        
        // Blocked domains that don't allow scraping
        const blockedDomains = ['facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com', 'pinterest.com'];
        
        // Use ALL real URLs from search results (not just specific domains)
        const realPhotoSources = allSources
          .filter(s => 
            s.url.startsWith('http') &&
            !blockedDomains.some(blocked => s.url.includes(blocked))
          )
          .slice(0, 6); // Try up to 6 sources
        
        console.log(`   Found ${realPhotoSources.length} real sources to scrape for photos`);
        
        for (const source of realPhotoSources) {
          if (photos.length >= 20) break;
          
          console.log(`   Scraping: ${source.url.substring(0, 60)}...`);
          try {
            const scrapedPhotos = await crawleeScraper.scrapePhotosFromWebsite(
              source.url,
              communityName,
              { maxPhotos: 15, timeout: 45000 }
            );
            
            const newPhotos = scrapedPhotos
              .filter(p => p.url && p.url.startsWith('http') && !p.url.includes('icon') && !p.url.includes('logo'))
              .map(p => `/api/image-proxy?url=${encodeURIComponent(p.url)}`);
            
            const addedCount = newPhotos.filter(p => !photos.includes(p)).length;
            photos.push(...newPhotos.filter(p => !photos.includes(p)));
            console.log(`     Found ${addedCount} new photos from this source`);
          } catch (err) {
            console.log(`     Scrape failed, continuing...`);
          }
        }
        
        // PRIORITY 2: Try official website only if we have few photos
        if (photos.length < 5 && websiteUrl && !websiteUrl.includes('NOT AVAILABLE')) {
          console.log(`   Trying official website: ${websiteUrl}`);
          try {
            const scrapedPhotos = await crawleeScraper.scrapePhotosFromWebsite(
              websiteUrl,
              communityName,
              { maxPhotos: 15, timeout: 45000 }
            );
            const newPhotos = scrapedPhotos
              .filter(p => p.url && p.url.startsWith('http') && !p.url.includes('icon') && !p.url.includes('logo'))
              .map(p => `/api/image-proxy?url=${encodeURIComponent(p.url)}`);
            photos.push(...newPhotos.filter(p => !photos.includes(p)));
          } catch (photoError) {
            console.warn('   Official website photo scrape failed');
          }
        }
        
        console.log(`   Total photos found: ${photos.length}`);
      }
      
      // Build raw content for caching
      const rawContent = `## ${communityName}\n**Location:** ${location}\n\n${synthesis.summary}`;
      
      const result: SearchPipelineResult = {
        summary: synthesis.summary,
        sources: allSources.slice(0, maxSources),
        pricing: synthesis.pricing,
        phone: synthesis.phone,
        website: synthesis.website || websiteUrl,
        amenities: synthesis.amenities,
        careTypes: synthesis.careTypes,
        photos,
        rawContent,
        searchQueries,
        timestamp: Date.now()
      };
      
      // Cache the result
      this.saveToCache(cacheKey, result);
      
      console.log(`\n✅ FREE AI Search Pipeline complete for ${communityName}`);
      console.log(`   Sources: ${result.sources.length}`);
      console.log(`   Photos: ${result.photos.length}`);
      console.log(`   Cost: $0.00`);
      
      return result;
      
    } catch (error: any) {
      console.error('❌ Free AI Search Pipeline error:', error.message);
      
      // Return minimal result on error
      return {
        summary: `Unable to fetch complete information for ${communityName} in ${location}. Please try again later or contact the community directly.`,
        sources: allSources,
        photos,
        rawContent: '',
        searchQueries,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Quick search without photo scraping (faster)
   */
  async quickSearch(
    communityName: string,
    location: string
  ): Promise<{ summary: string; sources: string[] }> {
    const result = await this.search(communityName, location, undefined, {
      includePhotos: false,
      maxSources: 5,
      deepScrape: false
    });
    
    return {
      summary: result.summary,
      sources: result.sources.map(s => s.url)
    };
  }
  
  /**
   * Get comprehensive data including pricing
   */
  async getComprehensiveData(
    communityName: string,
    location: string,
    websiteUrl?: string
  ): Promise<SearchPipelineResult> {
    return this.search(communityName, location, websiteUrl, {
      includePhotos: true,
      maxSources: 15,
      deepScrape: true
    });
  }
  
  /**
   * Clear cache for a specific community
   */
  clearCache(communityName: string, location: string): void {
    const key = this.getCacheKey(communityName, location);
    this.searchCache.delete(key);
    console.log(`🗑️ Cache cleared for ${communityName}, ${location}`);
  }
  
  /**
   * Get pipeline status and stats
   */
  getStats(): {
    groqConfigured: boolean;
    groqUsage: any;
    duckDuckGoStats: any;
    cacheSize: number;
  } {
    return {
      groqConfigured: groqLlamaService.isConfigured(),
      groqUsage: groqLlamaService.isConfigured() ? groqLlamaService.getUsageStats() : null,
      duckDuckGoStats: duckDuckGoSearch.getStats(),
      cacheSize: this.searchCache.size
    };
  }
}

// Singleton instance
export const freeAISearchPipeline = new FreeAISearchPipeline();
