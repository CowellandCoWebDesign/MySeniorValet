---
name: Community visibility policy (classify + score + apply)
description: Single source of truth for senior classification, quality scoring, and STRICT is_hidden visibility; the durable rules and how to revert.
---

# Community visibility — single source of truth

All quality-driven `is_hidden` decisions flow through ONE pure evaluator and ONE
DB writer. Never hand-roll a separate visibility rule.

- **Policy (pure, deterministic):** `evaluateCommunity()` in
  `shared/community-classification.ts`. Accepts camelCase (Drizzle) AND
  snake_case (raw DB) keys.
- **DB writer:** `server/services/community-visibility.ts` —
  `recomputeCommunityVisibility(id)` (one row) and `runVisibilityPass(opts)`
  (batched, resumable). These are the ONLY automatic writers of `is_hidden`.
  Bulk CLI: `server/scripts/classify-score-communities.ts`.
- **Columns:** `senior_classification` / `quality_score` / `quality_tier` are
  additive; the migration must live in BOTH `server/run-migration.ts` and
  `scripts/post-merge-migrations.mjs` (dev + prod).

## Durable decisions (the WHY)
- **STRICT keep-public** = `(meaningfullyVerified OR realContent) AND
  classification ∈ {senior, unknown} AND NOT clearlyFake`. realContent = ≥1 photo
  OR ≥100-char desc. `non_senior` is ALWAYS hidden, even with content.
- **`meaningfullyVerified` deliberately EXCLUDES legacy `is_verified` and the
  auto-set `subscription_tier='verified'`** — both are auto-applied to ~12k rows
  and mean nothing. Only claim/featured/gov-verified-pricing count.
- **Classification is CONSERVATIVE — ambiguous → `unknown`, kept VISIBLE.** Only
  assign `non_senior` on a STRONG signal:
  - a HUD/affordable/HUD-VASH feed row whose ONLY care type is the generic
    "HUD Housing" placeholder (empty or mixed care types → `unknown`, NOT
    non_senior — never mark non_senior on the data source alone), OR
  - an obvious general-housing NAME (apartments / housing authority / section 8 /
    family housing / HUD-VASH / VASH).
  - Positive senior signals (real senior care type, senior subtype, hard senior
    name keyword) win first.
- **Veterans / HUD-VASH are NOT senior signals.** HUD-VASH = supportive housing
  for (any-age, often formerly-homeless) veterans → non_senior. Generic veterans
  housing (e.g. "Veterans Home", care type "VA Housing", subtype `veterans_home`)
  is ambiguous → `unknown` UNLESS it also offers a real senior care type
  (then senior wins). Do NOT add veterans terms back to the senior lists.
- **Every PUBLIC community-listing path must exclude `is_hidden`** — not just
  map/search results but autosuggest too: `/api/search/suggestions` AND the
  comprehensive-search-engine `generateSuggestions` (name/city/state/company
  queries). Easy to miss; a hidden row leaking into autocomplete defeats the
  quarantine.
- **Do NOT trust `community_subtype='hud_senior_housing'`** — it was auto-applied
  to the whole HUD feed and is not a senior signal.

## Protective overrides (never auto-restore)
`is_hidden` stays true regardless of score when `data_quality_flags` contains
`synthetic_suspected` or `geo_needs_review`, or `flag_status='confirmed'`. These
are NOT in `MANAGED_QUALITY_FLAGS`, so the flag-merge preserves them.

## Self-heal auto-restore
`enrichCommunityUnified()` calls `recomputeCommunityVisibility()` after persisting
content (try/catch — must never break enrichment), so a hidden community that
gains a real description/photo and classifies senior/unknown auto-restores.

## Public read paths that MUST exclude is_hidden
`publicVisibleFilter()` (communityRoutes), supercluster.ts, storage.ts, sitemap.
Gotcha: the map/radius/nearest queries in `searchRoutes.ts` originally filtered
only `is_active` — they must also exclude `is_hidden` or the quarantine leaks.

## Re-run / revert
- Re-run: `npx tsx server/scripts/classify-score-communities.ts` (idempotent,
  concurrent writes; `--dry-run` previews counts). Nothing is ever hard-deleted,
  so a re-run reproduces the policy state exactly.
- Revert to "only protective quarantine hidden" (this policy intentionally
  SUPERSEDES the earlier ad-hoc groomings; non-destructive):
  ```sql
  UPDATE communities SET is_hidden = false
  WHERE is_hidden = true
    AND NOT (data_quality_flags && ARRAY['synthetic_suspected','geo_needs_review'])
    AND (flag_status IS DISTINCT FROM 'confirmed');
  UPDATE communities SET senior_classification=NULL, quality_score=NULL, quality_tier=NULL; -- optional
  ```
