/**
 * Quick Wave 2 Verification Test
 */

async function testQuery(query) {
  try {
    const response = await fetch('http://localhost:5000/api/natural-language/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    
    console.log(`\n🔍 Query: "${query}"`);
    if (data.parsed) {
      console.log('✅ Parsed Intent:');
      if (data.parsed.location) console.log(`   Location: ${JSON.stringify(data.parsed.location)}`);
      if (data.parsed.priceRange) console.log(`   Price: ${JSON.stringify(data.parsed.priceRange)}`);
      if (data.parsed.careTypes) console.log(`   Care Types: ${data.parsed.careTypes.join(', ')}`);
      if (data.parsed.amenities) console.log(`   Amenities: ${data.parsed.amenities.join(', ')}`);
    } else {
      console.log('❌ No parsed intent returned');
    }
    console.log(`📊 Results: ${data.results?.length || 0} communities found`);
    
    return data.parsed;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 WAVE 2 PARSING VERIFICATION');
  console.log('==============================\n');
  
  // Test 1: State recognition
  const test1 = await testQuery('Senior living in California under $4000');
  
  // Test 2: Price keyword parsing  
  const test2 = await testQuery('Budget senior housing maximum $2500');
  
  // Test 3: Standalone price
  const test3 = await testQuery('$3500 memory care facilities');
  
  // Test 4: City and state parsing
  const test4 = await testQuery('Memory care in Dallas Texas');
  
  // Test 5: Complex query
  const test5 = await testQuery('Pet friendly under $4500 in Phoenix Arizona');
  
  // Test 6: Cheap keyword
  const test6 = await testQuery('Cheap assisted living communities');
  
  // Test 7: Starting at price
  const test7 = await testQuery('Luxury senior living starting at $7000');
  
  console.log('\n==============================');
  console.log('✨ Verification complete!');
  
  // Check key improvements
  console.log('\n🎯 WAVE 2 IMPROVEMENTS CHECK:');
  console.log(`1. State recognition (California): ${test1?.location?.state === 'CA' ? '✅' : '❌'}`);
  console.log(`2. Maximum price keyword: ${test2?.priceRange?.max === 2500 ? '✅' : '❌'}`);
  console.log(`3. Standalone price parsing: ${test3?.priceRange?.max === 3500 ? '✅' : '❌'}`);
  console.log(`4. City/State separation: ${test4?.location?.city === 'Dallas' && test4?.location?.state === 'TX' ? '✅' : '❌'}`);
  console.log(`5. Complex query parsing: ${test5?.priceRange?.max === 4500 && test5?.location?.city === 'Phoenix' ? '✅' : '❌'}`);
  console.log(`6. Cheap keyword → budget: ${test6?.priceRange?.max === 3000 ? '✅' : '❌'}`);
  console.log(`7. Starting at → minimum: ${test7?.priceRange?.min === 7000 ? '✅' : '❌'}`);
}

runTests().catch(console.error);