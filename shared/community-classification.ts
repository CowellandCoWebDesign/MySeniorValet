/**
 * Shared community classification helpers.
 * Used by both server-side filters and client-side display logic.
 *
 * "Clearly fake" = name+address only listings with NO supporting data:
 *   isVerified = false  (also accepted as is_verified for raw DB rows)
 *   AND phone is blank/null
 *   AND website is blank/null
 *   AND description is blank/null
 *   AND dataSource / data_source is blank/null or is the default placeholder
 *
 * These ~112 listings (out of ~33k) are hidden from public views.
 * Real-but-unverified listings (which have at least one of: dataSource,
 * phone, website) remain fully visible with NO warning badge.
 *
 * Field-name note: Drizzle ORM returns camelCase keys (dataSource, isVerified)
 * while raw DB rows and some legacy objects use snake_case (data_source,
 * is_verified). Both variants are accepted throughout this module.
 */

export interface CommunityLike {
  /** camelCase (Drizzle) */
  isVerified?: boolean;
  /** snake_case (raw DB / legacy) */
  is_verified?: boolean;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  /** camelCase (Drizzle) */
  dataSource?: string | null;
  /** snake_case (raw DB / legacy) */
  data_source?: string | null;
  /** camelCase (Drizzle) */
  isHidden?: boolean;
  /** snake_case (raw DB / legacy) */
  is_hidden?: boolean;
  flagStatus?: string | null;
  flag_status?: string | null;
}

const DEFAULT_DATA_SOURCES = new Set([
  "",
  "government database",
  "placeholder",
  "unknown",
]);

function isDefaultDataSource(src: string | null | undefined): boolean {
  if (!src) return true;
  return DEFAULT_DATA_SOURCES.has(src.trim().toLowerCase());
}

/**
 * Returns true when a community has NO supporting data beyond name + address,
 * making it a "clearly fake / empty" listing that should be hidden from public views.
 *
 * Accepts both camelCase (Drizzle) and snake_case (raw DB) field names.
 */
export function isClearlyFake(community: CommunityLike): boolean {
  // Accept both camelCase and snake_case verified flag
  const verified = community.isVerified ?? community.is_verified;
  if (verified) return false;

  const hasPhone = Boolean(community.phone?.trim());
  const hasWebsite = Boolean(community.website?.trim());
  const hasDescription = Boolean(community.description?.trim());

  // Accept both camelCase and snake_case data_source
  const src = community.dataSource ?? community.data_source;
  const hasDataSource = !isDefaultDataSource(src);

  return !hasPhone && !hasWebsite && !hasDescription && !hasDataSource;
}

/**
 * Returns true when the community should be hidden from public views.
 * This covers both manually-hidden records and clearly-fake auto-detection.
 *
 * Accepts both camelCase (Drizzle) and snake_case (raw DB) field names.
 */
export function isPubliclyHidden(community: CommunityLike): boolean {
  const hidden = community.isHidden ?? community.is_hidden;
  if (hidden) return true;
  return isClearlyFake(community);
}

// ===========================================================================
// SENIOR CLASSIFICATION + QUALITY SCORING
//
// Single source of truth for: (a) whether a listing is a senior-living
// community, (b) a 0–100 quality score + tier, (c) the problem flags driving
// the admin review queue, and (d) the STRICT keep-public decision.
//
// Pure & deterministic — no DB/network. Both the bulk classification script
// and the per-community self-heal recompute call into `evaluateCommunity()`
// so visibility is computed identically everywhere (Golden Data Rule).
//
// Field-name note: accepts camelCase (Drizzle) and snake_case (raw DB) keys.
// ===========================================================================

/** Extended view of a community row used for classification + scoring. */
export interface CommunityClassifyLike extends CommunityLike {
  name?: string | null;
  email?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photos?: unknown;
  careTypes?: unknown;
  care_types?: unknown;
  communitySubtype?: string | null;
  community_subtype?: string | null;
  facilityType?: string | null;
  facility_type?: string | null;
  isClaimed?: boolean | null;
  is_claimed?: boolean | null;
  claimVerified?: boolean | null;
  claim_verified?: boolean | null;
  isFeaturedBrand?: boolean | null;
  is_featured_brand?: boolean | null;
  subscriptionTier?: string | null;
  subscription_tier?: string | null;
  hudPropertyId?: string | null;
  hud_property_id?: string | null;
  rentPerMonth?: string | number | null;
  rent_per_month?: string | number | null;
}

