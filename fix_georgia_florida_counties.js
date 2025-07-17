import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixGeorgiaFloridaCounties() {
  try {
    console.log('🔧 FIXING GEORGIA AND FLORIDA COUNTY DATA...');
    
    // Load Georgia data
    console.log('📊 Loading Georgia county data...');
    const georgiaData = JSON.parse(fs.readFileSync('georgia_complete_facilities_20250712_023233.json', 'utf8'));
    
    // Load Florida data
    console.log('📊 Loading Florida county data...');
    const floridaData = JSON.parse(fs.readFileSync('florida_complete_facilities_20250712_023007.json', 'utf8'));
    
    let georgiaUpdated = 0;
    let floridaUpdated = 0;
    
    // Fix Georgia counties
    console.log('🍑 Updating Georgia counties...');
    for (const facility of georgiaData) {
      if (facility.county) {
        try {
          const result = await pool.query(
            'UPDATE communities SET county = $1 WHERE state = $2 AND name = $3 AND city = $4',
            [facility.county, 'GA', facility.name, facility.city]
          );
          
          if (result.rowCount > 0) {
            georgiaUpdated++;
          }
        } catch (error) {
          console.error(`Error updating ${facility.name}:`, error.message);
        }
      }
    }
    
    // Fix Florida counties
    console.log('🌴 Updating Florida counties...');
    for (const facility of floridaData) {
      if (facility.county) {
        try {
          const result = await pool.query(
            'UPDATE communities SET county = $1 WHERE state = $2 AND name = $3 AND city = $4',
            [facility.county, 'FL', facility.name, facility.city]
          );
          
          if (result.rowCount > 0) {
            floridaUpdated++;
          }
        } catch (error) {
          console.error(`Error updating ${facility.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 COUNTY DATA UPDATE COMPLETE!`);
    console.log(`🍑 Georgia: ${georgiaUpdated} counties updated`);
    console.log(`🌴 Florida: ${floridaUpdated} counties updated`);
    
    // Verify Georgia county coverage
    const georgiaCounties = await pool.query(`
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'GA' AND county IS NOT NULL
      GROUP BY county 
      ORDER BY count DESC
    `);
    
    console.log(`\n🍑 Georgia County Coverage: ${georgiaCounties.rows.length} counties`);
    georgiaCounties.rows.slice(0, 10).forEach(row => {
      console.log(`  - ${row.county}: ${row.count} facilities`);
    });
    
    // Verify Florida county coverage
    const floridaCounties = await pool.query(`
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'FL' AND county IS NOT NULL
      GROUP BY county 
      ORDER BY count DESC
    `);
    
    console.log(`\n🌴 Florida County Coverage: ${floridaCounties.rows.length} counties`);
    floridaCounties.rows.slice(0, 10).forEach(row => {
      console.log(`  - ${row.county}: ${row.count} facilities`);
    });
    
    // Check total database
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`\n🌍 Total database communities: ${totalResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ County update failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the fix
fixGeorgiaFloridaCounties().catch(console.error);