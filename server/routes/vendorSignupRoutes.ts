import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { vendorRegistrations, auditLogs } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create vendor signup payment intent
router.post('/api/vendor-signup', async (req, res) => {
  try {
    const {
      businessName,
      contactName,
      email,
      phone,
      website,
      businessType,
      description,
      serviceAreas,
      planType,
      amount
    } = req.body;

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: contactName,
      phone,
      metadata: {
        businessName,
        businessType,
        planType
      }
    });

    // First create a product for this vendor plan
    const product = await stripe.products.create({
      name: `MySeniorValet ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
      description: `${planType} vendor listing on MySeniorValet platform`
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    // Create subscription with payment intent
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        businessName,
        contactName,
        email,
        phone,
        website: website || '',
        businessType,
        description,
        serviceAreas,
        planType
      }
    });

    const paymentIntent = subscription.latest_invoice?.payment_intent;

    if (!paymentIntent || typeof paymentIntent === 'string') {
      throw new Error('Failed to create payment intent');
    }

    // Log the signup attempt
    await db.insert(auditLogs).values({
      userId: null,
      action: 'vendor_signup_initiated',
      entityType: 'vendor',
      entityId: null,
      metadata: {
        additionalInfo: {
          businessName,
          email,
          planType,
          customerId: customer.id,
          subscriptionId: subscription.id
        }
      },
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      customerId: customer.id
    });
  } catch (error: any) {
    console.error('Vendor signup error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize vendor signup',
      message: error.message 
    });
  }
});

// Handle Stripe webhook for successful payments
router.post('/api/stripe-webhook/vendor', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription;
        
        if (typeof subscription === 'string' && invoice.billing_reason === 'subscription_create') {
          // Get subscription details
          const sub = await stripe.subscriptions.retrieve(subscription, {
            expand: ['customer']
          });
          
          const metadata = sub.metadata;
          const customer = sub.customer as Stripe.Customer;
          
          // Create vendor registration record
          const [vendorReg] = await db.insert(vendorRegistrations).values({
            businessName: metadata.businessName,
            contactName: metadata.contactName,
            email: metadata.email,
            phone: metadata.phone,
            website: metadata.website || null,
            businessType: metadata.businessType,
            description: metadata.description,
            serviceAreas: metadata.serviceAreas.split(',').map(s => s.trim()),
            planType: metadata.planType as 'basic' | 'professional' | 'enterprise',
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription,
            status: 'active',
            verifiedPartner: metadata.planType !== 'basic',
            monthlyAmount: invoice.amount_paid / 100
          }).returning();
          
          // Log successful registration
          await db.insert(auditLogs).values({
            userId: null,
            action: 'vendor_registration_completed',
            entityType: 'vendor',
            entityId: String(vendorReg.id),
            metadata: {
              additionalInfo: {
                businessName: metadata.businessName,
                planType: metadata.planType,
                amount: invoice.amount_paid / 100
              }
            },
            ipAddress: 'stripe-webhook',
            userAgent: 'stripe-webhook'
          });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update vendor status to inactive
        await db.update(vendorRegistrations)
          .set({ 
            status: 'inactive',
            updatedAt: new Date()
          })
          .where(eq(vendorRegistrations.stripeSubscriptionId, subscription.id));
          
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get vendor registration status
router.get('/api/vendor-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const vendor = await db.query.vendorRegistrations.findFirst({
      where: eq(vendorRegistrations.email, email)
    });
    
    if (vendor) {
      res.json({
        exists: true,
        status: vendor.status,
        planType: vendor.planType,
        businessName: vendor.businessName
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking vendor status:', error);
    res.status(500).json({ error: 'Failed to check vendor status' });
  }
});

// Get vendor registration status by payment intent
router.post('/api/vendor-registration-status', async (req, res) => {
  try {
    const { paymentIntent, paymentIntentClientSecret } = req.body;
    
    if (!paymentIntent) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    // Retrieve the payment intent from Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntent);
    
    if (!pi || pi.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get the subscription from the payment intent metadata
    const subscriptionId = pi.metadata?.subscriptionId;
    
    if (!subscriptionId) {
      // Try to find the vendor by customer ID
      const customerId = pi.customer as string;
      const vendor = await db.query.vendorRegistrations.findFirst({
        where: eq(vendorRegistrations.stripeCustomerId, customerId)
      });
      
      if (vendor) {
        return res.json({
          businessName: vendor.businessName,
          email: vendor.email,
          planType: vendor.planType,
          monthlyAmount: vendor.monthlyAmount,
          status: vendor.status
        });
      }
    }
    
    // Find vendor by subscription ID
    const vendor = await db.query.vendorRegistrations.findFirst({
      where: eq(vendorRegistrations.stripeSubscriptionId, subscriptionId)
    });
    
    if (vendor) {
      res.json({
        businessName: vendor.businessName,
        email: vendor.email,
        planType: vendor.planType,
        monthlyAmount: vendor.monthlyAmount,
        status: vendor.status
      });
    } else {
      // Vendor record might not be created yet (webhook pending)
      // Return basic info from payment intent
      res.json({
        businessName: pi.metadata?.businessName || 'Your Business',
        email: pi.receipt_email || pi.metadata?.email || '',
        planType: pi.metadata?.planType || 'professional',
        monthlyAmount: (pi.amount / 100).toFixed(2),
        status: 'pending'
      });
    }
  } catch (error: any) {
    console.error('Error checking vendor registration status:', error);
    res.status(500).json({ error: 'Failed to check registration status' });
  }
});

export default router;