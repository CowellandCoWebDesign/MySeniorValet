// MySeniorValet - Subscription Management Routes
import { Router } from 'express';
import { stripeService } from '../stripe-subscription-service';
import Stripe from 'stripe';

const router = Router();

// Get all available subscription products
router.get('/products', async (req, res) => {
  try {
    const products = await stripeService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get community subscription status
router.get('/community/:communityId', async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const subscription = await stripeService.getCommunitySubscription(communityId);
    
    res.json({
      subscription,
      hasActiveSubscription: !!subscription
    });
  } catch (error) {
    console.error('Error fetching community subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create checkout session for subscription
router.post('/checkout', async (req, res) => {
  try {
    const { communityId, productId } = req.body;
    
    if (!communityId || !productId) {
      return res.status(400).json({ error: 'Community ID and product ID are required' });
    }

    const successUrl = `${req.protocol}://${req.get('host')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.protocol}://${req.get('host')}/subscription/cancel`;

    const session = await stripeService.createCheckoutSession(
      communityId,
      productId,
      successUrl,
      cancelUrl
    );

    res.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook handler
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil'
    });

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await stripeService.handleWebhook(event);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
});

// Get subscription pricing formatted for display
router.get('/pricing/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const products = await stripeService.getAllProducts();
    
    const product = [...products.products, ...products.addOns].find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product,
      formattedPrice: stripeService.formatPrice(product.price),
      isRecurring: !!product.interval
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

export default router;