import { type Express } from "express";
import Stripe from "stripe";

export function registerStripeTestRoutes(app: Express) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });

  // Test endpoint for Stripe sandbox charges
  app.post('/api/stripe/test-sandbox-charges', async (req, res) => {
    try {
      console.log('🧪 STRIPE SANDBOX TESTING - Starting comprehensive payment tests');
      
      const testResults = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0
        }
      };

      // Test 1: Vendor Basic Subscription - $99
      try {
        const basicCharge = await stripe.paymentIntents.create({
          amount: 9900, // $99.00
          currency: 'usd',
          description: 'MySeniorValet Vendor Basic Subscription - $99/month',
          metadata: {
            tier: 'vendor_basic',
            test: 'sandbox_charge_1'
          },
          payment_method_types: ['card']
        });
        
        testResults.tests.push({
          name: 'Vendor Basic ($99)',
          status: 'PASSED',
          amount: '$99.00',
          paymentIntentId: basicCharge.id,
          details: 'Payment intent created successfully'
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: 'Vendor Basic ($99)',
          status: 'FAILED',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 2: Vendor Featured Subscription - $249
      try {
        const featuredCharge = await stripe.paymentIntents.create({
          amount: 24900, // $249.00
          currency: 'usd',
          description: 'MySeniorValet Vendor Featured Subscription - $249/month',
          metadata: {
            tier: 'vendor_featured',
            test: 'sandbox_charge_2'
          },
          payment_method_types: ['card']
        });
        
        testResults.tests.push({
          name: 'Vendor Featured ($249)',
          status: 'PASSED',
          amount: '$249.00',
          paymentIntentId: featuredCharge.id,
          details: 'Payment intent created successfully'
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: 'Vendor Featured ($249)',
          status: 'FAILED',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 3: Vendor National Partner - $499
      try {
        const nationalCharge = await stripe.paymentIntents.create({
          amount: 49900, // $499.00
          currency: 'usd',
          description: 'MySeniorValet Vendor National Partner - $499/month',
          metadata: {
            tier: 'vendor_national',
            test: 'sandbox_charge_3'
          },
          payment_method_types: ['card']
        });
        
        testResults.tests.push({
          name: 'Vendor National Partner ($499)',
          status: 'PASSED',
          amount: '$499.00',
          paymentIntentId: nationalCharge.id,
          details: 'Payment intent created successfully'
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: 'Vendor National Partner ($499)',
          status: 'FAILED',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 4: Community Standard - $149
      try {
        const standardCharge = await stripe.paymentIntents.create({
          amount: 14900, // $149.00
          currency: 'usd',
          description: 'MySeniorValet Community Standard Subscription - $149/month',
          metadata: {
            tier: 'community_standard',
            test: 'sandbox_charge_4'
          },
          payment_method_types: ['card']
        });
        
        testResults.tests.push({
          name: 'Community Standard ($149)',
          status: 'PASSED',
          amount: '$149.00',
          paymentIntentId: standardCharge.id,
          details: 'Payment intent created successfully'
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: 'Community Standard ($149)',
          status: 'FAILED',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 5: Community Platinum - $349
      try {
        const platinumCharge = await stripe.paymentIntents.create({
          amount: 34900, // $349.00
          currency: 'usd',
          description: 'MySeniorValet Community Platinum Subscription - $349/month',
          metadata: {
            tier: 'community_platinum',
            test: 'sandbox_charge_5'
          },
          payment_method_types: ['card']
        });
        
        testResults.tests.push({
          name: 'Community Platinum ($349)',
          status: 'PASSED',
          amount: '$349.00',
          paymentIntentId: platinumCharge.id,
          details: 'Payment intent created successfully'
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: 'Community Platinum ($349)',
          status: 'FAILED',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      // Test 6: Test Customer Creation
      try {
        const testCustomer = await stripe.customers.create({
          email: 'test@myseniorvalet.com',
          name: 'MySeniorValet Test Customer',
          description: 'Sandbox test customer for payment processing verification',
          metadata: {
            source: 'sandbox_testing',
            platform: 'myseniorvalet'
          }
        });
        
        testResults.tests.push({
          name: 'Customer Creation',
          status: 'PASSED',
          customerId: testCustomer.id,
          details: 'Test customer created successfully'
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: 'Customer Creation',
          status: 'FAILED',
          error: error.message
        });
        testResults.summary.failed++;
      }
      testResults.summary.total++;

      console.log('🎯 STRIPE SANDBOX TESTING COMPLETE:', testResults.summary);
      
      res.json({
        success: true,
        message: 'Stripe sandbox testing completed',
        results: testResults,
        _version: 'v4_streamlined_hero_1754169353000',
        _timestamp: Date.now()
      });

    } catch (error: any) {
      console.error('Error in Stripe sandbox testing:', error);
      res.status(500).json({
        success: false,
        error: 'Stripe sandbox testing failed',
        message: error.message,
        _version: 'v4_streamlined_hero_1754169353000',
        _timestamp: Date.now()
      });
    }
  });

  // Test checkout session creation
  app.post('/api/stripe/test-checkout-session', async (req, res) => {
    try {
      const { tier, amount } = req.body;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `MySeniorValet ${tier} Subscription`,
                description: `Monthly subscription for ${tier} tier`
              },
              unit_amount: amount,
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:5000/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:5000/payment/cancel',
        metadata: {
          tier: tier,
          test: 'sandbox_checkout'
        }
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        message: `Checkout session created for ${tier}`,
        _version: 'v4_streamlined_hero_1754169353000',
        _timestamp: Date.now()
      });

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create checkout session',
        message: error.message,
        _version: 'v4_streamlined_hero_1754169353000',
        _timestamp: Date.now()
      });
    }
  });
}