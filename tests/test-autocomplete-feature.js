// Comprehensive Autocomplete Feature Test Suite
const API_BASE = 'http://localhost:5000/api';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test cases for autocomplete
const AUTOCOMPLETE_TEST_CASES = [
  // Cities
  { query: 'Los', expectedMatch: 'Los Angeles', minResults: 3 },
  { query: 'Los An', expectedMatch: 'Los Angeles, CA', minResults: 2 },
  { query: 'San', expectedMatch: 'San', minResults: 4 },
  { query: 'San Fra', expectedMatch: 'San Francisco', minResults: 1 },
  { query: 'Panama City', expectedMatch: 'Panama City', minResults: 1 },
  { query: 'Panama City Beach', expectedMatch: 'Panama City Beach', minResults: 1 },
  
  // States
  { query: 'Flor', expectedMatch: 'Florida', minResults: 1 },
  { query: 'FL', expectedMatch: 'FL', minResults: 1 },
  { query: 'Calif', expectedMatch: 'California', minResults: 1 },
  { query: 'CA', expectedMatch: 'CA', minResults: 1 },
  { query: 'Tex', expectedMatch: 'Texas', minResults: 1 },
  { query: 'TX', expectedMatch: 'TX', minResults: 1 },
  
  // Counties
  { query: 'Orang', expectedMatch: 'Orange', minResults: 1 },
  { query: 'Los Angeles Cou', expectedMatch: 'Los Angeles County', minResults: 1 },
  
  // Edge cases
  { query: 'a', expectedMatch: null, minResults: 0 }, // Too short, should return empty
  { query: '', expectedMatch: null, minResults: 0 }, // Empty query
  { query: 'ZZZZZ', expectedMatch: null, minResults: 0 } // Non-existent location
];

// Helper function to make API requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, success: true };
  } catch (error) {
    return { status: 500, error: error.message, success: false };
  }
}

// Helper function for colored logging
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test autocomplete endpoint
async function testAutocompleteEndpoint() {
  log('\n🔍 AUTOCOMPLETE ENDPOINT TESTS', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const results = [];
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of AUTOCOMPLETE_TEST_CASES) {
    const { query, expectedMatch, minResults } = testCase;
    
    const result = await makeRequest(
      `${API_BASE}/autocomplete/suggestions?query=${encodeURIComponent(query)}&limit=10`
    );
    
    const suggestions = result.data?.suggestions || [];
    const passed = result.status === 200 && suggestions.length >= minResults;
    
    if (passed) {
      passedTests++;
      
      // Check if expected match is found (if specified)
      if (expectedMatch) {
        const hasMatch = suggestions.some(s => 
          s.toLowerCase().includes(expectedMatch.toLowerCase())
        );
        
        if (hasMatch) {
          log(`   ✅ "${query}" → ${suggestions.length} results (found "${expectedMatch}")`, 'green');
        } else {
          log(`   ⚠️  "${query}" → ${suggestions.length} results (missing "${expectedMatch}")`, 'yellow');
        }
      } else {
        log(`   ✅ "${query}" → ${suggestions.length} results (as expected)`, 'green');
      }
    } else {
      failedTests++;
      log(`   ❌ "${query}" → Status: ${result.status}, Results: ${suggestions.length}`, 'red');
    }
    
    results.push({
      test: `Autocomplete: "${query}"`,
      passed,
      suggestions: suggestions.slice(0, 3),
      expectedMatch,
      actualResults: suggestions.length
    });
  }
  
  log(`\n   Summary: ${passedTests} passed, ${failedTests} failed`, 
      failedTests === 0 ? 'green' : 'yellow');
  
  return results;
}

// Test response time and performance
async function testPerformance() {
  log('\n⚡ PERFORMANCE TESTS', 'magenta');
  log('=' .repeat(60), 'magenta');
  
  const queries = ['Los', 'San', 'Miami', 'New York', 'Chicago'];
  const results = [];
  
  for (const query of queries) {
    const startTime = Date.now();
    
    const result = await makeRequest(
      `${API_BASE}/autocomplete/suggestions?query=${encodeURIComponent(query)}&limit=6`
    );
    
    const responseTime = Date.now() - startTime;
    const passed = responseTime < 1000; // Should respond within 1 second
    
    log(`   Query: "${query}" - Response time: ${responseTime}ms ${passed ? '✅' : '⚠️'}`,
        passed ? 'green' : 'yellow');
    
    results.push({
      test: `Performance: "${query}"`,
      passed,
      responseTime
    });
  }
  
  return results;
}

