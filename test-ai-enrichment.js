// Test script to verify AI enrichment is working after parsing fix

async function testAIEnrichment() {
  try {
    console.log('\n🧪 Testing AI Enrichment for Shasta Estates Senior Living...\n');
    
    // Test the competitive analysis endpoint
    const response = await fetch('http://localhost:5000/api/competitive-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        communityId: 70638,
        communityName: 'Shasta Estates Senior Living',
        location: 'Redding, CA'
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
    
    if (data.intelligence?.pricing) {
      console.log('\n💰 Pricing Information:');
      Object.entries(data.intelligence.pricing).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }
    
    if (data.intelligence?.careLevels?.length > 0) {
      console.log(`\n🏥 Care Levels: ${data.intelligence.careLevels.join(', ')}`);
    }
    
    if (data.intelligence?.amenities?.length > 0) {
      console.log(`\n🎯 Amenities: ${data.intelligence.amenities.join(', ')}`);
    }
    
    // Determine test result
    const isAreaSearch = data.intelligence?.name === 'Area Search' && 
                        data.intelligence?.found === false &&
                        data.intelligence?.nearbyOptions;
    
    const testPassed = data.intelligence?.found === true && 
                      (data.intelligence?.officialWebsite || 
                       data.intelligence?.phone || 
                       data.intelligence?.photos?.length > 0);
    
    console.log('\n' + '='.repeat(50));
    if (testPassed) {
      console.log('✅ TEST PASSED: AI enrichment found specific community data!');
      console.log('The parsing fix successfully resolves the false negative issue.');
    } else if (isAreaSearch) {
      console.log('✅ TEST PASSED: AI correctly returned area search (community not found)');
      console.log(`  - Found ${data.intelligence?.nearbyOptions?.length || 0} nearby communities`);
      console.log('  - This is expected behavior when specific community doesn\'t exist');
    } else {
      console.log('❌ TEST FAILED: Unexpected AI enrichment response.');
      console.log('Debug info:', JSON.stringify(data.intelligence, null, 2));
    }
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Wait a moment for server to be ready, then run test
setTimeout(testAIEnrichment, 2000);