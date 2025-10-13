import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateRhodeIslandNewHampshireData() {
  try {
    console.log('🌊🍁 RHODE ISLAND & NEW HAMPSHIRE DATABASE INTEGRATION STARTING...');
    
    // Load Rhode Island data
    const riData = JSON.parse(fs.readFileSync('rhode_island_complete_facilities_20250717_162257.json', 'utf8'));
    console.log(`📊 Loaded ${riData.length} Rhode Island facilities`);
    
    // Load New Hampshire data
    const nhData = JSON.parse(fs.readFileSync('new_hampshire_complete_facilities_20250717_162258.json', 'utf8'));
    console.log(`📊 Loaded ${nhData.length} New Hampshire facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Rhode Island facilities
    console.log('🌊 Processing Rhode Island facilities...');
    for (const facility of riData) {
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
        console.error(`❌ Error inserting Rhode Island ${facility.name}:`, error.message);
      }
    }
    
    // Process New Hampshire facilities
    console.log('🍁 Processing New Hampshire facilities...');
    for (const facility of nhData) {
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
        console.error(`❌ Error inserting New Hampshire ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 RHODE ISLAND & NEW HAMPSHIRE INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Rhode Island data in database
    const riResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'RI'
    `);
    
    console.log(`\n🌊 RHODE ISLAND DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${riResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${riResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${riResult.rows[0].cities_covered}`);
    
    // Verify New Hampshire data in database
    const nhResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'NH'
    `);
    
    console.log(`\n🍁 NEW HAMPSHIRE DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${nhResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${nhResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${nhResult.rows[0].cities_covered}`);
    
    // Show Rhode Island major metro coverage
    const riMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'RI' AND city IN ('Providence', 'Warwick', 'Cranston', 'Pawtucket', 'Newport', 'Westerly', 'Woonsocket', 'Middletown', 'Bristol', 'Coventry')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🌊 RHODE ISLAND MAJOR METRO COVERAGE:`);
    riMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show New Hampshire major metro coverage
    const nhMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'NH' AND city IN ('Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester', 'Salem', 'Portsmouth', 'Keene', 'Dover', 'Lebanon')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🍁 NEW HAMPSHIRE MAJOR METRO COVERAGE:`);
    nhMetros.rows.forEach((row, index) => {
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
      LIMIT 25
    `);
    
    console.log(`\n🗺️  TOP 25 STATES BY COVERAGE:`);
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
      LIMIT 25
    `);
    
    console.log(`\n🏘️  TOP 25 STATES BY COUNTY COVERAGE:`);
    countyResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.counties} counties`);
    });
    
    // Show complete Northeast expansion progress
    const northeastResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('CT', 'MA', 'RI', 'VT', 'NH', 'ME', 'NY', 'NJ', 'PA', 'DE', 'MD')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏢 NORTHEAST CORRIDOR EXPANSION COMPLETE:`);
    northeastResult.rows.forEach((row, index) => {
      const stateNames = {
        'CT': 'Connecticut',
        'MA': 'Massachusetts',
        'RI': 'Rhode Island',
        'VT': 'Vermont',
        'NH': 'New Hampshire',
        'ME': 'Maine',
        'NY': 'New York',
        'NJ': 'New Jersey',
        'PA': 'Pennsylvania',
        'DE': 'Delaware',
        'MD': 'Maryland'
      };
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities`);
    });
    
    // Show New England completion
    const newEnglandResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('CT', 'MA', 'RI', 'VT', 'NH', 'ME')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🍂 NEW ENGLAND EXPANSION PROGRESS:`);
    newEnglandResult.rows.forEach((row, index) => {
      const stateNames = {
        'CT': 'Connecticut',
        'MA': 'Massachusetts',
        'RI': 'Rhode Island',
        'VT': 'Vermont',
        'NH': 'New Hampshire',
        'ME': 'Maine'
      };
      const status = row.state === 'ME' ? ' (REMAINING)' : ' (COMPLETE)';
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities${status}`);
    });
    
    // Show comprehensive national coverage
    const nationalResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT state) as states_covered,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered,
        COUNT(*) as total_facilities
      FROM communities
    `);
    
    console.log(`\n🇺🇸 COMPREHENSIVE NATIONAL COVERAGE:`);
    console.log(`📊 States covered: ${nationalResult.rows[0].states_covered}/50 (${(nationalResult.rows[0].states_covered/50*100).toFixed(1)}%)`);
    console.log(`🏘️  Counties covered: ${nationalResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${nationalResult.rows[0].cities_covered}`);
    console.log(`🏥 Total facilities: ${nationalResult.rows[0].total_facilities}`);
    
    // Show remaining states for complete coverage
    const remainingStates = await pool.query(`
      SELECT 'Missing States' as category, 
             STRING_AGG(state, ', ') as states
      FROM (
        SELECT unnest(ARRAY['ME', 'WV', 'KY', 'ND', 'SD', 'NE', 'MD']) as state
        EXCEPT
        SELECT DISTINCT state FROM communities
      ) as missing
    `);
    
    console.log(`\n🎯 REMAINING STATES FOR 50-STATE COMPLETION:`);
    if (remainingStates.rows.length > 0 && remainingStates.rows[0].states) {
      const states = remainingStates.rows[0].states.split(', ');
      const stateNames = {
        'ME': 'Maine',
        'WV': 'West Virginia',
        'KY': 'Kentucky',
        'ND': 'North Dakota',
        'SD': 'South Dakota',
        'NE': 'Nebraska',
        'MD': 'Maryland'
      };
      states.forEach((state, index) => {
        console.log(`  ${index + 1}. ${stateNames[state] || state}`);
      });
    }
    
    // Final milestone check
    const finalCount = parseInt(nationalResult.rows[0].total_facilities);
    const statesCount = parseInt(nationalResult.rows[0].states_covered);
    
    console.log(`\n🎯 EXPANSION MOMENTUM SUMMARY:`);
    console.log(`🚀 Total facilities: ${finalCount}`);
    console.log(`🌟 States covered: ${statesCount}/50 (${(statesCount/50*100).toFixed(1)}%)`);
    console.log(`🎖️  Remaining states: ${50 - statesCount}`);
    console.log(`🏁 Progress to completion: ${((statesCount/50)*100).toFixed(1)}%`);
    
    if (statesCount >= 44) {
      console.log(`\n🎉 APPROACHING COMPLETION - ONLY ${50 - statesCount} STATES REMAINING! 🎉`);
      console.log(`🌟 MySeniorValet dominates ${statesCount} states with ${finalCount} facilities!`);
    }
    
  } catch (error) {
    console.error('❌ Rhode Island & New Hampshire integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateRhodeIslandNewHampshireData().catch(console.error);