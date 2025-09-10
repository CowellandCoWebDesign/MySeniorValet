const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkHudVash() {
  console.log('🏠 Checking HUD-VASH Integration');
  
  // Check total HUD-VASH facilities
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM communities WHERE facility_type = 'HUD-VASH'"
  );
  console.log(`\nTotal HUD-VASH facilities: ${countResult.rows[0].count}`);
  
  // List all HUD-VASH facilities
  const facilitiesResult = await pool.query(
    "SELECT name, city, state, phone, website FROM communities WHERE facility_type = 'HUD-VASH' ORDER BY state, city"
  );
  
  console.log('\nHUD-VASH Facilities by State:');
  let currentState = '';
  facilitiesResult.rows.forEach(facility => {
    if (facility.state !== currentState) {
      currentState = facility.state;
      console.log(`\n${currentState}:`);
    }
    console.log(`  - ${facility.name}`);
    console.log(`    ${facility.city}, ${facility.state}`);
    console.log(`    📞 ${facility.phone}`);
    console.log(`    🌐 ${facility.website}`);
  });
  
  // Check if Veterans Housing care type is searchable
  const veteransResult = await pool.query(
    "SELECT COUNT(*) FROM communities WHERE 'Veterans Housing' = ANY(care_types)"
  );
  console.log(`\n✅ Communities with 'Veterans Housing' care type: ${veteransResult.rows[0].count}`);
  
  await pool.end();
}

checkHudVash().catch(console.error);
