const fs = require('fs');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateNewYorkFacilities() {
  try {
    console.log('🗽 Integrating New York Missing Counties Facilities...');
    
    // Read the facilities data
    const facilitiesData = JSON.parse(fs.readFileSync('new_york_missing_counties_20250717_054007.json', 'utf8'));
    
    console.log(`📊 Processing ${facilitiesData.length} facilities from missing counties`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const facility of facilitiesData) {
      try {
        // Check if facility already exists by name and city
        const existingFacility = await pool.query(
          'SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3',
          [facility.name, facility.city, facility.state]
        );
        
        if (existingFacility.rows.length > 0) {
          console.log(`⚠️  Skipping duplicate: ${facility.name} in ${facility.city}`);
          skippedCount++;
          continue;
        }
        
        // Prepare facility data for insertion
        const facilityData = {
          name: facility.name,
          address: facility.address,
          city: facility.city,
          state: facility.state,
          zip_code: facility.zip_code,
          county: facility.county,
          phone: facility.phone,
          latitude: facility.latitude,
          longitude: facility.longitude,
          care_types: facility.care_types || ['Senior Living'],
          facility_type: 'Senior Living',
          description: facility.description || 'Senior living community',
          website: null,
          email: null,
          capacity: null,
          monthly_rent: null,
          photos: [],
          amenities: {},
          inspection_data: null,
          verification_status: 'verified',
          source: 'NY Department of Health',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Insert facility
        const result = await pool.query(`
          INSERT INTO communities (
            name, address, city, state, zip_code, county, phone,
            latitude, longitude, care_types, facility_type, description,
            website, email, capacity, monthly_rent, photos, amenities,
            inspection_data, verification_status, source, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
          ) RETURNING id
        `, [
          facilityData.name,
          facilityData.address,
          facilityData.city,
          facilityData.state,
          facilityData.zip_code,
          facilityData.county,
          facilityData.phone,
          facilityData.latitude,
          facilityData.longitude,
          facilityData.care_types,
          facilityData.facility_type,
          facilityData.description,
          facilityData.website,
          facilityData.email,
          facilityData.capacity,
          facilityData.monthly_rent,
          JSON.stringify(facilityData.photos),
          JSON.stringify(facilityData.amenities),
          facilityData.inspection_data,
          facilityData.verification_status,
          facilityData.source,
          facilityData.created_at,
          facilityData.updated_at
        ]);
        
        const facilityId = result.rows[0].id;
        console.log(`✅ Added: ${facilityData.name} (ID: ${facilityId}) in ${facilityData.county} County`);
        insertedCount++;
        
      } catch (error) {
        console.error(`❌ Error inserting ${facility.name}:`, error.message);
        continue;
      }
    }
    
    console.log(`\n🎉 NEW YORK COMPLETION INTEGRATION COMPLETE!`);
    console.log(`✅ Successfully integrated: ${insertedCount} facilities`);
    console.log(`⚠️  Skipped duplicates: ${skippedCount} facilities`);
    
    // Check updated New York county coverage
    const countyResult = await pool.query(`
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'NY' AND county IS NOT NULL
      GROUP BY county 
      ORDER BY count DESC
    `);
    
    console.log(`\n📍 Updated New York County Coverage: ${countyResult.rows.length} counties`);
    
    // Check total NY facilities
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total FROM communities WHERE state = 'NY'
    `);
    
    console.log(`🗽 Total New York facilities: ${totalResult.rows[0].total}`);
    
    // Check total database
    const databaseResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`🌍 Total database communities: ${databaseResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateNewYorkFacilities().catch(console.error);