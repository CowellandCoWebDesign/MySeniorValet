#!/usr/bin/env node

/**
 * Enhanced Search Intelligence Test Suite
 * Tests all new AI-powered search features and capabilities
 */

const colors = require('colors');

console.log('🚀 STARTING ENHANCED SEARCH INTELLIGENCE TESTS'.bold.cyan);
console.log('============================================================'.gray);
console.log('Testing comprehensive AI-powered search capabilities...\n'.cyan);

let testsPassedCount = 0;
let testsFailedCount = 0;
const testResults = [];

function logTest(testName, passed, details = '') {
  const status = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  console.log(`${status} ${testName}`[color]);
  if (details) {
    console.log(`   ${details}`.gray);
  }
  
  if (passed) {
    testsPassedCount++;
  } else {
    testsFailedCount++;
  }
  
  testResults.push({ testName, passed, details });
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`http://localhost:5000${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

async function runEnhancedSearchTests() {
  console.log('📋 TEST 1: Smart Search AI Intelligence'.bold);
  
  // Test smart search with complex query
  const smartSearchRequest = {
    query: 'memory care communities in Florida with activities and dining services under $5500 monthly',
    userId: 'test-user-ai-search',
    filters: {
      careTypes: ['Memory Care'],
      priceRange: { min: 3000, max: 5500 }
    },
    context: {
      previousSearches: ['assisted living near Tampa'],
      userPreferences: {
        communitySize: 'medium',
        amenityPriorities: ['dining', 'activities', 'medical care']
      }
    }
  };
  
  const smartSearchResult = await makeRequest('/api/search/smart-search', {
    method: 'POST',
    body: JSON.stringify(smartSearchRequest)
  });
  
  logTest('Smart Search API Response', smartSearchResult.success);
  if (smartSearchResult.success && smartSearchResult.data) {
    logTest('Smart Search Data Structure', 
      smartSearchResult.data.data && 
      smartSearchResult.data.data.insights &&
      smartSearchResult.data.data.searchStats
    );
    logTest('AI Search Interpretation', 
      smartSearchResult.data.data.insights.searchInterpretation.length > 10
    );
    logTest('Market Intelligence Integration', 
      smartSearchResult.data.data.insights.marketIntelligence.length > 10
    );
    logTest('Personalized Recommendations', 
      Array.isArray(smartSearchResult.data.data.insights.personalizedRecommendations)
    );
  }
  
  console.log('\n📋 TEST 2: Search Suggestions & Autocomplete'.bold);
  
  // Test search suggestions
  const suggestionsResult = await makeRequest('/api/search/search-suggestions?q=senior%20living&limit=5');
  logTest('Search Suggestions API', suggestionsResult.success);
  if (suggestionsResult.success && suggestionsResult.data) {
    logTest('Suggestions Data Structure', Array.isArray(suggestionsResult.data.suggestions));
    logTest('Relevant Suggestions', suggestionsResult.data.suggestions.length > 0);
  }
  
  // Test voice search placeholder
  const voiceSearchResult = await makeRequest('/api/search/voice-search', {
    method: 'POST',
    body: JSON.stringify({ audioData: 'mock-audio-data', userId: 'test-user' })
  });
  logTest('Voice Search API Available', voiceSearchResult.success);
  
  console.log('\n📋 TEST 3: Search Analytics & Trends'.bold);
  
  // Test search trends
  const trendsResult = await makeRequest('/api/search/search-trends');
  logTest('Search Trends API', trendsResult.success);
  if (trendsResult.success && trendsResult.data) {
    logTest('Trending Searches Data', 
      trendsResult.data.data.trendingSearches && 
      Array.isArray(trendsResult.data.data.trendingSearches)
    );
    logTest('Location Trends Data', 
      trendsResult.data.data.locationTrends && 
      Array.isArray(trendsResult.data.data.locationTrends)
    );
  }
  
  // Test search history
  const historyResult = await makeRequest('/api/search/search-history/test-user-123?limit=10');
  logTest('Search History API', historyResult.success);
  if (historyResult.success && historyResult.data) {
    logTest('Search History Data Structure', 
      historyResult.data.data.searchHistory && 
      Array.isArray(historyResult.data.data.searchHistory)
    );
  }
  
  console.log('\n📋 TEST 4: Advanced Search Intelligence Features'.bold);
  
  // Test advanced search with specific care types
  const advancedSearchRequest = {
    query: 'independent living apartments with pet policies and transportation services',
    userId: 'advanced-user-test',
    context: {
      userPreferences: {
        communitySize: 'large',
        amenityPriorities: ['pets', 'transportation', 'social activities']
      },
      familyContext: 'helping elderly parent transition to senior living'
    }
  };
  
  const advancedResult = await makeRequest('/api/search/smart-search', {
    method: 'POST',
    body: JSON.stringify(advancedSearchRequest)
  });
  
  logTest('Advanced Search Processing', advancedResult.success);
  if (advancedResult.success && advancedResult.data) {
    logTest('Advanced Search Insights', 
      advancedResult.data.data.insights.alternativeSearches.length > 0
    );
    logTest('Search Statistics Calculation', 
      typeof advancedResult.data.data.searchStats.totalMatches === 'number'
    );
  }
  
  console.log('\n📋 TEST 5: Error Handling & Fallbacks'.bold);
  
  // Test empty search query
  const emptyQueryResult = await makeRequest('/api/search/smart-search', {
    method: 'POST',
    body: JSON.stringify({ query: '' })
  });
  logTest('Empty Query Validation', !emptyQueryResult.success && emptyQueryResult.status === 400);
  
  // Test invalid request format
  const invalidFormatResult = await makeRequest('/api/search/smart-search', {
    method: 'POST',
    body: JSON.stringify({ invalidField: 'test' })
  });
  logTest('Invalid Request Handling', !invalidFormatResult.success);
  
  // Test suggestions with no query
  const noQuerySuggestionsResult = await makeRequest('/api/search/search-suggestions');
  logTest('Default Suggestions Fallback', 
    noQuerySuggestionsResult.success && 
    noQuerySuggestionsResult.data.suggestions.length > 0
  );
}

async function testEnhancedSearchIntelligence() {
  try {
    await runEnhancedSearchTests();
    
    console.log('\n============================================================'.gray);
    console.log('🎯 ENHANCED SEARCH INTELLIGENCE TEST RESULTS'.bold.cyan);
    console.log('============================================================'.gray);
    
    const successRate = ((testsPassedCount / (testsPassedCount + testsFailedCount)) * 100).toFixed(1);
    
    console.log(`✅ Tests Passed: ${testsPassedCount}`.green);
    console.log(`❌ Tests Failed: ${testsFailedCount}`.red);
    console.log(`📊 Total Tests: ${testsPassedCount + testsFailedCount}`);
    console.log(`🎯 Success Rate: ${successRate}%`.cyan);
    
    console.log('\n📋 DETAILED TEST BREAKDOWN:'.bold);
    testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const color = result.passed ? 'green' : 'red';
      console.log(`${status} ${result.testName}`[color]);
    });
    
    console.log('\n🚀 ENHANCED SEARCH READINESS ASSESSMENT:'.bold);
    if (successRate >= 90) {
      console.log('🟢 EXCELLENT - Enhanced search intelligence is production-ready!'.green.bold);
    } else if (successRate >= 80) {
      console.log('🟡 GOOD - Enhanced search system functional with minor issues'.yellow.bold);
    } else if (successRate >= 70) {
      console.log('🟠 ACCEPTABLE - Core functionality working, needs optimization'.magenta.bold);
    } else {
      console.log('🔴 NEEDS IMPROVEMENT - Enhanced search requires fixes before launch'.red.bold);
    }
    
    console.log('\n✨ Enhanced search intelligence test execution completed!'.cyan);
    
  } catch (error) {
    console.error('🚨 Enhanced search test execution failed:', error.message);
    process.exit(1);
  }
}

// Execute the enhanced search intelligence tests
testEnhancedSearchIntelligence();