import { GoogleGenerativeAI } from '@google/generative-ai';

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
      
      // Gemini does not have native web search capabilities
      // It can only analyze based on its training data
      
      // Use the cheaper gemini-1.5-flash model for cost efficiency (free tier)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemContext = `You are Google Gemini analyzing senior living information.

IMPORTANT: You do NOT have access to real-time web data or current pricing information.

You can provide analysis based on:
- Your training data and general knowledge
- Understanding of senior living industry patterns
- General price ranges and typical services
- Evaluation criteria for senior care facilities

Be transparent that you cannot provide:
- Current pricing or availability
- Real-time data or recent updates
- Specific contact information that may have changed
- Recent reviews or current ratings

Always advise users to:
- Contact facilities directly for current pricing
- Visit official websites for up-to-date information
- Verify all details before making decisions`;
      
      const prompt = `${systemContext}\n\n${context ? `Context: ${context}\n\n` : ''}Query: ${query}\n\nProvide helpful analysis while being transparent about your limitations regarding real-time data.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      console.log('✅ Gemini response received:', content.substring(0, 200));
      
      return {
        success: true,
        content,
        model: 'gemini-1.5-flash',
        aiService: 'Google Gemini (No Web Search)',
        features: ['general-analysis', 'pattern-recognition'],
        sources: [], // No web sources since Gemini doesn't have web access
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Gemini AI Error:', error.message);
      
      if (error.message?.includes('API_KEY')) {
        return {
          success: false,
          error: 'Invalid or missing Gemini API key',
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

  /**
   * Analyze images using Gemini Vision
   */
  static async analyzeImage(imageBase64: string, prompt: string): Promise<any> {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        aiService: 'Google Gemini Vision'
      };
    }

    try {
      console.log('🖼️ Gemini Vision Request for image analysis');
      
      // Use gemini-1.5-flash for vision (supports images)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      };
      
      const visionPrompt = `Analyze this image of a senior living facility.
Note: I cannot access real-time data about pricing or current availability.
I can describe what I see and provide general insights based on the image.

${prompt}`;
      
      const result = await model.generateContent([visionPrompt, imagePart]);
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

  /**
   * Generate structured JSON data
   */
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
          responseMimeType: "application/json"
        }
      });
      
      const structuredPrompt = `Extract structured information and return as valid JSON.
Be transparent that any pricing or availability data is based on general knowledge, not real-time information.

${prompt}`;
      
      const result = await model.generateContent(structuredPrompt);
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

  /**
   * Batch process multiple queries efficiently
   */
  static async batchAnalyze(queries: string[]): Promise<any> {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        aiService: 'Google Gemini'
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const results = [];
      for (const query of queries) {
        const prompt = `Analyze this senior living query (note: I don't have real-time data): ${query}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        results.push({
          query,
          response: response.text()
        });
      }
      
      return {
        success: true,
        results,
        model: 'gemini-1.5-flash',
        aiService: 'Google Gemini Batch',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Gemini Batch Error:', error.message);
      return {
        success: false,
        error: error.message || 'Gemini batch processing failed',
        aiService: 'Google Gemini'
      };
    }
  }
}