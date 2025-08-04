#!/usr/bin/env tsx

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function testWebhookInDevMode() {
  console.log('🔧 TESTING WEBHOOK IN DEVELOPMENT MODE\n');
  
  // First, send a direct test email to confirm SendGrid is working
  console.log('📧 Sending direct test email...');
  try {
    await sgMail.send({
      to: 'william.cowell01@gmail.com',
      from: 'hello@myseniorvalet.com',
      subject: '🎉 Payment System Test - Webhook Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment System Webhook Test</h2>
          <p>This confirms that the email system is working!</p>
          <p>Now testing webhook processing...</p>
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    console.log('✅ Test email sent successfully!\n');
  } catch (error: any) {
    console.error('❌ Email failed:', error.message);
  }
  
  // Now test the webhook without signature (development mode)
  const webhookEvent = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        object: 'checkout.session',
        customer: 'cus_test_123',
        customer_email: 'william.cowell01@gmail.com',
        subscription: 'sub_test_' + Date.now(),
        payment_status: 'paid',
        status: 'complete',
        amount_total: 14900, // $149
        metadata: {
          community_id: '1',
          tier_name: 'Standard Community',
          product_id: 'community_standard'
        }
      }
    }
  };
  
  console.log('🚀 Sending webhook event (checkout.session.completed)...');
  console.log(`   Customer: william.cowell01@gmail.com`);
  console.log(`   Amount: $149`);
  console.log(`   Tier: Standard Community\n`);
  
  try {
    // Send directly to webhook handler without proxy
    const response = await fetch('http://localhost:5000/api/webhooks/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No stripe-signature header - should work in dev mode
      },
      body: JSON.stringify(webhookEvent)
    });
    
    const responseText = await response.text();
    console.log(`📨 Webhook response: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${responseText}\n`);
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully!');
      console.log('📧 Check william.cowell01@gmail.com for payment notification email');
    }
    
  } catch (error: any) {
    console.error('❌ Webhook test failed:', error.message);
  }
  
  // Test subscription created event
  console.log('\n🔔 Testing subscription.created event...');
  
  const subscriptionEvent = {
    id: 'evt_test_sub_' + Date.now(),
    object: 'event',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_' + Date.now(),
        object: 'subscription',
        customer: 'cus_test_456',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        items: {
          data: [{
            price: {
              unit_amount: 24900, // $249
              currency: 'usd'
            }
          }]
        },
        metadata: {
          vendor_id: '2',
          tier_name: 'Featured Vendor',
          customer_email: 'william.cowell01@gmail.com'
        }
      }
    }
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/webhooks/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionEvent)
    });
    
    const responseText = await response.text();
    console.log(`📨 Subscription webhook response: ${response.status}`);
    console.log(`   Response: ${responseText}\n`);
    
  } catch (error: any) {
    console.error('❌ Subscription webhook test failed:', error.message);
  }
  
  console.log('\n✅ WEBHOOK TESTING COMPLETE!');
  console.log('\n📧 If webhooks are working, you should receive:');
  console.log('   1. Test email (confirms SendGrid is working)');
  console.log('   2. Payment confirmation email for $149 community subscription');
  console.log('   3. Subscription created email for $249 vendor subscription');
  console.log('   4. Admin notifications for both transactions');
}

testWebhookInDevMode().catch(console.error);