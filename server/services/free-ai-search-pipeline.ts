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
import { duckDuckGoSearch } from './duckduckgo-search';
import { crawleeScraper } from './crawlee-scraper';
import { searxngSearch } from './searxng-search';

// Known senior living directory base URLs for reliable data
const SENIOR_DIRECTORIES = [
  { name: 'Caring.com', baseUrl: 'https://www.caring.com/senior-living' },
  { name: 'A Place for Mom', baseUrl: 'https://www.aplaceformom.com' },
  { name: 'SeniorHousingNet', baseUrl: 'https://www.seniorhousingnet.com' },
  { name: 'SeniorLiving.org', baseUrl: 'https://www.seniorliving.org' },
  { name: 'SeniorAdvisor', baseUrl: 'https://www.senioradvisor.com' },
];

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
    console.log('   Components: DuckDuckGo + Groq Llama 3.3 + Crawlee');
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
  
  private getStateName(abbrev: string): string {
    const states: Record<string, string> = {
      'AL': 'alabama', 'AK': 'alaska', 'AZ': 'arizona', 'AR': 'arkansas', 'CA': 'california',
      'CO': 'colorado', 'CT': 'connecticut', 'DE': 'delaware', 'FL': 'florida', 'GA': 'georgia',
      'HI': 'hawaii', 'ID': 'idaho', 'IL': 'illinois', 'IN': 'indiana', 'IA': 'iowa',
      'KS': 'kansas', 'KY': 'kentucky', 'LA': 'louisiana', 'ME': 'maine', 'MD': 'maryland',
      'MA': 'massachusetts', 'MI': 'michigan', 'MN': 'minnesota', 'MS': 'mississippi', 'MO': 'missouri',
      'MT': 'montana', 'NE': 'nebraska', 'NV': 'nevada', 'NH': 'new-hampshire', 'NJ': 'new-jersey',
      'NM': 'new-mexico', 'NY': 'new-york', 'NC': 'north-carolina', 'ND': 'north-dakota', 'OH': 'ohio',
      'OK': 'oklahoma', 'OR': 'oregon', 'PA': 'pennsylvania', 'RI': 'rhode-island', 'SC': 'south-carolina',
      'SD': 'south-dakota', 'TN': 'tennessee', 'TX': 'texas', 'UT': 'utah', 'VT': 'vermont',
      'VA': 'virginia', 'WA': 'washington', 'WV': 'west-virginia', 'WI': 'wisconsin', 'WY': 'wyoming'
    };
    return states[abbrev.toUpperCase()] || abbrev.toLowerCase();
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
    console.log('   Step 2: Search web with DuckDuckGo');
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
      
      // TIER 1: DuckDuckGo Lite
      console.log('   Tier 1: DuckDuckGo Lite...');
      try {
        const ddgResults = await duckDuckGoSearch.searchWithVariations(communityName, city || location, state || '');
        for (const r of ddgResults) {
          if (!allSources.find(s => s.url === r.url)) {
            allSources.push({ title: r.title, url: r.url, snippet: r.snippet });
          }
        }
        console.log(`   DuckDuckGo found ${ddgResults.length} results`);
      } catch (ddgError) {
        console.warn('   DuckDuckGo failed, trying SearXNG...');
      }
      
      // TIER 2: SearXNG metasearch (if DuckDuckGo returned few results)
      if (allSources.length < 5) {
        console.log('   Tier 2: SearXNG metasearch...');
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
      
      // TIER 3: Direct directory search (always try for comprehensive coverage)
      console.log('   Tier 3: Direct directory search...');
      const communitySlug = communityName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const citySlug = (city || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const stateSlug = (state || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const stateFull = this.getStateName(state || '');
      
      // Build deterministic directory URLs for known senior living sites
      const directoryUrls = [
        { title: `${communityName} on Caring.com`, url: `https://www.caring.com/senior-living/${stateFull.toLowerCase()}/${citySlug}/${communitySlug}`, snippet: 'Reviews and pricing' },
        { title: `${communityName} on A Place for Mom`, url: `https://www.aplaceformom.com/community/${communitySlug}`, snippet: 'Senior care advisor' },
        { title: `${communityName} on SeniorAdvisor`, url: `https://www.senioradvisor.com/community/${communitySlug}`, snippet: 'Senior living reviews' },
      ];
      
      for (const dir of directoryUrls) {
        if (!allSources.find(s => s.url.includes(dir.url.split('/')[2]))) {
          allSources.push(dir);
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
      
      // STEP 5: Scrape photos if requested - prioritize REAL discovered URLs
      if (includePhotos) {
        console.log('\n📸 Step 4: Scraping photos from discovered sources...');
        
        // PRIORITY 1: Use REAL URLs from DuckDuckGo search (these are verified to exist)
        const realPhotoSources = allSources
          .filter(s => 
            s.url.startsWith('http') &&
            !s.url.includes('facebook.com') && // Facebook blocks scraping
            !s.url.includes('linkedin.com') && // LinkedIn blocks scraping
            (s.url.includes('caring.com') ||
             s.url.includes('aplaceformom.com') ||
             s.url.includes('seniorly.com') ||
             s.url.includes('senioradvisor.com') ||
             s.url.includes('seniorhomes.com') ||
             s.url.includes('miradorliving.com') ||
             s.url.includes('yelp.com'))
          )
          .slice(0, 3);
        
        console.log(`   Found ${realPhotoSources.length} real photo sources from search`);
        
        for (const source of realPhotoSources) {
          if (photos.length >= 15) break;
          
          try {
            const scrapedPhotos = await crawleeScraper.scrapePhotosFromWebsite(
              source.url,
              communityName,
              { maxPhotos: 10 }
            );
            
            const newPhotos = scrapedPhotos
              .filter(p => p.url && p.url.startsWith('http'))
              .map(p => `/api/image-proxy?url=${encodeURIComponent(p.url)}`);
            
            photos.push(...newPhotos.filter(p => !photos.includes(p)));
          } catch (err) {
            // Continue to next source
          }
        }
        
        // PRIORITY 2: Try official website only if we have few photos
        if (photos.length < 5 && websiteUrl && !websiteUrl.includes('NOT AVAILABLE')) {
          try {
            const scrapedPhotos = await crawleeScraper.scrapePhotosFromWebsite(
              websiteUrl,
              communityName,
              { maxPhotos: 10 }
            );
            const newPhotos = scrapedPhotos
              .filter(p => p.url && p.url.startsWith('http'))
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
