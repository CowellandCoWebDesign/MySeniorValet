const http = require('http');

console.log('=== COMPLETE PAYMENT FLOW TEST ===\n');

// Test all 7 tiers
const tiers = [
  { tier: 'verified', type: 'community', price: 0 },
  { tier: 'standard', type: 'community', price: 149 },
  { tier: 'featured', type: 'community', price: 249 },
  { tier: 'platinum', type: 'community', price: 349 },
  { tier: 'basic', type: 'vendor', price: 99 },
  { tier: 'featured', type: 'vendor', price: 249 },
  { tier: 'national', type: 'vendor', price: 499 }
];

async function testPaymentIntent(tier, type, expectedPrice) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      tier,
      type,
      metadata: {
        userEmail: 'william.cowell01@gmail.com',
        timestamp: new Date().toISOString()
      }
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/create-payment-intent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.paymentIntentId) {
            console.log(`✅ ${tier} (${type}): Payment Intent ${result.paymentIntentId}`);
            console.log(`   Amount: $${result.amount / 100} | Stripe Dashboard: https://dashboard.stripe.com/test/payments/${result.paymentIntentId}`);
            resolve(true);
          } else if (result.free) {
            console.log(`✅ ${tier} (${type}): Free tier processed`);
            resolve(true);
          } else {
            console.log(`❌ ${tier} (${type}): ${result.error || 'Failed'}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`❌ ${tier} (${type}): Invalid response`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${tier} (${type}): ${e.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Testing all 7 payment tiers...\n');
  
  let successCount = 0;
  for (const { tier, type, price } of tiers) {
    const success = await testPaymentIntent(tier, type, price);
    if (success) successCount++;
    await new Promise(r => setTimeout(r, 500)); // Small delay between requests
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTS: ${successCount}/7 tiers working`);
  
  if (successCount === 7) {
    console.log('🎉 ALL PAYMENT TIERS ARE OPERATIONAL!');
    console.log('\n📱 Payment URLs for testing:');
    console.log('Community: https://[your-domain]/community-mobile-payment/standard');
    console.log('Vendor: https://[your-domain]/vendor-mobile-payment/basic');
    console.log('\n💳 Check your Stripe Dashboard for all payment intents:');
    console.log('https://dashboard.stripe.com/test/payments');
  } else {
    console.log(`⚠️ ${7 - successCount} tiers need attention`);
  }
}

runTests();