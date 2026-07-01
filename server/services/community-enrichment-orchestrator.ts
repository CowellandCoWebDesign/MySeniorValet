/**
 * Community Enrichment Orchestrator — THE single enrichment pipeline.
 * ===================================================================
 * This is the ONE place community enrichment happens. Every entry point —
 * the public Refresh button (`POST /api/communities/:id/verify`), the on-view
 * trigger, the admin enrich routes, and the admin force-refresh
 * (`POST /api/admin/communities/:id/perplexity-enrich`) — calls
 * `enrichCommunityUnified()`. There are no competing/duplicate pipelines.
 *
 * Pipeline order (do not reorder — each stage depends on the previous):
 *   1. Perplexity (PRIMARY): `perplexitySearchAPI.deepEnrichCommunity` runs the
 *      Search API + sonar structured-extract + native `return_images` to get a
 *      verified description, contact/pricing fields, and multi-source photos.
 *   2. Free web scraping (BOOSTER / FALLBACK): when Perplexity returns nothing
 *      usable, `enrichCommunityFree` (DuckDuckGo + Jina) recovers a description
 *      and photos for free. Directory/official pages are also scraped to
 *      corroborate photos when no native/DB photos exist.
 *   3. Photo validation + Golden-Data filtering: stock/placeholder blocklist,
 *      senior-living-directory allowlist, name+city corroboration, SSRF-guarded
 *      fetches (via `scrapeWebsitePage`), and non-destructive persistence.
 *
 * Invariants preserved across all callers:
 *   - Golden Data Rule: only verified, real values are persisted; AI-guessed /
 *     unreachable websites and off-community photos are dropped.
 *   - `websiteProtected` is authoritative — discovery never overwrites an
 *     admin-entered website.
 *   - SSRF guard on every community-provided URL fetch.
 *   - Persisted-content cache (NO EXPIRY): once a community has a meaningful
 *     description, served DB data is reused indefinitely; enrichment only re-runs
 *     (and re-bills) when `forceRefresh` is passed (the manual Refresh button).
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  enrichCommunityFree,
  scrapeWebsitePage,
  searchDuckDuckGo,
  textReferencesCommunity,
} from "./free-enrichment-service";
import { perplexitySearchAPI, isSeniorLivingDirectoryHost } from "./perplexity-search-api";
import { cleanCitationArtifacts, isReachableWebsite } from "../utils/data-quality";
import { normalizePhotoUrls } from "../utils/photo-urls";
import { CommunityPhotoEnrichment } from "./community-photo-enrichment";
import { geocodeWithNominatim } from "../nominatim-geocoding";

// Persisted content no longer expires; this only stamps an informational
// `validUntil` / `enrichmentDataExpiry` far in the future so nothing downstream
// treats the content as stale.
const ENRICHMENT_CACHE_TTL_MS = 10 * 365 * 24 * 60 * 60 * 1000;

export interface UnifiedEnrichmentOptions {
  /** Re-run enrichment from scratch (re-bills Perplexity); the manual Refresh. */
  forceRefresh?: boolean;
  /** Optional website override (from discovery). Ignored when websiteProtected. */
  websiteUrl?: string;
}

export interface UnifiedEnrichmentResult {
  communityId: number;
  communityName: string;
  /** True when served from the 7-day cache (no enrichment/billing happened). */
  cached: boolean;
  /**
   * True when this run persisted NEW real public content (a meaningful
   * description or photos). Drives the self-heal backoff: a run that saved
   * nothing is a "no data found" outcome and widens the retry cooldown.
   */
  contentSaved: boolean;
  lastUpdated: string;
  verificationStatus: "verified";
  confidence: number;
  /** About / description text. */
  summary: string;
  officialWebsite: string;
  phone: string;
  /** Human-readable pricing string (e.g. "$3,000–$4,500/mo") or "". */
  pricingContext: string;
  /** Structured pricing from Perplexity, when available. */
  pricing: { min?: number; max?: number } | null;
  managementCompany: string | null;
  availability: string | null;
  photos: string[];
  /** Per-photo source attribution, index-aligned with `photos`. */
  photoAttributions: string[];
  careTypes: string[];
  amenities: string[];
  sources: string[];
  /** Structured enrichment blob persisted to communities.enrichmentData. */
  enrichmentData: Record<string, any>;
}

/**
 * Normalize a photo URL to a host+path key (lowercased, query/hash dropped) so
 * thumbnail variants and duplicate links collapse to one entry. Module-scoped so
 * both the enrichment pipeline and the pure forced-refresh helper share it.
 */
export function normalizeImageKey(u: string): string {
  try {
    const p = new URL(u);
    return (p.hostname + p.pathname).toLowerCase();
  } catch {
    return (u || "").toLowerCase();
  }
}

