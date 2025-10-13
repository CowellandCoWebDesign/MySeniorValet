const axios = require('axios');

async function testFinalStatewideSearch() {
  console.log('🔍 TESTING FINAL TEXAS STATEWIDE SEARCH COVERAGE');
  
  // Test diverse Texas locations including rural areas
  const testLocations = [
    // Major cities
    { name: 'Houston', expected: 10 },
    { name: 'Dallas', expected: 10 },
    { name: 'Austin', expected: 10 },
    { name: 'San Antonio', expected: 10 },
    { name: 'Fort Worth', expected: 10 },
    
    // Medium cities  
    { name: 'El Paso', expected: 5 },
    { name: 'Corpus Christi', expected: 5 },
    { name: 'Lubbock', expected: 5 },
    { name: 'Amarillo', expected: 5 },
    { name: 'Beaumont', expected: 5 },
    
    // Small cities and rural areas
    { name: 'Alpine', expected: 1 },
    { name: 'Marfa', expected: 1 },
    { name: 'Big Spring', expected: 1 },
    { name: 'Brownwood', expected: 1 },
    { name: 'Palestine', expected: 1 },
    { name: 'Nacogdoches', expected: 1 },
    { name: 'Lufkin', expected: 1 },
    { name: 'Marshall', expected: 1 },
    { name: 'Paris', expected: 1 },
    { name: 'Sherman', expected: 1 },
    
    // Very small towns
    { name: 'Junction', expected: 1 },
    { name: 'Pecos', expected: 1 },
    { name: 'Fredericksburg', expected: 1 },
    { name: 'Kerrville', expected: 1 },
    { name: 'Uvalde', expected: 1 }
  ];
  
  let totalFound = 0;
  let locationsWithResults = 0;
  
  console.log('\n🌟 Testing Search Results:');
  
  for (const location of testLocations) {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/search?location=${location.name}&limit=10`);
      const communities = response.data;
      const texasCommunities = communities.filter(c => c.state === 'TX');
      
      totalFound += texasCommunities.length;
      if (texasCommunities.length > 0) {
        locationsWithResults++;
        console.log(`   ✅ ${location.name}: ${texasCommunities.length} TX facilities`);
        if (texasCommunities.length > 0) {
          console.log(`      Example: ${texasCommunities[0].name}`);
        }
      } else {
        console.log(`   ❌ ${location.name}: No TX facilities found`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${location.name}: Search error - ${error.message}`);
    }
  }
  
  console.log(`\n📊 SEARCH COVERAGE SUMMARY:`);
  console.log(`   Total locations tested: ${testLocations.length}`);
  console.log(`   Locations with results: ${locationsWithResults}`);
  console.log(`   Coverage percentage: ${((locationsWithResults/testLocations.length)*100).toFixed(1)}%`);
  console.log(`   Total facilities found: ${totalFound}`);
  
  // Test state-wide search
  try {
    const response = await axios.get('http://localhost:5000/api/communities/search?location=TX&limit=25');
    const communities = response.data;
    const texasCommunities = communities.filter(c => c.state === 'TX');
    
    console.log(`\n🤠 Texas State Search: ${texasCommunities.length} facilities returned`);
    
    if (texasCommunities.length > 0) {
      console.log('   Sample facilities:');
      texasCommunities.slice(0, 5).forEach(c => {
        console.log(`     • ${c.name} (${c.city}, ${c.county} County)`);
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Texas state search error: ${error.message}`);
  }
  
  console.log('\n✅ Statewide search test complete!');
}

if (require.main === module) {
  testFinalStatewideSearch().catch(console.error);
}

module.exports = { testFinalStatewideSearch };