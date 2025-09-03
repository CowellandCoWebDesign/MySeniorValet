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
    // Adjust query based on community type (childcare vs senior living)
    const careTypesStr = community.careTypes?.join(' ').toLowerCase() || '';
    const isChildcare = careTypesStr.includes('childcare') || 
                       careTypesStr.includes('daycare') ||
                       community.name?.toLowerCase().includes('child');
    
    const searchQuery = isChildcare 
      ? `${community.name} ${community.city} ${community.state} childcare daycare preschool website phone pricing photos 2025`
      : `${community.name} ${community.city} ${community.state} senior living website phone pricing photos 2025`;
    
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
    
    // Step 5: Get photos (try website first, no fallback to stock per Golden Data Rule)
    const careType = community.careTypes?.join(' ') || 'senior living';
    const photos = await this.getPhotos(extractedInfo.website, careType);
    
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
        console.log('Website scraping failed - will show loading state');
      }
    }
    
    // Never add stock/mock photos - follow Golden Data Rule
    // Empty photos array will trigger proper loading state in UI
    if (photos.length === 0) {
      console.log('📷 No authentic photos found - UI will show loading state');
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
        
        // Make URL absolute
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imgUrl = `${urlObj.origin}${imgUrl}`;
        }
        
        // Skip logos and icons
        if (!imgUrl.includes('logo') && !imgUrl.includes('icon') && !imgUrl.includes('.svg')) {
          photos.push(imgUrl);
        }
      }
      
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
    // IMPORTANT: Following Golden Data Rule - no mock/placeholder photos
    // Return empty array instead of fake stock photos
    // This allows the UI to show proper loading state until real photos are discovered
    console.log(`📷 No authentic photos found for ${careType} - returning empty array per Golden Data Rule`);
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
      photos: [], // No mock photos per Golden Data Rule
      searchResults: {
        summary: 'Search temporarily unavailable',
        sources: []
      }
    };
  }
}

// Export singleton instance
export const simpleEnrichmentService = new SimpleEnrichmentService();