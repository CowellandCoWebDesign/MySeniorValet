/**
 * Test Perplexity API with sonar-pro model
 * Verifies the enhanced model is working correctly
 */

async function testSonarPro() {
  console.log('🔍 Testing Perplexity sonar-pro model...\n');
  
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.error('❌ PERPLEXITY_API_KEY not configured');
    return;
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a senior living research assistant. Provide accurate information from official sources.'
          },
          {
            role: 'user',
            content: 'Find information about Sunrise Senior Living in McLean, VA. Include their website, phone, and services offered.'
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        stream: false,
        return_citations: true,
        return_images: false,
        search_recency_filter: "month"
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return;
    }

    const data = await response.json();
    
    console.log('✅ sonar-pro model is working successfully!');
    console.log('Model used:', data.model);
    console.log('Citations found:', data.citations?.length || 0);
    console.log('Response excerpt:', data.choices[0]?.message?.content?.substring(0, 200) + '...\n');
    
    if (data.citations && data.citations.length > 0) {
      console.log('Sources:');
      data.citations.slice(0, 3).forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSonarPro();