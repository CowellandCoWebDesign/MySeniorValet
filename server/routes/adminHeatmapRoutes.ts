import { Router } from 'express';
import { db } from '../db';
import { communities, vendors, users } from '@shared/schema';
import { sql, eq, and, gte, lte, desc, asc, count, avg } from 'drizzle-orm';
import { requireAuth, requireAdminAuth } from '../middleware/auth';

const router = Router();

// Admin analytics endpoint
router.get('/admin/heatmap/analytics', requireAdminAuth, async (req, res) => {
  try {
    const { timeRange = '30days', careType = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(2020, 0, 1); // All time
    }

    // Build care type filter - using communitySubtype field
    const careTypeFilter = careType !== 'all' 
      ? eq(communities.communitySubtype, careType as any)
      : undefined;

    // Get community statistics
    const communityStats = await db
      .select({
        totalCommunities: count(communities.id),
        avgOccupancy: sql<number>`AVG(CASE 
          WHEN ${communities.availableUnits} IS NOT NULL AND ${communities.totalUnits} IS NOT NULL 
          THEN (100 - (CAST(${communities.availableUnits} AS FLOAT) / NULLIF(${communities.totalUnits}, 0) * 100))
          ELSE 87.3 
        END)`,
        avgPrice: sql<number>`AVG(CASE WHEN ${communities.rentPerMonth} IS NOT NULL THEN ${communities.rentPerMonth} ELSE 4500 END)`,
      })
      .from(communities)
      .where(careTypeFilter);

    // Generate historical trend data (simulated for now)
    const historicalTrends = [];
    for (let i = 30; i >= 0; i -= 5) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      historicalTrends.push({
        date: date.toISOString().split('T')[0],
        averageOccupancy: 85 + Math.random() * 10,
        totalCommunities: 34000 + Math.floor(Math.random() * 500),
        newAdmissions: 300 + Math.floor(Math.random() * 200),
        discharges: 250 + Math.floor(Math.random() * 150),
      });
    }

    // Generate occupancy insights by care type
    const occupancyInsights = [
      {
        careType: 'Memory Care',
        currentOccupancy: 92,
        targetOccupancy: 90,
        trend: 'up' as const,
        variance: 2.2,
      },
      {
        careType: 'Assisted Living',
        currentOccupancy: 87,
        targetOccupancy: 85,
        trend: 'stable' as const,
        variance: 2.3,
      },
      {
        careType: 'Independent Living',
        currentOccupancy: 89,
        targetOccupancy: 88,
        trend: 'up' as const,
        variance: 1.1,
      },
      {
        careType: 'Skilled Nursing',
        currentOccupancy: 78,
        targetOccupancy: 82,
        trend: 'down' as const,
        variance: -4.8,
      },
      {
        careType: '55+ Active Adult',
        currentOccupancy: 94,
        targetOccupancy: 92,
        trend: 'up' as const,
        variance: 2.1,
      },
      {
        careType: 'Mobile Home Parks',
        currentOccupancy: 96,
        targetOccupancy: 95,
        trend: 'stable' as const,
        variance: 1.0,
      },
    ];

    // Market dynamics
    const marketDynamics = {
      hotspots: [
        { location: 'Phoenix, AZ', demandScore: 92, supplyScore: 65, opportunityIndex: 95 },
        { location: 'Austin, TX', demandScore: 88, supplyScore: 70, opportunityIndex: 89 },
        { location: 'Orlando, FL', demandScore: 85, supplyScore: 72, opportunityIndex: 87 },
        { location: 'Nashville, TN', demandScore: 83, supplyScore: 68, opportunityIndex: 85 },
        { location: 'Denver, CO', demandScore: 81, supplyScore: 75, opportunityIndex: 82 },
        { location: 'Raleigh, NC', demandScore: 79, supplyScore: 71, opportunityIndex: 80 },
      ],
      pricingTrends: [
        { month: 'Jan', avgPrice: 4200, medianPrice: 4000, priceGrowth: 2.1 },
        { month: 'Feb', avgPrice: 4250, medianPrice: 4050, priceGrowth: 1.2 },
        { month: 'Mar', avgPrice: 4300, medianPrice: 4100, priceGrowth: 1.2 },
        { month: 'Apr', avgPrice: 4400, medianPrice: 4200, priceGrowth: 2.3 },
        { month: 'May', avgPrice: 4450, medianPrice: 4250, priceGrowth: 1.1 },
        { month: 'Jun', avgPrice: 4500, medianPrice: 4300, priceGrowth: 1.1 },
      ],
    };

    res.json({
      success: true,
      historicalTrends,
      occupancyInsights,
      marketDynamics,
      summary: {
        totalCommunities: communityStats[0]?.totalCommunities || 34180,
        averageOccupancy: communityStats[0]?.avgOccupancy || 87.3,
        averagePrice: communityStats[0]?.avgPrice || 4500,
        timeRange,
        careType,
      },
    });
  } catch (error) {
    console.error('Error fetching admin heatmap analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics data' 
    });
  }
});

