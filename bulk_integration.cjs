const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const FILES_TO_INTEGRATE = [
  { file: 'florida_complete_facilities_20250712_023007.csv', state: 'FL' },
  { file: 'georgia_complete_facilities_20250712_023233.csv', state: 'GA' },
  { file: 'alabama_complete_facilities_20250712_023420.csv', state: 'AL' },
  { file: 'mississippi_complete_facilities_20250712_024244.csv', state: 'MS' },
  { file: 'louisiana_complete_facilities_20250712_024415.csv', state: 'LA' },
  { file: 'tennessee_complete_facilities_20250712_024611.csv', state: 'TN' }
];

async function bulkIntegration() {
  console.log('🚀 Starting bulk integration of new state facilities...');
  
  for (const { file, state } of FILES_TO_INTEGRATE) {
    // Check if state already has data
    const existingResult = await pool.query('SELECT COUNT(*) as count FROM communities WHERE state = $1', [state]);
    const existingCount = parseInt(existingResult.rows[0].count);
    
    if (existingCount > 50) {
      console.log(`✅ ${state} already has ${existingCount} communities - skipping`);
      continue;
    }
    
    if (!fs.existsSync(file)) {
      console.log(`⚠️  File not found: ${file}`);
      continue;
    }
    
    console.log(`📄 Processing ${file} for ${state}...`);
    
    const facilities = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(file)
        .pipe(csv())
        .on('data', (row) => {
          facilities.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${facilities.length} facilities in ${file}`);
    
    // Bulk insert with single query
    await bulkInsert(facilities, state);
    
    console.log(`✅ Integrated ${facilities.length} facilities for ${state}`);
  }
  
  // Final verification
  const finalResult = await pool.query('SELECT COUNT(*) as total FROM communities');
  console.log(`🎉 Integration complete! Total communities: ${finalResult.rows[0].total}`);
  
  // Show new state breakdown
  const stateBreakdown = await pool.query(`
    SELECT state, COUNT(*) as count 
    FROM communities 
    WHERE state IN ('FL', 'GA', 'AL', 'MS', 'LA', 'TN')
    GROUP BY state 
    ORDER BY state
  `);
  
  console.log('\n📊 New States Integration Summary:');
  stateBreakdown.rows.forEach(row => {
    console.log(`   ${row.state}: ${row.count} communities`);
  });
}

async function bulkInsert(facilities, state) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Prepare bulk insert query
    const values = [];
    const placeholders = [];
    let paramIndex = 1;
    
    for (const facility of facilities) {
      placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, NOW(), NOW())`);
      
      values.push(
        facility.name,
        facility.address,
        facility.city,
        facility.state,
        facility.zip,
        facility.phone,
        facility.website,
        'Senior Living',
        facility.careTypes ? facility.careTypes.split(', ') : [],
        parseInt(facility.capacity) || 0,
        parseFloat(facility.latitude),
        parseFloat(facility.longitude),
        facility.dataSource
      );
    }
    
    const query = `
      INSERT INTO communities (
        name, address, city, state, zip_code, phone, website, 
        facility_type, care_types, capacity, latitude, longitude,
        data_source, created_at, updated_at
      ) VALUES ${placeholders.join(', ')}
    `;
    
    await client.query(query, values);
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error inserting facilities for ${state}:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run integration
bulkIntegration().catch(console.error).finally(() => {
  pool.end();
});