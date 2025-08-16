#!/usr/bin/env node
/**
 * Import Ultra Mexico Expansion Communities
 * Phase 4 - Target: 5,095 additional communities
 */

const fs = require('fs');
const { Pool } = require('pg');

// Database configuration from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function importUltraCommunities() {
  console.log('='.repeat(80));
  console.log('IMPORTING ULTRA MEXICO EXPANSION COMMUNITIES');
  console.log('='.repeat(80));
  
  try {
    // Read the ultra expansion JSON file
    const filename = 'ultra_mexico_expansion_20250816_074054.json';
    console.log(`📂 Reading from: ${filename}`);
    
    const data = fs.readFileSync(filename, 'utf8');
    const communities = JSON.parse(data);
    
    console.log(`📊 Found ${communities.length} communities to import`);
    
    let imported = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    // Process in batches for better performance
    const batchSize = 100;
    
    for (let i = 0; i < communities.length; i += batchSize) {
      const batch = communities.slice(i, i + batchSize);
      
      for (const community of batch) {
        try {
          // Check if community already exists
          const checkResult = await pool.query(
            'SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3 AND country = $4',
            [community.name, community.city, community.state, 'Mexico']
          );
          
          if (checkResult.rows.length > 0) {
            duplicateCount++;
            continue;
          }
          
          // Prepare the data for insertion
          const insertQuery = `
            INSERT INTO communities (
              name, address, city, state, zip_code, country,
              phone, website, description, 
              care_types, amenities, 
              pricing_details, 
              primary_language, bilingual,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6,
              $7, $8, $9,
              $10, $11,
              $12,
              $13, $14,
              NOW(), NOW()
            )
          `;
          
          // Prepare pricing details
          const pricingDetails = {
            capacity: community.capacity,
            year_established: community.year_established,
            staff_ratio: community.staff_ratio || 'N/A',
            insurance_accepted: community.insurance_accepted || [],
            payment_options: community.payment_options || [],
            certifications: community.certifications || [],
            specializations: community.specializations || [],
            expansion_phase: 'Ultra Mexico Phase 4',
            data_source: community.data_source || 'Ultra Mexico Expansion Phase 4 - August 2025',
            import_date: new Date().toISOString()
          };
          
          const values = [
            community.name,
            community.address,
            community.city,
            community.state,
            community.postal_code || community.zip_code,
            'Mexico',
            community.phone,
            community.website,
            community.description,
            community.care_types,
            community.amenities || [],
            JSON.stringify(pricingDetails),
            'Spanish',
            community.languages && community.languages.includes('English') ? true : false
          ];
          
          await pool.query(insertQuery, values);
          imported++;
          
        } catch (error) {
          console.error(`❌ Error importing ${community.name}:`, error.message);
          errorCount++;
        }
      }
      
      // Progress update
      if (imported % 100 === 0 && imported > 0) {
        console.log(`✓ Imported ${imported} communities...`);
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('IMPORT COMPLETE!');
    console.log('='.repeat(80));
    console.log(`✅ Successfully imported: ${imported} communities`);
    console.log(`⚠️  Duplicates skipped: ${duplicateCount}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    console.log(`📊 Total processed: ${communities.length}`);
    
    // Get final Mexico count
    const countResult = await pool.query(
      "SELECT COUNT(*) as total FROM communities WHERE country = 'Mexico'"
    );
    console.log(`\n🇲🇽 Total Mexican communities in database: ${countResult.rows[0].total}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Run the import
importUltraCommunities().catch(console.error);