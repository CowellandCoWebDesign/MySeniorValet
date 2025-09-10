/**
 * Quick California Expansion - Add Major Missing Counties
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Priority missing counties (likely to have most facilities)
const priorityCounties = [
  'MARIN', 'NAPA', 'SANTA CRUZ', 'SAN LUIS OBISPO', 'MENDOCINO', 
  'DEL NORTE', 'SISKIYOU', 'NEVADA', 'EL DORADO', 'LAKE',
  'SUTTER', 'YUBA', 'TEHAMA', 'GLENN', 'LASSEN', 'MODOC',
  'CALAVERAS', 'TUOLUMNE', 'MARIPOSA', 'COLUSA', 'PLUMAS',
  'SIERRA', 'INYO', 'TRINITY', 'AMADOR', 'SAN BENITO'
];

async function quickExpansion() {
  console.log('🎯 Quick California Expansion - Adding Major Missing Counties');
  
  try {
    // Get current status
    const statusQuery = `SELECT COUNT(*) as total FROM communities WHERE state = 'CA'`;
    const statusResult = await pool.query(statusQuery);
    const currentTotal = statusResult.rows[0].total;
    
    console.log(`📊 Current California Communities: ${currentTotal}`);
    
    // Load government data and filter for priority counties
    const facilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream('california_facilities_20250710_061653.csv')
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.city && row.county) {
            const county = row.county.trim().toUpperCase();
            if (priorityCounties.includes(county)) {
              facilities.push({
                name: row.name.trim(),
                address: row.address || '',
                city: row.city.trim(),
                county: county,
                state: 'CA',
                zipCode: row.zip || '',
                phone: row.phone || '',
                latitude: parseFloat(row.latitude) || null,
                longitude: parseFloat(row.longitude) || null,
                dataSource: 'California CDSS'
              });
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Found ${facilities.length} facilities in priority counties`);
    
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
    
    console.log(`🆕 New facilities to add: ${newFacilities.length}`);
    
    // Group by county
    const byCounty = {};
    newFacilities.forEach(facility => {
      if (!byCounty[facility.county]) byCounty[facility.county] = [];
      byCounty[facility.county].push(facility);
    });
    
    console.log('\n📍 New facilities by county:');
    Object.entries(byCounty).forEach(([county, facilities]) => {
      console.log(`   ${county}: ${facilities.length} facilities`);
    });
    
    // Add facilities
    let addedCount = 0;
    
    for (const facility of newFacilities) {
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
        
        const values = [
          facility.name,
          facility.address,
          facility.city,
          facility.state,
          facility.zipCode,
          facility.phone,
          facility.county,
          ['Assisted Living'], // care_types
          [], // amenities
          [], // services
          [], // medical_restrictions
          facility.latitude,
          facility.longitude,
          facility.dataSource,
          new Date().toISOString(),
          true // is_verified
        ];
        
        await pool.query(insertQuery, values);
        addedCount++;
        
        if (addedCount % 10 === 0) {
          console.log(`   ✅ Added ${addedCount} facilities...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error adding ${facility.name}:`, error.message);
      }
    }
    
    console.log(`\n🎯 EXPANSION COMPLETE`);
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show final stats
    const finalResult = await pool.query(statusQuery);
    const finalTotal = finalResult.rows[0].total;
    
    console.log(`\n📊 Final California Communities: ${finalTotal} (was ${currentTotal})`);
    console.log(`📈 Growth: +${finalTotal - currentTotal} communities`);
    
    // Show counties now covered
    const countiesQuery = `
      SELECT UPPER(county) as county_name, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
      GROUP BY UPPER(county)
      ORDER BY count DESC
    `;
    
    const countiesResult = await pool.query(countiesQuery);
    
    console.log(`\n🏛️ California Counties Covered: ${countiesResult.rows.length}`);
    console.log('Top counties by community count:');
    countiesResult.rows.slice(0, 10).forEach(row => {
      console.log(`   ${row.county_name}: ${row.count} communities`);
    });
    
    // Show total database size
    const totalQuery = `SELECT COUNT(*) as total FROM communities`;
    const totalResult = await pool.query(totalQuery);
    
    console.log(`\n🌟 Total Database Size: ${totalResult.rows[0].total} communities`);
    
  } catch (error) {
    console.error('❌ Quick expansion failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  quickExpansion().catch(console.error);
}

module.exports = { quickExpansion };