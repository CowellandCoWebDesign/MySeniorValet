const axios = require('axios');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testHawaiiIntegration() {
  console.log('🌺 TESTING HAWAII INTEGRATION');
  
  // Database verification
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN state = 'HI' THEN 1 END) as hawaii,
      COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas,
      COUNT(CASE WHEN state = 'CA' THEN 1 END) as california,
      COUNT(DISTINCT CASE WHEN state = 'HI' THEN county END) as hawaii_counties
    FROM communities
  `;
  
  const stats = await pool.query(statsQuery);
  const counts = stats.rows[0];
  
  console.log('\\n📊 TRUEVIEW DATABASE STATUS:');
  console.log(`   Total Communities: ${counts.total}`);
  console.log(`   🌺 Hawaii: ${counts.hawaii} facilities`);
  console.log(`   🤠 Texas: ${counts.texas} facilities`);
  console.log(`   🌉 California: ${counts.california} facilities`);
  console.log(`   🏝️ Hawaii Counties: ${counts.hawaii_counties}/4`);
  
  // Test Hawaii searches
  const hawaiiCities = [
    'Honolulu',
    'Hilo',
    'Kailua-Kona',
    'Kahului',
    'Lihue',
    'Pearl City',
    'Kailua',
    'Wailuku'
  ];
  
  console.log('\\n🔍 Testing Hawaii Search Results:');
  
  let successCount = 0;
  let totalFound = 0;
  
  for (const city of hawaiiCities) {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/search?location=${city}&limit=5`);
      const communities = response.data;
      const hawaiiCommunities = communities.filter(c => c.state === 'HI');
      
      if (hawaiiCommunities.length > 0) {
        successCount++;
        totalFound += hawaiiCommunities.length;
        console.log(`   ✅ ${city}: ${hawaiiCommunities.length} facilities`);
        if (hawaiiCommunities.length > 0) {
          console.log(`      Example: ${hawaiiCommunities[0].name}`);
        }
      } else {
        console.log(`   ❌ ${city}: No Hawaii facilities found`);
      }
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`   ⏳ ${city}: Rate limited`);
      } else {
        console.log(`   ⚠️  ${city}: ${error.message}`);
      }
    }
  }
  
  console.log(`\\n📈 Hawaii Search Results:`);
  console.log(`   Cities with results: ${successCount}/${hawaiiCities.length}`);
  console.log(`   Total facilities found: ${totalFound}`);
  
  // Show Hawaii facilities by county
  if (counts.hawaii > 0) {
    const hawaiiCountiesQuery = `
      SELECT 
        county,
        COUNT(*) as facilities,
        COUNT(DISTINCT city) as cities
      FROM communities 
      WHERE state = 'HI'
      GROUP BY county
      ORDER BY facilities DESC
    `;
    
    const hawaiiCounties = await pool.query(hawaiiCountiesQuery);
    console.log(`\\n🏝️ Hawaii Coverage by County:`);
    for (const row of hawaiiCounties.rows) {
      console.log(`   ${row.county}: ${row.facilities} facilities in ${row.cities} cities`);
    }
  }
  
  await pool.end();
  console.log('\\n🌺 Aloha! Hawaii integration test complete!');
}

if (require.main === module) {
  testHawaiiIntegration().catch(console.error);
}

module.exports = { testHawaiiIntegration };