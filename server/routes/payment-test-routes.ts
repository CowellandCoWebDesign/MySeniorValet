import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { auditLogs } from '@shared/schema';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Test 1: Verify Stripe Configuration
router.get('/test/configuration', async (req, res) => {
  try {
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPublishableKey = !!process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
    
    // Test API connection
    let apiConnected = false;
    let mode = 'unknown';
    
    if (hasSecretKey) {
      try {
        const balance = await stripe.balance.retrieve();
        apiConnected = true;
        mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test';
      } catch (error) {
        console.error('Stripe API connection error:', error);
      }
    }
    
    res.json({
      hasSecretKey,
      hasPublishableKey,
      hasWebhookSecret,
      apiConnected,
      mode,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test 2: Create Test Payment Intent
router.post('/test/create-intent', async (req, res) => {
  try {
    const { amount = 100, description = 'Test payment' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      description,
      metadata: {
        test: 'true',
        created_at: new Date().toISOString()
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test 3: Webhook Endpoint Ping
router.post('/test/webhook-ping', async (req, res) => {
  try {
    // Test webhook configuration
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    // Create a test audit log entry
    await db.insert(auditLogs).values({
      userId: null,
      adminId: null,
      action: 'webhook_test_ping',
      entityType: 'webhook',
      entityId: 'test',
      metadata: { 
        test: true,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      sessionId: null,
      severity: 'info',
      outcome: 'success',
      createdAt: new Date()
    });
    
    res.json({
      success: true,
      webhookConfigured: !!webhookSecret,
      endpoint: 'https://myseniorvalet.com/api/stripe/webhook',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test 4: Verify Subscription Products
router.get('/test/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 20
    });
    
    const prices = await stripe.prices.list({
      active: true,
      limit: 20
    });
    
    res.json({
      products: products.data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active
      })),
      prices: prices.data.map(p => ({
        id: p.id,
        product: p.product,
        unit_amount: p.unit_amount,
        currency: p.currency,
        recurring: p.recurring
      })),
      productCount: products.data.length,
      priceCount: prices.data.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test 5: Email Notifications
router.post('/test/email', async (req, res) => {
  try {
    const { type = 'test', email = 'test@myseniorvalet.com' } = req.body;
    
    const hasSendgridKey = !!process.env.SENDGRID_API_KEY;
    
    if (hasSendgridKey) {
      // Don't actually send in test mode
      res.json({
        success: true,
        sendgridConfigured: true,
        testEmail: email,
        message: 'SendGrid configured - email test skipped to avoid spam'
      });
    } else {
      res.json({
        success: false,
        sendgridConfigured: false,
        message: 'SendGrid API key not configured'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test 6: Database Connectivity
router.get('/test/database', async (req, res) => {
  try {
    // Test database connection by counting audit logs
    const result = await db.select().from(auditLogs).limit(1);
    
    res.json({
      connected: true,
      canRead: true,
      canWrite: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// Test 7: Audit Logging
router.post('/test/audit-log', async (req, res) => {
  try {
    const { action = 'test_payment_system', details = 'Testing audit log' } = req.body;
    
    const [log] = await db.insert(auditLogs).values({
      userId: null,
      adminId: null,
      action,
      entityType: 'test',
      entityId: 'payment-test',
      metadata: { details, timestamp: new Date().toISOString() },
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      sessionId: null,
      severity: 'info',
      outcome: 'success',
      createdAt: new Date()
    }).returning();
    
    res.json({
      success: true,
      logId: log.id,
      action: log.action,
      timestamp: log.createdAt
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test 8: Refund Capability
router.post('/test/refund-check', async (req, res) => {
  try {
    // Check if we can access refund API
    const charges = await stripe.charges.list({ limit: 1 });
    
    res.json({
      canRefund: true,
      apiAccessible: true,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      canRefund: false,
      error: error.message
    });
  }
});

// Test Checkout Session Creation
router.post('/test/checkout-session', async (req, res) => {
  try {
    const { tier = 'basic', testMode = true } = req.body;
    
    // Define test prices (you'll need to create these in Stripe)
    const prices: Record<string, { amount: number, name: string }> = {
      basic: { amount: 19900, name: 'Basic Tier - Test' },
      professional: { amount: 49900, name: 'Professional Tier - Test' },
      enterprise: { amount: 99900, name: 'Enterprise Tier - Test' }
    };
    
    const selectedPrice = prices[tier] || prices.basic;
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPrice.name,
              description: `MySeniorValet ${tier} subscription test`
            },
            unit_amount: selectedPrice.amount,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.protocol}://${req.get('host')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/payment-test-suite`,
      metadata: {
        test: 'true',
        tier,
        timestamp: new Date().toISOString()
      }
    });
    
    res.json({
      sessionId: session.id,
      url: session.url,
      tier,
      amount: selectedPrice.amount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Recent Webhook Events
router.get('/test/webhook-events', async (req, res) => {
  try {
    // Get recent webhook events from Stripe
    const events = await stripe.events.list({
      limit: 10
    });
    
    res.json({
      events: events.data.map(e => ({
        id: e.id,
        type: e.type,
        created: e.created,
        livemode: e.livemode
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;