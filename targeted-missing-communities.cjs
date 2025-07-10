/**
 * Targeted Missing Communities Addition
 * Add specific missing counties and cities to complete California coverage
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Target missing counties (high priority)
const targetCounties = [
  'BUTTE', 'TULARE', 'SONOMA', 'VENTURA', 'SANTA BARBARA', 
  'STANISLAUS', 'MONTEREY', 'PLACER', 'MERCED', 'MADERA',
  'KINGS', 'IMPERIAL', 'HUMBOLDT', 'SOLANO', 'YOLO'
];

// Target missing cities (high priority)
const targetCities = [
  'CHICO', 'VISALIA', 'SANTA ROSA', 'VENTURA', 'OXNARD',
  'SANTA BARBARA', 'MODESTO', 'SALINAS', 'ROSEVILLE',
  'MERCED', 'MADERA', 'HANFORD', 'EUREKA', 'FAIRFIELD', 'DAVIS'
];

/**
 * Add targeted missing communities
 */
async function addTargetedMissingCommunities() {
  console.log('🎯 Adding Targeted Missing California Communities');
  console.log('=' * 50);
  
  try {
    // Load government facility data
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
              county: row.county.trim(),
              state: 'CA',
              zipCode: row.zip || '',
              phone: row.phone || '',
              latitude: parseFloat(row.latitude) || null,
              longitude: parseFloat(row.longitude) || null,
              dataSource: row.data_source || 'California CDSS',
              facilityType: row.facility_type || '',
              capacity: parseInt(row.capacity) || null
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Loaded ${allFacilities.length} government facilities`);
    
    // Get existing facilities
    const existingQuery = `SELECT name, city FROM communities WHERE state = 'CA'`;
    const existingResult = await pool.query(existingQuery);
    const existingSet = new Set(
      existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
    );
    
    console.log(`📊 Found ${existingResult.rows.length} existing California facilities`);
    
    // Filter for target counties and cities
    const targetFacilities = allFacilities.filter(facility => {
      const countyMatch = targetCounties.some(county => 
        facility.county.toUpperCase().includes(county)
      );
      const cityMatch = targetCities.some(city => 
        facility.city.toUpperCase().includes(city)
      );
      
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      const isNew = !existingSet.has(key);
      
      return (countyMatch || cityMatch) && isNew;
    });
    
    console.log(`🎯 Found ${targetFacilities.length} targeted facilities to add`);
    
    if (targetFacilities.length === 0) {
      console.log('✅ All targeted facilities already exist in database');
      return;
    }
    
    // Group by county for organized addition
    const facilitiesByCounty = {};
    targetFacilities.forEach(facility => {
      const county = facility.county.toUpperCase();
      if (!facilitiesByCounty[county]) {
        facilitiesByCounty[county] = [];
      }
      facilitiesByCounty[county].push(facility);
    });
    
    console.log('\n📍 Targeted Facilities by County:');
    Object.entries(facilitiesByCounty).forEach(([county, facilities]) => {
      console.log(`   ${county}: ${facilities.length} facilities`);
    });
    
    // Add facilities county by county
    let totalAdded = 0;
    
    for (const [county, facilities] of Object.entries(facilitiesByCounty)) {
      console.log(`\n🏠 Adding ${facilities.length} facilities in ${county} County...`);
      
      for (const facility of facilities) {
        try {
          // Determine care types based on facility type
          let careTypes = ['Assisted Living'];
          if (facility.facilityType.includes('SKILLED NURSING')) {
            careTypes = ['Skilled Nursing', 'Assisted Living'];
          } else if (facility.facilityType.includes('INTERMEDIATE')) {
            careTypes = ['Intermediate Care', 'Assisted Living'];
          } else if (facility.capacity && facility.capacity <= 6) {
            careTypes = ['Residential Care'];
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
          totalAdded++;
          
          console.log(`   ✅ Added: ${facility.name} in ${facility.city}`);
          
        } catch (error) {
          console.error(`   ❌ Error adding ${facility.name}:`, error.message);
        }
      }
      
      console.log(`✅ Completed ${county} County: ${facilities.length} facilities processed`);
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 Targeted Addition Complete!');
    console.log(`✅ Successfully added: ${totalAdded} new facilities`);
    
    // Show updated California coverage
    const updatedQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT county) as counties
      FROM communities 
      WHERE state = 'CA'
    `;
    
    const updatedResult = await pool.query(updatedQuery);
    const finalStats = updatedResult.rows[0];
    
    console.log('\n📊 Updated California Coverage:');
    console.log(`   Total Communities: ${finalStats.total}`);
    console.log(`   Unique Cities: ${finalStats.cities}`);
    console.log(`   Unique Counties: ${finalStats.counties}`);
    
    // Show new counties added
    const newCountiesQuery = `
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
      GROUP BY county 
      ORDER BY count DESC
    `;
    
    const newCountiesResult = await pool.query(newCountiesQuery);
    
    console.log('\n🏛️ California Counties Now Covered:');
    newCountiesResult.rows.forEach(row => {
      console.log(`   ${row.county}: ${row.count} communities`);
    });
    
    // Show key cities added
    const targetCitiesQuery = `
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND city IN (${targetCities.map(c => `'${c}'`).join(',')})
      GROUP BY city
      ORDER BY count DESC
    `;
    
    const targetCitiesResult = await pool.query(targetCitiesQuery);
    
    console.log('\n🏙️ Key Target Cities Now Covered:');
    targetCitiesResult.rows.forEach(row => {
      console.log(`   ${row.city}: ${row.count} communities`);
    });
    
  } catch (error) {
    console.error('❌ Targeted addition failed:', error);
  } finally {
    await pool.end();
  }
}

// Run targeted addition
if (require.main === module) {
  addTargetedMissingCommunities().catch(console.error);
}

module.exports = { addTargetedMissingCommunities };