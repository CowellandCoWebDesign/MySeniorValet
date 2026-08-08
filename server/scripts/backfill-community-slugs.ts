/**
 * One-time backfill script: populates slug, city_slug, and state_slug columns
 * for all existing communities that don't have them yet.
 *
 * Run with:  npx tsx server/scripts/backfill-community-slugs.ts
 */

import { db } from "../db";
import { communities } from "../../shared/schema";
import { isNull, or } from "drizzle-orm";
import { sql } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function backfill() {
  console.log("Starting community slug backfill…");

  // Fetch only communities that need slugs (any slug column is null)
  const rows = await db
    .select({ id: communities.id, name: communities.name, city: communities.city, state: communities.state })
    .from(communities)
    .where(
      or(
        isNull(communities.slug),
        isNull(communities.citySlug),
        isNull(communities.stateSlug)
      )
    );

  console.log(`Found ${rows.length} communities to backfill.`);

  // Track slug collisions within a (stateSlug, citySlug) pair so we can
  // append "-2", "-3", etc. rather than violating the unique index.
  const seen = new Map<string, number>();

  let updated = 0;
  for (const row of rows) {
    const stateSlug = slugify(row.state) || "unknown-state";
    const citySlug = slugify(row.city) || "unknown-city";
    let baseSlug = slugify(row.name) || `community-${row.id}`;

    const key = `${stateSlug}/${citySlug}/${baseSlug}`;
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);

    const finalSlug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    // Track the final key too so future rows don't collide with the suffixed slug
    if (count > 0) {
      const finalKey = `${stateSlug}/${citySlug}/${finalSlug}`;
      seen.set(finalKey, 1);
    }

    try {
      await db
        .update(communities)
        .set({ slug: finalSlug, citySlug, stateSlug })
        .where(sql`${communities.id} = ${row.id}`);
      updated++;
    } catch (err: any) {
      // Unique constraint violation: fall back to id-based slug
      const safeSlug = `${baseSlug}-${row.id}`;
      await db
        .update(communities)
        .set({ slug: safeSlug, citySlug, stateSlug })
        .where(sql`${communities.id} = ${row.id}`);
      updated++;
      console.warn(`  Collision for "${row.name}" (id ${row.id}) → used "${safeSlug}"`);
    }
  }

  console.log(`Backfill complete. Updated ${updated} / ${rows.length} communities.`);
  process.exit(0);
}

backfill().catch(err => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
