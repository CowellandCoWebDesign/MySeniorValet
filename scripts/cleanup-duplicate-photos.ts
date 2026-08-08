/**
 * One-time cleanup script: remove duplicate and low-quality photos from all
 * community photo arrays stored in the DB.
 *
 * What it does per community:
 *  1. Remove exact URL duplicates
 *  2. Remove noise patterns (UI chrome, stock sites, sentsuccessfully/closex, etc.)
 *  3. Remove icon-sized thumbnail variants (≤150px dimensions in URL)
 *  4. Collapse thumbnail variants of the same image, keeping the largest version
 *  5. Re-align photoAttributions to match the cleaned photo array
 *
 * Run with:  npx tsx scripts/cleanup-duplicate-photos.ts [--dry-run]
 *
 * Flags:
 *   --dry-run   Print what would change without writing to the DB
 *   --community=<id>  Limit to a single community
 */

import { db } from "../server/db";
import { communities } from "../shared/schema";
import { sql, eq } from "drizzle-orm";
import { CommunityPhotoEnrichment } from "../server/services/community-photo-enrichment";

const DRY_RUN = process.argv.includes("--dry-run");
const communityArg = process.argv.find((a) => a.startsWith("--community="));
const SINGLE_ID = communityArg ? parseInt(communityArg.split("=")[1], 10) : null;

const BATCH_SIZE = 500;

interface Stats {
  total: number;
  examined: number;
  updated: number;
  photosRemoved: number;
  photosKept: number;
  skippedEmpty: number;
}

async function run() {
  const stats: Stats = {
    total: 0,
    examined: 0,
    updated: 0,
    photosRemoved: 0,
    photosKept: 0,
    skippedEmpty: 0,
  };

  console.log(`\n🧹 Photo deduplication cleanup — ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  if (SINGLE_ID) console.log(`   Limiting to community ID ${SINGLE_ID}`);
  console.log();

  let offset = 0;

  while (true) {
    const rows = await db.execute(sql`
      SELECT id, photos, photo_attributions
      FROM communities
      WHERE photos IS NOT NULL
        AND array_length(photos, 1) > 0
        ${SINGLE_ID ? sql`AND id = ${SINGLE_ID}` : sql``}
      ORDER BY id
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `);

    const batch = (rows as any).rows ?? (rows as any);
    if (!batch || batch.length === 0) break;

    for (const row of batch) {
      stats.examined++;
      const communityId: number = row.id;
      const rawPhotos: string[] = row.photos ?? [];
      const rawAttribs: string[] = row.photo_attributions ?? [];

      if (rawPhotos.length === 0) {
        stats.skippedEmpty++;
        continue;
      }

      const cleaned = CommunityPhotoEnrichment.cleanPhotoArray(rawPhotos);

      const removed = rawPhotos.length - cleaned.length;
      if (removed === 0) {
        // Nothing changed
        stats.photosKept += rawPhotos.length;
        continue;
      }

      // Re-align photoAttributions: keep only the attributions whose original
      // index maps to a URL that survived the clean.
      const survivorSet = new Set(cleaned);
      const cleanedAttribs: string[] = rawPhotos
        .map((url, i) => (survivorSet.has(url) ? (rawAttribs[i] ?? "") : null))
        .filter((a): a is string => a !== null);

      stats.updated++;
      stats.photosRemoved += removed;
      stats.photosKept += cleaned.length;

      console.log(
        `  Community ${communityId}: ${rawPhotos.length} → ${cleaned.length} photos` +
          ` (removed ${removed})`,
      );

      if (!DRY_RUN) {
        // Use Drizzle ORM .update() so the driver serialises arrays correctly.
        // Raw `JSON.stringify(arr)::text[]` is rejected by PG because JSON
        // array syntax differs from PG array literal syntax.
        await db.update(communities)
          .set({ photos: cleaned, photoAttributions: cleanedAttribs, updatedAt: new Date() })
          .where(eq(communities.id, communityId));
      }
    }

    offset += BATCH_SIZE;
    if (SINGLE_ID) break; // single-community mode — one batch is enough
  }

  stats.total = stats.examined;

  console.log(`\n✅ Done.`);
  console.log(`   Communities examined : ${stats.examined}`);
  console.log(`   Communities updated  : ${stats.updated}${DRY_RUN ? " (dry run — no writes)" : ""}`);
  console.log(`   Photos removed       : ${stats.photosRemoved}`);
  console.log(`   Photos kept          : ${stats.photosKept}`);
  console.log();
}

run().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
