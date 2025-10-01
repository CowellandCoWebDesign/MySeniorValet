/**
 * Simplified Community Enrichment Service with Two-Phase Verification
 * Phase 1: Identity Resolution - Verify we have the RIGHT community
 * Phase 2: Guarded Data Extraction - Only extract from verified sources
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { perplexityService } from '../perplexity-ai-service';
import { ScalableCache } from '../infrastructure/cache';

// 7-day cache for verified data, 1-hour for unverified (to retry)
const enrichmentCache = new ScalableCache(1000, 7 * 24 * 60 * 60 * 1000);

interface CommunityCandidate {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  sourceUrl?: string;
  nameMatchScore: number;
  isExactMatch: boolean;
  citations: string[];
}

interface SimpleEnrichmentResult {
  communityId: number;
  communityName: string;
  
  // Core verification data
  verificationStatus: 'verified' | 'unverified' | 'ambiguous' | 'partial';
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
    candidates?: CommunityCandidate[];
  };
  
  // Reason for ambiguous/unverified status
  verificationReason?: string;
}

export class SimpleEnrichmentService {
  
  // Directory sites we should never accept as "official" websites
  private readonly directorySites = [
    'aplaceformom', 'caring.com', 'seniorly', 'assistedlivingmagazine',
    'npaonline.org', 'senioradvisor.com', 'senioradvice.com', 'mapquest.com',
    'yelp.com', 'networkofcare.org', 'seniorliving.org', 'seniorlivingnearme.org',
    'yellowpages.com', 'facebook.com', 'google.com/maps'
  ];
  
  /**
   * Calculate name similarity score using token-based matching
   * Returns a score between 0 and 1
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    // Normalize names: lowercase, remove extra spaces, common abbreviations
    const normalize = (s: string) => s.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .replace(/\bassisted\s+living\b/gi, 'al')
      .replace(/\bsenior\s+living\b/gi, 'sl')
      .replace(/\bmemory\s+care\b/gi, 'mc')
      .trim();
    
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    // Exact match
    if (n1 === n2) return 1;
    
    // Token-based matching for better accuracy
    const tokens1 = new Set(n1.split(' '));
    const tokens2 = new Set(n2.split(' '));
    
    // Calculate Jaccard similarity
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    if (union.size === 0) return 0;
    
    const jaccardScore = intersection.size / union.size;
    
    // Check if one name contains the other (substring match)
    const containsScore = (n1.includes(n2) || n2.includes(n1)) ? 0.8 : 0;
    
    // Return the higher score
    return Math.max(jaccardScore, containsScore);
  }
  
  /**
   * Verify if a domain is a directory site
   */
  private isDirectorySite(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return this.directorySites.some(site => lowerUrl.includes(site));
  }
  
  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }
  
  /**
   * Phase 1: Identity Resolution - Find and verify the correct community
   */
  private async resolveIdentity(
    communityName: string, 
    city: string, 
    state: string,
    searchText: string
  ): Promise<{
    verifiedCandidate?: CommunityCandidate;
    allCandidates: CommunityCandidate[];
    verificationStatus: 'verified' | 'unverified' | 'ambiguous';
    reason?: string;
  }> {
    console.log(`🔍 Phase 1: Identity Resolution for "${communityName}" in ${city}, ${state}`);
    
    // Extract structured candidates from search results
    const candidates = await this.extractCandidates(searchText, communityName, city, state);
    
    if (candidates.length === 0) {
      return {
        allCandidates: [],
        verificationStatus: 'unverified',
        reason: 'No communities found in search results'
      };
    }
    
    // Sort by name match score
    candidates.sort((a, b) => b.nameMatchScore - a.nameMatchScore);
    
    const topCandidate = candidates[0];
    
    // Verification criteria
    const MIN_NAME_MATCH_SCORE = 0.85; // 85% similarity required
    const AMBIGUITY_THRESHOLD = 0.15; // If second candidate is within 15% of top
    
    // Check if top candidate meets minimum threshold
    if (topCandidate.nameMatchScore < MIN_NAME_MATCH_SCORE) {
      console.log(`❌ Top candidate "${topCandidate.name}" score ${topCandidate.nameMatchScore} below threshold ${MIN_NAME_MATCH_SCORE}`);
      return {
        allCandidates: candidates,
        verificationStatus: 'unverified',
        reason: `Best match "${topCandidate.name}" only ${Math.round(topCandidate.nameMatchScore * 100)}% similar to "${communityName}"`
      };
    }
    
    // Check for ambiguity (multiple similar matches)
    if (candidates.length > 1) {
      const secondCandidate = candidates[1];
      if (secondCandidate.nameMatchScore > topCandidate.nameMatchScore - AMBIGUITY_THRESHOLD) {
        console.log(`⚠️ Ambiguous: Multiple similar communities found`);
        return {
          allCandidates: candidates,
          verificationStatus: 'ambiguous',
          reason: `Multiple communities with similar names: "${topCandidate.name}" and "${secondCandidate.name}"`
        };
      }
    }
    
    // Additional validation: website should not be a directory
    if (topCandidate.website && this.isDirectorySite(topCandidate.website)) {
      topCandidate.website = undefined; // Don't use directory sites as official websites
    }
    
    console.log(`✅ Verified: "${topCandidate.name}" with ${Math.round(topCandidate.nameMatchScore * 100)}% confidence`);
    
    return {
      verifiedCandidate: topCandidate,
      allCandidates: candidates,
      verificationStatus: 'verified'
    };
  }
  
  /**
   * Extract candidate communities from search text
   */
  private async extractCandidates(
    searchText: string, 
    targetName: string,
    targetCity: string,
    targetState: string
  ): Promise<CommunityCandidate[]> {
    const candidates: CommunityCandidate[] = [];
    
    // First, check for structured Perplexity response format with **OFFICIAL WEBSITE:** and **CONTACT INFORMATION:**
    // Handle multiple formats - website URL might be on the next line or after colon
    const websiteSection = searchText.match(/\*\*OFFICIAL WEBSITE:\*\*[:\s]*([^\n]*(?:\n[^\*\n][^\n]*)?)/i);
    let website: string | undefined;
    if (websiteSection) {
      const websiteText = websiteSection[1].trim();
      // Extract URL from the text - could be standalone or embedded
      const urlMatch = websiteText.match(/(https?:\/\/[^\s\[\]()]+|www\.[^\s\[\]()]+\.[a-z]{2,}[^\s\[\]()]*)/i);
      if (urlMatch) {
        website = urlMatch[1].trim();
      }
    }
    
    // Look for phone in multiple formats including **CONTACT INFORMATION:** section
    const contactSection = searchText.match(/\*\*CONTACT INFORMATION:\*\*[:\s]*([^\*]+)/i);
    let phone: string | undefined;
    if (contactSection) {
      const contactText = contactSection[1];
      // Updated regex to handle formats like "- Phone (main): (530) 241-4444[1]"
      const phoneMatch = contactText.match(/[-•]?\s*Phone[^:]*:[:\s]*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/i);
      if (phoneMatch) {
        phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
      }
    }
    // Also try a simpler phone pattern if no contact section found
    if (!phone) {
      const phoneMatch = searchText.match(/Phone[^:]*:[:\s]*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/i);
      if (phoneMatch) {
        phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
      }
    }
    
    // If we find structured data, use it directly
    if ((website || phone) && searchText.toLowerCase().includes(targetName.toLowerCase())) {
      
      // Clean up website URL
      if (website) {
        website = website.replace(/[\[\]()]/g, '').trim();
        if (!website.startsWith('http')) {
          website = website.startsWith('www.') ? 'https://' + website : website;
        }
      }
      
      candidates.push({
        name: targetName,
        phone: phone,
        website: website,
        nameMatchScore: 1, // We know this is the right community from context
        isExactMatch: true,
        citations: []
      });
      
      console.log(`✅ Found structured data for ${targetName}: website=${website}, phone=${phone}`);
      return candidates; // Return early with high confidence match
    }
    
    // Fallback: Look for patterns that indicate community listings
    // Pattern 1: "Community Name" followed by phone or address
    const communityPatterns = [
      /(?:^|\n)([A-Z][A-Za-z\s&'-]+(?:Senior|Assisted|Memory|Care|Living|Village|Manor|Place|Gardens|Terrace|Lodge|Residence|Community)+[A-Za-z\s]*?)(?:\s*[-–]\s*|\s+at\s+|\s+in\s+)?([^\n]*?)(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d+\s+[A-Z]\w+)/gm,
      /(?:^|\n)(\d+\.\s+)?([A-Z][A-Za-z\s&'-]+(?:Senior|Assisted|Memory|Care|Living)+[A-Za-z\s]*?):\s*([^\n]+)/gm,
      /(?:^|\n)[-•*]\s*([A-Z][A-Za-z\s&'-]+(?:Senior|Assisted|Memory|Care|Living)+[A-Za-z\s]*?)(?:\s*[-–]\s*|\s+at\s+)?([^\n]+)/gm
    ];
    
    const foundNames = new Set<string>();
    
    for (const pattern of communityPatterns) {
      let match;
      while ((match = pattern.exec(searchText)) !== null) {
        let name = (match[2] || match[1] || '').trim();
        
        // Clean up the name
        name = name.replace(/^\d+\.\s*/, '') // Remove leading numbers
                  .replace(/[:\-–]$/, '') // Remove trailing punctuation
                  .trim();
        
        if (name && name.length > 5 && !foundNames.has(name.toLowerCase())) {
          foundNames.add(name.toLowerCase());
          
          // Extract additional info from the match
          const restOfLine = (match[3] || match[2] || '').trim();
          const phoneMatch = restOfLine.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          
          // Look for website mentions near this community name
          const contextStart = Math.max(0, match.index - 200);
          const contextEnd = Math.min(searchText.length, match.index + match[0].length + 200);
          const context = searchText.substring(contextStart, contextEnd);
          
          const websiteMatch = context.match(/(?:website|site|www|http)[:\s]*([^\s\n,]+\.[a-z]{2,6}[^\s\n,]*)/i);
          let website = websiteMatch ? websiteMatch[1] : undefined;
          
          // Clean up website URL
          if (website && !website.startsWith('http')) {
            website = 'https://' + website.replace(/^www\./, '');
          }
          
          // Calculate name similarity score
          const nameMatchScore = this.calculateNameSimilarity(targetName, name);
          
          candidates.push({
            name,
            phone: phoneMatch ? phoneMatch[0] : undefined,
            website,
            nameMatchScore,
            isExactMatch: nameMatchScore > 0.95,
            citations: [] // Would extract from sources if available
          });
        }
      }
    }
    
    // If no candidates found with patterns, try to extract from general mentions
    if (candidates.length === 0) {
      // Look for any mention of the target community name
      const targetNameLower = targetName.toLowerCase();
      const searchTextLower = searchText.toLowerCase();
      
      if (searchTextLower.includes(targetNameLower)) {
        // Extract phone number anywhere in the text
        const phoneMatch = searchText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        
        candidates.push({
          name: targetName,
          phone: phoneMatch ? phoneMatch[0] : undefined,
          nameMatchScore: 1, // Exact name found
          isExactMatch: true,
          citations: []
        });
      }
    }
    
    return candidates;
  }
  
  /**
   * Check if a phone number is a toll-free referral number
   */
  private isTollFreeNumber(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    // Check for US toll-free area codes: 800, 833, 844, 855, 866, 877, 888
    return /^1?(800|833|844|855|866|877|888)/.test(cleaned);
  }
  
  /**
   * Phase 2: Extract verified data with source validation
   */
  private async extractVerifiedData(
    verifiedCandidate: CommunityCandidate,
    searchText: string,
    sources: string[]
  ): Promise<{
    phone?: string;
    website?: string;
    pricing?: { min?: number; max?: number; source?: string };
    confidence: number;
  }> {
    console.log(`📊 Phase 2: Extracting verified data for "${verifiedCandidate.name}"`);
    
    let confidence = 0.6; // Base confidence - start higher for verified candidates
    
    // Website validation
    let verifiedWebsite = verifiedCandidate.website;
    if (verifiedWebsite && !this.isDirectorySite(verifiedWebsite)) {
      confidence += 0.2;
      console.log(`✅ Official website found: ${verifiedWebsite}`);
    } else {
      verifiedWebsite = undefined;
    }
    
    // Phone validation - reject toll-free numbers and require multi-source agreement
    let verifiedPhone = verifiedCandidate.phone;
    if (verifiedPhone) {
      // REJECT toll-free numbers (directory service numbers)
      if (this.isTollFreeNumber(verifiedPhone)) {
        console.log(`❌ Rejecting toll-free number ${verifiedPhone} - likely directory service`);
        verifiedPhone = undefined;
        confidence -= 0.1; // Small penalty for having a directory number
      } else {
        // Count how many sources mention this phone number
        const phoneOccurrences = (searchText.match(new RegExp(verifiedPhone.replace(/[^\d]/g, '\\D*'), 'g')) || []).length;
        
        // If we have structured data (from **CONTACT INFORMATION:**), trust it more
        const hasStructuredData = searchText.includes('**CONTACT INFORMATION:**') || searchText.includes('**OFFICIAL WEBSITE:**');
        
        if (hasStructuredData || phoneOccurrences >= 2 || (verifiedWebsite && sources.some(s => s.includes(this.extractDomain(verifiedWebsite))))) {
          confidence += 0.2;
          console.log(`✅ Phone ${verifiedPhone} verified (${phoneOccurrences} occurrences, not toll-free)`);
        } else if (phoneOccurrences >= 1) {
          // Still accept single-source phones but with lower confidence
          confidence += 0.1;
          console.log(`⚠️ Phone ${verifiedPhone} found but single source (confidence reduced)`);
        } else {
          console.log(`❌ Phone ${verifiedPhone} not found in text`);
          verifiedPhone = undefined;
        }
      }
    }
    
    // Extract pricing if available
    const pricingMatch = searchText.match(/\$?([\d,]+)\s*(?:[-–]\s*\$?([\d,]+))?\s*(?:\/month|monthly|per month)/i);
    let pricing;
    if (pricingMatch) {
      const minPrice = parseInt(pricingMatch[1].replace(/,/g, ''));
      const maxPrice = pricingMatch[2] ? parseInt(pricingMatch[2].replace(/,/g, '')) : minPrice;
      
      if (minPrice > 500 && minPrice < 20000) { // Sanity check
        pricing = { min: minPrice, max: maxPrice, source: 'web' };
        confidence += 0.1;
      }
    }
    
    return {
      phone: verifiedPhone,
      website: verifiedWebsite,
      pricing,
      confidence: Math.min(confidence, 1) // Cap at 100%
    };
  }
  
  /**
   * Main enrichment function with two-phase verification
   */
  async enrichCommunity(
    communityId: number,
    forceRefresh: boolean = false
  ): Promise<SimpleEnrichmentResult> {
    
    // Step 1: Get community from database
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
      
    if (!community) {
      throw new Error('Community not found');
    }
    
    // Step 2: Check cache (only for verified data)
    if (!forceRefresh) {
      // Database cache
      if (community.enrichmentData && community.enrichmentDataExpiry) {
        const expiryDate = new Date(community.enrichmentDataExpiry);
        const now = new Date();
        
        // Only use cached data if it was verified
        if (expiryDate > now && community.enrichmentData.verificationStatus === 'verified') {
          console.log(`✅ Using cached verified enrichment for ${community.name}`);
          return {
            communityId: community.id,
            communityName: community.name,
            verificationStatus: community.enrichmentData.verificationStatus,
            confidence: community.enrichmentData.confidence || 0.5,
            lastUpdated: community.enrichmentData.lastFetched || new Date().toISOString(),
            officialWebsite: community.enrichmentData.officialWebsite,
            phoneNumber: community.enrichmentData.phoneNumber,
            pricing: community.enrichmentData.pricing,
            photos: community.enrichmentData.photos || [],
            searchResults: community.enrichmentData.searchResults
          };
        }
      }
      
      // Memory cache
      const cached = enrichmentCache.get<SimpleEnrichmentResult>(`enrich:${communityId}`);
      if (cached && cached.verificationStatus === 'verified') {
        console.log(`✅ Using memory cached verified enrichment for ${communityId}`);
        return cached;
      }
    }
    
    console.log(`🔍 Starting two-phase enrichment for ${community.name}`);
    
    // Step 3: Search for community information
    const searchQuery = `"${community.name}" ${community.city} ${community.state} senior living assisted living contact information website phone address`;
    
    let searchResults;
    try {
      searchResults = await perplexityService.searchRealTime(searchQuery);
    } catch (error) {
      console.error('Search failed:', error);
      return this.createMinimalResult(community);
    }
    
    // Step 4: Phase 1 - Identity Resolution
    const identityResult = await this.resolveIdentity(
      community.name,
      community.city || '',
      community.state || '',
      searchResults.summary || ''
    );
    
    // If unverified or ambiguous, don't update database
    if (identityResult.verificationStatus !== 'verified') {
      const result: SimpleEnrichmentResult = {
        communityId: community.id,
        communityName: community.name,
        verificationStatus: identityResult.verificationStatus,
        confidence: 0.3,
        lastUpdated: new Date().toISOString(),
        photos: [],
        searchResults: {
          summary: searchResults.summary || '',
          sources: searchResults.sources || [],
          candidates: identityResult.allCandidates
        },
        verificationReason: identityResult.reason
      };
      
      // Cache for short time (1 hour) to retry later
      enrichmentCache.set(`enrich:${communityId}`, result, 60 * 60 * 1000);
      
      console.log(`⚠️ ${identityResult.verificationStatus}: ${identityResult.reason}`);
      return result;
    }
    
    // Step 5: Phase 2 - Extract verified data
    const verifiedCandidate = identityResult.verifiedCandidate!;
    const extractedData = await this.extractVerifiedData(
      verifiedCandidate,
      searchResults.summary || '',
      searchResults.sources || []
    );
    
    // Step 6: Get photos only from verified sources
    let photos: SimpleEnrichmentResult['photos'] = [];
    if (extractedData.website && !this.isDirectorySite(extractedData.website)) {
      try {
        const websitePhotos = await this.scrapeWebsitePhotos(extractedData.website);
        photos = websitePhotos.slice(0, 12).map(url => ({
          url,
          source: 'website' as const,
          isAuthentic: true
        }));
        console.log(`📸 Found ${photos.length} photos from official website`);
      } catch (error) {
        console.log('Could not scrape official website photos');
      }
    }
    
    // Step 7: Build final result
    const result: SimpleEnrichmentResult = {
      communityId: community.id,
      communityName: community.name,
      verificationStatus: 'verified',
      confidence: extractedData.confidence,
      lastUpdated: new Date().toISOString(),
      officialWebsite: extractedData.website,
      phoneNumber: extractedData.phone,
      pricing: extractedData.pricing,
      photos,
      searchResults: {
        summary: searchResults.summary || '',
        sources: searchResults.sources || [],
        candidates: identityResult.allCandidates
      }
    };
    
    // Step 8: Persistence guards - only save high-confidence verified data
    if (result.confidence >= 0.7) {
      // Check if we should overwrite existing data
      // Update phone only if: no current phone, or new phone is better AND not toll-free
      const currentPhoneIsTollFree = this.isTollFreeNumber(community.phone || '');
      const shouldUpdatePhone = currentPhoneIsTollFree || // Replace toll-free numbers
        (!community.phone || 
         (result.phoneNumber && !this.isTollFreeNumber(result.phoneNumber) && 
          result.confidence > (community.enrichmentData?.confidence || 0)));
      
      const shouldUpdateWebsite = !community.website || 
        (result.officialWebsite && !this.isDirectorySite(result.officialWebsite) && 
         result.confidence > (community.enrichmentData?.confidence || 0));
      
      // Update database with verified information
      const updateData: any = {
        enrichmentData: result,
        enrichmentDataExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastEnrichmentAttempt: new Date()
      };
      
      if (shouldUpdatePhone && result.phoneNumber) {
        updateData.phone = result.phoneNumber;
        console.log(`✅ Updating phone to verified: ${result.phoneNumber}`);
      }
      
      if (shouldUpdateWebsite && result.officialWebsite) {
        updateData.website = result.officialWebsite;
        console.log(`✅ Updating website to verified: ${result.officialWebsite}`);
      }
      
      await db
        .update(communities)
        .set(updateData)
        .where(eq(communities.id, communityId));
      
      // Cache for 7 days
      enrichmentCache.set(`enrich:${communityId}`, result, 7 * 24 * 60 * 60 * 1000);
    } else {
      console.log(`⚠️ Confidence ${result.confidence} too low, not updating database`);
      // Cache for 1 hour only
      enrichmentCache.set(`enrich:${communityId}`, result, 60 * 60 * 1000);
    }
    
    return result;
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
      photos: [],
      verificationReason: 'Search service unavailable'
    };
  }
  
  /**
   * Scrape photos from a website
   */
  private async scrapeWebsitePhotos(websiteUrl: string): Promise<string[]> {
    try {
      // Ensure URL has protocol
      let url = websiteUrl;
      if (!url.startsWith('http')) {
        url = 'https://' + url.replace(/^\/\//, '');
      }
      
      console.log(`🌐 Attempting to scrape photos from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`❌ Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const html = await response.text();
      
      // Extract image URLs - try multiple patterns
      const imageUrls: string[] = [];
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      
      while ((match = imgRegex.exec(html)) !== null) {
        let imgUrl = match[1];
        
        // Convert relative URLs to absolute
        if (imgUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
        } else if (!imgUrl.startsWith('http')) {
          const urlObj = new URL(url);
          imgUrl = `${urlObj.protocol}//${urlObj.host}/${imgUrl}`;
        }
        
        // Filter out small images, icons, tracking pixels
        if (!imgUrl.includes('pixel') && 
            !imgUrl.includes('icon') && 
            !imgUrl.includes('logo') &&
            !imgUrl.includes('1x1') &&
            !imgUrl.includes('.svg') &&
            !imgUrl.includes('blank.gif')) {
          imageUrls.push(imgUrl);
        }
      }
      
      console.log(`📸 Found ${imageUrls.length} potential photos from ${url}`);
      return imageUrls;
    } catch (error) {
      console.error(`Failed to scrape ${websiteUrl}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const simpleEnrichmentService = new SimpleEnrichmentService();