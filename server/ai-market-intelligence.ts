import { db } from './db';
import { communities } from '@shared/schema';
import { eq, and, isNull, lt } from 'drizzle-orm';
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
  private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.perplexityService = new PerplexityAIService();
    this.verificationService = new MultiAIVerificationService();
    this.cache = new Map();
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

      // CRITICAL: Check if this is HUD or government-sourced pricing
      if (community.hudPropertyId || community.dataSource === 'HUD' || 
          community.dataSource === 'Government' || community.communitySubtype === 'hud_senior_housing') {
        console.log(`✅ ${community.name} has verified government pricing - NOT calling AI`);
        
        // Return the existing government-verified data without AI calls
        const intelligenceData: MarketIntelligenceData = {
          communityId,
          communityName: community.name,
          pricing: {
            verified: true,
            amount: community.priceRange?.min || 500, // HUD pricing typically starts at $500
            minMax: community.priceRange,
            source: 'HUD Verified',
            confidence: 100,
            lastUpdated: community.updatedAt?.toISOString() || new Date().toISOString()
          },
          marketContext: {
            averageAreaPrice: community.priceRange?.min || 500,
            priceRange: community.priceRange || { min: 500, max: 800 },
            competitorCount: 0,
            demandLevel: 'high' // HUD properties typically have high demand
          },
          dataQuality: 'verified'
        };

        // Cache it
        this.cache.set(communityId, {
          data: intelligenceData,
          timestamp: Date.now()
        });

        return intelligenceData;
      }

      // Check if we already have recent pricing data (not from government sources)
      if (community.priceRange && community.updatedAt && 
          Date.now() - community.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000) {
        console.log(`📊 ${community.name} has recent pricing data - NOT calling AI`);
        
        const intelligenceData: MarketIntelligenceData = {
          communityId,
          communityName: community.name,
          pricing: {
            verified: false,
            amount: community.priceRange.min,
            minMax: community.priceRange,
            source: 'Database',
            confidence: 75,
            lastUpdated: community.updatedAt.toISOString()
          },
          marketContext: {
            averageAreaPrice: community.priceRange.min,
            priceRange: community.priceRange,
            competitorCount: 0,
            demandLevel: 'medium'
          },
          dataQuality: 'estimated'
        };

        // Cache it
        this.cache.set(communityId, {
          data: intelligenceData,
          timestamp: Date.now()
        });

        return intelligenceData;
      }

      console.log(`🔍 Fetching AI market intelligence for ${community.name} (no existing pricing)`);

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

      // Build market intelligence data
      const intelligenceData: MarketIntelligenceData = {
        communityId,
        communityName: community.name,
        pricing: verificationReport.pricing || {
          verified: false,
          amount: this.getEstimatedPrice(community),
          source: 'Market Intelligence Estimate',
          confidence: 50,
          lastUpdated: new Date().toISOString()
        },
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

  // Batch process communities to update market intelligence
  async updateMarketIntelligenceBatch(limit = 10): Promise<void> {
    try {
      // Find communities that need updates (no pricing, NOT government sources)
      const communitiesToUpdate = await db
        .select()
        .from(communities)
        .where(
          and(
            isNull(communities.priceRange),
            // EXCLUDE HUD and government sources
            isNull(communities.hudPropertyId),
            communities.dataSource !== 'HUD',
            communities.dataSource !== 'Government',
            communities.communitySubtype !== 'hud_senior_housing'
          )
        )
        .limit(limit);

      console.log(`🔄 Updating market intelligence for ${communitiesToUpdate.length} non-government communities`);

      for (const community of communitiesToUpdate) {
        try {
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
        } catch (error) {
          console.error(`Failed to update intelligence for ${community.name}:`, error);
        }
      }
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