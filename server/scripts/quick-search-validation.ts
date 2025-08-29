#!/usr/bin/env tsx
/**
 * QUICK SEARCH VALIDATION - API Testing Focus
 */

interface ValidationTest {
  name: string;
  url: string;
  expectedFields: string[];
  minResults?: number;
}

const tests: ValidationTest[] = [
  {
    name: "Search Suggestions API",
    url: "http://localhost:5000/api/search/suggestions?q=memory",
    expectedFields: ["suggestions"],
    minResults: 1
  },
  {
    name: "Comprehensive Search - Memory Care",
    url: "http://localhost:5000/api/search/comprehensive?q=memory%20care",
    expectedFields: ["communities", "facets", "searchMetadata"],
    minResults: 1
  },
  {
    name: "Comprehensive Search - Sacramento",
    url: "http://localhost:5000/api/search/comprehensive?q=Sacramento",
    expectedFields: ["communities", "facets"],
    minResults: 1
  },
  {
    name: "Comprehensive Search - Atria",
    url: "http://localhost:5000/api/search/comprehensive?q=Atria",
    expectedFields: ["communities", "facets"],
    minResults: 1
  },
  {
    name: "Comprehensive Search - Canada",
    url: "http://localhost:5000/api/search/comprehensive?q=Canada",
    expectedFields: ["communities", "facets"],
    minResults: 1
  },
  {
    name: "Platform Stats",
    url: "http://localhost:5000/api/platform/stats/formatted",
    expectedFields: ["totalCommunities", "countriesCovered"],
    minResults: 0
  },
  {
    name: "Communities Count",
    url: "http://localhost:5000/api/communities/count",
    expectedFields: ["count"],
    minResults: 0
  }
];

async function runValidation() {
  console.log('🧪 QUICK SEARCH VALIDATION TESTING');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Testing: ${test.name}`);
    
    try {
      const response = await fetch(test.url);
      
      if (!response.ok) {
        console.log(`❌ FAIL - HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Response received (${response.status})`);
      
      // Check required fields
      let hasAllFields = true;
      for (const field of test.expectedFields) {
        if (!(field in data)) {
          console.log(`⚠️  Missing field: ${field}`);
          hasAllFields = false;
        }
      }
      
      // Check minimum results if applicable
      let hasMinResults = true;
      if (test.minResults !== undefined && test.minResults > 0) {
        if (data.communities && Array.isArray(data.communities)) {
          if (data.communities.length < test.minResults) {
            console.log(`⚠️  Insufficient results: ${data.communities.length} < ${test.minResults}`);
            hasMinResults = false;
          } else {
            console.log(`📊 Results: ${data.communities.length} communities found`);
          }
        } else if (data.suggestions && Array.isArray(data.suggestions)) {
          if (data.suggestions.length < test.minResults) {
            console.log(`⚠️  Insufficient suggestions: ${data.suggestions.length} < ${test.minResults}`);
            hasMinResults = false;
          } else {
            console.log(`💭 Suggestions: ${data.suggestions.length} found`);
          }
        }
      }
      
      if (hasAllFields && hasMinResults) {
        console.log(`✅ PASS - ${test.name}`);
        passed++;
      } else {
        console.log(`❌ FAIL - ${test.name}`);
      }
      
      // Show sample data
      if (data.communities && data.communities.length > 0) {
        const sample = data.communities[0];
        console.log(`   Sample: ${sample.name} in ${sample.city}, ${sample.state}`);
      }
      
      if (data.suggestions && data.suggestions.length > 0) {
        console.log(`   Sample suggestions: ${data.suggestions.slice(0, 3).join(', ')}`);
      }
      
      if (data.totalCommunities) {
        console.log(`   Platform total: ${data.totalCommunities} communities`);
      }
      
    } catch (error) {
      console.log(`❌ FAIL - ${test.name}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 VALIDATION RESULTS: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED - Search system is fully operational!');
  } else if (passed >= total * 0.8) {
    console.log('✅ GOOD - Most functionality is working');
  } else {
    console.log('⚠️  ISSUES DETECTED - Some functionality needs attention');
  }
  
  return { passed, total, success: passed === total };
}

runValidation().catch(console.error);