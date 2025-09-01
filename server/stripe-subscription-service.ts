// MySeniorValet - Stripe Subscription Management Service
import Stripe from 'stripe';
import { db } from './db';
import { subscriptions, communities, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    })
  : null;

export interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  interval: 'month' | 'year' | null;
  type: 'product' | 'add-on';
  features: string[];
}

// MySeniorValet subscription products (synced with Stripe)
export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: 'community-starter',
    name: 'Community Starter',
    description: 'Basic listing with verified badge and lead generation.',
    price: 9900, // $99.00/month
    interval: 'month',
    type: 'product',
    features: [
      'Basic listing with verified badge',
      '5 photos + description',
      '10 leads/month',
      'Basic analytics',
      'Standard search ranking'
    ]
  },
  {
    id: 'community-growth',
    name: 'Community Growth',
    description: '3D tour embed, unit reservations, and enhanced visibility.',
    price: 29900, // $299.00/month
    interval: 'month',
    type: 'product',
    features: [
      '3D tour embed capability',
      '25 photos',
      '50 leads/month',
      'Unit reservation system',
      'Enhanced search (3x visibility)',
      'CRM integration'
    ]
  },
  {
    id: 'community-professional',
    name: 'Community Professional',
    description: 'AI lease management and advanced features.',
    price: 99900, // $999.00/month
    interval: 'month',
    type: 'product',
    features: [
      'AI lease management system',
      'Multiple 3D tour embeds',
      'Unlimited leads',
      'Featured search (5x visibility)',
      'Insurance tracking',
      'Advanced reservation management'
    ]
  },
  {
    id: 'community-premium',
    name: 'Community Premium',
    description: 'Payment processing and multi-property management.',
    price: 199900, // $1,999.00/month
    interval: 'month',
    type: 'product',
    features: [
      'Payment processing (2.9% + $0.30)',
      'Move-in cost calculator',
      'Accept deposits & rent',
      'Unlimited 3D embeds',
      'Platinum search (10x visibility)',
      'Multi-property dashboard'
    ]
  },
  {
    id: 'community-enterprise',
    name: 'Community Enterprise',
    description: 'White-label platform with API access and dedicated support.',
    price: 399900, // $3,999.00/month
    interval: 'month',
    type: 'product',
    features: [
      'Everything in Premium',
      'White-label platform',
      'API access (100k calls/month)',
      'Custom integrations',
      'Dedicated success manager',
      'Quarterly business reviews'
    ]
  }
];

// Vendor Marketplace Products
export const VENDOR_PRODUCTS: SubscriptionProduct[] = [
  {
    id: 'basic-vendor',
    name: 'Basic Listing',
    description: 'Public listing in vendor directory, limited to 1 zip cluster, optional $25 verified badge.',
    price: 9900, // $99.00/month
    interval: 'month',
    type: 'product',
    features: [
      'Public listing in vendor directory',
      'Region-limited to 1 zip cluster',
      'Name, phone, category, description',
      'Optional $25 verified badge',
      'User reviews allowed',
      'Affiliate link support'
    ]
  },
  {
    id: 'featured-vendor',
    name: 'Featured Vendor',
    description: 'Coverage across 5 regions, logo upload, analytics, featured placement in vendor carousels.',
    price: 24900, // $249.00/month
    interval: 'month',
    type: 'product',
    features: [
      'All Basic Listing features',
      'Coverage across 5 regions',
      'Upload logo, brand colors, CTA button',
      'Basic analytics (views, clicks, leads)',
      'Post vendor promos',
      'Featured placement in vendor carousels',
      'Must have affiliate link for "Approved" badge'
    ]
  },
  {
    id: 'national-partner',
    name: 'National Partner (Premium)',
    description: 'Nationwide visibility, banner rotation, concierge priority, AI-generated lead summaries.',
    price: 49900, // $499.00/month
    interval: 'month',
    type: 'product',
    features: [
      'All Featured Vendor features',
      'Nationwide visibility (no geo cap)',
      'Banner rotation in major discovery areas',
      'Concierge system priority & routing',
      'AI-generated lead summaries + scoring',
      'Optional API or CSV lead passback',
      'Dedicated vendor microsite',
      'Quarterly performance report',
      'Optional vendor success call'
    ]
  }
];

