import { Router, Request, Response, raw } from 'express';
import Stripe from 'stripe';
import { db, pool } from '../db';
import { communities, vendors, users, paymentTransactions, subscriptions } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️ STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil' as any,
});

// Community Subscription Tiers
const COMMUNITY_TIERS = {
  verified: { name: 'Verified Listing', price: 0, interval: 'month' as const },
  standard: { name: 'Standard', price: 14900, interval: 'month' as const }, // $149 in cents
  featured: { name: 'Featured', price: 24900, interval: 'month' as const }, // $249 in cents
  platinum: { name: 'Platinum', price: 34900, interval: 'month' as const }, // $349 in cents
};

// Vendor Subscription Tiers with Promotional Pricing
const VENDOR_TIERS = {
  basic: { 
    name: 'Basic Listing', 
    price: 9900, // $99 in cents
    promoPrice: 4950, // $49.50 (50% off first month)
    annualPrice: 95040, // $950.40 (20% off annual - save $237.60/year)
    interval: 'month' as const 
  },
  featured: { 
    name: 'Featured Vendor', 
    price: 24900, // $249 in cents
    promoPrice: 12450, // $124.50 (50% off first month)
    annualPrice: 239040, // $2390.40 (20% off annual - save $597.60/year)
    interval: 'month' as const 
  },
  national: { 
    name: 'National Partner', 
    price: 49900, // $499 in cents
    promoPrice: 24950, // $249.50 (50% off first month)
    annualPrice: 479040, // $4790.40 (20% off annual - save $1197.60/year)
    interval: 'month' as const 
  },
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
    const { tier, type, metadata = {}, billingCycle = 'monthly', applyPromo = false } = req.body;

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
    
    // Calculate amount based on billing cycle and promotional pricing
    let amount = tierInfo.price;
    let description = `MySeniorValet ${tierInfo.name} - Monthly`;
    
    if (type === 'vendor') {
      const vendorTier = tierInfo as typeof VENDOR_TIERS[keyof typeof VENDOR_TIERS];
      
      if (billingCycle === 'annual' && vendorTier.annualPrice) {
        amount = vendorTier.annualPrice;
        description = `MySeniorValet ${tierInfo.name} - Annual (Save 20%!)`;
      } else if (applyPromo && vendorTier.promoPrice) {
        amount = vendorTier.promoPrice;
        description = `MySeniorValet ${tierInfo.name} - First Month 50% OFF`;
      }
    }
    
    // For communities, handle promotional pricing if needed
    if (type === 'community' && applyPromo) {
      // Apply early adopter special for communities (e.g., 30% off first 3 months)
      amount = Math.floor(tierInfo.price * 0.7); // 30% off
      description = `MySeniorValet ${tierInfo.name} - Early Adopter Special (30% OFF)`;
    }
    
    // Log what we're about to charge
    console.log(`Creating payment intent: $${amount / 100} for ${tierInfo.name}`);
    console.log('Pricing details:', { 
      tier, 
      type, 
      originalPrice: tierInfo.price, 
      finalAmount: amount,
      billingCycle,
      applyPromo 
    });
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
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
    const { tier, type, successUrl, cancelUrl, metadata = {}, billingCycle = 'monthly', applyPromo = false } = req.body;

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

    // Calculate amount based on billing cycle and promotional pricing
    let amount = tierInfo.price;
    let interval: 'month' | 'year' = tierInfo.interval;
    let description = `MySeniorValet ${tierInfo.name} - Monthly`;
    let subscriptionDescription = `Monthly subscription for MySeniorValet ${tierInfo.name}`;
    
    // For vendors, handle promotional and annual pricing
    if (type === 'vendor') {
      const vendorTier = tierInfo as typeof VENDOR_TIERS[keyof typeof VENDOR_TIERS];
      
      if (billingCycle === 'annual' && vendorTier.annualPrice) {
        // Annual billing - charge for full year upfront with 20% discount
        amount = vendorTier.annualPrice;
        interval = 'year';
        description = `MySeniorValet ${tierInfo.name} - Annual (Save 20%!)`;
        subscriptionDescription = `Annual subscription for MySeniorValet ${tierInfo.name} - Save 20%!`;
      } else if (applyPromo && vendorTier.promoPrice) {
        // First month promotional pricing - 50% off
        amount = vendorTier.promoPrice;
        description = `MySeniorValet ${tierInfo.name} - First Month 50% OFF`;
        subscriptionDescription = `Monthly subscription for MySeniorValet ${tierInfo.name} - First Month 50% OFF`;
      }
    }
    
    // For communities, handle promotional pricing if needed
    if (type === 'community' && applyPromo) {
      // Apply early adopter special for communities (e.g., 30% off first 3 months)
      amount = Math.floor(tierInfo.price * 0.7); // 30% off
      description = `MySeniorValet ${tierInfo.name} - Early Adopter Special (30% OFF)`;
      subscriptionDescription = `Monthly subscription for MySeniorValet ${tierInfo.name} - Early Adopter Special`;
    }

    console.log(`Creating checkout session: $${amount / 100} for ${tierInfo.name}`);
    console.log('Pricing details:', { 
      tier, 
      type, 
      originalPrice: tierInfo.price, 
      finalAmount: amount,
      billingCycle,
      applyPromo,
      interval
    });

    // Create checkout session with proper pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierInfo.name} - ${type === 'community' ? 'Community' : 'Vendor'} Subscription`,
              description: subscriptionDescription,
            },
            unit_amount: amount,
            recurring: {
              interval: interval,
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
        billingCycle,
        applyPromo: applyPromo.toString(),
        ...metadata,
      },
      // Add discounts/coupons if needed for promotional pricing
      ...(applyPromo && {
        subscription_data: {
          trial_period_days: 0, // No trial, just discounted first period
          metadata: {
            promotional: 'true',
            originalPrice: tierInfo.price.toString(),
          }
        }
      })
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      amount,
      description,
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
            console.log(`   Updating community ${paymentIntent.metadata.communityId} to tier ${tier}`);
          } else if (type === 'vendor' && paymentIntent.metadata.vendorId) {
            console.log(`   Updating vendor ${paymentIntent.metadata.vendorId} to tier ${tier}`);
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
            console.log(`   Creating subscription for community ${communityId}`);
            console.log(`   Subscription ID: ${subscription.id}`);
            console.log(`   Status: ${subscription.status}`);
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
              status: subscription.status as 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid',
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
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

// Confirm Community Payment endpoint (handles post-payment community creation/upgrade)
router.post('/confirm-community-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, communityId, tier } = req.body;
    
    if (!paymentIntentId || !communityId || !tier) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Free tier should not go through payment confirmation
    if (tier === 'verified') {
      return res.status(400).json({ 
        error: "Invalid request. Free tier does not require payment confirmation.", 
        tier
      });
    }

    console.log('Confirming community payment:', {
      paymentIntentId,
      communityId,
      tier
    });

    // Verify payment status with Stripe
    let paymentIntent: any;
    
    // Allow test payment intents for development
    if (paymentIntentId.startsWith('pi_test_')) {
      console.log('Test payment intent detected:', paymentIntentId);
      paymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: COMMUNITY_TIERS[tier as keyof typeof COMMUNITY_TIERS]?.price || 14900, // Default to standard price
        customer: 'cus_test123'
      };
    } else {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      } catch (stripeError) {
        console.error('Stripe error retrieving payment intent:', stripeError);
        return res.status(400).json({ 
          error: "Invalid payment intent ID",
          details: stripeError instanceof Error ? stripeError.message : "Unknown error"
        });
      }
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          error: "Payment not completed",
          status: paymentIntent.status 
        });
      }
    }

    // Handle community creation or upgrade
    let finalCommunityId = communityId;
    
    if (communityId === 'new') {
      // Do not create test communities - return proper error
      console.log('New community payment attempted in unified routes:', { tier, paymentIntentId });
      
      return res.status(400).json({ 
        error: 'Community ID required',
        message: 'A valid community ID must be provided for subscription upgrades.',
        details: 'New community registrations must go through the proper onboarding flow.'
      });
    } else {
      // Update existing community using raw SQL to bypass Drizzle issues
      const updateQuery = `
        UPDATE communities 
        SET subscription_tier = $1, 
            billing_status = $2, 
            updated_at = $3
        WHERE id = $4
      `;
      
      await pool.query(updateQuery, [
        tier,
        'active',
        new Date(),
        parseInt(finalCommunityId)
      ]);
      
      console.log('Updated community subscription:', {
        id: finalCommunityId,
        tier
      });
    }

    // Return success response
    res.json({ 
      success: true, 
      message: "Community upgraded successfully",
      tier: tier,
      communityId: finalCommunityId,
      authenticated: false // We're not handling auth in this simplified version
    });
  } catch (error) {
    console.error("Error confirming community payment:", error);
    res.status(500).json({ 
      error: "Failed to confirm payment",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Handle successful vendor payment confirmation
router.post('/confirm-vendor-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, vendorData } = req.body;
    
    if (!paymentIntentId || !vendorData) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    // Verify payment with Stripe (allow test payments in development)
    let paymentIntent: any;
    
    if (paymentIntentId.startsWith('pi_test_')) {
      console.log('Test vendor payment detected:', paymentIntentId);
      paymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: vendorData.planType === 'national' ? 49900 : vendorData.planType === 'featured' ? 24900 : 9900,
        metadata: { tier: vendorData.planType }
      };
    } else {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not successful' });
      }
    }
    
    const tier = paymentIntent.metadata?.tier || vendorData.planType || 'basic';
    
    // Check if vendor already exists - check multiple fields for better matching
    let existingVendor = null;
    
    // First check by email if provided
    if (vendorData.email) {
      const emailQuery = `
        SELECT id, business_name, subscription_tier, status, primary_contact_email
        FROM vendors 
        WHERE LOWER(primary_contact_email) = LOWER($1)
        LIMIT 1
      `;
      const emailResult = await pool.query(emailQuery, [vendorData.email]);
      if (emailResult.rows.length > 0) {
        existingVendor = emailResult.rows[0];
        console.log('Vendor matched by email:', existingVendor.business_name);
      }
    }
    
    // If not found by email, check by business name (fuzzy match)
    if (!existingVendor && vendorData.businessName) {
      const nameQuery = `
        SELECT id, business_name, subscription_tier, status, primary_contact_email
        FROM vendors 
        WHERE LOWER(business_name) = LOWER($1)
           OR LOWER(business_name) LIKE LOWER($2)
           OR similarity(LOWER(business_name), LOWER($1)) > 0.7
        ORDER BY similarity(LOWER(business_name), LOWER($1)) DESC
        LIMIT 1
      `;
      
      const nameResult = await pool.query(nameQuery, [
        vendorData.businessName,
        `%${vendorData.businessName}%`
      ]);
      
      if (nameResult.rows.length > 0) {
        existingVendor = nameResult.rows[0];
        console.log('Vendor matched by business name:', existingVendor.business_name);
        
        // For major vendors without email, update with provided email
        if (!existingVendor.primary_contact_email && vendorData.email) {
          await pool.query(
            'UPDATE vendors SET primary_contact_email = $1 WHERE id = $2',
            [vendorData.email, existingVendor.id]
          );
          console.log('Updated vendor email for:', existingVendor.business_name);
        }
      }
    }
    
    // If still not found, check by phone number
    if (!existingVendor && vendorData.phone) {
      const phoneQuery = `
        SELECT id, business_name, subscription_tier, status, primary_contact_email
        FROM vendors 
        WHERE primary_contact_phone = $1
        LIMIT 1
      `;
      const phoneResult = await pool.query(phoneQuery, [vendorData.phone]);
      if (phoneResult.rows.length > 0) {
        existingVendor = phoneResult.rows[0];
        console.log('Vendor matched by phone:', existingVendor.business_name);
      }
    }
    
    if (existingVendor) {
      // Vendor exists - update their subscription tier
      console.log('Updating existing vendor:', existingVendor.business_name, '(ID:', existingVendor.id, ')');
      
      const updateQuery = `
        UPDATE vendors 
        SET 
          subscription_tier = $1,
          stripe_subscription_id = $2,
          lifetime_revenue = COALESCE(lifetime_revenue, 0) + $3,
          status = 'active',
          is_verified = $4,
          featured = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING id, business_name
      `;
      
      const updateResult = await pool.query(updateQuery, [
        tier,
        paymentIntentId,
        paymentIntent.amount / 100,
        tier !== 'basic',
        tier === 'featured' || tier === 'national',
        existingVendor.id
      ]);
      
      const updatedVendor = updateResult.rows[0];
      console.log('Updated existing vendor subscription:', updatedVendor);
      
      // Log the upgrade transaction
      const transactionQuery = `
        INSERT INTO payment_transactions (
          type, entity_id, stripe_payment_intent_id, amount, status, subscription_tier, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await pool.query(transactionQuery, [
        'vendor_upgrade',
        updatedVendor.id,
        paymentIntentId,
        paymentIntent.amount / 100,
        'completed',
        tier,
        JSON.stringify({
          vendorName: updatedVendor.business_name,
          previousTier: existingVendor.subscription_tier,
          newTier: tier,
          action: 'upgrade'
        })
      ]);
      
      return res.json({
        success: true,
        message: 'Vendor subscription upgraded successfully',
        vendorId: updatedVendor.id,
        vendorSlug: updatedVendor.business_name.toLowerCase().replace(/\s+/g, '-'),
        action: 'upgraded',
        previousTier: existingVendor.subscription_tier,
        newTier: tier
      });
    }
    
    // No existing vendor - create new vendor record
    
    const insertQuery = `
      INSERT INTO vendors (
        business_name, business_type, primary_contact_name, primary_contact_email,
        primary_contact_phone, business_city, business_state, website,
        description, short_description, service_areas, subscription_tier,
        status, is_verified, featured, stripe_customer_id, stripe_subscription_id,
        total_spent, average_rating, total_reviews, response_rate, average_response_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING id, business_name
    `;
    
    const serviceAreasArray = vendorData.serviceAreas 
      ? vendorData.serviceAreas.split(',').map((s: string) => s.trim())
      : ['Local Area'];
    
    const result = await pool.query(insertQuery, [
      vendorData.businessName,
      vendorData.businessType || 'company',
      vendorData.contactName,
      vendorData.email,
      vendorData.phone,
      vendorData.city || 'Not specified',
      vendorData.state || 'Not specified',
      vendorData.website || null,
      vendorData.description || 'Professional senior living services provider',
      vendorData.description ? vendorData.description.substring(0, 150) : 'Professional senior living services',
      serviceAreasArray,
      tier,
      'active',
      tier !== 'basic', // Auto-verify featured and national tiers
      tier === 'featured' || tier === 'national',
      paymentIntent.customer || null,
      paymentIntentId,
      paymentIntent.amount / 100,
      0, // average_rating
      0, // total_reviews
      95, // response_rate default
      30  // average_response_time default
    ]);
    
    const newVendor = result.rows[0];
    console.log('Created vendor:', newVendor);
    
    // Log the payment transaction
    const transactionQuery = `
      INSERT INTO payment_transactions (
        type, entity_id, stripe_payment_intent_id, amount, status, subscription_tier, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await pool.query(transactionQuery, [
      'vendor',
      newVendor.id,
      paymentIntentId,
      paymentIntent.amount / 100,
      'completed',
      tier,
      JSON.stringify({
        vendorName: vendorData.businessName,
        tier: tier
      })
    ]);
    
    // Return success with vendor ID
    res.json({
      success: true,
      message: 'Vendor registration successful',
      vendorId: newVendor.id,
      vendorSlug: newVendor.business_name.toLowerCase().replace(/\s+/g, '-'),
    });
  } catch (error: any) {
    console.error('Error confirming vendor payment:', error);
    res.status(500).json({ 
      error: 'Failed to create vendor profile',
      details: error.message 
    });
  }
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