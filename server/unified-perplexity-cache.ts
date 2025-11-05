import { PerplexityAIService } from './perplexity-ai-service';
import { cheerioPhotoScraper } from './services/cheerio-photo-scraper';
import { MultiAIPhotoExtractor } from './services/multi-ai-photo-extractor';
import { db } from './db';
import { perplexityCache } from '../shared/schema';
import { eq, lt, and } from 'drizzle-orm';

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
  // Memory cache now stores expiration time to respect TTL
  private memoryCache = new Map<string, { data: CachedCommunityData; timestamp: number; expiresAt: number }>(); 
  private CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days default
  private FEATURED_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for featured communities
  private perplexityService: PerplexityAIService;

  constructor() {
    this.perplexityService = new PerplexityAIService();
    // Clean up expired cache entries on startup
    this.cleanupExpiredCache();
  }

  static getInstance(): UnifiedPerplexityCache {
    if (!UnifiedPerplexityCache.instance) {
      UnifiedPerplexityCache.instance = new UnifiedPerplexityCache();
    }
    return UnifiedPerplexityCache.instance;
  }

  // Clean up expired cache entries from database
  private async cleanupExpiredCache() {
    try {
      await db.delete(perplexityCache).where(lt(perplexityCache.expiresAt, new Date()));
      console.log('✅ Cleaned up expired cache entries');
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }

  // Save cache to both memory and database
  private async saveCacheToDatabase(
    cacheKey: string,
    data: CachedCommunityData,
    isFeatured: boolean = false
  ) {
    // Calculate expiration based on whether it's featured
    const cacheDuration = isFeatured ? this.FEATURED_CACHE_DURATION : this.CACHE_DURATION;
    const expiresAt = new Date(Date.now() + cacheDuration);
    
    // Save to memory cache with expiration time
    this.memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expiresAt: expiresAt.getTime() // Store as milliseconds for easy comparison
    });
    
    try {
      // Upsert to database (update if exists, insert if not)
      await db
        .insert(perplexityCache)
        .values({
          communityId: cacheKey,
          communityName: data.communityName,
          location: data.location,
          marketData: data.marketData || {},
          reviews: data.reviews || {},
          inspections: data.inspections || {},
          photos: data.photos || [],
          sources: data.sources || [],
          rawPerplexityContent: data.rawPerplexityContent,
          isFeatured,
          expiresAt,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: perplexityCache.communityId,
          set: {
            marketData: data.marketData || {},
            reviews: data.reviews || {},
            inspections: data.inspections || {},
            photos: data.photos || [],
            sources: data.sources || [],
            rawPerplexityContent: data.rawPerplexityContent,
            isFeatured,
            expiresAt,
            updatedAt: new Date()
          }
        });
      
      console.log(`💾 Saved to database cache: ${data.communityName} (expires: ${expiresAt.toISOString()})`);
    } catch (error) {
      console.error('Failed to save to database cache:', error);
    }
  }

  async getComprehensiveCommunityData(
    communityId: string,
    communityName: string,
    location: string,
    isFeatured: boolean = false,
    forceRefresh: boolean = false,
    websiteUrl?: string
  ): Promise<CachedCommunityData> {
    const cacheKey = `community_${communityId}`;
    
    // If forceRefresh is requested, clear the cache entry first
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for ${communityName} - clearing cache`);
      // Clear from both memory and database
      this.memoryCache.delete(cacheKey);
      await db.delete(perplexityCache).where(eq(perplexityCache.communityId, cacheKey));
    }
    
    // First check memory cache for speed (but validate expiration)
    const memoryCached = this.memoryCache.get(cacheKey);
    if (memoryCached && !forceRefresh) {
      const now = Date.now();
      if (memoryCached.expiresAt > now) {
        console.log(`⚡ Returning memory-cached data for ${communityName} (expires in ${Math.round((memoryCached.expiresAt - now) / (1000 * 60 * 60))} hours)`);
        return memoryCached.data;
      } else {
        // Memory cache expired, remove it
        console.log(`🧹 Memory cache expired for ${communityName}, removing from memory`);
        this.memoryCache.delete(cacheKey);
      }
    }
    
    // Check database cache
    if (!forceRefresh) {
      try {
        const [dbCached] = await db
          .select()
          .from(perplexityCache)
          .where(eq(perplexityCache.communityId, cacheKey))
          .limit(1);
        
        // Check if cache exists and is not expired
        if (dbCached && new Date(dbCached.expiresAt) > new Date()) {
          console.log(`📦 Returning database-cached data for ${communityName}`);
          const cachedData: CachedCommunityData = {
            marketData: dbCached.marketData as any || {},
            reviews: dbCached.reviews as any || {},
            inspections: dbCached.inspections as any || {},
            photos: dbCached.photos as string[] || [],
            sources: dbCached.sources || [],
            timestamp: dbCached.createdAt?.getTime() || Date.now(),
            communityId,
            communityName,
            location,
            rawPerplexityContent: dbCached.rawPerplexityContent || ''
          };
          
          // Store in memory cache for faster subsequent access with proper expiration
          this.memoryCache.set(cacheKey, {
            data: cachedData,
            timestamp: Date.now(),
            expiresAt: new Date(dbCached.expiresAt).getTime()
          });
          
          return cachedData;
        }
      } catch (error) {
        console.error(`Failed to read from database cache for ${communityName}:`, error);
      }
      
      if (websiteUrl) {
        // Special case: No cached data but we have a website URL from discovery
        // Run lightweight photo extraction without expensive Perplexity calls
        console.log(`🔍 No cached data for ${communityName} but website URL available - extracting photos only`);
        
        try {
          // Extract photos using the website URL without calling Perplexity
          const photos = await this.extractPhotosFromWebsite(websiteUrl, communityName, location);
          
          const lightweightData = {
            marketData: {},
            reviews: {},
            inspections: {},
            photos: photos,
            sources: [websiteUrl],
            timestamp: Date.now(),
            communityId,
            communityName,
            location,
            rawPerplexityContent: 'Photos extracted from community website. Click "Search for Market Data & Photos" for comprehensive information.'
          };
          
          // Cache the lightweight data with photos
          await this.saveCacheToDatabase(cacheKey, lightweightData, isFeatured);
          console.log(`📸 Cached ${photos.length} photos for ${communityName} from website`);
          
          return lightweightData;
        } catch (error) {
          console.error(`Failed to extract photos from website for ${communityName}:`, error);
          // Fall through to return empty data if photo extraction fails
        }
      }
      
      // No cached data and no website URL - return empty data
      console.log(`⚠️ No cached data for ${communityName} - returning empty (auto-fetch disabled)`);
      return {
        marketData: {},
        reviews: {},
        inspections: {},
        photos: [],
        sources: [],
        timestamp: Date.now(),
        communityId,
        communityName,
        location,
        rawPerplexityContent: 'No cached data available. Click "Search for Market Data & Photos" to fetch fresh data.'
      };
    }

    // Only reaches here if forceRefresh is true (manual user action)
    console.log(`👤 User-initiated fetch for ${communityName} in ${location}`);
    if (websiteUrl) {
      console.log(`📌 Using website URL for enhanced search: ${websiteUrl}`);
    }

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
      // Make ONE comprehensive API call (only when user manually requests)
      const response = await this.perplexityService.searchRealTime(
        comprehensiveQuery,
        `User-requested data for ${communityName}`
      );

      // Parse and structure the comprehensive response
      const structuredData = await this.parseComprehensiveResponse(
        response,
        communityId,
        communityName,
        location,
        websiteUrl
      );

      // Check if response is complete before caching
      const isCompleteResponse = 
        structuredData.rawPerplexityContent && 
        structuredData.rawPerplexityContent.length > 100 &&
        !structuredData.rawPerplexityContent.includes('temporarily unavailable') &&
        !structuredData.rawPerplexityContent.toLowerCase().includes('no information found') &&
        !structuredData.rawPerplexityContent.toLowerCase().includes('unable to find');
      
      // Calculate cache duration and label
      const cacheDuration = isFeatured ? this.FEATURED_CACHE_DURATION : this.CACHE_DURATION;
      const cacheLabel = isFeatured ? '24 hours (featured)' : '7 days';
      
      if (isCompleteResponse) {
        // Cache the comprehensive data with full duration
        await this.saveCacheToDatabase(cacheKey, structuredData, isFeatured);
        console.log(`✅ Cached complete response for ${communityName} (cache: ${cacheLabel})`);
      } else {
        // Cache incomplete responses for only 5 minutes to allow retry
        console.log(`⚠️ Response appears incomplete for ${communityName} - caching for 5 minutes only`);
        // For incomplete responses, only save to memory cache with short expiry
        this.memoryCache.set(cacheKey, {
          data: structuredData,
          timestamp: Date.now(),
          expiresAt: Date.now() + (5 * 60 * 1000) // Expires in 5 minutes
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
    location: string,
    websiteUrl?: string
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
      photos: await this.extractPhotosFromResponse(response, communityName, location, websiteUrl) || [],
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

  // Clean and validate URL
  private cleanUrl(url: string): string | null {
    if (!url || url === 'Not' || url === 'None' || url === 'N/A') {
      return null;
    }
    
    // Remove citation markers like [1], [2], etc.
    let cleanedUrl = url.replace(/\[\d+\]$/g, '').trim();
    
    // Ensure URL has protocol
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      cleanedUrl = 'https://' + cleanedUrl;
    }
    
    // Basic URL validation
    try {
      new URL(cleanedUrl);
      return cleanedUrl;
    } catch {
      return null;
    }
  }
  
  // Lightweight photo extraction from website URL only (no Perplexity calls)
  private async extractPhotosFromWebsite(
    websiteUrl: string,
    communityName: string,
    location: string
  ): Promise<string[]> {
    const extractedPhotos: string[] = [];
    
    // Clean and validate the URL first
    const cleanedUrl = this.cleanUrl(websiteUrl);
    if (!cleanedUrl) {
      console.log(`⚠️ Invalid website URL for ${communityName}: ${websiteUrl}`);
      return [];
    }
    
    try {
      console.log(`📸 Extracting photos from website: ${cleanedUrl}`);
      
      // Use MultiAIPhotoExtractor for efficient photo finding
      const photoExtractionResult = await MultiAIPhotoExtractor.findAuthenticPhotos(
        communityName,
        '', // No summary needed for lightweight extraction
        cleanedUrl,
        [cleanedUrl] // Use website as source
      );
      
      if (photoExtractionResult?.authenticPhotos) {
        photoExtractionResult.authenticPhotos.forEach((photo: any) => {
          if (photo.url && photo.isAuthentic) {
            extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photo.url)}`);
          }
        });
        console.log(`✅ Found ${photoExtractionResult.authenticPhotos.length} authentic photos via MultiAIPhotoExtractor`);
      }
      
      // Also try direct scraping from the website
      const scrapedPhotos = await cheerioPhotoScraper.scrapePhotosFromWebsite(
        cleanedUrl,
        communityName,
        {
          maxPhotos: 10,
          timeout: 10000
        }
      );
      
      if (scrapedPhotos && scrapedPhotos.length > 0) {
        scrapedPhotos.forEach((photo: any) => {
          if (photo.url) {
            extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photo.url)}`);
          }
        });
        console.log(`📸 Found ${scrapedPhotos.length} additional photos from direct scraping`);
      }
    } catch (error) {
      console.error(`Failed to extract photos from ${websiteUrl}:`, error);
    }
    
    const uniquePhotos = Array.from(new Set(extractedPhotos)).slice(0, 20);
    console.log(`📸 Total ${uniquePhotos.length} unique photos extracted for ${communityName}`);
    return uniquePhotos;
  }
  
  private async extractPhotosFromResponse(
    response: { summary: string; sources: string[]; images?: string[] },
    communityName: string,
    location: string,
    websiteUrl?: string
  ): Promise<string[]> {
    const extractedPhotos: string[] = [];
    
    // First add any images that were directly returned by Perplexity
    if (response.images && Array.isArray(response.images)) {
      response.images.forEach((img: any) => {
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
    
    // Use cost-effective MultiAIPhotoExtractor instead of expensive Perplexity calls
    console.log(`📸 Using MultiAIPhotoExtractor for ${communityName}...`);
    const cleanedUrlForExtractor = websiteUrl ? this.cleanUrl(websiteUrl) : null;
    if (cleanedUrlForExtractor) {
      console.log(`📌 Using cleaned website URL for photo extraction: ${cleanedUrlForExtractor}`);
    }
    
    try {
      const [city, state] = location.split(',').map(s => s.trim());
      
      // Use MultiAIPhotoExtractor to find photos efficiently
      const photoExtractionResult = await MultiAIPhotoExtractor.findAuthenticPhotos(
        communityName,
        response.summary,
        cleanedUrlForExtractor, // Pass the cleaned website URL from discovery
        response.sources
      );
      
      if (photoExtractionResult?.authenticPhotos) {
        photoExtractionResult.authenticPhotos.forEach((photo: any) => {
          if (photo.url && photo.isAuthentic) {
            extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photo.url)}`);
          }
        });
        console.log(`✅ Found ${photoExtractionResult.authenticPhotos.length} authentic photos via MultiAIPhotoExtractor`);
      }
      
      // Also scrape from the discovered website URL if available
      const cleanedWebsiteUrl = websiteUrl ? this.cleanUrl(websiteUrl) : null;
      if (cleanedWebsiteUrl && !response.sources.includes(cleanedWebsiteUrl)) {
        console.log(`🌐 Scraping photos from discovered website: ${cleanedWebsiteUrl}`);
        try {
          const scrapedPhotos = await cheerioPhotoScraper.scrapePhotosFromWebsite(
            cleanedWebsiteUrl,
            communityName,
            {
              maxPhotos: 10,
              timeout: 10000 // 10 second timeout
            }
          );
          
          if (scrapedPhotos && scrapedPhotos.length > 0) {
            scrapedPhotos.forEach((photo: any) => {
              if (photo.url) {
                extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photo.url)}`);
              }
            });
            console.log(`📸 Found ${scrapedPhotos.length} photos from ${websiteUrl}`);
          }
        } catch (scrapeError) {
          console.log(`⚠️ Failed to scrape discovered website ${websiteUrl}:`, scrapeError instanceof Error ? scrapeError.message : 'Unknown error');
        }
      }
      
      // Also scrape from any sources that were provided by the original Perplexity response
      if (response.sources && response.sources.length > 0) {
        console.log(`🕷️ Scraping photos from ${Math.min(3, response.sources.length)} key sources...`);
        
        // Limit to top 3 sources to avoid excessive scraping
        const topSources = response.sources.slice(0, 3).filter(source => {
          const url = source.toLowerCase();
          return !url.includes('.pdf') && !url.includes('.doc') && !url.includes('youtube.com');
        });
        
        for (const sourceUrl of topSources) {
          try {
            const scrapedPhotos = await cheerioPhotoScraper.scrapePhotosFromWebsite(
              sourceUrl,
              communityName,
              {
                maxPhotos: 10,
                timeout: 10000 // 10 second timeout
              }
            );
            
            if (scrapedPhotos?.length > 0) {
              console.log(`📸 Found ${scrapedPhotos.length} photos from ${sourceUrl}`);
              scrapedPhotos.forEach(photo => {
                if (photo.url) {
                  extractedPhotos.push(`/api/image-proxy?url=${encodeURIComponent(photo.url)}`);
                }
              });
            }
          } catch (scrapeError) {
            console.log(`⚠️ Failed to scrape ${sourceUrl}:`, scrapeError instanceof Error ? scrapeError.message : 'Unknown error');
          }
        }
      }
    } catch (extractionError) {
      console.log(`⚠️ MultiAIPhotoExtractor failed for ${communityName}:`, extractionError instanceof Error ? extractionError.message : 'Unknown error');
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
      await this.saveCacheToDatabase(cacheKey, serviceData, false);
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