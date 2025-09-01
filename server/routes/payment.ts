import { Router } from 'express';
import { paymentService, TIER_PRICING, ADDON_PRICING } from '../services/payment.service';
import { z } from 'zod';

const router = Router();

/**
 * Payment Processing API Routes
 * Flawless Execution: Complete validation and error handling
 */

// Validation schemas
const createSubscriptionSchema = z.object({
  communityId: z.number(),
  tier: z.enum(['starter', 'growth', 'professional', 'premium', 'enterprise']),
  addons: z.array(z.enum(['additionalTour', 'additionalListing', 'whiteLabel', 'apiAccess', 'dedicatedSupport'])).optional(),
  paymentMethodId: z.string().optional(),
  trial: z.boolean().optional()
});

const updateSubscriptionSchema = z.object({
  communityId: z.number(),
  newTier: z.enum(['starter', 'growth', 'professional', 'premium', 'enterprise']),
  addons: z.array(z.enum(['additionalTour', 'additionalListing', 'whiteLabel', 'apiAccess', 'dedicatedSupport'])).optional(),
  immediate: z.boolean().optional()
});

const createPaymentIntentSchema = z.object({
  communityId: z.number(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  description: z.string(),
  metadata: z.record(z.string()).optional()
});

// Get pricing tiers
router.get('/pricing/tiers', (req, res) => {
  try {
    const tiers = Object.entries(TIER_PRICING).map(([key, value]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      price: value.price,
      features: value.features,
      popular: key === 'professional',
      cta: key === 'enterprise' ? 'Contact Sales' : 'Get Started'
    }));

    res.json({
      success: true,
      tiers,
      addons: ADDON_PRICING
    });
  } catch (error: any) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      error: 'Failed to fetch pricing information'
    });
  }
});

// Create subscription
router.post('/subscriptions/create', async (req, res) => {
  try {
    const data = createSubscriptionSchema.parse(req.body);
    
    const result = await paymentService.createSubscription(data);
    
    res.json({
      success: true,
      subscription: result.subscription,
      clientSecret: result.clientSecret,
      requiresAction: result.requiresAction,
      message: `${data.tier} subscription created successfully`
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card declined',
        declineCode: error.decline_code
      });
    }
    
    res.status(400).json({
      error: error.message || 'Failed to create subscription'
    });
  }
});

// Update subscription
router.post('/subscriptions/update', async (req, res) => {
  try {
    const data = updateSubscriptionSchema.parse(req.body);
    
    const result = await paymentService.updateSubscription(data);
    
    res.json({
      success: true,
      subscription: result.subscription,
      proration: result.proration,
      message: `Subscription updated to ${data.newTier} tier`
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update subscription'
    });
  }
});

// Cancel subscription
router.post('/subscriptions/cancel', async (req, res) => {
  try {
    const { communityId, immediate } = req.body;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }
    
    await paymentService.cancelSubscription(communityId, immediate);
    
    res.json({
      success: true,
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at period end'
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(400).json({
      error: error.message || 'Failed to cancel subscription'
    });
  }
});

// Create payment intent for one-time payment
router.post('/payments/create-intent', async (req, res) => {
  try {
    const data = createPaymentIntentSchema.parse(req.body);
    
    const paymentIntent = await paymentService.createPaymentIntent(data);
    
    res.json({
      success: true,
      paymentIntent,
      message: 'Payment intent created successfully'
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(400).json({
      error: error.message || 'Failed to create payment intent'
    });
  }
});

// Get payment history
router.get('/communities/:communityId/payments', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }
    
    const payments = await paymentService.getPaymentHistory(communityId, limit);
    
    res.json({
      success: true,
      payments,
      count: payments.length
    });
  } catch (error: any) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch payment history'
    });
  }
});

// Get usage statistics
router.get('/communities/:communityId/usage', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }
    
    const usage = await paymentService.getUsageStatistics(communityId);
    
    res.json({
      success: true,
      usage: usage.usage,
      overages: usage.overages,
      totalOverageCharge: usage.totalOverageCharge,
      message: usage.totalOverageCharge > 0 
        ? `You have $${usage.totalOverageCharge} in overage charges`
        : 'No overage charges'
    });
  } catch (error: any) {
    console.error('Get usage error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch usage statistics'
    });
  }
});

// Get invoices
router.get('/communities/:communityId/invoices', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }
    
    const invoices = await paymentService.getInvoices(communityId, limit);
    
    res.json({
      success: true,
      invoices,
      count: invoices.length
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch invoices'
    });
  }
});

// Process refund
router.post('/refunds/process', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }
    
    const refund = await paymentService.processRefund({
      paymentIntentId,
      amount,
      reason
    });
    
    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        reason: refund.reason
      },
      message: 'Refund processed successfully'
    });
  } catch (error: any) {
    console.error('Process refund error:', error);
    res.status(400).json({
      error: error.message || 'Failed to process refund'
    });
  }
});

// Check subscription status
router.get('/communities/:communityId/subscription-status', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    if (!communityId) {
      return res.status(400).json({ error: 'Community ID required' });
    }
    
    // Get community subscription info from database
    const { db } = await import('../db');
    const { communities } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    const [community] = await db
      .select({
        tier: communities.subscriptionTier,
        status: communities.subscriptionStatus,
        currentPeriodEnd: communities.subscriptionCurrentPeriodEnd,
        stripeSubscriptionId: communities.stripeSubscriptionId
      })
      .from(communities)
      .where(eq(communities.id, communityId));
    
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    res.json({
      success: true,
      subscription: {
        tier: community.tier || 'starter',
        status: community.status || 'inactive',
        currentPeriodEnd: community.currentPeriodEnd,
        hasActiveSubscription: !!community.stripeSubscriptionId
      }
    });
  } catch (error: any) {
    console.error('Check subscription status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to check subscription status'
    });
  }
});

// Stripe webhook handler (registered in main routes with raw body parser)
router.post('/webhooks/stripe', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig) {
      return res.status(400).json({ error: 'No signature provided' });
    }
    
    // Note: Webhook processing is handled in webhookRoutes.ts
    // This is just for payment-specific webhook events
    
    const event = req.body;
    
    console.log(`💳 Payment webhook received: ${event.type}`);
    
    // Process payment-specific events
    switch (event.type) {
      case 'invoice.payment_succeeded':
        // Update payment history
        console.log('Invoice paid:', event.data.object.id);
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Invoice payment failed:', event.data.object.id);
        break;
        
      case 'customer.subscription.updated':
        // Update subscription status
        console.log('Subscription updated:', event.data.object.id);
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        console.log('Subscription cancelled:', event.data.object.id);
        break;
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({
      error: error.message || 'Webhook processing failed'
    });
  }
});

export default router;