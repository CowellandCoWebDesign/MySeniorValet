/**
 * Task 430 – Catalog cleanup: quarantine fakes/synthetics, canonicalize
 * verified duplicates (with sibling-facility exclusions), merge secondary data
 * into primaries, backfill 2 missing US slugs.
 *
 * NEVER hard-deletes. All changes are reversible:
 *   • Quarantined rows: is_hidden=true + protective flag → appears in admin QC queue.
 *   • Duplicate secondaries: duplicate_of:<primaryId> in data_quality_flags →
 *     rel=canonical + noindex,follow on every SEO surface.
 *
 * Usage:  npx tsx server/scripts/catalog-cleanup-430.ts [--dry-run]
 */

import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DUPLICATE_OF_FLAG_PREFIX } from '@shared/community-indexability';
import { generateSlug } from '../utils/generate-slug';

const DRY_RUN = process.argv.includes('--dry-run');

// ── Sibling-facility exclusion predicates ─────────────────────────────────
// These patterns signal that two listings differing by suffix are DIFFERENT
// facilities co-located at the same address, NOT duplicates of the same one.
const SIBLING_SUFFIX_PATTERNS = [
  /\b(I{1,3}|IV|V|VI|VII|VIII|IX|X)\s*$/i,   // Roman numerals at end
  /\s#\s*\d+$/,                                 // "#1", "# 2"
  /\b\d+\s*$/,                                  // bare trailing digit(s)
  /\b(north|south|east|west|northeast|northwest|southeast|southwest)\b/i,
  // care-level differentiators in the name
  /\bassisted\s+living\b/i,
  /\bmemory\s+care\b/i,
  /\bskilled\s+nursing\b/i,
  /\bindependent\s+living\b/i,
];

/** Return the portion of the name before any sibling suffix, lowercased. */
function siblingBase(name: string): string {
  let n = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const pat of SIBLING_SUFFIX_PATTERNS) {
    n = n.replace(pat, '').trim();
  }
  return n;
}

/** True when two names are siblings: same canonical base but the suffix
 *  tokens differ (e.g. "I" vs "II", "North" vs "South", care levels). */
function areSiblings(a: string, b: string): boolean {
  const baseA = siblingBase(a);
  const baseB = siblingBase(b);
  // Must share the same base AND differ in the original names after removing base
  if (!baseA || baseA !== baseB) return false;
  const rawA = a.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  const rawB = b.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  return rawA !== rawB; // same base, different full name → sibling
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function addFlags(id: number, toAdd: string[], toRemove: string[] = []) {
  const [row] = await db
    .select({ dataQualityFlags: communities.dataQualityFlags })
    .from(communities)
    .where(eq(communities.id, id))
    .limit(1);
  const existing: string[] = Array.isArray(row?.dataQualityFlags) ? row.dataQualityFlags : [];
  const updated = Array.from(new Set([
    ...existing.filter(f => !toRemove.some(r => f === r || (r.endsWith(':') && f.startsWith(r)))),
    ...toAdd,
  ]));
  if (!DRY_RUN) {
    await db.update(communities).set({ dataQualityFlags: updated, updatedAt: new Date() }).where(eq(communities.id, id));
  }
}

// ── STEP 0: before snapshot ───────────────────────────────────────────────

const BEFORE_SQL = sql`
  select
    count(*) filter (where is_hidden = true) as hidden,
    count(*) filter (where is_hidden is distinct from true) as public_total,
    count(*) filter (where is_hidden is distinct from true and 'clearly_fake' = any(data_quality_flags)) as clearly_fake_public,
    count(*) filter (where is_hidden is distinct from true and 'synthetic_suspected' = any(data_quality_flags)) as synthetic_public,
    count(*) filter (where is_hidden is distinct from true and exists (
      select 1 from unnest(data_quality_flags) f(f) where f like 'duplicate_of:%'
    )) as dup_secondary_public,
    count(*) filter (where is_hidden is distinct from true and quality_tier = 'featured') as tier_featured,
    count(*) filter (where is_hidden is distinct from true and quality_tier = 'verified') as tier_verified,
    count(*) filter (where is_hidden is distinct from true and quality_tier = 'good') as tier_good,
    count(*) filter (where is_hidden is distinct from true and quality_tier = 'thin') as tier_thin,
    count(*) filter (where is_hidden is distinct from true and quality_tier = 'empty') as tier_empty
  from communities
`;

async function snapshot(): Promise<Record<string, number>> {
  const result = await db.execute(BEFORE_SQL) as any;
  // drizzle execute returns { rows: [...] } or array depending on driver
  const rows = Array.isArray(result) ? result : (result?.rows ?? [result]);
  const row = rows[0] ?? {};
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));
}

