import { db } from './db';
import { sql } from 'drizzle-orm';

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
  console.log('✅ Startup migrations verified (community trust columns + admin_rating_override + platform_settings)');
}

// Allow direct execution: `npx tsx server/run-migration.ts`
if (process.argv[1]?.endsWith('run-migration.ts') || process.argv[1]?.endsWith('run-migration.js')) {
  runStartupMigrations()
    .then(() => process.exit(0))
    .catch(e => { console.error(e.message); process.exit(1); });
}