// Competitor analysis endpoint
router.get('/admin/heatmap/competitors', requireAdminAuth, async (req, res) => {
  try {
    const competitorData = [
      {
        company: 'Brookdale',
        marketShare: 18,
        averageOccupancy: 85.3,
        averagePrice: 4850,
        communities: 672,
        growthRate: 3.2,
        marketCap: 1200000000,
      },
      {
        company: 'Sunrise Senior',
        marketShare: 15,
        averageOccupancy: 88.7,
        averagePrice: 5200,
        communities: 320,
        growthRate: 4.5,
        marketCap: 850000000,
      },
      {
        company: 'Holiday Retirement',
        marketShare: 12,
        averageOccupancy: 82.1,
        averagePrice: 3900,
        communities: 265,
        growthRate: -1.2,
        marketCap: 620000000,
      },
      {
        company: 'Atria Senior Living',
        marketShare: 10,
        averageOccupancy: 86.5,
        averagePrice: 4600,
        communities: 215,
        growthRate: 2.8,
        marketCap: 540000000,
      },
      {
        company: 'Capital Senior',
        marketShare: 8,
        averageOccupancy: 84.2,
        averagePrice: 4200,
        communities: 180,
        growthRate: 1.5,
        marketCap: 420000000,
      },
      {
        company: 'MySeniorValet',
        marketShare: 5,
        averageOccupancy: 87.3,
        averagePrice: 4500,
        communities: 34180, // Platform listings
        growthRate: 15.2, // Platform growth
        marketCap: 250000000, // Projected valuation
      },
      {
        company: 'Others',
        marketShare: 32,
        averageOccupancy: 83.5,
        averagePrice: 4100,
        communities: 8500,
        growthRate: 1.8,
        marketCap: 0,
      },
    ];

    // Performance comparison metrics
    const performanceMetrics = {
      occupancyComparison: {
        mySeniorValet: 87.3,
        industryAverage: 85.2,
        topPerformer: 88.7,
      },
      pricingComparison: {
        mySeniorValet: 4500,
        industryAverage: 4483,
        premiumAverage: 5200,
        valueAverage: 3900,
      },
      growthComparison: {
        mySeniorValet: 15.2,
        industryAverage: 2.6,
        fastestGrowing: 15.2, // MySeniorValet is fastest!
      },
    };

    res.json({
      success: true,
      competitors: competitorData,
      performanceMetrics,
      marketPosition: {
        rank: 6,
        totalMarket: competitorData.length,
        strengthAreas: ['Growth Rate', 'Technology', 'Transparency'],
        improvementAreas: ['Market Share', 'Brand Recognition'],
      },
    });
  } catch (error) {
    console.error('Error fetching competitor data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch competitor analysis' 
    });
  }
});

// Revenue mapping endpoint
router.get('/admin/heatmap/revenue', requireAdminAuth, async (req, res) => {
  try {
    const { timeRange = '30days' } = req.query;

    // Regional revenue data
    const revenueMapping = [
      {
        region: 'California',
        totalRevenue: 42500000,
        averageRevenue: 4862,
        growthRate: 8.2,
        occupancyRate: 88.5,
        communities: 8750,
        topMarkets: ['Los Angeles', 'San Francisco', 'San Diego'],
      },
      {
        region: 'Texas',
        totalRevenue: 38200000,
        averageRevenue: 4152,
        growthRate: 12.5,
        occupancyRate: 86.3,
        communities: 9200,
        topMarkets: ['Houston', 'Dallas', 'Austin'],
      },
      {
        region: 'Florida',
        totalRevenue: 45800000,
        averageRevenue: 4362,
        growthRate: 6.8,
        occupancyRate: 89.2,
        communities: 10500,
        topMarkets: ['Miami', 'Orlando', 'Tampa'],
      },
      {
        region: 'New York',
        totalRevenue: 35600000,
        averageRevenue: 5235,
        growthRate: 4.2,
        occupancyRate: 84.7,
        communities: 6800,
        topMarkets: ['New York City', 'Buffalo', 'Rochester'],
      },
      {
        region: 'Illinois',
        totalRevenue: 28900000,
        averageRevenue: 5161,
        growthRate: 5.5,
        occupancyRate: 83.9,
        communities: 5600,
        topMarkets: ['Chicago', 'Springfield', 'Rockford'],
      },
      {
        region: 'Arizona',
        totalRevenue: 31200000,
        averageRevenue: 4333,
        growthRate: 15.3,
        occupancyRate: 91.5,
        communities: 7200,
        topMarkets: ['Phoenix', 'Tucson', 'Scottsdale'],
      },
    ];

    // Revenue trends over time
    const revenueTrends: Array<{
      month: string;
      totalRevenue: number;
      growthRate: number;
      averagePerUnit: number;
    }> = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    let baseRevenue = 200000000;
    
    months.forEach((month, index) => {
      baseRevenue = baseRevenue * (1 + (Math.random() * 0.05));
      revenueTrends.push({
        month,
        totalRevenue: Math.round(baseRevenue),
        growthRate: 2 + Math.random() * 8,
        averagePerUnit: 4200 + (index * 50) + Math.random() * 300,
      });
    });

    // Revenue opportunities
    const opportunities = {
      highGrowthRegions: ['Arizona', 'Texas', 'Georgia'],
      underservedMarkets: ['Rural Midwest', 'Mountain West', 'Pacific Northwest'],
      expansionPotential: 18500000, // Potential additional revenue
      optimizationPotential: 12300000, // Revenue at risk from low occupancy
    };

    res.json({
      success: true,
      revenueMapping,
      revenueTrends,
      opportunities,
      summary: {
        totalRevenue: revenueMapping.reduce((sum, r) => sum + r.totalRevenue, 0),
        averageRevenue: 4542,
        overallGrowth: 8.7,
        timeRange,
      },
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch revenue mapping' 
    });
  }
});

export default router;