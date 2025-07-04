// Direct fix for Redding area discovery using exact coordinates and manual search terms
const axios = require('axios');

async function fixReddingDiscovery() {
  console.log('🎯 Fixing Redding area discovery with targeted single-county approach...');
  
  // Exact Redding, CA coordinates  
  const reddingCoords = { lat: 40.5865, lng: -122.3917 };
  
  // Comprehensive search terms specifically for Redding area
  const searchTerms = [
    'senior living Redding California',
    'assisted living Redding CA', 
    'memory care Redding California',
    'retirement community Redding CA',
    'nursing home Redding California',
    'elder care Redding CA',
    'senior housing Redding California',
    'senior apartments Redding CA',
    'independent living Redding California', 
    'skilled nursing Redding CA',
    'senior care Redding California',
    'senior community Redding CA'
  ];
  
  const allResults = [];
  let totalApiCalls = 0;
  
  for (const searchTerm of searchTerms) {
    try {
      console.log(`🔍 Searching: "${searchTerm}"`);
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          key: process.env.GOOGLE_PLACES_API_KEY,
          query: searchTerm,
          location: `${reddingCoords.lat},${reddingCoords.lng}`,
          radius: 40000, // 40km radius to cover greater Redding area
          type: 'establishment'
        },
        timeout: 15000
      });
      
      totalApiCalls++;
      
      const results = response.data?.results || [];
      console.log(`📊 Found ${results.length} places for "${searchTerm}"`);
      
      for (const place of results) {
        // Only include places that appear to be in Northern California (96xxx ZIP codes)
        const address = place.formatted_address || '';
        const inReddingArea = 
          address.includes('Redding') || 
          address.includes('Anderson') || 
          address.includes('Red Bluff') ||
          address.includes('96') || // ZIP codes starting with 96
          address.includes('Shasta') ||
          address.includes('CA');
          
        if (inReddingArea) {
          allResults.push({
            name: place.name,
            address: place.formatted_address,
            place_id: place.place_id,
            rating: place.rating,
            types: place.types,
            searchTerm: searchTerm
          });
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error searching "${searchTerm}":`, error.message);
    }
  }
  
  // Remove duplicates based on place_id
  const uniqueResults = [];
  const seenPlaceIds = new Set();
  
  for (const result of allResults) {
    if (!seenPlaceIds.has(result.place_id)) {
      seenPlaceIds.add(result.place_id);
      uniqueResults.push(result);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`Total API calls: ${totalApiCalls}`);
  console.log(`Total results found: ${allResults.length}`);
  console.log(`Unique facilities: ${uniqueResults.length}`);
  
  console.log(`\n🏥 Discovered facilities:`);
  uniqueResults.forEach((facility, i) => {
    console.log(`${i + 1}. ${facility.name}`);
    console.log(`   Address: ${facility.address}`);
    console.log(`   Rating: ${facility.rating || 'N/A'}`);
    console.log(`   Found via: ${facility.searchTerm}`);
    console.log('');
  });
  
  return {
    totalApiCalls,
    totalResults: allResults.length,
    uniqueFacilities: uniqueResults.length,
    facilities: uniqueResults
  };
}

fixReddingDiscovery().catch(console.error);