#!/usr/bin/env node

/**
 * Automated Test Suite for Perfect Match & AutocompleteSearch Features
 * Tests API endpoints, data integrity, and error handling
 */

import assert from 'assert';

const BASE_URL = 'http://localhost:5000';
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function runTest(testName, testFn) {
  process.stdout.write(`Testing ${testName}... `);
  try {
    await testFn();
    console.log(`${colors.green}✓${colors.reset}`);
    testResults.passed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset}`);
    testResults.failed++;
    testResults.errors.push({
      test: testName,
      error: error.message,
      stack: error.stack
    });
  }
}

// Test 1: Basic API Health Check
async function testAPIHealth() {
  const response = await fetch(`${BASE_URL}/api/communities/count`);
  const data = await response.json();
  assert(response.ok, 'API should respond with 200');
  assert(data.count, 'Should return community count');
  assert(parseInt(data.count) > 0, 'Should have communities in database');
}

// Test 2: Perfect Match API with Valid Data
async function testPerfectMatchValid() {
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: ['Pet Friendly'],
      budget: { min: 2000, max: 6000 },
      location: 'CA',
      careNeeds: [],
      urgency: 'planning'
    })
  });
  
  const data = await response.json();
  assert(response.ok, 'Perfect Match API should respond with 200');
  assert(Array.isArray(data.recommendations), 'Should return recommendations array');
  assert(data.searchMetadata, 'Should include search metadata');
  assert(data.appliedFilters, 'Should include applied filters');
}

// Test 3: Perfect Match with Empty Location
async function testPerfectMatchNoLocation() {
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: [],
      budget: { min: 0, max: 10000 },
      location: '',
      careNeeds: [],
      urgency: 'planning'
    })
  });
  
  const data = await response.json();
  assert(response.ok, 'Should handle empty location gracefully');
  assert(data.hasOwnProperty('recommendations'), 'Should still return structure');
}

// Test 4: Perfect Match with Invalid Location
async function testPerfectMatchInvalidLocation() {
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: [],
      budget: { min: 2000, max: 5000 },
      location: 'InvalidCityXYZ123',
      careNeeds: [],
      urgency: 'planning'
    })
  });
  
  const data = await response.json();
  assert(response.ok, 'Should handle invalid location gracefully');
  assert(Array.isArray(data.recommendations), 'Should return empty recommendations');
  assert(data.recommendations.length === 0, 'Invalid location should return no results');
}

// Test 5: Autocomplete Search API
async function testAutocompleteAPI() {
  const response = await fetch(`${BASE_URL}/api/autocomplete?q=San`);
  const data = await response.json();
  
  assert(response.ok, 'Autocomplete API should respond with 200');
  assert(data.suggestions, 'Should have suggestions property');
  assert(Array.isArray(data.suggestions), 'Suggestions should be an array');
  
  if (data.suggestions && data.suggestions.length > 0) {
    const firstItem = data.suggestions[0];
    assert(firstItem.id, 'Each result should have an id');
    assert(firstItem.label, 'Each result should have a label');
    assert(firstItem.city, 'Each result should have a city');
    assert(firstItem.state, 'Each result should have a state');
  }
}

// Test 6: Autocomplete with Empty Query
async function testAutocompleteEmpty() {
  const response = await fetch(`${BASE_URL}/api/autocomplete?q=`);
  const data = await response.json();
  
  assert(response.ok, 'Should handle empty query');
  assert(data.suggestions, 'Should have suggestions property');
  assert(Array.isArray(data.suggestions), 'Suggestions should be an array');
  assert(data.suggestions.length === 0, 'Empty query should return no suggestions');
}

// Test 7: Perfect Match with Multiple Preferences
async function testPerfectMatchMultiplePreferences() {
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: ['Pet Friendly', 'Pool/Spa', 'Fitness Center'],
      budget: { min: 3000, max: 7000 },
      location: 'California',
      careNeeds: ['Independent Living'],
      urgency: 'immediate'
    })
  });
  
  const data = await response.json();
  assert(response.ok, 'Should handle multiple preferences');
  assert(data.appliedFilters.preferences.length === 3, 'Should preserve all preferences');
}

// Test 8: Perfect Match Budget Validation
async function testPerfectMatchBudgetValidation() {
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: [],
      budget: { min: 8000, max: 2000 }, // Invalid: min > max
      location: 'CA',
      careNeeds: [],
      urgency: 'planning'
    })
  });
  
  const data = await response.json();
  assert(response.ok, 'Should handle invalid budget range');
  // System should either fix or ignore invalid budget
}

// Test 9: Enhanced Search API
async function testEnhancedSearchAPI() {
  const response = await fetch(`${BASE_URL}/api/communities/search/enhanced?location=CA&limit=10`);
  const data = await response.json();
  
  assert(response.ok, 'Enhanced search API should respond with 200');
  assert(Array.isArray(data.communities), 'Should return communities array');
  assert(data.searchMetadata, 'Should include search metadata');
  
  if (data.communities.length > 0) {
    const firstCommunity = data.communities[0];
    assert(firstCommunity.id, 'Each community should have an id');
    assert(firstCommunity.displayPricing, 'Should include display pricing');
  }
}

// Test 10: Data Integrity Check
async function testDataIntegrity() {
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: [],
      budget: { min: 1000, max: 5000 },
      location: 'CA',
      careNeeds: [],
      urgency: 'planning'
    })
  });
  
  const data = await response.json();
  
  if (data.recommendations && data.recommendations.length > 0) {
    const firstRec = data.recommendations[0];
    assert(firstRec.community, 'Recommendation should have community data');
    assert(typeof firstRec.matchScore === 'number', 'Should have numeric match score');
    assert(Array.isArray(firstRec.matchReasons), 'Should have match reasons array');
    
    // Check data quality
    const community = firstRec.community;
    assert(!community.name?.includes('Sample'), 'Should not contain sample data');
    assert(!community.name?.includes('Test'), 'Should not contain test data');
    assert(community.state === 'CA', 'Should match requested state');
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 Running Automated Tests for Perfect Match & AutocompleteSearch\n');
  console.log('=' .repeat(60));
  
  // Check if server is running
  try {
    await fetch(BASE_URL);
  } catch (error) {
    console.error(`${colors.red}Error: Server is not running at ${BASE_URL}${colors.reset}`);
    process.exit(1);
  }
  
  // Run all tests
  await runTest('API Health Check', testAPIHealth);
  await runTest('Perfect Match - Valid Request', testPerfectMatchValid);
  await runTest('Perfect Match - No Location', testPerfectMatchNoLocation);
  await runTest('Perfect Match - Invalid Location', testPerfectMatchInvalidLocation);
  await runTest('Autocomplete API', testAutocompleteAPI);
  await runTest('Autocomplete - Empty Query', testAutocompleteEmpty);
  await runTest('Perfect Match - Multiple Preferences', testPerfectMatchMultiplePreferences);
  await runTest('Perfect Match - Budget Validation', testPerfectMatchBudgetValidation);
  await runTest('Enhanced Search API', testEnhancedSearchAPI);
  await runTest('Data Integrity Check', testDataIntegrity);
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Test Results:\n');
  console.log(`  ${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:\n');
    testResults.errors.forEach(error => {
      console.log(`  ${colors.yellow}${error.test}:${colors.reset}`);
      console.log(`    ${error.error}`);
    });
  }
  
  // Calculate score
  const totalTests = testResults.passed + testResults.failed;
  const score = Math.round((testResults.passed / totalTests) * 100);
  
  console.log('\n' + '=' .repeat(60));
  if (score === 100) {
    console.log(`\n${colors.green}🎉 All tests passed! Score: ${score}%${colors.reset}\n`);
  } else if (score >= 80) {
    console.log(`\n${colors.yellow}⚠️  Most tests passed. Score: ${score}%${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}❌ Multiple tests failed. Score: ${score}%${colors.reset}\n`);
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});