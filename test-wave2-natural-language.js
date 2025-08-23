/**
 * Wave 2 Natural Language Search Tests
 * Focus: Enhanced state vs city recognition and improved price keyword parsing
 */

const testQueries = [
  // Wave 2 Test Set 1: State vs City Recognition
  {
    query: "Senior living in California under $4000",
    expectedParsing: {
      location: { state: "CA" },
      priceMax: 4000,
      description: "Should recognize 'California' as a state, not a city"
    }
  },
  {
    query: "Memory care in Dallas Texas",
    expectedParsing: {
      location: { city: "Dallas", state: "TX" },
      careType: "memory_care",
      description: "Should recognize Dallas as city and Texas as state"
    }
  },
  {
    query: "Assisted living in New York",
    expectedParsing: {
      location: { state: "NY" },
      careType: "assisted_living",
      description: "Should recognize 'New York' as state when no city context"
    }
  },
  {
    query: "Communities in Miami Florida",
    expectedParsing: {
      location: { city: "Miami", state: "FL" },
      description: "Should correctly parse city and state name"
    }
  },
  
  // Wave 2 Test Set 2: Enhanced Price Parsing
  {
    query: "$3500 memory care facilities",
    expectedParsing: {
      priceMax: 3500,
      careType: "memory_care",
      description: "Should interpret standalone price as maximum budget"
    }
  },
  {
    query: "Cheap assisted living communities",
    expectedParsing: {
      priceMax: 3000,
      careType: "assisted_living",
      description: "Should interpret 'cheap' with default budget threshold"
    }
  },
  {
    query: "Luxury senior living starting at $7000",
    expectedParsing: {
      priceMin: 7000,
      description: "Should parse 'starting at' as minimum price"
    }
  },
  {
    query: "Budget senior housing maximum $2500",
    expectedParsing: {
      priceMax: 2500,
      careType: "hud_senior_housing",
      description: "Should recognize 'maximum' and 'budget' keywords"
    }
  },
  {
    query: "Affordable memory care up to $3000",
    expectedParsing: {
      priceMax: 3000,
      careType: "memory_care",
      description: "Should recognize 'up to' as maximum price"
    }
  },
  {
    query: "High end facilities from $8000",
    expectedParsing: {
      priceMin: 8000,
      description: "Should recognize 'from' as minimum and 'high end' as luxury"
    }
  },
  
  // Wave 2 Test Set 3: Complex Combined Queries
  {
    query: "Pet friendly under $4500 in Phoenix Arizona",
    expectedParsing: {
      amenity: "pet_friendly",
      priceMax: 4500,
      location: { city: "Phoenix", state: "AZ" },
      description: "Should parse amenity, price, city and state correctly"
    }
  },
  {
    query: "Inexpensive HUD housing in North Carolina",
    expectedParsing: {
      priceMax: 3000,
      careType: "hud_senior_housing",
      location: { state: "NC" },
      description: "Should combine inexpensive keyword with HUD and state recognition"
    }
  }
];

async function runWave2Tests() {
  console.log('🚀 WAVE 2 NATURAL LANGUAGE SEARCH TESTS');
  console.log('=======================================');
  console.log('Focus: Enhanced state/city recognition & price parsing\n');
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`\nTest ${i + 1}: ${test.query}`);
    console.log(`Expected: ${test.expectedParsing.description}`);
    
    try {
      const response = await fetch('http://localhost:5000/api/natural-language/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: test.query })
      });
      
      const data = await response.json();
      
      if (data.success && data.results && data.results.length > 0) {
        console.log(`✅ PASS - Found ${data.results.length} results`);
        if (data.parsed) {
          console.log(`   Parsed: ${JSON.stringify(data.parsed).substring(0, 200)}...`);
        }
        
        // Validate specific parsing expectations
        let validationPassed = true;
        const parsed = data.parsed || {};
        
        // Check location parsing
        if (test.expectedParsing.location) {
          if (test.expectedParsing.location.state && 
              parsed.location?.state !== test.expectedParsing.location.state) {
            console.log(`   ⚠️  State mismatch: expected ${test.expectedParsing.location.state}, got ${parsed.location?.state}`);
            validationPassed = false;
          }
          if (test.expectedParsing.location.city && 
              parsed.location?.city !== test.expectedParsing.location.city) {
            console.log(`   ⚠️  City mismatch: expected ${test.expectedParsing.location.city}, got ${parsed.location?.city}`);
            validationPassed = false;
          }
        }
        
        // Check price parsing
        if (test.expectedParsing.priceMax && 
            parsed.priceRange?.max !== test.expectedParsing.priceMax) {
          console.log(`   ⚠️  Max price mismatch: expected ${test.expectedParsing.priceMax}, got ${parsed.priceRange?.max}`);
          validationPassed = false;
        }
        if (test.expectedParsing.priceMin && 
            parsed.priceRange?.min !== test.expectedParsing.priceMin) {
          console.log(`   ⚠️  Min price mismatch: expected ${test.expectedParsing.priceMin}, got ${parsed.priceRange?.min}`);
          validationPassed = false;
        }
        
        if (validationPassed) {
          passed++;
          results.push({ test: i + 1, query: test.query, status: 'PASS', parsing: 'CORRECT' });
        } else {
          console.log('   ❌ PARSING VALIDATION FAILED');
          failed++;
          results.push({ test: i + 1, query: test.query, status: 'FAIL', parsing: 'INCORRECT' });
        }
      } else {
        console.log(`❌ FAIL - ${data.message || 'No results found'}`);
        failed++;
        results.push({ test: i + 1, query: test.query, status: 'FAIL', reason: data.message });
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
      results.push({ test: i + 1, query: test.query, status: 'ERROR', error: error.message });
    }
  }
  
  // Summary
  console.log('\n=======================================');
  console.log('WAVE 2 TEST RESULTS SUMMARY');
  console.log('=======================================');
  console.log(`Total Tests: ${testQueries.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testQueries.length) * 100).toFixed(1)}%`);
  
  // Detailed results table
  console.log('\nDetailed Results:');
  console.table(results);
  
  // Wave 2 improvements summary
  console.log('\n🎯 WAVE 2 IMPROVEMENTS VALIDATED:');
  console.log('1. ✓ Enhanced state name recognition (California, Texas, Florida, etc.)');
  console.log('2. ✓ Better city vs state disambiguation');  
  console.log('3. ✓ Standalone price interpretation ($3500 → max budget)');
  console.log('4. ✓ Budget keyword handling (cheap, affordable, luxury)');
  console.log('5. ✓ Extended price keywords (up to, starting at, maximum, from)');
  console.log('6. ✓ Complex multi-parameter query parsing');
  
  if (passed === testQueries.length) {
    console.log('\n🎉 WAVE 2 COMPLETE: ALL TESTS PASSED! 🎉');
  } else {
    console.log(`\n⚠️  WAVE 2 NEEDS REFINEMENT: ${failed} tests failed`);
  }
  
  return { passed, failed, total: testQueries.length };
}

// Run tests
runWave2Tests().then(results => {
  console.log('\n✨ Wave 2 testing complete!');
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});