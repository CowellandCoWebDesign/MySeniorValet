#!/usr/bin/env node

const fs = require('fs');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function importPennsylvaniaData() {
  console.log('Starting Pennsylvania facilities data import...\n');
  
  // Connect to database
  const sql = neon(process.env.DATABASE_URL);
  
  // Find the latest Pennsylvania facilities file
  const files = fs.readdirSync('.').filter(f => 
    f.startsWith('pennsylvania_complete_facilities_') && 
    f.endsWith('.json')
  );
  
  if (files.length === 0) {
    console.error('No Pennsylvania facilities data files found.');
    return;
  }
  
  const latestFile = files.sort().pop();
  console.log(`Reading data from: ${latestFile}`);
  
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  console.log(`Found ${data.length} facilities to import\n`);
  
  let imported = 0;
  let errors = 0;
  let skipped = 0;
  
  for (const facility of data) {
    try {
      // Check if facility already exists
      const existingResult = await sql`
        SELECT id FROM communities 
        WHERE LOWER(name) = LOWER(${facility.name}) 
        AND LOWER(city) = LOWER(${facility.city})
        AND state = ${facility.state}
        LIMIT 1
      `;
      
      if (existingResult.length > 0) {
        console.log(`✓ Facility already exists: ${facility.name} - ${facility.city}`);
        skipped++;
        continue;
      }
      
      // Prepare care types array based on facility type
      const careTypes = [];
      if (facility.careTypes) {
        careTypes.push(...facility.careTypes);
      } else {
        if (facility.facilityType === 'Senior Living') careTypes.push('Assisted Living');
        if (facility.facilityType === 'Nursing Home') careTypes.push('Skilled Nursing');
        if (facility.facilityType === 'Memory Care') careTypes.push('Memory Care');
      }
      if (careTypes.length === 0) careTypes.push('Assisted Living'); // Default
      
      // Insert the facility
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
          ${'Pennsylvania Department of Aging'},
          ${[]},
          ${facility.coordinates?.latitude || null},
          ${facility.coordinates?.longitude || null}
        )
      `;
      
      imported++;
      console.log(`✓ Imported: ${facility.name} - ${facility.city}, ${facility.county} County`);
      
    } catch (error) {
      errors++;
      console.error(`✗ Error importing ${facility.name}: ${error.message}`);
    }
  }
  
  // Get updated total count
  const result = await sql`SELECT COUNT(*) as count FROM communities`;
  const totalCommunities = result[0].count;
  
  console.log('\n' + '='.repeat(50));
  console.log('PENNSYLVANIA IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total facilities processed: ${data.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Already existed: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nTotal communities in database: ${totalCommunities}`);
  console.log('='.repeat(50));
}

// Run the import
importPennsylvaniaData().catch(console.error);