const crypto = require('crypto');
const http = require('http');

console.log('\n🔔 SIMULATING STRIPE WEBHOOK FOR PAYMENT SUCCESS\n');

// Simulate a Stripe webhook event
const webhookPayload = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  api_version: '2025-07-30.basil',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_simulated_' + Date.now(),
      object: 'checkout.session',
      amount_total: 14900,
      currency: 'usd',
      customer_email: 'william.cowell01@gmail.com',
      metadata: {
        tier: 'standard',
        type: 'community',
        communityId: '1',
        communityName: 'Test Community',
        userEmail: 'william.cowell01@gmail.com'
      },
      payment_status: 'paid',
      status: 'complete',
      success_url: 'https://myseniorvalet.com/success',
      subscription: 'sub_test_' + Date.now()
    }
  }
};

// Create webhook signature (normally done by Stripe)
const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
const payload = JSON.stringify(webhookPayload);
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(signedPayload, 'utf8')
  .digest('hex');

const signature = `t=${timestamp},v1=${expectedSignature}`;

// Send webhook to our endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/payments/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': signature
  }
};

const req = http.request(options, (res) => {
  console.log(`Webhook Response Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Webhook Response:', body);
    
    if (res.statusCode === 200) {
      console.log('\n✅ WEBHOOK PROCESSED SUCCESSFULLY!');
      console.log('This would trigger:');
      console.log('  • User tier upgrade to Standard');
      console.log('  • Email notification to william.cowell01@gmail.com');
      console.log('  • Dashboard update showing active subscription');
      console.log('  • Database record creation for subscription');
    }
  });
});

req.on('error', (e) => {
  console.error('Webhook Error:', e.message);
});

req.write(payload);
req.end();

console.log('Webhook Event Details:');
console.log('  Type:', webhookPayload.type);
console.log('  Amount: $' + (webhookPayload.data.object.amount_total / 100));
console.log('  Customer:', webhookPayload.data.object.customer_email);
console.log('  Tier:', webhookPayload.data.object.metadata.tier);
