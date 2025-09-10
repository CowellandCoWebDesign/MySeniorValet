const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const axios = require('axios');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testTexasSearchIntegration() {
  console.log('🔍 TESTING TEXAS SEARCH INTEGRATION');
  
  // Test database status
  const statsQuery = `
    SELECT 
      state,
      COUNT(*) as count,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state IN ('TX', 'CA')
    GROUP BY state
    ORDER BY count DESC
  `;
  
  const stats = await pool.query(statsQuery);
  console.log('\n📊 Database Status:');
  for (const row of stats.rows) {
    console.log(`   ${row.state}: ${row.count} communities across ${row.cities} cities`);
  }
  
  // Test major Texas cities
  const texasCities = ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'];
  
  console.log('\n🏙️ Testing Texas City Searches:');
  
  for (const city of texasCities) {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/search?location=${city}&limit=10`);
      const communities = response.data;
      const texasCommunities = communities.filter(c => c.state === 'TX');
      
      console.log(`   ${city}: ${texasCommunities.length} TX communities found`);
      
      if (texasCommunities.length > 0) {
        console.log(`     Sample: ${texasCommunities[0].name}`);
      }
    } catch (error) {
      console.error(`   ${city}: Error - ${error.message}`);
    }
  }
  
  // Test state-based search
  console.log('\n🤠 Testing State-based Search:');
  try {
    const response = await axios.get(`http://localhost:5000/api/communities/search?location=TX&limit=20`);
    const communities = response.data;
    console.log(`   Texas state search: ${communities.length} communities returned`);
  } catch (error) {
    console.error(`   Texas state search error: ${error.message}`);
  }
  
  // Show top Texas communities by county
  const countyQuery = `
    SELECT 
      county,
      COUNT(*) as count,
      STRING_AGG(DISTINCT city, ', ') as cities
    FROM communities 
    WHERE state = 'TX' AND county != ''
    GROUP BY county
    ORDER BY count DESC
    LIMIT 8
  `;
  
  const countyStats = await pool.query(countyQuery);
  console.log('\n📍 Texas Counties with Most Communities:');
  for (const row of countyStats.rows) {
    console.log(`   ${row.county}: ${row.count} communities`);
    console.log(`     Cities: ${row.cities}`);
  }
  
  await pool.end();
  console.log('\n✅ Texas search integration test complete!');
}

if (require.main === module) {
  testTexasSearchIntegration().catch(console.error);
}

module.exports = { testTexasSearchIntegration };