// Test with a real community that should exist
async function testRealCommunity() {
  try {
    console.log('\n🧪 Testing AI Enrichment for Arbor Terrace Senior Living...\n');
    
    // Test with a real community
    const response = await fetch('http://localhost:5000/api/competitive-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        communityId: 1,
        communityName: 'Arbor Terrace Senior Living',
        location: 'Ashburn, VA'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📊 API Response Summary:');
    console.log('=======================');
    console.log(`✅ Success: ${data.success}`);
    console.log(`🏘️ Community: ${data.communityName}`);
    console.log(`📍 Location: ${data.location}`);
    console.log('\n🔍 Intelligence Data:');
    console.log(`  - Found: ${data.intelligence?.found}`);
    console.log(`  - Website: ${data.intelligence?.officialWebsite || 'Not found'}`);
    console.log(`  - Phone: ${data.intelligence?.phone || 'Not found'}`);
    console.log(`  - Address: ${data.intelligence?.address || 'Not found'}`);
    console.log(`  - Photos: ${data.intelligence?.photos?.length || 0} found`);
    console.log(`  - Sources: ${data.intelligence?.sources?.length || 0} references`);
    
    // Determine test result
    const isAreaSearch = data.intelligence?.name === 'Area Search' && 
                        data.intelligence?.found === false &&
                        data.intelligence?.nearbyOptions;
    
    const hasProperData = data.intelligence?.found === true && 
                         (data.intelligence?.officialWebsite || 
                          data.intelligence?.phone || 
                          data.intelligence?.photos?.length > 0);
    
    console.log('\n' + '='.repeat(50));
    if (hasProperData) {
      console.log('✅ TEST PASSED: AI enrichment found specific community data!');
    } else if (isAreaSearch) {
      console.log('⚠️ UNEXPECTED: Real community returned area search results');
      console.log('This community may have closed or changed names.');
    } else {
      console.log('❌ TEST FAILED: Unexpected AI enrichment response.');
    }
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Wait for server to be ready, then run test
setTimeout(testRealCommunity, 2000);
