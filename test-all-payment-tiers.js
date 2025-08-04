#!/usr/bin/env node

// Test script to verify all payment tiers for communities and vendors
// This will create test payment intents for each tier to ensure functionality

const COMMUNITY_TIERS = [
  { id: 'standard', name: 'Standard', price: 149 },
  { id: 'featured', name: 'Featured', price: 249 },
  { id: 'platinum', name: 'Platinum', price: 349 }
];

const VENDOR_TIERS = [
  { id: 'basic-vendor', name: 'Basic Listing', price: 99 },
  { id: 'featured-vendor', name: 'Featured Vendor', price: 249 },
  { id: 'national-partner', name: 'National Partner', price: 499 }
];

const API_BASE_URL = 'https://7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev';

async function testPaymentIntent(type, tier) {
  console.log(`\n🔵 Testing ${type} - ${tier.name} ($${tier.price}/month)`);
  console.log('━'.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: tier.id,
        amount: tier.price * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          type: type,
          tierName: tier.name,
          testRun: 'true'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    
    if (data.clientSecret) {
      console.log('✅ Payment Intent Created Successfully');
      console.log(`   Client Secret: ${data.clientSecret.substring(0, 20)}...`);
      console.log(`   Amount: $${tier.price}`);
      console.log(`   Status: ${data.status || 'requires_payment_method'}`);
      return true;
    } else {
      throw new Error('No client secret returned');
    }
  } catch (error) {
    console.error('❌ Payment Intent Failed:', error.message);
    return false;
  }
}

async function testAllTiers() {
  console.log('\n🚀 MySeniorValet Payment Tier Testing');
  console.log('=====================================\n');
  console.log('This test will verify all payment tiers are properly configured');
  console.log('and can create valid Stripe payment intents.\n');

  let successCount = 0;
  let failureCount = 0;

  // Test Community Tiers
  console.log('\n📍 TESTING COMMUNITY TIERS');
  console.log('══════════════════════════');
  
  for (const tier of COMMUNITY_TIERS) {
    const success = await testPaymentIntent('community', tier);
    if (success) successCount++;
    else failureCount++;
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test Vendor Tiers
  console.log('\n\n📍 TESTING VENDOR TIERS');
  console.log('═════════════════════');
  
  for (const tier of VENDOR_TIERS) {
    const success = await testPaymentIntent('vendor', tier);
    if (success) successCount++;
    else failureCount++;
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('═══════════════');
  console.log(`Total Tests: ${successCount + failureCount}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All payment tiers are working correctly!');
    console.log('   Communities and vendors can successfully subscribe to all tiers.');
  } else {
    console.log('\n⚠️  Some payment tiers failed. Please check the errors above.');
  }

  // Test specific payment flows
  console.log('\n\n📱 PAYMENT FLOW URLS');
  console.log('════════════════════');
  console.log('\nCommunity Payment Pages:');
  COMMUNITY_TIERS.forEach(tier => {
    console.log(`  ${tier.name}: ${API_BASE_URL}/community-mobile-payment/${tier.id}`);
  });
  
  console.log('\nVendor Payment Pages:');
  VENDOR_TIERS.forEach(tier => {
    console.log(`  ${tier.name}: ${API_BASE_URL}/vendor-mobile-payment/${tier.id}`);
  });

  console.log('\n\n💡 UPGRADE FLOW ENTRY POINTS');
  console.log('════════════════════════════');
  console.log('Communities:');
  console.log('  New: /community-portal → Select Tier → Payment');
  console.log('  Existing: /community-dashboard → Upgrade Plan → Portal → Payment');
  console.log('\nVendors:');
  console.log('  New: /vendor-signup → Select Tier → Payment');
  console.log('  Existing: /vendor-dashboard → Upgrade Plan → Marketplace → Payment');
}

// Run the tests
testAllTiers().catch(console.error);