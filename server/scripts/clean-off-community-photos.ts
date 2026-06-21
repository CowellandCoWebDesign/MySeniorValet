/**
 * One-off cleanup for mismatched / non-authentic community photos (Golden Data
 * Rule). Two passes, both applied in a single update per community:
 *
 *   1. NAME MISMATCH — remove photos whose filename/host embeds a DIFFERENT
 *      community's name. Uses the SAME runtime helper as the enrichment
 *      pipeline (CommunityPhotoEnrichment.photoBelongsToDifferentCommunity) so
 *      the persisted DB matches what the live filters produce.
 *
 *   2. CROSS-COMMUNITY DUPLICATE — remove a photo URL that is shared across
 *      `SHARED_THRESHOLD`+ DISTINCT communities. A single image cannot
 *      authentically represent that many different-named facilities; in practice
 *      these are directory placeholders, og-images, base64 stubs and shared
 *      chain-branding banners. Reject rather than invent.
 *
 * Run:  npx tsx server/scripts/clean-off-community-photos.ts          (apply)
 *       npx tsx server/scripts/clean-off-community-photos.ts --dry-run (preview)
 */
import { sql, eq } from "drizzle-orm";
import { db } from "../db";
import { communities } from "@shared/schema";
import { CommunityPhotoEnrichment } from "../services/community-photo-enrichment";

const SHARED_THRESHOLD = 3;

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

  // Pass 2 prep: count how many DISTINCT communities each URL appears on.
  const urlToCommunities = new Map<string, Set<number>>();
  for (const row of rows) {
    const photos: string[] = Array.isArray(row.photos) ? row.photos : [];
    for (const url of photos) {
      if (!url) continue;
      if (!urlToCommunities.has(url)) urlToCommunities.set(url, new Set());
      urlToCommunities.get(url)!.add(row.id);
    }
  }
  const isCrossCommunityDuplicate = (url: string) =>
    (urlToCommunities.get(url)?.size ?? 0) >= SHARED_THRESHOLD;

  let changed = 0;
  let removedName = 0;
  let removedDup = 0;

  for (const row of rows) {
    const photos: string[] = Array.isArray(row.photos) ? row.photos : [];
    const attrs: string[] = Array.isArray(row.photo_attributions)
      ? row.photo_attributions
      : [];

    const droppedName: string[] = [];
    const droppedDup: string[] = [];

    const keptPairs = photos
      .map((url, i) => ({ url, attr: attrs[i] ?? "" }))
      .filter((p) => {
        if (
          CommunityPhotoEnrichment.photoBelongsToDifferentCommunity(
            p.url,
            row.name || "",
            row.city || "",
            row.website || "",
          )
        ) {
          droppedName.push(p.url);
          return false;
        }
        if (isCrossCommunityDuplicate(p.url)) {
          droppedDup.push(p.url);
          return false;
        }
        return true;
      });

    if (keptPairs.length === photos.length) continue;

    removedName += droppedName.length;
    removedDup += droppedDup.length;
    changed++;

    console.log(
      `\n#${row.id} "${row.name}" (${row.city}) — removing ${
        photos.length - keptPairs.length
      }/${photos.length}:`,
    );
    droppedName.forEach((u) => console.log(`   ✗ [name]  ${u}`));
    droppedDup.forEach((u) =>
      console.log(
        `   ✗ [dup×${urlToCommunities.get(u)?.size}] ${u.slice(0, 120)}`,
      ),
    );

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
    `\n✅ Done. ${changed} communities ${
      dryRun ? "would be" : "were"
    } updated; ${removedName} name-mismatch + ${removedDup} cross-community-duplicate photo(s) ${
      dryRun ? "would be" : ""
    } removed.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
