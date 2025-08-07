// Test Payment Tiers API
const testPaymentTiers = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('=== TESTING PAYMENT SYSTEM ===\n');
  
  // Test Community Subscription Tiers
  console.log('1. Testing Community Subscription Creation...');
  const communityTiers = [
    { name: 'Verified Listing', price: 0, type: 'community' },
    { name: 'Standard', price: 149, type: 'community' },
    { name: 'Featured', price: 249, type: 'community' },
    { name: 'Platinum', price: 349, type: 'community' }
  ];
  
  for (const tier of communityTiers) {
    try {
      const response = await fetch(`${baseUrl}/api/payments/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.name,
          type: tier.type,
          testMode: true
        })
      });
      const data = await response.json();
      console.log(`✓ ${tier.name} ($${tier.price}/mo): ${data.success ? 'READY' : 'FAILED'}`);
    } catch (error) {
      console.log(`✗ ${tier.name}: Error - ${error.message}`);
    }
  }
  
  console.log('\n2. Testing Vendor Subscription Tiers...');
  const vendorTiers = [
    { name: 'Basic Listing', price: 99, type: 'vendor' },
    { name: 'Featured Vendor', price: 249, type: 'vendor' },
    { name: 'National Partner', price: 499, type: 'vendor' }
  ];
  
  for (const tier of vendorTiers) {
    try {
      const response = await fetch(`${baseUrl}/api/payments/create-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier.name,
          type: tier.type,
          testMode: true
        })
      });
      const data = await response.json();
      console.log(`✓ ${tier.name} ($${tier.price}/mo): ${data.success ? 'READY' : 'FAILED'}`);
    } catch (error) {
      console.log(`✗ ${tier.name}: Error - ${error.message}`);
    }
  }
  
  console.log('\n3. Testing Stripe Webhook Endpoint...');
  try {
    const webhookTest = await fetch(`${baseUrl}/api/payments/webhook-status`);
    const webhookData = await webhookTest.json();
    console.log(`✓ Webhook Status: ${webhookData.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  } catch (error) {
    console.log(`✗ Webhook Test: ${error.message}`);
  }
  
  console.log('\n=== PAYMENT SYSTEM TEST COMPLETE ===');
};

testPaymentTiers();
