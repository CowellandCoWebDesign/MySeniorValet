import express, { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Store raw body for Stripe signature verification
router.use('/webhook', express.raw({ type: 'application/json' }));

// Proxy webhook from Stripe's configured URL to our handler
router.post('/webhook', async (req: Request, res: Response) => {
  console.log('🔀 Proxying webhook from /api/payments/webhook to /api/webhooks/webhook');
  
  try {
    // Get the raw body for signature verification
    const rawBody = req.body;
    const signature = req.headers['stripe-signature'];
    
    // Forward to our actual webhook handler
    const webhookUrl = 'http://localhost:5000/api/webhooks/webhook';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature as string || '',
        'X-Forwarded-For': req.ip || 'unknown',
        'User-Agent': req.headers['user-agent'] || 'stripe-webhook'
      },
      body: rawBody
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Webhook handler returned ${response.status}`);
      return res.status(response.status).json(responseData);
    }
    
    console.log('✅ Webhook successfully proxied and processed');
    res.status(200).json(responseData);
    
  } catch (error: any) {
    console.error('❌ Webhook proxy error:', error.message);
    res.status(500).json({ error: 'Webhook proxy failed', details: error.message });
  }
});

export default router;