import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { communities, reviews, perplexityCache } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateCommunitySlug } from './utils/generate-slug';
import { LRUCache } from 'lru-cache';

// Cache for rendered HTML pages (performance optimization)
const htmlCache = new LRUCache<string, { html: string; timestamp: number }>({
  max: 500, // Cache up to 500 pages
  ttl: 1000 * 60 * 60 * 24 // 24 hour TTL
});

// Detect if request is from a search engine crawler or AI bot
function isSearchEngineCrawler(userAgent: string): boolean {
  const crawlers = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'applebot', 'semrushbot', 'lighthouse', 'chrome-lighthouse',
    'chatgpt-user', 'gptbot', 'claude-web', 'anthropic-ai', 'cohere-ai',
    'perplexity', 'you.com', 'petalbot'
  ];
  
  const ua = userAgent.toLowerCase();
  return crawlers.some(crawler => ua.includes(crawler));
}

// Merge enrichment data from cache and database
async function getEnrichedCommunityData(communityId: number, community: any) {
  try {
    // Check perplexity_cache for fresh enrichment data
    const cacheKey = `community_${communityId}`;
    const cachedData = await db
      .select()
      .from(perplexityCache)
      .where(eq(perplexityCache.communityId, cacheKey))
      .limit(1);
    
    if (cachedData.length > 0) {
      const cache = cachedData[0];
      const now = new Date();
      
      // Use cached data if not expired
      if (cache.expiresAt > now) {
        return {
          description: cache.rawPerplexityContent || community.description,
          photos: cache.photos && cache.photos.length > 0 ? cache.photos : community.photos,
          hasEnrichment: true,
          enrichmentSource: 'cache'
        };
      }
    }
    
    // Fall back to database fields
    return {
      description: community.description,
      photos: community.photos,
      hasEnrichment: !!community.description,
      enrichmentSource: 'database'
    };
  } catch (error) {
    console.error('Error fetching enrichment data:', error);
    return {
      description: community.description,
      photos: community.photos,
      hasEnrichment: false,
      enrichmentSource: 'fallback'
    };
  }
}

