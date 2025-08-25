import { Router } from "express";

const router = Router();

interface EnterpriseAnalysisRequest {
  communityId: number;
  location: string;
  radius: number;
  type: 'comprehensive' | 'pricing' | 'positioning' | 'opportunities';
}

// Enterprise market analysis endpoint
router.post('/market-analysis', async (req, res) => {
  try {
    const { communityId, location, radius, type } = req.body as EnterpriseAnalysisRequest;

    if (!communityId || !location || !radius) {
      return res.status(400).json({ 
        error: 'Missing required fields: communityId, location, radius' 
      });
    }

    // Get community details
    const { db } = await import('../db');
    const { communities } = await import('../../shared/schema');
    const { eq, ilike, ne, isNotNull, sql } = await import('drizzle-orm');
    
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Find competing communities in the area using Drizzle ORM
    const competitors = await db
      .select({
        id: communities.id,
        name: communities.name,
        city: communities.city,
        state: communities.state,
        type: communities.careType,
        averageCost: communities.pricing,
        rating: communities.averageRating,
        amenityCount: sql<number>`COALESCE(${communities.amenityCount}, 15)`,
        occupancyRate: sql<number>`COALESCE(${communities.occupancyPercentage}, 85)`,
        marketPosition: sql<string>`
          CASE 
            WHEN ${communities.pricing} >= 8000 THEN 'luxury'
            WHEN ${communities.pricing} >= 5000 THEN 'premium'  
            WHEN ${communities.pricing} >= 3000 THEN 'value'
            ELSE 'budget'
          END
        `
      })
      .from(communities)
      .where(
        sql`${ne(communities.id, communityId)} 
            AND ${ilike(communities.city, `%${community.city}%`)}
            AND ${communities.state} = ${community.state}
            AND ${isNotNull(communities.pricing)}`
      )
      .orderBy(sql`${communities.pricing} DESC`)
      .limit(20);

    // Mock AI analysis for now - replace with actual AI service
    const mockAiInsights = `Enterprise market analysis for "${community.name}" shows competitive positioning in the ${community.pricing >= 5000 ? 'premium' : 'value'} segment with ${competitors.length} direct competitors identified.`;

    // Process competitor data
    const directCompetitors = competitors.map((comp: any) => ({
      id: comp.id.toString(),
      name: comp.name,
      city: comp.city,
      state: comp.state,
      type: comp.type || 'Senior Living',
      averageCost: comp.averageCost || 4500,
      occupancyRate: comp.occupancyRate || 85,
      rating: comp.rating || 4.2,
      amenityCount: comp.amenityCount || 15,
      marketPosition: comp.marketPosition || 'value'
    }));

    // Calculate market metrics
    const avgPrice = directCompetitors.length > 0 ? 
      directCompetitors.reduce((sum, comp) => sum + comp.averageCost, 0) / directCompetitors.length : 4500;
    const avgOccupancy = directCompetitors.length > 0 ? 
      directCompetitors.reduce((sum, comp) => sum + comp.occupancyRate, 0) / directCompetitors.length : 85;
    
    // Market segmentation
    const luxuryCount = directCompetitors.filter(c => c.marketPosition === 'luxury').length;
    const premiumCount = directCompetitors.filter(c => c.marketPosition === 'premium').length;
    const valueCount = directCompetitors.filter(c => c.marketPosition === 'value').length;
    const budgetCount = directCompetitors.filter(c => c.marketPosition === 'budget').length;
    const total = Math.max(directCompetitors.length, 1);

    // Competitive advantages (calculation based on community data)
    const currentPrice = community.pricing || avgPrice;
    const pricingAdvantage = currentPrice < avgPrice ? 
      Math.min(100, ((avgPrice - currentPrice) / avgPrice) * 100 + 50) : 
      Math.max(0, 50 - ((currentPrice - avgPrice) / avgPrice) * 100);

    const response = {
      location,
      radius,
      totalCommunities: competitors.length + 1, // +1 for the focus community
      directCompetitors,
      marketInsights: {
        averageOccupancyRate: Math.round(avgOccupancy),
        averagePricing: Math.round(avgPrice),
        marketTrend: avgPrice > 4500 ? 'growing' : avgPrice > 3500 ? 'stable' : 'declining',
        demandSupplyRatio: 1.2,
        priceOptimizationRecommendation: `Based on market analysis, consider ${currentPrice > avgPrice ? 'reducing' : 'increasing'} pricing by ${Math.abs(Math.round(((currentPrice - avgPrice) / avgPrice) * 10))}% to optimize revenue while maintaining competitiveness.`,
        positioning: `Your community is positioned in the ${community.base_price >= 5000 ? 'premium' : community.base_price >= 3000 ? 'value' : 'budget'} segment of the local market.`,
        opportunities: [
          "Expand premium service offerings to justify higher pricing",
          "Develop partnerships with local healthcare providers",
          "Implement technology-driven care management",
          "Focus on specialized memory care programs"
        ],
        threats: [
          "New luxury developments entering the market",
          "Increasing labor costs affecting margins", 
          "Regulatory changes impacting operations",
          "Economic uncertainty affecting family decisions"
        ]
      },
      competitiveAdvantages: {
        pricingAdvantage: Math.round(pricingAdvantage),
        amenityAdvantage: Math.min(100, ((community.amenityCount || 15) / 20) * 100),
        locationAdvantage: 78, // Mock based on location analysis
        brandAdvantage: Math.min(100, ((community.averageRating || 4.2) / 5) * 100)
      },
      revenueOptimization: {
        suggestedPricing: Math.round(avgPrice * (currentPrice < avgPrice ? 1.08 : 0.95)),
        projectedOccupancy: Math.min(95, avgOccupancy + 5),
        revenueImpact: Math.round((avgPrice * 0.08) * 12 * 50), // Estimated annual impact
        recommendations: [
          "Implement dynamic pricing based on occupancy levels",
          "Introduce tiered pricing for different service levels",  
          "Consider seasonal pricing adjustments",
          "Bundle services to increase average revenue per resident"
        ]
      },
      marketSegmentation: {
        luxurySegment: Math.round((luxuryCount / total) * 100),
        premiumSegment: Math.round((premiumCount / total) * 100),
        valueSegment: Math.round((valueCount / total) * 100),
        budgetSegment: Math.round((budgetCount / total) * 100)
      },
      lastUpdated: new Date().toISOString()
    };

    res.json(response);

  } catch (error: any) {
    console.error('Enterprise market analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to generate enterprise market analysis',
      details: error.message 
    });
  }
});

export { router as enterpriseMarketRoutes };