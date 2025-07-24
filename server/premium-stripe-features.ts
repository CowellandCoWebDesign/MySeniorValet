import { StripeService } from './stripe-service';
import { db } from './db';
import { users, communities, communitySubscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface PremiumFeatureAccess {
  userId: string;
  features: {
    familyCollaboration: boolean;
    priorityPlacement: boolean;
    conciergeService: boolean;
    advancedAnalytics: boolean;
    documentSigning: boolean;
    aiMatchingPro: boolean;
  };
  subscriptionTier: 'free' | 'standard' | 'featured' | 'platinum';
  expiresAt?: Date;
}

export class PremiumStripeFeatures {
  private stripeService = new StripeService();

  async createFamilyCollaborationSubscription(userId: string, planType: 'monthly' | 'yearly' = 'monthly'): Promise<{
    sessionUrl: string;
    subscriptionId: string;
  }> {
    try {
      // Family Collaboration Premium Features:
      // - Unlimited family member invites
      // - Real-time tour collaboration
      // - Family decision tracking
      // - Private family notes
      // - Advanced sharing controls
      
      const priceId = planType === 'yearly' ? 
        'price_family_collab_yearly' : 'price_family_collab_monthly';
      
      const session = await this.stripeService.createCheckoutSession({
        userId,
        priceId,
        successUrl: `${process.env.BASE_URL}/family-collaboration?success=true`,
        cancelUrl: `${process.env.BASE_URL}/family-collaboration?canceled=true`,
        metadata: {
          feature: 'family_collaboration',
          planType
        }
      });

      return {
        sessionUrl: session.url!,
        subscriptionId: session.subscription as string
      };

    } catch (error) {
      console.error('Family collaboration subscription error:', error);
      throw error;
    }
  }

  async createCommunityPriorityPlacement(communityId: number, placementTier: 'featured' | 'platinum', duration: number = 30): Promise<{
    paymentUrl: string;
    placementId: string;
  }> {
    try {
      // Priority Placement Features:
      // - Top search results positioning
      // - Featured community badges
      // - Enhanced listing display
      // - Priority customer support
      // - Advanced analytics dashboard

      const pricing = {
        featured: { daily: 15, monthly: 399, quarterly: 999 },
        platinum: { daily: 25, monthly: 699, quarterly: 1899 }
      };

      const amount = duration >= 90 ? pricing[placementTier].quarterly :
                   duration >= 30 ? pricing[placementTier].monthly :
                   pricing[placementTier].daily * duration;

      const session = await this.stripeService.createOneTimePayment({
        amount: amount * 100, // Convert to cents
        description: `${placementTier.charAt(0).toUpperCase() + placementTier.slice(1)} placement for ${duration} days`,
        successUrl: `${process.env.BASE_URL}/community-portal?placement=success`,
        cancelUrl: `${process.env.BASE_URL}/community-portal?placement=canceled`,
        metadata: {
          communityId: communityId.toString(),
          placementTier,
          duration: duration.toString()
        }
      });

      return {
        paymentUrl: session.url!,
        placementId: session.id
      };

    } catch (error) {
      console.error('Priority placement payment error:', error);
      throw error;
    }
  }

  async createConciergeServicePackage(userId: string, serviceLevel: 'basic' | 'premium' | 'white_glove'): Promise<{
    paymentUrl: string;
    serviceId: string;
  }> {
    try {
      // Concierge Service Packages:
      // Basic ($299): Personal consultation, 3 community recommendations, tour scheduling
      // Premium ($699): Everything in Basic + Move-in planning, family coordination, document assistance
      // White Glove ($1,299): Everything in Premium + Physical tour accompaniment, negotiation assistance, full-service coordination

      const servicePricing = {
        basic: 299,
        premium: 699,
        white_glove: 1299
      };

      const serviceFeatures = {
        basic: [
          'Personal senior living consultation',
          '3 curated community recommendations',
          'Professional tour scheduling',
          'Basic move-in timeline',
          'Email support'
        ],
        premium: [
          'Everything in Basic package',
          'Comprehensive move-in planning',
          'Family coordination meetings',
          'Document preparation assistance',
          'Phone support',
          'Follow-up care transition support'
        ],
        white_glove: [
          'Everything in Premium package',
          'Physical tour accompaniment',
          'Professional negotiation assistance',
          'Full-service move coordination',
          'Dedicated concierge manager',
          '24/7 priority support',
          'Post-move adjustment support'
        ]
      };

      const session = await this.stripeService.createOneTimePayment({
        amount: servicePricing[serviceLevel] * 100,
        description: `MySeniorValet ${serviceLevel.replace('_', ' ')} Concierge Service`,
        successUrl: `${process.env.BASE_URL}/concierge?service=success&level=${serviceLevel}`,
        cancelUrl: `${process.env.BASE_URL}/concierge?service=canceled`,
        metadata: {
          userId,
          serviceLevel,
          features: JSON.stringify(serviceFeatures[serviceLevel])
        }
      });

      return {
        paymentUrl: session.url!,
        serviceId: session.id
      };

    } catch (error) {
      console.error('Concierge service payment error:', error);
      throw error;
    }
  }

  async createLeadGenerationRevenue(communityId: number, leadPackage: 'starter' | 'growth' | 'enterprise'): Promise<{
    subscriptionUrl: string;
    revenueShareId: string;
  }> {
    try {
      // Lead Generation Revenue Sharing:
      // Starter ($199/month): Up to 10 qualified leads, basic analytics
      // Growth ($499/month): Up to 30 qualified leads, advanced analytics, priority support
      // Enterprise ($999/month): Unlimited leads, custom integration, dedicated account manager

      const leadPricing = {
        starter: { monthly: 199, leads: 10 },
        growth: { monthly: 499, leads: 30 },
        enterprise: { monthly: 999, leads: -1 } // Unlimited
      };

      const session = await this.stripeService.createRecurringSubscription({
        communityId,
        amount: leadPricing[leadPackage].monthly * 100,
        interval: 'month',
        description: `MySeniorValet ${leadPackage} Lead Generation Package`,
        successUrl: `${process.env.BASE_URL}/community-portal?leads=success&package=${leadPackage}`,
        cancelUrl: `${process.env.BASE_URL}/community-portal?leads=canceled`,
        metadata: {
          communityId: communityId.toString(),
          leadPackage,
          maxLeads: leadPricing[leadPackage].leads.toString()
        }
      });

      return {
        subscriptionUrl: session.url!,
        revenueShareId: session.id
      };

    } catch (error) {
      console.error('Lead generation subscription error:', error);
      throw error;
    }
  }

  async getPremiumFeatureAccess(userId: string): Promise<PremiumFeatureAccess> {
    try {
      // Check user's current subscriptions and access levels
      const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
      if (!user.length) throw new Error('User not found');

      // Check active subscriptions
      const subscriptions = await db
        .select()
        .from(communitySubscriptions)
        .where(eq(communitySubscriptions.userId, parseInt(userId)));

      // Determine feature access based on subscriptions
      const features = {
        familyCollaboration: this.hasActiveSubscription(subscriptions, 'family_collaboration'),
        priorityPlacement: this.hasActiveSubscription(subscriptions, 'priority_placement'),
        conciergeService: this.hasActiveSubscription(subscriptions, 'concierge_service'),
        advancedAnalytics: this.hasActiveSubscription(subscriptions, 'advanced_analytics'),
        documentSigning: this.hasActiveSubscription(subscriptions, 'document_signing'),
        aiMatchingPro: this.hasActiveSubscription(subscriptions, 'ai_matching_pro')
      };

      const subscriptionTier = this.determineTier(subscriptions);

      return {
        userId,
        features,
        subscriptionTier,
        expiresAt: this.getEarliestExpiration(subscriptions)
      };

    } catch (error) {
      console.error('Premium feature access check error:', error);
      throw error;
    }
  }

  private hasActiveSubscription(subscriptions: any[], featureType: string): boolean {
    return subscriptions.some(sub => 
      sub.subscriptionType === featureType && 
      sub.status === 'active' &&
      (!sub.expiresAt || new Date(sub.expiresAt) > new Date())
    );
  }

  private determineTier(subscriptions: any[]): 'free' | 'standard' | 'featured' | 'platinum' {
    if (subscriptions.some(sub => sub.tierLevel === 'platinum')) return 'platinum';
    if (subscriptions.some(sub => sub.tierLevel === 'featured')) return 'featured';
    if (subscriptions.some(sub => sub.tierLevel === 'standard')) return 'standard';
    return 'free';
  }

  private getEarliestExpiration(subscriptions: any[]): Date | undefined {
    const expirations = subscriptions
      .map(sub => sub.expiresAt)
      .filter(date => date)
      .map(date => new Date(date));

    return expirations.length ? new Date(Math.min(...expirations.map(d => d.getTime()))) : undefined;
  }

  async processWebhookPayment(stripeEvent: any): Promise<void> {
    try {
      switch (stripeEvent.type) {
        case 'checkout.session.completed':
          await this.handleSuccessfulPayment(stripeEvent.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleRecurringPayment(stripeEvent.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(stripeEvent.data.object);
          break;
        default:
          console.log(`Unhandled Stripe event type: ${stripeEvent.type}`);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  private async handleSuccessfulPayment(session: any): Promise<void> {
    const metadata = session.metadata;
    
    if (metadata.feature === 'family_collaboration') {
      await this.activateFamilyCollaboration(metadata.userId, metadata.planType);
    } else if (metadata.communityId && metadata.placementTier) {
      await this.activatePriorityPlacement(
        parseInt(metadata.communityId),
        metadata.placementTier,
        parseInt(metadata.duration)
      );
    } else if (metadata.serviceLevel) {
      await this.activateConciergeService(metadata.userId, metadata.serviceLevel);
    }
  }

  private async activateFamilyCollaboration(userId: string, planType: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (planType === 'yearly' ? 12 : 1));

    await db.insert(communitySubscriptions).values({
      userId: parseInt(userId),
      subscriptionType: 'family_collaboration',
      status: 'active',
      tierLevel: 'standard',
      expiresAt
    });

    console.log(`Family collaboration activated for user ${userId}`);
  }

  private async activatePriorityPlacement(communityId: number, tier: string, duration: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    await db.insert(communitySubscriptions).values({
      communityId,
      subscriptionType: 'priority_placement',
      status: 'active',
      tierLevel: tier as any,
      expiresAt
    });

    console.log(`Priority placement activated for community ${communityId}`);
  }

  private async activateConciergeService(userId: string, serviceLevel: string): Promise<void> {
    // Concierge services are typically one-time purchases with 90-day access
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    await db.insert(communitySubscriptions).values({
      userId: parseInt(userId),
      subscriptionType: 'concierge_service',
      status: 'active',
      tierLevel: serviceLevel === 'white_glove' ? 'platinum' : 'featured',
      expiresAt
    });

    console.log(`Concierge service (${serviceLevel}) activated for user ${userId}`);
  }

  private async handleRecurringPayment(invoice: any): Promise<void> {
    // Handle successful recurring subscription payments
    console.log('Recurring payment processed:', invoice.subscription);
  }

  private async handleSubscriptionCancellation(subscription: any): Promise<void> {
    // Handle subscription cancellations
    await db
      .update(communitySubscriptions)
      .set({ status: 'canceled' })
      .where(eq(communitySubscriptions.stripeSubscriptionId, subscription.id));

    console.log('Subscription canceled:', subscription.id);
  }
}

export const premiumStripeFeatures = new PremiumStripeFeatures();