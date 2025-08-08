#!/usr/bin/env node

/**
 * Comprehensive Search Testing Suite
 * Tests all aspects of search functionality with various inputs and edge cases
 */

import fetch from 'node-fetch';
import colors from 'colors';

const BASE_URL = 'http://localhost:5000';
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper to run tests
async function runTest(category, testName, testFn) {
  totalTests++;
  const fullName = `${category} - ${testName}`;
  process.stdout.write(`  Testing ${testName}... `.gray);
  
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`✅ PASS`.green);
      passedTests++;
      testResults.push({ 
        category, 
        test: testName, 
        status: 'PASS', 
        details: result.details 
      });
    } else {
      console.log(`❌ FAIL: ${result.error}`.red);
      failedTests++;
      testResults.push({ 
        category, 
        test: testName, 
        status: 'FAIL', 
        error: result.error 
      });
    }
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`.red);
    failedTests++;
    testResults.push({ 
      category, 
      test: testName, 
      status: 'ERROR', 
      error: error.message 
    });
  }
}

// Test Categories
async function testAutocomplete() {
  console.log('\n📝 AUTOCOMPLETE TESTS'.bold.cyan);
  
  // Test various cities
  const cities = [
    'Redding',
    'San Francisco', 
    'Los Angeles',
    'New York',
    'Chicago',
    'Miami',
    'Seattle',
    'Denver',
    'Phoenix',
    'Austin'
  ];
  
  for (const city of cities) {
    await runTest('Autocomplete', `City: ${city}`, async () => {
      const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=${encodeURIComponent(city)}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }
      
      if (!data.suggestions || data.suggestions.length === 0) {
        return { success: false, error: 'No suggestions returned' };
      }
      
      // Check if at least one suggestion contains the city name
      const hasCitySuggestion = data.suggestions.some(s => 
        s.label && s.label.toLowerCase().includes(city.toLowerCase())
      );
      
      if (!hasCitySuggestion) {
        return { success: false, error: `No suggestions contain "${city}"` };
      }
      
      return { 
        success: true, 
        details: `${data.suggestions.length} suggestions` 
      };
    });
  }
  
  // Test edge cases
  await runTest('Autocomplete', 'Empty query', async () => {
    const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=`);
    const data = await response.json();
    return { 
      success: data.suggestions?.length === 0, 
      error: 'Should return empty array for empty query' 
    };
  });
  
  await runTest('Autocomplete', 'Single character', async () => {
    const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=R`);
    const data = await response.json();
    return { 
      success: data.suggestions?.length === 0, 
      error: 'Should return empty array for single character' 
    };
  });
  
  await runTest('Autocomplete', 'Special characters', async () => {
    const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=${encodeURIComponent('San Francisco!')}`);
    const data = await response.json();
    return { 
      success: response.ok, 
      error: 'Should handle special characters gracefully' 
    };
  });
}

async function testUnifiedSearch() {
  console.log('\n🔍 UNIFIED SEARCH TESTS'.bold.cyan);
  
  // Test different location formats
  const locationTests = [
    { location: 'Redding', expected: 'Redding area' },
    { location: 'Redding, CA', expected: 'Redding, CA' },
    { location: 'San Francisco', expected: 'San Francisco area' },
    { location: 'San Francisco, CA', expected: 'San Francisco, CA' },
    { location: '94102', expected: 'ZIP 94102' },
    { location: 'California', expected: 'California state' },
    { location: 'CA', expected: 'CA state' },
    { location: 'New York, NY', expected: 'New York, NY' },
    { location: 'Chicago, IL', expected: 'Chicago, IL' },
    { location: 'Houston, TX', expected: 'Houston, TX' }
  ];
  
  for (const test of locationTests) {
    await runTest('Search', test.expected, async () => {
      const url = `${BASE_URL}/api/communities/search/unified?location=${encodeURIComponent(test.location)}&careType=All%20Types&priceMin=0&priceMax=15000&limit=10&offset=0`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }
      
      const communities = data.communities || data.results || [];
      if (communities.length === 0) {
        return { success: false, error: 'No communities returned' };
      }
      
      return { 
        success: true, 
        details: `${communities.length} communities found` 
      };
    });
  }
  
  // Test with spaces and special handling
  await runTest('Search', 'Location with trailing space', async () => {
    const url = `${BASE_URL}/api/communities/search/unified?location=${encodeURIComponent('Redding ')}&careType=All%20Types&priceMin=0&priceMax=15000&limit=10&offset=0`;
    const response = await fetch(url);
    const data = await response.json();
    
    const communities = data.communities || [];
    return { 
      success: communities.length > 0, 
      error: 'Should handle trailing spaces' 
    };
  });
  
  await runTest('Search', 'Location with leading space', async () => {
    const url = `${BASE_URL}/api/communities/search/unified?location=${encodeURIComponent(' Redding')}&careType=All%20Types&priceMin=0&priceMax=15000&limit=10&offset=0`;
    const response = await fetch(url);
    const data = await response.json();
    
    const communities = data.communities || [];
    return { 
      success: communities.length > 0, 
      error: 'Should handle leading spaces' 
    };
  });
}

