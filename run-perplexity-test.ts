#!/usr/bin/env tsx
/**
 * Run Perplexity Intelligence Test Suite
 * Usage: npx tsx run-perplexity-test.ts
 */

import { PerplexityIntelligenceTestSuite } from './tests/perplexity-intelligence-test';

console.log('🔬 MySeniorValet - Perplexity Intelligence Test Runner');
console.log('Testing live web search quality on community details page\n');

async function runTest() {
  try {
    const tester = new PerplexityIntelligenceTestSuite();
    await tester.runTests();
    
    console.log('\n✅ All tests completed successfully');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();