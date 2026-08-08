/**
 * Community shell SEO injection — pure-builder tests.
 *
 * Verifies that injecting community fragments into the SPA shell yields
 * exactly one authoritative tag per SEO property (title, description,
 * canonical, robots, og:*, twitter:*), community-specific JSON-LD
 * (LocalBusiness-type entity + BreadcrumbList) with no leftover homepage
 * schema, real-data-only pricing, and XSS-safe output.
 */
import {
  buildShellFragments,
  injectFragmentsIntoShell,
  buildCommunityPricing,
  communityStructuredData,
  safeJsonLd,
  safeHttpUrl,
  escapeHtml,
} from '../server/seo/community-seo-builders';

const BASE = 'https://www.myseniorvalet.com';

const shell = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>MySeniorValet - Homepage Title</title>
    <meta name="description" content="Generic homepage description" />
    <meta name="keywords" content="senior living" />
    <meta name="author" content="Someone" />
    <meta name="robots" content="index, follow, max-snippet:-1" />
    <meta name="googlebot" content="index, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Homepage OG" />
    <meta property="og:description" content="Homepage OG desc" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Homepage Twitter" />
    <script type="application/ld+json">
    { "@type": "WebSite", "name": "MySeniorValet" }
    </script>
    <script type="application/ld+json">
    { "@type": "LocalBusiness", "name": "MySeniorValet" }
    </script>
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function makeCommunity(overrides: Record<string, any> = {}): any {
  return {
    id: 123,
    name: 'Sunny Pines',
    city: 'Springfield',
    state: 'IL',
    stateSlug: 'il',
    citySlug: 'springfield',
    slug: 'sunny-pines',
    address: '100 Main St',
    zipCode: '62701',
    country: 'US',
    phone: '(555) 123-4567',
    careTypes: ['assisted_living', 'memory_care'],
    photos: ['https://example.com/photo1.jpg'],
    rentPerMonth: '3835',
    priceRange: null,
    pricingLastUpdated: new Date('2026-01-15T00:00:00Z'),
    description: 'A lovely community.',
    enrichedContent: null,
    latitude: '39.78',
    longitude: '-89.65',
    updatedAt: new Date('2026-06-01T00:00:00Z'),
    isHidden: false,
    isActive: true,
    website: 'https://sunnypines.example.com',
    ...overrides,
  };
}

const count = (html: string, re: RegExp) => (html.match(re) || []).length;

