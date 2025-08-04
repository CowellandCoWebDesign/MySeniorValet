#!/usr/bin/env tsx

import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil'
});

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function testPaymentEmailFlow() {
  console.log('🧪 TESTING PAYMENT EMAIL FLOW\n');
  
  // Step 1: Test SendGrid connection
  console.log('📧 Testing SendGrid email service...');
  try {
    const testMsg = {
      to: 'william.cowell01@gmail.com',
      from: 'hello@myseniorvalet.com',
      subject: '🧪 MySeniorValet Payment System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment System Test Email</h2>
          <p>This is a test email to verify that the payment notification system is working.</p>
          <p>If you receive this email, it means:</p>
          <ul>
            <li>✅ SendGrid API is properly configured</li>
            <li>✅ Email sending functionality is working</li>
            <li>✅ Your email address is correctly set as admin</li>
          </ul>
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    };
    
    await sgMail.send(testMsg);
    console.log('✅ Test email sent successfully to william.cowell01@gmail.com');
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
  }
  
  // Step 2: Simulate webhook event
  console.log('\n🔔 Simulating Stripe webhook event...');
  
  const webhookPayload = {
    id: 'evt_test_webhook',
    object: 'event',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_' + Date.now(),
        object: 'subscription',
        customer: 'cus_test_123',
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        items: {
          data: [{
            price: {
              product: 'prod_test',
              unit_amount: 14900, // $149
              currency: 'usd'
            }
          }]
        },
        metadata: {
          community_id: '1',
          tier_name: 'Standard',
          customer_email: 'william.cowell01@gmail.com'
        }
      }
    }
  };
  
  // Step 3: Test webhook endpoint
  console.log('🚀 Sending test webhook to local server...');
  
  try {
    const response = await fetch('http://localhost:5000/api/webhooks/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log(`📨 Webhook response: ${response.status} ${response.statusText}`);
    const responseData = await response.json();
    console.log('Response data:', responseData);
  } catch (error: any) {
    console.error('❌ Webhook test failed:', error.message);
  }
  
  // Step 4: Create real webhook endpoint in Stripe
  console.log('\n🔧 Checking Stripe webhook configuration...');
  
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    console.log(`📋 Found ${webhooks.data.length} webhook endpoints:`);
    
    webhooks.data.forEach(webhook => {
      console.log(`  - ${webhook.url} (${webhook.status})`);
      console.log(`    Events: ${webhook.enabled_events.slice(0, 3).join(', ')}...`);
    });
    
    // Check if correct webhook exists
    const correctUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/webhooks/webhook`
      : 'http://localhost:5000/api/webhooks/webhook';
      
    console.log(`\n🎯 Expected webhook URL: ${correctUrl}`);
    
  } catch (error: any) {
    console.error('❌ Failed to check webhooks:', error.message);
  }
  
  console.log('\n✅ Test completed!');
  console.log('📧 Check william.cowell01@gmail.com for test emails');
  console.log('\n💡 To fix webhook issues:');
  console.log('   1. Update Stripe webhook URL to match your handler');
  console.log('   2. Or create a handler at the URL Stripe expects');
  console.log('   3. Ensure STRIPE_WEBHOOK_SECRET matches Stripe dashboard');
}

testPaymentEmailFlow().catch(console.error);