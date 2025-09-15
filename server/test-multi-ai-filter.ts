/**
 * Test script for Multi-AI Orchestrator service filtering functionality
 */

import { MultiAIOrchestrator } from './multi-ai-orchestrator';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

async function testMultiAIFiltering() {
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}Testing Multi-AI Orchestrator Filtering${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  const testQuery = "What are the best senior living communities in Miami, Florida?";

  // Test 1: Default behavior (no filters)
  console.log(`${colors.yellow}Test 1: Default behavior (all services)${colors.reset}`);
  console.log(`Query: "${testQuery}"\n`);
  
  try {
    const defaultResult = await MultiAIOrchestrator.searchAllAIs(testQuery);
    const servicesUsed = Object.keys(defaultResult.responses).filter(key => 
      defaultResult.responses[key as keyof typeof defaultResult.responses]?.success
    );
    console.log(`${colors.green}✅ Default mode successful${colors.reset}`);
    console.log(`Services used: ${servicesUsed.join(', ')}`);
    console.log(`Success count: ${defaultResult.metadata.successfulServices}/${Object.keys(defaultResult.responses).length}\n`);
  } catch (error) {
    console.log(`${colors.red}❌ Default mode failed: ${error}${colors.reset}\n`);
  }

  // Test 2: Include only specific services (for reviews)
  console.log(`${colors.yellow}Test 2: Include only Grok and Gemini (for review analysis)${colors.reset}`);
  console.log(`Query: "${testQuery}"\n`);
  
  try {
    const includeResult = await MultiAIOrchestrator.searchAllAIs(testQuery, {
      includeServices: ['grok', 'gemini']
    });
    const servicesUsed = Object.keys(includeResult.responses).filter(key => 
      includeResult.responses[key as keyof typeof includeResult.responses]?.success
    );
    console.log(`${colors.green}✅ Include mode successful${colors.reset}`);
    console.log(`Services used: ${servicesUsed.join(', ')}`);
    console.log(`Success count: ${includeResult.metadata.successfulServices}/${Object.keys(includeResult.responses).length}`);
    
    // Check if only specified services ran
    const unexpectedServices = Object.keys(includeResult.responses).filter(service => 
      !['grok', 'gemini', 'deepseek'].includes(service)
    );
    if (unexpectedServices.length === 0) {
      console.log(`${colors.green}✅ Only specified services (plus potential DeepSeek fallback) were called${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Unexpected services called: ${unexpectedServices.join(', ')}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Include mode failed: ${error}${colors.reset}\n`);
  }

  // Test 3: Exclude specific services
  console.log(`${colors.yellow}Test 3: Exclude Grok and Gemini (for main analysis)${colors.reset}`);
  console.log(`Query: "${testQuery}"\n`);
  
  try {
    const excludeResult = await MultiAIOrchestrator.searchAllAIs(testQuery, {
      excludeServices: ['grok', 'gemini']
    });
    const servicesUsed = Object.keys(excludeResult.responses).filter(key => 
      excludeResult.responses[key as keyof typeof excludeResult.responses]?.success
    );
    console.log(`${colors.green}✅ Exclude mode successful${colors.reset}`);
    console.log(`Services used: ${servicesUsed.join(', ')}`);
    console.log(`Success count: ${excludeResult.metadata.successfulServices}/${Object.keys(excludeResult.responses).length}`);
    
    // Check if excluded services are not present
    const excludedPresent = ['grok', 'gemini'].filter(service => 
      service in excludeResult.responses
    );
    if (excludedPresent.length === 0) {
      console.log(`${colors.green}✅ Excluded services were not called${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Excluded services were called: ${excludedPresent.join(', ')}${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Exclude mode failed: ${error}${colors.reset}\n`);
  }

  // Test 4: Test DeepSeek fallback (simulate all services failing by using non-existent services)
  console.log(`${colors.yellow}Test 4: Test DeepSeek fallback (include non-existent service)${colors.reset}`);
  console.log(`Query: "${testQuery}"\n`);
  
  try {
    const fallbackResult = await MultiAIOrchestrator.searchAllAIs(testQuery, {
      includeServices: ['nonexistent'] // This service doesn't exist, should trigger DeepSeek fallback
    });
    
    // Check if DeepSeek was used as fallback
    if ('deepseek' in fallbackResult.responses) {
      console.log(`${colors.green}✅ DeepSeek fallback was triggered${colors.reset}`);
      const deepseekSuccess = fallbackResult.responses.deepseek?.success;
      console.log(`DeepSeek status: ${deepseekSuccess ? 'Success' : 'Failed'}\n`);
    } else {
      console.log(`${colors.yellow}⚠️ DeepSeek fallback was not triggered (expected when primary service succeeds)${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Fallback test failed: ${error}${colors.reset}\n`);
  }

  // Test 5: Cache functionality with filters
  console.log(`${colors.yellow}Test 5: Cache functionality with filters${colors.reset}`);
  console.log(`Running same query twice with includeServices filter...\n`);
  
  try {
    const cacheContext = { includeServices: ['perplexity', 'claude'] };
    
    // First call
    const start1 = Date.now();
    const result1 = await MultiAIOrchestrator.searchAllAIs(testQuery, cacheContext);
    const time1 = Date.now() - start1;
    console.log(`First call took: ${time1}ms`);
    
    // Second call (should be cached)
    const start2 = Date.now();
    const result2 = await MultiAIOrchestrator.searchAllAIs(testQuery, cacheContext);
    const time2 = Date.now() - start2;
    console.log(`Second call took: ${time2}ms`);
    
    if (time2 < time1 / 10) { // Cached call should be much faster
      console.log(`${colors.green}✅ Cache is working with filters (second call was ${Math.round(time1/time2)}x faster)${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠️ Cache might not be working properly${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Cache test failed: ${error}${colors.reset}\n`);
  }

  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}Testing Complete${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
}

// Run tests
testMultiAIFiltering().catch(error => {
  console.error(`\x1b[31mTest execution failed:\x1b[0m`, error);
  process.exit(1);
});

export { testMultiAIFiltering };