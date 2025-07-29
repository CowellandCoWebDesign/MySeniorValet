// MySeniorValet - Stripe Product and Pricing Automation Script
// Creates all subscription products and pricing for the monetization system

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

const products = [
  {
    name: "Basic Listing",
    description: "Verified listing with basic visibility and search access. No tools.",
    price: 0,
    interval: null,
    type: "product",
  },
  {
    name: "Featured Spotlight",
    description: "Profile editing, featured placement, Red Tag specials, photo/form tools.",
    price: 14900, // $149.00 per month
    interval: "month",
    type: "product",
  },
  {
    name: "Premium Tools + Exposure",
    description: "Branded intake, availability tools, tour scheduler, reservability (Coming Soon).",
    price: 24900, // $249.00 per month
    interval: "month",
    type: "product",
  },
  {
    name: "Platinum Marketing Partner",
    description: "Full suite + homepage, concierge, sponsored content, AI access.",
    price: 39900, // $399.00 per month
    interval: "month",
    type: "product",
  },
  {
    name: "Add Additional Location",
    description: "Add dashboard/edit access for an additional community.",
    price: 4900, // $49.00 per month
    interval: "month",
    type: "add-on",
  },
  {
    name: "Family Messaging Module",
    description: "Enables secure in-platform messaging with families.",
    price: 2900, // $29.00 per month
    interval: "month",
    type: "add-on",
  },
  {
    name: "AI Virtual Tour Assistant (Beta)",
    description: "AI-guided multimedia tour assistant (Coming Soon).",
    price: 5900, // $59.00 per month
    interval: "month",
    type: "add-on",
  },
  {
    name: "Resident Bill Pay Tools (Coming Soon)",
    description: "Billing and payment portal for residents (Coming Soon).",
    price: 7900, // $79.00 per month
    interval: "month",
    type: "add-on",
  }
];

async function createStripeProducts() {
  console.log('🚀 Creating MySeniorValet products in Stripe...\n');
  
  for (const item of products) {
    try {
      const product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: {
          category: item.type,
          platform: "myseniorvalet"
        }
      });

      console.log(`✅ Product created: ${item.name} (ID: ${product.id})`);

      if (item.price > 0 && item.interval) {
        const price = await stripe.prices.create({
          unit_amount: item.price,
          currency: "usd",
          recurring: { interval: item.interval },
          product: product.id
        });
        
        console.log(`   💰 Price created: $${(item.price / 100).toFixed(2)}/${item.interval} (ID: ${price.id})`);
      } else {
        console.log(`   🆓 Free product - no pricing needed`);
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error creating ${item.name}:`, error.message);
    }
  }
  
  console.log('🎉 Stripe product creation complete!');
  console.log('\n📊 Summary:');
  console.log(`- ${products.length} products processed`);
  console.log(`- ${products.filter(p => p.price > 0).length} paid subscriptions`);
  console.log(`- ${products.filter(p => p.price === 0).length} free products`);
  console.log(`- ${products.filter(p => p.type === 'add-on').length} add-on modules`);
}

// Check if STRIPE_SECRET_KEY is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.log('Set it with: export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

createStripeProducts().catch(console.error);