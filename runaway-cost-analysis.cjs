#!/usr/bin/env node

/**
 * RUNAWAY COST ANALYSIS
 * Detailed breakdown of the $300 API cost explosion
 */

function analyzeRunawayCosts() {
  console.log('🔍 RUNAWAY COST ANALYSIS - $300 EXPLOSION');
  console.log('=' .repeat(60));

  console.log('\n🎯 IDENTIFIED RUNAWAY PATTERN:');
  console.log('-'.repeat(40));
  
  console.log('PRIMARY CAUSE: Multiplicative API Call Pattern');
  console.log('Each expansion script execution triggers:');
  console.log('');
  
  // The actual pattern from our code analysis
  console.log('EXPANSION SCRIPT PATTERN:');
  console.log('├── 14 Counties');
  console.log('├── 5 Cities per County = 70 Cities');
  console.log('├── 6 Search Terms per City = 420 Text Searches');
  console.log('├── ~20 Places per Search = 8,400 Place Details calls');
  console.log('├── ~10 Photos per Place = 84,000 Photo requests');
  console.log('└── SINGLE RUN COST: ~$700+ (if all calls succeed)');
  
  console.log('\n💸 COST CALCULATION PER SINGLE RUN:');
  console.log('-'.repeat(40));
  
  const costs = {
    textSearch: 420 * 0.032,     // 420 searches
    placeDetails: 8400 * 0.017,  // Details for each place found
    photos: 84000 * 0.007        // Photos for each place
  };
  
  const totalPerRun = Object.values(costs).reduce((a, b) => a + b, 0);
  
  console.log(`Text Searches: 420 × $0.032 = $${costs.textSearch.toFixed(2)}`);
  console.log(`Place Details: 8,400 × $0.017 = $${costs.placeDetails.toFixed(2)}`);
  console.log(`Photo Requests: 84,000 × $0.007 = $${costs.photos.toFixed(2)}`);
  console.log(`TOTAL PER RUN: $${totalPerRun.toFixed(2)}`);
  
  console.log('\n🔄 RUNAWAY SCENARIOS:');
  console.log('-'.repeat(40));
  
  // Scenario analysis
  const runsNeededFor300 = 300 / totalPerRun;
  
  console.log(`SCENARIO 1 - Script Ran Multiple Times:`);
  console.log(`  To reach $300: ${runsNeededFor300.toFixed(1)} complete runs`);
  console.log(`  OR: Partial runs with high place discovery`);
  
  console.log(`\nSCENARIO 2 - Photo Enrichment Runaway:`);
  const photoRunawayRuns = 300 / costs.photos;
  console.log(`  Photo enrichment alone: ${photoRunawayRuns.toFixed(2)} runs = $300`);
  console.log(`  This means: Photo script ran multiple times on same data`);
  
  console.log(`\nSCENARIO 3 - High Discovery Success Rate:`);
  console.log(`  If searches found more places than expected:`);
  console.log(`  - Expected: ~5 places per search`);
  console.log(`  - Actual: Could have been 20+ per search`);
  console.log(`  - This amplifies costs by 4x per run`);
  
  console.log('\n🚨 IDENTIFIED CODE ISSUES:');
  console.log('-'.repeat(40));
  
  console.log('ISSUE 1: No Duplicate Prevention');
  console.log('  - Scripts can re-process same communities');
  console.log('  - Photo enrichment can run multiple times');
  console.log('  - No global state tracking');
  
  console.log('\nISSUE 2: No Cost Tracking');
  console.log('  - Scripts don\'t check current spending');
  console.log('  - No budget limits enforced');
  console.log('  - No daily/monthly caps');
  
  console.log('\nISSUE 3: Aggressive Search Patterns');
  console.log('  - 6 search terms × 70+ cities = 420+ searches');
  console.log('  - Large radius (25km) finds many places');
  console.log('  - No rate limiting between operations');
  
  console.log('\nISSUE 4: Batch Operations Without Limits');
  console.log('  - Photo enrichment processes all communities');
  console.log('  - No chunking or pagination');
  console.log('  - Can trigger thousands of API calls');
  
  console.log('\n🔍 EVIDENCE FROM CODE:');
  console.log('-'.repeat(40));
  
  console.log('FOUND IN complete-corrected-expansion.cjs:');
  console.log('  - Processes 14 counties × 5 cities = 70 locations');
  console.log('  - Each location triggers 6 search terms');
  console.log('  - No cost checking before starting');
  console.log('  - Could run multiple times if restarted');
  
  console.log('\nFOUND IN google-places-integration.ts:');
  console.log('  - discoverCommunitiesInArea() makes multiple API calls');
  console.log('  - extractCommunityDataFromPlace() gets details + photos');
  console.log('  - No prevention of duplicate processing');
  
  console.log('\nFOUND IN routes.ts:');
  console.log('  - Multiple discovery endpoints');
  console.log('  - Batch operations without limits');
  console.log('  - No spending verification');
  
  console.log('\n💡 HOW THE $300 LIKELY HAPPENED:');
  console.log('-'.repeat(40));
  
  console.log('TIMELINE RECONSTRUCTION:');
  console.log('1. expansion script started');
  console.log('2. High success rate found many places per search');
  console.log('3. Each place triggered details + photos calls');
  console.log('4. Photo enrichment ran on discovered communities');
  console.log('5. Script may have restarted/rerun');
  console.log('6. Cumulative calls: 9,375+ text searches = $300');
  
  console.log('\n✅ CONCLUSION:');
  console.log('-'.repeat(40));
  console.log('The $300 cost was caused by:');
  console.log('• Expansion scripts running multiple cycles');
  console.log('• High place discovery success rates');
  console.log('• Photo enrichment amplifying costs');
  console.log('• No spending controls or duplicate prevention');
  console.log('• Aggressive search patterns across 70+ cities');
  
  console.log('\n🛠️  IMMEDIATE FIXES NEEDED:');
  console.log('-'.repeat(40));
  console.log('1. Add spending checks before any API calls');
  console.log('2. Implement duplicate prevention');
  console.log('3. Add daily/monthly cost limits');
  console.log('4. Reduce search scope and frequency');
  console.log('5. Add cost tracking to all scripts');
}

analyzeRunawayCosts();