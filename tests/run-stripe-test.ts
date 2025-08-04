import { runStripeIntegrationTests } from './stripe-integration.test';

// Run the integration tests
console.log('Starting Stripe Integration Tests...');
runStripeIntegrationTests().then(() => {
  console.log('✅ Tests completed');
}).catch((error) => {
  console.error('❌ Test failed:', error);
});