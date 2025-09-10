/**
 * California Government Data Integration
 * Imports official CDSS facility data into MySeniorValet database
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const csv = require('csv-parser');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Parse California government facility data
 */
function parseCaliforniaFacilities(csvFile) {
  return new Promise((resolve, reject) => {
    const facilities = [];
    
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse the government facility data
          const facility = {
            name: row.name || row.FACNAME || row.Business_Name || row.Legal_Name || '',
            address: row.address || row.ADDRESS || row.Address || '',
            city: row.city || row.CITY || row.City || '',
            county: row.county || row.COUNTY_NAME || row.County || row.CountyName || '',
            state: 'CA',
            zipCode: row.zip || row.ZIP || row.Zip_Code || '',
            phone: row.phone || row.CONTACT_PHONE_NUMBER || row.Phone_Number || '',
            latitude: parseFloat(row.latitude || row.LATITUDE || row.Latitude) || null,
            longitude: parseFloat(row.longitude || row.LONGITUDE || row.Longitude) || null,
            capacity: parseInt(row.capacity || row.CAPACITY || row.Capacity_Per_PEU) || null,
            licenseNumber: row.license_number || row.LICENSE_NUMBER || row.Number || '',
            dataSource: row.data_source || 'California CDSS'
          };
          
          // Only add if we have minimum required data
          if (facility.name && facility.city) {
            facilities.push(facility);
          }
        } catch (error) {
          console.error('Error parsing facility row:', error);
        }
      })
      .on('end', () => {
        console.log(`✅ Parsed ${facilities.length} California facilities`);
        resolve(facilities);
      })
      .on('error', reject);
  });
}

/**
 * Convert to MySeniorValet format
 */
function convertToMySeniorValetFormat(facility) {
  // Determine care types based on facility type and capacity
  const careTypes = [];
  if (facility.capacity && facility.capacity <= 6) {
    careTypes.push('Residential Care');
  } else if (facility.capacity && facility.capacity > 50) {
    careTypes.push('Skilled Nursing');
  } else {
    careTypes.push('Assisted Living');
  }
  
  return {
    name: facility.name.trim(),
    address: facility.address.trim(),
    city: facility.city.trim(),
    state: facility.state,
    zipCode: facility.zipCode.trim(),
    phone: facility.phone.trim(),
    description: `Licensed senior living facility in ${facility.city}, ${facility.county} County, California.`,
    careTypes: careTypes,
    amenities: [],
    services: [],
    medicalRestrictions: [],
    latitude: facility.latitude,
    longitude: facility.longitude,
    discoverySource: facility.dataSource,
    discoveryDate: new Date().toISOString(),
    isVerified: true, // Government data is verified
    licenseNumber: facility.licenseNumber,
    county: facility.county,
    capacity: facility.capacity
  };
}

/**
 * Insert California facility into database
 */
async function insertCaliforniaFacility(facility) {
  // Check if already exists
  const checkQuery = `SELECT id, name FROM communities WHERE name = $1 AND city = $2`;
  const existingResult = await pool.query(checkQuery, [facility.name, facility.city]);
  
  if (existingResult.rows.length > 0) {
    return { existing: true, facility: existingResult.rows[0] };
  }
  
  const insertQuery = `
    INSERT INTO communities (
      name, address, city, state, zip_code, phone, description,
      care_types, amenities, services, medical_restrictions,
      latitude, longitude, discovery_source, discovery_date, is_verified,
      license_number, county
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    ) 
    RETURNING id, name, city
  `;
  
  const values = [
    facility.name,
    facility.address,
    facility.city,
    facility.state,
    facility.zipCode,
    facility.phone,
    facility.description,
    facility.careTypes,
    facility.amenities,
    facility.services,
    facility.medicalRestrictions,
    facility.latitude,
    facility.longitude,
    facility.discoverySource,
    facility.discoveryDate,
    facility.isVerified,
    facility.licenseNumber,
    facility.county
  ];
  
  try {
    const result = await pool.query(insertQuery, values);
    return { existing: false, facility: result.rows[0] };
  } catch (error) {
    console.error(`❌ Error inserting ${facility.name}:`, error.message);
    throw error;
  }
}

/**
 * Main integration function
 */
async function integrateCalifornia() {
  console.log('🚀 California Government Data Integration');
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
    const facilities = await parseCaliforniaFacilities(csvFile);
    
    console.log(`\n📊 Processing ${facilities.length} California facilities...`);
    
    let newCount = 0;
    let existingCount = 0;
    let errorCount = 0;
    
    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < facilities.length; i += batchSize) {
      const batch = facilities.slice(i, i + batchSize);
      
      console.log(`\n🏠 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(facilities.length/batchSize)} (${batch.length} facilities)`);
      
      for (const facility of batch) {
        try {
          const myseniorvaletFacility = convertToMySeniorValetFormat(facility);
          const result = await insertCaliforniaFacility(myseniorvaletFacility);
          
          if (result.existing) {
            existingCount++;
            if (existingCount % 100 === 0) {
              console.log(`   ⚠️  ${existingCount} existing facilities found so far...`);
            }
          } else {
            newCount++;
            if (newCount % 10 === 0) {
              console.log(`   ✅ ${newCount} new facilities added so far...`);
            }
          }
        } catch (error) {
          errorCount++;
          if (errorCount % 10 === 0) {
            console.log(`   ❌ ${errorCount} errors so far...`);
          }
        }
      }
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 California Integration Complete!');
    console.log(`✅ New facilities added: ${newCount}`);
    console.log(`⚠️  Existing facilities found: ${existingCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${facilities.length}`);
    
    // Show geographic distribution
    const countQuery = `
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'CA' AND county IS NOT NULL
      GROUP BY county 
      ORDER BY count DESC 
      LIMIT 15
    `;
    
    const countyResult = await pool.query(countQuery);
    
    console.log('\n📍 California Counties with Most Communities:');
    countyResult.rows.forEach(row => {
      console.log(`   ${row.county}: ${row.count} facilities`);
    });
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Run integration
if (require.main === module) {
  integrateCalifornia().catch(console.error);
}

module.exports = { integrateCalifornia };