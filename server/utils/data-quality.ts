/**
 * Data Quality Utilities
 * ======================
 * Centralized helpers used on EVERY community write path to prevent AI-guessed
 * or fabricated data from being persisted (Golden Data Rule), plus heuristics
 * used by the data-quality scan to detect existing suspect records.
 *
 * Pure, dependency-light functions:
 *   - cleanCitationArtifacts / hasCitationArtifacts — strip/detect Perplexity-style
 *     citation markers ([1], [2][3], trailing [n] on URLs, *(verify)*, etc.)
 *   - isIncompleteAddress — detect "City, State" placeholder addresses
 *   - looksLikeGuessedName — detect names guessed from search-result titles
 *   - isSafePublicUrl / isReachableWebsite — SSRF-safe website reachability check
 *     so we never persist a guessed/404 domain
 */

import { lookup } from "dns/promises";
import { isIP } from "net";

// ── Citation / artifact cleaning ─────────────────────────────────────────────

/**
 * Remove citation artifacts that AI models leave behind in text fields:
 *   - [1], [12], [ 1 ], [1][2][3]            (numeric citation markers)
 *   - dawsonheights.ca[2]                     (trailing citation on a URL/word)
 *   - *(verify)*, (verify), *(unverified)*    (verification annotations)
 *   - [citation needed], [source], [ref]      (wiki-style markers)
 * Returns undefined when the cleaned result is empty.
 */
export function cleanCitationArtifacts(
  text: string | null | undefined,
): string | undefined {
  if (text == null) return undefined;
  const cleaned = String(text)
    // verification annotations, with or without surrounding asterisks
    .replace(/\s*\*?\(\s*(?:un)?verif(?:y|ied)\s*\)\*?/gi, "")
    // wiki-style markers
    .replace(/\s*\[\s*(?:citation needed|source|ref|verify)\s*\]/gi, "")
    .replace(/\s*\(\s*citation needed\s*\)/gi, "")
    // numeric citation markers, including chained [1][2] and spaced [ 1 ]
    .replace(/\s*\[\s*\d+\s*\](?:\s*\[\s*\d+\s*\])*/g, "")
    // collapse whitespace introduced by removals
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length ? cleaned : undefined;
}

/**
 * True when the text still contains a recognizable citation artifact.
 * Used by the data-quality scan to detect already-persisted bad fields.
 */
export function hasCitationArtifacts(text: string | null | undefined): boolean {
  if (!text) return false;
  return /\[\s*\d+\s*\]|\*?\(\s*(?:un)?verif(?:y|ied)\s*\)\*?|\[\s*(?:citation needed|source|ref|verify)\s*\]/i.test(
    String(text),
  );
}

/**
 * Recursively strip citation artifacts from every string in an arbitrary JSON
 * value (objects, arrays, nested structures). Used to sanitize structured
 * enrichment blobs (e.g. competitive-analysis intelligence) before they are
 * persisted, so AI citation markers never survive in any stored field.
 * Non-string leaves are returned unchanged; empty cleaned strings become "".
 */
export function cleanCitationArtifactsDeep<T>(value: T): T {
  if (typeof value === "string") {
    return (cleanCitationArtifacts(value) ?? "") as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => cleanCitationArtifactsDeep(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = cleanCitationArtifactsDeep(v);
    }
    return out as unknown as T;
  }
  return value;
}

// ── Address completeness ─────────────────────────────────────────────────────

function normalizeAddr(s: string | null | undefined): string {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ");
}

/**
 * True when an address is only a "City, State" placeholder (no real street) or
 * is empty / has no street number. Such addresses must be flagged as incomplete
 * rather than presented as a verified street address.
 */
export function isIncompleteAddress(
  address: string | null | undefined,
  city?: string | null,
  state?: string | null,
): boolean {
  if (!address || !address.trim()) return true;
  const a = normalizeAddr(address);

  const candidates = [
    normalizeAddr(`${city || ""}, ${state || ""}`),
    normalizeAddr(`${city || ""} ${state || ""}`),
    normalizeAddr(city),
    normalizeAddr(state),
  ].filter((c) => c.length > 0);

  if (candidates.includes(a)) return true;

  // A real street address contains at least one digit (house/box number).
  if (!/\d/.test(address)) return true;

  return false;
}

// ── Guessed / generic name detection ─────────────────────────────────────────

const GUESSED_NAME_PATTERNS: RegExp[] = [
  // List-article titles: "10 Best ...", "Top 5 ..."
  /^\s*(?:the\s+)?\d+\s+(?:best|top|cheapest|affordable)\b/i,
  // "... near you / near me"
  /\bnear\s+(?:you|me)\b/i,
  // directory / guide titles
  /\bsenior\s+living\s+(?:guide|directory|options|near)\b/i,
  /\b(?:guide|directory|listings?|reviews?)\s*$/i,
  // search-result title separators / truncation
  /[|►]/,
  /\.\.\.|…/,
  // explicit placeholders
  /\b(?:unknown|n\/a|not\s+available|placeholder|untitled)\b/i,
];

/**
 * True when a community name looks guessed from a search-result title rather
 * than being a real community name (article/list titles, directory headings,
 * citation artifacts, absurd length, placeholders).
 */
export function looksLikeGuessedName(name: string | null | undefined): boolean {
  if (!name || !name.trim()) return true;
  const n = name.trim();
  if (hasCitationArtifacts(n)) return true;
  if (n.length > 100) return true;
  return GUESSED_NAME_PATTERNS.some((p) => p.test(n));
}

// ── SSRF-safe website reachability ───────────────────────────────────────────

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

/**
 * SSRF guard: http(s) + ports 80/443 only, reject localhost/.local/.internal,
 * DNS-resolve and reject private/loopback/link-local/CGNAT/multicast addresses.
 */
export async function isSafePublicUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const port = parsed.port
    ? parseInt(parsed.port, 10)
    : parsed.protocol === "https:"
      ? 443
      : 80;
  if (port !== 80 && port !== 443) return false;

  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  )
    return false;

  if (isIP(host)) return !isPrivateIp(host);

  try {
    const addresses = await lookup(host, { all: true });
    if (!addresses.length) return false;
    return addresses.every((a) => !isPrivateIp(a.address));
  } catch {
    return false;
  }
}

/**
 * True when a website actually resolves (reachable, not a 404/error/guessed
 * domain). Follows up to 4 redirects manually, re-validating the SSRF guard on
 * every hop. Uses GET (some hosts reject HEAD) with a short timeout.
 *
 * Used before persisting any community website so AI-guessed/unreachable
 * domains are dropped rather than saved.
 */
export async function isReachableWebsite(
  rawUrl: string | null | undefined,
  timeoutMs = 8000,
): Promise<boolean> {
  if (!rawUrl || !rawUrl.trim()) return false;
  let current = rawUrl.trim();
  if (!/^https?:\/\//i.test(current)) current = `https://${current}`;

  for (let hop = 0; hop < 4; hop++) {
    if (!(await isSafePublicUrl(current))) return false;

    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MySeniorValetBot/1.0; +https://myseniorvalet.com/about)",
        },
      });
    } catch {
      return false;
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return false;
      try {
        current = new URL(loc, current).toString();
      } catch {
        return false;
      }
      continue;
    }

    // 2xx/3xx (non-redirect) = reachable; 4xx/5xx (incl. 404) = not reachable.
    return res.status >= 200 && res.status < 400;
  }

  return false;
}
