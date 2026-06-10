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

const SKIP_DOMAINS = [
  'wikipedia.org', 'facebook.com', 'twitter.com', 'instagram.com', 'reddit.com',
  'youtube.com', 'linkedin.com', 'pinterest.com', 'google.com', 'bing.com',
  'yahoo.com', 'duckduckgo.com', 'amazon.com', 'yelp.com'
];

const ALLOWED_SSRF_PATTERN = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/;

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
  console.log(`✨ Free Discovery: extracted ${deduped.length} candidate communities`);
  return deduped;
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

function extractCommunitiesFromText(
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

  const lowerContent = content.toLowerCase();
  const isSeniorRelated = SENIOR_LIVING_KEYWORDS.some(kw => lowerContent.includes(kw));
  if (!isSeniorRelated) return communities;

  let name = '';

  const titlePatterns = [
    /^#\s+(.+)$/m,
    /^Title:\s*(.+)$/im,
    /^=+\s*\n(.+)\n=+/m
  ];
  for (const p of titlePatterns) {
    const m = content.match(p);
    if (m) {
      name = m[1].trim()
        .replace(/\s*[-|–]\s*.+$/, '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (name.length > 3 && name.length < 100) break;
      name = '';
    }
  }

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

  const phoneMatch = content.match(/(?:\+?1[-.\s]?)?\(?([2-9]\d{2})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : undefined;

  const addressMatch = content.match(
    /\d{1,5}\s+[A-Za-z0-9][A-Za-z0-9\s,.-]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy|Highway|Hwy)\b[^,\n]{0,50}/i
  );
  const address = addressMatch ? addressMatch[0].trim().replace(/\*\*/g, '') : undefined;

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

  let description = '';
  const descMatch = content.match(/(?:^|\n)([A-Z][^.\n]{40,200}\.)/m);
  if (descMatch) description = descMatch[1].trim();

  let confidence = 35;
  if (phone) confidence += 20;
  if (address) confidence += 20;
  if (careTypes.length > 1) confidence += 10;
  if (city && lowerContent.includes(city.toLowerCase())) confidence += 10;
  if (looksLikeCommunityName) confidence += 5;

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
