/**
 * Backfill Next.js image-optimizer photo URLs
 * ===========================================
 * Communities enriched before `unwrapNextImageUrl` was added to the normalizer
 * still have Next.js image-optimizer wrapper URLs stored in `communities.photos`
 * (`<host>/_next/image?url=<encoded CDN url>&w=&q=`). These wrappers 429
 * rate-limit when proxied and render as "Image temporarily unavailable", even
 * though the underlying CDN URL loads reliably.
 *
 * This one-time backfill rewrites every affected photo array through
 * `normalizePhotoUrls` (which now calls `unwrapNextImageUrl`) so the underlying
 * CDN URLs are persisted and the photos render without re-enrichment.
 *
 * Idempotent and safe to re-run: rows already free of `/_next/image?url=` are
 * skipped, and unchanged arrays are not written.
 *
 * Run:  npx tsx server/scripts/backfill-next-image-photos.ts
 *       npx tsx server/scripts/backfill-next-image-photos.ts --dry-run
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhotoUrls } from "../utils/photo-urls";

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  console.log(`🔧 Backfilling Next.js image wrapper photo URLs${DRY_RUN ? " (DRY RUN)" : ""}…`);

  // Rows whose photos[] still contain a Next.js image-optimizer wrapper.
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      photos: communities.photos,
    })
    .from(communities)
    .where(sql`array_to_string(${communities.photos}, ',') LIKE '%/_next/image?url=%'`);

  console.log(`Found ${rows.length} community rows to inspect.`);

  let updated = 0;
  let unchanged = 0;

  for (const row of rows) {
    const current: any[] = Array.isArray(row.photos) ? row.photos : [];
    const repaired = normalizePhotoUrls(current);

    const changed =
      repaired.length !== current.length ||
      repaired.some((u, i) => u !== current[i]);

    if (!changed) {
      unchanged++;
      continue;
    }

    updated++;
    console.log(
      `  ✅ [${row.id}] ${row.name}: unwrapped ${current.length} → ${repaired.length} clean URLs`,
    );

    if (!DRY_RUN) {
      await db
        .update(communities)
        .set({ photos: repaired })
        .where(eq(communities.id, row.id));
    }
  }

  console.log(
    `\nDone. scanned=${rows.length}, updated=${updated}, unchanged=${unchanged}` +
      (DRY_RUN ? "  (no writes — dry run)" : ""),
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
