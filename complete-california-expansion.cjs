/**
 * Complete California Expansion
 * Add ALL remaining California counties with government data
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ALL 58 California counties
const allCaliforniaCounties = [
  'ALAMEDA', 'ALPINE', 'AMADOR', 'BUTTE', 'CALAVERAS', 'COLUSA', 'CONTRA COSTA',
  'DEL NORTE', 'EL DORADO', 'FRESNO', 'GLENN', 'HUMBOLDT', 'IMPERIAL', 'INYO',
  'KERN', 'KINGS', 'LAKE', 'LASSEN', 'LOS ANGELES', 'MADERA', 'MARIN', 'MARIPOSA',
  'MENDOCINO', 'MERCED', 'MODOC', 'MONO', 'MONTEREY', 'NAPA', 'NEVADA', 'ORANGE',
  'PLACER', 'PLUMAS', 'RIVERSIDE', 'SACRAMENTO', 'SAN BENITO', 'SAN BERNARDINO',
  'SAN DIEGO', 'SAN FRANCISCO', 'SAN JOAQUIN', 'SAN LUIS OBISPO', 'SAN MATEO',
  'SANTA BARBARA', 'SANTA CLARA', 'SANTA CRUZ', 'SHASTA', 'SIERRA', 'SISKIYOU',
  'SOLANO', 'SONOMA', 'STANISLAUS', 'SUTTER', 'TEHAMA', 'TRINITY', 'TULARE',
  'TUOLUMNE', 'VENTURA', 'YOLO', 'YUBA'
];

/**
 * Complete California expansion
 */
