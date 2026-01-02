/**
 * Test script for Groq Compound Web Search
 * Run with: npx tsx scripts/test-groq-compound.ts
 */

import { groqLlamaService } from '../server/services/groq-llama-service';

async function testGroqCompoundSearch() {
  console.log('='.repeat(60));
  console.log('Testing Groq Compound Web Search');
  console.log('='.repeat(60));
  
  if (!groqLlamaService.isConfigured()) {
    console.error('ERROR: Groq API key not configured');
    process.exit(1);
  }
  
  console.log('\nGroq service is configured');
  console.log('Usage stats:', groqLlamaService.getUsageStats());
  
  const testCommunity = 'Brookdale Dallas';
  const testLocation = 'Dallas, TX';
  
  console.log(`\nSearching for: ${testCommunity}, ${testLocation}`);
  console.log('-'.repeat(60));
  
  try {
    const result = await groqLlamaService.webSearch(testCommunity, testLocation);
    
    console.log('\n✅ SUCCESS - Groq Compound Web Search returned results!\n');
    console.log('Summary:', result.summary.substring(0, 500) + '...');
    console.log('\nPricing:', result.pricing || 'Not found');
    console.log('Phone:', result.phone || 'Not found');
    console.log('Website:', result.website || 'Not found');
    console.log('Amenities:', result.amenities?.slice(0, 5) || 'None');
    console.log('Care Types:', result.careTypes || 'None');
    console.log('\nSources found:', result.sources.length);
    result.sources.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.title || 'Untitled'} - ${s.url}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('Test PASSED - Groq Compound web search is working!');
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ FAILED - Groq Compound Web Search error:');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testGroqCompoundSearch();
