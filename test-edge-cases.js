#!/usr/bin/env node

/**
 * Edge Case & Stress Testing for MySeniorValet Platform
 * Tests boundary conditions, performance, and error handling
 */

import assert from 'assert';

const BASE_URL = 'http://localhost:5000';
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  performance: []
};

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function runTest(testName, testFn) {
  process.stdout.write(`Testing ${testName}... `);
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`${colors.green}✓${colors.reset} (${duration}ms)`);
    testResults.passed++;
    testResults.performance.push({ test: testName, duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`${colors.red}✗${colors.reset} (${duration}ms)`);
    testResults.failed++;
    testResults.errors.push({
      test: testName,
      error: error.message,
      duration
    });
  }
}

// Edge Case 1: SQL Injection Prevention
async function testSQLInjectionPrevention() {
  const maliciousQueries = [
    "'; DROP TABLE communities; --",
    "1' OR '1'='1",
    "admin'--",
    "<script>alert('XSS')</script>"
  ];
  
  for (const query of maliciousQueries) {
    const response = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(query)}`);
    assert(response.ok, `Should handle malicious input: ${query}`);
    const data = await response.json();
    assert(data.suggestions, 'Should return valid structure despite malicious input');
  }
}

// Edge Case 2: Special Characters in Search
async function testSpecialCharacters() {
  const specialInputs = [
    "San José",
    "O'Brien",
    "50+",
    "Saint-Laurent",
    "Montréal",
    "#1 Community",
    "100% Senior Care"
  ];
  
  for (const input of specialInputs) {
    const response = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(input)}`);
    assert(response.ok, `Should handle special characters: ${input}`);
  }
}

// Edge Case 3: Extreme Budget Values
async function testExtremeBudgetValues() {
  const extremeBudgets = [
    { min: -1000, max: 5000 },  // Negative min
    { min: 0, max: 0 },          // Zero budget
    { min: 999999, max: 9999999 }, // Very high budget
    { min: 5000, max: 1000 },    // Min > Max
    { min: null, max: null }     // Null values
  ];
  
  for (const budget of extremeBudgets) {
    const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferences: [],
        budget,
        location: 'CA',
        careNeeds: [],
        urgency: 'planning'
      })
    });
    
    assert(response.ok, `Should handle extreme budget: ${JSON.stringify(budget)}`);
    const data = await response.json();
    assert(data.hasOwnProperty('recommendations'), 'Should return valid structure');
  }
}

// Edge Case 4: Very Long Search Queries
async function testLongQueries() {
  const longQuery = 'A'.repeat(500); // 500 character query
  const response = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(longQuery)}`);
  assert(response.ok, 'Should handle very long queries');
  
  const veryLongQuery = 'B'.repeat(10000); // 10,000 character query
  const response2 = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(veryLongQuery)}`);
  assert(response2.ok, 'Should handle extremely long queries without crashing');
}

// Edge Case 5: Unicode and International Characters
async function testUnicodeCharacters() {
  const unicodeInputs = [
    "北京",      // Chinese
    "東京",      // Japanese
    "Москва",    // Russian
    "القاهرة",   // Arabic
    "🏠 Senior", // Emoji
    "€1000",     // Currency symbols
  ];
  
  for (const input of unicodeInputs) {
    const response = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(input)}`);
    assert(response.ok, `Should handle Unicode: ${input}`);
  }
}

// Edge Case 6: Case Sensitivity Tests
async function testCaseSensitivity() {
  const caseVariations = [
    ['california', 'CALIFORNIA', 'California', 'CaLiFoRnIa'],
    ['san francisco', 'SAN FRANCISCO', 'San Francisco']
  ];
  
  for (const variations of caseVariations) {
    const results = [];
    for (const variant of variations) {
      const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: [],
          budget: { min: 2000, max: 5000 },
          location: variant,
          careNeeds: [],
          urgency: 'planning'
        })
      });
      const data = await response.json();
      results.push(data.recommendations?.length || 0);
    }
    
    // All case variations should return similar results
    const allSame = results.every(r => r === results[0]);
    assert(allSame, `Case variations should return consistent results: ${variations[0]}`);
  }
}

// Edge Case 7: Empty and Whitespace-only Inputs
async function testEmptyInputs() {
  const emptyInputs = [
    '',
    ' ',
    '   ',
    '\t',
    '\n',
    '     \t\n     '
  ];
  
  for (const input of emptyInputs) {
    const response = await fetch(`${BASE_URL}/api/autocomplete?q=${encodeURIComponent(input)}`);
    assert(response.ok, 'Should handle empty/whitespace input');
    const data = await response.json();
    assert(data.suggestions.length === 0, 'Empty input should return no suggestions');
  }
}

// Edge Case 8: Missing Required Fields
async function testMissingFields() {
  const invalidPayloads = [
    {}, // Empty object
    { budget: { min: 1000, max: 5000 } }, // Missing location
    { location: 'CA' }, // Missing budget
    { preferences: null, location: 'CA' }, // Null values
  ];
  
  for (const payload of invalidPayloads) {
    const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    assert(response.ok || response.status === 400, 'Should handle missing fields gracefully');
  }
}

// Edge Case 9: Array Boundary Conditions
async function testArrayBoundaries() {
  // Test with maximum preferences
  const manyPreferences = Array(50).fill('Pet Friendly');
  const response = await fetch(`${BASE_URL}/api/ai/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferences: manyPreferences,
      budget: { min: 2000, max: 5000 },
      location: 'CA',
      careNeeds: Array(20).fill('Assisted Living'),
      urgency: 'planning'
    })
  });
  
  assert(response.ok, 'Should handle large arrays of preferences');
}

