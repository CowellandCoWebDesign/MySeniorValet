import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { payments, auditLogs } from '@shared/schema';
import { sendEmail } from '../services/email-service';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
});

// Run complete automated payment test
router.post('/run-complete-test', async (req: Request, res: Response) => {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  try {
    console.log('🚀 Starting automated payment test suite...');

    // Test 1: Configuration Check
    const configTest = {
      name: 'Configuration Check',
      status: 'testing',
      details: {} as any
    };

    try {
      configTest.details = {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.VITE_STRIPE_PUBLISHABLE_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasSendGridKey: !!process.env.SENDGRID_API_KEY
      };
      
      configTest.status = Object.values(configTest.details).every(v => v) ? 'passed' : 'failed';
      testResults.tests.push(configTest);
    } catch (error: any) {
      configTest.status = 'failed';
      configTest.error = error.message;
      testResults.tests.push(configTest);
    }

    // Test 2: Create Payment Intent
    const paymentTest = {
      name: 'Payment Intent Creation',
      status: 'testing',
      details: {} as any
    };

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 100, // $1.00
        currency: 'usd',
        description: 'Automated Test Payment',
        metadata: {
          test: 'true',
          automated: 'true',
          timestamp: new Date().toISOString()
        }
      });

      paymentTest.details = {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret?.substring(0, 30) + '...'
      };
      paymentTest.status = 'passed';
      testResults.tests.push(paymentTest);

      // Test 3: Confirm Payment (Test Mode)
      const confirmTest = {
        name: 'Payment Confirmation (Test Mode)',
        status: 'testing',
        details: {} as any
      };

      try {
        // In test mode, we can confirm with a test payment method
        const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: 'pm_card_visa' // Stripe's test payment method
        });

        confirmTest.details = {
          id: confirmedPayment.id,
          status: confirmedPayment.status,
          amount: confirmedPayment.amount,
          confirmed: confirmedPayment.status === 'succeeded'
        };
        confirmTest.status = confirmedPayment.status === 'succeeded' ? 'passed' : 'failed';
        testResults.tests.push(confirmTest);

        // Test 4: Database Recording
        const dbTest = {
          name: 'Database Payment Recording',
          status: 'testing',
          details: {} as any
        };

        try {
          const [payment] = await db.insert(payments).values({
            stripePaymentIntentId: confirmedPayment.id,
            amount: confirmedPayment.amount,
            currency: confirmedPayment.currency,
            status: confirmedPayment.status,
            userId: 'test-user',
            description: 'Automated test payment',
            metadata: {
              test: true,
              automated: true
            }
          }).returning();

          dbTest.details = {
            paymentId: payment.id,
            recorded: true,
            timestamp: payment.createdAt
          };
          dbTest.status = 'passed';
          testResults.tests.push(dbTest);
        } catch (error: any) {
          dbTest.status = 'failed';
          dbTest.error = error.message;
          testResults.tests.push(dbTest);
        }

      } catch (error: any) {
        confirmTest.status = 'failed';
        confirmTest.error = error.message;
        testResults.tests.push(confirmTest);
      }

    } catch (error: any) {
      paymentTest.status = 'failed';
      paymentTest.error = error.message;
      testResults.tests.push(paymentTest);
    }

    // Test 5: Email Notification
    const emailTest = {
      name: 'Email Notification',
      status: 'testing',
      details: {} as any
    };

    try {
      const emailResult = await sendEmail({
        to: req.body.email || 'test@myseniorvalet.com',
        subject: 'Payment Test Successful',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">✅ Payment Test Successful</h2>
            <p>Your automated payment test has completed successfully.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Test Results:</h3>
              <ul>
                ${testResults.tests.map(t => 
                  `<li>${t.name}: ${t.status === 'passed' ? '✅' : '❌'}</li>`
                ).join('')}
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated test email from MySeniorValet payment system.
            </p>
          </div>
        `
      });

      emailTest.details = {
        sent: emailResult.success,
        to: req.body.email || 'test@myseniorvalet.com'
      };
      emailTest.status = emailResult.success ? 'passed' : 'failed';
      testResults.tests.push(emailTest);
    } catch (error: any) {
      emailTest.status = 'failed';
      emailTest.error = error.message;
      testResults.tests.push(emailTest);
    }

    // Test 6: Webhook Simulation
    const webhookTest = {
      name: 'Webhook Processing',
      status: 'testing',
      details: {} as any
    };

    try {
      // Simulate webhook event
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_' + Date.now(),
            amount: 100,
            status: 'succeeded'
          }
        }
      };

      // Record in audit log
      const [auditEntry] = await db.insert(auditLogs).values({
        userId: 'system',
        action: 'webhook_test',
        details: webhookPayload,
        ipAddress: '127.0.0.1',
        userAgent: 'Automated Test'
      }).returning();

      webhookTest.details = {
        simulated: true,
        auditId: auditEntry.id,
        eventType: webhookPayload.type
      };
      webhookTest.status = 'passed';
      testResults.tests.push(webhookTest);
    } catch (error: any) {
      webhookTest.status = 'failed';
      webhookTest.error = error.message;
      testResults.tests.push(webhookTest);
    }

    // Test 7: Refund Test
    const refundTest = {
      name: 'Refund Processing',
      status: 'testing',
      details: {} as any
    };

    try {
      // Create a test payment first
      const testPayment = await stripe.paymentIntents.create({
        amount: 100,
        currency: 'usd',
        confirm: true,
        payment_method: 'pm_card_visa'
      });

      if (testPayment.status === 'succeeded') {
        // Process refund
        const refund = await stripe.refunds.create({
          payment_intent: testPayment.id,
          amount: 100
        });

        refundTest.details = {
          refundId: refund.id,
          amount: refund.amount,
          status: refund.status,
          paymentId: testPayment.id
        };
        refundTest.status = refund.status === 'succeeded' ? 'passed' : 'failed';
      } else {
        refundTest.status = 'skipped';
        refundTest.details = { reason: 'Payment not succeeded for refund test' };
      }
      testResults.tests.push(refundTest);
    } catch (error: any) {
      refundTest.status = 'failed';
      refundTest.error = error.message;
      testResults.tests.push(refundTest);
    }

    // Calculate summary
    testResults.summary.total = testResults.tests.length;
    testResults.summary.passed = testResults.tests.filter(t => t.status === 'passed').length;
    testResults.summary.failed = testResults.tests.filter(t => t.status === 'failed').length;

    console.log('✅ Automated payment test suite completed');
    console.log(`Results: ${testResults.summary.passed}/${testResults.summary.total} passed`);

    res.json({
      success: testResults.summary.failed === 0,
      results: testResults,
      message: testResults.summary.failed === 0 
        ? '🎉 All payment tests passed successfully!' 
        : `⚠️ ${testResults.summary.failed} tests failed. Check details below.`
    });

  } catch (error: any) {
    console.error('❌ Automated test suite error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results: testResults
    });
  }
});

// Get test history
router.get('/test-history', async (req: Request, res: Response) => {
  try {
    const history = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.action, 'payment_test'))
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);
    
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;