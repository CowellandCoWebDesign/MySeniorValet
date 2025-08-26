// Test the streamlined web intelligence approach
// This demonstrates how we can pass an already-known website to skip redundant searches

async function testStreamlinedWebIntelligence() {
  console.log('🚀 Testing STREAMLINED web intelligence approach...\n');
  console.log('=' .repeat(60));
  
  // Test communities with known websites
  const testCommunities = [
    {
      name: 'Superior Residences of Panama City Beach',
      address: '112 Venture Blvd',
      city: 'Panama City Beach',
      state: 'Florida',
      website: 'https://superiorpcb.com' // We already found this!
    },
    {
      name: 'Brookdale Lake Shore Drive',
      address: '2960 N Lake Shore Dr',
      city: 'Chicago', 
      state: 'Illinois',
      website: 'https://brookdale.com' // Corporate site we already know
    },
    {
      name: 'Sunrise of McLean Village',
      address: '8180 Greensboro Dr',
      city: 'McLean',
      state: 'Virginia',
      website: 'https://sunriseseniorliving.com' // Another known corporate site
    }
  ];

  for (const community of testCommunities) {
    console.log(`\n📍 Testing: ${community.name}`);
    console.log(`   Address: ${community.address}, ${community.city}, ${community.state}`);
    console.log(`   Known Website: ${community.website}`);
    console.log('─'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:5000/api/communities/web-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityName: community.name,
          address: community.address,
          city: community.city,
          state: community.state,
          website: community.website // Pass the known website!
        })
      });
      
      const data = await response.json();
      
      // Parse the response to show clear separation
      const content = data.content || '';
      const officialSection = content.match(/\*\*OFFICIAL COMMUNITY INFORMATION\*\*([\s\S]*?)\*\*THIRD-PARTY REFERENCES/);
      const thirdPartySection = content.match(/\*\*THIRD-PARTY REFERENCES & REVIEWS\*\*([\s\S]*)/);
      
      console.log('\n✅ OFFICIAL WEBSITE DATA:');
      if (officialSection) {
        console.log('   Retrieved comprehensive data directly from official website');
      } else {
        console.log('   No official website section found');
      }
      
      console.log('\n📚 THIRD-PARTY REFERENCES:');
      const thirdPartySources = data.citations?.filter(source => !source.includes(community.website.replace('https://', ''))) || [];
      console.log(`   ${thirdPartySources.length} third-party sources found`);
      thirdPartySources.slice(0, 3).forEach((source, i) => {
        console.log(`   ${i + 1}. ${source}`);
      });
      
      console.log('\n🔍 Verification Status:', data.verified ? '✅ VERIFIED' : '❌ NOT VERIFIED');
      
      if (data.pricing) {
        console.log('\n💰 Pricing Found:', data.pricing);
      }
      
      if (data.images && data.images.length > 0) {
        console.log(`\n📸 Photos: ${data.images.length} found`);
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n');
  console.log('=' .repeat(60));
  console.log('🏁 Streamlined test complete!');
  console.log('\nKey Insights:');
  console.log('• When we already have the official website, we fetch directly from it');
  console.log('• This avoids redundant searches and ensures accuracy');
  console.log('• We clearly separate official data from third-party references');
  console.log('• Address matching ensures we get the RIGHT community data');
}

// Run the test
testStreamlinedWebIntelligence().catch(console.error);