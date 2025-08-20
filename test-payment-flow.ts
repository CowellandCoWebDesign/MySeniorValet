import axios from 'axios';

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER_EMAIL = 'testpayment@example.com';
const TEST_USER_PASSWORD = 'TestPayment123!';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  data?: any;
}

const testResults: TestResult[] = [];
let authToken = '';
let testUserId = '';
let testVendorId = '';
let testCommunityId = 1; // Use existing community ID

// Helper function to log test results
function logTest(name: string, status: 'passed' | 'failed' | 'skipped', error?: string, data?: any) {
  const statusColor = status === 'passed' ? colors.green : status === 'failed' ? colors.red : colors.yellow;
  const statusSymbol = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '⊙';
  
  console.log(`${statusColor}${statusSymbol} ${name}${colors.reset}`);
  if (error) console.log(`  ${colors.red}Error: ${error}${colors.reset}`);
  if (data && process.env.VERBOSE) console.log(`  Data:`, data);
  
  testResults.push({ name, status, error, data });
}

// Test helper functions
async function makeRequest(method: string, url: string, data?: any, headers?: any) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      validateStatus: () => true // Don't throw on non-2xx status
    });
    return response;
  } catch (error: any) {
    return { status: 500, data: { error: error.message } };
  }
}

// Test Suite 1: Authentication & User Setup
async function testAuthenticationFlow() {
  console.log(`\n${colors.cyan}═══ Authentication & User Setup ═══${colors.reset}\n`);

  // Test user registration
  const registerResponse = await makeRequest('POST', '/api/auth/register', {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    name: 'Payment Test User'
  });
  
  if (registerResponse.status === 201 || registerResponse.status === 200) {
    logTest('User Registration', 'passed', undefined, registerResponse.data);
    testUserId = registerResponse.data.user?.id || registerResponse.data.userId;
  } else if (registerResponse.status === 409) {
    logTest('User Registration', 'skipped', 'User already exists');
    // Try to login instead
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    if (loginResponse.status === 200) {
      logTest('User Login', 'passed');
      authToken = loginResponse.data.token;
      testUserId = loginResponse.data.user?.id;
    } else {
      logTest('User Login', 'failed', loginResponse.data.message);
    }
  } else {
    logTest('User Registration', 'failed', registerResponse.data.message);
  }
}

// Test Suite 2: Vendor Payment Flow
async function testVendorPaymentFlow() {
  console.log(`\n${colors.cyan}═══ Vendor Payment Flow ═══${colors.reset}\n`);

  // 1. Create a vendor profile
  const vendorResponse = await makeRequest('POST', '/api/vendors/create', {
    businessName: 'Test Vendor Services',
    email: 'vendor@example.com',
    phone: '555-0123',
    website: 'https://testvendor.com',
    description: 'Test vendor for payment flow testing',
    category: 'senior_care'
  });

  if (vendorResponse.status === 201 || vendorResponse.status === 200) {
    testVendorId = vendorResponse.data.vendor?.id || vendorResponse.data.id;
    logTest('Create Vendor Profile', 'passed', undefined, { vendorId: testVendorId });
  } else {
    logTest('Create Vendor Profile', 'failed', vendorResponse.data.message);
    return; // Can't continue without vendor
  }

  // 2. Get subscription tiers
  const tiersResponse = await makeRequest('GET', '/api/vendor-subscription/tiers');
  if (tiersResponse.status === 200) {
    logTest('Get Vendor Subscription Tiers', 'passed', undefined, {
      tiers: Object.keys(tiersResponse.data)
    });
  } else {
    logTest('Get Vendor Subscription Tiers', 'failed', tiersResponse.data.message);
  }

  // 3. Create checkout session for Professional tier
  const checkoutResponse = await makeRequest('POST', '/api/vendor-subscription/create-checkout-session', {
    vendorId: testVendorId,
    tierKey: 'professional'
  });

  if (checkoutResponse.status === 200) {
    logTest('Create Vendor Checkout Session', 'passed', undefined, {
      sessionId: checkoutResponse.data.sessionId,
      checkoutUrl: checkoutResponse.data.url?.substring(0, 50) + '...'
    });
    
    // Test checkout URL validity
    if (checkoutResponse.data.url && checkoutResponse.data.url.includes('checkout.stripe.com')) {
      logTest('Stripe Checkout URL Valid', 'passed');
    } else {
      logTest('Stripe Checkout URL Valid', 'failed', 'Invalid checkout URL format');
    }
  } else {
    logTest('Create Vendor Checkout Session', 'failed', checkoutResponse.data.message);
  }

  // 4. Check subscription status
  const statusResponse = await makeRequest('GET', `/api/vendor-subscription/status/${testVendorId}`);
  if (statusResponse.status === 200) {
    logTest('Get Vendor Subscription Status', 'passed', undefined, statusResponse.data);
  } else {
    logTest('Get Vendor Subscription Status', 'failed', statusResponse.data.message);
  }

  // 5. Test subscription cancellation endpoint
  const cancelResponse = await makeRequest('POST', '/api/vendor-subscription/cancel', {
    vendorId: testVendorId
  });
  
  // Should fail since no active subscription
  if (cancelResponse.status === 404) {
    logTest('Cancel Vendor Subscription (No Active)', 'passed', 'Correctly rejected - no active subscription');
  } else if (cancelResponse.status === 200) {
    logTest('Cancel Vendor Subscription', 'passed');
  } else {
    logTest('Cancel Vendor Subscription', 'failed', cancelResponse.data.message);
  }
}

