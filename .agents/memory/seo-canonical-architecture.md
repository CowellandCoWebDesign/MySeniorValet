---
name: SEO canonical architecture
description: How canonicals are emitted across the SPA + SSR; the single-canonical rule and the two competing client systems.
---
Exactly ONE `<link rel="canonical">` must render per page. Google ignores ALL canonicals on a page when more than one is present, and a wrong canonical (e.g. pointing at the homepage) makes Google mark the page "Alternate page with proper canonical tag" = NOT indexed.

**Never** put a static `<link rel="canonical">` in `client/index.html`. A static tag leaks onto every SPA route and made every community/detail page canonicalize to the homepage.

Three canonical producers, must stay byte-for-byte consistent (absolute `https://www.myseniorvalet.com` origin, no trailing slash, `/senior-living/{state}/{city}/{slug}` path built from stored slug columns):
- Server SSR (`server/seo-ssr-middleware.ts`) — served to detected crawlers.
- Sitemap (`server/sitemap-generator.ts`).
- Client SPA — the page controls it.

**Two competing client systems** (this is the trap):
- `useSEO` hook (`client/src/hooks/useSEO.ts`) mutates the DOM head DIRECTLY. Used by home, map-search, marketplace, location pages, etc.
- `react-helmet-async` `<Helmet>` (via `SEOMetaTags`) — used by community-detail and Helmet-based SEO components. Helmet marks its tags with `data-rh`.
To stop these two from producing two canonicals during SPA navigation: `useSEO` only selects/updates `link[rel="canonical"]:not([data-rh])` and removes any canonical IT created on cleanup.

Community detail (`community-detail.tsx`) builds its self-canonical via `getCommunityUrl(community)` (loaded) or route params (slug-based loading state) and passes it to `SEOMetaTags canonical=`. Set in BOTH loading and loaded returns.

**Why:** GSC reported ~594 community pages excluded via honored-canonical-elsewhere; root cause was the static homepage canonical in index.html + community page never overriding it.
