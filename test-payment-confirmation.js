#!/usr/bin/env node

// Test payment confirmation endpoints
async function testPaymentConfirmation() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Testing Payment Confirmation Endpoints...\n');
  
  // Test 1: Vendor Payment Confirmation
  console.log('1. Testing Vendor Payment Confirmation...');
  try {
    const vendorResponse = await fetch(`${baseUrl}/api/payments/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId: 'pi_test_vendor_' + Date.now(),
        productId: 'basic-listing',
        vendorData: {
          businessName: 'Test Vendor ' + Date.now(),
          contactName: 'John Doe',
          email: 'test' + Date.now() + '@example.com',
          phone: '555-1234',
          businessType: 'Home Care',
          description: 'Test vendor for payment confirmation',
          serviceAreas: 'Test City'
        }
      })
    });
    
    const vendorResult = await vendorResponse.json();
    console.log('Vendor Response:', vendorResponse.status, vendorResult);
    
    if (vendorResponse.ok) {
      console.log('✅ Vendor payment confirmation working');
    } else {
      console.log('❌ Vendor payment confirmation failed:', vendorResult.error);
    }
  } catch (error) {
    console.log('❌ Vendor test failed:', error.message);
  }
  
  console.log('\n2. Testing Community Payment Confirmation...');
  try {
    const communityResponse = await fetch(`${baseUrl}/api/payments/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId: 'pi_test_community_' + Date.now(),
        productId: 'standard',
        communityId: '1' // Test with community ID 1
      })
    });
    
    const communityResult = await communityResponse.json();
    console.log('Community Response:', communityResponse.status, communityResult);
    
    if (communityResponse.ok) {
      console.log('✅ Community payment confirmation working');
    } else {
      console.log('❌ Community payment confirmation failed:', communityResult.error);
    }
  } catch (error) {
    console.log('❌ Community test failed:', error.message);
  }
  
  console.log('\n3. Testing Payment Intent Creation...');
  try {
    const intentResponse = await fetch(`${baseUrl}/api/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'test-product',
        amount: 5000, // $50.00
        metadata: {
          test: 'true'
        }
      })
    });
    
    const intentResult = await intentResponse.json();
    console.log('Payment Intent Response:', intentResponse.status);
    
    if (intentResponse.ok && intentResult.clientSecret) {
      console.log('✅ Payment intent creation working');
      console.log('Client Secret:', intentResult.clientSecret.substring(0, 20) + '...');
    } else {
      console.log('❌ Payment intent creation failed:', intentResult.error);
    }
  } catch (error) {
    console.log('❌ Payment intent test failed:', error.message);
  }
  
  console.log('\n✅ Payment confirmation tests complete!');
}

// Run the test
testPaymentConfirmation();