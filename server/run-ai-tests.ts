// Test Runner for AI Map Intelligence
import { runAIMapIntelligenceTests } from './test-ai-map-intelligence';

console.log('🚀 Starting AI Map Intelligence Test Suite...\n');

runAIMapIntelligenceTests()
  .then(report => {
    console.log('\n📊 Final Test Summary:');
    console.log(`   Total Tests: ${report.total}`);
    console.log(`   Passed: ${report.passed}`);
    console.log(`   Failed: ${report.failed}`);
    console.log(`   Success Rate: ${report.successRate.toFixed(1)}%`);
    
    if (report.failed > 0) {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
    } else {
      console.log('\n✨ All tests passed successfully!');
    }
  })
  .catch(error => {
    console.error('\n❌ Test suite encountered an error:', error);
  });