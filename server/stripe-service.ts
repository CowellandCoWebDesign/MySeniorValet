import Stripe from 'stripe';
import { db } from './db';
import { stripeProducts, communitySubscriptions, communities } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { subscriptionTiers, addOnProducts } from '@shared/schema';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

export class StripeService {
  async initializeProducts() {
    try {
      console.log('Initializing Stripe products...');
      
      // Create core subscription tiers
      for (const [tierKey, tierInfo] of Object.entries(subscriptionTiers)) {
        if (tierKey === 'free') continue; // Skip free tier
        
        await this.createOrUpdateProduct({
          name: tierInfo.name,
          description: `MySeniorValet ${tierInfo.name} plan with ${tierInfo.features.length} features`,
          tierLevel: tierKey as any,
          price: tierInfo.price * 100, // Convert to cents
          billingType: 'monthly',
          features: tierInfo.features,
          isAddOn: false,
        });
      }
      
      // Create add-on products
      for (const [addOnKey, addOnInfo] of Object.entries(addOnProducts)) {
        await this.createOrUpdateProduct({
          name: addOnInfo.name,
          description: `${addOnInfo.name} - ${addOnInfo.features.join(', ')}`,
          tierLevel: null,
          price: addOnInfo.price * 100, // Convert to cents
          billingType: (addOnInfo as any).recurring === 'monthly' ? 'monthly' : 'one_time',
          features: addOnInfo.features,
          isAddOn: true,
          addOnType: addOnInfo.type as any,
        });
      }
      
      console.log('Stripe products initialization complete');
    } catch (error) {
      console.error('Error initializing Stripe products:', error);
      throw error;
    }
  }

