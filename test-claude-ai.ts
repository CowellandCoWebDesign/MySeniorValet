/**
 * Test Claude AI Integration
 * Quick test to verify the new API key works
 */

import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testClaudeAPI() {
  console.log('🧪 Testing Claude AI with new API key...');
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Generate a 2-sentence summary for seniors about a "Wheeled Walker with Seat" mobility aid. Focus on comfort and safety benefits.'
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    console.log('✅ Claude API Test Successful!');
    console.log('📝 Sample response:', content);
    console.log('🔑 API Key Status: Working');
    
    return { success: true, response: content };
    
  } catch (error) {
    console.error('❌ Claude API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testClaudeAPI().catch(console.error);