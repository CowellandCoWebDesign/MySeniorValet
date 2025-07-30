import { type Express } from "express";
import express from "express";
import { db } from "../db";
import { users, paymentTransactions } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../replitAuth";
import { stripePaymentService } from "../stripe-payments";
import Stripe from "stripe";

export function registerPaymentRoutes(app: Express) {
  // Create checkout session
  app.post('/api/payments/create-checkout-session', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { priceId, successUrl, cancelUrl } = req.body;

      if (!priceId) {
        return res.status(400).json({ message: 'Price ID is required' });
      }

      const session = await stripePaymentService.createCheckoutSession({
        userId,
        priceId,
        successUrl: successUrl || `${process.env.SITE_URL}/payment/success`,
        cancelUrl: cancelUrl || `${process.env.SITE_URL}/payment/cancel`
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  });

  // Handle Stripe webhook
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    try {
      const event = stripePaymentService.constructWebhookEvent(
        req.body,
        sig
      );

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutComplete(session);
          break;
        
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          break;
        
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCancelled(deletedSubscription);
          break;
        
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await handlePaymentSucceeded(invoice);
          break;
        
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(failedInvoice);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  });

  // Get user's payment methods
  app.get('/api/payments/methods', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }

      const paymentMethods = await stripePaymentService.getPaymentMethods(user.stripeCustomerId);
      res.json({ paymentMethods });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  });

  // Add payment method
  app.post('/api/payments/methods', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { paymentMethodId } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({ message: 'Payment method ID is required' });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let customerId = user.stripeCustomerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripePaymentService.createCustomer({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          metadata: { userId: user.id.toString() }
        });
        
        customerId = customer.id;
        
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, userId));
      }

      const paymentMethod = await stripePaymentService.attachPaymentMethod(
        paymentMethodId,
        customerId
      );

      res.json({ paymentMethod });
    } catch (error) {
      console.error('Error adding payment method:', error);
      res.status(500).json({ message: 'Failed to add payment method' });
    }
  });

  // Remove payment method
  app.delete('/api/payments/methods/:paymentMethodId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { paymentMethodId } = req.params;

      await stripePaymentService.detachPaymentMethod(paymentMethodId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing payment method:', error);
      res.status(500).json({ message: 'Failed to remove payment method' });
    }
  });

  // Get subscription status
  app.get('/api/payments/subscription', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ 
          stripeSubscriptionId: users.stripeSubscriptionId,
          stripeCustomerId: users.stripeCustomerId
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }

      const subscription = await stripePaymentService.getSubscription(user.stripeSubscriptionId);
      res.json({ subscription });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  // Cancel subscription
  app.post('/api/payments/subscription/cancel', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const [user] = await db
        .select({ stripeSubscriptionId: users.stripeSubscriptionId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription' });
      }

      const subscription = await stripePaymentService.cancelSubscription(user.stripeSubscriptionId);
      
      // Update user record
      await db
        .update(users)
        .set({ 
          stripeSubscriptionId: null,
          subscriptionStatus: 'cancelled',
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      res.json({ subscription });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // Get payment history
  app.get('/api/payments/history', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const paymentHistory = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, userId))
        .orderBy(desc(payments.createdAt))
        .limit(50);

      res.json(paymentHistory);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Failed to fetch payment history' });
    }
  });
}

// Helper functions for webhook handlers
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.subscription) return;

  const userId = session.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: 'active',
      updatedAt: new Date()
    })
    .where(eq(users.id, parseInt(userId)));
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status as any,
      updatedAt: new Date()
    })
    .where(eq(users.id, parseInt(userId)));
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db
    .update(users)
    .set({
      stripeSubscriptionId: null,
      subscriptionStatus: 'cancelled',
      updatedAt: new Date()
    })
    .where(eq(users.id, parseInt(userId)));
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;

  // Record payment
  const customerId = invoice.customer as string;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  await db
    .insert(payments)
    .values({
      userId: user.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: 'succeeded',
      stripePaymentIntentId: invoice.payment_intent as string,
      description: 'Subscription payment'
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  const customerId = invoice.customer as string;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  // Update subscription status
  await db
    .update(users)
    .set({
      subscriptionStatus: 'past_due',
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  // TODO: Send payment failed notification
}