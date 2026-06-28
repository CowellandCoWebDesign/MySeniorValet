// Idempotent, additive schema migrations applied after every task merge.
// Only use `ADD COLUMN IF NOT EXISTS` style statements here — never destructive
// changes. This guards against schema drift where merged code references columns
// that were only created in a task's isolated database.
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const statements = [
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS data_quality_flags text[] DEFAULT '{}'`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS data_quality_checked_at timestamp`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_override NUMERIC(3,1)`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_rating_note TEXT`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS senior_classification TEXT CHECK (senior_classification IN ('senior', 'non_senior', 'unknown'))`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS quality_score INTEGER`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS quality_tier TEXT CHECK (quality_tier IN ('featured', 'verified', 'good', 'thin', 'empty'))`,
  `CREATE TABLE IF NOT EXISTS home_section_configs (
    id SERIAL PRIMARY KEY,
    position INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    section_type TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const sql of statements) {
    await pool.query(sql);
    console.log(`[post-merge] ok: ${sql.split('\n')[0].trim()}`);
  }

  // Seed default home sections if the table is empty
  const countResult = await pool.query('SELECT COUNT(*)::integer AS count FROM home_section_configs');
  const count = Number(countResult.rows[0]?.count ?? 0);
  if (count === 0) {
    await pool.query(`
      INSERT INTO home_section_configs (position, enabled, title, subtitle, section_type, config) VALUES
        (1, TRUE, 'Recently Discovered Communities', 'Brand new communities added to our database', 'recently_discovered', '{}'),
        (2, TRUE, 'HUD Affordable Communities', 'Government-verified affordable housing options', 'hud', '{}'),
        (3, TRUE, 'Hawaii Paradise Communities', 'Exceptional senior living in America''s tropical paradise', 'location', '{"state":"HI"}'),
        (4, TRUE, 'Fort Worth Lone Star Excellence', 'Texas-sized luxury and authentic southern hospitality', 'location', '{"city":"Fort Worth","state":"TX"}'),
        (5, TRUE, 'New York Empire Excellence', 'World-class senior living in the Empire State', 'location', '{"state":"NY"}'),
        (6, TRUE, 'Featured & Coastal Communities', 'Premium communities with exceptional amenities', 'featured', '{}'),
        (7, TRUE, 'Highest Rated Communities', 'Top performers with exceptional ratings and satisfied families', 'highest_rated', '{}')
    `);
    console.log('[post-merge] ok: seeded 7 default home_section_configs rows');
  } else {
    console.log(`[post-merge] ok: home_section_configs already has ${count} row(s), skipping seed`);
  }
} catch (err) {
  console.error(`[post-merge] migration failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
