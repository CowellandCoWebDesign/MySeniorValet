import OpenAI from 'openai';

// Initialize xAI Grok client - Grok has NATIVE real-time web search built-in
const grok = process.env.XAI_API_KEY ? new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
}) : null;

export class GrokAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    try {
      console.log('🤖 Grok AI Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      // If Grok is not configured, return error (Golden Data Rule: no fake data)
      if (!grok) {
        console.log('⚠️ Grok API not configured');
        return {
          success: false,
          error: 'Grok API key not configured',
          aiService: 'Grok AI (xAI)'
        };
      }
      
      // Grok has NATIVE real-time web search - no need for external web search service
      const systemPrompt = `You are Grok, an advanced AI assistant with NATIVE REAL-TIME access to:
- Live web search and current information from the internet (built into your model)
- Real-time X/Twitter posts and trending topics
- Up-to-date news and events
- Current pricing and availability for senior living communities

You have DIRECT ACCESS to search the web in real-time. You don't need external search results.

You must:
1. Use your native web search capabilities to find current information
2. Provide current, accurate data about senior living facilities, pricing, care levels, and services
3. Include specific sources and URLs when referencing information
4. Be direct, factual, and helpful in your responses
5. Mention dates when providing time-sensitive information
6. ALWAYS cite real sources with real URLs that you find through your native web access

CRITICAL: You have built-in web search. Use it to find REAL information. DO NOT make up data.`;

      const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Query: ${query}

Please use your native real-time web search capabilities to find current information about this query. Include real URLs and sources.`;

      const response = await grok.chat.completions.create({
        model: "grok-2-latest",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      console.log('✅ Grok response received:', content.substring(0, 200));
      
      return {
        success: true,
        content,
        model: 'grok-2-latest',
        aiService: 'Grok AI (xAI) with Native Web Search',
        features: ['native-real-time-search', 'x-twitter-data', 'built-in-web-access'],
        sources: [], // Grok finds and cites sources directly in its response
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok AI Error:', error.message);
      
      // Return error (Golden Data Rule: no fake data)
      return {
        success: false,
        error: error.message || 'Grok service temporarily unavailable',
        aiService: 'Grok AI (xAI)'
      };
    }
  }

  static async analyzeWithVision(imageBase64: string, prompt: string): Promise<any> {
    try {
      console.log('🖼️ Grok Vision Request for image analysis');
      
      if (!grok) {
        return {
          success: false,
          error: 'Grok Vision requires XAI_API_KEY configuration',
          aiService: 'Grok Vision AI'
        };
      }
      
      const response = await grok.chat.completions.create({
        model: "grok-2-vision-1212",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        model: 'grok-2-vision-1212',
        aiService: 'Grok Vision AI',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok Vision Error:', error.message);
      return {
        success: false,
        error: error.message || 'Grok Vision service temporarily unavailable',
        aiService: 'Grok Vision AI'
      };
    }
  }

  static async generateStructuredData(prompt: string): Promise<any> {
    try {
      if (!grok) {
        return {
          success: false,
          error: 'Grok structured data requires XAI_API_KEY configuration',
          aiService: 'Grok AI (xAI)'
        };
      }
      
      const response = await grok.chat.completions.create({
        model: "grok-2-latest",
        messages: [
          {
            role: "system",
            content: "You are a data extraction expert. Extract structured information and return it as valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      try {
        const jsonData = JSON.parse(content);
        return {
          success: true,
          data: jsonData,
          model: 'grok-2-latest',
          aiService: 'Grok AI (xAI)'
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse Grok response as JSON',
          rawContent: content,
          aiService: 'Grok AI (xAI)'
        };
      }
    } catch (error: any) {
      console.error('❌ Grok Structured Data Error:', error.message);
      return {
        success: false,
        error: error.message || 'Grok service temporarily unavailable',
        aiService: 'Grok AI (xAI)'
      };
    }
  }
}