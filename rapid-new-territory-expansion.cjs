#!/usr/bin/env node

/**
 * RAPID NEW TERRITORY EXPANSION
 * Target completely new areas we haven't explored yet
 */

const axios = require('axios');

// Target new territories with major population centers
const newTerritories = [
  // Central Valley North
  { city: 'Chico', county: 'Butte' },
  { city: 'Oroville', county: 'Butte' },
  { city: 'Paradise', county: 'Butte' },
  { city: 'Gridley', county: 'Butte' },
  
  // Shasta Region
  { city: 'Redding', county: 'Shasta' },
  { city: 'Anderson', county: 'Shasta' },
  { city: 'Red Bluff', county: 'Tehama' },
  
  // Gold Country
  { city: 'Auburn', county: 'Placer' },
  { city: 'Roseville', county: 'Placer' },
  { city: 'Rocklin', county: 'Placer' },
  { city: 'Lincoln', county: 'Placer' },
  { city: 'Grass Valley', county: 'Nevada' },
  { city: 'Nevada City', county: 'Nevada' },
  
  // Mountain Region
  { city: 'Placerville', county: 'El Dorado' },
  { city: 'South Lake Tahoe', county: 'El Dorado' },
  { city: 'Truckee', county: 'Nevada' },
  
  // Central Valley
  { city: 'Davis', county: 'Yolo' },
  { city: 'Woodland', county: 'Yolo' },
  { city: 'Winters', county: 'Yolo' },
  { city: 'West Sacramento', county: 'Yolo' },
  
  // Yuba-Sutter
  { city: 'Yuba City', county: 'Sutter' },
  { city: 'Marysville', county: 'Yuba' },
  { city: 'Live Oak', county: 'Sutter' },
  { city: 'Wheatland', county: 'Yuba' }
];

async function discoverNewTerritories() {
  console.log('🚀 RAPID NEW TERRITORY EXPANSION');
  console.log(`🎯 Targeting ${newTerritories.length} new population centers\n`);

  let totalAdded = 0;
  let totalDiscovered = 0;
  const results = [];

  for (const territory of newTerritories) {
    const locationName = `${territory.city}, CA`;
    console.log(`📍 Processing ${locationName} (${territory.county} County)...`);
    
    try {
      const result = await axios.post('http://localhost:5000/api/admin/regional-expansion/discover', {
        location: territory.city,
        state: 'CA'
      });
      
      if (result.data && result.data.success) {
        const added = result.data.added || 0;
        const discovered = result.data.discovered || 0;
        totalAdded += added;
        totalDiscovered += discovered;
        
        results.push({
          territory: locationName,
          added,
          discovered
        });
        
        if (added > 0) {
          console.log(`✅ ${locationName}: ${added} added / ${discovered} discovered`);
        } else {
          console.log(`⚪ ${locationName}: No new communities found`);
        }
      } else {
        console.log(`❌ ${locationName}: Discovery failed`);
      }
      
      // Brief pause to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2500));
      
    } catch (error) {
      console.log(`❌ ${locationName}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  }

  console.log(`\n🎉 NEW TERRITORY EXPANSION COMPLETE!`);
  console.log(`📊 Total added: ${totalAdded} communities`);
  console.log(`🔍 Total discovered: ${totalDiscovered} communities`);
  
  // Show most successful territories
  const successful = results.filter(r => r.added > 0);
  if (successful.length > 0) {
    console.log('\n🏆 Most Successful Territories:');
    successful
      .sort((a, b) => b.added - a.added)
      .slice(0, 10)
      .forEach(r => console.log(`  ✅ ${r.territory}: ${r.added} added`));
  }
  
  return { totalAdded, totalDiscovered };
}

// Execute expansion
discoverNewTerritories()
  .then(result => {
    console.log(`\n🎯 EXPANSION SUMMARY: ${result.totalAdded} communities added to database`);
  })
  .catch(console.error);