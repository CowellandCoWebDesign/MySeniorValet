/**
 * Test script to verify Multi-AI Orchestrator pricing deduplication fix
 */

import { MultiAIOrchestrator } from './multi-ai-orchestrator';

async function testPricingDeduplication() {
  console.log('🧪 Testing Multi-AI Pricing Deduplication Fix');
  console.log('============================================');
  
  // Test community info
  const testCommunity = {
    id: 1,
    name: 'Sunrise Senior Living',
    city: 'Phoenix',
    state: 'AZ',
    address: '1234 Test Street',
    careTypes: ['Assisted Living', 'Memory Care'],
    communitySubtype: 'Assisted Living'
  };
  
  try {
    console.log(`\n📍 Testing pricing analysis for: ${testCommunity.name}`);
    console.log(`   Location: ${testCommunity.city}, ${testCommunity.state}`);
    
    // Run the pricing analysis
    const result = await MultiAIOrchestrator.analyzePricing(testCommunity);
    
    if (result.success && result.pricing?.sources) {
      console.log(`\n✅ Pricing Analysis Results:`);
      console.log(`   Total AI Services Responded: ${result.aiServices || 0}/${result.totalServices || 5}`);
      console.log(`   Pricing Sources Count: ${result.pricing.sources.length}`);
      console.log(`   Average Price: $${result.pricing.average}`);
      console.log(`   Price Range: $${result.pricing.min} - $${result.pricing.max}`);
      console.log(`   Confidence: ${result.pricing.confidence}%`);
      
      // Check for duplicates
      const sourceNames = result.pricing.sources.map((s: any) => s.source);
      const uniqueSourceNames = [...new Set(sourceNames)];
      
      console.log(`\n📊 Source Analysis:`);
      console.log(`   Total Source Entries: ${sourceNames.length}`);
      console.log(`   Unique AI Services: ${uniqueSourceNames.length}`);
      console.log(`   Services: ${uniqueSourceNames.join(', ')}`);
      
      // Verify no duplicates exist
      if (sourceNames.length === uniqueSourceNames.length) {
        console.log(`\n✅ SUCCESS: No duplicate sources found!`);
        console.log(`   Each AI service has exactly ONE entry in pricing sources.`);
      } else {
        console.log(`\n❌ FAILURE: Duplicate sources detected!`);
        console.log(`   Expected ${uniqueSourceNames.length} entries, but found ${sourceNames.length}`);
        
        // Count duplicates per service
        const sourceCounts: Record<string, number> = {};
        sourceNames.forEach((name: string) => {
          sourceCounts[name] = (sourceCounts[name] || 0) + 1;
        });
        
        console.log(`\n   Duplicate Count per Service:`);
        Object.entries(sourceCounts).forEach(([service, count]) => {
          if (count > 1) {
            console.log(`     - ${service}: ${count} entries (should be 1)`);
          }
        });
      }
      
      // Display consolidated source details
      console.log(`\n📋 Consolidated Source Details:`);
      result.pricing.sources.forEach((source: any, index: number) => {
        console.log(`\n   ${index + 1}. ${source.source}:`);
        console.log(`      Price: $${source.price}`);
        if (source.priceRange) {
          console.log(`      Range: $${source.priceRange.min} - $${source.priceRange.max}`);
        }
        if (source.priceCount) {
          console.log(`      Prices Found: ${source.priceCount}`);
        }
        if (source.context) {
          console.log(`      Context: ${source.context.substring(0, 100)}...`);
        }
      });
      
    } else {
      console.log(`\n⚠️ Pricing analysis failed or returned no sources`);
      if (result.message) {
        console.log(`   Message: ${result.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.log('\n============================================');
  console.log('🧪 Test Complete');
}

// Run the test
testPricingDeduplication()
  .then(() => {
    console.log('✅ Test execution completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });

export { testPricingDeduplication };