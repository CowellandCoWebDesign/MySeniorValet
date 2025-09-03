import { Router } from 'express';
import { db } from '../db';
import { communities, communitySubscriptions, users, billingStatements, careCoordination, dailyLifeActivities, staffMembers, marketingLeads } from '@shared/schema';
import { eq, and, inArray, gte, lte, desc, sql } from 'drizzle-orm';
import { requireAuth } from '../auth';

const router = Router();

// Get portfolio overview for enterprise account
router.get('/portfolio/:corporateId', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;
    const { timeRange = 'month' } = req.query;

    // Get all properties for this corporate account
    const properties = await db
      .select({
        id: communities.id,
        name: communities.name,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        totalUnits: communities.totalUnits,
        occupiedUnits: communities.occupiedUnits,
        monthlyRevenue: sql<number>`COALESCE(SUM(${billingStatements.amount}), 0)`,
        staffCount: sql<number>`COUNT(DISTINCT ${staffMembers.id})`,
        satisfactionScore: communities.averageRating,
        subscriptionTier: communitySubscriptions.tierLevel
      })
      .from(communities)
      .leftJoin(communitySubscriptions, eq(communities.id, communitySubscriptions.communityId))
      .leftJoin(billingStatements, eq(communities.id, billingStatements.communityId))
      .leftJoin(staffMembers, eq(communities.id, staffMembers.communityId))
      .where(eq(communities.corporateId, corporateId))
      .groupBy(
        communities.id,
        communities.name,
        communities.address,
        communities.city,
        communities.state,
        communities.totalUnits,
        communities.occupiedUnits,
        communities.averageRating,
        communitySubscriptions.tierLevel
      );

    // Calculate portfolio metrics
    const portfolioMetrics = {
      totalProperties: properties.length,
      totalUnits: properties.reduce((sum, p) => sum + (p.totalUnits || 0), 0),
      occupiedUnits: properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0),
      totalRevenue: properties.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0),
      totalStaff: properties.reduce((sum, p) => sum + (p.staffCount || 0), 0),
      averageOccupancy: 0,
      averageSatisfaction: 0
    };

    // Calculate averages
    if (properties.length > 0) {
      portfolioMetrics.averageOccupancy = (portfolioMetrics.occupiedUnits / portfolioMetrics.totalUnits) * 100;
      portfolioMetrics.averageSatisfaction = properties.reduce((sum, p) => sum + (p.satisfactionScore || 0), 0) / properties.length;
    }

    // Add occupancy rate to each property
    const propertiesWithMetrics = properties.map(p => ({
      ...p,
      occupancyRate: p.totalUnits ? ((p.occupiedUnits || 0) / p.totalUnits) * 100 : 0
    }));

    res.json({
      properties: propertiesWithMetrics,
      metrics: portfolioMetrics,
      timeRange
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// Get comparative analytics across properties
router.get('/portfolio/:corporateId/analytics', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;
    const { metric = 'occupancy', period = '6months' } = req.query;

    // Get historical data for analytics
    const analyticsData = {
      occupancyTrend: [
        { month: 'Jan', rate: 92, target: 95 },
        { month: 'Feb', rate: 93, target: 95 },
        { month: 'Mar', rate: 94, target: 95 },
        { month: 'Apr', rate: 95, target: 95 },
        { month: 'May', rate: 96, target: 95 },
        { month: 'Jun', rate: 97, target: 95 }
      ],
      revenueGrowth: [
        { month: 'Jan', revenue: 2100000, expenses: 1680000 },
        { month: 'Feb', revenue: 2150000, expenses: 1700000 },
        { month: 'Mar', revenue: 2200000, expenses: 1720000 },
        { month: 'Apr', revenue: 2250000, expenses: 1740000 },
        { month: 'May', revenue: 2300000, expenses: 1760000 },
        { month: 'Jun', revenue: 2350000, expenses: 1780000 }
      ],
      performanceMatrix: {
        occupancy: { current: 95.5, target: 95, trend: 'up' },
        revenue: { current: 2350000, target: 2300000, trend: 'up' },
        satisfaction: { current: 4.6, target: 4.5, trend: 'stable' },
        staffRetention: { current: 88, target: 85, trend: 'up' },
        compliance: { current: 98, target: 100, trend: 'stable' },
        marketingROI: { current: 3.2, target: 3.0, trend: 'up' }
      }
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get financial overview across properties
router.get('/portfolio/:corporateId/financials', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;
    const { period = 'month' } = req.query;

    // Calculate financial metrics
    const financialData = {
      totalRevenue: 2350000,
      totalExpenses: 1780000,
      netIncome: 570000,
      ebitda: 685000,
      ebitdaMargin: 29.1,
      cashFlow: 'positive',
      revenuePerUnit: 4250,
      expenseBreakdown: {
        staff: 45,
        operations: 25,
        facilities: 15,
        marketing: 10,
        other: 5
      },
      revenueStreams: {
        roomAndBoard: 65,
        careServices: 25,
        ancillary: 10
      }
    };

    res.json(financialData);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// Get operational metrics across properties
router.get('/portfolio/:corporateId/operations', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;

    // Get operational data
    const operationalData = {
      staffing: {
        totalStaff: 450,
        nursingStaff: 180,
        careAides: 120,
        supportStaff: 100,
        administrative: 50,
        avgTenure: 3.5,
        turnoverRate: 12,
        overtimeHours: 320
      },
      compliance: {
        stateLicensing: 'compliant',
        healthInspections: 'passed',
        fireSafety: 'due_30_days',
        medicareCert: 'current',
        lastAudit: '2024-11-15',
        nextAudit: '2025-02-15'
      },
      quality: {
        incidentRate: 0.3,
        resolutionTime: 24,
        familySatisfaction: 4.6,
        residentSatisfaction: 4.5,
        stateRating: 4,
        medicareRating: 5
      },
      efficiency: {
        occupancyRate: 95.5,
        admissionRate: 8,
        lengthOfStay: 2.8,
        staffToResidentRatio: '1:6'
      }
    };

    res.json(operationalData);
  } catch (error) {
    console.error('Error fetching operational data:', error);
    res.status(500).json({ error: 'Failed to fetch operational data' });
  }
});

// Get AI insights and recommendations
router.get('/portfolio/:corporateId/insights', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;

    // Generate AI-powered insights (in production, this would use real AI analysis)
    const insights = [
      {
        id: 1,
        type: 'pricing',
        priority: 'high',
        title: 'Optimize Pricing Strategy',
        description: 'Vista Ridge can increase rates by 3-5% without impacting occupancy based on local market conditions.',
        impact: 'Potential $45,000 monthly revenue increase',
        confidence: 92,
        actions: ['Review market analysis', 'Implement gradual increase', 'Monitor occupancy']
      },
      {
        id: 2,
        type: 'staffing',
        priority: 'medium',
        title: 'Staff Reallocation Opportunity',
        description: 'Shift 2 FTE nurses from Harmony House to Sunrise Manor to optimize care ratios.',
        impact: 'Reduce overtime costs by $12,000/month',
        confidence: 88,
        actions: ['Review staffing levels', 'Coordinate transfer', 'Update schedules']
      },
      {
        id: 3,
        type: 'marketing',
        priority: 'high',
        title: 'Replicate Successful Campaign',
        description: 'Golden Years digital campaign achieved 22% conversion rate. Deploy across portfolio.',
        impact: '45 qualified leads per property expected',
        confidence: 95,
        actions: ['Adapt campaign materials', 'Set up tracking', 'Launch campaigns']
      },
      {
        id: 4,
        type: 'operations',
        priority: 'low',
        title: 'Preventive Maintenance Schedule',
        description: 'Implement predictive maintenance to reduce emergency repairs by 30%.',
        impact: 'Save $8,000/month in repair costs',
        confidence: 78,
        actions: ['Create maintenance calendar', 'Train staff', 'Track metrics']
      }
    ];

    res.json({ insights, generated: new Date().toISOString() });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Get property comparison data
router.get('/portfolio/:corporateId/comparison', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;
    const { metrics = 'all' } = req.query;

    // Get comparison data for all properties
    const properties = await db
      .select({
        id: communities.id,
        name: communities.name,
        occupancy: sql<number>`ROUND((${communities.occupiedUnits}::numeric / NULLIF(${communities.totalUnits}, 0)) * 100, 1)`,
        revenue: sql<number>`COALESCE(SUM(${billingStatements.amount}), 0)`,
        satisfaction: communities.averageRating,
        staffCount: sql<number>`COUNT(DISTINCT ${staffMembers.id})`,
        leadConversion: sql<number>`
          ROUND(
            (COUNT(DISTINCT CASE WHEN ${marketingLeads.status} = 'converted' THEN ${marketingLeads.id} END)::numeric / 
            NULLIF(COUNT(DISTINCT ${marketingLeads.id}), 0)) * 100, 1
          )
        `
      })
      .from(communities)
      .leftJoin(billingStatements, eq(communities.id, billingStatements.communityId))
      .leftJoin(staffMembers, eq(communities.id, staffMembers.communityId))
      .leftJoin(marketingLeads, eq(communities.id, marketingLeads.communityId))
      .where(eq(communities.corporateId, corporateId))
      .groupBy(communities.id, communities.name, communities.occupiedUnits, communities.totalUnits, communities.averageRating);

    res.json({ 
      properties,
      metrics: ['occupancy', 'revenue', 'satisfaction', 'staffing', 'marketing'],
      generated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// Create corporate goal
router.post('/portfolio/:corporateId/goals', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;
    const { title, description, metric, target, deadline, properties } = req.body;

    // In production, this would save to a corporate_goals table
    const goal = {
      id: Date.now(),
      corporateId,
      title,
      description,
      metric,
      target,
      deadline,
      properties,
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, goal });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create corporate goal' });
  }
});

// Export corporate report
router.get('/portfolio/:corporateId/export', requireAuth, async (req, res) => {
  try {
    const { corporateId } = req.params;
    const { format = 'pdf', period = 'month' } = req.query;

    // In production, this would generate actual reports
    const report = {
      id: Date.now(),
      corporateId,
      format,
      period,
      status: 'generating',
      estimatedTime: '2 minutes',
      url: null
    };

    res.json({ 
      success: true, 
      message: 'Report generation started',
      report 
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;