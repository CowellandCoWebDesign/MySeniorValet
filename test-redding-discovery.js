import { googlePlacesIntegration } from './server/google-places-integration.js';

async function testReddingDiscovery() {
  console.log('🔍 Testing direct Redding, CA discovery...');
  
  // Test multiple search terms specifically for Redding
  const searchTerms = [
    'senior living redding ca',
    'assisted living redding ca', 
    'retirement community redding ca',
    'memory care redding ca',
    'senior apartments redding ca',
    'senior housing redding ca',
    'nursing home redding ca',
    'elder care redding ca',
    'senior care redding ca',
    'continuing care retirement redding ca'
  ];
  
  const reddingCoords = { lat: 40.5865, lng: -122.3917 };
  let allCommunities = [];
  
  for (const term of searchTerms) {
    try {
      console.log(`\n🔍 Searching: "${term}"`);
      
      const communities = await googlePlacesIntegration.discoverCommunitiesInArea(
        term,
        reddingCoords.lat,
        reddingCoords.lng,
        25000 // 25km radius
      );
      
      console.log(`✅ Found ${communities.length} communities for "${term}"`);
      
      if (communities.length > 0) {
        communities.forEach(c => {
          console.log(`  - ${c.name} (${c.address})`);
        });
        allCommunities.push(...communities);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error searching "${term}":`, error.message);
    }
  }
  
  console.log(`\n📊 Total unique communities found: ${allCommunities.length}`);
  
  // Remove duplicates
  const uniqueCommunities = [];
  const seen = new Set();
  
  for (const community of allCommunities) {
    const key = `${community.name.toLowerCase()}-${community.address.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCommunities.push(community);
    }
  }
  
  console.log(`📊 After deduplication: ${uniqueCommunities.length} unique communities`);
  
  uniqueCommunities.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} - ${c.address}`);
  });
  
  return uniqueCommunities;
}

// Run the test
testReddingDiscovery().catch(console.error);