
import { Router } from 'express';
import { MultiAIPhotoExtractor } from '../services/multi-ai-photo-extractor';

const router = Router();

// Service intelligence endpoint for testing photo extraction
router.post('/api/service-intelligence', async (req, res) => {
  try {
    const { serviceName, city, state, serviceType } = req.body;
    
    if (!serviceName || !city || !state || !serviceType) {
      return res.status(400).json({
        error: 'Missing required fields: serviceName, city, state, serviceType'
      });
    }

    console.log(`🔍 Service Intelligence Request: ${serviceName} in ${city}, ${state} (${serviceType})`);

    // Use the multi-AI photo extractor to find photos for this service
    const photoExtractionResult = await MultiAIPhotoExtractor.findAuthenticServicePhotos(
      serviceName,
      serviceType,
      city,
      state,
      `${serviceName} ${city} ${state} ${serviceType} photos`, // Basic content
      undefined, // No specific website URL
      [] // No citations
    );
    
    const photos = photoExtractionResult?.authenticPhotos || [];

    // Extract contact information (simplified for testing)
    const contactInfo = {
      phone: null,
      email: null,
      website: null,
      address: `${city}, ${state}`,
      hours: 'Contact for hours'
    };

    // Basic citations
    const citations = [
      `Search results for ${serviceName}`,
      `Business directory listings`,
      `Local service directories`
    ];

    const response = {
      success: true,
      serviceName,
      location: `${city}, ${state}`,
      serviceType,
      photos: photos || [],
      contactInfo,
      citations,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Found ${photos?.length || 0} photos for ${serviceName}`);
    
    res.json(response);

  } catch (error) {
    console.error('Service intelligence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract service intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
