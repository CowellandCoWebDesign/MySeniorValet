import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateWestVirginiaData() {
  try {
    console.log('⛰️ WEST VIRGINIA DATABASE INTEGRATION STARTING...');
    
    // Load West Virginia data
    const wvData = JSON.parse(fs.readFileSync('west_virginia_complete_facilities_20250717_181008.json', 'utf8'));
    console.log(`📊 Loaded ${wvData.length} West Virginia facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process West Virginia facilities
    console.log('⛰️ Processing West Virginia facilities...');
    for (const facility of wvData) {
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
        console.error(`❌ Error inserting West Virginia ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 WEST VIRGINIA INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify West Virginia data in database
    const wvResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'WV'
    `);
    
    console.log(`\n⛰️ WEST VIRGINIA DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${wvResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${wvResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${wvResult.rows[0].cities_covered}`);
    
    // Show West Virginia major metro coverage
    const wvMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'WV' AND city IN ('Charleston', 'Huntington', 'Morgantown', 'Martinsburg', 'Parkersburg', 'Wheeling', 'Bridgeport', 'Clarksburg', 'Fairmont', 'Beckley')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n⛰️ WEST VIRGINIA MAJOR METRO COVERAGE:`);
    wvMetros.rows.forEach((row, index) => {
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
        SELECT unnest(ARRAY['KY', 'ND', 'SD', 'NE']) as state
        EXCEPT
        SELECT DISTINCT state FROM communities
      ) as missing
    `);
    
    console.log(`\n🎯 REMAINING STATES FOR 50-STATE COMPLETION:`);
    if (remainingStates.rows.length > 0 && remainingStates.rows[0].states) {
      const states = remainingStates.rows[0].states.split(', ');
      const stateNames = {
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
      
      if (statesCount >= 47) {
        console.log(`🚀 FINAL SPRINT - LESS THAN 3 STATES TO COMPLETE AMERICA! 🚀`);
      }
    }
    
    // Show Appalachian region coverage
    const appalachianResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('WV', 'PA', 'VA', 'NC', 'SC', 'TN', 'KY', 'OH', 'MD', 'GA', 'AL', 'NY')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏔️  APPALACHIAN REGION COVERAGE:`);
    appalachianResult.rows.forEach((row, index) => {
      const stateNames = {
        'WV': 'West Virginia',
        'PA': 'Pennsylvania',
        'VA': 'Virginia',
        'NC': 'North Carolina',
        'SC': 'South Carolina',
        'TN': 'Tennessee',
        'KY': 'Kentucky',
        'OH': 'Ohio',
        'MD': 'Maryland',
        'GA': 'Georgia',
        'AL': 'Alabama',
        'NY': 'New York'
      };
      const status = row.state === 'WV' ? ' (NEWLY ADDED)' : '';
      console.log(`  ${index + 1}. ${stateNames[row.state] || row.state}: ${row.count} facilities${status}`);
    });
    
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
    
    // Show final coverage percentage
    const coveragePercent = (statesCount/50*100).toFixed(1);
    console.log(`\n🏁 HISTORIC COVERAGE MILESTONE:`);
    console.log(`📊 ${coveragePercent}% of America covered with ${finalCount} facilities`);
    console.log(`🎯 ${50 - statesCount} states remaining for complete domination`);
    
    if (coveragePercent >= 94) {
      console.log(`🚀 FINAL PUSH - OVER 94% AMERICA COVERAGE ACHIEVED! 🚀`);
    }
    
  } catch (error) {
    console.error('❌ West Virginia integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateWestVirginiaData().catch(console.error);