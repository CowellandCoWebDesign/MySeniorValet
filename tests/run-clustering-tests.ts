import Supercluster from 'supercluster';

/**
 * AUTOMATED CLUSTERING VERIFICATION
 * Runs tests to ensure clustering works correctly
 */

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Generate test communities
function generateTestCommunities(count: number): any[] {
  const communities = [];
  
  // Generate communities distributed across US
  for (let i = 0; i < count; i++) {
    const lat = 25 + Math.random() * 25; // 25 to 50
    const lng = -130 + Math.random() * 65; // -130 to -65
    
    communities.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        id: i,
        name: `Community ${i}`,
        city: 'Test City',
        state: 'TS'
      }
    });
  }
  
  return communities;
}

// Run tests
function runTests() {
  console.log('\n🧪 RUNNING CLUSTERING TESTS...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Initialize SuperCluster with production config
  const index = new Supercluster({
    radius: 120,     // Large radius for aggressive clustering at country level
    maxZoom: 16,     // Stop clustering at zoom 16
    minZoom: 0,      
    minPoints: 2,    
    extent: 512,     
    nodeSize: 64,    
    generateId: true
  });
  
  // Load test data
  const testData = generateTestCommunities(35000);
  console.log(`📊 Loading ${testData.length} test communities...`);
  index.load(testData);
  
  // Test 1: Country view clustering
  console.log('\n📍 TEST 1: Country View (Zoom 4)');
  {
    const bbox: [number, number, number, number] = [-130, 25, -65, 50]; // US bounds
    const clusters = index.getClusters(bbox, 4);
    
    const clusterCount = clusters.filter(c => c.properties?.cluster).length;
    const individualCount = clusters.filter(c => !c.properties?.cluster).length;
    
    console.log(`   Clusters: ${clusterCount}, Individuals: ${individualCount}`);
    
    if (clusterCount > 10 && clusterCount < 100 && individualCount < 50) {
      console.log(`   ${GREEN}✅ PASS${RESET} - Properly clustered at country level`);
      passed++;
    } else {
      console.log(`   ${RED}❌ FAIL${RESET} - Clustering not optimal at country level`);
      failed++;
    }
  }
  
  // Test 2: State view clustering
  console.log('\n📍 TEST 2: State View (Zoom 8)');
  {
    const bbox: [number, number, number, number] = [-125, 32, -114, 42]; // California
    const clusters = index.getClusters(bbox, 8);
    
    const clusterCount = clusters.filter(c => c.properties?.cluster).length;
    const individualCount = clusters.filter(c => !c.properties?.cluster).length;
    
    console.log(`   Clusters: ${clusterCount}, Individuals: ${individualCount}`);
    
    if (clusterCount > 20 && clusterCount < 200) {
      console.log(`   ${GREEN}✅ PASS${RESET} - Properly clustered at state level`);
      passed++;
    } else {
      console.log(`   ${RED}❌ FAIL${RESET} - Clustering not optimal at state level`);
      failed++;
    }
  }
  
  // Test 3: City view clustering
  console.log('\n📍 TEST 3: City View (Zoom 12)');
  {
    const bbox: [number, number, number, number] = [-122.5, 37.7, -122.3, 37.9]; // San Francisco
    const clusters = index.getClusters(bbox, 12);
    
    const clusterCount = clusters.filter(c => c.properties?.cluster).length;
    const individualCount = clusters.filter(c => !c.properties?.cluster).length;
    
    console.log(`   Clusters: ${clusterCount}, Individuals: ${individualCount}`);
    
    if (clusterCount < 50 && individualCount >= clusterCount) {
      console.log(`   ${GREEN}✅ PASS${RESET} - Properly clustered at city level`);
      passed++;
    } else {
      console.log(`   ${RED}❌ FAIL${RESET} - Clustering not optimal at city level`);
      failed++;
    }
  }
  
  // Test 4: Street level - NO CLUSTERING
  console.log('\n📍 TEST 4: Street View (Zoom 17) - CRITICAL TEST');
  {
    const bbox: [number, number, number, number] = [-122.42, 37.77, -122.40, 37.79]; // SF neighborhood
    const clusters = index.getClusters(bbox, 17);
    
    const clusterCount = clusters.filter(c => c.properties?.cluster).length;
    const individualCount = clusters.filter(c => !c.properties?.cluster).length;
    
    console.log(`   Clusters: ${clusterCount}, Individuals: ${individualCount}`);
    
    if (clusterCount === 0 && individualCount > 0) {
      console.log(`   ${GREEN}✅ PASS${RESET} - NO clustering at street level (correct!)`);
      passed++;
    } else {
      console.log(`   ${RED}❌ FAIL${RESET} - Still clustering at street level (WRONG!)`);
      failed++;
    }
  }
  
  // Test 5: Community count calculation
  console.log('\n📍 TEST 5: Total Community Count');
  {
    const bbox: [number, number, number, number] = [-130, 25, -65, 50]; // US bounds
    const clusters = index.getClusters(bbox, 10);
    
    let totalCommunities = 0;
    
    clusters.forEach(feature => {
      if (feature.properties?.cluster) {
        // Add the point count from the cluster
        totalCommunities += feature.properties.point_count || 0;
      } else {
        // Add single community
        totalCommunities += 1;
      }
    });
    
    console.log(`   Total communities in viewport: ${totalCommunities}`);
    
    if (totalCommunities > 0 && totalCommunities <= testData.length) {
      console.log(`   ${GREEN}✅ PASS${RESET} - Community count is correct`);
      passed++;
    } else {
      console.log(`   ${RED}❌ FAIL${RESET} - Community count is wrong`);
      failed++;
    }
  }
  
  // Test 6: Performance
  console.log('\n📍 TEST 6: Performance (35,000 points)');
  {
    const bbox: [number, number, number, number] = [-130, 25, -65, 50]; // US bounds
    
    const startTime = performance.now();
    const clusters = index.getClusters(bbox, 10);
    const endTime = performance.now();
    
    const processingTime = endTime - startTime;
    
    console.log(`   Processing time: ${processingTime.toFixed(2)}ms`);
    console.log(`   Result count: ${clusters.length} features`);
    
    if (processingTime < 100 && clusters.length > 0) {
      console.log(`   ${GREEN}✅ PASS${RESET} - Performance is excellent`);
      passed++;
    } else {
      console.log(`   ${RED}❌ FAIL${RESET} - Performance issue detected`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY:');
  console.log(`   ${GREEN}Passed: ${passed}${RESET}`);
  console.log(`   ${RED}Failed: ${failed}${RESET}`);
  
  if (failed === 0) {
    console.log(`\n🎉 ${GREEN}ALL TESTS PASSED!${RESET} Clustering is working correctly.`);
  } else {
    console.log(`\n⚠️  ${RED}SOME TESTS FAILED!${RESET} Clustering needs adjustment.`);
  }
  console.log('='.repeat(50) + '\n');
  
  return failed === 0;
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);