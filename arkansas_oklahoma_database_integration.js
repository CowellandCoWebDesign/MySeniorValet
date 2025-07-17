import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateArkansasOklahomaData() {
  try {
    console.log('🐗🤠 ARKANSAS & OKLAHOMA DATABASE INTEGRATION STARTING...');
    
    // Load Arkansas data
    const arData = JSON.parse(fs.readFileSync('arkansas_complete_facilities_20250717_154004.json', 'utf8'));
    console.log(`📊 Loaded ${arData.length} Arkansas facilities`);
    
    // Load Oklahoma data
    const okData = JSON.parse(fs.readFileSync('oklahoma_complete_facilities_20250717_154005.json', 'utf8'));
    console.log(`📊 Loaded ${okData.length} Oklahoma facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Arkansas facilities
    console.log('🐗 Processing Arkansas facilities...');
    for (const facility of arData) {
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
        console.error(`❌ Error inserting Arkansas ${facility.name}:`, error.message);
      }
    }
    
    // Process Oklahoma facilities
    console.log('🤠 Processing Oklahoma facilities...');
    for (const facility of okData) {
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
        console.error(`❌ Error inserting Oklahoma ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 ARKANSAS & OKLAHOMA INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Arkansas data in database
    const arResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'AR'
    `);
    
    console.log(`\n🐗 ARKANSAS DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${arResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${arResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${arResult.rows[0].cities_covered}`);
    
    // Verify Oklahoma data in database
    const okResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'OK'
    `);
    
    console.log(`\n🤠 OKLAHOMA DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${okResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${okResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${okResult.rows[0].cities_covered}`);
    
    // Show Arkansas major metro coverage
    const arMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'AR' AND city IN ('Little Rock', 'Fayetteville', 'Fort Smith', 'Jonesboro', 'Bentonville', 'Conway', 'Hot Springs', 'Pine Bluff')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🐗 ARKANSAS MAJOR METRO COVERAGE:`);
    arMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show Oklahoma major metro coverage
    const okMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'OK' AND city IN ('Oklahoma City', 'Tulsa', 'Norman', 'Lawton', 'Enid', 'Stillwater', 'Muskogee', 'Bartlesville')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🤠 OKLAHOMA MAJOR METRO COVERAGE:`);
    okMetros.rows.forEach((row, index) => {
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
    
    // Show Southern expansion progress
    const southernResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('AR', 'OK', 'TX', 'LA', 'MS', 'AL', 'TN', 'GA', 'FL', 'SC', 'NC', 'VA')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏛️  SOUTHERN CORRIDOR EXPANSION:`);
    southernResult.rows.forEach((row, index) => {
      const stateNames = {
        'AR': 'Arkansas',
        'OK': 'Oklahoma',
        'TX': 'Texas',
        'LA': 'Louisiana',
        'MS': 'Mississippi',
        'AL': 'Alabama',
        'TN': 'Tennessee',
        'GA': 'Georgia',
        'FL': 'Florida',
        'SC': 'South Carolina',
        'NC': 'North Carolina',
        'VA': 'Virginia'
      };
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities`);
    });
    
    // Show Southwest expansion progress
    const southwestResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('OK', 'TX', 'NM', 'AZ', 'NV', 'CA', 'CO', 'UT')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🌵 SOUTHWEST CORRIDOR EXPANSION:`);
    southwestResult.rows.forEach((row, index) => {
      const stateNames = {
        'OK': 'Oklahoma',
        'TX': 'Texas',
        'NM': 'New Mexico',
        'AZ': 'Arizona',
        'NV': 'Nevada',
        'CA': 'California',
        'CO': 'Colorado',
        'UT': 'Utah'
      };
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities`);
    });
    
  } catch (error) {
    console.error('❌ Arkansas & Oklahoma integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateArkansasOklahomaData().catch(console.error);