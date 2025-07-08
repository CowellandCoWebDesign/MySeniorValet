/**
 * Simple California Government Data Integration
 * Direct insertion approach with minimal duplicate checking
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_FILE = './california_facilities_20250708_044619.csv';

async function addMissingColumns() {
  const client = await pool.connect();
  
  try {
    const alterQueries = [
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS government_verified BOOLEAN DEFAULT false',
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS data_source VARCHAR(100)',
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS capacity INTEGER'
    ];
    
    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log('✅ Column added successfully');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ Error:', error.message);
        }
      }
    }
  } finally {
    client.release();
  }
}

async function cleanPhoneNumber(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

async function insertFacility(facility) {
  const client = await pool.connect();
  
  try {
    // Determine care types
    let careTypes = ['Assisted Living'];
    if (facility.data_source === 'healthcare_facilities') {
      if (facility.facility_type && facility.facility_type.includes('SKILLED NURSING')) {
        careTypes = ['Skilled Nursing'];
      }
    }
    
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
        if (row.name && row.address) {
          facilities.push(row);
        }
      })
      .on('end', () => {
        console.log(`✅ Found ${facilities.length} valid facilities`);
        resolve(facilities);
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('🏛️  California Government Data Integration (Simple)');
  console.log('==================================================');
  
  try {
    // Add columns
    console.log('\n📊 Updating database schema...');
    await addMissingColumns();
    
    // Load data
    console.log('\n📄 Loading facility data...');
    const facilities = await parseCSVData();
    
    // Insert facilities
    console.log('\n🔄 Inserting facilities...');
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < facilities.length; i++) {
      const facility = facilities[i];
      
      if (i % 100 === 0) {
        console.log(`📊 Progress: ${i + 1}/${facilities.length} (${Math.round((i + 1) / facilities.length * 100)}%)`);
      }
      
      try {
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
    
    console.log('\n📊 Integration Results:');
    console.log(`✅ Inserted: ${inserted} new facilities`);
    console.log(`⏭️  Skipped: ${skipped} duplicates/errors`);
    
    // Get final stats
    const client = await pool.connect();
    try {
      const stats = await client.query('SELECT COUNT(*) as total FROM communities');
      console.log(`📊 Total communities in database: ${stats.rows[0].total}`);
    } finally {
      client.release();
    }
    
    console.log('\n🎉 Integration complete!');
    
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };