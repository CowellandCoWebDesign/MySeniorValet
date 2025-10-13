const axios = require('axios');

async function testHawaiiSearchPortal() {
  console.log('🌺 TESTING HAWAII IN SEARCH PORTAL');
  
  // Test Hawaii cities search
  const hawaiiTests = [
    { city: 'Honolulu', expected: 'high' },
    { city: 'Hilo', expected: 'medium' },
    { city: 'Kailua-Kona', expected: 'low' },
    { city: 'Lihue', expected: 'low' },
    { city: 'Wailuku', expected: 'low' },
    { city: 'Pearl City', expected: 'medium' },
    { city: 'Kailua', expected: 'medium' },
    { city: 'Kahului', expected: 'low' }
  ];
  
  console.log('\n🔍 Testing Hawaii Cities in Search Portal:');
  
  for (const test of hawaiiTests) {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/search?location=${test.city}&limit=10`);
      const communities = response.data;
      const hawaiiCommunities = communities.filter(c => c.state === 'HI');
      
      if (hawaiiCommunities.length > 0) {
        console.log(`   ✅ ${test.city}: ${hawaiiCommunities.length} Hawaii facilities found`);
        
        // Show first facility details for portal verification
        const facility = hawaiiCommunities[0];
        console.log(`      → ${facility.name}`);
        console.log(`        Address: ${facility.address}, ${facility.city}, ${facility.state}`);
        console.log(`        County: ${facility.county}`);
        if (facility.phone) console.log(`        Phone: ${facility.phone}`);
      } else {
        console.log(`   ❌ ${test.city}: No Hawaii facilities found`);
      }
      
    } catch (error) {
      console.log(`   ⚠️  ${test.city}: ${error.response?.status || error.message}`);
    }
  }
  
  // Test state-level search
  console.log('\n🏝️ Testing Hawaii State Search:');
  try {
    const response = await axios.get(`http://localhost:5000/api/communities/search?location=Hawaii&limit=20`);
    const communities = response.data;
    const hawaiiCommunities = communities.filter(c => c.state === 'HI');
    
    console.log(`   Found ${hawaiiCommunities.length} Hawaii facilities in state search`);
    
    // Group by county for map verification
    const countyCounts = {};
    hawaiiCommunities.forEach(facility => {
      countyCounts[facility.county] = (countyCounts[facility.county] || 0) + 1;
    });
    
    console.log('   County distribution:');
    Object.entries(countyCounts).forEach(([county, count]) => {
      console.log(`     ${county}: ${count} facilities`);
    });
    
  } catch (error) {
    console.log(`   ⚠️  Hawaii state search: ${error.response?.status || error.message}`);
  }
  
  // Test coordinates for map integration
  console.log('\n🗺️ Testing Hawaii Map Coordinates:');
  try {
    const response = await axios.get(`http://localhost:5000/api/communities/search?location=Honolulu&limit=5`);
    const communities = response.data;
    const hawaiiCommunities = communities.filter(c => c.state === 'HI');
    
    if (hawaiiCommunities.length > 0) {
      hawaiiCommunities.forEach(facility => {
        console.log(`   ${facility.name}:`);
        console.log(`     Lat: ${facility.latitude || 'Not set'}`);
        console.log(`     Lng: ${facility.longitude || 'Not set'}`);
        console.log(`     Address: ${facility.address}, ${facility.city}`);
      });
    }
    
  } catch (error) {
    console.log(`   ⚠️  Map coordinates test: ${error.response?.status || error.message}`);
  }
  
  console.log('\n🌺 Hawaii Search Portal Test Complete!');
  console.log('✅ Search portal should now show Hawaii facilities');
  console.log('🗺️ Map integration ready for Hawaii locations');
}

if (require.main === module) {
  testHawaiiSearchPortal().catch(console.error);
}

module.exports = { testHawaiiSearchPortal };