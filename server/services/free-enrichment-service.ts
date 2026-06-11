/**
 * Free Enrichment Service
 * =======================
 * Zero-cost community enrichment using:
 *   1. Jina AI Reader (https://r.jina.ai/{url}) — free, no API key
 *   2. DuckDuckGo HTML search — for finding a community's official website
 *   3. Groq Llama 3.3 70B (optional) — free tier, requires GROQ_API_KEY
 *
 * No Perplexity, Claude, or OpenAI calls. Compliant with Golden Data Rule.
 */

import * as cheerio from "cheerio";
import { lookup } from "dns/promises";
import { isIP } from "net";

export interface FreeEnrichmentResult {
  about?: string;
  amenities?: string[];
  careTypes?: string[];
  pricingContext?: string;
  phone?: string;
  email?: string;
  photos?: string[];
  sourceUrl?: string;
  sourceType: "official_website" | "web_search" | "none";
  structured: boolean;
}

const JINA_TIMEOUT_MS = 15_000;
const DDG_TIMEOUT_MS = 10_000;
const GROQ_TIMEOUT_MS = 20_000;

// ── SSRF guard (same logic as on-demand-enrichment-service) ──────────────────

async function isSafePublicUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const port = parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === "https:" ? 443 : 80;
  if (port !== 80 && port !== 443) return false;

  const host = parsed.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;

  if (isIP(host)) return !isPrivateIp(host);

  try {
    const addresses = await lookup(host, { all: true });
    if (!addresses.length) return false;
    return addresses.every((a) => !isPrivateIp(a.address));
  } catch {
    return false;
  }
}

function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => isNaN(n) || n < 0 || n > 255)) return true;
    const [a, b] = p;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    if (/^fe[89ab]/.test(lower)) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("ff")) return true;
    return false;
  }
  return true;
}

// ── DuckDuckGo website finder ─────────────────────────────────────────────────

/**
 * Normalize a URL candidate from DuckDuckGo HTML results into an absolute
 * https:// URL. DDG returns three common formats:
 *   1. Redirect wrapper:  //duckduckgo.com/l/?uddg=https%3A%2F%2F...
 *   2. Protocol-relative: //www.example.com
 *   3. Bare domain text:  www.example.com  (no scheme, no slashes)
 *   4. Already absolute:  https://www.example.com
 * Returns null when the input cannot be resolved to a usable absolute URL.
 */
