import { Router } from "express";
import { db } from "../db";
import { claimedCommunities, subscriptions } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get community subscription status
router.get('/communities/:communityId/subscription-status', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Check if community is claimed
    const [claimedCommunity] = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.communityId, communityId))
      .limit(1);
    
    if (!claimedCommunity) {
      return res.json({
        status: 'unclaimed',
        planName: 'Free Basic Listing',
        monthlyAmount: 0,
        features: [
          'Basic community listing',
          'Contact information display',
          'Standard search visibility'
        ]
      });
    }

    // Get active subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.communityId, communityId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);

    if (!subscription) {
      return res.json({
        status: 'no_subscription',
        planName: 'Claimed - No Active Plan',
        monthlyAmount: 0,
        features: [
          'Community claimed',
          'Basic profile editing',
          'Contact information management'
        ]
      });
    }

    // Map subscription plan to features
    const planFeatures = {
      'basic-listing': [
        'Basic community listing',
        'Contact information display',
        'Standard search visibility'
      ],
      'featured-spotlight': [
        'Featured placement in search results',
        'Enhanced community profile',
        'Photo gallery (up to 10 photos)',
        'Priority customer support',
        'Basic analytics dashboard'
      ],
      'premium-tools': [
        'All Featured Spotlight features',
        'Advanced analytics and reporting',
        'Lead management tools',
        'Direct family messaging',
        'Custom branding options',
        'Priority technical support'
      ],
      'enterprise-suite': [
        'All Premium Tools features',
        'Multi-location management',
        'Advanced integrations',
        'Dedicated account manager',
        'Custom development support',
        'White-label options'
      ]
    };

    return res.json({
      status: subscription.stripeSubscriptionStatus || 'active',
      planName: subscription.planName,
      planId: subscription.productId,
      monthlyAmount: subscription.amount / 100,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      features: planFeatures[subscription.productId as keyof typeof planFeatures] || [],
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId
    });

  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Failed to fetch subscription status' });
  }
});

// Update community subscription (for community managers)
router.patch('/communities/:communityId/subscription', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { productId } = req.body;

    // Verify community is claimed
    const [claimedCommunity] = await db
      .select()
      .from(claimedCommunities)
      .where(eq(claimedCommunities.communityId, communityId))
      .limit(1);

    if (!claimedCommunity) {
      return res.status(404).json({ message: 'Community must be claimed first' });
    }

    // Create or update subscription record
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, communityId))
      .limit(1);

    if (subscription) {
      // Update existing subscription
      const [updated] = await db
        .update(subscriptions)
        .set({
          productId,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, subscription.id))
        .returning();
      
      return res.json(updated);
    } else {
      // Create new subscription record
      const [newSubscription] = await db
        .insert(subscriptions)
        .values({
          communityId,
          productId,
          userId: claimedCommunity.userId,
          status: 'pending',
          amount: 0, // Will be updated when Stripe webhook processes
          currency: 'usd',
          planName: productId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return res.json(newSubscription);
    }

  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

// Get subscription analytics for community
router.get('/communities/:communityId/subscription-analytics', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Get subscription history and metrics
    const subscriptionHistory = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.communityId, communityId));

    if (subscriptionHistory.length === 0) {
      return res.json({
        totalSpent: 0,
        monthsSubscribed: 0,
        currentPlan: 'None',
        upgradeHistory: []
      });
    }

    const totalSpent = subscriptionHistory.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const currentSubscription = subscriptionHistory.find(sub => sub.status === 'active');
    
    return res.json({
      totalSpent: totalSpent / 100, // Convert from cents
      monthsSubscribed: subscriptionHistory.length,
      currentPlan: currentSubscription?.planName || 'None',
      upgradeHistory: subscriptionHistory.map(sub => ({
        planName: sub.planName,
        amount: sub.amount / 100,
        startDate: sub.createdAt,
        status: sub.status
      }))
    });

  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({ message: 'Failed to fetch subscription analytics' });
  }
});

export default router;