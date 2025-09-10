const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateTexasFacilities() {
  console.log('🤠 TEXAS EXPANSION - Adding 1 Assisted Living Facilities');
  
  const facilities = [];
  
  // Load CSV data
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_quick_assisted_living.csv')
      .pipe(csv())
      .on('data', (row) => {
        facilities.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Loaded ${facilities.length} Texas facilities from CSV`);
  
  // Get existing Texas facilities to avoid duplicates
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
  );
  
  console.log(`📊 Found ${existingResult.rows.length} existing Texas facilities in database`);
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const facility of facilities) {
    const key = `${facility.Name}|${facility.City}`.toLowerCase();
    
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
      
      const values = [
        facility.Name,
        facility.Address,
        facility.City,
        'TX',
        facility.ZipCode,
        facility.Phone,
        facility.County,
        ['Assisted Living'], // care_types
        [], // amenities
        [], // services
        [], // medical_restrictions
        'Texas HHSC Open Data Portal',
        new Date().toISOString(),
        true // is_verified
      ];
      
      await pool.query(insertQuery, values);
      addedCount++;
      
      if (addedCount % 25 === 0) {
        console.log(`✅ Progress: Added ${addedCount} facilities...`);
      }
      
    } catch (error) {
      console.error(`❌ Error adding ${facility.Name}:`, error.message);
    }
  }
  
  console.log(`\n🎯 TEXAS EXPANSION RESULTS`);
  console.log(`✅ Successfully added: ${addedCount} new facilities`);
  console.log(`⏭️  Skipped (duplicates): ${skippedCount} facilities`);
  console.log(`📊 Total processed: ${facilities.length} facilities`);
  
  // Show final stats
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT state) as states,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_count,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_count
    FROM communities
  `;
  
  const stats = await pool.query(statsQuery);
  console.log(`\n🌟 FINAL DATABASE STATUS:`);
  console.log(`   Total Communities: ${stats.rows[0].total}`);
  console.log(`   States Covered: ${stats.rows[0].states}`);
  console.log(`   Texas Communities: ${stats.rows[0].texas_count}`);
  console.log(`   California Communities: ${stats.rows[0].california_count}`);
  
  await pool.end();
}

if (require.main === module) {
  integrateTexasFacilities().catch(console.error);
}

module.exports = { integrateTexasFacilities };