/**
 * Complete Missing Communities Integration
 * Load the missing 443 communities from the latest California government data
 * 
 * Status: Found 2,145 facilities, loaded 1,702, missing 443 (20.6%)
 * Target: Load all 2,145 facilities to achieve 100% completion
 */

const fs = require('fs');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const csv = require('csv-parser');
const ws = require('ws');

// Configure Neon
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Use the LATEST CSV file with all 2,145 facilities
const CSV_FILE = './california_facilities_20250708_063735.csv';

// Care type mapping based on government data
const CARE_TYPE_MAPPING = {
  'ALW': 'Assisted Living',
  'SKILLED NURSING FACILITY': 'Skilled Nursing',
  'RESIDENTIAL CARE': 'Assisted Living',
  'NURSING HOME': 'Skilled Nursing',
  'BOARD AND CARE': 'Assisted Living',
  'MEMORY CARE': 'Memory Care',
  'CONTINUING CARE': 'Continuing Care Retirement Community',
  'ADULT DAY CARE': 'Adult Day Care',
  'HOSPICE': 'Hospice Care'
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
  
  return digits.length >= 7 ? digits : null;
}

async function determineCareTypes(facility) {
  const careTypes = [];
  
  // Check facility type
  const facilityType = facility.facility_type || facility.type || '';
  
  // Map based on facility type
  if (facilityType.includes('ALW') || facilityType.includes('ASSISTED LIVING')) {
    careTypes.push('Assisted Living');
  }
  
  if (facilityType.includes('SKILLED NURSING') || facilityType.includes('NURSING HOME')) {
    careTypes.push('Skilled Nursing');
  }
  
  if (facilityType.includes('MEMORY CARE')) {
    careTypes.push('Memory Care');
  }
  
  if (facilityType.includes('RESIDENTIAL CARE') || facilityType.includes('BOARD AND CARE')) {
    careTypes.push('Assisted Living');
  }
  
  // Default to assisted living if no specific type found
  if (careTypes.length === 0) {
    careTypes.push('Assisted Living');
  }
  
  return careTypes;
}

async function loadMissingCommunities() {
  console.log('🚀 COMPLETE MISSING COMMUNITIES INTEGRATION');
  console.log('===========================================');
  console.log('Target: Load all 2,145 facilities from California government data');
  console.log('Current: 1,702 communities loaded');
  console.log('Missing: 443 communities (20.6%)');
  console.log('');
  
  try {
    // Get current count
    const client = await pool.connect();
    const currentCount = await client.query('SELECT COUNT(*) as count FROM communities');
    console.log(`Starting with: ${currentCount.rows[0].count} communities`);
    client.release();
    
    // Load ALL facilities from the latest CSV
    console.log('\n📄 Loading ALL facilities from latest CSV...');
    const allFacilities = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.address) {
            allFacilities.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Found ${allFacilities.length} total facilities in CSV`);
    
    // Get existing facility names to avoid exact duplicates
    const existingClient = await pool.connect();
    const existing = await existingClient.query('SELECT LOWER(name) as name, LOWER(city) as city FROM communities');
    const existingSet = new Set();
    existing.rows.forEach(row => {
      existingSet.add(`${row.name}|${row.city}`);
    });
    existingClient.release();
    
    console.log(`Found ${existingSet.size} existing communities in database`);
    
    // Filter for missing communities
    const missingFacilities = allFacilities.filter(facility => {
      const key = `${facility.name.toLowerCase()}|${facility.city.toLowerCase()}`;
      return !existingSet.has(key);
    });
    
    console.log(`Found ${missingFacilities.length} missing communities to add`);
    
    if (missingFacilities.length === 0) {
      console.log('✅ All facilities are already loaded!');
      return;
    }
    
    // Insert missing communities
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n🏥 Processing missing communities...');
    
    for (const facility of missingFacilities) {
      try {
        const careTypes = await determineCareTypes(facility);
        const phone = await cleanPhoneNumber(facility.phone);
        
        // Use realistic pricing based on care type
        const priceRanges = {
          'Skilled Nursing': { min: 8000, max: 12000 },
          'Memory Care': { min: 6500, max: 9500 },
          'Assisted Living': { min: 4200, max: 7000 },
          'Independent Living': { min: 2800, max: 4500 },
          'Adult Day Care': { min: 1500, max: 2500 },
          'Hospice Care': { min: 3000, max: 5000 }
        };
        
        const primaryCareType = careTypes[0];
        const pricing = priceRanges[primaryCareType] || priceRanges['Assisted Living'];
        
        const insertClient = await pool.connect();
        
        const query = `
          INSERT INTO communities (
            name, address, city, state, zip_code, phone, care_types,
            price_range, pricing_type, is_verified, 
            discovery_source, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
          ) RETURNING id
        `;
        
        const values = [
          facility.name.trim(),
          facility.address.trim(),
          facility.city.trim(),
          STATE_MAPPING[facility.state?.toUpperCase()] || 'California',
          facility.zip_code || facility.zipcode || '00000', // Default zip if missing
          phone,
          careTypes,
          JSON.stringify(pricing), // Store as JSON
          'estimated',
          true,
          'california_government_data',
        ];
        
        await insertClient.query(query, values);
        insertClient.release();
        
        successCount++;
        
        if (successCount % 50 === 0) {
          console.log(`✅ Processed ${successCount} communities...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${facility.name}: ${error.message}`);
        
        if (errorCount > 10) {
          console.error('Too many errors, stopping...');
          break;
        }
      }
    }
    
    // Final results
    console.log('\n📊 FINAL RESULTS');
    console.log('================');
    console.log(`Successfully added: ${successCount} communities`);
    console.log(`Errors: ${errorCount}`);
    
    // Get new total
    const finalClient = await pool.connect();
    const finalCount = await finalClient.query('SELECT COUNT(*) as count FROM communities');
    finalClient.release();
    
    console.log(`Final database count: ${finalCount.rows[0].count}`);
    console.log(`Original target: 2,145 facilities`);
    console.log(`Completion rate: ${((finalCount.rows[0].count / 2145) * 100).toFixed(1)}%`);
    
    if (finalCount.rows[0].count >= 2145) {
      console.log('🎉 SUCCESS! All California government facilities loaded!');
    } else {
      console.log(`📝 Still missing: ${2145 - finalCount.rows[0].count} communities`);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Run the integration
loadMissingCommunities();