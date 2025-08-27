// Test with Hilltop Estates specifically
async function testHilltop() {
  try {
    console.log('\n🧪 Testing AI Enrichment for Hilltop Estates...\n');
    
    const response = await fetch('http://localhost:5000/api/competitive-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        communityId: 74914,
        communityName: 'Hilltop Estates',
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
    
    // Show full intelligence object for debugging
    console.log('\n📄 Full Intelligence Object:');
    console.log(JSON.stringify(data.intelligence, null, 2));
    
    console.log('\n' + '='.repeat(50));
    if (data.intelligence?.found === true) {
      console.log('✅ TEST PASSED: Community found with data!');
    } else {
      console.log('❌ TEST FAILED: Community shows as not found despite having data.');
    }
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Wait for server to be ready, then run test
setTimeout(testHilltop, 2000);
