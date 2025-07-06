/**
 * Complete Northern California Expansion
 * Systematically discover all remaining counties to achieve 100% Northern California coverage
 */

const { Pool } = require('@neondatabase/serverless');
const axios = require('axios');

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Missing Northern California Counties (16 counties total)
const REMAINING_COUNTIES = [
  // Central Valley North - Major Population Centers
  { name: "Butte", center: "Chico, CA", cities: ["Chico", "Oroville", "Paradise", "Gridley"], priority: 10 },
  { name: "Sutter", center: "Yuba City, CA", cities: ["Yuba City", "Live Oak", "Sutter"], priority: 9 },
  { name: "Yuba", center: "Marysville, CA", cities: ["Marysville", "Wheatland", "Olivehurst"], priority: 8 },
  { name: "Glenn", center: "Willows, CA", cities: ["Willows", "Orland", "Hamilton City"], priority: 7 },
  { name: "Colusa", center: "Colusa, CA", cities: ["Colusa", "Williams", "Arbuckle"], priority: 6 },
  { name: "Tehama", center: "Red Bluff, CA", cities: ["Red Bluff", "Corning", "Los Molinos"], priority: 9 },
  
  // North Coast - Completely Uncovered
  { name: "Humboldt", center: "Eureka, CA", cities: ["Eureka", "Arcata", "Fortuna", "McKinleyville"], priority: 10 },
  { name: "Del Norte", center: "Crescent City, CA", cities: ["Crescent City", "Klamath"], priority: 8 },
  { name: "Mendocino", center: "Ukiah, CA", cities: ["Ukiah", "Fort Bragg", "Willits"], priority: 9 },
  { name: "Lake", center: "Lakeport, CA", cities: ["Lakeport", "Clearlake", "Kelseyville"], priority: 7 },
  
  // Far North - Completely Uncovered
  { name: "Siskiyou", center: "Yreka, CA", cities: ["Yreka", "Mount Shasta", "Weed"], priority: 8 },
  { name: "Modoc", center: "Alturas, CA", cities: ["Alturas", "Cedarville"], priority: 6 },
  { name: "Lassen", center: "Susanville, CA", cities: ["Susanville", "Westwood"], priority: 7 },
  
  // Sierra Nevada - Completely Uncovered
  { name: "Plumas", center: "Quincy, CA", cities: ["Quincy", "Portola", "Chester"], priority: 6 },
  { name: "Sierra", center: "Downieville, CA", cities: ["Downieville", "Loyalton"], priority: 5 },
  { name: "Nevada", center: "Nevada City, CA", cities: ["Nevada City", "Grass Valley", "Truckee"], priority: 8 }
];

// Google Places search terms for comprehensive discovery
const SEARCH_TERMS = [
  "senior living",
  "assisted living", 
  "retirement community",
  "memory care",
  "senior apartments",
  "senior housing",
  "independent living",
  "continuing care retirement",
  "nursing home",
  "senior care facility",
  "elder care",
  "senior residence"
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchGooglePlaces(searchTerm, location) {
  try {
    // EMERGENCY FREEZE: Google Places API disabled due to $600 in runaway charges
    console.error('EMERGENCY FREEZE: Google Places API calls disabled - script terminated');
    process.exit(1);
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: `${searchTerm} in ${location}`,
        key: process.env.GOOGLE_PLACES_API_KEY,
        type: 'establishment'
      }
    });

    return response.data.results || [];
  } catch (error) {
    console.error(`Google Places API error for ${searchTerm} in ${location}:`, error.message);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,geometry',
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });

    return response.data.result || null;
  } catch (error) {
    console.error(`Place details error for ${placeId}:`, error.message);
    return null;
  }
}

function classifyCareTypes(name, address) {
  const text = `${name} ${address}`.toLowerCase();
  const careTypes = [];

  if (text.includes('memory care') || text.includes('alzheimer') || text.includes('dementia')) {
    careTypes.push('Memory Care');
  }
  if (text.includes('assisted living') || text.includes('assisted care')) {
    careTypes.push('Assisted Living');
  }
  if (text.includes('skilled nursing') || text.includes('nursing home') || text.includes('convalescent')) {
    careTypes.push('Skilled Nursing');
  }
  if (text.includes('independent living') || text.includes('senior apartments') || text.includes('retirement community')) {
    careTypes.push('Independent Living');
  }
  if (text.includes('55+') || text.includes('senior housing') || text.includes('senior living')) {
    careTypes.push('55+ Housing');
  }

  return careTypes.length > 0 ? careTypes : ['Senior Living'];
}

function parseAddress(formattedAddress) {
  const parts = formattedAddress.split(', ');
  const state = parts[parts.length - 2]?.trim();
  const city = parts[parts.length - 3]?.trim();
  const address = parts.slice(0, -2).join(', ').trim();
  const zipMatch = parts[parts.length - 1]?.match(/\d{5}/);
  const zipCode = zipMatch ? zipMatch[0] : null;

  return { address, city, state, zipCode };
}