  async createOrUpdateProduct(productData: {
    name: string;
    description: string;
    tierLevel: 'standard' | 'featured' | 'platinum' | null;
    price: number;
    billingType: 'monthly' | 'yearly' | 'one_time';
    features: string[];
    isAddOn: boolean;
    addOnType?: 'onboarding' | 'media' | 'exposure_boost' | 'visibility_ai';
  }) {
    try {
      // Check if product already exists
      const existingProduct = await db
        .select()
        .from(stripeProducts)
        .where(eq(stripeProducts.name, productData.name))
        .limit(1);

      if (existingProduct.length > 0) {
        console.log(`Product ${productData.name} already exists, skipping...`);
        return existingProduct[0];
      }

      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          tier_level: productData.tierLevel || '',
          is_add_on: productData.isAddOn.toString(),
          add_on_type: productData.addOnType || '',
          features: JSON.stringify(productData.features),
        },
      });

      // Create Stripe price
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: productData.price,
        currency: 'usd',
        recurring: productData.billingType === 'one_time' ? undefined : {
          interval: productData.billingType === 'monthly' ? 'month' : 'year',
        },
        metadata: {
          billing_type: productData.billingType,
        },
      });

      // Save to our database
      const [dbProduct] = await db
        .insert(stripeProducts)
        .values({
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          name: productData.name,
          description: productData.description,
          tierLevel: productData.tierLevel,
          billingType: productData.billingType,
          price: productData.price,
          currency: 'usd',
          isActive: true,
          isAddOn: productData.isAddOn,
          addOnType: productData.addOnType,
          features: productData.features,
          metadata: {
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          },
        })
        .returning();

      console.log(`Created product: ${productData.name} (${stripeProduct.id})`);
      return dbProduct;
    } catch (error) {
      console.error(`Error creating product ${productData.name}:`, error);
      throw error;
    }
  }

  async createCheckoutSession(communityId: number, priceId: string, successUrl: string, cancelUrl: string) {
    try {
      // Get community info
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        throw new Error('Community not found');
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: community.communityManagerEmail || undefined,
        metadata: {
          communityId: communityId.toString(),
          priceId: priceId,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  async handleWebhook(eventType: string, data: any) {
    try {
      switch (eventType) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(data);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(data);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(data);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(data);
          break;
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }
    } catch (error) {
      console.error(`Error handling webhook ${eventType}:`, error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const communityId = parseInt(session.metadata?.communityId || '0');
    const priceId = session.metadata?.priceId;

    if (!communityId || !priceId) {
      console.error('Missing metadata in checkout session:', session.metadata);
      return;
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Get product info
    const [product] = await db
      .select()
      .from(stripeProducts)
      .where(eq(stripeProducts.stripePriceId, priceId))
      .limit(1);

    if (!product) {
      console.error('Product not found for price:', priceId);
      return;
    }

    // Create or update community subscription
    await db
      .insert(communitySubscriptions)
      .values({
        communityId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        productId: product.id,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      })
      .onConflictDoUpdate({
        target: communitySubscriptions.communityId,
        set: {
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          productId: product.id,
          status: subscription.status as any,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
      });

    // Update community subscription tier
    await db
      .update(communities)
      .set({
        subscriptionTier: product.tierLevel || 'free',
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        billingStatus: subscription.status as any,
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
        features: product.features,
      })
      .where(eq(communities.id, communityId));

    console.log(`Updated community ${communityId} subscription to ${product.tierLevel}`);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    // Update subscription status and period
    const subscriptionId = invoice.subscription as string;
    
    await db
      .update(communitySubscriptions)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(communitySubscriptions.stripeSubscriptionId, subscriptionId));

    // Update community billing status
    await db
      .update(communities)
      .set({
        billingStatus: 'active',
      })
      .where(eq(communities.stripeSubscriptionId, subscriptionId));

    console.log(`Invoice paid for subscription: ${subscriptionId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Update subscription details
    await db
      .update(communitySubscriptions)
      .set({
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(communitySubscriptions.stripeSubscriptionId, subscription.id));

    // Update community status
    await db
      .update(communities)
      .set({
        billingStatus: subscription.status as any,
        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      })
      .where(eq(communities.stripeSubscriptionId, subscription.id));

    console.log(`Updated subscription: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Update subscription status
    await db
      .update(communitySubscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(communitySubscriptions.stripeSubscriptionId, subscription.id));

    // Downgrade community to free tier
    await db
      .update(communities)
      .set({
        subscriptionTier: 'free',
        billingStatus: 'canceled',
        features: subscriptionTiers.free.features,
      })
      .where(eq(communities.stripeSubscriptionId, subscription.id));

    console.log(`Canceled subscription: ${subscription.id}`);
  }

  async hasFeature(communityId: number, featureName: string): Promise<boolean> {
    const [community] = await db
      .select({
        subscriptionTier: communities.subscriptionTier,
        features: communities.features,
        activeAddOns: communities.activeAddOns,
        billingStatus: communities.billingStatus,
      })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    if (!community) return false;

    // Check if billing is active (unless free tier)
    if (community.subscriptionTier !== 'free' && community.billingStatus !== 'active') {
      return false;
    }

    // Check tier features
    const tierFeatures = community.features || [];
    if (tierFeatures.includes(featureName)) {
      return true;
    }

    // Check add-on features
    const addOns = community.activeAddOns || [];
    for (const addOn of addOns) {
      if (addOn.status === 'active') {
        const addOnProduct = Object.values(addOnProducts).find(p => p.name === addOn.name);
        if (addOnProduct?.features.includes(featureName)) {
          return true;
        }
      }
    }

    return false;
  }

  async getCommunitySubscription(communityId: number) {
    const [subscription] = await db
      .select()
      .from(communitySubscriptions)
      .leftJoin(stripeProducts, eq(communitySubscriptions.productId, stripeProducts.id))
      .where(eq(communitySubscriptions.communityId, communityId))
      .limit(1);

    return subscription;
  }

  async getActiveProducts() {
    return await db
      .select()
      .from(stripeProducts)
      .where(eq(stripeProducts.isActive, true));
  }
}

export const stripeService = new StripeService();