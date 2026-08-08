---
name: SEO crawl hygiene
description: How the platform avoids soft-404s, multi-host duplication, and stale/wrong SEO URLs for crawlers.
---

# SEO crawl hygiene

The single source of truth for the canonical origin is `CANONICAL_BASE_URL` /
`CANONICAL_HOST` in `server/middleware/host-canonical.ts` (derived from
`SITE_URL`, default `https://www.myseniorvalet.com`). Never trust the `Host`
header / `req.get('host')` when emitting SEO URLs — import the constant instead.

**Rules to keep consistent:**
- Host canonicalization (`hostCanonicalizationMiddleware`) runs only in
  production, only GET/HEAD, and 301s non-canonical hosts to `CANONICAL_BASE_URL`.
  It MUST exempt: localhost/loopback, `*.replit.dev`/`*.repl.co`/`*.replit.app`
  (the deploy & preview hosts — redirecting these would break the deployment),
  `/health`, env `WHITE_LABEL_DOMAINS`, and `whiteLabelService.isWhiteLabelDomain()`.
- Missing/hidden community pages must return REAL status codes for ALL user
  agents (not just crawlers), not the 200 SPA shell (which Google flags as
  soft-404). A non-crawler-gated visibility guard returns 404 (missing) / 410
  (hidden/deactivated, predicate `isHidden===true || isActive===false`, same as
  sitemap inclusion) with a branded noindex page; public communities fall through.
- Slug resolution must resolve by the CANONICAL SLUG COLUMNS, never by
  reconstructing city text from the URL (e.g. "st-louis"→"St Louis" fails for
  "St. Louis"/apostrophes). One helper `findCommunityBySlugUrl(state,city,slug)`
  filters by the always-populated `citySlug` column, then requires an EXACT match
  on the composed `stateSlug||generateSlug(state)` AND `slug||generateCommunitySlug`
  — the same composition the sitemap emits (`citySlug||...`, `stateSlug||...`,
  `slug||...`). This handles dedup suffixes (`-2`), punctuation cities, duplicate
  base-names in one city (each row composed independently → right listing), and
  legacy null columns. NEVER `find(...) || rows[0]` — a wrong slug in an existing
  city must 404, not render a sibling. `/community/:id` 301 builds its destination
  from the same stored columns (`stateSlug/citySlug/slug`, fallback to slugify).
- `/community/:id` 301-redirect route (`communityRoutes.ts`) must `next()` (NOT
  redirect) for missing/hidden/inactive so the SSR middleware emits 404/410.
  Registration order: this redirect runs BEFORE the SSR middleware, so valid
  public ids 301 to their slug URL while non-public ones fall through.

**Why:** GSC showed 19 indexed vs ~9.5K not-indexed with 8K+ "Not found (404)"
and duplicate-host indexing. Root causes were SPA shells served as 200 for
dead/hidden URLs, Host-header-derived SEO URLs leaking preview hostnames, and a
location canonical that used a non-indexable query-string URL.

**Location canonical:** `shared/location-seo.ts generateLocationCanonicalUrl`
emits `/senior-living/{stateAbbr-lower}/{city-slug}` (the indexable path), not
the old `?location=...&tab=simplified` query URL. `communities.state` is stored
UPPERCASE abbrev (e.g. `TX`); the slug branch matches `eq(state, state.toUpperCase())`.

**Sitemap freshness:** startup clears `.cache/sitemaps` (`clearSitemapCache()`)
before `prewarmSitemapCaches()` so a prior URL format can't serve stale URLs.
