/**
 * City Verification Routes
 * Endpoints for managing systematic city-by-city verification
 */

import { Router } from 'express';
import { cityVerificationQueue } from '../services/city-verification-queue';
import { enhancedCityVerification } from '../services/enhanced-city-verification';

const router = Router();

/**
 * Get current verification progress
 */
router.get('/api/verification/progress', async (req, res) => {
  try {
    const progress = await cityVerificationQueue.getProgress();
    res.json({
      success: true,
      progress,
      message: `${progress.percentageComplete}% of US communities verified`
    });
  } catch (error: any) {
    console.error('Error getting verification progress:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get priority cities for verification
 */
router.get('/api/verification/priority-cities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cities = await cityVerificationQueue.getPriorityCities(limit);
    
    res.json({
      success: true,
      cities,
      count: cities.length
    });
  } catch (error: any) {
    console.error('Error getting priority cities:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify a specific city
 */
router.post('/api/verification/verify-city', async (req, res) => {
  try {
    const { city, state } = req.body;
    
    if (!city || !state) {
      return res.status(400).json({
        success: false,
        error: 'City and state are required'
      });
    }
    
    // Start verification in background (don't wait)
    cityVerificationQueue.verifyCity(city, state).then(result => {
      console.log(`✅ Background verification completed for ${city}, ${state}:`, result);
    }).catch(error => {
      console.error(`❌ Background verification failed for ${city}, ${state}:`, error);
    });
    
    res.json({
      success: true,
      message: `Verification started for ${city}, ${state}. This will run in the background.`
    });
  } catch (error: any) {
    console.error('Error starting city verification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Process next city in queue
 */
router.post('/api/verification/process-next', async (req, res) => {
  try {
    // Start processing in background
    cityVerificationQueue.processNextCity().then(result => {
      if (result) {
        console.log(`✅ Processed next city:`, result);
      } else {
        console.log(`ℹ️ No cities to process or already processing`);
      }
    }).catch(error => {
      console.error(`❌ Error processing next city:`, error);
    });
    
    res.json({
      success: true,
      message: 'Started processing next priority city in background'
    });
  } catch (error: any) {
    console.error('Error processing next city:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Start automated verification (processes multiple cities)
 */
router.post('/api/verification/start-automated', async (req, res) => {
  try {
    const citiesPerDay = parseInt(req.body.citiesPerDay as string) || 5;
    
    // Start automated verification in background
    cityVerificationQueue.startAutomatedVerification(citiesPerDay).then(() => {
      console.log(`✅ Automated verification completed for today`);
    }).catch(error => {
      console.error(`❌ Automated verification error:`, error);
    });
    
    res.json({
      success: true,
      message: `Started automated verification for ${citiesPerDay} cities. This will run in the background.`
    });
  } catch (error: any) {
    console.error('Error starting automated verification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Enhanced bulk city search - find ALL communities at once
 */
router.post('/api/perplexity/city-bulk-search', async (req, res) => {
  try {
    const { city, state } = req.body;
    
    if (!city || !state) {
      return res.status(400).json({
        success: false,
        error: 'City and state are required'
      });
    }
    
    console.log(`🔍 Starting enhanced bulk search for ${city}, ${state}`);
    
    // Use enhanced verification service
    const result = await enhancedCityVerification.verifyEntireCity(city, state);
    
    res.json({
      success: result.success,
      message: result.message,
      discoveredCount: result.discoveredCount,
      stats: result.stats,
      duration: result.duration
    });
  } catch (error: any) {
    console.error('Enhanced bulk search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Admin endpoint to trigger immediate verification of high-priority cities
 */
router.post('/api/verification/verify-priority-batch', async (req, res) => {
  try {
    const cities = await cityVerificationQueue.getPriorityCities(3);
    
    if (cities.length === 0) {
      return res.json({
        success: true,
        message: 'No cities need verification'
      });
    }
    
    // Process each city in sequence (background)
    const processSequentially = async () => {
      for (const city of cities) {
        try {
          console.log(`🔍 Processing ${city.city}, ${city.state}...`);
          const result = await cityVerificationQueue.verifyCity(city.city, city.state);
          console.log(`✅ Completed ${city.city}, ${city.state}:`, {
            verified: result.successfulVerifications,
            failed: result.failedVerifications
          });
          // Wait 30 seconds between cities to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 30000));
        } catch (error) {
          console.error(`❌ Failed to verify ${city.city}, ${city.state}:`, error);
        }
      }
    };
    
    processSequentially().catch(console.error);
    
    res.json({
      success: true,
      message: `Started verification for ${cities.length} priority cities`,
      cities: cities.map(c => `${c.city}, ${c.state}`)
    });
  } catch (error: any) {
    console.error('Error in batch verification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;