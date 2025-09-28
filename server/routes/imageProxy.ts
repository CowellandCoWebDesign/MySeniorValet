import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Image proxy endpoint to bypass CORS restrictions
router.get('/api/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Decode the URL in case it's double-encoded
    let decodedUrl = decodeURIComponent(imageUrl);

    // Basic URL validation
    let validUrl: URL;
    try {
      validUrl = new URL(decodedUrl);
    } catch (error) {
      console.log(`❌ Invalid URL format: ${decodedUrl}`);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Security checks - block internal/private IPs
    const hostname = validUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      return res.status(403).json({ error: 'Access to internal URLs not allowed' });
    }

    console.log(`🔍 Attempting to proxy image from: ${decodedUrl}`);

    // Fetch the image with better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`❌ Image proxy failed for ${decodedUrl}: ${response.status} ${response.statusText}`);

      // Return a transparent 1x1 pixel PNG for failed images
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300', // Cache failed attempts for 5 minutes
        'Access-Control-Allow-Origin': '*'
      });
      return res.send(transparentPixel);
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // If it's not an image, return transparent pixel
    if (!contentType.startsWith('image/')) {
      console.log(`⚠️ Non-image content type: ${contentType} for ${decodedUrl}`);
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      });
      return res.send(transparentPixel);
    }

    // Stream the image
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    // Get the image buffer and send it
    const imageBuffer = await response.arrayBuffer();
    res.send(Buffer.from(imageBuffer));

    console.log(`✅ Successfully proxied image from ${validUrl.hostname}`);

  } catch (error: any) {
    console.error(`❌ Image proxy error for ${imageUrl}:`, error.message);

    // Return transparent pixel for any error
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'
    });
    res.send(transparentPixel);
  }
});

export default router;