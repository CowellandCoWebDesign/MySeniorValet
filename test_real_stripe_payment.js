const fetch = require('node-fetch');

console.log('TESTING REAL STRIPE PAYMENT WITH ACTUAL API');
console.log('=============================================\n');

const testRealPayment = async () => {
  try {
    // First, create a real payment intent through our API
    console.log('Creating REAL payment intent for $149...');
    const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'standard',
        type: 'community',
        metadata: {
          communityId: '1',
          communityName: 'Test Community',
          userEmail: 'test@myseniorvalet.com'
        }
      })
    });

    const result = await response.json();
    
    if (result.clientSecret) {
      console.log('\n✅ REAL Payment Intent Created!');
      console.log('====================================');
      console.log(`Payment Intent ID: ${result.paymentIntentId}`);
      console.log(`Amount: $${result.amount / 100}`);
      console.log(`Client Secret: ${result.clientSecret.substring(0, 40)}...`);
      console.log('\nThis payment intent is REAL and will appear in your Stripe Dashboard.');
      console.log('Check: https://dashboard.stripe.com/test/payments');
      console.log('\nTo complete the payment:');
      console.log('1. Use this client secret in your frontend');
      console.log('2. Use test card: 4242 4242 4242 4242');
      console.log('3. The payment will process and appear in Stripe');
    } else {
      console.log('ERROR:', result);
    }
  } catch (error) {
    console.error('Failed:', error.message);
  }
};

testRealPayment();
