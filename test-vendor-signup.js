// Test script for vendor signup functionality
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

// Test data for different plan types
const testVendors = [
  {
    businessName: 'Basic Healthcare Services',
    contactName: 'John Basic',
    email: 'basic@healthcare.com',
    phone: '555-0100',
    website: 'https://basic-healthcare.com',
    businessType: 'healthcare',
    description: 'Basic healthcare services for seniors',
    serviceAreas: 'California',
    planType: 'basic',
    amount: 49
  },
  {
    businessName: 'Professional Senior Transport',
    contactName: 'Jane Pro',
    email: 'pro@transport.com',
    phone: '555-0200',
    website: 'https://pro-transport.com',
    businessType: 'transportation',
    description: 'Professional transportation for seniors',
    serviceAreas: 'California, Nevada',
    planType: 'professional',
    amount: 149
  },
  {
    businessName: 'Enterprise Home Care Solutions',
    contactName: 'Bob Enterprise',
    email: 'enterprise@homecare.com',
    phone: '555-0300',
    website: 'https://enterprise-homecare.com',
    businessType: 'homecare',
    description: 'Complete home care solutions',
    serviceAreas: 'California, Nevada, Arizona',
    planType: 'enterprise',
    amount: 299
  }
];

async function testVendorSignup(vendor) {
  console.log(`\n🧪 Testing ${vendor.planType} plan signup for ${vendor.businessName}...`);
  
  try {
    const response = await fetch(`${API_URL}/api/vendor-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vendor)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      console.log(`   - Client Secret: ${data.clientSecret ? '✓ Received' : '✗ Missing'}`);
      console.log(`   - Subscription ID: ${data.subscriptionId || 'None'}`);
      console.log(`   - Customer ID: ${data.customerId || 'None'}`);
      
      if (data.clientSecret) {
        console.log('   - Ready for payment processing ✓');
      }
      
      return { success: true, data };
    } else {
      console.log(`❌ Signup failed: ${data.error || 'Unknown error'}`);
      console.log(`   - Message: ${data.message || 'No message'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testStatusCheck(email) {
  console.log(`\n🔍 Checking vendor status for ${email}...`);
  
  try {
    const response = await fetch(`${API_URL}/api/vendor-status/${email}`);
    const data = await response.json();
    
    if (response.ok) {
      if (data.exists) {
        console.log('✅ Vendor found in database');
        console.log(`   - Status: ${data.status}`);
        console.log(`   - Plan: ${data.planType}`);
        console.log(`   - Business: ${data.businessName}`);
      } else {
        console.log('ℹ️  Vendor not found (expected for new signups)');
      }
      return data;
    } else {
      console.log(`❌ Status check failed: ${data.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Vendor Signup Tests');
  console.log('================================\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  // Test each vendor plan
  for (const vendor of testVendors) {
    // Check if vendor already exists
    await testStatusCheck(vendor.email);
    
    // Test signup
    const result = await testVendorSignup(vendor);
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test with invalid data
  console.log('\n🧪 Testing with invalid data...');
  const invalidResult = await testVendorSignup({
    businessName: 'Invalid Test',
    // Missing required fields
  });
  
  if (!invalidResult.success) {
    console.log('✅ Correctly rejected invalid data');
    successCount++;
  } else {
    console.log('❌ Should have rejected invalid data');
    failureCount++;
  }
  
  // Summary
  console.log('\n================================');
  console.log('📊 Test Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📈 Total: ${successCount + failureCount}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 All tests passed! Vendor signup is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests().catch(console.error);