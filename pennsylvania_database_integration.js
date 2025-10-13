import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integratePennsylvaniaData() {
  try {
    console.log('🏛️ PENNSYLVANIA DATABASE INTEGRATION STARTING...');
    
    // Load Pennsylvania data
    const paData = JSON.parse(fs.readFileSync('pennsylvania_complete_facilities_20250717_065447.json', 'utf8'));
    console.log(`📊 Loaded ${paData.length} Pennsylvania facilities`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    // Process each facility
    for (const facility of paData) {
      try {
        // Check if facility already exists
        const existingResult = await pool.query(
          'SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3',
          [facility.name, facility.city, facility.state]
        );
        
        if (existingResult.rows.length > 0) {
          skippedCount++;
          continue;
        }
        
        // Insert new facility (normalize facility type to database constraint)
        const normalizedFacilityType = 'Senior Living'; // All Pennsylvania facilities are Senior Living
        
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
          normalizedFacilityType,
          facility.careTypes,
          facility.capacity,
          facility.licenseNumber,
          facility.dataSource,
          facility.website,
          facility.coordinates.latitude,
          facility.coordinates.longitude
        ]);
        
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`📈 Inserted ${insertedCount} facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 PENNSYLVANIA INTEGRATION COMPLETE!`);
    console.log(`✅ Inserted: ${insertedCount} facilities`);
    console.log(`⏭️  Skipped: ${skippedCount} facilities (already exist)`);
    
    // Verify Pennsylvania data in database
    const paResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'PA'
    `);
    
    console.log(`\n🏛️ PENNSYLVANIA DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${paResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${paResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${paResult.rows[0].cities_covered}`);
    
    // Show Pennsylvania county breakdown
    const paCounties = await pool.query(`
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'PA' AND county IS NOT NULL
      GROUP BY county 
      ORDER BY count DESC
      LIMIT 15
    `);
    
    console.log(`\n🏛️ TOP PENNSYLVANIA COUNTIES:`);
    paCounties.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.county}: ${row.count} facilities`);
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
      LIMIT 10
    `);
    
    console.log(`\n🗺️  TOP 10 STATES BY COVERAGE:`);
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
      LIMIT 10
    `);
    
    console.log(`\n🏘️  TOP 10 STATES BY COUNTY COVERAGE:`);
    countyResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.counties} counties`);
    });
    
  } catch (error) {
    console.error('❌ Pennsylvania integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integratePennsylvaniaData().catch(console.error);