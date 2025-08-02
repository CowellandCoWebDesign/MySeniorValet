import Stripe from 'stripe';
import { db } from './db';
import { paymentTransactions, users, communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { internalNotifications } from './services/internal-notifications';

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export interface CreatePaymentIntentParams {
  userId: number;
  communityId: number;
  paymentType: 'tour' | 'application' | 'deposit' | 'document' | 'priority_support';
  amount: number; // Always 195 cents ($1.95)
  metadata?: Record<string, string>;
}

export interface RecordTransactionParams {
  paymentIntentId: string;
  userId: number;
  communityId: number;
  paymentType: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
}

export class StripePaymentService {
  async createPaymentIntent(params: CreatePaymentIntentParams) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }

    const { userId, communityId, paymentType, amount, metadata = {} } = params;

    // Get user and community details for metadata
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    if (!community) {
      throw new Error('Community not found');
    }

    // Create payment intent with fixed $1.95 fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 195, // $1.95 in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId.toString(),
        communityId: communityId.toString(),
        communityName: community.name,
        paymentType,
        userEmail: user.email || '',
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        ...metadata
      },
      description: `MySeniorValet connection fee for ${community.name}`,
      statement_descriptor_suffix: 'MYSENIORVALET',
    });

    // Record the transaction as pending
    await this.recordTransaction({
      paymentIntentId: paymentIntent.id,
      userId,
      communityId,
      paymentType,
      amount: 195,
      status: 'pending',
      metadata: {
        stripeCustomerId: paymentIntent.customer,
        communityName: community.name,
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    };
  }

  async recordTransaction(params: RecordTransactionParams) {
    const { paymentIntentId, userId, communityId, paymentType, amount, status, metadata } = params;

    const [transaction] = await db.insert(paymentTransactions).values({
      userId,
      communityId,
      stripePaymentIntentId: paymentIntentId,
      paymentType,
      amount,
      currency: 'usd',
      status,
      metadata,
      processingFee: 195, // Fixed $1.95 fee
      netAmount: 0, // We don't collect the actual service amount
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return transaction;
  }

  async updateTransactionStatus(paymentIntentId: string, status: 'completed' | 'failed' | 'refunded') {
    const [updated] = await db
      .update(paymentTransactions)
      .set({ 
        status, 
        updatedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : undefined,
      })
      .where(eq(paymentTransactions.stripePaymentIntentId, paymentIntentId))
      .returning();

    return updated;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.updateTransactionStatus(paymentIntent.id, 'completed');
        
        // Trigger notification to community about new connection
        await this.notifyCommunityOfConnection(paymentIntent);
        
        // Send internal notification
        try {
          const { communityName, paymentType, userId } = paymentIntent.metadata;
          const amount = paymentIntent.amount / 100; // Convert from cents
          
          // Get user details for notification
          const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
          
          await internalNotifications.notifyPaymentReceived({
            communityName: communityName || 'Unknown Community',
            amount,
            paymentType: paymentType as 'tour' | 'application' | 'deposit' | 'document' | 'priority_support' || 'tour',
            userName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown User',
            userEmail: user?.email || 'unknown@email.com',
            paymentIntentId: paymentIntent.id
          });
        } catch (notificationError) {
          console.error('Error sending internal payment notification:', notificationError);
          // Don't fail the webhook if internal notification fails
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await this.updateTransactionStatus(failedIntent.id, 'failed');
        break;

      case 'charge.refunded':
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await this.updateTransactionStatus(charge.payment_intent as string, 'refunded');
        }
        break;
    }
  }

  private async notifyCommunityOfConnection(paymentIntent: Stripe.PaymentIntent) {
    // Extract metadata
    const { communityId, userId, paymentType, communityName } = paymentIntent.metadata;

    // Here we would send notifications to the community
    // For now, we'll just log it
    console.log(`New ${paymentType} connection for ${communityName} from user ${userId}`);

    // In the future, this could:
    // 1. Send email to community contact
    // 2. Create a task in the community dashboard
    // 3. Send SMS notification
    // 4. Update community stats
  }

  async createStripeCustomer(userId: number) {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new Error('User not found');
    }

    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
      metadata: {
        userId: userId.toString(),
      }
    });

    // Update user with Stripe customer ID
    await db
      .update(users)
      .set({ 
        stripeCustomerId: customer.id,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return customer;
  }

  async getTransactionHistory(userId: number, limit = 20) {
    const transactions = await db
      .select({
        id: paymentTransactions.id,
        communityId: paymentTransactions.communityId,
        communityName: communities.name,
        paymentType: paymentTransactions.paymentType,
        amount: paymentTransactions.amount,
        status: paymentTransactions.status,
        createdAt: paymentTransactions.createdAt,
        completedAt: paymentTransactions.completedAt,
      })
      .from(paymentTransactions)
      .leftJoin(communities, eq(paymentTransactions.communityId, communities.id))
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(paymentTransactions.createdAt)
      .limit(limit);

    return transactions;
  }
}

export const stripePaymentService = new StripePaymentService();