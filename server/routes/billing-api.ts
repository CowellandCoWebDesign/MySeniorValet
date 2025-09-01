// Phase 5b: Billing & Invoice Management API
import { Router } from 'express';
import { db } from '../db';
import { 
  invoices, 
  invoiceItems, 
  billingSchedules, 
  accountsReceivable,
  communities,
  users,
  paymentTransactions 
} from '@shared/schema';
import { eq, desc, and, gte, lte, sql, or, isNull } from 'drizzle-orm';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// ================== INVOICE MANAGEMENT ==================

// Get all invoices for a community
router.get('/invoices/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { status, startDate, endDate } = req.query;
    
    // Build query conditions
    const conditions = [eq(invoices.communityId, parseInt(communityId))];
    
    if (status) {
      conditions.push(eq(invoices.status, status as string));
    }
    
    if (startDate) {
      conditions.push(gte(invoices.issueDate, new Date(startDate as string)));
    }
    
    if (endDate) {
      conditions.push(lte(invoices.issueDate, new Date(endDate as string)));
    }
    
    // For now, return mock data until tables are created
    const mockInvoices = [
      {
        id: 1,
        invoiceNumber: 'INV-2025-001',
        communityId: parseInt(communityId),
        status: 'paid',
        type: 'monthly',
        issueDate: new Date('2025-01-01'),
        dueDate: new Date('2025-01-15'),
        paidDate: new Date('2025-01-10'),
        subtotal: '5000.00',
        taxAmount: '400.00',
        totalAmount: '5400.00',
        paidAmount: '5400.00',
        balanceDue: '0.00',
        billingName: 'Sunrise Senior Living',
        billingEmail: 'billing@sunrise.com'
      },
      {
        id: 2,
        invoiceNumber: 'INV-2025-002',
        communityId: parseInt(communityId),
        status: 'sent',
        type: 'monthly',
        issueDate: new Date('2025-02-01'),
        dueDate: new Date('2025-02-15'),
        paidDate: null,
        subtotal: '5200.00',
        taxAmount: '416.00',
        totalAmount: '5616.00',
        paidAmount: '0.00',
        balanceDue: '5616.00',
        billingName: 'Sunrise Senior Living',
        billingEmail: 'billing@sunrise.com'
      }
    ];
    
    res.json({
      invoices: mockInvoices,
      total: mockInvoices.length,
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch invoices',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// Create a new invoice
router.post('/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Mock response for now
    const newInvoice = {
      id: Date.now(),
      invoiceNumber,
      ...invoiceData,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json({
      invoice: newInvoice,
      message: 'Invoice created successfully',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ 
      error: 'Failed to create invoice',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// Update invoice status
router.patch('/invoices/:invoiceId/status', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;
    
    // Mock response
    res.json({
      success: true,
      invoiceId,
      newStatus: status,
      message: `Invoice status updated to ${status}`,
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ 
      error: 'Failed to update invoice status',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// ================== BILLING SCHEDULES ==================

// Get billing schedules for a community
router.get('/billing-schedules/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Mock data for billing schedules
    const schedules = [
      {
        id: 1,
        communityId: parseInt(communityId),
        name: 'Monthly Room & Board',
        status: 'active',
        frequency: 'monthly',
        billingDay: 1,
        nextBillingDate: new Date('2025-02-01'),
        lastBillingDate: new Date('2025-01-01'),
        baseAmount: '5000.00',
        autoSend: true,
        sendDaysBefore: 5,
        autoCharge: false
      },
      {
        id: 2,
        communityId: parseInt(communityId),
        name: 'Quarterly Maintenance Fee',
        status: 'active',
        frequency: 'quarterly',
        billingDay: 1,
        nextBillingDate: new Date('2025-04-01'),
        lastBillingDate: new Date('2025-01-01'),
        baseAmount: '500.00',
        autoSend: true,
        sendDaysBefore: 10,
        autoCharge: false
      }
    ];
    
    res.json({
      schedules,
      total: schedules.length,
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching billing schedules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch billing schedules',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// ================== ACCOUNTS RECEIVABLE ==================

// Get accounts receivable summary
router.get('/accounts-receivable/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Mock AR data
    const arSummary = {
      communityId: parseInt(communityId),
      totalOutstanding: 25000.00,
      current: 15000.00,
      pastDue30: 5000.00,
      pastDue60: 3000.00,
      pastDue90: 1500.00,
      pastDue120Plus: 500.00,
      accounts: [
        {
          id: 1,
          accountNumber: 'AR-2025-001',
          customerName: 'John Smith',
          currentBalance: 5400.00,
          status: 'current',
          lastPaymentDate: new Date('2025-01-15'),
          lastPaymentAmount: 5000.00
        },
        {
          id: 2,
          accountNumber: 'AR-2025-002',
          customerName: 'Mary Johnson',
          currentBalance: 2800.00,
          status: '30_days',
          lastPaymentDate: new Date('2024-12-20'),
          lastPaymentAmount: 2500.00
        }
      ],
      agingReport: {
        labels: ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
        values: [15000, 5000, 3000, 1500, 500]
      },
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    };
    
    res.json(arSummary);
  } catch (error) {
    console.error('Error fetching accounts receivable:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accounts receivable',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// ================== FINANCIAL REPORTS ==================

// Generate P&L Statement
router.get('/reports/profit-loss/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Calculate P&L from actual data
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, parseInt(communityId)))
      .limit(1);
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    // Mock P&L data based on community
    const revenue = parseFloat(community.priceMin || '0') * 12 * 0.85; // Estimated annual revenue
    const expenses = revenue * 0.75; // 75% expense ratio
    const netIncome = revenue - expenses;
    
    const plStatement = {
      communityId: parseInt(communityId),
      communityName: community.name,
      period: {
        start: startDate || new Date(new Date().getFullYear(), 0, 1),
        end: endDate || new Date()
      },
      revenue: {
        roomAndBoard: revenue * 0.7,
        careServices: revenue * 0.2,
        otherIncome: revenue * 0.1,
        totalRevenue: revenue
      },
      expenses: {
        staffing: expenses * 0.5,
        facilities: expenses * 0.15,
        foodService: expenses * 0.1,
        utilities: expenses * 0.08,
        insurance: expenses * 0.07,
        adminAndGeneral: expenses * 0.1,
        totalExpenses: expenses
      },
      netIncome,
      profitMargin: (netIncome / revenue * 100).toFixed(2) + '%',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    };
    
    res.json(plStatement);
  } catch (error) {
    console.error('Error generating P&L statement:', error);
    res.status(500).json({ 
      error: 'Failed to generate P&L statement',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// Generate Balance Sheet
router.get('/reports/balance-sheet/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Mock balance sheet data
    const balanceSheet = {
      communityId: parseInt(communityId),
      asOfDate: new Date(),
      assets: {
        current: {
          cash: 250000,
          accountsReceivable: 25000,
          inventory: 15000,
          prepaidExpenses: 5000,
          totalCurrent: 295000
        },
        fixed: {
          property: 5000000,
          equipment: 500000,
          lessDepreciation: -750000,
          totalFixed: 4750000
        },
        totalAssets: 5045000
      },
      liabilities: {
        current: {
          accountsPayable: 45000,
          accruedExpenses: 25000,
          currentPortionDebt: 100000,
          totalCurrent: 170000
        },
        longTerm: {
          mortgagePayable: 2500000,
          otherLongTermDebt: 500000,
          totalLongTerm: 3000000
        },
        totalLiabilities: 3170000
      },
      equity: {
        commonStock: 1000000,
        retainedEarnings: 875000,
        totalEquity: 1875000
      },
      totalLiabilitiesAndEquity: 5045000,
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    };
    
    res.json(balanceSheet);
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    res.status(500).json({ 
      error: 'Failed to generate balance sheet',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// Generate Cash Flow Statement
router.get('/reports/cash-flow/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Mock cash flow data
    const cashFlow = {
      communityId: parseInt(communityId),
      period: {
        start: startDate || new Date(new Date().getFullYear(), 0, 1),
        end: endDate || new Date()
      },
      operatingActivities: {
        netIncome: 125000,
        depreciation: 50000,
        changeInAR: -5000,
        changeInAP: 3000,
        otherAdjustments: 2000,
        netCashFromOperating: 175000
      },
      investingActivities: {
        equipmentPurchases: -25000,
        propertyImprovements: -50000,
        netCashFromInvesting: -75000
      },
      financingActivities: {
        debtPayments: -100000,
        newBorrowing: 50000,
        dividendsPaid: 0,
        netCashFromFinancing: -50000
      },
      netChangeInCash: 50000,
      beginningCash: 200000,
      endingCash: 250000,
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    };
    
    res.json(cashFlow);
  } catch (error) {
    console.error('Error generating cash flow statement:', error);
    res.status(500).json({ 
      error: 'Failed to generate cash flow statement',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// ================== PAYMENT PROCESSING ==================

// Process payment for invoice
router.post('/invoices/:invoiceId/pay', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethodId, amount } = req.body;
    
    // Create Stripe payment intent
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          metadata: {
            invoiceId
          }
        });
        
        res.json({
          success: true,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          message: 'Payment processed successfully',
          _version: 'v5b_billing_api',
          _timestamp: Date.now()
        });
      } catch (stripeError) {
        console.error('Stripe payment error:', stripeError);
        res.status(400).json({
          error: 'Payment processing failed',
          details: stripeError.message,
          _version: 'v5b_billing_api',
          _timestamp: Date.now()
        });
      }
    } else {
      // Mock payment without Stripe
      res.json({
        success: true,
        mockPayment: true,
        invoiceId,
        amount,
        message: 'Payment recorded (test mode)',
        _version: 'v5b_billing_api',
        _timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ 
      error: 'Failed to process payment',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

// Get revenue summary
router.get('/revenue-summary/:communityId', async (req, res) => {
  try {
    const { communityId } = req.params;
    
    // Calculate revenue metrics
    const revenueSummary = {
      communityId: parseInt(communityId),
      currentMonth: {
        collected: 45000,
        outstanding: 5000,
        projected: 50000
      },
      yearToDate: {
        collected: 485000,
        outstanding: 25000,
        projected: 600000
      },
      monthlyTrend: [
        { month: 'Jan', revenue: 48000 },
        { month: 'Feb', revenue: 49000 },
        { month: 'Mar', revenue: 47500 },
        { month: 'Apr', revenue: 50000 },
        { month: 'May', revenue: 51000 },
        { month: 'Jun', revenue: 49500 }
      ],
      revenueByType: {
        roomAndBoard: 350000,
        careServices: 100000,
        ancillaryServices: 35000
      },
      collectionRate: 95.2,
      averageDaysToPayment: 12,
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    };
    
    res.json(revenueSummary);
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch revenue summary',
      _version: 'v5b_billing_api',
      _timestamp: Date.now()
    });
  }
});

export default router;