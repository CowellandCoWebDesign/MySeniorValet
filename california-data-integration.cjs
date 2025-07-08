/**
 * California Government Data Integration Script
 * Imports 2,145 authentic facilities from California state databases
 * 
 * Data Sources:
 * - ALW Assisted Living Facilities (940 facilities)
 * - Licensed Healthcare Facilities (1,205 facilities)
 */

const fs = require('fs');
const path = require('path');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Government data file
const CSV_FILE = './california_facilities_20250708_044619.csv';

// Care type mapping based on government data
const CARE_TYPE_MAPPING = {
  'ALW': 'Assisted Living',
  'SKILLED NURSING FACILITY': 'Skilled Nursing',
  'RESIDENTIAL CARE': 'Assisted Living',
  'NURSING HOME': 'Skilled Nursing',
  'BOARD AND CARE': 'Assisted Living',
  'MEMORY CARE': 'Memory Care',
  'CONTINUING CARE': 'Continuing Care Retirement Community'
};

// Standard state abbreviation
const STATE_MAPPING = {
  'CA': 'California',
  'CALIFORNIA': 'California'
};

async function cleanPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
}

async function determineCareTypes(facilityData) {
  const careTypes = [];
  
  // Check data source
  if (facilityData.data_source === 'alw_assisted_living') {
    careTypes.push('Assisted Living');
  }
  
  // Check facility type from healthcare data
  if (facilityData.facility_type) {
    const type = facilityData.facility_type.toUpperCase();
    if (type.includes('SKILLED NURSING')) {
      careTypes.push('Skilled Nursing');
    }
    if (type.includes('RESIDENTIAL CARE')) {
      careTypes.push('Assisted Living');
    }
    if (type.includes('MEMORY CARE')) {
      careTypes.push('Memory Care');
    }
  }
  
  // Check facility name for care type indicators
  if (facilityData.name) {
    const name = facilityData.name.toUpperCase();
    if (name.includes('MEMORY CARE') || name.includes('ALZHEIMER')) {
      careTypes.push('Memory Care');
    }
    if (name.includes('INDEPENDENT LIVING')) {
      careTypes.push('Independent Living');
    }
    if (name.includes('CONTINUING CARE') || name.includes('CCRC')) {
      careTypes.push('Continuing Care Retirement Community');
    }
  }
  
  // Default to assisted living if no specific type found
  if (careTypes.length === 0) {
    careTypes.push('Assisted Living');
  }
  
  return [...new Set(careTypes)]; // Remove duplicates
}