// Performance Test: Response Time Check
async function testResponseTimes() {
  const endpoints = [
    { url: '/api/communities/count', maxTime: 100 },
    { url: '/api/autocomplete?q=San', maxTime: 1000 },
    { url: '/api/communities/search/enhanced?location=CA&limit=10', maxTime: 3000 }
  ];
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${endpoint.url}`);
    const duration = Date.now() - startTime;
    
    assert(response.ok, `Endpoint ${endpoint.url} should respond`);
    assert(duration < endpoint.maxTime, 
      `${endpoint.url} took ${duration}ms, should be under ${endpoint.maxTime}ms`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🔬 Running Edge Case & Stress Tests for MySeniorValet\n');
  console.log('=' .repeat(60));
  
  // Check if server is running
  try {
    await fetch(BASE_URL);
  } catch (error) {
    console.error(`${colors.red}Error: Server is not running at ${BASE_URL}${colors.reset}`);
    process.exit(1);
  }
  
  // Run all edge case tests
  await runTest('SQL Injection Prevention', testSQLInjectionPrevention);
  await runTest('Special Characters', testSpecialCharacters);
  await runTest('Extreme Budget Values', testExtremeBudgetValues);
  await runTest('Long Queries', testLongQueries);
  await runTest('Unicode Characters', testUnicodeCharacters);
  await runTest('Case Sensitivity', testCaseSensitivity);
  await runTest('Empty Inputs', testEmptyInputs);
  await runTest('Missing Fields', testMissingFields);
  await runTest('Array Boundaries', testArrayBoundaries);
  await runTest('Response Times', testResponseTimes);
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Test Results:\n');
  console.log(`  ${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);
  
  // Performance summary
  if (testResults.performance.length > 0) {
    const avgTime = Math.round(
      testResults.performance.reduce((sum, p) => sum + p.duration, 0) / 
      testResults.performance.length
    );
    console.log(`\n⚡ Performance:`);
    console.log(`  Average test duration: ${avgTime}ms`);
    
    const slowTests = testResults.performance.filter(p => p.duration > 1000);
    if (slowTests.length > 0) {
      console.log(`  ${colors.yellow}Slow tests (>1s):${colors.reset}`);
      slowTests.forEach(t => {
        console.log(`    - ${t.test}: ${t.duration}ms`);
      });
    }
  }
  
  if (testResults.failed > 0) {
    console.log(`\n${colors.red}❌ Failed Tests:${colors.reset}\n`);
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
    console.log(`\n${colors.green}🎉 All edge cases handled! Score: ${score}%${colors.reset}`);
    console.log(`${colors.blue}✨ System is robust and production-ready!${colors.reset}\n`);
  } else if (score >= 80) {
    console.log(`\n${colors.yellow}⚠️  Most edge cases handled. Score: ${score}%${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}❌ Multiple edge cases failed. Score: ${score}%${colors.reset}\n`);
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});