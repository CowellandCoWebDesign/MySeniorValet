/**
 * Test script to verify enhanced fuzzy matching integration in search
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testSearch(query: string, description: string) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`   Query: "${query}"`);
  
  try {
    // Test basic search endpoint
    const basicResponse = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}&limit=10`);
    const basicData = await basicResponse.json();
    console.log(`   ✅ Basic search: ${basicData.communities?.length || 0} results`);
    
    // Test enterprise search endpoint
    const enterpriseResponse = await fetch(`${BASE_URL}/api/search/enterprise?q=${encodeURIComponent(query)}&limit=10&debug=true`);
    const enterpriseData = await enterpriseResponse.json();
    console.log(`   ✅ Enterprise search: ${enterpriseData.communities?.length || 0} results`);
    console.log(`      Strategy: ${enterpriseData.searchMetadata?.searchStrategy || 'N/A'}`);
    console.log(`      Fuzzy matching: ${enterpriseData.searchMetadata?.fuzzyMatchesUsed ? 'Yes' : 'No'}`);
    
    if (enterpriseData.communities?.length > 0) {
      console.log(`   📋 Top 3 matches:`);
      enterpriseData.communities.slice(0, 3).forEach((c: any, i: number) => {
        console.log(`      ${i + 1}. ${c.name} - ${c.city}, ${c.state}`);
      });
    }
    
    return enterpriseData;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Enhanced Fuzzy Matching in Search APIs\n');
  console.log('================================================');
  
  // Test various search scenarios
  const testCases = [
    // Exact brand names
    ['Atria', 'Exact brand name search'],
    ['Brookdale', 'Another exact brand'],
    ['Sunrise Senior Living', 'Multi-word brand'],
    
    // Fuzzy variations
    ['Atrai', 'Misspelled brand (should match Atria)'],
    ['Brookdael', 'Misspelled brand (should match Brookdale)'],
    ['Sunris', 'Partial brand name'],
    
    // Chain aliases
    ['Brookdale Senior', 'Brand with suffix'],
    ['Holiday Retirement', 'Full chain name'],
    ['Oakmont Living', 'Another chain'],
    
    // Location-based searches
    ['Miami', 'City search'],
    ['Florida senior living', 'State + care type'],
    ['Dallas assisted living', 'City + care type'],
    
    // Complex queries
    ['Atria Miami', 'Brand + City'],
    ['Brookdale Texas', 'Brand + State'],
    ['memory care Orlando', 'Care type + City']
  ];
  
  for (const [query, description] of testCases) {
    await testSearch(query, description);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }
  
  console.log('\n================================================');
  console.log('✅ Fuzzy Search Integration Test Complete!\n');
}

// Run the tests
runTests().catch(console.error);