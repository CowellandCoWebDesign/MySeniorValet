#!/usr/bin/env node

/**
 * COST SOURCE ANALYSIS
 * Identify exactly where the $300 came from
 */

async function analyzeCostSources() {
  console.log('🔍 ANALYZING COST SOURCES FOR $300 SPENDING');
  console.log('=' .repeat(50));

  // Google Places API Pricing (current rates)
  const PRICING = {
    textSearch: 0.032,        // Text Search (Find Place)
    nearbySearch: 0.032,      // Nearby Search 
    placeDetails: 0.017,      // Place Details
    photo: 0.007,            // Place Photo
    autocomplete: 0.00283,   // Autocomplete
    geocoding: 0.005         // Geocoding
  };

  console.log('\n💰 API COST BREAKDOWN TO REACH $300:');
  console.log('-'.repeat(40));

  // Calculate how many calls would cost $300
  Object.entries(PRICING).forEach(([api, cost]) => {
    const callsFor300 = Math.floor(300 / cost);
    console.log(`${api.padEnd(15)}: ${callsFor300.toLocaleString()} calls × $${cost} = $300`);
  });

  console.log('\n🔥 MOST LIKELY RUNAWAY SCENARIOS:');
  console.log('-'.repeat(40));

  // Scenario 1: Text Search runaway
  const textSearchCalls = Math.floor(300 / PRICING.textSearch);
  console.log(`SCENARIO 1 - Text Search Runaway:`);
  console.log(`  ${textSearchCalls.toLocaleString()} text searches × $${PRICING.textSearch} = $300`);
  console.log(`  This equals: ~${Math.floor(textSearchCalls/6)} cities × 6 search terms`);
  console.log(`  OR: Expansion script ran ${Math.floor(textSearchCalls/300)} times`);

  // Scenario 2: Photo requests runaway  
  const photoCalls = Math.floor(300 / PRICING.photo);
  console.log(`\nSCENARIO 2 - Photo Requests Runaway:`);
  console.log(`  ${photoCalls.toLocaleString()} photo requests × $${PRICING.photo} = $300`);
  console.log(`  This equals: ${Math.floor(photoCalls/10)} communities × 10 photos each`);
  console.log(`  OR: Photo enrichment ran ${Math.floor(photoCalls/1608)} times on all communities`);

  // Scenario 3: Mixed operations
  console.log(`\nSCENARIO 3 - Mixed Operations (Most Likely):`);
  
  // Estimate if our expansion ran multiple times
  const singleRunCost = (300 * 0.032) + (182 * 0.017) + (1608 * 0.007);
  const timesRun = Math.floor(300 / singleRunCost);
  
  console.log(`  Single complete expansion cost: $${singleRunCost.toFixed(2)}`);
  console.log(`  Expansion could have run: ${timesRun} times`);
  console.log(`  OR: Partial runs with different patterns`);

  console.log('\n🤖 AUTOMATED PROCESS ANALYSIS:');
  console.log('-'.repeat(40));
  
  console.log('POSSIBLE RUNAWAY CAUSES:');
  console.log('1. complete-corrected-expansion.cjs ran in a loop');
  console.log('2. Regional expansion API endpoints called repeatedly');
  console.log('3. Photo enrichment script ran multiple times');
  console.log('4. Batch operations without proper rate limiting');
  console.log('5. Development restarts triggered re-seeding');

  console.log('\n🔍 INVESTIGATION CHECKLIST:');
  console.log('-'.repeat(40));
  console.log('□ Check if expansion scripts have infinite loops');
  console.log('□ Review server restart behavior (auto-seeding?)');
  console.log('□ Examine batch operation implementations');
  console.log('□ Check for async operations not awaiting properly');
  console.log('□ Look for recursive API calls');

  console.log('\n📊 EXPECTED vs ACTUAL:');
  console.log('-'.repeat(40));
  console.log(`Expected for 182 communities: $24.01`);
  console.log(`Actual spending: $300.00`);
  console.log(`Multiplier: ${(300/24.01).toFixed(1)}x`);
  console.log(`This suggests: Operations ran ~12x more than expected`);

  console.log('\n🎯 NEXT INVESTIGATION STEPS:');
  console.log('-'.repeat(40));
  console.log('1. Check Google Cloud Console API usage graphs');
  console.log('2. Review exact API call counts per endpoint');
  console.log('3. Examine server logs for repeated operations');
  console.log('4. Check database for duplicate community insertions');
  console.log('5. Review expansion script execution patterns');

  console.log('\n✅ ANALYSIS COMPLETE');
  console.log('Focus investigation on batch operations and automated scripts');
}

analyzeCostSources().catch(console.error);