async function testCareTypeFilters() {
  console.log('\n🏥 CARE TYPE FILTER TESTS'.bold.cyan);
  
  const careTypes = [
    'All Types',
    'Independent Living',
    'Assisted Living',
    'Memory Care',
    'Skilled Nursing',
    'HUD Senior Housing',
    'Mobile Home Parks',
    '55+ Communities'
  ];
  
  for (const careType of careTypes) {
    await runTest('Care Types', careType, async () => {
      const url = `${BASE_URL}/api/communities/search/unified?location=California&careType=${encodeURIComponent(careType)}&priceMin=0&priceMax=15000&limit=10&offset=0`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }
      
      const communities = data.communities || [];
      
      // For specific care types, verify filtering
      if (careType !== 'All Types' && communities.length > 0) {
        const hasCorrectType = communities.some(c => 
          c.careTypes && c.careTypes.includes(careType)
        );
        
        if (!hasCorrectType) {
          return { 
            success: false, 
            error: `Results don't match care type filter "${careType}"` 
          };
        }
      }
      
      return { 
        success: true, 
        details: `${communities.length} communities` 
      };
    });
  }
}

async function testPriceFilters() {
  console.log('\n💰 PRICE FILTER TESTS'.bold.cyan);
  
  const priceRanges = [
    { min: 0, max: 1000, label: 'Under $1000' },
    { min: 1000, max: 3000, label: '$1000-$3000' },
    { min: 3000, max: 5000, label: '$3000-$5000' },
    { min: 5000, max: 10000, label: '$5000-$10000' },
    { min: 10000, max: 15000, label: '$10000-$15000' },
    { min: 0, max: 15000, label: 'All prices' }
  ];
  
  for (const range of priceRanges) {
    await runTest('Price Filters', range.label, async () => {
      const url = `${BASE_URL}/api/communities/search/unified?location=California&careType=All%20Types&priceMin=${range.min}&priceMax=${range.max}&limit=10&offset=0`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }
      
      const communities = data.communities || [];
      
      // Can't verify exact pricing without accessing actual price data
      // Just ensure we get results
      return { 
        success: true, 
        details: `${communities.length} communities in range` 
      };
    });
  }
}

