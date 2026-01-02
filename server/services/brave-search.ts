/**
 * Brave Search API Service
 * 
 * FREE tier: 2000 queries/month
 * Much more reliable than DuckDuckGo scraping
 * 
 * Sign up at: https://brave.com/search/api/
 */

interface BraveSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface BraveWebResult {
  title: string;
  url: string;
  description: string;
  page_age?: string;
}

interface BraveSearchResponse {
  query: { original: string };
  web?: {
    results: BraveWebResult[];
  };
  mixed?: {
    main: Array<{ type: string; index: number }>;
  };
}

export class BraveSearchService {
  private readonly apiUrl = 'https://api.search.brave.com/res/v1/web/search';
  private apiKey: string | null = null;
  private requestCount = 0;
  private monthlyLimit = 2000;
  private lastResetDate = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  private cache = new Map<string, { results: BraveSearchResult[]; timestamp: number }>();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  constructor() {
    this.apiKey = process.env.BRAVE_SEARCH_API_KEY || null;
    if (this.apiKey) {
      console.log('🦁 Brave Search API initialized (FREE tier: 2000 queries/month)');
    } else {
      console.log('⚠️ Brave Search API key not configured - set BRAVE_SEARCH_API_KEY');
    }
  }
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  private checkAndResetMonthlyQuota(): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (currentMonth !== this.lastResetDate) {
      console.log('🔄 Monthly quota reset for Brave Search');
      this.requestCount = 0;
      this.lastResetDate = currentMonth;
    }
  }
  
  getRemainingQuota(): number {
    this.checkAndResetMonthlyQuota();
    return Math.max(0, this.monthlyLimit - this.requestCount);
  }
  
  private getCacheKey(query: string): string {
    return query.toLowerCase().trim();
  }
  
  private getFromCache(key: string): BraveSearchResult[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      console.log(`📦 Brave Search cache hit`);
      return cached.results;
    }
    return null;
  }
  
  private saveToCache(key: string, results: BraveSearchResult[]): void {
    if (results.length === 0) return;
    this.cache.set(key, { results, timestamp: Date.now() });
    
    // Cleanup old entries
    if (this.cache.size > 500) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.CACHE_TTL_MS) {
          this.cache.delete(k);
        }
      }
    }
  }
  
  async search(query: string, options: { count?: number; country?: string } = {}): Promise<BraveSearchResult[]> {
    if (!this.apiKey) {
      console.log('⚠️ Brave Search not configured');
      return [];
    }
    
    this.checkAndResetMonthlyQuota();
    
    // Check quota
    if (this.requestCount >= this.monthlyLimit) {
      console.log('⚠️ Brave Search monthly quota exhausted');
      return [];
    }
    
    // Check cache first
    const cacheKey = this.getCacheKey(query);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.slice(0, options.count || 10);
    }
    
    const { count = 10, country = 'us' } = options;
    
    try {
      console.log(`🦁 Brave Search: "${query.slice(0, 60)}..."`);
      
      const params = new URLSearchParams({
        q: query,
        count: count.toString(),
        country,
        search_lang: 'en',
        safesearch: 'moderate'
      });
      
      const response = await fetch(`${this.apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.apiKey
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Brave Search HTTP ${response.status}: ${response.statusText}`);
        return [];
      }
      
      this.requestCount++;
      console.log(`   Quota used: ${this.requestCount}/${this.monthlyLimit}`);
      
      const data: BraveSearchResponse = await response.json();
      
      const results: BraveSearchResult[] = [];
      
      if (data.web?.results) {
        for (const r of data.web.results) {
          results.push({
            title: r.title || '',
            url: r.url || '',
            snippet: r.description || '',
            source: this.extractDomain(r.url)
          });
        }
      }
      
      console.log(`✅ Brave Search found ${results.length} results`);
      
      // Cache results
      this.saveToCache(cacheKey, results);
      
      return results;
      
    } catch (error: any) {
      console.error('❌ Brave Search error:', error.message);
      return [];
    }
  }
  
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'unknown';
    }
  }
  
  getStats(): { configured: boolean; requestsThisMonth: number; remaining: number } {
    return {
      configured: this.isConfigured(),
      requestsThisMonth: this.requestCount,
      remaining: this.getRemainingQuota()
    };
  }
}

// Singleton instance
export const braveSearch = new BraveSearchService();
