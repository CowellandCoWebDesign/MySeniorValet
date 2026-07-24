/**
 * Restore screened-real hidden senior communities (Task: broadened,
 * synthetic-screened restore).
 *
 * A quality pass hid 25k+ communities; a deep audit showed the hidden set is a
 * MIX of real facilities (state licensing / HUD sources) and synthetic batches
 * with clear fingerprints:
 *   - template addresses shared across many cities ("1000 Main Street" in
 *     1,466 cities, "9000 Desert Road Rd" across Nevada towns, ...)
 *   - snake_case-only data_source values (e.g. "arizona_government_records")
 *   - rows already flagged synthetic_suspected / clearly_fake / non_senior
 *
 * This script (idempotent, re-runnable, NOTHING deleted):
 *   Phase 1 — flag template-address rows: any address shared by >5 distinct
 *     city/state pairs among HIDDEN rows gets the protective
 *     `synthetic_suspected` flag so it stays hidden regardless of policy.
 *   Phase 2 — sanitize websites on the restorable cohort (sanitizeWebsiteUrl).
 *   Phase 3 — recompute visibility through the ONE writer
 *     (recomputeCommunityVisibility → evaluateCommunity), which now keeps
 *     "senior + phone-or-own-real-website + non-snake-source" PUBLIC even when
 *     thin (screenedThinSenior path), so self-heal will not re-hide them.
 *     Rows with pending removal_requests are skipped.
 *
 * Run (LIVE dev DB — task-agent data does not merge; prod needs its own run):
 *   npx tsx server/scripts/restore-screened-senior-communities.ts            # apply
 *   npx tsx server/scripts/restore-screened-senior-communities.ts --dry-run  # report only
 *   optional: --max-seconds=N to time-box phase 3 (resumable — just re-run)
 */
import { sql } from "drizzle-orm";
import { db } from "../db";
import { recomputeCommunityVisibility } from "../services/community-visibility";
import { sanitizeWebsiteUrl } from "../utils/website-url";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const maxSecondsArg = args.find((a) => a.startsWith("--max-seconds="));
const maxSeconds = maxSecondsArg ? Number(maxSecondsArg.split("=")[1]) : 0;
const deadline = maxSeconds > 0 ? Date.now() + maxSeconds * 1000 : null;

