/**
 * SEO indexability report — read-only. Prints pass/fail counts + reason and
 * signal breakdowns for all PUBLIC communities, plus location-page counts.
 *
 * Usage: npx tsx server/scripts/indexability-report.ts
 * Criteria: shared/community-indexability.ts (docs/SEO_INDEXING_ELIGIBILITY.md)
 */
import { db } from '../db';
import { communities } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { evaluateIndexability } from '@shared/community-indexability';

async function main() {
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      city: communities.city,
      state: communities.state,
      slug: communities.slug,
      citySlug: communities.citySlug,
      stateSlug: communities.stateSlug,
      isActive: communities.isActive,
      isHidden: communities.isHidden,
      description: communities.description,
      photos: communities.photos,
      careTypes: communities.careTypes,
      communitySubtype: communities.communitySubtype,
      dataQualityFlags: communities.dataQualityFlags,
      website: communities.website,
      phone: communities.phone,
      data_source: communities.data_source, // schema key is snake_case for this column
      isVerified: communities.isVerified,
      facilityType: communities.facilityType,
      isClaimed: communities.isClaimed,
      claimVerified: communities.claimVerified,
      isFeaturedBrand: communities.isFeaturedBrand,
      subscriptionTier: communities.subscriptionTier,
      hudPropertyId: communities.hudPropertyId,
      rentPerMonth: communities.rentPerMonth,
      priceRange: communities.priceRange,
      licenseNumber: communities.licenseNumber,
      reviewCount: communities.reviewCount,
      googleReviewCount: communities.googleReviewCount,
      yelpReviewCount: communities.yelpReviewCount,
    })
    .from(communities)
    .where(
      sql`(${communities.isActive} IS NULL OR ${communities.isActive} = true)
          AND (${communities.isHidden} IS NULL OR ${communities.isHidden} = false)`
    );

  let pass = 0;
  const reasonCounts = new Map<string, number>();
  const signalCounts = new Map<string, number>();
  const cityIndexable = new Map<string, number>();
  const cityAll = new Map<string, number>();

  for (const r of rows) {
    const res = evaluateIndexability(r);
    const cityKey = `${r.city}|${r.state}`;
    cityAll.set(cityKey, (cityAll.get(cityKey) || 0) + 1);
    if (res.indexable) {
      pass++;
      cityIndexable.set(cityKey, (cityIndexable.get(cityKey) || 0) + 1);
      for (const s of res.signals) signalCounts.set(s, (signalCounts.get(s) || 0) + 1);
    } else {
      for (const reason of res.reasons) {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      }
    }
  }

  const fail = rows.length - pass;
  console.log('════════ SEO INDEXABILITY REPORT (public communities) ════════');
  console.log(`Total public:          ${rows.length}`);
  console.log(`index,follow:          ${pass} (${((pass / rows.length) * 100).toFixed(1)}%)`);
  console.log(`noindex,follow:        ${fail} (${((fail / rows.length) * 100).toFixed(1)}%)`);
  console.log('\n── Fail reasons (a page can carry several) ──');
  for (const [reason, count] of [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason.padEnd(32)} ${count}`);
  }
  console.log('\n── Qualifying signals among indexable pages ──');
  for (const [signal, count] of [...signalCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${signal.padEnd(32)} ${count}`);
  }
  const citiesWithIndexable = [...cityIndexable.values()].filter((c) => c >= 1).length;
  const citiesSitemap = [...cityIndexable.values()].filter((c) => c >= 2).length;
  console.log('\n── Location pages ──');
  console.log(`Cities with ≥1 public community:      ${cityAll.size}`);
  console.log(`Cities indexable (≥1 indexable):      ${citiesWithIndexable}`);
  console.log(`Cities in sitemap (≥2 indexable):     ${citiesSitemap}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Report failed:', err);
  process.exit(1);
});