export const ADD_ON_PRODUCTS: SubscriptionProduct[] = [
  {
    id: 'additional-location',
    name: 'Add Additional Location',
    description: 'Add dashboard/edit access for an additional community.',
    price: 4900, // $49.00/month
    interval: 'month',
    type: 'add-on',
    features: [
      'Additional community access',
      'Separate dashboard',
      'Independent management'
    ]
  },
  {
    id: 'family-messaging',
    name: 'Family Messaging Module',
    description: 'Enables secure in-platform messaging with families.',
    price: 2900, // $29.00/month
    interval: 'month',
    type: 'add-on',
    features: [
      'Secure messaging',
      'Family communication tools',
      'Message history',
      'Notification system'
    ]
  },
  {
    id: 'ai-tour-assistant',
    name: 'AI Virtual Tour Assistant (Beta)',
    description: 'AI-guided multimedia tour assistant (Coming Soon).',
    price: 5900, // $59.00/month
    interval: 'month',
    type: 'add-on',
    features: [
      'AI-guided tours',
      'Multimedia integration',
      'Interactive experiences',
      'Beta access'
    ]
  },
  {
    id: 'bill-pay-tools',
    name: 'Resident Bill Pay Tools (Coming Soon)',
    description: 'Billing and payment portal for residents (Coming Soon).',
    price: 7900, // $79.00/month
    interval: 'month',
    type: 'add-on',
    features: [
      'Billing portal',
      'Payment processing',
      'Resident accounts',
      'Financial reporting'
    ]
  }
];

export class StripeSubscriptionService {
  
  async createCheckoutSession(
    communityId: number | null,
    productId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, any>
  ) {
    if (!stripe) {
      throw new Error('Stripe is not initialized. Please check STRIPE_SECRET_KEY environment variable.');
    }
    
    const product = [...SUBSCRIPTION_PRODUCTS, ...ADD_ON_PRODUCTS, ...VENDOR_PRODUCTS].find(p => p.id === productId);
    
    if (!product || product.price === 0) {
      throw new Error('Invalid product or free product');
    }

    // In development mode, create price on the fly
    let priceId: string;
    
    try {
      // Try to find existing product and price
      const stripeProducts = await stripe.products.list({
        limit: 100
      });

      const stripeProduct = stripeProducts.data.find(p => 
        p.metadata?.productId === productId && p.metadata?.platform === 'myseniorvalet'
      );

      if (stripeProduct) {
        const prices = await stripe.prices.list({
          product: stripeProduct.id
        });
        const price = prices.data[0];
        if (price) {
          priceId = price.id;
        } else {
          // Create price for existing product
          const newPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: product.price,
            currency: 'usd',
            recurring: product.interval ? { interval: product.interval } : undefined
          });
          priceId = newPrice.id;
        }
      } else {
        // Create new product and price
        const newProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
          metadata: {
            productId: productId,
            platform: 'myseniorvalet'
          }
        });

        const newPrice = await stripe.prices.create({
          product: newProduct.id,
          unit_amount: product.price,
          currency: 'usd',
          recurring: product.interval ? { interval: product.interval } : undefined
        });
        priceId = newPrice.id;
      }
    } catch (error) {
      console.error('Error creating/finding Stripe product:', error);
      throw new Error('Failed to create checkout session');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...(communityId ? { communityId: communityId.toString() } : {}),
        productId: productId,
        platform: 'myseniorvalet',
        ...(metadata || {})
      }
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handleSubscriptionCreated(session: Stripe.Checkout.Session) {
    const communityId = parseInt(session.metadata?.communityId || '0');
    const productId = session.metadata?.productId;

    if (communityId && productId) {
      await db.insert(subscriptions).values({
        communityId,
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        productId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Cast invoice to any to access subscription property
    const invoiceData = invoice as any;
    const subscriptionId = typeof invoiceData.subscription === 'string' 
      ? invoiceData.subscription 
      : invoiceData.subscription?.id;
      
    if (subscriptionId) {
      await db.update(subscriptions)
        .set({
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
    }
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    await db.update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date()
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  }

  async getCommunitySubscription(communityId: number) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.communityId, communityId),
        eq(subscriptions.status, 'active')
      ));

    return subscription;
  }

  async getAllProducts() {
    return {
      products: SUBSCRIPTION_PRODUCTS,
      addOns: ADD_ON_PRODUCTS
    };
  }

  formatPrice(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }
}

export const stripeSubscriptionService = new StripeSubscriptionService();