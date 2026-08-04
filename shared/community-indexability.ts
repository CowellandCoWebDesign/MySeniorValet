/**
 * SEO INDEXING ELIGIBILITY — single source of truth for whether a community
 * page (and, by aggregation, a city/state location page) may be indexed by
 * search engines.
 *
 * Decision space per community URL:
 *   - 404 / 410  — missing or hidden/deactivated rows (existing middleware;
 *                  this module reports `notPublic` so callers can feed it)
 *   - noindex,follow — publicly accessible but too thin/unconfirmed to index
 *   - index,follow   — passes the quality bar below
 *
 * Criteria are documented in docs/SEO_INDEXING_ELIGIBILITY.md — keep the two
 * in sync when tuning thresholds.
 *
 * Pure & deterministic (no DB/network). Accepts camelCase (Drizzle) and
 * snake_case (raw DB) keys, like shared/community-classification.ts.
 */
import {
  type CommunityClassifyLike,
  classifySenior,
  isMeaningfullyVerified,
  looksLikeTestData,
  photoCount,
  descriptionLength,
} from "./community-classification";

/** Extended row view with the extra signals indexability needs. */
export interface CommunityIndexLike extends CommunityClassifyLike {
  city?: string | null;
  state?: string | null;
  slug?: string | null;
  citySlug?: string | null;
  city_slug?: string | null;
  stateSlug?: string | null;
  state_slug?: string | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  licenseNumber?: string | null;
  license_number?: string | null;
  rating?: string | number | null;
  reviewCount?: number | null;
  review_count?: number | null;
  googleReviewCount?: number | null;
  google_review_count?: number | null;
  yelpReviewCount?: number | null;
  yelp_review_count?: number | null;
  priceRange?: unknown;
  price_range?: unknown;
  dataQualityFlags?: unknown;
  data_quality_flags?: unknown;
}

/** Threshold: a description must be at least this long (trimmed chars) AND
 *  non-templated to count as a strong content signal on its own. */
export const INDEXABLE_DESCRIPTION_MIN_CHARS = 150;

/**
 * Critical-integrity flags. data_quality_flags are nearly universal (13.8k of
 * 14k rows carry at least one), so flags alone can never be the gate — ONLY
 * these hard-fail indexing.
 */
export const CRITICAL_INTEGRITY_FLAGS = [
  "synthetic_suspected",
  "test_data",
  "test_data_suspected",
  "clearly_fake",
] as const;

/** Prefix used inside data_quality_flags to mark a duplicate-secondary row and
 *  its canonical primary, e.g. "duplicate_of:12345". Written by
 *  server/scripts/duplicate-canonical-report.ts (report-first, reversible). */
export const DUPLICATE_OF_FLAG_PREFIX = "duplicate_of:";

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function flagsOf(c: CommunityIndexLike): string[] {
  const raw = c.dataQualityFlags ?? c.data_quality_flags;
  return Array.isArray(raw) ? raw.map((f) => str(f)) : [];
}

function careTypesOf(c: CommunityIndexLike): string[] {
  const raw = c.careTypes ?? c.care_types;
  return Array.isArray(raw)
    ? raw.map((x) => str(x).trim()).filter((x) => x.length > 0)
    : [];
}

