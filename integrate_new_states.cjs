const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const FILES_TO_INTEGRATE = [
  'florida_complete_facilities_20250712_023007.csv',
  'georgia_complete_facilities_20250712_023233.csv',
  'alabama_complete_facilities_20250712_023420.csv',
  'mississippi_complete_facilities_20250712_024244.csv',
  'louisiana_complete_facilities_20250712_024415.csv',
  'tennessee_complete_facilities_20250712_024611.csv'
];

async function integrateFacilities() {
  console.log('🚀 Starting integration of new state facilities...');
  
  let totalIntegrated = 0;
  
  for (const filename of FILES_TO_INTEGRATE) {
    if (!fs.existsSync(filename)) {
      console.log(`⚠️  File not found: ${filename}`);
      continue;
    }
    
    console.log(`📄 Processing ${filename}...`);
    
    const facilities = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (row) => {
          facilities.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${facilities.length} facilities in ${filename}`);
    
    // Insert facilities in batches
    const batchSize = 50;
    for (let i = 0; i < facilities.length; i += batchSize) {
      const batch = facilities.slice(i, i + batchSize);
      await insertBatch(batch);
    }
    
    totalIntegrated += facilities.length;
    console.log(`✅ Integrated ${facilities.length} facilities from ${filename}`);
  }
  
  console.log(`🎉 Integration complete! Total facilities integrated: ${totalIntegrated}`);
  
  // Verify integration
  const result = await pool.query('SELECT COUNT(*) as total FROM communities');
  console.log(`📈 Database now contains ${result.rows[0].total} total communities`);
  
  // Show state breakdown
  const stateBreakdown = await pool.query(`
    SELECT state, COUNT(*) as count 
    FROM communities 
    WHERE state IN ('FL', 'GA', 'AL', 'MS', 'LA', 'TN')
    GROUP BY state 
    ORDER BY count DESC
  `);
  
  console.log('\n📊 New States Integration Summary:');
  stateBreakdown.rows.forEach(row => {
    console.log(`   ${row.state}: ${row.count} communities`);
  });
}

async function insertBatch(facilities) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const facility of facilities) {
      const query = `
        INSERT INTO communities (
          name, address, city, state, zip_code, phone, website, 
          facility_type, care_types, capacity, latitude, longitude,
          data_source, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      `;
      
      // Map all facility types to "Senior Living" to match database constraint
      const mappedFacilityType = 'Senior Living';
      
      const values = [
        facility.name,
        facility.address,
        facility.city,
        facility.state,
        facility.zip,
        facility.phone,
        facility.website,
        mappedFacilityType,
        facility.careTypes ? facility.careTypes.split(', ') : [],
        parseInt(facility.capacity) || 0,
        parseFloat(facility.latitude),
        parseFloat(facility.longitude),
        facility.dataSource
      ];
      
      await client.query(query, values);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting batch:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run integration
integrateFacilities().catch(console.error).finally(() => {
  pool.end();
});