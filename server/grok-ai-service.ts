import OpenAI from 'openai';

const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY! 
});

export class GrokAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    try {
      console.log('🤖 Grok AI Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      const systemPrompt = `You are Grok, an AI assistant analyzing senior living communities. 
You have access to real-time information and can provide current, accurate data.
Focus on practical, actionable information about senior living facilities, pricing, care levels, and services.
Be direct and factual in your responses.`;

      const userPrompt = context 
        ? `Context: ${context}\n\nQuery: ${query}`
        : query;

      const response = await grok.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      console.log('✅ Grok response received:', content.substring(0, 200));
      
      return {
        success: true,
        content,
        model: 'grok-2-1212',
        aiService: 'Grok AI (xAI)',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok AI Error:', error.message);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        return {
          success: false,
          error: 'Grok API authentication failed - please check your API key',
          aiService: 'Grok AI (xAI)'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Grok AI service temporarily unavailable',
        aiService: 'Grok AI (xAI)'
      };
    }
  }

  static async analyzeWithVision(imageBase64: string, prompt: string): Promise<any> {
    try {
      console.log('🖼️ Grok Vision Request for image analysis');
      
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
      const response = await grok.chat.completions.create({
        model: "grok-2-1212",
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
          model: 'grok-2-1212',
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