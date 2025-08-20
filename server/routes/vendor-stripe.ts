import express, { type Express } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { vendors, vendorSubscriptionPlans } from "@shared/schema";
import { VENDOR_SUBSCRIPTION_TIERS } from "../services/vendor-subscription";
import { isAuthenticated } from "../auth-middleware";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export function registerVendorStripeRoutes(app: Express) {
  // Create a checkout session for vendor subscription
  app.post("/api/vendor-subscription/create-checkout-session", isAuthenticated, async (req, res) => {
    try {
      const { vendorId, tierKey } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify vendor ownership
      const [vendor] = await db.select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor || vendor.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get tier info
      const tier = VENDOR_SUBSCRIPTION_TIERS[tierKey as keyof typeof VENDOR_SUBSCRIPTION_TIERS];
      if (!tier) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.name} - Vendor Subscription`,
              description: `Monthly subscription for ${vendor.businessName}`,
              images: vendor.logoUrl ? [vendor.logoUrl] : undefined,
            },
            unit_amount: tier.price * 100, // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/vendor-dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/vendor-marketplace-tiers`,
        metadata: {
          vendorId: vendorId.toString(),
          userId,
          tierKey,
        },
        client_reference_id: vendorId.toString(),
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        message: "Error creating checkout session", 
        error: error.message 
      });
    }
  });

  // Handle successful checkout
  app.get("/api/vendor-subscription/checkout-success", isAuthenticated, async (req, res) => {
    try {
      const { session_id } = req.query;
      const userId = (req.user as any)?.claims?.sub;

      if (!session_id || !userId) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const vendorId = parseInt(session.metadata?.vendorId || '0');
      const tierKey = session.metadata?.tierKey;

      if (!vendorId || !tierKey) {
        return res.status(400).json({ message: "Invalid session metadata" });
      }

      // Update vendor subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await db.update(vendors)
        .set({
          subscriptionTier: tierKey,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date((subscription as any).current_period_start * 1000),
          subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendorId));

      res.json({ 
        success: true, 
        message: "Subscription activated successfully",
        tier: tierKey 
      });
    } catch (error: any) {
      console.error('Checkout success error:', error);
      res.status(500).json({ 
        message: "Error processing checkout", 
        error: error.message 
      });
    }
  });

  // Cancel subscription
  app.post("/api/vendor-subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const { vendorId } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get vendor with subscription info
      const [vendor] = await db.select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor || !vendor.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Cancel in Stripe
      const canceledSubscription = await stripe.subscriptions.update(
        vendor.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      // Update database
      await db.update(vendors)
        .set({
          subscriptionStatus: 'past_due',
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendorId));

      res.json({ 
        success: true, 
        message: "Subscription will be canceled at the end of the billing period",
        cancelAt: new Date(canceledSubscription.cancel_at! * 1000)
      });
    } catch (error: any) {
      console.error('Subscription cancel error:', error);
      res.status(500).json({ 
        message: "Error canceling subscription", 
        error: error.message 
      });
    }
  });

  // Get subscription tiers
  app.get("/api/vendor-subscription/tiers", async (req, res) => {
    try {
      res.json(VENDOR_SUBSCRIPTION_TIERS);
    } catch (error: any) {
      console.error('Error fetching tiers:', error);
      res.status(500).json({ 
        message: "Error fetching subscription tiers", 
        error: error.message 
      });
    }
  });

  // Get subscription status
  app.get("/api/vendor-subscription/status/:vendorId", isAuthenticated, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get vendor to verify ownership
      const [vendor] = await db.select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      if (!vendor || vendor.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Use vendor subscription info
      if (!vendor.stripeSubscriptionId || vendor.subscriptionStatus !== 'active') {
        return res.json({ 
          hasSubscription: false,
          tier: 'basic',
          features: VENDOR_SUBSCRIPTION_TIERS.basic.features
        });
      }

      const tier = VENDOR_SUBSCRIPTION_TIERS[vendor.subscriptionTier as keyof typeof VENDOR_SUBSCRIPTION_TIERS];

      res.json({
        hasSubscription: true,
        tier: vendor.subscriptionTier,
        status: vendor.subscriptionStatus,
        currentPeriodEnd: vendor.subscriptionEndDate,
        features: tier?.features || VENDOR_SUBSCRIPTION_TIERS.basic.features,
      });
    } catch (error: any) {
      console.error('Subscription status error:', error);
      res.status(500).json({ 
        message: "Error fetching subscription status", 
        error: error.message 
      });
    }
  });

  // Stripe webhook handler
  app.post("/api/vendor-stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.warn('Stripe webhook secret not configured');
      return res.status(500).json({ message: "Webhook not configured" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Find vendor by Stripe customer ID
          const [vendor] = await db.select()
            .from(vendors)
            .where(eq(vendors.stripeCustomerId, customerId))
            .limit(1);

          if (vendor) {
            // Extract tier from metadata or price
            const tierKey = subscription.metadata?.tierKey || 'basic';
            
            await db.update(vendors)
              .set({
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status === 'active' ? 'active' : 'past_due',
                subscriptionTier: tierKey,
                subscriptionStartDate: new Date(subscription.current_period_start * 1000),
                subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
              })
              .where(eq(vendors.id, vendor.id));
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Find vendor by Stripe customer ID
          const [vendor] = await db.select()
            .from(vendors)
            .where(eq(vendors.stripeCustomerId, customerId))
            .limit(1);

          if (vendor) {
            await db.update(vendors)
              .set({
                subscriptionStatus: 'cancelled',
                subscriptionTier: 'basic',
                updatedAt: new Date(),
              })
              .where(eq(vendors.id, vendor.id));
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log('Payment succeeded for invoice:', invoice.id);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          
          // Find vendor by Stripe customer ID
          const [vendor] = await db.select()
            .from(vendors)
            .where(eq(vendors.stripeCustomerId, customerId))
            .limit(1);

          if (vendor) {
            await db.update(vendors)
              .set({
                subscriptionStatus: 'past_due',
                updatedAt: new Date(),
              })
              .where(eq(vendors.id, vendor.id));
          }
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ message: "Webhook processing failed", error: error.message });
    }
  });
}