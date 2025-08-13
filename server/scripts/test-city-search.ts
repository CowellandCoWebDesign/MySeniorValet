#!/usr/bin/env tsx
/**
 * Test City-Wide Search Script
 * Tests a single city-wide search to verify data quality and API response
 * Run with: npx tsx server/scripts/test-city-search.ts
 */

import { PerplexityAIService } from "../perplexity-ai-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";

async function testCityWideSearch() {
  console.log('🧪 Testing City-Wide Search for San Francisco, CA');
  console.log('='.repeat(60));
  
  try {
    // Initialize Perplexity service
    const perplexityService = new PerplexityAIService();
    
    // Test query for San Francisco
    const query = `Senior living communities in San Francisco, CA: comprehensive list with pricing ranges, care types, amenities, contact information, and descriptions. Include assisted living, independent living, memory care, nursing homes, HUD housing, and continuing care retirement communities. Provide specific details for each community including monthly costs, available services, and facility features.`;
    
    console.log('\n📝 Query:', query);
    console.log('\n⏳ Performing search (this may take 10-30 seconds)...\n');
    
    const response = await perplexityService.searchRealTime(query);
    
    // Display the raw response structure
    console.log('📦 Response Structure:');
    console.log('- Has summary:', !!response.summary);
    console.log('- Summary length:', response.summary?.length || 0, 'characters');
    console.log('- Number of sources:', response.sources?.length || 0);
    
    // Display the summary
    console.log('\n📋 AI Response (first 2000 chars):');
    console.log('-'.repeat(60));
    console.log(response.summary?.substring(0, 2000) || 'No answer received');
    
    // Display sources
    if (response.sources && response.sources.length > 0) {
      console.log('\n🔗 Sources:');
      response.sources.forEach((source: string, index: number) => {
        console.log(`  ${index + 1}. ${source}`);
      });
    }
    
    // Check what communities are mentioned in the response
    console.log('\n🔍 Analyzing mentioned communities...');
    
    // Get actual communities from database for San Francisco
    const sfCommunities = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        descriptionLength: sql<number>`LENGTH(COALESCE(${communities.description}, ''))`,
      })
      .from(communities)
      .where(
        and(
          eq(communities.city, 'San Francisco'),
          eq(communities.state, 'CA')
        )
      )
      .limit(10);
    
    console.log(`\n📊 Database has ${sfCommunities.length} SF communities (showing first 10)`);
    
    // Check which communities are mentioned in the AI response
    const answerLower = response.summary?.toLowerCase() || '';
    let mentionedCount = 0;
    
    sfCommunities.forEach((community) => {
      const nameLower = community.name.toLowerCase();
      const isMentioned = answerLower.includes(nameLower);
      
      if (isMentioned) {
        mentionedCount++;
        console.log(`  ✅ Found: ${community.name}`);
      } else {
        console.log(`  ❌ Not found: ${community.name} (desc: ${community.descriptionLength} chars)`);
      }
    });
    
    console.log(`\n📈 Coverage: ${mentionedCount}/${sfCommunities.length} communities mentioned`);
    
    // Extract pricing information if present
    console.log('\n💰 Searching for pricing information...');
    const priceMatches = response.summary?.match(/\$[\d,]+/g) || [];
    if (priceMatches.length > 0) {
      console.log(`Found ${priceMatches.length} price references:`);
      const uniquePrices = [...new Set(priceMatches)].slice(0, 10);
      uniquePrices.forEach(price => console.log(`  - ${price}`));
    } else {
      console.log('No specific pricing information found');
    }
    
    // Extract care types mentioned
    console.log('\n🏥 Care types mentioned:');
    const careTypes = [
      'Assisted Living',
      'Independent Living', 
      'Memory Care',
      'Nursing Home',
      'HUD Housing',
      'Continuing Care',
      'Skilled Nursing',
      'Alzheimer\'s Care',
      'Hospice',
      'Respite Care'
    ];
    
    careTypes.forEach(careType => {
      if (answerLower.includes(careType.toLowerCase())) {
        console.log(`  ✅ ${careType}`);
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`- Response quality: ${response.summary?.length > 1000 ? 'Good' : 'Limited'}`);
    console.log(`- Information depth: ${response.summary?.length > 2000 ? 'Comprehensive' : 'Basic'}`);
    console.log(`- Pricing data: ${priceMatches.length > 0 ? 'Available' : 'Not found'}`);
    console.log(`- Community coverage: ${mentionedCount > 0 ? `${mentionedCount} mentioned` : 'None mentioned'}`);
    console.log(`- Usable for enrichment: ${response.summary?.length > 1000 && mentionedCount > 0 ? 'YES ✅' : 'NEEDS IMPROVEMENT ⚠️'}`);
    
    return response;
    
  } catch (error) {
    console.error('\n❌ Error during city-wide search:', error);
    throw error;
  }
}

// Run the test
console.log('🚀 Starting City-Wide Search Test\n');

testCityWideSearch()
  .then((response) => {
    console.log('\n✅ Test completed successfully');
    
    // Save response to file for detailed analysis
    import('fs').then((fs) => {
      const outputPath = '/tmp/city-search-test-output.json';
      fs.writeFileSync(outputPath, JSON.stringify(response, null, 2));
      console.log(`\n💾 Full response saved to: ${outputPath}`);
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

export { testCityWideSearch };