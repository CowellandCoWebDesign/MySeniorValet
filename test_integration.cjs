const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testIntegration() {
  console.log('🧪 Testing database integration...');
  
  // Test with a single facility
  const testFacility = {
    name: 'Test Senior Living Center',
    address: '123 Main Street',
    city: 'Miami',
    state: 'FL',
    zip_code: '33101',
    phone: '(305) 555-0123',
    website: 'https://test-senior-living.com',
    facility_type: 'Senior Living',
    care_types: ['Assisted Living', 'Memory Care'],
    capacity: 50,
    latitude: 25.7617,
    longitude: -80.1918,
    data_source: 'Florida Agency for Health Care Administration'
  };
  
  try {
    const query = `
      INSERT INTO communities (
        name, address, city, state, zip_code, phone, website, 
        facility_type, care_types, capacity, latitude, longitude,
        data_source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    `;
    
    const values = [
      testFacility.name,
      testFacility.address,
      testFacility.city,
      testFacility.state,
      testFacility.zip_code,
      testFacility.phone,
      testFacility.website,
      testFacility.facility_type,
      testFacility.care_types,
      testFacility.capacity,
      testFacility.latitude,
      testFacility.longitude,
      testFacility.data_source
    ];
    
    await pool.query(query, values);
    console.log('✅ Test facility inserted successfully');
    
    // Check total count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`📊 Total communities: ${countResult.rows[0].total}`);
    
    // Check if FL state exists now
    const flResult = await pool.query('SELECT COUNT(*) as fl_count FROM communities WHERE state = $1', ['FL']);
    console.log(`🌴 Florida communities: ${flResult.rows[0].fl_count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testIntegration().finally(() => {
  pool.end();
});