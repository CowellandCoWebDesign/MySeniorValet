/**
 * Photo URL normalization
 * ========================
 * The `communities.photos` column is a Postgres `text[]`. Several enrichment
 * pipelines historically passed arrays of objects (`{ url, source }`) or
 * HTML-entity-encoded URLs into it. Objects get coerced to the literal string
 * "[object Object]" (unrenderable), and entities like `&amp;` break the URL
 * when the image proxy fetches it.
 *
 * `normalizePhotoUrls` guarantees a clean `string[]` of fetchable URLs:
 *  - extracts the URL string from object shapes
 *  - strips the local image-proxy prefix back to the original URL
 *  - decodes HTML entities (&amp; &#38; &#x26; &quot; …)
 *  - drops "[object Object]", blanks, and non-http(s) values
 *  - de-duplicates while preserving order
 */

/** Decode the small set of HTML entities that show up in scraped image URLs. */
export function decodeHtmlEntities(input: string): string {
  if (!input || input.indexOf("&") === -1) return input;
  return input
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&#0*38;/g, "&")
    .replace(/&#x0*26;/gi, "&")
    .replace(/&#0*47;/g, "/")
    .replace(/&#x0*2f;/gi, "/");
}

/** Extract a single URL string from a string or object-shaped photo entry. */
function extractUrl(entry: unknown): string | null {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object") {
    const o = entry as Record<string, unknown>;
    const candidate = o.url ?? o.image_url ?? o.imageUrl ?? o.src ?? o.original ?? null;
    if (typeof candidate === "string") return candidate;
  }
  return null;
}

/**
 * Normalize any photo array (strings and/or objects) into clean, fetchable
 * URL strings. Safe to call on already-clean arrays.
 */
export function normalizePhotoUrls(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  const seen = new Set<string>();

  for (const entry of input) {
    let url = extractUrl(entry);
    if (!url) continue;

    url = url.trim();
    if (!url || url === "[object Object]") continue;

    // Unwrap the local image proxy so we store the original upstream URL.
    if (url.includes("/api/image-proxy?url=")) {
      const encoded = url.slice(url.indexOf("/api/image-proxy?url=") + "/api/image-proxy?url=".length);
      try {
        url = decodeURIComponent(encoded);
      } catch {
        url = encoded;
      }
    }

    url = decodeHtmlEntities(url).trim();

    // Keep absolute http(s) URLs and local upload paths; drop everything else
    // (data URIs, "[object Object]", relative junk, blank strings).
    const isHttp = /^https?:\/\//i.test(url);
    const isLocalUpload = url.startsWith("/uploads/");
    if (!isHttp && !isLocalUpload) continue;

    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }

  return out;
}
