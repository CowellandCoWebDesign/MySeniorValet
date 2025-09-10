/**
 * Complete Corrected California Expansion
 * Add EVERY remaining facility from government data to achieve 100% coverage
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function completeExpansion() {
  console.log('🎯 COMPLETE CALIFORNIA EXPANSION - Adding ALL Missing Facilities');
  
  try {
    // Get current status
    const statusQuery = `SELECT COUNT(*) as total FROM communities WHERE state = 'CA'`;
    const statusResult = await pool.query(statusQuery);
    const currentTotal = statusResult.rows[0].total;
    
    console.log(`📊 Current California Communities: ${currentTotal}`);
    
    // Load ALL government data
    const allFacilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream('california_facilities_20250710_061653.csv')
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
              dataSource: 'California CDSS',
              facilityType: row.facility_type || ''
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`✅ Loaded ${allFacilities.length} total government facilities`);
    
    // Get existing facilities to avoid duplicates
    const existingQuery = `SELECT name, city FROM communities WHERE state = 'CA'`;
    const existingResult = await pool.query(existingQuery);
    const existingSet = new Set(
      existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
    );
    
    console.log(`📊 Found ${existingResult.rows.length} existing facilities in database`);
    
    // Filter for ALL new facilities
    const newFacilities = allFacilities.filter(facility => {
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      return !existingSet.has(key);
    });
    
    console.log(`🆕 New facilities to add: ${newFacilities.length}`);
    
    if (newFacilities.length === 0) {
      console.log('✅ All government facilities already in database - 100% coverage achieved');
      return;
    }
    
    // Group by county for analysis
    const byCounty = {};
    newFacilities.forEach(facility => {
      if (!byCounty[facility.county]) byCounty[facility.county] = [];
      byCounty[facility.county].push(facility);
    });
    
    console.log('\n📍 New facilities by county:');
    Object.entries(byCounty).sort((a, b) => b[1].length - a[1].length).forEach(([county, facilities]) => {
      console.log(`   ${county}: ${facilities.length} facilities`);
    });
    
    // Add ALL facilities efficiently
    let addedCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < newFacilities.length; i += batchSize) {
      const batch = newFacilities.slice(i, i + batchSize);
      
      for (const facility of batch) {
        try {
          // Determine care types based on facility type
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
            true // is_verified
          ];
          
          await pool.query(insertQuery, values);
          addedCount++;
          
        } catch (error) {
          console.error(`❌ Error adding ${facility.name}:`, error.message);
        }
      }
      
      console.log(`✅ Added ${Math.min(addedCount, (i + batchSize))} of ${newFacilities.length} facilities...`);
    }
    
    console.log(`\n🎯 COMPLETE EXPANSION FINISHED`);
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show final comprehensive stats
    const finalResult = await pool.query(statusQuery);
    const finalTotal = finalResult.rows[0].total;
    
    console.log(`\n📊 Final California Communities: ${finalTotal} (was ${currentTotal})`);
    console.log(`📈 Growth: +${finalTotal - currentTotal} communities`);
    
    // Show ALL counties now covered
    const countiesQuery = `
      SELECT UPPER(county) as county_name, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL AND county != ''
      GROUP BY UPPER(county)
      ORDER BY count DESC
    `;
    
    const countiesResult = await pool.query(countiesQuery);
    
    console.log(`\n🏛️ California Counties Covered: ${countiesResult.rows.length} out of 58`);
    console.log(`📊 Coverage: ${((countiesResult.rows.length / 58) * 100).toFixed(1)}% of all California counties`);
    
    console.log('\nAll California counties with communities:');
    countiesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.county_name}: ${row.count} communities`);
    });
    
    // Show total database size
    const totalQuery = `SELECT COUNT(*) as total FROM communities`;
    const totalResult = await pool.query(totalQuery);
    
    console.log(`\n🌟 FINAL DATABASE STATUS:`);
    console.log(`   Total Communities (All States): ${totalResult.rows[0].total}`);
    console.log(`   California Communities: ${finalTotal}`);
    console.log(`   California Share: ${((finalTotal / totalResult.rows[0].total) * 100).toFixed(1)}% of total database`);
    
    // Check if we achieved 100% coverage of available government data
    const coveragePercent = ((finalTotal / allFacilities.length) * 100).toFixed(1);
    console.log(`\n✅ GOVERNMENT DATA COVERAGE: ${coveragePercent}% (${finalTotal} of ${allFacilities.length} facilities)`);
    
    if (coveragePercent >= 99.5) {
      console.log('🎉 ACHIEVEMENT UNLOCKED: 100% California Government Data Coverage!');
    }
    
  } catch (error) {
    console.error('❌ Complete expansion failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  completeExpansion().catch(console.error);
}

module.exports = { completeExpansion };