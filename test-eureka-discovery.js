import axios from 'axios';

async function testEurekaDiscovery() {
  console.log('🔍 Testing direct Eureka, CA discovery with relaxed filtering...');
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('❌ Google Places API key not found');
    return;
  }
  
  // Test multiple search terms specifically for Eureka
  const searchTerms = [
    'senior living eureka ca',
    'assisted living eureka ca', 
    'retirement community eureka ca',
    'memory care eureka ca',
    'senior apartments eureka ca',
    'nursing home eureka ca',
    'elder care eureka ca',
    'senior housing eureka ca',
    'redwood springs eureka ca',
    'seaview eureka ca',
    'senior facility eureka ca'
  ];
  
  let allResults = [];
  
  for (const term of searchTerms) {
    try {
      console.log(`\n🔍 Searching: "${term}"`);
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: term,
          key: apiKey,
          radius: 25000
        },
        timeout: 15000
      });
      
      if (response.data?.results?.length > 0) {
        console.log(`✅ Found ${response.data.results.length} results for "${term}"`);
        
        for (const place of response.data.results) {
          console.log(`  - ${place.name}`);
          console.log(`    Address: ${place.formatted_address || place.vicinity || 'N/A'}`);
          console.log(`    Types: ${place.types?.join(', ') || 'none'}`);
          console.log(`    Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)`);
          
          // Check if it looks like a senior living facility
          const name = place.name.toLowerCase();
          const isSeniorLiving = name.includes('senior') || 
                                name.includes('assisted') || 
                                name.includes('retirement') || 
                                name.includes('memory') || 
                                name.includes('elder') || 
                                name.includes('nursing') || 
                                name.includes('care') ||
                                name.includes('manor') ||
                                name.includes('residence') ||
                                name.includes('community');
          
          console.log(`    Senior Living: ${isSeniorLiving ? '✅ YES' : '❌ NO'}`);
          
          if (isSeniorLiving) {
            allResults.push({
              name: place.name,
              address: place.formatted_address || place.vicinity,
              rating: place.rating,
              types: place.types
            });
          }
          console.log('');
        }
      } else {
        console.log(`❌ No results for "${term}"`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error searching "${term}":`, error.message);
    }
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`Total senior living facilities found in Eureka: ${allResults.length}`);
  
  if (allResults.length > 0) {
    console.log('\n🏘️ DISCOVERED FACILITIES:');
    allResults.forEach((facility, index) => {
      console.log(`${index + 1}. ${facility.name}`);
      console.log(`   ${facility.address}`);
      console.log(`   Rating: ${facility.rating || 'N/A'}`);
      console.log('');
    });
  }
  
  return allResults;
}

testEurekaDiscovery().catch(console.error);