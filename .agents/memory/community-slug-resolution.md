---
name: Community SEO slug resolution
description: How discovered/saved communities resolve to /senior-living/{state}/{city}/{slug} detail pages and why blank slugs 404
---

# Community SEO slug resolution

Detail pages live at `/senior-living/{state}/{city}/{slug}` and resolve via
`GET /api/communities/by-slug/:state/:city/:slug`. That lookup tries the indexed
`(state_slug, city_slug, slug)` columns FIRST (O(1)), then falls back to
lower(name)/generated-slug matching.

## Rules / lessons
- Every community insert MUST populate `slug` / `city_slug` / `state_slug` (use
  `safeCommunitySlugs()` from `server/utils/generate-slug.ts`, which guarantees a
  unique triplet). Blank slug columns mean the fast path misses and the row only
  resolves via the slower fallback.
  **Why:** discovered communities used to save with blank slugs AND the discovery
  API returned a *fabricated* `name-<id>` slug — the trailing `-<id>` broke the
  name fallback so the detail page 404'd ("Community not found").
- NEVER build a `name-<id>` slug for a URL. Return the real stored slug segments.
- The by-slug fallback is tolerant of a trailing `-<id>` (strips it before name
  matching, and as a LAST resort resolves by that id) but ONLY when the record's
  city/state match the URL — so a stray id can never open the wrong community.
  Hidden / `isClearlyFake` records still 404 after any match.
- Client navigation goes through ONE helper: `resolveCommunityNavigation()` in
  `client/src/lib/community-navigation.ts`. It builds the SEO URL when
  name+city+state are present, else falls back to `/communities/<id>`. Both result
  cards and map pins funnel through it. id<=0 → no nav (the "still saving" toast).

## Not-yet-covered insert paths (blank slugs → fallback-only)
`server/regional-expansion.ts`, `server/enhanced-scraper.ts`,
`server/atria-expansion-service.ts`, `server/services/enhanced-city-verification.ts`
do NOT set slug columns. `global-discovery.ts` and
`services/discovered-community-service.ts` DO.

## Data note
Slug backfill is a DATA op — it does not merge from task-agent DBs. Run the
backfill (compute slugs mirroring `generateSlug`, collision-check the triplet)
against the LIVE db, or rely on the tolerant fallback which resolves blank-slug
rows regardless.
