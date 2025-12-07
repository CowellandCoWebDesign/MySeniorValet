import { PerplexityAIService } from './perplexity-ai-service';
import { cheerioPhotoScraper } from './services/cheerio-photo-scraper';
import { MultiAIPhotoExtractor } from './services/multi-ai-photo-extractor';
import { communityWebsiteCrawler, DeepCrawlResult } from './services/community-website-crawler';
import { db } from './db';
import { perplexityCache, communities } from '../shared/schema';
import { eq, lt, and } from 'drizzle-orm';

interface CachedCommunityData {
  communityPk?: number; // Numeric primary key from communities.id table
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
  // Track whether data came from cache or fresh fetch
  source?: 'memory-cache' | 'database-cache' | 'fresh-fetch' | 'website-photos' | 'database-content' | 'empty';
  // Enhanced data from deep website crawl (primary source of truth)
  deepCrawlData?: {
    virtualTours: { url: string; platform?: string; embedCode?: string }[];
    floorPlans: { url: string; unitType?: string; squareFootage?: string; price?: string; imageUrl?: string }[];
    videos: { url: string; platform?: string; embedUrl?: string; title?: string }[];
    amenities: string[];
    pricingDetails: {
      independentLiving?: string;
      assistedLiving?: string;
      memoryCare?: string;
      generalRange?: string;
    };
  };
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
      
      // CRITICAL: Also sync photos and description to communities table so they appear in directory!
      // Safely resolve the numeric primary key - prefer communityPk if provided
      const resolveCommunityPk = (data: CachedCommunityData): number | null => {
        // First try to use the explicit communityPk if provided
        if (data.communityPk !== undefined && Number.isInteger(data.communityPk)) {
          return data.communityPk;
        }
        // Fall back to parsing communityId if it's numeric
        const value = data.communityId;
        if (typeof value === "number" && Number.isInteger(value)) return value;
        if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
        return null; // UUID or malformed
      };
      
      const communityPk = resolveCommunityPk(data);
      
