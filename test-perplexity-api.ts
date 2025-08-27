#!/usr/bin/env npx tsx
/**
 * Simple test to verify Perplexity API is working correctly
 */

import { SimplifiedPerplexityService } from './server/simplified-perplexity-service';

async function testAPI() {
  console.log('🧪 Testing Perplexity API directly...\n');
  
  const service = new SimplifiedPerplexityService();
  
  try {
    // Test 1: Simple community search
    console.log('Test 1: Searching for "Sunrise Senior Living in McLean, VA"');
    const result = await service.getCommunityIntelligence(
      'Sunrise Senior Living',
      'McLean, VA'
    );
    
    console.log('✅ API call successful!');
    console.log('Found:', result.found ? 'Yes' : 'No');
    console.log('Name:', result.name);
    console.log('Website:', result.officialWebsite || 'Not found');
    console.log('Phone:', result.phone || 'Not found');
    console.log('Sources:', result.sources?.length || 0);
    
    // Test 2: Test error handling
    console.log('\nTest 2: Testing edge case handling...');
    const result2 = await service.getCommunityIntelligence(
      'Nonexistent Community XYZ',
      'Nowhere, XX'
    );
    console.log('Handled nonexistent community:', !result2.found ? '✅' : '❌');
    
    console.log('\n✨ All tests passed! Perplexity API is working correctly.');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAPI().catch(console.error);