async function parseCSVData() {
  const facilities = [];
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      reject(new Error(`CSV file not found: ${CSV_FILE}`));
      return;
    }
    
    console.log(`📄 Reading CSV file: ${CSV_FILE}`);
    
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        facilities.push(row);
      })
      .on('end', () => {
        console.log(`✅ Parsed ${facilities.length} facilities from CSV`);
        resolve(facilities);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function checkDuplicates(facilityData) {
  const client = await pool.connect();
  
  try {
    // Check for exact name and address match
    const exactMatch = await client.query(
      'SELECT id, name, address FROM communities WHERE LOWER(name) = LOWER($1) AND LOWER(address) = LOWER($2)',
      [facilityData.name, facilityData.address]
    );
    
    if (exactMatch.rows.length > 0) {
      return {
        isDuplicate: true,
        existingId: exactMatch.rows[0].id,
        matchType: 'exact'
      };
    }
    
    // Check for phone number match
    if (facilityData.phone) {
      const phoneMatch = await client.query(
        'SELECT id, name, phone FROM communities WHERE phone = $1',
        [facilityData.phone]
      );
      
      if (phoneMatch.rows.length > 0) {
        return {
          isDuplicate: true,
          existingId: phoneMatch.rows[0].id,
          matchType: 'phone'
        };
      }
    }
    
    // Check for similar name and close location
    if (facilityData.latitude && facilityData.longitude) {
      const locationMatch = await client.query(`
        SELECT id, name, address, latitude, longitude
        FROM communities 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND (6371 * acos(cos(radians($1)) * cos(radians(CAST(latitude AS FLOAT))) 
        * cos(radians(CAST(longitude AS FLOAT)) - radians($2)) + sin(radians($1)) 
        * sin(radians(CAST(latitude AS FLOAT))))) < 0.5
        ORDER BY (6371 * acos(cos(radians($1)) * cos(radians(CAST(latitude AS FLOAT))) 
        * cos(radians(CAST(longitude AS FLOAT)) - radians($2)) + sin(radians($1)) 
        * sin(radians(CAST(latitude AS FLOAT)))))
        LIMIT 1
      `, [facilityData.latitude, facilityData.longitude]);
      
      if (locationMatch.rows.length > 0) {
        // Check if names are similar
        const existing = locationMatch.rows[0];
        const nameSimilarity = calculateSimilarity(facilityData.name, existing.name);
        
        if (nameSimilarity > 0.8) {
          return {
            isDuplicate: true,
            existingId: existing.id,
            matchType: 'location_similar'
          };
        }
      }
    }
    
    return { isDuplicate: false };
    
  } finally {
    client.release();
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function insertFacility(facilityData) {
  const client = await pool.connect();
  
  try {
    const careTypes = await determineCareTypes(facilityData);
    const cleanPhone = await cleanPhoneNumber(facilityData.phone);
    
    // Parse capacity
    let capacity = null;
    if (facilityData.capacity && !isNaN(facilityData.capacity)) {
      capacity = parseInt(facilityData.capacity);
    }
    
    // Insert facility
    const insertQuery = `
      INSERT INTO communities (
        name, address, city, state, zip_code, phone, latitude, longitude,
        care_types, capacity, license_number, data_source, government_verified,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id
    `;
    
    const values = [
      facilityData.name || 'Unknown',
      facilityData.address || '',
      facilityData.city || '',
      'California',
      facilityData.zip || '',
      cleanPhone,
      facilityData.latitude ? parseFloat(facilityData.latitude) : null,
      facilityData.longitude ? parseFloat(facilityData.longitude) : null,
      careTypes,
      capacity,
      facilityData.license_number || '',
      facilityData.data_source || 'california_government',
      true, // government_verified
    ];
    
    const result = await client.query(insertQuery, values);
    return result.rows[0].id;
    
  } catch (error) {
    console.error('❌ Error inserting facility:', facilityData.name, error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function updateExistingFacility(existingId, facilityData) {
  const client = await pool.connect();
  
  try {
    // Update with government data while preserving existing enrichments
    const updateQuery = `
      UPDATE communities 
      SET 
        license_number = COALESCE(license_number, $1),
        data_source = COALESCE(data_source, $2),
        government_verified = true,
        phone = COALESCE(phone, $3),
        capacity = COALESCE(capacity, $4),
        updated_at = NOW()
      WHERE id = $5
    `;
    
    const cleanPhone = await cleanPhoneNumber(facilityData.phone);
    let capacity = null;
    if (facilityData.capacity && !isNaN(facilityData.capacity)) {
      capacity = parseInt(facilityData.capacity);
    }
    
    const values = [
      facilityData.license_number || '',
      facilityData.data_source || 'california_government',
      cleanPhone,
      capacity,
      existingId
    ];
    
    await client.query(updateQuery, values);
    console.log(`✅ Updated existing facility ID: ${existingId}`);
    
  } finally {
    client.release();
  }
}

async function addGovernmentVerificationColumns() {
  const client = await pool.connect();
  
  try {
    // Add government verification columns if they don't exist
    const alterQueries = [
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS government_verified BOOLEAN DEFAULT false',
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS data_source VARCHAR(100)',
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS license_number VARCHAR(50)',
      'ALTER TABLE communities ADD COLUMN IF NOT EXISTS capacity INTEGER'
    ];
    
    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log('✅ Added column:', query.split('ADD COLUMN IF NOT EXISTS')[1]?.split(' ')[0]);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ Error adding column:', error.message);
        }
      }
    }
    
  } finally {
    client.release();
  }
}

async function getIntegrationStats() {
  const client = await pool.connect();
  
  try {
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_communities,
        COUNT(CASE WHEN government_verified = true THEN 1 END) as government_verified,
        COUNT(CASE WHEN data_source LIKE '%government%' THEN 1 END) as government_source,
        COUNT(CASE WHEN license_number IS NOT NULL AND license_number != '' THEN 1 END) as with_license
      FROM communities
    `);
    
    return stats.rows[0];
    
  } finally {
    client.release();
  }
}

async function main() {
  console.log('🏛️  California Government Data Integration');
  console.log('=========================================');
  
  try {
    // Add database columns
    console.log('\n📊 Updating database schema...');
    await addGovernmentVerificationColumns();
    
    // Parse CSV data
    console.log('\n📄 Loading government facility data...');
    const facilities = await parseCSVData();
    
    if (facilities.length === 0) {
      console.log('❌ No facilities found in CSV file');
      return;
    }
    
    // Process facilities
    console.log('\n🔄 Processing facilities...');
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < facilities.length; i++) {
      const facility = facilities[i];
      
      if (i % 100 === 0) {
        console.log(`📊 Progress: ${i + 1}/${facilities.length} (${Math.round((i + 1) / facilities.length * 100)}%)`);
      }
      
      try {
        // Skip facilities with no name or address
        if (!facility.name || !facility.address) {
          skipped++;
          continue;
        }
        
        // Check for duplicates
        const duplicateCheck = await checkDuplicates(facility);
        
        if (duplicateCheck.isDuplicate) {
          // Update existing facility with government data
          await updateExistingFacility(duplicateCheck.existingId, facility);
          updated++;
        } else {
          // Insert new facility
          await insertFacility(facility);
          inserted++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing facility ${facility.name}:`, error.message);
        errors++;
      }
    }
    
    // Final statistics
    console.log('\n📊 Integration Complete!');
    console.log('========================');
    console.log(`✅ Inserted: ${inserted} new facilities`);
    console.log(`🔄 Updated: ${updated} existing facilities`);
    console.log(`⏭️  Skipped: ${skipped} incomplete records`);
    console.log(`❌ Errors: ${errors} processing failures`);
    
    // Database statistics
    console.log('\n📈 Database Statistics:');
    const stats = await getIntegrationStats();
    console.log(`📊 Total communities: ${stats.total_communities}`);
    console.log(`🏛️  Government verified: ${stats.government_verified}`);
    console.log(`📄 Government source: ${stats.government_source}`);
    console.log(`📋 With license numbers: ${stats.with_license}`);
    
    console.log('\n🎉 SUCCESS: California government data integration complete!');
    
  } catch (error) {
    console.error('❌ Integration failed:', error.message);
    process.exit(1);
  }
}

// Run the integration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };