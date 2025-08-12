import { Router } from 'express';
import { db } from '../db';
import { adminAuth } from '../middleware/admin-auth';
import { eq, sql, and, gte, lte, desc, asc } from 'drizzle-orm';
import { communities, subscriptions } from '../../shared/schema';

const router = Router();

// Get subscription statistics
router.get('/admin/subscriptions/stats', adminAuth, async (req, res) => {
  try {
    // Get total subscriptions count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions);
    const totalSubscriptions = totalResult?.count || 0;

    // Get active subscriptions
    const [activeResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    const activeSubscriptions = activeResult?.count || 0;

    // Get MRR (Monthly Recurring Revenue)
    const [mrrResult] = await db
      .select({ 
        mrr: sql<number>`COALESCE(SUM(CASE 
          WHEN ${subscriptions.interval} = 'monthly' THEN ${subscriptions.amount}
          WHEN ${subscriptions.interval} = 'annual' THEN ${subscriptions.amount} / 12
          ELSE 0
        END), 0)`
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    const mrr = mrrResult?.mrr || 0;

    // Get ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Get churn rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [churnedResult] = await db
      .select({ churned: sql<number>`count(*)` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'canceled'),
          gte(subscriptions.canceledAt, thirtyDaysAgo)
        )
      );
    const churned = churnedResult?.churned || 0;

    const churnRate = activeSubscriptions > 0 ? (churned / activeSubscriptions) * 100 : 0;

    // Get average revenue per user
    const arpu = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

    // Get trial conversion rate
    const [trialsResult] = await db
      .select({ trials: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'trialing'));
    const trials = trialsResult?.trials || 0;

    const [convertedResult] = await db
      .select({ 
        converted: sql<number>`count(DISTINCT ${subscriptions.communityId})` 
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, 'active'),
          sql`${subscriptions.trialEnd} IS NOT NULL`
        )
      );
    const converted = convertedResult?.converted || 0;

    const conversionRate = trials > 0 ? (converted / (trials + converted)) * 100 : 0;

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      mrr,
      arr,
      churnRate: Math.round(churnRate * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      trials,
      growth: {
        monthly: 12.5, // Mock growth data
        quarterly: 38.2
      }
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscription statistics' });
  }
});

// Get all subscriptions with pagination and filters
router.get('/admin/subscriptions', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(subscriptions.status, status as string));
    }
    if (search) {
      conditions.push(sql`${communities.name} ILIKE ${'%' + search + '%'}`);
    }

    // Apply sorting
    const orderColumn = sortBy === 'amount' ? subscriptions.amount :
                       sortBy === 'status' ? subscriptions.status :
                       sortBy === 'nextBillingDate' ? subscriptions.nextBillingDate :
                       subscriptions.createdAt;
    
    // Build and execute query
    const results = await db
      .select({
        subscription: subscriptions,
        community: communities
      })
      .from(subscriptions)
      .leftJoin(communities, eq(subscriptions.communityId, communities.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn))
      .limit(Number(limit))
      .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions);
    const count = countResult?.count || 0;

    res.json({
      subscriptions: results.map(r => ({
        id: r.subscription.id,
        communityId: r.subscription.communityId,
        communityName: r.community?.name || 'Unknown',
        planName: r.subscription.planName || 'Standard',
        status: r.subscription.status,
        amount: r.subscription.amount,
        interval: r.subscription.interval,
        currentPeriodStart: r.subscription.currentPeriodStart,
        currentPeriodEnd: r.subscription.currentPeriodEnd,
        nextBillingDate: r.subscription.nextBillingDate,
        cancelAtPeriodEnd: r.subscription.cancelAtPeriodEnd,
        createdAt: r.subscription.createdAt
      })),
      total: count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Update subscription
router.patch('/admin/subscriptions/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, Number(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription
router.post('/admin/subscriptions/:id/cancel', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { immediately = false, reason } = req.body;

    const updates: any = {
      canceledAt: new Date(),
      updatedAt: new Date()
    };

    if (immediately) {
      updates.status = 'canceled';
    } else {
      updates.cancelAtPeriodEnd = true;
    }

    await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, Number(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Bulk actions
router.post('/admin/subscriptions/bulk', adminAuth, async (req, res) => {
  try {
    const { action, subscriptionIds, data } = req.body;

    switch (action) {
      case 'cancel':
        await db
          .update(subscriptions)
          .set({
            status: 'canceled',
            canceledAt: new Date(),
            updatedAt: new Date()
          })
          .where(sql`${subscriptions.id} = ANY(${subscriptionIds})`);
        break;

      case 'pause':
        await db
          .update(subscriptions)
          .set({
            status: 'paused',
            updatedAt: new Date()
          })
          .where(sql`${subscriptions.id} = ANY(${subscriptionIds})`);
        break;

      case 'resume':
        await db
          .update(subscriptions)
          .set({
            status: 'active',
            updatedAt: new Date()
          })
          .where(sql`${subscriptions.id} = ANY(${subscriptionIds})`);
        break;

      case 'changePlan':
        await db
          .update(subscriptions)
          .set({
            planName: data.planName,
            amount: data.amount,
            updatedAt: new Date()
          })
          .where(sql`${subscriptions.id} = ANY(${subscriptionIds})`);
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ success: true, affected: subscriptionIds.length });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

// Get revenue analytics
router.get('/admin/subscriptions/revenue', adminAuth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Mock revenue data for chart
    const dailyRevenue = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dailyRevenue.push({
        date: currentDate.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 10000,
        subscriptions: Math.floor(Math.random() * 20) + 50
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      period,
      startDate,
      endDate,
      dailyRevenue,
      summary: {
        totalRevenue: dailyRevenue.reduce((sum, d) => sum + d.revenue, 0),
        averageDaily: dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) / dailyRevenue.length,
        totalSubscriptions: dailyRevenue.reduce((sum, d) => sum + d.subscriptions, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Get failed payments
router.get('/admin/subscriptions/failed-payments', adminAuth, async (req, res) => {
  try {
    // Mock failed payments data
    const failedPayments = [
      {
        id: 1,
        subscriptionId: 101,
        communityName: 'Sunrise Senior Living',
        amount: 299,
        failedAt: new Date(Date.now() - 86400000),
        reason: 'Insufficient funds',
        retryCount: 2
      },
      {
        id: 2,
        subscriptionId: 102,
        communityName: 'Golden Years Community',
        amount: 499,
        failedAt: new Date(Date.now() - 172800000),
        reason: 'Card expired',
        retryCount: 1
      }
    ];

    res.json(failedPayments);
  } catch (error) {
    console.error('Error fetching failed payments:', error);
    res.status(500).json({ error: 'Failed to fetch failed payments' });
  }
});

// Get subscription plans (mock data for now)
router.get('/admin/subscription-plans', adminAuth, async (req, res) => {
  try {
    const plans = [
      {
        id: 1,
        name: 'Basic',
        amount: 199,
        interval: 'monthly',
        features: ['Basic listing', 'Email support', '10 photos'],
        active: true
      },
      {
        id: 2,
        name: 'Featured',
        amount: 499,
        interval: 'monthly',
        features: ['Featured listing', 'Priority support', '50 photos', 'Analytics'],
        active: true
      },
      {
        id: 3,
        name: 'National',
        amount: 999,
        interval: 'monthly',
        features: ['National visibility', 'Dedicated account manager', 'Unlimited photos', 'Advanced analytics', 'API access'],
        active: true
      }
    ];
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Update subscription plan
router.put('/admin/subscription-plans/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // For now, just return success since we're using mock data
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: 'Failed to update subscription plan' });
  }
});

export default router;