// Generate server-side rendered HTML for community pages (by ID)
export async function generateCommunityHTMLById(
  communityId: number,
  baseUrl: string
): Promise<string | null> {
  try {
    // Fetch community from database
    const communityResult = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
    
    if (communityResult.length === 0) return null;
    const community = communityResult[0];
    
    // Get enriched data (merge cache + database)
    const enrichedData = await getEnrichedCommunityData(communityId, community);
    
    // Get reviews
    const communityReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.communityId, communityId))
      .limit(5);
    
    const canonicalUrl = `${baseUrl}/community/${communityId}`;
    
    // Generate price display
    const priceDisplay = community.rentPerMonth 
      ? `$${Number(community.rentPerMonth).toLocaleString()}/month`
      : community.priceRange 
      ? `Contact for pricing`
      : 'Contact for pricing';
    
    // Prepare description for meta tags (truncate to 160 chars)
    const metaDescription = enrichedData.description 
      ? enrichedData.description.substring(0, 160).replace(/\n/g, ' ').replace(/"/g, '&quot;') + '...'
      : `${community.name} in ${community.city}, ${community.state}. ${community.careTypes?.slice(0, 2).join(', ') || 'Senior living community'}. ${priceDisplay}.`;
    
    // Generate structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SeniorLivingCommunity",
      "name": community.name,
      "description": enrichedData.description || `${community.name} is a senior living community in ${community.city}, ${community.state}`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": community.address,
        "addressLocality": community.city,
        "addressRegion": community.state,
        "postalCode": community.zipCode,
        "addressCountry": community.country || "US"
      },
      "telephone": community.phone || undefined,
      "url": community.website || undefined,
      "geo": community.latitude && community.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": community.latitude,
        "longitude": community.longitude
      } : undefined,
      "priceRange": priceDisplay,
      "aggregateRating": community.rating && communityReviews.length > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": Number(community.rating),
        "reviewCount": communityReviews.length,
        "bestRating": 5,
        "worstRating": 1
      } : undefined,
      "image": enrichedData.photos && enrichedData.photos.length > 0 ? enrichedData.photos : undefined
    };
    
    // Prepare photos for HTML
    const photoElements = enrichedData.photos && enrichedData.photos.length > 0
      ? enrichedData.photos.slice(0, 10).map((photo: any, index: number) => {
          const photoUrl = typeof photo === 'string' ? photo : photo.url;
          return `<img src="${photoUrl}" alt="${community.name} - Photo ${index + 1}" class="community-photo" loading="lazy">`;
        }).join('\n        ')
      : '';
    
    // Generate complete HTML page with full enrichment content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${community.name} | ${community.city}, ${community.state} | MySeniorValet</title>
  <meta name="description" content="${metaDescription}">
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="${community.name} - Senior Living in ${community.city}, ${community.state}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="business.business">
  <meta property="og:url" content="${canonicalUrl}">
  ${enrichedData.photos?.[0] ? `<meta property="og:image" content="${typeof enrichedData.photos[0] === 'string' ? enrichedData.photos[0] : enrichedData.photos[0].url}">` : ''}
  <meta property="og:site_name" content="MySeniorValet">
  
  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${community.name}">
  <meta name="twitter:description" content="${metaDescription}">
  ${enrichedData.photos?.[0] ? `<meta name="twitter:image" content="${typeof enrichedData.photos[0] === 'string' ? enrichedData.photos[0] : enrichedData.photos[0].url}">` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
  </script>
  
  <!-- Preload React app -->
  <link rel="preload" href="/src/main.tsx" as="script" crossorigin>
  
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
    .community-detail-page { max-width: 1200px; margin: 0 auto; }
    header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
    h1 { margin: 0; font-size: 2rem; }
    h2 { margin-top: 30px; font-size: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .location { color: #666; margin-top: 10px; }
    .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .price-display { font-size: 1.5rem; font-weight: bold; color: #2563eb; margin: 10px 0; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 5px 10px; border-radius: 4px; margin: 5px 5px 5px 0; }
    ul { list-style: disc; padding-left: 20px; }
    .review { border: 1px solid #eee; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .rating { color: #fbbf24; font-size: 1.2rem; }
    .reviewer { color: #666; font-size: 0.9rem; margin-top: 10px; }
    .enrichment-content { white-space: pre-wrap; line-height: 1.8; }
    .community-photo { max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div id="root">
    <div class="community-detail-page">
      <header>
        <h1>${community.name}</h1>
        <div class="location">${community.address}, ${community.city}, ${community.state} ${community.zipCode}</div>
      </header>
      
      ${photoElements ? `
      <section class="photos">
        <h2>Photos</h2>
        ${photoElements}
      </section>` : ''}
      
      ${enrichedData.description ? `
      <section class="overview">
        <h2>About ${community.name}</h2>
        <div class="enrichment-content">${enrichedData.description}</div>
      </section>` : `
      <section class="overview">
        <h2>About ${community.name}</h2>
        <p>${community.name} is a senior living community located in ${community.city}, ${community.state}.</p>
      </section>`}
      
      <section class="contact-info-section">
        <h2>Contact Information</h2>
        <div class="contact-info">
          <div class="address">
            <strong>Address:</strong><br>
            ${community.address}<br>
            ${community.city}, ${community.state} ${community.zipCode}
          </div>
          
          ${community.phone ? `
          <div class="phone">
            <strong>Phone:</strong> <a href="tel:${community.phone}">${community.phone}</a>
          </div>` : ''}
          
          ${community.website ? `
          <div class="website">
            <strong>Website:</strong> <a href="${community.website}" target="_blank" rel="noopener">${community.website}</a>
          </div>` : ''}
        </div>
      </section>
      
      <section class="pricing">
        <h2>Pricing</h2>
        <div class="price-display">${priceDisplay}</div>
      </section>
      
      ${community.careTypes && community.careTypes.length > 0 ? `
      <section class="care-types">
        <h2>Care Types</h2>
        <ul>
          ${community.careTypes.map(type => `<li>${type.replace(/_/g, ' ')}</li>`).join('')}
        </ul>
      </section>` : ''}
      
      ${community.amenities && community.amenities.length > 0 ? `
      <section class="amenities">
        <h2>Amenities</h2>
        <ul>
          ${community.amenities.slice(0, 15).map(amenity => `<li>${amenity}</li>`).join('')}
        </ul>
      </section>` : ''}
      
      ${communityReviews.length > 0 ? `
      <section class="reviews">
        <h2>Reviews</h2>
        ${communityReviews.map(review => `
          <div class="review">
            <div class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <h3>${review.title}</h3>
            <p>${review.reviewText}</p>
            <div class="reviewer">${review.relationshipType || 'Community Member'}</div>
          </div>
        `).join('')}
      </section>` : ''}
    </div>
  </div>
  
  <!-- Preload community data for React hydration -->
  <script>
    window.__PRELOADED_STATE__ = ${JSON.stringify({
      community: {
        ...community,
        description: enrichedData.description,
        photos: enrichedData.photos,
        reviews: communityReviews,
        enrichmentSource: enrichedData.enrichmentSource
      }
    }).replace(/</g, '\\u003c')};
  </script>
  
  <!-- React will hydrate this content -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    
    return html;
  } catch (error) {
    console.error('Error generating community HTML by ID:', error);
    return null;
  }
}

// Generate server-side rendered HTML for community pages (by slug)
export async function generateCommunityHTMLBySlug(
  state: string, 
  city: string, 
  slug: string,
  baseUrl: string
): Promise<string | null> {
  try {
    // Find community
    const stateUpper = state.toUpperCase();
    const cityName = city.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');
    
    const communities_result = await db
      .select()
      .from(communities)
      .where(
        and(
          eq(communities.state, stateUpper),
          eq(communities.city, cityName)
        )
      );
    
    // Find best match based on slug
    const community = communities_result.find(c => {
      const communitySlug = generateCommunitySlug(c);
      return communitySlug === slug;
    }) || communities_result[0];
    
    if (!community) return null;
    
    // Reuse the ID-based generator
    return generateCommunityHTMLById(community.id, baseUrl);
  } catch (error) {
    console.error('Error generating community HTML by slug:', error);
    return null;
  }
}

// Middleware to serve SSR pages for crawlers
export function seoSSRMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Check if this is a crawler or manual SSR request
    const isCrawler = isSearchEngineCrawler(userAgent);
    const forceSSR = req.query.ssr === '1';
    
    if (!isCrawler && !forceSSR) {
      return next(); // Let React handle regular users
    }
    
    // Check for /community/:id pattern
    const idMatch = req.path.match(/^\/community\/(\d+)/);
    if (idMatch) {
      const communityId = parseInt(idMatch[1], 10);
      const cacheKey = `community-id-${communityId}`;
      
      // Check cache first
      const cached = htmlCache.get(cacheKey);
      if (cached && !forceSSR) {
        console.log(`✅ Serving cached HTML for community ${communityId} to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        return res.send(cached.html);
      }
      
      // Generate fresh HTML
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const html = await generateCommunityHTMLById(communityId, baseUrl);
      
      if (html) {
        // Cache the result
        htmlCache.set(cacheKey, { html, timestamp: Date.now() });
        console.log(`✅ Generated and cached HTML for community ${communityId} to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        return res.send(html);
      }
    }
    
    // Check for /senior-living/:state/:city/:slug pattern
    const slugMatch = req.path.match(/^\/senior-living\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
    if (slugMatch) {
      const [_, state, city, slug] = slugMatch;
      const cacheKey = `community-slug-${state}-${city}-${slug}`;
      
      // Check cache first
      const cached = htmlCache.get(cacheKey);
      if (cached && !forceSSR) {
        console.log(`✅ Serving cached HTML for ${state}/${city}/${slug} to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        return res.send(cached.html);
      }
      
      // Generate fresh HTML
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const html = await generateCommunityHTMLBySlug(state, city, slug, baseUrl);
      
      if (html) {
        // Cache the result
        htmlCache.set(cacheKey, { html, timestamp: Date.now() });
        console.log(`✅ Generated and cached HTML for ${state}/${city}/${slug} to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        return res.send(html);
      }
    }
    
    // If no match or error, continue to React app
    next();
  };
}
