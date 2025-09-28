import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Image proxy endpoint to bypass CORS restrictions
router.get('/api/image-proxy', async (req, res) => {
  try {
    let imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    // Decode URL if it's encoded
    try {
      imageUrl = decodeURIComponent(imageUrl);
    } catch (e) {
      // If decoding fails, use original URL
    }

    console.log(`🖼️ Proxying image: ${imageUrl}`);

    // Skip validation for known photo CDNs - they may not have standard extensions
    const trustedDomains = [
      'westpace.net',
      'wp-content',
      'tripadvisor.com',
      'yelpcdn.com',
      'googleusercontent.com',
      'bstatic.com',
      'trvl-media.com',
      'otstatic.com',
      'fbcdn.net',
      'cdninstagram.com',
      'cloudinary.com',
      'amazonaws.com'
    ];

    const isTrustedDomain = trustedDomains.some(domain => imageUrl.toLowerCase().includes(domain));

    // For non-trusted domains, do basic validation
    if (!isTrustedDomain) {
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(imageUrl);
      const hasImageKeyword = /image|photo|pic|img/i.test(imageUrl);

      if (!hasImageExtension && !hasImageKeyword) {
        console.log('⚠️ Skipping non-image URL:', imageUrl);
        return res.status(400).json({ error: 'URL does not appear to be an image' });
      }
    }

    // Set up AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Fetch the image from the external source
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng/image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Referer': imageUrl.includes('westpace.net') ? 'https://www.westpace.net/' : undefined
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ Failed to fetch image: ${response.status} ${response.statusText} for URL: ${imageUrl}`);

        // For 404s, return a placeholder
        if (response.status === 404) {
          const placeholder = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
          res.set('Content-Type', 'image/gif');
          return res.send(placeholder);
        }

        return res.status(response.status).json({ 
          error: `Failed to fetch image: ${response.status} ${response.statusText}` 
        });
      }

      // Get content type from response
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Validate content type is actually an image
      if (!contentType.startsWith('image/') && !contentType.includes('image')) {
        console.error(`❌ Invalid content type: ${contentType} for URL: ${imageUrl}`);
        return res.status(400).json({ error: 'Response is not an image' });
      }

      // Set cache headers for performance (cache for 1 day)
      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 1 day cache
        'X-Proxied-From': new URL(imageUrl).hostname,
        'Access-Control-Allow-Origin': '*'
      });

      // Stream the image directly to the response
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Basic validation - check if buffer looks like an image
      if (buffer.length < 100) {
        console.error(`❌ Image too small: ${buffer.length} bytes for URL: ${imageUrl}`);
        const placeholder = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set('Content-Type', 'image/gif');
        return res.send(placeholder);
      }

      res.send(buffer);
      console.log(`✅ Successfully proxied image from ${new URL(imageUrl).hostname} (${buffer.length} bytes)`);

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error(`⏰ Image fetch timeout for URL: ${imageUrl}`);
        return res.status(408).json({ error: 'Image fetch timeout' });
      }

      console.error(`❌ Image fetch error for URL: ${imageUrl}:`, fetchError.message);

      // Return a transparent placeholder
      const placeholder = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.set('Content-Type', 'image/gif');
      res.send(placeholder);
    }

  } catch (error) {
    console.error('Image proxy general error:', error);

    // Return a transparent 1x1 pixel as fallback
    const placeholder = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set({
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache'
    });
    res.send(placeholder);
  }
});

export default router;