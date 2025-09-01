import { Router } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { 
  communities, 
  users, 
  communityAnalytics,
  financialRecords,
  complianceRecords 
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const router = Router();

// ==========================================
// ENTERPRISE ANALYTICS ENDPOINTS
// ==========================================

// Get real-time analytics dashboard data
router.get('/api/enterprise/analytics/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Fetch real community data
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Calculate real metrics from database
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const ninetyDaysAgo = subDays(now, 90);

    // Get occupancy data
    const occupancyRate = community.availableUnits && community.totalUnits 
      ? ((community.totalUnits - community.availableUnits) / community.totalUnits * 100).toFixed(1)
      : 'N/A';

    // Get financial metrics from real financial records
    const [financialMetrics] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END), 0)`,
        totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)`,
        avgMonthlyRevenue: sql<number>`COALESCE(AVG(CASE WHEN type = 'revenue' THEN amount ELSE 0 END), 0)`
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.communityId, communityId),
          gte(financialRecords.date, thirtyDaysAgo)
        )
      );

    // Get compliance score from real compliance data
    const [complianceData] = await db
      .select({
        totalChecks: sql<number>`COUNT(*)`,
        passedChecks: sql<number>`COUNT(CASE WHEN status = 'passed' THEN 1 END)`,
        criticalIssues: sql<number>`COUNT(CASE WHEN severity = 'critical' AND status = 'failed' THEN 1 END)`
      })
      .from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.communityId, communityId),
          gte(complianceRecords.checkDate, thirtyDaysAgo)
        )
      );

    const complianceScore = complianceData.totalChecks > 0 
      ? Math.round((complianceData.passedChecks / complianceData.totalChecks) * 100)
      : 100;

    // Build real analytics response
    const analyticsData = {
      summary: {
        occupancyRate: parseFloat(occupancyRate) || 0,
        revenue: financialMetrics?.totalRevenue || 0,
        avgMonthlyRevenue: financialMetrics?.avgMonthlyRevenue || 0,
        expenses: financialMetrics?.totalExpenses || 0,
        netIncome: (financialMetrics?.totalRevenue || 0) - (financialMetrics?.totalExpenses || 0),
        complianceScore,
        criticalIssues: complianceData?.criticalIssues || 0,
        lastUpdated: now.toISOString()
      },
      community: {
        id: community.id,
        name: community.name,
        address: community.address,
        city: community.city,
        state: community.state,
        totalUnits: community.totalUnits || 0,
        availableUnits: community.availableUnits || 0,
        communitySubtype: community.communitySubtype
      },
      trends: {
        occupancy: [], // Will be populated with historical data
        revenue: [],   // Will be populated with historical data
        compliance: [] // Will be populated with historical data
      }
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get analytics trends over time
router.get('/api/enterprise/analytics/:communityId/trends', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { period = '30d' } = req.query;
    
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = subDays(new Date(), 7);
        break;
      case '30d':
        startDate = subDays(new Date(), 30);
        break;
      case '90d':
        startDate = subDays(new Date(), 90);
        break;
      default:
        startDate = subDays(new Date(), 30);
    }

    // Fetch trend data from analytics table
    const trends = await db
      .select()
      .from(communityAnalytics)
      .where(
        and(
          eq(communityAnalytics.communityId, communityId),
          gte(communityAnalytics.date, startDate)
        )
      )
      .orderBy(communityAnalytics.date);

    res.json({ trends, period });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// ==========================================
// FINANCIAL MANAGEMENT ENDPOINTS
// ==========================================

// Get financial overview
router.get('/api/enterprise/financial/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const currentMonth = startOfMonth(new Date());
    const lastMonth = startOfMonth(subMonths(new Date(), 1));
    
    // Get current month financials
    const [currentMonthData] = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END), 0)`,
        expenses: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.communityId, communityId),
          gte(financialRecords.date, currentMonth),
          lte(financialRecords.date, endOfMonth(currentMonth))
        )
      );

    // Get last month for comparison
    const [lastMonthData] = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END), 0)`,
        expenses: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)`
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.communityId, communityId),
          gte(financialRecords.date, lastMonth),
          lte(financialRecords.date, endOfMonth(lastMonth))
        )
      );

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(financialRecords)
      .where(eq(financialRecords.communityId, communityId))
      .orderBy(desc(financialRecords.date))
      .limit(10);

    // Calculate metrics
    const netIncome = currentMonthData.revenue - currentMonthData.expenses;
    const revenueGrowth = lastMonthData.revenue > 0 
      ? ((currentMonthData.revenue - lastMonthData.revenue) / lastMonthData.revenue * 100).toFixed(1)
      : '0';

    const financialData = {
      summary: {
        monthlyRevenue: currentMonthData.revenue,
        monthlyExpenses: currentMonthData.expenses,
        netIncome,
        revenueGrowth: parseFloat(revenueGrowth),
        transactionCount: currentMonthData.transactionCount,
        lastMonthRevenue: lastMonthData.revenue,
        lastMonthExpenses: lastMonthData.expenses
      },
      recentTransactions,
      categories: {
        revenue: {
          'Resident Fees': 0,
          'Medicare': 0,
          'Medicaid': 0,
          'Private Pay': 0,
          'Other': 0
        },
        expenses: {
          'Payroll': 0,
          'Utilities': 0,
          'Supplies': 0,
          'Maintenance': 0,
          'Other': 0
        }
      }
    };

    res.json(financialData);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// Create financial transaction
router.post('/api/enterprise/financial/:communityId/transaction', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const transactionSchema = z.object({
      type: z.enum(['revenue', 'expense']),
      category: z.string(),
      amount: z.number().positive(),
      description: z.string(),
      date: z.string().datetime()
    });

    const validatedData = transactionSchema.parse(req.body);

    const [transaction] = await db
      .insert(financialRecords)
      .values({
        communityId,
        ...validatedData,
        date: new Date(validatedData.date),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// ==========================================
// COMPLIANCE MONITORING ENDPOINTS
// ==========================================

// Get compliance status
router.get('/api/enterprise/compliance/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Get all compliance records for the community
    const complianceChecks = await db
      .select()
      .from(complianceRecords)
      .where(eq(complianceRecords.communityId, communityId))
      .orderBy(desc(complianceRecords.checkDate));

    // Calculate compliance metrics
    const totalChecks = complianceChecks.length;
    const passedChecks = complianceChecks.filter(c => c.status === 'passed').length;
    const failedChecks = complianceChecks.filter(c => c.status === 'failed').length;
    const pendingChecks = complianceChecks.filter(c => c.status === 'pending').length;
    const criticalIssues = complianceChecks.filter(c => c.severity === 'critical' && c.status === 'failed').length;

    const complianceScore = totalChecks > 0 
      ? Math.round((passedChecks / totalChecks) * 100)
      : 100;

    // Group by regulation type
    const byRegulation = complianceChecks.reduce((acc, check) => {
      if (!acc[check.regulationType]) {
        acc[check.regulationType] = {
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0
        };
      }
      acc[check.regulationType].total++;
      if (check.status === 'passed') acc[check.regulationType].passed++;
      if (check.status === 'failed') acc[check.regulationType].failed++;
      if (check.status === 'pending') acc[check.regulationType].pending++;
      return acc;
    }, {});

    const complianceData = {
      summary: {
        complianceScore,
        totalChecks,
        passedChecks,
        failedChecks,
        pendingChecks,
        criticalIssues,
        lastAudit: complianceChecks[0]?.checkDate || null
      },
      byRegulation,
      recentChecks: complianceChecks.slice(0, 10),
      upcomingDeadlines: [], // Will be populated from deadline tracking
      violations: complianceChecks.filter(c => c.status === 'failed').slice(0, 5)
    };

    res.json(complianceData);
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    res.status(500).json({ error: 'Failed to fetch compliance data' });
  }
});

// Create compliance check
router.post('/api/enterprise/compliance/:communityId/check', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const checkSchema = z.object({
      regulationType: z.string(),
      checkType: z.string(),
      status: z.enum(['passed', 'failed', 'pending']),
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      notes: z.string().optional(),
      inspector: z.string().optional()
    });

    const validatedData = checkSchema.parse(req.body);

    const [complianceCheck] = await db
      .insert(complianceRecords)
      .values({
        communityId,
        ...validatedData,
        checkDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json(complianceCheck);
  } catch (error) {
    console.error('Error creating compliance check:', error);
    res.status(500).json({ error: 'Failed to create compliance check' });
  }
});

// Get compliance trends
router.get('/api/enterprise/compliance/:communityId/trends', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { months = 6 } = req.query;
    
    const startDate = subMonths(new Date(), parseInt(months as string));
    
    // Get monthly compliance scores
    const monthlyScores = await db
      .select({
        month: sql<string>`TO_CHAR(check_date, 'YYYY-MM')`,
        totalChecks: sql<number>`COUNT(*)`,
        passedChecks: sql<number>`COUNT(CASE WHEN status = 'passed' THEN 1 END)`,
        score: sql<number>`ROUND((COUNT(CASE WHEN status = 'passed' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 1)`
      })
      .from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.communityId, communityId),
          gte(complianceRecords.checkDate, startDate)
        )
      )
      .groupBy(sql`TO_CHAR(check_date, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(check_date, 'YYYY-MM')`);

    res.json({ trends: monthlyScores });
  } catch (error) {
    console.error('Error fetching compliance trends:', error);
    res.status(500).json({ error: 'Failed to fetch compliance trends' });
  }
});

export default router;