#!/usr/bin/env tsx

/**
 * COMPREHENSIVE SEARCH VALIDATION SCRIPT
 * Tests all search types: Countries, States, Cities, Counties, Community Names, Care Types, Companies
 */

interface TestCase {
  type: string;
  query: string;
  expectedMinResults: number;
}

interface TestResult {
  type: string;
  query: string;
  displayedResults: number;
  totalResults: number;
  status: 'PASS' | 'FAIL';
  error?: string;
}

async function testSearch(testCase: TestCase): Promise<TestResult> {
  try {
    const response = await fetch(`http://localhost:5000/api/search/comprehensive?q=${encodeURIComponent(testCase.query)}`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    const displayedResults = data.communities?.length || 0;
    const totalResults = data.totalResults || 0;
    
    const status = totalResults >= testCase.expectedMinResults ? 'PASS' : 'FAIL';
    
    return {
      type: testCase.type,
      query: testCase.query,
      displayedResults,
      totalResults,
      status
    };
    
  } catch (error) {
    return {
      type: testCase.type,
      query: testCase.query,
      displayedResults: 0,
      totalResults: 0,
      status: 'FAIL',
      error: error.message
    };
  }
}

async function runComprehensiveSearchValidation() {
  console.log('🔍 COMPREHENSIVE SEARCH VALIDATION TESTING');
  console.log('===============================================');
  
  const testCases: TestCase[] = [
    // Countries
    { type: 'Country', query: 'Canada', expectedMinResults: 1000 },
    { type: 'Country', query: 'Australia', expectedMinResults: 500 },
    { type: 'Country', query: 'Mexico', expectedMinResults: 100 },
    
    // States
    { type: 'State', query: 'California', expectedMinResults: 1000 },
    { type: 'State', query: 'Texas', expectedMinResults: 1000 },
    { type: 'State', query: 'Florida', expectedMinResults: 500 },
    { type: 'State', query: 'New York', expectedMinResults: 200 },
    
    // Cities
    { type: 'City', query: 'Los Angeles', expectedMinResults: 10 },
    { type: 'City', query: 'Toronto', expectedMinResults: 50 },
    { type: 'City', query: 'Miami', expectedMinResults: 20 },
    { type: 'City', query: 'Phoenix', expectedMinResults: 15 },
    { type: 'City', query: 'Dallas', expectedMinResults: 20 },
    
    // Counties
    { type: 'County', query: 'Orange County', expectedMinResults: 5 },
    { type: 'County', query: 'Cook County', expectedMinResults: 5 },
    { type: 'County', query: 'Harris County', expectedMinResults: 5 },
    
    // Community Names (partial matches)
    { type: 'Community', query: 'Sunrise', expectedMinResults: 50 },
    { type: 'Community', query: 'Heritage', expectedMinResults: 100 },
    { type: 'Community', query: 'Garden', expectedMinResults: 200 },
    { type: 'Community', query: 'Manor', expectedMinResults: 30 },
    
    // Care Types
    { type: 'Care Type', query: 'Memory Care', expectedMinResults: 500 },
    { type: 'Care Type', query: 'Assisted Living', expectedMinResults: 1000 },
    { type: 'Care Type', query: 'Independent Living', expectedMinResults: 500 },
    
    // Companies
    { type: 'Company', query: 'Atria', expectedMinResults: 50 },
    { type: 'Company', query: 'Brookdale', expectedMinResults: 30 },
    { type: 'Company', query: 'Sunrise Senior Living', expectedMinResults: 20 }
  ];
  
  const results: TestResult[] = [];
  
  for (const testCase of testCases) {
    console.log(`📋 Testing ${testCase.type}: ${testCase.query}`);
    const result = await testSearch(testCase);
    results.push(result);
    
    if (result.status === 'PASS') {
      console.log(`✅ PASS - ${testCase.query}: ${result.displayedResults} displayed, ${result.totalResults} total`);
    } else {
      console.log(`❌ FAIL - ${testCase.query}: ${result.totalResults} total (expected ≥${testCase.expectedMinResults})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log('\n===============================================');
  console.log('📊 COMPREHENSIVE SEARCH RESULTS BY TYPE:');
  console.log('===============================================');
  
  // Group results by type
  const resultsByType = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);
  
  for (const [type, typeResults] of Object.entries(resultsByType)) {
    const passCount = typeResults.filter(r => r.status === 'PASS').length;
    const totalCount = typeResults.length;
    const status = passCount === totalCount ? '✅' : '❌';
    
    console.log(`${status} ${type}: ${passCount}/${totalCount} tests passed`);
    
    typeResults.forEach(result => {
      const icon = result.status === 'PASS' ? '  ✅' : '  ❌';
      console.log(`${icon} ${result.query}: ${result.totalResults} results`);
    });
    console.log('');
  }
  
  const totalPass = results.filter(r => r.status === 'PASS').length;
  const totalTests = results.length;
  
  console.log('===============================================');
  console.log(`📊 OVERALL SEARCH SYSTEM RESULTS: ${totalPass}/${totalTests} tests passed`);
  
  if (totalPass === totalTests) {
    console.log('🎉 SUCCESS - Comprehensive search system fully operational!');
  } else {
    console.log('⚠️  ISSUES DETECTED - Some search types need attention');
  }
  
  return results;
}

// Run the comprehensive validation
runComprehensiveSearchValidation().catch(console.error);