function normalizeDdgUrl(raw: string): string | null {
  if (!raw || !raw.includes(".")) return null;

  // Strip leading/trailing whitespace
  raw = raw.trim();

  // Case 1: DDG redirect wrapper — extract `uddg` query param
  if (raw.includes("duckduckgo.com/l/") || raw.startsWith("//duckduckgo.com")) {
    try {
      const absolute = raw.startsWith("//") ? `https:${raw}` : raw;
      const parsed = new URL(absolute);
      const uddg = parsed.searchParams.get("uddg");
      if (uddg) return normalizeDdgUrl(decodeURIComponent(uddg));
    } catch {
      return null;
    }
    return null;
  }

  // Case 2: Protocol-relative  //www.example.com
  if (raw.startsWith("//")) {
    return normalizeDdgUrl(`https:${raw}`);
  }

  // Case 3: Already absolute http(s)
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).origin;
    } catch {
      return null;
    }
  }

  // Case 4: Bare domain like www.example.com or example.com
  if (!raw.includes(" ") && raw.includes(".")) {
    try {
      return new URL(`https://${raw}`).origin;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Result from a DuckDuckGo HTML search — includes both the best website URL
 * found (if any) and up to 3 search-result snippets that can be used as a
 * text-only fallback when no official website is available.
 */
export interface DdgSearchResult {
  website: string | null;
  snippets: string[];
}

/**
 * Search DuckDuckGo for a community.  Returns:
 *   - `website`: the first non-directory result URL that passes the SSRF guard, or null
 *   - `snippets`: up to 3 `.result__snippet` texts from the search results page
 *
 * Snippets give us a free text-only fallback for communities whose official
 * website is behind Cloudflare or similar blockers that Jina cannot penetrate.
 */
export async function searchDuckDuckGo(
  name: string,
  city: string,
  state: string,
): Promise<DdgSearchResult> {
  try {
    const query = encodeURIComponent(`"${name}" senior living ${city} ${state} official website`);
    const url = `https://duckduckgo.com/html/?q=${query}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MySeniorValetBot/1.0; +https://myseniorvalet.com/about)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(DDG_TIMEOUT_MS),
    });

    if (!response.ok) return { website: null, snippets: [] };

    const html = await response.text();
    const $ = cheerio.load(html);

    // ── Website candidates ────────────────────────────────────────────────────
    const rawCandidates: string[] = [];

    $(".result__a, .result__url").each((_, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (href) rawCandidates.push(href);
      if (text && text.includes(".")) rawCandidates.push(text);
    });

    $(".result .result__title a").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href) rawCandidates.push(href);
    });

    let website: string | null = null;
    for (const raw of rawCandidates) {
      const normalized = normalizeDdgUrl(raw);
      if (!normalized) continue;
      if (isDirectorySite(normalized)) continue;
      if (await isSafePublicUrl(normalized)) {
        website = normalized;
        break;
      }
    }

    // ── Snippets (text-only fallback) ─────────────────────────────────────────
    const snippets: string[] = [];
    $(".result__snippet").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 30) {
        snippets.push(text);
      }
    });

    return { website, snippets: snippets.slice(0, 3) };
  } catch (err: any) {
    console.log(`⚠️ DuckDuckGo search failed for "${name}": ${err?.message}`);
    return { website: null, snippets: [] };
  }
}

/**
 * Search DuckDuckGo for a community's official website.
 * Returns the first plausible result URL, or null if none found.
 *
 * @deprecated Use searchDuckDuckGo() for snippet support.
 */
export async function findCommunityWebsite(
  name: string,
  city: string,
  state: string,
): Promise<string | null> {
  const result = await searchDuckDuckGo(name, city, state);
  return result.website;
}

function isDirectorySite(url: string): boolean {
  const lower = url.toLowerCase();
  return [
    "aplaceformom",
    "caring.com",
    "seniorliving.com",
    "senioradvisor",
    "seniorhousin",
    "medicare.gov",
    "yelp.com",
    "yellowpages",
    "tripadvisor",
    "google.com",
    "bing.com",
    "facebook.com",
    "linkedin.com",
    "indeed.com",
  ].some((d) => lower.includes(d));
}

// ── Jina AI Reader ────────────────────────────────────────────────────────────

/**
 * Fetch a URL via Jina AI Reader (https://r.jina.ai/{url}) and return the
 * clean markdown content. The Jina Reader handles JS-heavy SPAs and returns
 * the visible text rather than raw HTML boilerplate.
 *
 * Free tier, no API key needed.
 */
export async function extractContentFromUrl(rawUrl: string): Promise<string | null> {
  if (!(await isSafePublicUrl(rawUrl))) {
    console.log(`🚫 Jina extraction blocked: unsafe URL ${rawUrl}`);
    return null;
  }

  const jinaUrl = `https://r.jina.ai/${rawUrl}`;

  try {
    const response = await fetch(jinaUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MySeniorValetBot/1.0; +https://myseniorvalet.com/about)",
        Accept: "text/plain, text/markdown, */*",
      },
      signal: AbortSignal.timeout(JINA_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.log(`⚠️ Jina Reader returned ${response.status} for ${rawUrl}`);
      return null;
    }

    const text = await response.text();
    if (!text || text.length < 200) return null;

    // Reject obvious error pages / Jina failure messages
    if (/error fetching|unable to fetch|403 forbidden|access denied|cloudflare/i.test(text.substring(0, 500))) {
      return null;
    }

    // Trim to 8 KB — enough for structure extraction, saves Groq tokens
    return text.slice(0, 8000);
  } catch (err: any) {
    console.log(`⚠️ Jina Reader failed for ${rawUrl}: ${err?.message}`);
    return null;
  }
}

// ── Website image scraper ─────────────────────────────────────────────────────

const IMG_FETCH_TIMEOUT_MS = 12_000;

/**
 * Scrape real photos from a community's website by fetching the raw HTML and
 * extracting og:image / twitter:image meta tags plus inline <img> sources.
 *
 * Jina Reader returns markdown that strips image URLs, so we fetch the raw HTML
 * directly here. og:image meta tags are present even on JS-heavy SPAs because
 * they live in the static <head> for social sharing.
 *
 * Returns absolute, deduplicated image URLs (up to 30). The caller is expected
 * to filter out stock/placeholder/icon assets and trim to its display limit.
 */
export async function scrapeWebsiteImages(rawUrl: string): Promise<string[]> {
  try {
    // SSRF-safe fetch: validate every hop (redirects can point at private/internal
    // hosts or cloud metadata endpoints, so a single up-front check is not enough).
    const MAX_REDIRECTS = 5;
    let currentUrl = rawUrl;
    let response: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isSafePublicUrl(currentUrl))) {
        console.log(`🚫 Image scrape blocked: unsafe URL ${currentUrl}`);
        return [];
      }

      const resp = await fetch(currentUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MySeniorValetBot/1.0; +https://myseniorvalet.com/about)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(IMG_FETCH_TIMEOUT_MS),
      });

      // Manual redirect: revalidate the target before following it
      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get("location");
        if (!location) break;
        const next = new URL(location, currentUrl);
        if (next.protocol !== "http:" && next.protocol !== "https:") {
          console.log(`🚫 Image scrape blocked: non-http redirect ${next.href}`);
          return [];
        }
        currentUrl = next.href;
        continue;
      }

      response = resp;
      break;
    }

    if (!response) {
      console.log(`⚠️ Image scrape: too many redirects from ${rawUrl}`);
      return [];
    }

    if (!response.ok) {
      console.log(`⚠️ Image scrape: ${response.status} for ${currentUrl}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const base = new URL(currentUrl);
    const found: string[] = [];

    const pushAbsolute = (src?: string | null) => {
      if (!src) return;
      const trimmed = src.trim();
      if (!trimmed || trimmed.startsWith("data:")) return;
      try {
        const abs = new URL(trimmed, base).href;
        if (abs.startsWith("http")) found.push(abs);
      } catch {
        /* ignore malformed src */
      }
    };

    // 1. Social/share meta images (reliable hero image, present even on SPAs)
    $(
      'meta[property="og:image"], meta[property="og:image:url"], meta[name="twitter:image"], meta[name="twitter:image:src"]',
    ).each((_, el) => pushAbsolute($(el).attr("content")));

    // 2. Inline images, including common lazy-loaded variants
    $("img").each((_, el) => {
      const $el = $(el);
      pushAbsolute(
        $el.attr("src") ||
          $el.attr("data-src") ||
          $el.attr("data-lazy-src") ||
          $el.attr("data-original"),
      );
    });

    // Dedupe, preserve order (og:image first), cap at 30 — caller filters & trims
    return Array.from(new Set(found)).slice(0, 30);
  } catch (err: any) {
    console.log(`⚠️ Image scrape failed for ${rawUrl}: ${err?.message}`);
    return [];
  }
}

// ── Groq structuring (optional) ───────────────────────────────────────────────

export interface StructuredEnrichment {
  about: string;
  amenities: string[];
  careTypes: string[];
  pricingContext: string;
}

/**
 * Use Groq Llama 3.3 70B to parse raw Jina markdown into a structured
 * enrichment object. Returns null if GROQ_API_KEY is unset or the call fails
 * — the caller should fall back to storing raw text.
 */
export async function structureWithGroq(
  rawMarkdown: string,
  communityName: string,
): Promise<StructuredEnrichment | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a senior living data extraction assistant.
Parse the following markdown page from the website of "${communityName}" and return ONLY a JSON object with these fields:
{
  "about": "<2-4 sentence description of the community, from their own words>",
  "amenities": ["<amenity 1>", "<amenity 2>", ...],
  "careTypes": ["<care type 1>", ...],
  "pricingContext": "<pricing information if mentioned, otherwise empty string>"
}

Rules:
- Use only information clearly stated on the page. Never invent data.
- amenities: list actual amenities mentioned (max 15 items)
- careTypes: only values from: Independent Living, Assisted Living, Memory Care, Skilled Nursing, Respite Care, Continuing Care, Rehabilitation
- pricingContext: exact pricing text if present, otherwise ""
- about: use the community's own description language, not generic text
- Return ONLY the JSON object, no other text.

MARKDOWN:
${rawMarkdown.slice(0, 6000)}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`⚠️ Groq API error ${response.status}: ${errBody.slice(0, 200)}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      about: typeof parsed.about === "string" ? parsed.about.trim() : "",
      amenities: Array.isArray(parsed.amenities) ? parsed.amenities.filter((a: any) => typeof a === "string") : [],
      careTypes: Array.isArray(parsed.careTypes) ? parsed.careTypes.filter((c: any) => typeof c === "string") : [],
      pricingContext: typeof parsed.pricingContext === "string" ? parsed.pricingContext.trim() : "",
    };
  } catch (err: any) {
    console.warn(`⚠️ Groq structuring failed for "${communityName}": ${err?.message}`);
    return null;
  }
}

