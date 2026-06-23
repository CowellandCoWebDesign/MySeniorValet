import { db } from './db';
import { sql } from 'drizzle-orm';

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
  console.log('✅ Startup migrations verified (community trust columns + admin_rating_override + platform_settings + page settings)');
}

// Allow direct execution: `npx tsx server/run-migration.ts`
if (process.argv[1]?.endsWith('run-migration.ts') || process.argv[1]?.endsWith('run-migration.js')) {
  runStartupMigrations()
    .then(() => process.exit(0))
    .catch(e => { console.error(e.message); process.exit(1); });
}
