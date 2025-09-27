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
      const structuredData = await this.parseComprehensiveResponse(
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

  private async parseComprehensiveResponse(
    response: { summary: string; sources: string[]; images?: string[] },
    communityId: string,
    communityName: string,
    location: string
  ): Promise<CachedCommunityData> {
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
      photos: await this.extractPhotosFromResponse(response, communityName, location) || [],
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

  private async extractPhotosFromResponse(
    response: { summary: string; sources: string[]; images?: string[] },
    communityName: string,
    location: string
  ): Promise<string[]> {
    const extractedPhotos: string[] = [];
    
    // First add any images that were directly returned by Perplexity
    if (response.images && Array.isArray(response.images)) {
      response.images.forEach((img: any) => {
        // Normalize various image formats to strings
        let imageUrl: string | null = null;
        
        if (typeof img === 'string') {
          imageUrl = img;
        } else if (img?.imageUrl && typeof img.imageUrl === 'string') {
          imageUrl = img.imageUrl;
        } else if (img?.url && typeof img.url === 'string') {
          imageUrl = img.url;
        }
        
        // Only process valid HTTP URLs
        if (imageUrl && imageUrl.includes('http')) {
          extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`);
        }
      });
    }
    
    // ALWAYS do a comprehensive photo search to find as many photos as possible
    console.log(`🔍 Performing unrestricted web-wide photo search for ${communityName}...`);
    
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      console.log('No Perplexity API key for photo search');
      return extractedPhotos;
    }
    
    try {
      const [city, state] = location.split(',').map(s => s.trim());
      
      // Try multiple search approaches to maximize photo discovery
      const searchQueries = [
        `${communityName} ${city} ${state} photos images gallery virtual tour`,
        `"${communityName}" site:facebook.com OR site:instagram.com OR site:yelp.com OR site:google.com/maps ${city} ${state}`,
        `${communityName} senior living nursing home assisted living ${city} ${state} exterior interior photos`
      ];
      
      for (const searchQuery of searchQueries) {
        console.log(`🔎 Trying photo search: ${searchQuery}`);
        
        const photoSearchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content: `You are an unrestricted web crawler that finds ALL photos from ANYWHERE on the internet. Search without any limitations across: Google Images, Bing Images, Yahoo Images, DuckDuckGo, Facebook, Instagram, Twitter, Pinterest, LinkedIn, Yelp, TripAdvisor, Google Maps, Google Business, Apple Maps, MapQuest, OpenStreetMap, Zillow, Redfin, Trulia, Apartments.com, senior living directories (A Place for Mom, Caring.com, SeniorLiving.org, SeniorAdvisor.com, AssistedLiving.com), healthcare sites, government databases, inspection reports, news websites, local newspapers, community newsletters, blogs, personal websites, church bulletins, local business directories, Chamber of Commerce sites, YouTube thumbnails, Vimeo, virtual tour platforms, real estate MLS listings, property management sites, construction company portfolios, architectural firm websites, and literally ANY other website that might have photos. Find and return EVERY SINGLE photo URL you can discover, regardless of the source.`
              },
              {
                role: 'user',
                content: `${searchQuery}\n\nFind ALL photos of this location from anywhere on the internet. Return the direct image URLs (not page URLs). Include:\n- Official facility photos\n- User-submitted photos from reviews\n- Street view and satellite images\n- Photos from news articles and blogs\n- Social media photos\n- Historical photos\n- Construction or renovation photos\n- Photos from nearby businesses showing the building\n- Any other photos you can find\n\nSearch without restrictions and return every photo URL you find.`
              }
            ],
            temperature: 0.5, // Slightly higher for more creative searching
            max_tokens: 4000, // More tokens for more URLs
            return_images: true,
            search_depth: 'comprehensive',
            search_recency_filter: 'none',
            top_p: 0.95,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          })
        });
      
        if (photoSearchResponse.ok) {
          const photoData = await photoSearchResponse.json();
          
          // Check ALL possible locations where images might be returned
          const possibleImageFields = [
            photoData.images,
            photoData.provider_metadata?.images,
            photoData.choices?.[0]?.message?.images,
            photoData.choices?.[0]?.images,
            photoData.results?.images,
            photoData.data?.images
          ];
          
          for (const imageField of possibleImageFields) {
            if (imageField && Array.isArray(imageField)) {
              console.log(`✅ Found ${imageField.length} photos in response`);
              imageField.forEach((img: any) => {
                let photoUrl = '';
                if (typeof img === 'string') {
                  photoUrl = img;
                } else if (img?.imageUrl) {
                  photoUrl = img.imageUrl;
                } else if (img?.url) {
                  photoUrl = img.url;
                } else if (img?.src) {
                  photoUrl = img.src;
                } else if (img?.image_url) {
                  photoUrl = img.image_url;
                }
                
                if (photoUrl && photoUrl.includes('http')) {
                  extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photoUrl)}`);
                }
              });
            }
          }
          
          // Also extract URLs from the text content if present
          const textContent = photoData.choices?.[0]?.message?.content || photoData.content || '';
          const imageUrlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp|bmp|svg|JPG|JPEG|PNG)/gi;
          const foundUrls = textContent.match(imageUrlRegex) || [];
          foundUrls.forEach(url => {
            extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(url)}`);
          });
          
          if (extractedPhotos.length > 5) {
            console.log(`🎉 Found ${extractedPhotos.length} photos, stopping search`);
            break;
          }
        }
      }
    } catch (searchError) {
      console.log(`Comprehensive photo search failed:`, searchError);
    }
    
    const photoArray = Array.from(new Set(extractedPhotos)); // Remove duplicates
    if (photoArray.length > 0) {
      console.log(`📸 Total ${photoArray.length} unique photo URLs for ${communityName}`);
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