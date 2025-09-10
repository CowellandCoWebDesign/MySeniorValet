#!/usr/bin/env node

const fs = require('fs');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function importFixedZipCodeData() {
  console.log('Starting import of facilities with fixed zip codes...\n');
  
  const sql = neon(process.env.DATABASE_URL);
  
  const states = ['washington', 'wyoming', 'nevada', 'arizona', 'colorado', 'oregon', 'idaho', 'utah', 'new_mexico'];
  
  let totalImported = 0;
  let totalErrors = 0;
  let totalSkipped = 0;
  
  for (const state of states) {
    console.log(`\nProcessing ${state.toUpperCase()}...`);
    
    // Find the fixed zip code file
    const files = fs.readdirSync('.').filter(f => 
      f.startsWith(`${state}_fixed_zipcodes_`) && 
      f.endsWith('.json')
    );
    
    if (files.length === 0) {
      console.log(`  No fixed zip code file found for ${state}`);
      continue;
    }
    
    const latestFile = files.sort().pop();
    console.log(`  Reading: ${latestFile}`);
    
    const facilities = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    console.log(`  Found ${facilities.length} facilities to import`);
    
    for (const facility of facilities) {
      try {
        // Check for duplicates
        const existingResult = await sql`
          SELECT id FROM communities 
          WHERE LOWER(name) = LOWER(${facility.name}) 
          AND LOWER(city) = LOWER(${facility.city})
          AND state = ${facility.state}
          LIMIT 1
        `;
        
        if (existingResult.length > 0) {
          totalSkipped++;
          continue;
        }
        
        // Determine care types
        const careTypes = facility.careTypes || ['Assisted Living'];
        
        // Insert facility
        await sql`
          INSERT INTO communities (
            name, 
            address, 
            city, 
            state, 
            "zip_code",
            phone,
            website,
            email,
            description,
            care_types,
            data_source,
            photos,
            latitude,
            longitude
          ) VALUES (
            ${facility.name},
            ${facility.address},
            ${facility.city},
            ${facility.state},
            ${facility.zip},
            ${facility.phone || null},
            ${facility.website || null},
            ${facility.email || null},
            ${facility.description || null},
            ${careTypes},
            ${facility.source || 'State Database'},
            ${[]},
            ${facility.coordinates?.latitude || null},
            ${facility.coordinates?.longitude || null}
          )
        `;
        
        totalImported++;
        
      } catch (error) {
        totalErrors++;
        console.error(`  Error importing ${facility.name}: ${error.message}`);
      }
    }
  }
  
  const result = await sql`SELECT COUNT(*) as count FROM communities`;
  const totalCommunities = result[0].count;
  
  console.log('\n' + '='.repeat(50));
  console.log('FIXED ZIP CODE IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Successfully imported: ${totalImported}`);
  console.log(`Already existed: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`\nTotal communities in database: ${totalCommunities}`);
  console.log('='.repeat(50));
}

importFixedZipCodeData().catch(console.error);
