const axios = require('axios');

// Complete re-expansion with corrected filtering for all missed counties
async function runCorrectedExpansion() {
  console.log('🚀 COMPLETE CORRECTED EXPANSION: Re-discovering all missed communities...');
  
  const baseUrl = 'http://localhost:5000';
  
  // Counties that need complete re-expansion due to filtering issues
  const countiesForReexpansion = [
    { county: 'Humboldt', cities: ['Eureka', 'Arcata', 'Fortuna', 'McKinleyville', 'Ferndale'] },
    { county: 'Mendocino', cities: ['Ukiah', 'Willits', 'Fort Bragg', 'Mendocino', 'Laytonville'] },
    { county: 'Lake', cities: ['Lakeport', 'Clearlake', 'Middletown', 'Kelseyville', 'Nice'] },
    { county: 'Shasta', cities: ['Redding', 'Anderson', 'Burney', 'Mount Shasta', 'Shasta Lake'] },
    { county: 'Siskiyou', cities: ['Yreka', 'Mount Shasta', 'Dunsmuir', 'Weed', 'Tulelake'] },
    { county: 'Modoc', cities: ['Alturas', 'Cedarville', 'Eagleville', 'Fort Bidwell'] },
    { county: 'Lassen', cities: ['Susanville', 'Westwood', 'Bieber', 'Herlong'] },
    { county: 'Plumas', cities: ['Quincy', 'Portola', 'Graeagle', 'Chester'] },
    { county: 'Sierra', cities: ['Downieville', 'Loyalton', 'Sierraville'] },
    { county: 'Nevada', cities: ['Nevada City', 'Grass Valley', 'Truckee', 'Penn Valley'] },
    { county: 'Butte', cities: ['Chico', 'Oroville', 'Paradise', 'Gridley', 'Biggs'] },
    { county: 'Colusa', cities: ['Colusa', 'Williams', 'Arbuckle', 'Maxwell'] },
    { county: 'Glenn', cities: ['Willows', 'Orland', 'Hamilton City'] },
    { county: 'Tehama', cities: ['Red Bluff', 'Corning', 'Tehama', 'Los Molinos'] }
  ];
  
  let totalNewCommunities = 0;
  let processedCounties = 0;
  
  for (const countyData of countiesForReexpansion) {
    console.log(`\n🎯 Processing ${countyData.county} County (${processedCounties + 1}/14)...`);
    
    let countyNewCommunities = 0;
    
    for (const city of countyData.cities) {
      try {
        console.log(`  📍 Discovering communities in ${city}...`);
        
        // Use the corrected regional expansion API
        const response = await axios.post(`${baseUrl}/api/admin/regional-expansion/discover`, {
          city: city,
          state: 'CA',
          county: countyData.county,
          searchRadius: 25000
        }, {
          timeout: 60000, // 1 minute timeout for each city
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200 && response.data.newCommunities > 0) {
          console.log(`    ✅ Found ${response.data.newCommunities} new communities in ${city}`);
          countyNewCommunities += response.data.newCommunities;
        } else {
          console.log(`    ℹ️ No new communities found in ${city}`);
        }
        
        // Rate limiting between cities
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`    ❌ Error processing ${city}:`, error.message);
        
        // If timeout, continue to next city
        if (error.code === 'ECONNABORTED') {
          console.log(`    ⏱️ Timeout for ${city}, continuing...`);
        }
      }
    }
    
    totalNewCommunities += countyNewCommunities;
    processedCounties++;
    
    console.log(`  📊 ${countyData.county} County Results: ${countyNewCommunities} new communities`);
    
    // Longer pause between counties
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n🎉 EXPANSION COMPLETE!`);
  console.log(`📈 Total new communities discovered: ${totalNewCommunities}`);
  console.log(`🏁 Counties processed: ${processedCounties}/14`);
  
  // Get final community count
  try {
    const finalResponse = await axios.get(`${baseUrl}/api/communities`, {
      timeout: 15000
    });
    console.log(`📊 Total communities in database: ${finalResponse.data.length}`);
    
    // Show breakdown by region
    const regions = {};
    finalResponse.data.forEach(community => {
      const region = getRegionForCity(community.city);
      regions[region] = (regions[region] || 0) + 1;
    });
    
    console.log(`\n📍 Regional Breakdown:`);
    Object.entries(regions).forEach(([region, count]) => {
      console.log(`  ${region}: ${count} communities`);
    });
    
  } catch (error) {
    console.error('Error getting final count:', error.message);
  }
}

function getRegionForCity(city) {
  const regionMap = {
    // Bay Area
    'San Francisco': 'Bay Area',
    'Oakland': 'Bay Area',
    'San Jose': 'Bay Area',
    'Fremont': 'Bay Area',
    'Santa Clara': 'Bay Area',
    'Sunnyvale': 'Bay Area',
    'Hayward': 'Bay Area',
    'Concord': 'Bay Area',
    'Berkeley': 'Bay Area',
    'Richmond': 'Bay Area',
    'Daly City': 'Bay Area',
    'San Mateo': 'Bay Area',
    'Vallejo': 'Bay Area',
    'Fairfield': 'Bay Area',
    'Livermore': 'Bay Area',
    'San Rafael': 'Bay Area',
    'Mountain View': 'Bay Area',
    'Redwood City': 'Bay Area',
    'Palo Alto': 'Bay Area',
    'Union City': 'Bay Area',
    
    // Sacramento Region
    'Sacramento': 'Sacramento Region',
    'Elk Grove': 'Sacramento Region',
    'Roseville': 'Sacramento Region',
    'Folsom': 'Sacramento Region',
    'Citrus Heights': 'Sacramento Region',
    'Rancho Cordova': 'Sacramento Region',
    'Davis': 'Sacramento Region',
    'Woodland': 'Sacramento Region',
    'West Sacramento': 'Sacramento Region',
    
    // North Coast
    'Eureka': 'North Coast',
    'Arcata': 'North Coast',
    'Fortuna': 'North Coast',
    'McKinleyville': 'North Coast',
    'Ferndale': 'North Coast',
    'Ukiah': 'North Coast',
    'Willits': 'North Coast',
    'Fort Bragg': 'North Coast',
    'Mendocino': 'North Coast',
    
    // Central Valley North
    'Chico': 'Central Valley North',
    'Redding': 'Central Valley North',
    'Oroville': 'Central Valley North',
    'Paradise': 'Central Valley North',
    'Red Bluff': 'Central Valley North',
    'Anderson': 'Central Valley North',
    'Corning': 'Central Valley North',
    
    // Far North & Sierra
    'Yreka': 'Far North',
    'Mount Shasta': 'Far North',
    'Alturas': 'Far North',
    'Susanville': 'Far North',
    'Truckee': 'Sierra Nevada',
    'Nevada City': 'Sierra Nevada',
    'Grass Valley': 'Sierra Nevada',
    'Quincy': 'Sierra Nevada'
  };
  
  return regionMap[city] || 'Other Northern CA';
}

runCorrectedExpansion().catch(console.error);