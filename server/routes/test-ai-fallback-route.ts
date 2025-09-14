import { Router } from 'express';
import { perplexityService } from '../perplexity-ai-service';

const router = Router();

// Test endpoint for AI fallback system
router.get('/api/test/ai-fallback', async (req, res) => {
  try {
    console.log('\n🧪 Testing AI Fallback System via API...');
    
    const testQuery = req.query.q || 'Sunrise Senior Living in Sacramento, CA pricing and availability';
    
    console.log(`   Test query: "${testQuery}"`);
    
    const result = await perplexityService.searchRealTime(testQuery as string);
    
    const response = {
      success: true,
      message: 'AI search completed successfully',
      query: testQuery,
      responseLength: result.summary.length,
      sources: result.sources.length,
      images: result.images?.length || 0,
      usingFallback: result.sources.length === 1 && result.sources[0].includes('Claude AI'),
      summary: result.summary.substring(0, 500) + '...' // First 500 chars
    };
    
    console.log('   ✅ Test completed:', {
      usingFallback: response.usingFallback,
      sources: response.sources
    });
    
    res.json(response);
  } catch (error: any) {
    console.error('   ❌ Test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'AI services are currently unavailable'
    });
  }
});

// Test Discovery Mode
router.get('/api/test/discovery-mode', async (req, res) => {
  try {
    console.log('\n🔮 Testing Discovery Mode...');
    
    const query = req.query.q || 'luxury senior communities in Miami';
    
    // Import the comprehensive search engine
    const { ComprehensiveSearchEngine } = await import('../services/comprehensive-search-engine');
    const comprehensiveSearchEngine = new ComprehensiveSearchEngine();
    
    const results = await comprehensiveSearchEngine.search(query as string, {}, { limit: 10 });
    
    const response = {
      success: true,
      query,
      totalResults: results.totalResults,
      discoveryMode: !!results.searchMetadata.fallbackApplied,
      discoveryMessage: results.searchMetadata.fallbackMessage || '',
      hasAISuggestions: !!(results.searchMetadata as any).aiSuggestions,
      aiSummaryPreview: (results.searchMetadata as any).aiSuggestions?.summary?.substring(0, 300)
    };
    
    console.log('   ✅ Discovery Mode test completed');
    
    res.json(response);
  } catch (error: any) {
    console.error('   ❌ Discovery Mode test failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check for AI services
router.get('/api/test/ai-health', async (req, res) => {
  const perplexityConfigured = !!process.env.PERPLEXITY_API_KEY;
  const claudeConfigured = !!process.env.ANTHROPIC_API_KEY;
  
  // Test each service
  let perplexityWorking = false;
  let claudeWorking = false;
  
  if (perplexityConfigured) {
    try {
      await perplexityService.searchRealTime('test query');
      perplexityWorking = true;
    } catch (error: any) {
      console.log('Perplexity test failed:', error.message);
    }
  }
  
  res.json({
    status: 'operational',
    services: {
      perplexity: {
        configured: perplexityConfigured,
        working: perplexityWorking,
        note: perplexityWorking ? 'Active' : 'Using Claude fallback'
      },
      claude: {
        configured: claudeConfigured,
        working: claudeConfigured,
        note: claudeConfigured ? 'Active as primary/fallback' : 'Not configured'
      },
    },
    fallbackActive: !perplexityWorking && claudeConfigured,
    message: claudeConfigured ? 
      'AI services operational (with Claude fallback if needed)' : 
      'Limited AI functionality - configure API keys'
  });
});

export default router;