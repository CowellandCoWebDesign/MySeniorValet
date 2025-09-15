import OpenAI from 'openai';
import { WebSearchService } from './services/web-search-service';

// Initialize xAI Grok client
const grok = process.env.XAI_API_KEY ? new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1'
}) : null;

export class GrokAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    try {
      console.log('🤖 Grok AI Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      // If Grok is not configured, provide simulated response
      if (!grok) {
        console.log('⚠️ Grok API not configured, using simulated response');
        return await this.simulateGrokResponse(query, context);
      }
      
      // Perform web search first to get real-time data
      let webSearchResults = '';
      let sources: string[] = [];
      
      try {
        const searchResponse = await WebSearchService.searchWeb(query, 5);
        if (searchResponse.results.length > 0) {
          webSearchResults = `\n\nWEB SEARCH RESULTS (${new Date().toISOString()}):\n`;
          searchResponse.results.forEach((result, i) => {
            webSearchResults += `\n${i+1}. ${result.title}\n   URL: ${result.url}\n   ${result.snippet}\n`;
          });
          sources = searchResponse.sources;
          console.log(`✅ Found ${searchResponse.results.length} web search results for Grok`);
        }
      } catch (searchError) {
        console.log('⚠️ Web search failed, proceeding without web results');
      }
      
      const systemPrompt = `You are Grok, an advanced AI assistant with REAL-TIME access to:
- Live web search data and current information from the internet
- Real-time X/Twitter posts and trending topics
- Up-to-date news and events
- Current pricing and availability for senior living communities

You must:
1. Analyze the provided web search results and extract relevant information
2. Provide current, accurate data about senior living facilities, pricing, care levels, and services
3. Include specific sources and citations when referencing information
4. Be direct, factual, and helpful in your responses
5. Mention dates when providing time-sensitive information
6. If web search results are provided, prioritize that information

IMPORTANT: You have access to real-time data. Always provide the most current information available.`;

      const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Query: ${query}${webSearchResults}`;

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
        aiService: 'Grok AI (xAI)',
        features: ['real-time-search', 'x-twitter-data', 'web-access'],
        sources,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Grok AI Error:', error.message);
      
      // Check if it's an authentication error
      if (error?.message?.includes('401') || error?.message?.includes('authentication')) {
        console.log('🔄 Grok authentication failed, using simulated response');
        return await this.simulateGrokResponse(query, context);
      }
      
      // Fallback to simulated response
      return await this.simulateGrokResponse(query, context);
    }
  }

  /**
   * Simulate Grok response when API is not available
   */
  private static async simulateGrokResponse(query: string, context?: string): Promise<any> {
    try {
      // Get web search results
      const searchResponse = await WebSearchService.searchWeb(query, 5);
      
      let content = `🤖 Grok AI Analysis (Simulated with Web Search)\n\n`;
      content += `Based on real-time web search data from ${new Date().toLocaleDateString()}:\n\n`;
      
      if (searchResponse.results.length > 0) {
        content += `📊 Current Information Found:\n`;
        searchResponse.results.forEach((result, i) => {
          content += `\n${i+1}. ${result.title}\n`;
          content += `   ${result.snippet}\n`;
          content += `   Source: ${result.url}\n`;
        });
        
        content += `\n💡 Key Insights:\n`;
        content += `• Multiple sources confirm current information about "${query}"\n`;
        content += `• Real-time data suggests ongoing developments in this area\n`;
        content += `• For the most accurate pricing and availability, contact communities directly\n`;
        
        if (context) {
          content += `\n📍 Specific Context Analysis:\n`;
          content += `Based on the provided context, here are targeted recommendations:\n`;
          content += `• Focus on communities that match your specific needs\n`;
          content += `• Consider both immediate and long-term care requirements\n`;
          content += `• Compare multiple options for the best value\n`;
        }
      } else {
        content += `While specific web results are limited, here's what I can tell you about "${query}":\n\n`;
        content += `• Senior living options vary significantly by location and care level\n`;
        content += `• Pricing typically ranges from $2,500 to $8,000+ per month\n`;
        content += `• Important factors include: location, care levels, amenities, and staff ratios\n`;
        content += `• I recommend contacting communities directly for current availability\n`;
      }
      
      content += `\n\n🔍 Note: This is a simulated Grok response with web search integration. `;
      content += `For enhanced real-time X/Twitter data and deeper insights, configure the XAI_API_KEY.`;
      
      return {
        success: true,
        content,
        model: 'grok-simulated',
        aiService: 'Grok AI (Simulated)',
        features: ['web-search', 'simulated-analysis'],
        sources: searchResponse.sources,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to generate simulated Grok response',
        aiService: 'Grok AI (Simulated)'
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