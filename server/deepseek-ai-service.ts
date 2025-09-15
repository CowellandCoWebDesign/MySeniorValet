import OpenAI from 'openai';

// Initialize DeepSeek client
const deepseek = process.env.DEEPSEEK_API_KEY ? new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 45000, // 45 seconds timeout to match orchestrator
  maxRetries: 0, // Disable automatic retries to respect timeout
}) : null;

export class DeepSeekAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    try {
      console.log('🧠 DeepSeek R1 Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      // If DeepSeek is not configured, return error (Golden Data Rule: no fake data)
      if (!deepseek) {
        console.log('⚠️ DeepSeek API not configured');
        return {
          success: false,
          error: 'DeepSeek API key not configured',
          aiService: 'DeepSeek R1'
        };
      }
      
      // DeepSeek is a reasoning model without native web search
      // It can only analyze based on its training data and reasoning capabilities
      const systemPrompt = `You are DeepSeek R1, an AI assistant with advanced reasoning capabilities analyzing senior living communities.

You do NOT have web search capabilities. You can only provide analysis based on:
- Your training data (up to your knowledge cutoff)
- Deep reasoning and logical analysis
- General knowledge about senior living industry trends and patterns

Your capabilities include:
- Deep reasoning and complex analysis
- Comprehensive evaluation based on known patterns in senior living
- Long-term planning and projection capabilities
- Financial analysis and cost-benefit assessment
- Quality of life evaluation and risk assessment

Instructions:
1. Be HONEST that you cannot access current web data or real-time pricing
2. Provide analysis based on general industry knowledge and reasoning
3. Suggest what information the user should verify from official sources
4. Apply deep reasoning to provide valuable insights despite lack of real-time data
5. Think step-by-step through complex decisions and trade-offs
6. Consider medical, financial, social, and geographical factors comprehensively

CRITICAL: You do NOT have web access. Be transparent about this limitation. Provide valuable reasoning and analysis but DO NOT claim to have current data.`;

      const userPrompt = `${context ? `Context: ${context}\n\n` : ''}Query: ${query}

Note: I do not have access to real-time web data. I'll provide analysis based on my knowledge and reasoning capabilities.`;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat", // DeepSeek model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      console.log('✅ DeepSeek response received:', content.substring(0, 200));
      
      return {
        success: true,
        content,
        model: 'deepseek-chat',
        aiService: 'DeepSeek R1 (Reasoning Only - No Web Search)',
        features: ['deep-reasoning', 'long-term-analysis', 'cost-analysis'],
        costSavings: '98% cost savings vs GPT-4',
        sources: [], // No web sources since DeepSeek doesn't have web access
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ DeepSeek AI Error:', error.message);
      
      // Return error (Golden Data Rule: no fake data)
      return {
        success: false,
        error: error.message || 'DeepSeek service temporarily unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }

  /**
   * Generate structured JSON data from a prompt
   */
  static async generateStructuredData(prompt: string): Promise<any> {
    try {
      if (!deepseek) {
        return {
          success: false,
          error: 'DeepSeek API key not configured',
          aiService: 'DeepSeek R1'
        };
      }
      
      const systemPrompt = `You are a data extraction expert. Extract structured information and return it as valid JSON.
Be transparent that you don't have access to real-time data.`;
      
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      try {
        const jsonData = JSON.parse(content);
        return {
          success: true,
          data: jsonData,
          model: 'deepseek-chat',
          aiService: 'DeepSeek R1'
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse DeepSeek response as JSON',
          rawContent: content,
          aiService: 'DeepSeek R1'
        };
      }
    } catch (error: any) {
      console.error('❌ DeepSeek Structured Data Error:', error.message);
      return {
        success: false,
        error: error.message || 'DeepSeek service temporarily unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }

  /**
   * Analyze code or technical content
   */
  static async analyzeCode(code: string, question: string): Promise<any> {
    try {
      if (!deepseek) {
        return {
          success: false,
          error: 'DeepSeek API key not configured',
          aiService: 'DeepSeek R1'
        };
      }
      
      const systemPrompt = `You are an expert code analyst. Analyze the provided code and answer the question with deep reasoning.`;
      
      const userPrompt = `Code:\n\`\`\`\n${code}\n\`\`\`\n\nQuestion: ${question}`;
      
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2500,
        temperature: 0.3 // Lower temperature for more precise technical analysis
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        model: 'deepseek-chat',
        aiService: 'DeepSeek R1',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ DeepSeek Code Analysis Error:', error.message);
      return {
        success: false,
        error: error.message || 'DeepSeek service temporarily unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }

  /**
   * Perform deep multi-step reasoning
   */
  static async deepReasoning(problem: string, constraints?: string[]): Promise<any> {
    try {
      if (!deepseek) {
        return {
          success: false,
          error: 'DeepSeek API key not configured',
          aiService: 'DeepSeek R1'
        };
      }
      
      const systemPrompt = `You are DeepSeek R1, specialized in deep multi-step reasoning and complex problem solving.
Break down problems systematically and think through each step carefully.
Note: You do not have access to real-time data or web search.`;
      
      let userPrompt = `Problem: ${problem}`;
      if (constraints && constraints.length > 0) {
        userPrompt += `\n\nConstraints:\n${constraints.map(c => `• ${c}`).join('\n')}`;
      }
      userPrompt += `\n\nPlease provide step-by-step reasoning to solve this problem.`;
      
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.5
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        model: 'deepseek-chat',
        aiService: 'DeepSeek R1 (Deep Reasoning)',
        reasoningType: 'multi-step',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ DeepSeek Deep Reasoning Error:', error.message);
      return {
        success: false,
        error: error.message || 'DeepSeek service temporarily unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }
}