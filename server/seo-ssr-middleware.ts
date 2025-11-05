import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { communities, reviews } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { generateCommunitySlug } from './utils/generate-slug';

// Detect if request is from a search engine crawler
function isSearchEngineCrawler(userAgent: string): boolean {
  const crawlers = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'applebot', 'semrushbot', 'lighthouse', 'chrome-lighthouse'
  ];
  
  const ua = userAgent.toLowerCase();
  return crawlers.some(crawler => ua.includes(crawler));
}

// Generate server-side rendered HTML for community pages
export async function generateCommunityHTML(
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
    
    // Get reviews
    const communityReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.communityId, community.id))
      .limit(5);
    
    const canonicalUrl = `${baseUrl}/senior-living/${state}/${city}/${slug}`;
    
    // Generate price display
    const priceDisplay = community.monthlyRent 
      ? `$${community.monthlyRent.toLocaleString()}/month`
      : community.priceRange?.min 
      ? `$${community.priceRange.min.toLocaleString()}-$${community.priceRange.max.toLocaleString()}/month`
      : 'Contact for pricing';
    
    // Generate structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SeniorLivingCommunity",
      "name": community.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": community.address,
        "addressLocality": community.city,
        "addressRegion": community.state,
        "postalCode": community.zipCode,
        "addressCountry": community.country || "US"
      },
      "telephone": community.phone,
      "url": community.website,
      "geo": community.latitude && community.longitude ? {
        "@type": "GeoCoordinates",
        "latitude": community.latitude,
        "longitude": community.longitude
      } : undefined,
      "priceRange": priceDisplay,
      "aggregateRating": community.averageRating ? {
        "@type": "AggregateRating",
        "ratingValue": community.averageRating,
        "reviewCount": communityReviews.length
      } : undefined
    };
    
    // Generate complete HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${community.name} | Senior Living in ${community.city}, ${community.state} | MySeniorValet</title>
  <meta name="description" content="${community.name} in ${community.city}, ${community.state}. ${community.careTypes?.slice(0, 2).join(', ') || 'Senior living community'}. ${priceDisplay}. View photos, amenities, reviews, and schedule tours.">
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="${community.name} - Senior Living in ${community.city}, ${community.state}">
  <meta property="og:description" content="${community.description || `${community.name} offers quality senior living in ${community.city}. ${priceDisplay}.`}">
  <meta property="og:type" content="business.business">
  <meta property="og:url" content="${canonicalUrl}">
  ${community.photos?.[0] ? `<meta property="og:image" content="${community.photos[0]}">` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(structuredData)}
  </script>
  
  <!-- Preload React app -->
  <link rel="preload" href="/src/main.tsx" as="script" crossorigin>
</head>
<body>
  <div id="root">
    <div class="community-detail-page">
      <header>
        <h1>${community.name}</h1>
        <div class="location">${community.city}, ${community.state} ${community.zipCode}</div>
      </header>
      
      <section class="overview">
        <h2>About ${community.name}</h2>
        <p>${community.description || `${community.name} is a senior living community located in ${community.city}, ${community.state}.`}</p>
        
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
        ${community.hudSection8 ? '<div class="badge">HUD Section 8 Accepted</div>' : ''}
        ${community.medicaid ? '<div class="badge">Medicaid Accepted</div>' : ''}
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
            <p>${review.content}</p>
            <div class="reviewer">${review.reviewerName || 'Anonymous'}</div>
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
        reviews: communityReviews
      }
    }).replace(/</g, '\\u003c')};
  </script>
  
  <!-- React will hydrate this content -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    
    return html;
  } catch (error) {
    console.error('Error generating community HTML:', error);
    return null;
  }
}

// Middleware to serve SSR pages for crawlers
export function seoSSRMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check if this is a community SEO page request
    const match = req.path.match(/^\/senior-living\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
    
    if (!match) {
      return next();
    }
    
    const [_, state, city, slug] = match;
    const userAgent = req.headers['user-agent'] || '';
    
    // Only SSR for crawlers
    if (!isSearchEngineCrawler(userAgent) && !req.query.ssr) {
      return next();
    }
    
    // Generate SSR HTML
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const html = await generateCommunityHTML(state, city, slug, baseUrl);
    
    if (html) {
      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // If community not found, continue to regular React app
      next();
    }
  };
}