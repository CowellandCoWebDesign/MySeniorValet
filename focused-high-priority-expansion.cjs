#!/usr/bin/env node

/**
 * FOCUSED HIGH-PRIORITY EXPANSION
 * Target the most populated and underserved counties
 */

const axios = require('axios');

const priorityCounties = [
  'Butte County',      // Chico - 230k population, underserved
  'Placer County',     // Auburn/Roseville - 400k population, growing fast
  'Shasta County',     // Redding - 180k population, regional center
  'El Dorado County',  // South Lake Tahoe - affluent area
  'Nevada County',     // Grass Valley - scenic area
  'Yolo County'        // Davis/Woodland - UC Davis area
];

async function runPriorityExpansion() {
  console.log('🚀 FOCUSED HIGH-PRIORITY EXPANSION');
  console.log(`🎯 Targeting ${priorityCounties.length} underserved counties\n`);

  let totalAdded = 0;
  let results = {};

  for (const county of priorityCounties) {
    console.log(`\n📍 Processing ${county}...`);
    
    try {
      const result = await expandCountyDirect(county);
      results[county] = result;
      totalAdded += result.added || 0;
      
      console.log(`✅ ${county}: ${result.added || 0} communities added`);
      
      // Brief pause to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ ${county} failed: ${error.message}`);
      results[county] = { error: error.message };
    }
  }

  console.log(`\n🎉 HIGH-PRIORITY EXPANSION COMPLETE!`);
  console.log(`📊 Total added across ${priorityCounties.length} counties: ${totalAdded}`);
  
  // Show detailed results
  console.log('\n📋 County-by-County Results:');
  Object.entries(results).forEach(([county, result]) => {
    if (result.error) {
      console.log(`  ❌ ${county}: ${result.error}`);
    } else {
      console.log(`  ✅ ${county}: ${result.added || 0} added`);
    }
  });
}

async function expandCountyDirect(county) {
  try {
    console.log(`  🔍 Discovering communities in ${county}...`);
    
    const response = await axios.post('http://localhost:5000/api/admin/regional-expansion/discover', {
      location: county.replace(' County', ''),
      state: 'CA',
      specificCounty: county
    });

    if (response.data && response.data.success) {
      return {
        added: response.data.added || 0,
        discovered: response.data.discovered || 0
      };
    } else {
      throw new Error('Discovery endpoint returned unsuccessful response');
    }
  } catch (error) {
    console.error(`  ❌ Error expanding ${county}: ${error.message}`);
    throw error;
  }
}

// Run the focused expansion
runPriorityExpansion().catch(console.error);