/**
 * Community identity corroboration — shared gate for identity-bearing writes.
 * =========================================================================
 * Task #438: enrichment (Perplexity or free-scrape) can lock onto a DIFFERENT
 * facility (live repro: "Kona Senior Living" in Aiea persisted
 * aieaheightsseniorliving.com's website/phone/capacity/pricing while the photo
 * gate correctly rejected everything). Photos have an identity gate;
 * website/phone/pricing/capacity historically did not.
 *
 * This module extracts the photo path's name+city corroboration rules into a
 * dependency-free helper so the SAME identity check gates ALL identity-bearing
 * enrichment fields (website, phone, management company, capacity/unit types,
 * pricing). Rules mirror the photo gate:
 *   - Tokenizer KEEPS type/suffix words (estates/springs/manor/heights…) — those
 *     are exactly what tells "Hilltop Estates" apart from "Hilltop Springs" —
 *     and drops only truly-generic care words.
 *   - Short names (≤2 distinctive tokens) must match ALL tokens; longer names
 *     tolerate the ≥60% / ≥2 rule.
 *   - The city must ALSO corroborate — and a city coincidence must never rescue
 *     a name mismatch (siblings share cities).
 *
 * Intentionally self-contained (no imports from other services) so it is
 * trivially unit-testable and creates no load-order coupling. The photo path's
 * own filters are left untouched (photo gate behavior unchanged).
 */

/**
 * Truly-generic senior-living words that never distinguish one community from
 * another. Mirrors the photo sibling-discrimination set: type/suffix words
 * (estates, manor, springs, heights, gardens…) are deliberately NOT here.
 */
const GENERIC_CARE_WORDS = new Set([
  "senior", "seniors", "living", "care", "assisted", "memory", "independent",
  "nursing", "skilled", "community", "communities", "center", "centre", "home",
  "homes", "house", "housing", "retirement", "health", "healthcare",
  "rehabilitation", "rehab", "facility", "the", "of", "at", "and", "for",
  "llc", "inc", "co", "group",
]);

/**
 * Tokenize a community name for identity discrimination — keeps suffix words,
 * drops only generic care words. (Same rules as the photo path's
 * discriminating tokenizer.)
 */
export function identityNameTokens(name: string): string[] {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !GENERIC_CARE_WORDS.has(t));
}

export interface IdentityCheckResult {
  corroborated: boolean;
  /** Human-readable reason, logged and stored as evidence when it fails. */
  reason: string;
}

/**
 * Does a chunk of text (candidate URL + page text / prose) corroborate THIS
 * community's identity? Requires BOTH:
 *   - name: short names (≤2 distinctive tokens) match ALL tokens; longer names
 *     match ≥60% or ≥2 (photo Rule 2), and
 *   - city: must appear in the text when known (photo Rule 3's counterpart —
 *     the city corroborates; it can never rescue a failed name match because
 *     the name check runs unconditionally).
 * Fully-generic names fall back to requiring the verbatim name.
 */
export function textCorroboratesIdentity(
  text: string,
  name: string,
  city: string,
): IdentityCheckResult {
  const hay = (text || "").toLowerCase();
  if (!hay.trim()) return { corroborated: false, reason: "no text to corroborate against" };

  const cityNorm = (city || "").toLowerCase().trim();
  const cityOk = cityNorm.length === 0 || hay.includes(cityNorm);

  const tokens = identityNameTokens(name);
  let nameOk: boolean;
  if (tokens.length === 0) {
    const full = (name || "").toLowerCase().trim();
    nameOk = full.length > 0 && hay.includes(full);
  } else {
    const matched = tokens.filter((t) => hay.includes(t)).length;
    nameOk =
      tokens.length <= 2
        ? matched === tokens.length
        : matched / tokens.length >= 0.6 || matched >= 2;
  }

  if (!nameOk) {
    return {
      corroborated: false,
      reason: `name mismatch: source text does not reference "${name}" (tokens: ${tokens.join(", ") || "—"})`,
    };
  }
  if (!cityOk) {
    return {
      corroborated: false,
      reason: `city mismatch: source text does not mention "${city}"`,
    };
  }
  return { corroborated: true, reason: "name+city corroborated" };
}

