// MySeniorValet - Stripe Subscription Management Service
import Stripe from 'stripe';
import { db } from './db';
import { subscriptions, communities, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil'
});

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
    id: 'basic-listing',
    name: 'Basic Listing',
    description: 'Verified listing with basic visibility and search access. No tools.',
    price: 0,
    interval: null,
    type: 'product',
    features: [
      'Basic listing visibility',
      'Search access',
      'Verified status',
      'Contact information display'
    ]
  },
  {
    id: 'featured-spotlight',
    name: 'Featured Spotlight',
    description: 'Profile editing, featured placement, Red Tag specials, photo/form tools.',
    price: 14900, // $149.00/month
    interval: 'month',
    type: 'product',
    features: [
      'Profile editing tools',
      'Featured placement',
      'Red Tag specials',
      'Photo upload tools',
      'Custom forms',
      'Enhanced visibility'
    ]
  },
  {
    id: 'premium-tools',
    name: 'Premium Tools + Exposure',
    description: 'Branded intake, availability tools, tour scheduler, reservability (Coming Soon).',
    price: 24900, // $249.00/month
    interval: 'month',
    type: 'product',
    features: [
      'All Featured Spotlight features',
      'Branded intake forms',
      'Availability management',
      'Tour scheduler',
      'Reservability system (Coming Soon)',
      'Premium support'
    ]
  },
  {
    id: 'platinum-partner',
    name: 'Platinum Marketing Partner',
    description: 'Full suite + homepage, concierge, sponsored content, AI access.',
    price: 39900, // $399.00/month
    interval: 'month',
    type: 'product',
    features: [
      'All Premium Tools features',
      'Homepage placement',
      'Concierge service access',
      'Sponsored content',
      'AI-powered features',
      'Priority support',
      'Custom branding'
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
    communityId: number,
    productId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const product = [...SUBSCRIPTION_PRODUCTS, ...ADD_ON_PRODUCTS].find(p => p.id === productId);
    
    if (!product || product.price === 0) {
      throw new Error('Invalid product or free product');
    }

    // Get Stripe price ID from metadata or create on demand
    const stripeProducts = await stripe.products.list({
      limit: 100
    });

    const stripeProduct = stripeProducts.data.find(p => 
      p.name === product.name && p.metadata?.platform === 'myseniorvalet'
    );

    if (!stripeProduct) {
      throw new Error('Stripe product not found');
    }

    const prices = await stripe.prices.list({
      product: stripeProduct.id
    });

    const price = prices.data[0];

    if (!price) {
      throw new Error('Stripe price not found');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        communityId: communityId.toString(),
        productId: productId,
        platform: 'myseniorvalet'
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
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
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

export const stripeService = new StripeSubscriptionService();