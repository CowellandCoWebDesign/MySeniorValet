/**
 * Website URL sanitation — some enrichment writes left corrupted values in
 * communities.website: markdown bold artifacts ("**https://example.com**"),
 * markdown links ("[Site](https://example.com)"), bare domains with no
 * protocol, or junk placeholder strings. Normalize on read AND write.
 */

const JUNK_VALUES = new Set([
  "no",
  "not",
  "none",
  "n/a",
  "na",
  "null",
  "undefined",
  "unknown",
  "not available",
  "not found",
  "",
]);

/**
 * Return a clean absolute https?:// URL, or null when the value is junk /
 * unusable. Never throws.
 */
export function sanitizeWebsiteUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  let value = raw.trim();

  // Markdown link: [label](url)
  const mdLink = value.match(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i);
  if (mdLink) value = mdLink[1];

  // Strip markdown emphasis/backticks and surrounding quotes/angle brackets.
  // NOTE: underscores are NOT stripped — they are valid inside URL paths.
  value = value
    .replace(/\*\*/g, "")
    .replace(/[*`]/g, "")
    // AI citation markers appended to URLs: "example.com[1][5]."
    .replace(/\[\d+\]/g, "")
    .replace(/^["'<\s]+|[>"'\s]+$/g, "")
    // Trailing punctuation left by prose extraction.
    .replace(/[.,;:!?)]+$/g, "")
    .trim();

  if (JUNK_VALUES.has(value.toLowerCase())) return null;

  // Bare domain / www. prefix — add protocol.
  if (!/^https?:\/\//i.test(value)) {
    // Must at least look like a hostname (has a dot, no spaces).
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/|$|\?)/i.test(value) && !/^www\./i.test(value)) {
      return null;
    }
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
