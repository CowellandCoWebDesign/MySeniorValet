import { db } from './db';
import { communities, pricingHistory, pricingVerifications } from '@shared/schema';
import { eq, sql, and } from 'drizzle-orm';
import axios from 'axios';

// Real-time pricing integrations
export class RealTimePricingIntegrator {
  
  // Integrate with A Place for Mom API (if available)
  async fetchAPlaceForMomPricing(communityName: string, location: string) {
    try {
      if (process.env.APLACEFORMOM_API_KEY) {
        const response = await axios.get('https://api.aplaceformom.com/v1/pricing', {
          headers: { 'X-API-Key': process.env.APLACEFORMOM_API_KEY },
          params: { community: communityName, location }
        });
        return response.data;
      }
    } catch (error) {
      console.error('A Place for Mom API error:', error);
    }
    return null;
  }

  // Integrate with Caring.com pricing feed
  async fetchCaringComPricing(communityId: number) {
    try {
      if (process.env.CARING_API_KEY) {
        const response = await axios.get('https://api.caring.com/v2/communities/pricing', {
          headers: { 'Authorization': `Bearer ${process.env.CARING_API_KEY}` },
          params: { id: communityId }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Caring.com API error:', error);
    }
    return null;
  }

  // Medicare.gov cost calculator integration
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

  // Aggregate pricing from multiple sources
  async getAggregatedPricing(communityId: number) {
    const community = await db.select().from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community[0]) return null;

    const pricingSources = [];

    // 1. Database pricing (most trusted)
    if (community[0].priceRange) {
      pricingSources.push({
        source: 'Database',
        priceRange: community[0].priceRange,
        verified: !!community[0].hudPropertyId,
        lastUpdated: community[0].updatedAt
      });
    }

    // 2. HUD pricing (government verified)
    if (community[0].hudPropertyId && community[0].rentPerMonth) {
      pricingSources.push({
        source: 'HUD',
        price: community[0].rentPerMonth,
        verified: true,
        lastUpdated: new Date()
      });
    }

    // 3. External API pricing
    const aplaceForMomData = await this.fetchAPlaceForMomPricing(
      community[0].name, 
      `${community[0].city}, ${community[0].state}`
    );
    
    if (aplaceForMomData) {
      pricingSources.push({
        source: 'A Place for Mom',
        priceRange: aplaceForMomData.priceRange,
        verified: false,
        lastUpdated: new Date()
      });
    }

    // 4. Calculate confidence score
    const confidenceScore = this.calculatePricingConfidence(pricingSources);

    return {
      communityId,
      sources: pricingSources,
      recommendedRange: this.calculateRecommendedRange(pricingSources),
      confidenceScore,
      lastChecked: new Date()
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