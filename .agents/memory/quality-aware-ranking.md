---
name: Quality-aware community ranking
description: Shared SQL helpers that surface verified/featured communities first across search, directory, and map.
---

# Quality-aware community ranking

Shared helpers in `server/utils/community-ranking.ts`: `qualityRankExpr()`,
`qualityOrderBy()`, `verifiedOnlyFilter()`. Reused by the comprehensive search
engine, the directory `section-data` endpoint, and the map supercluster.

**Rule:** rank/filter PUBLIC results by REAL signals only — `quality_tier` /
`quality_score` (from the scoring task) plus meaningful verification
(featured brand or featured/platinum subscription, claimed/claim_verified, or
HUD `hud_property_id` + non-null `rent_per_month`). NEVER the legacy
`is_verified` boolean (auto-applied to ~12k rows, meaningless).

**Why:** Golden Data Rule + the task brief. `is_verified` overclaims.

**How to apply:**
- The fragments use BARE (un-aliased, double-quoted) column names so they drop
  into both raw `db.execute(sql\`SELECT * FROM communities ...\`)` (section-data)
  AND Drizzle `db.select().from(communities)` (search engine, supercluster) —
  both query a single un-aliased `communities` table.
- Everything is NULL-safe: in environments where the scoring task hasn't run,
  `quality_tier`/`quality_score` are NULL for ALL rows, so ranking degrades to
  the verification signals + rating. Confirmed working that way.
- Only test `rent_per_month IS NOT NULL` (never cast it) — it's been text in some
  code paths historically; casts risk runtime errors.
- Ordering/filtering ONLY — do not change which rows are hidden (that's
  `community-visibility.ts`). The map orders before the 500-cap so a dense
  viewport keeps verified pins rather than an arbitrary 500; do NOT filter
  clusters (breaks counts).
