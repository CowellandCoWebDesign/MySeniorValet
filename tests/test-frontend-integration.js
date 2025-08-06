// Frontend Integration Test Suite
// Tests that frontend components properly connect to autocomplete API

const API_BASE = 'http://localhost:5000/api';

// ANSI colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test critical location searches that users commonly perform
async function testCriticalLocationSearches() {
  log('\n🌍 CRITICAL LOCATION SEARCH TESTS', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const criticalLocations = [
    { 
      query: 'Panama City Beach',
      expectedSuggestion: 'Panama City Beach, FL',
      expectedState: 'FL',
      description: 'Panama City Beach filtering'
    },
    {
      query: 'Los Angeles',
      expectedSuggestion: 'Los Angeles, CA',
      expectedState: 'CA',
      description: 'Major city search'
    },
    {
      query: 'Miami',
      expectedSuggestion: 'Miami, FL',
      expectedState: 'FL',
      description: 'Florida city search'
    },
    {
      query: 'Sacramento',
      expectedSuggestion: 'Sacramento, CA',
      expectedState: 'CA',
      description: 'California capital'
    },
    {
      query: 'Houston',
      expectedSuggestion: 'Houston, TX',
      expectedState: 'TX',
      description: 'Texas major city'
    }
  ];
  
  const results = [];
  
  for (const location of criticalLocations) {
    // Test autocomplete
    const autoResponse = await fetch(
      `${API_BASE}/autocomplete/suggestions?query=${encodeURIComponent(location.query)}&limit=6`
    );
    const autoData = await autoResponse.json();
    const suggestions = autoData.suggestions || [];
    
    // Check if expected suggestion is in results
    const hasExpected = suggestions.some(s => 
      s.includes(location.expectedSuggestion) || 
      s.includes(location.expectedState)
    );
    
    // Test search with first suggestion
    let searchResults = 0;
    let correctState = false;
    
    if (suggestions.length > 0) {
      const searchResponse = await fetch(`${API_BASE}/ai/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: suggestions[0], 
          searchType: 'housing' 
        })
      });
      
      const searchData = await searchResponse.json();
      const communities = searchData.communities || [];
      searchResults = communities.length;
      
      // Check if results are from correct state
      if (communities.length > 0) {
        correctState = communities.some(c => 
          c.state === location.expectedState
        );
      }
    }
    
    const passed = hasExpected && searchResults > 0 && correctState;
    
    log(`   ${location.description}: ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
    log(`      Query: "${location.query}" → ${suggestions.length} suggestions`);
    log(`      Expected: "${location.expectedSuggestion}" ${hasExpected ? '✓' : '✗'}`);
    log(`      Search results: ${searchResults} communities ${correctState ? `in ${location.expectedState}` : ''}`);
    
    results.push({ test: location.description, passed });
  }
  
  return results;
}

// Test edge cases and special characters
async function testEdgeCases() {
  log('\n⚠️  EDGE CASE TESTS', 'yellow');
  log('=' .repeat(60), 'yellow');
  
  const edgeCases = [
    { query: '', expected: 0, description: 'Empty query' },
    { query: 'a', expected: 0, description: 'Single character' },
    { query: 'Los Angeles, CA', expected: 'any', description: 'Full city-state format' },
    { query: 'St. Louis', expected: 'any', description: 'City with period' },
    { query: "O'Fallon", expected: 'any', description: 'City with apostrophe' },
    { query: '12345', expected: 'any', description: 'ZIP code' },
    { query: 'XXXNONEXISTENTXXX', expected: 0, description: 'Non-existent location' }
  ];
  
  const results = [];
  
  for (const testCase of edgeCases) {
    const response = await fetch(
      `${API_BASE}/autocomplete/suggestions?query=${encodeURIComponent(testCase.query)}&limit=6`
    );
    const data = await response.json();
    const suggestions = data.suggestions || [];
    
    let passed = false;
    if (testCase.expected === 'any') {
      passed = response.status === 200;
    } else {
      passed = suggestions.length === testCase.expected;
    }
    
    log(`   ${testCase.description}: ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
    log(`      Query: "${testCase.query}" → ${suggestions.length} results`);
    
    results.push({ test: testCase.description, passed });
  }
  
  return results;
}

// Test that Perfect Match integration still works
async function testPerfectMatchIntegration() {
  log('\n🎯 PERFECT MATCH INTEGRATION', 'blue');
  log('=' .repeat(60), 'blue');
  
  const testCases = [
    {
      location: 'Panama City Beach, FL',
      careNeeds: ['Assisted Living'],
      budget: { min: 2000, max: 4000 },
      description: 'Panama City Beach with filters'
    },
    {
      location: 'Los Angeles, CA',
      careNeeds: ['Memory Care'],
      budget: { min: 4000, max: 6000 },
      description: 'LA with Memory Care'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const response = await fetch(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: testCase.location,
        careNeeds: testCase.careNeeds,
        budget: testCase.budget
      })
    });
    
    const data = await response.json();
    const recommendations = data.recommendations || [];
    const passed = response.status === 200 && recommendations.length > 0;
    
    log(`   ${testCase.description}: ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
    log(`      Found ${recommendations.length} recommendations`);
    
    if (recommendations.length > 0) {
      const first = recommendations[0].community;
      log(`      Top match: ${first.name} in ${first.city}, ${first.state}`);
    }
    
    results.push({ test: testCase.description, passed });
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔌 FRONTEND INTEGRATION TEST SUITE', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const startTime = Date.now();
  const allResults = [];
  
  // Run all test suites
  allResults.push(...await testCriticalLocationSearches());
  allResults.push(...await testEdgeCases());
  allResults.push(...await testPerfectMatchIntegration());
  
  // Calculate statistics
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const totalTime = Date.now() - startTime;
  
  // Print summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 INTEGRATION TEST SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  
  log(`\n   Total Tests: ${totalTests}`, 'blue');
  log(`   Passed: ${passedTests} ✅`, 'green');
  log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`, failedTests > 0 ? 'red' : 'green');
  log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  log(`   Total Time: ${totalTime}ms`, 'blue');
  
  if (failedTests > 0) {
    log('\n   Failed Tests:', 'red');
    allResults.filter(r => !r.passed).forEach(r => {
      log(`      - ${r.test}`, 'red');
    });
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  
  if (successRate >= 95) {
    log('🎉 PERFECT: Frontend integration is flawless!', 'green');
  } else if (successRate >= 90) {
    log('✅ EXCELLENT: Frontend integration working great!', 'green');
  } else if (successRate >= 80) {
    log('⚠️  GOOD: Most features integrated, minor issues', 'yellow');
  } else {
    log('❌ NEEDS WORK: Integration issues detected', 'red');
  }
  
  log('='.repeat(80) + '\n', 'cyan');
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});