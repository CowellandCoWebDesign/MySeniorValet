/**
 * Complete California Expansion
 * Systematic addition of all missing California facilities
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Complete California expansion with progress tracking
 */
async function completeCaliforniaExpansion() {
  console.log('🚀 Complete California Expansion - Systematic Addition');
  console.log('=' * 50);
  
  try {
    // Check current status
    const currentQuery = `
      SELECT 
        COUNT(*) as total_communities,
        COUNT(DISTINCT city) as unique_cities,
        COUNT(DISTINCT county) as unique_counties
      FROM communities 
      WHERE state = 'CA'
    `;
    
    const currentResult = await pool.query(currentQuery);
    const currentStats = currentResult.rows[0];
    
    console.log(`📊 Current California Coverage:`);
    console.log(`   Total Communities: ${currentStats.total_communities}`);
    console.log(`   Unique Cities: ${currentStats.unique_cities}`);
    console.log(`   Unique Counties: ${currentStats.unique_counties}`);
    
    // Load facilities from CSV
    const csvFile = 'california_facilities_20250710_061653.csv';
    console.log(`📄 Loading facilities from: ${csvFile}`);
    
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
    
    console.log(`✅ Loaded ${facilities.length} facilities from government data`);
    
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
      console.log('✅ All California facilities already in database');
      return;
    }
    
    // Group by priority regions
    const priorityRegions = {
      'Los Angeles County': [],
      'Orange County': [],
      'San Diego County': [],
      'Other Counties': []
    };
    
    newFacilities.forEach(facility => {
      const county = facility.county.toLowerCase();
      if (county.includes('los angeles')) {
        priorityRegions['Los Angeles County'].push(facility);
      } else if (county.includes('orange')) {
        priorityRegions['Orange County'].push(facility);
      } else if (county.includes('san diego')) {
        priorityRegions['San Diego County'].push(facility);
      } else {
        priorityRegions['Other Counties'].push(facility);
      }
    });
    
    console.log('\n📍 New Facilities by Region:');
    Object.entries(priorityRegions).forEach(([region, facilities]) => {
      console.log(`   ${region}: ${facilities.length} facilities`);
    });
    
    // Add facilities region by region
    let totalAdded = 0;
    
    for (const [region, regionFacilities] of Object.entries(priorityRegions)) {
      if (regionFacilities.length === 0) continue;
      
      console.log(`\n🏠 Adding ${regionFacilities.length} facilities in ${region}...`);
      
      for (let i = 0; i < regionFacilities.length; i++) {
        const facility = regionFacilities[i];
        
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
          totalAdded++;
          
          if (totalAdded % 25 === 0) {
            console.log(`   ✅ ${totalAdded} facilities added so far (${region})`);
          }
          
        } catch (error) {
          console.error(`❌ Error adding ${facility.name}:`, error.message);
        }
      }
      
      console.log(`✅ Completed ${region}: ${regionFacilities.length} facilities processed`);
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 Complete California Expansion Results');
    console.log(`✅ Successfully added: ${totalAdded} new facilities`);
    
    // Show final coverage
    const finalResult = await pool.query(currentQuery);
    const finalStats = finalResult.rows[0];
    
    console.log('\n📊 Final California Coverage:');
    console.log(`   Total Communities: ${finalStats.total_communities} (was ${currentStats.total_communities})`);
    console.log(`   Unique Cities: ${finalStats.unique_cities} (was ${currentStats.unique_cities})`);
    console.log(`   Unique Counties: ${finalStats.unique_counties} (was ${currentStats.unique_counties})`);
    
    // Show major cities
    const majorCitiesQuery = `
      SELECT city, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' 
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 15
    `;
    
    const majorCitiesResult = await pool.query(majorCitiesQuery);
    
    console.log('\n🏙️ Major California Cities Now Covered:');
    majorCitiesResult.rows.forEach(row => {
      console.log(`   ${row.city}: ${row.count} communities`);
    });
    
  } catch (error) {
    console.error('❌ Complete expansion failed:', error);
  } finally {
    await pool.end();
  }
}

// Run expansion
if (require.main === module) {
  completeCaliforniaExpansion().catch(console.error);
}

module.exports = { completeCaliforniaExpansion };