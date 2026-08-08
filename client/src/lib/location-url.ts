// Build clean, canonical /senior-living/{state}/{city?} URLs for location
// links. Falls back to /ai-search-intelligence?query=... for values (countries,
// regions) that have no state/province path. NEVER emit ?location= URLs — that
// legacy query family 301s server-side and caused GSC duplicate-URL damage.

const STATE_NAME_TO_CODE: Record<string, string> = {
  // US states
  'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar',
  'california': 'ca', 'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de',
  'florida': 'fl', 'georgia': 'ga', 'hawaii': 'hi', 'idaho': 'id',
  'illinois': 'il', 'indiana': 'in', 'iowa': 'ia', 'kansas': 'ks',
  'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
  'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms',
  'missouri': 'mo', 'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv',
  'new hampshire': 'nh', 'new jersey': 'nj', 'new mexico': 'nm', 'new york': 'ny',
  'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh', 'oklahoma': 'ok',
  'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc',
  'south dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut',
  'vermont': 'vt', 'virginia': 'va', 'washington': 'wa', 'west virginia': 'wv',
  'wisconsin': 'wi', 'wyoming': 'wy', 'district of columbia': 'dc',
  'puerto rico': 'pr',
  // Canadian provinces
  'ontario': 'on', 'quebec': 'qc', 'british columbia': 'bc', 'alberta': 'ab',
  'manitoba': 'mb', 'saskatchewan': 'sk', 'nova scotia': 'ns', 'new brunswick': 'nb',
  'newfoundland and labrador': 'nl', 'prince edward island': 'pe',
  'yukon': 'yt', 'nunavut': 'nu', 'northwest territories': 'nt',
  // Australian states
  'new south wales': 'nsw', 'victoria': 'vic', 'queensland': 'qld',
  'tasmania': 'tas', 'australian capital territory': 'act',
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Returns the clean URL for a location name:
 * - "Florida" / "Ontario" → /senior-living/fl, /senior-living/on
 * - "Fort Worth, Texas" / "Fort Worth, TX" → /senior-living/tx/fort-worth
 * - countries / unknowns ("Japan", "canada") → /ai-search-intelligence?query=...
 */
export function getLocationSearchUrl(name: string): string {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // "City, State" or "City, ST"
  const commaIdx = trimmed.indexOf(',');
  if (commaIdx > 0) {
    const cityPart = trimmed.slice(0, commaIdx).trim();
    const statePart = trimmed.slice(commaIdx + 1).trim().toLowerCase();
    const code = STATE_NAME_TO_CODE[statePart] ||
      (/^[a-z]{2,3}$/.test(statePart) ? statePart : null);
    if (code && cityPart) {
      return `/senior-living/${code}/${slugify(cityPart)}`;
    }
  }

  // Bare state/province name
  if (STATE_NAME_TO_CODE[lower]) {
    return `/senior-living/${STATE_NAME_TO_CODE[lower]}`;
  }

  // Countries / regions without a state path — plain search query (self-canonical page)
  return `/ai-search-intelligence?query=${encodeURIComponent(trimmed)}`;
}
