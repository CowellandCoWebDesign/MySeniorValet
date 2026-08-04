/**
 * Community SEO wiring shared by:
 *  - the crawler SSR page (server/seo-ssr-middleware.ts), and
 *  - the ALL-user-agent shell meta injection (dev: server/vite.ts, prod: serveStatic).
 *
 * Pure, unit-testable builders live in ./community-seo-builders.ts; this module
 * adds the db-backed resolution, canonical base URL, and fragment caching.
 *
 * Guarantees for every valid community URL, regardless of user agent:
 *  - unique <title> + meta description + self-canonical + explicit robots
 *  - JSON-LD: a top-level LocalBusiness-type entity + BreadcrumbList
 *  - visible breadcrumbs + H1 + address + care types + real pricing (never invented)
 *
 * Head ownership: injection strips ALL generic homepage SEO tags (incl. the
 * static JSON-LD blocks) so the served HTML has exactly one authoritative set.
 * The client removes all [data-ssr-meta] tags at boot (client/src/main.tsx)
 * before Helmet/useSEO emit theirs — so post-mount there is again exactly one
 * tag per property and the one-self-canonical rule holds.
 */
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { LRUCache } from 'lru-cache';
import { generateCommunitySlug, generateSlug } from '../utils/generate-slug';
import { CANONICAL_BASE_URL } from '../middleware/host-canonical';
import { duplicateOfId } from '@shared/community-indexability';
import {
  type CommunityRow,
  type ShellFragments,
  type BreadcrumbItem,
  buildShellFragments,
  injectFragmentsIntoShell,
} from './community-seo-builders';
import * as builders from './community-seo-builders';

// Re-export pure helpers (bound to the canonical base URL where relevant) so
// existing consumers (seo-ssr-middleware) keep a single import site.
export const escapeHtml = builders.escapeHtml;
export const safeJsonLd = builders.safeJsonLd;
export const safeHttpUrl = builders.safeHttpUrl;
export const formatCareType = builders.formatCareType;
export const buildCommunityPricing = builders.buildCommunityPricing;
export const breadcrumbJsonLd = builders.breadcrumbJsonLd;
export const breadcrumbHtml = builders.breadcrumbHtml;
export type { CommunityRow, ShellFragments, BreadcrumbItem };

export function communityCanonicalUrl(c: CommunityRow, baseUrl: string = CANONICAL_BASE_URL): string {
  return builders.communityCanonicalUrl(c, baseUrl);
}

export function communityBreadcrumbs(c: CommunityRow, baseUrl: string = CANONICAL_BASE_URL): BreadcrumbItem[] {
  return builders.communityBreadcrumbs(c, baseUrl);
}

export function communityStructuredData(
  c: CommunityRow,
  opts: { description?: string | null; canonicalUrl?: string } = {}
) {
  return builders.communityStructuredData(c, CANONICAL_BASE_URL, opts);
}

/**
 * When the row is a marked duplicate secondary (duplicate_of:<id> flag), return
 * the PRIMARY's canonical URL so all surfaces emit rel=canonical → primary.
 * Returns null for normal rows or when the primary is missing/not public.
 */
export async function resolveDuplicateCanonicalUrl(
  c: CommunityRow,
  baseUrl: string = CANONICAL_BASE_URL,
): Promise<string | null> {
  const primaryId = duplicateOfId(c);
  if (!primaryId || primaryId === c.id) return null;
  try {
    const rows = await db
      .select()
      .from(communities)
      .where(eq(communities.id, primaryId))
      .limit(1);
    const primary = rows[0];
    if (!primary || isCommunityGone(primary)) return null;
    return builders.communityCanonicalUrl(primary, baseUrl);
  } catch (err) {
    console.error('[CommunitySEO] duplicate canonical resolution failed:', err);
    return null;
  }
}

// A community is "gone" (410) when hidden or deactivated — mirrors the sitemap rule.
export function isCommunityGone(c: { isHidden?: boolean | null; isActive?: boolean | null }): boolean {
  return c.isHidden === true || c.isActive === false;
}

/**
 * Resolve a community from /senior-living/{state}/{city}/{slug} by its CANONICAL
 * SLUG COLUMNS (exact values the sitemap & getCommunityUrl emit). Filter by the
 * always-populated citySlug, then require an EXACT composed state+slug match.
 */
export async function findCommunityBySlugUrl(
  stateSlugParam: string,
  citySlugParam: string,
  slugParam: string,
): Promise<CommunityRow | null> {
  const rows = await db
    .select()
    .from(communities)
    .where(eq(communities.citySlug, citySlugParam));
  const match = rows.find(c =>
    (c.stateSlug || generateSlug(c.state)) === stateSlugParam &&
    (c.slug || generateCommunitySlug(c)) === slugParam
  );
  return match || null;
}

/** Resolve a community row from either community URL shape, or null. */
export async function resolveCommunityByPath(reqPath: string): Promise<CommunityRow | null> {
  const idMatch = reqPath.match(/^\/community\/(\d+)/);
  if (idMatch) {
    const rows = await db
      .select()
      .from(communities)
      .where(eq(communities.id, parseInt(idMatch[1], 10)))
      .limit(1);
    return rows[0] || null;
  }
  const slugMatch = reqPath.match(/^\/senior-living\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (slugMatch) {
    return findCommunityBySlugUrl(slugMatch[1], slugMatch[2], slugMatch[3]);
  }
  return null;
}

// Cache community-specific fragments (not full pages — the dev shell changes per request).
const fragmentCache = new LRUCache<string, ShellFragments>({ max: 500, ttl: 1000 * 60 * 60 });

/**
 * For a valid, public community URL: inject community-specific head tags + a
 * pre-hydration content block into the SPA shell HTML. Returns null when the
 * path is not a community URL, the community is missing/hidden (the visibility
 * guard already 404/410s those upstream), or on any error — callers then serve
 * the untouched shell.
 */
export async function injectCommunityMetaIntoShell(reqPath: string, html: string): Promise<string | null> {
  try {
    if (!/^\/community\/\d+/.test(reqPath) && !/^\/senior-living\/[^\/]+\/[^\/]+\/[^\/]+$/.test(reqPath)) {
      return null;
    }
    const community = await resolveCommunityByPath(reqPath);
    if (!community || isCommunityGone(community)) return null;

    const cacheKey = `shell-${community.id}`;
    const updatedAtMs = community.updatedAt ? new Date(community.updatedAt).getTime() : 0;
    let fragments = fragmentCache.get(cacheKey);
    if (!fragments || fragments.updatedAtMs < updatedAtMs) {
      const dupCanonical = await resolveDuplicateCanonicalUrl(community);
      fragments = buildShellFragments(community, CANONICAL_BASE_URL, {
        canonicalUrl: dupCanonical || undefined,
      });
      fragmentCache.set(cacheKey, fragments);
    }

    return injectFragmentsIntoShell(html, fragments);
  } catch (err) {
    console.error('[CommunityShellMeta] injection failed, serving plain shell:', err);
    return null;
  }
}
