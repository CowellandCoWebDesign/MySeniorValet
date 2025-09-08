/**
 * Stripe Customer Portal Routes
 * Allows customers to manage their subscriptions
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { subscriptions, communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil' as any,
});

/**
 * Create a Customer Portal Session
 * This allows customers to manage their subscription, update payment methods,
 * download invoices, and cancel their subscription
 */
router.post('/create-portal-session', async (req: Request, res: Response) => {
  try {
    const { communityId, returnUrl } = req.body;

    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    // Get the subscription for this community
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, parseInt(communityId)))
      .limit(1);

    if (!subscription[0]) {
      return res.status(404).json({ error: 'No subscription found for this community' });
    }

    const stripeCustomerId = subscription[0].stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer ID found' });
    }

    // Create the portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || `${req.protocol}://${req.get('host')}/community-portal`,
      configuration: undefined, // Use default portal configuration
    });

    console.log(`🔐 Created customer portal session for community ${communityId}`);

    res.json({
      success: true,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error.message 
    });
  }
});

/**
 * Get subscription details for a community
 */
router.get('/subscription/:communityId', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;

    // Get subscription from database
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, parseInt(communityId)))
      .limit(1);

    if (!subscription[0]) {
      return res.json({
        hasSubscription: false,
        message: 'No subscription found',
      });
    }

    // Get additional details from Stripe if needed
    let stripeSubscription: Stripe.Subscription | null = null;
    if (subscription[0].stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription[0].stripeSubscriptionId
        );
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    res.json({
      hasSubscription: true,
      subscription: {
        id: subscription[0].id,
        tier: subscription[0].tier || subscription[0].productId,
        status: subscription[0].status,
        currentPeriodStart: subscription[0].currentPeriodStart,
        currentPeriodEnd: subscription[0].currentPeriodEnd,
        cancelAtPeriodEnd: subscription[0].cancelAtPeriodEnd,
        // Include Stripe data if available
        stripeData: stripeSubscription ? {
          priceAmount: stripeSubscription.items.data[0]?.price.unit_amount 
            ? stripeSubscription.items.data[0].price.unit_amount / 100 
            : null,
          currency: stripeSubscription.currency,
          interval: stripeSubscription.items.data[0]?.price.recurring?.interval,
          nextInvoiceDate: stripeSubscription.current_period_end 
            ? new Date(stripeSubscription.current_period_end * 1000) 
            : null,
        } : null,
      },
    });

  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subscription',
      message: error.message 
    });
  }
});

/**
 * Cancel a subscription
 */
router.post('/cancel-subscription', async (req: Request, res: Response) => {
  try {
    const { communityId, immediate = false } = req.body;

    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    // Get the subscription
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, parseInt(communityId)))
      .limit(1);

    if (!subscription[0] || !subscription[0].stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.update(
      subscription[0].stripeSubscriptionId,
      {
        cancel_at_period_end: !immediate,
        prorate: true,
      }
    );

    // If immediate cancellation, delete the subscription
    if (immediate) {
      await stripe.subscriptions.cancel(subscription[0].stripeSubscriptionId);
    }

    // Update our database
    await db.update(subscriptions)
      .set({
        cancelAtPeriodEnd: !immediate,
        canceledAt: immediate ? new Date() : null,
        status: immediate ? 'canceled' : subscription[0].status,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription[0].id));

    // Update community status
    await db.update(communities)
      .set({
        subscriptionStatus: immediate ? 'inactive' : 'active',
        subscriptionTier: immediate ? 'free' : subscription[0].tier || subscription[0].productId,
      })
      .where(eq(communities.id, parseInt(communityId)));

    console.log(`❌ Subscription cancellation requested for community ${communityId}`);

    res.json({
      success: true,
      message: immediate 
        ? 'Subscription canceled immediately' 
        : 'Subscription will cancel at the end of the billing period',
      cancelAtPeriodEnd: !immediate,
    });

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message 
    });
  }
});

/**
 * Reactivate a canceled subscription
 */
router.post('/reactivate-subscription', async (req: Request, res: Response) => {
  try {
    const { communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }

    // Get the subscription
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, parseInt(communityId)))
      .limit(1);

    if (!subscription[0] || !subscription[0].stripeSubscriptionId) {
      return res.status(404).json({ error: 'No subscription found to reactivate' });
    }

    // Reactivate in Stripe (remove cancel_at_period_end flag)
    const reactivatedSubscription = await stripe.subscriptions.update(
      subscription[0].stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    // Update our database
    await db.update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        canceledAt: null,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription[0].id));

    // Update community status
    await db.update(communities)
      .set({
        subscriptionStatus: 'active',
        subscriptionTier: subscription[0].tier || subscription[0].productId,
      })
      .where(eq(communities.id, parseInt(communityId)));

    console.log(`✅ Subscription reactivated for community ${communityId}`);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
    });

  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ 
      error: 'Failed to reactivate subscription',
      message: error.message 
    });
  }
});

/**
 * Change subscription plan
 */
router.post('/change-plan', async (req: Request, res: Response) => {
  try {
    const { communityId, newTier } = req.body;

    if (!communityId || !newTier) {
      return res.status(400).json({ error: 'Community ID and new tier required' });
    }

    // Map tier to Price ID
    const PRICE_IDS: Record<string, string> = {
      starter: 'price_1S53IkEQ489MwJ34ktvmZFHk',
      growth: 'price_1S53IlEQ489MwJ34c6h8MRG8',
      professional: 'price_1S53ImEQ489MwJ34haImoDqJ',
      premium: 'price_1S53InEQ489MwJ34Be6qsJBz',
      enterprise: 'price_1S53InEQ489MwJ34FMoJIocA',
    };

    const newPriceId = PRICE_IDS[newTier];
    if (!newPriceId) {
      return res.status(400).json({ error: 'Invalid tier selected' });
    }

    // Get the subscription
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, parseInt(communityId)))
      .limit(1);

    if (!subscription[0] || !subscription[0].stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Get the Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription[0].stripeSubscriptionId
    );

    // Update the subscription item with the new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription[0].stripeSubscriptionId,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
      }
    );

    // Update our database
    await db.update(subscriptions)
      .set({
        stripePriceId: newPriceId,
        tier: newTier,
        productId: newTier,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription[0].id));

    // Update community
    await db.update(communities)
      .set({
        subscriptionTier: newTier,
      })
      .where(eq(communities.id, parseInt(communityId)));

    console.log(`🔄 Subscription plan changed for community ${communityId}: ${subscription[0].tier} → ${newTier}`);

    res.json({
      success: true,
      message: `Successfully changed plan to ${newTier}`,
      newTier,
    });

  } catch (error: any) {
    console.error('Error changing subscription plan:', error);
    res.status(500).json({ 
      error: 'Failed to change subscription plan',
      message: error.message 
    });
  }
});

export default router;