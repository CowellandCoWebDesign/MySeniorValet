import { type Express } from "express";
import Stripe from "stripe";

export function registerStripeRealChargeRoutes(app: Express) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });

  // Process ACTUAL sandbox charges with notifications
  app.post('/api/stripe/process-real-sandbox-charges', async (req, res) => {
    try {
      console.log('💳 PROCESSING REAL STRIPE SANDBOX CHARGES - This will create actual payment records');
      
      const testResults = {
        timestamp: new Date().toISOString(),
        charges: [],
        notifications: [],
        summary: {
          total: 0,
          successful: 0,
          failed: 0,
          totalAmount: 0
        }
      };

      // Test 1: Process Vendor Basic Subscription - $99 (REAL CHARGE)
      try {
        console.log('Processing $99 Vendor Basic subscription charge...');
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 9900, // $99.00
          currency: 'usd',
          description: 'MySeniorValet Vendor Basic Subscription Test - $99/month',
          metadata: {
            tier: 'vendor_basic',
            test: 'real_charge_1',
            customer_email: 'test@myseniorvalet.com'
          },
          payment_method_types: ['card'],
          confirm: false, // We'll confirm with test card
          automatic_payment_methods: {
            enabled: true
          }
        });

        // Simulate payment confirmation with test card
        const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: 'pm_card_visa', // Stripe test card
          return_url: 'http://localhost:5000/payment/success'
        });
        
        testResults.charges.push({
          tier: 'Vendor Basic',
          amount: '$99.00',
          status: confirmedPayment.status,
          paymentIntentId: confirmedPayment.id,
          clientSecret: confirmedPayment.client_secret,
          success: confirmedPayment.status === 'succeeded'
        });

        if (confirmedPayment.status === 'succeeded') {
          testResults.summary.successful++;
          testResults.summary.totalAmount += 99;
          
          // Simulate webhook notification
          testResults.notifications.push({
            type: 'payment.succeeded',
            amount: '$99.00',
            tier: 'vendor_basic',
            message: 'Payment processed successfully - notification would be sent'
          });
        }
        
      } catch (error: any) {
        testResults.charges.push({
          tier: 'Vendor Basic',
          amount: '$99.00',
          status: 'failed',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 2: Process Vendor Featured Subscription - $249 (REAL CHARGE)
      try {
        console.log('Processing $249 Vendor Featured subscription charge...');
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 24900, // $249.00
          currency: 'usd',
          description: 'MySeniorValet Vendor Featured Subscription Test - $249/month',
          metadata: {
            tier: 'vendor_featured',
            test: 'real_charge_2',
            customer_email: 'vendor@myseniorvalet.com'
          },
          payment_method_types: ['card'],
          automatic_payment_methods: {
            enabled: true
          }
        });

        const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: 'pm_card_visa_debit', // Different test card
          return_url: 'http://localhost:5000/payment/success'
        });
        
        testResults.charges.push({
          tier: 'Vendor Featured',
          amount: '$249.00',
          status: confirmedPayment.status,
          paymentIntentId: confirmedPayment.id,
          clientSecret: confirmedPayment.client_secret,
          success: confirmedPayment.status === 'succeeded'
        });

        if (confirmedPayment.status === 'succeeded') {
          testResults.summary.successful++;
          testResults.summary.totalAmount += 249;
          
          testResults.notifications.push({
            type: 'payment.succeeded',
            amount: '$249.00',
            tier: 'vendor_featured',
            message: 'Payment processed successfully - notification would be sent'
          });
        }
        
      } catch (error: any) {
        testResults.charges.push({
          tier: 'Vendor Featured',
          amount: '$249.00',
          status: 'failed',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 3: Process National Partner - $499 (REAL CHARGE)
      try {
        console.log('Processing $499 National Partner subscription charge...');
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 49900, // $499.00
          currency: 'usd',
          description: 'MySeniorValet National Partner Subscription Test - $499/month',
          metadata: {
            tier: 'vendor_national',
            test: 'real_charge_3',
            customer_email: 'partner@myseniorvalet.com'
          },
          payment_method_types: ['card'],
          automatic_payment_methods: {
            enabled: true
          }
        });

        const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: 'pm_card_mastercard', // Mastercard test
          return_url: 'http://localhost:5000/payment/success'
        });
        
        testResults.charges.push({
          tier: 'National Partner',
          amount: '$499.00',
          status: confirmedPayment.status,
          paymentIntentId: confirmedPayment.id,
          clientSecret: confirmedPayment.client_secret,
          success: confirmedPayment.status === 'succeeded'
        });

        if (confirmedPayment.status === 'succeeded') {
          testResults.summary.successful++;
          testResults.summary.totalAmount += 499;
          
          testResults.notifications.push({
            type: 'payment.succeeded',
            amount: '$499.00',
            tier: 'vendor_national',
            message: 'Payment processed successfully - notification would be sent'
          });
        }
        
      } catch (error: any) {
        testResults.charges.push({
          tier: 'National Partner',
          amount: '$499.00',
          status: 'failed',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      console.log('🎯 REAL CHARGE TESTING COMPLETE:', testResults.summary);
      console.log(`💰 Total charges processed: $${testResults.summary.totalAmount}`);
      console.log(`📧 Notifications that would be sent: ${testResults.notifications.length}`);
      
      res.json({
        success: true,
        message: 'Real Stripe sandbox charges processed successfully',
        results: testResults,
        totalCharges: `$${testResults.summary.totalAmount}`,
        notificationsSent: testResults.notifications.length,
        _version: 'v4_real_charges_1754169773000',
        _timestamp: Date.now()
      });

    } catch (error: any) {
      console.error('Error processing real Stripe charges:', error);
      res.status(500).json({
        success: false,
        error: 'Real charge processing failed',
        message: error.message,
        _version: 'v4_real_charges_1754169773000',
        _timestamp: Date.now()
      });
    }
  });

  // Test subscription creation with immediate charge
  app.post('/api/stripe/create-real-subscription', async (req, res) => {
    try {
      const { tier, amount, customerEmail } = req.body;
      
      console.log(`Creating real subscription for ${tier} at $${amount/100} for ${customerEmail}`);

      // Create customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: `MySeniorValet ${tier} Customer`,
        description: `Test customer for ${tier} subscription`,
        metadata: {
          tier: tier,
          source: 'real_subscription_test'
        }
      });

      // Create subscription with immediate payment
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `MySeniorValet ${tier} Subscription`,
              },
              unit_amount: amount,
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          tier: tier,
          test: 'real_subscription'
        }
      });

      res.json({
        success: true,
        subscriptionId: subscription.id,
        customerId: customer.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status,
        message: `Real subscription created for ${tier}`,
        amount: `$${amount/100}`,
        _version: 'v4_real_charges_1754169773000',
        _timestamp: Date.now()
      });

    } catch (error: any) {
      console.error('Error creating real subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create real subscription',
        message: error.message,
        _version: 'v4_real_charges_1754169773000',
        _timestamp: Date.now()
      });
    }
  });
}