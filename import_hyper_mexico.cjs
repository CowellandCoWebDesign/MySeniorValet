#!/usr/bin/env node
/**
 * Import Hyper Mexico Expansion Communities to Database
 * This script imports the 4,050 communities from hyper_mexico_expansion.json
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function importCommunities() {
  console.log('=' .repeat(80));
  console.log('IMPORTING HYPER MEXICO EXPANSION COMMUNITIES');
  console.log('=' .repeat(80));
  
  try {
    // Find the most recent expansion file
    const files = fs.readdirSync('.').filter(f => f.startsWith('hyper_mexico_expansion_') && f.endsWith('.json'));
    if (files.length === 0) {
      console.error('❌ No hyper_mexico_expansion JSON file found!');
      process.exit(1);
    }
    
    // Sort to get the most recent
    files.sort();
    const latestFile = files[files.length - 1];
    console.log(`📂 Reading from: ${latestFile}`);
    
    // Load the communities data
    const communities = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    console.log(`📊 Found ${communities.length} communities to import`);
    
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const errors = [];
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 50;
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
            expansion_phase: 'Hyper Mexico Phase 3',
            data_source: community.data_source || 'Hyper Mexico Expansion Phase 3 - August 2025',
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
          successCount++;
          
          // Progress indicator
          if (successCount % 100 === 0) {
            console.log(`✓ Imported ${successCount} communities...`);
          }
          
        } catch (error) {
          errorCount++;
          errors.push({
            community: community.name,
            city: community.city,
            error: error.message
          });
          console.error(`❌ Error importing ${community.name}: ${error.message}`);
        }
      }
      
      // Brief pause between batches
      if (i + batchSize < communities.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Print summary
    console.log('\n' + '=' .repeat(80));
    console.log('IMPORT COMPLETE!');
    console.log(`✅ Successfully imported: ${successCount} communities`);
    console.log(`⚠️  Duplicates skipped: ${duplicateCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('=' .repeat(80));
    
    // Get updated Mexico count
    const mexicoCount = await pool.query(
      "SELECT COUNT(*) FROM communities WHERE country = 'Mexico'"
    );
    console.log(`\n🇲🇽 Total Mexico communities in database: ${mexicoCount.rows[0].count}`);
    
    // Get total count
    const totalCount = await pool.query(
      "SELECT COUNT(*) FROM communities"
    );
    console.log(`🌎 Total communities across all countries: ${totalCount.rows[0].count}`);
    
    // Save error log if there were errors
    if (errors.length > 0) {
      const errorLogFile = `hyper_mexico_import_errors_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      fs.writeFileSync(errorLogFile, JSON.stringify(errors, null, 2));
      console.log(`\n⚠️  Error details saved to: ${errorLogFile}`);
    }
    
  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importCommunities().catch(console.error);