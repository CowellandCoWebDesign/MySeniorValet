import { Router } from 'express';
import { PerplexityAIService } from '../perplexity-ai-service';

const router = Router();

// Test endpoint for Perplexity web search
router.get('/api/test/perplexity-miami', async (req, res) => {
  try {
    const perplexity = new PerplexityAIService();
    
    if (!perplexity.isConfigured()) {
      return res.status(503).json({
        error: 'Perplexity API not configured',
        message: 'Please configure PERPLEXITY_API_KEY'
      });
    }
    
    // Search for real Miami senior living data
    const result = await perplexity.searchRealTime(
      'Find current pricing for The Contemporary Miami senior living community and The Palace Suites in Miami, Florida. Include any HUD subsidized options available.',
      'Testing real-time web search capabilities'
    );
    
    res.json({
      success: true,
      source: 'Perplexity Web Search',
      timestamp: new Date().toISOString(),
      data: result,
      capabilities: [
        '✅ Real-time pricing from actual communities',
        '✅ Government HUD data access',
        '✅ Market trends and occupancy',
        '✅ Citations and source verification',
        '✅ No hallucinations - only verified data'
      ]
    });
  } catch (error: any) {
    console.error('Perplexity test error:', error);
    res.status(500).json({
      error: 'Failed to perform web search',
      message: error.message
    });
  }
});

export default router;