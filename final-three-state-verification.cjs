const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifyThreeStatesCoverage() {
  console.log('🌟 FINAL THREE-STATE VERIFICATION');
  console.log('================================\n');
  
  // Overall statistics
  const overallQuery = `
    SELECT 
      state,
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates,
      COUNT(DISTINCT city) as cities,
      COUNT(DISTINCT county) as counties
    FROM communities 
    WHERE state IN ('CA', 'TX', 'HI')
    GROUP BY state
    ORDER BY state
  `;
  
  const overallResult = await pool.query(overallQuery);
  
  let grandTotal = 0;
  let grandWithCoords = 0;
  
  console.log('📊 STATE-BY-STATE BREAKDOWN:\n');
  
  overallResult.rows.forEach(row => {
    const stateName = row.state === 'CA' ? 'California' : 
                     row.state === 'TX' ? 'Texas' : 'Hawaii';
    const emoji = row.state === 'CA' ? '🐻' : 
                  row.state === 'TX' ? '🤠' : '🌺';
    
    console.log(`${emoji} ${stateName}:`);
    console.log(`   Total facilities: ${row.total}`);
    console.log(`   With coordinates: ${row.with_coordinates}`);
    console.log(`   Map coverage: ${((row.with_coordinates / row.total) * 100).toFixed(1)}%`);
    console.log(`   Cities: ${row.cities}`);
    console.log(`   Counties: ${row.counties}`);
    console.log('');
    
    grandTotal += parseInt(row.total);
    grandWithCoords += parseInt(row.with_coordinates);
  });
  
  console.log('🎯 GRAND TOTAL:');
  console.log(`   Total facilities: ${grandTotal}`);
  console.log(`   With coordinates: ${grandWithCoords}`);
  console.log(`   Overall coverage: ${((grandWithCoords / grandTotal) * 100).toFixed(1)}%`);
  
  // Test searches for major cities
  console.log('\n🔍 TESTING MAJOR CITY SEARCHES:\n');
  
  const testCities = [
    { city: 'Los Angeles', state: 'CA' },
    { city: 'San Francisco', state: 'CA' },
    { city: 'Houston', state: 'TX' },
    { city: 'Dallas', state: 'TX' },
    { city: 'Honolulu', state: 'HI' }
  ];
  
  for (const test of testCities) {
    const searchQuery = `
      SELECT COUNT(*) as count
      FROM communities 
      WHERE state = $1 
      AND city = $2
    `;
    
    const searchResult = await pool.query(searchQuery, [test.state, test.city]);
    const count = searchResult.rows[0].count;
    console.log(`   ✅ ${test.city}, ${test.state}: ${count} facilities`);
  }
  
  if (grandWithCoords === grandTotal) {
    console.log('\n🎉 CONGRATULATIONS! 🎉');
    console.log('ALL THREE STATES ARE 100% COMPLETE!');
    console.log(`${grandTotal} facilities across California, Texas, and Hawaii`);
    console.log('are now fully searchable and visible on the interactive map!');
  }
  
  await pool.end();
}

if (require.main === module) {
  verifyThreeStatesCoverage().catch(console.error);
}

module.exports = { verifyThreeStatesCoverage };