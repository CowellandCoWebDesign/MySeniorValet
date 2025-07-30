import { db } from './db';
import { communities } from '@shared/schema';
import { eq, sql, and } from 'drizzle-orm';
import axios from 'axios';

// Real-time pricing integrations - NO AGGREGATOR SITES
// We ONLY use government sources, direct community data, and verified sources
export class RealTimePricingIntegrator {
  
  // We NEVER use aggregator sites like A Place for Mom, Caring.com, Seniorly, or Senior Advisor
  // This is a HARD RULE - we only use authentic sources

  // Medicare.gov cost calculator integration (LEGITIMATE GOVERNMENT SOURCE)
  async getMedicareCostEstimate(zipCode: string, careLevel: string) {
    try {
      const response = await axios.get('https://data.medicare.gov/api/cost-estimates', {
        params: { zip: zipCode, care_type: careLevel }
      });
      return response.data;
    } catch (error) {
      console.error('Medicare API error:', error);
    }
    return null;
  }

  // Get pricing directly from YOUR database - NO AGGREGATORS
  async getRealPricingFromDatabase(communityId: number) {
    const community = await db.select().from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community[0]) return null;

    const pricingSources = [];

    // 1. YOUR Database pricing (most trusted - from direct sources)
    if (community[0].priceRange) {
      pricingSources.push({
        source: 'MySeniorValet Database',
        priceRange: community[0].priceRange,
        verified: !!community[0].hudPropertyId,
        lastUpdated: community[0].updatedAt
      });
    }

    // 2. HUD pricing (government verified - 100% authentic)
    if (community[0].hudPropertyId && community[0].rentPerMonth) {
      pricingSources.push({
        source: 'HUD (Government Verified)',
        price: community[0].rentPerMonth,
        verified: true,
        lastUpdated: new Date()
      });
    }

    // 3. Medicare cost data (if available)
    const medicareData = await this.getMedicareCostEstimate(
      community[0].zipCode, 
      community[0].careTypes?.[0] || 'assisted living'
    );
    
    if (medicareData) {
      pricingSources.push({
        source: 'Medicare.gov',
        priceRange: medicareData.priceRange,
        verified: true,
        lastUpdated: new Date()
      });
    }

    // NO AGGREGATOR SITES - We only use authentic sources

    // Calculate confidence score based on REAL sources
    const confidenceScore = this.calculatePricingConfidence(pricingSources);

    return {
      communityId,
      sources: pricingSources,
      recommendedRange: this.calculateRecommendedRange(pricingSources),
      confidenceScore,
      lastChecked: new Date(),
      disclaimer: 'Pricing from authentic sources only - no aggregator data'
    };
  }

  // Calculate pricing confidence based on sources
  private calculatePricingConfidence(sources: any[]): number {
    let score = 0;
    
    // HUD verified = 100% confidence
    if (sources.some(s => s.source === 'HUD')) return 100;
    
    // Multiple sources increase confidence
    score += sources.length * 20;
    
    // Recent updates increase confidence
    sources.forEach(source => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(source.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceUpdate < 30) score += 20;
      else if (daysSinceUpdate < 90) score += 10;
    });
    
    return Math.min(score, 95); // Max 95% unless HUD verified
  }

  // Calculate recommended price range from multiple sources
  private calculateRecommendedRange(sources: any[]) {
    const allPrices: number[] = [];
    
    sources.forEach(source => {
      if (source.price) {
        allPrices.push(source.price);
      } else if (source.priceRange) {
        allPrices.push(source.priceRange.min || 0);
        allPrices.push(source.priceRange.max || 0);
      }
    });
    
    if (allPrices.length === 0) return null;
    
    const validPrices = allPrices.filter(p => p > 0);
    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);
    const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
    
    return {
      min: Math.round(min),
      max: Math.round(max),
      average: Math.round(avg),
      confidence: this.calculatePricingConfidence(sources)
    };
  }

  // Store pricing history for transparency
  async storePricingHistory(communityId: number, pricing: any) {
    await db.insert(pricingHistory).values({
      communityId,
      source: pricing.source,
      priceMin: pricing.priceRange?.min,
      priceMax: pricing.priceRange?.max,
      price: pricing.price,
      verifiedBy: pricing.verified ? 'System' : null,
      recordedAt: new Date()
    });
  }
}

export const pricingIntegrator = new RealTimePricingIntegrator();