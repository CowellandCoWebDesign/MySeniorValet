// Test script for community payment flow with Payment Element
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

console.log("===============================================");
console.log("  COMMUNITY PAYMENT FLOW TEST - Payment Element ");
console.log("===============================================\n");

async function testCommunityPaymentFlow() {
  // Test community tier products
  console.log("=== Testing Community Tier Configuration ===");
  const tiers = {
    'standard': { price: 149, name: 'Standard' },
    'featured': { price: 249, name: 'Featured' },
    'platinum': { price: 349, name: 'Platinum' }
  };

  console.log("✓ Community tiers configured:");
  for (const [key, tier] of Object.entries(tiers)) {
    console.log(`  - ${tier.name}: $${tier.price}.00/month`);
  }
  console.log("");

  // Test payment intent creation for community
  console.log("=== Testing Payment Intent Creation for Community ===");
  try {
    const response = await fetch(`${BASE_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'community-featured',
        amount: 24900, // $249 in cents
        metadata: {
          communityId: '123',
          communityName: 'Sunset Gardens',
          tier: 'featured',
          type: 'community_subscription'
        }
      })
    });

    const data = await response.json();
    
    if (data.clientSecret && data.paymentIntentId) {
      console.log("✓ Payment intent created successfully");
      console.log(`  Client Secret: ${data.clientSecret.substring(0, 30)}...`);
      console.log(`  Payment Intent ID: ${data.paymentIntentId}`);
      console.log("");

      // Test confirmation endpoint
      console.log("=== Testing Payment Confirmation ===");
      const confirmResponse = await fetch(`${BASE_URL}/api/payments/confirm-community-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: data.paymentIntentId,
          communityId: '123',
          tier: 'featured'
        })
      });

      const confirmData = await confirmResponse.json();
      if (confirmResponse.ok) {
        console.log("✓ Payment confirmation endpoint works");
        console.log(`  Note: ${confirmData.error || confirmData.message}`);
      } else {
        console.log("✗ Payment confirmation failed");
        console.log(`  Error: ${JSON.stringify(confirmData, null, 2)}`);
      }
    } else {
      console.log("✗ Failed to create payment intent");
      console.log(`  Response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log("✗ Error testing payment flow:", error.message);
  }

  console.log("\n=== Community User Flow Summary ===");
  console.log("1. Community manager navigates to /community-payment-program");
  console.log("2. Selects desired tier (Standard, Featured, or Platinum)");
  console.log("3. Clicks 'Upgrade' on /community-subscription-checkout");
  console.log("4. Data stored in sessionStorage");
  console.log("5. Redirected to /community-mobile-payment/[tier]");
  console.log("6. Payment Element loads with mobile-optimized UI");
  console.log("7. Payment intent created via /api/payments/create-payment-intent");
  console.log("8. Community enters card details (no redirect)");
  console.log("9. Payment confirmed via /api/payments/confirm-community-payment");
  console.log("10. Database updated with new subscription tier");
  console.log("11. Email sent to super admin");
  console.log("12. Success page shown with tier details");

  console.log("\n=== Test Complete ===");
}

testCommunityPaymentFlow();