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
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (const sql of statements) {
    await pool.query(sql);
    console.log(`[post-merge] ok: ${sql}`);
  }
} catch (err) {
  console.error(`[post-merge] migration failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
