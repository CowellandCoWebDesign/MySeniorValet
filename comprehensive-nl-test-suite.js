/**
 * Comprehensive Natural Language Search Automated Test Suite
 * Tests Wave 1 & Wave 2 improvements with real-world scenarios
 */

import fetch from 'node-fetch';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Test categories with real-world user scenarios
const testSuites = [
  {
    name: "🌍 Location Understanding",
    tests: [
      { query: "Senior living in California", expected: { state: "CA" } },
      { query: "Communities in Texas", expected: { state: "TX" } },
      { query: "Memory care in Los Angeles", expected: { city: "Los Angeles" } },
      { query: "Assisted living in Dallas Texas", expected: { city: "Dallas", state: "TX" } },
      { query: "Facilities in Miami Florida", expected: { city: "Miami", state: "FL" } },
      { query: "Senior homes in New York", expected: { state: "NY" } },
      { query: "Retirement in Phoenix Arizona", expected: { city: "Phoenix", state: "AZ" } },
      { query: "Communities in North Carolina", expected: { state: "NC" } }
    ]
  },
  {
    name: "💰 Price Intelligence",
    tests: [
      { query: "Under $3000", expected: { maxPrice: 3000 } },
      { query: "Below $5000 per month", expected: { maxPrice: 5000 } },
      { query: "$2500 senior living", expected: { maxPrice: 2500 } },
      { query: "Cheap assisted living", expected: { maxPrice: 3000 } },
      { query: "Affordable memory care", expected: { maxPrice: 3000 } },
      { query: "Budget senior housing", expected: { hasPrice: true } },
      { query: "Luxury communities starting at $8000", expected: { minPrice: 8000 } },
      { query: "High end from $10000", expected: { minPrice: 10000 } },
      { query: "Maximum $4500", expected: { maxPrice: 4500 } },
      { query: "Up to $3500 monthly", expected: { maxPrice: 3500 } }
    ]
  },
  {
    name: "🏠 Care Type Recognition",
    tests: [
      { query: "Memory care facilities", expected: { careType: "memory_care" } },
      { query: "Assisted living communities", expected: { careType: "assisted_living" } },
      { query: "Independent living", expected: { careType: "independent_living" } },
      { query: "Skilled nursing homes", expected: { careType: "skilled_nursing" } },
      { query: "Continuing care retirement", expected: { careType: "continuing_care" } },
      { query: "HUD senior housing", expected: { careType: "hud_senior_housing", needsHUD: true } },
      { query: "55+ active adult", expected: { careType: "active_adult_55_plus" } },
      { query: "Alzheimer's care", expected: { careType: "memory_care" } },
      { query: "Dementia care facilities", expected: { careType: "memory_care" } }
    ]
  },
  {
    name: "🎯 Complex Multi-Parameter Queries",
    tests: [
      { 
        query: "Cheap memory care in California", 
        expected: { state: "CA", maxPrice: 3000, careType: "memory_care" } 
      },
      { 
        query: "Pet friendly assisted living under $4000 in Texas", 
        expected: { state: "TX", maxPrice: 4000, careType: "assisted_living", amenity: "pet_friendly" } 
      },
      { 
        query: "Luxury independent living in Miami Florida over $7000", 
        expected: { city: "Miami", state: "FL", minPrice: 7000, careType: "independent_living" } 
      },
      { 
        query: "Affordable HUD housing in Phoenix Arizona", 
        expected: { city: "Phoenix", state: "AZ", needsHUD: true } 
      },
      { 
        query: "Budget skilled nursing under $3500 in Dallas", 
        expected: { city: "Dallas", maxPrice: 3500, careType: "skilled_nursing" } 
      }
    ]
  },
  {
    name: "✨ Amenity Recognition",
    tests: [
      { query: "Pet friendly communities", expected: { amenity: "pet_friendly" } },
      { query: "Communities with pool", expected: { amenity: "pool" } },
      { query: "Places with gym", expected: { amenity: "gym" } },
      { query: "Transportation services", expected: { amenity: "transportation" } },
      { query: "Facilities with parking", expected: { amenity: "parking" } }
    ]
  },
  {
    name: "🎖️ Special Keywords",
    tests: [
      { query: "Veterans homes", expected: { isVeteran: true } },
      { query: "VA assisted living", expected: { isVeteran: true } },
      { query: "Military retirement", expected: { isVeteran: true } },
      { query: "High quality care", expected: { requiresHighQuality: true } },
      { query: "Verified communities", expected: { requiresVerified: true } },
      { query: "Available now", expected: { availability: "immediate" } }
    ]
  }
];

