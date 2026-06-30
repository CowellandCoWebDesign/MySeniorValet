/**
 * Shared location-line composition used by community cards and the community
 * detail page header so both surfaces display location identically.
 */

const ADDRESS_PLACEHOLDER_PATTERNS = [
  /address\s+pending/i,
  /pending\s+verification/i,
  /no\s+address/i,
  /not\s+available/i,
  /^n\/?a$/i,
  /^tbd$/i,
];

/** True when the stored street is blank or a known placeholder value. */
export function isPlaceholderAddress(value: string | null | undefined): boolean {
  const trimmed = (value || "").trim();
  if (!trimmed) return true;
  return ADDRESS_PLACEHOLDER_PATTERNS.some((re) => re.test(trimmed));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `token` appears in `haystack` as a whole word (case-insensitive). */
function containsWord(haystack: string, token: string): boolean {
  if (!token) return false;
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(token.toLowerCase())}([^a-z0-9]|$)`);
  return re.test(haystack.toLowerCase());
}

/**
 * Build a complete, de-duplicated location line.
 *
 * - Combines street + city + state so city/state always appear when known.
 * - Skips appending city/state if the stored street already contains them
 *   (avoids "…Panama City Beach, FL, Panama City Beach, FL").
 * - Falls back to just city/state when the street is blank or a placeholder
 *   like "Address pending verification".
 */
export function composeLocationLine(
  address: string | null | undefined,
  city: string | null | undefined,
  state: string | null | undefined,
): string {
  const street = (address || "").trim();
  const cityClean = (city || "").trim();
  const stateClean = (state || "").trim();
  const cityState = [cityClean, stateClean].filter(Boolean).join(", ");

  if (!street || isPlaceholderAddress(street)) {
    return cityState;
  }

  const parts = [street];
  if (cityClean && !containsWord(street, cityClean)) {
    parts.push(cityClean);
  }
  if (stateClean && !containsWord(street, stateClean)) {
    parts.push(stateClean);
  }
  return parts.join(", ");
}
