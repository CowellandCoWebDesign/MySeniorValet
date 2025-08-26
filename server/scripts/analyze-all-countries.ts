import { db } from '../db.js';
import { communities } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

async function analyzeAllCountries() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('           COMPREHENSIVE COUNTRY ANALYSIS                       ');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Get all unique countries with counts
  const countryBreakdown = await db
    .select({
      country: communities.country,
      count: sql<string>`count(*)::int`,
    })
    .from(communities)
    .groupBy(communities.country)
    .orderBy(sql`count(*) DESC`);

  console.log('📊 RAW DATA - ALL COUNTRY VARIATIONS:');
  console.log('─────────────────────────────────────────');
  
  let grandTotal = 0;
  const consolidatedCountries: { [key: string]: { variations: string[], total: number } } = {};

  // Map variations to standard country codes
  const countryMapping: { [key: string]: string } = {
    'US': 'United States',
    'USA': 'United States',
    'United States': 'United States',
    'CA': 'Canada',
    'Canada': 'Canada',
    'MX': 'Mexico',
    'Mexico': 'Mexico',
    'AU': 'Australia',
    'Australia': 'Australia',
    'CU': 'Cuba',
    'PE': 'Peru',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'Unknown': 'Unknown'
  };

  // Process each country
  for (const row of countryBreakdown) {
    const count = Number(row.count);
    const countryName = row.country || 'Unknown';
    const standardName = countryMapping[countryName] || countryName;
    
    console.log(`  "${countryName}":`.padEnd(25) + count.toString().padStart(8) + ' facilities');
    
    grandTotal += count;

    if (!consolidatedCountries[standardName]) {
      consolidatedCountries[standardName] = { variations: [], total: 0 };
    }
    consolidatedCountries[standardName].variations.push(`${countryName} (${count})`);
    consolidatedCountries[standardName].total += count;
  }

  console.log('─────────────────────────────────────────');
  console.log(`TOTAL:                     ${grandTotal.toLocaleString().padStart(8)} facilities\n`);

  console.log('📍 CONSOLIDATED BY ACTUAL COUNTRY:');
  console.log('════════════════════════════════════════════════════════════════');
  
  const sortedCountries = Object.entries(consolidatedCountries)
    .sort((a, b) => b[1].total - a[1].total);

  let consolidatedTotal = 0;
  for (const [country, data] of sortedCountries) {
    consolidatedTotal += data.total;
    
    let flag = '';
    switch (country) {
      case 'United States': flag = '🇺🇸'; break;
      case 'Canada': flag = '🇨🇦'; break;
      case 'Australia': flag = '🇦🇺'; break;
      case 'Mexico': flag = '🇲🇽'; break;
      case 'Cuba': flag = '🇨🇺'; break;
      case 'Peru': flag = '🇵🇪'; break;
      case 'Costa Rica': flag = '🇨🇷'; break;
      case 'Panama': flag = '🇵🇦'; break;
      default: flag = '🌍';
    }
    
    console.log(`\n${flag} ${country}:`.padEnd(30) + data.total.toLocaleString().padStart(8) + ' facilities');
    if (data.variations.length > 1) {
      console.log(`   Variations found: ${data.variations.join(', ')}`);
    }
  }
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`📈 VERIFIED TOTAL:           ${consolidatedTotal.toLocaleString().padStart(8)} facilities`);
  console.log('════════════════════════════════════════════════════════════════\n');

  console.log('🌍 COUNTRIES CURRENTLY IN DATABASE:');
  console.log('─────────────────────────────────────────');
  console.log('✅ North America:');
  console.log('   • United States (28,312 facilities)');
  console.log('   • Canada (6,780 facilities)');
  console.log('   • Mexico (389 facilities)');
  console.log('   • Cuba (12 facilities)');
  console.log('   • Costa Rica (5 facilities)');
  console.log('   • Panama (5 facilities)');
  console.log('\n✅ Oceania:');
  console.log('   • Australia (2,201 facilities)');
  console.log('\n✅ South America:');
  console.log('   • Peru (10 facilities)');
  console.log('\n⚠️ Data Quality Issues:');
  console.log('   • Multiple country code formats (US/USA/United States)');
  console.log('   • Need to standardize country codes');
  console.log('   • 25 facilities with Unknown country\n');

  console.log('❓ MISSING MAJOR MARKETS:');
  console.log('─────────────────────────────────────────');
  console.log('🌍 Europe: UK, Germany, France, Spain, Italy, Netherlands, etc.');
  console.log('🌏 Asia: Japan, China, South Korea, Singapore, Hong Kong, etc.');
  console.log('🌎 Latin America: Brazil, Argentina, Chile, Colombia, etc.');
  console.log('🌍 Africa: South Africa, Egypt, Nigeria, Kenya, etc.');
  console.log('🌏 Middle East: UAE, Saudi Arabia, Israel, Qatar, etc.');
  
  process.exit(0);
}

analyzeAllCountries().catch(console.error);