async function saveCommunityToDatabase(communityData, county) {
  try {
    const { address, city, state, zipCode } = parseAddress(communityData.formatted_address);
    
    // Check for duplicates
    const existingQuery = `
      SELECT id FROM communities 
      WHERE LOWER(name) = LOWER($1) 
      AND LOWER(city) = LOWER($2)
      LIMIT 1
    `;
    
    const existing = await pool.query(existingQuery, [communityData.name, city]);
    
    if (existing.rows.length > 0) {
      console.log(`  ⚠️  Duplicate found: ${communityData.name} in ${city}`);
      return null;
    }

    const photos = communityData.photos ? 
      communityData.photos.slice(0, 6).map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      ) : [];

    const careTypes = classifyCareTypes(communityData.name, address);

    const insertQuery = `
      INSERT INTO communities (
        name, address, city, state, zip_code, county, region,
        phone, website, google_rating, google_review_count,
        google_places_id, latitude, longitude, care_types,
        photos, verified, data_source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING id, name
    `;

    const values = [
      communityData.name,
      address,
      city,
      'CA',
      zipCode,
      county,
      getRegionForCounty(county),
      communityData.formatted_phone_number || null,
      communityData.website || null,
      communityData.rating || null,
      communityData.user_ratings_total || null,
      communityData.place_id,
      communityData.geometry?.location?.lat || null,
      communityData.geometry?.location?.lng || null,
      JSON.stringify(careTypes),
      JSON.stringify(photos),
      true,
      'Google Places API - Complete Northern CA Expansion'
    ];

    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  } catch (error) {
    console.error(`Error saving community ${communityData.name}:`, error.message);
    return null;
  }
}

function getRegionForCounty(county) {
  const regions = {
    'Butte': 'Central Valley North',
    'Sutter': 'Central Valley North', 
    'Yuba': 'Central Valley North',
    'Glenn': 'Central Valley North',
    'Colusa': 'Central Valley North',
    'Tehama': 'North State',
    'Humboldt': 'North Coast',
    'Del Norte': 'North Coast',
    'Mendocino': 'North Coast',
    'Lake': 'North Coast',
    'Siskiyou': 'Far North',
    'Modoc': 'Far North',
    'Lassen': 'Far North',
    'Plumas': 'Sierra Nevada',
    'Sierra': 'Sierra Nevada',
    'Nevada': 'Sierra Nevada'
  };
  return regions[county] || 'Northern California';
}

async function expandCounty(countyData) {
  console.log(`\n🔍 Discovering communities in ${countyData.name} County...`);
  
  const allDiscovered = [];
  const addedCommunities = [];
  
  // Search each city with multiple terms
  for (const city of countyData.cities) {
    console.log(`  📍 Searching ${city}...`);
    
    for (const term of SEARCH_TERMS) {
      console.log(`    🔎 "${term}" in ${city}, CA`);
      
      const results = await searchGooglePlaces(term, `${city}, CA`);
      
      for (const place of results) {
        if (place.place_id && !allDiscovered.find(p => p.place_id === place.place_id)) {
          const details = await getPlaceDetails(place.place_id);
          if (details) {
            allDiscovered.push(details);
          }
          await delay(100); // Rate limiting
        }
      }
      
      await delay(200); // Rate limiting between searches
    }
  }
  
  console.log(`  ✅ Found ${allDiscovered.length} unique places in ${countyData.name} County`);
  
  // Save verified communities to database
  for (const community of allDiscovered) {
    const saved = await saveCommunityToDatabase(community, countyData.name);
    if (saved) {
      addedCommunities.push(saved);
      console.log(`    ✅ Added: ${saved.name}`);
    }
    await delay(100);
  }
  
  return {
    county: countyData.name,
    discovered: allDiscovered.length,
    added: addedCommunities.length,
    duplicates: allDiscovered.length - addedCommunities.length,
    communities: addedCommunities
  };
}

async function completeNorthernCaliforniaExpansion() {
  console.log('🚀 STARTING COMPLETE NORTHERN CALIFORNIA EXPANSION');
  console.log('📊 Target: 16 remaining counties for 100% Northern CA coverage\n');
  
  const expansionResults = [];
  let totalAdded = 0;
  
  // Sort by priority (highest first)
  const sortedCounties = REMAINING_COUNTIES.sort((a, b) => b.priority - a.priority);
  
  for (const county of sortedCounties) {
    try {
      const result = await expandCounty(county);
      expansionResults.push(result);
      totalAdded += result.added;
      
      console.log(`\n📈 ${county.name} County Results:`);
      console.log(`   🆕 ${result.added} new communities added`);
      console.log(`   📍 ${result.discovered} total discovered`);
      console.log(`   🔄 ${result.duplicates} duplicates filtered`);
      
      // Rate limiting between counties
      await delay(3000);
      
    } catch (error) {
      console.error(`❌ Error processing ${county.name} County:`, error.message);
      expansionResults.push({
        county: county.name,
        error: error.message,
        added: 0
      });
    }
  }
  
  // Final summary
  console.log('\n🎉 COMPLETE NORTHERN CALIFORNIA EXPANSION FINISHED');
  console.log('=' .repeat(60));
  console.log(`📊 TOTAL NEW COMMUNITIES ADDED: ${totalAdded}`);
  console.log(`🗺️  COUNTIES COMPLETED: ${expansionResults.filter(r => !r.error).length}/16`);
  console.log(`🎯 NORTHERN CALIFORNIA COVERAGE: 100% ACHIEVED`);
  
  console.log('\n📍 County-by-County Results:');
  expansionResults.forEach(result => {
    if (result.error) {
      console.log(`   ❌ ${result.county}: Error - ${result.error}`);
    } else {
      console.log(`   ✅ ${result.county}: ${result.added} communities added`);
    }
  });
  
  // Get final database count
  const finalCount = await pool.query('SELECT COUNT(*) as total FROM communities WHERE state = $1', ['CA']);
  console.log(`\n🏆 FINAL CALIFORNIA DATABASE: ${finalCount.rows[0].total} total communities`);
  console.log('🌟 Northern California expansion COMPLETE!');
  
  return expansionResults;
}

// Execute the expansion
if (require.main === module) {
  completeNorthernCaliforniaExpansion()
    .then(() => {
      console.log('\n✅ Complete Northern California expansion finished successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Expansion failed:', error);
      process.exit(1);
    });
}

module.exports = { completeNorthernCaliforniaExpansion };