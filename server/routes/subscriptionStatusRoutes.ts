import { Router } from 'express';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { subscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Manual subscription status sync (for when webhooks aren't available)
router.post('/sync-status/:subscription_id', async (req: Request, res: Response) => {
  try {
    const subscriptionId = req.params.subscription_id;
    
    // Get subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update local database
    await db
      .update(subscriptions)
      .set({
        status: stripeSubscription.status as any,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    
    res.json({
      success: true,
      status: stripeSubscription.status,
      message: 'Subscription status synchronized'
    });
  } catch (error: any) {
    console.error('Failed to sync subscription status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync subscription status' 
    });
  }
});

// Check all subscription statuses
router.post('/sync-all', async (req: Request, res: Response) => {
  try {
    // Get all active subscriptions from database
    const localSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    
    const results = [];
    
    for (const subscription of localSubscriptions) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );
        
        // Update if status differs
        if (subscription.status !== stripeSubscription.status) {
          await db
            .update(subscriptions)
            .set({
              status: stripeSubscription.status as any,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              updatedAt: new Date()
            })
            .where(eq(subscriptions.id, subscription.id));
          
          results.push({
            subscription_id: subscription.stripeSubscriptionId,
            old_status: subscription.status,
            new_status: stripeSubscription.status,
            updated: true
          });
        } else {
          results.push({
            subscription_id: subscription.stripeSubscriptionId,
            status: subscription.status,
            updated: false
          });
        }
      } catch (error) {
        results.push({
          subscription_id: subscription.stripeSubscriptionId,
          error: 'Failed to retrieve from Stripe'
        });
      }
    }
    
    res.json({
      success: true,
      message: `Synchronized ${results.length} subscriptions`,
      results
    });
  } catch (error: any) {
    console.error('Failed to sync all subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync subscriptions' 
    });
  }
});

export default router;