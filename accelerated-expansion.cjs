/**
 * Accelerated California Expansion - Process All 2,145 Government Facilities
 * Complete the integration of remaining government facilities
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function cleanPhoneNumber(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

async function determineCareTypes(facility) {
  const careTypes = [];
  
  if (facility.data_source === 'alw_assisted_living') {
    careTypes.push('Assisted Living');
  } else if (facility.data_source === 'healthcare_facilities') {
    careTypes.push('Skilled Nursing');
    
    // Add specific care types based on facility type
    if (facility.facility_type) {
      const type = facility.facility_type.toUpperCase();
      if (type.includes('REHABILITATION') || type.includes('REHAB')) {
        careTypes.push('Rehabilitation');
      }
      if (type.includes('MEMORY') || type.includes('ALZHEIMER')) {
        careTypes.push('Memory Care');
      }
    }
  }
  
  // Add care types based on facility name
  if (facility.name) {
    const name = facility.name.toUpperCase();
    if (name.includes('MEMORY CARE') || name.includes('ALZHEIMER')) {
      careTypes.push('Memory Care');
    }
    if (name.includes('INDEPENDENT LIVING')) {
      careTypes.push('Independent Living');
    }
    if (name.includes('REHABILITATION') || name.includes('REHAB')) {
      careTypes.push('Rehabilitation');
    }
  }
  
  return careTypes.length > 0 ? [...new Set(careTypes)] : ['Assisted Living'];
}

async function checkExistingFacility(facility) {
  const client = await pool.connect();
  
  try {
    // Check for name and city match (less strict for healthcare facilities)
    const nameMatch = await client.query(
      'SELECT id FROM communities WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2)',
      [facility.name, facility.city]
    );
    
    if (nameMatch.rows.length > 0) {
      return nameMatch.rows[0].id;
    }
    
    // Check for license number match if available
    if (facility.license_number && facility.license_number !== '') {
      const licenseMatch = await client.query(
        'SELECT id FROM communities WHERE license_number = $1',
        [facility.license_number]
      );
      
      if (licenseMatch.rows.length > 0) {
        return licenseMatch.rows[0].id;
      }
    }
    
    // Check for similar address if coordinates match
    if (facility.latitude && facility.longitude) {
      const coordMatch = await client.query(
        'SELECT id FROM communities WHERE ABS(latitude - $1) < 0.001 AND ABS(longitude - $2) < 0.001',
        [parseFloat(facility.latitude), parseFloat(facility.longitude)]
      );
      
      if (coordMatch.rows.length > 0) {
        return coordMatch.rows[0].id;
      }
    }
    
    return null;
    
  } finally {
    client.release();
  }
}

async function insertFacility(facility) {
  const client = await pool.connect();
  
  try {
    const careTypes = await determineCareTypes(facility);
    const cleanPhone = await cleanPhoneNumber(facility.phone);
    const capacity = facility.capacity && !isNaN(facility.capacity) ? parseInt(facility.capacity) : null;
    
    const insertQuery = `
      INSERT INTO communities (
        name, address, city, state, zip_code, phone, 
        latitude, longitude, care_types, capacity, 
        license_number, data_source, government_verified,
        county, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id
    `;
    
    const values = [
      facility.name || 'Unknown',
      facility.address || '',
      facility.city || '',
      'California',
      facility.zip || '',
      cleanPhone,
      facility.latitude ? parseFloat(facility.latitude) : null,
      facility.longitude ? parseFloat(facility.longitude) : null,
      careTypes,
      capacity,
      facility.license_number || '',
      facility.data_source || 'california_government',
      true,
      facility.county || ''
    ];
    
    const result = await client.query(insertQuery, values);
    return result.rows[0].id;
    
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return null; // Skip duplicates
    }
    throw error;
  } finally {
    client.release();
  }
}

async function parseAllFacilities() {
  const facilities = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      reject(new Error(`CSV file not found: ${CSV_FILE}`));
      return;
    }
    
    console.log(`📄 Reading all facilities from ${CSV_FILE}...`);
    
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        if (row.name && row.address && row.data_source) {
          facilities.push(row);
        }
      })
      .on('end', () => {
        console.log(`✅ Found ${facilities.length} total government facilities to process`);
        resolve(facilities);
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 ACCELERATED CALIFORNIA EXPANSION');
  console.log('Processing ALL 2,145 Government Facilities');
  console.log('=====================================');
  
  try {
    // Load all government facilities
    console.log('\n📄 Loading complete government facility dataset...');
    const allFacilities = await parseAllFacilities();
    
    if (allFacilities.length === 0) {
      console.log('❌ No government facilities found to import');
      return;
    }
    
    // Get current database count
    const client = await pool.connect();
    const countBefore = await client.query('SELECT COUNT(*) as count FROM communities');
    const govBefore = await client.query('SELECT COUNT(*) as count FROM communities WHERE government_verified = true');
    console.log(`📊 Communities before expansion: ${countBefore.rows[0].count}`);
    console.log(`📊 Government verified before: ${govBefore.rows[0].count}`);
    client.release();
    
    // Separate ALW and healthcare facilities
    const alwFacilities = allFacilities.filter(f => f.data_source === 'alw_assisted_living');
    const healthcareFacilities = allFacilities.filter(f => f.data_source === 'healthcare_facilities');
    
    console.log(`\n🏠 ALW Assisted Living Facilities: ${alwFacilities.length}`);
    console.log(`🏥 Healthcare Facilities: ${healthcareFacilities.length}`);
    
    // Process all facilities with progress tracking
    console.log('\n🔄 Processing all government facilities...');
    let inserted = 0;
    let skipped = 0;
    let duplicates = 0;
    let errors = 0;
    
    for (let i = 0; i < allFacilities.length; i++) {
      const facility = allFacilities[i];
      
      // Progress update every 100 facilities
      if (i % 100 === 0) {
        console.log(`📊 Progress: ${i + 1}/${allFacilities.length} (${Math.round((i + 1) / allFacilities.length * 100)}%) - Inserted: ${inserted}, Duplicates: ${duplicates}`);
      }
      
      try {
        // Check if facility already exists
        const existingId = await checkExistingFacility(facility);
        if (existingId) {
          duplicates++;
          continue;
        }
        
        // Insert new facility
        const id = await insertFacility(facility);
        if (id) {
          inserted++;
        } else {
          skipped++;
        }
        
      } catch (error) {
        console.error(`❌ Error with ${facility.name}:`, error.message);
        errors++;
        
        // Don't stop on individual errors, continue processing
        if (errors > 50) {
          console.log('❌ Too many errors, stopping processing');
          break;
        }
      }
    }
    
    // Get final database count
    const clientFinal = await pool.connect();
    const countAfter = await clientFinal.query('SELECT COUNT(*) as count FROM communities');
    const govAfter = await clientFinal.query('SELECT COUNT(*) as count FROM communities WHERE government_verified = true');
    const alwCount = await clientFinal.query('SELECT COUNT(*) as count FROM communities WHERE data_source = $1', ['alw_assisted_living']);
    const healthcareCount = await clientFinal.query('SELECT COUNT(*) as count FROM communities WHERE data_source = $1', ['healthcare_facilities']);
    clientFinal.release();
    
    console.log('\n🎉 ACCELERATED EXPANSION RESULTS:');
    console.log(`✅ Inserted: ${inserted} new government facilities`);
    console.log(`🔄 Duplicates: ${duplicates} already existed`);
    console.log(`⏭️  Skipped: ${skipped} errors`);
    console.log(`❌ Errors: ${errors} failed insertions`);
    console.log(`\n📊 FINAL DATABASE STATUS:`);
    console.log(`📈 Total communities: ${countAfter.rows[0].count}`);
    console.log(`🏛️  Government verified: ${govAfter.rows[0].count}`);
    console.log(`🏠 ALW facilities: ${alwCount.rows[0].count}`);
    console.log(`🏥 Healthcare facilities: ${healthcareCount.rows[0].count}`);
    
    const totalIncrease = countAfter.rows[0].count - countBefore.rows[0].count;
    const govIncrease = govAfter.rows[0].count - govBefore.rows[0].count;
    console.log(`📈 Net increase: +${totalIncrease} communities`);
    console.log(`📈 Gov verified increase: +${govIncrease} facilities`);
    
    console.log('\n🎯 MISSION STATUS: CALIFORNIA EXPANSION COMPLETE!');
    console.log(`Target: 2,145 government facilities`);
    console.log(`Processed: ${allFacilities.length} facilities`);
    console.log(`Success Rate: ${Math.round(inserted / allFacilities.length * 100)}%`);
    
  } catch (error) {
    console.error('❌ Expansion failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };