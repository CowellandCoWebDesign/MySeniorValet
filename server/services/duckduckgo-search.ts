/**
 * DuckDuckGo Lite Search Service
 * 
 * FREE web search using DuckDuckGo's Lite interface (more reliable)
 * No API key required - uses GET requests which work better than POST
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
  // Use lite.duckduckgo.com which is more reliable and less bot-detection
  private readonly baseUrl = 'https://lite.duckduckgo.com/lite/';
  private readonly fallbackUrl = 'https://html.duckduckgo.com/html/';
  
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  ];
  
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 2000; // 2 seconds between requests for safety
  private readonly MAX_REQUESTS_PER_MINUTE = 15;
  
  private cache = new Map<string, { results: SearchResult[]; timestamp: number }>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
  
  constructor() {
    console.log('🦆 DuckDuckGo Lite Search Service initialized (FREE - no API key)');
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
    // Only cache if we got results - don't cache empty responses
    if (results.length === 0) {
      console.log(`⚠️ Not caching empty DuckDuckGo results`);
      return;
    }
    
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
    const { maxResults = 10, region = 'wt-wt' } = options;
    
    // Check cache first
    const cacheKey = this.getCacheKey(query, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.slice(0, maxResults);
    }
    
    await this.respectRateLimit();
    
    console.log(`🔍 DuckDuckGo Lite searching: "${query.slice(0, 60)}..."`);
    
    // Try Lite endpoint first (GET request - more reliable)
    let results = await this.searchLite(query, region);
    
    // If lite fails, try fallback HTML endpoint
    if (results.length === 0) {
      console.log(`🔄 Trying DuckDuckGo HTML fallback...`);
      results = await this.searchHtml(query, region);
    }
    
    console.log(`✅ DuckDuckGo found ${results.length} results`);
    
    // Cache results (only if we got some)
    this.saveToCache(cacheKey, results);
    
    return results.slice(0, maxResults);
  }
  
  private async searchLite(query: string, region: string): Promise<SearchResult[]> {
    try {
      // Use GET request with query params - more reliable
      const params = new URLSearchParams({
        q: query,
        kl: region
      });
      
      const url = `${this.baseUrl}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.log(`⚠️ DuckDuckGo Lite HTTP ${response.status}`);
        return [];
      }
      
      const html = await response.text();
      
      // Diagnostic: Check for anti-bot markers
      if (html.includes('vqd') || html.includes('captcha') || html.includes('robot')) {
        console.log(`⚠️ DuckDuckGo anti-bot detection triggered`);
      }
      
      const results = this.parseLiteResults(html);
      
      // If no results, try parsing with alternative selectors
      if (results.length === 0) {
        return this.parseAlternativeFormat(html);
      }
      
      return results;
    } catch (error: any) {
      console.error(`❌ DuckDuckGo Lite error:`, error.message);
      return [];
    }
  }
  
  private parseAlternativeFormat(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    
    // Try various selectors that DuckDuckGo might use
    // Check for zero-result links table (current format)
    $('table.results-table tr, table tr').each((_, row) => {
      const $row = $(row);
      const links = $row.find('a[href^="http"]');
      
      links.each((__, link) => {
        const $link = $(link);
        const href = $link.attr('href') || '';
        const title = $link.text().trim();
        
        // Skip internal DDG links
        if (href.includes('duckduckgo.com') || title.length < 5) return;
        
        results.push({
          title,
          url: href,
          snippet: $row.text().replace(title, '').trim().slice(0, 200),
          source: this.extractDomain(href)
        });
      });
    });
    
    // Try finding any anchor with external href
    if (results.length === 0) {
      $('a[href^="http"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href') || '';
        const title = $el.text().trim();
        
        if (!href.includes('duckduckgo.com') && 
            !href.includes('duck.com') && 
            title.length > 10 &&
            !href.includes('javascript:') &&
            !href.includes('privacy')) {
          results.push({
            title,
            url: href,
            snippet: '',
            source: this.extractDomain(href)
          });
        }
      });
    }
    
    // Deduplicate
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    }).slice(0, 10);
  }
  
  private async searchHtml(query: string, region: string): Promise<SearchResult[]> {
    try {
      const formData = new URLSearchParams();
      formData.append('q', query);
      formData.append('kl', region);
      
      const response = await fetch(this.fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://duckduckgo.com/'
        },
        body: formData.toString()
      });
      
      if (!response.ok) {
        console.log(`⚠️ DuckDuckGo HTML HTTP ${response.status}`);
        return [];
      }
      
      const html = await response.text();
      return this.parseHtmlResults(html);
    } catch (error: any) {
      console.error(`❌ DuckDuckGo HTML error:`, error.message);
      return [];
    }
  }
  
  private parseLiteResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    
    // DuckDuckGo Lite has a simpler table-based format
    // Results are in tables with class "result-link" or within specific td elements
    
    // Method 1: Look for result links in tables
    $('a.result-link, td.result-link a').each((_, element) => {
      const $el = $(element);
      const title = $el.text().trim();
      const href = $el.attr('href') || '';
      
      if (title && href && href.startsWith('http')) {
        results.push({
          title,
          url: href,
          snippet: '',
          source: this.extractDomain(href)
        });
      }
    });
    
    // Method 2: Look for any external links in result rows
    if (results.length === 0) {
      $('table tr').each((_, row) => {
        const $row = $(row);
        const $link = $row.find('a').first();
        const href = $link.attr('href') || '';
        const title = $link.text().trim();
        
        // Skip DuckDuckGo internal links
        if (href && !href.includes('duckduckgo.com') && href.startsWith('http') && title.length > 5) {
          // Get snippet from the row text
          const rowText = $row.text().replace(title, '').trim();
          
          results.push({
            title,
            url: href,
            snippet: rowText.slice(0, 200),
            source: this.extractDomain(href)
          });
        }
      });
    }
    
    // Method 3: Extract from web_result divs (alternative Lite format)
    if (results.length === 0) {
      $('.web-result, .result').each((_, element) => {
        const $el = $(element);
        const $link = $el.find('a').first();
        const title = $link.text().trim();
        const href = $link.attr('href') || '';
        
        if (title && href && href.startsWith('http')) {
          results.push({
            title,
            url: href,
            snippet: $el.text().replace(title, '').trim().slice(0, 200),
            source: this.extractDomain(href)
          });
        }
      });
    }
    
    // Deduplicate by URL
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });
  }
  
  private parseHtmlResults(html: string): SearchResult[] {
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    
    // DuckDuckGo HTML results are in .result elements
    $('.result, .result__body').each((_, element) => {
      const $el = $(element);
      
      // Get the title and URL from the result link
      const $link = $el.find('.result__a, a.result-link').first();
      const title = $link.text().trim();
      let href = $link.attr('href') || '';
      
      // Parse actual URL from DuckDuckGo redirect
      if (href.includes('uddg=')) {
        const match = href.match(/uddg=([^&]+)/);
        if (match) {
          href = decodeURIComponent(match[1]);
        }
      }
      
      // Get snippet
      const snippet = $el.find('.result__snippet, .result-snippet').text().trim();
      
      if (title && href && href.startsWith('http')) {
        results.push({
          title,
          url: href,
          snippet,
          source: this.extractDomain(href)
        });
      }
    });
    
    return results;
  }
  
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
  
  /**
   * Search with multiple query variations for better results
   */
  async searchWithVariations(communityName: string, city: string, state: string): Promise<SearchResult[]> {
    const queries = [
      `"${communityName}" ${city} ${state} senior living`,
      `${communityName} ${city} ${state} photos reviews`,
      `${communityName} assisted living ${city}`,
      `${communityName} pricing cost monthly`
    ];
    
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();
    
    for (const query of queries) {
      try {
        const results = await this.search(query, { maxResults: 5 });
        for (const result of results) {
          if (!seenUrls.has(result.url)) {
            seenUrls.add(result.url);
            allResults.push(result);
          }
        }
        
        // If we have enough results, stop
        if (allResults.length >= 10) break;
        
      } catch (error) {
        console.log(`⚠️ Query variation failed: ${query}`);
      }
    }
    
    return allResults;
  }
  
  /**
   * Search specifically for community photos
   */
  async searchForPhotos(communityName: string, city: string, state: string): Promise<SearchResult[]> {
    const photoQueries = [
      `${communityName} ${city} photos images`,
      `${communityName} senior living gallery`,
      `site:seniorliving.org ${communityName}`,
      `site:aplaceformom.com ${communityName}`
    ];
    
    const results: SearchResult[] = [];
    
    for (const query of photoQueries) {
      try {
        const searchResults = await this.search(query, { maxResults: 3 });
        results.push(...searchResults);
        if (results.length >= 5) break;
      } catch {
        continue;
      }
    }
    
    return results;
  }
  
  /**
   * Search for community pricing info
   */
  async searchForPricing(communityName: string, city: string, state: string): Promise<SearchResult[]> {
    const pricingQueries = [
      `${communityName} ${city} pricing cost monthly rent`,
      `${communityName} how much does it cost`,
      `site:caring.com ${communityName} ${city}`
    ];
    
    const results: SearchResult[] = [];
    
    for (const query of pricingQueries) {
      try {
        const searchResults = await this.search(query, { maxResults: 3 });
        results.push(...searchResults);
        if (results.length >= 5) break;
      } catch {
        continue;
      }
    }
    
    return results;
  }
  
  getStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.size,
      lastRequestTime: this.lastRequestTime
    };
  }
}

// Singleton instance
export const duckDuckGoSearch = new DuckDuckGoSearchService();
