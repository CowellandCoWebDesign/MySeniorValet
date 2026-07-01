/**
 * Task #341 (part 2) — queue synthetic templated Georgia listings for removal.
 *
 * Georgia carries 583 machine-generated fake listings: hidden communities whose
 * website is a templated `{town}-senior-living.com` domain, each with a
 * fabricated (mis-located) address, an auto-generated phone, and no photos/
 * description. Enriching them would fabricate data (Golden Data Rule), so they
 * must be QUEUED for the user's approval to remove — never deleted here.
 *
 * This runner (authorization-gated per the Removal Authorization Rule):
 *   1. Creates a pending removal_requests row per synthetic listing (the existing
 *      removal-review flow), attributed to the platform's own data-integrity
 *      system, with a clear synthetic-data reason. Idempotent — skips a listing
 *      that already has an open removal request.
 *   2. Marks the community with the `synthetic_suspected` flag (a PROTECTIVE flag
 *      that keeps it hidden and out of auto-restore) and sets flag_status='pending'
 *      so it surfaces in the admin QC review queue under "Fake / suspect" for
 *      bulk review. is_hidden stays true. NOTHING is deleted.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation and does NOT merge
 * back from an isolated task-agent DB — only code merges. The actual queueing
 * pass MUST be run against the LIVE database (main agent / post-merge step).
 *
 * Usage:
 *   npx tsx server/scripts/queue-synthetic-georgia.ts             # apply
 *   npx tsx server/scripts/queue-synthetic-georgia.ts --dry-run   # report only
 *   npx tsx server/scripts/queue-synthetic-georgia.ts --limit=50  # cap for a test run
 */
import { pool } from "../db";

// Matches the machine-generated templated domain `{town}-senior-living.com`.
// Real GA brands (atriaseniorliving.com, belmontvillage.com, jewishhomelife.org,
// robinrunvillage.org, …) do NOT match this pattern, so they are never queued.
const GA_STATE_PREDICATE = `upper(trim(coalesce(state,''))) IN ('GA','GEORGIA')`;
const SYNTHETIC_WEBSITE_PREDICATE = `website ILIKE '%-senior-living.com'`;

const REMOVAL_REASON =
  "Synthetic / fabricated listing: machine-generated from a templated " +
  "'{town}-senior-living.com' domain with an auto-generated phone number and a " +
  "mis-located (fabricated) street address. No photos or description. Flagged by " +
  "the MySeniorValet data-integrity system for removal review per the Golden Data Rule.";

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? "true" : hit.slice(eq + 1);
}

async function main() {
  const dryRun = arg("dry-run") !== undefined;
  const limitArg = arg("limit");
  const limit = limitArg ? Math.max(1, parseInt(limitArg, 10)) : undefined;

  console.log("🧹 Queue synthetic Georgia listings for removal (Task #341)");
  console.log(`mode: ${dryRun ? "DRY-RUN (no writes)" : "APPLY"}${limit ? `  limit=${limit}` : ""}`);

  // Load the synthetic templated GA listings (hidden only — we never touch the
  // ~14 visible / ~8-10 genuinely-real hidden GA communities).
  const rows = (
    await pool.query(
      `SELECT id, name, city, state, website
         FROM communities
        WHERE ${GA_STATE_PREDICATE}
          AND is_hidden = true
          AND ${SYNTHETIC_WEBSITE_PREDICATE}
        ORDER BY id
        ${limit ? `LIMIT ${limit}` : ""}`,
    )
  ).rows as { id: number; name: string; city: string | null; state: string | null; website: string | null }[];

  console.log(`Found ${rows.length} synthetic templated GA listings to queue.\n`);

  let created = 0;
  let alreadyQueued = 0;
  let flagged = 0;
  let failed = 0;

  for (const c of rows) {
    try {
      // Idempotency: skip if an open (pending/reviewing) community removal request
      // already exists for this listing.
      const existing = await pool.query(
        `SELECT 1 FROM removal_requests
          WHERE request_type = 'community' AND entity_id = $1
            AND status IN ('pending','reviewing')
          LIMIT 1`,
        [c.id],
      );
      const hasOpenRequest = (existing.rowCount ?? 0) > 0;

      if (dryRun) {
        console.log(
          `  [dry] ${hasOpenRequest ? "SKIP (open req)" : "QUEUE"} #${c.id} ${c.name} ` +
            `(${c.city ?? "?"}, ${c.state ?? "?"}) ${c.website ?? ""}`,
        );
        if (!hasOpenRequest) created += 1;
        else alreadyQueued += 1;
        continue;
      }

      if (!hasOpenRequest) {
        // Raw parameterized insert of ONLY the core removal_requests columns.
        // The removal_requests table has known Drizzle/DB drift (the schema
        // declares supporting_documents / ip_address / user_agent, which don't
        // exist in every DB), so storage.createRemovalRequest can 42703 here.
        // These core columns exist in both dev and prod, making the insert
        // portable across the drift.
        const inserted = await pool.query(
          `INSERT INTO removal_requests
             (request_type, entity_id, entity_name, requestor_name, requestor_email,
              requestor_role, reason, legal_basis, additional_notes, status,
              created_at, updated_at)
           VALUES ('community', $1, $2,
              'MySeniorValet Data Integrity System', 'hello@myseniorvalet.com',
              'authorized_representative', $3, 'accuracy', $4, 'pending',
              now(), now())
           RETURNING id`,
          [
            c.id,
            c.name,
            REMOVAL_REASON,
            `Templated domain: ${c.website ?? "n/a"} · Location: ${c.city ?? "?"}, ${c.state ?? "?"}`,
          ],
        );
        created += 1;

        // Best-effort audit trail (never let audit-table drift fail the queueing).
        try {
          await pool.query(
            `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, metadata)
             VALUES ('system', 'removal_request', $1, 'create', $2::jsonb)`,
            [
              String(inserted.rows[0].id),
              JSON.stringify({ requestType: "community", communityId: c.id, reason: "synthetic_templated_ga" }),
            ],
          );
        } catch {
          /* audit is non-critical */
        }
      } else {
        alreadyQueued += 1;
      }

      // Mark the community so it surfaces in the QC review queue under
      // "Fake / suspect" and stays hidden (synthetic_suspected is protective).
      // array_agg(DISTINCT …) both appends the flag and de-dupes existing flags.
      await pool.query(
        `UPDATE communities
            SET data_quality_flags = (
                  SELECT array_agg(DISTINCT f)
                    FROM unnest(array_append(COALESCE(data_quality_flags, '{}'), 'synthetic_suspected')) AS f
                ),
                flag_status = 'pending',
                is_hidden = true,
                updated_at = now()
          WHERE id = $1`,
        [c.id],
      );
      flagged += 1;
    } catch (err) {
      failed += 1;
      console.error(`  ⚠️  #${c.id} ${c.name} failed:`, (err as Error)?.message ?? err);
    }
  }

  console.log("\n===== SYNTHETIC QUEUE SUMMARY =====");
  console.log(`synthetic GA listings matched: ${rows.length}`);
  console.log(`removal requests created:      ${created}`);
  console.log(`already had an open request:   ${alreadyQueued}`);
  console.log(`communities flagged/hidden:    ${flagged}`);
  console.log(`failed:                        ${failed}`);
  if (dryRun) console.log("\n(DRY-RUN: nothing was persisted.)");
  console.log(
    "\nNext: review these in the admin QC Review queue (Fake / suspect) or the " +
      "removal-request list, then approve removal there. Nothing was deleted.",
  );

  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ queue-synthetic-georgia failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
