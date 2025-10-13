/**
 * BATCH INTEGRATION - FINAL COMPLETION
 * Load all missing communities in efficient batches
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_063735.csv';
const BATCH_SIZE = 50;

async function batchIntegration() {
  console.log('🚀 BATCH INTEGRATION - FINAL COMPLETION');
  console.log('=====================================');
  
  let client;
  try {
    client = await pool.connect();
    
    // Get current count
    const currentCount = await client.query('SELECT COUNT(*) as count FROM communities');
    console.log(`Starting with: ${currentCount.rows[0].count} communities`);
    
    // Load all facilities
    const allFacilities = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.address && row.city) {
            allFacilities.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Found ${allFacilities.length} total facilities in CSV`);
    
    // Get existing communities
    const existing = await client.query('SELECT LOWER(name) as name, LOWER(city) as city FROM communities');
    const existingSet = new Set();
    existing.rows.forEach(row => {
      existingSet.add(`${row.name}|${row.city}`);
    });
    
    // Find missing communities
    const missing = allFacilities.filter(facility => {
      const key = `${facility.name.toLowerCase()}|${facility.city.toLowerCase()}`;
      return !existingSet.has(key);
    });
    
    console.log(`Found ${missing.length} missing communities`);
    
    if (missing.length === 0) {
      console.log('✅ All communities already loaded!');
      return;
    }
    
    // Process in batches
    let totalProcessed = 0;
    const batchCount = Math.ceil(missing.length / BATCH_SIZE);
    
    for (let i = 0; i < batchCount; i++) {
      const batch = missing.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${i + 1}/${batchCount} (${batch.length} communities)`);
      
      // Begin transaction
      await client.query('BEGIN');
      
      try {
        for (const facility of batch) {
          // Determine care types
          const careTypes = [];
          const facilityType = facility.facility_type || facility.type || '';
          
          if (facilityType.includes('ALW') || facilityType.includes('ASSISTED LIVING')) {
            careTypes.push('Assisted Living');
          } else if (facilityType.includes('SKILLED NURSING') || facilityType.includes('NURSING HOME')) {
            careTypes.push('Skilled Nursing');
          } else if (facilityType.includes('MEMORY CARE')) {
            careTypes.push('Memory Care');
          } else {
            careTypes.push('Assisted Living'); // Default
          }
          
          // Set pricing
          const priceRanges = {
            'Skilled Nursing': { min: 8000, max: 12000 },
            'Memory Care': { min: 6500, max: 9500 },
            'Assisted Living': { min: 4200, max: 7000 }
          };
          const pricing = priceRanges[careTypes[0]] || priceRanges['Assisted Living'];
          
          // Clean phone
          const phone = facility.phone ? facility.phone.replace(/\D/g, '').slice(0, 10) : null;
          const formattedPhone = phone && phone.length === 10 ? 
            `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}` : null;
          
          // Insert community
          const query = `
            INSERT INTO communities (
              name, address, city, state, zip_code, phone, care_types,
              price_range, pricing_type, is_verified, discovery_source,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
            )
          `;
          
          const values = [
            facility.name.trim(),
            facility.address.trim(),
            facility.city.trim(),
            'California',
            facility.zip_code || facility.zipcode || '00000',
            formattedPhone,
            careTypes,
            JSON.stringify(pricing),
            'estimated',
            true,
            'california_government_data'
          ];
          
          await client.query(query, values);
          totalProcessed++;
        }
        
        // Commit transaction
        await client.query('COMMIT');
        console.log(`✅ Batch ${i + 1} completed successfully`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Batch ${i + 1} failed: ${error.message}`);
      }
    }
    
    // Get final count
    const finalCount = await client.query('SELECT COUNT(*) as count FROM communities');
    console.log(`\n📊 FINAL RESULTS`);
    console.log(`===============`);
    console.log(`Successfully processed: ${totalProcessed} communities`);
    console.log(`Final database count: ${finalCount.rows[0].count}`);
    console.log(`Target: 2,145 facilities`);
    console.log(`Completion: ${((finalCount.rows[0].count / 2145) * 100).toFixed(1)}%`);
    
    if (finalCount.rows[0].count >= 2145) {
      console.log('🎉 SUCCESS! All California government facilities loaded!');
    } else {
      console.log(`📝 Still missing: ${2145 - finalCount.rows[0].count} communities`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

batchIntegration();