// ── STEP 1: quarantine 80 clearly_fake public rows ────────────────────────

async function quarantineClearlyFake() {
  const rows = await db
    .select({ id: communities.id, dataQualityFlags: communities.dataQualityFlags })
    .from(communities)
    .where(sql`
      'clearly_fake' = any(data_quality_flags)
      AND (is_hidden IS NULL OR is_hidden = false)
      AND (is_active IS NULL OR is_active = true)
    `);

  console.log(`\n── Step 1: Quarantine clearly_fake (${rows.length} rows) ──`);
  if (DRY_RUN) { console.log(`  DRY RUN — would hide ${rows.length} rows`); return rows.length; }

  let count = 0;
  for (const row of rows) {
    const existing: string[] = Array.isArray(row.dataQualityFlags) ? row.dataQualityFlags : [];
    // Add 'clearly_fake_quarantine' protective flag (permanent, admin-reviewed)
    const updated = Array.from(new Set([...existing, 'clearly_fake_quarantine']));
    await db.update(communities).set({
      isHidden: true,
      dataQualityFlags: updated,
      flagStatus: 'pending',   // shows in admin QC queue
      updatedAt: new Date(),
    }).where(eq(communities.id, row.id));
    count++;
  }
  console.log(`  ✅ Quarantined ${count} clearly_fake rows (is_hidden=true, flag=clearly_fake_quarantine)`);
  return count;
}

// ── STEP 2: quarantine 86 Japan synthetic rows ────────────────────────────

async function quarantineJapanSynthetics() {
  const rows = await db
    .select({ id: communities.id, dataQualityFlags: communities.dataQualityFlags })
    .from(communities)
    .where(sql`
      (is_hidden IS NULL OR is_hidden = false)
      AND (slug IS NULL OR slug = '')
      AND country = 'Japan'
    `);

  console.log(`\n── Step 2: Quarantine Japan synthetics (${rows.length} rows) ──`);
  if (DRY_RUN) { console.log(`  DRY RUN — would hide ${rows.length} rows`); return rows.length; }

  let count = 0;
  for (const row of rows) {
    const existing: string[] = Array.isArray(row.dataQualityFlags) ? row.dataQualityFlags : [];
    const updated = Array.from(new Set([...existing, 'synthetic_suspected']));
    await db.update(communities).set({
      isHidden: true,
      dataQualityFlags: updated,
      flagStatus: 'pending',
      updatedAt: new Date(),
    }).where(eq(communities.id, row.id));
    count++;
  }
  console.log(`  ✅ Quarantined ${count} synthetic Japan rows`);
  return count;
}

// ── STEP 3: backfill slugs for 2 legitimate US rows ───────────────────────

async function backfillUsSlugs() {
  const rows = await db
    .select({
      id: communities.id, name: communities.name,
      city: communities.city, state: communities.state,
    })
    .from(communities)
    .where(sql`
      (is_hidden IS NULL OR is_hidden = false)
      AND (slug IS NULL OR slug = '')
      AND country = 'United States'
    `);

  console.log(`\n── Step 3: Backfill slugs for ${rows.length} US rows ──`);
  if (DRY_RUN) {
    for (const r of rows) console.log(`  would set slug for #${r.id} ${r.name}`);
    return rows.length;
  }

  let count = 0;
  for (const r of rows) {
    const slug = generateSlug(r.name || '') || `community-${r.id}`;
    const citySlug = generateSlug(r.city || '') || 'unknown-city';
    const stateSlug = generateSlug(r.state || '') || 'unknown-state';
    await db.update(communities).set({ slug, citySlug, stateSlug, updatedAt: new Date() }).where(eq(communities.id, r.id));
    console.log(`  #${r.id} ${r.name} → ${stateSlug}/${citySlug}/${slug}`);
    count++;
  }
  return count;
}

