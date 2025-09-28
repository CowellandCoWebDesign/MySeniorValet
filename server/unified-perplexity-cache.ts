import { PerplexityAIService } from './perplexity-ai-service';
import { cheerioPhotoScraper } from './services/cheerio-photo-scraper';

interface CachedCommunityData {
  marketData: {
    pricing?: string;
    website?: string;
    phone?: string;
    email?: string;
    availability?: string;
    description?: string;
    managementCompany?: string;
    virtualTourUrl?: string;
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
  private CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days default
  private FEATURED_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for featured communities
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
    location: string,
    isFeatured: boolean = false,
    forceRefresh: boolean = false
  ): Promise<CachedCommunityData> {
    const cacheKey = `community_${communityId}`;
    
    // If forceRefresh is requested, clear the cache entry first
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for ${communityName} - clearing cache`);
      this.cache.delete(cacheKey);
    }
    
    const cached = this.cache.get(cacheKey);
    
    // Use shorter cache duration for featured communities (24 hours instead of 7 days)
    const cacheDuration = isFeatured ? this.FEATURED_CACHE_DURATION : this.CACHE_DURATION;
    const cacheLabel = isFeatured ? '24 hours (featured)' : '7 days';

    // Return cached data if fresh and not forcing refresh
    if (cached && cached.timestamp > Date.now() - cacheDuration) {
      // Check if cached data is incomplete (failure detection)
      const isIncomplete = !cached.data.rawPerplexityContent || 
                          cached.data.rawPerplexityContent.length < 100 ||
                          cached.data.rawPerplexityContent.includes('temporarily unavailable');
      
      if (isIncomplete) {
        console.log(`⚠️ Cached data for ${communityName} appears incomplete - will refresh`);
        this.cache.delete(cacheKey);
      } else {
        console.log(`📦 Returning cached data for ${communityName} (saved ${new Date(cached.timestamp).toLocaleString()}, cache: ${cacheLabel})`);
        return cached.data;
      }
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

      // Check if response is complete before caching
      const isCompleteResponse = 
        structuredData.rawPerplexityContent && 
        structuredData.rawPerplexityContent.length > 100 &&
        !structuredData.rawPerplexityContent.includes('temporarily unavailable') &&
        !structuredData.rawPerplexityContent.toLowerCase().includes('no information found') &&
        !structuredData.rawPerplexityContent.toLowerCase().includes('unable to find');
      
      if (isCompleteResponse) {
        // Cache the comprehensive data with full duration
        this.cache.set(cacheKey, {
          data: structuredData,
          timestamp: Date.now()
        });
        const cacheLabel = isFeatured ? '24 hours (featured)' : '7 days';
        console.log(`✅ Cached complete response for ${communityName} (cache: ${cacheLabel})`);
      } else {
        // Cache incomplete responses for only 5 minutes to allow retry
        console.log(`⚠️ Response appears incomplete for ${communityName} - caching for 5 minutes only`);
        this.cache.set(cacheKey, {
          data: structuredData,
          timestamp: Date.now() - this.CACHE_DURATION + (5 * 60 * 1000) // Cache for 5 minutes
        });
      }
      const nextRefresh = Date.now() + cacheDuration;
      console.log(`✅ Cached comprehensive data for ${communityName} (${cacheLabel}) - Next refresh: ${new Date(nextRefresh).toLocaleString()}`);

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
    
    // Extract market data with enhanced pricing extraction
    const marketData = {
      pricing: this.extractEnhancedPricing(content),
      website: this.extractWebsite(content),
      phone: this.extractPhone(content),
      email: this.extractEmail(content),
      availability: this.extractSection(content, 'AVAILABILITY'),
      description: this.extractDescription(content),
      managementCompany: this.extractSection(content, 'MANAGEMENT'),
      virtualTourUrl: this.extractVirtualTourUrl(content, response.sources)
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
  
  private extractEnhancedPricing(content: string): any {
    const pricingSection = this.extractSection(content, 'PRICING') || 
                          this.extractSection(content, 'CURRENT PRICING') || '';
    
    const pricing: any = {
      general: pricingSection,
      studio: undefined,
      oneBedroom: undefined, 
      twoBedroom: undefined
    };
    
    // Look for specific unit type pricing patterns
    const patterns = [
      // Pattern: Studio: $X,XXX - $X,XXX
      { type: 'studio', regex: /\bstudio\b[^$]*?(\$[\d,]+-?\$?[\d,]+|\$[\d,]+)/i },
      // Pattern: One Bedroom: $X,XXX - $X,XXX or 1BR: $X,XXX
      { type: 'oneBedroom', regex: /\b(?:one[\s-]?bedroom|1[\s-]?br|1[\s-]?bedroom)\b[^$]*?(\$[\d,]+-?\$?[\d,]+|\$[\d,]+)/i },
      // Pattern: Two Bedroom: $X,XXX - $X,XXX or 2BR: $X,XXX
      { type: 'twoBedroom', regex: /\b(?:two[\s-]?bedroom|2[\s-]?br|2[\s-]?bedroom)\b[^$]*?(\$[\d,]+-?\$?[\d,]+|\$[\d,]+)/i }
    ];
    
    const fullContent = content + ' ' + pricingSection;
    
    patterns.forEach(({ type, regex }) => {
      const match = fullContent.match(regex);
      if (match && match[1]) {
        pricing[type] = match[1].trim();
      }
    });
    
    // Also check for "Monthly Rates" or "rates range from" patterns
    const rateMatch = fullContent.match(/rates?.{0,30}(?:range)?[^$]*?(\$[\d,]+(?: to |\s?-\s?)\$[\d,]+)/i);
    if (rateMatch && !pricing.studio && !pricing.oneBedroom) {
      // Use as general pricing if no specific unit pricing found
      pricing.general = pricing.general || rateMatch[1];
    }
    
    return pricing;
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

  private extractVirtualTourUrl(content: string, sources: string[]): string | undefined {
    // Look for virtual tour URLs in the content
    const patterns = [
      /(?:virtual tour|3d tour|360 tour)[^\n]*?(https?:\/\/[^\s\n]+)/i,
      /(https?:\/\/(my\.)?matterport\.com\/show\/\?m=[\w-]+)/i,
      /(https?:\/\/www\.youvisit\.com\/tour\/[\w-]+)/i,
      /(https?:\/\/[\w-]+\.eyespy360\.com\/[\w-]+)/i,
      /(https?:\/\/kuula\.co\/share\/[\w-]+)/i,
      /(https?:\/\/[^\s]+(?:virtual-?tour|3d-?tour|360)[^\s]*)/i
    ];

    // First check the content
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const url = match[1] || match[0];
        if (url.startsWith('http')) {
          console.log(`🎬 Found 3D tour URL: ${url}`);
          return url;
        }
      }
    }

    // Also check the sources for tour providers
    const tourProviders = ['matterport.com', 'youvisit.com', 'eyespy360.com', 'kuula.co', 'virtual-tour', '3d-tour'];
    for (const source of sources) {
      if (tourProviders.some(provider => source.toLowerCase().includes(provider))) {
        console.log(`🎬 Found 3D tour source: ${source}`);
        return source;
      }
    }

    return undefined;
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
    
    // Smart photo filtering - show facility photos, exclude logos/icons
    const isValidCommunityPhoto = (url: string): boolean => {
      if (!url) return false;
      const urlLower = url.toLowerCase();
      
      // Always reject these file types
      if (urlLower.includes('.svg') || urlLower.includes('.ico')) {
        console.log(`❌ Rejecting vector/icon file: ${url.substring(0, 100)}...`);
        return false;
      }
      
      // STRONG REJECTION PATTERNS - definitely not facility photos
      const strongRejectPatterns = [
        // Logo/Icon indicators
        'logo', 'icon', 'badge', 'button', 'avatar', 'favicon',
        'brand', 'symbol', 'emblem', 'seal', 'crest', 'mark',
        // Technical/UI elements
        'spinner', 'loader', 'placeholder', 'thumbnail', 'sprite',
        // Social media profile pics
        'profile-pic', 'profile_pic', 'profilepic', 'user-avatar',
        // Ads and banners
        'banner', 'advertisement', 'ad-', 'promo',
        // Graphics and illustrations
        'illustration', 'cartoon', 'clipart', 'drawing'
      ];
      
      // Check for strong rejection patterns
      for (const pattern of strongRejectPatterns) {
        if (urlLower.includes(pattern)) {
          console.log(`❌ Rejecting logo/icon/graphic: ${url.substring(0, 100)}...`);
          return false;
        }
      }
      
      // POSITIVE INDICATORS - likely facility photos
      const positivePatterns = [
        // Building/facility terms
        'facility', 'building', 'exterior', 'interior', 'entrance',
        'lobby', 'reception', 'hallway', 'corridor', 
        // Room types
        'room', 'bedroom', 'bathroom', 'dining', 'kitchen',
        'lounge', 'library', 'chapel', 'gym', 'fitness',
        'activity', 'recreation', 'therapy', 'salon',
        // Amenities
        'garden', 'patio', 'courtyard', 'pool', 'grounds',
        'amenity', 'amenities', 'outdoor', 'indoor',
        // Care-related
        'resident', 'senior', 'living', 'care', 'nursing',
        'assisted', 'memory', 'alzheimer', 'dementia',
        // Tours and galleries
        'tour', 'gallery', 'photo', 'image', 'picture',
        'view', 'community', 'home'
      ];
      
      // Check if URL contains positive indicators
      const hasPositiveIndicator = positivePatterns.some(pattern => urlLower.includes(pattern));
      
      // Check if it's from a known good source
      const goodSources = [
        'seniorliving', 'assistedliving', 'nursinghome',
        'caring.com', 'aplaceformom', 'senioradvisor',
        'seniorhousing', 'retirement'
      ];
      const fromGoodSource = goodSources.some(source => urlLower.includes(source));
      
      // MODERATE REJECTION - only reject if no positive indicators
      const moderateRejectPatterns = [
        'headshot', 'portrait', 'staff', 'team', 'employee',
        'manager', 'director', 'executive', 'realtor', 'agent'
      ];
      
      // Check for staff/people photos
      const hasModerateReject = moderateRejectPatterns.some(pattern => urlLower.includes(pattern));
      
      // Decision logic
      if (hasPositiveIndicator || fromGoodSource) {
        // Has positive indicators - likely a good photo
        console.log(`✅ Accepting facility photo: ${url.substring(0, 100)}...`);
        return true;
      } else if (hasModerateReject) {
        // Has moderate rejection patterns and no positive indicators
        console.log(`❌ Rejecting staff/people photo: ${url.substring(0, 100)}...`);
        return false;
      } else {
        // Default: accept if it's an image file
        const isImageFile = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(urlLower);
        if (isImageFile) {
          console.log(`✅ Accepting image (no negative indicators): ${url.substring(0, 100)}...`);
          return true;
        }
        console.log(`❌ Rejecting non-image or uncertain file: ${url.substring(0, 100)}...`);
        return false;
      }
    };
    
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
        
        // Only process valid HTTP URLs that pass our filter
        if (imageUrl && imageUrl.includes('http') && isValidCommunityPhoto(imageUrl)) {
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
            web_search_options: {
              search_context_size: 'low'  // Low context for 70% cost reduction
            },
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
                
                if (photoUrl && photoUrl.includes('http') && isValidCommunityPhoto(photoUrl)) {
                  extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photoUrl)}`);
                }
              });
            }
          }
          
          // Also extract URLs from the text content if present
          const textContent = photoData.choices?.[0]?.message?.content || photoData.content || '';
          const imageUrlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp|bmp|JPG|JPEG|PNG)/gi;
          const foundUrls = textContent.match(imageUrlRegex) || [];
          foundUrls.forEach((url: string) => {
            if (isValidCommunityPhoto(url)) {
              extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(url)}`);
            }
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
    
    // NEW: Use Playwright to scrape photos from sources that Perplexity found
    if (response.sources && response.sources.length > 0) {
      console.log(`🕷️ Using Playwright to scrape photos from ${response.sources.length} sources...`);
      
      // USER REQUEST: Scrape ALL sources for photos
      const websitesToScrape = response.sources.filter(source => {
        const url = source.toLowerCase();
        
        // Only skip PDFs and docs - scrape everything else
        const skipDomains = [
          '.pdf', '.doc', '.docx', 'youtube.com', 'wikipedia'
        ];
        
        if (skipDomains.some(domain => url.includes(domain))) {
          return false;
        }
        
        return true; // Accept ALL other sites
      }).slice(0, 10); // Increased to 10 sites for more photo discovery
      
      // Scrape each website for photos
      for (const websiteUrl of websitesToScrape) {
        try {
          console.log(`🌐 Scraping photos from: ${websiteUrl}`);
          const scrapedPhotos = await cheerioPhotoScraper.scrapePhotosFromWebsite(
            websiteUrl,
            communityName,
            {
              maxPhotos: 20,
              timeout: 15000 // 15 second timeout per site
            }
          );
          
          if (scrapedPhotos && scrapedPhotos.length > 0) {
            console.log(`📸 Found ${scrapedPhotos.length} photos from ${websiteUrl}`);
            
            // Add scraped photos to our collection
            scrapedPhotos.forEach(photo => {
              if (photo.url && !photo.url.startsWith('/api/image-proxy')) {
                // Ensure we use the image proxy for all external images
                extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photo.url)}`);
              } else if (photo.url) {
                extractedPhotos.push(photo.url);
              }
            });
          }
        } catch (scrapeError) {
          console.log(`⚠️ Failed to scrape ${websiteUrl}:`, scrapeError instanceof Error ? scrapeError.message : 'Unknown error');
        }
      }
    }
    
    const photoArray = Array.from(new Set(extractedPhotos)).slice(0, 50); // Remove duplicates and limit to 50
    if (photoArray.length > 0) {
      console.log(`📸 Total ${photoArray.length} unique photo URLs for ${communityName} (including scraped)`);
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

// Service caching interface similar to community caching
interface CachedServiceData {
  businessInfo: {
    name?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    hours?: string;
    description?: string;
    services?: string[];
  };
  photos: string[];
  sources: string[];
  timestamp: number;
  serviceId: string;
  serviceName: string;
  location?: string; // May be missing
  rawPerplexityContent?: string;
}

class ServiceEnrichmentCache {
  private static instance: ServiceEnrichmentCache;
  private cache = new Map<string, { data: CachedServiceData; timestamp: number }>();
  private CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private perplexityService: PerplexityAIService;

  constructor() {
    this.perplexityService = new PerplexityAIService();
  }

  static getInstance(): ServiceEnrichmentCache {
    if (!ServiceEnrichmentCache.instance) {
      ServiceEnrichmentCache.instance = new ServiceEnrichmentCache();
    }
    return ServiceEnrichmentCache.instance;
  }

  async getServiceEnrichment(
    serviceId: string,
    serviceName: string,
    location?: string, // Make location optional
    forceRefresh: boolean = false
  ): Promise<CachedServiceData> {
    const cacheKey = `service_${serviceId}`;
    
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for ${serviceName} - clearing cache`);
      this.cache.delete(cacheKey);
    }
    
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if fresh
    if (cached && cached.timestamp > Date.now() - this.CACHE_DURATION) {
      const isIncomplete = !cached.data.rawPerplexityContent || 
                          cached.data.rawPerplexityContent.length < 100;
      
      if (!isIncomplete) {
        console.log(`📦 Returning cached data for ${serviceName}`);
        return cached.data;
      }
    }

    console.log(`🔍 Fetching enrichment for service: ${serviceName}`);

    // Construct location string - be flexible if missing
    const searchLocation = location || 'United States'; // Fallback to broad location
    
    const query = `
For the business/service "${serviceName}" ${location ? `located in ${location}` : ''}, provide comprehensive information including:

**CONTACT INFORMATION:**
- Phone number (direct, not referral services)
- Official website URL
- Email address
- Physical address if available

**PHOTOS:**
- Links to business photos
- Storefront images
- Service photos
- Team photos

**BUSINESS DETAILS:**
- Operating hours
- Services offered
- Pricing information if available
- Business description

Note: If location is uncertain, search broadly and include any businesses with this name.
`;

    try {
      const response = await this.perplexityService.searchRealTime(query, serviceName);

      // Extract photos from various sources
      const photos: string[] = [];
      
      // Add images from Perplexity response
      if (response.images && response.images.length > 0) {
        photos.push(...response.images);
      }

      // Extract from response summary text
      const imageUrlRegex = /https?:\/\/[^\s\]\)"']+\.(jpg|jpeg|png|webp|gif)/gi;
      const foundUrls = (response.summary || '').match(imageUrlRegex) || [];
      photos.push(...foundUrls);

      // Extract business info from the summary (parse the structured response)
      const extractInfo = (text: string, pattern: RegExp): string | undefined => {
        const match = text.match(pattern);
        return match ? match[1].trim() : undefined;
      };

      const summary = response.summary || '';
      const website = extractInfo(summary, /\*\*OFFICIAL WEBSITE:\*\*\s*\n([^\n]+)/);
      const phone = extractInfo(summary, /phone[:\s]+([0-9-().\s]+)/i);
      const address = extractInfo(summary, /address[:\s]+([^\n]+)/i);
      
      // Try to scrape the website if found
      if (website && website !== 'Not found' && website.includes('http')) {
        try {
          const scrapedPhotos = await cheerioPhotoScraper.scrapePhotosFromWebsite(
            website,
            serviceName,
            { maxPhotos: 30, timeout: 10000 }
          );
          photos.push(...scrapedPhotos.map(p => p.url));
        } catch (error) {
          console.log(`Photo scraping failed for ${website}:`, error);
        }
      }

      const serviceData: CachedServiceData = {
        businessInfo: {
          name: serviceName,
          website: website && website !== 'Not found' ? website : undefined,
          phone: phone || undefined,
          address: address || undefined,
          description: summary.substring(0, 500)
        },
        photos: [...new Set(photos)].slice(0, 50), // Dedupe and limit
        sources: response.sources || [],
        timestamp: Date.now(),
        serviceId,
        serviceName,
        location: searchLocation,
        rawPerplexityContent: response.summary
      };

      // Cache the result
      this.cache.set(cacheKey, { data: serviceData, timestamp: Date.now() });
      console.log(`✅ Cached enrichment data for ${serviceName} (7 days)`);

      return serviceData;
    } catch (error) {
      console.error(`Failed to enrich service ${serviceName}:`, error);
      
      // Return minimal data on error
      return {
        businessInfo: { name: serviceName },
        photos: [],
        sources: [],
        timestamp: Date.now(),
        serviceId,
        serviceName,
        location: searchLocation
      };
    }
  }
}

export const unifiedPerplexityCache = UnifiedPerplexityCache.getInstance();
export const serviceEnrichmentCache = ServiceEnrichmentCache.getInstance();
export default UnifiedPerplexityCache;