#!/usr/bin/env node
/**
 * NEW YORK DATA INTEGRATION SCRIPT
 * MySeniorValet.com - Integrate New York facilities into database
 * 
 * This script integrates the collected New York facilities data into the database
 * Source: new_york_facilities_fixed_20250717_025407.json (185 facilities)
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class NewYorkDataIntegrator {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.integrated = 0;
    this.skipped = 0;
    this.errors = 0;
  }

  async integrateNewYorkData() {
    console.log('🗽 Starting New York data integration...');
    
    try {
      // Read the New York facilities data
      const nyDataPath = './new_york_facilities_fixed_20250717_025407.json';
      
      if (!fs.existsSync(nyDataPath)) {
        throw new Error(`New York data file not found: ${nyDataPath}`);
      }
      
      const nyData = JSON.parse(fs.readFileSync(nyDataPath, 'utf8'));
      console.log(`📊 Found ${nyData.length} New York facilities to integrate`);
      
      // Process each facility
      for (const facility of nyData) {
        try {
          await this.integrateFacility(facility);
          this.integrated++;
          
          if (this.integrated % 50 === 0) {
            console.log(`✅ Integrated ${this.integrated} facilities...`);
          }
        } catch (error) {
          console.error(`❌ Error integrating facility ${facility.name}:`, error.message);
          this.errors++;
        }
      }
      
      console.log(`\n🎉 NEW YORK INTEGRATION COMPLETE!`);
      console.log(`✅ Successfully integrated: ${this.integrated} facilities`);
      console.log(`⚠️  Skipped (duplicates): ${this.skipped} facilities`);
      console.log(`❌ Errors: ${this.errors} facilities`);
      
      // Verify integration
      await this.verifyIntegration();
      
    } catch (error) {
      console.error('❌ Fatal error during integration:', error.message);
      process.exit(1);
    }
  }

  async integrateFacility(facility) {
    // Check if facility already exists
    const existingQuery = `
      SELECT id FROM communities 
      WHERE name = $1 AND city = $2 AND state = $3
    `;
    
    const existingResult = await pool.query(existingQuery, [
      facility.name,
      facility.city,
      facility.state
    ]);
    
    if (existingResult.rows.length > 0) {
      this.skipped++;
      return;
    }
    
    // Insert new facility (using only columns that exist in the database)
    const insertQuery = `
      INSERT INTO communities (
        name, address, city, state, zip_code, county, phone,
        care_types, facility_type, description, 
        latitude, longitude, data_source, government_verified,
        license_number, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `;
    
    const values = [
      facility.name,
      facility.address,
      facility.city,
      facility.state,
      facility.zip_code,
      facility.county,
      facility.phone,
      facility.care_types,
      'Senior Living',
      facility.description,
      parseFloat(facility.latitude),
      parseFloat(facility.longitude),
      facility.data_source,
      true, // government_verified = true for NY DOH data
      facility.license_number,
      new Date(),
      new Date()
    ];
    
    await pool.query(insertQuery, values);
  }

  async verifyIntegration() {
    console.log('\n🔍 Verifying New York integration...');
    
    const countQuery = `
      SELECT COUNT(*) as count FROM communities WHERE state = 'NY'
    `;
    
    const result = await pool.query(countQuery);
    const nyCount = parseInt(result.rows[0].count);
    
    console.log(`📊 New York facilities in database: ${nyCount}`);
    
    if (nyCount === 0) {
      console.log('⚠️  WARNING: No New York facilities found in database!');
    } else {
      console.log('✅ New York integration verified successfully!');
    }
    
    // Sample of NY facilities
    const sampleQuery = `
      SELECT name, city, county, latitude, longitude 
      FROM communities 
      WHERE state = 'NY' 
      LIMIT 5
    `;
    
    const sampleResult = await pool.query(sampleQuery);
    console.log('\n🏢 Sample New York facilities:');
    sampleResult.rows.forEach((facility, index) => {
      console.log(`${index + 1}. ${facility.name} - ${facility.city}, ${facility.county} County`);
      console.log(`   Coordinates: ${facility.latitude}, ${facility.longitude}`);
    });
  }
}

// Run integration
async function main() {
  const integrator = new NewYorkDataIntegrator();
  await integrator.integrateNewYorkData();
  await pool.end();
}

main().catch(console.error);