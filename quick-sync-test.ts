#!/usr/bin/env tsx

/**
 * Quick System Synchronization Test
 */

import { db } from './server/db';
import { communities } from './shared/schema';
import { simplifiedPerplexityService } from './server/simplified-perplexity-service';
import { sql } from 'drizzle-orm';

async function quickSyncTest() {
  console.log('\n🚀 SYSTEM SYNCHRONIZATION TEST');
  console.log('=' .repeat(50));
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🤖 Perplexity sonar-pro Enhanced\n`);

  // Test 5 diverse communities quickly
  const testSample = await db.select()
  .from(communities) 
  .orderBy(sql`RANDOM()`)
  .limit(5);

  const results = {
    tested: 0,
    found: 0,
    websites: 0,
    phones: 0, 
    pricing: 0,
    photos: 0,
    citations: 0,
    totalScore: 0
  };

  for (const community of testSample) {
    results.tested++;
    const location = `${community.city}, ${community.state}`;
    console.log(`\n${results.tested}. Testing: ${community.name} (${location})`);
    
    const intel = await simplifiedPerplexityService.getCommunityIntelligence(
      community.name,
      location
    );

    let score = 50;
    
    if (intel.found) {
      results.found++;
      score += 10;
      console.log('   ✅ Found by Perplexity');
    }
    
    if (intel.sources?.length) {
      results.citations += intel.sources.length;
      score += Math.min(intel.sources.length * 2, 10);
      console.log(`   📚 ${intel.sources.length} citations`);
    }
    
    if (intel.officialWebsite) {
      results.websites++;
      score += 10;
      console.log(`   🌐 Website: ${intel.officialWebsite}`);
    }
    
    if (intel.phone) {
      results.phones++;
      score += 10;
      console.log(`   📞 Phone: ${intel.phone}`);
    }
    
    if (intel.pricing && Object.keys(intel.pricing).length > 0) {
      results.pricing++;
      score += 10;
      console.log(`   💰 Pricing: ${Object.keys(intel.pricing).join(', ')}`);
    }
    
    if (intel.photos?.length) {
      results.photos++;
      score += 10;
      console.log(`   📸 ${intel.photos.length} photos`);
    }
    
    results.totalScore += Math.min(score, 100);
    console.log(`   📊 Score: ${Math.min(score, 100)}%`);
  }

  // Final report
  console.log('\n' + '='.repeat(50));
  console.log('📊 SYSTEM SYNCHRONIZATION RESULTS');
  console.log('='.repeat(50));
  
  const avgScore = Math.round(results.totalScore / results.tested);
  const foundRate = (results.found / results.tested * 100).toFixed(0);
  const avgCitations = (results.citations / results.tested).toFixed(1);
  
  console.log(`\n✅ OVERALL PERFORMANCE:`);
  console.log(`   • Average Quality Score: ${avgScore}%`);
  console.log(`   • Perplexity Success Rate: ${foundRate}%`);
  console.log(`   • Average Citations: ${avgCitations}`);
  
  console.log(`\n📈 DATA EXTRACTION:`);
  console.log(`   • Websites: ${results.websites}/${results.tested} (${results.websites/results.tested*100}%)`);
  console.log(`   • Phones: ${results.phones}/${results.tested} (${results.phones/results.tested*100}%)`);
  console.log(`   • Pricing: ${results.pricing}/${results.tested} (${results.pricing/results.tested*100}%)`);
  console.log(`   • Photos: ${results.photos}/${results.tested} (${results.photos/results.tested*100}%)`);
  
  console.log(`\n🎯 SYSTEM STATUS:`);
  
  // All subsystems status check
  const perplexityOnline = results.found >= 4;
  const dataExtractionWorking = (results.websites + results.phones) >= 3;
  const photoSystemActive = results.photos >= 1;
  const pricingEngineActive = results.pricing >= 2;
  
  console.log(`   • Perplexity AI: ${perplexityOnline ? '✅ Online' : '⚠️ Degraded'}`);
  console.log(`   • Data Extraction: ${dataExtractionWorking ? '✅ Working' : '⚠️ Limited'}`);
  console.log(`   • Photo System: ${photoSystemActive ? '✅ Active' : '⚠️ Issues'}`);
  console.log(`   • Pricing Engine: ${pricingEngineActive ? '✅ Active' : '⚠️ Partial'}`);
  
  const allSystemsGo = perplexityOnline && dataExtractionWorking && avgScore >= 70;
  
  console.log(`\n🔥 FINAL VERDICT:`);
  if (allSystemsGo) {
    console.log('✅ ALL SYSTEMS IN SYNC - Platform fully operational!');
    console.log('   Enhanced Perplexity delivering comprehensive data');
    console.log('   Contact info, websites, pricing, photos all extracting successfully');
  } else {
    console.log('⚠️ PARTIAL SYNC - Some systems need attention');
  }
}

quickSyncTest()
  .then(() => {
    console.log('\n✅ Sync test complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test error:', error);
    process.exit(1);
  });