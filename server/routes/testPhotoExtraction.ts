import { Router } from 'express';
import { MultiAIPhotoExtractor } from '../services/multi-ai-photo-extractor';
import { simplifiedPerplexityService } from '../simplified-perplexity-service';
import { playwrightPhotoScraper } from '../services/playwright-photo-scraper';

const router = Router();

/**
 * 🔥 Test the SUPER-POWERED Multi-AI + Playwright Photo Extraction
 */
router.post('/api/test-photo-extraction', async (req, res) => {
  const { communityName, websiteUrl } = req.body;
  
  if (!communityName) {
    return res.status(400).json({ 
      error: 'Please provide a communityName to test' 
    });
  }
  
  console.log('\n\n🔥🔥🔥 SUPER-POWERED PHOTO EXTRACTION TEST 🔥🔥🔥');
  console.log(`Testing: ${communityName}`);
  console.log(`Website: ${websiteUrl || 'Will be auto-discovered'}`);
  console.log('='.repeat(60));
  
  try {
    const results: any = {
      communityName,
      timestamp: new Date().toISOString(),
      steps: []
    };
    
    // Step 1: Use Perplexity to find the community and website
    console.log('\n📍 STEP 1: Perplexity searching for community...');
    const perplexityResult = await simplifiedPerplexityService.getCommunityIntelligence(communityName);
    
    results.steps.push({
      step: 'Perplexity Search',
      found: perplexityResult.found,
      website: perplexityResult.officialWebsite,
      sources: perplexityResult.sources?.length || 0
    });
    
    const targetWebsite = websiteUrl || perplexityResult.officialWebsite;
    
    if (!targetWebsite) {
      console.log('⚠️ No website found to scrape');
      results.error = 'No website URL found for this community';
      return res.json(results);
    }
    
    // Step 2: Test Playwright direct scraping (optional)
    let playwrightPhotos: any[] = [];
    try {
      console.log(`\n🌐 STEP 2: Playwright scraping ${targetWebsite}...`);
      playwrightPhotos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
        targetWebsite,
        communityName
      );
      
      results.steps.push({
        step: 'Playwright Scraping',
        photosFound: playwrightPhotos.length,
        photos: playwrightPhotos.slice(0, 5).map(p => ({
          url: p.url,
          context: p.context,
          isGallery: p.isGallery
        }))
      });
    } catch (playwrightError: any) {
      console.log(`  ⚠️ Playwright unavailable: ${playwrightError.message}`);
      results.steps.push({
        step: 'Playwright Scraping',
        status: 'skipped',
        reason: 'Browser dependencies not available in Replit environment'
      });
    }
    
    // Step 3: Run the full Multi-AI extraction
    console.log('\n🤖 STEP 3: Running full Multi-AI + Playwright extraction...');
    const multiAIResult = await MultiAIPhotoExtractor.findAuthenticPhotos(
      communityName,
      JSON.stringify(perplexityResult), // Pass Perplexity content
      targetWebsite
    );
    
    results.steps.push({
      step: 'Multi-AI Verification',
      authenticPhotos: multiAIResult.authenticPhotos.length,
      rejectedPhotos: multiAIResult.rejectedPhotos.length,
      summary: multiAIResult.summary
    });
    
    // Final results
    results.finalResults = {
      totalAuthenticPhotos: multiAIResult.authenticPhotos.length,
      topPhotos: multiAIResult.authenticPhotos.slice(0, 10).map(p => ({
        url: p.url,
        confidence: p.confidence,
        source: p.source
      }))
    };
    
    console.log('\n✅ TEST COMPLETE!');
    console.log(`Found ${results.finalResults.totalAuthenticPhotos} authentic photos`);
    console.log('='.repeat(60));
    
    // Clean up browser if it was used
    try {
      await playwrightPhotoScraper.closeBrowser();
    } catch (e) {
      // Browser might not have been initialized
    }
    
    res.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Quick test with a known community
 */
router.get('/api/test-photo-extraction/quick', async (req, res) => {
  // Test with a well-known community
  const testCommunity = 'Sunrise Senior Living Manhattan';
  
  console.log(`\n🚀 Quick test with: ${testCommunity}`);
  
  try {
    const intelligence = await simplifiedPerplexityService.getCommunityIntelligence(testCommunity);
    
    if (intelligence.officialWebsite) {
      let photos: any[] = [];
      try {
        photos = await playwrightPhotoScraper.scrapePhotosFromWebsite(
          intelligence.officialWebsite,
          testCommunity
        );
      } catch (playwrightError: any) {
        console.log(`  ⚠️ Playwright unavailable: ${playwrightError.message}`);
      }
      
      try {
        await playwrightPhotoScraper.closeBrowser();
      } catch (e) {
        // Browser might not have been initialized
      }
      
      res.json({
        success: true,
        community: testCommunity,
        website: intelligence.officialWebsite,
        photosFound: photos.length,
        samplePhotos: photos.slice(0, 5)
      });
    } else {
      res.json({
        success: false,
        message: 'No website found for test community'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Quick test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;