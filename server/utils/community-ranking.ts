import { sql, type SQL } from "drizzle-orm";
import { db } from "../db";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Public referral-support eligibility (Task #483)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ONE reusable SQL predicate that every PUBLIC (family-facing) community
 * surface uses so an unconfirmed / excluded record cannot leak through any
 * endpoint (map markers, clusters, spatial, text search, detail SEO, sitemap,
 * counts).
 *
 * A community is publicly eligible when ALL of:
 *   1. active           — `is_active` is TRUE (or NULL → treated as active)
 *   2. not hidden       — `is_hidden` is NOT TRUE
 *   3. not excluded     — no EFFECTIVE community-level exclusion decision in the
 *                         supporting-community registry (a community-level
 *                         exclusion ALWAYS overrides operator/brand approval)
 *   4. approved         — WHEN the registry gate is ENABLED: the community is
 *                         individually approved OR confirmed-matched to an
 *                         approved operator family. Before the gate is enabled
 *                         this clause is skipped (see fail-safe below).
 *
 * FAIL-SAFE ROLLOUT: the allowlist (clause 4) is only enforced once the
 * `supporting_community_registry_gate` platform setting is true AND the registry
 * tables exist. Until then the predicate degrades to active + not-hidden only,
 * so the platform never presents a catastrophic empty result set while the
 * registry is being seeded. Table existence is probed defensively with
 * `to_regclass`, and every read is wrapped so a transient error can never wipe
 * out all public listings.
 *
 * Registry tables:
 *   - supporting_operator_families
 *   - supporting_community_matches
 *   - supporting_community_approvals
 *   - supporting_community_exclusions
 * Gate flag: platform_settings key `supporting_community_registry_gate`
 *            (value jsonb → truthy `enabled`).
 *
 * All fragments use bare (un-aliased) column names so the same SQL works inside
 * raw `db.execute(sql\`SELECT ... FROM communities ...\`)` queries AND Drizzle
 * `db.select().from(communities)` queries against the single, un-aliased
 * `communities` table.
 */

/** Snapshot of the runtime registry state used to build the predicate. */
export interface SupportingRegistryState {
  /** False when the registry could not be probed safely. */
  available: boolean;
  /** Gate flag from platform_settings.supporting_community_registry_gate. */
  enabled: boolean;
  /** The registry tables required to enforce the allowlist all exist. */
  tablesPresent: boolean;
  /** approval/exclusion decision tables both exist. */
  decisionsPresent: boolean;
}

const SAFE_STATE: SupportingRegistryState = {
  available: false,
  enabled: false,
  tablesPresent: false,
  decisionsPresent: false,
};

// Short cache so hot search/map paths don't re-probe the catalog on every call.
//
// IMPORTANT invariants:
// - The cache only ever stores STRUCTURAL facts (which registry tables exist).
//   All DECISION data (gate flag, approvals, matches, exclusions) is evaluated
//   live inside the SQL predicate itself, so admin mutations take effect on the
//   very next query with no cache dependency.
// - Invalidation marks the snapshot stale (forcing async re-probe) but never
//   discards it: tables are created once at startup and never dropped, so the
//   last-known structure remains valid for synchronous predicate builders.
// - A probe failure AFTER a healthy probe keeps the last-known structure
//   (stale-ok) instead of collapsing public inventory to an empty set.
let cachedState: { state: SupportingRegistryState; at: number } | null = null;
const STATE_TTL_MS = 30 * 1000;

/** TEST ONLY: hard-reset the cached structural snapshot. */
export function resetSupportingRegistryStateForTests(): void {
  cachedState = null;
}

/**
 * The registry gate flag, evaluated LIVE inside SQL. Keeping this in the query
 * (rather than the cached snapshot) means enabling/disabling the gate — and any
 * approval/revocation/exclusion change — is visible to every public surface on
 * the next request, without any cache invalidation ordering concerns.
 */
function gateEnabledSql(): SQL {
  return sql`COALESCE((
    SELECT (
      CASE
        WHEN jsonb_typeof(value) = 'boolean' THEN value = 'true'::jsonb
        WHEN jsonb_typeof(value) = 'object'  THEN COALESCE((value ->> 'enabled')::boolean, false)
        WHEN jsonb_typeof(value) = 'string'  THEN lower(value #>> '{}') IN ('true', '1', 'enabled', 'on')
        ELSE false
      END
    )
    FROM platform_settings
    WHERE key = 'supporting_community_registry_gate'
    LIMIT 1
  ), false)`;
}

/**
 * Probe the live registry state (gate flag + table existence). Never throws —
 * on ANY error it returns an unavailable state that compiles to SQL FALSE.
 */
export async function getSupportingRegistryState(
  opts: { fresh?: boolean } = {},
): Promise<SupportingRegistryState> {
  if (!opts.fresh && cachedState && Date.now() - cachedState.at < STATE_TTL_MS) {
    return cachedState.state;
  }
  try {
    const result = await db.execute(sql`
      SELECT
        to_regclass('public.supporting_operator_families')   IS NOT NULL AS has_families,
        to_regclass('public.supporting_community_matches')   IS NOT NULL AS has_matches,
        to_regclass('public.supporting_community_approvals') IS NOT NULL AS has_approvals,
        to_regclass('public.supporting_community_exclusions') IS NOT NULL AS has_exclusions,
        COALESCE((
          SELECT (
            CASE
              WHEN jsonb_typeof(value) = 'boolean' THEN value = 'true'::jsonb
              WHEN jsonb_typeof(value) = 'object'  THEN COALESCE((value ->> 'enabled')::boolean, false)
              WHEN jsonb_typeof(value) = 'string'  THEN lower(value #>> '{}') IN ('true', '1', 'enabled', 'on')
              ELSE false
            END
          )
          FROM platform_settings
          WHERE key = 'supporting_community_registry_gate'
          LIMIT 1
        ), false) AS gate_enabled
    `);
    const row: any = (result as any).rows?.[0] ?? {};
    const decisionsPresent = row.has_approvals === true && row.has_exclusions === true;
    const tablesPresent =
      row.has_families === true &&
      row.has_matches === true &&
      decisionsPresent;
    const state: SupportingRegistryState = {
      available: true,
      enabled: row.gate_enabled === true,
      tablesPresent,
      decisionsPresent,
    };
    cachedState = { state, at: Date.now() };
    return state;
  } catch (err) {
    // Stale-ok: registry tables are never dropped at runtime, so a transient
    // probe failure after a healthy probe must NOT collapse the public
    // inventory. Only fail closed when we have never seen a healthy registry.
    if (cachedState) {
      console.error(
        "[supporting-eligibility] registry state probe failed — keeping last-known structure:",
        err instanceof Error ? err.message : err,
      );
      cachedState = { state: cachedState.state, at: Date.now() };
      return cachedState.state;
    }
    console.error(
      "[supporting-eligibility] registry state probe failed — failing closed:",
      err instanceof Error ? err.message : err,
    );
    return SAFE_STATE;
  }
}

/**
 * Invalidate the cached registry state (e.g. after admin approves a family).
 * Marks the snapshot stale so async paths re-probe, but keeps the last-known
 * table structure so synchronous predicate builders never regress to an empty
 * set. (Decision data — gate/approvals/exclusions — is already evaluated live
 * in SQL, so correctness never depends on this cache.)
 */
export function invalidateSupportingRegistryState(): void {
  if (cachedState) {
    cachedState = { state: cachedState.state, at: 0 };
  }
}

/**
 * The base public-visibility clause, always applied on every surface:
 *   active AND not hidden.
 */
export function activeVisibleFilter(): SQL {
  return sql`(
    "is_active" = true
    AND ("is_hidden" IS NULL OR "is_hidden" IS NOT TRUE)
  )`;
}

/**
 * The EFFECTIVE community-level exclusion clause. A row is excluded when a
 * `supporting_community_exclusions` row targets its id or exact normalized
 * name+city+state identity. This ALWAYS overrides operator/brand approval. Guarded so it is inert
 * when the table is absent (returns "true" — nothing excluded).
 */
function notExcludedClause(state: SupportingRegistryState): SQL {
  if (!state.decisionsPresent) return sql`true`;
  return sql`NOT EXISTS (
    SELECT 1 FROM supporting_community_exclusions x
    WHERE x.community_id = "communities"."id"
       OR (
         x.exclusion_key =
           lower(trim(coalesce("communities"."name", ''))) || '|' ||
           lower(trim(coalesce("communities"."city", ''))) || '|' ||
           lower(trim(coalesce("communities"."state", '')))
       )
  )`;
}

/**
 * The allowlist clause (enforced only when the gate is on and tables exist):
 * individually approved OR confirmed-matched to an approved operator family.
 */
function approvedClause(state: SupportingRegistryState): SQL {
  return sql`(
    EXISTS (
      SELECT 1 FROM supporting_community_approvals a
      WHERE a.status = 'approved'
        AND (
          a.community_id = "communities"."id"
          OR a.approval_key =
            lower(trim(coalesce("communities"."name", ''))) || '|' ||
            lower(trim(coalesce("communities"."city", ''))) || '|' ||
            lower(trim(coalesce("communities"."state", '')))
        )
    )
    OR EXISTS (
      SELECT 1 FROM supporting_community_matches m
      JOIN supporting_operator_families f ON f.id = m.family_id
      WHERE m.community_id = "communities"."id"
        AND m.status = 'approved'
        AND f.status = 'approved'
    )
  )`;
}

/**
 * Build the single shared PUBLIC eligibility predicate for the given registry
 * state. Prefer `supportingEligibilityFilter()` (async, self-probing) unless
 * you already hold a state snapshot.
 *
 * IMPORTANT: because the exclusion / approval clauses reference the
 * `"communities"."id"` column explicitly, this predicate is safe to use both in
 * Drizzle `.where()` and in raw SQL that selects `FROM communities` (the table
 * must be reachable as `communities` — its default, un-aliased name).
 */
export function supportingEligibilityFilterFor(state: SupportingRegistryState): SQL {
  // Pre-bootstrap fail-closed: `available:false` means NO probe has ever
  // confirmed the registry structure (startup migrations have not completed or
  // ever succeeded in this process). Referral authorization is access control,
  // so before the registry is provably bootstrapped we expose nothing.
  // After ANY healthy probe, transient failures keep the last-known structure
  // (see getSupportingRegistryState), so this branch cannot re-trigger.
  if (!state.available) return sql`false`;
  const base = activeVisibleFilter();
  const notExcluded = notExcludedClause(state);

  // When every registry table exists, the allowlist is enforced with the gate
  // flag checked LIVE in SQL: gate off → active+not-hidden (+exclusions);
  // gate on → allowlist required. Admin gate/approval/exclusion mutations
  // therefore apply on the next query with no cache involvement.
  if (state.tablesPresent) {
    return sql`(${base} AND ${notExcluded} AND ((${gateEnabledSql()}) = false OR ${approvedClause(state)}))`;
  }
  // Structure incomplete (mid-migration): degrade to active + not-hidden plus
  // any exclusion override we CAN evaluate — never reference missing tables.
  return sql`(${base} AND ${notExcluded})`;
}

/**
 * Synchronous predicate for route modules that build SQL without an async
 * preparation step. Startup migrations create the registry tables before
 * routes serve traffic. The gate check remains inside SQL so admin revocations
 * and approvals take effect immediately without a deployment.
 */
export function supportingEligibilityFilterSql(opts: { includeHud?: boolean } = {}): SQL {
  // Uses only the STRUCTURAL snapshot (which tables exist) — primed by startup
  // migrations before routes serve traffic and retained across invalidations.
  // All decision data (gate, approvals, exclusions) is evaluated live in SQL,
  // so admin registry mutations apply immediately to these routes too.
  // Before the first healthy probe this deliberately returns no rows
  // (fail-closed pre-bootstrap; see supportingEligibilityFilterFor).
  const state = cachedState?.state ?? SAFE_STATE;
  const eligibility = supportingEligibilityFilterFor(state);
  return opts.includeHud ? eligibility : sql`(${eligibility} AND ${excludeHudFilter()})`;
}

/**
 * Async convenience: probe the live registry state and return the eligibility
 * predicate. Use this on public surfaces (markers, clusters, spatial, text
 * search, detail SEO, sitemap, counts).
 *
 * @param opts.includeHud when false (default) the HUD/subsidized default
 *        exclusion is AND-ed in so ordinary senior-living results never leak
 *        subsidized inventory. Pass true only for the family opt-in HUD filter.
 */
export async function supportingEligibilityFilter(
  opts: { includeHud?: boolean } = {},
): Promise<SQL> {
  const state = await getSupportingRegistryState();
  const eligibility = supportingEligibilityFilterFor(state);
  if (opts.includeHud) return eligibility;
  return sql`(${eligibility} AND ${excludeHudFilter()})`;
}

/**
 * Row-level eligibility check for a SINGLE, already-known community id (used by
 * detail SEO / structured-data paths that resolve one community). Returns true
 * when the community would pass the shared public eligibility predicate.
 * Fails closed: referral authorization is access control, so a registry read
 * failure must never expose an otherwise-unapproved detail page.
 */
export async function isCommunitySupportingEligible(
  communityId: number,
): Promise<boolean> {
  try {
    const state = await getSupportingRegistryState();
    const predicate = supportingEligibilityFilterFor(state);
    const result = await db.execute(sql`
      SELECT 1 FROM communities
      WHERE "communities"."id" = ${communityId}
        AND ${predicate}
      LIMIT 1
    `);
    return (((result as any).rows ?? []).length > 0);
  } catch (err) {
    console.error(
      "[supporting-eligibility] single-row eligibility check failed — failing closed:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Care-intent-first ranking (Task #483)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * A general city search must prioritize the three core senior-living intents in
 * this order of concern: Independent Living, Assisted Living, Memory Care; then
 * other senior-living types; and finally Skilled Nursing / Rehab / Post-Acute
 * (which stay available behind the care filter but must NOT interleave near the
 * top of a general search). Ranking is RELEVANCE-first, THEN quality.
 */

/** Numeric care-intent priority (higher = ranks first). NULL-safe. */
export function careIntentRankExpr(): SQL {
  const careText = sql`lower(coalesce(array_to_string("care_types", ' '), '') || ' ' || coalesce("community_subtype", '') || ' ' || coalesce("facility_type", ''))`;
  return sql`(
    CASE
      -- Core intent 1: Independent Living
      WHEN ${careText} LIKE '%independent%' THEN 500
      -- Core intent 2: Assisted Living
      WHEN ${careText} LIKE '%assisted%' THEN 400
      -- Core intent 3: Memory Care (incl. dementia/alzheimer)
      WHEN ${careText} LIKE '%memory%'
        OR ${careText} LIKE '%dementia%'
        OR ${careText} LIKE '%alzheimer%' THEN 300
      -- Skilled Nursing / Rehab / Post-Acute rank LAST
      WHEN ${careText} LIKE '%skilled%'
        OR ${careText} LIKE '%nursing home%'
        OR ${careText} LIKE '%rehab%'
        OR ${careText} LIKE '%post-acute%'
        OR ${careText} LIKE '%post acute%' THEN 50
      -- All other senior-living types sit between core intents and skilled/rehab
      ELSE 150
    END
  )`;
}

/**
 * Quality-aware ranking for PUBLIC (family-facing) community results.
 *
 * Produces a single numeric "quality rank" (higher = stronger listing) built
 * ONLY from real signals, mirroring `isMeaningfullyVerified()` /
 * `evaluateCommunity()` in shared/community-classification.ts.
 *
 * Task #483: the photo boost is DRASTICALLY lowered (10000 → 300) so a photo
 * strengthens a card WITHIN a comparable care group rather than deciding
 * relevance. Care intent (see `qualityOrderBy`) is the primary sort key; this
 * quality rank is a secondary/quality signal.
 *
 * Everything is NULL-safe so it degrades gracefully when the scoring task has
 * not yet populated `quality_tier` / `quality_score`.
 *
 * Uses bare (un-aliased) column names so the same fragment works inside raw
 * `db.execute(sql\`SELECT * FROM communities ...\`)` queries AND Drizzle
 * `db.select().from(communities)` queries.
 */
export function qualityRankExpr(): SQL {
  return sql`(
    -- Task #483: a photo now adds a modest boost (300) that ranks a strong card
    -- within a comparable result group — it can no longer overwhelm care intent
    -- or every other quality signal combined (was a ~10k boost pre-#483).
    CASE WHEN coalesce(array_length("photos", 1), 0) > 0 THEN 300 ELSE 0 END
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
    + CASE WHEN EXISTS (
        SELECT 1
        FROM community_claims operator_claim
        JOIN users operator_user ON operator_user.id = operator_claim.claimer_user_id
        WHERE operator_claim.community_id = "communities"."id"
          AND operator_claim.status = 'Approved'
          AND operator_claim.reviewed_by IS NOT NULL
          AND operator_claim.reviewed_at IS NOT NULL
          AND operator_user.is_active IS TRUE
      ) THEN 400 ELSE 0 END
    + CASE WHEN "hud_property_id" IS NOT NULL
            AND trim("hud_property_id") <> ''
            AND "rent_per_month" IS NOT NULL
           THEN 300 ELSE 0 END
  )`;
}

/**
 * ORDER BY fragment: CARE INTENT FIRST (Independent → Assisted → Memory → other
 * → Skilled/Rehab), THEN quality rank, THEN rating. Append section-specific
 * tiebreakers (e.g. `, "name" ASC`) after this.
 */
export function qualityOrderBy(): SQL {
  return sql`${careIntentRankExpr()} DESC, ${qualityRankExpr()} DESC, coalesce("rating", 0) DESC`;
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
    OR EXISTS (
      SELECT 1
      FROM community_claims operator_claim
      JOIN users operator_user ON operator_user.id = operator_claim.claimer_user_id
      WHERE operator_claim.community_id = "communities"."id"
        AND operator_claim.status = 'Approved'
        AND operator_claim.reviewed_by IS NOT NULL
        AND operator_claim.reviewed_at IS NOT NULL
        AND operator_user.is_active IS TRUE
    )
    OR (
      "hud_property_id" IS NOT NULL
      AND trim("hud_property_id") <> ''
      AND "rent_per_month" IS NOT NULL
    )
  )`;
}
