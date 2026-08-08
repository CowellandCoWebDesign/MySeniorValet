/**
 * Quarantine all PUBLIC communities carrying the clearly_fake audit flag.
 * Recompute first (canonical writer); any row evaluation keeps public gets the
 * protective synthetic_suspected flag appended, then recomputed again so it is
 * hidden and stays hidden. Nothing deleted; restorable via admin QC queue.
 * DATA op — must run on the LIVE database.
 */
import { pool } from "../db";
import { recomputeCommunityVisibility } from "../services/community-visibility";

async function main() {
  const { rows } = await pool.query(
    `SELECT id, name FROM communities
     WHERE is_hidden = false AND is_active = true
       AND 'clearly_fake' = ANY(COALESCE(data_quality_flags,'{}'))
     ORDER BY id`,
  );
  console.log(`Found ${rows.length} public clearly_fake row(s)`);
  let hiddenByEval = 0, forced = 0;
  for (const r of rows) {
    let res = await recomputeCommunityVisibility(r.id);
    if (!res?.hidden) {
      await pool.query(
        `UPDATE communities
         SET data_quality_flags = array_append(COALESCE(data_quality_flags,'{}'), 'synthetic_suspected')
         WHERE id = $1 AND NOT ('synthetic_suspected' = ANY(COALESCE(data_quality_flags,'{}')))`,
        [r.id],
      );
      res = await recomputeCommunityVisibility(r.id);
      forced++;
    } else hiddenByEval++;
    if (!res?.hidden) console.log(`STILL PUBLIC: ${r.id} ${r.name}`);
  }
  console.log(`Hidden by evaluation: ${hiddenByEval}, hidden via protective flag: ${forced}`);
  const { rows: left } = await pool.query(
    `SELECT count(*) c FROM communities WHERE is_hidden=false AND is_active=true AND 'clearly_fake' = ANY(COALESCE(data_quality_flags,'{}'))`,
  );
  console.log(`Remaining public clearly_fake: ${left[0].c}`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
