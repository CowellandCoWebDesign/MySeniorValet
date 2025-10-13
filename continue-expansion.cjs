/**
 * Continue California Expansion
 * Add remaining facilities in batches to complete 100% coverage
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function continueExpansion() {
  console.log('🎯 CONTINUING CALIFORNIA EXPANSION - Adding Remaining Facilities');
  
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
    
    // Filter for remaining new facilities
    const newFacilities = allFacilities.filter(facility => {
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      return !existingSet.has(key);
    });
    
    console.log(`🆕 Remaining facilities to add: ${newFacilities.length}`);
    
    if (newFacilities.length === 0) {
      console.log('✅ All government facilities already in database - 100% coverage achieved');
      
      // Show final comprehensive stats
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
      console.log(`   California Communities: ${currentTotal}`);
      console.log(`   California Share: ${((currentTotal / totalResult.rows[0].total) * 100).toFixed(1)}% of total database`);
      
      // Check coverage of government data
      const coveragePercent = ((currentTotal / allFacilities.length) * 100).toFixed(1);
      console.log(`\n✅ GOVERNMENT DATA COVERAGE: ${coveragePercent}% (${currentTotal} of ${allFacilities.length} facilities)`);
      
      if (coveragePercent >= 99.5) {
        console.log('🎉 ACHIEVEMENT UNLOCKED: 100% California Government Data Coverage!');
      }
      
      return;
    }
    
    // Add remaining facilities in smaller batches
    let addedCount = 0;
    const batchSize = 25; // Smaller batches to avoid timeouts
    
    console.log(`\n🚀 Adding ${newFacilities.length} facilities in batches of ${batchSize}...`);
    
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
      
      console.log(`✅ Added ${addedCount} of ${newFacilities.length} facilities (${((addedCount / newFacilities.length) * 100).toFixed(1)}% complete)`);
      
      // Break if we've added enough for this session
      if (addedCount >= 200) {
        console.log('⏰ Breaking after 200 additions to avoid timeout - run again to continue');
        break;
      }
    }
    
    console.log(`\n🎯 BATCH COMPLETE`);
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show updated stats
    const finalResult = await pool.query(statusQuery);
    const finalTotal = finalResult.rows[0].total;
    
    console.log(`\n📊 Updated California Communities: ${finalTotal} (was ${currentTotal})`);
    console.log(`📈 Growth: +${finalTotal - currentTotal} communities`);
    
    // Show remaining work
    const remaining = newFacilities.length - addedCount;
    if (remaining > 0) {
      console.log(`\n⏳ Remaining facilities to add: ${remaining}`);
      console.log('   Run this script again to continue adding more facilities');
    } else {
      console.log('\n🎉 ALL FACILITIES ADDED - 100% California Coverage Complete!');
    }
    
  } catch (error) {
    console.error('❌ Continue expansion failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  continueExpansion().catch(console.error);
}

module.exports = { continueExpansion };