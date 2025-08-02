import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { vendorRegistrations, auditLogs } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { sendVendorWelcomeEmail, sendVendorPaymentReceiptEmail } from '../email/vendorEmails';
import { internalNotifications } from '../services/internal-notifications';

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

          // Send welcome email
          await sendVendorWelcomeEmail({
            businessName: metadata.businessName,
            contactName: metadata.contactName,
            email: metadata.email,
            planType: metadata.planType as 'basic' | 'professional' | 'enterprise',
            monthlyAmount: invoice.amount_paid / 100,
            subscriptionId: subscription
          });

          // Send payment receipt
          await sendVendorPaymentReceiptEmail({
            businessName: metadata.businessName,
            contactName: metadata.contactName,
            email: metadata.email,
            planType: metadata.planType as 'basic' | 'professional' | 'enterprise',
            monthlyAmount: invoice.amount_paid / 100,
            subscriptionId: subscription,
            paymentIntentId: invoice.payment_intent as string
          });
          
          // Send internal notification
          try {
            await internalNotifications.notifyVendorRegistered({
              businessName: metadata.businessName,
              contactName: metadata.contactName,
              email: metadata.email,
              planType: metadata.planType,
              monthlyAmount: invoice.amount_paid / 100,
              subscriptionId: subscription
            });
          } catch (notificationError) {
            console.error('Error sending internal vendor notification:', notificationError);
            // Don't fail the webhook if internal notification fails
          }
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

// Get vendor profile
router.get('/api/vendor/profile', async (req, res) => {
  try {
    // For now, return mock authenticated user's vendor profile
    // In production, this would check the authenticated user's email
    const userEmail = req.query.email || 'test@example.com';
    
    const vendor = await db.query.vendorRegistrations.findFirst({
      where: eq(vendorRegistrations.email, userEmail as string)
    });
    
    if (vendor) {
      // Return vendor data in the format expected by the dashboard
      res.json({
        ...vendor,
        // Map new fields to legacy fields for compatibility
        contactPhone: vendor.phone,
        contactEmail: vendor.email,
        subscriptionTier: vendor.planType.charAt(0).toUpperCase() + vendor.planType.slice(1),
        verificationStatus: vendor.verifiedPartner ? 'Verified' : 'Pending',
        isActive: vendor.status === 'active',
        totalLeads: 0,
        totalConversions: 0,
        lifetimeRevenue: '0',
        totalReviews: 0,
        averageRating: null,
        commissionRate: vendor.planType === 'enterprise' ? '5%' : vendor.planType === 'professional' ? '8%' : '10%',
        services: []
      });
    } else {
      res.status(404).json({ error: 'No vendor profile found' });
    }
  } catch (error: any) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
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

// Get vendor leads (mock data for now)
router.get('/api/vendor/leads', async (req, res) => {
  try {
    // Return mock leads data
    res.json([
      {
        id: 1,
        vendorId: 1,
        customerName: "John Smith",
        customerEmail: "john@example.com",
        customerPhone: "(555) 123-4567",
        serviceRequested: "In-home care assistance",
        preferredDate: new Date().toISOString(),
        budget: "$2,000 - $3,000/month",
        location: "Los Angeles, CA",
        message: "Looking for help with daily activities for my mother",
        source: "Website",
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get vendor analytics (mock data for now)
router.get('/api/vendor/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Generate mock analytics data for the date range
    const analytics = [];
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      analytics.push({
        id: Math.random(),
        vendorId: 1,
        date: new Date(d).toISOString(),
        pageViews: Math.floor(Math.random() * 500) + 100,
        profileClicks: Math.floor(Math.random() * 50) + 10,
        contactClicks: Math.floor(Math.random() * 20) + 5,
        leadCount: Math.floor(Math.random() * 10) + 1,
        conversionCount: Math.floor(Math.random() * 5),
        revenue: String(Math.floor(Math.random() * 1000) + 100),
        averageResponseTime: Math.floor(Math.random() * 30) + 5,
        customerSatisfactionScore: Math.random() * 2 + 3
      });
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Update vendor metrics
router.post('/api/vendor/update-metrics', async (req, res) => {
  try {
    // Mock implementation - in production this would recalculate metrics
    res.json({ success: true, message: 'Metrics updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

export default router;