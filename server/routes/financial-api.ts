import { Router } from 'express';
import { db } from '../db';
import { 
  paymentTransactions, 
  communitySubscriptions, 
  stripeProducts,
  vendorLeads,
  vendorAnalytics,
  users,
  communities,
  vendors
} from '@shared/schema';
import { eq, gte, lte, and, sql, desc, asc } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { checkRole } from '../replitAuth';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

const router = Router();

// Financial Overview
router.get('/overview', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get total revenue from payment transactions
    const [totalRevenueResult] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(amount), 0)::integer`,
        transactionCount: sql<number>`COUNT(*)::integer`
      })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'completed'));

    // Get monthly recurring revenue from active subscriptions
    const [mrrResult] = await db
      .select({
        mrr: sql<number>`COALESCE(SUM(sp.price), 0)::integer`
      })
      .from(communitySubscriptions)
      .leftJoin(stripeProducts, eq(communitySubscriptions.productId, stripeProducts.id))
      .where(
        and(
          eq(communitySubscriptions.status, 'active'),
          eq(stripeProducts.billingType, 'monthly')
        )
      );

    // Get average transaction value
    const [avgTransactionResult] = await db
      .select({
        avgValue: sql<number>`COALESCE(AVG(amount), 0)::integer`
      })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'completed'));

    // Get total customers
    const [customersResult] = await db
      .select({
        totalCustomers: sql<number>`COUNT(DISTINCT user_id)::integer`
      })
      .from(paymentTransactions);

    // Get active subscriptions count
    const [activeSubsResult] = await db
      .select({
        count: sql<number>`COUNT(*)::integer`
      })
      .from(communitySubscriptions)
      .where(eq(communitySubscriptions.status, 'active'));

    // Get vendor commissions total
    const [commissionsResult] = await db
      .select({
        totalCommissions: sql<number>`COALESCE(SUM(commission_amount::numeric), 0)::integer`
      })
      .from(vendorLeads)
      .where(eq(vendorLeads.commissionStatus, 'paid'));

    // Calculate growth rate (this month vs last month)
    const [thisMonthRevenue] = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(amount), 0)::integer`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, startOfMonth)
        )
      );

    const [lastMonthRevenue] = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(amount), 0)::integer`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, startOfLastMonth),
          lte(paymentTransactions.createdAt, startOfMonth)
        )
      );

    const growthRate = lastMonthRevenue.revenue > 0 
      ? ((thisMonthRevenue.revenue - lastMonthRevenue.revenue) / lastMonthRevenue.revenue) * 100 
      : 0;

    // Calculate churn rate
    const [churnedSubs] = await db
      .select({
        count: sql<number>`COUNT(*)::integer`
      })
      .from(communitySubscriptions)
      .where(
        and(
          eq(communitySubscriptions.status, 'canceled'),
          gte(communitySubscriptions.canceledAt, startOfMonth)
        )
      );

    const churnRate = activeSubsResult.count > 0 
      ? (churnedSubs.count / activeSubsResult.count) * 100 
      : 0;

    res.json({
      totalRevenue: totalRevenueResult.totalRevenue / 100, // Convert cents to dollars
      monthlyRecurringRevenue: mrrResult.mrr / 100,
      averageTransactionValue: avgTransactionResult.avgValue / 100,
      customerLifetimeValue: (mrrResult.mrr / 100) * 12, // Simple CLV calculation
      churnRate: Math.round(churnRate * 10) / 10,
      growthRate: Math.round(growthRate * 10) / 10,
      totalCustomers: customersResult.totalCustomers,
      activeSubscriptions: activeSubsResult.count,
      totalCommissions: commissionsResult.totalCommissions / 100
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(500).json({ error: 'Failed to fetch financial overview' });
  }
});

// Revenue by Month
router.get('/revenue-by-month', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const monthlyRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
        revenue: sql<number>`COALESCE(SUM(amount), 0)::integer`,
        transactions: sql<number>`COUNT(*)::integer`,
        uniqueCustomers: sql<number>`COUNT(DISTINCT user_id)::integer`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, startDate)
        )
      )
      .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`);

    const revenueData = monthlyRevenue.map(row => ({
      date: row.month,
      revenue: row.revenue / 100,
      transactions: row.transactions,
      newCustomers: row.uniqueCustomers,
      churn: 0 // Would need to calculate based on canceled subscriptions
    }));

    res.json({ revenueData });
  } catch (error) {
    console.error('Error fetching revenue by month:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// Service Performance
router.get('/service-performance', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    // Get vendor service performance data
    const servicePerformance = await db
      .select({
        serviceName: vendors.businessName,
        revenue: sql<number>`COALESCE(SUM(vl.won_amount::numeric), 0)::integer`,
        transactions: sql<number>`COUNT(vl.id)::integer`,
        commissionRate: sql<number>`AVG(vl.commission_rate::numeric)::numeric`,
        commissionEarned: sql<number>`COALESCE(SUM(vl.commission_amount::numeric), 0)::integer`
      })
      .from(vendorLeads)
      .leftJoin(vendors, eq(vendorLeads.vendorId, vendors.id))
      .where(eq(vendorLeads.status, 'won'))
      .groupBy(vendors.businessName)
      .orderBy(desc(sql`SUM(vl.won_amount::numeric)`))
      .limit(10);

    const topServices = servicePerformance.map(service => ({
      serviceName: service.serviceName || 'Unknown',
      revenue: service.revenue / 100,
      transactions: service.transactions,
      commissionRate: Number(service.commissionRate) || 0,
      commissionEarned: service.commissionEarned / 100,
      growth: 0 // Would need historical data to calculate
    }));

    res.json({ topServices });
  } catch (error) {
    console.error('Error fetching service performance:', error);
    res.status(500).json({ error: 'Failed to fetch service performance' });
  }
});

