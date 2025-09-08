/**
 * Stripe Webhook Handler
 * Processes subscription lifecycle events from Stripe
 */

import express from "express";
import { db } from "../db";
import { subscriptions, paymentTransactions, communities } from '@shared/schema';
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { 
  apiVersion: '2025-07-30.basil' as any 
});
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

  console.log(`📨 Webhook received: ${event.type}`);

  // Process real payment events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Track real payment
        paymentTracker.totalRevenue += paymentIntent.amount / 100; // Convert from cents
        paymentTracker.transactionCount++;
        paymentTracker.lastPayment = new Date();
        paymentTracker.monthlyRevenue += paymentIntent.amount / 100;
        
        // Record payment transaction
        await db.insert(paymentTransactions).values({
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: paymentIntent.customer as string || '',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'succeeded',
          type: 'one_time',
          metadata: paymentIntent.metadata as any,
          completedAt: new Date(),
        });
        
        console.log(`✅ Payment processed: $${paymentIntent.amount / 100}`);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Track recurring revenue
        paymentTracker.monthlyRevenue += (invoice.amount_paid || 0) / 100;
        
        // Record payment transaction
        await db.insert(paymentTransactions).values({
          stripePaymentIntentId: invoice.payment_intent as string || invoice.id,
          stripeCustomerId: invoice.customer as string || '',
          amount: (invoice.amount_paid || 0) / 100,
          currency: invoice.currency || 'usd',
          status: 'succeeded',
          type: 'subscription',
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            subscriptionId: invoice.subscription,
          },
          completedAt: new Date(),
        });
        
        console.log(`💰 Invoice payment succeeded: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Record failed payment
        await db.insert(paymentTransactions).values({
          stripePaymentIntentId: invoice.payment_intent as string || invoice.id,
          stripeCustomerId: invoice.customer as string || '',
          amount: (invoice.amount_due || 0) / 100,
          currency: invoice.currency || 'usd',
          status: 'failed',
          type: 'subscription',
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            subscriptionId: invoice.subscription,
          },
          errorMessage: 'Invoice payment failed',
        });
        
        console.log(`❌ Invoice payment failed: ${invoice.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', session.id);
  
  // Extract metadata
  const { communityId, communityName, tier } = session.metadata || {};
  
  if (session.mode === 'subscription' && session.subscription) {
    // Retrieve the full subscription object
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Create or update subscription record
    const subscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0]?.price.id,
      communityId: communityId ? parseInt(communityId) : 0,
      productId: tier || 'unknown',
      tier: tier || undefined,
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      metadata: {
        communityName,
        managerEmail: session.customer_details?.email || undefined,
      },
    };

    // Check if subscription already exists
    const existingSub = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
      .limit(1);

    if (existingSub.length === 0) {
      // Create new subscription
      await db.insert(subscriptions).values(subscriptionData);
      console.log(`📝 Created subscription record for ${subscription.id}`);
    } else {
      // Update existing subscription
      await db.update(subscriptions)
        .set(subscriptionData)
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
      console.log(`📝 Updated subscription record for ${subscription.id}`);
    }

    // Update community if communityId provided
    if (communityId) {
      await db.update(communities)
        .set({
          subscriptionTier: tier || 'starter',
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(communities.id, parseInt(communityId)));
      console.log(`📝 Updated community ${communityId} subscription status`);
    }

    // Track active subscription
    paymentTracker.activeSubscriptions++;
  }

  // Record payment transaction
  await db.insert(paymentTransactions).values({
    stripePaymentIntentId: session.payment_intent as string || session.id,
    stripeCustomerId: session.customer as string || '',
    amount: (session.amount_total || 0) / 100, // Convert from cents to dollars
    currency: session.currency || 'usd',
    status: 'succeeded',
    type: session.mode === 'subscription' ? 'subscription' : 'one_time',
    communityId: communityId ? parseInt(communityId) : undefined,
    metadata: {
      sessionId: session.id,
      communityName,
      tier,
      userEmail: session.customer_details?.email,
    },
    completedAt: new Date(),
  });
  console.log(`💰 Recorded payment transaction for session ${session.id}`);
}

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Subscription created:', subscription.id);
  
  const metadata = subscription.metadata || {};
  
  // Create subscription record
  await db.insert(subscriptions).values({
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id,
    communityId: metadata.communityId ? parseInt(metadata.communityId) : 0,
    productId: metadata.tier || 'unknown',
    tier: metadata.tier || undefined,
    status: subscription.status as any,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    metadata: {
      communityName: metadata.communityName,
    },
  });

  paymentTracker.activeSubscriptions++;
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('📝 Subscription updated:', subscription.id);
  
  // Update subscription record
  await db.update(subscriptions)
    .set({
      status: subscription.status as any,
      stripePriceId: subscription.items.data[0]?.price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Update community status if linked
  const sub = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (sub[0]?.communityId) {
    await db.update(communities)
      .set({
        subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      })
      .where(eq(communities.id, sub[0].communityId));
  }
}

// Handle subscription deleted (canceled)
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  // Update subscription record
  await db.update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Update community status if linked
  const sub = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (sub[0]?.communityId) {
    await db.update(communities)
      .set({
        subscriptionStatus: 'inactive',
        subscriptionTier: 'free',
      })
      .where(eq(communities.id, sub[0].communityId));
  }

  paymentTracker.activeSubscriptions = Math.max(0, paymentTracker.activeSubscriptions - 1);
}

// Get payment tracking stats (for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    // Get real-time stats from database
    const totalTransactions = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'succeeded'));

    const activeSubscriptionsCount = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const totalRevenue = totalTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    res.json({
      totalRevenue,
      transactionCount: totalTransactions.length,
      activeSubscriptions: activeSubscriptionsCount.length,
      lastPayment: paymentTracker.lastPayment,
      monthlyRevenue: paymentTracker.monthlyRevenue,
    });
  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

export default router;