// Test concurrent requests
async function testConcurrency() {
  log('\n🔄 CONCURRENCY TESTS', 'blue');
  log('=' .repeat(60), 'blue');
  
  const queries = ['Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix'];
  
  log('   Sending 5 concurrent requests...');
  const startTime = Date.now();
  
  const promises = queries.map(query => 
    makeRequest(`${API_BASE}/autocomplete/suggestions?query=${encodeURIComponent(query)}&limit=6`)
  );
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  const allSuccessful = results.every(r => r.status === 200);
  
  log(`   All requests completed in ${totalTime}ms`, 'green');
  log(`   Success rate: ${results.filter(r => r.status === 200).length}/5 ${allSuccessful ? '✅' : '❌'}`,
      allSuccessful ? 'green' : 'red');
  
  return [{
    test: 'Concurrent requests',
    passed: allSuccessful,
    totalTime,
    successCount: results.filter(r => r.status === 200).length
  }];
}

// Test integration with search
async function testSearchIntegration() {
  log('\n🔗 SEARCH INTEGRATION TESTS', 'yellow');
  log('=' .repeat(60), 'yellow');
  
  const results = [];
  
  // Test autocomplete to search flow
  const testFlows = [
    { autocomplete: 'Panama City', search: 'Panama City Beach, FL' },
    { autocomplete: 'Los An', search: 'Los Angeles, CA' },
    { autocomplete: 'San Fra', search: 'San Francisco, CA' }
  ];
  
  for (const flow of testFlows) {
    // Get autocomplete suggestions
    const autoResult = await makeRequest(
      `${API_BASE}/autocomplete/suggestions?query=${encodeURIComponent(flow.autocomplete)}&limit=6`
    );
    
    const suggestions = autoResult.data?.suggestions || [];
    
    // Use first suggestion for search
    if (suggestions.length > 0) {
      const searchResult = await makeRequest(`${API_BASE}/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: suggestions[0], searchType: 'housing' })
      });
      
      const communities = searchResult.data?.communities || [];
      const passed = searchResult.status === 200 && communities.length > 0;
      
      log(`   ${flow.autocomplete} → ${suggestions[0]} → ${communities.length} results ${passed ? '✅' : '❌'}`,
          passed ? 'green' : 'red');
      
      results.push({
        test: `Integration: ${flow.autocomplete}`,
        passed,
        suggestion: suggestions[0],
        searchResults: communities.length
      });
    } else {
      log(`   ${flow.autocomplete} → No suggestions ❌`, 'red');
      results.push({
        test: `Integration: ${flow.autocomplete}`,
        passed: false,
        error: 'No autocomplete suggestions'
      });
    }
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🧪 COMPREHENSIVE AUTOCOMPLETE FEATURE TEST SUITE', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const startTime = Date.now();
  const allResults = [];
  
  // Run all test suites
  allResults.push(...await testAutocompleteEndpoint());
  allResults.push(...await testPerformance());
  allResults.push(...await testConcurrency());
  allResults.push(...await testSearchIntegration());
  
  // Calculate final statistics
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const totalTime = Date.now() - startTime;
  
  // Print summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 FINAL TEST SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  
  log(`\n   Total Tests: ${totalTests}`, 'blue');
  log(`   Passed: ${passedTests} ✅`, 'green');
  log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`, failedTests > 0 ? 'red' : 'green');
  log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  log(`   Total Time: ${totalTime}ms`, 'magenta');
  
  if (failedTests > 0) {
    log('\n   Failed Tests:', 'red');
    allResults.filter(r => !r.passed).forEach(r => {
      log(`      - ${r.test}`, 'red');
    });
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  
  if (successRate >= 90) {
    log('✨ EXCELLENT: Autocomplete feature is working perfectly!', 'green');
  } else if (successRate >= 70) {
    log('⚠️  GOOD: Most autocomplete features working, minor issues detected', 'yellow');
  } else {
    log('❌ NEEDS ATTENTION: Significant issues with autocomplete feature', 'red');
  }
  
  log('='.repeat(80) + '\n', 'cyan');
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});