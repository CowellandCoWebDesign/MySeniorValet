import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateNewJerseySouthCarolinaData() {
  try {
    console.log('🏙️🏖️ NEW JERSEY & SOUTH CAROLINA DATABASE INTEGRATION STARTING...');
    
    // Load New Jersey data
    const njData = JSON.parse(fs.readFileSync('new_jersey_complete_facilities_20250717_151633.json', 'utf8'));
    console.log(`📊 Loaded ${njData.length} New Jersey facilities`);
    
    // Load South Carolina data
    const scData = JSON.parse(fs.readFileSync('south_carolina_complete_facilities_20250717_151634.json', 'utf8'));
    console.log(`📊 Loaded ${scData.length} South Carolina facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process New Jersey facilities
    console.log('🏙️ Processing New Jersey facilities...');
    for (const facility of njData) {
      try {
        // Check if facility already exists
        const existingResult = await pool.query(
          'SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3',
          [facility.name, facility.city, facility.state]
        );
        
        if (existingResult.rows.length > 0) {
          totalSkipped++;
          continue;
        }
        
        // Insert new facility
        const insertResult = await pool.query(`
          INSERT INTO communities (
            name, address, city, county, state, zip_code, phone, 
            facility_type, care_types, capacity, license_number, 
            data_source, website, latitude, longitude, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
          )
        `, [
          facility.name,
          facility.address,
          facility.city,
          facility.county,
          facility.state,
          facility.zip,
          facility.phone,
          facility.facilityType,
          facility.careTypes,
          facility.capacity,
          facility.licenseNumber,
          facility.dataSource,
          facility.website,
          facility.coordinates.latitude,
          facility.coordinates.longitude
        ]);
        
        totalInserted++;
        
        if (totalInserted % 50 === 0) {
          console.log(`📈 Inserted ${totalInserted} facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting New Jersey ${facility.name}:`, error.message);
      }
    }
    
    // Process South Carolina facilities
    console.log('🏖️ Processing South Carolina facilities...');
    for (const facility of scData) {
      try {
        // Check if facility already exists
        const existingResult = await pool.query(
          'SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3',
          [facility.name, facility.city, facility.state]
        );
        
        if (existingResult.rows.length > 0) {
          totalSkipped++;
          continue;
        }
        
        // Insert new facility
        const insertResult = await pool.query(`
          INSERT INTO communities (
            name, address, city, county, state, zip_code, phone, 
            facility_type, care_types, capacity, license_number, 
            data_source, website, latitude, longitude, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
          )
        `, [
          facility.name,
          facility.address,
          facility.city,
          facility.county,
          facility.state,
          facility.zip,
          facility.phone,
          facility.facilityType,
          facility.careTypes,
          facility.capacity,
          facility.licenseNumber,
          facility.dataSource,
          facility.website,
          facility.coordinates.latitude,
          facility.coordinates.longitude
        ]);
        
        totalInserted++;
        
        if (totalInserted % 50 === 0) {
          console.log(`📈 Inserted ${totalInserted} facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting South Carolina ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 NEW JERSEY & SOUTH CAROLINA INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify New Jersey data in database
    const njResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'NJ'
    `);
    
    console.log(`\n🏙️ NEW JERSEY DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${njResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${njResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${njResult.rows[0].cities_covered}`);
    
    // Verify South Carolina data in database
    const scResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'SC'
    `);
    
    console.log(`\n🏖️ SOUTH CAROLINA DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${scResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${scResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${scResult.rows[0].cities_covered}`);
    
    // Show New Jersey major metro coverage
    const njMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'NJ' AND city IN ('Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Camden', 'Hackensack', 'Atlantic City')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏙️ NEW JERSEY MAJOR METRO COVERAGE:`);
    njMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show South Carolina major metro coverage
    const scMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'SC' AND city IN ('Greenville', 'Columbia', 'Charleston', 'Myrtle Beach', 'Spartanburg', 'Anderson', 'Florence', 'Aiken')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏖️ SOUTH CAROLINA MAJOR METRO COVERAGE:`);
    scMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Update total database count
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`\n🌍 TOTAL DATABASE COMMUNITIES: ${totalResult.rows[0].total}`);
    
    // Show updated state coverage
    const stateResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      GROUP BY state 
      ORDER BY count DESC
      LIMIT 20
    `);
    
    console.log(`\n🗺️  TOP 20 STATES BY COVERAGE:`);
    stateResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.count} facilities`);
    });
    
    // Show updated county coverage ranking
    const countyResult = await pool.query(`
      SELECT state, COUNT(DISTINCT county) as counties
      FROM communities 
      WHERE county IS NOT NULL
      GROUP BY state 
      ORDER BY counties DESC
      LIMIT 20
    `);
    
    console.log(`\n🏘️  TOP 20 STATES BY COUNTY COVERAGE:`);
    countyResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.counties} counties`);
    });
    
  } catch (error) {
    console.error('❌ New Jersey & South Carolina integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateNewJerseySouthCarolinaData().catch(console.error);