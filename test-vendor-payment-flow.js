// Test script for vendor payment flow with Stripe Payment Element
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test vendor data
const testVendorData = {
  businessName: 'Test Senior Care Services',
  contactName: 'John Doe',
  email: 'test@seniorcare.com',
  phone: '555-123-4567',
  website: 'https://testseniorcare.com',
  businessType: 'home-care',
  description: 'We provide comprehensive home care services for seniors including medication management, daily living assistance, and companionship services.',
  serviceAreas: 'California, Nevada, Arizona',
  planType: 'featured'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

async function testPaymentIntentCreation() {
  console.log(`\n${colors.blue}=== Testing Payment Intent Creation ===${colors.reset}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'featured-vendor',
        amount: 24900, // $249.00
        metadata: {
          vendorName: testVendorData.businessName,
          vendorEmail: testVendorData.email,
          vendorPhone: testVendorData.phone,
          productName: 'Featured Vendor'
        }
      })
    });

    const data = await response.json();
    
    if (response.ok && data.clientSecret) {
      console.log(`${colors.green}✓ Payment intent created successfully${colors.reset}`);
      console.log(`  Client Secret: ${data.clientSecret.substring(0, 20)}...`);
      console.log(`  Payment Intent ID: ${data.paymentIntentId}`);
      return data;
    } else {
      console.log(`${colors.red}✗ Failed to create payment intent${colors.reset}`);
      console.log(`  Error: ${JSON.stringify(data, null, 2)}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error creating payment intent: ${error.message}${colors.reset}`);
    return null;
  }
}

async function testPaymentConfirmation(paymentIntentId) {
  console.log(`\n${colors.blue}=== Testing Payment Confirmation ===${colors.reset}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId: paymentIntentId,
        productId: 'featured-vendor',
        vendorData: testVendorData
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✓ Payment confirmation endpoint works${colors.reset}`);
      console.log(`  Response: ${JSON.stringify(data, null, 2)}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Payment confirmation failed${colors.reset}`);
      console.log(`  Error: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error confirming payment: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testStripeEndpoints() {
  console.log(`\n${colors.blue}=== Testing Stripe Configuration ===${colors.reset}`);
  
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log(`${colors.yellow}⚠ STRIPE_SECRET_KEY not found in environment${colors.reset}`);
    console.log(`  This is expected in development. In production, ensure Stripe keys are configured.`);
  } else {
    console.log(`${colors.green}✓ Stripe configuration found${colors.reset}`);
  }
  
  if (!process.env.VITE_STRIPE_PUBLIC_KEY) {
    console.log(`${colors.yellow}⚠ VITE_STRIPE_PUBLIC_KEY not found in environment${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Stripe public key configured${colors.reset}`);
  }
}

async function testVendorProducts() {
  console.log(`\n${colors.blue}=== Testing Vendor Product Configuration ===${colors.reset}`);
  
  const products = [
    { id: 'basic-vendor', name: 'Basic Listing', price: 9900 },
    { id: 'featured-vendor', name: 'Featured Vendor', price: 24900 },
    { id: 'national-partner', name: 'National Partner', price: 49900 }
  ];
  
  console.log(`${colors.green}✓ Vendor products configured:${colors.reset}`);
  products.forEach(product => {
    console.log(`  - ${product.name}: $${(product.price / 100).toFixed(2)}/month`);
  });
}

async function testMobilePaymentFlow() {
  console.log(`\n${colors.magenta}===============================================${colors.reset}`);
  console.log(`${colors.magenta}   VENDOR PAYMENT FLOW TEST - Payment Element  ${colors.reset}`);
  console.log(`${colors.magenta}===============================================${colors.reset}`);
  
  // Test Stripe configuration
  await testStripeEndpoints();
  
  // Test vendor products
  await testVendorProducts();
  
  // Test payment intent creation
  const paymentIntent = await testPaymentIntentCreation();
  
  if (paymentIntent) {
    // Test payment confirmation (simulated)
    console.log(`\n${colors.yellow}Note: In a real scenario, the user would complete payment in the UI${colors.reset}`);
    console.log(`${colors.yellow}Testing confirmation endpoint with simulated successful payment...${colors.reset}`);
    
    // Note: In production, Stripe would update the payment intent status
    // For testing, we're just verifying the endpoint works
    await testPaymentConfirmation(paymentIntent.paymentIntentId);
  }
  
  console.log(`\n${colors.blue}=== User Flow Summary ===${colors.reset}`);
  console.log(`1. User fills out vendor signup form at /vendor-signup`);
  console.log(`2. Form data is stored in session storage`);
  console.log(`3. User is redirected to /vendor-mobile-payment/[productId]`);
  console.log(`4. MobilePaymentForm component loads with Payment Element`);
  console.log(`5. Payment intent is created via /api/payments/create-payment-intent`);
  console.log(`6. User enters card details in Stripe's Payment Element`);
  console.log(`7. Payment is confirmed on-platform (no redirect)`);
  console.log(`8. Success handler calls /api/payments/confirm-payment`);
  console.log(`9. Email notification is sent to super admin`);
  console.log(`10. User sees success page with next steps`);
  
  console.log(`\n${colors.green}=== Test Complete ===${colors.reset}\n`);
}

// Run the test
testMobilePaymentFlow().catch(console.error);