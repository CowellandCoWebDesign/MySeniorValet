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

    // Filter out obviously corrupted URLs before processing
    if (decodedUrl.includes('QwQwQwQw') || 
        decodedUrl.includes('kQz8kQz8') ||
        decodedUrl.includes('QwQwQwQwQwQwQwQw') ||
        decodedUrl.length > 2000 ||
        decodedUrl.includes('...[TRUNCATED]')) {
      console.log(`❌ Corrupted/synthetic URL detected and blocked: ${decodedUrl.substring(0, 100)}...`);
      return res.status(400).json({ error: 'Invalid or corrupted URL' });
    }

    // Basic URL validation
    let validUrl: URL;
    try {
      validUrl = new URL(decodedUrl);
    } catch (error) {
      console.log(`❌ Invalid URL format: ${decodedUrl.substring(0, 100)}`);
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

    // Fetch the image with enhanced retry mechanism
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout per attempt

      try {
        // Use different user agents for different attempts
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        response = await fetch(decodedUrl, {
          headers: {
            'User-Agent': userAgents[attempts - 1],
            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site'
          },
          signal: controller.signal,
          redirect: 'follow'
        });

        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Image proxy success on attempt ${attempts} for ${validUrl.hostname}`);
          break; // Success, exit retry loop
        } else if (attempts === maxAttempts) {
          console.log(`❌ Image proxy failed after ${maxAttempts} attempts for ${decodedUrl}: ${response.status} ${response.statusText}`);
        } else {
          console.log(`⚠️ Attempt ${attempts} failed (${response.status}), retrying...`);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (attempts === maxAttempts) {
          console.log(`❌ Image proxy fetch error after ${maxAttempts} attempts for ${decodedUrl}: ${fetchError.message}`);
          throw fetchError;
        } else {
          console.log(`⚠️ Attempt ${attempts} error (${fetchError.message}), retrying...`);
        }
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!response || !response.ok) {
      console.log(`❌ Image proxy failed for ${decodedUrl}: ${response?.status || 'No response'} ${response?.statusText || ''}`);

      // Return a small placeholder image instead of transparent pixel
      const placeholderSvg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
          Image temporarily unavailable
        </text>
      </svg>`;
      
      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache failed attempts for 5 minutes
        'Access-Control-Allow-Origin': '*'
      });
      return res.send(placeholderSvg);
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
    const url = (req.query.url as string) || 'unknown';
    console.error(`❌ Image proxy error for ${url}:`, error.message);

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