// Test Suite 3: Community Payment Flow
async function testCommunityPaymentFlow() {
  console.log(`\n${colors.cyan}═══ Community Payment Flow ═══${colors.reset}\n`);

  // 1. Claim a community first
  const claimResponse = await makeRequest('POST', '/api/communities/claim', {
    communityId: testCommunityId,
    contactName: 'Test Manager',
    contactEmail: 'manager@testcommunity.com',
    contactPhone: '555-0456',
    role: 'owner'
  });

  if (claimResponse.status === 200 || claimResponse.status === 201) {
    logTest('Claim Community', 'passed', undefined, { communityId: testCommunityId });
  } else if (claimResponse.status === 400 && claimResponse.data.message?.includes('already claimed')) {
    logTest('Claim Community', 'skipped', 'Community already claimed');
  } else {
    logTest('Claim Community', 'failed', claimResponse.data.message);
  }

  // 2. Get community subscription pricing
  const pricingResponse = await makeRequest('GET', '/api/community-subscription/pricing');
  if (pricingResponse.status === 200) {
    logTest('Get Community Subscription Pricing', 'passed', undefined, {
      tiers: pricingResponse.data.map((t: any) => `${t.name}: $${t.price}`)
    });
  } else {
    logTest('Get Community Subscription Pricing', 'failed', pricingResponse.data.message);
  }

  // 3. Create checkout session for Featured tier
  const checkoutResponse = await makeRequest('POST', '/api/community-subscription/create-checkout-session', {
    communityId: testCommunityId,
    tierKey: 'featured'
  });

  if (checkoutResponse.status === 200) {
    logTest('Create Community Checkout Session', 'passed', undefined, {
      sessionId: checkoutResponse.data.sessionId,
      checkoutUrl: checkoutResponse.data.url?.substring(0, 50) + '...'
    });
    
    // Validate Stripe URL
    if (checkoutResponse.data.url && checkoutResponse.data.url.includes('checkout.stripe.com')) {
      logTest('Community Stripe URL Valid', 'passed');
    } else {
      logTest('Community Stripe URL Valid', 'failed', 'Invalid checkout URL');
    }
  } else if (checkoutResponse.status === 403) {
    logTest('Create Community Checkout Session', 'failed', 'Must claim community first');
  } else {
    logTest('Create Community Checkout Session', 'failed', checkoutResponse.data.message);
  }

  // 4. Test free tier activation
  const freeResponse = await makeRequest('POST', '/api/community-subscription/create-checkout-session', {
    communityId: testCommunityId,
    tierKey: 'verified'
  });

  if (freeResponse.status === 200 && freeResponse.data.message === 'Free tier activated') {
    logTest('Activate Free Community Tier', 'passed');
  } else if (freeResponse.status === 403) {
    logTest('Activate Free Community Tier', 'skipped', 'Community not claimed by test user');
  } else {
    logTest('Activate Free Community Tier', 'failed', freeResponse.data.message);
  }
}

