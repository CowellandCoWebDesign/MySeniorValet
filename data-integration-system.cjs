/**
 * MySeniorValet Data Integration System
 * Imports scraped senior living community data into MySeniorValet database
 */

const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Parse scraped data and convert to MySeniorValet format
 */
function parseScrapedData(filePath) {
  console.log(`📖 Reading scraped data from: ${filePath}`);
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const scrapedData = JSON.parse(rawData);
    
    console.log(`✅ Found ${scrapedData.length} communities to import`);
    return scrapedData;
  } catch (error) {
    console.error('❌ Error reading scraped data:', error);
    return [];
  }
}

/**
 * Convert scraped community to MySeniorValet database format
 */
function convertToMySeniorValetFormat(scrapedCommunity) {
  // Parse care types
  const careTypes = scrapedCommunity.careTypes || [];
  
  // Parse amenities
  const amenities = scrapedCommunity.amenities || [];
  
  // Parse price range
  const priceRange = scrapedCommunity.priceRange || null;
  
  // Extract location information
  const address = scrapedCommunity.address || '';
  const addressParts = address.split(',').map(part => part.trim());
  
  let city = '';
  let state = '';
  let zipCode = '';
  
  if (addressParts.length >= 2) {
    // Try to extract city, state, zip from address
    const lastPart = addressParts[addressParts.length - 1];
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5})/);
    
    if (stateZipMatch) {
      state = stateZipMatch[1];
      zipCode = stateZipMatch[2];
      city = addressParts[addressParts.length - 2];
    } else {
      city = addressParts[addressParts.length - 2] || '';
      state = addressParts[addressParts.length - 1] || '';
    }
  }
  
  return {
    name: scrapedCommunity.name || '',
    address: address,
    city: city,
    state: state,
    zipCode: zipCode,
    phone: scrapedCommunity.phone || '',
    description: scrapedCommunity.description || '',
    careTypes: careTypes,
    amenities: amenities,
    priceMin: priceRange?.min || null,
    priceMax: priceRange?.max || null,
    source: scrapedCommunity.source || 'Web Scraping',
    sourceUrl: scrapedCommunity.sourceUrl || '',
    discoveryMethod: scrapedCommunity.discoveryMethod || 'web_scraping',
    discoveryDate: scrapedCommunity.discoveryDate || new Date().toISOString(),
    verified: scrapedCommunity.verified || false,
    needsReview: scrapedCommunity.needsReview || true,
    latitude: null,
    longitude: null,
    website: null,
    email: null,
    rating: null,
    reviewCount: null,
    images: [],
    features: [],
    availableUnits: null,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Insert community into MySeniorValet database
 */
async function insertCommunity(community) {
  // First check if community already exists
  const checkQuery = `SELECT id, name FROM communities WHERE name = $1 AND address = $2`;
  const existingResult = await pool.query(checkQuery, [community.name, community.address]);
  
  if (existingResult.rows.length > 0) {
    console.log(`   ⚠️  Community already exists: ${community.name}`);
    return existingResult.rows[0];
  }
  
  const insertQuery = `
    INSERT INTO communities (
      name, address, city, state, zip_code, phone, description,
      care_types, amenities, price_range, website, email,
      discovery_source, discovery_date, is_verified, latitude, longitude,
      review_count, photos, services, medical_restrictions
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    ) 
    RETURNING id, name
  `;
  
  // Build price range JSON
  const priceRange = community.priceMin || community.priceMax ? 
    JSON.stringify({ min: community.priceMin, max: community.priceMax }) : null;
  
  const values = [
    community.name,
    community.address,
    community.city,
    community.state,
    community.zipCode,
    community.phone,
    community.description,
    community.careTypes,
    community.amenities,
    priceRange,
    community.website,
    community.email,
    community.discoveryMethod,
    community.discoveryDate,
    community.verified,
    community.latitude,
    community.longitude,
    community.reviewCount || 0,
    community.images || [],
    community.services || [],
    community.medicalRestrictions || []
  ];
  
  try {
    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  } catch (error) {
    console.error(`❌ Error inserting community ${community.name}:`, error);
    throw error;
  }
}

/**
 * Main integration function
 */
async function integrateCommunityData(filePath) {
  console.log('🚀 Starting MySeniorValet Data Integration...');
  console.log('=' * 50);
  
  try {
    // Parse scraped data
    const scrapedData = parseScrapedData(filePath);
    
    if (scrapedData.length === 0) {
      console.log('❌ No data to import');
      return;
    }
    
    console.log(`\n📊 Processing ${scrapedData.length} communities...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each community
    for (let i = 0; i < scrapedData.length; i++) {
      const scraped = scrapedData[i];
      
      try {
        console.log(`\n🏠 Processing ${i + 1}/${scrapedData.length}: ${scraped.name}`);
        
        // Convert to MySeniorValet format
        const community = convertToMySeniorValetFormat(scraped);
        
        // Insert into database
        const result = await insertCommunity(community);
        
        if (result) {
          console.log(`   ✅ Successfully imported: ${result.name} (ID: ${result.id})`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to import ${scraped.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎯 Integration Complete!');
    console.log(`✅ Successfully imported: ${successCount} communities`);
    console.log(`❌ Failed to import: ${errorCount} communities`);
    console.log(`📊 Total processed: ${scrapedData.length} communities`);
    
    if (successCount > 0) {
      console.log('\n🔍 Next steps:');
      console.log('  1. Review imported communities in MySeniorValet admin dashboard');
      console.log('  2. Verify and update community information');
      console.log('  3. Add photos and additional details');
      console.log('  4. Mark communities as verified after review');
    }
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
  } finally {
    await pool.end();
  }
}

/**
 * Run integration with command line arguments
 */
async function main() {
  const filePath = process.argv[2] || 'myseniorvalet_import_ready.json';
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log('Usage: node data-integration-system.cjs <scraped_data_file.json>');
    console.log('Example: node data-integration-system.cjs myseniorvalet_import_ready.json');
    process.exit(1);
  }
  
  await integrateCommunityData(filePath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  integrateCommunityData,
  convertToMySeniorValetFormat,
  insertCommunity
};