// ── STEP 4: canonicalize verified duplicates (with data merge) ────────────

interface DupGroup {
  location: string;
  primary: { id: number; name: string };
  secondaries: Array<{ id: number; name: string; evidence: string[] }>;
}

async function canonicalizeDuplicates() {
  const reportPath = path.join(process.cwd(), 'reports', 'duplicate-groups.json');
  const raw = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
  const groups: DupGroup[] = raw.groups;

  console.log(`\n── Step 4: Canonicalize duplicates (${groups.length} groups from report) ──`);

  // Load all IDs to get full rows for data merge
  const allIds = groups.flatMap(g => [g.primary.id, ...g.secondaries.map(s => s.id)]);
  const fullRows = allIds.length
    ? await db
        .select({
          id: communities.id, name: communities.name,
          phone: communities.phone, email: communities.email,
          website: communities.website, description: communities.description,
          dataQualityFlags: communities.dataQualityFlags,
        })
        .from(communities)
        .where(inArray(communities.id, allIds))
    : [];
  const rowById = new Map(fullRows.map(r => [r.id, r]));

  let groupsApplied = 0;
  let secondariesFlagged = 0;
  let siblingExclusions = 0;
  let dataFieldsMerged = 0;

  for (const g of groups) {
    const primaryRow = rowById.get(g.primary.id);
    if (!primaryRow) continue;

    const acceptedSecondaries: typeof g.secondaries = [];
    for (const s of g.secondaries) {
      if (areSiblings(g.primary.name, s.name)) {
        console.log(`  SIBLING excluded: "${g.primary.name}" ↔ "${s.name}" (${g.location})`);
        siblingExclusions++;
        continue;
      }
      acceptedSecondaries.push(s);
    }
    if (!acceptedSecondaries.length) continue;

    // ── Merge data from secondaries into primary ───────────────────────
    let mergedPhone = primaryRow.phone;
    let mergedEmail = primaryRow.email;
    let mergedWebsite = primaryRow.website;
    let mergedDescription = primaryRow.description;
    const mergedFieldNames: string[] = [];

    for (const s of acceptedSecondaries) {
      const sr = rowById.get(s.id);
      if (!sr) continue;
      if (!mergedPhone && sr.phone) { mergedPhone = sr.phone; mergedFieldNames.push('phone'); }
      if (!mergedEmail && sr.email) { mergedEmail = sr.email; mergedFieldNames.push('email'); }
      if (!mergedWebsite && sr.website) { mergedWebsite = sr.website; mergedFieldNames.push('website'); }
      if (sr.description && (!mergedDescription || sr.description.length > mergedDescription.length)) {
        mergedDescription = sr.description; mergedFieldNames.push('description');
      }
    }

    if (!DRY_RUN && mergedFieldNames.length > 0) {
      await db.update(communities).set({
        phone: mergedPhone ?? undefined,
        email: mergedEmail ?? undefined,
        website: mergedWebsite ?? undefined,
        description: mergedDescription ?? undefined,
        updatedAt: new Date(),
      }).where(eq(communities.id, g.primary.id));
      dataFieldsMerged += mergedFieldNames.length;
    }

    // ── Flag each accepted secondary with duplicate_of:<primaryId> ────
    const dupFlag = `${DUPLICATE_OF_FLAG_PREFIX}${g.primary.id}`;
    for (const s of acceptedSecondaries) {
      if (!DRY_RUN) {
        await addFlags(s.id, [dupFlag], [`${DUPLICATE_OF_FLAG_PREFIX}`]);
      }
      secondariesFlagged++;
    }

    if (!DRY_RUN && mergedFieldNames.length) {
      console.log(`  [${g.location}] primary #${g.primary.id} gained: ${mergedFieldNames.join(', ')}`);
    }

    groupsApplied++;
  }

  console.log(`  ✅ ${groupsApplied} groups processed`);
  console.log(`     ${siblingExclusions} sibling pairs excluded`);
  console.log(`     ${secondariesFlagged} secondaries flagged with ${DUPLICATE_OF_FLAG_PREFIX}<id>`);
  console.log(`     ${dataFieldsMerged} data fields merged into primaries`);
  return { groupsApplied, siblingExclusions, secondariesFlagged, dataFieldsMerged };
}

