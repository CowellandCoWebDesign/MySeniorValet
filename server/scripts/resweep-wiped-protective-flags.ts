/**
 * Re-sweep communities whose data_quality_flags were wiped by past admin
 * restores (Task: stop admin restore from resurrecting quarantined listings).
 *
 * Historic restore endpoints ran `SET is_hidden=false, data_quality_flags='{}'`,
 * erasing protective flags. The wipe's hallmark is a PUBLIC row with an empty
 * flag array (the canonical recompute always writes managed flags). This
 * script recomputes classification/score/visibility for every such row via
 * the ONE canonical writer, so any record whose content fingerprints as
 * test/fake/non-senior is re-hidden with fresh flags. Nothing is deleted.
 *
 * IMPORTANT (isolated-env caveat): this is a DATA operation — it MUST run
 * against the LIVE database (main agent / post-merge step); results do not
 * merge back from isolated task-agent DBs.
 *
 * Idempotent: recompute is a pure function of row state; re-running after the
 * first pass finds zero empty-flag public rows.
 *
 * Usage:
 *   npx tsx server/scripts/resweep-wiped-protective-flags.ts            # apply
 *   npx tsx server/scripts/resweep-wiped-protective-flags.ts --dry-run  # report only
 */
import { pool } from "../db";
import {
  recomputeCommunityVisibility,
  computeRowVisibility,
} from "../services/community-visibility";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const { rows } = await pool.query(
    `SELECT id, name, city, state, is_hidden
     FROM communities
     WHERE (is_hidden IS NULL OR is_hidden = false)
       AND (data_quality_flags = '{}' OR data_quality_flags IS NULL)
     ORDER BY id`,
  );
  console.log(
    `${dryRun ? "[dry-run] " : ""}Found ${rows.length} public row(s) with wiped/empty flags`,
  );

  let hid = 0;
  let kept = 0;
  for (const r of rows) {
    if (dryRun) {
      const { rows: full } = await pool.query(
        `SELECT * FROM communities WHERE id = $1`,
        [r.id],
      );
      const decision = computeRowVisibility({
        ...full[0],
        dataQualityFlags: full[0].data_quality_flags,
        flagStatus: full[0].flag_status,
        isHidden: full[0].is_hidden,
        careTypes: full[0].care_types,
        communitySubtype: full[0].community_subtype,
        facilityType: full[0].facility_type,
        isVerified: full[0].is_verified,
        isClaimed: full[0].is_claimed,
        claimVerified: full[0].claim_verified,
        isFeaturedBrand: full[0].is_featured_brand,
        subscriptionTier: full[0].subscription_tier,
        hudPropertyId: full[0].hud_property_id,
        rentPerMonth: full[0].rent_per_month,
      } as any);
      if (decision.hidden) {
        hid++;
        console.log(
          `[dry-run] WOULD HIDE ${r.id} (${r.name}, ${r.city}, ${r.state}) flags=${decision.mergedFlags.join(",")}`,
        );
      } else kept++;
      continue;
    }

    const res = await recomputeCommunityVisibility(r.id);
    if (!res) continue;
    if (res.hidden) {
      hid++;
      console.log(
        `RE-HID ${r.id} (${r.name}, ${r.city}, ${r.state}) flags=${res.mergedFlags.join(",")} protected=${res.protected}`,
      );
    } else {
      kept++;
    }
  }
  console.log(`Done: ${kept} stayed public, ${hid} re-hidden.`);

  await pool.end();
}

main().catch((err) => {
  console.error("resweep-wiped-protective-flags failed:", err);
  process.exit(1);
});
