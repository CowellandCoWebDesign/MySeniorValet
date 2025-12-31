/**
 * DuckDuckGo HTML Search Service
 * 
 * FREE web search using DuckDuckGo's HTML interface
 * No API key required - uses HTML scraping with rate limiting
 * 
 * This replaces the web discovery portion of Perplexity
 */

import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface SearchOptions {
  maxResults?: number;
  region?: string;
  safeSearch?: 'strict' | 'moderate' | 'off';
}

export class DuckDuckGoSearchService {
  private readonly baseUrl = 'https://html.duckduckgo.com/html/';
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 1500; // Minimum 1.5 seconds between requests
  private readonly MAX_REQUESTS_PER_MINUTE = 20;
  
  private cache = new Map<string, { results: SearchResult[]; timestamp: number }>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
  
  constructor() {
    console.log('🦆 DuckDuckGo HTML Search Service initialized (FREE - no API key)');
  }
  
  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }
  
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_DELAY_MS) {
      const waitTime = this.MIN_DELAY_MS - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }
  
  private getCacheKey(query: string, options: SearchOptions): string {
    return `${query}:${options.region || 'wt-wt'}:${options.maxResults || 10}`;
  }
  
  private getFromCache(key: string): SearchResult[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      console.log(`📦 DuckDuckGo cache hit for: ${key.slice(0, 50)}...`);
      return cached.results;
    }
    return null;
  }
  
  private saveToCache(key: string, results: SearchResult[]): void {
    this.cache.set(key, { results, timestamp: Date.now() });
    
    // Cleanup old entries if cache gets too large
    if (this.cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.CACHE_TTL_MS) {
          this.cache.delete(k);
        }
      }
    }
  }
  
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { maxResults = 10, region = 'wt-wt', safeSearch = 'moderate' } = options;
    
    // Check cache first
    const cacheKey = this.getCacheKey(query, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.slice(0, maxResults);
    }
    
    await this.respectRateLimit();
    
    console.log(`🔍 DuckDuckGo searching: "${query.slice(0, 60)}..."`);
    
    try {
      const formData = new URLSearchParams();
      formData.append('q', query);
      formData.append('kl', region); // Region
      formData.append('kp', safeSearch === 'strict' ? '1' : safeSearch === 'off' ? '-2' : '-1');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://duckduckgo.com/',
          'Origin': 'https://duckduckgo.com'
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        throw new Error(`DuckDuckGo HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const results = this.parseResults(html);
      
      console.log(`✅ DuckDuckGo found ${results.length} results`);
      
      // Cache results
      this.saveToCache(cacheKey, results);
      
      return results.slice(0, maxResults);
    } catch (error: any) {
      console.error(`❌ DuckDuckGo search failed:`, error.message);
      throw error;
    }
  }
  
  private parseResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    
    // DuckDuckGo HTML results are in .result elements
    $('.result').each((_, element) => {
      const $el = $(element);
      
      // Get the title and URL from the result link
      const $link = $el.find('.result__a');
      const title = $link.text().trim();
      const href = $link.attr('href') || '';
      
      // Parse actual URL from DuckDuckGo redirect
      let url = href;
      if (href.includes('uddg=')) {
        const match = href.match(/uddg=([^&]+)/);
        if (match) {
          url = decodeURIComponent(match[1]);
        }
      }
      
      // Get snippet
      const snippet = $el.find('.result__snippet').text().trim();
      
      // Get source domain
      const source = $el.find('.result__url').text().trim();
      
      if (title && url && !url.startsWith('/')) {
        results.push({
          title,
          url,
          snippet,
          source: source || new URL(url).hostname
        });
      }
    });
    
    // Also check for alternative result format
    if (results.length === 0) {
      $('a.result__url').each((_, element) => {
        const $el = $(element);
        const parent = $el.closest('.result, .web-result, .results_links');
        
        const url = $el.attr('href') || $el.text().trim();
        const title = parent.find('h2, .result__title, .result__a').first().text().trim();
        const snippet = parent.find('.result__snippet, .snippet').text().trim();
        
        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet,
            source: new URL(url).hostname
          });
        }
      });
    }
    
    return results;
  }
  
  /**
   * Search specifically for senior living community information
   */
  async searchCommunity(
    communityName: string,
    location: string,
    intent: 'general' | 'pricing' | 'photos' | 'reviews' = 'general'
  ): Promise<SearchResult[]> {
    let query = `"${communityName}" ${location}`;
    
    switch (intent) {
      case 'pricing':
        query += ' pricing cost monthly rate fee';
        break;
      case 'photos':
        query += ' photos gallery virtual tour images';
        break;
      case 'reviews':
        query += ' reviews ratings testimonials';
        break;
      default:
        query += ' senior living assisted living community';
    }
    
    return this.search(query, { maxResults: 15 });
  }
  
  /**
   * Multi-query search for comprehensive coverage
   */
  async comprehensiveSearch(
    communityName: string,
    location: string
  ): Promise<{
    general: SearchResult[];
    pricing: SearchResult[];
    photos: SearchResult[];
    reviews: SearchResult[];
    allSources: string[];
  }> {
    console.log(`🔎 Comprehensive DuckDuckGo search for ${communityName}, ${location}`);
    
    // Run searches in sequence to respect rate limits
    const general = await this.searchCommunity(communityName, location, 'general');
    const pricing = await this.searchCommunity(communityName, location, 'pricing');
    const photos = await this.searchCommunity(communityName, location, 'photos');
    const reviews = await this.searchCommunity(communityName, location, 'reviews');
    
    // Collect unique sources
    const allSources = [...new Set([
      ...general.map(r => r.url),
      ...pricing.map(r => r.url),
      ...photos.map(r => r.url),
      ...reviews.map(r => r.url)
    ])];
    
    console.log(`✅ Found ${allSources.length} unique sources across all searches`);
    
    return {
      general,
      pricing,
      photos,
      reviews,
      allSources
    };
  }
  
  /**
   * Get image search results (limited in HTML version)
   */
  async searchImages(query: string): Promise<SearchResult[]> {
    // DuckDuckGo HTML doesn't support image search well
    // Return web results that might contain images
    const imageQuery = `${query} site:pinterest.com OR site:facebook.com OR site:yelp.com photos`;
    return this.search(imageQuery, { maxResults: 10 });
  }
  
  getStats(): { requestCount: number; cacheSize: number } {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size
    };
  }
}

// Singleton instance
export const duckDuckGoSearch = new DuckDuckGoSearchService();
