/**
 * PURE builders for community SEO output (no db / express / env imports) so
 * they are unit-testable. Wired into requests by server/seo/community-seo.ts.
 *
 * Every value interpolated into HTML is escaped via escapeHtml(); every URL
 * emitted into href/src/content is scheme-restricted via safeHttpUrl(); all
 * JSON-LD is serialized via safeJsonLd() which escapes "<" (guards </script>).
 */
import { communities } from '@shared/schema';
import { generateCommunitySlug, generateSlug } from '../utils/generate-slug';

export type CommunityRow = typeof communities.$inferSelect;

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Serialize JSON-LD safely for inline <script>: "<" → \u003c prevents </script> breakout. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Allow only http(s) URLs into href/src/content attributes; returns null otherwise. */
export function safeHttpUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

export function formatCareType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

export function communityCanonicalUrl(c: CommunityRow, baseUrl: string): string {
  const stateSlug = c.stateSlug || generateSlug(c.state);
  const citySlug = c.citySlug || generateSlug(c.city);
  const nameSlug = c.slug || generateCommunitySlug(c);
  return `${baseUrl}/senior-living/${stateSlug}/${citySlug}/${nameSlug}`;
}

export interface CommunityPricing {
  /** Human display string, ONLY from real DB values (null when no real pricing) */
  display: string | null;
  /** schema.org priceRange value — omitted from JSON-LD when no real pricing */
  schemaRange: string | undefined;
  /** "Pricing verified <date>" date string, only when real pricing + real timestamp */
  verifiedDate: string | null;
  hasRealPricing: boolean;
}

/**
 * Pricing strictly from real DB values.
 * - numeric rentPerMonth wins; never "Contact for pricing" beside numeric pricing
 * - priceRange {min,max} used when sane
 * - verification date only when real pricing exists AND pricingLastUpdated is set
 */
export function buildCommunityPricing(c: CommunityRow): CommunityPricing {
  const rent = c.rentPerMonth != null ? Number(c.rentPerMonth) : null;
  const pr = (c.priceRange || null) as { min?: number; max?: number } | null;
  let display: string | null = null;
  let schemaRange: string | undefined;

  if (rent && isFinite(rent) && rent > 0) {
    display = `$${Math.round(rent).toLocaleString()}/month`;
    schemaRange = `$${Math.round(rent).toLocaleString()}+`;
  } else if (pr && typeof pr.min === 'number' && isFinite(pr.min) && pr.min > 0) {
    if (typeof pr.max === 'number' && isFinite(pr.max) && pr.max >= pr.min) {
      display = `$${Math.round(pr.min).toLocaleString()} - $${Math.round(pr.max).toLocaleString()}/month`;
      schemaRange = `$${Math.round(pr.min).toLocaleString()}-$${Math.round(pr.max).toLocaleString()}`;
    } else {
      display = `$${Math.round(pr.min).toLocaleString()}+/month`;
      schemaRange = `$${Math.round(pr.min).toLocaleString()}+`;
    }
  }

  const verifiedDate = display && c.pricingLastUpdated
    ? new Date(c.pricingLastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return { display, schemaRange, verifiedDate, hasRealPricing: !!display };
}

export interface BreadcrumbItem { name: string; url: string }

export function communityBreadcrumbs(c: CommunityRow, baseUrl: string): BreadcrumbItem[] {
  const stateSlug = c.stateSlug || generateSlug(c.state);
  const citySlug = c.citySlug || generateSlug(c.city);
  return [
    { name: 'Home', url: `${baseUrl}/` },
    { name: 'Senior Housing Directory', url: `${baseUrl}/community-directory` },
    { name: `${c.city}, ${c.state}`, url: `${baseUrl}/senior-living/${stateSlug}/${citySlug}` },
    { name: c.name, url: communityCanonicalUrl(c, baseUrl) },
  ];
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function breadcrumbHtml(items: BreadcrumbItem[]): string {
  const links = items
    .map((item, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${escapeHtml(item.name)}</span>`
        : `<a href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a>`
    )
    .join(' &rsaquo; ');
  return `<nav aria-label="Breadcrumb" class="seo-breadcrumbs">${links}</nav>`;
}

export function firstPhotoUrl(c: CommunityRow): string | null {
  const photos = (c.photos || []) as any[];
  const first = photos[0];
  if (!first) return null;
  return safeHttpUrl(typeof first === 'string' ? first : first?.url);
}

/** Top-level LocalBusiness-type entity (Residence + LocalBusiness). */
export function communityStructuredData(
  c: CommunityRow,
  baseUrl: string,
  opts: { description?: string | null; canonicalUrl?: string } = {}
) {
  const canonicalUrl = opts.canonicalUrl || communityCanonicalUrl(c, baseUrl);
  const pricing = buildCommunityPricing(c);
  const careTypes = (c.careTypes || []).map(formatCareType);
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['Residence', 'LocalBusiness'],
    '@id': canonicalUrl,
    name: c.name,
    url: canonicalUrl,
    description:
      (opts.description || c.description || '').slice(0, 500) ||
      `${c.name} is a senior living community in ${c.city}, ${c.state}.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.address || undefined,
      addressLocality: c.city,
      addressRegion: c.state,
      postalCode: c.zipCode || undefined,
      addressCountry: c.country || 'US',
    },
  };
  if (c.phone) data.telephone = c.phone;
  if (c.latitude && c.longitude) {
    data.geo = { '@type': 'GeoCoordinates', latitude: c.latitude, longitude: c.longitude };
  }
  const photo = firstPhotoUrl(c);
  if (photo) data.image = photo;
  if (pricing.schemaRange) data.priceRange = pricing.schemaRange;
  if (careTypes.length > 0) {
    data.makesOffer = careTypes.map(t => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: t, serviceType: t },
    }));
  }
  return data;
}

