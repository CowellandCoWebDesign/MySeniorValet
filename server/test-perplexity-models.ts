#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
  process.exit(1);
}

// Test various model names based on documentation
const modelsToTest = [
  // Current models from 2025 documentation
  'sonar-pro',
  'sonar-small', 
  'sonar-medium',
  'sonar-deep-research',
  'sonar-reasoning',
  'sonar-pro-reasoning',
  
  // Legacy format attempts
  'sonar',
  'sonar-online',
  'sonar-small-online',
  'sonar-medium-online',
  
  // Old deprecated models (just in case)
  'sonar-small-online',
  'sonar-large-online',
  'sonar-huge-online',
  
  // Other potential names
  'sonar-1',
  'sonar-2',
  'mixtral-8x7b-instruct'
];

async function testModel(model: string): Promise<{ model: string; success: boolean; error?: string; response?: any }> {
  console.log(`\n🔬 Testing model: ${model}`);
  
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant providing information about senior living communities.'
          },
          {
            role: 'user',
            content: 'What is the average cost of senior living in Miami?'
          }
        ],
        max_tokens: 100,
        temperature: 0.2,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log(`✅ SUCCESS: Model '${model}' works!`);
    console.log(`   Response: ${response.data.choices?.[0]?.message?.content?.substring(0, 100)}...`);
    
    return {
      model,
      success: true,
      response: response.data
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.log(`❌ FAILED: ${errorMessage}`);
    
    return {
      model,
      success: false,
      error: errorMessage
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Perplexity Model Tests');
  console.log('================================');
  console.log(`Testing ${modelsToTest.length} model variations...`);
  
  const results = [];
  
  for (const model of modelsToTest) {
    const result = await testModel(model);
    results.push(result);
    
    // If we found a working model, highlight it
    if (result.success) {
      console.log('\n🎉 WORKING MODEL FOUND! 🎉');
      break;
    }
    
    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const successfulModels = results.filter(r => r.success);
  const failedModels = results.filter(r => !r.success);
  
  if (successfulModels.length > 0) {
    console.log('\n✅ WORKING MODELS:');
    successfulModels.forEach(r => {
      console.log(`   - ${r.model}`);
    });
    
    console.log('\n🎯 RECOMMENDED MODEL TO USE:');
    console.log(`   ${successfulModels[0].model}`);
    
    // Update the service with the working model
    console.log('\n📝 Update server/perplexity-ai-service.ts with:');
    console.log(`   model: '${successfulModels[0].model}'`);
  } else {
    console.log('\n❌ No working models found');
    console.log('\nFailed models and reasons:');
    failedModels.forEach(r => {
      console.log(`   - ${r.model}: ${r.error}`);
    });
    
    console.log('\n💡 Suggestions:');
    console.log('   1. Check if PERPLEXITY_API_KEY is valid');
    console.log('   2. Visit https://docs.perplexity.ai/guides/model-cards for latest models');
    console.log('   3. Ensure your API key has access to the models');
  }
}

// Run the tests
runTests().catch(console.error);