/**
 * Complete Integration - Process ALL remaining facilities from CSV
 * No verification restrictions - add everything from government databases
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function processAllRemainingFacilities() {
  console.log('🚀 COMPLETE INTEGRATION - ALL 2,146 FACILITIES');
  console.log('===============================================');
  
  try {
    // Get current count
    const client = await pool.connect();
    const currentCount = await client.query('SELECT COUNT(*) as count FROM communities');
    console.log(`Starting with: ${currentCount.rows[0].count} communities`);
    client.release();
    
    // Load ALL facilities from CSV
    console.log('\n📄 Loading ALL facilities from CSV...');
    const allFacilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.address) {
            allFacilities.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Found ${allFacilities.length} total facilities in CSV`);
    
    // Get existing facility names to avoid exact duplicates
    const existingClient = await pool.connect();
    const existing = await existingClient.query('SELECT LOWER(name) as name, LOWER(city) as city FROM communities');
    const existingSet = new Set();
    existing.rows.forEach(row => {
      existingSet.add(`${row.name}|${row.city}`);
    });
    existingClient.release();
    
    console.log(`Found ${existingSet.size} existing name/city combinations`);
    
    // Filter out exact duplicates
    const newFacilities = allFacilities.filter(facility => {
      const key = `${facility.name.toLowerCase()}|${(facility.city || '').toLowerCase()}`;
      return !existingSet.has(key);
    });
    
    console.log(`New facilities to process: ${newFacilities.length}`);
    
    if (newFacilities.length === 0) {
      console.log('✅ All facilities already in database!');
      return;
    }
    
    // Process ALL new facilities
    console.log(`\n🔄 Processing ${newFacilities.length} new facilities...`);
    let inserted = 0;
    let errors = 0;
    
    for (let i = 0; i < newFacilities.length; i++) {
      const facility = newFacilities[i];
      
      if (i % 50 === 0) {
        console.log(`Progress: ${i + 1}/${newFacilities.length} (${Math.round((i + 1) / newFacilities.length * 100)}%) - Inserted: ${inserted}`);
      }
      
      try {
        // Determine care types
        let careTypes = ['Senior Living'];
        if (facility.data_source === 'alw_assisted_living') {
          careTypes = ['Assisted Living'];
        } else if (facility.data_source === 'healthcare_facilities') {
          careTypes = ['Skilled Nursing'];
        } else if (facility.name) {
          const name = facility.name.toUpperCase();
          if (name.includes('ASSISTED LIVING')) careTypes = ['Assisted Living'];
          else if (name.includes('MEMORY CARE')) careTypes = ['Memory Care'];
          else if (name.includes('SKILLED NURSING')) careTypes = ['Skilled Nursing'];
          else if (name.includes('INDEPENDENT LIVING')) careTypes = ['Independent Living'];
        }
        
        // Clean phone
        let phone = null;
        if (facility.phone) {
          const digits = facility.phone.replace(/\D/g, '');
          if (digits.length === 10) {
            phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
          }
        }
        
        // Parse coordinates
        let lat = null, lng = null;
        if (facility.latitude && !isNaN(facility.latitude)) {
          lat = parseFloat(facility.latitude);
        }
        if (facility.longitude && !isNaN(facility.longitude)) {
          lng = parseFloat(facility.longitude);
        }
        
        // Parse capacity
        let capacity = null;
        if (facility.capacity && !isNaN(facility.capacity)) {
          capacity = parseInt(facility.capacity);
        }
        
        const insertClient = await pool.connect();
        const result = await insertClient.query(`
          INSERT INTO communities (
            name, address, city, state, zip_code, phone, 
            latitude, longitude, care_types, capacity, 
            license_number, data_source, government_verified,
            county, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          RETURNING id
        `, [
          facility.name,
          facility.address || '',
          facility.city || '',
          'California',
          facility.zip || facility.zip_code || '',
          phone,
          lat,
          lng,
          careTypes,
          capacity,
          facility.license_number || '',
          facility.data_source || 'california_government',
          facility.data_source ? true : false, // Only mark government_verified if has data_source
          facility.county || ''
        ]);
        
        if (result.rows.length > 0) {
          inserted++;
        }
        insertClient.release();
        
      } catch (error) {
        errors++;
        if (errors <= 10) {
          console.error(`Error with ${facility.name}: ${error.message}`);
        }
      }
    }
    
    // Final results
    const finalClient = await pool.connect();
    const finalCount = await finalClient.query('SELECT COUNT(*) as count FROM communities');
    const govCount = await finalClient.query('SELECT COUNT(*) as count FROM communities WHERE government_verified = true');
    finalClient.release();
    
    console.log('\n🎉 COMPLETE INTEGRATION RESULTS:');
    console.log(`Database growth: ${currentCount.rows[0].count} → ${finalCount.rows[0].count} (+${finalCount.rows[0].count - currentCount.rows[0].count})`);
    console.log(`Government verified: ${govCount.rows[0].count}`);
    console.log(`Successfully inserted: ${inserted}/${newFacilities.length} facilities`);
    console.log(`Errors: ${errors}`);
    
    if (finalCount.rows[0].count > 1000) {
      console.log('\n🏆 MILESTONE: 1000+ COMMUNITIES ACHIEVED!');
    }
    
  } catch (error) {
    console.error('❌ Complete integration failed:', error.message);
  }
}

if (require.main === module) {
  processAllRemainingFacilities().catch(console.error);
}

module.exports = { processAllRemainingFacilities };