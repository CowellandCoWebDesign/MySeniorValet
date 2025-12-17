import { db } from '../db';
import { communities, perplexityCache } from '@shared/schema';
import { eq, sql, and, lt } from 'drizzle-orm';
import { PerplexitySearchAPI } from './perplexity-search-api';
import { redisClient, isRedisAvailable, inMemoryCache } from '../utils/redis-client';
import Bull from 'bull';
import { format } from 'date-fns';

// Configuration
const ENRICHMENT_STALE_DAYS = 7; // Content is considered stale after 7 days
const CACHE_TTL = 86400; // 24 hours in seconds for rendered HTML cache
const PERPLEXITY_TIMEOUT = 30000; // 30 seconds timeout for Perplexity API

// Background job queue for async enrichment (only if Redis is available)
let enrichmentQueue: Bull.Queue | null = null;

// Initialize queue only if Redis is available
if (isRedisAvailable()) {
  try {
    enrichmentQueue = new Bull('community-enrichment', {
      redis: redisClient!.options,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
    console.log('✅ Bull queue initialized with Redis');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Bull queue:', error);
    enrichmentQueue = null;
  }
} else {
  console.log('ℹ️ Redis not available - background enrichment disabled');
}

interface EnrichmentResult {
  content: string;
  metadata: {
    sources: Array<{ url: string; title: string }>;
    lastUpdated: Date;
    wordCount: number;
    topics: string[];
  };
  seoData: {
    metaDescription: string;
    keywords: string[];
    faqItems?: Array<{ question: string; answer: string }>;
  };
}

export class CommunityEnrichmentService {
  private perplexityAPI: PerplexitySearchAPI;
  
  constructor() {
    this.perplexityAPI = new PerplexitySearchAPI();
    // Only setup worker if Redis is available
    if (enrichmentQueue) {
      this.setupWorker();
    }
  }
  
  /**
   * Main entry point for getting enriched content for a community
   * Checks cache first, then database freshness, then enqueues background job if needed
   */
  async getEnrichedContent(communityId: number): Promise<EnrichmentResult | null> {
    try {
      // 1. Check cache for rendered content (Redis or in-memory fallback)
      const cacheKey = `community:enriched:${communityId}`;
      
      // Try Redis first if available
      if (isRedisAvailable() && redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`✅ Redis cache hit for community ${communityId} enriched content`);
          return JSON.parse(cached);
        }
      } else {
        // Fall back to in-memory cache
        const cached = await inMemoryCache.get(cacheKey);
        if (cached) {
          console.log(`✅ Memory cache hit for community ${communityId} enriched content`);
          return JSON.parse(cached);
        }
      }
      
      // 2. Check database for fresh enriched content
      const community = await db
        .select({
          id: communities.id,
          name: communities.name,
          enrichedContent: communities.enrichedContent,
          enrichedAt: communities.enrichedAt,
          city: communities.city,
          state: communities.state,
          description: communities.description,
          careTypes: communities.careTypes,
        })
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community[0]) {
        console.error(`Community ${communityId} not found`);
        return null;
      }
      
      const communityData = community[0];
      const isStale = this.isContentStale(communityData.enrichedAt);
      
      // 3. If content exists and is fresh, parse and cache it
      if (communityData.enrichedContent && !isStale) {
        const enrichmentResult = this.parseEnrichedContent(communityData.enrichedContent);
        
        // Cache the result
        if (redisClient) {
          await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(enrichmentResult));
        }
        
        console.log(`✅ Fresh enriched content found for community ${communityId}`);
        return enrichmentResult;
      }
      
      // 4. Content is missing or stale - enqueue background job
      console.log(`🔄 Enqueueing enrichment job for community ${communityId} (stale: ${isStale})`);
      await this.enqueueEnrichment(communityId, communityData);
      
      // 5. Return existing content if available (even if stale)
      if (communityData.enrichedContent) {
        return this.parseEnrichedContent(communityData.enrichedContent);
      }
      
      // 6. Generate basic content as fallback
      return this.generateFallbackContent(communityData);
      
    } catch (error) {
      console.error(`Error getting enriched content for community ${communityId}:`, error);
      return null;
    }
  }
  
  /**
   * Enqueue a background job to fetch fresh enrichment from Perplexity
   * Falls back to synchronous processing if queue is not available
   */
  private async enqueueEnrichment(communityId: number, communityData: any) {
    try {
      if (enrichmentQueue) {
        // Redis available - use async queue
        const job = await enrichmentQueue.add('fetch-enrichment', {
          communityId,
          communityData,
          timestamp: new Date().toISOString(),
        });
        
        console.log(`📋 Enrichment job ${job.id} created for community ${communityId}`);
      } else {
        // COST CONTROL: Redis not available - DO NOT call Perplexity automatically
        // This was causing massive API costs ($1/5min) from bots/crawlers hitting community pages
        // Instead, just log and skip - user can manually refresh if needed
        console.log(`⚠️ Skipping automatic enrichment for community ${communityId} (Redis not available, cost control enabled)`);
        
        // Check if explicit enrichment is requested via environment variable
        if (process.env.ENABLE_SYNC_ENRICHMENT === 'true') {
          console.log(`🔄 Processing enrichment synchronously for community ${communityId} (explicitly enabled)`);
          setImmediate(async () => {
            try {
              await this.processEnrichmentSync(communityId, communityData);
            } catch (error) {
              console.error(`Failed to enrich community ${communityId}:`, error);
            }
          });
        }
      }
    } catch (error) {
      console.error(`Failed to enqueue enrichment for community ${communityId}:`, error);
    }
  }
  
  /**
   * Wrapper to call PerplexitySearchAPI and return expected format
   */
  private async searchWithPerplexity(query: string): Promise<{ answer: string; sources: any[] }> {
    try {
      const response = await this.perplexityAPI.search(query, {
        max_results: 10,
        search_recency: 'month' // Get recent information
      });
      
      // Map the response to expected format
      return {
        answer: response.answer || '',
        sources: response.sources?.map((s: any) => ({
          url: s.url || '',
          title: s.title || s.name || 'Source'
        })) || []
      };
    } catch (error) {
      console.error('Perplexity search failed:', error);
      throw error;
    }
  }
  
  /**
   * Process enrichment synchronously when queue is not available
   */
  private async processEnrichmentSync(communityId: number, communityData: any): Promise<EnrichmentResult> {
    try {
      const query = this.buildEnrichmentQuery(communityData);
      const perplexityResponse = await this.searchWithPerplexity(query);
      
      if (!perplexityResponse || !perplexityResponse.answer) {
        throw new Error('Invalid Perplexity response');
      }
      
      const enrichmentResult = await this.processPerplexityResponse(
        perplexityResponse,
        communityData
      );
      
      await this.persistEnrichment(communityId, enrichmentResult);
      await this.invalidateCaches(communityId);
      
      return enrichmentResult;
    } catch (error) {
      console.error(`Failed to enrich community ${communityId}:`, error);
      throw error;
    }
  }
  
  /**
   * Setup background worker to process enrichment jobs (only if Redis available)
   */
  private setupWorker() {
    if (!enrichmentQueue) return;
    
    enrichmentQueue.process('fetch-enrichment', async (job) => {
      const { communityId, communityData } = job.data;
      
      try {
        console.log(`🚀 Processing enrichment job for community ${communityId}`);
        
        // Fetch from Perplexity with comprehensive query
        const query = this.buildEnrichmentQuery(communityData);
        const perplexityResponse = await this.searchWithPerplexity(query);
        
        if (!perplexityResponse || !perplexityResponse.answer) {
          throw new Error('Invalid Perplexity response');
        }
        
        // Process and structure the enrichment
        const enrichmentResult = await this.processPerplexityResponse(
          perplexityResponse,
          communityData
        );
        
        // Persist to database
        await this.persistEnrichment(communityId, enrichmentResult);
        
        // Invalidate caches
        await this.invalidateCaches(communityId);
        
        console.log(`✅ Successfully enriched community ${communityId}`);
        return enrichmentResult;
        
      } catch (error) {
        console.error(`Failed to enrich community ${communityId}:`, error);
        throw error;
      }
    });
    
    // Event handlers
    enrichmentQueue.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed for community ${job.data.communityId}`);
    });
    
    enrichmentQueue.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} failed for community ${job.data.communityId}:`, err);
    });
  }
  
  /**
   * Build comprehensive Perplexity query for maximum SEO value
   */
  private buildEnrichmentQuery(communityData: any): string {
    const careTypesStr = Array.isArray(communityData.careTypes) 
      ? communityData.careTypes.join(', ') 
      : 'senior living';
    
    return `
      Provide comprehensive information about ${communityData.name} located in ${communityData.city}, ${communityData.state}.
      
      Include the following details:
      1. Overview and history of the facility
      2. Types of care offered (${careTypesStr})
      3. Amenities and services provided
      4. Staff qualifications and resident-to-staff ratios
      5. Activities and social programs
      6. Dining options and meal plans
      7. Room types and accommodation details
      8. Pricing structure and payment options
      9. Medicare/Medicaid acceptance
      10. Reviews and ratings from residents and families
      11. Virtual tour availability
      12. Contact information and visiting hours
      13. Nearby hospitals and medical facilities
      14. Transportation services
      15. Pet policies
      
      Provide at least 4000 characters of detailed, SEO-optimized content.
      Include specific facts, statistics, and unique features.
      Format with clear headings and comprehensive paragraphs.
    `;
  }
  
  /**
   * Process Perplexity response into structured enrichment data
   */
  private async processPerplexityResponse(
    response: any,
    communityData: any
  ): Promise<EnrichmentResult> {
    const content = response.answer || '';
    const sources = response.sources || [];
    
    // Extract key topics and keywords from content
    const topics = this.extractTopics(content);
    const keywords = this.extractKeywords(content, communityData);
    
    // Generate meta description (160 chars max)
    const metaDescription = this.generateMetaDescription(content, communityData);
    
    // Extract FAQ items if present in content
    const faqItems = this.extractFAQItems(content);
    
    return {
      content: content,
      metadata: {
        sources: sources.map((s: any) => ({
          url: s.url || '',
          title: s.title || 'Source',
        })),
        lastUpdated: new Date(),
        wordCount: content.split(/\s+/).length,
        topics: topics,
      },
      seoData: {
        metaDescription,
        keywords,
        faqItems,
      },
    };
  }
  
  /**
   * Persist enrichment to database
   */
  private async persistEnrichment(communityId: number, enrichment: EnrichmentResult) {
    try {
      // Update communities table - store native object in JSONB (no JSON.stringify)
      await db
        .update(communities)
        .set({
          enrichedContent: enrichment as any, // JSONB handles native objects
          enrichedAt: sql`NOW()`,
          updatedAt: sql`NOW()`,
        })
        .where(eq(communities.id, communityId));
      
      // Store raw response in perplexity cache table using new fields
      await db
        .insert(perplexityCache)
        .values({
          // Legacy fields for backward compatibility
          communityId: `community_${communityId}`, // Text field
          communityName: 'N/A', // Will be populated later
          location: 'N/A', // Will be populated later
          expiresAt: new Date(Date.now() + (ENRICHMENT_STALE_DAYS * 24 * 60 * 60 * 1000)),
          
          // New fields for enrichment service
          communityIdRef: communityId, // Integer reference
          query: 'enrichment',
          response: enrichment.content,
          sourcesJson: enrichment.metadata.sources as any, // Native object for JSONB
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [perplexityCache.communityIdRef, perplexityCache.query],
          set: {
            response: enrichment.content,
            sourcesJson: enrichment.metadata.sources as any,
            expiresAt: new Date(Date.now() + (ENRICHMENT_STALE_DAYS * 24 * 60 * 60 * 1000)),
            updatedAt: new Date(),
          },
        });
      
      console.log(`💾 Persisted enrichment for community ${communityId}`);
      
    } catch (error) {
      console.error(`Failed to persist enrichment for community ${communityId}:`, error);
      throw error;
    }
  }
  
  /**
   * Invalidate all caches related to a community
   */
  private async invalidateCaches(communityId: number) {
    if (!redisClient) return;
    
    try {
      const patterns = [
        `community:enriched:${communityId}`,
        `community:html:${communityId}`,
        `community:ssr:${communityId}`,
      ];
      
      for (const pattern of patterns) {
        await redisClient.del(pattern);
      }
      
      console.log(`🗑️  Invalidated caches for community ${communityId}`);
      
    } catch (error) {
      console.error(`Failed to invalidate caches for community ${communityId}:`, error);
    }
  }
  
  /**
   * Check if content is stale based on last update timestamp
   */
  private isContentStale(enrichedAt: Date | null): boolean {
    if (!enrichedAt) return true;
    
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - ENRICHMENT_STALE_DAYS);
    
    return enrichedAt < staleDate;
  }
  
  /**
   * Parse stored enriched content from JSON
   */
  private parseEnrichedContent(content: any): EnrichmentResult {
    try {
      if (typeof content === 'string') {
        return JSON.parse(content);
      }
      return content;
    } catch (error) {
      // If parsing fails, treat as plain text content
      return {
        content: content.toString(),
        metadata: {
          sources: [],
          lastUpdated: new Date(),
          wordCount: content.toString().split(/\s+/).length,
          topics: [],
        },
        seoData: {
          metaDescription: '',
          keywords: [],
        },
      };
    }
  }
  
  /**
   * Generate fallback content when enrichment is not available
   */
  private generateFallbackContent(communityData: any): EnrichmentResult {
    const careTypes = Array.isArray(communityData.careTypes) 
      ? communityData.careTypes.join(', ') 
      : 'senior living';
    
    const content = `
      ${communityData.name} is a ${careTypes} community located in ${communityData.city}, ${communityData.state}.
      ${communityData.description || 'This community offers quality care and services for seniors.'}
      
      For more information about ${communityData.name}, including pricing, availability, and services,
      please contact our team or schedule a tour.
    `.trim();
    
    return {
      content,
      metadata: {
        sources: [],
        lastUpdated: new Date(),
        wordCount: content.split(/\s+/).length,
        topics: [],
      },
      seoData: {
        metaDescription: `Learn about ${communityData.name} in ${communityData.city}, ${communityData.state} - ${careTypes} community`,
        keywords: [communityData.name, communityData.city, communityData.state, ...careTypes.split(', ')],
      },
    };
  }
  
  /**
   * Extract topics from content for categorization
   */
  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    
    const topicPatterns = [
      { pattern: /memory care|dementia|alzheimer/i, topic: 'Memory Care' },
      { pattern: /assisted living/i, topic: 'Assisted Living' },
      { pattern: /independent living/i, topic: 'Independent Living' },
      { pattern: /skilled nursing|nursing home/i, topic: 'Skilled Nursing' },
      { pattern: /rehabilitation|therapy/i, topic: 'Rehabilitation' },
      { pattern: /hospice|palliative/i, topic: 'Hospice Care' },
      { pattern: /respite care/i, topic: 'Respite Care' },
      { pattern: /activities|social programs/i, topic: 'Activities & Social' },
      { pattern: /dining|meals|nutrition/i, topic: 'Dining Services' },
      { pattern: /medicare|medicaid/i, topic: 'Insurance Accepted' },
    ];
    
    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(content)) {
        topics.push(topic);
      }
    }
    
    return topics;
  }
  
  /**
   * Extract SEO keywords from content
   */
  private extractKeywords(content: string, communityData: any): string[] {
    const keywords = [
      communityData.name,
      communityData.city,
      communityData.state,
      'senior living',
      'retirement community',
    ];
    
    // Add care types
    if (Array.isArray(communityData.careTypes)) {
      keywords.push(...communityData.careTypes);
    }
    
    // Add common senior living terms found in content
    const terms = [
      'assisted living',
      'memory care',
      'independent living',
      'skilled nursing',
      'nursing home',
      'senior care',
      'elder care',
      'retirement home',
    ];
    
    for (const term of terms) {
      if (content.toLowerCase().includes(term)) {
        keywords.push(term);
      }
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }
  
  /**
   * Generate SEO-optimized meta description
   */
  private generateMetaDescription(content: string, communityData: any): string {
    const careTypes = Array.isArray(communityData.careTypes) 
      ? communityData.careTypes.join(', ') 
      : 'senior living';
    
    // Try to extract first meaningful sentence from content
    const firstSentence = content.split(/[.!?]/)[0]?.trim() || '';
    
    if (firstSentence.length > 50 && firstSentence.length < 160) {
      return firstSentence;
    }
    
    // Generate default meta description
    return `${communityData.name} offers ${careTypes} in ${communityData.city}, ${communityData.state}. Learn about amenities, pricing, reviews, and schedule a tour.`.substring(0, 160);
  }
  
  /**
   * Extract FAQ items from content for schema.org markup
   */
  private extractFAQItems(content: string): Array<{ question: string; answer: string }> {
    const faqItems: Array<{ question: string; answer: string }> = [];
    
    // Look for Q&A patterns in content
    const qaPattern = /(?:Q:|Question:)\s*([^\n]+)\n+(?:A:|Answer:)\s*([^\n]+)/gi;
    let match;
    
    while ((match = qaPattern.exec(content)) !== null) {
      faqItems.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    }
    
    // Generate common FAQs if none found
    if (faqItems.length === 0) {
      const commonQuestions = [
        {
          question: 'What types of care are offered?',
          answer: content.match(/types of care[^.]+\./i)?.[0] || 'Various levels of care are available.',
        },
        {
          question: 'What is the pricing structure?',
          answer: content.match(/pricing[^.]+\./i)?.[0] || 'Contact for current pricing information.',
        },
        {
          question: 'Are tours available?',
          answer: content.match(/tour[^.]+\./i)?.[0] || 'Tours can be scheduled by contacting the community.',
        },
      ];
      
      return commonQuestions.slice(0, 3);
    }
    
    return faqItems.slice(0, 5); // Limit to 5 FAQ items
  }
  
  /**
   * Force refresh enrichment for a specific community
   */
  async forceRefresh(communityId: number): Promise<void> {
    try {
      const community = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (!community[0]) {
        throw new Error(`Community ${communityId} not found`);
      }
      
      await this.enqueueEnrichment(communityId, community[0]);
      console.log(`🔄 Force refresh initiated for community ${communityId}`);
      
    } catch (error) {
      console.error(`Failed to force refresh community ${communityId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const communityEnrichmentService = new CommunityEnrichmentService();