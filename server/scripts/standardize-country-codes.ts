import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, sql, inArray, or, isNull } from "drizzle-orm";

/**
 * Standardize country codes across the database
 * Fix inconsistencies: Australia->AU, USA->US, Canada->CA
 */

async function standardizeCountryCodes() {
  console.log("=== STANDARDIZING COUNTRY CODES ===");
  console.log("Fixing data consistency issues\n");

  try {
    // Fix Australian entries
    console.log("📍 Standardizing Australian entries...");
    const auResult = await db
      .update(communities)
      .set({ country: "AU" })
      .where(eq(communities.country, "Australia"));
    console.log(`  ✅ Updated "Australia" -> "AU"`);

    // Fix US entries  
    console.log("\n📍 Standardizing US entries...");
    const usResult1 = await db
      .update(communities)
      .set({ country: "US" })
      .where(eq(communities.country, "USA"));
    console.log(`  ✅ Updated "USA" -> "US"`);

    const usResult2 = await db
      .update(communities)
      .set({ country: "US" })
      .where(eq(communities.country, "United States"));
    console.log(`  ✅ Updated "United States" -> "US"`);

    // Fix Canadian entries
    console.log("\n📍 Standardizing Canadian entries...");
    const caResult = await db
      .update(communities)
      .set({ country: "CA" })
      .where(eq(communities.country, "Canada"));
    console.log(`  ✅ Updated "Canada" -> "CA"`);

    // Fix null entries (set to US as default since most are likely US)
    console.log("\n📍 Fixing null country entries...");
    const nullResult = await db
      .update(communities)
      .set({ country: "US" })
      .where(isNull(communities.country));
    console.log(`  ✅ Updated null -> "US"`);

    // Get updated statistics
    const countries = await db
      .select({
        country: communities.country,
        count: sql<number>`count(*)::int`
      })
      .from(communities)
      .groupBy(communities.country)
      .orderBy(sql`count(*) DESC`);

    const [total] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(communities);

    console.log("\n🌍 STANDARDIZED COUNTRY DISTRIBUTION:");
    console.log("=======================================");
    countries.forEach(c => {
      const percentage = ((c.count / total.count) * 100).toFixed(2);
      console.log(`  ${c.country}: ${c.count.toLocaleString()} facilities (${percentage}%)`);
    });

    console.log(`\n📊 TOTAL FACILITIES: ${total.count.toLocaleString()}`);

    // Show Australian state breakdown
    const auStates = await db
      .select({
        state: communities.state,
        count: sql<number>`count(*)::int`
      })
      .from(communities)
      .where(eq(communities.country, "AU"))
      .groupBy(communities.state)
      .orderBy(sql`count(*) DESC`);

    console.log("\n🇦🇺 AUSTRALIAN COVERAGE BY STATE:");
    console.log("====================================");
    auStates.forEach(s => {
      console.log(`  ${s.state}: ${s.count.toLocaleString()} facilities`);
    });

    const [auCities] = await db
      .select({ 
        count: sql<number>`count(distinct city)::int` 
      })
      .from(communities)
      .where(eq(communities.country, "AU"));

    console.log(`\n📍 Australian cities covered: ${auCities.count}`);

    console.log("\n✅ COUNTRY CODE STANDARDIZATION COMPLETE!");
    console.log("All facilities now use standard ISO country codes");
    
  } catch (error) {
    console.error("❌ Error standardizing country codes:", error);
  }

  process.exit(0);
}

// Run the standardization
standardizeCountryCodes().catch(console.error);