// ── STEP 5: clear sitemap cache ───────────────────────────────────────────

async function clearSitemapCache() {
  const cacheDir = path.join(process.cwd(), '.cache', 'sitemaps');
  try {
    const files = await fs.readdir(cacheDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    if (!DRY_RUN) {
      await Promise.all(jsonFiles.map(f => fs.unlink(path.join(cacheDir, f))));
    }
    console.log(`\n── Step 5: Sitemap cache cleared (${jsonFiles.length} files) ──`);
    return jsonFiles.length;
  } catch {
    console.log(`\n── Step 5: No sitemap cache to clear ──`);
    return 0;
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`CATALOG CLEANUP — Task 430${DRY_RUN ? ' [DRY RUN]' : ''}`);
  console.log(`${'='.repeat(60)}\n`);

  // Capture BEFORE state
  const before = await snapshot();
  console.log('BEFORE:');
  console.log(`  Public total:       ${before.public_total}`);
  console.log(`  clearly_fake:       ${before.clearly_fake_public}`);
  console.log(`  synthetic_public:   ${before.synthetic_public}`);
  console.log(`  dup_secondary:      ${before.dup_secondary_public}`);
  console.log(`  Tiers: featured=${before.tier_featured} verified=${before.tier_verified} good=${before.tier_good} thin=${before.tier_thin} empty=${before.tier_empty}`);

  const fakeCount = await quarantineClearlyFake();
  const syntheticCount = await quarantineJapanSynthetics();
  const slugCount = await backfillUsSlugs();
  const dupResult = await canonicalizeDuplicates();
  const sitemapFiles = await clearSitemapCache();

  // Capture AFTER state
  const after = await snapshot();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`BEFORE vs AFTER`);
  console.log(`${'='.repeat(60)}`);
  const fmt = (k: string) => `  ${k.padEnd(24)}: ${before[k]} → ${after[k]}`;
  console.log(fmt('public_total'));
  console.log(fmt('hidden'));
  console.log(fmt('clearly_fake_public'));
  console.log(fmt('synthetic_public'));
  console.log(fmt('dup_secondary_public'));
  console.log(fmt('tier_featured'));
  console.log(fmt('tier_verified'));
  console.log(fmt('tier_good'));
  console.log(fmt('tier_thin'));
  console.log(fmt('tier_empty'));

  console.log(`\nSUMMARY`);
  console.log(`  clearly_fake quarantined:    ${fakeCount}`);
  console.log(`  synthetic_suspected:         ${syntheticCount}`);
  console.log(`  slugs backfilled:            ${slugCount}`);
  console.log(`  dup groups processed:        ${dupResult.groupsApplied}`);
  console.log(`  sibling pairs excluded:      ${dupResult.siblingExclusions}`);
  console.log(`  dup secondaries flagged:     ${dupResult.secondariesFlagged}`);
  console.log(`  data fields merged:          ${dupResult.dataFieldsMerged}`);
  console.log(`  sitemap cache files cleared: ${sitemapFiles}`);

  if (DRY_RUN) console.log('\n⚠️  DRY RUN — no data was changed.');
  else console.log('\n✅ All changes applied. Run indexability-report to verify.');

  process.exit(0);
}

main().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
