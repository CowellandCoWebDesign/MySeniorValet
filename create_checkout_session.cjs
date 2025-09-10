const fetch = require('node-fetch');

console.log('\n📋 CREATING STRIPE CHECKOUT SESSION');
console.log('This will create a hosted payment page\n');

const createCheckout = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'standard',
        type: 'community',
        successUrl: 'http://localhost:5000/payment-success',
        cancelUrl: 'http://localhost:5000/pricing',
        metadata: {
          communityId: '1',
          communityName: 'Test Community - Real Payment',
          userEmail: 'william.cowell01@gmail.com'
        }
      })
    });

    const data = await response.json();
    
    if (data.sessionId) {
      console.log('✅ CHECKOUT SESSION CREATED!\n');
      console.log('Session ID:', data.sessionId);
      console.log('Checkout URL:', data.url);
      console.log('\n🔗 OPEN THIS URL TO SEE YOUR PAYMENT PAGE:');
      console.log(data.url);
      console.log('\nThis is a REAL Stripe checkout page.');
      console.log('It will process a test payment that shows in your dashboard.');
    } else {
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('Failed:', error.message);
  }
};

createCheckout();
