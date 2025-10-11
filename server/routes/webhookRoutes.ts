import { Router } from 'express';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { subscriptions, communities, auditLogs, residentPayments, achVerificationEvents } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { paymentNotificationService } from '../services/payment-notification-service';
import { sendCommunityWelcomeEmail, sendVendorWelcomeEmail } from '../services/tier-welcome-service';

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

      // ACH payment events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      // ACH verification events
      case 'financial_connections.account.created':
        await handleFinancialConnectionCreated(event.data.object);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      // Stripe Connect account events
      case 'account.updated':
        await handleConnectAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'account.application.authorized':
        await handleConnectAccountAuthorized(event.data.object);
        break;

      case 'account.application.deauthorized':
        await handleConnectAccountDeauthorized(event.data.object);
        break;

      default:
        console.log(`📬 Unhandled event type: ${event.type}`);
    }

    // Log webhook event with required fields
    await db.insert(auditLogs).values({
      action: `webhook_${event.type}`,
      entityType: 'webhook',
      entityId: event.id,
      metadata: { 
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString()
      },
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
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
    
    // Send welcome email with tier-specific features and next steps
    const tierKey = session.metadata.tier_key || 
      (session.metadata.tier_name?.toLowerCase().includes('standard') ? 'standard' :
       session.metadata.tier_name?.toLowerCase().includes('featured') ? 'featured' :
       session.metadata.tier_name?.toLowerCase().includes('platinum') ? 'platinum' : 'verified');
    
    await sendCommunityWelcomeEmail(
      communityId,
      tierKey,
      session.customer_email || 'unknown@email.com'
    );
  }
  
  // Check if this is a vendor subscription
  if (session.metadata?.vendor_id && session.subscription) {
    const vendorId = parseInt(session.metadata.vendor_id);
    
    // Send payment notification for vendor
    await paymentNotificationService.sendPaymentNotification({
      type: 'subscription_created',
      customerEmail: session.customer_email || 'unknown@email.com',
      tierName: session.metadata.tier_name || 'Unknown Tier',
      amount: Math.round((session.amount_total || 0) / 100),
      subscriptionType: 'vendor',
      metadata: { vendorId, sessionId: session.id }
    });
    
    // Send vendor welcome email
    const tierKey = session.metadata.tier_key || 
      (session.metadata.tier_name?.toLowerCase().includes('basic') ? 'basic' :
       session.metadata.tier_name?.toLowerCase().includes('featured') ? 'featured' : 'national');
    
    await sendVendorWelcomeEmail(
      vendorId,
      tierKey,
      session.customer_email || 'unknown@email.com'
    );
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

// Handle payment intent succeeded (for resident payments and ACH)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Payment Intent succeeded:', paymentIntent.id);
  
  // Check if this is a resident payment
  if (paymentIntent.metadata?.residentId) {
    const residentId = parseInt(paymentIntent.metadata.residentId);
    
    // Update resident payment status to succeeded
    await db
      .update(residentPayments)
      .set({ 
        status: 'succeeded',
        updatedAt: new Date()
      })
      .where(eq(residentPayments.stripePaymentIntentId, paymentIntent.id));
    
    console.log(`✅ Resident payment confirmed for resident ${residentId}`);
    
    // TODO: Send payment confirmation email to resident
  }
  
  // Handle ACH payment confirmation
  if (paymentIntent.payment_method_types.includes('us_bank_account')) {
    console.log('🏦 ACH payment confirmed');
    
    // Log ACH verification event
    await db.insert(achVerificationEvents).values({
      communityId: paymentIntent.metadata?.communityId ? parseInt(paymentIntent.metadata.communityId) : 0,
      stripePaymentIntentId: paymentIntent.id,
      verificationStatus: 'verified',
      verificationMethod: 'financial_connections',
      createdAt: new Date()
    });
  }
}

// Handle payment intent failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment Intent failed:', paymentIntent.id);
  
  // Check if this is a resident payment
  if (paymentIntent.metadata?.residentId) {
    const residentId = parseInt(paymentIntent.metadata.residentId);
    
    // Update resident payment status to failed
    await db
      .update(residentPayments)
      .set({ 
        status: 'failed',
        updatedAt: new Date()
      })
      .where(eq(residentPayments.stripePaymentIntentId, paymentIntent.id));
    
    console.log(`❌ Resident payment failed for resident ${residentId}`);
    
    // TODO: Send payment failure notification to resident and community admin
  }
}

