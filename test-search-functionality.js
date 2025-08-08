#!/usr/bin/env node

/**
 * Automated Search Functionality Test Suite
 * Tests the complete search flow from input to map update
 */

import fetch from 'node-fetch';
import colors from 'colors';

const BASE_URL = 'http://localhost:5000';
let testResults = [];
let passedTests = 0;
let failedTests = 0;

// Test helper functions
async function runTest(testName, testFn) {
  console.log(`\n📝 Running: ${testName}`.cyan);
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`✅ PASSED: ${testName}`.green);
      passedTests++;
      testResults.push({ test: testName, status: 'PASSED', details: result.details });
    } else {
      console.log(`❌ FAILED: ${testName}`.red);
      console.log(`   Reason: ${result.error}`.yellow);
      failedTests++;
      testResults.push({ test: testName, status: 'FAILED', error: result.error });
    }
  } catch (error) {
    console.log(`❌ ERROR: ${testName}`.red);
    console.log(`   Error: ${error.message}`.yellow);
    failedTests++;
    testResults.push({ test: testName, status: 'ERROR', error: error.message });
  }
}

// Test 1: Autocomplete API
async function testAutocompleteAPI() {
  const response = await fetch(`${BASE_URL}/api/autocomplete/suggestions?query=Redding`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  if (!data.suggestions || !Array.isArray(data.suggestions)) {
    return { success: false, error: 'No suggestions array in response' };
  }
  
  const reddingSuggestion = data.suggestions.find(s => 
    s.value && s.value.toLowerCase().includes('redding')
  );
  
  if (!reddingSuggestion) {
    return { 
      success: false, 
      error: `No Redding suggestion found. Got: ${JSON.stringify(data.suggestions.slice(0, 3))}` 
    };
  }
  
  return { 
    success: true, 
    details: `Found ${data.suggestions.length} suggestions, including Redding` 
  };
}

// Test 2: Unified Search API with location
async function testUnifiedSearchAPI() {
  const locations = ['Redding', 'Redding, CA', 'San Francisco', 'San Francisco, CA'];
  const results = {};
  
  for (const location of locations) {
    const url = `${BASE_URL}/api/communities/search/unified?location=${encodeURIComponent(location)}&careType=All%20Types&priceMin=0&priceMax=15000&limit=50&offset=0`;
    console.log(`   Testing location: "${location}"`.gray);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      results[location] = { error: `API returned ${response.status}` };
      continue;
    }
    
    const resultCount = data.communities?.length || data.results?.length || 0;
    results[location] = { 
      count: resultCount,
      hasResults: resultCount > 0,
      sample: data.communities?.[0]?.name || data.results?.[0]?.name || 'No results'
    };
  }
  
  // Check if any location returned results
  const successfulLocations = Object.entries(results).filter(([_, r]) => r.hasResults);
  
  if (successfulLocations.length === 0) {
    return { 
      success: false, 
      error: `No locations returned results. Details: ${JSON.stringify(results, null, 2)}` 
    };
  }
  
  return { 
    success: true, 
    details: `${successfulLocations.length}/${locations.length} locations returned results: ${JSON.stringify(results, null, 2)}` 
  };
}

