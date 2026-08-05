/**
 * Senior Resource Directory shell injection (/senior-resources).
 *
 * Bakes the full directory — category sections with real listing names,
 * addresses, hours, and phone numbers — into the initial HTML for ALL user
 * agents, following the community shell-injection conventions
 * (server/seo/community-seo-builders.ts):
 *
 *  - Head fragments are marked data-ssr-meta and the generic homepage head is
 *    stripped first, so the served HTML has exactly ONE title / description /
 *    self-canonical / robots set. client/src/main.tsx removes all
 *    [data-ssr-meta] tags at boot before Helmet emits the client set.
 *  - Body content is injected inside <div id="root"> — React's
 *    createRoot().render() replaces it on mount, so nothing duplicates.
 *  - The JSON payload is injected AFTER the root div (outside it) so the
 *    client page can hydrate instantly without a fetch; React never wipes it.
 *  - All replacements use replacer FUNCTIONS ($ in text is data, not a
 *    capture-group reference).
 */

import type { BakedResourceDirectory, DirectoryListing } from "@shared/resource-directory";
import { escapeHtml, safeJsonLd, stripGenericHead } from "./community-seo-builders";
import { CANONICAL_BASE_URL } from "../middleware/host-canonical";
import { getBakedResourceDirectory } from "../services/resource-directory-baked";

export const RESOURCE_DIRECTORY_PATH = "/senior-resources";
export const RESOURCE_DIRECTORY_TITLE =
  "Senior Resource Directory — Northern California & National Programs | MySeniorValet";
export const RESOURCE_DIRECTORY_DESCRIPTION =
  "A–Z directory of senior resources: food assistance, Meals on Wheels, IHSS in-home care, veterans benefits, Medicare counseling, transportation and more — hand-verified listings for Shasta, Butte, Tehama, Humboldt and other Northern California counties, plus national programs.";

/** id of the embedded JSON payload script the client page reads at boot. */
export const RESOURCE_DIRECTORY_PAYLOAD_ID = "__RESOURCE_DIRECTORY__";

// ---------------------------------------------------------------------------
// Pure builders (unit-testable)
// ---------------------------------------------------------------------------

export function buildDirectoryHead(baseUrl: string): string {
  const canonical = `${baseUrl}${RESOURCE_DIRECTORY_PATH}`;
  return `
    <title>${escapeHtml(RESOURCE_DIRECTORY_TITLE)}</title>
    <meta data-ssr-meta="resource-directory" name="description" content="${escapeHtml(RESOURCE_DIRECTORY_DESCRIPTION)}" />
    <meta data-ssr-meta="resource-directory" name="robots" content="index, follow" />
    <link data-ssr-meta="resource-directory" rel="canonical" href="${escapeHtml(canonical)}" />
    <meta data-ssr-meta="resource-directory" property="og:type" content="website" />
    <meta data-ssr-meta="resource-directory" property="og:url" content="${escapeHtml(canonical)}" />
    <meta data-ssr-meta="resource-directory" property="og:title" content="${escapeHtml(RESOURCE_DIRECTORY_TITLE)}" />
    <meta data-ssr-meta="resource-directory" property="og:description" content="${escapeHtml(RESOURCE_DIRECTORY_DESCRIPTION)}" />
    <meta data-ssr-meta="resource-directory" property="og:site_name" content="MySeniorValet" />
    <meta data-ssr-meta="resource-directory" name="twitter:card" content="summary" />
    <meta data-ssr-meta="resource-directory" name="twitter:title" content="${escapeHtml(RESOURCE_DIRECTORY_TITLE)}" />
    <meta data-ssr-meta="resource-directory" name="twitter:description" content="${escapeHtml(RESOURCE_DIRECTORY_DESCRIPTION)}" />
    <script data-ssr-meta="resource-directory" type="application/ld+json">${safeJsonLd(directoryStructuredData(baseUrl))}</script>`;
}

