/**
 * Shared state-normalization helpers for the per-state data-op runners
 * (queue-synthetic-communities.ts, discover-communities.ts).
 *
 * Community rows store `state` inconsistently — sometimes the 2-letter code
 * ('GA'), sometimes the full name ('Georgia'), with stray casing/whitespace.
 * These helpers let a `--state` argument accept EITHER form and produce a SQL
 * predicate that matches both, plus the canonical 2-letter code used when
 * persisting freshly-discovered rows.
 */

// Canonical 2-letter code → full state/territory name.
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", PR: "Puerto Rico",
};

// Full name (lowercased) → 2-letter code, derived from STATE_NAMES.
const NAME_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([abbr, name]) => [name.toLowerCase(), abbr]),
);

/**
 * Normalize a user-supplied `--state` value (code or full name, any case) to the
 * canonical 2-letter code. Returns undefined if it doesn't resolve to a real state.
 */
export function normalizeState(input: string): string | undefined {
  const t = input.trim();
  if (!t) return undefined;
  const upper = t.toUpperCase();
  if (STATE_NAMES[upper]) return upper;
  const byName = NAME_TO_ABBR[t.toLowerCase()];
  return byName;
}

/**
 * SQL fragment (no leading AND) that matches a community row for the given
 * canonical 2-letter state code by EITHER the code or the full name, tolerating
 * casing/whitespace. e.g. statePredicate('GA') →
 *   upper(trim(coalesce(state,''))) IN ('GA','GEORGIA')
 */
export function statePredicate(abbr: string): string {
  const full = (STATE_NAMES[abbr] ?? abbr).toUpperCase();
  return `upper(trim(coalesce(state,''))) IN ('${abbr}','${full}')`;
}

/** All canonical 2-letter codes (50 states + DC + PR). */
export function allStateCodes(): string[] {
  return Object.keys(STATE_NAMES);
}