/**
 * Does a website's HOST embed this community's distinctive name (≥4-char token
 * in the host's alpha characters)? Weak signal — used only as a fallback when
 * page text is unavailable (scrape failed), never to override a text mismatch.
 */
export function hostEmbedsCommunityName(url: string, name: string): boolean {
  let host = "";
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return false;
  }
  const hostAlpha = host.replace(/[^a-z]/g, "");
  return identityNameTokens(name).some((t) => t.length >= 4 && hostAlpha.includes(t));
}

/**
 * Evaluate whether a candidate official source (URL + scraped page text)
 * corroborates the community's identity — the gate for website/phone/pricing/
 * capacity/management-company writes.
 *   - With page text: the SAME name+city text check the photo path uses.
 *   - Scrape failed / no text: fall back to the host check (host embeds a
 *     distinctive name token → weakly corroborated; else not corroborated —
 *     an unverifiable source must not persist identity-bearing fields).
 */
export function evaluateSourceIdentity(params: {
  url?: string;
  pageText?: string;
  name: string;
  city: string;
}): IdentityCheckResult {
  const { url, pageText, name, city } = params;
  if (pageText && pageText.trim().length > 0) {
    return textCorroboratesIdentity(`${url || ""} ${pageText}`, name, city);
  }
  if (url) {
    if (hostEmbedsCommunityName(url, name)) {
      return { corroborated: true, reason: "host embeds community name (page text unavailable)" };
    }
    return {
      corroborated: false,
      reason: `unverifiable source: could not read ${url} and its host does not reference "${name}"`,
    };
  }
  return { corroborated: false, reason: "no source to corroborate" };
}

/** The identity-bearing enrichment fields the gate protects. */
export interface IdentityGatedFields {
  website?: string | null;
  phone?: string | null;
  managementCompany?: string | null;
  capacity?: number | null;
  unitTypes?: string[];
  pricing?: { min?: number; max?: number } | null;
  pricingByCareLevel?: Array<{ label: string; min: number; max?: number }>;
  availability?: string | null;
}

/**
 * Pure gate decision: when the source identity is NOT corroborated, none of the
 * identity-bearing fields may persist. Returns the kept fields plus the names
 * of every skipped (non-empty) field so callers can log honest partial results.
 */
export function gateIdentityFields(
  check: IdentityCheckResult,
  fields: IdentityGatedFields,
): { kept: IdentityGatedFields; skipped: string[] } {
  if (check.corroborated) return { kept: fields, skipped: [] };
  const skipped = (Object.keys(fields) as (keyof IdentityGatedFields)[]).filter((k) => {
    const v = fields[k];
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });
  return { kept: {}, skipped: skipped as string[] };
}

/** One recorded identity-mismatch event (persisted in enrichmentData). */
export interface IdentityMismatchEvent {
  at: string;
  candidateWebsite?: string;
  reason: string;
}

/**
 * Arbitration: should this community be flagged `identity_suspect`?
 * Yes when enrichment has now REPEATEDLY (≥2 events) resolved to a source that
 * does not corroborate the stored identity — evidence the RECORD itself may be
 * the false identity (garbled source data poisons every search built from it).
 * The flag is protective for enrichment retries (terminal until reviewed) and
 * surfaces in the admin QC queue; the name is NEVER auto-overwritten.
 */
export function shouldFlagIdentitySuspect(mismatches: IdentityMismatchEvent[]): boolean {
  return (mismatches || []).length >= 2;
}

/** The data-quality flag that marks a poisoned/garbled identity. */
export const IDENTITY_SUSPECT_FLAG = "identity_suspect";

/**
 * Should background (self-heal) enrichment be blocked for this record?
 * True while the identity_suspect flag is present — retrying a poisoned
 * identity just re-corroborates against the wrong facility. Cleared only by a
 * deliberate admin adjudication (naming the flag in clearProtectiveFlags);
 * routine QC restore / clear-flags actions preserve it. Admin force refresh
 * is intentionally NOT blocked.
 */
export function isIdentitySuspectFlagged(flags: unknown): boolean {
  return Array.isArray(flags) && flags.includes(IDENTITY_SUSPECT_FLAG);
}
