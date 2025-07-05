#!/usr/bin/env node

/**
 * API COST ANALYSIS TOOL
 * Analyzes Google Places API usage and estimates costs
 */

const axios = require('axios');

async function analyzeAPICosts() {
  console.log('💰 API COST ANALYSIS REPORT');
  console.log('=' .repeat(50));

  try {
    // Get current database statistics
    const dbResponse = await axios.get('http://localhost:5000/api/communities/search');
    const communities = dbResponse.data || [];
    
    console.log(`\n📊 DATABASE STATISTICS:`);
    console.log(`Total Communities: ${communities.length}`);
    
    // Calculate photo enrichment costs
    let totalPhotos = 0;
    let communitiesWithPhotos = 0;
    
    communities.forEach(community => {
      if (community.photos && community.photos.length > 0) {
        totalPhotos += community.photos.length;
        communitiesWithPhotos++;
      }
    });
    
    console.log(`Communities with Photos: ${communitiesWithPhotos}`);
    console.log(`Total Photos: ${totalPhotos}`);
    
    // GOOGLE PLACES API COST BREAKDOWN
    console.log(`\n💸 GOOGLE PLACES API COSTS:`);
    console.log('-'.repeat(30));
    
    // Cost per API call (as of 2024)
    const COSTS = {
      textSearch: 0.032,    // $0.032 per Text Search request
      placeDetails: 0.017,  // $0.017 per Place Details request
      photo: 0.007         // $0.007 per Photo request
    };
    
    // Estimate discovery costs
    const estimatedSearchTerms = 6; // senior living, assisted living, etc.
    const estimatedCities = 50;     // cities we've searched
    const searchCalls = estimatedSearchTerms * estimatedCities;
    const discoveredCommunities = communities.length;
    
    // Details calls (one per community for enrichment)
    const detailsCalls = discoveredCommunities;
    
    // Photo calls (based on actual photos in database)
    const photoCalls = totalPhotos;
    
    const searchCost = searchCalls * COSTS.textSearch;
    const detailsCost = detailsCalls * COSTS.placeDetails;
    const photoCost = photoCalls * COSTS.photo;
    const totalGoogleCost = searchCost + detailsCost + photoCost;
    
    console.log(`Text Search Calls: ${searchCalls} × $${COSTS.textSearch} = $${searchCost.toFixed(2)}`);
    console.log(`Place Details Calls: ${detailsCalls} × $${COSTS.placeDetails} = $${detailsCost.toFixed(2)}`);
    console.log(`Photo Requests: ${photoCalls} × $${COSTS.photo} = $${photoCost.toFixed(2)}`);
    console.log(`\n🔥 TOTAL GOOGLE PLACES COST: $${totalGoogleCost.toFixed(2)}`);
    
    // OPENAI API COST ANALYSIS
    console.log(`\n🤖 OPENAI API COSTS:`);
    console.log('-'.repeat(30));
    
    // Count communities with AI-generated content
    let aiGeneratedContent = 0;
    communities.forEach(community => {
      if (community.description || community.amenities?.length > 0) {
        aiGeneratedContent++;
      }
    });
    
    // Estimate OpenAI usage (rough calculation)
    const avgTokensPerCommunity = 500; // Conservative estimate
    const totalTokens = aiGeneratedContent * avgTokensPerCommunity;
    const costPer1KTokens = 0.003; // GPT-4o cost
    const openaiCost = (totalTokens / 1000) * costPer1KTokens;
    
    console.log(`Communities with AI content: ${aiGeneratedContent}`);
    console.log(`Estimated total tokens: ${totalTokens.toLocaleString()}`);
    console.log(`OpenAI Cost: $${openaiCost.toFixed(2)}`);
    
    // UNSPLASH API (typically free for development)
    console.log(`\n📸 UNSPLASH API:`);
    console.log(`Status: FREE (development tier)`);
    
    // TOTAL COST ANALYSIS
    const totalCost = totalGoogleCost + openaiCost;
    console.log(`\n💰 TOTAL ESTIMATED API COSTS:`);
    console.log('='.repeat(40));
    console.log(`Google Places API: $${totalGoogleCost.toFixed(2)}`);
    console.log(`OpenAI API: $${openaiCost.toFixed(2)}`);
    console.log(`Unsplash API: $0.00 (free)`);
    console.log(`TOTAL: $${totalCost.toFixed(2)}`);
    
    // COST BREAKDOWN BY OPERATION
    console.log(`\n📋 COST BREAKDOWN BY OPERATION:`);
    console.log('-'.repeat(40));
    console.log(`Regional Discovery: $${searchCost.toFixed(2)} (${((searchCost/totalCost)*100).toFixed(1)}%)`);
    console.log(`Community Enrichment: $${detailsCost.toFixed(2)} (${((detailsCost/totalCost)*100).toFixed(1)}%)`);
    console.log(`Photo Collection: $${photoCost.toFixed(2)} (${((photoCost/totalCost)*100).toFixed(1)}%)`);
    console.log(`AI Content: $${openaiCost.toFixed(2)} (${((openaiCost/totalCost)*100).toFixed(1)}%)`);
    
    // RECOMMENDATIONS
    console.log(`\n💡 COST OPTIMIZATION RECOMMENDATIONS:`);
    console.log('-'.repeat(40));
    
    if (searchCost > detailsCost) {
      console.log(`⚠️  Text Search is the highest cost component ($${searchCost.toFixed(2)})`);
      console.log(`   - Consider caching search results`);
      console.log(`   - Reduce search radius for rural areas`);
      console.log(`   - Batch searches by region`);
    }
    
    if (photoCost > 10) {
      console.log(`⚠️  Photo collection is expensive ($${photoCost.toFixed(2)})`);
      console.log(`   - Limit photos per community (current avg: ${(totalPhotos/communitiesWithPhotos).toFixed(1)})`);
      console.log(`   - Consider alternative photo sources`);
    }
    
    if (totalCost > 50) {
      console.log(`🚨 HIGH COST ALERT: Total exceeds $50`);
      console.log(`   - Implement daily spending limits`);
      console.log(`   - Add more aggressive caching`);
      console.log(`   - Use batch operations where possible`);
    }
    
    console.log(`\n✅ ANALYSIS COMPLETE`);
    
  } catch (error) {
    console.error('Error analyzing API costs:', error.message);
  }
}

analyzeAPICosts().catch(console.error);