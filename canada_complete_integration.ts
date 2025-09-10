import { db } from "./server/db";
import { communities } from "@shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";

async function integrateCompleteCanadianExpansion() {
  console.log("🇨🇦 Starting Complete Canadian Communities Integration");
  console.log("=" .repeat(60));
  
  try {
    // Read the Canadian data file
    const files = fs.readdirSync('.');
    const dataFile = files.find(f => f.startsWith('canada_complete_expansion_') && f.endsWith('.json'));
    
    if (!dataFile) {
      console.error("❌ No complete Canadian data file found!");
      return;
    }
    
    const canadianData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📁 Loaded ${canadianData.length} Canadian communities from ${dataFile}`);
    
    let successCount = 0;
    let errorCount = 0;
    let bilingualCount = 0;
    const errors: any[] = [];
    
    // Process each community
    for (const community of canadianData) {
      try {
        // Prepare the data for insertion
        const communityData = {
          name: community.name,
          nameFr: community.name_fr || null,
          address: community.address,
          city: community.city,
          state: community.state_province, // Using state field for province
          zipCode: community.postal_code,
          county: community.country, // Store country in county field temporarily
          phone: community.phone,
          communitySubtype: community.community_subtype as any,
          careTypes: community.care_types || [],
          totalUnits: community.total_units,
          latitude: community.latitude,
          longitude: community.longitude,
          bilingual: community.bilingual || false,
          primaryLanguage: community.primary_language || 'English',
          amenities: [],
          nearbyHospitals: [],
          website: null,
          licenseNumber: null,
          capacity: community.total_units,
          medicareAccepted: null,
          medicaidAccepted: null,
          primaryImage: null,
          additionalImages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert the community
        await db.insert(communities).values(communityData);
        successCount++;
        if (community.bilingual) bilingualCount++;
        console.log(`✓ Added: ${community.name} (${community.city}, ${community.state_province})${community.bilingual ? ' 🗣️ Bilingual' : ''}`);
        
      } catch (error: any) {
        errorCount++;
        errors.push({
          community: community.name,
          error: error.message
        });
        console.error(`✗ Failed to add ${community.name}: ${error.message}`);
      }
    }
    
    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("🇨🇦 COMPLETE CANADIAN INTEGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully added: ${successCount} communities`);
    console.log(`🗣️  Bilingual communities: ${bilingualCount}`);
    console.log(`❌ Failed: ${errorCount} communities`);
    
    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach((e, i) => {
        console.log(`${i + 1}. ${e.community}: ${e.error}`);
      });
    }
    
    // Update community count
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM communities WHERE county = 'Canada'`);
    console.log(`\n📊 Total Canadian communities in database: ${result.rows[0].count}`);
    
    // Show bilingual communities count
    const bilingualResult = await db.execute(sql`SELECT COUNT(*) as count FROM communities WHERE bilingual = true`);
    console.log(`🗣️  Total bilingual communities: ${bilingualResult.rows[0].count}`);
    
    // Show total platform count
    const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM communities`);
    console.log(`📊 Total communities in platform: ${totalResult.rows[0].count}`);
    
    // Show Canadian coverage by province
    const provinceResult = await db.execute(sql`
      SELECT state as province, COUNT(*) as count 
      FROM communities 
      WHERE county = 'Canada' 
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log("\n📍 Canadian Coverage by Province/Territory:");
    provinceResult.rows.forEach(row => {
      console.log(`   ${row.province}: ${row.count} communities`);
    });
    
  } catch (error) {
    console.error("❌ Integration failed:", error);
  }
  
  process.exit(0);
}

// Run the integration
integrateCompleteCanadianExpansion();