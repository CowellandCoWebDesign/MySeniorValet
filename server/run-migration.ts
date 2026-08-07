import { db } from './db';
import { sql } from 'drizzle-orm';
import { PROTECTIVE_FLAG_LIST } from './services/community-visibility';

/**
 * Single source of truth for the values allowed by the
 * `communities_enrichment_status_check` CHECK constraint. MUST stay in sync with
 * the `enrichmentStatus` enum in `shared/schema.ts` — a drift test enforces this.
 * Drizzle does NOT manage CHECK constraints, so adding a value to the schema enum
 * without adding it here means writes of that value 500 (23514) at runtime.
 */
export const ENRICHMENT_STATUS_VALUES = [
  'pending',
  'in_progress',
  'completed',
  'failed',
  'no_data',
] as const;

/**
 * Startup auto-restore of quality-bar senior communities (Task #350, tightened
 * by the Task #439 public-quality bar).
 *
 * Publishing deploys CODE, not DATA (prod uses a separate DB), so this guarded
 * UPDATE re-applies the keep-public flip at every boot and lets production
 * self-heal with no manual step.
 *
 * STRICT-SUBSET GUARANTEE: the conditions MUST mirror `evaluateCommunity`'s
 * keep-public policy (shared/community-classification.ts) — senior + own real
 * website + a REAL description (≥100 chars, not batch-templated boilerplate) +
 * NOT a test/demo fingerprint (`looksLikeTestData` equivalents: test/demo/
 * sample/placeholder/e2e names and test website hosts). Contains-style matches
 * are deliberately BROADER excluders than the evaluator's checks, so this SQL
 * can only ever unhide a SUBSET of what the TypeScript evaluator would — never
 * more. Protected rows (admin-confirmed, synthetic/geo-quarantined, test_data,
 * or auto-detected test_data_suspected) are never touched.
 * Exported for the regression test in tests/server/startup-quality-restore.test.ts.
 */
export async function runStartupQualityRestore(): Promise<number> {
  const restore = await db.execute(sql`
    UPDATE communities
    SET is_hidden = false
    WHERE is_hidden = true
      AND senior_classification = 'senior'
      AND website IS NOT NULL
      AND website ~* '^https?://'
      AND website !~* '-senior-living\\.com'
      AND website !~* '(aplaceformom|caring|seniorly|senioradvisor|assistedliving|seniorliving|seniorlivingnearme|olera|yelp|facebook|google|wikipedia)\\.'
      AND website !~* '(example\\.(com|org|net)|test\\.com|localhost|myseniorvalet\\.com|placeholder)'
      AND name !~* '\\m(test|demo|sample|placeholder|e2e)\\M'
      AND name !~* 'do not use'
      AND length(trim(coalesce(description, ''))) >= 100
      AND trim(description) !~* '^(quality senior living community in |premier senior living community in |hud section 202|low income housing tax credit|photos extracted from community website|authentic government-verified|55\\+ manufactured housing community|active adult community for residents|\\*\\*official website:\\*\\*\\s*not found)'
      AND description !~* 'registrad[ao]s? por (el )?inapam'
      AND description !~* 'no authoritative or detailed information'
      AND (flag_status IS NULL OR flag_status <> 'confirmed')
      AND NOT (COALESCE(data_quality_flags, ARRAY[]::text[]) && ARRAY['test_data_suspected']::text[])
      AND NOT (COALESCE(data_quality_flags, ARRAY[]::text[]) && ${sql`ARRAY[${sql.join(PROTECTIVE_FLAG_LIST.map((f) => sql`${f}`), sql`, `)}]::text[]`})
  `);
  return (restore as any).rowCount ?? 0;
}

/**
 * Idempotent startup migration — adds new columns that community trust &
 * moderation features depend on. Safe to run on every server start because
 * every statement uses IF NOT EXISTS / idempotent DDL.
 */
