import { Router } from 'express';
import fetch, { type Response as FetchResponse } from 'node-fetch';
import { unwrapNextImageUrl } from '../utils/photo-urls';
import { isSafePublicUrl } from '../utils/url-safety';

const router = Router();

const MAX_PROXY_REDIRECTS = 5;

/**
 * SSRF-safe image fetch: redirects are handled manually and EVERY hop
 * (initial URL + each redirect Location) must pass the shared isSafePublicUrl
 * guard before it is fetched — a public host cannot redirect the proxy into
 * localhost, private ranges, link-local/cloud-metadata, or internal DNS hosts.
 * Returns { blocked: true } WITHOUT fetching when any hop is unsafe.
 */
async function fetchImageSsrfSafe(
  startUrl: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<{ blocked: boolean; response: FetchResponse | null }> {
  let currentUrl = startUrl;
  for (let hop = 0; hop <= MAX_PROXY_REDIRECTS; hop++) {
    if (!(await isSafePublicUrl(currentUrl))) {
      return { blocked: true, response: null };
    }
    const response = await fetch(currentUrl, {
      headers,
      signal: signal as any,
      redirect: 'manual', // validate every hop ourselves
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) return { blocked: false, response };
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        return { blocked: true, response: null };
      }
      continue; // next hop is re-validated at the top of the loop
    }
    return { blocked: false, response };
  }
  return { blocked: true, response: null }; // too many redirects — fail closed
}

// Image proxy endpoint to bypass CORS restrictions
router.get('/api/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Decode the URL in case it's double-encoded
    let decodedUrl = decodeURIComponent(imageUrl);

    // Decode HTML entities that some scraped URLs carry (e.g. ...?w=570&amp;h=550).
    // Left undecoded, the upstream host sees a literal "&amp;" query key and
    // returns the wrong image or a 404.
    if (decodedUrl.includes('&')) {
      decodedUrl = decodedUrl
        .replace(/&amp;/gi, '&')
        .replace(/&#0*38;/g, '&')
        .replace(/&#x0*26;/gi, '&');
    }

    // Unwrap Next.js image-optimizer wrappers (e.g. olera.care/_next/image?url=
    // <cdn.sanity.io ...>) to the underlying CDN URL. The wrapper rate-limits
    // (429) when proxied; the inner CDN URL fetches reliably. SSRF/host checks
    // below run on this final unwrapped URL.
    decodedUrl = unwrapNextImageUrl(decodedUrl);

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

    // SSRF guard (shared, see server/utils/url-safety.ts): blocks non-http(s)
    // schemes, non-standard ports, localhost/.local/.internal, loopback,
    // RFC1918, link-local/cloud-metadata, CGNAT, multicast, IPv6 equivalents,
    // and hostnames whose DNS resolves to any private address. Redirect hops
    // are re-validated inside fetchImageSsrfSafe.
    if (!(await isSafePublicUrl(decodedUrl))) {
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

        const result = await fetchImageSsrfSafe(
          decodedUrl,
          {
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
          controller.signal,
        );

        clearTimeout(timeoutId);

        if (result.blocked) {
          // A redirect hop targeted an internal/unsafe destination — fail
          // closed immediately, no retries.
          console.log(`❌ Image proxy blocked unsafe redirect target for ${decodedUrl.substring(0, 100)}`);
          return res.status(403).json({ error: 'Access to internal URLs not allowed' });
        }
        response = result.response!;

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

      // Task #352 photo honesty: return a REAL error status (not a 200
      // placeholder image) so the browser's onError fires and the carousel can
      // exclude the dead photo from display and its count.
      res.set({
        'Cache-Control': 'public, max-age=300', // Cache failed attempts for 5 minutes
        'Access-Control-Allow-Origin': '*'
      });
      return res.status(502).json({ error: 'Upstream image unavailable' });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // If it's not an image (hotlink-block HTML page etc.), surface an error so
    // the client treats it as a broken photo instead of a blank frame.
    if (!contentType.startsWith('image/')) {
      console.log(`⚠️ Non-image content type: ${contentType} for ${decodedUrl}`);
      res.set({
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      });
      return res.status(404).json({ error: 'URL did not return an image' });
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

    // Real error status so broken photos are detectable client-side.
    if (!res.headersSent) {
      res.set({
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      });
      res.status(502).json({ error: 'Image proxy failed' });
    }
  }
});

export default router;