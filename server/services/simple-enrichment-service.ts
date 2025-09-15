/**
 * Simplified Community Enrichment Service
 * Single responsibility: Enrich community data with AI verification and photos
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { perplexityService } from '../perplexity-ai-service';
import { ScalableCache } from '../infrastructure/cache';

// 5-minute cache for web enrichment data to prevent duplicate API calls
const enrichmentCache = new ScalableCache(1000, 5 * 60 * 1000); // 5 minutes

// Track enrichments in progress to prevent concurrent calls
const enrichmentInProgress = new Map<number, Promise<SimpleEnrichmentResult>>();

// Track cache statistics for debugging
let enrichmentStats = { 
  cacheHits: 0, 
  cacheMisses: 0, 
  inProgressDeduplicated: 0,
  totalRequests: 0,
  startTime: Date.now()
};

interface SimpleEnrichmentResult {
  communityId: number;
  communityName: string;
  
  // Core verification data
  verificationStatus: 'verified' | 'unverified' | 'partial';
  confidence: number;
  lastUpdated: string;
  
  // Found information
  officialWebsite?: string;
  phoneNumber?: string;
  pricing?: {
    min?: number;
    max?: number;
    source?: string;
  };
  
  // Photos - simple array
  photos: Array<{
    url: string;
    source: 'website' | 'stock' | 'pixabay';
    isAuthentic: boolean;
  }>;
  
  // Raw search data for transparency
  searchResults?: {
    summary: string;
    sources: string[];
    aiService?: string; // Which AI service was used
  };
  
  // Parallel AI results
  parallelSearchResults?: {
    perplexity?: {
      summary: string;
      sources: string[];
      images?: string[];
      aiService: string;
      error?: string;
    };
    claude?: {
      summary: string;
      sources: string[];
      images?: string[];
      aiService: string;
      error?: string;
    };
  };
}

export class SimpleEnrichmentService {
  
  /**
   * Main enrichment function - simple and direct with deduplication
   */
  async enrichCommunity(
    communityId: number,
    forceRefresh: boolean = false
  ): Promise<SimpleEnrichmentResult> {
    
    enrichmentStats.totalRequests++;
    const statsStr = `[Stats: ${enrichmentStats.cacheHits} hits, ${enrichmentStats.cacheMisses} misses, ${enrichmentStats.inProgressDeduplicated} dedup, ${enrichmentStats.totalRequests} total]`;
    
    // Step 1: Check if enrichment is already in progress for this community
    if (!forceRefresh && enrichmentInProgress.has(communityId)) {
      enrichmentStats.inProgressDeduplicated++;
      console.log(`⏳ Enrichment already in progress for community ${communityId}, waiting... ${statsStr}`);
      return enrichmentInProgress.get(communityId)!;
    }
    
    // Step 2: Check cache
    if (!forceRefresh) {
      const cached = enrichmentCache.get<SimpleEnrichmentResult>(`enrich:${communityId}`);
      if (cached) {
        enrichmentStats.cacheHits++;
        const ttl = (enrichmentCache as any).getTimeToLive ? (enrichmentCache as any).getTimeToLive(`enrich:${communityId}`) : 0;
        console.log(`✅ Using cached enrichment for community ${communityId}${ttl > 0 ? ` (expires in ${Math.round(ttl / 1000)}s)` : ''} ${statsStr}`);
        return cached;
      }
    }
    
    enrichmentStats.cacheMisses++;
    
    // Step 2: Get community from database
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
    if (!community) {
      throw new Error('Community not found');
    }
    
    console.log(`🔍 Starting simple enrichment for ${community.name} (ID: ${community.id}) ${statsStr}`);
    
    // Create a promise for this enrichment and track it
    const enrichmentPromise = this.performEnrichment(community);
    enrichmentInProgress.set(communityId, enrichmentPromise);
    
    try {
      const result = await enrichmentPromise;
      return result;
    } finally {
      // Clean up tracking
      enrichmentInProgress.delete(communityId);
    }
  }
  
  /**
   * Perform the actual enrichment - separated for better tracking
   */
  private async performEnrichment(community: any): Promise<SimpleEnrichmentResult> {
    // Search for community information using multi-tier fallback system
    const searchQuery = `${community.name} ${community.city} ${community.state} senior living website phone pricing photos 2025`;
    
    let searchResults;
    try {
      // Use the new multi-tier fallback system (FREE services first)
      searchResults = await perplexityService.searchRealTime(searchQuery);
      
      // If we got no results at all, return minimal data
      if (!searchResults || !searchResults.summary) {
        console.log('⚠️ All AI services failed - returning minimal data');
        return this.createMinimalResult(community);
      }
    } catch (error) {
      console.error('Search failed:', error);
      // Return minimal data if search fails
      return this.createMinimalResult(community);
    }
    
    // Step 4: Extract information from search results
    const extractedInfo = this.extractInformation(searchResults);
    
    // Step 5: Get photos from Perplexity search results and website
    const photos = await this.extractPhotosFromSearch(
      searchResults,
      extractedInfo.website,
      community.name
    );
    
    // Step 6: Build simple result with enhanced photo sources and AI service info
    const result: SimpleEnrichmentResult = {
      communityId: community.id,
      communityName: community.name,
      verificationStatus: extractedInfo.website ? 'verified' : 'partial',
      confidence: extractedInfo.website ? 85 : 50,
      lastUpdated: new Date().toISOString(),
      officialWebsite: extractedInfo.website,
      phoneNumber: extractedInfo.phone,
      pricing: extractedInfo.pricing,
      photos,
      searchResults: {
        summary: searchResults.summary || '',
        sources: searchResults.sources || [],
        aiService: searchResults.aiService || 'Unknown' // Include which AI service was used
      }
    };
    
    // Cache the result with 5-minute TTL
    enrichmentCache.set(`enrich:${community.id}`, result);
    
    const cacheEfficiency = enrichmentStats.totalRequests > 0 
      ? Math.round((enrichmentStats.cacheHits + enrichmentStats.inProgressDeduplicated) / enrichmentStats.totalRequests * 100)
      : 0;
    console.log(`✅ Enrichment complete: ${photos.length} photos, ${result.verificationStatus} status (cached for 5 minutes) - Cache efficiency: ${cacheEfficiency}%`);
    
    return result;
  }
  
  /**
   * Extract information from search results - simple pattern matching
   */
  private extractInformation(searchResults: any): any {
    const text = searchResults.summary || '';
    const sources = searchResults.sources || [];
    
    // Find website
    let website = null;
    const websiteMatch = text.match(/(?:website|site):\s*(https?:\/\/[^\s]+)/i);
    if (websiteMatch) {
      website = websiteMatch[1];
    } else {
      // Check sources for non-directory sites
      const directorySites = ['aplaceformom', 'caring.com', 'seniorly'];
      for (const source of sources) {
        if (!directorySites.some(site => source.includes(site))) {
          website = source;
          break;
        }
      }
    }
    
    // Find phone
    let phone = null;
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }
    
    // Find pricing
    let pricing = null;
    const priceMatch = text.match(/\$(\d{1,3},?\d{3})\s*(?:-|to)\s*\$?(\d{1,3},?\d{3})/);
    if (priceMatch) {
      pricing = {
        min: parseInt(priceMatch[1].replace(',', '')),
        max: parseInt(priceMatch[2].replace(',', '')),
        source: 'web search'
      };
    }
    
    return { website, phone, pricing };
  }
  
  /**
   * Validate if a string is a valid URL
   */
  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Extract photos from Perplexity search results
   */
  private async extractPhotosFromSearch(
    searchResults: any,
    website: string | null,
    communityName: string
  ): Promise<any[]> {
    const photos: any[] = [];
    const sources = searchResults.sources || [];
    
    // First, check if Perplexity returned images directly
    if (searchResults.images && Array.isArray(searchResults.images) && searchResults.images.length > 0) {
      console.log(`📸 Found ${searchResults.images.length} images from Perplexity AI`);
      searchResults.images.forEach((imageUrl: string) => {
        if (imageUrl && this.isValidUrl(imageUrl)) {
          photos.push({
            url: imageUrl,
            source: 'Perplexity AI',
            isAuthentic: true
          });
        }
      });
    }
    
    // If we already have photos from Perplexity, return them
    if (photos.length > 0) {
      console.log(`✅ Using ${photos.length} images from Perplexity AI search`);
      return photos.slice(0, 15); // Return up to 15 photos
    }
    
    // Otherwise, fall back to scraping from sources
    // Filter out non-URL sources (like "Claude AI Analysis" text)
    const validUrls = sources.filter((source: string) => this.isValidUrl(source));
    
    // Extract photos from valid URLs only
    for (const source of validUrls.slice(0, 3)) { // Check first 3 valid sources
      try {
        // Extract domain name for source attribution
        let sourceName = 'website';
        try {
          const url = new URL(source);
          sourceName = url.hostname.replace('www.', '');
        } catch (e) {
          // Keep default if URL parsing fails
        }
        
        // Try simple HTTP scraping for each source
        const sourcePhotos = await this.scrapeWebsitePhotos(source);
        if (sourcePhotos.length > 0) {
          photos.push(...sourcePhotos.slice(0, 5).map(url => ({
            url,
            source: sourceName, // Use actual website name
            isAuthentic: true
          })));
          console.log(`📸 Found ${sourcePhotos.length} photos from ${sourceName}`);
        }
      } catch (error) {
        console.log(`Could not scrape photos from source: ${error}`);
      }
    }
    
    // Also try the official website if it's a valid URL and different from sources
    if (website && this.isValidUrl(website) && !validUrls.includes(website)) {
      try {
        let websiteName = 'official-website';
        try {
          const url = new URL(website);
          websiteName = url.hostname.replace('www.', '');
        } catch (e) {
          // Keep default if URL parsing fails
        }
        
        const websitePhotos = await this.scrapeWebsitePhotos(website);
        if (websitePhotos.length > 0) {
          photos.push(...websitePhotos.slice(0, 5).map(url => ({
            url,
            source: websiteName,
            isAuthentic: true
          })));
          console.log(`📸 Found ${websitePhotos.length} photos from official website: ${websiteName}`);
        }
      } catch (error) {
        console.log('Could not scrape official website photos');
      }
    }
    
    // If still no photos, use placeholder photos instead of generating fake URLs
    if (photos.length === 0) {
      const placeholderPhotos = this.getPlaceholderPhotos(communityName);
      photos.push(...placeholderPhotos);
    }
    
    return photos.slice(0, 15); // Return up to 15 photos
  }
  
  /**
   * Get placeholder photos when no real photos are available
   */
  private getPlaceholderPhotos(communityName: string): any[] {
    // Use actual static images from the public folder or attached assets
    const placeholderUrls = [
      '/hero-senior-community.svg',
      '/hero-gentleman-stars.jpg',
      '/starry-night-hero.png',
      '/community-placeholder-1.jpg',
      '/community-placeholder-2.jpg',
      '/community-placeholder-3.jpg'
    ];
    
    // Return subset of placeholders to vary the display
    const startIdx = Math.abs(communityName.length % 3);
    const selectedPlaceholders = placeholderUrls.slice(startIdx, startIdx + 3);
    
    return selectedPlaceholders.map(url => ({
      url,
      source: 'placeholder',
      isAuthentic: false
    }));
  }
  
  /**
   * Simple website photo scraper with validation
   */
  private async scrapeWebsitePhotos(url: string): Promise<string[]> {
    // Validate URL before attempting to fetch
    if (!this.isValidUrl(url)) {
      console.log(`⚠️ Invalid URL for photo scraping: ${url}`);
      return [];
    }
    
    try {
      const response = await fetch(url, {
        timeout: 5000, // 5 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MSVBot/1.0)'
        }
      } as any);
      const html = await response.text();
      
      // Simple image extraction
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      const photos: string[] = [];
      let match;
      
      while ((match = imgRegex.exec(html)) !== null && photos.length < 10) {
        let imgUrl = match[1];
        
        // Skip invalid URLs like JavaScript variables or placeholders
        if (imgUrl.includes('item.') || 
            imgUrl.includes('{{') || 
            imgUrl.includes('${') ||
            !imgUrl.includes('.') ||
            imgUrl.startsWith('data:') ||
            imgUrl.includes('javascript:')) {
          continue;
        }
        
        // Make URL absolute
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imgUrl = `${urlObj.origin}${imgUrl}`;
        } else if (!imgUrl.startsWith('http')) {
          // Skip relative URLs that aren't paths
          continue;
        }
        
        // Skip logos, icons, error pages, and ensure it's a valid image format
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasValidExtension = validExtensions.some(ext => imgUrl.toLowerCase().includes(ext));
        
        // Filter out bad images
        const badPatterns = [
          'logo',
          'icon',
          '404',
          'error',
          'not-found',
          'missing',
          'placeholder',
          '/vi/ID/', // YouTube broken thumbnails
          '/app/themes/', // Theme resources
          '/dist/resources/', // Distribution resources
          'default-image',
          'no-image'
        ];
        
        const isGoodImage = !badPatterns.some(pattern => imgUrl.toLowerCase().includes(pattern.toLowerCase()));
        
        if (isGoodImage && !imgUrl.includes('.svg') && hasValidExtension) {
          photos.push(imgUrl);
        }
      }
      
      console.log(`📸 Scraped ${photos.length} valid photos from ${url}`);
      return photos;
    } catch (error) {
      console.error('Error scraping website:', error);
      return [];
    }
  }
  
  /**
   * Get stock photos based on care type
   * DISABLED: We don't want stock photos overriding real ones
   */
  private getStockPhotos(careType: string): any[] {
    // Return empty array - no stock photos
    // Real photos should come from Perplexity/directory sites
    return [];
  }
  
  /**
   * Create minimal result when search fails
   */
  private createMinimalResult(community: any): SimpleEnrichmentResult {
    return {
      communityId: community.id,
      communityName: community.name,
      verificationStatus: 'unverified',
      confidence: 0,
      lastUpdated: new Date().toISOString(),
      photos: [], // No fallback photos - keep it real
      searchResults: {
        summary: 'Search temporarily unavailable',
        sources: []
      }
    };
  }
}

// Export singleton instance
export const simpleEnrichmentService = new SimpleEnrichmentService();