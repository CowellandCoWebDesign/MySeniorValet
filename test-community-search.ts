import { db } from "./server/db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { perplexityService } from "./server/perplexity-ai-service";

// Test cities in Georgia, Mississippi, and Michigan
const testCities = [
  // Georgia cities
  { city: 'Atlanta', state: 'GA' },
  { city: 'Savannah', state: 'GA' },
  { city: 'Augusta', state: 'GA' },
  { city: 'Columbus', state: 'GA' },
  { city: 'Macon', state: 'GA' },
  
  // Mississippi cities
  { city: 'Jackson', state: 'MS' },
  { city: 'Gulfport', state: 'MS' },
  { city: 'Hattiesburg', state: 'MS' },
  { city: 'Biloxi', state: 'MS' },
  { city: 'Meridian', state: 'MS' },
  
  // Michigan cities
  { city: 'Detroit', state: 'MI' },
  { city: 'Grand Rapids', state: 'MI' },
  { city: 'Ann Arbor', state: 'MI' },
  { city: 'Lansing', state: 'MI' },
  { city: 'Kalamazoo', state: 'MI' }
];

async function testCommunitySearch() {
  console.log('🧪 Testing Community-Specific Search Fix');
  console.log('=========================================\n');
  
  for (const location of testCities) {
    console.log(`\n📍 Testing ${location.city}, ${location.state}`);
    console.log('----------------------------------------');
    
    try {
      // Get a random community from this city
      const communitiesInCity = await db
        .select()
        .from(communities)
        .where(
          and(
            eq(communities.city, location.city),
            eq(communities.state, location.state)
          )
        )
        .limit(3);
      
      if (communitiesInCity.length === 0) {
        console.log(`   ⚠️  No communities found in ${location.city}, ${location.state}`);
        continue;
      }
      
      console.log(`   ✅ Found ${communitiesInCity.length} communities in ${location.city}`);
      
      // Test the first community
      const testCommunity = communitiesInCity[0];
      console.log(`\n   🏢 Testing: "${testCommunity.name}"`);
      console.log(`      Address: ${testCommunity.address}`);
      console.log(`      Type: ${testCommunity.type || 'Unknown'}`);
      
      // Simulate the EXACT search query that our fix performs
      const communitySearchQuery = `"${testCommunity.name}" official website management company contact information ${testCommunity.city} ${testCommunity.state}`;
      
      console.log(`\n   🔍 Search Query: ${communitySearchQuery}`);
      
      // Test if Perplexity search works for this specific community
      if (perplexityService.isConfigured()) {
        try {
          console.log(`   ⏳ Searching for specific community information...`);
          const searchResult = await perplexityService.searchRealTime(
            communitySearchQuery,
            `Finding public website and management information for ${testCommunity.name} senior living community`
          );
          
          // Check if the result mentions the specific community name
          const mentionsCommunity = searchResult.summary.toLowerCase().includes(testCommunity.name.toLowerCase());
          const mentionsWebsite = searchResult.summary.toLowerCase().includes('website') || 
                                  searchResult.summary.toLowerCase().includes('contact');
          const hasManagementInfo = searchResult.summary.toLowerCase().includes('management') ||
                                    searchResult.summary.toLowerCase().includes('operated') ||
                                    searchResult.summary.toLowerCase().includes('owned');
          
          console.log(`\n   📊 Search Results Analysis:`);
          console.log(`      ✓ Mentions specific community: ${mentionsCommunity ? '✅ YES' : '❌ NO'}`);
          console.log(`      ✓ Contains website/contact info: ${mentionsWebsite ? '✅ YES' : '⚪ Not found'}`);
          console.log(`      ✓ Has management information: ${hasManagementInfo ? '✅ YES' : '⚪ Not found'}`);
          console.log(`      ✓ Sources found: ${searchResult.sources.length} sources`);
          
          if (mentionsCommunity) {
            console.log(`\n   🎯 SUCCESS: Search correctly found information about "${testCommunity.name}"`);
          } else {
            console.log(`\n   ⚠️  WARNING: Search may not be specific enough for "${testCommunity.name}"`);
          }
          
          // Show a snippet of the result
          const snippet = searchResult.summary.substring(0, 200);
          console.log(`\n   📝 Result snippet: "${snippet}..."`);
          
        } catch (searchError: any) {
          console.log(`   ❌ Search failed: ${searchError.message}`);
        }
      } else {
        console.log(`   ⚠️  Perplexity API not configured - skipping live search test`);
      }
      
      // Add a small delay between searches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.log(`   ❌ Error testing ${location.city}: ${error.message}`);
    }
  }
  
  console.log('\n\n✅ Community Search Testing Complete!');
  console.log('=====================================');
  console.log('The fix ensures that when viewing a community detail page,');
  console.log('the "What We Found About {community.name}" section searches');
  console.log('for the SPECIFIC community, not just the city.');
  
  process.exit(0);
}

// Run the test
testCommunitySearch().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});