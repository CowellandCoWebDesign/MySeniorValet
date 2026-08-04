/**
 * Quarantine seeded TEST communities from the public site (Task: hide seeded
 * test communities).
 *
 * Three demo records were seeded on 2025-10-11 with fake addresses and
 * example.com / *.myseniorvalet.com placeholder websites, and were publicly
 * visible (home sections, directory, search, map). Per the Golden Data Rule
 * nothing is deleted — they are quarantined with the PROTECTIVE `test_data`
 * data-quality flag (see PROTECTIVE_FLAGS in services/community-visibility.ts)
 * so the visibility recompute / self-heal / on-view enrichment paths can never
 * auto-restore them. They remain visible in the admin QC review queue
 * (membership: is_hidden = true) for future restore if ever needed.
 *
 * Also repairs one REAL community whose website was a junk self-referential
 * platform URL (https://www.myseniorvalet.com/community/…): the website is
 * nulled (guarded — only when it still points at myseniorvalet.com) so it can
 * be re-derived by enrichment. That record is NOT quarantined.
 *
 * Idempotent: flag appends skip rows that already carry the flag; the website
 * nullification only fires while the junk value is still present; the
 * visibility recompute is a pure function of row state.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation and does NOT merge
 * back from an isolated task-agent DB — only code merges. It MUST run against
 * the LIVE database (main agent / post-merge step).
 *
 * Usage:
 *   npx tsx server/scripts/quarantine-test-communities.ts            # apply
 *   npx tsx server/scripts/quarantine-test-communities.ts --dry-run  # report only
 */
import { pool } from "../db";
import { recomputeCommunityVisibility } from "../services/community-visibility";

/** The three seeded test records (2025-10-11 batch). */
const TEST_COMMUNITY_IDS = [76346, 76347, 76348];

/** Real community whose website was seeded as a self-referential platform URL. */
const JUNK_WEBSITE_COMMUNITY_ID = 73465;

/** Detection sweep for any OTHER seeded/test records that slipped in. */
const TEST_LIKE_SWEEP_SQL = `
  SELECT id, name, city, state, website, is_hidden
  FROM communities
  WHERE (
    name ILIKE '%test community%'
    OR name ILIKE '%demo community%'
    OR name ILIKE '%placeholder%'
    OR website ILIKE '%example.com%'
    OR website ILIKE '%example.org%'
    OR website ILIKE '%.myseniorvalet.com%'
  )
  AND id <> ALL($1::int[])
  AND (is_hidden IS NULL OR is_hidden = false)
  ORDER BY id
`;

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1. Append the protective test_data flag (idempotent — skips rows that have it).
  if (!dryRun) {
    const flagRes = await pool.query(
      `UPDATE communities
       SET data_quality_flags = array_append(COALESCE(data_quality_flags, '{}'), 'test_data')
       WHERE id = ANY($1::int[])
         AND NOT ('test_data' = ANY(COALESCE(data_quality_flags, '{}')))`,
      [TEST_COMMUNITY_IDS],
    );
    console.log(`test_data flag appended to ${flagRes.rowCount} row(s)`);

    // 2. Recompute via the canonical visibility writer — the protective flag
    //    forces is_hidden=true and keeps it there on every future recompute.
    for (const id of TEST_COMMUNITY_IDS) {
      const r = await recomputeCommunityVisibility(id);
      console.log(
        `community ${id}: hidden=${r?.hidden} protected=${r?.protected} flags=${r?.mergedFlags?.join(",")}`,
      );
    }

    // 3. Null the junk self-referential website (guarded: only while it still
    //    points at the platform's own domain, so a real future value is safe).
    const siteRes = await pool.query(
      `UPDATE communities
       SET website = NULL
       WHERE id = $1 AND website ILIKE '%myseniorvalet.com%'`,
      [JUNK_WEBSITE_COMMUNITY_ID],
    );
    console.log(
      `community ${JUNK_WEBSITE_COMMUNITY_ID}: junk website ${siteRes.rowCount ? "nulled" : "already clean"}`,
    );
  } else {
    console.log("[dry-run] skipping writes");
  }

  // 4. Sweep: report any OTHER public test-like records (no writes — surfaced
  //    for human review; quarantine is authorization-gated).
  const sweep = await pool.query(TEST_LIKE_SWEEP_SQL, [TEST_COMMUNITY_IDS]);
  if (sweep.rows.length === 0) {
    console.log("Sweep: no other public seeded/test-like records found.");
  } else {
    console.log(`Sweep: ${sweep.rows.length} other public test-like record(s) — review needed:`);
    for (const row of sweep.rows) {
      console.log(`  ${row.id} | ${row.name} | ${row.city}, ${row.state} | ${row.website ?? ""}`);
    }
  }

  // 5. Verify quarantine state.
  const verify = await pool.query(
    `SELECT id, name, is_hidden, data_quality_flags
     FROM communities WHERE id = ANY($1::int[]) ORDER BY id`,
    [TEST_COMMUNITY_IDS],
  );
  for (const row of verify.rows) {
    console.log(
      `verify ${row.id} (${row.name}): is_hidden=${row.is_hidden} flags=${row.data_quality_flags}`,
    );
  }

  await pool.end();
}

main().catch((err) => {
  console.error("quarantine-test-communities failed:", err);
  process.exit(1);
});
