/**
 * FREE DISCOVERY SERVICE
 * Uses DuckDuckGo HTML search + Jina AI Reader to find senior living communities
 * with zero API costs.  No paid AI required.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface DiscoveredCommunity {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  website?: string;
  careTypes: string[];
  description?: string;
  source: string;
  confidence: number;
}

const SENIOR_LIVING_KEYWORDS = [
  'senior living', 'assisted living', 'memory care', 'independent living',
  'nursing home', 'skilled nursing', 'retirement', 'senior care', 'elder care',
  'dementia care', 'alzheimer', 'respite care', 'continuing care', 'ccrc'
];

/**
 * Aggregator/directory sites that list many facilities.
 * Fetching them inflates candidate count without adding actionable community data.
 */
const AGGREGATOR_DOMAINS = [
  'seniorly.com', 'caring.com', 'aplaceformom.com', 'senioradvisor.com',
  'seniorhomes.com', 'assistedliving.com', 'memorycare.com', 'retirementliving.com',
  'seniorcare.com', 'wheretocare.com', 'findcontinuingcare.com', 'assistedlivinginfo.com',
  'theseniorlist.com', 'seniorliving.org', 'alzheimers.net', 'helpguide.org',
  'medicalnewstoday.com', 'healthline.com', 'familyassets.com', 'payingforseniorcare.com',
  'seniorplanet.org', 'agingcare.com', 'brightfocus.org'
];

const SKIP_DOMAINS = [
  'wikipedia.org', 'facebook.com', 'twitter.com', 'instagram.com', 'reddit.com',
  'youtube.com', 'linkedin.com', 'pinterest.com', 'google.com', 'bing.com',
  'yahoo.com', 'duckduckgo.com', 'amazon.com', 'yelp.com',
  ...AGGREGATOR_DOMAINS
];

const ALLOWED_SSRF_PATTERN = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/;

/**
 * Minimum confidence threshold — candidates with no phone AND no address are excluded.
 */
const MIN_CONFIDENCE = 40;

/**
 * Main entry point: Discover communities via DuckDuckGo + Jina Reader
 */
export async function discoverCommunitiesViaWeb(
  query: string,
  city?: string,
  state?: string
): Promise<DiscoveredCommunity[]> {
  const communities: DiscoveredCommunity[] = [];

  const locationPart = city && state
    ? `${city} ${state}`
    : city || state || query;

  const searchQueries = [
    `${locationPart} senior living assisted living community`,
    `${locationPart} memory care retirement community`
  ];

  let allUrls: string[] = [];

  for (const q of searchQueries) {
    const urls = await searchDuckDuckGo(q);
    allUrls.push(...urls);
  }

  allUrls = [...new Set(allUrls)].slice(0, 6);
  console.log(`🦆 Free Discovery: found ${allUrls.length} candidate URLs for "${locationPart}"`);

  const jinaResults = await Promise.allSettled(
    allUrls.map(url => fetchViaJina(url))
  );

  for (const result of jinaResults) {
    if (result.status === 'fulfilled' && result.value) {
      const extracted = extractCommunitiesFromText(
        result.value.content,
        result.value.url,
        city,
        state
      );
      communities.push(...extracted);
    }
  }

  const deduped = deduplicateCommunities(communities);
  const filtered = deduped.filter(c => c.confidence >= MIN_CONFIDENCE);
  console.log(`✨ Free Discovery: extracted ${filtered.length} candidate communities (${deduped.length - filtered.length} low-confidence discarded)`);
  return filtered;
}