// Customer Segments
router.get('/customer-segments', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    // Get subscription tier breakdown
    const tierBreakdown = await db
      .select({
        tier: stripeProducts.tierLevel,
        customerCount: sql<number>`COUNT(DISTINCT cs.id)::integer`,
        revenue: sql<number>`COALESCE(SUM(sp.price), 0)::integer`
      })
      .from(communitySubscriptions)
      .leftJoin(stripeProducts, eq(communitySubscriptions.productId, stripeProducts.id))
      .where(eq(communitySubscriptions.status, 'active'))
      .groupBy(stripeProducts.tierLevel);

    const segments = tierBreakdown.map(segment => ({
      segment: segment.tier || 'Unknown',
      customerCount: segment.customerCount,
      revenue: segment.revenue / 100,
      averageRevenue: segment.customerCount > 0 ? (segment.revenue / 100) / segment.customerCount : 0,
      percentage: 0 // Will calculate after getting total
    }));

    const totalCustomers = segments.reduce((sum, s) => sum + s.customerCount, 0);
    segments.forEach(s => {
      s.percentage = totalCustomers > 0 ? (s.customerCount / totalCustomers) * 100 : 0;
    });

    res.json({ segments });
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    res.status(500).json({ error: 'Failed to fetch customer segments' });
  }
});

// Revenue Forecast
router.get('/revenue-forecast', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    // Get last 3 months of revenue for trend analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const historicalRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
        revenue: sql<number>`COALESCE(SUM(amount), 0)::integer`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, threeMonthsAgo)
        )
      )
      .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`);

    // Simple linear projection for next 6 months
    const avgMonthlyRevenue = historicalRevenue.reduce((sum, month) => sum + month.revenue, 0) / historicalRevenue.length;
    const forecast = [];
    const now = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = forecastDate.toISOString().slice(0, 7);
      forecast.push({
        month: monthStr,
        projected: (avgMonthlyRevenue / 100) * (1 + (i * 0.05)), // 5% growth projection
        confidence: 'medium'
      });
    }

    res.json({ forecast });
  } catch (error) {
    console.error('Error generating revenue forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Recent Transactions
router.get('/recent-transactions', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const transactions = await db
      .select({
        id: paymentTransactions.id,
        userId: paymentTransactions.userId,
        amount: paymentTransactions.amount,
        paymentType: paymentTransactions.paymentType,
        status: paymentTransactions.status,
        createdAt: paymentTransactions.createdAt,
        metadata: paymentTransactions.metadata
      })
      .from(paymentTransactions)
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(Number(limit));

    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      amount: t.amount / 100,
      type: t.paymentType,
      status: t.status,
      date: t.createdAt,
      customerName: t.metadata?.userName || 'Unknown',
      description: t.metadata?.description || t.paymentType
    }));

    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Commission Analytics
router.get('/commission-analytics', isAuthenticated, checkRole(['super_admin', 'admin', 'financial_admin']), async (req, res) => {
  try {
    // Get total commissions and analytics
    const [commissionsOverview] = await db
      .select({
        totalCommissions: sql<number>`COALESCE(SUM(commission_amount::numeric), 0)::integer`,
        pendingCommissions: sql<number>`COALESCE(SUM(CASE WHEN commission_status = 'pending' THEN commission_amount::numeric ELSE 0 END), 0)::integer`,
        paidCommissions: sql<number>`COALESCE(SUM(CASE WHEN commission_status = 'paid' THEN commission_amount::numeric ELSE 0 END), 0)::integer`,
        avgCommissionRate: sql<number>`AVG(commission_rate::numeric)::numeric`
      })
      .from(vendorLeads)
      .where(eq(vendorLeads.status, 'won'));

    // Get top earning partners
    const topPartners = await db
      .select({
        partnerName: vendors.businessName,
        commissionEarned: sql<number>`COALESCE(SUM(vl.commission_amount::numeric), 0)::integer`,
        transactionCount: sql<number>`COUNT(vl.id)::integer`,
        avgCommissionRate: sql<number>`AVG(vl.commission_rate::numeric)::numeric`
      })
      .from(vendorLeads)
      .leftJoin(vendors, eq(vendorLeads.vendorId, vendors.id))
      .where(eq(vendorLeads.status, 'won'))
      .groupBy(vendors.businessName)
      .orderBy(desc(sql`SUM(vl.commission_amount::numeric)`))
      .limit(5);

    res.json({
      totalCommissions: commissionsOverview.totalCommissions / 100,
      pendingCommissions: commissionsOverview.pendingCommissions / 100,
      paidCommissions: commissionsOverview.paidCommissions / 100,
      averageCommissionRate: Number(commissionsOverview.avgCommissionRate) || 0,
      topPartners: topPartners.map(p => ({
        partnerName: p.partnerName || 'Unknown',
        commissionEarned: p.commissionEarned / 100,
        transactionCount: p.transactionCount,
        averageCommissionRate: Number(p.avgCommissionRate) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching commission analytics:', error);
    res.status(500).json({ error: 'Failed to fetch commission analytics' });
  }
});

export default router;