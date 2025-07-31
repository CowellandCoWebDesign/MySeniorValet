#!/usr/bin/env node

/**
 * Automated Test: Map Clustering Frontend/Backend Integration
 * Tests that clusters properly separate when zooming in
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const SF_BOUNDS = {
  west: -122.43,
  south: 37.76,
  east: -122.40,
  north: 37.79
};

let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];

// Helper to make HTTP requests
async function fetchData(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTest(name, testFn) {
  console.log(`\n🧪 TEST: ${name}`);
  try {
    await testFn();
    console.log(`✅ PASSED`);
    passedTests++;
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`);
    failedTests++;
    failedTestDetails.push({ name, error: error.message });
  }
}

// Main test suite
async function runTests() {
  console.log('🗺️  AUTOMATED MAP CLUSTERING TESTS');
  console.log('=====================================');
  console.log('Testing cluster separation on zoom...\n');

  // Test 1: Verify backend clustering API works
  await runTest('Backend API responds correctly', async () => {
    const url = `${BASE_URL}/api/communities/clusters?west=${SF_BOUNDS.west}&south=${SF_BOUNDS.south}&east=${SF_BOUNDS.east}&north=${SF_BOUNDS.north}&zoom=12`;
    const data = await fetchData(url);
    
    if (!data.clusters) {
      throw new Error('API did not return clusters property');
    }
    
    console.log(`  → API returned ${data.clusters.length} features`);
  });

  // Test 2: Verify clusters at zoom 12
  await runTest('Zoom 12 shows clusters', async () => {
    const url = `${BASE_URL}/api/communities/clusters?west=${SF_BOUNDS.west}&south=${SF_BOUNDS.south}&east=${SF_BOUNDS.east}&north=${SF_BOUNDS.north}&zoom=12`;
    const data = await fetchData(url);
    
    const clusters = data.clusters.filter(f => f.properties?.cluster);
    const markers = data.clusters.filter(f => !f.properties?.cluster);
    
    console.log(`  → Zoom 12: ${clusters.length} clusters, ${markers.length} individual markers`);
    
    if (clusters.length === 0) {
      throw new Error('No clusters found at zoom 12 - expected clustering');
    }
  });

  // Test 3: Verify individual markers at zoom 13
  await runTest('Zoom 13 shows individual markers', async () => {
    const url = `${BASE_URL}/api/communities/clusters?west=${SF_BOUNDS.west}&south=${SF_BOUNDS.south}&east=${SF_BOUNDS.east}&north=${SF_BOUNDS.north}&zoom=13`;
    const data = await fetchData(url);
    
    const clusters = data.clusters.filter(f => f.properties?.cluster);
    const markers = data.clusters.filter(f => !f.properties?.cluster);
    
    console.log(`  → Zoom 13: ${clusters.length} clusters, ${markers.length} individual markers`);
    
    if (markers.length === 0) {
      throw new Error('No individual markers at zoom 13');
    }
    
    if (clusters.length >= markers.length) {
      throw new Error(`Too many clusters at zoom 13: ${clusters.length} clusters vs ${markers.length} markers`);
    }
  });

  // Test 4: Verify progressive cluster separation
  await runTest('Clusters separate progressively when zooming', async () => {
    const zoomLevels = [11, 12, 13, 14];
    const results = [];
    
    for (const zoom of zoomLevels) {
      const url = `${BASE_URL}/api/communities/clusters?west=${SF_BOUNDS.west}&south=${SF_BOUNDS.south}&east=${SF_BOUNDS.east}&north=${SF_BOUNDS.north}&zoom=${zoom}`;
      const data = await fetchData(url);
      
      const clusters = data.clusters.filter(f => f.properties?.cluster).length;
      const markers = data.clusters.filter(f => !f.properties?.cluster).length;
      const ratio = markers / (clusters + markers);
      
      results.push({ zoom, clusters, markers, ratio });
      console.log(`  → Zoom ${zoom}: ${clusters} clusters, ${markers} markers (${(ratio * 100).toFixed(1)}% individual)`);
    }
    
    // Verify that individual marker ratio increases with zoom
    for (let i = 1; i < results.length; i++) {
      if (results[i].ratio < results[i-1].ratio) {
        throw new Error(`Individual marker ratio decreased from zoom ${results[i-1].zoom} to ${results[i].zoom}`);
      }
    }
  });

  // Test 5: Verify spatial search works
  await runTest('Spatial search returns communities', async () => {
    const url = `${BASE_URL}/api/communities/search/spatial?swLat=${SF_BOUNDS.south}&swLng=${SF_BOUNDS.west}&neLat=${SF_BOUNDS.north}&neLng=${SF_BOUNDS.east}&limit=500`;
    const data = await fetchData(url);
    
    if (!Array.isArray(data)) {
      throw new Error('Spatial search did not return an array');
    }
    
    console.log(`  → Spatial search found ${data.length} communities`);
    
    if (data.length === 0) {
      throw new Error('No communities found in spatial search');
    }
  });

  // Test 6: Compare zoom 11 vs zoom 15 for maximum difference
  await runTest('Zoom 11 to 15 shows dramatic clustering change', async () => {
    const zoom11Url = `${BASE_URL}/api/communities/clusters?west=${SF_BOUNDS.west}&south=${SF_BOUNDS.south}&east=${SF_BOUNDS.east}&north=${SF_BOUNDS.north}&zoom=11`;
    const zoom15Url = `${BASE_URL}/api/communities/clusters?west=${SF_BOUNDS.west}&south=${SF_BOUNDS.south}&east=${SF_BOUNDS.east}&north=${SF_BOUNDS.north}&zoom=15`;
    
    const data11 = await fetchData(zoom11Url);
    const data15 = await fetchData(zoom15Url);
    
    const clusters11 = data11.clusters.filter(f => f.properties?.cluster).length;
    const markers11 = data11.clusters.filter(f => !f.properties?.cluster).length;
    
    const clusters15 = data15.clusters.filter(f => f.properties?.cluster).length;
    const markers15 = data15.clusters.filter(f => !f.properties?.cluster).length;
    
    console.log(`  → Zoom 11: ${clusters11} clusters, ${markers11} markers`);
    console.log(`  → Zoom 15: ${clusters15} clusters, ${markers15} markers`);
    
    // At zoom 15, we should have way fewer clusters than at zoom 11
    if (clusters15 >= clusters11) {
      throw new Error('Zoom 15 should have fewer clusters than zoom 11');
    }
    
    // At zoom 15, we should have mostly individual markers
    if (markers15 < markers11 * 2) {
      throw new Error('Zoom 15 should show significantly more individual markers');
    }
  });

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTestDetails.forEach(t => {
      console.log(`  • ${t.name}: ${t.error}`);
    });
    console.log('\n⚠️  DIAGNOSIS: Map clustering has issues');
    console.log('\nPOSSIBLE CAUSES:');
    console.log('1. Frontend not updating when zoom changes');
    console.log('2. Map component not re-rendering with new cluster data');
    console.log('3. React Query cache not invalidating on zoom change');
  } else {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nThe backend clustering system is working perfectly:');
    console.log('• Clusters appear at low zoom levels (11-12)');
    console.log('• Clusters separate into individual markers at zoom 13+');
    console.log('• Progressive separation as zoom increases');
    console.log('\nIf clusters still don\'t separate in the UI:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify the map zoom events are firing');
    console.log('3. Check if cluster markers are updating in the DOM');
    console.log('4. Ensure React Query is refetching on zoom change');
  }
  
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});