// ── Keyword extractors (free fallback when Groq absent) ───────────────────────

const CARE_TYPE_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Independent Living", pattern: /independent living/i },
  { label: "Assisted Living", pattern: /assisted living/i },
  { label: "Memory Care", pattern: /memory care|alzheimer|dementia care/i },
  { label: "Skilled Nursing", pattern: /skilled nursing|nursing home|long[- ]term care/i },
  { label: "Respite Care", pattern: /respite care/i },
  { label: "Continuing Care", pattern: /continuing care|ccrc|life plan community/i },
  { label: "Rehabilitation", pattern: /rehabilitation|rehab services|short[- ]term rehab/i },
];

const AMENITY_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "Dining Services", pattern: /dining|restaurant[- ]style|chef[- ]prepared|meals? (?:included|provided)/i },
  { label: "Fitness Center", pattern: /fitness center|gym|exercise (?:room|classes)/i },
  { label: "Transportation", pattern: /transportation|scheduled transport|shuttle/i },
  { label: "Housekeeping", pattern: /housekeeping|laundry service/i },
  { label: "Pet Friendly", pattern: /pet[- ]friendly|pets? welcome/i },
  { label: "Salon/Spa", pattern: /salon|spa services|beauty (?:salon|shop)/i },
  { label: "Library", pattern: /\blibrary\b/i },
  { label: "Garden/Courtyard", pattern: /garden|courtyard|outdoor (?:space|patio)/i },
  { label: "Swimming Pool", pattern: /swimming pool|indoor pool|heated pool/i },
  { label: "24/7 Staff", pattern: /24[\/-]?7|24[- ]hour (?:staff|care|support)|round[- ]the[- ]clock/i },
  { label: "Social Activities", pattern: /social activities|activity calendar|recreational programs/i },
  { label: "Medication Management", pattern: /medication management|medication assistance/i },
];