// Test execution function
async function runTest(query) {
  try {
    const response = await fetch('http://localhost:5000/api/natural-language/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    return { success: data.success, parsed: data.parsed, resultCount: data.resultCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Validation function
function validateResult(result, expected) {
  if (!result.success) return false;
  if (!result.parsed) return false;
  
  const parsed = result.parsed;
  
  // Validate location
  if (expected.state && parsed.location?.state !== expected.state) return false;
  if (expected.city && parsed.location?.city !== expected.city) return false;
  
  // Validate price
  if (expected.maxPrice && parsed.priceRange?.max !== expected.maxPrice) return false;
  if (expected.minPrice && parsed.priceRange?.min !== expected.minPrice) return false;
  if (expected.hasPrice && !parsed.priceRange) return false;
  
  // Validate care type
  if (expected.careType && !parsed.careTypes?.includes(expected.careType)) return false;
  
  // Validate amenities
  if (expected.amenity && !parsed.amenities?.includes(expected.amenity)) return false;
  
  // Validate special flags
  if (expected.isVeteran && !parsed.isVeteran) return false;
  if (expected.needsHUD && !parsed.needsHUD) return false;
  if (expected.requiresHighQuality && !parsed.requiresHighQuality) return false;
  if (expected.requiresVerified && !parsed.requiresVerified) return false;
  if (expected.availability && parsed.availability !== expected.availability) return false;
  
  return true;
}

// Main test runner
async function runAllTests() {
  console.log(colors.bright + colors.cyan + '╔══════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.cyan + '║     COMPREHENSIVE NATURAL LANGUAGE SEARCH AUTOMATED TESTING     ║' + colors.reset);
  console.log(colors.bright + colors.cyan + '╚══════════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log();
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const suiteResults = [];
  
  // Run each test suite
  for (const suite of testSuites) {
    console.log(colors.bright + colors.yellow + `\n${suite.name}` + colors.reset);
    console.log(colors.yellow + '─'.repeat(50) + colors.reset);
    
    let suitePassed = 0;
    let suiteFailed = 0;
    
    for (const test of suite.tests) {
      totalTests++;
      process.stdout.write(`  Testing: "${test.query}"... `);
      
      const result = await runTest(test.query);
      const isValid = validateResult(result, test.expected);
      
      if (isValid) {
        passedTests++;
        suitePassed++;
        console.log(colors.green + '✅ PASS' + colors.reset);
      } else {
        failedTests++;
        suiteFailed++;
        console.log(colors.red + '❌ FAIL' + colors.reset);
        if (result.parsed) {
          console.log(colors.red + `     Expected: ${JSON.stringify(test.expected)}` + colors.reset);
          console.log(colors.red + `     Got: ${JSON.stringify(result.parsed, null, 2).split('\n').join('\n     ')}` + colors.reset);
        }
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    suiteResults.push({
      name: suite.name,
      total: suite.tests.length,
      passed: suitePassed,
      failed: suiteFailed,
      successRate: ((suitePassed / suite.tests.length) * 100).toFixed(1)
    });
    
    console.log(colors.cyan + `  Suite Results: ${suitePassed}/${suite.tests.length} passed (${((suitePassed/suite.tests.length)*100).toFixed(1)}%)` + colors.reset);
  }
  
  // Final summary
  console.log(colors.bright + colors.magenta + '\n\n╔══════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.magenta + '║                         FINAL RESULTS                           ║' + colors.reset);
  console.log(colors.bright + colors.magenta + '╚══════════════════════════════════════════════════════════════════╝' + colors.reset);
  
  console.log('\n' + colors.bright + 'Test Suite Performance:' + colors.reset);
  console.table(suiteResults);
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  const statusColor = successRate >= 90 ? colors.green : successRate >= 70 ? colors.yellow : colors.red;
  
  console.log('\n' + colors.bright + 'Overall Statistics:' + colors.reset);
  console.log(`  Total Tests: ${colors.cyan}${totalTests}${colors.reset}`);
  console.log(`  Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed: ${colors.red}${failedTests}${colors.reset}`);
  console.log(`  Success Rate: ${statusColor}${successRate}%${colors.reset}`);
  
  // Performance grade
  let grade = '';
  let gradeColor = '';
  if (successRate >= 95) { grade = 'A+'; gradeColor = colors.green; }
  else if (successRate >= 90) { grade = 'A'; gradeColor = colors.green; }
  else if (successRate >= 85) { grade = 'B+'; gradeColor = colors.yellow; }
  else if (successRate >= 80) { grade = 'B'; gradeColor = colors.yellow; }
  else if (successRate >= 75) { grade = 'C+'; gradeColor = colors.yellow; }
  else if (successRate >= 70) { grade = 'C'; gradeColor = colors.yellow; }
  else { grade = 'F'; gradeColor = colors.red; }
  
  console.log('\n' + colors.bright + `System Grade: ${gradeColor}${grade}${colors.reset}`);
  
  if (successRate >= 90) {
    console.log(colors.green + colors.bright + '\n🎉 EXCELLENT! Natural Language Search is production-ready! 🎉' + colors.reset);
  } else if (successRate >= 70) {
    console.log(colors.yellow + '\n⚠️  Good progress, but some improvements needed.' + colors.reset);
  } else {
    console.log(colors.red + '\n❌ Significant issues detected. Review failed tests.' + colors.reset);
  }
  
  console.log(colors.cyan + '\n✨ Automated testing complete!' + colors.reset);
}

// Run the tests
console.log(colors.cyan + 'Starting automated test suite...\n' + colors.reset);
runAllTests().catch(console.error);