      if (communityPk !== null && (data.photos?.length > 0 || data.rawPerplexityContent)) {
        try {
          // Convert photo URLs from proxy format back to original URLs for storage
          const originalPhotos = data.photos?.map(url => {
            // If it's a proxied URL, extract the original
            if (url.includes('/api/image-proxy?url=')) {
              // Remove the proxy prefix
              const encoded = url.replace('/api/image-proxy?url=', '');
              // Decode the URL (handles %2F -> / and other encodings)
              const decoded = decodeURIComponent(encoded);
              return decoded;
            }
            return url;
          }) || [];
          
          const updates: any = {};
          
          // Update photos if we have them
          if (originalPhotos.length > 0) {
            updates.photos = originalPhotos;
            console.log(`📸 Syncing ${originalPhotos.length} photos to communities.photos for ID ${communityPk}`);
          }
          
          // Update description with FULL Perplexity content
          if (data.rawPerplexityContent && data.rawPerplexityContent.length > 100) {
            // Save the COMPLETE Perplexity content for full SEO value
            updates.description = data.rawPerplexityContent;
            console.log(`📝 Syncing FULL Perplexity content (${data.rawPerplexityContent.length} chars) to communities.description for ID ${communityPk}`);
          }
          
          // CRITICAL: Also sync videos to communities table
          if (data.deepCrawlData?.videos && data.deepCrawlData.videos.length > 0) {
            const videoUrls = data.deepCrawlData.videos.map((v: { url: string }) => v.url);
            updates.communityVideos = videoUrls;
            console.log(`🎬 Syncing ${videoUrls.length} videos to communities.communityVideos for ID ${communityPk}`);
          }
          
          // Sync virtual tours
          if (data.deepCrawlData?.virtualTours && data.deepCrawlData.virtualTours.length > 0) {
            const tourUrls = data.deepCrawlData.virtualTours.map((t: { url: string }) => t.url);
            updates.virtualTours = tourUrls;
            updates.virtualTourUrl = tourUrls[0]; // Set primary virtual tour URL
            console.log(`🏠 Syncing ${tourUrls.length} virtual tours to communities.virtualTours for ID ${communityPk}`);
          }
          
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date();
            updates.lastSuccessfulEnrichment = new Date();
            
            const result = await db
              .update(communities)
              .set(updates)
              .where(eq(communities.id, communityPk));
              
            console.log(`✅ Synced cached data to communities table for ${data.communityName}:`, {
              communityId: communityPk,
              photosUpdated: originalPhotos.length,
              descriptionLength: data.rawPerplexityContent?.length || 0,
              updateSuccess: !!result
            });
          }
        } catch (syncError) {
          console.error(`Failed to sync to communities table for ID ${communityPk}:`, syncError);
        }
      } else if (communityPk === null) {
        console.warn(`⚠️ Skipping communities table sync: non-numeric ID`, { 
          cacheKey, 
          communityId: data.communityId 
        });
      }
    } catch (error) {
      console.error('Failed to save to database cache:', error);
    }
  }

  // Public method to save comprehensive data to cache
  async saveComprehensiveData(
    communityId: string,
    communityName: string,
    location: string,
    data: Partial<CachedCommunityData>,
    isFeatured: boolean = false,
    communityPk?: number  // Accept the numeric primary key directly from the route
  ) {
    const cacheKey = `community_${communityId}`;
    
    const fullData: CachedCommunityData = {
      marketData: data.marketData || {},
      reviews: data.reviews || {},
      inspections: data.inspections || {},
      photos: data.photos || [],
      sources: data.sources || [],
      timestamp: Date.now(),
      communityId,
      communityName,
      location,
      rawPerplexityContent: data.rawPerplexityContent || '',
      source: 'fresh-fetch',
      communityPk  // Store the numeric PK if provided
    };
    
    await this.saveCacheToDatabase(cacheKey, fullData, isFeatured);
    console.log(`✅ Manually saved comprehensive data for ${communityName} to cache`);
    
    return fullData;
  }

  /**
   * Assess the quality of cached data to determine if auto-fetch is needed
   */
  private assessCacheQuality(data: CachedCommunityData): {
    isHighQuality: boolean;
    qualityScore: number;
    issues: string[];
  } {
    let qualityScore = 0;
    const issues: string[] = [];
    
    // Check for photos (weight: 35%)
    if (data.photos && data.photos.length > 0) {
      if (data.photos.length >= 5) {
        qualityScore += 35;
      } else {
        qualityScore += (data.photos.length / 5) * 35;
        issues.push(`Only ${data.photos.length} photos found`);
      }
    } else {
      issues.push('No photos available');
    }
    
    // Check for comprehensive description (weight: 30%)
    const contentLength = data.rawPerplexityContent?.length || 0;
    if (contentLength > 1000) {
      qualityScore += 30;
    } else if (contentLength > 500) {
      qualityScore += 15;
      issues.push('Limited description content');
    } else {
      issues.push('No comprehensive description');
    }
    
    // Check for pricing information (weight: 20%)
    if (data.marketData?.pricing && 
        (typeof data.marketData.pricing === 'object' && Object.keys(data.marketData.pricing).length > 0)) {
      qualityScore += 20;
    } else {
      issues.push('No pricing information');
    }
    
    // Check for reviews (weight: 10%)
    if (data.reviews?.averageRating && data.reviews.averageRating > 0) {
      qualityScore += 10;
    } else {
      issues.push('No review data');
    }
    
    // Check content is not generic/error (weight: 5%)
    const content = (data.rawPerplexityContent || '').toLowerCase();
    if (!content.includes('not found') && 
        !content.includes('no direct search results') &&
        !content.includes('error') &&
        content.length > 100) {
      qualityScore += 5;
    } else {
      issues.push('Content appears to be an error or placeholder');
    }
    
    // High quality threshold: 60% or better
    const isHighQuality = qualityScore >= 60;
    
    return {
      isHighQuality,
      qualityScore,
      issues
    };
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
    
    // If forceRefresh is requested, clear ONLY the perplexity cache, not the communities photos
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for ${communityName} - clearing perplexity cache only`);
      // Clear from memory cache
      this.memoryCache.delete(cacheKey);
      // Clear perplexity cache but NOT the communities table photos
      await db.delete(perplexityCache).where(eq(perplexityCache.communityId, cacheKey));
    }
    
    // First check memory cache for speed (but validate expiration AND quality)
    const memoryCached = this.memoryCache.get(cacheKey);
    if (memoryCached && !forceRefresh) {
      const now = Date.now();
      const qualityAssessment = this.assessCacheQuality(memoryCached.data);
      
      if (memoryCached.expiresAt > now && qualityAssessment.isHighQuality) {
        console.log(`⚡ Returning HIGH QUALITY memory-cached data for ${communityName} (Score: ${qualityAssessment.qualityScore}%)`);
        return { ...memoryCached.data, source: 'memory-cache' };
      } else {
        // Memory cache expired or low quality, remove it
        const reason = memoryCached.expiresAt <= now ? 'expired' : 
                       `low quality (Score: ${qualityAssessment.qualityScore}%, Issues: ${qualityAssessment.issues.join(', ')})`;
        console.log(`🧹 Memory cache ${reason} for ${communityName}, removing from memory`);
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
        
        if (dbCached && new Date(dbCached.expiresAt) > new Date()) {
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
            rawPerplexityContent: dbCached.rawPerplexityContent || '',
            source: 'database-cache'
          };
          
          // Assess cache quality
          const qualityAssessment = this.assessCacheQuality(cachedData);
          
          if (qualityAssessment.isHighQuality) {
            console.log(`📦 Returning HIGH QUALITY database-cached data for ${communityName} (Score: ${qualityAssessment.qualityScore}%)`);
            
            // Store in memory cache for faster subsequent access with proper expiration
            this.memoryCache.set(cacheKey, {
              data: cachedData,
              timestamp: Date.now(),
              expiresAt: new Date(dbCached.expiresAt).getTime()
            });
            
            return cachedData;
          } else {
            console.log(`⚠️ Database cache has LOW QUALITY data for ${communityName} (Score: ${qualityAssessment.qualityScore}%)`);
            console.log(`   Issues: ${qualityAssessment.issues.join(', ')}`);
            // Continue to check communities table or auto-fetch
          }
        }
      } catch (error) {
        console.error(`Failed to read from database cache for ${communityName}:`, error);
      }
      
      // Check the communities table for existing data
      let existingData: CachedCommunityData | null = null;
      try {
        const [community] = await db
          .select({
            photos: communities.photos,
            priceRange: communities.priceRange,
            rating: communities.rating,
            description: communities.description
          })
          .from(communities)
          .where(eq(communities.id, parseInt(communityId)))
          .limit(1);

        if (community) {
          existingData = {
            marketData: {
              pricing: typeof community.priceRange === 'object' ? community.priceRange : {}
            },
            reviews: {
              averageRating: typeof community.rating === 'number' ? community.rating : 0
            },
            inspections: {},
            photos: community.photos || [],
            sources: [],
            timestamp: Date.now(),
            communityId,
            communityName,
            location,
            rawPerplexityContent: community.description || '',
            source: 'database-content' as const
          };
          
          // Assess the quality of existing community data
          const qualityAssessment = this.assessCacheQuality(existingData);
          
          if (qualityAssessment.isHighQuality) {
            console.log(`✅ Found HIGH QUALITY existing data in communities table for ${communityName} (Score: ${qualityAssessment.qualityScore}%)`);
            return existingData;
          } else {
            console.log(`📊 Communities table has LOW QUALITY data for ${communityName} (Score: ${qualityAssessment.qualityScore}%)`);
            console.log(`   Issues: ${qualityAssessment.issues.join(', ')}`);
            console.log(`   🚀 AUTO-FETCHING comprehensive data to improve quality...`);
            
            // AUTO-FETCH: Trigger automatic enrichment for poor quality data
            // Don't return existing low quality data - fetch fresh comprehensive data
            // Continue to fetching logic below by not returning here
          }
        }
      } catch (error) {
        console.error(`Failed to check communities table for ${communityName}:`, error);
      }
      
      // No data at all
      console.log(`⚠️ No data found for ${communityName} - triggering auto-fetch for first-time visitor`);
      
      // AUTO-FETCH for completely empty data - continue to fetching logic below
    }

    // Reaching here means we need to fetch fresh data
    // Either because of forceRefresh=true (manual) or poor quality data (auto)
    const fetchReason = forceRefresh 
      ? `👤 User-initiated refresh for ${communityName}` 
      : `🤖 Auto-fetching comprehensive data due to poor quality for ${communityName}`;
    console.log(fetchReason);
    
    if (websiteUrl) {
      console.log(`📌 Using website URL for enhanced search: ${websiteUrl}`);
    }

    // Fetch additional community metadata for better query disambiguation
    let communityAddress = '';
    let communityPhone = '';
    try {
      const [community] = await db
        .select({
          address: communities.address,
          phone: communities.phone,
          website: communities.website
        })
        .from(communities)
        .where(eq(communities.id, parseInt(communityId)))
        .limit(1);
      
      if (community) {
        communityAddress = community.address || '';
        communityPhone = community.phone || '';
        // Use database website if not provided
        if (!websiteUrl && community.website) {
          websiteUrl = community.website;
        }
      }
    } catch (error) {
      console.log(`ℹ️ Could not fetch additional metadata for query enhancement:`, error);
    }

    // HYBRID PATTERN: Try fast Cheerio first, then Playwright fallback for JS-heavy sites
    let deepCrawlData: DeepCrawlResult | null = null;
    let cheerioPhotos: { url: string; alt?: string; title?: string; context?: string }[] = [];
    
    if (websiteUrl) {
      // STEP 1: Try fast Cheerio scraper first (10x faster, no browser needed)
      try {
        console.log(`🚀 STEP 1: Fast Cheerio scrape of ${websiteUrl}...`);
        cheerioPhotos = await cheerioPhotoScraper.scrapePhotosFromWebsite(
          websiteUrl,
          communityName,
          { maxPhotos: 30, timeout: 15000 }
        );
        
        if (cheerioPhotos.length >= 5) {
          console.log(`✅ Cheerio found ${cheerioPhotos.length} photos - sufficient for display`);
        } else {
          console.log(`⚠️ Cheerio found only ${cheerioPhotos.length} photos - will try Playwright for more`);
        }
      } catch (cheerioError) {
        console.log(`⚠️ Cheerio scrape failed:`, cheerioError instanceof Error ? cheerioError.message : 'Unknown error');
      }
      
      // STEP 2: If Cheerio didn't find enough content, try Playwright (handles JS-rendered sites)
      const needsPlaywright = cheerioPhotos.length < 5;
      
      if (needsPlaywright) {
        try {
          console.log(`🕷️ STEP 2: Playwright deep crawl for JS-rendered content...`);
          deepCrawlData = await communityWebsiteCrawler.deepCrawlCommunityWebsite(
            websiteUrl,
            communityName,
            {
              maxPagesToExplore: 10,
              timeout: 30000,
              includeFloorPlans: true,
              includePricing: true
            }
          );
          
          if (deepCrawlData && deepCrawlData.confidence !== 'low') {
            console.log(`✅ Playwright deep crawl successful! Found:`);
            console.log(`   - ${deepCrawlData.virtualTours.length} virtual tours`);
            console.log(`   - ${deepCrawlData.photos.length} photos`);
            console.log(`   - ${deepCrawlData.floorPlans.length} floor plans`);
            console.log(`   - ${deepCrawlData.videos.length} videos`);
            console.log(`   - ${deepCrawlData.amenities.length} amenities`);
          }
        } catch (crawlError) {
          console.log(`⚠️ Playwright crawl failed:`, crawlError instanceof Error ? crawlError.message : 'Unknown error');
          console.log(`📸 Using ${cheerioPhotos.length} photos from Cheerio fallback`);
        }
      }
      
      // MERGE: Combine Cheerio photos with Playwright data if both exist
      if (cheerioPhotos.length > 0) {
        if (!deepCrawlData) {
          // Create minimal deepCrawlData from Cheerio results
          deepCrawlData = {
            virtualTours: [],
            photoGalleries: [],
            photos: cheerioPhotos.map(p => ({ url: p.url, alt: p.alt, context: p.context })),
            floorPlans: [],
            videos: [],
            pricing: {},
            contact: {},
            amenities: [],
            pagesExplored: [websiteUrl],
            confidence: cheerioPhotos.length >= 10 ? 'high' : cheerioPhotos.length >= 5 ? 'medium' : 'low',
            crawlDate: new Date(),
            errors: []
          };
        } else {
          // Merge Cheerio photos with Playwright photos (deduplicate by URL)
          const existingUrls = new Set(deepCrawlData.photos.map(p => p.url));
          for (const photo of cheerioPhotos) {
            if (!existingUrls.has(photo.url)) {
              deepCrawlData.photos.push({ url: photo.url, alt: photo.alt, context: photo.context });
            }
          }
        }
        console.log(`📸 Total photos after merge: ${deepCrawlData.photos.length}`);
      }
    }

    // Build enhanced query with ALL available metadata for PRECISE disambiguation
    // CRITICAL: Include as many identifiers as possible to prevent generic/average responses
    const metadataContext = [
      communityAddress ? `EXACT ADDRESS: ${communityAddress}` : null,
      communityPhone ? `PHONE: ${communityPhone}` : null,
      websiteUrl ? `OFFICIAL WEBSITE: ${websiteUrl}` : null
    ].filter(Boolean).join('\n');

    // Log the query for debugging
    console.log(`🔍 Perplexity query for ${communityName}:`, {
      address: communityAddress || 'NOT AVAILABLE',
      phone: communityPhone || 'NOT AVAILABLE',
      website: websiteUrl || 'NOT AVAILABLE'
    });

    // Focused query for essential data - BE VERY SPECIFIC to avoid generic averages
    const comprehensiveQuery = `
SPECIFIC SENIOR LIVING COMMUNITY LOOKUP:
Name: "${communityName}"
Location: ${location}
${metadataContext ? `\nVERIFIED IDENTIFIERS:\n${metadataContext}` : ''}

IMPORTANT: Search for THIS EXACT community using the identifiers above. Do NOT provide generic industry averages or data from other communities.

Provide SPECIFIC information for "${communityName}" ONLY:

1. PRICING (for this specific community):
   - Current monthly rates for each care level they offer
   - Any published pricing from their website or directories
   - Historical pricing changes if documented (past 3 years)

2. FLOOR PLANS (from their website/brochures):
   - Available apartment/unit types (Studio, 1BR, 2BR, etc.)
   - Square footage for each unit type
   - What's included in each floor plan

3. CARE LEVELS OFFERED at this location:
   - Independent Living, Assisted Living, Memory Care, Skilled Nursing, Respite
   - Specific services they provide

4. DIRECT CONTACT INFO (not referral services):
   - Their direct phone number
   - Physical address
   - Official website URL

If you cannot find specific information for "${communityName}", state "Information not available for this specific community" rather than providing generic industry data.
`;

    try {
      // Make ONE comprehensive API call (supplements deep crawl data)
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
      // Only reject if the COMMUNITY itself wasn't found, not if individual fields are missing
      const lowerContent = structuredData.rawPerplexityContent?.toLowerCase() || '';
      const hasComprehensiveData = 
        structuredData.rawPerplexityContent && 
        structuredData.rawPerplexityContent.length > 500; // At least 500 chars of content
      
      // Only reject if Perplexity couldn't find the community at all
      const communityNotFound = 
        lowerContent.includes('no direct search results specifically confirm') ||
        lowerContent.includes('no direct evidence of a') ||
        lowerContent.includes('unable to find this community') ||
        lowerContent.includes('does not appear to exist');
      
      const isCompleteResponse = hasComprehensiveData && !communityNotFound;
      
      // MERGE deep crawl data with Perplexity data (deep crawl takes priority)
      if (deepCrawlData && deepCrawlData.confidence !== 'low') {
        console.log(`🔄 Merging deep crawl data with Perplexity response...`);
        
        // Helper to ensure deepCrawlData structure exists
        const ensureDeepCrawlData = () => {
          if (!structuredData.deepCrawlData) {
            structuredData.deepCrawlData = {
              virtualTours: [],
              floorPlans: [],
              videos: [],
              amenities: [],
              pricingDetails: {}
            };
          }
          return structuredData.deepCrawlData;
        };
        
        // Add virtual tours from deep crawl (primary source)
        if (deepCrawlData.virtualTours && deepCrawlData.virtualTours.length > 0) {
          structuredData.marketData.virtualTourUrl = deepCrawlData.virtualTours[0].url;
          ensureDeepCrawlData().virtualTours = deepCrawlData.virtualTours;
        }
        
        // Add photos from deep crawl (merge with Perplexity photos)
        if (deepCrawlData.photos && deepCrawlData.photos.length > 0) {
          const crawlPhotoUrls = deepCrawlData.photos
            .slice(0, 20)
            .map(p => `/api/image-proxy?url=${encodeURIComponent(p.url)}`);
          structuredData.photos = [...crawlPhotoUrls, ...structuredData.photos].slice(0, 30);
        }
        
        // Add floor plans
        if (deepCrawlData.floorPlans && deepCrawlData.floorPlans.length > 0) {
          ensureDeepCrawlData().floorPlans = deepCrawlData.floorPlans;
        }
        
        // Add videos
        if (deepCrawlData.videos && deepCrawlData.videos.length > 0) {
          ensureDeepCrawlData().videos = deepCrawlData.videos;
        }
        
        // Add pricing from deep crawl (more accurate than Perplexity)
        if (deepCrawlData.pricing && Object.keys(deepCrawlData.pricing).length > 0) {
          ensureDeepCrawlData().pricingDetails = deepCrawlData.pricing;
        }
        
        // Add amenities
        if (deepCrawlData.amenities && deepCrawlData.amenities.length > 0) {
          ensureDeepCrawlData().amenities = deepCrawlData.amenities;
        }
        
        // Update contact info from deep crawl if missing
        if (deepCrawlData.contact?.phone && !structuredData.marketData.phone) {
          structuredData.marketData.phone = deepCrawlData.contact.phone;
        }
        if (deepCrawlData.contact?.email && !structuredData.marketData.email) {
          structuredData.marketData.email = deepCrawlData.contact.email;
        }
      }
      
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

      return { ...structuredData, source: 'fresh-fetch' };
    } catch (error) {
      console.error(`Failed to fetch comprehensive data for ${communityName}:`, error);
      
      // If Perplexity failed but we have deep crawl data, use that instead
      if (deepCrawlData && deepCrawlData.confidence !== 'low') {
        console.log(`📌 Using deep crawl data as fallback since Perplexity failed`);
        return {
          marketData: {
            website: websiteUrl,
            phone: deepCrawlData.contact?.phone,
            email: deepCrawlData.contact?.email,
            virtualTourUrl: deepCrawlData.virtualTours?.[0]?.url
          },
          reviews: {},
          inspections: {},
          photos: (deepCrawlData.photos || []).slice(0, 20).map(p => `/api/image-proxy?url=${encodeURIComponent(p.url)}`),
          sources: deepCrawlData.pagesExplored || [],
          timestamp: Date.now(),
          communityId,
          communityName,
          location,
          source: 'fresh-fetch',
          deepCrawlData: {
            virtualTours: deepCrawlData.virtualTours || [],
            floorPlans: deepCrawlData.floorPlans || [],
            videos: deepCrawlData.videos || [],
            amenities: deepCrawlData.amenities || [],
            pricingDetails: deepCrawlData.pricing || {}
          }
        };
      }
      
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
        location,
        source: 'fresh-fetch' // Still counts as a fresh fetch attempt, even if it failed
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
      // Match markdown links with source references like [url](url)[number]
      /\[?(https?:\/\/[^\s\]\)]+)\]?\([^\)]*\)?(?:\[\d+\])?/i,
      /(?:website|site|url):\s*\[?(https?:\/\/[^\s\]\)]+)/i,
      /\*\*OFFICIAL WEBSITE:\*\*\s*\[?(https?:\/\/[^\s\]\)]+)/i,
      /(https?:\/\/[^\s\[\]]+\.(?:com|org|net|edu|gov|io|co)[^\s\[\]]*)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        // Extract URL from markdown format if needed
        let url = match[1];
        
        // Clean up any remaining markdown or source references
        url = url.replace(/[\[\]()]/g, '');
        url = url.replace(/\[\d+\]\.?$/, ''); // Remove source references like [15]
        url = url.split(']')[0]; // Remove anything after closing bracket
        url = url.split(')')[0]; // Remove anything after closing parenthesis
        
        // Ensure URL is clean and valid
        if (url.startsWith('http')) {
          return url.trim();
        }
      }
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

  // Pre-compiled regex patterns for better performance (avoids re-compilation on each call)
  private static readonly REVIEW_PATTERNS = {
    google: /Google[^\*]*?(\d+\.?\d*)[^\*]*?stars?/i,
    yelp: /Yelp[^\*]*?(\d+\.?\d*)[^\*]*?stars?/i,
    caring: /Caring\.com[^\*]*?(\d+\.?\d*)[^\*]*?stars?/i,
    average: /(?:average|overall)[^\*]*?(\d+\.?\d*)[^\*]*?(?:stars?|rating)/i,
    count: /(\d+)\s*(?:reviews?|ratings?)/i,
    violations: /(?:violation|citation|deficiency)[^.]*\./gi,
    inspectionDate: /(?:inspection|inspected)[^\*]*?(\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/i,
    // Compliance patterns for extractComplianceStatus
    noViolation: /no\s+violation/i,
    hasViolation: /violation/i,
    compliant: /compliant/i
  };

  /**
   * Extract all review data in a single pass through the content
   * This is more efficient than calling multiple extract methods separately
   */
  private extractAllReviews(content: string): {
    googleReviews: any[];
    yelpReviews: any[];
    caringComReviews: any[];
    averageRating?: number;
    totalReviewCount?: number;
  } {
    const result = {
      googleReviews: [] as any[],
      yelpReviews: [] as any[],
      caringComReviews: [] as any[],
      averageRating: undefined as number | undefined,
      totalReviewCount: undefined as number | undefined
    };

    // Extract Google reviews
    const googleMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.google);
    if (googleMatch) {
      result.googleReviews = [{
        source: 'Google',
        rating: parseFloat(googleMatch[1]),
        text: googleMatch[0]
      }];
    }

    // Extract Yelp reviews
    const yelpMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.yelp);
    if (yelpMatch) {
      result.yelpReviews = [{
        source: 'Yelp',
        rating: parseFloat(yelpMatch[1]),
        text: yelpMatch[0]
      }];
    }

    // Extract Caring.com reviews
    const caringMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.caring);
    if (caringMatch) {
      result.caringComReviews = [{
        source: 'Caring.com',
        rating: parseFloat(caringMatch[1]),
        text: caringMatch[0]
      }];
    }

    // Extract average rating
    const avgMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.average);
    if (avgMatch) {
      result.averageRating = parseFloat(avgMatch[1]);
    }

    // Extract review count
    const countMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.count);
    if (countMatch) {
      result.totalReviewCount = parseInt(countMatch[1]);
    }

    return result;
  }

  // Keep individual methods for backward compatibility but delegate to cached patterns
  private extractGoogleReviews(content: string): any[] {
    const googleSection = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.google);
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
    const yelpSection = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.yelp);
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
    const caringSection = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.caring);
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
    const ratingMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.average);
    return ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
  }

  private extractReviewCount(content: string): number | undefined {
    const countMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.count);
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
    const violationMatches = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.violations);
    return violationMatches ? violationMatches.map(v => ({ description: v })) : [];
  }

  private extractInspectionDate(content: string): string | undefined {
    const dateMatch = content.match(UnifiedPerplexityCache.REVIEW_PATTERNS.inspectionDate);
    return dateMatch ? dateMatch[1] : undefined;
  }

  private extractComplianceStatus(content: string): string {
    // Use pre-compiled patterns for better performance
    if (UnifiedPerplexityCache.REVIEW_PATTERNS.noViolation.test(content)) return 'Compliant';
    if (UnifiedPerplexityCache.REVIEW_PATTERNS.hasViolation.test(content)) return 'Issues Found';
    if (UnifiedPerplexityCache.REVIEW_PATTERNS.compliant.test(content)) return 'Compliant';
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
    const cleanedUrlForExtractor = websiteUrl ? this.cleanUrl(websiteUrl) : undefined;
    if (cleanedUrlForExtractor) {
      console.log(`📌 Using cleaned website URL for photo extraction: ${cleanedUrlForExtractor}`);
    }
    
    try {
      const [city, state] = location.split(',').map(s => s.trim());
      
      // Use MultiAIPhotoExtractor to find photos efficiently
      const photoExtractionResult = await MultiAIPhotoExtractor.findAuthenticPhotos(
        communityName,
        response.summary,
        cleanedUrlForExtractor || undefined, // Convert null to undefined
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
    this.memoryCache.delete(cacheKey);
    console.log(`🗑️ Cleared cache for community ${communityId}`);
  }

  // Clear all cache
  clearAllCache(): void {
    this.memoryCache.clear();
    console.log('🗑️ Cleared all cached data');
  }

  // Get cache statistics
  getCacheStats(): { size: number; communities: string[] } {
    const communities = Array.from(this.memoryCache.keys()).map((key: string) => key.replace('community_', ''));
    return {
      size: this.memoryCache.size,
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

      // Cache the result in memory only (ServiceEnrichmentCache doesn't persist to database)
      this.cache.set(cacheKey, {
        data: serviceData,
        timestamp: Date.now()
      });
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