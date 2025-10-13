import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateVirginiaMassachusettsData() {
  try {
    console.log('🏛️🦞 VIRGINIA & MASSACHUSETTS DATABASE INTEGRATION STARTING...');
    
    // Load Virginia data
    const vaData = JSON.parse(fs.readFileSync('virginia_complete_facilities_20250717_150618.json', 'utf8'));
    console.log(`📊 Loaded ${vaData.length} Virginia facilities`);
    
    // Load Massachusetts data
    const maData = JSON.parse(fs.readFileSync('massachusetts_complete_facilities_20250717_150646.json', 'utf8'));
    console.log(`📊 Loaded ${maData.length} Massachusetts facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Virginia facilities
    console.log('🏛️ Processing Virginia facilities...');
    for (const facility of vaData) {
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
        console.error(`❌ Error inserting Virginia ${facility.name}:`, error.message);
      }
    }
    
    // Process Massachusetts facilities
    console.log('🦞 Processing Massachusetts facilities...');
    for (const facility of maData) {
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
        console.error(`❌ Error inserting Massachusetts ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 VIRGINIA & MASSACHUSETTS INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Virginia data in database
    const vaResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'VA'
    `);
    
    console.log(`\n🏛️ VIRGINIA DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${vaResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${vaResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${vaResult.rows[0].cities_covered}`);
    
    // Verify Massachusetts data in database
    const maResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'MA'
    `);
    
    console.log(`\n🦞 MASSACHUSETTS DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${maResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${maResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${maResult.rows[0].cities_covered}`);
    
    // Show Virginia major metro coverage
    const vaMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'VA' AND city IN ('Richmond', 'Virginia Beach', 'Norfolk', 'Chesapeake', 'Newport News', 'Alexandria', 'Hampton', 'Portsmouth')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏛️ VIRGINIA MAJOR METRO COVERAGE:`);
    vaMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show Massachusetts major metro coverage
    const maMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'MA' AND city IN ('Boston', 'Cambridge', 'Worcester', 'Springfield', 'Salem', 'Fall River', 'Plymouth', 'Quincy')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🦞 MASSACHUSETTS MAJOR METRO COVERAGE:`);
    maMetros.rows.forEach((row, index) => {
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
      LIMIT 15
    `);
    
    console.log(`\n🗺️  TOP 15 STATES BY COVERAGE:`);
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
      LIMIT 15
    `);
    
    console.log(`\n🏘️  TOP 15 STATES BY COUNTY COVERAGE:`);
    countyResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.counties} counties`);
    });
    
  } catch (error) {
    console.error('❌ Virginia & Massachusetts integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateVirginiaMassachusettsData().catch(console.error);