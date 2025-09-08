/**
 * Test Subscription Flow Endpoint
 * This helps verify the subscription system works end-to-end
 */

import express from 'express';
import { db } from '../db';
import { communities, subscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { PaymentNotificationService } from '../services/payment-notification-service';

const router = express.Router();
const notificationService = new PaymentNotificationService();

// Test webhook handler - simulates successful subscription
router.post('/test-subscription-success', async (req, res) => {
  try {
    const { communityId, tier, customerEmail } = req.body;
    
    if (!communityId || !tier || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🧪 Testing subscription flow for:', { communityId, tier, customerEmail });

    // 1. Update community subscription status (simulating webhook)
    await db.update(communities)
      .set({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        billingStatus: 'active'
      })
      .where(eq(communities.id, parseInt(communityId)));
    
    console.log('✅ Updated community subscription status');

    // 2. Create subscription record
    await db.insert(subscriptions).values({
      stripeSubscriptionId: `test_sub_${Date.now()}`,
      stripeCustomerId: `test_cus_${Date.now()}`,
      stripePriceId: `test_price_${tier}`,
      communityId: parseInt(communityId),
      productId: tier,
      tier: tier,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {
        test: true,
        communityName: 'Test Community'
      }
    });
    
    console.log('✅ Created subscription record');

    // 3. Send test notification
    await notificationService.sendPaymentNotification({
      type: 'subscription_created',
      customerEmail,
      tierName: tier,
      amount: getTierPrice(tier),
      subscriptionType: 'community',
      metadata: {
        communityId,
        test: true
      }
    });
    
    console.log('✅ Sent email notifications');

    // 4. Verify access is granted
    const [updatedCommunity] = await db.select()
      .from(communities)
      .where(eq(communities.id, parseInt(communityId)))
      .limit(1);

    res.json({
      success: true,
      message: 'Test subscription flow completed',
      community: {
        id: updatedCommunity.id,
        name: updatedCommunity.name,
        subscriptionTier: updatedCommunity.subscriptionTier,
        subscriptionStatus: updatedCommunity.subscriptionStatus,
        billingStatus: updatedCommunity.billingStatus,
        features: getFeaturesByTier(tier)
      },
      emailsSent: {
        admin: 'admin@myseniorvalet.com',
        billing: 'billing@myseniorvalet.com (CC)',
        backup: 'william.cowell01@gmail.com (BCC)',
        customer: customerEmail
      }
    });

  } catch (error: any) {
    console.error('Test subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check community access
router.get('/check-access/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const hasActiveSubscription = 
      community.subscriptionStatus === 'active' && 
      community.billingStatus === 'active';

    const features = getFeaturesByTier(community.subscriptionTier || 'free');

    res.json({
      communityId,
      name: community.name,
      tier: community.subscriptionTier || 'free',
      status: community.subscriptionStatus || 'inactive',
      billingStatus: community.billingStatus || 'inactive',
      hasActiveSubscription,
      features,
      limits: {
        maxPhotos: features.maxPhotos,
        maxVideos: features.maxVideos,
        maxPdfs: features.maxPdfs,
        canMessage: features.messaging,
        canScheduleTours: features.tourScheduling
      }
    });
  } catch (error: any) {
    console.error('Check access error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test scenarios
router.get('/test-scenarios', (req, res) => {
  res.json({
    scenarios: [
      {
        name: 'Successful Payment',
        endpoint: '/api/test-subscription/test-subscription-success',
        method: 'POST',
        body: {
          communityId: 123,
          tier: 'starter',
          customerEmail: 'test@example.com'
        },
        description: 'Simulates successful subscription and sends emails'
      },
      {
        name: 'Check Access',
        endpoint: '/api/test-subscription/check-access/123',
        method: 'GET',
        description: 'Verifies what features a community has access to'
      },
      {
        name: 'Payment Failed',
        description: 'Would send failure notification and not grant access'
      },
      {
        name: 'Subscription Cancelled',
        description: 'Would downgrade to free tier and send cancellation email'
      }
    ]
  });
});

function getTierPrice(tier: string): number {
  const prices: Record<string, number> = {
    starter: 99,
    growth: 299,
    professional: 999,
    premium: 1999,
    enterprise: 3999
  };
  return prices[tier] || 0;
}

function getFeaturesByTier(tier: string) {
  const features: Record<string, any> = {
    starter: {
      maxPhotos: 5,
      maxVideos: 0,
      maxPdfs: 0,
      messaging: false,
      tourScheduling: true,
      analytics: 'basic',
      searchPlacement: 'standard'
    },
    growth: {
      maxPhotos: 20,
      maxVideos: 1,
      maxPdfs: 3,
      messaging: true,
      tourScheduling: true,
      tourMate: true,
      analytics: 'advanced',
      searchPlacement: 'featured'
    },
    professional: {
      maxPhotos: 'unlimited',
      maxVideos: 5,
      maxPdfs: 'unlimited',
      messaging: true,
      tourScheduling: true,
      tourMate: true,
      aiLeaseGeneration: true,
      analytics: 'advanced',
      searchPlacement: 'priority',
      multiProperty: 5
    },
    premium: {
      maxPhotos: 'unlimited',
      maxVideos: 10,
      maxPdfs: 'unlimited',
      messaging: true,
      tourScheduling: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: true,
      healthcareIntegrations: true,
      analytics: 'premium',
      searchPlacement: 'priority',
      multiProperty: 10
    },
    enterprise: {
      maxPhotos: 'unlimited',
      maxVideos: 'unlimited',
      maxPdfs: 'unlimited',
      messaging: true,
      tourScheduling: true,
      tourMate: true,
      aiLeaseGeneration: true,
      paymentProcessing: true,
      healthcareIntegrations: true,
      residentManagement: true,
      whiteLabelOptions: true,
      apiAccess: true,
      analytics: 'enterprise',
      searchPlacement: 'priority',
      multiProperty: 25
    },
    free: {
      maxPhotos: 3,
      maxVideos: 0,
      maxPdfs: 0,
      messaging: false,
      tourScheduling: false,
      analytics: 'none',
      searchPlacement: 'basic'
    }
  };
  return features[tier] || features.free;
}

export default router;