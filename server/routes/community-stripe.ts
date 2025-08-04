import express, { type Express } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { communities, claimedCommunities } from "@shared/schema";
import { SUBSCRIPTION_TIERS } from "../services/community-subscription";
import { isAuthenticated } from "../replitAuth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export function registerCommunityStripeRoutes(app: Express) {
  // Create a checkout session for community subscription
  app.post("/api/community-subscription/create-checkout-session", isAuthenticated, async (req, res) => {
    try {
      const { communityId, tierKey } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify community ownership
      const [claimedCommunity] = await db.select()
        .from(claimedCommunities)
        .where(eq(claimedCommunities.communityId, communityId))
        .limit(1);

      if (!claimedCommunity || claimedCommunity.ownerId !== userId) {
        return res.status(403).json({ message: "You must claim this community first" });
      }

      // Get community details
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      // Get tier info
      const tier = SUBSCRIPTION_TIERS[tierKey as keyof typeof SUBSCRIPTION_TIERS];
      if (!tier) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      // Don't charge for verified (free) tier
      if (tierKey === 'verified') {
        await db.update(communities)
          .set({
            subscriptionTier: 'verified',
            billingStatus: 'active',
            updatedAt: new Date(),
          })
          .where(eq(communities.id, communityId));

        return res.json({ 
          success: true, 
          message: "Free tier activated",
          tier: 'verified'
        });
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = community.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: community.email || `community${communityId}@myseniorvalet.com`,
          name: community.name,
          metadata: {
            communityId: communityId.toString(),
          },
        });
        
        stripeCustomerId = customer.id;
        
        // Store customer ID in database
        await db.update(communities)
          .set({ 
            stripeCustomerId: customer.id,
            updatedAt: new Date(),
          })
          .where(eq(communities.id, communityId));
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.displayName} - Community Subscription`,
              description: `Monthly subscription for ${community.name}`,
              images: community.imageUrl ? [community.imageUrl] : undefined,
            },
            unit_amount: tier.price * 100, // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/community/${communityId}?session_id={CHECKOUT_SESSION_ID}&subscription=success`,
        cancel_url: `${req.protocol}://${req.get('host')}/community-portal-integrated`,
        metadata: {
          communityId: communityId.toString(),
          userId,
          tierKey,
        },
        client_reference_id: communityId.toString(),
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
  app.get("/api/community-subscription/checkout-success", isAuthenticated, async (req, res) => {
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

      const communityId = parseInt(session.metadata?.communityId || '0');
      const tierKey = session.metadata?.tierKey;

      if (!communityId || !tierKey) {
        return res.status(400).json({ message: "Invalid session metadata" });
      }

      // Update community subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await db.update(communities)
        .set({
          subscriptionTier: tierKey as any,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          billingStatus: 'active',
          subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(communities.id, communityId));

      // Update claimed community subscription info
      await db.update(claimedCommunities)
        .set({
          subscriptionPlan: tierKey === 'verified' ? 'Free' : tierKey === 'standard' ? 'Basic' : tierKey === 'featured' ? 'Professional' : 'Enterprise',
          subscriptionStatus: 'Active',
          subscriptionStarted: new Date(subscription.current_period_start * 1000),
          subscriptionExpires: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(claimedCommunities.communityId, communityId));

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
  app.post("/api/community-subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify ownership
      const [claimedCommunity] = await db.select()
        .from(claimedCommunities)
        .where(eq(claimedCommunities.communityId, communityId))
        .limit(1);

      if (!claimedCommunity || claimedCommunity.ownerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get community with subscription info
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community || !community.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }

      // Cancel in Stripe
      const canceledSubscription = await stripe.subscriptions.update(
        community.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      // Update database
      await db.update(communities)
        .set({
          billingStatus: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(communities.id, communityId));

      await db.update(claimedCommunities)
        .set({
          subscriptionStatus: 'Cancelled',
          updatedAt: new Date(),
        })
        .where(eq(claimedCommunities.communityId, communityId));

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

  // Get subscription pricing for communities
  app.get("/api/community-subscription/pricing", async (req, res) => {
    try {
      const tiers = Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => ({
        id: key,
        name: tier.displayName,
        price: tier.price,
        badge: tier.badge,
        features: tier.features,
        popular: key === 'featured' // Mark Featured as popular
      }));

      res.json(tiers);
    } catch (error: any) {
      console.error('Error fetching pricing:', error);
      res.status(500).json({ 
        message: "Error fetching subscription pricing", 
        error: error.message 
      });
    }
  });

  // Stripe webhook handler for communities
  app.post("/api/community-stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_COMMUNITY_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.warn('Community Stripe webhook secret not configured');
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
          
          // Find community by Stripe customer ID
          const [community] = await db.select()
            .from(communities)
            .where(eq(communities.stripeCustomerId, customerId))
            .limit(1);

          if (community) {
            // Extract tier from metadata
            const tierKey = subscription.metadata?.tierKey || 'verified';
            
            await db.update(communities)
              .set({
                stripeSubscriptionId: subscription.id,
                billingStatus: subscription.status === 'active' ? 'active' : 'past_due',
                subscriptionTier: tierKey as any,
                subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
              })
              .where(eq(communities.id, community.id));
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Find community by Stripe customer ID
          const [community] = await db.select()
            .from(communities)
            .where(eq(communities.stripeCustomerId, customerId))
            .limit(1);

          if (community) {
            await db.update(communities)
              .set({
                billingStatus: 'canceled',
                subscriptionTier: 'verified', // Downgrade to free tier
                updatedAt: new Date(),
              })
              .where(eq(communities.id, community.id));
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          
          // Find community by Stripe customer ID
          const [community] = await db.select()
            .from(communities)
            .where(eq(communities.stripeCustomerId, customerId))
            .limit(1);

          if (community) {
            await db.update(communities)
              .set({
                billingStatus: 'past_due',
                updatedAt: new Date(),
              })
              .where(eq(communities.id, community.id));
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