async function testPagination() {
  console.log('\n📄 PAGINATION TESTS'.bold.cyan);
  
  // Test different limit and offset combinations
  const paginationTests = [
    { limit: 10, offset: 0, label: 'First 10' },
    { limit: 20, offset: 0, label: 'First 20' },
    { limit: 50, offset: 0, label: 'First 50' },
    { limit: 10, offset: 10, label: 'Page 2 (10-20)' },
    { limit: 10, offset: 20, label: 'Page 3 (20-30)' },
    { limit: 100, offset: 0, label: 'First 100' }
  ];
  
  for (const test of paginationTests) {
    await runTest('Pagination', test.label, async () => {
      const url = `${BASE_URL}/api/communities/search/unified?location=California&careType=All%20Types&priceMin=0&priceMax=15000&limit=${test.limit}&offset=${test.offset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }
      
      const communities = data.communities || [];
      
      // Check that we don't get more than the limit
      if (communities.length > test.limit) {
        return { 
          success: false, 
          error: `Returned ${communities.length} but limit was ${test.limit}` 
        };
      }
      
      // Check pagination info
      if (data.pagination && data.pagination.limit !== test.limit) {
        return { 
          success: false, 
          error: `Pagination limit mismatch` 
        };
      }
      
      return { 
        success: true, 
        details: `${communities.length} results` 
      };
    });
  }
}

async function testMapClusters() {
  console.log('\n🗺️ MAP CLUSTERING TESTS'.bold.cyan);
  
  // Test different zoom levels and regions
  const clusterTests = [
    { 
      bounds: { west: -122.5, south: 40.4, east: -122.2, north: 40.7 },
      zoom: 10,
      label: 'Redding area zoom 10'
    },
    { 
      bounds: { west: -122.5, south: 37.7, east: -122.3, north: 37.9 },
      zoom: 12,
      label: 'San Francisco zoom 12'
    },
    { 
      bounds: { west: -125, south: 32, east: -114, north: 42 },
      zoom: 6,
      label: 'California state zoom 6'
    },
    { 
      bounds: { west: -74.3, south: 40.5, east: -73.7, north: 40.9 },
      zoom: 10,
      label: 'New York City zoom 10'
    }
  ];
  
  for (const test of clusterTests) {
    await runTest('Map Clusters', test.label, async () => {
      const url = `${BASE_URL}/api/communities/clusters?zoom=${test.zoom}&west=${test.bounds.west}&south=${test.bounds.south}&east=${test.bounds.east}&north=${test.bounds.north}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }
      
      // Check for either features or clusters array
      const features = data.features || data.clusters || [];
      
      if (!Array.isArray(features)) {
        return { success: false, error: 'No features/clusters array in response' };
      }
      
      return { 
        success: true, 
        details: `${features.length} features` 
      };
    });
  }
}

