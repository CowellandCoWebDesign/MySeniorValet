/**
 * Unify "Featured" communities into ONE admin-controlled list (Task #345).
 *
 * Both featured surfaces render from the SAME source of truth — the
 * `featured_communities` table:
 *   - Directory "Featured Excellence" (RedTagDeals.tsx → /api/featured-communities)
 *   - Home "Featured & Coastal" (home_section_configs id=6 → section-data 'featured'
 *     branch → storage.getFeaturedCommunities())
 *
 * This script performs the two LIVE-DB DATA ops that do NOT merge from a
 * task-agent DB and therefore must be run once against the live/prod database.
 * It is fully idempotent and reversible (deactivate, never delete).
 *
 *   1. featured_communities → the 7 chosen communities:
 *        51463 Atria Senior Living La Jolla
 *        70617 Oakmont of Redding
 *        74914 Hilltop Estates
 *        75234 Shasta Estates
 *        76000 Walnut Park
 *        76002 Mission Commons
 *        76008 Arcadia Place
 *      via INSERT ... ON CONFLICT (community_id) upsert
 *      (is_active/show_in_red_tag_deals TRUE, end_date NULL, display_order 1-7).
 *      Deactivate 70616 (Willow Springs) and 72147 (Verdeza) — is_active=FALSE,
 *      NOT deleted, so they remain reversible from the admin panel.
 *      Editorial fields are left NULL (Golden Data Rule) — real community data
 *      + photo enrichment supply the card.
 *
 *   2. home_section_configs id=6 → selectionMode 'auto' + communityIds []
 *      so /api/communities/section-data?sectionId=6 reads getFeaturedCommunities()
 *      (the same featured_communities table the directory uses).
 *
 * Usage: npx tsx server/scripts/unify-featured-communities.ts
 */
import { pool } from '../db';

// [community_id, display_order] for the 7 chosen featured communities.
const FEATURED: Array<[number, number]> = [
  [51463, 1], // Atria Senior Living La Jolla
  [70617, 2], // Oakmont of Redding
  [74914, 3], // Hilltop Estates
  [75234, 4], // Shasta Estates
  [76002, 5], // Mission Commons
  [76000, 6], // Walnut Park
  [76008, 7], // Arcadia Place
];

// Currently-featured communities intentionally excluded by the chosen list.
// Deactivated (reversible), NOT deleted.
const DEACTIVATE = [70616, 72147]; // Willow Springs, Verdeza

async function main() {
  // 1a. Idempotent upsert of the 7 chosen featured communities.
  const values = FEATURED
    .map(([id, order]) => `(${id}, ${order}, TRUE, TRUE, NULL, 'excellence')`)
    .join(',\n    ');

  await pool.query(`
    INSERT INTO featured_communities
      (community_id, display_order, is_active, show_in_red_tag_deals, end_date, subscription_tier)
    VALUES
    ${values}
    ON CONFLICT (community_id) DO UPDATE SET
      is_active = TRUE,
      show_in_red_tag_deals = TRUE,
      end_date = NULL,
      display_order = EXCLUDED.display_order,
      updated_at = NOW();
  `);
  console.log(`Upserted ${FEATURED.length} featured communities.`);

  // 1b. Deactivate excluded communities (reversible).
  const deact = await pool.query(
    `UPDATE featured_communities
       SET is_active = FALSE, updated_at = NOW()
     WHERE community_id = ANY($1::int[])`,
    [DEACTIVATE],
  );
  console.log(`Deactivated ${deact.rowCount} excluded community(ies): ${DEACTIVATE.join(', ')}.`);

  // 2. Repoint home section #6 to auto so it reads the featured_communities table.
  const sec = await pool.query(`
    UPDATE home_section_configs
       SET config = jsonb_set(
             jsonb_set(config::jsonb, '{selectionMode}', '"auto"'),
             '{communityIds}', '[]'::jsonb
           )
     WHERE id = 6 AND section_type = 'featured'
  `);
  console.log(`Repointed home section #6 to auto (${sec.rowCount} row updated).`);

  // Verify.
  const check = await pool.query(`
    SELECT community_id, display_order
      FROM featured_communities
     WHERE is_active = TRUE AND show_in_red_tag_deals = TRUE
       AND (end_date IS NULL OR end_date > NOW())
     ORDER BY display_order
  `);
  console.log('\nActive featured communities:');
  check.rows.forEach((r: any) => console.log(`  #${r.display_order} → community ${r.community_id}`));

  await pool.end();
}

main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
