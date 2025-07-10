const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateHawaiiFacilities() {
  console.log('🌺 INTEGRATING HAWAII SENIOR LIVING FACILITIES');
  console.log('Adding authentic Hawaii facilities to TrueView...');
  
  const facilities = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream('hawaii_senior_living_facilities.csv')
      .pipe(csv())
      .on('data', (row) => facilities.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`🏝️ Loaded ${facilities.length} Hawaii facilities`);
  
  // Current database status
  const currentQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'HI' THEN 1 END) as hawaii_current
    FROM communities
  `;
  
  const currentResult = await pool.query(currentQuery);
  const current = currentResult.rows[0];
  
  console.log(`📊 Current database: ${current.total} total, ${current.hawaii_current} Hawaii facilities`);
  
  // Add Hawaii facilities
  let addedCount = 0;
  const batchSize = 5;
  
  for (let i = 0; i < facilities.length; i += batchSize) {
    const batch = facilities.slice(i, i + batchSize);
    
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
          facility.zip_code,
          facility.phone,
          facility.county,
          [facility.care_category],
          [],
          [],
          [],
          'Hawaii Expansion - Comprehensive Research',
          new Date().toISOString(),
          true
        ]);
        
        addedCount++;
        
      } catch (error) {
        console.error(`❌ ${facility.provider_name}: ${error.message}`);
      }
    }
    
    if (addedCount % 25 === 0) {
      console.log(`✅ Added ${addedCount}/${facilities.length} Hawaii facilities`);
    }
  }
  
  // Final verification
  const finalQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'HI' THEN 1 END) as hawaii_facilities,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas_facilities,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california_facilities,
      COUNT(DISTINCT CASE WHEN state = 'HI' THEN county END) as hawaii_counties
    FROM communities
  `;
  
  const finalResult = await pool.query(finalQuery);
  const final = finalResult.rows[0];
  
  console.log(`\n🌺 HAWAII EXPANSION COMPLETE!`);
  console.log(`✅ Total Communities: ${final.total}`);
  console.log(`🏝️ Hawaii Facilities: ${final.hawaii_facilities}`);
  console.log(`🤠 Texas Facilities: ${final.texas_facilities}`);
  console.log(`🌉 California Facilities: ${final.california_facilities}`);
  console.log(`📍 Hawaii Counties: ${final.hawaii_counties}/4`);
  
  // Show Hawaii facilities by county
  const hawaiiCountiesQuery = `
    SELECT 
      county,
      COUNT(*) as facilities,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'HI'
    GROUP BY county
    ORDER BY facilities DESC
  `;
  
  const hawaiiCounties = await pool.query(hawaiiCountiesQuery);
  console.log(`\n🏝️ Hawaii Coverage by County:`);
  for (const row of hawaiiCounties.rows) {
    console.log(`   ${row.county}: ${row.facilities} facilities in ${row.cities} cities`);
  }
  
  await pool.end();
  console.log(`\n🌺 ALOHA! TrueView now covers Hawaii!`);
}

if (require.main === module) {
  integrateHawaiiFacilities().catch(console.error);
}

module.exports = { integrateHawaiiFacilities };