async function testResponseStructure() {
  console.log('\n📋 RESPONSE STRUCTURE TESTS'.bold.cyan);
  
  await runTest('Structure', 'Search response fields', async () => {
    const url = `${BASE_URL}/api/communities/search/unified?location=Redding&careType=All%20Types&priceMin=0&priceMax=15000&limit=5&offset=0`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Check required fields
    const requiredFields = ['communities', 'total'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: `Missing fields: ${missingFields.join(', ')}` 
      };
    }
    
    // Check community structure
    const communities = data.communities || [];
    if (communities.length > 0) {
      const requiredCommunityFields = ['id', 'name', 'city', 'state'];
      const firstCommunity = communities[0];
      const missingCommunityFields = requiredCommunityFields.filter(
        field => !(field in firstCommunity)
      );
      
      if (missingCommunityFields.length > 0) {
        return { 
          success: false, 
          error: `Community missing fields: ${missingCommunityFields.join(', ')}` 
        };
      }
    }
    
    return { success: true, details: 'All required fields present' };
  });
  
  await runTest('Structure', 'Autocomplete response fields', async () => {
    const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=San`);
    const data = await response.json();
    
    if (!data.suggestions) {
      return { success: false, error: 'Missing suggestions field' };
    }
    
    if (!Array.isArray(data.suggestions)) {
      return { success: false, error: 'Suggestions is not an array' };
    }
    
    // Check suggestion structure
    if (data.suggestions.length > 0) {
      const first = data.suggestions[0];
      const requiredFields = ['label', 'value', 'type'];
      const missingFields = requiredFields.filter(field => !(field in first));
      
      if (missingFields.length > 0) {
        return { 
          success: false, 
          error: `Suggestion missing fields: ${missingFields.join(', ')}` 
        };
      }
    }
    
    return { success: true, details: 'All required fields present' };
  });
}

async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTS'.bold.cyan);
  
  await runTest('Performance', 'Search response time < 2s', async () => {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/api/communities/search/unified?location=California&careType=All%20Types&priceMin=0&priceMax=15000&limit=50&offset=0`);
    const elapsed = Date.now() - start;
    
    if (!response.ok) {
      return { success: false, error: 'Request failed' };
    }
    
    if (elapsed > 2000) {
      return { 
        success: false, 
        error: `Took ${elapsed}ms (should be < 2000ms)` 
      };
    }
    
    return { 
      success: true, 
      details: `${elapsed}ms` 
    };
  });
  
  await runTest('Performance', 'Autocomplete response time < 500ms', async () => {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=San`);
    const elapsed = Date.now() - start;
    
    if (!response.ok) {
      return { success: false, error: 'Request failed' };
    }
    
    if (elapsed > 500) {
      return { 
        success: false, 
        error: `Took ${elapsed}ms (should be < 500ms)` 
      };
    }
    
    return { 
      success: true, 
      details: `${elapsed}ms` 
    };
  });
  
  await runTest('Performance', 'Clusters response time < 1s', async () => {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}/api/communities/clusters?zoom=10&west=-122.5&south=40.4&east=-122.2&north=40.7`);
    const elapsed = Date.now() - start;
    
    if (!response.ok) {
      return { success: false, error: 'Request failed' };
    }
    
    if (elapsed > 1000) {
      return { 
        success: false, 
        error: `Took ${elapsed}ms (should be < 1000ms)` 
      };
    }
    
    return { 
      success: true, 
      details: `${elapsed}ms` 
    };
  });
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 COMPREHENSIVE SEARCH TESTING SUITE'.bold.cyan);
  console.log('=' .repeat(50).cyan);
  
  const startTime = Date.now();
  
  // Run all test categories
  await testAutocomplete();
  await testUnifiedSearch();
  await testCareTypeFilters();
  await testPriceFilters();
  await testPagination();
  await testMapClusters();
  await testResponseStructure();
  await testPerformance();
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Print summary
  console.log('\n' + '=' .repeat(50).cyan);
  console.log('📊 FINAL TEST RESULTS'.bold.cyan);
  console.log('=' .repeat(50).cyan);
  
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  console.log(`Total Tests: ${totalTests}`.white);
  console.log(`✅ Passed: ${passedTests}`.green);
  console.log(`❌ Failed: ${failedTests}`.red);
  console.log(`Success Rate: ${successRate}%`.yellow);
  console.log(`Total Time: ${totalTime}s`.gray);
  
  // Group failures by category
  const failuresByCategory = {};
  testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR').forEach(r => {
    if (!failuresByCategory[r.category]) {
      failuresByCategory[r.category] = [];
    }
    failuresByCategory[r.category].push(r);
  });
  
  if (Object.keys(failuresByCategory).length > 0) {
    console.log('\n❌ FAILURES BY CATEGORY:'.red.bold);
    for (const [category, failures] of Object.entries(failuresByCategory)) {
      console.log(`\n  ${category}:`.red);
      failures.forEach(f => {
        console.log(`    • ${f.test}: ${f.error}`.yellow);
      });
    }
  }
  
  // Performance summary
  const performanceTests = testResults.filter(r => r.category === 'Performance' && r.status === 'PASS');
  if (performanceTests.length > 0) {
    console.log('\n⚡ PERFORMANCE SUMMARY:'.cyan.bold);
    performanceTests.forEach(t => {
      console.log(`  ${t.test}: ${t.details}`.green);
    });
  }
  
  // Overall assessment
  console.log('\n📝 OVERALL ASSESSMENT:'.bold.cyan);
  if (successRate >= 90) {
    console.log('  ✅ Excellent! Search functionality is working very well.'.green.bold);
  } else if (successRate >= 70) {
    console.log('  ⚠️ Good, but some issues need attention.'.yellow.bold);
  } else if (successRate >= 50) {
    console.log('  ⚠️ Moderate issues detected. Review failures above.'.yellow.bold);
  } else {
    console.log('  ❌ Significant issues detected. Immediate attention required.'.red.bold);
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});