function extractKeywordCareTypes(text: string): string[] {
  return CARE_TYPE_PATTERNS.filter((k) => k.pattern.test(text)).map((k) => k.label);
}

function extractKeywordAmenities(text: string): string[] {
  return AMENITY_PATTERNS.filter((k) => k.pattern.test(text)).map((k) => k.label);
}

function extractAboutFromMarkdown(markdown: string): string {
  // Strip markdown headings, links, images, code blocks
  const clean = markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  // Find first 2-3 paragraphs that look like prose
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const proseSentences = sentences.filter(
    (s) => s.length > 40 && !/^(\d+|•|-|\*|#)/.test(s.trim()),
  );

  let about = "";
  for (const s of proseSentences) {
    if (about.length >= 400) break;
    about += (about ? " " : "") + s.trim();
  }

  return about.slice(0, 600);
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

/**
 * Run the full free enrichment pipeline for a community:
 * 1. Use stored website URL, or DuckDuckGo to find one
 * 2. Extract content via Jina AI Reader
 * 3. Structure with Groq (if API key available) or keyword extraction
 */
export async function enrichCommunityFree(params: {
  name: string;
  city: string;
  state: string;
  websiteUrl?: string | null;
}): Promise<FreeEnrichmentResult> {
  const { name, city, state, websiteUrl } = params;

  let targetUrl: string | null = websiteUrl || null;
  let sourceType: FreeEnrichmentResult["sourceType"] = "none";

  // Step 1: Use stored URL or fall back to DuckDuckGo search
  let ddgSnippets: string[] = [];
  if (!targetUrl) {
    console.log(`🔍 DuckDuckGo: searching for "${name}" in ${city}, ${state}`);
    const ddgResult = await searchDuckDuckGo(name, city, state);
    targetUrl = ddgResult.website;
    ddgSnippets = ddgResult.snippets;
    if (targetUrl) {
      sourceType = "web_search";
      console.log(`✅ Found via DuckDuckGo: ${targetUrl}`);
    } else if (ddgSnippets.length > 0) {
      console.log(`📝 DuckDuckGo: no website found but got ${ddgSnippets.length} snippets for "${name}"`);
    }
  } else {
    sourceType = "official_website";
  }

  // Snippet-only fallback: no website found but we have search result snippets
  if (!targetUrl && ddgSnippets.length > 0) {
    const snippetText = ddgSnippets.join(" ").slice(0, 600);
    const careTypes = extractKeywordCareTypes(snippetText);
    const amenities = extractKeywordAmenities(snippetText);
    console.log(`📄 Using DuckDuckGo snippets as text-only fallback for "${name}" (${snippetText.length} chars)`);
    return {
      about: snippetText,
      careTypes: careTypes.length > 0 ? careTypes : undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      sourceType: "web_search",
      structured: false,
    };
  }

  if (!targetUrl) {
    console.log(`📭 No website or snippets found for "${name}" — returning empty enrichment`);
    return { sourceType: "none", structured: false };
  }

  // Step 2: Extract content via Jina AI Reader.
  // If Jina fails on the stored website, fall back to DuckDuckGo discovery + retry.
  console.log(`📄 Jina Reader: extracting content from ${targetUrl}`);
  let rawMarkdown = await extractContentFromUrl(targetUrl);

  if (!rawMarkdown && sourceType === "official_website") {
    console.log(`⚠️ Jina failed on stored website — trying DuckDuckGo fallback for "${name}"`);
    const discoveredUrl = await findCommunityWebsite(name, city, state);
    if (discoveredUrl && discoveredUrl !== targetUrl) {
      console.log(`🔍 Retrying Jina on DuckDuckGo-discovered URL: ${discoveredUrl}`);
      rawMarkdown = await extractContentFromUrl(discoveredUrl);
      if (rawMarkdown) {
        targetUrl = discoveredUrl;
        sourceType = "web_search";
        console.log(`✅ DuckDuckGo fallback succeeded: ${rawMarkdown.length} chars`);
      }
    }
  }

  if (!rawMarkdown) {
    console.log(`⚠️ Jina extraction returned nothing for ${targetUrl} (all attempts exhausted)`);
    return { sourceType: "none", structured: false };
  }

  console.log(`✅ Jina extracted ${rawMarkdown.length} chars from ${targetUrl}`);

  // Step 3: Structure with Groq (optional) or keyword extraction
  let structured: StructuredEnrichment | null = null;
  if (process.env.GROQ_API_KEY) {
    console.log(`🤖 Groq: structuring content for "${name}"`);
    structured = await structureWithGroq(rawMarkdown, name);
    if (structured) {
      console.log(
        `✅ Groq structured: ${structured.amenities.length} amenities, ` +
          `${structured.careTypes.length} care types, about: ${structured.about.length} chars`,
      );
    }
  }

  if (structured) {
    return {
      about: structured.about || undefined,
      amenities: structured.amenities.length > 0 ? structured.amenities : undefined,
      careTypes: structured.careTypes.length > 0 ? structured.careTypes : undefined,
      pricingContext: structured.pricingContext || undefined,
      sourceUrl: targetUrl,
      sourceType,
      structured: true,
    };
  }

  // Keyword fallback (no Groq key or Groq failed)
  const about = extractAboutFromMarkdown(rawMarkdown);
  const amenities = extractKeywordAmenities(rawMarkdown);
  const careTypes = extractKeywordCareTypes(rawMarkdown);

  return {
    about: about || undefined,
    amenities: amenities.length > 0 ? amenities : undefined,
    careTypes: careTypes.length > 0 ? careTypes : undefined,
    sourceUrl: targetUrl,
    sourceType,
    structured: false,
  };
}
