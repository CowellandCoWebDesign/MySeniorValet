import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateDelawareVermontData() {
  try {
    console.log('💎🏔️ DELAWARE & VERMONT DATABASE INTEGRATION STARTING...');
    
    // Load Delaware data
    const deData = JSON.parse(fs.readFileSync('delaware_complete_facilities_20250717_161611.json', 'utf8'));
    console.log(`📊 Loaded ${deData.length} Delaware facilities`);
    
    // Load Vermont data
    const vtData = JSON.parse(fs.readFileSync('vermont_complete_facilities_20250717_161612.json', 'utf8'));
    console.log(`📊 Loaded ${vtData.length} Vermont facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Delaware facilities
    console.log('💎 Processing Delaware facilities...');
    for (const facility of deData) {
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
        console.error(`❌ Error inserting Delaware ${facility.name}:`, error.message);
      }
    }
    
    // Process Vermont facilities
    console.log('🏔️ Processing Vermont facilities...');
    for (const facility of vtData) {
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
        console.error(`❌ Error inserting Vermont ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 DELAWARE & VERMONT INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Delaware data in database
    const deResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'DE'
    `);
    
    console.log(`\n💎 DELAWARE DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${deResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${deResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${deResult.rows[0].cities_covered}`);
    
    // Verify Vermont data in database
    const vtResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'VT'
    `);
    
    console.log(`\n🏔️ VERMONT DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${vtResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${vtResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${vtResult.rows[0].cities_covered}`);
    
    // Show Delaware major metro coverage
    const deMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'DE' AND city IN ('Wilmington', 'Newark', 'Dover', 'Middletown', 'Seaford', 'Georgetown', 'Rehoboth Beach', 'Lewes', 'Smyrna', 'Milford')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n💎 DELAWARE MAJOR METRO COVERAGE:`);
    deMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show Vermont major metro coverage
    const vtMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'VT' AND city IN ('Burlington', 'Montpelier', 'Rutland', 'Brattleboro', 'South Burlington', 'Barre', 'St. Johnsbury', 'Newport', 'Bennington', 'Manchester')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏔️ VERMONT MAJOR METRO COVERAGE:`);
    vtMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Update total database count
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`\n🌍 TOTAL DATABASE COMMUNITIES: ${totalResult.rows[0].total}`);
    
    // Check if we've crossed 18,000 milestone
    const totalCount = parseInt(totalResult.rows[0].total);
    if (totalCount >= 18000) {
      console.log(`\n🎯 🎉 HISTORIC 18,000 MILESTONE ACHIEVED! 🎉 🎯`);
      console.log(`🌟 MySeniorValet now serves ${totalCount} communities!`);
    }
    
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
    
    // Show Northeast expansion progress
    const northeastResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('CT', 'MA', 'RI', 'VT', 'NH', 'ME', 'NY', 'NJ', 'PA', 'DE', 'MD')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏢 NORTHEAST CORRIDOR EXPANSION:`);
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
    
    // Show small states achievement
    const smallStatesResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('DE', 'VT', 'NH', 'RI', 'CT', 'HI', 'WY', 'MT', 'ND', 'SD', 'AK')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏛️  SMALL STATES STRATEGIC POSITIONING:`);
    smallStatesResult.rows.forEach((row, index) => {
      const stateNames = {
        'DE': 'Delaware',
        'VT': 'Vermont',
        'NH': 'New Hampshire',
        'RI': 'Rhode Island',
        'CT': 'Connecticut',
        'HI': 'Hawaii',
        'WY': 'Wyoming',
        'MT': 'Montana',
        'ND': 'North Dakota',
        'SD': 'South Dakota',
        'AK': 'Alaska'
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
    
    // Final milestone check
    const finalCount = parseInt(nationalResult.rows[0].total_facilities);
    const statesCount = parseInt(nationalResult.rows[0].states_covered);
    
    console.log(`\n🎯 EXPANSION MOMENTUM SUMMARY:`);
    console.log(`🚀 Total facilities: ${finalCount}`);
    console.log(`🌟 States covered: ${statesCount}/50 (${(statesCount/50*100).toFixed(1)}%)`);
    console.log(`🎖️  Remaining states: ${50 - statesCount}`);
    
    if (finalCount >= 18000) {
      console.log(`\n🎉 HISTORIC 18,000 MILESTONE ACHIEVED! 🎉`);
      console.log(`🌟 MySeniorValet leads America in senior living coverage!`);
    }
    
  } catch (error) {
    console.error('❌ Delaware & Vermont integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateDelawareVermontData().catch(console.error);