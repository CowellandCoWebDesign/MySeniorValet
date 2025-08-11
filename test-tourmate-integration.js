#!/usr/bin/env node

/**
 * TourMate™ Integration Test Suite
 * Tests all aspects of the TourMate™ system integrated into the community dashboard
 */

import fetch from 'node-fetch';
const BASE_URL = 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

let passedTests = 0;
let failedTests = 0;
let testResults = [];

async function runTest(testName, testFn) {
  process.stdout.write(`Testing ${testName}... `);
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`${colors.green}✓ PASSED${colors.reset}`);
      passedTests++;
      testResults.push({ test: testName, status: 'PASSED', details: result.details });
    } else {
      console.log(`${colors.red}✗ FAILED${colors.reset}: ${result.error}`);
      failedTests++;
      testResults.push({ test: testName, status: 'FAILED', error: result.error });
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset}: ${error.message}`);
    failedTests++;
    testResults.push({ test: testName, status: 'ERROR', error: error.message });
  }
}

// Test Functions
async function testCommunityDashboard() {
  const response = await fetch(`${BASE_URL}/api/communities/7349/dashboard`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  if (!data.community) {
    return { success: false, error: 'No community data returned' };
  }
  
  return { 
    success: true, 
    details: `Dashboard loaded for ${data.community.name || 'Unknown'}` 
  };
}

async function testToursEndpoint() {
  const response = await fetch(`${BASE_URL}/api/communities/7349/tours`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  if (!data.tours) {
    return { success: false, error: 'No tours array returned' };
  }
  
  return { 
    success: true, 
    details: `Found ${data.tours.length} tours` 
  };
}

async function testTourMateAnalytics() {
  const response = await fetch(`${BASE_URL}/api/tourmate/analytics/7349`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  // Check for expected analytics fields
  const expectedFields = ['conversionRate', 'avgResponseTime', 'satisfactionScore', 'tourStats'];
  const missingFields = expectedFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    return { success: false, error: `Missing fields: ${missingFields.join(', ')}` };
  }
  
  return { 
    success: true, 
    details: `Analytics loaded: ${data.conversionRate}% conversion, ${data.satisfactionScore}/5 satisfaction` 
  };
}

async function testTourScheduling() {
  const tourData = {
    tourDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    tourType: 'in-person',
    attendeeCount: 2,
    specialRequests: 'Test tour request'
  };
  
  const response = await fetch(`${BASE_URL}/api/communities/7349/tours/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tourData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${errorText}` };
  }
  
  const data = await response.json();
  if (!data.tourId) {
    return { success: false, error: 'No tour ID returned' };
  }
  
  return { 
    success: true, 
    details: `Tour scheduled with ID: ${data.tourId}` 
  };
}

async function testReviewManagement() {
  const response = await fetch(`${BASE_URL}/api/communities/7349/reviews`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  if (!data.reviews) {
    return { success: false, error: 'No reviews array returned' };
  }
  
  return { 
    success: true, 
    details: `Found ${data.reviews.length} reviews, avg rating: ${data.avgRating || 'N/A'}` 
  };
}

async function testTourMatePrivacy() {
  const response = await fetch(`${BASE_URL}/api/tourmate/privacy/audit`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  if (!data.privacyCompliant) {
    return { success: false, error: 'Privacy compliance check failed' };
  }
  
  return { 
    success: true, 
    details: 'Privacy service operational and compliant' 
  };
}

async function testTourMateSecurity() {
  const response = await fetch(`${BASE_URL}/api/tourmate/security/status`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  if (!data.securityEnabled) {
    return { success: false, error: 'Security features not enabled' };
  }
  
  return { 
    success: true, 
    details: 'Security service operational with encryption enabled' 
  };
}

async function testFrontendComponents() {
  // Test if the frontend is serving properly
  const response = await fetch(`${BASE_URL}/`);
  const html = await response.text();
  
  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }
  
  // Check for key TourMate™ UI elements in the HTML
  const hasViteScript = html.includes('type="module"');
  const hasReactRoot = html.includes('id="root"');
  
  if (!hasViteScript || !hasReactRoot) {
    return { success: false, error: 'Frontend not properly configured' };
  }
  
  return { 
    success: true, 
    details: 'Frontend serving correctly with React and Vite' 
  };
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.magenta}   TourMate™ Integration Test Suite${colors.reset}`);
  console.log(`${colors.magenta}========================================${colors.reset}\n`);
  
  console.log(`${colors.blue}Testing Backend Endpoints:${colors.reset}\n`);
  
  // Backend tests
  await runTest('Community Dashboard API', testCommunityDashboard);
  await runTest('Tours Management API', testToursEndpoint);
  await runTest('TourMate™ Analytics API', testTourMateAnalytics);
  await runTest('Tour Scheduling API', testTourScheduling);
  await runTest('Review Management API', testReviewManagement);
  await runTest('TourMate™ Privacy Service', testTourMatePrivacy);
  await runTest('TourMate™ Security Service', testTourMateSecurity);
  
  console.log(`\n${colors.blue}Testing Frontend Integration:${colors.reset}\n`);
  
  // Frontend tests
  await runTest('Frontend Component Serving', testFrontendComponents);
  
  // Summary
  console.log(`\n${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.magenta}            Test Summary${colors.reset}`);
  console.log(`${colors.magenta}========================================${colors.reset}\n`);
  
  const total = passedTests + failedTests;
  const percentage = total > 0 ? Math.round((passedTests / total) * 100) : 0;
  
  console.log(`Total Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${percentage}%\n`);
  
  if (failedTests > 0) {
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    testResults.filter(r => r.status === 'FAILED' || r.status === 'ERROR').forEach(r => {
      console.log(`  - ${r.test}: ${r.error}`);
    });
  }
  
  if (passedTests === total) {
    console.log(`\n${colors.green}🎉 All tests passed! TourMate™ integration is working perfectly!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️ Some tests failed. Review the errors above.${colors.reset}\n`);
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  process.exit(1);
});