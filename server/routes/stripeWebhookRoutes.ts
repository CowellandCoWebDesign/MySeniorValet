import express from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Real payment tracking (Golden Data Rule compliant)
const paymentTracker = {
  totalRevenue: 0,
  transactionCount: 0,
  lastPayment: null as Date | null,
  monthlyRevenue: 0,
  activeSubscriptions: 0
};

// Stripe webhook endpoint - processes real payment events only
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!sig) {
    return res.status(400).send('No signature provided');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature for security
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process real payment events
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Track real payment
        paymentTracker.totalRevenue += paymentIntent.amount / 100; // Convert from cents
        paymentTracker.transactionCount++;
        paymentTracker.lastPayment = new Date();
        paymentTracker.monthlyRevenue += paymentIntent.amount / 100;
        
        // Store in database for permanent record
        await db.execute(sql`
          INSERT INTO stripe_payment_events (
            stripe_event_id,
            event_type,
            amount,
            currency,
            customer_id,
            payment_intent_id,
            status,
            metadata,
            created_at
          ) VALUES (
            ${event.id},
            ${event.type},
            ${paymentIntent.amount / 100},
            ${paymentIntent.currency},
            ${paymentIntent.customer as string || null},
            ${paymentIntent.id},
            ${paymentIntent.status},
            ${JSON.stringify(paymentIntent.metadata)},
            ${new Date()}
          )
          ON CONFLICT (stripe_event_id) DO NOTHING
        `);
        
        console.log(`✅ Payment processed: $${paymentIntent.amount / 100}`);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription records
        if (subscription.metadata?.community_id) {
          await db.execute(sql`
            UPDATE community_subscriptions
            SET 
              stripe_subscription_id = ${subscription.id},
              status = ${subscription.status},
              current_period_start = ${new Date(subscription.current_period_start * 1000)},
              current_period_end = ${new Date(subscription.current_period_end * 1000)},
              tier_level = ${subscription.metadata.tier_level || 'starter'}
            WHERE community_id = ${parseInt(subscription.metadata.community_id)}
          `);
        }
        
        if (subscription.status === 'active') {
          paymentTracker.activeSubscriptions++;
        }
        
        console.log(`✅ Subscription ${event.type}: ${subscription.id}`);
        break;

      case 'customer.subscription.deleted':
        const cancelledSub = event.data.object as Stripe.Subscription;
        
        if (cancelledSub.metadata?.community_id) {
          await db.execute(sql`
            UPDATE community_subscriptions
            SET 
              status = 'canceled',
              canceled_at = ${new Date()}
            WHERE stripe_subscription_id = ${cancelledSub.id}
          `);
        }
        
        paymentTracker.activeSubscriptions = Math.max(0, paymentTracker.activeSubscriptions - 1);
        console.log(`❌ Subscription cancelled: ${cancelledSub.id}`);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        
        // Track recurring revenue
        paymentTracker.monthlyRevenue += (invoice.amount_paid || 0) / 100;
        
        // Log successful invoice payment
        await db.execute(sql`
          INSERT INTO stripe_invoice_events (
            stripe_invoice_id,
            subscription_id,
            amount_paid,
            currency,
            customer_id,
            status,
            created_at
          ) VALUES (
            ${invoice.id},
            ${invoice.subscription as string || null},
            ${(invoice.amount_paid || 0) / 100},
            ${invoice.currency},
            ${invoice.customer as string || null},
            'paid',
            ${new Date()}
          )
          ON CONFLICT (stripe_invoice_id) DO UPDATE SET
            status = 'paid',
            amount_paid = ${(invoice.amount_paid || 0) / 100}
        `);
        
        console.log(`💰 Invoice paid: $${(invoice.amount_paid || 0) / 100}`);
        break;

      case 'charge.failed':
        const failedCharge = event.data.object as Stripe.Charge;
        
        // Log failed payment attempts
        await db.execute(sql`
          INSERT INTO audit_logs (
            action,
            resource_type,
            resource_id,
            details,
            severity,
            created_at
          ) VALUES (
            'payment_failed',
            'charge',
            ${failedCharge.id},
            ${JSON.stringify({
              amount: failedCharge.amount / 100,
              error: failedCharge.failure_message,
              customer: failedCharge.customer
            })},
            'high',
            ${new Date()}
          )
        `);
        
        console.log(`⚠️ Payment failed: ${failedCharge.failure_message}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response to Stripe
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing error');
  }
});

// Get real-time payment stats (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get today's revenue from database
    const todayRevenue = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM stripe_payment_events
      WHERE DATE(created_at) = CURRENT_DATE
        AND event_type = 'payment_intent.succeeded'
    `);
    
    // Get this month's revenue
    const monthRevenue = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM stripe_payment_events
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        AND event_type = 'payment_intent.succeeded'
    `);
    
    // Get active subscription count
    const activeSubs = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM community_subscriptions
      WHERE status = 'active'
    `);
    
    res.json({
      realTimeStats: {
        todayRevenue: Number(todayRevenue.rows[0]?.revenue || 0),
        monthRevenue: Number(monthRevenue.rows[0]?.revenue || 0),
        activeSubscriptions: Number(activeSubs.rows[0]?.count || 0),
        lastPayment: paymentTracker.lastPayment,
        transactionCount: paymentTracker.transactionCount
      },
      _version: 'v4_stripe_webhook',
      _timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment stats' });
  }
});

export default router;