export type SeniorClassification = "senior" | "non_senior" | "unknown";
export type QualityTier = "featured" | "verified" | "good" | "thin" | "empty";

/**
 * Names that signal GENERAL (non-senior) housing. Mirrors the discovery
 * classifier so insert-time and bulk-time rules stay aligned.
 */
const NON_SENIOR_NAME_PATTERNS: RegExp[] = [
  /\bAPTS\b/i, /\bAPARTMENTS\b/i, /\bAPARTMENT\b/i,
  /\bHOUSING AUTHORITY\b/i, /\bHOUSING PROJ/i,
  /\bHOUSING COMPLEX\b/i, /\bAPT COMPLEX\b/i,
  /\bPUBLIC HOUSING\b/i, /\bSECTION 8\b/i,
  /\bFAMILY HOUSING\b/i, /\bFAMILY APARTMENTS\b/i,
  // HUD-VASH = supportive housing for (any-age, often formerly-homeless)
  // veterans — explicitly NOT senior living.
  /\bHUD[-\s]?VASH\b/i, /\bVASH\b/i,
];

/** Words that definitively identify a senior-living purpose, in the name. */
const HARD_SENIOR_QUALIFIERS = [
  "senior", "elderly", "retire", "retirement", "assisted living", "memory care",
  "skilled nursing", "nursing home", "hospice", "adult care", "adult day",
  "continuing care", "ccrc", "alzheimer",
  "convalescent", "rest home", "aged care",
];

/**
 * Word-bounded senior name patterns. "Section 202" is HUD's Supportive Housing
 * for the Elderly, but a bare "202" substring would match addresses / building
 * numbers / branding (e.g. "2020 Main St Apartments"), so it must only match the
 * explicit program phrasing — never a loose number.
 */
const SENIOR_NAME_PATTERNS: RegExp[] = [
  /\bsection\s*202\b/i,
  /\bsec\.?\s*202\b/i,
];

/** Care types that unambiguously signal a senior-living community. */
const SENIOR_CARE_TYPES = new Set([
  "Independent Living", "Assisted Living", "Memory Care",
  "Skilled Nursing", "Continuing Care", "CCRC", "Active Adult",
  "Respite Care", "Hospice Care", "Board and Care", "Senior Living",
  "HUD Senior Housing", "Senior Housing",
  "Adult Day Care", "Adult Day Services", "Home Care", "Personal Care",
  "Alzheimer's Care", "Supportive Living", "Nursing Care",
  // Australian / international labels
  "high_care", "low_care", "dementia_care", "respite_care",
  "home_care", "aged_care", "residential_care", "palliative_care",
  "memory_care", "nursing_care", "retirement_living",
]);

/**
 * community_subtype values that positively mark senior living.
 * `hud_senior_housing` is intentionally EXCLUDED — it was auto-applied to the
 * entire HUD multifamily feed and is not a trustworthy senior signal.
 */
const SENIOR_SUBTYPES = new Set([
  "assisted_living", "memory_care", "independent_living", "skilled_nursing",
  "ccrc", "care_home", "senior_community", "senior_mobile_park",
  "active_adult_55plus", "small_alf", "large_alf", "senior_55_plus",
  "senior_apartments", "adult_day_care", "home_care",
  "continuing_care", "hospice", "active_adult",
  "traditional_assisted_living", "board_and_care",
]);

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

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((x) => str(x).trim()).filter((x) => x.length > 0);
  }
  return [];
}

/** Number of real (non-blank) photo URLs on the row. */
export function photoCount(community: CommunityClassifyLike): number {
  return toStringArray(community.photos).length;
}

/** Trimmed description length. */
export function descriptionLength(community: CommunityClassifyLike): number {
  return str(community.description).trim().length;
}

function careTypesOf(community: CommunityClassifyLike): string[] {
  return toStringArray(community.careTypes ?? community.care_types);
}

function hasRealSeniorCareType(careTypes: string[]): boolean {
  return careTypes.some((ct) => SENIOR_CARE_TYPES.has(ct) && ct !== "HUD Housing");
}

