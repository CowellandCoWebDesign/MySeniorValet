/**
 * Simplified Community Enrichment Service
 * Single responsibility: Enrich community data with AI verification and photos
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { perplexityService } from '../perplexity-ai-service';
import { ScalableCache } from '../infrastructure/cache';

// 7-day cache (like Google) for web enrichment data with proper attribution
const enrichmentCache = new ScalableCache(1000, 7 * 24 * 60 * 60 * 1000);

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
  };
}

export class SimpleEnrichmentService {
  
  /**
   * Main enrichment function - simple and direct
   */
  async enrichCommunity(
    communityId: number,
    forceRefresh: boolean = false
  ): Promise<SimpleEnrichmentResult> {
    
    // Step 1: Check cache
    if (!forceRefresh) {
      const cached = enrichmentCache.get<SimpleEnrichmentResult>(`enrich:${communityId}`);
      if (cached) {
        console.log(`✅ Using cached enrichment for community ${communityId}`);
        return cached;
      }
    }
    
    // Step 2: Get community from database
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
    if (!community) {
      throw new Error('Community not found');
    }
    
    console.log(`🔍 Starting simple enrichment for ${community.name}`);
    
    // Step 3: Search for community information (single Perplexity call)
    const searchQuery = `${community.name} ${community.city} ${community.state} senior living website phone pricing photos 2025`;
    
    let searchResults;
    try {
      searchResults = await perplexityService.searchRealTime(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
      // Return minimal data if search fails
      return this.createMinimalResult(community);
    }
    
    // Step 4: Extract information from search results
    const extractedInfo = this.extractInformation(searchResults);
    
    // Step 5: Get photos (try website first, fallback to stock)
    const photos = await this.getPhotos(extractedInfo.website, community.careType);
    
    // Step 6: Build simple result
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
        sources: searchResults.sources || []
      }
    };
    
    // Step 7: Cache the result
    enrichmentCache.set(`enrich:${communityId}`, result, 7 * 24 * 60 * 60 * 1000);
    
    console.log(`✅ Enrichment complete: ${photos.length} photos, ${result.verificationStatus} status`);
    
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
   * Get photos - try website scraping, fallback to stock
   */
  private async getPhotos(website: string | null, careType: string): Promise<any[]> {
    const photos = [];
    
    // Try to scrape website if we have one
    if (website) {
      try {
        const websitePhotos = await this.scrapeWebsitePhotos(website);
        photos.push(...websitePhotos.map(url => ({
          url,
          source: 'website' as const,
          isAuthentic: true
        })));
      } catch (error) {
        console.log('Website scraping failed, using stock photos');
      }
    }
    
    // If no photos found, add stock photos
    if (photos.length === 0) {
      const stockPhotos = this.getStockPhotos(careType);
      photos.push(...stockPhotos);
    }
    
    return photos;
  }
  
  /**
   * Simple website photo scraper
   */
  private async scrapeWebsitePhotos(url: string): Promise<string[]> {
    try {
      const response = await fetch(url);
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
        
        // Skip logos, icons, and ensure it's a valid image format
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const hasValidExtension = validExtensions.some(ext => imgUrl.toLowerCase().includes(ext));
        
        if (!imgUrl.includes('logo') && 
            !imgUrl.includes('icon') && 
            !imgUrl.includes('.svg') &&
            hasValidExtension) {
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
   */
  private getStockPhotos(careType: string): any[] {
    // Pixabay stock photos based on care type
    const stockUrls = [
      'https://cdn.pixabay.com/photo/2016/11/29/03/53/house-1867187_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/08/06/02/32/people-2587896_1280.jpg',
      'https://cdn.pixabay.com/photo/2015/07/11/23/00/elderly-841418_1280.jpg'
    ];
    
    return stockUrls.map(url => ({
      url,
      source: 'pixabay' as const,
      isAuthentic: false
    }));
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
      photos: this.getStockPhotos(community.careType || 'senior living'),
      searchResults: {
        summary: 'Search temporarily unavailable',
        sources: []
      }
    };
  }
}

// Export singleton instance
export const simpleEnrichmentService = new SimpleEnrichmentService();