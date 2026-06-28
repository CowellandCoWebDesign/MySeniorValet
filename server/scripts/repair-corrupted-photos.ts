/**
 * Repair corrupted community photos
 * =================================
 * Two historical corruptions broke public photo rendering even when admin
 * enrichment "found" photos:
 *
 *   1. "[object Object]" — object entries ({url, source}) were written into the
 *      text[] `photos` column and coerced to the literal string "[object Object]".
 *      The real URLs usually survive in enrichment_data->'photos'.
 *   2. "&amp;" — HTML-entity-encoded URLs that 404 when fetched.
 *
 * This script:
 *   - Recovers object-corrupted rows from enrichment_data->'photos'
 *   - Decodes HTML entities in every affected URL
 *   - Clears photo arrays that are entirely unrecoverable (so the UI shows the
 *     honest empty state instead of broken images)
 *
 * Run:  npx tsx server/scripts/repair-corrupted-photos.ts
 *       npx tsx server/scripts/repair-corrupted-photos.ts --dry-run
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhotoUrls } from "../utils/photo-urls";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  console.log(`🔧 Repairing corrupted community photos${DRY_RUN ? " (DRY RUN)" : ""}…`);

  // Rows where photos[] contains "[object Object]" OR an entity-encoded URL.
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      photos: communities.photos,
      enrichmentData: communities.enrichmentData,
    })
    .from(communities)
    .where(
      sql`'[object Object]' = ANY(${communities.photos})
        OR array_to_string(${communities.photos}, ',') LIKE '%&amp;%'
        OR array_to_string(${communities.photos}, ',') LIKE '%&#%'`,
    );

  console.log(`Found ${rows.length} community rows to inspect.`);

  let recovered = 0;
  let decodedOnly = 0;
  let cleared = 0;

  for (const row of rows) {
    const current: any[] = Array.isArray(row.photos) ? row.photos : [];
    const hasObjectCorruption = current.some((p) => p === "[object Object]");

    // 1. Try to normalize whatever real URLs survive directly in the column.
    let repaired = normalizePhotoUrls(current);

    // 2. If object corruption wiped URLs, recover from enrichment_data->'photos'.
    if (hasObjectCorruption) {
      const enrichPhotos = (row.enrichmentData as any)?.photos;
      const fromEnrich = normalizePhotoUrls(Array.isArray(enrichPhotos) ? enrichPhotos : []);
      // Merge: surviving column URLs first, then enrichment URLs (deduped).
      repaired = normalizePhotoUrls([...repaired, ...fromEnrich]);
    }

    const changed =
      repaired.length !== current.length ||
      repaired.some((u, i) => u !== current[i]);

    if (!changed) continue;

    if (repaired.length === 0) {
      cleared++;
      console.log(`  🧹 [${row.id}] ${row.name}: no recoverable URLs → clearing ${current.length} corrupt entries`);
    } else if (hasObjectCorruption) {
      recovered++;
      console.log(`  ✅ [${row.id}] ${row.name}: recovered ${repaired.length} URLs (was ${current.length} w/ [object Object])`);
    } else {
      decodedOnly++;
      console.log(`  🔗 [${row.id}] ${row.name}: decoded entities → ${repaired.length} clean URLs`);
    }

    if (!DRY_RUN) {
      await db
        .update(communities)
        .set({ photos: repaired })
        .where(eq(communities.id, row.id));
    }
  }

  console.log(
    `\nDone. recovered=${recovered}, decoded-only=${decodedOnly}, cleared=${cleared}, unchanged=${rows.length - recovered - decodedOnly - cleared}` +
      (DRY_RUN ? "  (no writes — dry run)" : ""),
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Repair failed:", err);
  process.exit(1);
});
