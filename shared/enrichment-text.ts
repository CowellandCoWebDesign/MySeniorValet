/**
 * Shared cleaner for enrichment prose (Perplexity searchContent and similar).
 *
 * Raw enrichment summaries arrive as report-style markdown:
 *   "**The Ivy At Hawaii Kai – Comprehensive Community Overview** ---
 *    ### OFFICIAL WEBSITE - **Website:** [ivyliving.com/theivyhawaiikai] ---
 *    ### PRICING & AVAILABILITY - **Monthly Rates:** ..."
 * which is unreadable when rendered as plain text. This converts it into
 * clean paragraph prose for the Community Overview: markdown tokens are
 * stripped, report section headers become paragraph breaks, and list
 * bullets become sentences on their own lines.
 *
 * Used on BOTH sides: the server applies it before persisting descriptions,
 * and the client applies it at render time so records persisted before the
 * cleaner existed still display cleanly.
 */
export function stripEnrichmentMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  let t = String(text);

  // Normalize newlines; report blobs often arrive as one long line with
  // inline "---" and "###" separators, so treat those as line breaks first.
  t = t.replace(/\r\n?/g, "\n");
  t = t.replace(/\s*-{3,}\s*/g, "\n\n"); // horizontal rules / "---" separators
  t = t.replace(/\s*#{1,6}\s*/g, "\n\n"); // "### HEADER" markers → paragraph break

  // Markdown links: [text](url) → text; bare bracket links [example.com/x] → example.com/x.
  t = t.replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1");
  t = t.replace(/\[([^\]]+)\]/g, "$1");

  // Bold/italic/inline-code tokens.
  t = t.replace(/\*\*([^*]*)\*\*/g, "$1");
  t = t.replace(/__([^_]*)__/g, "$1");
  t = t.replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, "$1$2");
  t = t.replace(/`([^`]*)`/g, "$1");
  // Any stray leftover asterisks from unbalanced markup.
  t = t.replace(/\*{1,}/g, "");

  // List bullets ("- Item" / "• Item" / "1. Item") → their own lines.
  t = t.replace(/\s+[-•]\s+/g, "\n");
  t = t.replace(/^\s*[-•]\s+/gm, "");

  // ALL-CAPS report headers left on their own line (e.g. "PRICING & AVAILABILITY")
  // read as labels, not sentences — keep them but title-case lightly is risky;
  // just leave them as short lines. Collapse whitespace instead.
  t = t
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join("\n");

  // Collapse 3+ blank lines to one blank line.
  t = t.replace(/\n{3,}/g, "\n\n").trim();

  return t;
}
