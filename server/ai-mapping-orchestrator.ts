// AI-powered mapping search query analysis
import { PerplexityAIService } from './perplexity-ai-service';

const perplexityService = new PerplexityAIService();

export const aiMappingOrchestrator = {
  async analyzeSearchQuery(params: {
    query: string;
    context: string;
    careTypes?: string;
    budget?: string;
  }): Promise<{
    interpretation: string;
    detectedLocations: string[];
    suggestedCareTypes: string[];
    confidence: number;
    realTimeInsights?: {
      pricing?: string;
      availability?: string;
      marketTrends?: string;
    };
  }> {
    console.log(`🧠 AI Search Analysis: "${params.query}"`);
    
    const analysisPrompt = `Analyze this senior living search query and provide structured insights:

Query: "${params.query}"
Context: ${params.context}
Care Types: ${params.careTypes || 'Not specified'}
Budget: ${params.budget || 'Not specified'}

Please analyze and respond with ONLY a JSON object in this exact format:
{
  "interpretation": "Brief explanation of what the user is looking for",
  "detectedLocations": ["city1", "state1", "region1"],
  "suggestedCareTypes": ["Assisted Living", "Memory Care", etc],
  "confidence": 0.0-1.0
}

Focus on:
1. Geographic locations mentioned (cities, states, regions)
2. Care types implied or mentioned
3. Any specific preferences or requirements
4. Your confidence in the analysis`;

    try {
      const anthropicAIService = await import('./anthropic-ai-service');
      const response = await anthropicAIService.generateResponse(analysisPrompt);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Enhance with Perplexity real-time insights
        try {
          const location = analysis.detectedLocations?.[0] || params.query;
          const perplexityQuery = `Current senior living pricing availability trends ${location} 2025`;
          const perplexityResult = await perplexityService.searchCommunityInfo(perplexityQuery);
          
          if (perplexityResult.success && perplexityResult.data) {
            // Extract real-time insights
            const priceMatch = perplexityResult.data.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?/g);
            
            analysis.realTimeInsights = {
              pricing: priceMatch?.[0] || undefined,
              availability: perplexityResult.data.includes('available') ? 'Units available' : undefined,
              marketTrends: `Live data from Perplexity: ${perplexityResult.data.substring(0, 200)}...`
            };
            
            console.log(`✅ Enhanced with Perplexity real-time data`);
          }
        } catch (error) {
          console.error('Perplexity enhancement failed:', error);
        }
        
        console.log(`✅ AI Search Analysis complete with ${analysis.confidence} confidence`);
        return analysis;
      }
      
      // Fallback response
      return {
        interpretation: "General senior living search",
        detectedLocations: [],
        suggestedCareTypes: [],
        confidence: 0.3
      };
      
    } catch (error) {
      console.error('AI search analysis failed:', error);
      return {
        interpretation: "Search analysis unavailable",
        detectedLocations: [],
        suggestedCareTypes: [],
        confidence: 0.1
      };
    }
  }
};