// DeepSeek service temporarily disabled
const deepseek: any = null;

export class DeepSeekAIService {
  static async searchAndAnalyze(query: string, context?: string): Promise<any> {
    try {
      console.log('🧠 DeepSeek R1 Request:', { query: query.substring(0, 100), hasContext: !!context });
      
      const systemPrompt = `You are an AI assistant analyzing senior living communities with deep reasoning capabilities. 
Provide comprehensive analysis with detailed insights about senior living facilities, pricing, care levels, and services.
Focus on thorough research and complex reasoning to help families make informed decisions.
Include specific recommendations and considerations based on the query.`;

      const userPrompt = context 
        ? `Context: ${context}\n\nQuery: ${query}`
        : query;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-reasoner", // DeepSeek R1 model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      
      console.log('✅ DeepSeek response received:', content.substring(0, 200));
      
      return {
        success: true,
        content,
        model: 'deepseek-reasoner',
        aiService: 'DeepSeek R1',
        costSavings: '98% cost savings',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ DeepSeek AI Error:', error.message);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        return {
          success: false,
          error: 'DeepSeek API authentication failed - please check your API key',
          aiService: 'DeepSeek R1'
        };
      }
      
      return {
        success: false,
        error: error.message || 'DeepSeek service temporarily unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }

  static async deepAnalysis(communities: any[], userProfile: any): Promise<any> {
    try {
      console.log('🔬 DeepSeek Deep Analysis Request for', communities.length, 'communities');
      
      const prompt = `Perform deep analysis of these senior living communities for the user profile:

COMMUNITIES:
${communities.map((c, i) => `
${i+1}. ${c.name} - ${c.city}, ${c.state}
   Type: ${c.communityType || 'Not specified'}
   Price: ${c.priceRange?.min ? `$${c.priceRange.min}-$${c.priceRange.max}/month` : 'Contact for pricing'}
   Care Levels: ${c.careLevels?.join(', ') || 'Not specified'}
   ${c.description ? `Description: ${c.description.substring(0, 200)}...` : ''}
`).join('\n')}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

Provide:
1. Detailed suitability analysis for each community
2. Long-term care progression planning (5-10 years)
3. Financial sustainability assessment
4. Risk factors and mitigation strategies
5. Family involvement recommendations
6. Quality of life projections
7. Ranked recommendations with detailed reasoning

Use deep reasoning to consider all factors including medical needs progression, financial planning with inflation, social needs, and geographic considerations.`;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-reasoner",
        messages: [
          { 
            role: 'system', 
            content: 'You are a senior living expert with deep analytical capabilities. Provide comprehensive, nuanced analysis considering all aspects of senior care planning.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.6
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        analysis: content,
        model: 'deepseek-reasoner',
        aiService: 'DeepSeek R1 Deep Analysis',
        analysisType: 'comprehensive_care_planning',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ DeepSeek Deep Analysis Error:', error.message);
      return {
        success: false,
        error: error.message || 'DeepSeek deep analysis unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }

  static async compareWithReasoning(communities: any[]): Promise<any> {
    try {
      const prompt = `Compare these senior living communities using deep reasoning:

${communities.map((c, i) => `${i+1}. ${c.name} in ${c.city}, ${c.state}
   - Type: ${c.communityType}
   - Price: ${c.priceRange?.min ? `$${c.priceRange.min}-$${c.priceRange.max}` : 'Contact for pricing'}
   - Care Levels: ${c.careLevels?.join(', ') || 'Not specified'}`).join('\n\n')}

Apply deep reasoning to:
1. Analyze value propositions beyond just price
2. Evaluate care quality indicators
3. Project future care needs and transitions
4. Assess hidden costs and fees
5. Compare lifestyle and social opportunities
6. Analyze location advantages/disadvantages
7. Provide decision framework for families

Think step-by-step through each comparison factor.`;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "system",
            content: "You are an expert in senior living analysis. Use deep reasoning to provide comprehensive comparisons that help families make informed decisions."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2500,
        temperature: 0.6
      });

      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        model: 'deepseek-reasoner',
        aiService: 'DeepSeek R1',
        reasoningType: 'comparative_analysis',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ DeepSeek Comparison Error:', error.message);
      return {
        success: false,
        error: error.message || 'DeepSeek comparison service unavailable',
        aiService: 'DeepSeek R1'
      };
    }
  }
}