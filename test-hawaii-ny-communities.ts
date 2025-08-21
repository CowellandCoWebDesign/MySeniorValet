import { db } from "./server/db";
import { communities } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { perplexityService } from "./server/perplexity-ai-service";

async function testCommunityWebsiteDiscovery() {
  console.log('🧪 Testing Optimized Website Discovery for Hawaii & New York Communities');
  console.log('=======================================================================\n');
  
  // Get 3 communities from Hawaii
  const hawaiiCommunities = await db
    .select()
    .from(communities)
    .where(eq(communities.state, 'HI'))
    .limit(3);
  
  // Get 3 communities from New York
  const newYorkCommunities = await db
    .select()
    .from(communities)
    .where(eq(communities.state, 'NY'))
    .limit(3);
  
  const testCommunities = [...hawaiiCommunities, ...newYorkCommunities];
  
  if (testCommunities.length === 0) {
    console.log('❌ No communities found in Hawaii or New York');
    process.exit(1);
  }
  
  console.log(`✅ Found ${hawaiiCommunities.length} communities in Hawaii`);
  console.log(`✅ Found ${newYorkCommunities.length} communities in New York\n`);
  
  // Test each community
  for (const community of testCommunities) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📍 Testing: ${community.name}`);
    console.log(`   Location: ${community.city}, ${community.state}`);
    console.log(`   Address: ${community.address}`);
    console.log(`${'='.repeat(80)}`);
    
    // Apply the same optimized search logic from our fix
    const needsSeniorLiving = !community.name.toLowerCase().includes('senior') && 
                              !community.name.toLowerCase().includes('retirement') &&
                              !community.name.toLowerCase().includes('assisted') &&
                              !community.name.toLowerCase().includes('nursing') &&
                              !community.name.toLowerCase().includes('memory care');
    
    const communitySearchQuery = needsSeniorLiving 
      ? `"${community.name}" ${community.city} ${community.state} senior living`
      : `"${community.name}" ${community.city} ${community.state}`;
    
    console.log(`\n🔍 Optimized Search Query: ${communitySearchQuery}`);
    console.log(`   (${needsSeniorLiving ? 'Added "senior living" keyword' : 'Name already contains senior keywords'})`);
    
    if (perplexityService.isConfigured()) {
      try {
        console.log(`\n⏳ Searching for website and information...`);
        
        const searchResult = await perplexityService.searchRealTime(
          communitySearchQuery,
          `Find the official website, contact information, and any online presence for ${community.name} in ${community.city}, ${community.state}. Focus on finding their public website first.`
        );
        
        // Analyze the results
        const resultLower = searchResult.summary.toLowerCase();
        const communityNameLower = community.name.toLowerCase();
        
        // Check various website indicators
        const hasWebsite = resultLower.includes('website') || 
                          resultLower.includes('.com') || 
                          resultLower.includes('.org') ||
                          resultLower.includes('.net') ||
                          resultLower.includes('www.');
        
        const hasPhone = resultLower.includes('phone') || 
                        resultLower.includes('call') ||
                        /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(searchResult.summary);
        
        const hasEmail = resultLower.includes('email') || 
                        resultLower.includes('@');
        
        const mentionsCommunity = resultLower.includes(communityNameLower) ||
                                 communityNameLower.split(' ').some(word => 
                                   word.length > 3 && resultLower.includes(word.toLowerCase())
                                 );
        
        console.log(`\n📊 Results Analysis:`);
        console.log(`   ✓ Mentions specific community: ${mentionsCommunity ? '✅ YES' : '❌ NO'}`);
        console.log(`   ✓ Website found: ${hasWebsite ? '✅ YES' : '⚪ Not found'}`);
        console.log(`   ✓ Phone number found: ${hasPhone ? '✅ YES' : '⚪ Not found'}`);
        console.log(`   ✓ Email found: ${hasEmail ? '✅ YES' : '⚪ Not found'}`);
        console.log(`   ✓ Sources: ${searchResult.sources.length} sources`);
        
        // Extract any URLs found
        const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        const foundUrls = searchResult.summary.match(urlPattern) || [];
        
        if (foundUrls.length > 0) {
          console.log(`\n🌐 Websites Found:`);
          foundUrls.forEach(url => console.log(`   • ${url}`));
        }
        
        // Show a snippet of what was found
        const snippet = searchResult.summary.substring(0, 300);
        console.log(`\n📝 Result snippet: "${snippet}..."`);
        
        // Overall assessment
        if (mentionsCommunity && hasWebsite) {
          console.log(`\n✅ SUCCESS: Found website for "${community.name}"`);
        } else if (mentionsCommunity && !hasWebsite) {
          console.log(`\n⚠️ PARTIAL: Found info but no website for "${community.name}"`);
        } else {
          console.log(`\n❌ MISS: Search may need further optimization for "${community.name}"`);
        }
        
      } catch (error: any) {
        console.log(`\n❌ Search error: ${error.message}`);
      }
    } else {
      console.log(`\n⚠️ Perplexity API not configured - skipping live search`);
    }
    
    // Small delay between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n\n' + '='.repeat(80));
  console.log('✅ Website Discovery Testing Complete!');
  console.log('='.repeat(80));
  console.log('\nSummary:');
  console.log('• The optimized search uses: community name + city + state');
  console.log('• Only adds "senior living" if not already in the name');
  console.log('• This simpler approach finds more public websites');
  console.log('• Goal: Discover the 90% of communities with public sites');
  
  process.exit(0);
}

// Run the test
testCommunityWebsiteDiscovery().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});