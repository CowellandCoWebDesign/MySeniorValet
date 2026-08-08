/**
 * Measure the photo re-enrichment trap (READ-ONLY).
 * =================================================
 * A community is "trapped" when:
 *   1. It has stored photos, but the serve-time sibling/junk filter removes ALL
 *      of them (visitors see zero photos), AND
 *   2. The enrichment cache is armed (lastSuccessfulEnrichment set + meaningful
 *      description >80 chars), so `enrichCommunityUnified` serves the persisted
 *      record forever and photo re-discovery never runs.
 *
 * Run: npx tsx server/scripts/measure-photo-trap.ts
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { CommunityPhotoEnrichment } from "../services/community-photo-enrichment";

async function main() {
  const rows = (await db.execute(sql`
    SELECT id, name, city, state, website, photos,
           last_successful_enrichment,
           length(coalesce(trim(description), '')) AS desc_len
    FROM communities
    WHERE (is_hidden IS NOT TRUE)
      AND photos IS NOT NULL
      AND array_length(photos, 1) > 0
      AND last_successful_enrichment IS NOT NULL
      AND length(coalesce(trim(description), '')) > 80
  `)) as any;
  const list = rows.rows ?? rows;

  let trapped: Array<{ id: number; name: string; city: string; state: string; stored: number }> = [];
  for (const c of list) {
    const stored: string[] = (c.photos || []).filter(
      (u: any) => typeof u === "string" && u.trim().length > 0,
    );
    const servable = CommunityPhotoEnrichment.filterPhotosForCommunity(
      stored.filter((u) => !CommunityPhotoEnrichment.isStockOrPlaceholderPhoto(u)),
      c.name || "",
      c.city || "",
      c.website || "",
    );
    if (servable.length === 0) {
      trapped.push({ id: c.id, name: c.name, city: c.city, state: c.state, stored: stored.length });
    }
  }

  console.log(`Cache-armed visible communities with stored photos: ${list.length}`);
  console.log(`TRAPPED (all stored photos filtered at serve time): ${trapped.length}`);
  for (const t of trapped) {
    console.log(`  #${t.id} "${t.name}" (${t.city}, ${t.state}) — ${t.stored} stored photo(s), 0 servable`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
