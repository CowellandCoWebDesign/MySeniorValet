// Simple test runner for Perfect Match features
const API_BASE = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test data
const TEST_LOCATIONS = [
  'Panama City Beach',
  'Panama City Beach, FL',
  'Los Angeles',
  'Los Angeles, CA', 
  'New York',
  'Sacramento',
  'Miami',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'FL',
  'CA'
];

const TEST_CARE_NEEDS = [
  [],
  ['Independent Living'],
  ['Assisted Living'],
  ['Memory Care'],
  ['Skilled Nursing'],
  ['Stay at Home'],
  ['HUD/Section 202'],
  ['55+ Mobile Home Park']
];

const TEST_BUDGETS = [
  { min: 0, max: 1000 },
  { min: 2000, max: 4000 },
  { min: 4000, max: 6000 },
  { min: 6000, max: 10000 }
];

// Helper functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, success: true };
  } catch (error) {
    return { status: 500, error: error.message, success: false };
  }
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Suite 1: Smart Search with Autocomplete
async function testSmartSearch() {
  log('\n📍 TEST SUITE 1: SMART SEARCH WITH AUTOCOMPLETE', 'blue');
  log('=' .repeat(60), 'blue');
  
  const results = [];
  
  // Test autocomplete
  log('\n1.1 Testing Autocomplete Suggestions:', 'yellow');
  const queries = ['Los An', 'New Y', 'Sacr', 'Panama City'];
  
  for (const query of queries) {
    const result = await makeRequest(`${API_BASE}/autocomplete?q=${encodeURIComponent(query)}`);
    const suggestions = result.data?.suggestions || [];
    
    log(`   Query: "${query}"`);
    log(`   Status: ${result.status} | Suggestions: ${suggestions.length}`);
    
    if (suggestions.length > 0) {
      log(`   Top match: ${suggestions[0].label}`, 'green');
    }
    
    results.push({
      test: `Autocomplete: ${query}`,
      passed: result.status === 200 && suggestions.length > 0
    });
  }
  
  // Test search execution
  log('\n1.2 Testing Search Execution:', 'yellow');
  const searchQueries = [
    { query: 'Los Angeles', type: 'housing' },
    { query: 'Panama City Beach', type: 'housing' },
    { query: 'Memory Care', type: 'housing' }
  ];
  
  for (const searchData of searchQueries) {
    const result = await makeRequest(`${API_BASE}/ai/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    });
    
    const communities = result.data?.communities || result.data?.results || [];
    
    log(`   Search: "${searchData.query}"`);
    log(`   Status: ${result.status} | Results: ${communities.length}`);
    
    if (communities.length > 0) {
      const first = communities[0];
      log(`   First: ${first.name} in ${first.city}, ${first.state}`, 'green');
    }
    
    results.push({
      test: `Search: ${searchData.query}`,
      passed: result.status === 200 && communities.length > 0
    });
  }
  
  return results;
}

// Test Suite 2: Perfect Match Recommendations
async function testPerfectMatch() {
  log('\n🎯 TEST SUITE 2: PERFECT MATCH RECOMMENDATIONS', 'blue');
  log('=' .repeat(60), 'blue');
  
  const results = [];
  
  // Test location matching
  log('\n2.1 Testing Location Matching:', 'yellow');
  
  for (const location of TEST_LOCATIONS.slice(0, 6)) {
    const result = await makeRequest(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        careNeeds: ['Assisted Living'],
        budget: { min: 2000, max: 5000 },
        preferences: [],
        urgency: 'planning'
      })
    });
    
    const recommendations = result.data?.recommendations || [];
    
    log(`   Location: "${location}"`);
    log(`   Status: ${result.status} | Matches: ${recommendations.length}`);
    
    if (recommendations.length > 0) {
      const first = recommendations[0];
      log(`   Top match: ${first.community.name} (${first.matchScore}%)`, 'green');
      log(`   Location: ${first.community.city}, ${first.community.state}`);
      
      // Special check for Panama City Beach
      if (location.toLowerCase().includes('panama city beach')) {
        const floridaResults = recommendations.filter(r => 
          r.community.state === 'FL' || r.community.state === 'Florida'
        );
        const passedPanama = floridaResults.length > 0;
        log(`   ✅ Florida results: ${floridaResults.length}/${recommendations.length}`, 
            passedPanama ? 'green' : 'red');
        
        results.push({
          test: `Panama City Beach -> Florida`,
          passed: passedPanama,
          critical: true
        });
      }
    }
    
    results.push({
      test: `Location: ${location}`,
      passed: result.status === 200
    });
  }
  
  // Test care needs filtering
  log('\n2.2 Testing Care Needs Filtering:', 'yellow');
  
  for (const careNeeds of TEST_CARE_NEEDS.slice(0, 4)) {
    const result = await makeRequest(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'California',
        careNeeds,
        budget: { min: 0, max: 10000 },
        preferences: [],
        urgency: 'planning'
      })
    });
    
    const recommendations = result.data?.recommendations || [];
    
    log(`   Care needs: [${careNeeds.join(', ') || 'None'}]`);
    log(`   Results: ${recommendations.length}`);
    
    results.push({
      test: `Care needs: ${careNeeds.join(', ') || 'None'}`,
      passed: result.status === 200
    });
  }
  
  // Test budget filtering
  log('\n2.3 Testing Budget Constraints:', 'yellow');
  
  for (const budget of TEST_BUDGETS) {
    const result = await makeRequest(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'Los Angeles',
        careNeeds: [],
        budget,
        preferences: [],
        urgency: 'immediate'
      })
    });
    
    const recommendations = result.data?.recommendations || [];
    
    log(`   Budget: $${budget.min}-$${budget.max}`);
    log(`   Results: ${recommendations.length}`);
    
    if (recommendations.length > 0 && budget.max > 0) {
      const withinBudget = recommendations.filter(r => {
        const price = r.community.rentPerMonth ? 
          parseFloat(r.community.rentPerMonth) : 
          r.community.priceRange?.min || 0;
        return price <= budget.max;
      });
      
      log(`   Within budget: ${withinBudget.length}/${recommendations.length}`);
    }
    
    results.push({
      test: `Budget: $${budget.min}-$${budget.max}`,
      passed: result.status === 200
    });
  }
  
  return results;
}

// Test Suite 3: AI Compare
async function testAICompare() {
  log('\n🆚 TEST SUITE 3: AI COMMUNITY COMPARISON', 'blue');
  log('=' .repeat(60), 'blue');
  
  const results = [];
  
  // First get some communities
  const searchResult = await makeRequest(`${API_BASE}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Los Angeles',
      searchType: 'housing'
    })
  });
  
  const communities = searchResult.data?.communities || searchResult.data?.results || [];
  
  if (communities.length >= 3) {
    const communityIds = communities.slice(0, 3).map(c => c.id);
    
    const compareResult = await makeRequest(`${API_BASE}/ai/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityIds })
    });
    
    log(`   Comparing ${communityIds.length} communities`);
    log(`   IDs: ${communityIds.join(', ')}`);
    log(`   Status: ${compareResult.status}`);
    
    results.push({
      test: 'AI Compare functionality',
      passed: compareResult.status === 200 || compareResult.status === 201
    });
  } else {
    log('   Not enough communities to compare', 'yellow');
    results.push({
      test: 'AI Compare functionality',
      passed: false,
      reason: 'Not enough communities'
    });
  }
  
  return results;
}

// Test Suite 4: Edge Cases
async function testEdgeCases() {
  log('\n⚠️ TEST SUITE 4: EDGE CASES & ERROR HANDLING', 'blue');
  log('=' .repeat(60), 'blue');
  
  const results = [];
  
  // Test invalid location
  const invalidLocation = await makeRequest(`${API_BASE}/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'XXXXXXXXXX Invalid City Name',
      careNeeds: ['Invalid Care Type'],
      budget: { min: 999999, max: 9999999 },
      preferences: [],
      urgency: 'planning'
    })
  });
  
  log(`   Invalid location test`);
  log(`   Status: ${invalidLocation.status}`);
  log(`   Handled gracefully: ${invalidLocation.status === 200 || invalidLocation.status === 400}`);
  
  results.push({
    test: 'Invalid location handling',
    passed: invalidLocation.status === 200 || invalidLocation.status === 400
  });
  
  // Test empty input
  const emptyInput = await makeRequest(`${API_BASE}/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: '',
      careNeeds: [],
      budget: { min: 0, max: 0 },
      preferences: [],
      urgency: ''
    })
  });
  
  log(`   Empty input test`);
  log(`   Status: ${emptyInput.status}`);
  
  results.push({
    test: 'Empty input handling',
    passed: emptyInput.status === 200 || emptyInput.status === 400
  });
  
  return results;
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(80), 'blue');
  log('🧪 PERFECT MATCH COMPREHENSIVE TESTING SUITE', 'blue');
  log('='.repeat(80), 'blue');
  log('\nTesting 3 main features:', 'yellow');
  log('1. Smart Search with Autocomplete');
  log('2. Perfect Match Recommendations');
  log('3. AI Community Comparison');
  log('\nStarting tests...\n');
  
  const allResults = [];
  
  // Run all test suites
  allResults.push(...await testSmartSearch());
  allResults.push(...await testPerfectMatch());
  allResults.push(...await testAICompare());
  allResults.push(...await testEdgeCases());
  
  // Generate summary
  log('\n' + '='.repeat(80), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('=' .repeat(80), 'blue');
  
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const critical = allResults.filter(r => r.critical && !r.passed);
  
  log(`\nTotal Tests: ${allResults.length}`);
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (critical.length > 0) {
    log('\n⚠️ CRITICAL FAILURES:', 'red');
    critical.forEach(r => {
      log(`   ❌ ${r.test}`, 'red');
    });
  }
  
  // Show failed tests
  if (failed > 0) {
    log('\nFailed Tests:', 'red');
    allResults.filter(r => !r.passed).forEach(r => {
      log(`   ❌ ${r.test}`, 'red');
      if (r.reason) log(`      Reason: ${r.reason}`, 'yellow');
    });
  }
  
  const successRate = ((passed / allResults.length) * 100).toFixed(1);
  log(`\n✅ Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  
  if (successRate >= 90) {
    log('\n🎉 Excellent! All major features are working correctly!', 'green');
  } else if (successRate >= 70) {
    log('\n⚠️ Most features working, but some issues need attention.', 'yellow');
  } else {
    log('\n❌ Significant issues detected. Review failed tests above.', 'red');
  }
}

// Run the tests
runAllTests().catch(error => {
  log('\n❌ Test runner error:', 'red');
  console.error(error);
});