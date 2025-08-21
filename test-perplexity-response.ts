import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testPerplexityResponse() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
    return;
  }

  console.log('🔍 Testing Perplexity API with sonar-pro model...\n');

  try {
    // Test with a real senior living community search
    const testQuery = '"Brookdale Senior Living" Dallas Texas';
    
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'PROVIDE RAW, UNFILTERED SEARCH RESULTS. Include EVERYTHING found about senior living communities.'
          },
          {
            role: 'user',
            content: testQuery
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API Call Successful!\n');
    console.log('📋 Full Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📝 Message Content:');
    console.log(response.data.choices[0]?.message?.content);
    
    console.log('\n📊 Response Metadata:');
    console.log('- Model:', response.data.model);
    console.log('- Usage:', response.data.usage);
    console.log('- Citations:', response.data.citations || 'No citations field');
    
  } catch (error: any) {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.error('\n📋 Error Details:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testPerplexityResponse();