function nameHasSeniorQualifier(name: string): boolean {
  const n = name.toLowerCase();
  if (HARD_SENIOR_QUALIFIERS.some((q) => n.includes(q))) return true;
  return SENIOR_NAME_PATTERNS.some((p) => p.test(name));
}

function nameHasNonSeniorPattern(name: string): boolean {
  return NON_SENIOR_NAME_PATTERNS.some((p) => p.test(name));
}

/**
 * Three-way senior classification — CONSERVATIVE. Only assigns `non_senior`
 * on a strong signal; anything ambiguous stays `unknown` (kept visible,
 * flagged for review) so we never silently hide a real senior community.
 */
export function classifySenior(community: CommunityClassifyLike): SeniorClassification {
  const name = str(community.name);
  const careTypes = careTypesOf(community);
  const subtype = str(community.communitySubtype ?? community.community_subtype).toLowerCase();
  const dataSource = str(community.dataSource ?? community.data_source);
  const facilityType = str(community.facilityType ?? community.facility_type);

  const seniorCareType = hasRealSeniorCareType(careTypes);
  const seniorSubtype = SENIOR_SUBTYPES.has(subtype);
  const seniorName = nameHasSeniorQualifier(name);

  // POSITIVE senior signals win first (so a HUD building that genuinely offers
  // Assisted Living is kept as senior).
  if (seniorCareType || seniorSubtype || seniorName) return "senior";

  // STRONG non-senior signal #1: a HUD multifamily / affordable / veterans feed
  // row whose ONLY care type is the generic "HUD Housing" placeholder (and, per
  // the check above, no senior name or subtype). An empty / mixed care-type set
  // is genuinely ambiguous, so it must fall through to `unknown` — we never mark
  // non_senior on the source alone. The over-applied `hud_senior_housing`
  // subtype is likewise NOT trusted.
  const fromHudAffordableFeed =
    dataSource === "HUD Multifamily Database" ||
    facilityType === "HUD-VASH" ||
    facilityType === "Affordable Senior";
  const onlyGenericHudHousing =
    careTypes.length > 0 && careTypes.every((ct) => ct === "HUD Housing");
  if (fromHudAffordableFeed && onlyGenericHudHousing) return "non_senior";

  // STRONG non-senior signal #2: obvious general-housing name (apartments,
  // housing authority, section 8, family housing) with no senior signal at all.
  if (nameHasNonSeniorPattern(name)) return "non_senior";

  // Everything else is genuinely ambiguous → keep visible, flag for review.
  return "unknown";
}

/** True for the rare, MEANINGFUL verification signals (not legacy is_verified). */
export function isMeaningfullyVerified(community: CommunityClassifyLike): boolean {
  const claimed = Boolean(community.isClaimed ?? community.is_claimed);
  const claimVerified = Boolean(community.claimVerified ?? community.claim_verified);
  const featuredBrand = Boolean(community.isFeaturedBrand ?? community.is_featured_brand);
  const tier = str(community.subscriptionTier ?? community.subscription_tier).toLowerCase();
  const featuredTier = tier === "featured" || tier === "platinum";
  // Government-verified = genuine HUD-verified pricing (a real data point), not
  // merely "imported from a government list".
  const hudId = str(community.hudPropertyId ?? community.hud_property_id).trim();
  const rent = num(community.rentPerMonth ?? community.rent_per_month);
  const govVerified = hudId.length > 0 && rent > 0;
  return claimed || claimVerified || featuredBrand || featuredTier || govVerified;
}

function isFeaturedSignal(community: CommunityClassifyLike): boolean {
  const featuredBrand = Boolean(community.isFeaturedBrand ?? community.is_featured_brand);
  const tier = str(community.subscriptionTier ?? community.subscription_tier).toLowerCase();
  return featuredBrand || tier === "featured" || tier === "platinum";
}

function hasGeocode(community: CommunityClassifyLike): boolean {
  const lat = num(community.latitude);
  const lng = num(community.longitude);
  return lat !== 0 && lng !== 0 && Number.isFinite(lat) && Number.isFinite(lng);
}

/** True when the listing carries real public content (≥1 photo OR ≥100-char desc). */
export function hasRealContent(community: CommunityClassifyLike): boolean {
  return photoCount(community) >= 1 || descriptionLength(community) >= 100;
}

/** Quality flags this task OWNS — merged into data_quality_flags without
 *  clobbering flags written by other scanners (e.g. citation_artifact). */