export async function runStartupMigrations(): Promise<void> {
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS flag_status TEXT CHECK (flag_status IN ('pending', 'confirmed'))`);
  // admin_rating_override and admin_rating_note are in Drizzle schema but were never
  // migrated to the DB. Adding them here so db.select().from(communities) works.
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_override NUMERIC(3,1)`);
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_note TEXT`);
  // Senior classification + quality scoring (Task #262). Additive; computed by
  // the classify-score pass and recomputed on enrichment. Without these,
  // db.select().from(communities) throws 42703.
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS senior_classification TEXT CHECK (senior_classification IN ('senior', 'non_senior', 'unknown'))`);
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS quality_score INTEGER`);
  await db.execute(sql`ALTER TABLE communities ADD COLUMN IF NOT EXISTS quality_tier TEXT CHECK (quality_tier IN ('featured', 'verified', 'good', 'thin', 'empty'))`);
  // enrichment_status gained a terminal "no_data" value (self-heal backoff). The
  // existing CHECK constraint enumerates allowed values and is NOT managed by
  // Drizzle, so it must be widened here or writes of 'no_data' fail (23514 → 500).
  // Idempotent: drop-if-exists then re-add from the single source of truth.
  const enrichmentStatusArray = ENRICHMENT_STATUS_VALUES.map((v) => `'${v}'::text`).join(', ');
  await db.execute(sql`ALTER TABLE communities DROP CONSTRAINT IF EXISTS communities_enrichment_status_check`);
  await db.execute(
    sql.raw(
      `ALTER TABLE communities ADD CONSTRAINT communities_enrichment_status_check ` +
        `CHECK (enrichment_status = ANY (ARRAY[${enrichmentStatusArray}]))`,
    ),
  );
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key VARCHAR PRIMARY KEY,
      value JSONB NOT NULL
    )
  `);
  await db.execute(sql`
    INSERT INTO platform_settings (key, value)
    VALUES ('map_defaults', '{"lat":37.7749,"lng":-122.4194,"zoom":12}'::jsonb)
    ON CONFLICT (key) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO platform_settings (key, value)
    VALUES ('services_page_settings', '{"featuredBannerEnabled":false,"heroText":"","pinnedVendorIds":[]}'::jsonb)
    ON CONFLICT (key) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO platform_settings (key, value)
    VALUES ('healthcare_page_settings', '{"featuredBannerEnabled":false,"heroText":"","pinnedProviderIds":[]}'::jsonb)
    ON CONFLICT (key) DO NOTHING
  `);
  await db.execute(sql`
    INSERT INTO platform_settings (key, value)
    VALUES ('directory_page_settings', '{"defaultSort":"newest","promoBannerEnabled":false,"promoBannerText":"","pinnedCommunityIds":[]}'::jsonb)
    ON CONFLICT (key) DO NOTHING
  `);

  // Guided "Start Your Search" placement intake (shared/schema.ts placementInquiries).
  // The table was created only in an isolated task DB and never merged — DB changes
  // don't merge across environments, so it must self-heal here on boot (dev AND prod).
  // Idempotent; columns mirror the Drizzle schema exactly.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS placement_inquiries (
      id SERIAL PRIMARY KEY,
      relationship TEXT NOT NULL,
      care_type TEXT NOT NULL,
      urgency TEXT NOT NULL,
      location TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      status TEXT DEFAULT 'new',
      owner_email_delivered BOOLEAN DEFAULT false,
      family_email_delivered BOOLEAN DEFAULT false,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_placement_inquiries_created_at ON placement_inquiries (created_at DESC)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_placement_inquiries_status ON placement_inquiries (status)`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS profile_refresh_rate_limits (
      caller_hash VARCHAR(64) NOT NULL,
      window_started_at TIMESTAMPTZ NOT NULL,
      request_count INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (caller_hash, window_started_at)
    )
  `);
  await db.execute(sql`
    DELETE FROM profile_refresh_rate_limits
    WHERE window_started_at < NOW() - INTERVAL '48 hours'
  `);

  // Auto-restore quality-bar senior communities (Task #350, tightened by Task
  // #439's public-quality bar).
  //
  // Publishing deploys CODE, not DATA (prod uses a separate DB), so this
  // guarded UPDATE re-applies the keep-public flip at every boot and lets
  // production self-heal with no manual step.
  //
  const restoredCount = await runStartupQualityRestore();
  console.log(`✅ Auto-restored ${restoredCount} quality-bar senior communities (startup restore)`);

  console.log('✅ Startup migrations verified (community trust columns + admin_rating_override + platform_settings + page settings + placement_inquiries + profile refresh guard)');
}

// Allow direct execution: `npx tsx server/run-migration.ts`
if (process.argv[1]?.endsWith('run-migration.ts') || process.argv[1]?.endsWith('run-migration.js')) {
  runStartupMigrations()
    .then(() => process.exit(0))
    .catch(e => { console.error(e.message); process.exit(1); });
}
