/**
 * Restore ambiguous "synthetic-suspected" communities that were deleted by the
 * geocoding cleanup but may be REAL communities with corrupted coordinates.
 *
 * Records are re-inserted as QUARANTINED:
 *   - is_hidden = true                      (not shown on map / search)
 *   - data_quality_flags = geo_needs_review + synthetic_suspected
 *   - location = null                       (re-derived by geocode phase)
 *   - latitude/longitude kept (corrupt)     (used only to recompute mislocation)
 *
 * The geocode phase then arbitrates: real addresses resolve to verified
 * street-level coords -> unhidden + geo_corrected; fabricated addresses fail to
 * resolve -> stay hidden + synthetic_suspected for human review. No fabricated
 * data is introduced (Golden Data Rule).
 *
 * Usage: npx tsx server/scripts/restore-quarantine.ts [--limit=N] [--dry-run]
 */
import fs from 'fs';
import path from 'path';
import { pool } from '../db';

const BACKUP_DIR = '.local/backups';
const RESTORE_SET = path.join(BACKUP_DIR, '_restore_set.json');
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = (() => {
  const a = process.argv.find(x => x.startsWith('--limit='));
  return a ? parseInt(a.split('=')[1], 10) : Infinity;
})();

async function main() {
  const ids: number[] = JSON.parse(fs.readFileSync(RESTORE_SET, 'utf8'));
  const idSet = new Set(ids);

  // Build id -> record map from all backup files (later files win on dup id).
  const byId = new Map<number, any>();
  for (const f of fs.readdirSync(BACKUP_DIR).filter(x => x.startsWith('deleted-synthetic'))) {
    const rows = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, f), 'utf8'));
    for (const r of rows) if (idSet.has(r.id)) byId.set(r.id, r);
  }

  let records = ids.map(id => byId.get(id)).filter(Boolean);
  if (LIMIT !== Infinity) records = records.slice(0, LIMIT);
  console.log(`Restore set: ${ids.length} ids, ${records.length} records resolved from backups.`);

  // Skip any ids that already exist (idempotent re-runs).
  const existing = await pool.query(`SELECT id FROM communities WHERE id = ANY($1::int[])`, [records.map(r => r.id)]);
  const have = new Set(existing.rows.map(r => r.id));
  records = records.filter(r => !have.has(r.id));
  console.log(`${have.size} already present, ${records.length} to insert.`);

  // Quarantine transform.
  for (const r of records) {
    r.location = null;
    r.is_hidden = true;
    r.data_quality_flags = ['geo_needs_review', 'synthetic_suspected'];
  }

  if (DRY_RUN) {
    console.log('DRY RUN — no inserts. First 5:');
    records.slice(0, 5).forEach(r => console.log(`  [${r.id}] ${r.name} | ${r.address} | ${r.city}, ${r.state}`));
    await pool.end();
    return;
  }

  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const res = await pool.query(
      `INSERT INTO communities
       SELECT * FROM jsonb_populate_recordset(null::communities, $1::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify(batch)]
    );
    inserted += res.rowCount || 0;
    console.log(`  inserted ${inserted}/${records.length}...`);
  }
  console.log(`\nRestored ${inserted} quarantined records.`);
  await pool.end();
}

main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
