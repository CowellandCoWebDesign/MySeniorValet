#!/usr/bin/env node

/**
 * MySeniorValet Platform Health Check
 * Comprehensive automated testing to identify all broken functionality
 */

const fetch = require('node-fetch');
const { db } = require('./server/db');
const { communities, reviews, users, vendors } = require('./shared/schema');
const { eq, desc, sql } = require('drizzle-orm');

const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5000';

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

async function testEndpoint(name, path, expectedStatus = 200, validateFn = null) {
  totalTests++;
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const status = response.status;
    
    if (status !== expectedStatus) {
      failedTests.push({
        name,
        path,
        error: `Expected status ${expectedStatus}, got ${status}`,
        response: await response.text().catch(() => '')
      });
      console.log(`${colors.red}✗ ${name}${colors.reset} - Status ${status}`);
      return false;
    }
    
    if (validateFn && expectedStatus === 200) {
      const data = await response.json();
      const valid = await validateFn(data);
      if (!valid) {
        failedTests.push({
          name,
          path,
          error: 'Validation failed',
          data
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

async function testDatabase() {
  console.log(`\n${colors.blue}=== DATABASE TESTS ===${colors.reset}\n`);
  
  totalTests++;
  try {
    const count = await db.select({ count: sql`count(*)` }).from(communities);
    console.log(`${colors.green}✓ Database connection${colors.reset} - ${count[0].count} communities`);
    passedTests++;
  } catch (error) {
    failedTests.push({
      name: 'Database connection',
      error: error.message
    });
    console.log(`${colors.red}✗ Database connection${colors.reset} - ${error.message}`);
  }
  
  // Test for missing tables/columns
  const tablesToTest = [
    { table: communities, name: 'communities' },
    { table: reviews, name: 'reviews' },
    { table: users, name: 'users' },
    { table: vendors, name: 'vendors' }
  ];
  
  for (const { table, name } of tablesToTest) {
    totalTests++;
    try {
      await db.select().from(table).limit(1);
      console.log(`${colors.green}✓ Table ${name} accessible${colors.reset}`);
      passedTests++;
    } catch (error) {
      failedTests.push({
        name: `Table ${name}`,
        error: error.message
      });
      console.log(`${colors.red}✗ Table ${name}${colors.reset} - ${error.message}`);
    }
  }
}

async function testAPIEndpoints() {
  console.log(`\n${colors.blue}=== API ENDPOINT TESTS ===${colors.reset}\n`);
  
  // Core community endpoints
  await testEndpoint('GET /api/communities', '/api/communities', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/count', '/api/communities/count', 200, data => data.count !== undefined);
  await testEndpoint('GET /api/communities/trending', '/api/communities/trending', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/coastal', '/api/communities/coastal', 200, data => Array.isArray(data));
  await testEndpoint('GET /api/communities/hud-featured', '/api/communities/hud-featured', 200, data => Array.isArray(data));
  
  // Test specific community
  const communities = await fetch(`${BASE_URL}/api/communities?limit=1`).then(r => r.json());
  if (communities && communities[0]) {
    await testEndpoint('GET /api/communities/:id', `/api/communities/${communities[0].id}`, 200, data => data.id !== undefined);
  }
  
  // Location-based endpoints
  await testEndpoint('GET /api/communities/by-location/California', '/api/communities/by-location/California');
  await testEndpoint('GET /api/communities/by-location/Sacramento', '/api/communities/by-location/Sacramento');
  
  // Platform endpoints
  await testEndpoint('GET /api/platform/stats', '/api/platform/stats');
  await testEndpoint('GET /api/market/overview', '/api/market/overview');
  await testEndpoint('GET /api/images/hero', '/api/images/hero');
  
  // Auth endpoints
  await testEndpoint('GET /api/auth/user (unauthenticated)', '/api/auth/user', 401);
  await testEndpoint('POST /api/auth/demo-login', '/api/auth/demo-login', 200);
  
  // Search endpoints
  await testEndpoint('GET /api/search?query=senior', '/api/search?query=senior');
  await testEndpoint('GET /api/search/suggestions', '/api/search/suggestions');
  
  // Vendor endpoints
  await testEndpoint('GET /api/vendors', '/api/vendors');
  await testEndpoint('GET /api/vendors/featured', '/api/vendors/featured');
  
  // Admin endpoints (should require auth)
  await testEndpoint('GET /api/admin/stats (unauthenticated)', '/api/admin/stats', 401);
  await testEndpoint('GET /api/admin/users (unauthenticated)', '/api/admin/users', 401);
}

async function testFrontendRoutes() {
  console.log(`\n${colors.blue}=== FRONTEND ROUTE TESTS ===${colors.reset}\n`);
  
  const frontendRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/map-search',
    '/affordable-housing',
    '/veterans-housing',
    '/services',
    '/costs',
    '/help'
  ];
  
  for (const route of frontendRoutes) {
    await testEndpoint(`Frontend ${route}`, route, 200, async (html) => {
      return html.includes('<!DOCTYPE html>') && html.includes('<div id="root">');
    });
  }
}

async function testCriticalFunctionality() {
  console.log(`\n${colors.blue}=== CRITICAL FUNCTIONALITY TESTS ===${colors.reset}\n`);
  
  // Test search functionality
  totalTests++;
  try {
    const searchResponse = await fetch(`${BASE_URL}/api/search?query=assisted living&limit=5`);
    const searchData = await searchResponse.json();
    if (searchData && searchData.communities && Array.isArray(searchData.communities)) {
      console.log(`${colors.green}✓ Search functionality${colors.reset} - Found ${searchData.communities.length} results`);
      passedTests++;
    } else {
      throw new Error('Invalid search response format');
    }
  } catch (error) {
    failedTests.push({
      name: 'Search functionality',
      error: error.message
    });
    console.log(`${colors.red}✗ Search functionality${colors.reset} - ${error.message}`);
  }
  
  // Test map data endpoint
  totalTests++;
  try {
    const mapResponse = await fetch(`${BASE_URL}/api/communities/map-data?bounds=-180,-90,180,90`);
    const mapData = await mapResponse.json();
    if (mapData && Array.isArray(mapData)) {
      console.log(`${colors.green}✓ Map data endpoint${colors.reset} - ${mapData.length} communities`);
      passedTests++;
    } else {
      throw new Error('Invalid map data response');
    }
  } catch (error) {
    failedTests.push({
      name: 'Map data endpoint',
      error: error.message
    });
    console.log(`${colors.red}✗ Map data endpoint${colors.reset} - ${error.message}`);
  }
}

async function generateReport() {
  console.log(`\n${colors.blue}=== TEST SUMMARY ===${colors.reset}\n`);
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const statusColor = successRate >= 80 ? colors.green : successRate >= 60 ? colors.yellow : colors.red;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests.length}${colors.reset}`);
  console.log(`${statusColor}Success Rate: ${successRate}%${colors.reset}`);
  
  if (failedTests.length > 0) {
    console.log(`\n${colors.red}=== FAILED TESTS DETAILS ===${colors.reset}\n`);
    failedTests.forEach((test, index) => {
      console.log(`${colors.red}${index + 1}. ${test.name}${colors.reset}`);
      console.log(`   Path: ${test.path || 'N/A'}`);
      console.log(`   Error: ${test.error}`);
      if (test.response) {
        console.log(`   Response: ${test.response.substring(0, 200)}...`);
      }
      console.log('');
    });
  }
  
  // Critical issues summary
  const criticalIssues = failedTests.filter(t => 
    t.name.includes('Database') || 
    t.name.includes('communities/:id') ||
    t.name.includes('Search functionality') ||
    t.name.includes('Map data')
  );
  
  if (criticalIssues.length > 0) {
    console.log(`\n${colors.red}=== CRITICAL ISSUES ===${colors.reset}\n`);
    criticalIssues.forEach(issue => {
      console.log(`${colors.red}• ${issue.name}: ${issue.error}${colors.reset}`);
    });
  }
}

async function runTests() {
  console.log(`${colors.blue}MySeniorValet Platform Health Check${colors.reset}`);
  console.log(`${colors.blue}===================================${colors.reset}`);
  console.log(`Testing against: ${BASE_URL}\n`);
  
  try {
    // Check if server is running
    await fetch(BASE_URL);
  } catch (error) {
    console.log(`${colors.red}ERROR: Server is not running at ${BASE_URL}${colors.reset}`);
    console.log('Please start the server first with: npm run dev');
    process.exit(1);
  }
  
  await testDatabase();
  await testAPIEndpoints();
  await testFrontendRoutes();
  await testCriticalFunctionality();
  await generateReport();
  
  // Exit with error code if tests failed
  process.exit(failedTests.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test runner error:${colors.reset}`, error);
  process.exit(1);
});