export const MANAGED_QUALITY_FLAGS = [
  "non_senior",
  "senior_review",
  "clearly_fake",
  "no_photos",
  "no_description",
  "thin_description",
  "no_contact",
  "not_geocoded",
  "no_care_types",
] as const;

export interface CommunityEvaluation {
  classification: SeniorClassification;
  score: number;
  tier: QualityTier;
  flags: string[];
  meaningfullyVerified: boolean;
  realContent: boolean;
  clearlyFake: boolean;
  /** STRICT keep-public decision (before protective-quarantine overrides). */
  keepPublic: boolean;
}

/**
 * The single scoring + classification + visibility evaluator. Deterministic.
 *
 * STRICT keep-public = (meaningfullyVerified OR realContent)
 *                      AND classification ∈ {senior, unknown}
 *                      AND NOT clearlyFake.
 * `non_senior` is always hidden; ambiguous `unknown` stays visible when it
 * otherwise clears the bar.
 */
export function evaluateCommunity(community: CommunityClassifyLike): CommunityEvaluation {
  const classification = classifySenior(community);
  const careTypes = careTypesOf(community);
  const photos = photoCount(community);
  const descLen = descriptionLength(community);
  const meaningfullyVerified = isMeaningfullyVerified(community);
  const featured = isFeaturedSignal(community);
  const realContent = photos >= 1 || descLen >= 100;
  const clearlyFake = isClearlyFake(community);

  const hasPhone = Boolean(str(community.phone).trim());
  const hasWebsite = Boolean(str(community.website).trim());
  const hasEmail = Boolean(str(community.email).trim());
  const geocoded = hasGeocode(community);
  const seniorCareType = hasRealSeniorCareType(careTypes);

  // ── Score (0–100) ────────────────────────────────────────────────────────
  let score = 0;
  // Description (max 30)
  if (descLen >= 400) score += 30;
  else if (descLen >= 200) score += 22;
  else if (descLen >= 100) score += 15;
  else if (descLen >= 40) score += 6;
  // Photos (max 25)
  if (photos >= 4) score += 25;
  else if (photos >= 2) score += 18;
  else if (photos >= 1) score += 12;
  // Contact (max 15)
  let contact = 0;
  if (hasPhone) contact += 7;
  if (hasWebsite) contact += 6;
  if (hasEmail) contact += 2;
  score += Math.min(contact, 15);
  // Geocode (8)
  if (geocoded) score += 8;
  // Senior care type (7)
  if (seniorCareType) score += 7;
  // Verification (max 15)
  if (featured) score += 15;
  else if (meaningfullyVerified) score += 12;
  score = Math.max(0, Math.min(100, score));

  // ── Tier ─────────────────────────────────────────────────────────────────
  let tier: QualityTier;
  if (featured) tier = "featured";
  else if (meaningfullyVerified) tier = "verified";
  else if (score >= 55) tier = "good";
  else if (score >= 20) tier = "thin";
  else tier = "empty";

  // ── Problem / classification flags ─────────────────────────────────────────
  const flags: string[] = [];
  if (classification === "non_senior") flags.push("non_senior");
  if (classification === "unknown") flags.push("senior_review");
  if (clearlyFake) flags.push("clearly_fake");
  if (photos === 0) flags.push("no_photos");
  if (descLen === 0) flags.push("no_description");
  else if (descLen < 100) flags.push("thin_description");
  if (!hasPhone && !hasWebsite && !hasEmail) flags.push("no_contact");
  if (!geocoded) flags.push("not_geocoded");
  if (careTypes.length === 0) flags.push("no_care_types");

  // ── STRICT keep-public decision ────────────────────────────────────────────
  // "Clearly fake" = name+address only with NO supporting data. The legacy
  // detector only inspects phone/website/description/data_source, so a listing
  // that has a real photo OR a meaningful verification is NOT actually fake —
  // real content / verification overrides it (otherwise a photo-only or
  // operator-claimed senior community would be wrongly quarantined).
  const trulyEmpty = clearlyFake && !realContent && !meaningfullyVerified;
  const keepPublic =
    classification !== "non_senior" &&
    !trulyEmpty &&
    (meaningfullyVerified || realContent);

  return {
    classification,
    score,
    tier,
    flags,
    meaningfullyVerified,
    realContent,
    clearlyFake,
    keepPublic,
  };
}
