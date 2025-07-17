import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateMissouriIowaData() {
  try {
    console.log('🐻🌽 MISSOURI & IOWA DATABASE INTEGRATION STARTING...');
    
    // Load Missouri data
    const moData = JSON.parse(fs.readFileSync('missouri_complete_facilities_20250717_152703.json', 'utf8'));
    console.log(`📊 Loaded ${moData.length} Missouri facilities`);
    
    // Load Iowa data
    const iaData = JSON.parse(fs.readFileSync('iowa_complete_facilities_20250717_152737.json', 'utf8'));
    console.log(`📊 Loaded ${iaData.length} Iowa facilities`);
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Process Missouri facilities
    console.log('🐻 Processing Missouri facilities...');
    for (const facility of moData) {
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
        console.error(`❌ Error inserting Missouri ${facility.name}:`, error.message);
      }
    }
    
    // Process Iowa facilities
    console.log('🌽 Processing Iowa facilities...');
    for (const facility of iaData) {
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
        console.error(`❌ Error inserting Iowa ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 MISSOURI & IOWA INTEGRATION COMPLETE!`);
    console.log(`✅ Total inserted: ${totalInserted} facilities`);
    console.log(`⏭️  Total skipped: ${totalSkipped} facilities (already exist)`);
    
    // Verify Missouri data in database
    const moResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'MO'
    `);
    
    console.log(`\n🐻 MISSOURI DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${moResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${moResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${moResult.rows[0].cities_covered}`);
    
    // Verify Iowa data in database
    const iaResult = await pool.query(`
      SELECT 
        COUNT(*) as total_facilities,
        COUNT(DISTINCT county) as counties_covered,
        COUNT(DISTINCT city) as cities_covered
      FROM communities 
      WHERE state = 'IA'
    `);
    
    console.log(`\n🌽 IOWA DATABASE VERIFICATION:`);
    console.log(`📊 Total facilities: ${iaResult.rows[0].total_facilities}`);
    console.log(`🏘️  Counties covered: ${iaResult.rows[0].counties_covered}`);
    console.log(`🏙️  Cities covered: ${iaResult.rows[0].cities_covered}`);
    
    // Show Missouri major metro coverage
    const moMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'MO' AND city IN ('Kansas City', 'Clayton', 'Springfield', 'Columbia', 'Independence', 'St. Joseph', 'Joplin', 'Jefferson City')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🐻 MISSOURI MAJOR METRO COVERAGE:`);
    moMetros.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.city}: ${row.count} facilities`);
    });
    
    // Show Iowa major metro coverage
    const iaMetros = await pool.query(`
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'IA' AND city IN ('Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Waterloo', 'Iowa City', 'Dubuque', 'Ames')
      GROUP BY city 
      ORDER BY count DESC
    `);
    
    console.log(`\n🌽 IOWA MAJOR METRO COVERAGE:`);
    iaMetros.rows.forEach((row, index) => {
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
    
    // Show Midwest dominance
    const midwestResult = await pool.query(`
      SELECT state, COUNT(*) as count
      FROM communities 
      WHERE state IN ('MO', 'IA', 'IL', 'IN', 'OH', 'MI', 'WI', 'MN')
      GROUP BY state 
      ORDER BY count DESC
    `);
    
    console.log(`\n🏭 MIDWEST CORRIDOR DOMINANCE:`);
    midwestResult.rows.forEach((row, index) => {
      const stateNames = {
        'MO': 'Missouri',
        'IA': 'Iowa', 
        'IL': 'Illinois',
        'IN': 'Indiana',
        'OH': 'Ohio',
        'MI': 'Michigan',
        'WI': 'Wisconsin',
        'MN': 'Minnesota'
      };
      console.log(`  ${index + 1}. ${stateNames[row.state]}: ${row.count} facilities`);
    });
    
  } catch (error) {
    console.error('❌ Missouri & Iowa integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateMissouriIowaData().catch(console.error);