async function completeCaliforniaExpansion() {
  console.log('🎯 COMPLETE CALIFORNIA EXPANSION - Adding All Missing Counties');
  console.log('=' * 50);
  
  try {
    // Get current database status
    const statusQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT UPPER(county)) as counties,
        COUNT(DISTINCT city) as cities
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
    `;
    
    const statusResult = await pool.query(statusQuery);
    const currentStats = statusResult.rows[0];
    
    console.log(`📊 Current California Database Status:`);
    console.log(`   Total Communities: ${currentStats.total}`);
    console.log(`   Unique Counties: ${currentStats.counties}`);
    console.log(`   Unique Cities: ${currentStats.cities}`);
    
    // Get existing counties in our database
    const existingCountiesQuery = `
      SELECT DISTINCT UPPER(county) as county_name 
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
    `;
    
    const existingCountiesResult = await pool.query(existingCountiesQuery);
    const existingCounties = new Set(existingCountiesResult.rows.map(row => row.county_name));
    
    console.log(`\n📋 Counties Currently in Database:`);
    [...existingCounties].sort().forEach(county => console.log(`   ✅ ${county}`));
    
    // Find missing counties
    const missingCounties = allCaliforniaCounties.filter(county => !existingCounties.has(county));
    
    console.log(`\n❌ Missing Counties (${missingCounties.length}):`);
    missingCounties.forEach(county => console.log(`   - ${county}`));
    
    // Load ALL government facility data
    const csvFile = 'california_facilities_20250710_061653.csv';
    const allFacilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFile)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.city && row.county) {
            allFacilities.push({
              name: row.name.trim(),
              address: row.address || '',
              city: row.city.trim(),
              county: row.county.trim().toUpperCase(),
              state: 'CA',
              zipCode: row.zip || '',
              phone: row.phone || '',
              latitude: parseFloat(row.latitude) || null,
              longitude: parseFloat(row.longitude) || null,
              dataSource: row.data_source || 'California CDSS',
              facilityType: row.facility_type || ''
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`\n✅ Loaded ${allFacilities.length} total government facilities`);
    
    // Find counties in government data
    const governmentCounties = [...new Set(allFacilities.map(f => f.county))];
    console.log(`📊 Counties in Government Data: ${governmentCounties.length}`);
    
    // Counties missing from government data
    const notInGovernment = allCaliforniaCounties.filter(county => !governmentCounties.includes(county));
    console.log(`\n🚫 Counties NOT in Government Data (${notInGovernment.length}):`);
    notInGovernment.forEach(county => console.log(`   - ${county}`));
    
    // Get existing facilities to avoid duplicates
    const existingQuery = `SELECT name, city FROM communities WHERE state = 'CA'`;
    const existingResult = await pool.query(existingQuery);
    const existingSet = new Set(
      existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
    );
    
    // Filter for missing counties with new facilities
    const newFacilities = allFacilities.filter(facility => {
      const isInMissingCounty = missingCounties.includes(facility.county);
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      const isNew = !existingSet.has(key);
      
      return isInMissingCounty && isNew;
    });
    
    console.log(`\n🆕 New Facilities to Add: ${newFacilities.length}`);
    
    // Group by county
    const facilitiesByCounty = {};
    newFacilities.forEach(facility => {
      if (!facilitiesByCounty[facility.county]) {
        facilitiesByCounty[facility.county] = [];
      }
      facilitiesByCounty[facility.county].push(facility);
    });
    
    console.log(`\n📍 New Facilities by County:`);
    Object.entries(facilitiesByCounty).forEach(([county, facilities]) => {
      console.log(`   ${county}: ${facilities.length} facilities`);
    });
    
    if (newFacilities.length === 0) {
      console.log('\n✅ All available government facilities already in database');
      return;
    }
    
    // Add facilities efficiently
    let addedCount = 0;
    
    for (const [county, facilities] of Object.entries(facilitiesByCounty)) {
      console.log(`\n🏠 Adding ${facilities.length} facilities in ${county} County...`);
      
      for (const facility of facilities) {
        try {
          // Determine care types
          let careTypes = ['Assisted Living'];
          if (facility.facilityType.includes('SKILLED NURSING')) {
            careTypes = ['Skilled Nursing', 'Assisted Living'];
          } else if (facility.facilityType.includes('INTERMEDIATE')) {
            careTypes = ['Intermediate Care', 'Assisted Living'];
          } else if (facility.facilityType.includes('HOSPICE')) {
            careTypes = ['Hospice Care', 'Assisted Living'];
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
          
          console.log(`   ✅ Added: ${facility.name} in ${facility.city}`);
          
        } catch (error) {
          console.error(`   ❌ Error adding ${facility.name}:`, error.message);
        }
      }
      
      console.log(`✅ Completed ${county} County: ${facilities.length} facilities processed`);
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 COMPLETE CALIFORNIA EXPANSION RESULTS');
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show final statistics
    const finalResult = await pool.query(statusQuery);
    const finalStats = finalResult.rows[0];
    
    console.log('\n📊 Final California Coverage:');
    console.log(`   Total Communities: ${finalStats.total} (was ${currentStats.total})`);
    console.log(`   Unique Counties: ${finalStats.counties} (was ${currentStats.counties})`);
    console.log(`   Unique Cities: ${finalStats.cities} (was ${currentStats.cities})`);
    
    // Show all counties now covered
    const allCountiesQuery = `
      SELECT UPPER(county) as county_name, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
      GROUP BY UPPER(county)
      ORDER BY count DESC
    `;
    
    const allCountiesResult = await pool.query(allCountiesQuery);
    
    console.log('\n🏛️ All California Counties Now Covered:');
    allCountiesResult.rows.forEach(row => {
      console.log(`   ${row.county_name}: ${row.count} communities`);
    });
    
    // Show coverage vs all 58 counties
    const coveredCounties = allCountiesResult.rows.length;
    const coveragePercent = ((coveredCounties / 58) * 100).toFixed(1);
    
    console.log(`\n🎯 CALIFORNIA COVERAGE SUMMARY:`);
    console.log(`   Counties Covered: ${coveredCounties} out of 58 (${coveragePercent}%)`);
    console.log(`   Counties with Government Data: ${governmentCounties.length} out of 58`);
    console.log(`   Database Coverage of Available Data: ${((coveredCounties / governmentCounties.length) * 100).toFixed(1)}%`);
    
    // Show total database size
    const totalQuery = `SELECT COUNT(*) as total FROM communities`;
    const totalResult = await pool.query(totalQuery);
    
    console.log('\n🌟 COMPLETE DATABASE STATUS:');
    console.log(`   Total Communities (All States): ${totalResult.rows[0].total}`);
    console.log(`   California Communities: ${finalStats.total}`);
    console.log(`   California Coverage: ${((finalStats.total / totalResult.rows[0].total) * 100).toFixed(1)}% of total database`);
    
  } catch (error) {
    console.error('❌ Complete expansion failed:', error);
  } finally {
    await pool.end();
  }
}

// Run complete expansion
if (require.main === module) {
  completeCaliforniaExpansion().catch(console.error);
}

module.exports = { completeCaliforniaExpansion };