describe('injectFragmentsIntoShell', () => {
  const c = makeCommunity();
  const html = injectFragmentsIntoShell(shell, buildShellFragments(c, BASE));

  it('yields exactly one title, description, canonical, robots', () => {
    expect(count(html, /<title>/g)).toBe(1);
    expect(html).toContain('<title>Sunny Pines | Springfield, IL | MySeniorValet</title>');
    expect(count(html, /<meta[^>]*name="description"/g)).toBe(1);
    expect(count(html, /<link[^>]*rel="canonical"/g)).toBe(1);
    expect(html).toContain(`href="${BASE}/senior-living/il/springfield/sunny-pines"`);
    expect(count(html, /<meta[^>]*name="robots"/g)).toBe(1);
    expect(count(html, /<meta[^>]*name="googlebot"/g)).toBe(0);
  });

  it('yields exactly one og:title / og:description / twitter:title set', () => {
    expect(count(html, /property="og:title"/g)).toBe(1);
    expect(count(html, /property="og:description"/g)).toBe(1);
    expect(count(html, /name="twitter:title"|property="twitter:title"/g)).toBe(1);
    expect(html).not.toContain('Homepage OG');
    expect(html).not.toContain('Generic homepage description');
  });

  it('removes homepage JSON-LD and injects LocalBusiness + BreadcrumbList', () => {
    const scripts = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g) || [];
    expect(scripts).toHaveLength(2);
    expect(html).not.toContain('"@type": "WebSite"');
    const parsed = scripts.map(s => JSON.parse(s.replace(/<script[^>]*>|<\/script>/g, '')));
    const business = parsed.find(p => Array.isArray(p['@type']) && p['@type'].includes('LocalBusiness'));
    const breadcrumb = parsed.find(p => p['@type'] === 'BreadcrumbList');
    expect(business).toBeTruthy();
    expect(business.name).toBe('Sunny Pines');
    expect(business.address.streetAddress).toBe('100 Main St');
    expect(business.geo['@type']).toBe('GeoCoordinates');
    expect(business.priceRange).toBe('$3,835+');
    expect(breadcrumb.itemListElement).toHaveLength(4);
  });

  it('injects pre-hydration body with single H1, address, care types, pricing + verified date', () => {
    expect(count(html, /<h1>/g)).toBe(1);
    expect(html).toContain('<h1>Sunny Pines</h1>');
    expect(html).toContain('100 Main St, Springfield, IL 62701');
    expect(html).toContain('Care types: Assisted Living, Memory Care');
    expect(html).toContain('Pricing: $3,835/month'); // "$3" must NOT be eaten as a capture ref
    expect(html).toContain('verified January 15, 2026');
    expect(html).toContain('aria-label="Breadcrumb"');
  });

  it('all injected head tags (except title) carry data-ssr-meta so the client can replace them', () => {
    const injectedHead = html.split('</head>')[0];
    const metaTags = injectedHead.match(/<meta[^>]*>/g) || [];
    const seoMetas = metaTags.filter(t => /name="(description|robots|twitter:)|property="(og:|twitter:)/.test(t));
    for (const tag of seoMetas) expect(tag).toContain('data-ssr-meta');
    expect(injectedHead).toMatch(/<link data-ssr-meta="community" rel="canonical"/);
  });

  it('escapes malicious community data (no stored XSS)', () => {
    const evil = makeCommunity({
      name: '<script>alert(1)</script>',
      address: '"><img src=x onerror=alert(1)>',
      description: '</script><script>alert(2)</script>',
      photos: ['javascript:alert(3)'],
    });
    const evilHtml = injectFragmentsIntoShell(shell, buildShellFragments(evil, BASE));
    expect(evilHtml).not.toContain('<script>alert(1)</script>');
    // The raw payload may appear inside JSON-LD *string data* (harmless — "<"
    // is escaped there); it must never appear as actual markup.
    expect(evilHtml).not.toMatch(/<img src=x onerror/);
    expect(evilHtml).not.toContain('javascript:alert(3)');
    // JSON-LD must not allow </script> breakout
    const ld = evilHtml.match(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/)![1];
    expect(ld).not.toContain('</script>');
  });
});

describe('buildCommunityPricing (real data only)', () => {
  it('uses numeric rent and never "Contact for pricing" beside it', () => {
    const p = buildCommunityPricing(makeCommunity());
    expect(p.display).toBe('$3,835/month');
    expect(p.verifiedDate).toBe('January 15, 2026');
  });

  it('uses priceRange min/max when rent is missing', () => {
    const p = buildCommunityPricing(makeCommunity({ rentPerMonth: null, priceRange: { min: 2835, max: 4725 } }));
    expect(p.display).toBe('$2,835 - $4,725/month');
    expect(p.schemaRange).toBe('$2,835-$4,725');
  });

  it('returns no pricing (and no verified date) when no real data exists', () => {
    const p = buildCommunityPricing(makeCommunity({ rentPerMonth: null, priceRange: null }));
    expect(p.display).toBeNull();
    expect(p.schemaRange).toBeUndefined();
    expect(p.verifiedDate).toBeNull();
  });

  it('omits priceRange from structured data when no real pricing', () => {
    const sd = communityStructuredData(makeCommunity({ rentPerMonth: null, priceRange: null }), BASE);
    expect(sd.priceRange).toBeUndefined();
  });
});

describe('safety helpers', () => {
  it('safeHttpUrl allows only http(s)', () => {
    expect(safeHttpUrl('https://a.com/x')).toBe('https://a.com/x');
    expect(safeHttpUrl('http://a.com')).toBe('http://a.com');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('data:text/html,x')).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
  });

  it('safeJsonLd escapes < to prevent </script> breakout', () => {
    expect(safeJsonLd({ a: '</script><script>x' })).not.toContain('</script>');
  });

  it('escapeHtml escapes all metacharacters', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });
});
