/**
 * Task #352 — one-time idempotent backfill:
 *  1. Upgrade poor stored descriptions (generic template pattern or legacy
 *     1000-char truncation) from already-cached enrichment data
 *     (enrichment_data->searchResults->>summary). Uses the same
 *     shouldUpgradeDescription gate as the orchestrator (non-forced mode), so
 *     re-running the script is a no-op once upgraded.
 *  2. Fix corrupted website values (markdown ** artifacts, bare domains with
 *     no protocol, junk placeholders) via sanitizeWebsiteUrl.
 *
 * Run with:  npx tsx server/scripts/backfill-descriptions-from-cache.ts
 * Dry run:   npx tsx server/scripts/backfill-descriptions-from-cache.ts --dry-run
 */

import { db } from "../db";
import { sql } from "drizzle-orm";
import { shouldUpgradeDescription } from "../utils/description-quality";
import { sanitizeWebsiteUrl } from "../utils/website-url";
import { cleanCitationArtifacts } from "../utils/data-quality";

const DRY_RUN = process.argv.includes("--dry-run");

async function backfillDescriptions() {
  console.log("─".repeat(60));
  console.log("STEP 1: Description backfill from cached enrichment data");

  // Only rows that HAVE a cached summary — candidates for upgrade.
  const rows = (await db.execute(sql`
    SELECT id, name, description,
           enrichment_data->'searchResults'->>'summary' AS cached_summary
    FROM communities
    WHERE enrichment_data->'searchResults'->>'summary' IS NOT NULL
      AND length(enrichment_data->'searchResults'->>'summary') > 50
  `)).rows as Array<{
    id: number;
    name: string;
    description: string | null;
    cached_summary: string;
  }>;

  console.log(`Found ${rows.length} communities with cached enrichment summaries`);

  let upgraded = 0;
  for (const row of rows) {
    const candidate = cleanCitationArtifacts(row.cached_summary) || "";
    if (!candidate) continue;
    if (!shouldUpgradeDescription(row.description, candidate, false)) continue;

    upgraded++;
    const fromLen = (row.description || "").length;
    console.log(
      `  ↑ [${row.id}] ${row.name}: ${fromLen} chars → ${candidate.length} chars`,
    );
    if (!DRY_RUN) {
      await db.execute(sql`
        UPDATE communities SET description = ${candidate} WHERE id = ${row.id}
      `);
    }
  }
  console.log(`${DRY_RUN ? "[DRY RUN] Would upgrade" : "Upgraded"} ${upgraded} descriptions`);
}

async function fixCorruptedWebsites() {
  console.log("─".repeat(60));
  console.log("STEP 2: Website sanitation (markdown artifacts / missing protocol / junk)");

  // Candidates: anything that is not already a clean absolute http(s) URL,
  // plus URLs containing markdown artifacts.
  const rows = (await db.execute(sql`
    SELECT id, name, website
    FROM communities
    WHERE website IS NOT NULL
      AND website != ''
      AND (website !~* '^https?://' OR website LIKE '%*%' OR website LIKE '%[%')
  `)).rows as Array<{ id: number; name: string; website: string }>;

  console.log(`Found ${rows.length} communities with malformed website values`);

  let fixed = 0;
  let cleared = 0;
  for (const row of rows) {
    const clean = sanitizeWebsiteUrl(row.website);
    if (clean === row.website) continue;

    if (clean) {
      fixed++;
      console.log(`  ✎ [${row.id}] ${row.name}: "${row.website}" → "${clean}"`);
    } else {
      cleared++;
      console.log(`  ✗ [${row.id}] ${row.name}: junk website "${row.website}" → NULL`);
    }
    if (!DRY_RUN) {
      await db.execute(sql`
        UPDATE communities SET website = ${clean} WHERE id = ${row.id}
      `);
    }
  }
  console.log(
    `${DRY_RUN ? "[DRY RUN] Would fix" : "Fixed"} ${fixed} websites, ` +
    `${DRY_RUN ? "would clear" : "cleared"} ${cleared} junk values`,
  );
}

async function main() {
  console.log(`Backfill script starting ${DRY_RUN ? "(DRY RUN — no writes)" : "(LIVE)"}`);
  await backfillDescriptions();
  await fixCorruptedWebsites();
  console.log("─".repeat(60));
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
