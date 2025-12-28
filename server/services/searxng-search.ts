/**
 * 🔍 SearXNG Free Web Search Service
 * ===================================
 * Replaces paid Perplexity API with free SearXNG public instances
 * 
 * Features:
 * - Zero cost - uses public SearXNG instances
 * - Multiple instance failover for reliability
 * - JSON API with structured results
 * - Source attribution included
 */

interface SearXNGResult {
  url: string;
  title: string;
  content: string;
  engine: string;
  engines: string[];
  positions: number[];
  score: number;
  category: string;
  parsed_url?: string[];
  publishedDate?: string;
  img_src?: string;
  thumbnail?: string;
}

interface SearXNGResponse {
  query: string;
  number_of_results: number;
  results: SearXNGResult[];
  answers: string[];
  corrections: string[];
  infoboxes: any[];
  suggestions: string[];
  unresponsive_engines: string[];
}

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  source: string;
  score?: number;
  imageUrl?: string;
  publishedDate?: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  sources: string[];
  searchTime: number;
  instanceUsed: string;
}

export class SearXNGSearchService {
  // Updated list of reliable public SearXNG instances (verified Dec 2024)
  private publicInstances = [
    'https://search.mdosch.de',
    'https://searx.work',
    'https://search.demoniak.ch',
    'https://search.privacytools.io',
    'https://priv.au',
    'https://search.neet.works',
    'https://s.fraki.cz',
  ];
  
  private currentInstanceIndex = 0;
  private failedInstances = new Set<string>();
  private lastInstanceReset = Date.now();
  private instanceResetInterval = 5 * 60 * 1000; // Reset failed instances every 5 minutes

  constructor() {
    console.log('🔍 SearXNG Search Service initialized (FREE - no API key required)');
    console.log(`   Available instances: ${this.publicInstances.length}`);
  }

  private getNextInstance(): string {
    // Reset failed instances periodically
    if (Date.now() - this.lastInstanceReset > this.instanceResetInterval) {
      this.failedInstances.clear();
      this.lastInstanceReset = Date.now();
    }

    // Find next working instance
    for (let i = 0; i < this.publicInstances.length; i++) {
      const index = (this.currentInstanceIndex + i) % this.publicInstances.length;
      const instance = this.publicInstances[index];
      if (!this.failedInstances.has(instance)) {
        this.currentInstanceIndex = (index + 1) % this.publicInstances.length;
        return instance;
      }
    }

    // All instances failed, reset and try first one
    this.failedInstances.clear();
    this.currentInstanceIndex = 0;
    return this.publicInstances[0];
  }

  private markInstanceFailed(instance: string): void {
    this.failedInstances.add(instance);
    console.warn(`⚠️ SearXNG instance marked as failed: ${instance}`);
  }

  async search(
    query: string,
    options: {
      categories?: string;
      language?: string;
      timeRange?: 'day' | 'week' | 'month' | 'year';
      maxResults?: number;
    } = {}
  ): Promise<WebSearchResponse> {
    const startTime = Date.now();
    const maxAttempts = Math.min(3, this.publicInstances.length);
    let lastError: Error | null = null;
    let instanceUsed = '';

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const instance = this.getNextInstance();
      instanceUsed = instance;

      try {
        console.log(`🔍 SearXNG search (attempt ${attempt + 1}): "${query}" via ${instance}`);

        const params = new URLSearchParams({
          q: query,
          format: 'json',
        });

        if (options.categories) params.append('categories', options.categories);
        if (options.language) params.append('language', options.language);
        if (options.timeRange) params.append('time_range', options.timeRange);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${instance}/search?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/html',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': instance,
          },
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: SearXNGResponse = await response.json();
        const searchTime = Date.now() - startTime;

        console.log(`✅ SearXNG found ${data.results?.length || 0} results in ${searchTime}ms`);

        // Transform results to our standard format
        const results: SearchResult[] = (data.results || [])
          .slice(0, options.maxResults || 20)
          .map((r) => ({
            url: r.url,
            title: r.title,
            snippet: r.content || '',
            source: r.engines?.[0] || r.engine || 'unknown',
            score: r.score,
            imageUrl: r.img_src || r.thumbnail,
            publishedDate: r.publishedDate,
          }));

        // Extract unique sources
        const sources = [...new Set(results.map((r) => r.source))];

        return {
          query: data.query || query,
          results,
          totalResults: data.number_of_results || results.length,
          sources,
          searchTime,
          instanceUsed: instance,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ SearXNG attempt ${attempt + 1} failed (${instance}): ${lastError.message}`);
        this.markInstanceFailed(instance);
      }
    }

    // All attempts failed
    console.error(`❌ SearXNG search failed after ${maxAttempts} attempts`);
    throw new Error(`SearXNG search failed: ${lastError?.message || 'Unknown error'}`);
  }

  async searchForCommunityInfo(
    communityName: string,
    location?: string
  ): Promise<WebSearchResponse> {
    const query = location
      ? `"${communityName}" ${location} senior living community`
      : `"${communityName}" senior living community`;

    return this.search(query, {
      categories: 'general',
      maxResults: 15,
    });
  }

  async searchForPhotos(
    communityName: string,
    websiteUrl?: string
  ): Promise<WebSearchResponse> {
    const query = websiteUrl
      ? `site:${new URL(websiteUrl).hostname} photos OR gallery OR images`
      : `"${communityName}" senior living photos gallery`;

    return this.search(query, {
      categories: 'images',
      maxResults: 20,
    });
  }

  async searchForPricing(
    communityName: string,
    location?: string
  ): Promise<WebSearchResponse> {
    const query = location
      ? `"${communityName}" ${location} pricing cost monthly rates`
      : `"${communityName}" senior living pricing cost monthly rates`;

    return this.search(query, {
      categories: 'general',
      maxResults: 10,
    });
  }

  async searchForReviews(
    communityName: string,
    location?: string
  ): Promise<WebSearchResponse> {
    const query = location
      ? `"${communityName}" ${location} reviews ratings`
      : `"${communityName}" senior living reviews ratings`;

    return this.search(query, {
      categories: 'general',
      maxResults: 10,
    });
  }

  getInstanceStatus(): { available: number; failed: number; instances: string[] } {
    return {
      available: this.publicInstances.length - this.failedInstances.size,
      failed: this.failedInstances.size,
      instances: this.publicInstances.filter((i) => !this.failedInstances.has(i)),
    };
  }
}

export const searxngSearch = new SearXNGSearchService();
