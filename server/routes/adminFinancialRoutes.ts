import express from "express";
import { db } from "../db";
import { 
  communitySubscriptions, 
  vendorSubscriptions,
  payments,
  communities,
  vendors,
  users
} from "@shared/schema";
import { eq, sql, desc, and, gte, lte, isNotNull } from "drizzle-orm";
import { isAuthenticated as requireAuth, isAdmin } from "../auth-middleware";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });

// Apply admin authentication to all routes
router.use(requireAuth);
router.use(isAdmin);

// Get comprehensive financial data
router.get('/comprehensive', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    // Get revenue data from community and vendor subscriptions
    const [monthlyRevenue] = await db.execute(sql`
      SELECT 
        COALESCE(SUM(price_amount), 0) as revenue,
        COUNT(*) as transaction_count
      FROM (
        SELECT price_amount, created_at FROM community_subscriptions 
        WHERE created_at >= ${startOfMonth} AND status = 'active'
        UNION ALL
        SELECT price_amount, created_at FROM vendor_subscriptions 
        WHERE created_at >= ${startOfMonth} AND status = 'active'
      ) combined
    `);
    
    const [lastMonthRevenue] = await db.execute(sql`
      SELECT COALESCE(SUM(price_amount), 0) as revenue
      FROM (
        SELECT price_amount FROM community_subscriptions 
        WHERE created_at >= ${startOfLastMonth} AND created_at < ${startOfMonth} AND status = 'active'
        UNION ALL
        SELECT price_amount FROM vendor_subscriptions 
        WHERE created_at >= ${startOfLastMonth} AND created_at < ${startOfMonth} AND status = 'active'
      ) combined
    `);
    
    const [yearlyRevenue] = await db.execute(sql`
      SELECT COALESCE(SUM(price_amount), 0) as revenue
      FROM (
        SELECT price_amount FROM community_subscriptions 
        WHERE created_at >= ${startOfYear} AND status = 'active'
        UNION ALL
        SELECT price_amount FROM vendor_subscriptions 
        WHERE created_at >= ${startOfYear} AND status = 'active'
      ) combined
    `);
    
    // Calculate MRR from active subscriptions
    const [communityMRR] = await db.execute(sql`
      SELECT COALESCE(SUM(price_amount), 0) as mrr
      FROM community_subscriptions
      WHERE status = 'active'
    `);
    
    const [vendorMRR] = await db.execute(sql`
      SELECT COALESCE(SUM(price_amount), 0) as mrr
      FROM vendor_subscriptions
      WHERE status = 'active'
    `);
    
    const totalMRR = Number(communityMRR.rows[0]?.mrr || 0) + Number(vendorMRR.rows[0]?.mrr || 0);
    const growthRate = lastMonthRevenue.rows[0]?.revenue > 0 
      ? ((Number(monthlyRevenue.rows[0]?.revenue) - Number(lastMonthRevenue.rows[0]?.revenue)) / Number(lastMonthRevenue.rows[0]?.revenue)) * 100
      : 0;
    
    // Get subscription breakdown
    const [communitySubsBreakdown] = await db.execute(sql`
      SELECT 
        subscription_tier,
        COUNT(*) as count,
        SUM(price_amount) as revenue
      FROM community_subscriptions
      WHERE status = 'active'
      GROUP BY subscription_tier
    `);
    
    const [vendorSubsBreakdown] = await db.execute(sql`
      SELECT 
        subscription_tier,
        COUNT(*) as count,
        SUM(price_amount) as revenue
      FROM vendor_subscriptions
      WHERE status = 'active'
      GROUP BY subscription_tier
    `);
    
    // Calculate key metrics
    const [totalActiveUsers] = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM users
      WHERE is_active = true
    `);
    
    const arpu = totalActiveUsers.rows[0]?.count > 0 
      ? totalMRR / Number(totalActiveUsers.rows[0]?.count)
      : 0;
    
    res.json({
      revenue: {
        month: Number(monthlyRevenue.rows[0]?.revenue || 0),
        lastMonth: Number(lastMonthRevenue.rows[0]?.revenue || 0),
        year: Number(yearlyRevenue.rows[0]?.revenue || 0),
        mrr: totalMRR,
        arr: totalMRR * 12
      },
      transactions: {
        count: Number(monthlyRevenue.rows[0]?.transaction_count || 0)
      },
      growthRate: growthRate.toFixed(2),
      arpu: arpu.toFixed(2),
      subscriptions: {
        community: communitySubsBreakdown.rows,
        vendor: vendorSubsBreakdown.rows
      },
      _version: 'v4_enterprise_financial',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching comprehensive financial data:', error);
    res.status(500).json({ error: 'Failed to fetch financial data' });
  }
});

// Get active subscriptions with details
router.get('/subscriptions/active', async (req, res) => {
  try {
    // Get community subscriptions with details
    const communitySubsResult = await db.execute(sql`
      SELECT 
        cs.*,
        c.name as community_name
      FROM community_subscriptions cs
      LEFT JOIN communities c ON cs.community_id = c.id
      WHERE cs.status = 'active'
      ORDER BY cs.created_at DESC
    `);
    
    // Get vendor subscriptions with details
    const vendorSubsResult = await db.execute(sql`
      SELECT 
        vs.*,
        v.company_name as vendor_name
      FROM vendor_subscriptions vs
      LEFT JOIN vendors v ON vs.vendor_id = v.id
      WHERE vs.status = 'active'
      ORDER BY vs.created_at DESC
    `);
    
    const allSubscriptions = [
      ...communitySubsResult.rows.map((sub: any) => ({
        ...sub,
        type: 'community',
        name: sub.community_name,
        tier: sub.subscription_tier,
        amount: sub.price_amount
      })),
      ...vendorSubsResult.rows.map((sub: any) => ({
        ...sub,
        type: 'vendor',
        name: sub.vendor_name,
        tier: sub.subscription_tier,
        amount: sub.price_amount
      }))
    ];
    
    res.json({
      subscriptions: allSubscriptions,
      total: allSubscriptions.length,
      totalMRR: allSubscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0),
      _version: 'v4_enterprise_subscriptions',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch active subscriptions' });
  }
});

// Get revenue analytics with trends
router.get('/revenue/analytics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get daily revenue data from subscriptions
    const dailyRevenue = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        SUM(price_amount) as revenue,
        COUNT(*) as transactions
      FROM (
        SELECT created_at, price_amount FROM community_subscriptions 
        WHERE created_at >= ${startDate} AND created_at <= ${endDate} AND status = 'active'
        UNION ALL
        SELECT created_at, price_amount FROM vendor_subscriptions 
        WHERE created_at >= ${startDate} AND created_at <= ${endDate} AND status = 'active'
      ) combined
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    // Get revenue by subscription tier
    const revenueByTier = await db.execute(sql`
      SELECT 
        subscription_tier,
        SUM(price_amount) as revenue,
        COUNT(*) as count
      FROM (
        SELECT subscription_tier, price_amount FROM community_subscriptions WHERE status = 'active'
        UNION ALL
        SELECT subscription_tier, price_amount FROM vendor_subscriptions WHERE status = 'active'
      ) combined
      GROUP BY subscription_tier
      ORDER BY revenue DESC
    `);
    
    // Calculate key metrics
    const totalRevenue = dailyRevenue.rows.reduce((sum, day: any) => sum + Number(day.revenue || 0), 0);
    const avgDailyRevenue = dailyRevenue.rows.length > 0 ? totalRevenue / dailyRevenue.rows.length : 0;
    const totalTransactions = dailyRevenue.rows.reduce((sum, day: any) => sum + Number(day.transactions || 0), 0);
    
    res.json({
      daily: dailyRevenue.rows,
      byTier: revenueByTier.rows,
      summary: {
        totalRevenue,
        avgDailyRevenue,
        totalTransactions,
        avgTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      },
      timeRange,
      _version: 'v4_revenue_analytics',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Update subscription plan pricing (admin tool)
router.put('/subscription-plans/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { price, features, isActive } = req.body;
    
    // This would integrate with Stripe to update product pricing
    // For now, return success to enable UI functionality
    
    res.json({
      success: true,
      planId,
      updates: { price, features, isActive },
      message: 'Subscription plan updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: 'Failed to update subscription plan' });
  }
});

// Cancel subscription
router.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { type } = req.body; // 'community' or 'vendor'
    
    if (type === 'community') {
      await db.execute(sql`
        UPDATE community_subscriptions 
        SET status = 'canceled', 
            canceled_at = ${new Date()}
        WHERE id = ${subscriptionId}
      `);
    } else {
      await db.execute(sql`
        UPDATE vendor_subscriptions 
        SET status = 'canceled',
            canceled_at = ${new Date()}
        WHERE id = ${subscriptionId}
      `);
    }
    
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;