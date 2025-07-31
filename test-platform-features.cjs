#!/usr/bin/env node

/**
 * Comprehensive Platform Feature Testing
 * Tests all major MySeniorValet features and tools
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:5000';
const BASE_URL_FRONTEND = 'http://localhost:5173';

let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];
const testResults = {};

// Helper to make HTTP requests
async function fetchData(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          };
          resolve(result);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runTest(category, name, testFn) {
  console.log(`\n🧪 TEST: ${name}`);
  try {
    const result = await testFn();
    console.log(`✅ PASSED`);
    passedTests++;
    
    if (!testResults[category]) testResults[category] = { passed: 0, failed: 0, tests: [] };
    testResults[category].passed++;
    testResults[category].tests.push({ name, status: 'passed', result });
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`);
    failedTests++;
    failedTestDetails.push({ category, name, error: error.message });
    
    if (!testResults[category]) testResults[category] = { passed: 0, failed: 0, tests: [] };
    testResults[category].failed++;
    testResults[category].tests.push({ name, status: 'failed', error: error.message });
  }
}

// Main test suite
async function runTests() {
  console.log('🏥 MYSENIORVALET COMPREHENSIVE PLATFORM TESTING');
  console.log('================================================');
  console.log(`Testing all features at ${new Date().toLocaleString()}\n`);

  // 1. AUTHENTICATION TESTS
  console.log('\n🔐 AUTHENTICATION SYSTEM TESTS');
  console.log('================================');
  
  await runTest('Authentication', 'Quick auth user endpoint', async () => {
    const res = await fetchData(`${BASE_URL}/api/auth/quick-user`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.success) throw new Error('Auth endpoint not successful');
    console.log(`  → User: ${res.data.user.email} (${res.data.user.role})`);
    return res.data;
  });

  await runTest('Authentication', 'Quick login endpoint', async () => {
    const res = await fetchData(`${BASE_URL}/api/auth/quick-login`, {
      method: 'POST',
      body: { email: 'demo@example.com', password: 'demo123' }
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.success) throw new Error('Login failed');
    console.log(`  → Logged in as: ${res.data.user.email}`);
    return res.data;
  });

  // 2. SEARCH FUNCTIONALITY TESTS
  console.log('\n🔍 SEARCH FUNCTIONALITY TESTS');
  console.log('================================');
  
  await runTest('Search', 'Basic community search', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities?search=San%20Francisco&limit=5`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.communities || !Array.isArray(res.data.communities)) {
      throw new Error('Invalid response format');
    }
    console.log(`  → Found ${res.data.total} communities (showing ${res.data.communities.length})`);
    return res.data;
  });

  await runTest('Search', 'Search with care type filter', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities?careTypes=Memory%20Care&limit=5`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → Found ${res.data.total} Memory Care communities`);
    return res.data;
  });

  await runTest('Search', 'Spatial search', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities/search/spatial?swLat=37.7&swLng=-122.5&neLat=37.8&neLng=-122.4&limit=10`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Expected array response');
    console.log(`  → Found ${res.data.length} communities in bounds`);
    return res.data;
  });

  // 3. COMMUNITY DETAILS TESTS
  console.log('\n🏘️ COMMUNITY DETAILS TESTS');
  console.log('================================');
  
  await runTest('Communities', 'Get community by ID', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities/268`); // Rhoda Goldman Plaza
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.id) throw new Error('Community not found');
    console.log(`  → Community: ${res.data.name} (${res.data.city}, ${res.data.state})`);
    return res.data;
  });

  await runTest('Communities', 'Get community stats', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities/stats`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → Total: ${res.data.totalCommunities}, States: ${res.data.totalStates}`);
    return res.data;
  });

  // 4. TOUR SCHEDULING TESTS
  console.log('\n📅 TOUR SCHEDULING TESTS');
  console.log('================================');
  
  await runTest('Tours', 'Schedule a tour', async () => {
    const tourData = {
      community_id: 268,
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-1234',
      tour_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      tour_time: '14:00',
      additional_info: 'Automated test tour'
    };
    
    const res = await fetchData(`${BASE_URL}/api/tours`, {
      method: 'POST',
      body: tourData
    });
    
    if (res.status !== 201) throw new Error(`Status ${res.status}: ${res.data}`);
    console.log(`  → Tour scheduled with ID: ${res.data.id}`);
    return res.data;
  });

  // 5. REVIEW SYSTEM TESTS
  console.log('\n⭐ REVIEW SYSTEM TESTS');
  console.log('================================');
  
  await runTest('Reviews', 'Get community reviews', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities/268/reviews`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → Found ${res.data.length} reviews`);
    return res.data;
  });

  // 6. VENDOR MARKETPLACE TESTS
  console.log('\n🛍️ VENDOR MARKETPLACE TESTS');
  console.log('================================');
  
  await runTest('Vendors', 'Get all services', async () => {
    const res = await fetchData(`${BASE_URL}/api/services`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.services) throw new Error('No services property');
    console.log(`  → Found ${res.data.total} services across ${res.data.categories.length} categories`);
    return res.data;
  });

  await runTest('Vendors', 'Get Amazon products', async () => {
    const res = await fetchData(`${BASE_URL}/api/amazon-products`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → Found ${res.data.length} Amazon products`);
    return res.data;
  });

  // 7. AI INTEGRATION TESTS
  console.log('\n🤖 AI INTEGRATION TESTS');
  console.log('================================');
  
  await runTest('AI', 'Enhanced Weaviate health check', async () => {
    const res = await fetchData(`${BASE_URL}/api/weaviate-enhanced/health`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → Weaviate status: ${res.data.status}`);
    console.log(`  → Community schema: ${res.data.communitySchema ? 'Ready' : 'Not ready'}`);
    return res.data;
  });

  await runTest('AI', 'AI-powered search (Weaviate)', async () => {
    const res = await fetchData(`${BASE_URL}/api/weaviate-enhanced/search`, {
      method: 'POST',
      body: {
        query: 'memory care near San Francisco with good reviews',
        limit: 5
      }
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → AI found ${res.data.results.length} relevant communities`);
    if (res.data.results.length > 0) {
      console.log(`  → Top match: ${res.data.results[0].name} (${res.data.results[0]._additional?.score || 'N/A'} relevance)`);
    }
    return res.data;
  });

  // 8. MAP CLUSTERING TESTS (Already tested separately)
  console.log('\n🗺️ MAP CLUSTERING TESTS');
  console.log('================================');
  
  await runTest('Maps', 'Cluster API at zoom 12', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities/clusters?west=-122.5&south=37.7&east=-122.4&north=37.8&zoom=12`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const clusters = res.data.clusters.filter(f => f.properties?.cluster);
    const markers = res.data.clusters.filter(f => !f.properties?.cluster);
    console.log(`  → ${clusters.length} clusters, ${markers.length} individual markers`);
    return res.data;
  });

  // 9. ADMIN FEATURES TESTS
  console.log('\n👨‍💼 ADMIN FEATURES TESTS');
  console.log('================================');
  
  await runTest('Admin', 'Access admin dashboard data', async () => {
    const res = await fetchData(`${BASE_URL}/api/admin/dashboard-stats`);
    if (res.status === 401) {
      console.log('  → Admin endpoint requires authentication (expected)');
      return { protected: true };
    }
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    return res.data;
  });

  // 10. FAMILY COLLABORATION TESTS
  console.log('\n👨‍👩‍👧‍👦 FAMILY COLLABORATION TESTS');
  console.log('================================');
  
  await runTest('Family', 'Create family group', async () => {
    const res = await fetchData(`${BASE_URL}/api/family-groups`, {
      method: 'POST',
      body: {
        name: 'Test Family',
        members: ['test@example.com']
      }
    });
    // May require auth
    if (res.status === 401) {
      console.log('  → Family features require authentication (expected)');
      return { protected: true };
    }
    return res.data;
  });

  // 11. HEALTH & MONITORING TESTS
  console.log('\n🔧 HEALTH & MONITORING TESTS');
  console.log('================================');
  
  await runTest('Health', 'API health check', async () => {
    const res = await fetchData(`${BASE_URL}/api/health`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log(`  → API status: ${res.data.status}`);
    return res.data;
  });

  await runTest('Health', 'Frontend accessibility', async () => {
    const res = await fetchData(`${BASE_URL_FRONTEND}/`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    console.log('  → Frontend is accessible');
    return { status: res.status };
  });

  // 12. DATABASE OPERATIONS TESTS
  console.log('\n💾 DATABASE OPERATIONS TESTS');
  console.log('================================');
  
  await runTest('Database', 'Community count verification', async () => {
    const res = await fetchData(`${BASE_URL}/api/communities/stats`);
    if (res.data.totalCommunities < 25000) {
      throw new Error(`Expected 25000+ communities, found ${res.data.totalCommunities}`);
    }
    console.log(`  → Verified ${res.data.totalCommunities} communities in database`);
    return res.data;
  });

  // SUMMARY
  console.log('\n\n📊 COMPREHENSIVE TEST SUMMARY');
  console.log('=====================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  console.log('\n📋 CATEGORY BREAKDOWN:');
  Object.entries(testResults).forEach(([category, results]) => {
    const total = results.passed + results.failed;
    const rate = ((results.passed / total) * 100).toFixed(0);
    console.log(`  ${category}: ${results.passed}/${total} (${rate}%)`);
  });
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS DETAILS:');
    failedTestDetails.forEach(t => {
      console.log(`  • [${t.category}] ${t.name}: ${t.error}`);
    });
  }
  
  // Platform health assessment
  console.log('\n🏥 PLATFORM HEALTH ASSESSMENT:');
  const healthScore = (passedTests / (passedTests + failedTests)) * 100;
  
  if (healthScore >= 90) {
    console.log('✅ EXCELLENT: Platform is fully operational');
  } else if (healthScore >= 75) {
    console.log('⚠️ GOOD: Platform is operational with minor issues');
  } else if (healthScore >= 50) {
    console.log('⚠️ FAIR: Platform has some functionality issues');
  } else {
    console.log('❌ CRITICAL: Platform has major functionality issues');
  }
  
  console.log('\n🎉 Testing completed at', new Date().toLocaleString());
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});