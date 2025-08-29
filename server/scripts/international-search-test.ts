#!/usr/bin/env tsx

/**
 * International Search Testing Script
 * Tests all countries supported by MySeniorValet platform
 */

interface TestResult {
  country: string;
  searchResults: number;
  databaseCount: number;
  status: 'PASS' | 'FAIL';
  error?: string;
}

async function testCountrySearch(country: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Test search API
    const searchResponse = await fetch(`http://localhost:5000/api/search/comprehensive?q=${encodeURIComponent(country)}`);
    if (!searchResponse.ok) {
      throw new Error(`Search API returned ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    const searchResults = searchData.communities?.length || 0;
    
    // Get database count for this country
    const dbCountResponse = await fetch(`http://localhost:5000/api/communities/count?country=${encodeURIComponent(country)}`);
    let databaseCount = 0;
    
    if (dbCountResponse.ok) {
      const dbData = await dbCountResponse.json();
      databaseCount = parseInt(dbData.count) || 0;
    }
    
    const status = searchResults > 0 ? 'PASS' : 'FAIL';
    
    return {
      country,
      searchResults,
      databaseCount,
      status
    };
    
  } catch (error) {
    return {
      country,
      searchResults: 0,
      databaseCount: 0,
      status: 'FAIL',
      error: error.message
    };
  }
}

async function runInternationalSearchTests() {
  console.log('🌍 INTERNATIONAL SEARCH TESTING');
  console.log('==================================================');
  
  const countries = [
    'Canada',
    'Australia', 
    'Mexico',
    'Japan',
    'United States',
    'USA'
  ];
  
  const results: TestResult[] = [];
  
  for (const country of countries) {
    console.log(`📋 Testing: ${country}`);
    const result = await testCountrySearch(country);
    results.push(result);
    
    if (result.status === 'PASS') {
      console.log(`✅ PASS - ${country}: ${result.searchResults} results found`);
    } else {
      console.log(`❌ FAIL - ${country}: ${result.searchResults} results (expected > 0)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log('\n==================================================');
  console.log('📊 INTERNATIONAL SEARCH RESULTS SUMMARY:');
  console.log('==================================================');
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${result.country}: ${result.searchResults} search results | ${result.databaseCount} in DB`);
  });
  
  console.log('==================================================');
  console.log(`📊 INTERNATIONAL SEARCH RESULTS: ${passCount}/${totalCount} countries passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 SUCCESS - All international searches working!');
  } else {
    console.log('⚠️  ISSUES DETECTED - Some international searches need attention');
  }
  
  return results;
}

// Run the tests
runInternationalSearchTests().catch(console.error);