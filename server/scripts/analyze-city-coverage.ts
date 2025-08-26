import { db } from "../db";
import { communities } from "@shared/schema";
import { sql, desc, asc, and, eq, ne, isNotNull } from "drizzle-orm";

/**
 * Comprehensive City Coverage Analysis
 * Shows actual facility counts by city globally
 * Generated: August 26, 2025
 */

async function analyzeCityCoverage() {
  console.log("=== COMPREHENSIVE CITY COVERAGE ANALYSIS ===");
  console.log("Generated: " + new Date().toISOString());
  console.log("=============================================\n");

  // Get total facilities
  const [totalResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(communities);
  
  console.log(`📊 TOTAL FACILITIES IN DATABASE: ${totalResult.count.toLocaleString()}\n`);

  // Get country breakdown
  console.log("🌍 FACILITIES BY COUNTRY");
  console.log("========================");
  const countryBreakdown = await db
    .select({
      country: communities.country,
      count: sql<number>`count(*)::int`,
      percentage: sql<number>`ROUND(count(*) * 100.0 / ${totalResult.count}, 2)`
    })
    .from(communities)
    .groupBy(communities.country)
    .orderBy(desc(sql`count(*)`));

  countryBreakdown.forEach(row => {
    console.log(`${row.country}: ${row.count.toLocaleString()} facilities (${row.percentage}%)`);
  });

  // For each major country, show top cities
  const majorCountries = ['US', 'CA', 'AU', 'Mexico', 'Japan'];
  
  for (const country of majorCountries) {
    console.log(`\n📍 TOP CITIES IN ${country}`);
    console.log("================================");
    
    const topCities = await db
      .select({
        city: communities.city,
        state: communities.state,
        count: sql<number>`count(*)::int`
      })
      .from(communities)
      .where(eq(communities.country, country))
      .groupBy(communities.city, communities.state)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    if (topCities.length === 0) {
      console.log(`No facilities found for ${country}`);
      continue;
    }

    topCities.forEach((city, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${city.city}, ${city.state}: ${city.count} facilities`);
    });
    
    // Get total cities covered
    const [citiesCount] = await db
      .select({ 
        count: sql<number>`count(DISTINCT city)::int` 
      })
      .from(communities)
      .where(eq(communities.country, country));
    
    console.log(`\nTotal cities covered in ${country}: ${citiesCount.count}`);
  }

  // US State Analysis
  console.log("\n🇺🇸 US STATE COVERAGE ANALYSIS");
  console.log("==================================");
  
  const usStates = await db
    .select({
      state: communities.state,
      count: sql<number>`count(*)::int`,
      cities: sql<number>`count(DISTINCT city)::int`
    })
    .from(communities)
    .where(eq(communities.country, 'US'))
    .groupBy(communities.state)
    .orderBy(desc(sql`count(*)`));

  // Population data (approximate, in millions)
  const statePopulations: Record<string, number> = {
    'CA': 39.5, 'TX': 30.0, 'FL': 22.0, 'NY': 19.5, 'PA': 13.0,
    'IL': 12.6, 'OH': 11.8, 'GA': 10.9, 'NC': 10.7, 'MI': 10.0,
    'NJ': 9.3, 'VA': 8.7, 'WA': 7.8, 'AZ': 7.3, 'TN': 7.0,
    'MA': 7.0, 'IN': 6.8, 'MD': 6.2, 'MO': 6.2, 'WI': 5.9,
    'CO': 5.8, 'MN': 5.7, 'SC': 5.2, 'AL': 5.0, 'LA': 4.6,
    'KY': 4.5, 'OR': 4.2, 'OK': 4.0, 'CT': 3.6, 'UT': 3.3,
    'IA': 3.2, 'NV': 3.1, 'AR': 3.0, 'MS': 2.9, 'KS': 2.9,
    'NM': 2.1, 'NE': 2.0, 'ID': 1.9, 'WV': 1.8, 'HI': 1.4,
    'NH': 1.4, 'ME': 1.4, 'RI': 1.1, 'MT': 1.1, 'DE': 1.0,
    'SD': 0.9, 'ND': 0.8, 'AK': 0.7, 'VT': 0.6, 'WY': 0.6
  };

  console.log("\nState Coverage (sorted by total facilities):");
  console.log("State | Facilities | Cities | Per Million Pop | Status");
  console.log("------|------------|--------|----------------|--------");
  
  usStates.forEach(state => {
    const pop = statePopulations[state.state] || 1.0;
    const perMillion = (state.count / pop).toFixed(1);
    const status = parseFloat(perMillion) < 50 ? '⚠️ UNDERSERVED' : 
                   parseFloat(perMillion) > 100 ? '✅ WELL COVERED' : '🔄 MODERATE';
    
    console.log(
      `${state.state.padEnd(5)} | ${state.count.toString().padStart(10)} | ${state.cities.toString().padStart(6)} | ${perMillion.padStart(14)} | ${status}`
    );
  });

  // Most underserved states
  console.log("\n⚠️ MOST UNDERSERVED US STATES (facilities per million):");
  const underservedStates = usStates
    .map(state => ({
      state: state.state,
      count: state.count,
      perMillion: state.count / (statePopulations[state.state] || 1.0)
    }))
    .sort((a, b) => a.perMillion - b.perMillion)
    .slice(0, 10);

  underservedStates.forEach(state => {
    console.log(`${state.state}: ${state.perMillion.toFixed(1)} per million (${state.count} total)`);
  });

  // Major US Metropolitan Areas
  console.log("\n🏙️ MAJOR US METROPOLITAN AREAS");
  console.log("==================================");
  
  const metroAreas = [
    { name: 'New York Metro', cities: ['New York', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'] },
    { name: 'Los Angeles Metro', cities: ['Los Angeles', 'Long Beach', 'Anaheim', 'Santa Ana'] },
    { name: 'Chicago Metro', cities: ['Chicago', 'Aurora', 'Naperville', 'Elgin'] },
    { name: 'Houston Metro', cities: ['Houston', 'Sugar Land', 'The Woodlands'] },
    { name: 'Phoenix Metro', cities: ['Phoenix', 'Mesa', 'Scottsdale', 'Chandler'] },
    { name: 'Philadelphia Metro', cities: ['Philadelphia', 'Camden', 'Wilmington'] },
    { name: 'San Francisco Bay Area', cities: ['San Francisco', 'Oakland', 'San Jose', 'Berkeley'] },
    { name: 'Boston Metro', cities: ['Boston', 'Cambridge', 'Quincy', 'Newton'] },
    { name: 'Miami Metro', cities: ['Miami', 'Fort Lauderdale', 'West Palm Beach'] },
    { name: 'Dallas-Fort Worth', cities: ['Dallas', 'Fort Worth', 'Arlington', 'Plano'] }
  ];

  for (const metro of metroAreas) {
    let totalCount = 0;
    const cityDetails: Array<{city: string, count: number}> = [];
    
    for (const city of metro.cities) {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(communities)
        .where(and(
          eq(communities.city, city),
          eq(communities.country, 'US')
        ));
      
      if (result.count > 0) {
        totalCount += result.count;
        cityDetails.push({ city, count: result.count });
      }
    }
    
    console.log(`\n${metro.name}: ${totalCount} total facilities`);
    cityDetails.forEach(detail => {
      console.log(`  - ${detail.city}: ${detail.count}`);
    });
  }

  // Global city rankings
  console.log("\n🏆 TOP 50 GLOBAL CITIES BY FACILITY COUNT");
  console.log("============================================");
  
  const globalTopCities = await db
    .select({
      city: communities.city,
      state: communities.state,
      country: communities.country,
      count: sql<number>`count(*)::int`
    })
    .from(communities)
    .groupBy(communities.city, communities.state, communities.country)
    .orderBy(desc(sql`count(*)`))
    .limit(50);

  console.log("Rank | City, State/Province | Country | Facilities");
  console.log("-----|----------------------|---------|------------");
  
  globalTopCities.forEach((city, index) => {
    const location = city.state ? `${city.city}, ${city.state}` : city.city;
    console.log(
      `${(index + 1).toString().padStart(4)} | ${location.padEnd(20)} | ${city.country.padEnd(7)} | ${city.count}`
    );
  });

  // Cities with special features
  console.log("\n🌟 CITIES WITH SPECIAL FEATURES");
  console.log("==================================");
  
  // Cities with HUD properties
  const hudCities = await db
    .select({
      city: communities.city,
      state: communities.state,
      count: sql<number>`count(*)::int`
    })
    .from(communities)
    .where(sql`hud_property = true`)
    .groupBy(communities.city, communities.state)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  console.log("\nTop Cities with HUD Properties:");
  hudCities.forEach(city => {
    console.log(`  ${city.city}, ${city.state}: ${city.count} HUD facilities`);
  });

  // Coverage gaps analysis
  console.log("\n🔍 COVERAGE GAP ANALYSIS");
  console.log("==========================");
  
  // States with fewer than 100 facilities
  const lowCoverageStates = usStates.filter(state => state.count < 100);
  console.log(`\nUS States with <100 facilities: ${lowCoverageStates.length}`);
  lowCoverageStates.forEach(state => {
    console.log(`  ${state.state}: ${state.count} facilities in ${state.cities} cities`);
  });

  // International expansion opportunities
  console.log("\n🌏 INTERNATIONAL EXPANSION STATUS");
  console.log("===================================");
  
  const internationalCountries = await db
    .select({
      country: communities.country,
      count: sql<number>`count(*)::int`,
      cities: sql<number>`count(DISTINCT city)::int`
    })
    .from(communities)
    .where(ne(communities.country, 'US'))
    .groupBy(communities.country)
    .orderBy(desc(sql`count(*)`));

  internationalCountries.forEach(country => {
    console.log(`${country.country}: ${country.count} facilities in ${country.cities} cities`);
  });

  console.log("\n✅ ANALYSIS COMPLETE!");
  console.log("======================");
  console.log(`Analysis completed at: ${new Date().toISOString()}`);
  
  process.exit(0);
}

// Run the analysis
analyzeCityCoverage().catch(console.error);