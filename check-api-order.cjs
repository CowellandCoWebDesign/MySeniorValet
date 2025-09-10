const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkApiOrder() {
  console.log('🔍 CHECKING API RESULT ORDER');
  
  // Check which states are returned in first 2000
  const query = `
    SELECT state, COUNT(*) as count
    FROM (
      SELECT state
      FROM communities
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY id
      LIMIT 2000
    ) as first_2000
    GROUP BY state
    ORDER BY state
  `;
  
  const result = await pool.query(query);
  console.log('\nStates in first 2000 results (by ID order):');
  let total = 0;
  result.rows.forEach(row => {
    console.log(`   ${row.state}: ${row.count} facilities`);
    total += parseInt(row.count);
  });
  console.log(`   Total: ${total}`);
  
  // Check total by state
  const totalQuery = `
    SELECT state, COUNT(*) as count, MIN(id) as min_id, MAX(id) as max_id
    FROM communities
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    GROUP BY state
    ORDER BY MIN(id)
  `;
  
  const totalResult = await pool.query(totalQuery);
  console.log('\nTotal facilities by state (ordered by earliest ID):');
  totalResult.rows.forEach(row => {
    console.log(`   ${row.state}: ${row.count} facilities (IDs ${row.min_id}-${row.max_id})`);
  });
  
  // Check where Hawaii starts
  const hawaiiQuery = `
    SELECT id, name, city
    FROM communities
    WHERE state = 'HI'
    ORDER BY id
    LIMIT 5
  `;
  
  const hawaiiResult = await pool.query(hawaiiQuery);
  console.log('\nFirst Hawaii facilities by ID:');
  hawaiiResult.rows.forEach(row => {
    console.log(`   ID ${row.id}: ${row.name} (${row.city})`);
  });
  
  await pool.end();
}

if (require.main === module) {
  checkApiOrder().catch(console.error);
}

module.exports = { checkApiOrder };