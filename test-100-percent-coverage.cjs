const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const axios = require('axios');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test100PercentCoverage() {
  console.log('🎯 TESTING 100% TEXAS COUNTY COVERAGE');
  
  // Database verification
  const statsQuery = `
    SELECT 
      COUNT(*) as total_texas,
      COUNT(DISTINCT county) as counties_covered,
      COUNT(DISTINCT city) as cities_covered,
      ROUND((COUNT(DISTINCT county) * 100.0 / 254), 1) as coverage_percent
    FROM communities 
    WHERE state = 'TX' AND county != ''
  `;
  
  const stats = await pool.query(statsQuery);
  const coverage = stats.rows[0];
  
  console.log('\\n📊 FINAL TEXAS COVERAGE STATS:');
  console.log(`   Total Communities: ${coverage.total_texas}`);
  console.log(`   Counties Covered: ${coverage.counties_covered}/254`);
  console.log(`   Cities Covered: ${coverage.cities_covered}`);
  console.log(`   Coverage Percentage: ${coverage.coverage_percent}%`);
  
  if (coverage.coverage_percent >= 100) {
    console.log('\\n🎉 100% TEXAS COUNTY COVERAGE ACHIEVED!');
  } else {
    console.log(`\\n⚠️  Need ${254 - coverage.counties_covered} more counties for 100%`);
  }
  
  // Test newly added counties
  const newCountiesQuery = `
    SELECT 
      county,
      COUNT(*) as facilities,
      COUNT(DISTINCT city) as cities
    FROM communities 
    WHERE state = 'TX' AND county IN (
      'Somervell', 'Starr', 'Stephens', 'Sterling', 'Stonewall', 'Sutton', 'Swisher',
      'Taylor', 'Terrell', 'Terry', 'Throckmorton', 'Titus', 'Tom Green', 'Trinity',
      'Tyler', 'Upshur', 'Upton', 'Uvalde', 'Val Verde', 'Van Zandt', 'Victoria',
      'Walker', 'Waller', 'Ward', 'Washington', 'Wharton', 'Wheeler', 'Wichita',
      'Wilbarger', 'Willacy', 'Wilson', 'Winkler', 'Wise', 'Wood', 'Yoakum',
      'Young', 'Zapata', 'Zavala'
    )
    GROUP BY county
    ORDER BY facilities DESC
  `;
  
  const newCounties = await pool.query(newCountiesQuery);
  console.log('\\n📍 Newly Added Counties:');
  for (const row of newCounties.rows) {
    console.log(`   ${row.county}: ${row.facilities} facilities in ${row.cities} cities`);
  }
  
  // Test search functionality for new counties
  const testCities = [
    'Abilene',      // Taylor County
    'San Angelo',   // Tom Green County 
    'Victoria',     // Victoria County
    'Wichita Falls', // Wichita County
    'Del Rio',      // Val Verde County
    'Huntsville',   // Walker County
    'Brenham',      // Washington County
    'Decatur',      // Wise County
    'Glen Rose',    // Somervell County
    'Mount Pleasant' // Titus County
  ];
  
  console.log('\\n🔍 Testing Search for New Counties:');
  
  for (const city of testCities) {
    try {
      const response = await axios.get(`http://localhost:5000/api/communities/search?location=${city}&limit=5`);
      const communities = response.data;
      const texasCommunities = communities.filter(c => c.state === 'TX');
      
      if (texasCommunities.length > 0) {
        console.log(`   ✅ ${city}: ${texasCommunities.length} TX facilities`);
        console.log(`      Example: ${texasCommunities[0].name} (${texasCommunities[0].county} County)`);
      } else {
        console.log(`   ❌ ${city}: No TX facilities found`);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`   ⏳ ${city}: Rate limited (system working)`);
      } else {
        console.log(`   ⚠️  ${city}: ${error.message}`);
      }
    }
  }
  
  // Overall database stats
  const totalQuery = `SELECT COUNT(*) as total, COUNT(CASE WHEN state = 'TX' THEN 1 END) as texas, COUNT(CASE WHEN state = 'CA' THEN 1 END) as california FROM communities`;
  const totalStats = await pool.query(totalQuery);
  const total = totalStats.rows[0];
  
  console.log('\\n🌟 TRUEVIEW TOTAL DATABASE:');
  console.log(`   Total Communities: ${total.total}`);
  console.log(`   Texas Communities: ${total.texas}`);
  console.log(`   California Communities: ${total.california}`);
  
  await pool.end();
  console.log('\\n✅ 100% Coverage test complete!');
}

if (require.main === module) {
  test100PercentCoverage().catch(console.error);
}

module.exports = { test100PercentCoverage };