import { db } from "./server/db";
import { communities } from "@shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";

async function integrateCanadianCommunities() {
  console.log("🇨🇦 Starting Canadian Communities Integration");
  console.log("=".repeat(60));
  
  try {
    // Read the Canadian data file
    const files = fs.readdirSync('.');
    const dataFile = files.find(f => f.startsWith('canada_senior_housing_') && f.endsWith('.json'));
    
    if (!dataFile) {
      console.error("❌ No Canadian data file found!");
      return;
    }
    
    const canadianData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📁 Loaded ${canadianData.length} Canadian communities from ${dataFile}`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];
    
    // Process each community
    for (const community of canadianData) {
      try {
        // Prepare the data for insertion
        const communityData = {
          name: community.name,
          address: community.address,
          city: community.city,
          state: community.state_province, // Using state field for province
          zipCode: community.postal_code, // Changed from zip to zipCode
          county: community.country, // Store country in county field temporarily
          phone: community.phone,
          communitySubtype: community.community_subtype as any,
          careTypes: community.care_types || [],
          totalUnits: community.total_units,
          latitude: community.latitude,
          longitude: community.longitude,
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
        console.log(`✓ Added: ${community.name} (${community.city}, ${community.state_province})`);
        
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
    console.log("🇨🇦 CANADIAN INTEGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully added: ${successCount} communities`);
    console.log(`❌ Failed: ${errorCount} communities`);
    
    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach((e, i) => {
        console.log(`${i + 1}. ${e.community}: ${e.error}`);
      });
    }
    
    // Update community count (using county field to identify Canadian communities)
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM communities WHERE county = 'Canada'`);
    console.log(`\n📊 Total Canadian communities in database: ${result.rows[0].count}`);
    
    // Show total platform count
    const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM communities`);
    console.log(`📊 Total communities in platform: ${totalResult.rows[0].count}`);
    
  } catch (error) {
    console.error("❌ Integration failed:", error);
  }
  
  process.exit(0);
}

// Run the integration
integrateCanadianCommunities();