export function directoryStructuredData(baseUrl: string) {
  const canonical = `${baseUrl}${RESOURCE_DIRECTORY_PATH}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Senior Resource Directory",
    description: RESOURCE_DIRECTORY_DESCRIPTION,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "MySeniorValet", url: baseUrl },
  };
}

function listingHtml(l: DirectoryListing): string {
  const parts: string[] = [`<h3>${escapeHtml(l.name)}</h3>`];
  if (l.type) parts.push(`<p>${escapeHtml(l.type)}${l.verified && l.scope === "curated" ? " — Verified Local" : ""}</p>`);
  const addressBits = [l.address, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean);
  if (addressBits.length) parts.push(`<p>${addressBits.map((b) => escapeHtml(b!)).join(", ")}</p>`);
  if (l.phone) parts.push(`<p>Phone: ${escapeHtml(l.phone)}</p>`);
  if (l.hours) parts.push(`<p>Hours: ${escapeHtml(l.hours)}</p>`);
  if (l.website) parts.push(`<p>Website: ${escapeHtml(l.website)}</p>`);
  if (l.services?.length) parts.push(`<p>${l.services.map(escapeHtml).join(" · ")}</p>`);
  return `<li>${parts.join("")}</li>`;
}

/**
 * Crawlable pre-hydration body: H1, 211 line, county list, then every
 * category as an <h2 id="…"> section with its full listings.
 */
export function buildDirectoryBody(directory: BakedResourceDirectory): string {
  const sections = directory.categories
    .map((cat) => {
      const items = directory.listings.filter((l) => l.category === cat.id);
      if (items.length === 0) return "";
      return `<section id="${escapeHtml(cat.id)}">
        <h2>${escapeHtml(cat.label)}</h2>
        <p>${escapeHtml(cat.description)}</p>
        <ul>${items.map(listingHtml).join("")}</ul>
      </section>`;
    })
    .join("");

  const countyList = directory.counties.map((c) => escapeHtml(c.label)).join(", ");
  const categoryNav = directory.categories
    .map((c) => `<a href="#${escapeHtml(c.id)}">${escapeHtml(c.label)}</a>`)
    .join(" | ");

  return `<div data-ssr-shell="resource-directory">
      <h1>Senior Resource Directory</h1>
      <p>Hand-verified senior resources for Northern California — ${countyList} Counties — plus statewide California and national programs.</p>
      <p>Need help right now? Dial 2-1-1 for free, 24/7 local referrals.</p>
      <nav>${categoryNav}</nav>
      ${sections}
    </div>`;
}

/**
 * Pure injection into the SPA shell. The JSON payload goes AFTER the root div
 * so React hydration doesn't remove it.
 */
export function injectDirectoryIntoShell(
  html: string,
  directory: BakedResourceDirectory,
  baseUrl: string,
): string {
  const head = buildDirectoryHead(baseUrl);
  const body = buildDirectoryBody(directory);
  // Escape "<" so "</script>" inside data can never terminate the tag early.
  const payload = JSON.stringify(directory).replace(/</g, "\\u003c");
  let out = stripGenericHead(html);
  out = out.replace("<head>", () => `<head>${head}`);
  out = out.replace(
    /<div id="root">\s*<\/div>/,
    () =>
      `<div id="root">${body}</div><script id="${RESOURCE_DIRECTORY_PAYLOAD_ID}" type="application/json">${payload}</script>`,
  );
  return out;
}

// ---------------------------------------------------------------------------
// Wiring (mirrors injectCommunityMetaIntoShell)
// ---------------------------------------------------------------------------

/**
 * For exactly /senior-resources: inject the baked directory into the shell.
 * Returns null for any other path or on error (callers serve the plain shell).
 */
export async function injectResourceDirectoryIntoShell(
  reqPath: string,
  html: string,
): Promise<string | null> {
  try {
    const normalized = reqPath.replace(/\/+$/, "") || "/";
    if (normalized !== RESOURCE_DIRECTORY_PATH) return null;
    const directory = await getBakedResourceDirectory();
    return injectDirectoryIntoShell(html, directory, CANONICAL_BASE_URL);
  } catch (err) {
    console.error("[ResourceDirectorySEO] injection failed, serving plain shell:", err);
    return null;
  }
}
