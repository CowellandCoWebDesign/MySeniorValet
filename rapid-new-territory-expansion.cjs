/**
 * Rapid New Territory Expansion
 * Focus on facilities not already in database with optimized processing
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function getExistingFacilities() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT LOWER(name) as name, LOWER(city) as city, license_number 
      FROM communities 
      WHERE government_verified = true
    `);
    
    const existing = new Set();
    result.rows.forEach(row => {
      existing.add(`${row.name}|${row.city}`);
      if (row.license_number) {
        existing.add(`license:${row.license_number}`);
      }
    });
    
    return existing;
  } finally {
    client.release();
  }
}

async function processNewFacilities() {
  console.log('🚀 RAPID NEW TERRITORY EXPANSION');
  console.log('Focus on Previously Unknown Facilities');
  console.log('====================================');
  
  try {
    // Get current stats
    const client = await pool.connect();
    const currentStats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN government_verified = true THEN 1 END) as gov_verified,
        COUNT(CASE WHEN data_source = 'alw_assisted_living' THEN 1 END) as alw_count,
        COUNT(CASE WHEN data_source = 'healthcare_facilities' THEN 1 END) as healthcare_count
      FROM communities
    `);
    
    const stats = currentStats.rows[0];
    console.log(`Current database: ${stats.total} total, ${stats.gov_verified} government-verified`);
    console.log(`ALW: ${stats.alw_count}, Healthcare: ${stats.healthcare_count}`);
    client.release();
    
    // Load existing facilities for quick duplicate checking
    console.log('\n📊 Loading existing facilities for duplicate checking...');
    const existingFacilities = await getExistingFacilities();
    console.log(`Found ${existingFacilities.size} existing facility identifiers`);
    
    // Process CSV and identify new facilities
    console.log('\n📄 Scanning CSV for new facilities...');
    const newFacilities = [];
    let totalInCsv = 0;
    let duplicatesFound = 0;
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.address && row.data_source) {
            totalInCsv++;
            
            const nameCity = `${row.name.toLowerCase()}|${(row.city || '').toLowerCase()}`;
            const licenseKey = row.license_number ? `license:${row.license_number}` : null;
            
            // Check if this facility already exists
            if (existingFacilities.has(nameCity) || (licenseKey && existingFacilities.has(licenseKey))) {
              duplicatesFound++;
            } else {
              newFacilities.push(row);
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 CSV Analysis Complete:`);
    console.log(`  Total facilities in CSV: ${totalInCsv}`);
    console.log(`  Duplicates found: ${duplicatesFound}`);
    console.log(`  New facilities to add: ${newFacilities.length}`);
    
    if (newFacilities.length === 0) {
      console.log('✅ All government facilities already integrated!');
      return;
    }
    
    // Batch insert new facilities
    console.log(`\n🔄 Inserting ${newFacilities.length} new facilities...`);
    let insertedCount = 0;
    let errorCount = 0;
    
    // Process in batches of 100 for efficiency
    const batchSize = 100;
    for (let i = 0; i < newFacilities.length; i += batchSize) {
      const batch = newFacilities.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newFacilities.length/batchSize)}...`);
      
      for (const facility of batch) {
        try {
          const careTypes = facility.data_source === 'alw_assisted_living' 
            ? ['Assisted Living'] 
            : ['Skilled Nursing'];
          
          const capacity = facility.capacity && !isNaN(facility.capacity) 
            ? parseInt(facility.capacity) 
            : null;
          
          // Clean phone number
          let cleanPhone = null;
          if (facility.phone) {
            const digits = facility.phone.replace(/\D/g, '');
            if (digits.length === 10) {
              cleanPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
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
            facility.zip || '',
            cleanPhone,
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
            insertedCount++;
          }
          insertClient.release();
          
        } catch (error) {
          errorCount++;
          if (errorCount <= 5) {
            console.error(`Error inserting ${facility.name}:`, error.message);
          }
        }
      }
      
      console.log(`  Batch complete. Inserted: ${insertedCount}, Errors: ${errorCount}`);
    }
    
    // Get final stats
    const finalClient = await pool.connect();
    const finalStats = await finalClient.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN government_verified = true THEN 1 END) as gov_verified,
        COUNT(CASE WHEN data_source = 'alw_assisted_living' THEN 1 END) as alw_count,
        COUNT(CASE WHEN data_source = 'healthcare_facilities' THEN 1 END) as healthcare_count
      FROM communities
    `);
    
    const final = finalStats.rows[0];
    finalClient.release();
    
    console.log('\n🎉 RAPID EXPANSION COMPLETE!');
    console.log(`Database growth: ${stats.total} → ${final.total} (+${final.total - stats.total})`);
    console.log(`Government verified: ${stats.gov_verified} → ${final.gov_verified} (+${final.gov_verified - stats.gov_verified})`);
    console.log(`ALW facilities: ${stats.alw_count} → ${final.alw_count}`);
    console.log(`Healthcare facilities: ${stats.healthcare_count} → ${final.healthcare_count}`);
    console.log(`Successfully inserted: ${insertedCount}/${newFacilities.length} new facilities`);
    
    if (final.total > 1000) {
      console.log('\n🏆 MILESTONE ACHIEVED: 1000+ COMMUNITIES DATABASE!');
    }
    
  } catch (error) {
    console.error('❌ Rapid expansion failed:', error.message);
  }
}

if (require.main === module) {
  processNewFacilities().catch(console.error);
}

module.exports = { processNewFacilities };