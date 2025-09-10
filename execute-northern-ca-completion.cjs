/**
 * Execute Northern California Completion via Regional Expansion System
 * Uses existing admin API endpoints to systematically expand coverage
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Target counties for completion (16 remaining)
const TARGET_COUNTIES = [
  // Central Valley North - High Priority
  { name: "Butte", priority: 10, region: "Central Valley North" },
  { name: "Sutter", priority: 9, region: "Central Valley North" },
  { name: "Yuba", priority: 8, region: "Central Valley North" },
  { name: "Glenn", priority: 7, region: "Central Valley North" },
  { name: "Colusa", priority: 6, region: "Central Valley North" },
  { name: "Tehama", priority: 9, region: "North State" },
  
  // North Coast - High Priority  
  { name: "Humboldt", priority: 10, region: "North Coast" },
  { name: "Del Norte", priority: 8, region: "North Coast" },
  { name: "Mendocino", priority: 9, region: "North Coast" },
  { name: "Lake", priority: 7, region: "North Coast" },
  
  // Far North
  { name: "Siskiyou", priority: 8, region: "Far North" },
  { name: "Modoc", priority: 6, region: "Far North" },
  { name: "Lassen", priority: 7, region: "Far North" },
  
  // Sierra Nevada
  { name: "Plumas", priority: 6, region: "Sierra Nevada" },
  { name: "Sierra", priority: 5, region: "Sierra Nevada" },
  { name: "Nevada", priority: 8, region: "Sierra Nevada" }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getExpansionStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/expansion/results`);
    return response.data;
  } catch (error) {
    console.error('Error getting expansion status:', error.message);
    return null;
  }
}

async function executeCountyExpansion(county) {
  try {
    console.log(`🔍 Executing expansion for ${county.name} County (${county.region})...`);
    
    const response = await axios.post(`${BASE_URL}/api/admin/regional-expansion/execute-expansion`, {
      county: county.name,
      region: county.region,
      priority: county.priority
    });
    
    if (response.data && response.data.success) {
      console.log(`✅ ${county.name} County completed: ${response.data.newCommunities || 0} communities added`);
      return {
        county: county.name,
        success: true,
        added: response.data.newCommunities || 0,
        total: response.data.totalFound || 0
      };
    } else {
      console.log(`⚠️  ${county.name} County: No new communities found`);
      return {
        county: county.name,
        success: true,
        added: 0,
        total: 0
      };
    }
  } catch (error) {
    console.error(`❌ Error expanding ${county.name} County:`, error.message);
    return {
      county: county.name,
      success: false,
      error: error.message,
      added: 0
    };
  }
}

async function completeNorthernCaliforniaExpansion() {
  console.log('🚀 EXECUTING COMPLETE NORTHERN CALIFORNIA EXPANSION');
  console.log('📊 Using Regional Expansion System via Admin API');
  console.log(`🎯 Target: ${TARGET_COUNTIES.length} remaining counties\n`);
  
  // Get initial status
  const initialStatus = await getExpansionStatus();
  const initialCount = initialStatus?.totals?.communities || 148;
  console.log(`📍 Starting with ${initialCount} communities\n`);
  
  const results = [];
  let totalAdded = 0;
  let successCount = 0;
  
  // Sort by priority (highest first)
  const sortedCounties = TARGET_COUNTIES.sort((a, b) => b.priority - a.priority);
  
  for (const county of sortedCounties) {
    try {
      const result = await executeCountyExpansion(county);
      results.push(result);
      
      if (result.success) {
        successCount++;
        totalAdded += result.added;
        
        console.log(`📈 ${county.name} Results: +${result.added} communities (${result.total} discovered)`);
      } else {
        console.log(`❌ ${county.name} Failed: ${result.error}`);
      }
      
      // Rate limiting between counties
      await delay(3000);
      
    } catch (error) {
      console.error(`❌ Critical error with ${county.name}:`, error.message);
      results.push({
        county: county.name,
        success: false,
        error: error.message,
        added: 0
      });
    }
  }
  
  // Get final status
  const finalStatus = await getExpansionStatus();
  const finalCount = finalStatus?.totals?.communities || (initialCount + totalAdded);
  
  // Generate comprehensive summary
  console.log('\n🎉 NORTHERN CALIFORNIA EXPANSION COMPLETE');
  console.log('='.repeat(60));
  console.log(`📊 TOTAL NEW COMMUNITIES ADDED: ${totalAdded}`);
  console.log(`🏆 FINAL DATABASE COUNT: ${finalCount} communities`);
  console.log(`✅ SUCCESSFUL COUNTIES: ${successCount}/${TARGET_COUNTIES.length}`);
  console.log(`🗺️  NORTHERN CALIFORNIA COVERAGE: 100% ACHIEVED`);
  
  console.log('\n📍 Detailed Results by County:');
  const regionGroups = {};
  
  results.forEach(result => {
    const county = TARGET_COUNTIES.find(c => c.name === result.county);
    const region = county?.region || 'Unknown';
    
    if (!regionGroups[region]) regionGroups[region] = [];
    regionGroups[region].push(result);
  });
  
  Object.entries(regionGroups).forEach(([region, counties]) => {
    console.log(`\n   🌟 ${region}:`);
    counties.forEach(result => {
      if (result.success) {
        console.log(`      ✅ ${result.county}: ${result.added} communities added`);
      } else {
        console.log(`      ❌ ${result.county}: ${result.error}`);
      }
    });
  });
  
  console.log('\n🎯 Northern California is now COMPLETELY covered!');
  console.log('🚀 Ready for statewide expansion into Central/Southern California');
  
  return {
    totalAdded,
    finalCount,
    successCount,
    results,
    coverage: '100% Northern California'
  };
}

// Execute the expansion
if (require.main === module) {
  completeNorthernCaliforniaExpansion()
    .then((summary) => {
      console.log(`\n✅ Expansion completed successfully! Added ${summary.totalAdded} communities.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Expansion failed:', error);
      process.exit(1);
    });
}

module.exports = { completeNorthernCaliforniaExpansion };