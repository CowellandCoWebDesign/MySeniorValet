/**
 * Test Perplexity AI Integration
 * Quick test to verify if Perplexity has working credits
 */

async function testPerplexityAPI() {
  console.log('🧪 Testing Perplexity AI for working credits...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Be precise and concise. Generate exactly 3 sentences.'
          },
          {
            role: 'user',
            content: 'Generate a helpful 3-sentence product summary for seniors about a "Wheeled Walker with Seat" mobility aid. Focus on comfort, safety, and independence benefits for seniors.'
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Perplexity API Test Failed:', response.status, error);
      return { success: false, error: `${response.status}: ${error}` };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'No content returned';
    
    console.log('✅ Perplexity API Test Successful!');
    console.log('📝 Sample response:', content);
    console.log('🔑 API Key Status: Working with credits');
    
    return { success: true, response: content };
    
  } catch (error) {
    console.error('❌ Perplexity API Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testPerplexityAPI().catch(console.error);