/**
 * Pure forced-refresh photo decision (extracted so it is unit-testable in
 * isolation from network/DB). A forced refresh re-derives photos: it preserves
 * confirmed-official/corroborated DB photos and merges in freshly-confirmed
 * discovery (deduped). It clears the stored set to [] ONLY when ALL hold:
 *   1. the merged confirmed set is empty,
 *   2. discovery actually completed (`discoveryRan`) — never on a transient
 *      scrape/network failure, and
 *   3. the DB previously had (unconfirmed) photos (`rawDbPhotoCount > 0`).
 * Otherwise (nothing confirmed, but discovery didn't run or nothing was stored)
 * it preserves the existing cleaned DB photos.
 */
export function decideForcedRefreshPhotos(params: {
  confirmedDbPairs: Array<{ url: string; attr: string }>;
  discoveredPhotos: string[];
  discoveredPhotoAttributions: string[];
  discoveryRan: boolean;
  rawDbPhotoCount: number;
  cleanDbPhotos: string[];
  cleanDbAttributions: string[];
}): { photos: string[]; photoAttributions: string[]; clearPhotos: boolean } {
  const orderedUrls: string[] = [];
  const attrByKey = new Map<string, string>();
  const pushPhoto = (url: string, attr: string) => {
    const k = normalizeImageKey(url);
    if (attrByKey.has(k)) return;
    attrByKey.set(k, attr);
    orderedUrls.push(url);
  };
  params.confirmedDbPairs.forEach((p) => pushPhoto(p.url, p.attr));
  params.discoveredPhotos.forEach((url, i) =>
    pushPhoto(url, params.discoveredPhotoAttributions[i] ?? ""),
  );

  let photos = orderedUrls;
  let photoAttributions = orderedUrls.map(
    (u) => attrByKey.get(normalizeImageKey(u)) ?? "",
  );
  let clearPhotos = false;

  if (photos.length === 0) {
    if (params.discoveryRan && params.rawDbPhotoCount > 0) {
      // Discovery completed and confirmed NO real photos for this community, yet
      // unconfirmed images are stored — drop them (Contact for details).
      clearPhotos = true;
    } else {
      // Transient discovery failure (or nothing stored) — never erase existing.
      photos = params.cleanDbPhotos;
      photoAttributions = params.cleanDbAttributions;
    }
  }

  return { photos, photoAttributions, clearPhotos };
}

/**
 * Run the unified enrichment pipeline for a single community and persist the
 * verified results. Returns a rich result every caller can map to its own
 * response shape.
 */
