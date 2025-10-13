import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateKansasConnecticutData() {
  try {
    console.log('🌾🍂 KANSAS & CONNECTICUT DATABASE INTEGRATION STARTING...');
    
    // Load Kansas data
    const ksData = JSON.parse(fs.readFileSync('kansas_complete_facilities_20250717_155414.json', 'utf8'));
    console.log(`📊 Loaded ${ksData.length} Kansas facilities`);
    
    // Load Connecticut data
    const ctData = JSON.parse(fs.readFileSync('connecticut_complete_facilities_20250717_155425.json', 'utf8'));
    console.log(`📊 Loaded ${ctData.length} Connecticut facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Kansas facilities
    console.log('🌾 Processing Kansas facilities...');
    for (const facility of ksData) {
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
        
        if (totalInserted % 100 === 0) {
          console.log(`📈 Inserted ${totalInserted} facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting Kansas ${facility.name}:`, error.message);
      }
    }
    
    // Process Connecticut facilities
    console.log('🍂 Processing Connecticut facilities...');
    for (const facility of ctData) {
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
        
        if (totalInserted % 100 === 0) {
          console.log(`📈 Inserted ${totalInserted} facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting Connecticut ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 KANSAS & CONNECTICUT INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Kansas data in database
    const ksResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'KS'
    `);
    
    console.log(`\n🌾 KANSAS DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${ksResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${ksResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${ksResult.rows[0].cities_covered}`);
    
    // Verify Connecticut data in database
    const ctResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'CT'
    `);
    
    console.log(`\n🍂 CONNECTICUT DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${ctResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${ctResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${ctResult.rows[0].cities_covered}`);
    
    // Show Kansas major metro coverage
    const ksMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'KS' AND city IN ('Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan', 'Lenexa', 'Salina', 'Hutchinson')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🌾 KANSAS MAJOR METRO COVERAGE:`);
    ksMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show Connecticut major metro coverage
    const ctMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'CT' AND city IN ('Bridgeport', 'Hartford', 'New Haven', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'West Hartford', 'Greenwich')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🍂 CONNECTICUT MAJOR METRO COVERAGE:`);
    ctMetros.rows.forEach((row, index) => {
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
    
    // Show Great Plains expansion progress
    const greatPlainsResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('KS', 'NE', 'OK', 'TX', 'CO', 'NM', 'ND', 'SD', 'MT', 'WY')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🌾 GREAT PLAINS CORRIDOR EXPANSION:`);
    greatPlainsResult.rows.forEach((row, index) => {
      const stateNames = {
        'KS': 'Kansas',
        'NE': 'Nebraska',
        'OK': 'Oklahoma',
        'TX': 'Texas',
        'CO': 'Colorado',
        'NM': 'New Mexico',
        'ND': 'North Dakota',
        'SD': 'South Dakota',
        'MT': 'Montana',
        'WY': 'Wyoming'
      };
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities`);
    });
    
    // Show Northeast expansion progress
    const northeastResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('CT', 'MA', 'RI', 'VT', 'NH', 'ME', 'NY', 'NJ', 'PA')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🍂 NORTHEAST CORRIDOR EXPANSION:`);
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
        'PA': 'Pennsylvania'
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
    
  } catch (error) {
    console.error('❌ Kansas & Connecticut integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateKansasConnecticutData().catch(console.error);