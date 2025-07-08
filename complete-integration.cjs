/**
 * Complete California Integration - Include Healthcare Facilities
 * Import remaining 1,205 skilled nursing facilities
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
    // Healthcare facilities are primarily skilled nursing
    if (facility.facility_type && facility.facility_type.includes('SKILLED NURSING')) {
      careTypes.push('Skilled Nursing');
    } else {
      careTypes.push('Skilled Nursing'); // Default for healthcare facilities
    }
  }
  
  // Add additional care types based on name
  if (facility.name) {
    const name = facility.name.toUpperCase();
    if (name.includes('MEMORY CARE') || name.includes('ALZHEIMER')) {
      careTypes.push('Memory Care');
    }
    if (name.includes('REHABILITATION') || name.includes('REHAB')) {
      careTypes.push('Skilled Nursing');
    }
    if (name.includes('ASSISTED LIVING')) {
      careTypes.push('Assisted Living');
    }
  }
  
  return careTypes.length > 0 ? [...new Set(careTypes)] : ['Assisted Living'];
}

async function checkExistingFacility(facility) {
  const client = await pool.connect();
  
  try {
    // Check for exact name match
    const nameMatch = await client.query(
      'SELECT id FROM communities WHERE LOWER(name) = LOWER($1)',
      [facility.name]
    );
    
    if (nameMatch.rows.length > 0) {
      return nameMatch.rows[0].id;
    }
    
    // Check for license number match
    if (facility.license_number) {
      const licenseMatch = await client.query(
        'SELECT id FROM communities WHERE license_number = $1',
        [facility.license_number]
      );
      
      if (licenseMatch.rows.length > 0) {
        return licenseMatch.rows[0].id;
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

async function parseCSVData() {
  const facilities = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      reject(new Error(`CSV file not found: ${CSV_FILE}`));
      return;
    }
    
    console.log(`📄 Reading ${CSV_FILE}...`);
    
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        if (row.name && row.address && row.data_source === 'healthcare_facilities') {
          facilities.push(row);
        }
      })
      .on('end', () => {
        console.log(`✅ Found ${facilities.length} healthcare facilities to process`);
        resolve(facilities);
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('🏥 California Healthcare Facilities Integration');
  console.log('=============================================');
  
  try {
    // Load healthcare facilities only
    console.log('\n📄 Loading healthcare facility data...');
    const facilities = await parseCSVData();
    
    if (facilities.length === 0) {
      console.log('❌ No healthcare facilities found to import');
      return;
    }
    
    // Get current database count
    const client = await pool.connect();
    const countBefore = await client.query('SELECT COUNT(*) as count FROM communities');
    console.log(`📊 Communities before integration: ${countBefore.rows[0].count}`);
    client.release();
    
    // Process healthcare facilities
    console.log('\n🔄 Processing healthcare facilities...');
    let inserted = 0;
    let skipped = 0;
    let duplicates = 0;
    
    for (let i = 0; i < facilities.length; i++) {
      const facility = facilities[i];
      
      if (i % 50 === 0) {
        console.log(`📊 Progress: ${i + 1}/${facilities.length} (${Math.round((i + 1) / facilities.length * 100)}%)`);
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
        skipped++;
      }
    }
    
    // Get final database count
    const clientFinal = await pool.connect();
    const countAfter = await clientFinal.query('SELECT COUNT(*) as count FROM communities');
    const govVerified = await clientFinal.query('SELECT COUNT(*) as count FROM communities WHERE government_verified = true');
    clientFinal.release();
    
    console.log('\n📊 Healthcare Integration Results:');
    console.log(`✅ Inserted: ${inserted} new healthcare facilities`);
    console.log(`🔄 Duplicates: ${duplicates} already exist`);
    console.log(`⏭️  Skipped: ${skipped} errors`);
    console.log(`📊 Total communities: ${countAfter.rows[0].count}`);
    console.log(`🏛️  Government verified: ${govVerified.rows[0].count}`);
    
    const totalIncrease = countAfter.rows[0].count - countBefore.rows[0].count;
    console.log(`📈 Net increase: +${totalIncrease} communities`);
    
    console.log('\n🎉 Healthcare facilities integration complete!');
    
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };