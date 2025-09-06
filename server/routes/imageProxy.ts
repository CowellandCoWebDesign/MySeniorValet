import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Image proxy endpoint to bypass CORS restrictions
router.get('/api/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter required' });
    }
    
    // Validate URL is an image
    if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) && !imageUrl.includes('image')) {
      console.log('🔍 Fetching non-standard image URL:', imageUrl);
    }
    
    // Fetch the image from the external source
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'MySeniorValet/1.0 (compatible; photo-verification)',
        'Accept': 'image/*'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch image: ${response.status} for URL: ${imageUrl}`);
      return res.status(response.status).send('Image not found');
    }
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Set cache headers for performance (cache for 7 days)
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=604800',
      'X-Proxied-From': new URL(imageUrl).hostname
    });
    
    // Stream the image directly to the response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
    
    console.log(`✅ Successfully proxied image from ${new URL(imageUrl).hostname}`);
    
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Return a transparent 1x1 pixel as fallback
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.send(pixel);
  }
});

export default router;