export async function enrichCommunityUnified(
  communityId: number,
  opts: UnifiedEnrichmentOptions = {},
): Promise<UnifiedEnrichmentResult> {
  const { forceRefresh = false, websiteUrl } = opts;

  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  if (!community) {
    throw new Error(`Community ${communityId} not found`);
  }

  // Admin-protected website is authoritative: ignore any request-supplied
  // override and force the stored website as the scrape target.
  let communityWebsite =
    community.websiteProtected && community.website
      ? community.website
      : websiteUrl || community.website;
  if (communityWebsite) {
    const isValidUrl =
      communityWebsite.startsWith("http://") ||
      communityWebsite.startsWith("https://") ||
      communityWebsite.startsWith("www.");
    const invalidValues = ["no", "not", "n/a", "none", "null", "undefined", ""];
    const isInvalid = invalidValues.includes(communityWebsite.toLowerCase().trim());
    if (!isValidUrl || isInvalid) {
      console.log(`⚠️ Invalid website URL detected: "${communityWebsite}" - ignoring`);
      communityWebsite = undefined as any;
    }
  }

  // ── Persisted-content cache (no expiry) ────────────────────────────────────
  // Serve persisted enrichment unless the caller forces a refresh. Content is
  // retained INDEFINITELY — there is no age check — so it survives reloads and is
  // only ever replaced when the user clicks Refresh (forceRefresh). Guard: only
  // cache-serve when the DB holds a MEANINGFUL description (>80 chars). A short/
  // empty description means a prior enrichment produced nothing useful — re-run
  // to fill the gap instead of serving "Contact for details." forever.
  const lastEnriched = community.lastSuccessfulEnrichment;
  const hasMeaningfulDescription =
    !!community.description && community.description.trim().length > 80;
  if (!forceRefresh && lastEnriched && hasMeaningfulDescription) {
    console.log(`⚡ Cache hit for "${community.name}" — serving persisted DB data (no expiry)`);
    const cachedPhotos = CommunityPhotoEnrichment.filterPhotosForCommunity(
      (community.photos || []).filter(
        (u: string) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u),
      ),
      community.name || "",
      community.city || "",
      community.website || "",
    );
    return {
      communityId,
      communityName: community.name,
      cached: true,
      contentSaved: false,
      lastUpdated: new Date(lastEnriched).toISOString(),
      verificationStatus: "verified",
      confidence: 75,
      summary: community.description || "",
      officialWebsite: community.website || "",
      phone: community.phone || "",
      pricingContext: "",
      pricing: (community.enrichmentData as any)?.pricing ?? null,
      managementCompany: (community as any).managementCompany ?? null,
      availability: (community as any).availabilityStatus ?? null,
      photos: cachedPhotos,
      photoAttributions: community.photoAttributions || [],
      careTypes: [],
      amenities: [],
      sources: community.website ? [community.website] : [],
      enrichmentData: (community.enrichmentData as any) || {},
    };
  }

  // ── Stage 1 — Perplexity (PRIMARY) ──────────────────────────────────────────
  console.log(
    `🧠 Trying Perplexity enrichment for "${community.name}" (${community.city}, ${community.state})`,
  );

  let freeEnrichment: Awaited<ReturnType<typeof enrichCommunityFree>> | null = null;
  let perplexityPhotos: Array<{ url: string; source: string; isAuthentic?: boolean }> = [];
  let perplexityDirectoryCandidates: Array<{ url: string; title: string; snippet: string }> = [];
  let structuredPricing: { min?: number; max?: number } | null = null;
  let managementCompany: string | null = null;
  let availability: string | null = null;

  try {
    const pplx = await perplexitySearchAPI.deepEnrichCommunity({
      name: community.name,
      city: community.city,
      state: community.state,
      website: communityWebsite || community.website,
    });

    if (pplx.summary && pplx.summary.length > 50) {
      perplexityPhotos = (pplx.photos || []).map((p) => ({
        url: p.url,
        source: p.source,
        isAuthentic: p.isAuthentic,
      }));
      perplexityDirectoryCandidates = pplx.photoDirectoryCandidates || [];
      structuredPricing =
        pplx.pricing && (pplx.pricing.min || pplx.pricing.max)
          ? { min: pplx.pricing.min, max: pplx.pricing.max }
          : null;
      managementCompany = pplx.managementCompany || null;
      availability = pplx.availability || null;
      console.log(
        `🧠 Perplexity enrichment: ${pplx.summary.length} chars, ${perplexityPhotos.length} photo(s), ` +
          `${perplexityDirectoryCandidates.length} directory candidate(s) for "${community.name}"`,
      );
      const pricingContext =
        structuredPricing && (structuredPricing.min || structuredPricing.max)
          ? structuredPricing.min &&
            structuredPricing.max &&
            structuredPricing.min !== structuredPricing.max
            ? `$${structuredPricing.min.toLocaleString()}–$${structuredPricing.max.toLocaleString()}/mo`
            : `$${(structuredPricing.min ?? structuredPricing.max)!.toLocaleString()}/mo`
          : undefined;
      freeEnrichment = {
        about: pplx.summary,
        website: pplx.officialWebsite || undefined,
        phone: pplx.phone || undefined,
        careTypes: [],
        amenities: [],
        pricingContext,
        photos: perplexityPhotos.map((p) => p.url),
        sourceUrl: pplx.officialWebsite || communityWebsite || community.website || undefined,
        sourceType: "web_search",
        structured: true,
      } as any;
    }
  } catch (err) {
    console.warn(
      `⚠️ Perplexity enrichment failed for "${community.name}": ${err instanceof Error ? err.message : err}`,
    );
  }

  // ── Stage 2 — Free web scraping (FALLBACK) ──────────────────────────────────
  if (!freeEnrichment) {
    console.log(`🔍 Perplexity unavailable — running DuckDuckGo/Jina enrichment for "${community.name}"`);
    freeEnrichment = await enrichCommunityFree({
      name: community.name,
      city: community.city,
      state: community.state,
      websiteUrl: communityWebsite,
      authoritativeWebsite: !!community.websiteProtected && !!communityWebsite,
    });
  }

  console.log(
    `✅ Enrichment complete for "${community.name}": sourceType=${freeEnrichment.sourceType}, structured=${freeEnrichment.structured}`,
  );

  // ── Stage 3 — Photo discovery + Golden-Data validation ──────────────────────
  const rawDbPhotoCount = (community.photos || []).filter(
    (u: string) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u),
  ).length;
  const dbPhotoPairs: Array<{ url: string; attr: string }> = (community.photos || [])
    .map((u: string, i: number) => ({
      url: u,
      attr: (community.photoAttributions || [])[i] || community.website || "",
    }))
    .filter((p: { url: string }) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(p.url))
    // Golden Data Rule: drop photos whose filename embeds a DIFFERENT facility's name.
    .filter(
      (p: { url: string }) =>
        !CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
          p.url,
          community.name || "",
          community.city || "",
          community.website || "",
        ),
    );
  const cleanDbPhotos: string[] = dbPhotoPairs.map((p) => p.url);
  const cleanDbAttributions: string[] = dbPhotoPairs.map((p) => p.attr);
  // If ownership filtering removed contaminated DB photos, persist the cleaned set
  // even when we keep using DB photos (so the bad URLs are scrubbed permanently).
  const dbPhotosWereCleaned = cleanDbPhotos.length < rawDbPhotoCount;
  let discoveredPhotos: string[] = [];
  let discoveredPhotoAttributions: string[] = [];
  // Tracks whether photo discovery actually completed (vs threw on a transient
  // network failure). Only a COMPLETED discovery that found nothing may clear
  // existing photos — a failure must never erase confirmed photos.
  let discoveryRan = false;
  const hasDbPhotos = cleanDbPhotos.length > 0;

  const samePhotoSet = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    const sa = new Set(a.map(normalizeImageKey));
    return b.every((u) => sa.has(normalizeImageKey(u)));
  };

  // Verified official host(s) for THIS community — the only hosts on which an
  // existing DB photo is treated as "confirmed official" and therefore PRESERVED
  // across a forced refresh. Built from the admin/known website and the verified
  // official site (sonar/free-scraper), never from a heuristic guess.
  const parseHost = (u?: string | null): string => {
    if (!u) return "";
    try {
      return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname
        .replace(/^www\./, "")
        .toLowerCase();
    } catch {
      return "";
    }
  };
  const officialHostSet = new Set<string>();
  for (const w of [community.website, (freeEnrichment as any)?.website, communityWebsite]) {
    const h = parseHost(w);
    if (h) officialHostSet.add(h);
  }
  const hostIsOfficial = (host: string): boolean => {
    if (!host) return false;
    for (const o of officialHostSet) {
      if (host === o || host.endsWith(`.${o}`) || o.endsWith(`.${host}`)) return true;
    }
    return false;
  };
  const isConfirmedOfficialPhoto = (p: { url: string; attr: string }): boolean =>
    hostIsOfficial(parseHost(p.url)) || hostIsOfficial(parseHost(p.attr));
  // A stored photo is "confirmed" — and therefore PRESERVED across a forced
  // refresh — when it is tied to the official host OR is name+city corroborated
  // via a recognized senior-living directory attribution (same rule as discovery).
  const isConfirmedDbPhoto = (p: { url: string; attr: string }): boolean => {
    if (isConfirmedOfficialPhoto(p)) return true;
    const attrHost = parseHost(p.attr);
    if (attrHost && isSeniorLivingDirectoryHost(attrHost)) {
      return textReferencesCommunity(
        `${p.url} ${p.attr}`,
        community.name || "",
        community.city || "",
        { requireCity: true },
      );
    }
    return false;
  };
  // Existing DB photos positively tied to this community. These are preserved even
  // when a forced refresh re-derives the rest of the set.
  const confirmedDbPairs = dbPhotoPairs.filter(isConfirmedDbPhoto);

  // Run discovery when there are no usable DB photos OR the caller forced a
  // refresh. A forced refresh MUST re-derive photos so unconfirmed/wrong stored
  // images can be replaced with positively-confirmed ones (or cleared).
  const shouldRunDiscovery = forceRefresh || !hasDbPhotos;

  // Prefer Perplexity's native return_images — reliable, multi-source, confirmed.
  if (shouldRunDiscovery && perplexityPhotos.length > 0) {
    discoveredPhotos = perplexityPhotos.map((p) => p.url);
    discoveredPhotoAttributions = perplexityPhotos.map((p) => p.source || "perplexity");
    discoveryRan = true;
    console.log(`📸 Using ${discoveredPhotos.length} Perplexity return_images photo(s) for "${community.name}"`);
  }

  if (shouldRunDiscovery && (forceRefresh || discoveredPhotos.length === 0)) {
   try {
    const scrapeUsablePage = async (
      url: string,
    ): Promise<{ images: string[]; text: string }> => {
      // Normalize bare domains and force https (SSRF guard rejects bare hosts;
      // http images would be blocked as mixed content on the https detail page).
      const normalizedUrl = (/^https?:\/\//i.test(url) ? url : `https://${url}`).replace(
        /^http:\/\//i,
        "https://",
      );
      const page = await scrapeWebsitePage(normalizedUrl);
      return {
        images: page.images
          .filter((u) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u))
          .slice(0, 15),
        text: page.text,
      };
    };

    type PhotoSource = { url: string; official: boolean; images: string[] };
    const confirmedSources: PhotoSource[] = [];

    const primaryUrl =
      (freeEnrichment as any).website ||
      freeEnrichment.sourceUrl ||
      communityWebsite ||
      community.website ||
      undefined;

    const ddg = await searchDuckDuckGo(community.name, community.city, community.state);

    // 1. Official / discovered-official site(s) — confirm name tokens only.
    const officialCandidates: string[] = [];
    if (primaryUrl) officialCandidates.push(primaryUrl);
    if (ddg.website && !officialCandidates.includes(ddg.website)) {
      officialCandidates.push(ddg.website);
    }
    for (const url of officialCandidates) {
      const { images, text } = await scrapeUsablePage(url);
      if (images.length === 0) continue;
      if (!textReferencesCommunity(`${url} ${text}`, community.name, community.city)) {
        console.log(`📸 Skipping unconfirmed official source ${url} (no community match)`);
        continue;
      }
      confirmedSources.push({ url, official: true, images });
      console.log(`📸 Official source ${url} → ${images.length} confirmed photo(s)`);
    }

    // 2. Public directory listings — Golden Data: only recognized senior-living
    //    directories, each confirmed by name + city in metadata AND body.
    const MAX_DIRECTORY_SOURCES = 4;
    let directoriesScraped = 0;
    const directoryCandidates = [...perplexityDirectoryCandidates, ...ddg.directoryListings];
    const seenListingUrls = new Set<string>();
    for (const listing of directoryCandidates) {
      if (directoriesScraped >= MAX_DIRECTORY_SOURCES) break;
      if (seenListingUrls.has(listing.url)) continue;
      seenListingUrls.add(listing.url);
      let listingHost = "";
      try {
        listingHost = new URL(listing.url).hostname.replace(/^www\./, "");
      } catch {}
      if (!isSeniorLivingDirectoryHost(listingHost)) {
        console.log(`📸 Skipping non-directory listing (untrusted source): ${listing.url}`);
        continue;
      }
      const meta = `${listing.url} ${listing.title} ${listing.snippet}`;
      if (!textReferencesCommunity(meta, community.name, community.city, { requireCity: true })) {
        console.log(`📸 Skipping directory listing (metadata mismatch): ${listing.url}`);
        continue;
      }
      directoriesScraped++;
      const { images, text } = await scrapeUsablePage(listing.url);
      if (images.length === 0) continue;
      if (
        !textReferencesCommunity(`${meta} ${text}`, community.name, community.city, {
          requireCity: true,
        })
      ) {
        console.log(`📸 Skipping directory listing (body mismatch): ${listing.url}`);
        continue;
      }
      confirmedSources.push({ url: listing.url, official: false, images });
      console.log(`📸 Directory ${listing.url} → ${images.length} confirmed photo(s)`);
    }

    // 3. Corroborate & rank across confirmed sources.
    const photoMap = new Map<
      string,
      { url: string; official: boolean; sources: string[]; order: number }
    >();
    let order = 0;
    for (const src of confirmedSources) {
      for (const img of src.images) {
        const key = normalizeImageKey(img);
        const existing = photoMap.get(key);
        if (existing) {
          if (!existing.sources.includes(src.url)) existing.sources.push(src.url);
          if (src.official) existing.official = true;
        } else {
          photoMap.set(key, { url: img, official: src.official, sources: [src.url], order: order++ });
        }
      }
    }

    const officialExists = Array.from(photoMap.values()).some((e) => e.official);
    const directorySourceCount = confirmedSources.filter((s) => !s.official).length;

    const ranked = Array.from(photoMap.values())
      .filter((e) => {
        if (e.official) return true;
        if (e.sources.length >= 2) return true;
        return !officialExists && directorySourceCount <= 1;
      })
      .sort((a, b) => {
        if (a.official !== b.official) return a.official ? -1 : 1;
        if (b.sources.length !== a.sources.length) return b.sources.length - a.sources.length;
        return a.order - b.order;
      });

    const scrapeUrls = ranked.map((e) => e.url);
    const scrapeAttrs = ranked.map((e) => {
      if (e.official) {
        const officialSrc = confirmedSources.find(
          (s) => s.official && s.images.some((i) => normalizeImageKey(i) === normalizeImageKey(e.url)),
        );
        if (officialSrc) return officialSrc.url;
      }
      return e.sources[0];
    });

    // Merge any Perplexity return_images (already in discoveredPhotos) with the
    // scrape-corroborated set, deduped — a forced refresh runs BOTH passes so
    // photos are fully re-derived from official + corroborated directory sources.
    const mergedUrls: string[] = [];
    const mergedAttrs: string[] = [];
    const seenMerge = new Set<string>();
    const pushMerged = (url: string, attr: string) => {
      const k = normalizeImageKey(url);
      if (seenMerge.has(k)) return;
      seenMerge.add(k);
      mergedUrls.push(url);
      mergedAttrs.push(attr);
    };
    discoveredPhotos.forEach((u, i) => pushMerged(u, discoveredPhotoAttributions[i] ?? ""));
    scrapeUrls.forEach((u, i) => pushMerged(u, scrapeAttrs[i] ?? ""));
    discoveredPhotos = mergedUrls.slice(0, 15);
    discoveredPhotoAttributions = mergedAttrs.slice(0, 15);

    console.log(
      `📸 Corroborated ${discoveredPhotos.length} photo(s) for "${community.name}" from ` +
        `${confirmedSources.length} confirmed source(s)` +
        (officialExists ? " (official photos present)" : ""),
    );
    discoveryRan = true;
   } catch (err) {
      console.warn(
        `⚠️ Photo discovery failed for "${community.name}" — keeping existing photos: ` +
          (err instanceof Error ? err.message : String(err)),
      );
      // A scrape failure must not undo a successful Perplexity pass.
      discoveryRan = discoveredPhotos.length > 0;
    }
  }

  // Golden Data Rule: drop discovered photos whose filename embeds a DIFFERENT
  // facility's name (keep attributions aligned).
  if (discoveredPhotos.length > 0) {
    const keptPairs = discoveredPhotos
      .map((url, i) => ({ url, attr: discoveredPhotoAttributions[i] ?? "" }))
      .filter(
        (p) =>
          !CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
            p.url,
            community.name || "",
            community.city || "",
            community.website || "",
          ),
      );
    if (keptPairs.length < discoveredPhotos.length) {
      console.log(
        `🚫 Dropped ${discoveredPhotos.length - keptPairs.length} discovered photo(s) belonging to other communities`,
      );
    }
    discoveredPhotos = keptPairs.map((p) => p.url);
    discoveredPhotoAttributions = keptPairs.map((p) => p.attr);
  }

  // Build the enrichment result photo set (shared shape for all callers).
  let photos: string[];
  let photoAttributions: string[];
  // True only when a forced refresh confirmed there are NO real photos for this
  // community while unconfirmed images are stored — those are then cleared and the
  // community falls back to "Contact for details" (Golden Data Rule).
  let clearPhotos = false;

  if (forceRefresh) {
    // Forced refresh re-derives photos: preserve confirmed-official DB photos and
    // merge in freshly-confirmed discovery; unconfirmed stored images are dropped.
    const decision = decideForcedRefreshPhotos({
      confirmedDbPairs,
      discoveredPhotos,
      discoveredPhotoAttributions,
      discoveryRan,
      rawDbPhotoCount,
      cleanDbPhotos,
      cleanDbAttributions,
    });
    photos = decision.photos;
    photoAttributions = decision.photoAttributions;
    clearPhotos = decision.clearPhotos;
    if (clearPhotos) {
      console.log(
        `🧹 Forced refresh confirmed no real photos for "${community.name}" — will clear ${rawDbPhotoCount} unconfirmed image(s)`,
      );
    }
  } else if (hasDbPhotos) {
    photos = cleanDbPhotos;
    photoAttributions = cleanDbAttributions;
  } else if (discoveredPhotos.length > 0) {
    photos = discoveredPhotos;
    photoAttributions = discoveredPhotoAttributions;
  } else {
    photos = CommunityPhotoEnrichment.filterPhotosForCommunity(
      freeEnrichment.photos || [],
      community.name || "",
      community.city || "",
      community.website || "",
    );
    photoAttributions = [];
  }

  const summary =
    freeEnrichment.about ||
    community.description ||
    "Contact for details — information for this community was not found online.";
  const officialWebsite = freeEnrichment.sourceUrl || community.website || "";
  const phone = freeEnrichment.phone || community.phone || "";
  const sources = freeEnrichment.sourceUrl ? [freeEnrichment.sourceUrl] : [];

  console.log(`📝 Unified enrichment for ${community.name}:`, {
    forceRefresh,
    sourceType: freeEnrichment.sourceType,
    hasAbout: !!freeEnrichment.about,
    photosCount: photos.length,
  });

  // ── Persist verified data (Golden Data Rule) ────────────────────────────────
  const now = new Date();
  const updates: any = {};
  let hasUpdates = false;
  // Tracks whether REAL public content (description or photos) was persisted —
  // lastSuccessfulEnrichment must only be stamped when this is true, else an
  // empty-but-successful run arms the 7-day cache and locks the About section.
  let contentWasSaved = false;

  // Website — only persist a reachable URL; respect admin protection.
  const candidateWebsite = cleanCitationArtifacts(officialWebsite);
  if (community.websiteProtected && candidateWebsite && community.website !== candidateWebsite) {
    console.log(`🔒 Keeping admin-protected website for "${community.name}": ${community.website}`);
  } else if (candidateWebsite && community.website !== candidateWebsite) {
    if (await isReachableWebsite(candidateWebsite)) {
      updates.website = candidateWebsite;
      hasUpdates = true;
      console.log(`✅ Updating website to: ${candidateWebsite}`);
    } else {
      console.log(`🚫 Skipped unreachable website for "${community.name}": ${candidateWebsite}`);
    }
  }

  // Phone.
  const candidatePhone = cleanCitationArtifacts(phone);
  if (candidatePhone && community.phone !== candidatePhone) {
    updates.phone = candidatePhone;
    hasUpdates = true;
    console.log(`✅ Updating phone to: ${candidatePhone}`);
  }

  // Description — full content (no truncation); overwrite on forceRefresh.
  const candidateDescription = cleanCitationArtifacts(summary);
  if (
    candidateDescription &&
    candidateDescription.length > 50 &&
    (!community.description || community.description.length < 50 || forceRefresh)
  ) {
    updates.description = candidateDescription;
    hasUpdates = true;
    contentWasSaved = true;
    console.log(`✅ Updating description with FULL enriched content (${candidateDescription.length} chars)`);
  }

  // Photos — NON-DESTRUCTIVE except a forced refresh that positively confirms the
  // stored images are wrong: only ever replaced with verified replacements (or
  // cleared on a forced refresh that found nothing); never wiped on the blocklist
  // alone (a false positive must not erase real photos) or on transient failures.
  if (clearPhotos) {
    // Forced refresh confirmed no photos can be tied to this community — drop the
    // unconfirmed stored images so it falls back to "Contact for details".
    updates.photos = [];
    updates.photoAttributions = [];
    updates.lastPhotoEnrichment = now;
    hasUpdates = true;
    console.log(
      `🧹 Forced refresh: clearing ${rawDbPhotoCount} unconfirmed photo(s) from "${community.name}" (Contact for details)`,
    );
  } else if (forceRefresh) {
    // Forced refresh persists the re-derived/merged set (confirmed-official DB
    // photos + freshly-confirmed discovery) whenever it differs from what's
    // stored, replacing unconfirmed images with confirmed ones. Still scrubs when
    // only off-community contamination was removed.
    const cleanedFinal = CommunityPhotoEnrichment.cleanPhotoArray(photos);
    const survivorSet = new Set(cleanedFinal);
    const cleanedAttributions = photos
      .map((url, i) => (survivorSet.has(url) ? photoAttributions[i] ?? "" : null))
      .filter((a): a is string => a !== null);
    const samePhotos = samePhotoSet(cleanedFinal, cleanDbPhotos);
    if (cleanedFinal.length > 0 && (!samePhotos || dbPhotosWereCleaned)) {
      updates.photos = cleanedFinal;
      updates.photoAttributions =
        cleanedAttributions.length === cleanedFinal.length
          ? cleanedAttributions
          : cleanedFinal.map((_, i) => cleanedAttributions[i] || "");
      updates.lastPhotoEnrichment = now;
      hasUpdates = true;
      if (!samePhotos) contentWasSaved = true;
      console.log(
        `✅ Forced refresh persisting ${cleanedFinal.length} confirmed photo(s) for "${community.name}" ` +
          `(attributions: ${Array.from(new Set(updates.photoAttributions)).join(", ")})`,
      );
    }
  } else if (hasDbPhotos && dbPhotosWereCleaned) {
    // Existing DB photos contained images belonging to OTHER communities —
    // persist the scrubbed set so the contamination is removed permanently.
    updates.photos = cleanDbPhotos;
    updates.photoAttributions = cleanDbAttributions;
    hasUpdates = true;
    console.log(
      `🧹 Scrubbing ${rawDbPhotoCount - cleanDbPhotos.length} off-community photo(s) from "${community.name}"`,
    );
  } else if (!hasDbPhotos && discoveredPhotos.length > 0) {
    const rawDiscovered = discoveredPhotos;
    const cleanedDiscovered = CommunityPhotoEnrichment.cleanPhotoArray(rawDiscovered);
    const survivorSet = new Set(cleanedDiscovered);
    const cleanedAttributions = rawDiscovered
      .map((url, i) => (survivorSet.has(url) ? discoveredPhotoAttributions[i] ?? "" : null))
      .filter((a): a is string => a !== null);

    if (cleanedDiscovered.length === 0) {
      console.log(`⚠️ All ${rawDiscovered.length} discovered photos removed as noise — skipping photo update`);
    } else {
      updates.photos = cleanedDiscovered;
      updates.photoAttributions =
        cleanedAttributions.length === cleanedDiscovered.length
          ? cleanedAttributions
          : cleanedDiscovered.map((_, i) => cleanedAttributions[i] || "");
      updates.lastPhotoEnrichment = now;
      hasUpdates = true;
      contentWasSaved = true;
      console.log(
        `✅ Updating photos with ${cleanedDiscovered.length} corroborated images ` +
          `(attributions: ${Array.from(new Set(updates.photoAttributions)).join(", ")})`,
      );
    }
  }

  // Structured fields verified by Perplexity (Golden Data Rule: only real values).
  if (managementCompany) {
    updates.managementCompany = managementCompany;
    hasUpdates = true;
  }
  if (availability) {
    updates.availabilityStatus = availability;
    hasUpdates = true;
  }
  if (structuredPricing && (structuredPricing.min || structuredPricing.max)) {
    updates.priceRange = {
      min: structuredPricing.min ?? structuredPricing.max,
      max: structuredPricing.max ?? structuredPricing.min,
    };
    updates.pricingType = "live";
    updates.pricingLastUpdated = now;
    hasUpdates = true;
  }

  // Address correction: if Perplexity found a different city, update + re-geocode.
  // (Only the free-fallback path surfaces an extracted address; Perplexity's
  // structured location is informational here. Kept for parity with prior verify.)

  // Structured enrichmentData blob — persisted so cache reads and admin views
  // have the verified, source-attributed payload.
  const validUntil = new Date(now.getTime() + ENRICHMENT_CACHE_TTL_MS);
  const enrichmentData: Record<string, any> = {
    ...((community.enrichmentData as any) || {}),
    verificationStatus: "verified",
    officialWebsite: candidateWebsite || (community.enrichmentData as any)?.officialWebsite,
    phoneNumber: candidatePhone || (community.enrichmentData as any)?.phoneNumber,
    pricing: structuredPricing || (community.enrichmentData as any)?.pricing,
    managementCompany: managementCompany || (community.enrichmentData as any)?.managementCompany,
    availability: availability || (community.enrichmentData as any)?.availability,
    photos: clearPhotos
      ? []
      : photos.length > 0
        ? photos.map((url, i) => ({
            url,
            source: photoAttributions[i] || "web",
            isAuthentic:
              perplexityPhotos.find((p) => p.url === url)?.isAuthentic === true,
          }))
        : (community.enrichmentData as any)?.photos,
    searchResults: { summary: candidateDescription || summary, sources },
    lastFetched: now.toISOString(),
    validUntil: validUntil.toISOString(),
  };

  if (contentWasSaved || hasUpdates) {
    updates.enrichmentData = enrichmentData;
    updates.enrichmentDataExpiry = validUntil;
  }

  // Only stamp lastSuccessfulEnrichment when REAL content was persisted.
  if (contentWasSaved) {
    updates.lastSuccessfulEnrichment = now;
    hasUpdates = true;
  }

  if (hasUpdates) {
    // normalizePhotoUrls guarantees clean string URLs in the text[] column.
    if (updates.photos) {
      const cleaned = normalizePhotoUrls(updates.photos);
      if (cleaned.length > 0) updates.photos = cleaned;
      // An intentional forced-refresh clear must persist the empty array (Contact
      // for details); only a non-clear empty result is dropped to avoid wiping.
      else if (clearPhotos) updates.photos = [];
      else delete updates.photos;
    }
    await db
      .update(communities)
      .set({ ...updates, updatedAt: now })
      .where(eq(communities.id, communityId));
    console.log(`✅ Unified enrichment persisted for community ${communityId}:`, {
      fieldsUpdated: Object.keys(updates),
    });

    // Self-heal visibility: re-score and re-apply the STRICT keep-public policy
    // now that content may have changed. A hidden community that just gained a
    // real description/photo is auto-restored (Task #262). Best-effort — must
    // never break enrichment.
    try {
      const { recomputeCommunityVisibility } = await import("./community-visibility");
      const vis = await recomputeCommunityVisibility(communityId);
      if (vis) {
        console.log(
          `🔁 Visibility recomputed for community ${communityId}: ` +
            `class=${vis.evaluation.classification} score=${vis.evaluation.score} ` +
            `tier=${vis.evaluation.tier} hidden=${vis.hidden}`,
        );
      }
    } catch (visErr) {
      console.warn(`⚠️ Visibility recompute failed for community ${communityId}:`, visErr);
    }
  }

  return {
    communityId,
    communityName: community.name,
    cached: false,
    contentSaved: contentWasSaved,
    lastUpdated: now.toISOString(),
    verificationStatus: "verified",
    confidence: freeEnrichment.sourceType === "none" ? 30 : 75,
    summary: candidateDescription || summary,
    officialWebsite: candidateWebsite || officialWebsite,
    phone: candidatePhone || phone,
    pricingContext: freeEnrichment.pricingContext || "",
    pricing: structuredPricing,
    managementCompany,
    availability,
    photos,
    photoAttributions,
    careTypes: freeEnrichment.careTypes || [],
    amenities: freeEnrichment.amenities || [],
    sources,
    enrichmentData,
  };
}
