import { PerplexityAIService } from './perplexity-ai-service';

interface CachedCommunityData {
  marketData: {
    pricing?: string;
    website?: string;
    phone?: string;
    email?: string;
    availability?: string;
    description?: string;
    managementCompany?: string;
  };
  reviews: {
    googleReviews?: any[];
    yelpReviews?: any[];
    caringComReviews?: any[];
    averageRating?: number;
    totalReviewCount?: number;
    recentFeedback?: string;
  };
  inspections: {
    healthInspections?: any[];
    violations?: any[];
    lastInspectionDate?: string;
    complianceStatus?: string;
  };
  photos: string[];
  sources: string[];
  timestamp: number;
  communityId: string;
  communityName: string;
  location: string;
  // CRITICAL: Store the full raw Perplexity response for display
  rawPerplexityContent?: string;
}

class UnifiedPerplexityCache {
  private static instance: UnifiedPerplexityCache;
  private cache = new Map<string, { data: CachedCommunityData; timestamp: number }>();
  private CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private perplexityService: PerplexityAIService;

  constructor() {
    this.perplexityService = new PerplexityAIService();
  }

  static getInstance(): UnifiedPerplexityCache {
    if (!UnifiedPerplexityCache.instance) {
      UnifiedPerplexityCache.instance = new UnifiedPerplexityCache();
    }
    return UnifiedPerplexityCache.instance;
  }

