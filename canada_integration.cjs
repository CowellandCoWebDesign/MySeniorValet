const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const fs = require("fs");
const path = require("path");

// Database connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

// Import the schema
const { communities } = require("./dist/shared/schema.js");

async function integrateCanadianCommunities() {
  console.log("🇨🇦 Starting Canadian Communities Integration");
  console.log("=" .repeat(60));
  
  try {
    // Read the Canadian data file
    const dataFile = fs.readdirSync('.').find(f => f.startsWith('canada_senior_housing_') && f.endsWith('.json'));
    if (!dataFile) {
      console.error("❌ No Canadian data file found!");
      return;
    }
    
    const canadianData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📁 Loaded ${canadianData.length} Canadian communities from ${dataFile}`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each community
    for (const community of canadianData) {
      try {
        // Prepare the data for insertion
        const communityData = {
          name: community.name,
          address: community.address,
          city: community.city,
          state: community.state_province, // Using state field for province
          zip: community.postal_code,
          country: community.country,
          phone: community.phone,
          community_subtype: community.community_subtype,
          care_types: community.care_types || [],
          total_units: community.total_units,
          latitude: community.latitude,
          longitude: community.longitude,
          amenities: [],
          nearby_hospitals: [],
          website: null,
          license_number: null,
          license_type: null,
          capacity: community.total_units,
          medicare_accepted: null,
          medicaid_accepted: null,
          primary_image: null,
          additional_images: [],
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // Insert the community
        await db.insert(communities).values(communityData);
        successCount++;
        console.log(`✓ Added: ${community.name} (${community.city}, ${community.state_province})`);
        
      } catch (error) {
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
    
    // Update community count
    const result = await db.execute(`SELECT COUNT(*) as count FROM communities WHERE country = 'Canada'`);
    console.log(`\n📊 Total Canadian communities in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error("❌ Integration failed:", error);
  }
  
  await client.end();
  process.exit(0);
}

// Run the integration
integrateCanadianCommunities();