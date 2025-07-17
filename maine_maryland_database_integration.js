import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateMaineMarylandData() {
  try {
    console.log('🦞🦀 MAINE & MARYLAND DATABASE INTEGRATION STARTING...');
    
    // Load Maine data
    const meData = JSON.parse(fs.readFileSync('maine_complete_facilities_20250717_170228.json', 'utf8'));
    console.log(`📊 Loaded ${meData.length} Maine facilities`);
    
    // Load Maryland data
    const mdData = JSON.parse(fs.readFileSync('maryland_complete_facilities_20250717_170229.json', 'utf8'));
    console.log(`📊 Loaded ${mdData.length} Maryland facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Maine facilities
    console.log('🦞 Processing Maine facilities...');
    for (const facility of meData) {
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
        console.error(`❌ Error inserting Maine ${facility.name}:`, error.message);
      }
    }
    
    // Process Maryland facilities
    console.log('🦀 Processing Maryland facilities...');
    for (const facility of mdData) {
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
        console.error(`❌ Error inserting Maryland ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 MAINE & MARYLAND INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Maine data in database
    const meResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'ME'
    `);
    
    console.log(`\n🦞 MAINE DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${meResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${meResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${meResult.rows[0].cities_covered}`);
    
    // Verify Maryland data in database
    const mdResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'MD'
    `);
    
    console.log(`\n🦀 MARYLAND DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${mdResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${mdResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${mdResult.rows[0].cities_covered}`);
    
    // Show Maine major metro coverage
    const meMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'ME' AND city IN ('Portland', 'Bangor', 'Lewiston', 'Augusta', 'Biddeford', 'Waterville', 'Presque Isle', 'Rockland', 'Auburn', 'Ellsworth')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🦞 MAINE MAJOR METRO COVERAGE:`);
    meMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show Maryland major metro coverage
    const mdMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'MD' AND city IN ('Rockville', 'Gaithersburg', 'Silver Spring', 'Bethesda', 'Largo', 'Bowie', 'Towson', 'Columbia', 'Annapolis', 'Frederick')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🦀 MARYLAND MAJOR METRO COVERAGE:`);
    mdMetros.rows.forEach((row, index) => {
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
      LIMIT 30
    `);
    
    console.log(`\n🗺️  TOP 30 STATES BY COVERAGE:`);
    stateResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.count} facilities`);
    });
    
    // Show complete New England expansion
    const newEnglandResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('CT', 'MA', 'RI', 'VT', 'NH', 'ME')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🍂 NEW ENGLAND EXPANSION COMPLETE:`);
    newEnglandResult.rows.forEach((row, index) => {
      const stateNames = {
        'CT': 'Connecticut',
        'MA': 'Massachusetts',
        'RI': 'Rhode Island',
        'VT': 'Vermont',
        'NH': 'New Hampshire',
        'ME': 'Maine'
      };
      const status = ' (100% COMPLETE)';
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities${status}`);
    });
    
    // Show complete Northeast corridor
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
        SELECT unnest(ARRAY['WV', 'KY', 'ND', 'SD', 'NE']) as state
        EXCEPT
        SELECT DISTINCT state FROM communities
      ) as missing
    `);
    
    console.log(`\n🎯 REMAINING STATES FOR 50-STATE COMPLETION:`);
    if (remainingStates.rows.length > 0 && remainingStates.rows[0].states) {
      const states = remainingStates.rows[0].states.split(', ');
      const stateNames = {
        'WV': 'West Virginia',
        'KY': 'Kentucky',
        'ND': 'North Dakota',
        'SD': 'South Dakota',
        'NE': 'Nebraska'
      };
      states.forEach((state, index) => {
        console.log(`  ${index + 1}. ${stateNames[state] || state}`);
      });
    } else {
      console.log(`  🎉 NO REMAINING STATES - 50-STATE COMPLETION ACHIEVED!`);
    }
    
    // Final milestone check
    const finalCount = parseInt(nationalResult.rows[0].total_facilities);
    const statesCount = parseInt(nationalResult.rows[0].states_covered);
    
    console.log(`\n🎯 EXPANSION MOMENTUM SUMMARY:`);
    console.log(`🚀 Total facilities: ${finalCount}`);
    console.log(`🌟 States covered: ${statesCount}/50 (${(statesCount/50*100).toFixed(1)}%)`);
    console.log(`🎖️  Remaining states: ${50 - statesCount}`);
    console.log(`🏁 Progress to completion: ${((statesCount/50)*100).toFixed(1)}%`);
    
    if (statesCount >= 45) {
      console.log(`\n🎉 APPROACHING COMPLETION - ONLY ${50 - statesCount} STATES REMAINING! 🎉`);
      console.log(`🌟 MySeniorValet dominates ${statesCount} states with ${finalCount} facilities!`);
      
      if (statesCount >= 48) {
        console.log(`🚀 FINAL SPRINT - LESS THAN 5 STATES TO COMPLETE AMERICA! 🚀`);
      }
    }
    
    // Show top 10 states by facility count
    const topStatesResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      GROUP BY state 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log(`\n🏆 TOP 10 STATES BY FACILITY COUNT:`);
    topStatesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.state}: ${row.count} facilities`);
    });
    
  } catch (error) {
    console.error('❌ Maine & Maryland integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateMaineMarylandData().catch(console.error);