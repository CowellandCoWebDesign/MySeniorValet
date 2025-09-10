#!/usr/bin/env node

const fs = require('fs');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function importMobileHomeData() {
  console.log('Starting mobile home community data import...\n');
  
  // Connect to database
  const sql = neon(process.env.DATABASE_URL);
  
  // Find the latest mobile home communities file (excluding stats files)
  const files = fs.readdirSync('.').filter(f => 
    (f.startsWith('mobile_home_communities_') || f.startsWith('realistic_mobile_homes_')) && 
    f.endsWith('.json') && 
    !f.includes('stats')
  );
  
  if (files.length === 0) {
    console.error('No mobile home community data files found.');
    return;
  }
  
  const latestFile = files.sort().pop();
  console.log(`Reading data from: ${latestFile}`);
  
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  console.log(`Found ${data.length} communities to import\n`);
  
  let imported = 0;
  let errors = 0;
  
  for (const community of data) {
    try {
      // Check if community already exists
      const existingResult = await sql`
        SELECT id FROM communities 
        WHERE LOWER(name) = LOWER(${community.name}) 
        AND LOWER(address) = LOWER(${community.address})
        LIMIT 1
      `;
      
      if (existingResult.length > 0) {
        console.log(`✓ Community already exists: ${community.name}`);
        continue;
      }
      
      // Parse address components
      const city = community.city || parseCityFromAddress(community.address);
      const state = community.state || parseStateFromAddress(community.address);
      const zipCode = community.zipCode || parseZipFromAddress(community.address);
      
      // Insert the community
      await sql`
        INSERT INTO communities (
          name, 
          address, 
          city, 
          state, 
          zip_code,
          phone,
          website,
          email,
          description,
          care_types,
          community_subtype,
          age_restriction,
          lot_rent,
          hoa_fee,
          has_homes_for_sale,
          has_rentals,
          gated_community,
          pet_friendly,
          allows_rvs,
          amenities,
          data_source,
          photos,
          virtual_tour_url,
          latitude,
          longitude,
          price_range
        ) VALUES (
          ${community.name},
          ${community.address},
          ${city},
          ${state},
          ${zipCode},
          ${community.contact?.phone || null},
          ${community.contact?.website || null},
          ${community.contact?.email || null},
          ${community.description || null},
          ${community.careTypes || ['Independent Living']},
          ${community.communitySubtype || 'mobile_home_park'},
          ${community.ageRestriction || 55},
          ${community.pricing?.lotRent?.min || null},
          ${community.pricing?.hoaFee || null},
          ${community.pricing?.homePrice ? true : false},
          ${community.hasRentals !== false},
          ${community.features?.includes('Gated Community') || false},
          ${community.features?.includes('Pet Friendly') !== false},
          ${community.features?.includes('RV Storage') || false},
          ${community.features || []},
          ${'mobile_home_expansion'},
          ${[]},
          ${null},
          ${community.latitude || null},
          ${community.longitude || null},
          ${community.pricing?.lotRent ? JSON.stringify(community.pricing.lotRent) : null}
        )
      `;
      
      imported++;
      console.log(`✓ Imported: ${community.name} - ${state}`);
      
    } catch (error) {
      errors++;
      console.error(`✗ Error importing ${community.name}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total communities processed: ${data.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Errors: ${errors}`);
  console.log('\nNext steps:');
  console.log('1. Geocode addresses for map display');
  console.log('2. Add photos from Google Street View');
  console.log('3. Enable community claiming');
  console.log('4. Update frontend to display mobile home communities');
}

// Helper functions to parse address components
function parseCityFromAddress(address) {
  if (!address) return null;
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 2].trim() : null;
}

function parseStateFromAddress(address) {
  if (!address) return null;
  const parts = address.split(',');
  const lastPart = parts[parts.length - 1].trim();
  const stateMatch = lastPart.match(/([A-Z]{2})/);
  return stateMatch ? stateMatch[1] : null;
}

function parseZipFromAddress(address) {
  if (!address) return null;
  const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : null;
}

// Run the import
importMobileHomeData().catch(console.error);