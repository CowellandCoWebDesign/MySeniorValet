# SEO Indexing Eligibility (community & location pages)

Source of truth: `shared/community-indexability.ts` (`evaluateIndexability`).
This doc describes the criteria so thresholds can be tuned later — keep both in sync.

## Why

~14k community pages are publicly accessible, but only ~1/3 have real,
community-specific substance. Thin/templated pages risk a Google sitewide
quality demotion. Instead of hiding or deleting anything, each page gets one of:

| Outcome | Meaning |
|---|---|
| `index, follow` | Passes the quality bar below |
| `noindex, follow` | Publicly accessible, but too thin/unconfirmed to index (links still crawled) |
| `404` / `410` | Missing or hidden/deactivated rows (existing middleware; unchanged) |

`robots.txt` stays permissive — Google must be able to crawl the page to see the noindex.

## Community page criteria

**Hard fails** (any → noindex):
- `not_public` — hidden or deactivated (these actually 410 upstream)
- `test_or_placeholder` — test/demo/sample fingerprints (`looksLikeTestData`)
- `critical_flag:*` — data_quality_flags contains `synthetic_suspected`, `test_data`,
  `test_data_suspected`, or `clearly_fake`. Other flags (e.g. `no_photos`,
  `not_geocoded`) do NOT gate indexing — flags are nearly universal.
- `non_senior` classification
- `duplicate_secondary` — row carries a `duplicate_of:<primaryId>` flag; page also
  emits `rel=canonical` to the primary and is dropped from sitemaps.

**Required base identity** (all required):
- `missing_name`, `missing_location` (city+state), `missing_canonical_slug`
  (slug + citySlug + stateSlug all set)
- `unconfirmed_care_type` — needs ≥1 confirmed care type. `care_types` has a DB
  default of `{Assisted Living}`; a row whose ONLY care type is "Assisted Living"
  counts only when corroborated by the name ("assisted living"), the subtype
  (assisted_living / small_alf / large_alf / board_and_care), or a meaningful
  verification (claimed / featured / HUD-verified pricing).

**Strong signals** (need ≥1; real DB values only, never invented):
- `description` — ≥150 trimmed chars AND not the generic template
  ("X is a … community located in …", ≤350 chars)
- `pricing` — `rent_per_month > 0` or `price_range.min > 0`
- `photos` — ≥1 photo URL
- `license` — `license_number` set
- `reviews` — any of reviewCount / googleReviewCount / yelpReviewCount > 0

## Location (city/state) page rule

A `/senior-living/{state}[/{city}]` page is indexable when **≥1 community on it is
indexable**; otherwise `noindex, follow`. Sitemaps count only indexable communities
toward the ≥2-communities city threshold.

## Where it's enforced (all surfaces agree)

- All-UA shell head injection: `server/seo/community-seo-builders.ts` (`buildShellFragments`)
- Crawler SSR: `server/seo-ssr-middleware.ts` (robots meta + `X-Robots-Tag` header)
- Location crawler SSR: `server/routes/seo-location-pages.ts` — `locationHasIndexableCommunity` resolves city slugs through the SAME `formatCityName` normalizer as the page data query, so the robots decision is made on the exact row set the page displays
- Location client SPA (all-UA parity): `GET /api/location-indexability/:state/:city?` mirrored by `client/src/pages/ai-search-intelligence.tsx` → `LocationSEOHead noindex` (fails open to index on fetch errors)
- Sitemaps: `server/sitemap-generator.ts` (only indexable pages listed; disk cache
  cleared on startup in `server/index.ts`)
- Client SPA: `client/src/components/SEOMetaTags.tsx` / `SEO.tsx` emit `noindex, follow`

## Observability

- `npx tsx server/scripts/indexability-report.ts` — pass/fail counts + reason breakdown
- `npx tsx server/scripts/duplicate-canonical-report.ts [--apply]` — duplicate-group
  report; `--apply` writes `duplicate_of:<id>` flags on secondaries (reversible; no
  merging or deleting).
