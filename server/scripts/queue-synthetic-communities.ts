/**
 * Queue machine-generated synthetic listings for removal — any state, or all.
 *
 * Generalizes the Georgia runner (Task #341) to the nationwide pattern
 * confirmed in Task #344: thousands of HIDDEN listings across many states share
 * the same machine-generated templated website `{town}-senior-living.com`, each
 * with a fabricated (mis-located) address, an auto-generated phone, and no
 * photos/description. Enriching them would fabricate data (Golden Data Rule), so
 * they must be QUEUED for the user's approval to remove — NEVER deleted here.
 *
 * Detection is IDENTICAL to the Georgia script: hidden rows whose website
 * matches `%-senior-living.com`. Real brands use real domains and never match.
 *
 * For each matched listing (authorization-gated per the Removal Authorization Rule):
 *   1. Creates a pending removal_requests row (the existing removal-review flow),
 *      attributed to the platform's data-integrity system, with a synthetic-data
 *      reason. Idempotent — skips a listing that already has an open request.
 *   2. Adds the PROTECTIVE `synthetic_suspected` flag + flag_status='pending' and
 *      keeps is_hidden=true, so it surfaces in the admin QC queue ("Fake /
 *      suspect") for bulk review. NOTHING is deleted.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation and does NOT merge
 * back from an isolated task-agent DB — only code merges. The actual queueing
 * pass MUST run against the LIVE database (main agent / post-merge step).
 *
 * Usage:
 *   npx tsx server/scripts/queue-synthetic-communities.ts --state=TX          # one state, apply
 *   npx tsx server/scripts/queue-synthetic-communities.ts --state=Ohio --dry-run
 *   npx tsx server/scripts/queue-synthetic-communities.ts                     # ALL states, apply
 *   npx tsx server/scripts/queue-synthetic-communities.ts --dry-run           # ALL states, report only
 *   npx tsx server/scripts/queue-synthetic-communities.ts --limit=50          # cap for a test run
 */
import { pool } from "../db";
import { normalizeState, statePredicate } from "./us-states";

// Matches the machine-generated templated domain `{town}-senior-living.com`.
// Real brands (atriaseniorliving.com, belmontvillage.com, brookdale.com, …) do
// NOT match this pattern, so they are never queued.
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

interface SyntheticRow {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
}

async function main() {
  const dryRun = arg("dry-run") !== undefined;
  const limitArg = arg("limit");
  const limit = limitArg ? Math.max(1, parseInt(limitArg, 10)) : undefined;

  const stateArg = arg("state");
  let stateCode: string | undefined;
  if (stateArg) {
    stateCode = normalizeState(stateArg);
    if (!stateCode) {
      console.error(`❌ Unknown --state="${stateArg}". Use a 2-letter code (TX) or full name (Texas).`);
      await pool.end();
      process.exit(1);
    }
  }

  const scope = stateCode ? `state=${stateCode}` : "ALL STATES";
  console.log("🧹 Queue synthetic templated listings for removal (Task #344)");
  console.log(`mode: ${dryRun ? "DRY-RUN (no writes)" : "APPLY"}  ${scope}${limit ? `  limit=${limit}` : ""}`);

  const whereState = stateCode ? `AND ${statePredicate(stateCode)}` : "";

  // Load the synthetic templated listings (hidden only — never touch visible or
  // genuinely-real hidden communities). Ordered so per-state grouping is stable.
  const rows = (
    await pool.query(
      `SELECT id, name, city, state, website
         FROM communities
        WHERE is_hidden = true
          AND ${SYNTHETIC_WEBSITE_PREDICATE}
          ${whereState}
        ORDER BY upper(trim(coalesce(state,''))), id
        ${limit ? `LIMIT ${limit}` : ""}`,
    )
  ).rows as SyntheticRow[];

  console.log(`Found ${rows.length} synthetic templated listings to queue.\n`);

  let created = 0;
  let alreadyQueued = 0;
  let flagged = 0;
  let failed = 0;
  // Per-state report: { queued (new removal requests), skipped (open req), flagged }.
  const perState = new Map<string, { queued: number; skipped: number; flagged: number }>();
  const bump = (st: string, key: "queued" | "skipped" | "flagged") => {
    const cur = perState.get(st) ?? { queued: 0, skipped: 0, flagged: 0 };
    cur[key] += 1;
    perState.set(st, cur);
  };

  for (const c of rows) {
    const st = (c.state ?? "?").toUpperCase().trim() || "?";
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
        if (!hasOpenRequest) {
          created += 1;
          bump(st, "queued");
        } else {
          alreadyQueued += 1;
          bump(st, "skipped");
        }
        continue;
      }

      if (!hasOpenRequest) {
        // Raw parameterized insert of ONLY the core removal_requests columns.
        // removal_requests has known Drizzle/DB drift (the schema declares
        // supporting_documents / ip_address / user_agent, which don't exist in
        // every DB), so storage.createRemovalRequest can 42703 here. These core
        // columns exist in both dev and prod, making the insert portable.
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
        bump(st, "queued");

        // Best-effort audit trail (never let audit-table drift fail the queueing).
        try {
          await pool.query(
            `INSERT INTO audit_logs (user_id, entity_type, entity_id, action, metadata)
             VALUES ('system', 'removal_request', $1, 'create', $2::jsonb)`,
            [
              String(inserted.rows[0].id),
              JSON.stringify({ requestType: "community", communityId: c.id, reason: "synthetic_templated", state: st }),
            ],
          );
        } catch {
          /* audit is non-critical */
        }
      } else {
        alreadyQueued += 1;
        bump(st, "skipped");
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
      bump(st, "flagged");
    } catch (err) {
      failed += 1;
      console.error(`  ⚠️  #${c.id} ${c.name} (${st}) failed:`, (err as Error)?.message ?? err);
    }
  }

  console.log("\n===== SYNTHETIC QUEUE SUMMARY =====");
  console.log(`synthetic listings matched:  ${rows.length}`);
  console.log(`removal requests created:    ${created}`);
  console.log(`already had an open request: ${alreadyQueued}`);
  console.log(`communities flagged/hidden:  ${flagged}`);
  console.log(`failed:                      ${failed}`);

  if (perState.size > 1 || !stateCode) {
    console.log("\nper-state (queued → skipped → flagged):");
    const sorted = [...perState.entries()].sort((a, b) => b[1].queued - a[1].queued);
    for (const [st, r] of sorted) {
      console.log(`  ${st.padEnd(6)} ${r.queued} → ${r.skipped} → ${r.flagged}`);
    }
  }

  if (dryRun) console.log("\n(DRY-RUN: nothing was persisted.)");
  console.log(
    "\nNext: review these in the admin QC Review queue (Fake / suspect) or the " +
      "removal-request list, then approve removal there. Nothing was deleted.",
  );

  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("❌ queue-synthetic-communities failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
