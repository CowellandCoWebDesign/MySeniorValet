import { db } from './db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Test script to verify competitive analysis with website scraping
async function testCompetitiveAnalysis() {
  console.log('\n🧪 TESTING COMPETITIVE ANALYSIS WITH WEBSITE SCRAPING\n');
  console.log('=' . repeat(60));
  
  try {
    // Test 1: Find a real community to test with
    console.log('\n📍 Test 1: Finding a test community...');
    const testCommunity = await db.select()
      .from(communities)
      .where(eq(communities.state, 'TX'))
      .limit(1);
    
    if (!testCommunity || testCommunity.length === 0) {
      console.log('❌ No communities found in Texas. Add communities first.');
      return;
    }
    
    const community = testCommunity[0];
    console.log(`✅ Found community: ${community.name} in ${community.city}, ${community.state}`);
    
    // Test 2: Call competitive analysis endpoint
    console.log('\n🔍 Test 2: Calling competitive analysis API...');
    const apiUrl = `http://localhost:5000/api/competitive-analysis/${community.id}`;
    console.log(`   API URL: ${apiUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(apiUrl);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      console.log(`❌ API returned error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Error details: ${errorText}`);
      return;
    }
    
    const analysis = await response.json();
    console.log(`✅ API response received in ${responseTime}ms`);
    
    // Test 3: Verify analysis structure
    console.log('\n📊 Test 3: Verifying analysis structure...');
    const checks = {
      'Has location': !!analysis.location,
      'Has average rent': !!analysis.averageMonthlyRent,
      'Has price range': !!analysis.priceRange,
      'Has insights': Array.isArray(analysis.insights) && analysis.insights.length > 0,
      'Has detailed summary': !!analysis.detailedSummary,
      'Has community mentions': Array.isArray(analysis.communityMentions),
      'Has matched communities': Array.isArray(analysis.matchedCommunities),
      'Has extracted communities': Array.isArray(analysis.extractedCommunities),
      'Has sources': Array.isArray(analysis.sources)
    };
    
    for (const [check, passed] of Object.entries(checks)) {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    }
    
    // Test 4: Check for scraped website data
    console.log('\n🌐 Test 4: Checking for scraped website data...');
    if (analysis.extractedCommunities && analysis.extractedCommunities.length > 0) {
      console.log(`   Found ${analysis.extractedCommunities.length} extracted communities`);
      
      let photosFound = 0;
      let websitesFound = 0;
      let enrichedCount = 0;
      
      for (const comm of analysis.extractedCommunities) {
        if (comm.website) websitesFound++;
        if (comm.photos && comm.photos.length > 0) {
          photosFound++;
          enrichedCount++;
          console.log(`   ✅ ${comm.name}: ${comm.photos.length} photos found`);
        }
        if (comm.floorPlans && comm.floorPlans.length > 0) {
          console.log(`   ✅ ${comm.name}: ${comm.floorPlans.length} floor plans found`);
        }
        if (comm.virtualTours && comm.virtualTours.length > 0) {
          console.log(`   ✅ ${comm.name}: ${comm.virtualTours.length} virtual tours found`);
        }
      }
      
      console.log(`\n   📊 Summary:`);
      console.log(`      Communities with websites: ${websitesFound}/${analysis.extractedCommunities.length}`);
      console.log(`      Communities with photos: ${photosFound}/${analysis.extractedCommunities.length}`);
      console.log(`      Enriched communities: ${enrichedCount}/${analysis.extractedCommunities.length}`);
    } else {
      console.log('   ⚠️ No extracted communities found');
    }
    
    // Test 5: Verify clickable links structure
    console.log('\n🔗 Test 5: Verifying clickable links...');
    if (analysis.sources && analysis.sources.length > 0) {
      console.log(`   ✅ ${analysis.sources.length} data sources available for clicking`);
      for (const source of analysis.sources.slice(0, 3)) {
        console.log(`      • ${source}`);
      }
    }
    
    if (analysis.matchedCommunities && analysis.matchedCommunities.length > 0) {
      console.log(`   ✅ ${analysis.matchedCommunities.length} communities linked to database`);
      for (const comm of analysis.matchedCommunities.slice(0, 3)) {
        console.log(`      • ${comm.name} → /community/${comm.id}`);
      }
    }
    
    // Test 6: Sample detailed summary content
    console.log('\n📝 Test 6: Sample of detailed summary...');
    if (analysis.detailedSummary) {
      const preview = analysis.detailedSummary.substring(0, 300);
      console.log(`   "${preview}..."`);
      console.log(`   Total length: ${analysis.detailedSummary.length} characters`);
    }
    
    console.log('\n' + '=' . repeat(60));
    console.log('✅ COMPETITIVE ANALYSIS TEST COMPLETE');
    console.log('=' . repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('Stack trace:', (error as Error).stack);
  }
  
  process.exit(0);
}

// Run the test
testCompetitiveAnalysis();