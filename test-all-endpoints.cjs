#!/usr/bin/env node

/**
 * MySeniorValet Comprehensive Endpoint Testing
 * Tests all API endpoints and functionality
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json: () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              return null;
            }
          }
        });
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testEndpoint(name, path, expectedStatus = 200, validateFn = null) {
  totalTests++;
  try {
    const response = await makeRequest(path);
    
    if (response.status !== expectedStatus) {
      failedTests.push({
        name,
        path,
        error: `Expected status ${expectedStatus}, got ${response.status}`,
        response: response.body.substring(0, 200)
      });
      console.log(`${colors.red}✗ ${name}${colors.reset} - Status ${response.status}`);
      return false;
    }
    
    if (validateFn && expectedStatus === 200) {
      const data = response.json();
      const valid = await validateFn(data);
      if (!valid) {
        failedTests.push({
          name,
          path,
          error: 'Validation failed',
          data: JSON.stringify(data).substring(0, 200)
        });
        console.log(`${colors.red}✗ ${name}${colors.reset} - Validation failed`);
        return false;
      }
    }
    
    passedTests++;
    console.log(`${colors.green}✓ ${name}${colors.reset}`);
    return true;
  } catch (error) {
    failedTests.push({
      name,
      path,
      error: error.message
    });
    console.log(`${colors.red}✗ ${name}${colors.reset} - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.blue}MySeniorValet Comprehensive Testing${colors.reset}`);
  console.log(`${colors.blue}===================================${colors.reset}\n`);
  
  // Check if server is running
  try {
    await makeRequest('/');
  } catch (error) {
    console.log(`${colors.red}ERROR: Server is not running at ${BASE_URL}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.blue}=== COMMUNITY ENDPOINTS ===${colors.reset}\n`);
  
  // Core community endpoints
  await testEndpoint('GET /api/communities', '/api/communities', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities?limit=5', '/api/communities?limit=5', 200, data => Array.isArray(data) && data.length <= 5);
  await testEndpoint('GET /api/communities/count', '/api/communities/count', 200, data => data && data.count !== undefined);
  await testEndpoint('GET /api/communities/trending', '/api/communities/trending', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/coastal', '/api/communities/coastal', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/hud-featured', '/api/communities/hud-featured', 200, data => Array.isArray(data));
  
  // Get a community ID for testing
  const communitiesResp = await makeRequest('/api/communities?limit=1');
  const communities = communitiesResp.json();
  if (communities && communities[0]) {
    const testId = communities[0].id;
    await testEndpoint(`GET /api/communities/${testId}`, `/api/communities/${testId}`, 200, data => data && data.id === testId);
    await testEndpoint(`GET /api/communities/${testId}/reviews`, `/api/communities/${testId}/reviews`, 200, data => Array.isArray(data));
  }
  
  // Location endpoints
  await testEndpoint('GET /api/communities/by-location/California', '/api/communities/by-location/California', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/by-location/Sacramento', '/api/communities/by-location/Sacramento', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/by-location/Texas', '/api/communities/by-location/Texas', 200, data => Array.isArray(data));
  
  // Map data
  await testEndpoint('GET /api/communities/map-data', '/api/communities/map-data?bounds=-180,-90,180,90', 200, data => Array.isArray(data));
  
  console.log(`\n${colors.blue}=== SEARCH ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/search?query=senior', '/api/search?query=senior', 200, data => data && data.communities !== undefined);
  await testEndpoint('GET /api/search?query=assisted living', '/api/search?query=assisted+living', 200);
  await testEndpoint('GET /api/search/suggestions', '/api/search/suggestions', 200, data => Array.isArray(data));
  
  console.log(`\n${colors.blue}=== PLATFORM ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/platform/stats', '/api/platform/stats', 200);
  await testEndpoint('GET /api/market/overview', '/api/market/overview', 200);
  await testEndpoint('GET /api/images/hero', '/api/images/hero', 200, data => data && data.url !== undefined);
  
  console.log(`\n${colors.blue}=== AUTH ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/auth/user (unauth)', '/api/auth/user', 401);
  await testEndpoint('POST /api/auth/demo-login', '/api/auth/demo-login', 200);
  await testEndpoint('POST /api/auth/logout', '/api/auth/logout', 200);
  
  console.log(`\n${colors.blue}=== VENDOR ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/vendors', '/api/vendors', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/vendors/featured', '/api/vendors/featured', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/vendor/dashboard (unauth)', '/api/vendor/dashboard', 401);
  
  console.log(`\n${colors.blue}=== ADMIN ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/admin/stats (unauth)', '/api/admin/stats', 401);
  await testEndpoint('GET /api/admin/users (unauth)', '/api/admin/users', 401);
  await testEndpoint('GET /api/admin/communities (unauth)', '/api/admin/communities', 401);
  
  console.log(`\n${colors.blue}=== AI/ADVANCED ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/ai/search?query=test', '/api/ai/search?query=test', 200);
  await testEndpoint('GET /api/data-integrity/stats', '/api/data-integrity/stats', 200);
  await testEndpoint('GET /api/tour-tracker/public', '/api/tour-tracker/public', 200);
  
  console.log(`\n${colors.blue}=== SPECIAL ENDPOINTS ===${colors.reset}\n`);
  
  await testEndpoint('GET /api/claim/check/123', '/api/claim/check/123', 200);
  await testEndpoint('GET /api/insurance/providers', '/api/insurance/providers', 200);
  await testEndpoint('GET /api/veterans/resources', '/api/veterans/resources', 200);
  
  // Generate report
  console.log(`\n${colors.blue}=== TEST SUMMARY ===${colors.reset}\n`);
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const statusColor = successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests.length}${colors.reset}`);
  console.log(`${statusColor}Success Rate: ${successRate}%${colors.reset}`);
  
  if (failedTests.length > 0) {
    console.log(`\n${colors.red}=== FAILED TESTS ===${colors.reset}\n`);
    
    // Group by error type
    const errorGroups = {};
    failedTests.forEach(test => {
      const key = test.error.includes('404') ? '404 Not Found' :
                  test.error.includes('500') ? '500 Server Error' :
                  test.error.includes('401') && !test.name.includes('unauth') ? 'Unexpected 401' :
                  test.error.includes('Validation') ? 'Validation Failed' :
                  'Other';
      
      if (!errorGroups[key]) errorGroups[key] = [];
      errorGroups[key].push(test);
    });
    
    Object.entries(errorGroups).forEach(([errorType, tests]) => {
      console.log(`${colors.yellow}${errorType} (${tests.length} tests):${colors.reset}`);
      tests.forEach(test => {
        console.log(`  • ${test.name} - ${test.path}`);
        if (test.response && !test.error.includes('404')) {
          console.log(`    Response: ${test.response}...`);
        }
      });
      console.log('');
    });
  }
  
  // Exit with error code if tests failed
  process.exit(failedTests.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test runner error:${colors.reset}`, error);
  process.exit(1);
});