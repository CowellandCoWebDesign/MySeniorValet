import { db } from './db';
import { communities, pricing_history as pricingHistory } from '@shared/schema';
import { eq, and, isNull, lt, gte, desc } from 'drizzle-orm';
import { PerplexityAIService } from './perplexity-ai-service';
import { MultiAIVerificationService } from './multi-ai-verification-service';

interface MarketIntelligenceData {
  communityId: number;
  communityName: string;
  pricing: {
    verified: boolean;
    amount: number | null;
    minMax?: { min: number; max: number };
    source: string;
    confidence: number;
    lastUpdated: string;
  };
  governmentPricing?: {
    amount: number;
    source: string;
    note: string;
  };
  pricingDiscrepancy?: {
    governmentRate: number;
    marketRate: number;
    message: string;
  };
  marketContext: {
    averageAreaPrice: number;
    priceRange: { min: number; max: number };
    competitorCount: number;
    demandLevel: 'high' | 'medium' | 'low';
  };
  dataQuality: 'verified' | 'estimated' | 'outdated';
}

export class AIMarketIntelligenceService {
  private perplexityService: PerplexityAIService;
  private verificationService: MultiAIVerificationService;
  private cache: Map<number, { data: MarketIntelligenceData; timestamp: number }>;
  private apiCallCount: Map<string, number>;
  private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private MAX_API_CALLS_PER_DAY = 100; // Maximum API calls per day

  constructor() {
    this.perplexityService = new PerplexityAIService();
    this.verificationService = new MultiAIVerificationService();
    this.cache = new Map();
    this.apiCallCount = new Map();
  }

