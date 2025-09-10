const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const axios = require('axios');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testStatewideTexasCoverage() {
  console.log('🔍 TESTING TEXAS STATEWIDE COVERAGE');
  
  // Database statistics
  const statsQuery = `
    SELECT 
      COUNT(*) as total_texas,
      COUNT(DISTINCT county) as counties,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'TX'
  `;
  
  const stats = await pool.query(statsQuery);
  const texasStats = stats.rows[0];
  
  console.log('\n📊 Texas Statewide Coverage:');
  console.log(`   Total TX Communities: ${texasStats.total_texas}`);
  console.log(`   Counties Covered: ${texasStats.counties}/254`);
  console.log(`   Cities Covered: ${texasStats.cities}`);
  console.log(`   Coverage Percentage: ${((texasStats.counties/254)*100).toFixed(1)}%`);
  
  // Test rural areas
  const ruralCounties = ['Loving', 'King', 'Kenedy', 'Roberts', 'McMullen', 'Borden', 'Terrell', 'Sterling'];
  
  console.log('\n🏞️ Testing Rural County Coverage:');
  for (const county of ruralCounties) {
    const countyQuery = `
      SELECT COUNT(*) as count, STRING_AGG(DISTINCT city, ', ') as cities
      FROM communities 
      WHERE state = 'TX' AND county = $1
    `;
    
    const result = await pool.query(countyQuery, [county]);
    const count = result.rows[0].count;
    const cities = result.rows[0].cities || 'None';
    
    console.log(`   ${county} County: ${count} facilities (${cities})`);
  }
  
  // Test search functionality for diverse areas
  const testLocations = [
    'Alpine', 'Marfa', 'Pecos', 'Big Spring', 'Brownwood', 'Palestine', 
    'Nacogdoches', 'Lufkin', 'Marshall', 'Paris', 'Sherman', 'Denton'
  ];
  
  console.log('\n🔍 Testing Search Portal for Diverse Texas Cities:');
  
  for (const location of testLocations) {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/search?location=${location}&limit=5`);
      const communities = response.data;
      const texasCommunities = communities.filter(c => c.state === 'TX');
      
      console.log(`   ${location}: ${texasCommunities.length} TX facilities found`);
      
      if (texasCommunities.length > 0) {
        console.log(`     Example: ${texasCommunities[0].name}`);
      }
    } catch (error) {
      console.log(`   ${location}: Search error - ${error.message}`);
    }
  }
  
  // County coverage summary
  const coverageQuery = `
    SELECT 
      county,
      COUNT(*) as facilities,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'TX' AND county != ''
    GROUP BY county
    ORDER BY facilities DESC
    LIMIT 15
  `;
  
  const coverageStats = await pool.query(coverageQuery);
  console.log('\n📍 Top 15 Counties by Facility Count:');
  for (const row of coverageStats.rows) {
    console.log(`   ${row.county}: ${row.facilities} facilities across ${row.cities} cities`);
  }
  
  // Regional distribution
  const regionQuery = `
    SELECT 
      CASE 
        WHEN county IN ('Harris', 'Fort Bend', 'Montgomery', 'Galveston', 'Brazoria', 'Liberty', 'Chambers', 'Waller') THEN 'Houston Metro'
        WHEN county IN ('Dallas', 'Collin', 'Denton', 'Tarrant', 'Rockwall', 'Kaufman', 'Ellis') THEN 'Dallas-Fort Worth'
        WHEN county IN ('Travis', 'Williamson', 'Hays', 'Caldwell', 'Bastrop') THEN 'Austin Metro'
        WHEN county IN ('Bexar', 'Guadalupe', 'Comal', 'Wilson', 'Medina') THEN 'San Antonio Metro'
        WHEN county IN ('El Paso', 'Hudspeth', 'Culberson') THEN 'West Texas'
        WHEN county IN ('Hidalgo', 'Cameron', 'Starr', 'Webb', 'Zapata') THEN 'South Texas Border'
        ELSE 'Rural/Other'
      END as region,
      COUNT(*) as facilities
    FROM communities 
    WHERE state = 'TX' AND county != ''
    GROUP BY 
      CASE 
        WHEN county IN ('Harris', 'Fort Bend', 'Montgomery', 'Galveston', 'Brazoria', 'Liberty', 'Chambers', 'Waller') THEN 'Houston Metro'
        WHEN county IN ('Dallas', 'Collin', 'Denton', 'Tarrant', 'Rockwall', 'Kaufman', 'Ellis') THEN 'Dallas-Fort Worth'
        WHEN county IN ('Travis', 'Williamson', 'Hays', 'Caldwell', 'Bastrop') THEN 'Austin Metro'
        WHEN county IN ('Bexar', 'Guadalupe', 'Comal', 'Wilson', 'Medina') THEN 'San Antonio Metro'
        WHEN county IN ('El Paso', 'Hudspeth', 'Culberson') THEN 'West Texas'
        WHEN county IN ('Hidalgo', 'Cameron', 'Starr', 'Webb', 'Zapata') THEN 'South Texas Border'
        ELSE 'Rural/Other'
      END
    ORDER BY facilities DESC
  `;
  
  const regionStats = await pool.query(regionQuery);
  console.log('\n🌍 Texas Regional Distribution:');
  for (const row of regionStats.rows) {
    console.log(`   ${row.region}: ${row.facilities} facilities`);
  }
  
  await pool.end();
  console.log('\n✅ Statewide coverage test complete!');
}

if (require.main === module) {
  testStatewideTexasCoverage().catch(console.error);
}

module.exports = { testStatewideTexasCoverage };