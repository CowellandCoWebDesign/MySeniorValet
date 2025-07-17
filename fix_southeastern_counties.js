import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixSoutheasternCounties() {
  try {
    console.log('🔧 FIXING SOUTHEASTERN STATES COUNTY DATA...');
    
    // Load all four state datasets
    console.log('📊 Loading state county data...');
    const alabamaData = JSON.parse(fs.readFileSync('alabama_complete_facilities_20250712_023420.json', 'utf8'));
    const tennesseeData = JSON.parse(fs.readFileSync('tennessee_complete_facilities_20250712_024611.json', 'utf8'));
    const mississippiData = JSON.parse(fs.readFileSync('mississippi_complete_facilities_20250712_024244.json', 'utf8'));
    const louisianData = JSON.parse(fs.readFileSync('louisiana_complete_facilities_20250712_024415.json', 'utf8'));
    
    let alabamaUpdated = 0;
    let tennesseeUpdated = 0;
    let mississippiUpdated = 0;
    let louisianaUpdated = 0;
    
    // Fix Alabama counties
    console.log('🏈 Updating Alabama counties...');
    for (const facility of alabamaData) {
      if (facility.county) {
        try {
          const result = await pool.query(
            'UPDATE communities SET county = $1 WHERE state = $2 AND name = $3 AND city = $4',
            [facility.county, 'AL', facility.name, facility.city]
          );
          
          if (result.rowCount > 0) {
            alabamaUpdated++;
          }
        } catch (error) {
          console.error(`Error updating Alabama ${facility.name}:`, error.message);
        }
      }
    }
    
    // Fix Tennessee counties
    console.log('🎵 Updating Tennessee counties...');
    for (const facility of tennesseeData) {
      if (facility.county) {
        try {
          const result = await pool.query(
            'UPDATE communities SET county = $1 WHERE state = $2 AND name = $3 AND city = $4',
            [facility.county, 'TN', facility.name, facility.city]
          );
          
          if (result.rowCount > 0) {
            tennesseeUpdated++;
          }
        } catch (error) {
          console.error(`Error updating Tennessee ${facility.name}:`, error.message);
        }
      }
    }
    
    // Fix Mississippi counties
    console.log('🏛️ Updating Mississippi counties...');
    for (const facility of mississippiData) {
      if (facility.county) {
        try {
          const result = await pool.query(
            'UPDATE communities SET county = $1 WHERE state = $2 AND name = $3 AND city = $4',
            [facility.county, 'MS', facility.name, facility.city]
          );
          
          if (result.rowCount > 0) {
            mississippiUpdated++;
          }
        } catch (error) {
          console.error(`Error updating Mississippi ${facility.name}:`, error.message);
        }
      }
    }
    
    // Fix Louisiana parishes (stored as counties in our system)
    console.log('🎷 Updating Louisiana parishes...');
    for (const facility of louisianData) {
      if (facility.parish) {
        try {
          const result = await pool.query(
            'UPDATE communities SET county = $1 WHERE state = $2 AND name = $3 AND city = $4',
            [facility.parish, 'LA', facility.name, facility.city]
          );
          
          if (result.rowCount > 0) {
            louisianaUpdated++;
          }
        } catch (error) {
          console.error(`Error updating Louisiana ${facility.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 SOUTHEASTERN COUNTY DATA UPDATE COMPLETE!`);
    console.log(`🏈 Alabama: ${alabamaUpdated} counties updated`);
    console.log(`🎵 Tennessee: ${tennesseeUpdated} counties updated`);
    console.log(`🏛️ Mississippi: ${mississippiUpdated} counties updated`);
    console.log(`🎷 Louisiana: ${louisianaUpdated} parishes updated`);
    
    // Verify each state's county coverage
    const states = [
      { code: 'AL', name: 'Alabama', emoji: '🏈' },
      { code: 'TN', name: 'Tennessee', emoji: '🎵' },
      { code: 'MS', name: 'Mississippi', emoji: '🏛️' },
      { code: 'LA', name: 'Louisiana', emoji: '🎷' }
    ];
    
    for (const state of states) {
      const counties = await pool.query(`
        SELECT county, COUNT(*) as count
        FROM communities 
        WHERE state = $1 AND county IS NOT NULL
        GROUP BY county 
        ORDER BY count DESC
      `, [state.code]);
      
      console.log(`\n${state.emoji} ${state.name} County Coverage: ${counties.rows.length} counties`);
      counties.rows.slice(0, 8).forEach(row => {
        console.log(`  - ${row.county}: ${row.count} facilities`);
      });
    }
    
    // Check total database
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`\n🌍 Total database communities: ${totalResult.rows[0].total}`);
    
    // Final verification - check all states with county data
    const allStatesCounties = await pool.query(`
      SELECT state, COUNT(DISTINCT county) as counties_covered
      FROM communities 
      WHERE county IS NOT NULL 
      GROUP BY state 
      ORDER BY counties_covered DESC
    `);
    
    console.log(`\n🗺️ ALL STATES COUNTY COVERAGE:`);
    allStatesCounties.rows.forEach(row => {
      console.log(`  - ${row.state}: ${row.counties_covered} counties`);
    });
    
  } catch (error) {
    console.error('❌ Southeastern county update failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the fix
fixSoutheasternCounties().catch(console.error);