// Test 3: Search API response structure
async function testSearchResponseStructure() {
  const response = await fetch(`${BASE_URL}/api/communities/search/unified?location=California&careType=All%20Types&priceMin=0&priceMax=15000&limit=10&offset=0`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  // Check response structure (handle both 'communities' and 'results' property names)
  const items = data.communities || data.results || [];
  const checks = {
    hasResults: Array.isArray(items),
    hasTotal: typeof data.total === 'number' || typeof data.total === 'string',
    resultsHaveIds: items.length > 0 && items.every(r => r.id),
    resultsHaveLocation: items.length > 0 && items.every(r => r.latitude && r.longitude),
    resultsHaveNames: items.length > 0 && items.every(r => r.name),
  };
  
  const failedChecks = Object.entries(checks).filter(([_, passed]) => !passed);
  
  if (failedChecks.length > 0) {
    return { 
      success: false, 
      error: `Failed structure checks: ${failedChecks.map(([name]) => name).join(', ')}. Data: ${JSON.stringify(data).substring(0, 200)}` 
    };
  }
  
  return { 
    success: true, 
    details: `Valid structure with ${data.results.length} results` 
  };
}

// Test 4: Geocoding verification
async function testGeocodingForLocation() {
  const testLocation = 'Redding, CA';
  const response = await fetch(`${BASE_URL}/api/communities/search/unified?location=${encodeURIComponent(testLocation)}&careType=All%20Types&priceMin=0&priceMax=15000&limit=50&offset=0`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  const items = data.communities || data.results || [];
  
  if (!items || items.length === 0) {
    return { success: false, error: 'No results returned for Redding, CA' };
  }
  
  // Check if results are actually near Redding (latitude ~40.5865, longitude ~-122.3917)
  const reddingLat = 40.5865;
  const reddingLng = -122.3917;
  const maxDistance = 50; // miles
  
  const nearbyResults = items.filter(r => {
    if (!r.latitude || !r.longitude) return false;
    const lat = parseFloat(r.latitude);
    const lng = parseFloat(r.longitude);
    // Simple distance check (not exact, but good enough for testing)
    const latDiff = Math.abs(lat - reddingLat);
    const lngDiff = Math.abs(lng - reddingLng);
    const approxDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // rough miles conversion
    return approxDistance <= maxDistance;
  });
  
  if (nearbyResults.length === 0) {
    return { 
      success: false, 
      error: `No results near Redding. First result: ${items[0]?.city}, ${items[0]?.state} at ${items[0]?.latitude}, ${items[0]?.longitude}` 
    };
  }
  
  return { 
    success: true, 
    details: `Found ${nearbyResults.length}/${items.length} results near Redding, CA` 
  };
}

// Test 5: Clusters API (what the map uses)
async function testClustersAPI() {
  // Test bounds around Redding, CA
  const bounds = {
    west: -122.5,
    east: -122.2,
    south: 40.4,
    north: 40.7
  };
  
  const url = `${BASE_URL}/api/communities/clusters?zoom=10&west=${bounds.west}&south=${bounds.south}&east=${bounds.east}&north=${bounds.north}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  if (!data.features || !Array.isArray(data.features)) {
    return { success: false, error: 'No features array in response' };
  }
  
  const communities = data.features.filter(f => !f.properties?.cluster);
  const clusters = data.features.filter(f => f.properties?.cluster);
  
  if (data.features.length === 0) {
    return { 
      success: false, 
      error: `No features returned for Redding area bounds` 
    };
  }
  
  return { 
    success: true, 
    details: `Found ${data.features.length} features (${communities.length} communities, ${clusters.length} clusters)` 
  };
}

// Test 6: Database direct query
async function testDatabaseQuery() {
  // Query communities directly to ensure they exist
  const response = await fetch(`${BASE_URL}/api/communities/count`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  const count = parseInt(data.count) || 0;
  
  if (count === 0) {
    return { success: false, error: 'No communities in database' };
  }
  
  // Now check if Redding communities exist
  const searchResponse = await fetch(`${BASE_URL}/api/communities/search/unified?location=Redding&careType=All%20Types&priceMin=0&priceMax=15000&limit=100&offset=0`);
  const searchData = await searchResponse.json();
  
  const reddingCount = searchData.results?.filter(r => 
    r.city?.toLowerCase().includes('redding') || 
    r.address?.toLowerCase().includes('redding')
  ).length || 0;
  
  return { 
    success: true, 
    details: `Database has ${count} total communities, ${reddingCount} in Redding area` 
  };
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 STARTING AUTOMATED SEARCH FUNCTIONALITY TESTS'.bold.cyan);
  console.log('================================================'.cyan);
  
  // Run all tests
  await runTest('Autocomplete API', testAutocompleteAPI);
  await runTest('Unified Search API', testUnifiedSearchAPI);
  await runTest('Search Response Structure', testSearchResponseStructure);
  await runTest('Geocoding Verification', testGeocodingForLocation);
  await runTest('Clusters API (Map Data)', testClustersAPI);
  await runTest('Database Query', testDatabaseQuery);
  
  // Print summary
  console.log('\n================================================'.cyan);
  console.log('📊 TEST SUMMARY'.bold.cyan);
  console.log('================================================'.cyan);
  console.log(`Total Tests: ${passedTests + failedTests}`.white);
  console.log(`✅ Passed: ${passedTests}`.green);
  console.log(`❌ Failed: ${failedTests}`.red);
  console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`.yellow);
  
  // Print detailed results for failed tests
  if (failedTests > 0) {
    console.log('\n❌ FAILED TEST DETAILS:'.red.bold);
    testResults.filter(r => r.status === 'FAILED' || r.status === 'ERROR').forEach(r => {
      console.log(`\n  ${r.test}:`.red);
      console.log(`    ${r.error}`.yellow);
    });
  }
  
  // Print recommendations
  console.log('\n💡 RECOMMENDATIONS:'.bold.yellow);
  if (failedTests > 0) {
    const failedTestNames = testResults.filter(r => r.status === 'FAILED').map(r => r.test);
    
    if (failedTestNames.includes('Unified Search API')) {
      console.log('  - The search API is not returning results for locations');
      console.log('  - Check the geocoding service and location parsing');
    }
    
    if (failedTestNames.includes('Geocoding Verification')) {
      console.log('  - Results are not properly geocoded to the searched location');
      console.log('  - Verify the geocoding API integration');
    }
    
    if (failedTestNames.includes('Clusters API (Map Data)')) {
      console.log('  - The map clustering API is not returning data');
      console.log('  - Check the Supercluster service initialization');
    }
  } else {
    console.log('  ✅ All tests passed! The search functionality is working correctly.'.green);
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});