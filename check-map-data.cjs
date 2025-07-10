const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
require('dotenv').config();

neonConfig.webSocketConstructor = ws;

async function checkMapData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Checking community map data...\n');
    
    // Check total communities
    const totalResult = await pool.query('SELECT COUNT(*) FROM communities');
    const total = parseInt(totalResult.rows[0].count);
    console.log(`Total communities: ${total}`);
    
    // Check communities with coordinates
    const withCoordsResult = await pool.query(`
      SELECT COUNT(*) FROM communities 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `);
    const withCoords = parseInt(withCoordsResult.rows[0].count);
    console.log(`Communities with coordinates: ${withCoords} (${((withCoords/total)*100).toFixed(1)}%)`);
    
    // Check communities without coordinates
    const withoutCoordsResult = await pool.query(`
      SELECT COUNT(*) FROM communities 
      WHERE latitude IS NULL OR longitude IS NULL
    `);
    const withoutCoords = parseInt(withoutCoordsResult.rows[0].count);
    console.log(`Communities without coordinates: ${withoutCoords} (${((withoutCoords/total)*100).toFixed(1)}%)`);
    
    // Check by state
    console.log('\nBreakdown by state:');
    const stateResult = await pool.query(`
      SELECT 
        state,
        COUNT(*) as total,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coords,
        COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as without_coords
      FROM communities
      GROUP BY state
      ORDER BY total DESC
    `);
    
    stateResult.rows.forEach(row => {
      const pct = ((row.with_coords/row.total)*100).toFixed(1);
      console.log(`${row.state}: ${row.total} total, ${row.with_coords} with coords (${pct}%), ${row.without_coords} without`);
    });
    
    // Check by care type
    console.log('\nCheck specific facility types:');
    const hudResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coords
      FROM communities
      WHERE name LIKE '%HUD%' OR name LIKE '%Section 202%' OR name LIKE '%Section 811%' 
         OR name LIKE '%Housing Authority%' OR name LIKE '%Affordable%'
    `);
    
    if (hudResult.rows[0]) {
      const row = hudResult.rows[0];
      const pct = row.total > 0 ? ((row.with_coords/row.total)*100).toFixed(1) : '0';
      console.log(`HUD/Affordable Housing facilities: ${row.total} total, ${row.with_coords} with coords (${pct}%)`);
    }
    
    // Sample communities without coordinates
    console.log('\nSample communities without coordinates:');
    const sampleResult = await pool.query(`
      SELECT id, name, city, state, care_types
      FROM communities
      WHERE latitude IS NULL OR longitude IS NULL
      LIMIT 10
    `);
    
    sampleResult.rows.forEach(row => {
      console.log(`- ID ${row.id}: ${row.name} in ${row.city}, ${row.state}`);
    });
    
  } catch (error) {
    console.error('Error checking map data:', error);
  } finally {
    await pool.end();
  }
}

checkMapData();