/** Returns the primary community id when this row is a marked duplicate secondary. */
export function duplicateOfId(c: CommunityIndexLike): number | null {
  const flag = flagsOf(c).find((f) => f.startsWith(DUPLICATE_OF_FLAG_PREFIX));
  if (!flag) return null;
  const id = parseInt(flag.slice(DUPLICATE_OF_FLAG_PREFIX.length), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Generic machine-templated description ("X is a(n) ... community located in
 * ...") — short boilerplate that carries no community-specific substance.
 * Mirrors server/utils/description-quality.ts (kept inline so this module
 * stays shared/pure).
 */
const GENERIC_TEMPLATE_RE =
  /\bis\s+an?\s+[a-z0-9\s,\/&-]{0,80}\b(community|facility|residence|home)\s+(located|situated)\s+in\b/i;

export function isTemplatedDescription(description: string | null | undefined): boolean {
  const d = str(description).trim();
  if (!d) return false;
  return d.length <= 350 && GENERIC_TEMPLATE_RE.test(d);
}

/**
 * care_types has NOT NULL DEFAULT '{Assisted Living}', so a row whose ONLY
 * care type is "Assisted Living" may just carry the column default — that is
 * NOT a confirmed care type unless corroborated by the name, subtype, or a
 * meaningful verification.
 */
export function hasConfirmedCareType(c: CommunityIndexLike): boolean {
  const careTypes = careTypesOf(c);
  if (careTypes.length === 0) return false;
  const defaultOnly = careTypes.length === 1 && careTypes[0] === "Assisted Living";
  if (!defaultOnly) return true;
  const name = str(c.name).toLowerCase();
  const subtype = str(c.communitySubtype ?? c.community_subtype).toLowerCase();
  const corroborated =
    name.includes("assisted living") ||
    name.includes("assisted care") ||
    [
      "assisted_living",
      "traditional_assisted_living",
      "small_alf",
      "large_alf",
      "board_and_care",
    ].includes(subtype) ||
    isMeaningfullyVerified(c);
  return corroborated;
}

export interface IndexabilityResult {
  /** true → index,follow; false → noindex,follow (or 404/410 upstream) */
  indexable: boolean;
  /** Machine-readable fail reasons (empty when indexable). */
  reasons: string[];
  /** Strong signals that qualified the page (for observability). */
  signals: string[];
  /** Set when this row is a marked duplicate secondary (canonical → primary). */
  duplicateOfId: number | null;
}

/**
 * THE eligibility function. Never invents data — a page qualifies only on the
 * real values already on the row. When enrichment later adds real data, the
 * page flips to indexable automatically on the next evaluation.
 */
export function evaluateIndexability(c: CommunityIndexLike): IndexabilityResult {
  const reasons: string[] = [];
  const signals: string[] = [];
  const dupOf = duplicateOfId(c);

  // ── Hard fails (integrity) ────────────────────────────────────────────────
  const hidden = (c.isHidden ?? c.is_hidden) === true;
  const inactive = (c.isActive ?? c.is_active) === false;
  if (hidden || inactive) reasons.push("not_public");
  if (looksLikeTestData(c)) reasons.push("test_or_placeholder");
  const flags = flagsOf(c);
  for (const critical of CRITICAL_INTEGRITY_FLAGS) {
    if (flags.includes(critical)) {
      reasons.push(`critical_flag:${critical}`);
    }
  }
  if (classifySenior(c) === "non_senior") reasons.push("non_senior");
  if (dupOf != null) reasons.push("duplicate_secondary");

  // ── Required base identity ────────────────────────────────────────────────
  if (!str(c.name).trim()) reasons.push("missing_name");
  if (!str(c.city).trim() || !str(c.state).trim()) reasons.push("missing_location");
  if (
    !str(c.slug).trim() ||
    !str(c.citySlug ?? c.city_slug).trim() ||
    !str(c.stateSlug ?? c.state_slug).trim()
  ) {
    reasons.push("missing_canonical_slug");
  }
  if (!hasConfirmedCareType(c)) reasons.push("unconfirmed_care_type");

  // ── Strong signals (need ≥ 1) — real data only, never invented ───────────
  const descLen = descriptionLength(c);
  if (descLen >= INDEXABLE_DESCRIPTION_MIN_CHARS && !isTemplatedDescription(c.description)) {
    signals.push("description");
  }
  const rent = num(c.rentPerMonth ?? c.rent_per_month);
  const pr = (c.priceRange ?? c.price_range) as { min?: unknown } | null | undefined;
  const prMin = pr && typeof pr === "object" ? num((pr as any).min) : 0;
  if (rent > 0 || prMin > 0) signals.push("pricing");
  if (photoCount(c) >= 1) signals.push("photos");
  if (str(c.licenseNumber ?? c.license_number).trim()) signals.push("license");
  const reviewTotal =
    num(c.reviewCount ?? c.review_count) +
    num(c.googleReviewCount ?? c.google_review_count) +
    num(c.yelpReviewCount ?? c.yelp_review_count);
  if (reviewTotal > 0) signals.push("reviews");

  if (signals.length === 0) reasons.push("no_strong_signal");

  return { indexable: reasons.length === 0, reasons, signals, duplicateOfId: dupOf };
}

/** Robots directive for a community page (assumes 404/410 handled upstream). */
export function communityRobotsDirective(c: CommunityIndexLike): string {
  return evaluateIndexability(c).indexable
    ? "index, follow, max-image-preview:large"
    : "noindex, follow";
}

/** City/state location page rule: indexable when ≥1 community on it is indexable. */
export function isLocationIndexable(rows: CommunityIndexLike[]): boolean {
  return rows.some((r) => evaluateIndexability(r).indexable);
}
