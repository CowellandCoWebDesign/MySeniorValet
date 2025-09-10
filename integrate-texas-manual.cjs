const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateTexasManualFacilities() {
  console.log('🤠 TEXAS MANUAL EXPANSION - Adding 5 Test Facilities');
  
  const facilities = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_assisted_living_manual.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Loaded ${facilities.length} Texas facilities`);
  
  // Check for existing Texas facilities
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
  );
  
  console.log(`📊 Found ${existingResult.rows.length} existing Texas facilities`);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const facility of facilities) {
    const key = `${facility.name}|${facility.city}`.toLowerCase();
    
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
        facility.name,
        facility.address,
        facility.city,
        facility.state,
        facility.zip_code,
        facility.phone,
        facility.county,
        ['Assisted Living'],
        [],
        [],
        [],
        'Texas Manual Collection',
        new Date().toISOString(),
        true
      ]);
      
      addedCount++;
      console.log(`✅ Added: ${facility.name} in ${facility.city}`);
      
    } catch (error) {
      console.error(`❌ Error adding ${facility.name}:`, error.message);
    }
  }
  
  console.log(`\n🎯 TEXAS MANUAL EXPANSION COMPLETE`);
  console.log(`✅ Successfully added: ${addedCount} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${skippedCount} facilities`);
  
  // Final database stats
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_count,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_count
    FROM communities
  `;
  
  const stats = await pool.query(statsQuery);
  console.log(`\n🌟 UPDATED DATABASE STATUS:`);
  console.log(`   Total Communities: ${stats.rows[0].total}`);
  console.log(`   Texas Communities: ${stats.rows[0].texas_count}`);
  console.log(`   California Communities: ${stats.rows[0].california_count}`);
  
  await pool.end();
}

if (require.main === module) {
  integrateTexasManualFacilities().catch(console.error);
}

module.exports = { integrateTexasManualFacilities };