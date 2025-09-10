const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateTexasTulipFacilities() {
  console.log('🤠 TEXAS TULIP EXPANSION - Adding 52 Facilities');
  
  const facilities = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_tulip_facilities.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Loaded ${facilities.length} Texas TULIP facilities`);
  
  // Get existing facilities to avoid duplicates
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
  );
  
  console.log(`📊 Found ${existingResult.rows.length} existing Texas facilities`);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const facility of facilities) {
    const key = `${facility.provider_name}|${facility.city}`.toLowerCase();
    
    if (existingSet.has(key)) {
      skippedCount++;
      continue;
    }
    
    try {
      const insertQuery = `
        INSERT INTO communities (
          name, address, city, state, zip_code, phone, county,
          care_types, amenities, services, medical_restrictions,
          discovery_source, discovery_date, is_verified
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
      `;
      
      await pool.query(insertQuery, [
        facility.provider_name,
        facility.address,
        facility.city,
        facility.state,
        '',  // zip_code
        facility.phone,
        '',  // county - will be enriched later
        [facility.care_category],
        [],
        [],
        [],
        'Texas TULIP System',
        new Date().toISOString(),
        true
      ]);
      
      addedCount++;
      
      if (addedCount % 50 === 0) {
        console.log(`✅ Progress: Added ${addedCount} facilities...`);
      }
      
    } catch (error) {
      console.error(`❌ Error adding ${facility.provider_name}:`, error.message);
    }
  }
  
  console.log(`\n🎯 TEXAS TULIP EXPANSION COMPLETE`);
  console.log(`✅ Successfully added: ${addedCount} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${skippedCount} facilities`);
  
  // Show care category breakdown
  const categoryQuery = `
    SELECT 
      care_types,
      COUNT(*) as count
    FROM communities 
    WHERE state = 'TX' 
    GROUP BY care_types
    ORDER BY count DESC
  `;
  
  const categoryResult = await pool.query(categoryQuery);
  console.log(`\n📊 Texas Facilities by Care Type:`);
  for (const row of categoryResult.rows) {
    console.log(`   ${row.care_types}: ${row.count}`);
  }
  
  // Final stats
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_count,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_count
    FROM communities
  `;
  
  const stats = await pool.query(statsQuery);
  console.log(`\n🌟 FINAL DATABASE STATUS:`);
  console.log(`   Total Communities: ${stats.rows[0].total}`);
  console.log(`   Texas Communities: ${stats.rows[0].texas_count}`);
  console.log(`   California Communities: ${stats.rows[0].california_count}`);
  
  await pool.end();
}

if (require.main === module) {
  integrateTexasTulipFacilities().catch(console.error);
}

module.exports = { integrateTexasTulipFacilities };