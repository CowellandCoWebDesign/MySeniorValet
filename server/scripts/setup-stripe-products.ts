/**
 * Setup Stripe Products and Prices
 * Run this script to create all subscription products and prices in Stripe
 * 
 * Usage: npx tsx server/scripts/setup-stripe-products.ts
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil' as any,
});

// Define your subscription tiers
const SUBSCRIPTION_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Essential online presence for single communities',
    price: 9900, // $99 in cents
    features: [
      'Live messaging with families',
      'Basic profile with 5 photos',
      'Analytics dashboard',
      'Tour scheduling',
      'Standard search placement'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Enhanced visibility & features with 3D tour technology',
    price: 29900, // $299 in cents
    features: [
      'Everything in Starter',
      'Reservation Management',
      '3D tour embed capability',
      'Enhanced listing with 20 photos',
      'Featured search ranking',
      'Lead tracking & CRM exports'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced management tools for multi-property operators',
    price: 99900, // $999 in cents
    features: [
      'Everything in Growth',
      'Manage up to 5 properties',
      'AI lease generation',
      'Rental insurance tracking',
      'RMS integration',
      'Unlimited photos & videos'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Complete business solution with healthcare integrations',
    price: 199900, // $1999 in cents
    features: [
      'Everything in Professional',
      'Manage up to 10 properties',
      'Payment & deposit processing',
      'Healthcare integrations',
      'Medicare eligibility verification',
      'Financial reporting suite'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'White-label platform for large organizations',
    price: 399900, // $3999 in cents
    features: [
      'Everything in Premium',
      'Manage up to 25 properties',
      'Full Resident Management',
      'White-label options',
      'Full API access',
      'Custom domain & branding'
    ]
  }
];

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe Products and Prices...\n');
  
  const results: Record<string, any> = {};
  
  for (const tier of SUBSCRIPTION_TIERS) {
    try {
      console.log(`📦 Creating product: ${tier.name}`);
      
      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `metadata['tier_id']:'${tier.id}'`,
      });
      
      let product: Stripe.Product;
      
      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`  ✅ Product already exists: ${product.id}`);
        
        // Update product details
        product = await stripe.products.update(product.id, {
          name: `MySeniorValet ${tier.name}`,
          description: tier.description,
          metadata: {
            tier_id: tier.id,
            features: tier.features.join('|')
          }
        });
        console.log(`  ✅ Product updated`);
      } else {
        // Create new product
        product = await stripe.products.create({
          name: `MySeniorValet ${tier.name}`,
          description: tier.description,
          metadata: {
            tier_id: tier.id,
            features: tier.features.join('|')
          }
        });
        console.log(`  ✅ Product created: ${product.id}`);
      }
      
      // Check if price already exists
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        type: 'recurring',
      });
      
      let price: Stripe.Price;
      
      const matchingPrice = existingPrices.data.find(p => 
        p.unit_amount === tier.price && 
        p.recurring?.interval === 'month'
      );
      
      if (matchingPrice) {
        price = matchingPrice;
        console.log(`  ✅ Price already exists: ${price.id}`);
      } else {
        // Create new price
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.price,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          metadata: {
            tier_id: tier.id
          }
        });
        console.log(`  ✅ Price created: ${price.id} ($${tier.price / 100}/month)`);
      }
      
      results[tier.id] = {
        product_id: product.id,
        price_id: price.id,
        name: tier.name,
        price: tier.price
      };
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error setting up ${tier.name}:`, error);
    }
  }
  
  console.log('📝 Summary of Stripe Products and Prices:');
  console.log('========================================\n');
  
  console.log('Add these to your .env file:\n');
  for (const [tierId, data] of Object.entries(results)) {
    console.log(`STRIPE_PRICE_${tierId.toUpperCase()}=${data.price_id}`);
  }
  
  console.log('\n✅ Products Configuration:');
  console.table(results);
  
  console.log('\n🎉 Stripe products and prices setup complete!');
  console.log('Next steps:');
  console.log('1. Add the Price IDs to your environment variables');
  console.log('2. Update your code to use price IDs instead of price_data');
  console.log('3. Test the checkout flow with these new products');
}

// Run the setup
setupStripeProducts().catch(console.error);