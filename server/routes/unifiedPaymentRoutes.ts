import { Router, Request, Response, raw } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { communities, vendors, users, paymentTransactions, subscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️ STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Community Subscription Tiers
const COMMUNITY_TIERS = {
  verified: { name: 'Verified Listing', price: 0, interval: 'month' as const },
  standard: { name: 'Standard', price: 14900, interval: 'month' as const }, // $149 in cents
  featured: { name: 'Featured', price: 24900, interval: 'month' as const }, // $249 in cents
  platinum: { name: 'Platinum', price: 34900, interval: 'month' as const }, // $349 in cents
};

// Vendor Subscription Tiers
const VENDOR_TIERS = {
  basic: { name: 'Basic Listing', price: 9900, interval: 'month' as const }, // $99 in cents
  featured: { name: 'Featured Vendor', price: 24900, interval: 'month' as const }, // $249 in cents
  national: { name: 'National Partner', price: 49900, interval: 'month' as const }, // $499 in cents
};

// Get Stripe configuration (public key for frontend)
router.get('/stripe-config', (req: Request, res: Response) => {
  res.json({
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    version: '2024-11-20',
  });
});

// Get subscription tiers info
router.get('/subscription-tiers', (req: Request, res: Response) => {
  res.json({
    community: Object.entries(COMMUNITY_TIERS).map(([key, tier]) => ({
      id: key,
      name: tier.name,
      price: tier.price / 100, // Convert to dollars
      interval: tier.interval,
      type: 'community',
    })),
    vendor: Object.entries(VENDOR_TIERS).map(([key, tier]) => ({
      id: key,
      name: tier.name,
      price: tier.price / 100, // Convert to dollars
      interval: tier.interval,
      type: 'vendor',
    })),
  });
});

// Create Payment Intent for Stripe Elements
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { tier, type, metadata = {} } = req.body;

    // Validate input
    if (!tier || !type) {
      return res.status(400).json({ error: 'Missing tier or type' });
    }

    // Get tier info
    const tiers = type === 'community' ? COMMUNITY_TIERS : VENDOR_TIERS;
    const tierInfo = tiers[tier as keyof typeof tiers];

    if (!tierInfo) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Don't create payment intent for free tier
    if (tierInfo.price === 0) {
      return res.json({
        success: true,
        free: true,
        message: 'Free tier - no payment required',
      });
    }

    // Validate amount (Stripe requires minimum 50 cents)
    if (tierInfo.price < 50) {
      return res.status(400).json({ error: 'Invalid amount - minimum is $0.50' });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tierInfo.price,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tier,
        type,
        tierName: tierInfo.name,
        ...metadata,
      },
      description: `MySeniorValet ${tierInfo.name} Subscription`,
      statement_descriptor_suffix: 'MYSENIORVALET',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      tier: tierInfo.name,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Checkout Session (alternative to Payment Intent)
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { tier, type, successUrl, cancelUrl, metadata = {} } = req.body;

    // Validate input
    if (!tier || !type) {
      return res.status(400).json({ error: 'Missing tier or type' });
    }

    // Get tier info
    const tiers = type === 'community' ? COMMUNITY_TIERS : VENDOR_TIERS;
    const tierInfo = tiers[tier as keyof typeof tiers];

    if (!tierInfo) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Handle free tier
    if (tierInfo.price === 0) {
      return res.json({
        success: true,
        free: true,
        message: 'Free tier - redirecting to success',
        url: successUrl || '/dashboard',
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierInfo.name} - ${type === 'community' ? 'Community' : 'Vendor'} Subscription`,
              description: `Monthly subscription for MySeniorValet ${tierInfo.name}`,
            },
            unit_amount: tierInfo.price,
            recurring: {
              interval: tierInfo.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.protocol}://${req.get('host')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/pricing`,
      metadata: {
        tier,
        type,
        tierName: tierInfo.name,
        ...metadata,
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured');
    // In development, still process the webhook for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Processing webhook in development mode (no signature verification)');
      
      try {
        const event = JSON.parse(req.body.toString());
        await handleWebhookEvent(event);
        return res.json({ received: true });
      } catch (err: any) {
        console.error('Error processing development webhook:', err);
        return res.status(400).json({ error: err.message });
      }
    }
    
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error('Error handling webhook event:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Helper function to handle webhook events
async function handleWebhookEvent(event: Stripe.Event) {
  console.log(`🎯 Handling webhook event: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`✅ Payment succeeded: ${paymentIntent.id} for ${paymentIntent.amount / 100} USD`);
      
      // Record successful payment
      const { tier, type, tierName } = paymentIntent.metadata;
      
      if (tier && type) {
        try {
          // For now, log the payment success
          console.log(`📝 Payment recorded for ${type} ${tierName}`);
          console.log(`   Amount: $${paymentIntent.amount / 100}`);
          console.log(`   Payment Intent: ${paymentIntent.id}`);
          
          // TODO: Update community or vendor subscription status based on type
          if (type === 'community' && paymentIntent.metadata.communityId) {
            await db.update(communities)
              .set({
                subscriptionTier: tier,
                subscriptionStatus: 'active',
                updatedAt: new Date(),
              })
              .where(eq(communities.id, parseInt(paymentIntent.metadata.communityId)));
          } else if (type === 'vendor' && paymentIntent.metadata.vendorId) {
            await db.update(vendors)
              .set({
                subscriptionTier: tier,
                subscriptionStatus: 'active',
                updatedAt: new Date(),
              })
              .where(eq(vendors.id, parseInt(paymentIntent.metadata.vendorId)));
          }
        } catch (error) {
          console.error('Error recording payment:', error);
        }
      }
      break;
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`✅ Checkout session completed: ${session.id}`);
      
      // Handle subscription activation
      const { tier, type, tierName } = session.metadata || {};
      
      if (session.subscription && tier && type) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          // Get community or vendor ID from metadata
          const communityId = session.metadata?.communityId ? parseInt(session.metadata.communityId) : null;
          const vendorId = session.metadata?.vendorId ? parseInt(session.metadata.vendorId) : null;
          
          if (communityId) {
            await db.insert(subscriptions).values({
              communityId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0]?.price.id,
              productId: tier,
              status: subscription.status as any,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              metadata: session.metadata as any,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          console.log(`📝 Subscription activated for ${type} ${tierName}`);
        } catch (error) {
          console.error('Error activating subscription:', error);
        }
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`📝 Subscription ${event.type}: ${subscription.id}`);
      
      // Update subscription status
      try {
        const existing = await db.select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1);

        if (existing.length > 0) {
          await db.update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        }
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`❌ Subscription cancelled: ${subscription.id}`);
      
      // Update subscription status to cancelled
      try {
        await db.update(subscriptions)
          .set({
            status: 'canceled',
            canceledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error(`❌ Payment failed: ${paymentIntent.id}`);
      
      // Log failed payment
      console.log(`   Tier: ${paymentIntent.metadata.tier}`);
      console.log(`   Type: ${paymentIntent.metadata.type}`);
      console.log(`   Amount: $${paymentIntent.amount / 100}`);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
}

// Test webhook endpoint status
router.get('/webhook-status', (req: Request, res: Response) => {
  res.json({
    configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    endpoint: '/api/payments/webhook',
    testMode: !process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'),
    events: [
      'payment_intent.succeeded',
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'payment_intent.payment_failed',
    ],
  });
});

// Test payment creation (for development)
router.post('/test-payment', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoint only available in development' });
  }

  try {
    const { tier, type } = req.body;
    
    // Get tier info
    const tiers = type === 'community' ? COMMUNITY_TIERS : VENDOR_TIERS;
    const tierInfo = tiers[tier as keyof typeof tiers];

    if (!tierInfo) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // Create test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tierInfo.price,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tier,
        type,
        tierName: tierInfo.name,
        test: 'true',
      },
      description: `TEST: MySeniorValet ${tierInfo.name} Subscription`,
    });

    // Confirm with test card
    const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: 'pm_card_visa',
      return_url: 'http://localhost:5000/payment-success',
    });

    res.json({
      success: true,
      paymentIntentId: confirmed.id,
      status: confirmed.status,
      amount: confirmed.amount / 100,
      tier: tierInfo.name,
    });
  } catch (error: any) {
    console.error('Test payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription history
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const subscriptionHistory = await db.select()
      .from(subscriptions)
      .limit(100);

    res.json(subscriptionHistory);
  } catch (error: any) {
    console.error('Error fetching subscription history:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;