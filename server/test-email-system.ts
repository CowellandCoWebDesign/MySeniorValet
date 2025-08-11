import { paymentNotificationService } from './services/payment-notification-service';
import { sendCommunityWelcomeEmail, sendVendorWelcomeEmail } from './services/tier-welcome-service';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL';
  message: string;
  error?: any;
}

const testResults: TestResult[] = [];

async function testEmailSystem() {
  console.log('\n🧪 Starting Email System Verification Tests...\n');
  console.log('================================================\n');

  // Test 1: Verify SendGrid API Key
  await testSendGridConnection();

  // Test 2: Test Payment Success Notification
  await testPaymentSuccessNotification();

  // Test 3: Test Payment Failed Notification
  await testPaymentFailedNotification();

  // Test 4: Test Subscription Cancelled Notification
  await testSubscriptionCancelledNotification();

  // Test 5: Test Community Welcome Email
  await testCommunityWelcomeEmail();

  // Test 6: Test Vendor Welcome Email
  await testVendorWelcomeEmail();

  // Print results
  printTestResults();
}

async function testSendGridConnection(): Promise<void> {
  const testName = 'SendGrid API Connection';
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }
    
    // Test connection by sending a test email
    const msg = {
      to: 'william.cowell01@gmail.com',
      from: 'hello@myseniorvalet.com',
      subject: '🧪 MySeniorValet Email System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email System Verification Test</h2>
          <p>This is a test email to verify the email notification system is working correctly.</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated test from MySeniorValet Email System.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    testResults.push({
      testName,
      status: 'PASS',
      message: 'SendGrid API connection successful'
    });
    console.log('✅ Test 1: SendGrid API Connection - PASSED');
  } catch (error: any) {
    testResults.push({
      testName,
      status: 'FAIL',
      message: `SendGrid connection failed: ${error.message}`,
      error
    });
    console.log(`❌ Test 1: SendGrid API Connection - FAILED: ${error.message}`);
  }
}

async function testPaymentSuccessNotification(): Promise<void> {
  const testName = 'Payment Success Notification';
  try {
    await paymentNotificationService.sendPaymentNotification({
      type: 'payment_successful',
      customerEmail: 'test@example.com',
      tierName: 'Featured Spotlight',
      amount: 249,
      subscriptionType: 'community',
      metadata: {
        communityId: 1,
        testMode: true
      }
    });

    testResults.push({
      testName,
      status: 'PASS',
      message: 'Payment success notification sent successfully'
    });
    console.log('✅ Test 2: Payment Success Notification - PASSED');
  } catch (error: any) {
    testResults.push({
      testName,
      status: 'FAIL',
      message: `Failed to send payment success notification: ${error.message}`,
      error
    });
    console.log(`❌ Test 2: Payment Success Notification - FAILED: ${error.message}`);
  }
}

async function testPaymentFailedNotification(): Promise<void> {
  const testName = 'Payment Failed Notification';
  try {
    await paymentNotificationService.sendPaymentNotification({
      type: 'payment_failed',
      customerEmail: 'test@example.com',
      tierName: 'Platinum Partner',
      amount: 349,
      subscriptionType: 'community',
      metadata: {
        communityId: 2,
        attemptCount: 3,
        testMode: true
      }
    });

    testResults.push({
      testName,
      status: 'PASS',
      message: 'Payment failed notification sent successfully'
    });
    console.log('✅ Test 3: Payment Failed Notification - PASSED');
  } catch (error: any) {
    testResults.push({
      testName,
      status: 'FAIL',
      message: `Failed to send payment failed notification: ${error.message}`,
      error
    });
    console.log(`❌ Test 3: Payment Failed Notification - FAILED: ${error.message}`);
  }
}

async function testSubscriptionCancelledNotification(): Promise<void> {
  const testName = 'Subscription Cancelled Notification';
  try {
    await paymentNotificationService.sendPaymentNotification({
      type: 'subscription_cancelled',
      customerEmail: 'test@example.com',
      tierName: 'Standard Listing',
      amount: 0,
      subscriptionType: 'community',
      metadata: {
        communityId: 3,
        cancelledAt: new Date().toISOString(),
        gracePerioEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        testMode: true
      }
    });

    testResults.push({
      testName,
      status: 'PASS',
      message: 'Subscription cancelled notification sent successfully'
    });
    console.log('✅ Test 4: Subscription Cancelled Notification - PASSED');
  } catch (error: any) {
    testResults.push({
      testName,
      status: 'FAIL',
      message: `Failed to send subscription cancelled notification: ${error.message}`,
      error
    });
    console.log(`❌ Test 4: Subscription Cancelled Notification - FAILED: ${error.message}`);
  }
}

async function testCommunityWelcomeEmail(): Promise<void> {
  const testName = 'Community Welcome Email';
  try {
    await sendCommunityWelcomeEmail(
      1, // communityId
      'featured', // tierKey
      'test@example.com' // email
    );

    testResults.push({
      testName,
      status: 'PASS',
      message: 'Community welcome email sent successfully'
    });
    console.log('✅ Test 5: Community Welcome Email - PASSED');
  } catch (error: any) {
    testResults.push({
      testName,
      status: 'FAIL',
      message: `Failed to send community welcome email: ${error.message}`,
      error
    });
    console.log(`❌ Test 5: Community Welcome Email - FAILED: ${error.message}`);
  }
}

async function testVendorWelcomeEmail(): Promise<void> {
  const testName = 'Vendor Welcome Email';
  try {
    await sendVendorWelcomeEmail(
      1, // vendorId
      'featured', // tierKey
      'vendor@example.com' // email
    );

    testResults.push({
      testName,
      status: 'PASS',
      message: 'Vendor welcome email sent successfully'
    });
    console.log('✅ Test 6: Vendor Welcome Email - PASSED');
  } catch (error: any) {
    testResults.push({
      testName,
      status: 'FAIL',
      message: `Failed to send vendor welcome email: ${error.message}`,
      error
    });
    console.log(`❌ Test 6: Vendor Welcome Email - FAILED: ${error.message}`);
  }
}

function printTestResults(): void {
  console.log('\n================================================');
  console.log('📊 EMAIL SYSTEM VERIFICATION TEST RESULTS\n');
  
  const passedTests = testResults.filter(r => r.status === 'PASS').length;
  const failedTests = testResults.filter(r => r.status === 'FAIL').length;
  const totalTests = testResults.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Pass Rate: ${passRate}%\n`);
  
  console.log('Detailed Results:');
  console.log('----------------');
  testResults.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.testName}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);
    if (result.error) {
      console.log(`   Error Details: ${JSON.stringify(result.error, null, 2)}`);
    }
    console.log('');
  });
  
  if (failedTests === 0) {
    console.log('🎉 SUCCESS: All email notification tests passed!');
    console.log('✨ The email system is fully operational and ready for production.');
  } else {
    console.log('⚠️  WARNING: Some tests failed. Please review the errors above.');
    console.log('📝 Common issues:');
    console.log('   - Missing SENDGRID_API_KEY environment variable');
    console.log('   - Invalid SendGrid API key');
    console.log('   - Network connectivity issues');
    console.log('   - Invalid email addresses in configuration');
  }
  
  console.log('\n================================================\n');
}

// Run the tests
testEmailSystem().catch(error => {
  console.error('❌ Fatal error running email system tests:', error);
  process.exit(1);
});