export function buildCommunityMetaDescription(c: CommunityRow): string {
  const enriched = (c.enrichedContent as any)?.content as string | undefined;
  const source = enriched || c.description;
  if (source) {
    return source.replace(/\s+/g, ' ').trim().slice(0, 157) + '...';
  }
  const pricing = buildCommunityPricing(c);
  const care = (c.careTypes || []).slice(0, 2).map(formatCareType).join(', ') || 'Senior living community';
  const priceBit = pricing.display ? ` ${pricing.display}.` : '';
  return `${c.name} in ${c.city}, ${c.state}. ${care}.${priceBit} View verified details on MySeniorValet.`;
}

export interface ShellFragments {
  head: string;
  body: string;
  updatedAtMs: number;
}

export function buildShellFragments(c: CommunityRow, baseUrl: string): ShellFragments {
  const canonicalUrl = communityCanonicalUrl(c, baseUrl);
  const title = `${c.name} | ${c.city}, ${c.state} | MySeniorValet`;
  const description = buildCommunityMetaDescription(c);
  const pricing = buildCommunityPricing(c);
  const crumbs = communityBreadcrumbs(c, baseUrl);
  const structured = communityStructuredData(c, baseUrl, { description, canonicalUrl });
  const photo = firstPhotoUrl(c);
  const careTypes = (c.careTypes || []).map(formatCareType);

  const head = `
    <title>${escapeHtml(title)}</title>
    <meta data-ssr-meta="community" name="description" content="${escapeHtml(description)}" />
    <meta data-ssr-meta="community" name="robots" content="index, follow, max-image-preview:large" />
    <link data-ssr-meta="community" rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta data-ssr-meta="community" property="og:type" content="business.business" />
    <meta data-ssr-meta="community" property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta data-ssr-meta="community" property="og:title" content="${escapeHtml(title)}" />
    <meta data-ssr-meta="community" property="og:description" content="${escapeHtml(description)}" />
    ${photo ? `<meta data-ssr-meta="community" property="og:image" content="${escapeHtml(photo)}" />` : ''}
    <meta data-ssr-meta="community" property="og:site_name" content="MySeniorValet" />
    <meta data-ssr-meta="community" name="twitter:card" content="summary_large_image" />
    <meta data-ssr-meta="community" name="twitter:title" content="${escapeHtml(title)}" />
    <meta data-ssr-meta="community" name="twitter:description" content="${escapeHtml(description)}" />
    ${photo ? `<meta data-ssr-meta="community" name="twitter:image" content="${escapeHtml(photo)}" />` : ''}
    <script data-ssr-meta="community" type="application/ld+json">${safeJsonLd(structured)}</script>
    <script data-ssr-meta="community" type="application/ld+json">${safeJsonLd(breadcrumbJsonLd(crumbs))}</script>`;

  // Pre-hydration content inside #root. React's createRoot().render() replaces
  // it entirely on mount, so no duplicate H1 survives hydration.
  const addressLine = [c.address, `${c.city}, ${c.state}${c.zipCode ? ' ' + c.zipCode : ''}`, c.country && c.country !== 'US' ? c.country : null]
    .filter(Boolean)
    .map(part => escapeHtml(part!))
    .join(', ');
  const body = `<div data-ssr-shell="community">
      ${breadcrumbHtml(crumbs)}
      <h1>${escapeHtml(c.name)}</h1>
      <p>${addressLine}</p>
      ${careTypes.length > 0 ? `<p>Care types: ${careTypes.map(escapeHtml).join(', ')}</p>` : ''}
      ${pricing.display
        ? `<p>Pricing: ${escapeHtml(pricing.display)}${pricing.verifiedDate ? ` <span>(verified ${escapeHtml(pricing.verifiedDate)})</span>` : ''}</p>`
        : '<p>Pricing: Contact community for pricing</p>'}
    </div>`;

  return { head, body, updatedAtMs: c.updatedAt ? new Date(c.updatedAt).getTime() : 0 };
}

/**
 * Strip ALL generic homepage SEO from the shell head so the injected community
 * tags are the single authoritative set: title, description/keywords/robots/
 * googlebot/author metas, all OG + Twitter metas, and the homepage JSON-LD
 * blocks (WebSite / Organization / LocalBusiness). Never touches <script> src
 * modules or styles.
 */
export function stripGenericHead(html: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/[ \t]*<meta name="description"[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta name="keywords"[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta name="robots"[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta name="googlebot"[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta name="author"[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta property="og:[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta property="twitter:[^>]*\/?>\s*\n?/g, '')
    .replace(/[ \t]*<meta name="twitter:[^>]*\/?>\s*\n?/g, '')
    // Generic homepage JSON-LD blocks (community-specific ones are injected
    // AFTER stripping, so this only ever removes the shell's static schema).
    .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*\n?/g, '');
}

/**
 * Pure injection: strip generic head SEO, then insert community head fragments
 * right after <head> and pre-hydration content inside <div id="root">.
 * Uses replacer FUNCTIONS: fragment text contains "$" (pricing like "$3,835")
 * which String.replace would otherwise interpret as capture-group references.
 */
export function injectFragmentsIntoShell(html: string, fragments: ShellFragments): string {
  let out = stripGenericHead(html);
  out = out.replace('<head>', () => `<head>${fragments.head}`);
  out = out.replace(/<div id="root">\s*<\/div>/, () => `<div id="root">${fragments.body}</div>`);
  return out;
}
