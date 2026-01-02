/**
 * Test script for Groq Discovery Pipeline
 * Run with: npx tsx scripts/test-groq-discovery-pipeline.ts
 */

import { groqDiscoveryOrchestrator } from '../server/services/groq-discovery-orchestrator';

async function testGroqDiscoveryPipeline() {
  console.log('='.repeat(60));
  console.log('Testing Groq Discovery Pipeline');
  console.log('Pipeline: Groq Compound → Crawlee Scraper → Validated Data');
  console.log('='.repeat(60));
  
  const testQuery = 'Atlanta Georgia';
  
  console.log(`\nSearching for communities in: ${testQuery}`);
  console.log('-'.repeat(60));
  
  try {
    const startTime = Date.now();
    const facilities = await groqDiscoveryOrchestrator.discoverCommunities(testQuery, {
      maxResults: 5,
      scrapeTimeout: 20000
    });
    const elapsed = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${facilities.length} facilities discovered in ${(elapsed/1000).toFixed(1)}s`);
    console.log('='.repeat(60));
    
    if (facilities.length === 0) {
      console.log('\n⚠️ No facilities found. This could mean:');
      console.log('   - Groq Compound returned no trusted directory sources');
      console.log('   - Crawlee couldn\'t extract structured data from sources');
      console.log('   - Check the logs above for details');
    } else {
      console.log('\n✅ Discovered Facilities:');
      for (const facility of facilities) {
        console.log(`\n📍 ${facility.name}`);
        console.log(`   Address: ${facility.address || '(not found)'}`);
        console.log(`   City: ${facility.city || '(not found)'}, State: ${facility.state || '(not found)'}`);
        console.log(`   Phone: ${facility.phone || '(not found)'}`);
        console.log(`   Website: ${facility.website.substring(0, 60)}...`);
        console.log(`   Photos: ${facility.photos.length}`);
        console.log(`   Care Types: ${facility.careTypes.join(', ') || '(none)'}`);
        console.log(`   Source: ${facility.sourceDomain}`);
        console.log(`   Confidence: ${facility.confidence}%`);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ Groq Discovery Pipeline is WORKING!');
      console.log('='.repeat(60));
    }
    
  } catch (error: any) {
    console.error('\n❌ Pipeline test failed:');
    console.error('Message:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testGroqDiscoveryPipeline();
