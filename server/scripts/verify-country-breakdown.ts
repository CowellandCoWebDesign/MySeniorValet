import { db } from '../db.js';
import { communities } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

async function verifyCountryBreakdown() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('                 MYSENIORVALET GLOBAL BREAKDOWN                 ');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Get breakdown by country
  const countryBreakdown = await db
    .select({
      country: communities.country,
      count: sql<string>`count(*)::int`,
    })
    .from(communities)
    .groupBy(communities.country)
    .orderBy(sql`count(*) DESC`);

  let grandTotal = 0;
  const countryData: { [key: string]: number } = {};

  // Process and display each country
  for (const row of countryBreakdown) {
    const count = Number(row.count);
    grandTotal += count;
    countryData[row.country || 'Unknown'] = count;
  }

  // Display formatted results
  console.log('📊 FACILITIES BY COUNTRY:');
  console.log('─────────────────────────────────────────');
  
  // US (should be the largest)
  if (countryData['US']) {
    console.log(`🇺🇸 United States:        ${countryData['US'].toLocaleString().padStart(8)} facilities`);
  }
  
  // Australia (our recent addition)
  if (countryData['Australia']) {
    console.log(`🇦🇺 Australia:            ${countryData['Australia'].toLocaleString().padStart(8)} facilities`);
  }
  
  // Canada
  if (countryData['CA']) {
    console.log(`🇨🇦 Canada:               ${countryData['CA'].toLocaleString().padStart(8)} facilities`);
  }
  
  // Mexico
  if (countryData['MX']) {
    console.log(`🇲🇽 Mexico:               ${countryData['MX'].toLocaleString().padStart(8)} facilities`);
  }
  
  // Other countries
  for (const [country, count] of Object.entries(countryData)) {
    if (!['US', 'Australia', 'CA', 'MX'].includes(country)) {
      console.log(`   ${country}:               ${count.toLocaleString().padStart(8)} facilities`);
    }
  }
  
  console.log('─────────────────────────────────────────');
  console.log(`📈 GRAND TOTAL:           ${grandTotal.toLocaleString().padStart(8)} facilities\n`);

  // Verify math
  console.log('✅ MATH VERIFICATION:');
  console.log('─────────────────────────────────────────');
  
  const originalCount = (countryData['US'] || 0) + (countryData['CA'] || 0) + (countryData['MX'] || 0);
  console.log(`Original (US + CA + MX):  ${originalCount.toLocaleString()} facilities`);
  console.log(`Australian addition:      +${(countryData['Australia'] || 0).toLocaleString()} facilities`);
  console.log(`Expected total:            ${(originalCount + (countryData['Australia'] || 0)).toLocaleString()} facilities`);
  console.log(`Actual total:              ${grandTotal.toLocaleString()} facilities`);
  
  const difference = grandTotal - (originalCount + (countryData['Australia'] || 0));
  if (difference === 0) {
    console.log(`\n✅ MATH CHECKS OUT PERFECTLY!`);
  } else {
    console.log(`\n⚠️ Difference: ${difference} facilities`);
  }

  // Australia coverage analysis
  if (countryData['Australia']) {
    console.log('\n🇦🇺 AUSTRALIA COVERAGE ANALYSIS:');
    console.log('─────────────────────────────────────────');
    const ausTotal = countryData['Australia'];
    const ausTarget = 2800;
    const ausMinTarget = 2100;
    const coverage = ((ausTotal / ausTarget) * 100).toFixed(2);
    const minCoverage = ((ausTotal / ausMinTarget) * 100).toFixed(2);
    
    console.log(`Deployed:                  ${ausTotal.toLocaleString()} facilities`);
    console.log(`Market size estimate:      ${ausTarget.toLocaleString()} facilities`);
    console.log(`Coverage achieved:         ${coverage}%`);
    console.log(`75% target (2,100):        ${ausTotal >= ausMinTarget ? '✅ ACHIEVED' : '❌ NOT YET'}`);
    console.log(`Progress to 75% target:    ${minCoverage}%`);
  }

  // Get state breakdown for Australia
  const ausStates = await db
    .select({
      state: communities.state,
      count: sql<string>`count(*)::int`,
    })
    .from(communities)
    .where(sql`country = 'Australia'`)
    .groupBy(communities.state)
    .orderBy(sql`count(*) DESC`);

  if (ausStates.length > 0) {
    console.log('\n🏙️ AUSTRALIAN STATE BREAKDOWN:');
    console.log('─────────────────────────────────────────');
    for (const state of ausStates) {
      console.log(`${state.state}:`.padEnd(8) + state.count.toString().padStart(5) + ' facilities');
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════\n');
  
  process.exit(0);
}

verifyCountryBreakdown().catch(console.error);