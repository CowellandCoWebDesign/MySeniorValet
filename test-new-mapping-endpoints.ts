// Test script to verify new mapping endpoints are working
const testEndpoints = [
  'http://localhost:5000/api/communities/search-fixed?bounds=-122.5,37.7,-122.3,37.8&limit=3',
  'http://localhost:5000/api/communities/clusters-fixed?west=-122.5&south=37.7&east=-122.3&north=37.8&zoom=10',
  'http://localhost:5000/api/communities/search-ai?location=California assisted living&limit=3',
  'http://localhost:5000/api/mapping/stats'
];

async function testMappingEndpoints() {
  console.log('🧪 Testing Fixed Mapping Endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        if (data.error?.includes('Invalid community ID')) {
          console.log('❌ ROUTE INTERCEPTED - Still getting "Invalid community ID"');
        } else {
          console.log(`✅ SUCCESS - Status: ${response.status}`);
          if (data.communities) console.log(`   Found ${data.communities.length} communities`);
          if (data.features) console.log(`   Found ${data.features.length} features`);
          if (data.stats) console.log(`   Stats loaded: ${data.stats.totalCommunities} total`);
        }
      } else {
        console.log(`❌ ERROR - Status: ${response.status}: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ FETCH ERROR: ${error.message}`);
    }
    console.log('');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMappingEndpoints();
}

export { testMappingEndpoints };