async function searchDuckDuckGo(query: string): Promise<string[]> {
  const urls: string[] = [];
  try {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 12000
    });

    const $ = cheerio.load(response.data);

    $('.result').each((i, element) => {
      if (i >= 12) return false;
      const $el = $(element);
      const titleEl = $el.find('.result__title a');
      let rawHref = titleEl.attr('href') || '';
      const title = titleEl.text().trim();
      const snippet = $el.find('.result__snippet').text().trim();

      // DuckDuckGo wraps real URLs as //duckduckgo.com/l/?uddg=<encoded-url>
      // Decode the redirect to get the actual destination URL
      let resolvedUrl = rawHref;
      if (rawHref.includes('duckduckgo.com/l/') || rawHref.includes('/l/?uddg=')) {
        try {
          const fullHref = rawHref.startsWith('//') ? `https:${rawHref}` : rawHref;
          const parsed = new URL(fullHref);
          const uddg = parsed.searchParams.get('uddg');
          if (uddg) resolvedUrl = decodeURIComponent(uddg);
        } catch { /* keep rawHref if parsing fails */ }
      }
      // Normalize protocol-relative links
      if (resolvedUrl.startsWith('//')) {
        resolvedUrl = `https:${resolvedUrl}`;
      }

      const combined = (title + ' ' + snippet + ' ' + resolvedUrl).toLowerCase();
      const isSeniorRelated = SENIOR_LIVING_KEYWORDS.some(kw => combined.includes(kw));
      const isSkipped = SKIP_DOMAINS.some(d => resolvedUrl.includes(d));
      const isValidUrl = resolvedUrl.startsWith('http') && ALLOWED_SSRF_PATTERN.test(resolvedUrl);

      if (isValidUrl && isSeniorRelated && !isSkipped) {
        urls.push(resolvedUrl);
      }
    });
  } catch (error: any) {
    console.warn(`⚠️ DuckDuckGo search error: ${error.message}`);
  }
  return urls;
}

