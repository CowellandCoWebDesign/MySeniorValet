/**
 * Web Search Provider Layer
 * =========================
 * A small, paid-AI-free search abstraction with automatic failover. All search
 * callers (photo discovery, self-healing community/entity discovery) go through
 * `webSearch()` and receive a stable result shape regardless of which engine
 * actually answered.
 *
 * Providers (tried in order):
 *   1. DuckDuckGo via its internal `vqd` token + JSON endpoint (the
 *      `Snazzah/duck-duck-scrape` technique). This does NOT scrape the
 *      `duckduckgo.com/html/` page, which is the surface DDG protects with its
 *      HTTP-202 bot challenge.
 *   2. Bing HTML results (no API key) as a free fallback engine — the
 *      `Aas-ee/open-webSearch` approach, vendored here as a single engine
 *      scraper. Used when DuckDuckGo is throttled / returns nothing.
 *
 * Golden Data Rule compliant: no paid search APIs (SerpAPI/Serper/Tavily/Exa),
 * no Brave Search API, no Docker-only services (SearXNG), no API keys.
 *
 * Resilience contract: a provider failure NEVER throws into the caller — it is
 * caught, logged, and the next provider is tried. Each provider has a short
 * timeout so one slow engine cannot stall the pipeline.
 */

import * as cheerio from "cheerio";
import { search as ddgSearch, SafeSearchType } from "duck-duck-scrape";

/** A normalized web search result, identical no matter which engine produced it. */
export interface WebSearchResult {
  title: string;
  /** Absolute http(s) URL of the result (redirect wrappers already decoded). */
  url: string;
  snippet: string;
}

export interface WebSearchResponse {
  /** Which engine answered: "duckduckgo", "bing", or "none". */
  provider: string;
  results: WebSearchResult[];
}

const PROVIDER_TIMEOUT_MS = 12_000;

const BING_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

/** Wrap a promise with a hard timeout so a hung provider can't stall failover. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function stripTags(html: string): string {
  return (html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// ── Provider 1: DuckDuckGo (vqd token + JSON endpoint) ───────────────────────

async function duckDuckGoProvider(query: string): Promise<WebSearchResult[]> {
  const res = await ddgSearch(query, { safeSearch: SafeSearchType.OFF });
  if (!res || res.noResults || !Array.isArray(res.results)) return [];
  return res.results
    .map((r) => ({
      title: (r.title || "").trim(),
      url: r.url,
      snippet: stripTags(r.description || ""),
    }))
    .filter((r) => r.url && /^https?:\/\//i.test(r.url));
}

// ── Provider 2: Bing HTML (no API key) ───────────────────────────────────────

/**
 * Bing wraps every organic result URL in a `bing.com/ck/a?...&u=a1<base64>`
 * redirect. Decode the `u` param (drop the leading "a1", base64url-decode) to
 * recover the real destination URL. Returns null if the href is not decodable.
 */
function decodeBingUrl(href: string | undefined): string | null {
  if (!href) return null;
  try {
    if (/^https?:\/\//i.test(href) && !href.includes("bing.com/ck/")) return href;
    const u = new URL(href, "https://www.bing.com");
    const uParam = u.searchParams.get("u");
    if (!uParam) return null;
    let b64 = uParam.startsWith("a1") ? uParam.slice(2) : uParam;
    b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const decoded = Buffer.from(b64, "base64").toString("utf-8");
    return /^https?:\/\//i.test(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

async function bingProvider(query: string): Promise<WebSearchResult[]> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=20&setlang=en-US`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": BING_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      // Pins English results regardless of the datacenter IP's geolocation.
      Cookie: "SRCHHPGUSR=SRCHLANG=en",
    },
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`bing returned HTTP ${response.status}`);
  }

  const $ = cheerio.load(await response.text());
  const out: WebSearchResult[] = [];

  $("li.b_algo").each((_, el) => {
    const $el = $(el);
    const a = $el.find("h2 a").first();
    const realUrl = decodeBingUrl(a.attr("href"));
    if (!realUrl) return;
    const snippet = $el.find(".b_caption p, p.b_lineclamp2, p").first().text().trim();
    out.push({
      title: a.text().trim(),
      url: realUrl,
      snippet,
    });
  });

  return out;
}

// ── Orchestrator with automatic failover ─────────────────────────────────────

interface Provider {
  name: string;
  fn: (query: string) => Promise<WebSearchResult[]>;
}

/** DuckDuckGo is primary; Bing is the free no-key fallback engine. */
const PROVIDERS: Provider[] = [
  { name: "duckduckgo", fn: duckDuckGoProvider },
  { name: "bing", fn: bingProvider },
];

/**
 * Run a web search with automatic provider failover.
 *
 * Tries each provider in order. A provider that throws (bot challenge, non-OK
 * status, timeout) or returns zero results triggers a fallback to the next
 * provider. Never throws — returns `{ provider: "none", results: [] }` if every
 * provider is exhausted. The chosen provider is logged, and failover is logged
 * explicitly so operators can see when DuckDuckGo was throttled.
 */
export async function webSearch(query: string): Promise<WebSearchResponse> {
  for (let i = 0; i < PROVIDERS.length; i++) {
    const provider = PROVIDERS[i];
    try {
      const results = await withTimeout(
        provider.fn(query),
        PROVIDER_TIMEOUT_MS,
        `search:${provider.name}`,
      );
      if (results.length > 0) {
        if (i === 0) {
          console.log(`🔍 Search: "${provider.name}" answered (${results.length} results)`);
        } else {
          console.log(
            `🔁 Search failover → "${provider.name}" answered (${results.length} results) for "${query.slice(0, 60)}"`,
          );
        }
        return { provider: provider.name, results };
      }
      console.log(`⚠️ Search provider "${provider.name}" returned 0 results — trying next`);
    } catch (err: any) {
      console.log(
        `⚠️ Search provider "${provider.name}" failed (${err?.message || err}) — trying next`,
      );
    }
  }
  console.log(`❌ Search: all providers exhausted, no results for "${query.slice(0, 60)}"`);
  return { provider: "none", results: [] };
}
