/**
 * Continue Expansion - Monitor and Process Remaining Facilities
 * More efficient batch processing for the remaining facilities
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function batchProcessFacilities() {
  console.log('🔄 BATCH PROCESSING REMAINING FACILITIES');
  console.log('========================================');
  
  try {
    // Get current count
    const client = await pool.connect();
    const currentCount = await client.query('SELECT COUNT(*) as count FROM communities');
    const govCount = await client.query('SELECT COUNT(*) as count FROM communities WHERE government_verified = true');
    console.log(`Current database: ${currentCount.rows[0].count} communities`);
    console.log(`Government verified: ${govCount.rows[0].count} facilities`);
    client.release();
    
    // Load unprocessed facilities from CSV
    const unprocessedFacilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', async (row) => {
          if (row.name && row.address && row.data_source) {
            // Quick check if this facility exists
            const checkClient = await pool.connect();
            try {
              const exists = await checkClient.query(
                'SELECT 1 FROM communities WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2) LIMIT 1',
                [row.name, row.city]
              );
              
              if (exists.rows.length === 0) {
                unprocessedFacilities.push(row);
              }
            } finally {
              checkClient.release();
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Found ${unprocessedFacilities.length} unprocessed facilities`);
    
    if (unprocessedFacilities.length === 0) {
      console.log('✅ All facilities already processed!');
      return;
    }
    
    // Process in smaller efficient batches
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < unprocessedFacilities.length; i += batchSize) {
      const batch = unprocessedFacilities.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(unprocessedFacilities.length/batchSize)}...`);
      
      for (const facility of batch) {
        try {
          const careTypes = facility.data_source === 'alw_assisted_living' ? ['Assisted Living'] : ['Skilled Nursing'];
          const capacity = facility.capacity && !isNaN(facility.capacity) ? parseInt(facility.capacity) : null;
          
          const insertClient = await pool.connect();
          const result = await insertClient.query(`
            INSERT INTO communities (
              name, address, city, state, zip_code, phone, 
              latitude, longitude, care_types, capacity, 
              license_number, data_source, government_verified,
              county, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
            ON CONFLICT DO NOTHING
            RETURNING id
          `, [
            facility.name,
            facility.address || '',
            facility.city || '',
            'California',
            facility.zip || '',
            facility.phone || null,
            facility.latitude ? parseFloat(facility.latitude) : null,
            facility.longitude ? parseFloat(facility.longitude) : null,
            careTypes,
            capacity,
            facility.license_number || '',
            facility.data_source,
            true,
            facility.county || ''
          ]);
          
          if (result.rows.length > 0) {
            totalInserted++;
          }
          insertClient.release();
          
        } catch (error) {
          console.error(`Error inserting ${facility.name}:`, error.message);
        }
      }
      
      // Progress update
      console.log(`Batch complete. Total inserted so far: ${totalInserted}`);
    }
    
    // Final count
    const finalClient = await pool.connect();
    const finalCount = await finalClient.query('SELECT COUNT(*) as count FROM communities');
    const finalGovCount = await finalClient.query('SELECT COUNT(*) as count FROM communities WHERE government_verified = true');
    finalClient.release();
    
    console.log('\n🎉 BATCH PROCESSING COMPLETE!');
    console.log(`Final database: ${finalCount.rows[0].count} communities`);
    console.log(`Government verified: ${finalGovCount.rows[0].count} facilities`);
    console.log(`Newly inserted: ${totalInserted} facilities`);
    
  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
  }
}

if (require.main === module) {
  batchProcessFacilities().catch(console.error);
}

module.exports = { batchProcessFacilities };