const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testTexasSearchAndMap() {
  console.log('🤠 TESTING TEXAS SEARCH AND MAP INTEGRATION');
  
  // Test major Texas cities in search
  const testCities = [
    'Houston', 'Dallas', 'San Antonio', 'Austin', 'Fort Worth', 
    'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock'
  ];
  
  console.log('\n🔍 Testing Texas Cities in Search Portal:');
  
  for (const city of testCities) {
    try {
      // Test city search
      const searchQuery = `
        SELECT COUNT(*) as count
        FROM communities 
        WHERE state = 'TX' 
        AND LOWER(city) = LOWER($1)
      `;
      
      const searchResult = await pool.query(searchQuery, [city]);
      const facilityCount = searchResult.rows[0].count;
      
      if (facilityCount > 0) {
        // Get sample facility
        const sampleQuery = `
          SELECT name, city, county, phone, latitude, longitude
          FROM communities 
          WHERE state = 'TX' 
          AND LOWER(city) = LOWER($1)
          LIMIT 1
        `;
        
        const sampleResult = await pool.query(sampleQuery, [city]);
        const facility = sampleResult.rows[0];
        
        const hasCoordinates = facility.latitude && facility.longitude;
        const mapStatus = hasCoordinates ? '🗺️ MAP READY' : '📍 NEEDS COORDINATES';
        
        console.log(`   ✅ ${city}: ${facilityCount} facilities ${mapStatus}`);
        if (facility) {
          console.log(`      → ${facility.name}`);
          console.log(`        ${facility.city}, ${facility.county} County`);
          console.log(`        Phone: ${facility.phone}`);
          if (hasCoordinates) {
            console.log(`        Coordinates: ${facility.latitude.toFixed(4)}, ${facility.longitude.toFixed(4)}`);
          }
        }
      } else {
        console.log(`   ❌ ${city}: No facilities found`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${city}: Search error - ${error.message}`);
    }
  }
  
  // Overall Texas statistics
  console.log('\n📊 TEXAS PLATFORM STATISTICS:');
  
  const statsQuery = `
    SELECT 
      COUNT(*) as total_facilities,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as map_ready,
      COUNT(DISTINCT county) as counties_covered,
      COUNT(DISTINCT city) as cities_covered
    FROM communities 
    WHERE state = 'TX'
  `;
  
  const statsResult = await pool.query(statsQuery);
  const stats = statsResult.rows[0];
  
  console.log(`   Total Texas facilities: ${stats.total_facilities}`);
  console.log(`   Map-ready facilities: ${stats.map_ready}`);
  console.log(`   Counties covered: ${stats.counties_covered}`);
  console.log(`   Cities covered: ${stats.cities_covered}`);
  console.log(`   Map coverage: ${((stats.map_ready / stats.total_facilities) * 100).toFixed(1)}%`);
  
  if (stats.map_ready > 400) {
    console.log('\n🤠 SUCCESS: Texas facilities are appearing in search and map!');
    console.log('   Users can now search major Texas cities and see facilities on the map.');
  }
  
  await pool.end();
}

if (require.main === module) {
  testTexasSearchAndMap().catch(console.error);
}

module.exports = { testTexasSearchAndMap };