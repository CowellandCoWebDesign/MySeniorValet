/**
 * CCLD Adult Residential & RCFE Data Integration Script
 * Integrates Community Care Licensing Division facilities including:
 * - Adult Residential Facilities (ARF)
 * - Residential Care Facilities for the Elderly (RCFE)
 * - Enhanced Behavioral Support Homes
 * - Social Rehabilitation Facilities
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Facility type mappings
const FACILITY_TYPE_MAP = {
  'ADULT RESIDENTIAL': 'Adult Residential Facility',
  'ARF': 'Adult Residential Facility',
  'RESIDENTIAL CARE FACILITY FOR THE ELDERLY': 'Residential Care Facility for the Elderly',
  'RCFE': 'Residential Care Facility for the Elderly',
  'ENHANCED BEHAVIORAL': 'Enhanced Behavioral Support Home',
  'EBSH': 'Enhanced Behavioral Support Home',
  'SOCIAL REHABILITATION': 'Social Rehabilitation Facility',
  'SRF': 'Social Rehabilitation Facility',
  'COMMUNITY CRISIS': 'Community Crisis Home',
  'CCH': 'Community Crisis Home'
};

async function integrateCCLDData(filename) {
  console.log('🎯 CCLD Adult Residential & RCFE Data Integration');
  console.log('=' * 50);
  
  if (!fs.existsSync(filename)) {
    console.log(`❌ File not found: ${filename}`);
    console.log('\n📥 To get the CCLD data:');
    console.log('1. Visit: https://data.chhs.ca.gov/dataset/ccl-facilities');
    console.log('2. Click "Download" on the dataset');
    console.log('3. Save the CSV file as: california_ccld_facilities.csv');
    console.log('4. Run this script again: node integrate-ccld-data.cjs california_ccld_facilities.csv');
    return;
  }
  
  try {
    // Get current database stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT UPPER(county)) as counties,
        COUNT(DISTINCT city) as cities
      FROM communities 
      WHERE state = 'CA'
    `;
    
    const statsResult = await pool.query(statsQuery);
    const currentStats = statsResult.rows[0];
    
    console.log(`📊 Current California Database:`);
    console.log(`   Total Communities: ${currentStats.total}`);
    console.log(`   Counties: ${currentStats.counties}`);
    console.log(`   Cities: ${currentStats.cities}`);
    
    // Load CCLD data
    const facilities = [];
    const typeCount = {};
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (row) => {
          // Look for facility type in various possible column names
          let facilityType = row.facility_type || row.FACILITY_TYPE || 
                            row.type || row.TYPE || row.category || '';
          
          // Count facility types
          if (facilityType) {
            typeCount[facilityType] = (typeCount[facilityType] || 0) + 1;
          }
          
          // Filter for Adult Residential and RCFE facilities
          const isAdultCare = Object.keys(FACILITY_TYPE_MAP).some(key => 
            facilityType.toUpperCase().includes(key)
          );
          
          if (isAdultCare) {
            facilities.push({
              name: row.facility_name || row.FACILITY_NAME || row.name || '',
              address: row.address || row.ADDRESS || row.street_address || '',
              city: row.city || row.CITY || '',
              county: row.county || row.COUNTY || '',
              state: 'CA',
              zipCode: row.zip || row.ZIP || row.zip_code || '',
              phone: row.phone || row.PHONE || row.telephone || '',
              facilityType: facilityType,
              capacity: row.capacity || row.CAPACITY || '',
              status: row.status || row.STATUS || 'Active',
              licenseNumber: row.license_number || row.LICENSE_NUMBER || '',
              latitude: parseFloat(row.latitude || row.LATITUDE || row.lat) || null,
              longitude: parseFloat(row.longitude || row.LONGITUDE || row.lng) || null
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`\n📊 CCLD Facility Types Found:`);
    Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log(`\n✅ Found ${facilities.length} Adult Residential/RCFE facilities to integrate`);
    
    if (facilities.length === 0) {
      console.log('❌ No Adult Residential or RCFE facilities found in the file');
      console.log('   Please check the column names in your CSV file');
      return;
    }
    
    // Get existing facilities to avoid duplicates
    const existingQuery = `SELECT name, city FROM communities WHERE state = 'CA'`;
    const existingResult = await pool.query(existingQuery);
    const existingSet = new Set(
      existingResult.rows.map(row => `${row.name}|${row.city}`.toLowerCase())
    );
    
    // Filter new facilities
    const newFacilities = facilities.filter(facility => {
      const key = `${facility.name}|${facility.city}`.toLowerCase();
      return !existingSet.has(key) && facility.name && facility.city;
    });
    
    console.log(`🆕 New facilities to add: ${newFacilities.length}`);
    
    // Add facilities in batches
    let addedCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < newFacilities.length; i += batchSize) {
      const batch = newFacilities.slice(i, i + batchSize);
      
      for (const facility of batch) {
        try {
          // Map facility type to care types
          let careTypes = ['Assisted Living'];
          const upperType = facility.facilityType.toUpperCase();
          
          if (upperType.includes('RCFE') || upperType.includes('ELDERLY')) {
            careTypes = ['Assisted Living', 'Residential Care'];
          } else if (upperType.includes('ARF') || upperType.includes('ADULT RESIDENTIAL')) {
            careTypes = ['Adult Residential', 'Assisted Living'];
          } else if (upperType.includes('BEHAVIORAL')) {
            careTypes = ['Behavioral Support', 'Assisted Living'];
          } else if (upperType.includes('REHABILITATION')) {
            careTypes = ['Social Rehabilitation', 'Assisted Living'];
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
            facility.county.toUpperCase(),
            careTypes,
            [], // amenities
            [], // services
            [], // medical_restrictions
            facility.latitude,
            facility.longitude,
            'California CCLD',
            new Date().toISOString(),
            true // is_verified (government data)
          ];
          
          await pool.query(insertQuery, values);
          addedCount++;
          
        } catch (error) {
          console.error(`❌ Error adding ${facility.name}:`, error.message);
        }
      }
      
      console.log(`✅ Added ${Math.min(addedCount, (i + batchSize))} of ${newFacilities.length} facilities...`);
    }
    
    console.log(`\n🎯 INTEGRATION COMPLETE`);
    console.log(`✅ Successfully added: ${addedCount} new facilities`);
    
    // Show final stats
    const finalResult = await pool.query(statsQuery);
    const finalStats = finalResult.rows[0];
    
    console.log('\n📊 Final California Coverage:');
    console.log(`   Total Communities: ${finalStats.total} (was ${currentStats.total})`);
    console.log(`   Counties: ${finalStats.counties} (was ${currentStats.counties})`);
    console.log(`   Cities: ${finalStats.cities} (was ${currentStats.cities})`);
    console.log(`   Growth: +${finalStats.total - currentStats.total} communities`);
    
    // Show total database size
    const totalQuery = `SELECT COUNT(*) as total FROM communities`;
    const totalResult = await pool.query(totalQuery);
    
    console.log(`\n🌟 Total Database Size: ${totalResult.rows[0].total} communities`);
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Check command line arguments
const filename = process.argv[2] || 'california_ccld_facilities.csv';

if (require.main === module) {
  integrateCCLDData(filename).catch(console.error);
}

module.exports = { integrateCCLDData };