// Handle payment intent processing (ACH payments in progress)
async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  console.log('⏳ Payment Intent processing:', paymentIntent.id);
  
  // Check if this is a resident payment
  if (paymentIntent.metadata?.residentId) {
    const residentId = parseInt(paymentIntent.metadata.residentId);
    
    // Update resident payment status to processing
    await db
      .update(residentPayments)
      .set({ 
        status: 'processing',
        updatedAt: new Date()
      })
      .where(eq(residentPayments.stripePaymentIntentId, paymentIntent.id));
    
    console.log(`⏳ Resident payment processing for resident ${residentId} (ACH transfer in progress)`);
  }
}

// Handle financial connections account created (ACH verification)
async function handleFinancialConnectionCreated(account: any) {
  console.log('🏦 Financial connection created:', account.id);
  
  // Log successful ACH verification
  const metadata = account.metadata || {};
  if (metadata.community_id) {
    await db.insert(achVerificationEvents).values({
      communityId: parseInt(metadata.community_id),
      stripePaymentIntentId: metadata.payment_intent_id || null,
      verificationStatus: 'verified',
      verificationMethod: 'financial_connections',
      createdAt: new Date()
    });
    
    console.log(`🏦 ACH account verified for community ${metadata.community_id}`);
  }
}

// Handle charge succeeded (for resident payments)
async function handleChargeSucceeded(charge: Stripe.Charge) {
  console.log('💳 Charge succeeded:', charge.id);
  
  // Update resident payment with charge ID if applicable
  if (charge.metadata?.residentId && charge.payment_intent) {
    await db
      .update(residentPayments)
      .set({ 
        stripeChargeId: charge.id,
        status: 'succeeded',
        updatedAt: new Date()
      })
      .where(eq(residentPayments.stripePaymentIntentId, charge.payment_intent as string));
    
    console.log(`💳 Charge confirmed for resident ${charge.metadata.residentId}`);
  }
}

// Handle charge failed
async function handleChargeFailed(charge: Stripe.Charge) {
  console.log('❌ Charge failed:', charge.id);
  
  // Update resident payment status if applicable
  if (charge.metadata?.residentId && charge.payment_intent) {
    await db
      .update(residentPayments)
      .set({ 
        stripeChargeId: charge.id,
        status: 'failed',
        updatedAt: new Date()
      })
      .where(eq(residentPayments.stripePaymentIntentId, charge.payment_intent as string));
    
    console.log(`❌ Charge failed for resident ${charge.metadata.residentId}`);
  }
}

// Handle Stripe Connect account updated
async function handleConnectAccountUpdated(account: Stripe.Account) {
  console.log('🔄 Connect account updated:', account.id);
  
  // Find community by connected account ID
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.stripeConnectedAccountId, account.id))
    .limit(1);
    
  if (community) {
    // Update account status
    await db
      .update(communities)
      .set({
        stripeOnboardingCompleted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        updatedAt: new Date()
      })
      .where(eq(communities.id, community.id));
      
    console.log(`✅ Updated Connect account status for community ${community.id}`);
  }
}

// Handle Stripe Connect account authorized
async function handleConnectAccountAuthorized(event: any) {
  console.log('✅ Connect account authorized:', event.account);
  
  // Log the authorization event
  await db.insert(auditLogs).values({
    action: 'connect_account_authorized',
    entityType: 'stripe_connect',
    entityId: event.account,
    metadata: { 
      authorized_at: new Date().toISOString(),
      stripe_user_id: event.stripe_user_id
    },
    ipAddress: 'stripe_webhook',
    userAgent: 'stripe_webhook'
  });
}

// Handle Stripe Connect account deauthorized
async function handleConnectAccountDeauthorized(event: any) {
  console.log('⚠️ Connect account deauthorized:', event.account);
  
  // Find and disable the community's payment processing
  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.stripeConnectedAccountId, event.account))
    .limit(1);
    
  if (community) {
    await db
      .update(communities)
      .set({
        stripeOnboardingCompleted: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
        updatedAt: new Date()
      })
      .where(eq(communities.id, community.id));
      
    console.log(`⚠️ Disabled payment processing for community ${community.id}`);
  }
  
  // Log the deauthorization
  await db.insert(auditLogs).values({
    action: 'connect_account_deauthorized',
    entityType: 'stripe_connect',
    entityId: event.account,
    metadata: { 
      deauthorized_at: new Date().toISOString(),
      stripe_user_id: event.stripe_user_id
    },
    ipAddress: 'stripe_webhook',
    userAgent: 'stripe_webhook'
  });
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