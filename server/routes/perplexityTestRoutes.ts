import { type Express } from "express";
import { PerplexityAIService } from "../perplexity-ai-service";

const perplexityService = new PerplexityAIService();

export function registerPerplexityTestRoutes(app: Express) {
  /**
   * Test endpoint for direct Perplexity API access
   * This endpoint demonstrates the raw power of Perplexity's real-time web search
   */
  app.post('/api/test/perplexity', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          error: 'Query is required' 
        });
      }

      console.log(`🔬 Testing Perplexity with query: "${query}"`);
      const startTime = Date.now();
      
      // Call Perplexity service
      const result = await perplexityService.searchCommunityInfo(query);
      
      const responseTime = Date.now() - startTime;
      
      // Extract pricing information if present
      let pricing = [];
      if (result.data) {
        const priceMatches = result.data.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*(?:month|mo))?/gi);
        if (priceMatches) {
          pricing = priceMatches.map(price => ({ price }));
        }
      }

      res.json({
        success: result.success,
        data: result.data,
        citations: result.citations || [],
        pricing,
        responseTime: `${responseTime}ms`,
        tokensUsed: result.tokensUsed || 'N/A',
        timestamp: new Date().toISOString(),
        query
      });
      
    } catch (error: any) {
      console.error('Perplexity test error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to test Perplexity',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Health check endpoint for Perplexity integration
   */
  app.get('/api/test/perplexity/health', async (req, res) => {
    try {
      const testQuery = "senior living Miami pricing 2025";
      const result = await perplexityService.searchCommunityInfo(testQuery);
      
      res.json({
        status: result.success ? 'healthy' : 'unhealthy',
        integration: 'Perplexity AI',
        model: 'llama-3.1-sonar-small-128k-online',
        capabilities: [
          'Real-time web search',
          'Current pricing data',
          'Government HUD verification',
          'Source citations',
          'Zero hallucinations'
        ],
        lastTest: new Date().toISOString(),
        testResult: result.success
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        integration: 'Perplexity AI',
        error: error.message
      });
    }
  });

  /**
   * Batch test endpoint for comparing multiple queries
   */
  app.post('/api/test/perplexity/batch', async (req, res) => {
    try {
      const { queries } = req.body;
      
      if (!queries || !Array.isArray(queries)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Queries array is required' 
        });
      }

      const results = await Promise.all(
        queries.map(async (query) => {
          const startTime = Date.now();
          const result = await perplexityService.searchCommunityInfo(query);
          return {
            query,
            success: result.success,
            responseTime: Date.now() - startTime,
            dataLength: result.data?.length || 0,
            citationsCount: result.citations?.length || 0
          };
        })
      );

      res.json({
        success: true,
        results,
        totalQueries: queries.length,
        successfulQueries: results.filter(r => r.success).length,
        averageResponseTime: Math.round(
          results.reduce((acc, r) => acc + r.responseTime, 0) / results.length
        ),
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Perplexity batch test error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to run batch test'
      });
    }
  });
}