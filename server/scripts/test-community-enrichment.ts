#!/usr/bin/env tsx
/**
 * Test Individual Community Enrichment
 * Tests enriching a specific community to see data quality
 * Run with: npx tsx server/scripts/test-community-enrichment.ts
 */

import { PerplexityAIService } from "../perplexity-ai-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

async function testCommunityEnrichment() {
  console.log('🧪 Testing Individual Community Enrichment for San Francisco');
  console.log('='.repeat(60));
  
  try {
    // Get a specific San Francisco community that needs enrichment
    // Specifically looking for real communities, not test entries
    const [targetCommunity] = await db
      .select()
      .from(communities)
      .where(
        and(
          eq(communities.city, 'San Francisco'),
          eq(communities.state, 'CA'),
          sql`${communities.description} IS NULL OR ${communities.description} = '' OR LENGTH(${communities.description}) < 100`,
          sql`${communities.name} NOT LIKE '%Test%'`,
          sql`${communities.name} NOT LIKE '%test%'`
        )
      )
      .limit(1);
    
    if (!targetCommunity) {
      console.log('❌ No San Francisco communities found that need enrichment');
      return;
    }
    
    console.log('\n📍 Target Community:');
    console.log(`Name: ${targetCommunity.name}`);
    console.log(`Address: ${targetCommunity.address || 'Not available'}`);
    console.log(`Phone: ${targetCommunity.phone || 'Not available'}`);
    console.log(`Current Description: ${targetCommunity.description ? `${targetCommunity.description.length} chars` : 'EMPTY'}`);
    console.log(`Current Pricing: ${targetCommunity.price_range_min ? `$${targetCommunity.price_range_min}-$${targetCommunity.price_range_max}` : 'Not available'}`);
    console.log(`Current Care Types: ${targetCommunity.careTypes?.length || 0} types`);
    console.log(`Current Amenities: ${targetCommunity.amenities?.length || 0} amenities`);
    
    // Initialize Perplexity service
    const perplexityService = new PerplexityAIService();
    
    // Create a targeted search query for this specific community
    const query = `"${targetCommunity.name}" senior living community in San Francisco, CA - current 2024-2025 pricing ranges, monthly costs, care services offered (assisted living, memory care, skilled nursing), amenities, features, contact information, availability status, and detailed description of the facility`;
    
    console.log('\n📝 Search Query:', query);
    console.log('\n⏳ Searching for community-specific information...\n');
    
    const response = await perplexityService.searchRealTime(query);
    
    // Display response quality
    console.log('📦 Response Quality:');
    console.log(`- Summary length: ${response.summary?.length || 0} characters`);
    console.log(`- Sources: ${response.sources?.length || 0}`);
    
    // Check if the community name is mentioned
    const nameMentioned = response.summary?.toLowerCase().includes(targetCommunity.name.toLowerCase());
    console.log(`- Community mentioned: ${nameMentioned ? '✅ YES' : '❌ NO'}`);
    
    // Display the response
    console.log('\n📋 AI Response:');
    console.log('-'.repeat(60));
    console.log(response.summary || 'No response received');
    console.log('-'.repeat(60));
    
    // Extract enrichment data
    console.log('\n🔍 Extracting Enrichment Data:');
    
    // 1. Extract pricing
    const priceMatches = response.summary?.match(/\$[\d,]+/g) || [];
    const prices = priceMatches.map(p => parseInt(p.replace(/[$,]/g, '')));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    
    console.log(`\n💰 Pricing:`);
    if (minPrice && maxPrice) {
      console.log(`  Range: $${minPrice} - $${maxPrice}/month`);
    } else if (priceMatches.length > 0) {
      console.log(`  Found prices: ${priceMatches.join(', ')}`);
    } else {
      console.log(`  No pricing information found`);
    }
    
    // 2. Extract care types
    const careTypeKeywords = [
      'assisted living',
      'independent living',
      'memory care',
      'alzheimer',
      'dementia',
      'skilled nursing',
      'nursing home',
      'continuing care',
      'respite care',
      'hospice'
    ];
    
    const foundCareTypes = [];
    const summaryLower = response.summary?.toLowerCase() || '';
    
    careTypeKeywords.forEach(careType => {
      if (summaryLower.includes(careType)) {
        foundCareTypes.push(careType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    });
    
    console.log(`\n🏥 Care Types Found: ${foundCareTypes.length}`);
    if (foundCareTypes.length > 0) {
      foundCareTypes.forEach(type => console.log(`  - ${type}`));
    }
    
    // 3. Extract amenities
    const amenityKeywords = [
      'dining',
      'transportation',
      'activities',
      'fitness',
      'therapy',
      'salon',
      'barber',
      'pet',
      'garden',
      'library',
      'chapel',
      'wifi',
      'laundry',
      'housekeeping'
    ];
    
    const foundAmenities = [];
    amenityKeywords.forEach(amenity => {
      if (summaryLower.includes(amenity)) {
        foundAmenities.push(amenity.charAt(0).toUpperCase() + amenity.slice(1));
      }
    });
    
    console.log(`\n🎯 Amenities Found: ${foundAmenities.length}`);
    if (foundAmenities.length > 0) {
      foundAmenities.forEach(amenity => console.log(`  - ${amenity}`));
    }
    
    // 4. Generate description
    let enrichedDescription = '';
    if (nameMentioned && response.summary?.length > 100) {
      // Extract relevant sentences about the community
      const sentences = response.summary.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const relevantSentences = sentences.filter(s => 
        s.toLowerCase().includes('facility') ||
        s.toLowerCase().includes('community') ||
        s.toLowerCase().includes('offer') ||
        s.toLowerCase().includes('provide') ||
        s.toLowerCase().includes('feature') ||
        s.toLowerCase().includes('located')
      );
      
      enrichedDescription = relevantSentences.slice(0, 3).join('. ').trim();
      if (enrichedDescription) enrichedDescription += '.';
    }
    
    console.log(`\n📝 Generated Description: ${enrichedDescription ? `${enrichedDescription.length} chars` : 'Could not generate'}`);
    if (enrichedDescription) {
      console.log(`  "${enrichedDescription.substring(0, 200)}..."`);
    }
    
    // Summary of what would be saved
    console.log('\n' + '='.repeat(60));
    console.log('💾 DATA TO BE SAVED:');
    console.log('='.repeat(60));
    
    const hasNewData = enrichedDescription || minPrice || foundCareTypes.length > 0 || foundAmenities.length > 0;
    
    if (hasNewData) {
      console.log('✅ Enrichment successful! Would save:');
      if (enrichedDescription) console.log(`  - Description: ${enrichedDescription.length} characters`);
      if (minPrice) console.log(`  - Price range: $${minPrice} - $${maxPrice}`);
      if (foundCareTypes.length > 0) console.log(`  - Care types: ${foundCareTypes.length} types`);
      if (foundAmenities.length > 0) console.log(`  - Amenities: ${foundAmenities.length} amenities`);
      console.log(`  - AI enrichment date: ${new Date().toISOString()}`);
      console.log(`  - AI enrichment version: individual-v1.0`);
    } else {
      console.log('⚠️ No enrichment data found for this community');
    }
    
    console.log('\n📊 ENRICHMENT QUALITY ASSESSMENT:');
    const qualityScore = 
      (nameMentioned ? 25 : 0) +
      (enrichedDescription ? 25 : 0) +
      (minPrice ? 25 : 0) +
      (foundCareTypes.length > 0 ? 12.5 : 0) +
      (foundAmenities.length > 0 ? 12.5 : 0);
    
    console.log(`Quality Score: ${qualityScore}%`);
    console.log(`- Name mentioned: ${nameMentioned ? '✅' : '❌'} (25%)`);
    console.log(`- Description generated: ${enrichedDescription ? '✅' : '❌'} (25%)`);
    console.log(`- Pricing found: ${minPrice ? '✅' : '❌'} (25%)`);
    console.log(`- Care types found: ${foundCareTypes.length > 0 ? '✅' : '❌'} (12.5%)`);
    console.log(`- Amenities found: ${foundAmenities.length > 0 ? '✅' : '❌'} (12.5%)`);
    
    return response;
    
  } catch (error) {
    console.error('\n❌ Error during community enrichment:', error);
    throw error;
  }
}

// Run the test
console.log('🚀 Starting Individual Community Enrichment Test\n');

testCommunityEnrichment()
  .then((response) => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

export { testCommunityEnrichment };