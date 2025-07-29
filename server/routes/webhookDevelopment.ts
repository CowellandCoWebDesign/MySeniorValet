import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Development webhook endpoint information
router.get('/info', (req: Request, res: Response) => {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? `http://localhost:5000` 
    : `https://${req.get('host')}`;
    
  res.json({
    webhook_url: `${baseUrl}/api/webhooks/webhook`,
    test_url: `${baseUrl}/api/webhooks/test-webhook`,
    environment: process.env.NODE_ENV,
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    events_to_listen_for: [
      'checkout.session.completed',
      'invoice.paid',
      'invoice.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted'
    ],
    instructions: {
      development: "Use the webhook_url above in your Stripe Dashboard webhook settings",
      production: "Update webhook URL when deploying to production domain"
    }
  });
});

// Test webhook endpoint - simulates Stripe events for development
router.post('/simulate/:event_type', (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Simulation only available in development' });
  }

  const eventType = req.params.event_type;
  const testEvents: Record<string, any> = {
    'checkout.session.completed': {
      id: 'evt_test_checkout_' + Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          subscription: 'sub_test_' + Date.now(),
          customer: 'cus_test_' + Date.now(),
          metadata: {
            community_id: '1',
            product_id: 'featured-spotlight'
          }
        }
      }
    },
    'invoice.paid': {
      id: 'evt_test_paid_' + Date.now(),
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_test_' + Date.now(),
          subscription: 'sub_test_' + Date.now(),
          customer: 'cus_test_' + Date.now(),
          amount_paid: 14900, // $149.00 in cents
          status: 'paid'
        }
      }
    },
    'customer.subscription.deleted': {
      id: 'evt_test_cancelled_' + Date.now(),
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_test_' + Date.now(),
          customer: 'cus_test_' + Date.now(),
          status: 'canceled',
          canceled_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  };

  const testEvent = testEvents[eventType];
  if (!testEvent) {
    return res.status(400).json({ 
      error: 'Unknown event type',
      available_events: Object.keys(testEvents)
    });
  }

  console.log(`🧪 Simulating webhook event: ${eventType}`);
  
  // Forward to webhook handler
  req.body = testEvent;
  req.url = '/webhook';
  req.method = 'POST';
  
  res.json({
    message: `Simulated ${eventType} event`,
    event: testEvent,
    note: "Check server logs for processing results"
  });
});

export default router;