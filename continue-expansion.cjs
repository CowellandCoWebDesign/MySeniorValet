/**
 * Continue California Expansion
 * Efficient continuation of facility addition
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Continue California expansion efficiently
 */
async function continueExpansion() {
  console.log('🚀 Continuing California Expansion');
  console.log('=' * 40);
  
  try {
    // Check current status
    const currentQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT county) as counties
      FROM communities 
      WHERE state = 'CA'
    `;
    
    const currentResult = await pool.query(currentQuery);
    const { total, cities, counties } = currentResult.rows[0];
    
    console.log(`📊 Current: ${total} communities, ${cities} cities, ${counties} counties`);
    
    // Load and process facilities
    const csvFile = 'california_facilities_20250710_061653.csv';
    const facilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.city) {
            facilities.push({
              name: row.name.trim(),
              address: row.address || '',
              city: row.city.trim(),
              county: row.county || '',
              state: 'CA',
              zipCode: row.zip || '',
              phone: row.phone || '',
              latitude: parseFloat(row.latitude) || null,
              longitude: parseFloat(row.longitude) || null,
              dataSource: row.data_source || 'California CDSS'
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Loaded ${facilities.length} total facilities`);
    
    // Get existing facilities
    const existingQuery = `SELECT name, city FROM communities WHERE state = 'CA'`;
    const existingResult = await pool.query(existingQuery);
    const existingSet = new Set(
      existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
    );
    
    // Filter new facilities
    const newFacilities = facilities.filter(facility => {
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      return !existingSet.has(key);
    });
    
    console.log(`🆕 Found ${newFacilities.length} new facilities to add`);
    
    if (newFacilities.length === 0) {
      console.log('✅ All California facilities are already in database');
      return;
    }
    
    // Add facilities in efficient batches
    let addedCount = 0;
    const batchSize = 20;
    
    for (let i = 0; i < newFacilities.length; i += batchSize) {
      const batch = newFacilities.slice(i, i + batchSize);
      
      // Process batch
      const promises = batch.map(async (facility) => {
        try {
          const insertQuery = `
            INSERT INTO communities (
              name, address, city, state, zip_code, phone, county,
              care_types, amenities, services, medical_restrictions,
              latitude, longitude, discovery_source, discovery_date, is_verified
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            )
          `;
          
          const careTypes = facility.dataSource === 'alw_assisted_living' ? 
            ['Assisted Living'] : ['Skilled Nursing', 'Assisted Living'];
          
          const values = [
            facility.name,
            facility.address,
            facility.city,
            facility.state,
            facility.zipCode,
            facility.phone,
            facility.county,
            careTypes,
            [], // amenities
            [], // services
            [], // medical_restrictions
            facility.latitude,
            facility.longitude,
            facility.dataSource,
            new Date().toISOString(),
            true // is_verified (government data)
          ];
          
          await pool.query(insertQuery, values);
          return true;
        } catch (error) {
          console.error(`❌ Error adding ${facility.name}:`, error.message);
          return false;
        }
      });
      
      const results = await Promise.all(promises);
      const batchSuccess = results.filter(r => r).length;
      addedCount += batchSuccess;
      
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Added ${batchSuccess}/${batch.length} facilities (Total: ${addedCount})`);
      
      // Break if we've added enough
      if (addedCount >= 500) {
        console.log(`🎯 Reached target of 500 new facilities`);
        break;
      }
    }
    
    console.log('\n' + '=' * 40);
    console.log('🎯 Expansion Results');
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show final coverage
    const finalResult = await pool.query(currentQuery);
    const finalStats = finalResult.rows[0];
    
    console.log('\n📊 Updated California Coverage:');
    console.log(`   Total Communities: ${finalStats.total} (was ${total})`);
    console.log(`   Unique Cities: ${finalStats.cities} (was ${cities})`);
    console.log(`   Unique Counties: ${finalStats.counties} (was ${counties})`);
    
    // Show top counties
    const countyQuery = `
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
      GROUP BY county 
      ORDER BY count DESC 
      LIMIT 10
    `;
    
    const countyResult = await pool.query(countyQuery);
    
    console.log('\n🏛️ Top California Counties:');
    countyResult.rows.forEach(row => {
      console.log(`   ${row.county}: ${row.count} communities`);
    });
    
  } catch (error) {
    console.error('❌ Expansion failed:', error);
  } finally {
    await pool.end();
  }
}

// Run expansion
if (require.main === module) {
  continueExpansion().catch(console.error);
}

module.exports = { continueExpansion };