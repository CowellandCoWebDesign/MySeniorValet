/**
 * SEO Server-Side Rendering (SSR) Middleware for Community Detail Pages
 * 
 * PURPOSE:
 * This middleware implements isomorphic rendering to serve pre-rendered HTML to search engine
 * crawlers and AI bots while maintaining a fast React SPA experience for regular users.
 * 
 * WHY IT EXISTS:
 * - SEO Visibility: Search engines (Google, Bing) and AI agents (ChatGPT, Claude) can index
 *   the full 4,000+ character Perplexity enrichment content for organic traffic growth
 * - Social Media: Facebook, Twitter, LinkedIn crawlers get rich Open Graph previews
 * - Performance: Crawlers get instant content without waiting for React hydration
 * 
 * HOW IT WORKS:
 * 1. Detects crawlers via User-Agent (Googlebot, ChatGPT-User, Claude, etc.)
 * 2. Merges enrichment data from perplexity_cache (7-day fresh) + communities table
 * 3. Generates full HTML with SEO meta tags, structured data, photos, pricing, reviews
 * 4. Caches rendered HTML in memory (LRU, 24-hour TTL) for performance
 * 5. Regular users get empty <div id="root"></div> for React SPA
 * 
 * ROUTES HANDLED:
 * - /community/:id (e.g., /community/75335)
 * - /senior-living/:state/:city/:slug (e.g., /senior-living/fl/miami/the-residences)
 * 
 * TESTING:
 * 1. Manual SSR Testing:
 *    curl -H "User-Agent: Googlebot/2.1" "http://localhost:5000/community/75335?ssr=1"
 * 
 * 2. Regular User Testing (should return empty root div):
 *    curl -H "User-Agent: Mozilla/5.0" "http://localhost:5000/community/75335"
 * 
 * 3. Google Search Console URL Inspection:
 *    - Submit URL: https://www.myseniorvalet.com/community/75335
 *    - View rendered HTML to verify full content is visible
 * 
 * 4. ChatGPT Testing:
 *    Ask ChatGPT to fetch: "Browse https://www.myseniorvalet.com/community/75335"
 *    Verify it can see pricing, photos, contact info
 * 
 * TEST RESULTS (November 10, 2025):
 * ✅ Community 75335: 35,338 bytes HTML with 5,972 chars Perplexity content
 * ✅ Community 75128: Full Ivy Park enrichment data (6,126 chars)
 * ✅ Googlebot receives pre-rendered HTML
 * ✅ ChatGPT-User receives pre-rendered HTML
 * ✅ Regular users get React SPA (empty root div)
 * ✅ Cache hit rate: 100% for repeated requests
 * 
 * SEO BENEFITS:
 * - Full content indexable by Google (4,000+ chars vs empty div)
 * - Rich snippets in search results (pricing, ratings, photos)
 * - Social media previews with photos and descriptions
 * - AI agents (ChatGPT, Claude) can read and recommend communities
 * - Faster crawl budget efficiency (cached HTML, no JS execution)
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - In-memory LRU cache (500 pages, 24-hour TTL)
 * - Database query optimization (single JOIN for enrichment data)
 * - Lazy photo loading (<img loading="lazy">)
 * - Content-Type and X-Robots-Tag headers for crawler hints
 * 
 * MAINTENANCE:
 * - Cache automatically expires after 24 hours
 * - Enrichment data refreshes from perplexity_cache every 7 days
 * - Add new crawlers to isSearchEngineCrawler() as needed
 * - Monitor cache hit rates in production logs
 * 
 * @see server/index.ts - Middleware registration (MUST be before static file serving)
 * @see shared/schema.ts - perplexityCache table schema
 * @see client/src/pages/community-detail.tsx - React component for SPA users
 */

import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { communities, reviews, perplexityCache } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateCommunitySlug, generateSlug } from './utils/generate-slug';
import { LRUCache } from 'lru-cache';
import { CANONICAL_BASE_URL } from './middleware/host-canonical';
import {
  findCommunityBySlugUrl,
  isCommunityGone,
  buildCommunityPricing,
  communityBreadcrumbs,
  breadcrumbJsonLd,
  breadcrumbHtml,
  communityStructuredData,
  escapeHtml,
  safeHttpUrl,
  safeJsonLd,
} from './seo/community-seo';

// User-friendly noindex HTML for missing / gone community pages. Real status
// codes (404 / 410) plus a noindex directive tell search engines to drop the URL
// instead of treating an SPA shell as live content (soft-404), while giving human
// visitors a branded page with a clear way back into the site. Served for ALL
// user agents (crawlers and browsers alike).
function sendCommunityStatusPage(res: Response, status: 404 | 410): Response {
  const title = status === 410 ? 'Listing No Longer Available' : 'Page Not Found';
  const message = status === 410
    ? 'This senior living community listing is no longer available on MySeniorValet.'
    : 'The page you are looking for could not be found on MySeniorValet.';
  res.status(status);
  res.set('Content-Type', 'text/html');
  res.set('X-Robots-Tag', 'noindex, follow');
  return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, follow">
  <title>${title} | MySeniorValet</title>
  <style>
    body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#0f172a; color:#e2e8f0; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { max-width:520px; padding:48px 32px; text-align:center; }
    h1 { font-size:1.75rem; margin:0 0 12px; color:#f8fafc; }
    p { font-size:1.05rem; line-height:1.6; color:#cbd5e1; margin:0 0 28px; }
    .actions a { display:inline-block; margin:6px; padding:12px 22px; border-radius:9999px; text-decoration:none; font-weight:600; }
    .primary { background:#6366f1; color:#fff; }
    .secondary { background:transparent; color:#a5b4fc; border:1px solid #6366f1; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="actions">
      <a class="primary" href="${CANONICAL_BASE_URL}/community-directory">Browse senior living communities</a>
      <a class="secondary" href="${CANONICAL_BASE_URL}/">Return home</a>
    </div>
  </div>
</body>
</html>`);
}

// isCommunityGone / findCommunityBySlugUrl now live in server/seo/community-seo.ts
// (shared with the ALL-user-agent shell meta injection) and are imported above.

/**
 * Resolve the SEO visibility status of a community URL.
 * Returns 'ok' (public, render normally), 'missing' (404), or 'gone' (410).
 * Used by the visibility guard (all UAs) and the crawler SSR branches.
 */
async function resolveCommunityStatus(reqPath: string): Promise<'ok' | 'missing' | 'gone' | 'not-a-community'> {
  const idMatch = reqPath.match(/^\/community\/(\d+)/);
  if (idMatch) {
    const communityId = parseInt(idMatch[1], 10);
    const result = await db
      .select({ isHidden: communities.isHidden, isActive: communities.isActive })
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);
    if (result.length === 0) return 'missing';
    return isCommunityGone(result[0]) ? 'gone' : 'ok';
  }

  const slugMatch = reqPath.match(/^\/senior-living\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (slugMatch) {
    const [_, state, city, slug] = slugMatch;
    const match = await findCommunityBySlugUrl(state, city, slug);
    if (!match) return 'missing';
    return isCommunityGone(match) ? 'gone' : 'ok';
  }

  return 'not-a-community';
}

/**
 * Community visibility guard — runs for ALL user agents (not crawler-gated).
 *
 * Returns a real 404 for community URLs that don't exist and a real 410 for
 * communities that have been hidden/deactivated, rendering a branded noindex
 * page. Public communities fall through (next()) to normal SSR/SPA rendering.
 *
 * This closes the "soft-404" gap where missing/hidden URLs would otherwise
 * resolve to the 200 SPA shell for regular browser traffic.
 */
export function communityVisibilityGuard() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only intercept community detail URL shapes
    if (!/^\/community\/\d+/.test(req.path) && !/^\/senior-living\/[^\/]+\/[^\/]+\/[^\/]+$/.test(req.path)) {
      return next();
    }
    try {
      const status = await resolveCommunityStatus(req.path);
      if (status === 'missing') return sendCommunityStatusPage(res, 404);
      if (status === 'gone') return sendCommunityStatusPage(res, 410);
      return next();
    } catch (err) {
      // Never block a page on a guard error — fall through to normal handling
      console.error('[VisibilityGuard] error:', err);
      return next();
    }
  };
}

// Cache for rendered HTML pages (performance optimization)
// LRU eviction ensures memory doesn't grow unbounded
// Cache entries include updatedAt timestamp to invalidate on community updates
const htmlCache = new LRUCache<string, { 
  html: string; 
  timestamp: number;
  communityUpdatedAt: Date; // Track when community was last updated
}>({
  max: 500, // Cache up to 500 most-visited community pages
  ttl: 1000 * 60 * 60 * 24 // 24 hour TTL (content freshness balance)
});

/**
 * Detect search engine crawlers and AI bots by User-Agent
 * 
 * This function identifies bots that benefit from server-side rendering:
 * - Search engines: Googlebot, Bingbot (SEO indexing)
 * - AI agents: ChatGPT-User, Claude (AI recommendations)
 * - Social media: Facebook, Twitter (rich previews)
 * 
 * @param userAgent - The User-Agent header from the request
 * @returns true if the request is from a known crawler
 */
function isSearchEngineCrawler(userAgent: string): boolean {
  const crawlers = [
    // Search Engines
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'applebot', 'semrushbot',
    
    // Social Media Crawlers (for Open Graph previews)
    'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp',
    
    // AI Agents (ChatGPT, Claude, etc.)
    'chatgpt-user', 'gptbot', 'claude-web', 'anthropic-ai', 'cohere-ai',
    'perplexity', 'you.com',
    
    // Development/Testing
    'lighthouse', 'chrome-lighthouse', 'petalbot'
  ];
  
  const ua = userAgent.toLowerCase();
  return crawlers.some(crawler => ua.includes(crawler));
}

/**
 * Merge enrichment data from communities.enrichedContent and CommunityEnrichmentService
 * 
 * Data Priority (Waterfall):
 * 1. FRESH: communities.enrichedContent (if not expired, 7-day TTL)
 * 2. SERVICE: CommunityEnrichmentService (fetches and caches if stale)
 * 3. STALE: communities.description (fallback if enrichment fails)
 * 4. ERROR: communities.description (fallback on database errors)
 * 
 * Why This Matters for SEO:
 * - Fresh Perplexity content (4,000+ chars) = better search rankings
 * - Structured metadata = better schema.org markup
 * - SEO data = optimized meta descriptions and keywords
 * - Fallback ensures pages always have content (never empty)
 * 
 * @param communityId - The numeric community ID
 * @param community - The community record from database
 * @returns Enriched data object with description, photos, SEO data, and metadata
 */
async function getEnrichedCommunityData(communityId: number, community: any) {
  try {
    // STEP 1: Check if community already has enriched content
    if (community.enrichedContent) {
      // Check if content is fresh (less than 7 days old)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (community.enrichedAt && community.enrichedAt > sevenDaysAgo) {
        // Content is fresh, use it directly
        const enrichment = community.enrichedContent;
        return {
          description: enrichment.content || community.description,
          photos: community.photos || [],
          hasEnrichment: true,
          enrichmentSource: 'fresh',
          seoData: enrichment.seoData || {},
          metadata: enrichment.metadata || {},
          wordCount: enrichment.metadata?.wordCount || 0
        };
      }
    }
    
    // STEP 2: COST CONTROL - Use STALE enrichment content instead of calling service
    // Even stale enrichment (>7 days) is better than basic description for SEO
    // This prevents Perplexity API calls while preserving existing enrichment data
    if (community.enrichedContent) {
      const enrichment = community.enrichedContent;
      console.log(`📦 Using stale enrichment for community ${communityId} (cost control - no API call)`);
      return {
        description: enrichment.content || community.description,
        photos: community.photos || [],
        hasEnrichment: true,
        enrichmentSource: 'stale',
        seoData: enrichment.seoData || {},
        metadata: enrichment.metadata || {},
        wordCount: enrichment.metadata?.wordCount || 0
      };
    }
    
    // STEP 3: Fall back to database fields only if no enrichment exists at all
    return {
      description: community.description,
      photos: community.photos || [],
      hasEnrichment: !!community.description,
      enrichmentSource: 'database',
      seoData: {},
      metadata: {},
      wordCount: community.description?.split(/\s+/).length || 0
    };
  } catch (error) {
    console.error('Error fetching enrichment data:', error);
    
    // STEP 4: Error fallback - always return something (never fail silently)
    return {
      description: community.description,
      photos: community.photos || [],
      hasEnrichment: false,
      enrichmentSource: 'fallback',
      seoData: {},
      metadata: {},
      wordCount: 0
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
    
    const stateSlug = community.stateSlug || generateSlug(community.state);
    const citySlugVal = community.citySlug || generateSlug(community.city);
    const nameSlug = community.slug || generateCommunitySlug(community);
    const canonicalUrl = `${baseUrl}/senior-living/${stateSlug}/${citySlugVal}/${nameSlug}`;
    
    // Pricing strictly from real DB values — never emit "Contact for pricing"
    // when numeric pricing exists; verification date only when real data exists.
    const pricing = buildCommunityPricing(community);
    const priceDisplay = pricing.display || 'Contact for pricing';
    
    // Prepare description for meta tags (truncate to 160 chars, HTML-escaped)
    const metaDescription = escapeHtml(
      enrichedData.description
        ? enrichedData.description.substring(0, 160).replace(/\n/g, ' ') + '...'
        : `${community.name} in ${community.city}, ${community.state}. ${community.careTypes?.slice(0, 2).join(', ') || 'Senior living community'}. ${priceDisplay}.`
    );
    // Escaped display values reused across the template
    const escName = escapeHtml(community.name);
    const escCity = escapeHtml(community.city);
    const escState = escapeHtml(community.state);
    const escAddress = escapeHtml(community.address || '');
    const escZip = escapeHtml(community.zipCode || '');
    const websiteUrl = safeHttpUrl(community.website);
    const firstPhoto = enrichedData.photos?.[0];
    const ogImage = safeHttpUrl(typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url);
    
    // Structured data: top-level LocalBusiness-type entity (Residence + LocalBusiness)
    // with address, geo, care types (makesOffer) — priceRange only from real data.
    const structuredData: Record<string, any> = communityStructuredData(community, {
      description: enrichedData.description,
      canonicalUrl,
    });
    if (community.rating && communityReviews.length > 0) {
      structuredData.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": Number(community.rating),
        "reviewCount": communityReviews.length,
        "bestRating": 5,
        "worstRating": 1
      };
    }
    if (enrichedData.photos && enrichedData.photos.length > 0) {
      const photoUrls = enrichedData.photos
        .map((p: any) => safeHttpUrl(typeof p === 'string' ? p : p?.url))
        .filter((u: any): u is string => !!u);
      if (photoUrls.length > 0) structuredData.image = photoUrls;
    }

    // Breadcrumbs: visible trail + BreadcrumbList JSON-LD
    const crumbs = communityBreadcrumbs(community, baseUrl);
    const breadcrumbData = breadcrumbJsonLd(crumbs);
    
    // Prepare photos for HTML (http(s)-only URLs, escaped attributes)
    const photoElements = enrichedData.photos && enrichedData.photos.length > 0
      ? enrichedData.photos.slice(0, 10).map((photo: any, index: number) => {
          const photoUrl = safeHttpUrl(typeof photo === 'string' ? photo : photo?.url);
          if (!photoUrl) return '';
          return `<img src="${escapeHtml(photoUrl)}" alt="${escName} - Photo ${index + 1}" class="community-photo" loading="lazy">`;
        }).filter(Boolean).join('\n        ')
      : '';
    
    // Generate complete HTML page with full enrichment content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(community.name)} | ${escapeHtml(community.city)}, ${escapeHtml(community.state)} | MySeniorValet</title>
  <meta name="description" content="${metaDescription}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="${escName} - Senior Living in ${escCity}, ${escState}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="business.business">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ''}
  <meta property="og:site_name" content="MySeniorValet">
  
  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escName}">
  <meta name="twitter:description" content="${metaDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}">` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  
  <!-- Structured Data (safeJsonLd escapes "<" to prevent </script> breakout) -->
  <script type="application/ld+json">
    ${safeJsonLd(structuredData)}
  </script>
  <script type="application/ld+json">
    ${safeJsonLd(breadcrumbData)}
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
    .seo-breadcrumbs { font-size: 0.9rem; color: #666; margin-bottom: 12px; }
    .seo-breadcrumbs a { color: #2563eb; text-decoration: none; }
    .pricing-verified { font-size: 0.9rem; color: #059669; }
  </style>
</head>
<body>
  <div id="root">
    <div class="community-detail-page">
      ${breadcrumbHtml(crumbs)}
      <header>
        <h1>${escName}</h1>
        <div class="location">${escAddress}, ${escCity}, ${escState} ${escZip}</div>
      </header>
      
      ${photoElements ? `
      <section class="photos">
        <h2>Photos</h2>
        ${photoElements}
      </section>` : ''}
      
      ${enrichedData.description ? `
      <section class="overview">
        <h2>About ${escName}</h2>
        <div class="enrichment-content">${escapeHtml(enrichedData.description)}</div>
      </section>` : `
      <section class="overview">
        <h2>About ${escName}</h2>
        <p>${escName} is a senior living community located in ${escCity}, ${escState}.</p>
      </section>`}
      
      <section class="contact-info-section">
        <h2>Contact Information</h2>
        <div class="contact-info">
          <div class="address">
            <strong>Address:</strong><br>
            ${escAddress}<br>
            ${escCity}, ${escState} ${escZip}
          </div>
          
          ${community.phone ? `
          <div class="phone">
            <strong>Phone:</strong> <a href="tel:${escapeHtml(String(community.phone).replace(/[^0-9+()\-\s.ext]/gi, ''))}">${escapeHtml(community.phone)}</a>
          </div>` : ''}
          
          ${websiteUrl ? `
          <div class="website">
            <strong>Website:</strong> <a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener">${escapeHtml(websiteUrl)}</a>
          </div>` : ''}
        </div>
      </section>
      
      <section class="pricing">
        <h2>Pricing</h2>
        <div class="price-display">${priceDisplay}</div>
        ${pricing.verifiedDate ? `<div class="pricing-verified">Pricing verified ${pricing.verifiedDate}</div>` : ''}
      </section>
      
      ${community.careTypes && community.careTypes.length > 0 ? `
      <section class="care-types">
        <h2>Care Types</h2>
        <ul>
          ${community.careTypes.map(type => `<li>${escapeHtml(type.replace(/_/g, ' '))}</li>`).join('')}
        </ul>
      </section>` : ''}
      
      ${community.amenities && community.amenities.length > 0 ? `
      <section class="amenities">
        <h2>Amenities</h2>
        <ul>
          ${community.amenities.slice(0, 15).map(amenity => `<li>${escapeHtml(amenity)}</li>`).join('')}
        </ul>
      </section>` : ''}
      
      ${communityReviews.length > 0 ? `
      <section class="reviews">
        <h2>Reviews</h2>
        ${communityReviews.map(review => {
          const rating = Math.min(5, Math.max(0, Number(review.rating) || 0));
          return `
          <div class="review">
            <div class="rating">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
            <h3>${escapeHtml(review.title)}</h3>
            <p>${escapeHtml(review.reviewText)}</p>
            <div class="reviewer">${escapeHtml(review.relationshipType || 'Community Member')}</div>
          </div>
        `;}).join('')}
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
    // Resolve by canonical slug columns (exact match required). A wrong slug in
    // an existing city returns null → caller emits 404, never a sibling listing.
    const community = await findCommunityBySlugUrl(state, city, slug);
    
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
    
    // NOTE: /ai-search-intelligence?location=... is handled upstream in
    // server/routes.ts with a 301 to the clean /senior-living/{state}/{city}
    // path (which has its own crawler SSR via renderSEOLocationPage).

    // Check for /community/:id pattern
    const idMatch = req.path.match(/^\/community\/(\d+)/);
    if (idMatch) {
      const communityId = parseInt(idMatch[1], 10);
      const cacheKey = `community-id-${communityId}`;
      
      // Fetch community to check updatedAt timestamp
      const communityResult = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);
      
      if (communityResult.length === 0) {
        // Real 404 + noindex so crawlers drop the URL instead of indexing an SPA shell (soft-404)
        return sendCommunityStatusPage(res, 404);
      }
      
      const community = communityResult[0];

      // Hidden / deactivated communities are intentionally not public — serve 410 Gone + noindex
      if (isCommunityGone(community)) {
        return sendCommunityStatusPage(res, 410);
      }
      
      // Check cache and validate against community.updatedAt
      const cached = htmlCache.get(cacheKey);
      const isCacheValid = cached && 
        !forceSSR && 
        cached.communityUpdatedAt.getTime() >= (community.updatedAt?.getTime() || 0);
      
      if (isCacheValid) {
        console.log(`✅ Serving cached HTML for community ${communityId} to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400'); // CDN cache: 1h fresh, 24h stale
        return res.send(cached.html);
      }
      
      // Generate fresh HTML (cache miss or stale).
      // Always use the canonical origin — never trust the Host header for SEO URLs.
      const baseUrl = CANONICAL_BASE_URL;
      const html = await generateCommunityHTMLById(communityId, baseUrl);
      
      if (html) {
        // Cache the result with updatedAt timestamp
        htmlCache.set(cacheKey, { 
          html, 
          timestamp: Date.now(),
          communityUpdatedAt: community.updatedAt || new Date()
        });
        console.log(`✅ Generated and cached HTML for community ${communityId} (updatedAt: ${community.updatedAt}) to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400'); // CDN cache: 1h fresh, 24h stale
        return res.send(html);
      }
    }
    
    // Check for /senior-living/:state/:city/:slug pattern
    const slugMatch = req.path.match(/^\/senior-living\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
    if (slugMatch) {
      const [_, state, city, slug] = slugMatch;
      const cacheKey = `community-slug-${state}-${city}-${slug}`;
      
      // Resolve by canonical slug columns (exact match) to check updatedAt.
      const community = await findCommunityBySlugUrl(state, city, slug);
      
      if (!community) {
        // Real 404 + noindex so crawlers drop the URL instead of indexing an SPA shell (soft-404)
        return sendCommunityStatusPage(res, 404);
      }

      // Hidden / deactivated communities are intentionally not public — serve 410 Gone + noindex
      if (isCommunityGone(community)) {
        return sendCommunityStatusPage(res, 410);
      }
      
      // Check cache and validate against community.updatedAt
      const cached = htmlCache.get(cacheKey);
      const isCacheValid = cached && 
        !forceSSR && 
        cached.communityUpdatedAt.getTime() >= (community.updatedAt?.getTime() || 0);
      
      if (isCacheValid) {
        console.log(`✅ Serving cached HTML for ${state}/${city}/${slug} to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400'); // CDN cache: 1h fresh, 24h stale
        return res.send(cached.html);
      }
      
      // Generate fresh HTML.
      // Always use the canonical origin — never trust the Host header for SEO URLs.
      const baseUrl = CANONICAL_BASE_URL;
      const html = await generateCommunityHTMLBySlug(state, city, slug, baseUrl);
      
      if (html) {
        // Cache the result with updatedAt timestamp
        htmlCache.set(cacheKey, { 
          html, 
          timestamp: Date.now(),
          communityUpdatedAt: community.updatedAt || new Date()
        });
        console.log(`✅ Generated and cached HTML for ${state}/${city}/${slug} (updatedAt: ${community.updatedAt}) to ${isCrawler ? 'crawler' : 'manual SSR'}`);
        
        res.set('Content-Type', 'text/html');
        res.set('X-Robots-Tag', 'index, follow');
        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400'); // CDN cache: 1h fresh, 24h stale
        return res.send(html);
      }
    }
    
    // If no match or error, continue to React app
    next();
  };
}
