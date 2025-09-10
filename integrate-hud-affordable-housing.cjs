/**
 * HUD Affordable Housing Integration Script
 * Integrates Section 202 (Elderly) and Section 811 (Disabled) housing from official HUD data
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const fs = require('fs');
const csv = require('csv-parser');
const ws = require('ws');

// Configure WebSocket
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Function to parse CSV
function parseCSV(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Function to clean and validate data
function cleanData(row) {
  // Clean phone number
  let phone = row.Phone || '';
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 10) {
    phone = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  } else if (phone.length === 11 && phone.startsWith('1')) {
    phone = `${phone.slice(1, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;
  } else {
    phone = null;
  }
  
  // Determine state from city/county
  let state = row.State;
  const city = (row.City || '').toUpperCase();
  const county = (row.County || '').toUpperCase();
  
  if (!state) {
    // California detection
    const caCities = ['LOS ANGELES', 'SAN FRANCISCO', 'SAN DIEGO', 'SACRAMENTO', 'REDDING', 'CHICO', 'PALM SPRINGS', 'HAYWARD', 'BALDWIN PARK'];
    const caCounties = ['LOS ANGELES', 'SAN FRANCISCO', 'ALAMEDA', 'SACRAMENTO', 'SHASTA', 'BUTTE', 'RIVERSIDE'];
    
    if (caCities.some(c => city.includes(c)) || caCounties.some(c => county.includes(c))) {
      state = 'CA';
    }
    
    // Texas detection
    const txCities = ['HOUSTON', 'DALLAS', 'AUSTIN', 'SAN ANTONIO', 'FORT WORTH', 'EL PASO', 'TEXARKANA', 'SELMA'];
    const txCounties = ['HARRIS', 'DALLAS', 'TRAVIS', 'BEXAR', 'TARRANT', 'EL PASO'];
    
    if (txCities.some(c => city.includes(c)) || txCounties.some(c => county.includes(c))) {
      state = 'TX';
    }
  }
  
  // Determine care type
  let careType = 'affordable_housing';
  if (row.Program_Type.includes('202')) {
    careType = 'affordable_senior_housing';
  } else if (row.Program_Type.includes('811')) {
    careType = 'affordable_disabled_housing';
  } else if (row.Client_Type === 'Elderly') {
    careType = 'affordable_senior_housing';
  } else if (row.Client_Type === 'Disabled') {
    careType = 'affordable_disabled_housing';
  }
  
  return {
    name: row.Property_Name,
    address: row.Address,
    city: row.City,
    state: state,
    zip: row.Zip_Code,
    county: county,
    phone: phone,
    latitude: parseFloat(row.Latitude) || null,
    longitude: parseFloat(row.Longitude) || null,
    units: parseInt(row.Total_Units) || null,
    assistedUnits: parseInt(row.Assisted_Units) || null,
    propertyId: row.Property_ID,
    careType: careType,
    programType: row.Program_Type,
    clientGroup: row.Client_Group
  };
}

async function integrateHUDHousing() {
  console.log('Starting HUD Affordable Housing integration...');
  
  try {
    // Parse CSV file
    const facilities = await parseCSV('hud_target_states.csv');
    console.log(`Found ${facilities.length} HUD facilities in CA, TX, HI`);
    
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const row of facilities) {
      try {
        const data = cleanData(row);
        
        // Skip if missing critical data
        if (!data.name || !data.city || !data.state) {
          console.log(`Skipping facility with missing data: ${JSON.stringify(row)}`);
          skipped++;
          continue;
        }
        
        // Check if already exists (by name and city)
        const existing = await pool.query(
          'SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3',
          [data.name, data.city, data.state]
        );
        
        if (existing.rows.length > 0) {
          console.log(`Facility already exists: ${data.name} in ${data.city}, ${data.state}`);
          skipped++;
          continue;
        }
        
        // Insert the facility
        const result = await pool.query(`
          INSERT INTO communities (
            name, address, city, state, zip_code, county, phone,
            latitude, longitude, care_types, 
            description, facility_type,
            availability_status, total_units, available_units,
            veteran_programs, eligibility_requirements,
            is_verified, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10::text[],
            $11, $12,
            $13, $14, $15,
            $16::text[], $17::text[],
            $18, NOW(), NOW()
          ) RETURNING id
        `, [
          data.name,
          data.address,
          data.city,
          data.state,
          data.zip,
          data.county,
          data.phone,
          data.latitude,
          data.longitude,
          [data.careType],
          `${data.programType} - ${data.clientGroup || 'Affordable Housing'}. ${data.units ? `Total units: ${data.units}` : ''} ${data.assistedUnits ? `Assisted units: ${data.assistedUnits}` : ''}`.trim(), // description
          'Affordable Senior', // facility_type
          'Contact for Availability', // availability_status
          data.units, // total_units
          null, // available_units
          data.programType.includes('202') || data.programType.includes('811') ? [data.programType] : [], // veteran_programs
          ['Income Qualified', data.clientType === 'Elderly' ? 'Age 62+' : 'Disabled'], // eligibility_requirements
          true, // is_verified (HUD data is official)
        ]);
        
        console.log(`✓ Added: ${data.name} in ${data.city}, ${data.state} (ID: ${result.rows[0].id})`);
        inserted++;
        
      } catch (err) {
        console.error(`Error processing facility: ${err.message}`);
        errors++;
      }
    }
    
    console.log('\n=== HUD Affordable Housing Integration Complete ===');
    console.log(`Total facilities processed: ${facilities.length}`);
    console.log(`Successfully inserted: ${inserted}`);
    console.log(`Skipped (existing/invalid): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
    // Update community stats cache
    await pool.query('REFRESH MATERIALIZED VIEW community_stats');
    console.log('Community stats cache refreshed');
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Run the integration
integrateHUDHousing().catch(console.error);