async function countPublic(): Promise<{ visible: number; hidden: number }> {
  const res: any = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE is_hidden = false OR is_hidden IS NULL) AS visible,
      COUNT(*) FILTER (WHERE is_hidden = true) AS hidden
    FROM communities
  `);
  const row = res.rows?.[0] ?? res[0];
  return { visible: Number(row.visible), hidden: Number(row.hidden) };
}

async function phase1FlagTemplateAddresses(): Promise<number> {
  // Template address = same normalized street address appearing in >5 distinct
  // city/state pairs among HIDDEN rows. Real chains reuse names, not street
  // addresses; an address shared across many cities is machine-generated.
  const res: any = await db.execute(sql`
    WITH template_addresses AS (
      SELECT LOWER(TRIM(address)) AS addr
      FROM communities
      WHERE is_hidden = true AND address IS NOT NULL AND TRIM(address) <> ''
      GROUP BY LOWER(TRIM(address))
      HAVING COUNT(DISTINCT LOWER(TRIM(city)) || '|' || LOWER(TRIM(state))) > 5
    )
    SELECT COUNT(*) AS cnt
    FROM communities c
    JOIN template_addresses t ON LOWER(TRIM(c.address)) = t.addr
    WHERE c.is_hidden = true
      AND NOT (COALESCE(c.data_quality_flags, '{}') @> ARRAY['synthetic_suspected'])
  `);
  const toFlag = Number((res.rows?.[0] ?? res[0]).cnt);
  console.log(`Phase 1: ${toFlag} hidden template-address rows need synthetic_suspected flag`);
  if (dryRun || toFlag === 0) return toFlag;

  const upd: any = await db.execute(sql`
    WITH template_addresses AS (
      SELECT LOWER(TRIM(address)) AS addr
      FROM communities
      WHERE is_hidden = true AND address IS NOT NULL AND TRIM(address) <> ''
      GROUP BY LOWER(TRIM(address))
      HAVING COUNT(DISTINCT LOWER(TRIM(city)) || '|' || LOWER(TRIM(state))) > 5
    )
    UPDATE communities c
    SET data_quality_flags = array_append(COALESCE(c.data_quality_flags, '{}'), 'synthetic_suspected')
    FROM template_addresses t
    WHERE LOWER(TRIM(c.address)) = t.addr
      AND c.is_hidden = true
      AND NOT (COALESCE(c.data_quality_flags, '{}') @> ARRAY['synthetic_suspected'])
  `);
  console.log(`Phase 1: flagged ${upd.rowCount ?? toFlag} rows`);
  return toFlag;
}

/**
 * Phase 1b — intra-city template batches. The cross-city screen misses batches
 * whose template address repeats within a SINGLE city (e.g. Eureka NV: six
 * "communities" named after other Nevada towns all at "9000 Desert Road Rd",
 * externally verified fake). Fingerprint: a round-hundred street number
 * ("^\d+00 ") address shared by >5 DISTINCT names in the same city/state where
 * every row is contentless (no description, no photos). Real multi-building
 * campuses have content and never 6+ distinct facility names at one address.
 * Flags synthetic_suspected AND re-hides through the ONE visibility writer.
 */
async function phase1bFlagIntraCityTemplates(): Promise<number> {
  const res: any = await db.execute(sql`
    WITH intra_city_templates AS (
      SELECT LOWER(TRIM(address)) AS addr, LOWER(TRIM(city)) AS city, LOWER(TRIM(state)) AS st
      FROM communities
      WHERE address ~ '^[0-9]+00 '
        AND COALESCE(TRIM(description), '') = ''
        AND COALESCE(array_length(photos, 1), 0) = 0
      GROUP BY 1, 2, 3
      HAVING COUNT(DISTINCT LOWER(name)) > 5
    )
    SELECT c.id
    FROM communities c
    JOIN intra_city_templates t
      ON LOWER(TRIM(c.address)) = t.addr
     AND LOWER(TRIM(c.city)) = t.city
     AND LOWER(TRIM(c.state)) = t.st
    WHERE COALESCE(TRIM(c.description), '') = ''
      AND COALESCE(array_length(c.photos, 1), 0) = 0
      AND NOT (COALESCE(c.data_quality_flags, '{}') @> ARRAY['synthetic_suspected'])
  `);
  const rows = res.rows ?? res;
  const ids: number[] = rows.map((r: any) => Number(r.id));
  console.log(`Phase 1b: ${ids.length} intra-city template rows need synthetic_suspected flag`);
  if (dryRun || ids.length === 0) return ids.length;

  await db.execute(sql`
    UPDATE communities
    SET data_quality_flags = array_append(COALESCE(data_quality_flags, '{}'), 'synthetic_suspected')
    WHERE id = ANY(${sql.raw(`ARRAY[${ids.map((n) => Math.trunc(n)).join(",")}]::int[]`)})
      AND NOT (COALESCE(data_quality_flags, '{}') @> ARRAY['synthetic_suspected'])
  `);
  // Re-hide through the single visibility writer (protective flag wins).
  for (const id of ids) {
    await recomputeCommunityVisibility(id);
  }
  console.log(`Phase 1b: flagged + recomputed ${ids.length} rows`);
  return ids.length;
}

interface Candidate {
  id: number;
  website: string | null;
}

async function loadCandidates(): Promise<Candidate[]> {
  // Restorable cohort: hidden + senior + not protectively flagged + not
  // snake_case-only source + has phone or website + not pending removal.
  // The evaluator makes the final call — this just scopes the recompute.
  const res: any = await db.execute(sql`
    SELECT c.id, c.website
    FROM communities c
    WHERE c.is_hidden = true
      AND c.senior_classification = 'senior'
      AND NOT (COALESCE(c.data_quality_flags, '{}') && ARRAY['synthetic_suspected','clearly_fake','non_senior','geo_needs_review'])
      AND (c.flag_status IS DISTINCT FROM 'confirmed')
      AND (c.data_source IS NULL OR c.data_source !~ '^[a-z_]+$')
      AND (COALESCE(TRIM(c.phone), '') <> '' OR COALESCE(TRIM(c.website), '') <> '')
      AND NOT EXISTS (
        SELECT 1 FROM removal_requests r
        WHERE r.request_type = 'community'
          AND r.entity_id = c.id
          AND r.status = 'pending'
      )
    ORDER BY c.id
  `);
  const rows = res.rows ?? res;
  return rows.map((r: any) => ({ id: Number(r.id), website: r.website ?? null }));
}

async function phase2SanitizeWebsites(candidates: Candidate[]): Promise<number> {
  let changed = 0;
  for (const c of candidates) {
    if (!c.website) continue;
    const clean = sanitizeWebsiteUrl(c.website);
    if (clean !== c.website) {
      changed++;
      if (!dryRun) {
        await db.execute(sql`UPDATE communities SET website = ${clean} WHERE id = ${c.id}`);
      }
    }
  }
  console.log(`Phase 2: sanitized ${changed} website values on the candidate cohort`);
  return changed;
}

async function phase3Recompute(candidates: Candidate[]): Promise<{ restored: number; stillHidden: number; processed: number }> {
  let restored = 0;
  let stillHidden = 0;
  let processed = 0;
  let i = 0;
  const limit = 40;
  let timedOut = false;

  const workers = Array.from({ length: Math.min(limit, candidates.length) }, async () => {
    while (i < candidates.length) {
      if (deadline && Date.now() >= deadline) { timedOut = true; return; }
      const idx = i++;
      const result = await recomputeCommunityVisibility(candidates[idx].id);
      processed++;
      if (result) {
        if (result.hidden) stillHidden++;
        else restored++;
      }
      if (processed % 1000 === 0) {
        console.log(`  ...processed ${processed}/${candidates.length} (restored so far: ${restored})`);
      }
    }
  });
  await Promise.all(workers);
  if (timedOut) console.log(`Phase 3: time budget reached — re-run to resume (idempotent).`);
  return { restored, stillHidden, processed };
}

async function main() {
  console.log(`=== Restore screened-real hidden senior communities ${dryRun ? "(DRY RUN)" : ""} ===`);
  const before = await countPublic();
  console.log(`Before: visible=${before.visible} hidden=${before.hidden}`);

  await phase1FlagTemplateAddresses();
  await phase1bFlagIntraCityTemplates();

  const candidates = await loadCandidates();
  console.log(`Candidate cohort (post-screen): ${candidates.length} hidden senior rows`);

  if (dryRun) {
    console.log("Dry run — phases 2/3 skipped (no writes). Cohort size above is the restorable upper bound.");
    process.exit(0);
  }

  await phase2SanitizeWebsites(candidates);

  const { restored, stillHidden, processed } = await phase3Recompute(candidates);
  console.log(`Phase 3: processed=${processed} restored=${restored} kept-hidden-by-policy=${stillHidden}`);

  const after = await countPublic();
  console.log(`After: visible=${after.visible} hidden=${after.hidden} (net restored: ${after.visible - before.visible})`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Restore script failed:", err);
  process.exit(1);
});
