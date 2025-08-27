/**
 * Test Script for Enhanced AI Enrichment
 * ========================================
 * Demonstrates the improvements made in AI enrichment with fuzzy matching
 * and multiple search strategies
 */

import { db } from '../db';
import { communities } from '../../shared/schema';
import { sql } from 'drizzle-orm';
import EnhancedAIEnrichmentService from '../services/enhanced-ai-enrichment';

async function testEnhancedEnrichment() {
  console.log('\n🧪 TESTING ENHANCED AI ENRICHMENT WITH FUZZY MATCHING\n');
  console.log('=' .repeat(70));
  
  const enrichmentService = new EnhancedAIEnrichmentService();
  
  // Test communities representing different challenges
  const testCases = [
    { 
      name: 'Brookdale Denver Tech Center', 
      city: 'Denver', 
      state: 'CO',
      description: 'Testing major chain with location identifier'
    },
    { 
      name: 'Sunrise of Santa Monica', 
      city: 'Santa Monica', 
      state: 'CA',
      description: 'Testing "of" naming pattern'
    },
    { 
      name: 'Holiday Retirement', 
      city: 'Salem', 
      state: 'OR',
      description: 'Testing generic chain name without location'
    },
    { 
      name: 'Watermark at Brooklyn Heights', 
      city: 'Brooklyn', 
      state: 'NY',
      description: 'Testing "at" naming pattern'
    },
    { 
      name: 'Atria Senior Living', 
      city: 'San Francisco', 
      state: 'CA',
      description: 'Testing generic name that needs location context'
    }
  ];
  
  console.log(`\n📋 Test Cases: ${testCases.length} communities\n`);
  
  const results: {
    successful: Array<{ name: string; strategy: string; confidence: number }>;
    failed: Array<{ name: string; attempts?: number; error?: string }>;
    strategies: Record<string, number>;
  } = {
    successful: [],
    failed: [],
    strategies: {}
  };
  
  for (const testCase of testCases) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🏢 Testing: ${testCase.name}`);
    console.log(`📍 Location: ${testCase.city}, ${testCase.state}`);
    console.log(`📝 Test Type: ${testCase.description}`);
    console.log(`${'─'.repeat(60)}\n`);
    
    try {
      const result = await enrichmentService.findCommunityWithStrategies(
        0, // dummy ID for testing
        testCase.name,
        testCase.city,
        testCase.state
      );
      
      const summary = enrichmentService.getEnrichmentSummary(result);
      console.log(`\nResult: ${summary}\n`);
      
      if (result.found) {
        results.successful.push({
          name: testCase.name,
          strategy: result.searchStrategy,
          confidence: result.confidence
        });
        
        // Track strategy usage
        if (result.searchStrategy) {
          results.strategies[result.searchStrategy] = 
            (results.strategies[result.searchStrategy] || 0) + 1;
        }
        
        // Display enriched data
        console.log('📊 Enriched Data:');
        if (result.phone) console.log(`  📞 Phone: ${result.phone}`);
        if (result.officialWebsite) console.log(`  🌐 Website: ${result.officialWebsite}`);
        if (result.pricing) {
          console.log('  💰 Pricing:');
          if (result.pricing.assistedLiving) 
            console.log(`    - Assisted Living: ${result.pricing.assistedLiving}`);
          if (result.pricing.memoryCare) 
            console.log(`    - Memory Care: ${result.pricing.memoryCare}`);
          if (result.pricing.independentLiving) 
            console.log(`    - Independent Living: ${result.pricing.independentLiving}`);
        }
        if (result.careLevels?.length) {
          console.log(`  🏥 Care Levels: ${result.careLevels.join(', ')}`);
        }
        if (result.amenities?.length) {
          console.log(`  ✨ Amenities: ${result.amenities.slice(0, 5).join(', ')}...`);
        }
      } else {
        results.failed.push({
          name: testCase.name,
          attempts: result.searchAttempts || 1
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error testing ${testCase.name}:`, errorMessage);
      results.failed.push({ name: testCase.name, error: errorMessage });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Print summary
  console.log(`\n${'═'.repeat(70)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'═'.repeat(70)}\n`);
  
  console.log(`✅ Successful Enrichments: ${results.successful.length}/${testCases.length}`);
  console.log(`❌ Failed Enrichments: ${results.failed.length}/${testCases.length}`);
  
  if (results.successful.length > 0) {
    console.log('\n🎯 Successful Communities:');
    for (const success of results.successful) {
      console.log(`  • ${success.name}`);
      console.log(`    Strategy: ${success.strategy} | Confidence: ${Math.round(success.confidence * 100)}%`);
    }
  }
  
  if (Object.keys(results.strategies).length > 0) {
    console.log('\n📈 Strategy Usage:');
    for (const [strategy, count] of Object.entries(results.strategies)) {
      console.log(`  • ${strategy}: ${count} successful matches`);
    }
  }
  
  if (results.failed.length > 0) {
    console.log('\n⚠️ Failed Communities:');
    for (const failed of results.failed) {
      console.log(`  • ${failed.name} (tried ${failed.attempts || 'unknown'} strategies)`);
    }
  }
  
  // Calculate success rate
  const successRateNum = (results.successful.length / testCases.length * 100);
  const successRate = successRateNum.toFixed(1);
  console.log(`\n🏆 Overall Success Rate: ${successRate}%`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (successRateNum < 50) {
    console.log('  • Consider adjusting similarity thresholds');
    console.log('  • Add more chain aliases to the mapping');
    console.log('  • Review failed cases for patterns');
  } else if (successRateNum < 80) {
    console.log('  • Fine-tune confidence thresholds');
    console.log('  • Expand search strategies for edge cases');
  } else {
    console.log('  • System performing well!');
    console.log('  • Continue monitoring for optimization opportunities');
  }
  
  console.log('\n✨ Enhanced AI Enrichment Test Complete!\n');
}

// Run the test
if (require.main === module) {
  testEnhancedEnrichment()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default testEnhancedEnrichment;