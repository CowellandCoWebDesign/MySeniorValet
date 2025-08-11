import { MessagingSystemTester } from './test-messaging-system';

async function runTests() {
  console.log('\n🚀 RUNNING COMPREHENSIVE MESSAGING SYSTEM TESTS\n');
  console.log('=' .repeat(60));
  
  const tester = new MessagingSystemTester();
  const results = await tester.runAllTests();
  
  // Exit with appropriate code
  const failed = results.filter(r => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});