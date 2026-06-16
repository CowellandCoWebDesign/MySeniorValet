/**
 * One-off cleanup: remove photos whose filename embeds a DIFFERENT community's
 * name (Golden Data Rule). Uses the SAME runtime helper as the enrichment
 * pipeline (CommunityPhotoEnrichment.photoBelongsToDifferentCommunity) so the
 * persisted DB matches what the live filters would produce.
 *
 * Run:  npx tsx server/scripts/clean-off-community-photos.ts          (apply)
 *       npx tsx server/scripts/clean-off-community-photos.ts --dry-run (preview)
 */
import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { communities } from "@shared/schema";
import { CommunityPhotoEnrichment } from "../services/community-photo-enrichment";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`🧹 Off-community photo cleanup — ${dryRun ? "DRY RUN" : "APPLY"}`);

  // Raw SELECT * to avoid Drizzle column drift (admin_rating_override).
  const { rows } = (await db.execute(sql`
    SELECT id, name, city, website, photos, photo_attributions
    FROM communities
    WHERE photos IS NOT NULL AND array_length(photos, 1) > 0
  `)) as unknown as { rows: any[] };

  console.log(`Scanning ${rows.length} communities with photos...`);

  let changed = 0;
  let removedTotal = 0;

  for (const row of rows) {
    const photos: string[] = Array.isArray(row.photos) ? row.photos : [];
    const attrs: string[] = Array.isArray(row.photo_attributions)
      ? row.photo_attributions
      : [];

    const keptPairs = photos
      .map((url, i) => ({ url, attr: attrs[i] ?? "" }))
      .filter(
        (p) =>
          !CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
            p.url,
            row.name || "",
            row.city || "",
            row.website || "",
          ),
      );

    if (keptPairs.length === photos.length) continue;

    const removed = photos.length - keptPairs.length;
    removedTotal += removed;
    changed++;

    const dropped = photos.filter(
      (u) =>
        CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
          u,
          row.name || "",
          row.city || "",
          row.website || "",
        ),
    );
    console.log(
      `\n#${row.id} "${row.name}" (${row.city}) — removing ${removed}/${photos.length}:`,
    );
    dropped.forEach((u) => console.log(`   ✗ ${u}`));

    if (!dryRun) {
      const keptPhotos = keptPairs.map((p) => p.url);
      const keptAttrs = keptPairs.map((p) => p.attr);
      await db
        .update(communities)
        .set({
          photos: keptPhotos,
          photoAttributions: keptAttrs,
          updatedAt: new Date(),
        })
        .where(eq(communities.id, row.id));
    }
  }

  console.log(
    `\n✅ Done. ${changed} communities ${dryRun ? "would be" : "were"} updated; ${removedTotal} photo(s) ${dryRun ? "would be" : ""} removed.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
