const fetch = require('node-fetch');

console.log('\n🔴 CREATING REAL STRIPE PAYMENT INTENT');
console.log('This will appear in your Stripe Dashboard immediately\n');

const createRealPayment = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'standard',
        type: 'community',
        metadata: {
          communityId: '1',
          communityName: 'Test Community',
          userEmail: 'william.cowell01@gmail.com'
        }
      })
    });

    const data = await response.json();
    
    if (data.clientSecret) {
      console.log('✅ REAL PAYMENT INTENT CREATED!\n');
      console.log('Payment Intent ID:', data.paymentIntentId);
      console.log('Amount: $' + (data.amount / 100));
      console.log('\n🔗 CHECK YOUR STRIPE DASHBOARD NOW:');
      console.log('https://dashboard.stripe.com/test/payments/' + data.paymentIntentId);
      console.log('\nThis payment intent is LIVE in your Stripe account.');
      console.log('Status: Requires payment method');
      console.log('\nTo complete the payment:');
      console.log('1. Use test card: 4242 4242 4242 4242');
      console.log('2. Expiry: Any future date');
      console.log('3. CVC: Any 3 digits');
      console.log('4. ZIP: Any 5 digits');
    } else {
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('Failed:', error.message);
  }
};

createRealPayment();