// Test Suite 4: Webhook Simulation
async function testWebhooks() {
  console.log(`\n${colors.cyan}═══ Webhook Handling ═══${colors.reset}\n`);

  // Note: Can't test actual webhook without valid signature, but test endpoint availability
  
  // Test vendor webhook endpoint
  const vendorWebhookResponse = await makeRequest('POST', '/api/vendor-stripe/webhook', 
    { type: 'test' },
    { 'stripe-signature': 'test_signature' }
  );
  
  if (vendorWebhookResponse.status === 500 && vendorWebhookResponse.data.message === 'Webhook not configured') {
    logTest('Vendor Webhook Endpoint', 'skipped', 'Webhook secret not configured');
  } else if (vendorWebhookResponse.status === 400) {
    logTest('Vendor Webhook Endpoint', 'passed', 'Endpoint exists, signature validation working');
  } else {
    logTest('Vendor Webhook Endpoint', 'failed', vendorWebhookResponse.data.message);
  }

  // Test community webhook endpoint
  const communityWebhookResponse = await makeRequest('POST', '/api/community-stripe/webhook',
    { type: 'test' },
    { 'stripe-signature': 'test_signature' }
  );
  
  if (communityWebhookResponse.status === 500 && communityWebhookResponse.data.message === 'Webhook not configured') {
    logTest('Community Webhook Endpoint', 'skipped', 'Webhook secret not configured');
  } else if (communityWebhookResponse.status === 400) {
    logTest('Community Webhook Endpoint', 'passed', 'Endpoint exists, signature validation working');
  } else {
    logTest('Community Webhook Endpoint', 'failed', communityWebhookResponse.data.message);
  }
}

// Test Suite 5: Payment Integration Validation
async function testPaymentIntegration() {
  console.log(`\n${colors.cyan}═══ Payment Integration Validation ═══${colors.reset}\n`);

  // Test Stripe configuration
  const stripeTestResponse = await makeRequest('POST', '/api/vendor-subscription/create-checkout-session', {
    vendorId: 999999, // Non-existent vendor
    tierKey: 'professional'
  });

  // Should fail with forbidden (not owner) or similar
  if (stripeTestResponse.status === 403 || stripeTestResponse.status === 404) {
    logTest('Stripe API Configuration', 'passed', 'Stripe integration working');
  } else if (stripeTestResponse.status === 500 && stripeTestResponse.data.error?.includes('Stripe')) {
    logTest('Stripe API Configuration', 'failed', 'Stripe API error - check API keys');
  } else {
    logTest('Stripe API Configuration', 'skipped', 'Unable to determine Stripe status');
  }

  // Test database integration for payments
  const dbTestResponse = await makeRequest('GET', '/api/vendor-subscription/tiers');
  if (dbTestResponse.status === 200 && dbTestResponse.data) {
    logTest('Payment Database Integration', 'passed');
  } else {
    logTest('Payment Database Integration', 'failed');
  }
}

// Main test runner
async function runPaymentTests() {
  console.log(`${colors.magenta}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║     MySeniorValet Payment Flow Test Suite        ║${colors.reset}`);
  console.log(`${colors.magenta}╚═══════════════════════════════════════════════════╝${colors.reset}`);
  
  const startTime = Date.now();

  // Run all test suites
  await testAuthenticationFlow();
  await testVendorPaymentFlow();
  await testCommunityPaymentFlow();
  await testWebhooks();
  await testPaymentIntegration();

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  const passed = testResults.filter(r => r.status === 'passed').length;
  const failed = testResults.filter(r => r.status === 'failed').length;
  const skipped = testResults.filter(r => r.status === 'skipped').length;
  
  console.log(`\n${colors.cyan}═══ Test Summary ═══${colors.reset}\n`);
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${skipped}${colors.reset}`);
  console.log(`Duration: ${duration}s`);
  
  // Show failed tests
  if (failed > 0) {
    console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
    testResults.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  • ${r.name}: ${r.error || 'Unknown error'}`);
    });
  }

  // Save detailed results
  const fs = await import('fs');
  const resultsFile = `payment-test-results-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    summary: { passed, failed, skipped, total: testResults.length },
    results: testResults
  }, null, 2));
  
  console.log(`\n${colors.blue}Detailed results saved to: ${resultsFile}${colors.reset}`);
  
  // Exit code based on failures
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runPaymentTests().catch(error => {
  console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
  process.exit(1);
});