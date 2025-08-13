#!/usr/bin/env tsx
/**
 * Test enrichment for a specific known community
 */

import { PerplexityAIService } from "../perplexity-ai-service";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testSpecificCommunity() {
  console.log('🧪 Testing Enrichment for Shoreview Apartments');
  console.log('='.repeat(60));
  
  try {
    // Get Shoreview Apartments specifically
    const [targetCommunity] = await db
      .select()
      .from(communities)
      .where(eq(communities.name, 'Shoreview Apartments'))
      .limit(1);
    
    if (!targetCommunity) {
      console.log('❌ Shoreview Apartments not found in database');
      return;
    }
    
    console.log('\n📍 Target Community:');
    console.log(`Name: ${targetCommunity.name}`);
    console.log(`Address: ${targetCommunity.address || 'Not available'}`);
    console.log(`City: ${targetCommunity.city}, ${targetCommunity.state}`);
    console.log(`Phone: ${targetCommunity.phone || 'Not available'}`);
    console.log(`Current Description: ${targetCommunity.description ? `${targetCommunity.description.substring(0, 80)}...` : 'EMPTY'}`);
    console.log(`Current Pricing: ${targetCommunity.price_range_min ? `$${targetCommunity.price_range_min}-$${targetCommunity.price_range_max}` : 'Not available'}`);
    
    // Initialize Perplexity service
    const perplexityService = new PerplexityAIService();
    
    // Create targeted searches for this specific community
    const queries = [
      // Query 1: General information
      `"Shoreview Apartments" San Francisco CA HUD Section 202 elderly housing - current 2025 pricing, monthly rent, income limits, application process, amenities, contact information`,
      
      // Query 2: Specific details  
      `35 Lillian Court San Francisco senior housing - Shoreview Apartments 156 units elderly community features, services, waitlist status, availability 2025`
    ];
    
    console.log('\n🔍 Running multiple targeted searches...\n');
    
    const results = [];
    for (let i = 0; i < queries.length; i++) {
      console.log(`📝 Query ${i+1}: ${queries[i].substring(0, 100)}...`);
      const response = await perplexityService.searchRealTime(queries[i]);
      results.push(response);
      console.log(`✅ Response ${i+1}: ${response.summary?.length || 0} characters\n`);
    }
    
    // Combine results
    const combinedSummary = results.map(r => r.summary || '').join('\n\n');
    
    // Check if the community name is mentioned
    const nameMentioned = combinedSummary.toLowerCase().includes('shoreview');
    console.log(`Community mentioned: ${nameMentioned ? '✅ YES' : '❌ NO'}`);
    
    // Display combined response
    console.log('\n📋 Combined AI Response:');
    console.log('-'.repeat(60));
    console.log(combinedSummary.substring(0, 2000) + '...');
    console.log('-'.repeat(60));
    
    // Extract enrichment data
    console.log('\n🔍 Extracting Enrichment Data:');
    
    // Extract pricing
    const priceMatches = combinedSummary.match(/\$[\d,]+/g) || [];
    const monthlyRentMatches = combinedSummary.match(/rent[:\s]+\$?([\d,]+)/gi) || [];
    const incomeMatches = combinedSummary.match(/income[:\s]+\$?([\d,]+)/gi) || [];
    
    console.log(`\n💰 Pricing Information:`);
    if (priceMatches.length > 0) {
      console.log(`  Price mentions: ${priceMatches.slice(0, 5).join(', ')}`);
    }
    if (monthlyRentMatches.length > 0) {
      console.log(`  Rent mentions: ${monthlyRentMatches.slice(0, 3).join(', ')}`);
    }
    if (incomeMatches.length > 0) {
      console.log(`  Income limits: ${incomeMatches.slice(0, 3).join(', ')}`);
    }
    
    // Extract amenities and features
    const amenityKeywords = [
      'laundry', 'parking', 'elevator', 'community room', 'garden',
      'security', 'accessibility', 'wheelchair', 'emergency call',
      'social activities', 'transportation', 'meal', 'housekeeping'
    ];
    
    const foundAmenities = [];
    const summaryLower = combinedSummary.toLowerCase();
    amenityKeywords.forEach(amenity => {
      if (summaryLower.includes(amenity)) {
        foundAmenities.push(amenity);
      }
    });
    
    console.log(`\n🎯 Amenities Found: ${foundAmenities.length}`);
    if (foundAmenities.length > 0) {
      foundAmenities.forEach(amenity => console.log(`  - ${amenity}`));
    }
    
    // Extract contact information
    const phoneMatches = combinedSummary.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    console.log(`\n📞 Phone Numbers Found: ${phoneMatches.length}`);
    if (phoneMatches.length > 0) {
      phoneMatches.slice(0, 3).forEach(phone => console.log(`  - ${phone}`));
    }
    
    // Generate enhanced description
    let enhancedDescription = targetCommunity.description || '';
    if (nameMentioned && combinedSummary.length > 200) {
      // Extract the most relevant sentences
      const sentences = combinedSummary.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const relevantSentences = sentences.filter(s => 
        s.toLowerCase().includes('shoreview') ||
        s.toLowerCase().includes('156 unit') ||
        s.toLowerCase().includes('elderly') ||
        s.toLowerCase().includes('senior') ||
        s.toLowerCase().includes('hud')
      );
      
      if (relevantSentences.length > 0) {
        const additionalInfo = relevantSentences.slice(0, 2).join('. ').trim();
        if (additionalInfo && !enhancedDescription.includes(additionalInfo)) {
          enhancedDescription = enhancedDescription + ' ' + additionalInfo;
        }
      }
    }
    
    console.log(`\n📝 Enhanced Description: ${enhancedDescription.length} chars`);
    console.log(`  "${enhancedDescription.substring(0, 200)}..."`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('💾 ENRICHMENT SUMMARY:');
    console.log('='.repeat(60));
    
    const enrichmentData = {
      hasDescription: enhancedDescription.length > 100,
      hasPricing: priceMatches.length > 0 || monthlyRentMatches.length > 0,
      hasAmenities: foundAmenities.length > 0,
      hasContact: phoneMatches.length > 0,
      dataQuality: nameMentioned ? 'HIGH' : 'LOW'
    };
    
    console.log(`✅ Description: ${enrichmentData.hasDescription ? 'Enhanced' : 'Needs improvement'}`);
    console.log(`✅ Pricing: ${enrichmentData.hasPricing ? 'Found' : 'Not found'}`);
    console.log(`✅ Amenities: ${enrichmentData.hasAmenities ? `${foundAmenities.length} found` : 'Not found'}`);
    console.log(`✅ Contact: ${enrichmentData.hasContact ? 'Found' : 'Not found'}`);
    console.log(`✅ Data Quality: ${enrichmentData.dataQuality}`);
    
    return enrichmentData;
    
  } catch (error) {
    console.error('\n❌ Error during community enrichment:', error);
    throw error;
  }
}

// Run the test
console.log('🚀 Starting Specific Community Enrichment Test\n');

testSpecificCommunity()
  .then((data) => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

export { testSpecificCommunity };