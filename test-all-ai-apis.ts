/**
 * AI API Status Checker
 * Test all AI services with working credentials
 */

import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

async function testClaudeAPI() {
  console.log('\n🧠 Testing Claude (Anthropic) API...');
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('❌ ANTHROPIC_API_KEY not found');
      return false;
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Reply with exactly: "Claude API is working perfectly"'
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      console.log('✅ Claude API Response:', content.text);
      return content.text.includes('Claude API is working');
    }
    return false;
  } catch (error) {
    console.log('❌ Claude API Error:', error.message);
    return false;
  }
}

async function testOpenAIAPI() {
  console.log('\n🤖 Testing OpenAI API...');
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY not found');
      return false;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: 'user',
          content: 'Say: OpenAI API test successful'
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('✅ OpenAI API Response:', content);
    return content.includes('OpenAI API is working');
  } catch (error) {
    console.log('❌ OpenAI API Error:', error.message);
    return false;
  }
}

async function testPerplexityAPI() {
  console.log('\n🔍 Testing Perplexity API...');
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      console.log('❌ PERPLEXITY_API_KEY not found');
      return false;
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: 'Reply with exactly: "Perplexity API is working perfectly"'
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      console.log('❌ Perplexity API HTTP Error:', response.status, await response.text());
      return false;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    console.log('✅ Perplexity API Response:', content);
    return content.includes('Perplexity API is working');
  } catch (error) {
    console.log('❌ Perplexity API Error:', error.message);
    return false;
  }
}

async function testAllAIAPIs() {
  console.log('🎼 MySeniorValet AI Orchestra Health Check');
  console.log('=' .repeat(60));
  console.log('Testing all AI APIs with confirmed working credentials...');

  const results = {
    claude: await testClaudeAPI(),
    openai: await testOpenAIAPI(),
    perplexity: await testPerplexityAPI()
  };

  console.log('\n' + '='.repeat(60));
  console.log('📊 AI ORCHESTRA STATUS REPORT:');
  console.log('='.repeat(60));
  console.log(`Claude (Anthropic):    ${results.claude ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`OpenAI (ChatGPT):      ${results.openai ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Perplexity:            ${results.perplexity ? '✅ WORKING' : '❌ FAILED'}`);
  console.log('='.repeat(60));

  const workingCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 Result: ${workingCount}/3 AI services operational`);
  
  if (workingCount === 3) {
    console.log('🚀 ALL AI SERVICES FULLY OPERATIONAL!');
    console.log('🎼 Multi-AI orchestra ready for maximum intelligence');
  } else if (workingCount >= 1) {
    console.log('⚡ Partial AI coverage available');
    console.log('💡 Platform can operate with reduced AI functionality');
  } else {
    console.log('⚠️  No AI services working - check credentials');
  }

  return results;
}

testAllAIAPIs().catch(console.error);