  async getComprehensiveCommunityData(
    communityId: string,
    communityName: string,
    location: string
  ): Promise<CachedCommunityData> {
    const cacheKey = `community_${communityId}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if fresh
    if (cached && cached.timestamp > Date.now() - this.CACHE_DURATION) {
      console.log(`📦 Returning cached data for ${communityName} (saved ${new Date(cached.timestamp).toLocaleString()})`);
      return cached.data;
    }

    console.log(`🔍 Fetching comprehensive data for ${communityName} in ${location}`);

    // ONE comprehensive query that gets EVERYTHING
    const comprehensiveQuery = `
For the senior living community "${communityName}" located in ${location}, provide comprehensive information including:

**PRICING & AVAILABILITY:**
- Current monthly rates for all care levels
- Entrance fees, deposits, and additional costs
- Current availability and waitlist status

**CONTACT INFORMATION:**
- Direct facility phone number (not referral services)
- Official website URL
- Email address
- Physical address

**REVIEWS & RATINGS:**
- Recent Google reviews with ratings
- Yelp reviews if available
- Caring.com feedback
- Family satisfaction scores

**HEALTH & SAFETY:**
- Recent health inspection results
- Any violations or citations
- Compliance status
- Safety ratings

**PHOTOS & VIRTUAL TOURS:**
- Links to facility photos
- Virtual tour availability
- Floor plans if available

**MANAGEMENT & STAFF:**
- Parent company or management group
- Staff credentials and certifications
- Staff-to-resident ratios

Format all information clearly with section headers.
`;

    try {
      // Make ONE comprehensive API call with structured output
      const response = await this.perplexityService.searchRealTime(
        comprehensiveQuery,
        `Comprehensive data for ${communityName}`
      );

      // Parse and structure the comprehensive response
      const structuredData = this.parseComprehensiveResponse(
        response,
        communityId,
        communityName,
        location
      );

      // Cache the comprehensive data
      this.cache.set(cacheKey, {
        data: structuredData,
        timestamp: Date.now()
      });

      console.log(`✅ Cached comprehensive data for ${communityName} - Next refresh: ${new Date(Date.now() + this.CACHE_DURATION).toLocaleString()}`);

      return structuredData;
    } catch (error) {
      console.error(`Failed to fetch comprehensive data for ${communityName}:`, error);
      
      // Return minimal data on error
      return {
        marketData: {},
        reviews: {},
        inspections: {},
        photos: [],
        sources: [],
        timestamp: Date.now(),
        communityId,
        communityName,
        location
      };
    }
  }

  private parseComprehensiveResponse(
    response: { summary: string; sources: string[]; images?: string[] },
    communityId: string,
    communityName: string,
    location: string
  ): CachedCommunityData {
    const content = response.summary;
    
    // Extract market data
    const marketData = {
      pricing: this.extractSection(content, 'PRICING'),
      website: this.extractWebsite(content),
      phone: this.extractPhone(content),
      email: this.extractEmail(content),
      availability: this.extractSection(content, 'AVAILABILITY'),
      description: this.extractDescription(content),
      managementCompany: this.extractSection(content, 'MANAGEMENT')
    };

    // Extract reviews
    const reviews = {
      googleReviews: this.extractGoogleReviews(content),
      yelpReviews: this.extractYelpReviews(content),
      caringComReviews: this.extractCaringReviews(content),
      averageRating: this.extractAverageRating(content),
      totalReviewCount: this.extractReviewCount(content),
      recentFeedback: this.extractSection(content, 'REVIEWS')
    };

    // Extract inspection data
    const inspections = {
      healthInspections: this.extractInspections(content),
      violations: this.extractViolations(content),
      lastInspectionDate: this.extractInspectionDate(content),
      complianceStatus: this.extractComplianceStatus(content)
    };

    return {
      marketData,
      reviews,
      inspections,
      photos: this.extractPhotosFromResponse(response) || [],
      sources: response.sources || [],
      timestamp: Date.now(),
      communityId,
      communityName,
      location,
      // CRITICAL: Store the full raw response for frontend display
      rawPerplexityContent: content
    };
  }

  private extractSection(content: string, sectionName: string): string | undefined {
    const regex = new RegExp(`\\*\\*${sectionName}[^\\*]*\\*\\*([^\\*]+)(?=\\*\\*|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : undefined;
  }

  private extractWebsite(content: string): string | undefined {
    const patterns = [
      /(?:website|site|url):\s*(https?:\/\/[^\s]+)/i,
      /\*\*OFFICIAL WEBSITE:\*\*\s*([^\s\n]+)/i,
      /(https?:\/\/[^\s]+\.(?:com|org|net|edu)[^\s]*)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractPhone(content: string): string | undefined {
    const patterns = [
      /(?:phone|tel|call):\s*([\d\-\(\)\s\.]+)/i,
      /\*\*CONTACT INFORMATION:\*\*[^\\*]*?([\d\-\(\)\s\.]+)/i,
      /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const phone = match[1].replace(/\D/g, '');
        // Filter out toll-free numbers
        if (phone.length === 10 && !phone.startsWith('800') && !phone.startsWith('877') && !phone.startsWith('888')) {
          return match[1];
        }
      }
    }
    return undefined;
  }

  private extractEmail(content: string): string | undefined {
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = content.match(emailPattern);
    return match ? match[1] : undefined;
  }

  private extractDescription(content: string): string {
    // Get first substantial paragraph
    const paragraphs = content.split('\n').filter(p => p.length > 50);
    return paragraphs[0] || content.substring(0, 200);
  }

  private extractGoogleReviews(content: string): any[] {
    // Parse Google review mentions
    const googleSection = content.match(/Google[^\\*]*?(\d+\.?\d*)[^\\*]*?stars?/i);
    if (googleSection) {
      return [{
        source: 'Google',
        rating: parseFloat(googleSection[1]),
        text: googleSection[0]
      }];
    }
    return [];
  }

  private extractYelpReviews(content: string): any[] {
    const yelpSection = content.match(/Yelp[^\\*]*?(\d+\.?\d*)[^\\*]*?stars?/i);
    if (yelpSection) {
      return [{
        source: 'Yelp',
        rating: parseFloat(yelpSection[1]),
        text: yelpSection[0]
      }];
    }
    return [];
  }

  private extractCaringReviews(content: string): any[] {
    const caringSection = content.match(/Caring\.com[^\\*]*?(\d+\.?\d*)[^\\*]*?stars?/i);
    if (caringSection) {
      return [{
        source: 'Caring.com',
        rating: parseFloat(caringSection[1]),
        text: caringSection[0]
      }];
    }
    return [];
  }

  private extractAverageRating(content: string): number | undefined {
    const ratingMatch = content.match(/(?:average|overall)[^\\*]*?(\d+\.?\d*)[^\\*]*?(?:stars?|rating)/i);
    return ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  }

  private extractReviewCount(content: string): number | undefined {
    const countMatch = content.match(/(\d+)\s*(?:reviews?|ratings?)/i);
    return countMatch ? parseInt(countMatch[1]) : undefined;
  }

  private extractInspections(content: string): any[] {
    const inspectionSection = this.extractSection(content, 'HEALTH');
    if (inspectionSection) {
      return [{
        date: new Date().toISOString(),
        summary: inspectionSection
      }];
    }
    return [];
  }

  private extractViolations(content: string): any[] {
    const violationMatches = content.match(/(?:violation|citation|deficiency)[^.]*\./gi);
    return violationMatches ? violationMatches.map(v => ({ description: v })) : [];
  }

  private extractInspectionDate(content: string): string | undefined {
    const dateMatch = content.match(/(?:inspection|inspected)[^\\*]*?(\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i);
    return dateMatch ? dateMatch[1] : undefined;
  }

  private extractComplianceStatus(content: string): string {
    if (content.toLowerCase().includes('no violation')) return 'Compliant';
    if (content.toLowerCase().includes('violation')) return 'Issues Found';
    if (content.toLowerCase().includes('compliant')) return 'Compliant';
    return 'Unknown';
  }

  private extractPhotosFromResponse(response: { summary: string; sources: string[]; images?: string[] }): string[] {
    const extractedPhotos = new Set<string>();
    
    // First add any images that were directly returned
    if (response.images && Array.isArray(response.images)) {
      response.images.forEach(img => extractedPhotos.add(img));
    }
    
    const text = response.summary;
    
    // Extract photo gallery links and image URLs from the text
    // Look for patterns like "photo gallery: URL" or "photos: URL"
    const photoLinkPatterns = [
      /(?:photos?|gallery|images?):\s*(https?:\/\/[^\s]+)/gi,
      /\*\*PHOTOS[^\*]*\*\*[^\n]*?(https?:\/\/[^\s]+)/gi,
      /photo gallery[^\n]*?(https?:\/\/[^\s]+)/gi
    ];
    
    for (const pattern of photoLinkPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          // These might be gallery pages, not direct images, but we'll include them
          extractedPhotos.add(match[1]);
        }
      }
    }
    
    // Look for direct image URLs in the text
    const imageUrlRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?/gi;
    const urlMatches = text.match(imageUrlRegex);
    if (urlMatches) {
      urlMatches.forEach(url => extractedPhotos.add(url.trim()));
    }
    
    // Look for markdown image syntax
    const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(text)) !== null) {
      if (match[1]) {
        extractedPhotos.add(match[1]);
      }
    }
    
    const photoArray = Array.from(extractedPhotos);
    if (photoArray.length > 0) {
      console.log(`📸 Extracted ${photoArray.length} photo URLs from comprehensive data`);
    }
    return photoArray;
  }

  // Clear cache for a specific community
  clearCommunityCache(communityId: string): void {
    const cacheKey = `community_${communityId}`;
    this.cache.delete(cacheKey);
    console.log(`🗑️ Cleared cache for community ${communityId}`);
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
    console.log('🗑️ Cleared all cached data');
  }

  // Get cache statistics
  getCacheStats(): { size: number; communities: string[] } {
    const communities = Array.from(this.cache.keys()).map(key => key.replace('community_', ''));
    return {
      size: this.cache.size,
      communities
    };
  }
}

export const unifiedPerplexityCache = UnifiedPerplexityCache.getInstance();
export default UnifiedPerplexityCache;