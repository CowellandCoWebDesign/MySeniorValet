import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSearchService } from './services/web-search-service';

// Initialize Gemini only if API key exists
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export class GeminiAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        aiService: 'Google Gemini'
      };
    }

    try {
      console.log('🌟 Gemini AI Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      // First perform web search to get real-time data
      let webSearchResults = '';
      let sources: string[] = [];
      
      try {
        const searchResponse = await WebSearchService.searchWeb(query, 8);
        if (searchResponse.results.length > 0) {
          webSearchResults = `\n\nWEB SEARCH RESULTS (${new Date().toISOString()}):\n`;
          searchResponse.results.forEach((result, i) => {
            webSearchResults += `\n${i+1}. ${result.title}\n   URL: ${result.url}\n   ${result.snippet}\n`;
          });
          sources = searchResponse.sources;
          console.log(`✅ Found ${searchResponse.results.length} web search results for Gemini`);
        }
      } catch (searchError) {
        console.log('⚠️ Web search failed, proceeding without web results');
      }
      
      // Use the cheaper gemini-1.5-flash model for cost efficiency (free tier)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemContext = `You are analyzing senior living information with access to real-time web search data.

Analyze the web search results provided and extract accurate, current information about:
- Official websites and contact details
- Current pricing and fees
- Available care levels and services
- Recent reviews and ratings
- Availability and waitlist status

Always cite sources when using web search data.`;
      
      const prompt = `${systemContext}\n\n${context ? `Context: ${context}\n\n` : ''}Query: ${query}${webSearchResults}\n\nProvide comprehensive, accurate information based on the web search results above. Include specific details, prices, and cite your sources.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      console.log('✅ Gemini response received:', content.substring(0, 200));
      
      return {
        success: true,
        content,
        model: 'gemini-1.5-flash',
        aiService: 'Google Gemini (Free Tier)',
        features: ['web-search', 'real-time-data'],
        sources,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Gemini AI Error:', error.message);
      
      if (error.message?.includes('API_KEY')) {
        return {
          success: false,
          error: 'Gemini API authentication failed - please check your API key',
          aiService: 'Google Gemini'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Gemini service temporarily unavailable',
        aiService: 'Google Gemini'
      };
    }
  }

  static async analyzeWithVision(imageBase64: string, prompt: string): Promise<any> {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        aiService: 'Google Gemini Vision'
      };
    }

    try {
      console.log('🖼️ Gemini Vision Request for image analysis');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Convert base64 to image data
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const content = response.text();
      
      return {
        success: true,
        content,
        model: 'gemini-1.5-flash',
        aiService: 'Google Gemini Vision',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Gemini Vision Error:', error.message);
      return {
        success: false,
        error: error.message || 'Gemini Vision service temporarily unavailable',
        aiService: 'Google Gemini Vision'
      };
    }
  }

  static async generateStructuredData(prompt: string): Promise<any> {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        aiService: 'Google Gemini'
      };
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      
      const fullPrompt = `Extract structured data and return as valid JSON:\n\n${prompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();
      
      try {
        const jsonData = JSON.parse(content);
        return {
          success: true,
          data: jsonData,
          model: 'gemini-1.5-flash',
          aiService: 'Google Gemini'
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse Gemini response as JSON',
          rawContent: content,
          aiService: 'Google Gemini'
        };
      }
    } catch (error: any) {
      console.error('❌ Gemini Structured Data Error:', error.message);
      return {
        success: false,
        error: error.message || 'Gemini service temporarily unavailable',
        aiService: 'Google Gemini'
      };
    }
  }

  static async compareCommunitiesWithAI(communities: any[]): Promise<any> {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        aiService: 'Google Gemini'
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Compare these senior living communities and provide insights:
      
Communities:
${communities.map((c, i) => `${i+1}. ${c.name} in ${c.city}, ${c.state}
   - Type: ${c.communityType}
   - Price: ${c.priceRange?.min ? `$${c.priceRange.min}-$${c.priceRange.max}` : 'Contact for pricing'}
   - Care Levels: ${c.careLevels?.join(', ') || 'Not specified'}`).join('\n')}

Provide:
1. Quick comparison table of key differences
2. Pricing analysis and value assessment
3. Care level recommendations based on needs
4. Location and accessibility insights
5. Overall recommendations with reasoning`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      return {
        success: true,
        content,
        model: 'gemini-1.5-flash',
        aiService: 'Google Gemini',
        analysisType: 'community_comparison',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Gemini Comparison Error:', error.message);
      return {
        success: false,
        error: error.message || 'Gemini comparison service unavailable',
        aiService: 'Google Gemini'
      };
    }
  }
}