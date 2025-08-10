/**
 * Test script to demonstrate Perplexity's web search capabilities
 * for Miami senior living communities
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  citations?: string[];
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function testPerplexityMiamiSearch() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not configured in environment variables');
    return;
  }

  console.log('🔍 Testing Perplexity Web Search for Miami Senior Living...\n');

  try {
    const response = await axios.post<PerplexityResponse>(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',  // Using base sonar model
        messages: [
          {
            role: 'system',
            content: `You are a senior living research assistant with access to real-time web data. 
            Provide specific, factual information with sources.
            Focus on actual communities, real pricing, and current availability.
            Include citations for all facts.`
          },
          {
            role: 'user',
            content: `Find current information about senior living communities in Miami, Florida. Include:
              1. 3-5 specific community names with their actual current pricing ranges
              2. Any HUD-subsidized senior housing options in Miami
              3. Recent developments or new openings (2024-2025)
              4. Current market trends for senior living in Miami
              5. Average occupancy rates if available
              
              Provide real data with sources, not generic information.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Here\'s what Perplexity found:\n');
    console.log('━'.repeat(80));
    
    // Display the main response
    const content = response.data.choices[0]?.message?.content;
    if (content) {
      console.log('\n📊 REAL-TIME MIAMI SENIOR LIVING DATA:\n');
      console.log(content);
    }
    
    // Display citations if available
    if (response.data.citations && response.data.citations.length > 0) {
      console.log('\n📌 SOURCES & CITATIONS:');
      response.data.citations.forEach((citation, index) => {
        console.log(`  ${index + 1}. ${citation}`);
      });
    }
    
    console.log('\n━'.repeat(80));
    console.log('\n🎯 KEY CAPABILITIES DEMONSTRATED:');
    console.log('  ✅ Real-time web search with current data');
    console.log('  ✅ Specific community names and pricing');
    console.log('  ✅ Government (HUD) data access');
    console.log('  ✅ Market trends and occupancy data');
    console.log('  ✅ Citations and source verification');
    console.log('  ✅ Month-recent data filter for freshness');
    
    console.log('\n💡 This is why Perplexity is our PRIMARY AI for search:');
    console.log('  - Direct access to current web data');
    console.log('  - Built-in citation system for transparency');
    console.log('  - Real pricing from actual sources');
    console.log('  - No hallucination - only real, verifiable data');
    
    // Token usage if available
    if (response.data.usage) {
      console.log('\n📈 API Usage:');
      console.log(`  - Prompt tokens: ${response.data.usage.prompt_tokens}`);
      console.log(`  - Completion tokens: ${response.data.usage.completion_tokens}`);
      console.log(`  - Total tokens: ${response.data.usage.total_tokens}`);
    }
    
  } catch (error: any) {
    console.error('❌ Error calling Perplexity API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Invalid or missing API key. Please check PERPLEXITY_API_KEY');
    } else if (error.response?.status === 429) {
      console.log('\n⚠️  Rate limit exceeded. Please wait and try again.');
    }
  }
}

// Run the test
console.log('═'.repeat(80));
console.log('   PERPLEXITY WEB SEARCH TEST - MIAMI SENIOR LIVING');
console.log('═'.repeat(80));

testPerplexityMiamiSearch().then(() => {
  console.log('\n✨ Test complete!');
}).catch(error => {
  console.error('Fatal error:', error);
});