const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkHawaiiCoordinates() {
  console.log('🌺 CHECKING HAWAII COORDINATES');
  
  // Get sample Hawaii facilities with coordinates
  const query = `
    SELECT id, name, city, county, latitude, longitude
    FROM communities 
    WHERE state = 'HI'
    LIMIT 10
  `;
  
  const result = await pool.query(query);
  console.log(`\nSample Hawaii facilities:`);
  result.rows.forEach(f => {
    console.log(`   ${f.name} (${f.city})`);
    if (f.latitude && f.longitude) {
      console.log(`   Coordinates: ${f.latitude}, ${f.longitude}`);
    } else {
      console.log(`   NO COORDINATES`);
    }
  });
  
  // Check coordinate ranges
  const rangeQuery = `
    SELECT 
      MIN(CAST(latitude AS FLOAT)) as min_lat,
      MAX(CAST(latitude AS FLOAT)) as max_lat,
      MIN(CAST(longitude AS FLOAT)) as min_lng,
      MAX(CAST(longitude AS FLOAT)) as max_lng,
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_coords
    FROM communities 
    WHERE state = 'HI'
  `;
  
  const rangeResult = await pool.query(rangeQuery);
  const range = rangeResult.rows[0];
  
  console.log(`\nHawaii statistics:`);
  console.log(`   Total facilities: ${range.total}`);
  console.log(`   With coordinates: ${range.with_coords}`);
  
  if (range.min_lat) {
    console.log(`\nCoordinate ranges:`);
    console.log(`   Latitude: ${range.min_lat} to ${range.max_lat}`);
    console.log(`   Longitude: ${range.min_lng} to ${range.max_lng}`);
    
    // Hawaii should be around lat: 19-22, lng: -160 to -155
    console.log(`\nExpected Hawaii ranges:`);
    console.log(`   Latitude: 19 to 22`);
    console.log(`   Longitude: -160 to -155`);
    
    // Check if coordinates are in wrong format
    if (range.min_lng > 0) {
      console.log(`\n⚠️ WARNING: Longitude values are positive! Hawaii should have negative longitude.`);
      console.log(`   This suggests coordinates may be stored incorrectly.`);
    }
  }
  
  await pool.end();
}

if (require.main === module) {
  checkHawaiiCoordinates().catch(console.error);
}

module.exports = { checkHawaiiCoordinates };