import { db } from "../db";
import { communities } from "@shared/schema";
import { sql, like, or, eq } from "drizzle-orm";

async function analyzeAustralianCoverage() {
  console.log("🇦🇺 AUSTRALIAN EXPANSION ANALYSIS 🇦🇺");
  console.log("=====================================\n");

  // Get current Australian cities with facility counts
  const australianCities = await db
    .select({
      city: communities.city,
      state: communities.state,
      count: sql<string>`count(*)::int`,
    })
    .from(communities)
    .where(
      or(
        eq(communities.country, "Australia"),
        eq(communities.country, "AU"),
        eq(communities.country, "AUS")
      )
    )
    .groupBy(communities.city, communities.state)
    .orderBy(sql`count(*) DESC`);

  // Major Australian cities and metro areas to target
  const majorAustralianCities = [
    // Capital Cities (Primary targets)
    { city: "Sydney", state: "NSW", expectedFacilities: 800, priority: 1 },
    { city: "Melbourne", state: "VIC", expectedFacilities: 700, priority: 1 },
    { city: "Brisbane", state: "QLD", expectedFacilities: 500, priority: 1 },
    { city: "Perth", state: "WA", expectedFacilities: 400, priority: 1 },
    { city: "Adelaide", state: "SA", expectedFacilities: 350, priority: 1 },
    { city: "Canberra", state: "ACT", expectedFacilities: 150, priority: 1 },
    { city: "Hobart", state: "TAS", expectedFacilities: 100, priority: 1 },
    { city: "Darwin", state: "NT", expectedFacilities: 50, priority: 1 },
    
    // Major Regional Centers (Secondary targets)
    { city: "Gold Coast", state: "QLD", expectedFacilities: 300, priority: 2 },
    { city: "Newcastle", state: "NSW", expectedFacilities: 200, priority: 2 },
    { city: "Sunshine Coast", state: "QLD", expectedFacilities: 200, priority: 2 },
    { city: "Wollongong", state: "NSW", expectedFacilities: 150, priority: 2 },
    { city: "Geelong", state: "VIC", expectedFacilities: 150, priority: 2 },
    { city: "Townsville", state: "QLD", expectedFacilities: 100, priority: 2 },
    { city: "Cairns", state: "QLD", expectedFacilities: 100, priority: 2 },
    { city: "Ballarat", state: "VIC", expectedFacilities: 80, priority: 2 },
    { city: "Bendigo", state: "VIC", expectedFacilities: 80, priority: 2 },
    { city: "Albury", state: "NSW", expectedFacilities: 60, priority: 2 },
    { city: "Launceston", state: "TAS", expectedFacilities: 60, priority: 2 },
    
    // Growing Regional Areas (Tertiary targets)
    { city: "Toowoomba", state: "QLD", expectedFacilities: 60, priority: 3 },
    { city: "Mackay", state: "QLD", expectedFacilities: 50, priority: 3 },
    { city: "Rockhampton", state: "QLD", expectedFacilities: 50, priority: 3 },
    { city: "Bunbury", state: "WA", expectedFacilities: 40, priority: 3 },
    { city: "Wagga Wagga", state: "NSW", expectedFacilities: 40, priority: 3 },
    { city: "Bundaberg", state: "QLD", expectedFacilities: 40, priority: 3 },
    { city: "Hervey Bay", state: "QLD", expectedFacilities: 40, priority: 3 },
    { city: "Mount Gambier", state: "SA", expectedFacilities: 30, priority: 3 },
  ];

  // Create coverage map
  const coverageMap = new Map<string, number>();
  for (const city of australianCities) {
    if (city.city && city.state) {
      const key = `${city.city}, ${city.state}`;
      coverageMap.set(key, parseInt(city.count));
    }
  }

  console.log("📊 CURRENT COVERAGE STATUS:");
  console.log("---------------------------");
  const currentTotal = australianCities.reduce((sum, city) => sum + parseInt(city.count), 0);
  console.log(`Total Australian facilities: ${currentTotal.toLocaleString()}`);
  console.log(`Cities covered: ${australianCities.length}\n`);

  console.log("🎯 EXPANSION CHECKLIST:");
  console.log("-----------------------");
  
  let completedCount = 0;
  let partialCount = 0;
  let missingCount = 0;
  let potentialNewFacilities = 0;

  // Priority 1: Capital Cities
  console.log("\n✅ PRIORITY 1: CAPITAL CITIES");
  for (const target of majorAustralianCities.filter(c => c.priority === 1)) {
    const key = `${target.city}, ${target.state}`;
    const current = coverageMap.get(key) || 0;
    const status = current === 0 ? "❌ MISSING" : 
                   current >= target.expectedFacilities * 0.7 ? "✅ GOOD" : "⚠️ PARTIAL";
    
    if (current === 0) missingCount++;
    else if (current >= target.expectedFacilities * 0.7) completedCount++;
    else partialCount++;
    
    const additional = Math.max(0, target.expectedFacilities - current);
    potentialNewFacilities += additional;
    
    console.log(`${status} ${target.city}, ${target.state}: ${current}/${target.expectedFacilities} facilities (need ${additional} more)`);
  }

  // Priority 2: Major Regional Centers
  console.log("\n✅ PRIORITY 2: MAJOR REGIONAL CENTERS");
  for (const target of majorAustralianCities.filter(c => c.priority === 2)) {
    const key = `${target.city}, ${target.state}`;
    const current = coverageMap.get(key) || 0;
    const status = current === 0 ? "❌ MISSING" : 
                   current >= target.expectedFacilities * 0.7 ? "✅ GOOD" : "⚠️ PARTIAL";
    
    if (current === 0) missingCount++;
    else if (current >= target.expectedFacilities * 0.7) completedCount++;
    else partialCount++;
    
    const additional = Math.max(0, target.expectedFacilities - current);
    potentialNewFacilities += additional;
    
    console.log(`${status} ${target.city}, ${target.state}: ${current}/${target.expectedFacilities} facilities (need ${additional} more)`);
  }

  // Priority 3: Growing Regional Areas
  console.log("\n✅ PRIORITY 3: GROWING REGIONAL AREAS");
  for (const target of majorAustralianCities.filter(c => c.priority === 3)) {
    const key = `${target.city}, ${target.state}`;
    const current = coverageMap.get(key) || 0;
    const status = current === 0 ? "❌ MISSING" : 
                   current >= target.expectedFacilities * 0.7 ? "✅ GOOD" : "⚠️ PARTIAL";
    
    if (current === 0) missingCount++;
    else if (current >= target.expectedFacilities * 0.7) completedCount++;
    else partialCount++;
    
    const additional = Math.max(0, target.expectedFacilities - current);
    potentialNewFacilities += additional;
    
    console.log(`${status} ${target.city}, ${target.state}: ${current}/${target.expectedFacilities} facilities (need ${additional} more)`);
  }

  // Summary
  console.log("\n📈 EXPANSION SUMMARY:");
  console.log("--------------------");
  console.log(`✅ Cities with good coverage: ${completedCount}`);
  console.log(`⚠️ Cities with partial coverage: ${partialCount}`);
  console.log(`❌ Cities missing coverage: ${missingCount}`);
  console.log(`\n🎯 Potential new facilities from major cities: ${potentialNewFacilities.toLocaleString()}`);
  console.log(`📊 Current total facilities: ${currentTotal.toLocaleString()}`);
  console.log(`🚀 Projected after expansion: ${(currentTotal + potentialNewFacilities).toLocaleString()}`);

  // Path to 100k
  const currentGlobalTotal = 37739; // From previous analysis
  const projectedAfterAustralia = currentGlobalTotal - currentTotal + (currentTotal + potentialNewFacilities);
  console.log("\n🌍 PATH TO 100K GLOBAL FACILITIES:");
  console.log("----------------------------------");
  console.log(`Current global total: ${currentGlobalTotal.toLocaleString()}`);
  console.log(`After Australia expansion: ${projectedAfterAustralia.toLocaleString()}`);
  console.log(`Remaining to 100k: ${(100000 - projectedAfterAustralia).toLocaleString()}`);
  
  // Suggest next countries
  console.log("\n🌏 SUGGESTED NEXT COUNTRIES AFTER AUSTRALIA:");
  console.log("--------------------------------------------");
  console.log("1. 🇬🇧 United Kingdom (~8,000 facilities)");
  console.log("2. 🇯🇵 Japan (~15,000 facilities)");
  console.log("3. 🇩🇪 Germany (~12,000 facilities)");
  console.log("4. 🇫🇷 France (~10,000 facilities)");
  console.log("5. 🇮🇹 Italy (~8,000 facilities)");
  console.log("6. 🇪🇸 Spain (~6,000 facilities)");
  console.log("7. 🇳🇿 New Zealand (~1,000 facilities)");
  console.log("8. 🇸🇬 Singapore (~500 facilities)");
  console.log("\nEstimated from these countries: ~60,500 facilities");
  console.log("Would bring total to: ~98,239 facilities (nearly 100k!)");

  // Top missing cities to prioritize
  console.log("\n🎯 TOP 10 CITIES TO ADD NEXT:");
  console.log("------------------------------");
  const missingCities = majorAustralianCities
    .map(target => {
      const key = `${target.city}, ${target.state}`;
      const current = coverageMap.get(key) || 0;
      return {
        ...target,
        current,
        needed: Math.max(0, target.expectedFacilities - current),
        percentComplete: Math.round((current / target.expectedFacilities) * 100)
      };
    })
    .filter(city => city.needed > 0)
    .sort((a, b) => b.needed - a.needed)
    .slice(0, 10);

  missingCities.forEach((city, index) => {
    console.log(`${index + 1}. ${city.city}, ${city.state}: Need ${city.needed} more (${city.percentComplete}% complete)`);
  });

  process.exit(0);
}

analyzeAustralianCoverage().catch(console.error);