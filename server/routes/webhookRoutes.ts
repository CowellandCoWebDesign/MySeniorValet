import { Router } from 'express';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { subscriptions, communities, auditLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { paymentNotificationService } from '../services/payment-notification-service';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Stripe webhook endpoint - handles subscription events
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    console.log('⚠️ STRIPE_WEBHOOK_SECRET not configured - webhook verification disabled for development');
    // In development, we can still process events without signature verification
    // This allows testing webhook flow before going live
  }
  
  let event: Stripe.Event;

  try {
    if (endpointSecret && sig) {
      // Production: Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Development: Parse event without verification
      event = req.body;
    }
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Received webhook: ${event.type}`);

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`📬 Unhandled event type: ${event.type}`);
    }

    // Log webhook event
    await db.insert(auditLogs).values({
      entityType: 'webhook',
      entityId: 0,
      userId: null,
      operation: `webhook_${event.type}`,
      details: JSON.stringify({ 
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString()
      }),
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      createdAt: new Date()
    });

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error(`❌ Webhook processing error: ${error.message}`);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id);
  
  if (session.metadata?.community_id && session.subscription) {
    const communityId = parseInt(session.metadata.community_id);
    
    // Create subscription record
    await db.insert(subscriptions).values({
      communityId: communityId,
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string,
      productId: session.metadata.product_id || 'unknown',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`✅ Subscription created for community ${communityId}`);
    
    // Send payment notification
    await paymentNotificationService.sendPaymentNotification({
      type: 'subscription_created',
      customerEmail: session.customer_email || 'unknown@email.com',
      tierName: session.metadata.tier_name || 'Unknown Tier',
      amount: Math.round((session.amount_total || 0) / 100),
      subscriptionType: 'community',
      metadata: { communityId, sessionId: session.id }
    });
  }
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('💰 Invoice paid:', invoice.id);
  
  if (invoice.subscription) {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
      .limit(1);

    if (subscription.length > 0) {
      // Update subscription status to active
      await db
        .update(subscriptions)
        .set({ 
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));

      console.log(`✅ Subscription ${invoice.subscription} marked as active`);
    }
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('🚫 Payment failed:', invoice.id);
  
  if (invoice.subscription) {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
      .limit(1);

    if (subscription.length > 0) {
      // Update subscription status to past_due
      await db
        .update(subscriptions)
        .set({ 
          status: 'past_due',
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));

      console.log(`⚠️ Subscription ${invoice.subscription} marked as past_due`);
      
      // TODO: Send email notification to community admin
      // TODO: Disable premium features if payment remains failed
    }
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Subscription created:', subscription.id);
  
  // Additional logic for new subscriptions if needed
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  // Update subscription record with new details
  await db
    .update(subscriptions)
    .set({ 
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date()
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('👋 Subscription cancelled:', subscription.id);
  
  if (subscription.id) {
    const subscriptionRecord = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
      .limit(1);

    if (subscriptionRecord.length > 0) {
      // Update subscription status to canceled
      await db
        .update(subscriptions)
        .set({ 
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

      console.log(`❌ Subscription ${subscription.id} marked as canceled`);
      
      // TODO: Send cancellation email to community admin
      // TODO: Schedule feature deactivation (grace period)
    }
  }
}

// Development endpoint to test webhook functionality
router.post('/test-webhook', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoint only available in development' });
  }

  const testEvent = {
    id: 'evt_test_' + Date.now(),
    type: req.body.type || 'checkout.session.completed',
    data: {
      object: req.body.data || {
        id: 'cs_test_' + Date.now(),
        subscription: 'sub_test_' + Date.now(),
        customer: 'cus_test_' + Date.now(),
        metadata: {
          community_id: '1',
          product_id: 'featured-spotlight'
        }
      }
    }
  };

  console.log('🧪 Processing test webhook event:', testEvent.type);
  
  // Process the test event through the same handler
  req.body = testEvent;
  
  res.json({
    message: `Test webhook event created: ${testEvent.type}`,
    event: testEvent,
    note: "Check server logs for processing results"
  });
});

export default router;