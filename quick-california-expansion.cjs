/**
 * Quick California Expansion
 * Fast batch integration of missing California facilities
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Quick batch insert for California facilities
 */
async function quickCaliforniaExpansion() {
  console.log('🚀 Quick California Expansion - Adding Missing Facilities');
  console.log('=' * 50);
  
  try {
    // Find the latest California facilities file
    const files = fs.readdirSync('.')
      .filter(file => file.startsWith('california_facilities_') && file.endsWith('.csv'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('❌ No California facilities CSV file found');
      return;
    }
    
    const csvFile = files[0];
    console.log(`📄 Using file: ${csvFile}`);
    
    // Parse facilities
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
    
    console.log(`✅ Parsed ${facilities.length} California facilities`);
    
    // Get existing facility names to avoid duplicates
    const existingQuery = `SELECT name, city FROM communities WHERE state = 'CA'`;
    const existingResult = await pool.query(existingQuery);
    const existingSet = new Set(
      existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
    );
    
    console.log(`📊 Found ${existingResult.rows.length} existing California facilities`);
    
    // Filter out existing facilities
    const newFacilities = facilities.filter(facility => {
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      return !existingSet.has(key);
    });
    
    console.log(`🆕 Found ${newFacilities.length} new facilities to add`);
    
    if (newFacilities.length === 0) {
      console.log('✅ No new facilities to add');
      return;
    }
    
    // Batch insert new facilities
    let insertCount = 0;
    const batchSize = 25;
    
    for (let i = 0; i < newFacilities.length; i += batchSize) {
      const batch = newFacilities.slice(i, i + batchSize);
      
      console.log(`🏠 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newFacilities.length/batchSize)}`);
      
      for (const facility of batch) {
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
          
          const careTypes = ['Assisted Living']; // Default care type
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
          insertCount++;
          
          if (insertCount % 50 === 0) {
            console.log(`   ✅ ${insertCount} facilities added so far...`);
          }
        } catch (error) {
          console.error(`❌ Error inserting ${facility.name}:`, error.message);
        }
      }
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 Quick California Expansion Complete!');
    console.log(`✅ Successfully added: ${insertCount} new facilities`);
    console.log(`📊 Total processed: ${newFacilities.length} facilities`);
    
    // Show updated California coverage
    const updatedQuery = `
      SELECT 
        COUNT(*) as total_communities,
        COUNT(DISTINCT city) as unique_cities,
        COUNT(DISTINCT county) as unique_counties
      FROM communities 
      WHERE state = 'CA'
    `;
    
    const updatedResult = await pool.query(updatedQuery);
    const stats = updatedResult.rows[0];
    
    console.log('\n📊 Updated California Coverage:');
    console.log(`   Total Communities: ${stats.total_communities}`);
    console.log(`   Unique Cities: ${stats.unique_cities}`);
    console.log(`   Unique Counties: ${stats.unique_counties}`);
    
    // Show top cities
    const topCitiesQuery = `
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' 
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 10
    `;
    
    const topCitiesResult = await pool.query(topCitiesQuery);
    
    console.log('\n🏙️ Top California Cities by Community Count:');
    topCitiesResult.rows.forEach(row => {
      console.log(`   ${row.city}: ${row.count} communities`);
    });
    
  } catch (error) {
    console.error('❌ Expansion failed:', error);
  } finally {
    await pool.end();
  }
}

// Run expansion
if (require.main === module) {
  quickCaliforniaExpansion().catch(console.error);
}

module.exports = { quickCaliforniaExpansion };