async function fetchViaJina(url: string): Promise<{ content: string; url: string } | null> {
  if (!ALLOWED_SSRF_PATTERN.test(url)) {
    console.warn(`🚫 SSRF guard blocked URL: ${url}`);
    return null;
  }

  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await axios.get(jinaUrl, {
      headers: {
        'User-Agent': 'MySeniorValet/1.0 (Community Finder)',
        'Accept': 'text/plain, text/markdown',
        'X-No-Cache': 'true'
      },
      timeout: 15000,
      maxContentLength: 100000
    });

    const content = typeof response.data === 'string' ? response.data : '';

    if (content.length < 100) return null;

    const isSpaBoilerplate = (
      content.includes('You need to enable JavaScript') ||
      content.includes('Please enable cookies') ||
      content.includes('Access Denied') ||
      content.includes('403 Forbidden') ||
      (content.includes('<html') && !content.includes(' '))
    );
    if (isSpaBoilerplate) return null;

    return { content: content.slice(0, 8000), url };
  } catch (error: any) {
    console.warn(`⚠️ Jina fetch failed for ${url}: ${error.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Extraction helpers — exported so unit tests can exercise them directly
// ---------------------------------------------------------------------------

/**
 * Attempt to parse JSON-LD LocalBusiness structured data embedded in the content.
 * Jina reader sometimes preserves <script type="application/ld+json"> blocks as
 * fenced code blocks or inline JSON.  We try both forms.
 */
export function extractJsonLdData(content: string): {
  name?: string;
  address?: string;
  phone?: string;
} {
  const LOCAL_BUSINESS_TYPES = new Set([
    'LocalBusiness', 'SeniorLivingFacility', 'MedicalBusiness',
    'Organization', 'ResidentialCommunity', 'NursingHome', 'LodgingBusiness'
  ]);

  // Patterns to find JSON blobs — fenced code blocks first, then inline raw JSON
  const jsonCandidates: string[] = [];

  // 1. Fenced code blocks (```json ... ```)
  const fencedRe = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
  let m: RegExpExecArray | null;
  while ((m = fencedRe.exec(content)) !== null) {
    jsonCandidates.push(m[1]);
  }

  // 2. Inline JSON-LD anchored by @context / @type
  const inlineRe = /(\{"@(?:context|type)"[\s\S]*?\})\s*(?=\n|$)/g;
  while ((m = inlineRe.exec(content)) !== null) {
    jsonCandidates.push(m[1]);
  }

  for (const candidate of jsonCandidates) {
    try {
      const obj = JSON.parse(candidate);
      const items: any[] = Array.isArray(obj['@graph']) ? obj['@graph'] : [obj];
      for (const item of items) {
        const type = item['@type'];
        const matchesType =
          (typeof type === 'string' && LOCAL_BUSINESS_TYPES.has(type)) ||
          (Array.isArray(type) && type.some((t: string) => LOCAL_BUSINESS_TYPES.has(t)));
        if (!matchesType) continue;

        const result: { name?: string; address?: string; phone?: string } = {};

        if (typeof item.name === 'string' && item.name.trim()) {
          result.name = item.name.trim();
        }
        if (typeof item.telephone === 'string' && item.telephone.trim()) {
          result.phone = item.telephone.trim();
        }
        if (item.address) {
          const addr = item.address;
          if (typeof addr === 'string' && addr.trim()) {
            result.address = addr.trim();
          } else if (typeof addr === 'object' && addr !== null) {
            const parts = [
              addr.streetAddress,
              addr.addressLocality,
              addr.addressRegion,
              addr.postalCode
            ].filter(Boolean).map((p: string) => String(p).trim());
            if (parts.length > 0) result.address = parts.join(', ');
          }
        }

        if (result.name || result.address) return result;
      }
    } catch {
      /* skip invalid JSON — try next candidate */
    }
  }

  return {};
}

/**
 * Extract a street address from vCard ADR fields or common meta/structured text
 * patterns before falling back to the inline street-number regex.
 */
export function extractStructuredAddress(content: string): string | undefined {
  // vCard ADR field: ADR;TYPE=work:;;123 Main St;Springfield;IL;62701;USA
  const vcardMatch = content.match(/\bADR[^:\n]*:(.*)/i);
  if (vcardMatch) {
    const cleaned = vcardMatch[1]
      .replace(/;+/g, ', ')
      .replace(/^,\s*/, '')
      .replace(/,\s*,/g, ',')
      .trim();
    if (cleaned.length > 5) return cleaned;
  }

  // Meta / structured-text key-value pairs
  const kvPatterns: RegExp[] = [
    /street[_\s-]?address["'\s]*[:=]["'\s]*([^\n"'<]{5,80})/i,
    /address["'\s]*[:=]["'\s]*(\d+[^\n"'<]{5,80})/i,
  ];
  for (const p of kvPatterns) {
    const mm = content.match(p);
    if (mm) {
      const val = mm[1].trim().replace(/\*\*/g, '');
      if (val.length >= 5) return val;
    }
  }

  return undefined;
}

/**
 * Check whether a URL belongs to a known aggregator / directory domain that
 * lists many facilities.  These pages inflate candidate count without adding
 * actionable individual-community data.
 */
export function isAggregatorUrl(url: string): boolean {
  return AGGREGATOR_DOMAINS.some(d => url.includes(d));
}

export function extractCommunitiesFromText(
  content: string,
  sourceUrl: string,
  city?: string,
  state?: string
): DiscoveredCommunity[] {
  const communities: DiscoveredCommunity[] = [];

  let domain = '';
  try {
    domain = new URL(sourceUrl).hostname.replace('www.', '');
  } catch {
    domain = sourceUrl;
  }

  // Skip aggregator pages even if they slipped past the DuckDuckGo filter
  if (isAggregatorUrl(sourceUrl)) {
    return communities;
  }

  const lowerContent = content.toLowerCase();
  const isSeniorRelated = SENIOR_LIVING_KEYWORDS.some(kw => lowerContent.includes(kw));
  if (!isSeniorRelated) return communities;

  // ------------------------------------------------------------------
  // 1. Try JSON-LD structured data first — most accurate source
  // ------------------------------------------------------------------
  const jsonLd = extractJsonLdData(content);

  let name = jsonLd.name || '';
  let phone: string | undefined = jsonLd.phone;
  let address: string | undefined = jsonLd.address;

  // ------------------------------------------------------------------
  // 2. Fall back to title-based name extraction
  // ------------------------------------------------------------------
  if (!name || name.length < 4) {
    const titlePatterns = [
      /^#\s+(.+)$/m,
      /^Title:\s*(.+)$/im,
      /^=+\s*\n(.+)\n=+/m
    ];
    for (const p of titlePatterns) {
      const m = content.match(p);
      if (m) {
        const candidate = m[1].trim()
          .replace(/\s*[-|–]\s*.+$/, '')
          .replace(/\*\*/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (candidate.length > 3 && candidate.length < 100) {
          name = candidate;
          break;
        }
      }
    }
  }

  // Last resort: derive from domain name
  if (!name || name.length < 4) {
    name = domain
      .split('.')[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  if (name.length < 4) return communities;

  const hasSeniorWord = SENIOR_LIVING_KEYWORDS.some(kw =>
    name.toLowerCase().includes(kw.split(' ')[0])
  );

  const nameWords = name.split(' ');
  const looksLikeCommunityName = hasSeniorWord ||
    nameWords.some(w => ['Manor', 'Estate', 'Village', 'Lodge', 'Gardens', 'Residence',
      'House', 'Court', 'Place', 'Haven', 'Terrace', 'Heights', 'Oaks', 'Pines',
      'Meadows', 'Ridge', 'Grove', 'Pointe', 'Commons', 'Crossing'].includes(w));

  if (!looksLikeCommunityName && !hasSeniorWord) {
    return communities;
  }

  // ------------------------------------------------------------------
  // 3. Phone — use JSON-LD result or fall back to regex
  // ------------------------------------------------------------------
  if (!phone) {
    const phoneMatch = content.match(/(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
    phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : undefined;
  }

  // ------------------------------------------------------------------
  // 4. Address — try structured sources before inline regex
  // ------------------------------------------------------------------
  if (!address) {
    address = extractStructuredAddress(content);
  }
  if (!address) {
    const addressMatch = content.match(
      /\d{1,5}\s+[A-Za-z0-9][A-Za-z0-9\s,.-]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy|Highway|Hwy)\b[^,\n]{0,50}/i
    );
    address = addressMatch ? addressMatch[0].trim().replace(/\*\*/g, '') : undefined;
  }

  // ------------------------------------------------------------------
  // 5. Care types
  // ------------------------------------------------------------------
  const careTypes: string[] = [];
  if (lowerContent.includes('independent living')) careTypes.push('Independent Living');
  if (lowerContent.includes('assisted living')) careTypes.push('Assisted Living');
  if (lowerContent.includes('memory care') || lowerContent.includes('alzheimer') || lowerContent.includes('dementia')) {
    careTypes.push('Memory Care');
  }
  if (lowerContent.includes('skilled nursing') || lowerContent.includes('nursing home')) {
    careTypes.push('Skilled Nursing');
  }
  if (lowerContent.includes('respite care')) careTypes.push('Respite Care');
  if (careTypes.length === 0) careTypes.push('Senior Living');

  // ------------------------------------------------------------------
  // 6. Description snippet
  // ------------------------------------------------------------------
  let description = '';
  const descMatch = content.match(/(?:^|\n)([A-Z][^.\n]{40,200}\.)/m);
  if (descMatch) description = descMatch[1].trim();

  // ------------------------------------------------------------------
  // 7. Require at least one piece of actionable contact data.
  //    Candidates with neither phone nor address are not usable by families
  //    and must be dropped regardless of any other score bonuses.
  // ------------------------------------------------------------------
  if (!phone && !address) {
    return communities; // empty — skip this candidate
  }

  // ------------------------------------------------------------------
  // 8. Confidence score
  // ------------------------------------------------------------------
  let confidence = 35;
  if (phone) confidence += 20;
  if (address) confidence += 20;
  if (careTypes.length > 1) confidence += 10;
  if (city && lowerContent.includes(city.toLowerCase())) confidence += 10;
  if (looksLikeCommunityName) confidence += 5;
  if (jsonLd.name) confidence += 5;   // bonus for structured-data name

  communities.push({
    name,
    address,
    city: city || '',
    state: state || '',
    phone,
    website: sourceUrl,
    careTypes,
    description: description || undefined,
    source: `Free Discovery (${domain})`,
    confidence
  });

  return communities;
}

function deduplicateCommunities(communities: DiscoveredCommunity[]): DiscoveredCommunity[] {
  const seen = new Set<string>();
  return communities.filter(c => {
    const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Healthcare & Senior Resources Discovery
// ---------------------------------------------------------------------------

export interface DiscoveredEntity {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  description?: string;
  entityType: string;
  services: string[];
  source: string;
  confidence: number;
}

const HEALTHCARE_KEYWORDS = [
  'doctor', 'physician', 'clinic', 'hospital', 'medical', 'health', 'specialist',
  'pharmacy', 'therapist', 'nurse', 'care', 'geriatric', 'senior health',
  'home health', 'hospice', 'palliative', 'rehabilitation', 'physical therapy',
  'occupational therapy', 'speech therapy', 'dental', 'optometrist', 'cardiology',
  'neurology', 'orthopedic', 'podiatry', 'urology', 'dermatology', 'psychiatry'
];

const RESOURCE_KEYWORDS = [
  'senior center', 'area agency on aging', 'meals on wheels', 'food bank',
  'transportation', 'legal aid', 'elder law', 'social services', 'benefit',
  'caregiver support', 'respite', 'adult day', 'senior services', 'aging',
  'nutrition program', 'wellness program', 'volunteer', 'community center',
  'support group', 'home modification', 'utility assistance', 'medicaid'
];

const ENTITY_SKIP_DOMAINS = [
  'wikipedia.org', 'facebook.com', 'twitter.com', 'instagram.com', 'reddit.com',
  'youtube.com', 'linkedin.com', 'pinterest.com', 'google.com', 'bing.com',
  'yahoo.com', 'duckduckgo.com', 'amazon.com', 'yelp.com',
  'healthgrades.com', 'vitals.com', 'zocdoc.com', 'webmd.com', 'mayoclinic.org',
  'medlineplus.gov', 'nih.gov', 'cdc.gov', 'cms.gov'
];

/**
 * Discover healthcare providers via DuckDuckGo + Jina Reader
 */
export async function discoverHealthcareViaWeb(
  query: string,
  city?: string,
  state?: string
): Promise<DiscoveredEntity[]> {
  const locationPart = city && state ? `${city} ${state}` : city || state || query;
  const searchQueries = [
    `${locationPart} senior healthcare provider geriatric doctor clinic`,
    `${locationPart} home health hospice palliative care senior`
  ];
  return _discoverEntitiesViaWeb(searchQueries, locationPart, HEALTHCARE_KEYWORDS, 'healthcare', city, state);
}

/**
 * Discover senior resources via DuckDuckGo + Jina Reader
 */
export async function discoverResourcesViaWeb(
  query: string,
  city?: string,
  state?: string
): Promise<DiscoveredEntity[]> {
  const locationPart = city && state ? `${city} ${state}` : city || state || query;
  const searchQueries = [
    `${locationPart} senior center area agency on aging services`,
    `${locationPart} senior resources meals on wheels caregiver support`
  ];
  return _discoverEntitiesViaWeb(searchQueries, locationPart, RESOURCE_KEYWORDS, 'resource', city, state);
}

async function _discoverEntitiesViaWeb(
  searchQueries: string[],
  locationPart: string,
  keywords: string[],
  category: string,
  city?: string,
  state?: string
): Promise<DiscoveredEntity[]> {
  let allUrls: string[] = [];

  for (const q of searchQueries) {
    const urls = await searchDuckDuckGoForEntities(q, keywords);
    allUrls.push(...urls);
  }

  allUrls = [...new Set(allUrls)].slice(0, 6);
  console.log(`🦆 Entity Discovery (${category}): found ${allUrls.length} candidate URLs for "${locationPart}"`);

  const jinaResults = await Promise.allSettled(allUrls.map(url => fetchViaJina(url)));

  const entities: DiscoveredEntity[] = [];
  for (const result of jinaResults) {
    if (result.status === 'fulfilled' && result.value) {
      const extracted = extractEntityFromText(result.value.content, result.value.url, keywords, category, city, state);
      if (extracted) entities.push(extracted);
    }
  }

  const deduped = deduplicateEntities(entities);
  console.log(`✨ Entity Discovery (${category}): extracted ${deduped.length} candidates`);
  return deduped;
}

async function searchDuckDuckGoForEntities(query: string, keywords: string[]): Promise<string[]> {
  const urls: string[] = [];
  try {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 12000
    });

    const $ = cheerio.load(response.data);

    $('.result').each((i, element) => {
      if (i >= 12) return false;
      const $el = $(element);
      const titleEl = $el.find('.result__title a');
      let rawHref = titleEl.attr('href') || '';
      const title = titleEl.text().trim();
      const snippet = $el.find('.result__snippet').text().trim();

      let resolvedUrl = rawHref;
      if (rawHref.includes('duckduckgo.com/l/') || rawHref.includes('/l/?uddg=')) {
        try {
          const fullHref = rawHref.startsWith('//') ? `https:${rawHref}` : rawHref;
          const parsed = new URL(fullHref);
          const uddg = parsed.searchParams.get('uddg');
          if (uddg) resolvedUrl = decodeURIComponent(uddg);
        } catch { /* keep rawHref */ }
      }
      if (resolvedUrl.startsWith('//')) resolvedUrl = `https:${resolvedUrl}`;

      const combined = (title + ' ' + snippet + ' ' + resolvedUrl).toLowerCase();
      const isRelevant = keywords.some(kw => combined.includes(kw));
      const isSkipped = ENTITY_SKIP_DOMAINS.some(d => resolvedUrl.includes(d));
      const isValidUrl = resolvedUrl.startsWith('http') && ALLOWED_SSRF_PATTERN.test(resolvedUrl);

      if (isValidUrl && isRelevant && !isSkipped) {
        urls.push(resolvedUrl);
      }
    });
  } catch (error: any) {
    console.warn(`⚠️ DuckDuckGo entity search error: ${error.message}`);
  }
  return urls;
}

function extractEntityFromText(
  content: string,
  sourceUrl: string,
  keywords: string[],
  category: string,
  city?: string,
  state?: string
): DiscoveredEntity | null {
  let domain = '';
  try {
    domain = new URL(sourceUrl).hostname.replace('www.', '');
  } catch {
    domain = sourceUrl;
  }

  if (ENTITY_SKIP_DOMAINS.some(d => sourceUrl.includes(d))) return null;

  const lowerContent = content.toLowerCase();
  const isRelevant = keywords.some(kw => lowerContent.includes(kw));
  if (!isRelevant) return null;

  const jsonLd = extractJsonLdData(content);

  let name = jsonLd.name || '';
  let phone: string | undefined = jsonLd.phone;
  let address: string | undefined = jsonLd.address;

  if (!name || name.length < 4) {
    const titlePatterns = [/^#\s+(.+)$/m, /^Title:\s*(.+)$/im, /^=+\s*\n(.+)\n=+/m];
    for (const p of titlePatterns) {
      const m = content.match(p);
      if (m) {
        const candidate = m[1].trim()
          .replace(/\s*[-|–]\s*.+$/, '')
          .replace(/\*\*/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (candidate.length > 3 && candidate.length < 100) {
          name = candidate;
          break;
        }
      }
    }
  }

  if (!name || name.length < 4) {
    name = domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  if (name.length < 4) return null;

  if (!phone) {
    const phoneMatch = content.match(/(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
    phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : undefined;
  }

  if (!address) address = extractStructuredAddress(content);
  if (!address) {
    const addressMatch = content.match(
      /\d{1,5}\s+[A-Za-z0-9][A-Za-z0-9\s,.-]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy|Highway|Hwy)\b[^,\n]{0,50}/i
    );
    address = addressMatch ? addressMatch[0].trim().replace(/\*\*/g, '') : undefined;
  }

  if (!phone && !address) return null;

  const services: string[] = [];
  keywords.forEach(kw => {
    if (lowerContent.includes(kw) && kw.length > 4) {
      const label = kw.replace(/\b\w/g, c => c.toUpperCase());
      if (!services.includes(label)) services.push(label);
    }
  });

  let description = '';
  const descMatch = content.match(/(?:^|\n)([A-Z][^.\n]{40,200}\.)/m);
  if (descMatch) description = descMatch[1].trim();

  let confidence = 35;
  if (phone) confidence += 20;
  if (address) confidence += 20;
  if (services.length > 1) confidence += 10;
  if (city && lowerContent.includes(city.toLowerCase())) confidence += 10;
  if (jsonLd.name) confidence += 5;

  return {
    name,
    address,
    city: city || '',
    state: state || '',
    phone,
    website: sourceUrl,
    description: description || undefined,
    entityType: category,
    services: services.slice(0, 5),
    source: `Free Discovery (${domain})`,
    confidence
  };
}

function deduplicateEntities(entities: DiscoveredEntity[]): DiscoveredEntity[] {
  const seen = new Set<string>();
  return entities.filter(e => {
    const key = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
