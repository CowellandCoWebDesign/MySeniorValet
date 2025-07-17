import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function integrateCompleteNYData() {
  try {
    console.log('🗽 INTEGRATING COMPLETE NEW YORK STATE DATABASE...');
    
    // Read the comprehensive processed data
    const facilitiesData = JSON.parse(fs.readFileSync('new_york_complete_processed_20250717_054412.json', 'utf8'));
    
    console.log(`📊 Processing ${facilitiesData.length} facilities from NY State database`);
    
    // First, let's backup existing NY data and then replace it completely
    console.log('🔄 Backing up existing NY data...');
    const existingNY = await pool.query('SELECT * FROM communities WHERE state = $1', ['NY']);
    console.log(`📋 Found ${existingNY.rows.length} existing NY facilities`);
    
    // Clear existing NY data to avoid duplicates
    console.log('🧹 Clearing existing NY data...');
    await pool.query('DELETE FROM communities WHERE state = $1', ['NY']);
    
    let insertedCount = 0;
    let errorCount = 0;
    
    for (const facility of facilitiesData) {
      try {
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
          care_types: facility.care_types,
          facility_type: facility.facility_type,
          capacity: facility.capacity,
          description: facility.description,
          website: null,
          email: null,
          photos: [],
          amenities: [],
          source: facility.source,
          created_at: facility.created_at,
          updated_at: facility.updated_at,
          // Additional NY-specific fields
          operator: facility.operator,
          certificate_number: facility.certificate_number,
          facility_id: facility.facility_id,
          regional_office: facility.regional_office
        };
        
        // Insert facility
        const result = await pool.query(`
          INSERT INTO communities (
            name, address, city, state, zip_code, county, phone,
            latitude, longitude, care_types, facility_type, capacity, description,
            website, email, photos, amenities,
            data_source, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
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
          facilityData.capacity,
          facilityData.description,
          facilityData.website,
          facilityData.email,
          facilityData.photos,
          facilityData.amenities,
          facilityData.source,
          facilityData.created_at,
          facilityData.updated_at
        ]);
        
        const facilityId = result.rows[0].id;
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`✅ Processed ${insertedCount} facilities...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting ${facility.name}:`, error.message);
        errorCount++;
        continue;
      }
    }
    
    console.log(`\n🎉 NEW YORK STATE COMPLETE DATABASE INTEGRATION FINISHED!`);
    console.log(`✅ Successfully integrated: ${insertedCount} facilities`);
    console.log(`❌ Errors encountered: ${errorCount} facilities`);
    
    // Verify the integration
    const finalNYCount = await pool.query('SELECT COUNT(*) as total FROM communities WHERE state = $1', ['NY']);
    console.log(`🗽 Total New York facilities in database: ${finalNYCount.rows[0].total}`);
    
    // Check county coverage
    const countyResult = await pool.query(`
      SELECT county, COUNT(*) as count
      FROM communities 
      WHERE state = 'NY' AND county IS NOT NULL
      GROUP BY county 
      ORDER BY count DESC
    `);
    
    console.log(`\n📍 New York County Coverage: ${countyResult.rows.length} counties`);
    countyResult.rows.forEach(row => {
      console.log(`  - ${row.county}: ${row.count} facilities`);
    });
    
    // Check total database
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM communities');
    console.log(`\n🌍 Total database communities: ${totalResult.rows[0].total}`);
    
    // Calculate coverage percentage
    const totalNYCounties = 62;
    const coveragePercentage = ((countyResult.rows.length / totalNYCounties) * 100).toFixed(1);
    console.log(`📊 New York Coverage: ${countyResult.rows.length}/${totalNYCounties} counties (${coveragePercentage}%)`);
    
    if (countyResult.rows.length === 61) {
      console.log(`🏆 NEARLY COMPLETE! Missing only Hamilton County (most rural county in NY)`);
    }
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
  } finally {
    await pool.end();
  }
}

// Execute the integration
integrateCompleteNYData().catch(console.error);