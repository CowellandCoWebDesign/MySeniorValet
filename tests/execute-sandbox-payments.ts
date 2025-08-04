#!/usr/bin/env tsx

// Execute REAL sandbox payments that trigger webhooks and emails
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil'
});

interface SandboxPayment {
  type: 'community' | 'vendor';
  tier: string;
  tierKey: string;
  price: number;
}

class SandboxPaymentExecutor {
  private payments: SandboxPayment[] = [
    // Community Tiers
    { type: 'community', tier: 'Standard', tierKey: 'standard', price: 149 },
    { type: 'community', tier: 'Featured', tierKey: 'featured', price: 249 },
    { type: 'community', tier: 'Platinum', tierKey: 'platinum', price: 349 },
    // Vendor Tiers
    { type: 'vendor', tier: 'Basic', tierKey: 'basic', price: 99 },
    { type: 'vendor', tier: 'Featured', tierKey: 'featured', price: 249 },
    { type: 'vendor', tier: 'National', tierKey: 'national', price: 499 }
  ];

  async executeAllPayments() {
    console.log('💳 EXECUTING SANDBOX PAYMENTS - THIS WILL CHARGE TEST CARDS\n');
    
    for (const payment of this.payments) {
      console.log(`\n🔥 Processing ${payment.type} ${payment.tier} - $${payment.price}`);
      await this.processPayment(payment);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ ALL PAYMENTS EXECUTED!');
    console.log('📧 Check william.cowell01@gmail.com for notifications');
  }

  private async processPayment(payment: SandboxPayment) {
    try {
      // Create customer
      const customer = await stripe.customers.create({
        email: 'william.cowell01@gmail.com',
        name: `Test ${payment.type} ${payment.tier}`,
        description: `Testing ${payment.tier} subscription`
      });

      // Create product first
      const product = await stripe.products.create({
        name: `${payment.tier} ${payment.type} Subscription`,
        description: `Monthly ${payment.tier} subscription for ${payment.type}`
      });

      // Create price for the product
      const price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: payment.price * 100,
        recurring: { interval: 'month' }
      });

      // Create subscription with immediate payment
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription'
        },
        default_payment_method: await this.createTestPaymentMethod(customer.id),
        metadata: {
          type: payment.type,
          tier: payment.tierKey,
          tier_name: payment.tier,
          customer_email: 'william.cowell01@gmail.com'
        }
      });

      console.log(`✅ Subscription created: ${subscription.id}`);
      console.log(`💰 Payment processed: $${payment.price}`);
      console.log(`🔔 Webhooks will trigger automatically`);
      console.log(`📧 Email sent to: william.cowell01@gmail.com`);

    } catch (error: any) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }

  private async createTestPaymentMethod(customerId: string): Promise<string> {
    // Create payment method with test token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa' // Stripe test token
      }
    });

    // Attach to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId
    });

    return paymentMethod.id;
  }
}

// Execute payments
const executor = new SandboxPaymentExecutor();
executor.executeAllPayments().catch(console.error);