import { Router } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { 
  communities, 
  users, 
  communityAnalytics,
  financialRecords,
  complianceRecords,
  enterpriseResidents,
  enterpriseStaff,
  enterpriseFamilies,
  staffSchedules
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql, inArray } from 'drizzle-orm';
import * as schema from '@shared/schema';
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

// ==========================================
// PHASE 2: PEOPLE SYSTEMS ENDPOINTS
// ==========================================

// Residents Management
router.get('/api/enterprise/residents/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { status, careLevel } = req.query;
    
    let conditions = [eq(schema.enterpriseResidents.communityId, parseInt(communityId))];
    
    // Apply filters if provided
    if (status) {
      conditions.push(eq(schema.enterpriseResidents.status, status as string));
    }
    if (careLevel) {
      conditions.push(eq(schema.enterpriseResidents.careLevel, careLevel as string));
    }
    
    const residents = await db
      .select()
      .from(schema.enterpriseResidents)
      .where(and(...conditions))
      .orderBy(desc(schema.enterpriseResidents.createdAt));
    
    // Calculate summary statistics
    const summary = {
      totalResidents: residents.length,
      byStatus: {
        active: residents.filter(r => r.status === 'active').length,
        discharged: residents.filter(r => r.status === 'discharged').length,
        temporaryLeave: residents.filter(r => r.status === 'temporary_leave').length
      },
      byCareLevel: {
        independent: residents.filter(r => r.careLevel === 'Independent').length,
        assisted: residents.filter(r => r.careLevel === 'Assisted').length,
        memoryCare: residents.filter(r => r.careLevel === 'Memory Care').length,
        skilled: residents.filter(r => r.careLevel === 'Skilled').length
      },
      occupancyRate: 0, // Will be calculated based on capacity
      avgAge: residents.length > 0 
        ? Math.round(residents.reduce((sum, r) => {
            const age = r.dateOfBirth ? new Date().getFullYear() - new Date(r.dateOfBirth).getFullYear() : 0;
            return sum + age;
          }, 0) / residents.length)
        : 0
    };
    
    res.json({ residents, summary });
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

// Staff Management
router.get('/api/enterprise/staff/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { department, status, shift } = req.query;
    
    let conditions = [eq(schema.enterpriseStaff.communityId, parseInt(communityId))];
    
    // Apply filters
    if (department) {
      conditions.push(eq(schema.enterpriseStaff.department, department as string));
    }
    if (status) {
      conditions.push(eq(schema.enterpriseStaff.status, status as string));
    }
    if (shift) {
      conditions.push(eq(schema.enterpriseStaff.shift, shift as string));
    }
    
    const staff = await db
      .select()
      .from(schema.enterpriseStaff)
      .where(and(...conditions))
      .orderBy(desc(schema.enterpriseStaff.createdAt));
    
    // Calculate summary
    const summary = {
      totalStaff: staff.length,
      byDepartment: {
        nursing: staff.filter(s => s.department === 'Nursing').length,
        administration: staff.filter(s => s.department === 'Administration').length,
        maintenance: staff.filter(s => s.department === 'Maintenance').length,
        dietary: staff.filter(s => s.department === 'Dietary').length,
        activities: staff.filter(s => s.department === 'Activities').length,
        other: staff.filter(s => !['Nursing', 'Administration', 'Maintenance', 'Dietary', 'Activities'].includes(s.department)).length
      },
      byStatus: {
        active: staff.filter(s => s.status === 'active').length,
        onLeave: staff.filter(s => s.status === 'on_leave').length,
        terminated: staff.filter(s => s.status === 'terminated').length
      },
      byShift: {
        day: staff.filter(s => s.shift === 'day').length,
        evening: staff.filter(s => s.shift === 'evening').length,
        night: staff.filter(s => s.shift === 'night').length
      },
      avgTenure: staff.length > 0
        ? Math.round(staff.reduce((sum, s) => {
            const years = s.hireDate ? (new Date().getTime() - new Date(s.hireDate).getTime()) / (365 * 24 * 60 * 60 * 1000) : 0;
            return sum + years;
          }, 0) / staff.length * 10) / 10
        : 0
    };
    
    res.json({ staff, summary });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Staff Schedules
router.get('/api/enterprise/schedules/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { date, startDate, endDate, staffId } = req.query;
    
    let conditions = [eq(schema.staffSchedules.communityId, parseInt(communityId))];
    
    // Apply date filters
    if (date) {
      conditions.push(eq(schema.staffSchedules.date, date as string));
    } else if (startDate && endDate) {
      conditions.push(gte(schema.staffSchedules.date, startDate as string));
      conditions.push(lte(schema.staffSchedules.date, endDate as string));
    }
    
    if (staffId) {
      conditions.push(eq(schema.staffSchedules.staffId, parseInt(staffId as string)));
    }
    
    const schedules = await db
      .select({
        schedule: schema.staffSchedules,
        staff: schema.enterpriseStaff
      })
      .from(schema.staffSchedules)
      .leftJoin(
        schema.enterpriseStaff,
        eq(schema.staffSchedules.staffId, schema.enterpriseStaff.id)
      )
      .where(and(...conditions));
    
    // Calculate coverage metrics
    const summary = {
      totalShifts: schedules.length,
      byShift: {
        day: schedules.filter(s => s.schedule.shiftType === 'day').length,
        evening: schedules.filter(s => s.schedule.shiftType === 'evening').length,
        night: schedules.filter(s => s.schedule.shiftType === 'night').length
      },
      coverage: {
        scheduled: schedules.filter(s => s.schedule.status === 'scheduled').length,
        confirmed: schedules.filter(s => s.schedule.status === 'confirmed').length,
        completed: schedules.filter(s => s.schedule.status === 'completed').length,
        cancelled: schedules.filter(s => s.schedule.status === 'cancelled').length,
        noShow: schedules.filter(s => s.schedule.status === 'no_show').length
      },
      overtimeHours: schedules.reduce((sum, s) => sum + (s.schedule.overtimeHours || 0), 0)
    };
    
    res.json({ schedules, summary });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Family Members
router.get('/api/enterprise/families/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Get all residents for this community first
    const residents = await db
      .select()
      .from(schema.enterpriseResidents)
      .where(eq(schema.enterpriseResidents.communityId, parseInt(communityId)));
    
    const residentIds = residents.map(r => r.id);
    
    if (residentIds.length === 0) {
      res.json({ families: [], summary: { totalFamilies: 0 } });
      return;
    }
    
    // Get all family members for these residents
    const families = await db
      .select({
        family: schema.enterpriseFamilies,
        resident: schema.enterpriseResidents
      })
      .from(schema.enterpriseFamilies)
      .leftJoin(
        schema.enterpriseResidents,
        eq(schema.enterpriseFamilies.residentId, schema.enterpriseResidents.id)
      )
      .where(inArray(schema.enterpriseFamilies.residentId, residentIds));
    
    // Calculate summary
    const summary = {
      totalFamilies: families.length,
      byRelationship: {
        spouse: families.filter(f => f.family.relationship === 'spouse').length,
        child: families.filter(f => f.family.relationship === 'child').length,
        sibling: families.filter(f => f.family.relationship === 'sibling').length,
        other: families.filter(f => !['spouse', 'child', 'sibling'].includes(f.family.relationship)).length
      },
      withPortalAccess: families.filter(f => f.family.hasPortalAccess).length,
      primaryContacts: families.filter(f => f.family.isPrimaryContact).length,
      emergencyContacts: families.filter(f => f.family.isEmergencyContact).length
    };
    
    res.json({ families, summary });
  } catch (error) {
    console.error('Error fetching families:', error);
    res.status(500).json({ error: 'Failed to fetch families' });
  }
});

export default router;