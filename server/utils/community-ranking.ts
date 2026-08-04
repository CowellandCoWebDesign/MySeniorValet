import { sql, type SQL } from "drizzle-orm";

/**
 * Quality-aware ranking for PUBLIC (family-facing) community results.
 *
 * Produces a single numeric "quality rank" (higher = stronger listing) built
 * ONLY from real signals, mirroring `isMeaningfullyVerified()` /
 * `evaluateCommunity()` in shared/community-classification.ts:
 *   - `quality_tier` / `quality_score` written by the scoring/classification task
 *   - meaningful verification: featured brand or featured/platinum subscription,
 *     a claimed/claim-verified listing, or genuine HUD-verified pricing
 *
 * It deliberately does NOT use the legacy `is_verified` boolean (auto-applied to
 * ~12k rows and meaningless) — consistent with the Golden Data Rule.
 *
 * Everything is NULL-safe so it degrades gracefully when the scoring task has
 * not yet populated `quality_tier` / `quality_score` (those communities fall to
 * a neutral base and are still ordered by their real verification signals +
 * rating).
 *
 * Uses bare (un-aliased) column names so the same fragment works inside raw
 * `db.execute(sql\`SELECT * FROM communities ...\`)` queries AND Drizzle
 * `db.select().from(communities)` queries (single, un-aliased `communities`
 * table in both).
 */
export function qualityRankExpr(): SQL {
  return sql`(
    -- Photo-bearing listings rank FIRST among the public quality set (Task
    -- #439): the boost outweighs every other term combined (max ~7000).
    CASE WHEN coalesce(array_length("photos", 1), 0) > 0 THEN 10000 ELSE 0 END
    + CASE lower(coalesce("quality_tier", ''))
      WHEN 'featured' THEN 5000
      WHEN 'verified' THEN 4000
      WHEN 'good'     THEN 3000
      WHEN 'thin'     THEN 1000
      WHEN 'empty'    THEN 0
      ELSE 2000
    END
    + coalesce("quality_score", 0) * 5
    + CASE WHEN "is_featured_brand" IS TRUE
            OR lower(coalesce("subscription_tier", '')) IN ('featured', 'platinum')
           THEN 800 ELSE 0 END
    + CASE WHEN "is_claimed" IS TRUE OR "claim_verified" IS TRUE THEN 400 ELSE 0 END
    + CASE WHEN "hud_property_id" IS NOT NULL
            AND trim("hud_property_id") <> ''
            AND "rent_per_month" IS NOT NULL
           THEN 300 ELSE 0 END
  )`;
}

/**
 * ORDER BY fragment: strongest/most-verified listings first, then by rating.
 * Append section-specific tiebreakers (e.g. `, "name" ASC`) after this.
 */
export function qualityOrderBy(): SQL {
  return sql`${qualityRankExpr()} DESC, coalesce("rating", 0) DESC`;
}

/**
 * Single shared definition of a "HUD / subsidized housing" listing:
 * `data_source ILIKE '%hud%' OR care_types @> ARRAY['HUD Housing']`.
 *
 * These ~4.7k HUD Multifamily entries are mostly generic subsidized apartment
 * buildings that clutter senior-care results, so every PUBLIC surface excludes
 * them by DEFAULT (via `excludeHudFilter()`) unless the family explicitly
 * enables the "Subsidized/HUD housing" filter. Detail pages, saved links, and
 * the sitemap are NOT filtered — the rows stay public and reachable.
 *
 * Uses bare column names so the same fragment works in raw SQL and Drizzle
 * queries against the single, un-aliased `communities` table.
 */
export function hudListingFilter(): SQL {
  return sql`(
    coalesce("data_source", '') ILIKE '%hud%'
    OR coalesce("care_types", ARRAY[]::text[]) @> ARRAY['HUD Housing']::text[]
  )`;
}

/** Default-on WHERE fragment: hide HUD listings unless explicitly requested. */
export function excludeHudFilter(): SQL {
  return sql`NOT ${hudListingFilter()}`;
}

/**
 * WHERE fragment for the optional family "verified only" toggle.
 *
 * "Verified" = a REAL signal only (mirrors `isMeaningfullyVerified()` plus the
 * meaningful quality tiers). Never the legacy `is_verified` boolean.
 */
export function verifiedOnlyFilter(): SQL {
  return sql`(
    lower(coalesce("quality_tier", '')) IN ('featured', 'verified')
    OR "is_featured_brand" IS TRUE
    OR lower(coalesce("subscription_tier", '')) IN ('featured', 'platinum')
    OR "is_claimed" IS TRUE
    OR "claim_verified" IS TRUE
    OR (
      "hud_property_id" IS NOT NULL
      AND trim("hud_property_id") <> ''
      AND "rent_per_month" IS NOT NULL
    )
  )`;
}