  // Get AI-powered market intelligence for a community
  async getMarketIntelligence(
    communityId: number,
    forceRefresh = false
  ): Promise<MarketIntelligenceData> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(communityId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log(`📊 Returning cached market intelligence for community ${communityId}`);
        return cached.data;
      }
    }

    try {
      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        throw new Error('Community not found');
      }

      // Track if this has government pricing
      const hasGovernmentPricing = community.hudPropertyId || 
                                   community.dataSource === 'HUD' || 
                                   community.dataSource === 'Government' || 
                                   community.communitySubtype === 'hud_senior_housing';
      
      const governmentPrice = hasGovernmentPricing ? (community.priceRange?.min || 500) : null;

      // Check if we have recent AI-verified pricing (within 7 days)
      const existingAiPricing = await db
        .select()
        .from(pricingHistory)
        .where(
          and(
            eq(pricingHistory.communityId, communityId),
            eq(pricingHistory.source, 'AI Verified'),
            gte(pricingHistory.verifiedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(pricingHistory.verifiedAt))
        .limit(1);

      if (existingAiPricing.length > 0 && !forceRefresh) {
        console.log(`📊 ${community.name} has recent AI-verified pricing - using cached data`);
        
        const aiPricing = existingAiPricing[0];
        const intelligenceData: MarketIntelligenceData = {
          communityId,
          communityName: community.name,
          pricing: {
            verified: true,
            amount: aiPricing.price,
            minMax: { min: aiPricing.price, max: aiPricing.price },
            source: 'AI Verified',
            confidence: 95,
            lastUpdated: aiPricing.verifiedAt.toISOString()
          },
          governmentPricing: hasGovernmentPricing ? {
            amount: governmentPrice!,
            source: 'HUD Verified',
            note: 'Government subsidized rate'
          } : undefined,
          marketContext: {
            averageAreaPrice: aiPricing.price,
            priceRange: { min: aiPricing.price, max: aiPricing.price },
            competitorCount: 0,
            demandLevel: 'medium'
          },
          dataQuality: 'verified',
          pricingDiscrepancy: hasGovernmentPricing && governmentPrice !== aiPricing.price ? {
            governmentRate: governmentPrice!,
            marketRate: aiPricing.price,
            message: 'AI found current market pricing differs from government records'
          } : undefined
        };

        // Cache it
        this.cache.set(communityId, {
          data: intelligenceData,
          timestamp: Date.now()
        });

        return intelligenceData;
      }

      console.log(`🔍 Fetching NEW AI market intelligence for ${community.name}`);

      // Check API call limits
      const todayKey = new Date().toDateString();
      const todayCount = this.apiCallCount.get(todayKey) || 0;
      if (todayCount >= this.MAX_API_CALLS_PER_DAY) {
        console.log(`⚠️ Daily API call limit reached (${this.MAX_API_CALLS_PER_DAY})`);
        
        // Return existing government pricing or estimate
        if (hasGovernmentPricing) {
          return {
            communityId,
            communityName: community.name,
            pricing: {
              verified: true,
              amount: governmentPrice!,
              minMax: community.priceRange,
              source: 'HUD Verified',
              confidence: 100,
              lastUpdated: new Date().toISOString()
            },
            governmentPricing: {
              amount: governmentPrice!,
              source: 'HUD Verified',
              note: 'Government subsidized rate'
            },
            marketContext: {
              averageAreaPrice: governmentPrice!,
              priceRange: community.priceRange || { min: 500, max: 800 },
              competitorCount: 0,
              demandLevel: 'high'
            },
            dataQuality: 'verified'
          };
        }
        
        return this.getEstimatedPricing(community);
      }

      // Update API call count
      this.apiCallCount.set(todayKey, todayCount + 1);
      console.log(`📊 API calls today: ${todayCount + 1}/${this.MAX_API_CALLS_PER_DAY}`);

      // Use Perplexity to search for pricing data
      const searchQuery = `"${community.name}" senior living pricing costs ${community.city} ${community.state} monthly rates 2025`;
      const perplexityData = await this.perplexityService.searchRealTimeInfo(searchQuery);

      // Run Multi-AI verification on the data
      const verificationReport = await this.verificationService.verifyRealTimeData(
        communityId,
        community.name,
        perplexityData,
        {
          city: community.city,
          state: community.state,
          zipCode: community.zip,
          address: community.address,
          careTypes: community.careTypes || [],
          communityType: community.communityType,
          communitySubtype: community.communitySubtype,
          rating: community.rating,
          bedCount: community.bedCount,
          yearEstablished: community.yearEstablished,
          description: community.description,
          ownershipType: community.ownershipType,
          certifications: community.certifications || [],
          hudPropertyId: community.hudPropertyId
        }
      );

      // Extract market context from the data
      const marketContext = await this.analyzeMarketContext(
        community,
        perplexityData,
        verificationReport
      );

      // Determine data quality
      const dataQuality = verificationReport.pricing?.verified ? 'verified' :
                         verificationReport.consensus.confidenceScore > 70 ? 'estimated' : 'outdated';

      // Save AI pricing to database if verified
      if (verificationReport.pricing?.verified && verificationReport.pricing.amount) {
        try {
          await db.insert(pricingHistory).values({
            communityId,
            price: verificationReport.pricing.amount,
            source: 'AI Verified',
            verifiedAt: new Date(),
            verificationStatus: 'verified',
            verificationDetails: {
              perplexity: perplexityData,
              consensus: verificationReport.consensus,
              sources: verificationReport.sources
            }
          });
          console.log(`💾 Saved AI-verified pricing for ${community.name}: $${verificationReport.pricing.amount}`);
        } catch (saveError) {
          console.error('Error saving pricing to database:', saveError);
        }
      }

      // Build market intelligence data with dual-display support
      const aiPrice = verificationReport.pricing?.amount || this.getEstimatedPrice(community);
      const intelligenceData: MarketIntelligenceData = {
        communityId,
        communityName: community.name,
        pricing: verificationReport.pricing || {
          verified: false,
          amount: aiPrice,
          source: 'Market Intelligence Estimate',
          confidence: 50,
          lastUpdated: new Date().toISOString()
        },
        governmentPricing: hasGovernmentPricing ? {
          amount: governmentPrice!,
          source: 'HUD Verified',
          note: 'Government subsidized rate'
        } : undefined,
        pricingDiscrepancy: hasGovernmentPricing && governmentPrice !== aiPrice ? {
          governmentRate: governmentPrice!,
          marketRate: aiPrice,
          message: 'AI found current market pricing differs from government records'
        } : undefined,
        marketContext,
        dataQuality
      };

      // Cache the result
      this.cache.set(communityId, {
        data: intelligenceData,
        timestamp: Date.now()
      });

      console.log(`✅ Market intelligence complete for ${community.name} - Quality: ${dataQuality}`);
      return intelligenceData;

    } catch (error) {
      console.error('Market intelligence error:', error);
      
      // Return fallback estimate
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      return {
        communityId,
        communityName: community?.name || 'Unknown',
        pricing: {
          verified: false,
          amount: this.getEstimatedPrice(community),
          source: 'Market Intelligence Estimate',
          confidence: 30,
          lastUpdated: new Date().toISOString()
        },
        marketContext: {
          averageAreaPrice: this.getEstimatedPrice(community) || 3500,
          priceRange: { min: 2000, max: 6000 },
          competitorCount: 0,
          demandLevel: 'medium'
        },
        dataQuality: 'estimated'
      };
    }
  }

  // Update market intelligence for trending/featured communities only
  async updateTrendingCommunities(limit = 10): Promise<void> {
    try {
      // Get trending communities (typically shown on homepage)
      const trendingCommunities = await db
        .select()
        .from(communities)
        .where(
          and(
            // EXCLUDE HUD and government sources
            isNull(communities.hudPropertyId),
            communities.dataSource !== 'HUD',
            communities.dataSource !== 'Government',
            communities.communitySubtype !== 'hud_senior_housing'
          )
        )
        .orderBy(desc(communities.createdAt))  // Most recently added
        .limit(limit);

      console.log(`🔄 Updating market intelligence for ${trendingCommunities.length} trending non-government communities`);

      // Update each community with rate limiting
      let updated = 0;
      for (const community of trendingCommunities) {
        try {
          const todayKey = new Date().toDateString();
          const todayCount = this.apiCallCount.get(todayKey) || 0;
          
          if (todayCount >= this.MAX_API_CALLS_PER_DAY) {
            console.log(`⚠️ Daily API limit reached. Updated ${updated}/${trendingCommunities.length} communities`);
            break;
          }
          
          const intelligence = await this.getMarketIntelligence(community.id, true);
          
          // Update database with verified pricing if found
          if (intelligence.pricing.verified && intelligence.pricing.amount) {
            await db
              .update(communities)
              .set({
                priceRange: intelligence.pricing.minMax || {
                  min: intelligence.pricing.amount,
                  max: intelligence.pricing.amount
                },
                updatedAt: new Date()
              })
              .where(eq(communities.id, community.id));
            
            console.log(`💰 Updated verified pricing for ${community.name}: $${intelligence.pricing.amount}`);
          }
          updated++;
        } catch (error) {
          console.error(`Failed to update intelligence for ${community.name}:`, error);
        }
      }
      
      console.log(`✅ Trending update complete: ${updated} communities updated`);
    } catch (error) {
      console.error('Batch update error:', error);
    }
  }

  // Analyze market context from AI data
  private async analyzeMarketContext(
    community: any,
    perplexityData: any,
    verificationReport: any
  ): Promise<MarketIntelligenceData['marketContext']> {
    try {
      // Extract competitor pricing from the data
      const searchContent = perplexityData?.searchContent || '';
      const competitorPrices: number[] = [];
      
      // Look for other pricing mentions in the search results
      const priceMatches = searchContent.matchAll(/\$(\d{1,3},?\d{3})/g);
      for (const match of priceMatches) {
        const price = parseInt(match[1].replace(',', ''));
        if (price > 1000 && price < 10000) {
          competitorPrices.push(price);
        }
      }

      // Calculate average area price
      const averageAreaPrice = competitorPrices.length > 0 
        ? Math.round(competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length)
        : this.getEstimatedPrice(community) || 3500;

      // Determine price range
      const min = competitorPrices.length > 0 ? Math.min(...competitorPrices) : 2000;
      const max = competitorPrices.length > 0 ? Math.max(...competitorPrices) : 6000;

      // Analyze demand level based on various factors
      const demandIndicators = {
        highOccupancy: /high occupancy|waiting list|limited availability/i.test(searchContent),
        popularArea: /popular|sought after|high demand/i.test(searchContent),
        manyCompetitors: competitorPrices.length > 5
      };

      const demandLevel = demandIndicators.highOccupancy || demandIndicators.popularArea 
        ? 'high' 
        : demandIndicators.manyCompetitors 
        ? 'medium' 
        : 'low';

      return {
        averageAreaPrice,
        priceRange: { min, max },
        competitorCount: competitorPrices.length,
        demandLevel
      };
    } catch (error) {
      console.error('Market context analysis error:', error);
      return {
        averageAreaPrice: 3500,
        priceRange: { min: 2000, max: 6000 },
        competitorCount: 0,
        demandLevel: 'medium'
      };
    }
  }

  // Get estimated price based on care type and location
  private getEstimatedPrice(community: any): number | null {
    if (!community) return null;

    // Base prices by care type
    const basePrices: Record<string, number> = {
      'memory_care': 6500,
      'assisted_living': 4500,
      'independent_living': 3500,
      'skilled_nursing': 7500,
      'continuing_care': 5000
    };

    // State cost multipliers (based on cost of living)
    const stateMultipliers: Record<string, number> = {
      'CA': 1.3, 'NY': 1.25, 'MA': 1.2, 'HI': 1.35, 'CT': 1.2,
      'TX': 0.95, 'FL': 1.0, 'AZ': 0.95, 'NV': 1.0, 'CO': 1.1,
      'OH': 0.85, 'MI': 0.85, 'IN': 0.8, 'KY': 0.8, 'WV': 0.75,
      'AL': 0.8, 'MS': 0.75, 'AR': 0.75, 'LA': 0.85, 'TN': 0.85
    };

    // Special case for HUD properties
    if (community.communitySubtype === 'hud_senior_housing') {
      return 500; // HUD subsidized housing
    }

    // Get base price from care type
    let basePrice = 3500; // Default
    if (community.careTypes && community.careTypes.length > 0) {
      const primaryCareType = community.careTypes[0];
      basePrice = basePrices[primaryCareType] || 3500;
    }

    // Apply state multiplier
    const stateMultiplier = stateMultipliers[community.state] || 1.0;
    
    return Math.round(basePrice * stateMultiplier);
  }

  // Get market trends for a specific area
  async getAreaMarketTrends(
    state: string,
    city?: string
  ): Promise<{
    averagePrice: number;
    medianPrice: number;
    priceRange: { min: number; max: number };
    trend: 'increasing' | 'stable' | 'decreasing';
    lastUpdated: string;
  }> {
    try {
      // Query communities in the area
      const areaCommunitiesQuery = city 
        ? and(eq(communities.state, state), eq(communities.city, city))
        : eq(communities.state, state);

      const areaCommunities = await db
        .select()
        .from(communities)
        .where(areaCommunitiesQuery)
        .limit(100);

      // Collect pricing data
      const prices: number[] = [];
      for (const community of areaCommunities) {
        if (community.priceRange?.min) {
          prices.push(community.priceRange.min);
        } else {
          // Use AI to get pricing for a sample
          if (prices.length < 10) {
            const intelligence = await this.getMarketIntelligence(community.id);
            if (intelligence.pricing.amount) {
              prices.push(intelligence.pricing.amount);
            }
          }
        }
      }

      if (prices.length === 0) {
        // Fallback to estimates
        const estimatedPrice = this.getEstimatedPrice({ state, city, careTypes: ['assisted_living'] });
        prices.push(estimatedPrice || 3500);
      }

      // Calculate statistics
      prices.sort((a, b) => a - b);
      const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const medianPrice = prices[Math.floor(prices.length / 2)];
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      return {
        averagePrice,
        medianPrice,
        priceRange: { min, max },
        trend: 'stable', // Could be enhanced with historical data
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Area market trends error:', error);
      return {
        averagePrice: 3500,
        medianPrice: 3500,
        priceRange: { min: 2000, max: 6000 },
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const aiMarketIntelligence = new AIMarketIntelligenceService();