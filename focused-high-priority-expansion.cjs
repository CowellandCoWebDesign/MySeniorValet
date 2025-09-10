/**
 * Focused High-Priority Expansion
 * Complete the remaining facilities efficiently with optimized batching
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function completeRemainingExpansion() {
  console.log('🎯 FOCUSED HIGH-PRIORITY EXPANSION');
  console.log('Completing All Remaining California Facilities');
  console.log('===============================================');
  
  try {
    // Current status
    const client = await pool.connect();
    const currentStats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN data_source = 'alw_assisted_living' THEN 1 END) as alw,
        COUNT(CASE WHEN data_source = 'healthcare_facilities' THEN 1 END) as healthcare,
        COUNT(CASE WHEN government_verified = true THEN 1 END) as gov_verified
      FROM communities
    `);
    
    const stats = currentStats.rows[0];
    console.log(`Current: ${stats.total} communities (${stats.alw} ALW, ${stats.healthcare} healthcare, ${stats.gov_verified} gov-verified)`);
    client.release();
    
    // Load existing facilities quickly
    const existingClient = await pool.connect();
    const existing = await existingClient.query('SELECT name, city FROM communities');
    const existingSet = new Set();
    existing.rows.forEach(row => {
      existingSet.add(`${row.name.toLowerCase()}|${(row.city || '').toLowerCase()}`);
    });
    existingClient.release();
    
    console.log(`Tracking ${existingSet.size} existing facilities for duplicate prevention`);
    
    // Process CSV and find remaining facilities
    console.log('\n📄 Scanning CSV for remaining facilities...');
    const remainingFacilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.address) {
            const key = `${row.name.toLowerCase()}|${(row.city || '').toLowerCase()}`;
            if (!existingSet.has(key)) {
              remainingFacilities.push(row);
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Found ${remainingFacilities.length} remaining facilities to process`);
    
    if (remainingFacilities.length === 0) {
      console.log('✅ ALL FACILITIES ALREADY INTEGRATED!');
      return;
    }
    
    // Fast batch processing
    console.log(`\n🚀 Processing ${remainingFacilities.length} facilities with optimized batching...`);
    let processed = 0;
    let inserted = 0;
    let errors = 0;
    
    // Process in chunks of 200 for speed
    const chunkSize = 200;
    for (let i = 0; i < remainingFacilities.length; i += chunkSize) {
      const chunk = remainingFacilities.slice(i, i + chunkSize);
      
      console.log(`Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(remainingFacilities.length/chunkSize)} (${chunk.length} facilities)`);
      
      // Process chunk facilities
      for (const facility of chunk) {
        try {
          // Quick care type determination
          let careTypes = ['Senior Living'];
          if (facility.data_source === 'alw_assisted_living') {
            careTypes = ['Assisted Living'];
          } else if (facility.data_source === 'healthcare_facilities') {
            careTypes = ['Skilled Nursing'];
          }
          
          // Fast phone cleanup
          let phone = null;
          if (facility.phone) {
            const digits = facility.phone.replace(/\D/g, '');
            if (digits.length === 10) {
              phone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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
            ON CONFLICT DO NOTHING
            RETURNING id
          `, [
            facility.name,
            facility.address || '',
            facility.city || '',
            'California',
            facility.zip || facility.zip_code || '',
            phone,
            facility.latitude ? parseFloat(facility.latitude) : null,
            facility.longitude ? parseFloat(facility.longitude) : null,
            careTypes,
            facility.capacity && !isNaN(facility.capacity) ? parseInt(facility.capacity) : null,
            facility.license_number || '',
            facility.data_source || 'california_government',
            facility.data_source ? true : false,
            facility.county || ''
          ]);
          
          if (result.rows.length > 0) {
            inserted++;
          }
          insertClient.release();
          
        } catch (error) {
          errors++;
        }
        
        processed++;
      }
      
      // Progress update
      const progress = Math.round((processed / remainingFacilities.length) * 100);
      console.log(`  Chunk complete: ${processed}/${remainingFacilities.length} (${progress}%) - Inserted: ${inserted}, Errors: ${errors}`);
    }
    
    // Final results
    const finalClient = await pool.connect();
    const finalStats = await finalClient.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN data_source = 'alw_assisted_living' THEN 1 END) as alw,
        COUNT(CASE WHEN data_source = 'healthcare_facilities' THEN 1 END) as healthcare,
        COUNT(CASE WHEN government_verified = true THEN 1 END) as gov_verified
      FROM communities
    `);
    
    const final = finalStats.rows[0];
    finalClient.release();
    
    console.log('\n🎉 FOCUSED EXPANSION COMPLETE!');
    console.log(`Database: ${stats.total} → ${final.total} (+${final.total - stats.total})`);
    console.log(`ALW: ${stats.alw} → ${final.alw} (+${final.alw - stats.alw})`);
    console.log(`Healthcare: ${stats.healthcare} → ${final.healthcare} (+${final.healthcare - stats.healthcare})`);
    console.log(`Gov verified: ${stats.gov_verified} → ${final.gov_verified} (+${final.gov_verified - stats.gov_verified})`);
    console.log(`Success rate: ${inserted}/${remainingFacilities.length} (${Math.round(inserted/remainingFacilities.length*100)}%)`);
    
    if (final.total >= 1000) {
      console.log('\n🏆 MILESTONE ACHIEVED: 1000+ COMMUNITIES!');
    }
    
    if (final.total >= 2000) {
      console.log('🚀 MEGA MILESTONE: 2000+ COMMUNITIES!');
    }
    
  } catch (error) {
    console.error('❌ Focused expansion failed:', error.message);
  }
}

if (require.main === module) {
  completeRemainingExpansion().catch(console.error);
}

module.exports = { completeRemainingExpansion };