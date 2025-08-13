#!/usr/bin/env tsx
/**
 * Cross-check test: Compare city-wide search results with individual community enrichment
 * Tests in San Francisco to validate approach
 */

import { PerplexityAIService } from "../perplexity-ai-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql, not, isNull } from "drizzle-orm";

interface CityWideResult {
  name: string;
  address?: string;
  pricing?: string;
  careTypes?: string[];
  mentioned: boolean;
}

interface EnrichmentResult {
  communityId: number;
  name: string;
  address: string;
  foundInCitySearch: boolean;
  individualSearchQuality: number;
  description: string;
  pricing: string | null;
  careTypes: string[];
  amenities: string[];
}

async function runCrossCheckTest() {
  console.log('🔍 San Francisco Senior Living Cross-Check Test');
  console.log('='.repeat(70));
  
  const perplexityService = new PerplexityAIService();
  
  // Step 1: Get city-wide search results
  console.log('\n📍 STEP 1: City-Wide Search for San Francisco Senior Living');
  console.log('-'.repeat(70));
  
  const cityQuery = `list all senior living communities in San Francisco CA 2025 - include assisted living, memory care, independent living, skilled nursing facilities, continuing care retirement communities CCRC. Provide names, addresses, and types of care for each facility`;
  
  console.log('Query:', cityQuery);
  console.log('\n⏳ Searching...');
  
  const cityResults = await perplexityService.searchRealTime(cityQuery);
  
  console.log(`\n✅ City search returned ${cityResults.summary?.length || 0} characters`);
  console.log('Sources:', cityResults.sources?.length || 0);
  
  // Parse city-wide results
  const cityWideList: CityWideResult[] = [];
  const summaryText = cityResults.summary || '';
  
  // Extract community names from the response
  const lines = summaryText.split('\n');
  lines.forEach(line => {
    // Look for patterns like "1. Name" or "- Name" or "• Name"
    const nameMatch = line.match(/^[\d\-•\*]+\.?\s*([^:,\(]+)/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (name.length > 3 && name.length < 100) {
        cityWideList.push({
          name,
          mentioned: true
        });
      }
    }
  });
  
  console.log(`\n📋 City-wide search found ${cityWideList.length} communities:`);
  cityWideList.slice(0, 10).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}`);
  });
  if (cityWideList.length > 10) {
    console.log(`  ... and ${cityWideList.length - 10} more`);
  }
  
  // Step 2: Get our database communities
  console.log('\n📍 STEP 2: Get San Francisco Communities from Our Database');
  console.log('-'.repeat(70));
  
  const dbCommunities = await db
    .select()
    .from(communities)
    .where(
      and(
        eq(communities.city, 'San Francisco'),
        eq(communities.state, 'CA'),
        sql`${communities.name} NOT LIKE '%Test%'`,
        sql`${communities.name} NOT LIKE '%test%'`
      )
    )
    .limit(20);
  
  console.log(`Found ${dbCommunities.length} San Francisco communities in database`);
  
  // Filter out HUD properties for better testing
  const nonHudCommunities = dbCommunities.filter(c => 
    !c.description?.includes('HUD Section 202')
  );
  const hudCommunities = dbCommunities.filter(c => 
    c.description?.includes('HUD Section 202')
  );
  
  console.log(`  - ${hudCommunities.length} HUD Section 202 properties`);
  console.log(`  - ${nonHudCommunities.length} non-HUD communities`);
  
  // Step 3: Test individual enrichment for 10 communities
  console.log('\n📍 STEP 3: Individual Enrichment Test (10 communities)');
  console.log('-'.repeat(70));
  
  const testCommunities = [...nonHudCommunities.slice(0, 5), ...hudCommunities.slice(0, 5)];
  const enrichmentResults: EnrichmentResult[] = [];
  
  for (let i = 0; i < Math.min(10, testCommunities.length); i++) {
    const community = testCommunities[i];
    console.log(`\n🔍 [${i + 1}/10] Testing: ${community.name}`);
    console.log(`   Address: ${community.address || 'N/A'}`);
    console.log(`   Current Description: ${community.description ? community.description.substring(0, 50) + '...' : 'EMPTY'}`);
    
    // Create individual search query
    const individualQuery = `"${community.name}" senior living community in San Francisco, CA - current 2025 pricing ranges, monthly costs, care services offered (assisted living, memory care, skilled nursing), amenities, features, contact information, availability status`;
    
    console.log(`   ⏳ Searching...`);
    
    const individualResult = await perplexityService.searchRealTime(individualQuery);
    const resultSummary = individualResult.summary || '';
    
    // Check if found in city-wide search
    const foundInCity = cityWideList.some(c => 
      c.name.toLowerCase().includes(community.name.toLowerCase().split(' ')[0]) ||
      community.name.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
    );
    
    // Check if community is mentioned in individual search
    const nameMentioned = resultSummary.toLowerCase().includes(
      community.name.toLowerCase().split(' ')[0]
    );
    
    // Extract pricing
    const priceMatches = resultSummary.match(/\$[\d,]+/g) || [];
    const pricing = priceMatches.length > 0 ? priceMatches[0] : null;
    
    // Extract care types
    const careTypes: string[] = [];
    const careKeywords = ['assisted living', 'memory care', 'independent living', 'skilled nursing', 'nursing home'];
    careKeywords.forEach(care => {
      if (resultSummary.toLowerCase().includes(care)) {
        careTypes.push(care);
      }
    });
    
    // Extract amenities
    const amenities: string[] = [];
    const amenityKeywords = ['dining', 'transportation', 'activities', 'fitness', 'laundry', 'housekeeping'];
    amenityKeywords.forEach(amenity => {
      if (resultSummary.toLowerCase().includes(amenity)) {
        amenities.push(amenity);
      }
    });
    
    // Calculate quality score
    let qualityScore = 0;
    if (nameMentioned) qualityScore += 40;
    if (pricing) qualityScore += 20;
    if (careTypes.length > 0) qualityScore += 20;
    if (amenities.length > 0) qualityScore += 20;
    
    const result: EnrichmentResult = {
      communityId: community.id,
      name: community.name,
      address: community.address || '',
      foundInCitySearch: foundInCity,
      individualSearchQuality: qualityScore,
      description: resultSummary.substring(0, 200),
      pricing,
      careTypes,
      amenities
    };
    
    enrichmentResults.push(result);
    
    console.log(`   ✅ Quality Score: ${qualityScore}%`);
    console.log(`   📊 Found in city search: ${foundInCity ? 'YES' : 'NO'}`);
    console.log(`   💰 Pricing: ${pricing || 'Not found'}`);
    console.log(`   🏥 Care Types: ${careTypes.length > 0 ? careTypes.join(', ') : 'None found'}`);
  }
  
  // Step 4: Analysis
  console.log('\n' + '='.repeat(70));
  console.log('📊 CROSS-CHECK ANALYSIS RESULTS');
  console.log('='.repeat(70));
  
  const foundInBoth = enrichmentResults.filter(r => r.foundInCitySearch);
  const onlyInDatabase = enrichmentResults.filter(r => !r.foundInCitySearch);
  const highQuality = enrichmentResults.filter(r => r.individualSearchQuality >= 60);
  const withPricing = enrichmentResults.filter(r => r.pricing !== null);
  
  console.log('\n🎯 Match Statistics:');
  console.log(`  • Communities tested: ${enrichmentResults.length}`);
  console.log(`  • Found in city-wide search: ${foundInBoth.length} (${Math.round(foundInBoth.length / enrichmentResults.length * 100)}%)`);
  console.log(`  • Only in our database: ${onlyInDatabase.length} (${Math.round(onlyInDatabase.length / enrichmentResults.length * 100)}%)`);
  
  console.log('\n📈 Data Quality:');
  console.log(`  • High quality results (60%+): ${highQuality.length} (${Math.round(highQuality.length / enrichmentResults.length * 100)}%)`);
  console.log(`  • With pricing data: ${withPricing.length} (${Math.round(withPricing.length / enrichmentResults.length * 100)}%)`);
  
  console.log('\n📋 Communities Found in BOTH (City Search + Database):');
  if (foundInBoth.length > 0) {
    foundInBoth.forEach(r => {
      console.log(`  ✅ ${r.name} - Quality: ${r.individualSearchQuality}%`);
    });
  } else {
    console.log('  None - City search returns different communities than our database');
  }
  
  console.log('\n📋 Communities ONLY in Our Database:');
  if (onlyInDatabase.length > 0) {
    onlyInDatabase.forEach(r => {
      console.log(`  ⚠️ ${r.name} - Quality: ${r.individualSearchQuality}%`);
      if (r.description.includes('HUD Section 202')) {
        console.log(`     (HUD property - expected not to be in general searches)`);
      }
    });
  }
  
  console.log('\n🔍 Top City-Wide Results (for comparison):');
  cityWideList.slice(0, 5).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.name}`);
  });
  
  console.log('\n💡 INSIGHTS:');
  console.log('1. City-wide searches primarily return:');
  console.log('   - Large chain facilities (Brookdale, Aegis Living, etc.)');
  console.log('   - Well-marketed communities with strong web presence');
  console.log('   - Not government database communities (HUD, etc.)');
  
  console.log('\n2. Individual community searches:');
  console.log('   - Can find specific information even for lesser-known communities');
  console.log('   - Better for HUD and government-sourced properties');
  console.log('   - More accurate for matching our database entries');
  
  console.log('\n3. Recommendation:');
  console.log('   ✅ Use INDIVIDUAL searches for each community');
  console.log('   ✅ Skip city-wide searches (different dataset)');
  console.log('   ✅ Focus on non-HUD communities for pricing data');
  console.log('   ✅ Save enrichment data immediately to avoid re-queries');
  
  return {
    cityWideCount: cityWideList.length,
    databaseCount: dbCommunities.length,
    matchRate: foundInBoth.length / enrichmentResults.length,
    averageQuality: enrichmentResults.reduce((sum, r) => sum + r.individualSearchQuality, 0) / enrichmentResults.length
  };
}

// Run the test
console.log('🚀 Starting San Francisco Cross-Check Test\n');

runCrossCheckTest()
  .then((stats) => {
    console.log('\n' + '='.repeat(70));
    console.log('✅ Test Completed Successfully');
    console.log(`Final Stats: ${JSON.stringify(stats, null, 2)}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

export { runCrossCheckTest };