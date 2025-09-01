import { Router } from 'express';
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';
import { isAuthenticated } from '../auth-middleware';

const router = Router();

// Get financial overview for a community
router.get('/api/enterprise/financials/:communityId', isAuthenticated, async (req, res) => {
  try {
    const { communityId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Date range defaults to current month
    const now = new Date();
    const end = endDate ? new Date(endDate as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const start = startDate ? new Date(startDate as string) : new Date(now.getFullYear(), now.getMonth(), 1);

    // Get community details
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, parseInt(communityId)));

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Financial Data
    const financialData = {
      summary: {
        totalRevenue: 487650,
        totalExpenses: 312450,
        netIncome: 175200,
        profitMargin: '35.9%',
        cashFlow: 182500,
        occupancyRate: '92%',
        avgRentPerUnit: 4850,
        totalUnits: community.totalUnits || 100
      },
      revenue: {
        monthly: {
          rent: 445000,
          careServices: 28500,
          meals: 8750,
          activities: 2400,
          laundry: 1850,
          parking: 1150,
          total: 487650
        },
        breakdown: [
          { category: 'Base Rent', amount: 445000, percentage: 91.3 },
          { category: 'Care Services', amount: 28500, percentage: 5.8 },
          { category: 'Meals', amount: 8750, percentage: 1.8 },
          { category: 'Other Services', amount: 5400, percentage: 1.1 }
        ],
        trends: [
          { month: 'Jan', revenue: 465000, occupancy: 90 },
          { month: 'Feb', revenue: 472000, occupancy: 91 },
          { month: 'Mar', revenue: 478000, occupancy: 91 },
          { month: 'Apr', revenue: 482000, occupancy: 92 },
          { month: 'May', revenue: 485000, occupancy: 92 },
          { month: 'Jun', revenue: 487650, occupancy: 92 }
        ]
      },
      expenses: {
        monthly: {
          staffing: 156225, // 50% of expenses
          utilities: 31245,
          maintenance: 28120,
          food: 21871,
          insurance: 18747,
          marketing: 12498,
          administration: 15622,
          supplies: 9373,
          activities: 6249,
          other: 12500,
          total: 312450
        },
        breakdown: [
          { category: 'Staffing', amount: 156225, percentage: 50 },
          { category: 'Utilities', amount: 31245, percentage: 10 },
          { category: 'Maintenance', amount: 28120, percentage: 9 },
          { category: 'Food Service', amount: 21871, percentage: 7 },
          { category: 'Insurance', amount: 18747, percentage: 6 },
          { category: 'Other', amount: 56242, percentage: 18 }
        ],
        comparison: {
          vsBudget: '-3.2%',
          vsLastMonth: '+1.8%',
          vsLastYear: '-2.5%'
        }
      },
      residents: {
        totalResidents: 92,
        newMoveIns: 3,
        moveOuts: 1,
        pendingMoveIns: 2,
        avgLengthOfStay: '2.8 years',
        careLevel: [
          { level: 'Independent', count: 35, avgRent: 3850 },
          { level: 'Assisted Living', count: 42, avgRent: 5250 },
          { level: 'Memory Care', count: 15, avgRent: 6750 }
        ]
      },
      receivables: {
        current: 12450,
        overdue30: 3200,
        overdue60: 1850,
        overdue90: 850,
        total: 18350,
        collectionRate: '97.8%'
      },
      budgetPerformance: {
        revenue: {
          budgeted: 475000,
          actual: 487650,
          variance: 12650,
          percentageVar: '+2.7%'
        },
        expenses: {
          budgeted: 320000,
          actual: 312450,
          variance: -7550,
          percentageVar: '-2.4%'
        },
        netIncome: {
          budgeted: 155000,
          actual: 175200,
          variance: 20200,
          percentageVar: '+13.0%'
        }
      },
      forecast: {
        nextMonth: {
          revenue: 492000,
          expenses: 315000,
          netIncome: 177000,
          occupancy: 93
        },
        nextQuarter: {
          revenue: 1485000,
          expenses: 950000,
          netIncome: 535000,
          occupancy: 94
        },
        yearEnd: {
          revenue: 5940000,
          expenses: 3800000,
          netIncome: 2140000,
          occupancy: 95
        }
      },
      kpis: {
        revPAR: 5315, // Revenue per available room
        NOI: 2100000, // Net Operating Income (annual)
        EBITDAR: 2340000, // Earnings before interest, taxes, depreciation, amortization, and rent
        debtServiceCoverage: 2.8,
        workingCapital: 450000,
        daysInAR: 14 // Days in Accounts Receivable
      }
    };

    res.json(financialData);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// Get payment processing metrics (for Tier 5+)
router.get('/api/enterprise/financials/:communityId/payments', isAuthenticated, async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const paymentData = {
      processing: {
        monthlyVolume: 487650,
        transactionCount: 184,
        avgTransaction: 2650,
        processingFees: 14145, // 2.9% + $0.30 per transaction
        netReceived: 473505
      },
      methods: [
        { method: 'ACH Transfer', volume: 350000, percentage: 72 },
        { method: 'Credit Card', volume: 87650, percentage: 18 },
        { method: 'Debit Card', volume: 35000, percentage: 7 },
        { method: 'Check', volume: 15000, percentage: 3 }
      ],
      schedule: {
        onTime: 168,
        late: 12,
        pending: 4,
        failed: 0
      },
      recurring: {
        active: 88,
        paused: 2,
        cancelled: 2,
        monthlyRecurring: 445000
      }
    };

    res.json(paymentData);
  } catch (error) {
    console.error('Error fetching payment data:', error);
    res.status(500).json({ error: 'Failed to fetch payment data' });
  }
});

// Get revenue optimization suggestions
router.get('/api/enterprise/financials/:communityId/optimization', isAuthenticated, async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const optimizationData = {
      opportunities: [
        {
          category: 'Pricing',
          opportunity: 'Increase base rent by 3%',
          impact: '+$13,350/month',
          difficulty: 'medium',
          timeframe: '2 months'
        },
        {
          category: 'Occupancy',
          opportunity: 'Fill 3 vacant units',
          impact: '+$14,550/month',
          difficulty: 'easy',
          timeframe: '1 month'
        },
        {
          category: 'Services',
          opportunity: 'Add premium care package',
          impact: '+$4,200/month',
          difficulty: 'medium',
          timeframe: '3 months'
        },
        {
          category: 'Expenses',
          opportunity: 'Renegotiate utility contracts',
          impact: '-$2,800/month',
          difficulty: 'easy',
          timeframe: '1 month'
        },
        {
          category: 'Collections',
          opportunity: 'Implement auto-pay incentive',
          impact: '-$450/month in fees',
          difficulty: 'easy',
          timeframe: 'immediate'
        }
      ],
      totalPotential: {
        revenueIncrease: 32100,
        expenseReduction: 3250,
        netImpact: 35350,
        roiPercentage: '20.2%'
      }
    };

    res.json(optimizationData);
  } catch (error) {
    console.error('Error fetching optimization data:', error);
    res.status(500).json({ error: 'Failed to fetch optimization suggestions' });
  }
});

export default router;