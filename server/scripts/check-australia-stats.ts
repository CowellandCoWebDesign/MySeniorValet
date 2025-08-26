import { db } from '../db.js';
import { communities } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

async function checkAustraliaStats() {
  // Get total Australian facilities
  const [totalResult] = await db
    .select({ count: sql<string>`count(*)::int` })
    .from(communities)
    .where(eq(communities.country, 'Australia'));
  
  const total = Number(totalResult.count);
  
  // Get cities covered
  const citiesResult = await db
    .selectDistinct({ city: communities.city })
    .from(communities)
    .where(eq(communities.country, 'Australia'));
  
  const target = 2800; // Total Australian facilities target
  const targetMin = 2100; // 75% minimum coverage required
  
  console.log('\n===============================================');
  console.log('🇦🇺 AUSTRALIA EXPANSION PROGRESS REPORT');
  console.log('===============================================');
  console.log(`📊 Total facilities deployed: ${total}`);
  console.log(`🌆 Cities covered: ${citiesResult.length}`);
  console.log(`📈 Coverage percentage: ${((total / target) * 100).toFixed(2)}%`);
  console.log(`🎯 Target: ${target} facilities (100% coverage)`);
  console.log(`✅ Minimum required: ${targetMin} (75% coverage)`);
  console.log('-----------------------------------------------');
  console.log(`⚡ Facilities needed for 75%: ${Math.max(0, targetMin - total)}`);
  console.log(`📍 Progress to 75% target: ${((total / targetMin) * 100).toFixed(2)}%`);
  console.log('===============================================\n');
  
  // Show some cities
  const topCities = citiesResult.slice(0, 10).map(c => c.city).join(', ');
  console.log(`🌟 Sample cities: ${topCities}...`);
  
  process.exit(0);
}

checkAustraliaStats().catch(console.error);