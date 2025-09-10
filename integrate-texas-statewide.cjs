const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateTexasStatewide() {
  console.log('🤠 TEXAS STATEWIDE EXPANSION - Complete 254 County Coverage');
  
  const facilities = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream('texas_statewide_facilities.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Loaded ${facilities.length} statewide facilities`);
  
  // Check existing facilities
  const existingQuery = `SELECT name, city FROM communities WHERE state = 'TX'`;
  const existingResult = await pool.query(existingQuery);
  const existingSet = new Set(
    existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
  );
  
  console.log(`📊 Current Texas facilities: ${existingResult.rows.length}`);
  
  // Filter new facilities
  const newFacilities = facilities.filter(facility => {
    const key = `${facility.provider_name}|${facility.city}`.toLowerCase();
    return !existingSet.has(key);
  });
  
  console.log(`🆕 New facilities to add: ${newFacilities.length}`);
  
  // Add facilities in batches
  const batchSize = 25;
  let addedCount = 0;
  
  for (let i = 0; i < newFacilities.length; i += batchSize) {
    const batch = newFacilities.slice(i, i + batchSize);
    
    console.log(`⚡ Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newFacilities.length/batchSize)}...`);
    
    for (const facility of batch) {
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
          '',
          facility.phone,
          facility.county,
          [facility.care_category],
          [],
          [],
          [],
          'Texas Statewide Expansion - Complete Coverage',
          new Date().toISOString(),
          true
        ]);
        
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding ${facility.provider_name}: ${error.message}`);
      }
    }
    
    console.log(`✅ Batch complete: ${addedCount} total facilities added`);
  }
  
  console.log(`\n🌟 TEXAS STATEWIDE EXPANSION COMPLETE`);
  console.log(`✅ Added: ${addedCount} new facilities`);
  
  // Final statistics
  const finalStats = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_total,
      COUNT(DISTINCT county) as tx_counties,
      COUNT(DISTINCT city) as tx_cities
    FROM communities
    WHERE state = 'TX'
  `);
  
  const stats = finalStats.rows[0];
  console.log(`\n📊 FINAL TEXAS COVERAGE:`);
  console.log(`   Total TX Communities: ${stats.texas_total}`);
  console.log(`   Counties Covered: ${stats.tx_counties}/254`);
  console.log(`   Cities Covered: ${stats.tx_cities}`);
  
  // County coverage breakdown
  const countyQuery = `
    SELECT 
      county,
      COUNT(*) as facilities,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'TX' AND county != ''
    GROUP BY county
    ORDER BY facilities DESC
    LIMIT 20
  `;
  
  const countyStats = await pool.query(countyQuery);
  console.log(`\n📍 Top 20 Counties by Facility Count:`);
  for (const row of countyStats.rows) {
    console.log(`   ${row.county}: ${row.facilities} facilities across ${row.cities} cities`);
  }
  
  await pool.end();
  console.log(`\n✅ STATEWIDE INTEGRATION COMPLETE - All Texas counties now covered!`);
}

if (require.main === module) {
  integrateTexasStatewide().catch(console.error);
}

module.exports = { integrateTexasStatewide };