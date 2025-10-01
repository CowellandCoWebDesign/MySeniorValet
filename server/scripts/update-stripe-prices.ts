/**
 * Script to update Stripe prices for MySeniorValet subscription tiers
 * This creates new prices with the updated amounts and updates the configuration
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil'
});

// New pricing structure
const UPDATED_TIERS = [
  {
    name: 'Community Starter',
    key: 'starter',
    oldPrice: 9900,  // $99
    newPrice: 14900, // $149
    oldPriceId: 'price_1S53IkEQ489MwJ34ktvmZFHk',
    description: 'Basic listing with verified badge and lead generation'
  },
  {
    name: 'Community Growth',
    key: 'growth',
    oldPrice: 29900,  // $299
    newPrice: 39900,  // $399
    oldPriceId: 'price_1S53IlEQ489MwJ34c6h8MRG8',
    description: '3D tour embed, unit reservations, and enhanced visibility'
  },
  {
    name: 'Community Professional',
    key: 'professional',
    oldPrice: 99900,   // $999
    newPrice: 129900,  // $1,299
    oldPriceId: 'price_1S53ImEQ489MwJ34haImoDqJ',
    description: 'AI lease management and advanced features'
  },
  {
    name: 'Community Premium',
    key: 'premium',
    oldPrice: 199900,  // $1,999
    newPrice: 249900,  // $2,499
    oldPriceId: 'price_1S53InEQ489MwJ34Be6qsJBz',
    description: 'Payment processing and multi-property management'
  },
  {
    name: 'Community Enterprise',
    key: 'enterprise',
    oldPrice: 399900,  // $3,999
    newPrice: 499900,  // $4,999
    oldPriceId: 'price_1S53InEQ489MwJ34FMoJIocA',
    description: 'White-label platform with API access and dedicated support'
  }
];

async function updateStripePrices() {
  console.log('🚀 Starting Stripe price update for MySeniorValet...\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in environment variables');
    return;
  }

  const newPriceIds: Record<string, string> = {};
  
  for (const tier of UPDATED_TIERS) {
    try {
      console.log(`📦 Processing ${tier.name}...`);
      
      // First, try to retrieve the old price to get the product ID
      let productId: string | undefined;
      
      try {
        const oldPrice = await stripe.prices.retrieve(tier.oldPriceId);
        productId = typeof oldPrice.product === 'string' ? oldPrice.product : oldPrice.product?.id;
        console.log(`   ✓ Found existing product: ${productId}`);
      } catch (error) {
        console.log(`   ⚠️ Could not find old price ${tier.oldPriceId}, creating new product...`);
      }
      
      // If we don't have a product, create one
      if (!productId) {
        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description,
          metadata: {
            tier: tier.key,
            platform: 'MySeniorValet'
          }
        });
        productId = product.id;
        console.log(`   ✓ Created new product: ${productId}`);
      }
      
      // Create the new price
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: tier.newPrice,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          tier: tier.key,
          version: 'v3.3',
          updated: new Date().toISOString()
        }
      });
      
      newPriceIds[tier.key] = newPrice.id;
      console.log(`   ✅ Created new price: ${newPrice.id} ($${tier.newPrice / 100}/month)`);
      
      // Archive the old price if it exists
      try {
        await stripe.prices.update(tier.oldPriceId, {
          active: false
        });
        console.log(`   ✓ Archived old price: ${tier.oldPriceId}\n`);
      } catch (error) {
        console.log(`   ℹ️ Could not archive old price (may not exist)\n`);
      }
      
    } catch (error: any) {
      console.error(`   ❌ Error processing ${tier.name}: ${error.message}\n`);
    }
  }
  
  // Update the tiers.ts file with new price IDs
  console.log('\n📝 Updating configuration file with new price IDs...');
  
  const tiersFilePath = path.join(process.cwd(), 'shared', 'tiers.ts');
  let tiersContent = fs.readFileSync(tiersFilePath, 'utf-8');
  
  // Update each price ID in the file
  for (const [key, newPriceId] of Object.entries(newPriceIds)) {
    const tier = UPDATED_TIERS.find(t => t.key === key);
    if (tier && newPriceId) {
      const oldPattern = new RegExp(`stripePriceId: '${tier.oldPriceId}'`, 'g');
      tiersContent = tiersContent.replace(oldPattern, `stripePriceId: '${newPriceId}'`);
      console.log(`   ✓ Updated ${key} tier: ${tier.oldPriceId} → ${newPriceId}`);
    }
  }
  
  fs.writeFileSync(tiersFilePath, tiersContent);
  console.log('\n✅ Configuration file updated successfully!');
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 STRIPE PRICING UPDATE SUMMARY');
  console.log('='.repeat(60));
  console.log('\n💰 New Pricing Structure:');
  console.log('   Starter:      $149/month (was $99)');
  console.log('   Growth:       $399/month (was $299)');
  console.log('   Professional: $1,299/month (was $999)');
  console.log('   Premium:      $2,499/month (was $1,999)');
  console.log('   Enterprise:   $4,999/month (was $3,999)');
  
  console.log('\n🔑 New Price IDs:');
  for (const [key, id] of Object.entries(newPriceIds)) {
    if (id) {
      console.log(`   ${key}: ${id}`);
    }
  }
  
  console.log('\n✅ All prices have been updated in Stripe and configuration!');
  console.log('   The platform is now using the new v3.3 pricing structure.\n');
}

// Run the update
updateStripePrices().catch(console.error);