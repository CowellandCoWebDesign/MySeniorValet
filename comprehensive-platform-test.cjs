#!/usr/bin/env node

/**
 * Comprehensive Platform Functionality Test
 * Tests all MySeniorValet features - paid and unpaid
 * Date: July 31, 2025
 */

const axios = require('axios');
const fs = require('fs').promises;

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

const SUPER_ADMIN = {
  email: 'william.cowell01@gmail.com',
  password: 'admin123'
};

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
}

// Test runner
async function runTest(testName, testFunction) {
  totalTests++;
  process.stdout.write(`Testing ${testName}... `);
  
  try {
    const result = await testFunction();
    if (result.success) {
      passedTests++;
      console.log(`${colors.green}✓ PASSED${colors.reset}`);
      testResults.push({ test: testName, status: 'PASSED', details: result.details });
    } else {
      failedTests++;
      console.log(`${colors.red}✗ FAILED${colors.reset}: ${result.error}`);
      testResults.push({ test: testName, status: 'FAILED', error: result.error });
    }
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗ ERROR${colors.reset}: ${error.message}`);
    testResults.push({ test: testName, status: 'ERROR', error: error.message });
  }
}

// Test Categories
async function testPublicEndpoints() {
  console.log(`\n${colors.blue}=== Testing Public Endpoints ===${colors.reset}\n`);
  
  await runTest('Platform Statistics', async () => {
    const result = await makeRequest('GET', '/platform/stats');
    return {
      success: result.success && result.data.totalCommunities > 0,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Community Count', async () => {
    const result = await makeRequest('GET', '/communities/count');
    return {
      success: result.success && parseInt(result.data.count) > 25000,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Market Overview', async () => {
    const result = await makeRequest('GET', '/market/overview');
    return {
      success: result.success && result.data.marketTrends,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Trending Communities', async () => {
    const result = await makeRequest('GET', '/communities/trending');
    return {
      success: result.success && Array.isArray(result.data) && result.data.length > 0,
      details: `Found ${result.data.length} trending communities`,
      error: result.error
    };
  });
  
  await runTest('HUD Properties', async () => {
    const result = await makeRequest('GET', '/communities/hud-featured');
    return {
      success: result.success && Array.isArray(result.data) && result.data.length > 0,
      details: `Found ${result.data.length} HUD properties`,
      error: result.error
    };
  });
  
  await runTest('Coastal Communities', async () => {
    const result = await makeRequest('GET', '/communities/coastal');
    return {
      success: result.success && Array.isArray(result.data),
      details: `Found ${result.data.length} coastal communities`,
      error: result.error
    };
  });
  
  await runTest('Location Search - California', async () => {
    const result = await makeRequest('GET', '/communities/by-location/California');
    return {
      success: result.success && Array.isArray(result.data) && result.data.length > 0,
      details: `Found ${result.data.length} communities in California`,
      error: result.error
    };
  });
  
  await runTest('Amazon Products', async () => {
    const result = await makeRequest('GET', '/amazon-products/images');
    return {
      success: result.success && result.data.products && result.data.products.length > 0,
      details: `Found ${result.data.products.length} Amazon products`,
      error: result.error
    };
  });
  
  await runTest('Care Services', async () => {
    const result = await makeRequest('GET', '/care-services');
    return {
      success: result.success && result.data.services && result.data.services.length > 0,
      details: `Found ${result.data.services.length} care services`,
      error: result.error
    };
  });
  
  await runTest('VA Resources', async () => {
    const result = await makeRequest('GET', '/va-resources/facilities');
    return {
      success: result.success && result.data.facilities,
      details: result.data,
      error: result.error
    };
  });
}

async function testSearchAndMapping() {
  console.log(`\n${colors.blue}=== Testing Search & Mapping ===${colors.reset}\n`);
  
  await runTest('Basic Search', async () => {
    const result = await makeRequest('GET', '/communities/search?location=California&careType=All%20Types&limit=10');
    return {
      success: result.success && result.data && result.data.communities && result.data.communities.length > 0,
      details: result.data ? `Found ${result.data.communities.length} communities` : 'No data',
      error: result.error
    };
  });
  
  await runTest('AI-Powered Search', async () => {
    const result = await makeRequest('GET', '/communities/search-ai?query=luxury senior living with memory care near beaches&limit=5');
    return {
      success: result.success && result.data.communities,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Map Bounds Search', async () => {
    const bounds = {
      north: 34.0522,
      south: 33.9522,
      east: -118.1437,
      west: -118.3437
    };
    const result = await makeRequest('GET', `/communities/search?bounds=${bounds.west},${bounds.south},${bounds.east},${bounds.north}&limit=50`);
    return {
      success: result.success && result.data && result.data.communities && Array.isArray(result.data.communities),
      details: result.data ? `Found ${result.data.communities?.length || 0} communities in bounds` : 'No data',
      error: result.error
    };
  });
  
  await runTest('Map Clustering', async () => {
    const result = await makeRequest('GET', '/communities/clusters-fixed?north=34.0522&south=33.9522&east=-118.1437&west=-118.3437&zoom=10');
    return {
      success: result.success && result.data && result.data.features && Array.isArray(result.data.features),
      details: result.data ? `Found ${result.data.features?.length || 0} clusters` : 'No data',
      error: result.error
    };
  });
}

async function testAIIntegrations() {
  console.log(`\n${colors.blue}=== Testing AI Integrations ===${colors.reset}\n`);
  
  await runTest('Claude AI Health Check', async () => {
    const result = await makeRequest('GET', '/ai/health/claude');
    return {
      success: result.success && result.data.status === 'healthy',
      details: result.data,
      error: result.error || 'Claude AI not healthy'
    };
  });
  
  await runTest('OpenAI Health Check', async () => {
    const result = await makeRequest('GET', '/ai/health/openai');
    return {
      success: result.success && result.data.status === 'healthy',
      details: result.data,
      error: result.error || 'OpenAI not healthy'
    };
  });
  
  await runTest('Perplexity AI Health Check', async () => {
    const result = await makeRequest('GET', '/ai/health/perplexity');
    return {
      success: result.success && result.data.status === 'healthy',
      details: result.data,
      error: result.error || 'Perplexity AI not healthy'
    };
  });
  
  await runTest('AI Orchestra Status', async () => {
    const result = await makeRequest('GET', '/ai/orchestra/status');
    return {
      success: result.success && result.data.activeProviders,
      details: result.data,
      error: result.error
    };
  });
}

async function testWeaviateEnhanced() {
  console.log(`\n${colors.blue}=== Testing Weaviate Enhanced Search ===${colors.reset}\n`);
  
  await runTest('Weaviate Health', async () => {
    const result = await makeRequest('GET', '/weaviate-enhanced/health');
    return {
      success: result.success && result.data.status === 'healthy',
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Semantic Search', async () => {
    const result = await makeRequest('POST', '/weaviate-enhanced/search', {
      query: 'comfortable retirement home with good medical care',
      limit: 5
    });
    return {
      success: result.success && result.data.results,
      details: `Found ${result.data.results?.length || 0} results`,
      error: result.error
    };
  });
  
  await runTest('RAG Recommendations', async () => {
    const result = await makeRequest('POST', '/weaviate-enhanced/rag', {
      query: 'Looking for memory care facility',
      limit: 5
    });
    return {
      success: result.success && result.data && result.data.response,
      details: result.data,
      error: result.error
    };
  });
}

async function testAuthentication() {
  console.log(`\n${colors.blue}=== Testing Authentication ===${colors.reset}\n`);
  
  let authToken = null;
  
  await runTest('User Registration', async () => {
    const result = await makeRequest('POST', '/auth/quick-signup', {
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123'
    });
    return {
      success: result.success && result.data && result.data.user,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('User Login', async () => {
    const result = await makeRequest('POST', '/auth/quick-login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    authToken = result.data?.token;
    return {
      success: result.success && result.data && result.data.user,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Get Current User', async () => {
    const result = await makeRequest('GET', '/auth/quick-user');
    return {
      success: result.success && result.data.user,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('User Logout', async () => {
    const result = await makeRequest('POST', '/auth/quick-logout');
    return {
      success: result.success,
      details: result.data,
      error: result.error
    };
  });
}

async function testCommunityFeatures() {
  console.log(`\n${colors.blue}=== Testing Community Features ===${colors.reset}\n`);
  
  await runTest('Get Community Details', async () => {
    const result = await makeRequest('GET', '/communities/264'); // Heritage Hills
    return {
      success: result.success && result.data.id === 264,
      details: `Community: ${result.data.name}`,
      error: result.error
    };
  });
  
  await runTest('Community Reviews', async () => {
    const result = await makeRequest('GET', '/communities/264/reviews');
    return {
      success: result.success && Array.isArray(result.data),
      details: `Found ${result.data.length} reviews`,
      error: result.error
    };
  });
  
  await runTest('Similar Communities', async () => {
    const result = await makeRequest('GET', '/communities/264/similar');
    return {
      success: result.success && Array.isArray(result.data),
      details: `Found ${result.data.length} similar communities`,
      error: result.error
    };
  });
}

async function testAnalytics() {
  console.log(`\n${colors.blue}=== Testing Analytics ===${colors.reset}\n`);
  
  await runTest('Analytics Summary', async () => {
    const result = await makeRequest('GET', '/analytics/summary?timeRange=7d');
    return {
      success: result.success && result.data,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('User Engagement Funnel', async () => {
    const result = await makeRequest('GET', '/analytics/funnel?timeRange=30d');
    return {
      success: result.success && result.data.funnel,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Geographic Distribution', async () => {
    const result = await makeRequest('GET', '/analytics/geographic');
    return {
      success: result.success && result.data.distribution,
      details: result.data,
      error: result.error
    };
  });
  
  await runTest('Financial Analytics', async () => {
    const result = await makeRequest('GET', '/analytics/financial?timeRange=30d');
    return {
      success: result.success && result.data.revenue !== undefined,
      details: result.data,
      error: result.error
    };
  });
}

async function testAdminFeatures() {
  console.log(`\n${colors.blue}=== Testing Admin Features ===${colors.reset}\n`);
  
  // Note: These would typically require admin authentication
  await runTest('Admin Dashboard Access', async () => {
    const result = await makeRequest('GET', '/admin/dashboard/overview');
    // Expecting 401 or 403 without auth
    return {
      success: result.status === 401 || result.status === 403,
      details: 'Properly restricted',
      error: result.status === 200 ? 'Admin endpoint not protected!' : null
    };
  });
  
  await runTest('Integration Dashboard Access', async () => {
    const result = await makeRequest('GET', '/admin/integrations/status');
    return {
      success: result.status === 401 || result.status === 403,
      details: 'Properly restricted',
      error: result.status === 200 ? 'Admin endpoint not protected!' : null
    };
  });
}

async function testVendorMarketplace() {
  console.log(`\n${colors.blue}=== Testing Vendor Marketplace ===${colors.reset}\n`);
  
  await runTest('Vendor Services List', async () => {
    const result = await makeRequest('GET', '/services');
    return {
      success: result.success && result.data.services,
      details: `Found ${result.data.services?.length || 0} vendor services`,
      error: result.error
    };
  });
  
  await runTest('Service Categories', async () => {
    const result = await makeRequest('GET', '/services/categories');
    return {
      success: result.success && Array.isArray(result.data),
      details: `Found ${result.data.length} categories`,
      error: result.error
    };
  });
  
  await runTest('Service Providers', async () => {
    const result = await makeRequest('GET', '/services/providers');
    return {
      success: result.success && Array.isArray(result.data),
      details: `Found ${result.data.length} providers`,
      error: result.error
    };
  });
}

async function generateReport() {
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}\n`);
  
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Pass Rate: ${passRate}%`);
  
  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: `${passRate}%`
    },
    results: testResults,
    platformStatus: passRate >= 75 ? 'OPERATIONAL' : 'NEEDS ATTENTION'
  };
  
  // Save report
  await fs.writeFile(
    'platform-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n${colors.yellow}Detailed report saved to platform-test-report.json${colors.reset}`);
  
  // Platform status
  if (passRate >= 90) {
    console.log(`\n${colors.green}✅ Platform Status: FULLY OPERATIONAL${colors.reset}`);
  } else if (passRate >= 75) {
    console.log(`\n${colors.yellow}⚠️  Platform Status: OPERATIONAL WITH ISSUES${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Platform Status: CRITICAL ISSUES DETECTED${colors.reset}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.blue}
╔══════════════════════════════════════════════════════╗
║     MySeniorValet Comprehensive Platform Test        ║
║              Date: ${new Date().toLocaleDateString()}                      ║
╚══════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    await testPublicEndpoints();
    await testSearchAndMapping();
    await testAIIntegrations();
    await testWeaviateEnhanced();
    await testAuthentication();
    await testCommunityFeatures();
    await testAnalytics();
    await testAdminFeatures();
    await testVendorMarketplace();
    
    await generateReport();
  } catch (error) {
    console.error(`\n${colors.red}Test suite error: ${error.message}${colors.reset}`);
  }
}

// Run tests
runAllTests();