/**
 * Complete Missing Communities Addition
 * Continue adding remaining missing counties
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Remaining counties to complete
const remainingCounties = [
  'SANTA BARBARA', 'MONTEREY', 'IMPERIAL', 'SOLANO', 'TULARE', 'BUTTE'
];

/**
 * Complete missing communities addition
 */
async function completeMissingCommunities() {
  console.log('🎯 Completing Missing California Communities Addition');
  console.log('=' * 50);
  
  try {
    // Check current status
    const statusQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT county) as counties
      FROM communities 
      WHERE state = 'CA'
    `;
    
    const statusResult = await pool.query(statusQuery);
    const currentStats = statusResult.rows[0];
    
    console.log(`📊 Current California Coverage:`);
    console.log(`   Total Communities: ${currentStats.total}`);
    console.log(`   Unique Cities: ${currentStats.cities}`);
    console.log(`   Unique Counties: ${currentStats.counties}`);
    
    // Load remaining facilities
    const csvFile = 'california_facilities_20250710_061653.csv';
    const facilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.city && row.county) {
            // Filter for remaining counties
            const countyMatch = remainingCounties.some(county => 
              row.county.toUpperCase().includes(county)
            );
            
            if (countyMatch) {
              facilities.push({
                name: row.name.trim(),
                address: row.address || '',
                city: row.city.trim(),
                county: row.county.trim(),
                state: 'CA',
                zipCode: row.zip || '',
                phone: row.phone || '',
                latitude: parseFloat(row.latitude) || null,
                longitude: parseFloat(row.longitude) || null,
                dataSource: row.data_source || 'California CDSS',
                facilityType: row.facility_type || ''
              });
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Loaded ${facilities.length} remaining facilities`);
    
    // Get existing facilities to avoid duplicates
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
      console.log('✅ All remaining facilities already exist in database');
      return;
    }
    
    // Add facilities efficiently
    let addedCount = 0;
    
    for (const facility of newFacilities) {
      try {
        // Determine care types
        let careTypes = ['Assisted Living'];
        if (facility.facilityType.includes('SKILLED NURSING')) {
          careTypes = ['Skilled Nursing', 'Assisted Living'];
        } else if (facility.facilityType.includes('INTERMEDIATE')) {
          careTypes = ['Intermediate Care', 'Assisted Living'];
        }
        
        const insertQuery = `
          INSERT INTO communities (
            name, address, city, state, zip_code, phone, county,
            care_types, amenities, services, medical_restrictions,
            latitude, longitude, discovery_source, discovery_date, is_verified
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )
        `;
        
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
        addedCount++;
        
        console.log(`✅ Added: ${facility.name} in ${facility.city}, ${facility.county}`);
        
      } catch (error) {
        console.error(`❌ Error adding ${facility.name}:`, error.message);
      }
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 Completion Results');
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show final California coverage
    const finalResult = await pool.query(statusQuery);
    const finalStats = finalResult.rows[0];
    
    console.log('\n📊 Final California Coverage:');
    console.log(`   Total Communities: ${finalStats.total} (was ${currentStats.total})`);
    console.log(`   Unique Cities: ${finalStats.cities} (was ${currentStats.cities})`);
    console.log(`   Unique Counties: ${finalStats.counties} (was ${currentStats.counties})`);
    
    // Show all counties now covered
    const allCountiesQuery = `
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
      GROUP BY county 
      ORDER BY count DESC
    `;
    
    const allCountiesResult = await pool.query(allCountiesQuery);
    
    console.log('\n🏛️ All California Counties Now Covered:');
    allCountiesResult.rows.forEach(row => {
      console.log(`   ${row.county}: ${row.count} communities`);
    });
    
    // Check if we got the key missing cities
    const keyMissingCities = ['CHICO', 'VISALIA', 'SANTA ROSA', 'VENTURA', 'SANTA BARBARA', 'MODESTO', 'SALINAS'];
    
    const keyCitiesQuery = `
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND city IN (${keyMissingCities.map(c => `'${c}'`).join(',')})
      GROUP BY city
      ORDER BY count DESC
    `;
    
    const keyCitiesResult = await pool.query(keyCitiesQuery);
    
    console.log('\n🏙️ Key Previously Missing Cities Now Covered:');
    keyCitiesResult.rows.forEach(row => {
      console.log(`   ${row.city}: ${row.count} communities`);
    });
    
    // Show total database size
    const totalQuery = `SELECT COUNT(*) as total FROM communities`;
    const totalResult = await pool.query(totalQuery);
    
    console.log('\n🎯 COMPLETE DATABASE STATUS:');
    console.log(`   Total Communities (All States): ${totalResult.rows[0].total}`);
    console.log(`   California Communities: ${finalStats.total}`);
    console.log(`   California Coverage: ${((finalStats.total / totalResult.rows[0].total) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Completion failed:', error);
  } finally {
    await pool.end();
  }
}

// Run completion
if (require.main === module) {
  completeMissingCommunities().catch(console.error);
}

module.exports = { completeMissingCommunities };