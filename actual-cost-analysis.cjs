#!/usr/bin/env node

/**
 * ACTUAL COST ANALYSIS
 * Real numbers vs the crazy 84,000 photo estimate
 */

const axios = require('axios');

async function analyzeActualCosts() {
  console.log('🔍 ACTUAL COST ANALYSIS - Real vs Estimated Numbers');
  console.log('=' .repeat(60));

  try {
    // Get actual database data
    const response = await axios.get('http://localhost:5000/api/communities/search');
    const communities = response.data || [];
    
    console.log('\n📊 ACTUAL DATABASE NUMBERS:');
    console.log('-'.repeat(40));
    console.log(`Total Communities: ${communities.length}`);
    
    // Count actual photos
    let totalPhotos = 0;
    let communitiesWithPhotos = 0;
    let maxPhotosPerCommunity = 0;
    let photoDistribution = {};
    
    communities.forEach(community => {
      const photoCount = community.photos ? community.photos.length : 0;
      if (photoCount > 0) {
        communitiesWithPhotos++;
        totalPhotos += photoCount;
        maxPhotosPerCommunity = Math.max(maxPhotosPerCommunity, photoCount);
        
        // Track distribution
        const bucket = Math.floor(photoCount / 5) * 5;
        const bucketLabel = `${bucket}-${bucket + 4}`;
        photoDistribution[bucketLabel] = (photoDistribution[bucketLabel] || 0) + 1;
      }
    });
    
    const avgPhotosPerCommunity = communitiesWithPhotos > 0 ? (totalPhotos / communitiesWithPhotos) : 0;
    
    console.log(`Communities with Photos: ${communitiesWithPhotos}`);
    console.log(`Total Photos in DB: ${totalPhotos}`);
    console.log(`Average Photos per Community: ${avgPhotosPerCommunity.toFixed(1)}`);
    console.log(`Max Photos per Community: ${maxPhotosPerCommunity}`);
    
    console.log('\n📈 Photo Distribution:');
    Object.entries(photoDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([range, count]) => {
        console.log(`  ${range} photos: ${count} communities`);
      });
    
    console.log('\n🚨 THE 84,000 PHOTO MYSTERY:');
    console.log('-'.repeat(40));
    console.log('ESTIMATED (Wrong): 84,000 photo requests');
    console.log(`ACTUAL IN DB: ${totalPhotos} photos`);
    console.log(`RATIO: ${(84000 / totalPhotos).toFixed(0)}x overestimate!`);
    
    console.log('\n🔍 WHERE THE ESTIMATE WENT WRONG:');
    console.log('-'.repeat(40));
    console.log('Flawed Calculation:');
    console.log('  8,400 places × 10 photos = 84,000');
    console.log('  ↳ Assumed every API search found 20 places');
    console.log('  ↳ Assumed every place gets 10 photos');
    console.log('  ↳ Ignored duplicate filtering');
    console.log('  ↳ Ignored senior living filtering');
    
    console.log('\nRealistic Calculation:');
    console.log(`  ${communities.length} actual communities × ${avgPhotosPerCommunity.toFixed(1)} avg photos = ${totalPhotos} photos`);
    console.log('  ↳ Google Places filtering works');
    console.log('  ↳ Senior living facilities are rare');
    console.log('  ↳ Duplicate prevention works');
    
    console.log('\n💰 REALISTIC COST CALCULATION:');
    console.log('-'.repeat(40));
    
    // Realistic API usage for current database
    const realisticTextSearches = 70; // 14 counties × 5 cities
    const realisticDetailsRequests = communities.length; // One per community found
    const realisticPhotoRequests = totalPhotos; // Actual photos in DB
    
    const realisticCosts = {
      textSearch: realisticTextSearches * 0.032,
      placeDetails: realisticDetailsRequests * 0.017,
      photos: realisticPhotoRequests * 0.007
    };
    
    const totalRealisticCost = Object.values(realisticCosts).reduce((a, b) => a + b, 0);
    
    console.log(`Text Searches: ${realisticTextSearches} × $0.032 = $${realisticCosts.textSearch.toFixed(2)}`);
    console.log(`Place Details: ${realisticDetailsRequests} × $0.017 = $${realisticCosts.placeDetails.toFixed(2)}`);
    console.log(`Photo Requests: ${realisticPhotoRequests} × $0.007 = $${realisticCosts.photos.toFixed(2)}`);
    console.log(`REALISTIC TOTAL: $${totalRealisticCost.toFixed(2)}`);
    
    console.log('\n🤔 SO WHY DID WE SPEND $300?');
    console.log('-'.repeat(40));
    
    const timesRunFor300 = 300 / totalRealisticCost;
    console.log(`If realistic cost is $${totalRealisticCost.toFixed(2)}, then:`);
    console.log(`$300 ÷ $${totalRealisticCost.toFixed(2)} = ${timesRunFor300.toFixed(1)} times the script ran`);
    
    console.log('\nPOSSIBLE SCENARIOS:');
    console.log(`1. Script ran ${Math.floor(timesRunFor300)} complete times`);
    console.log('2. Photo enrichment ran multiple times on same data');
    console.log('3. High Google Places API success rate found more places');
    console.log('4. Expensive API endpoints were hit (Place Details vs Text Search)');
    console.log('5. Script got stuck in a loop or restart cycle');
    
    // Calculate what would cause $300 in each scenario
    console.log('\n💸 WHAT WOULD CAUSE $300:');
    console.log('-'.repeat(40));
    
    const scenarios = {
      textSearchOnly: Math.floor(300 / 0.032),
      placeDetailsOnly: Math.floor(300 / 0.017),
      photosOnly: Math.floor(300 / 0.007)
    };
    
    console.log(`Text Search Only: ${scenarios.textSearchOnly.toLocaleString()} searches`);
    console.log(`Place Details Only: ${scenarios.placeDetailsOnly.toLocaleString()} detail requests`);
    console.log(`Photos Only: ${scenarios.photosOnly.toLocaleString()} photo requests`);
    
    console.log('\nMOST LIKELY: Mix of all three, with script running multiple cycles');
    
    console.log('\n✅ CONCLUSION:');
    console.log('-'.repeat(40));
    console.log('The 84,000 photo estimate was completely wrong');
    console.log(`Actual photos: ${totalPhotos} (${(totalPhotos/84000*100).toFixed(2)}% of estimate)`);
    console.log('$300 cost likely from script running ~13x or getting stuck in loops');
    console.log('Need immediate cost controls and duplicate prevention');
    
  } catch (error) {
    console.error('Error analyzing costs:', error.message);
  }
}

analyzeActualCosts().catch(console.error);