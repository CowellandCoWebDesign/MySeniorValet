/**
 * Priority County Expansion - Batch 1
 * Focus on high-priority counties: Butte (Chico), Humboldt (Eureka), Nevada (Grass Valley)
 */

const { Pool } = require('@neondatabase/serverless');
const axios = require('axios');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// High Priority Counties for Northern California completion
const PRIORITY_COUNTIES = [
  { name: "Butte", region: "Central Valley North", cities: ["Chico", "Oroville", "Paradise"], priority: 10 },
  { name: "Humboldt", region: "North Coast", cities: ["Eureka", "Arcata", "Fortuna"], priority: 10 },
  { name: "Nevada", region: "Sierra Nevada", cities: ["Nevada City", "Grass Valley", "Truckee"], priority: 8 }
];

const SEARCH_TERMS = ["senior living", "assisted living", "retirement community", "memory care"];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchGooglePlaces(searchTerm, location) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: `${searchTerm} in ${location}`,
        key: process.env.GOOGLE_PLACES_API_KEY,
        type: 'establishment'
      }
    });
    return response.data.results || [];
  } catch (error) {
    console.error(`API error for ${searchTerm} in ${location}:`, error.message);
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
    console.error(`Place details error:`, error.message);
    return null;
  }
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

function classifyCareTypes(name, address) {
  const text = `${name} ${address}`.toLowerCase();
  const careTypes = [];
  
  if (text.includes('memory care') || text.includes('alzheimer')) careTypes.push('Memory Care');
  if (text.includes('assisted living')) careTypes.push('Assisted Living');
  if (text.includes('skilled nursing') || text.includes('nursing home')) careTypes.push('Skilled Nursing');
  if (text.includes('independent living') || text.includes('retirement community')) careTypes.push('Independent Living');
  if (text.includes('55+') || text.includes('senior housing')) careTypes.push('55+ Housing');
  
  return careTypes.length > 0 ? careTypes : ['Senior Living'];
}

async function saveCommunityToDatabase(communityData, county, region) {
  try {
    const { address, city, state, zipCode } = parseAddress(communityData.formatted_address);
    
    // Check for duplicates
    const existing = await pool.query(
      'SELECT id FROM communities WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2) LIMIT 1',
      [communityData.name, city]
    );
    
    if (existing.rows.length > 0) {
      console.log(`  ⚠️  Duplicate: ${communityData.name} in ${city}`);
      return null;
    }

    const photos = communityData.photos ? 
      communityData.photos.slice(0, 6).map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      ) : [];

    const careTypes = classifyCareTypes(communityData.name, address);

    const result = await pool.query(`
      INSERT INTO communities (
        name, address, city, state, zip_code, county, region,
        phone, website, google_rating, google_review_count,
        google_places_id, latitude, longitude, care_types,
        photos, verified, data_source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING id, name
    `, [
      communityData.name, address, city, 'CA', zipCode, county, region,
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
      'Google Places API - Priority Northern CA Expansion'
    ]);

    return result.rows[0];
  } catch (error) {
    console.error(`Error saving ${communityData.name}:`, error.message);
    return null;
  }
}

async function expandPriorityCounty(countyData) {
  console.log(`\n🔍 Expanding ${countyData.name} County (${countyData.region})...`);
  
  const allDiscovered = [];
  const addedCommunities = [];
  
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
          await delay(150); // Rate limiting
        }
      }
      await delay(300); // Rate limiting between searches
    }
  }
  
  console.log(`  ✅ Found ${allDiscovered.length} unique places`);
  
  // Save to database
  for (const community of allDiscovered) {
    const saved = await saveCommunityToDatabase(community, countyData.name, countyData.region);
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
    duplicates: allDiscovered.length - addedCommunities.length
  };
}

async function priorityExpansion() {
  console.log('🚀 PRIORITY COUNTY EXPANSION - BATCH 1');
  console.log('📊 Target: Butte (Chico), Humboldt (Eureka), Nevada (Grass Valley)\n');
  
  const results = [];
  let totalAdded = 0;
  
  for (const county of PRIORITY_COUNTIES) {
    try {
      const result = await expandPriorityCounty(county);
      results.push(result);
      totalAdded += result.added;
      
      console.log(`\n📈 ${county.name} County Results:`);
      console.log(`   🆕 ${result.added} new communities added`);
      console.log(`   📍 ${result.discovered} total discovered`);
      console.log(`   🔄 ${result.duplicates} duplicates filtered`);
      
      await delay(2000); // Rate limiting between counties
      
    } catch (error) {
      console.error(`❌ Error with ${county.name}:`, error.message);
    }
  }
  
  // Final summary
  const finalCount = await pool.query('SELECT COUNT(*) as total FROM communities WHERE state = $1', ['CA']);
  
  console.log('\n🎉 PRIORITY EXPANSION COMPLETE');
  console.log('='.repeat(50));
  console.log(`📊 NEW COMMUNITIES ADDED: ${totalAdded}`);
  console.log(`🏆 TOTAL CALIFORNIA COMMUNITIES: ${finalCount.rows[0].total}`);
  console.log('\n📍 Results by County:');
  results.forEach(r => {
    console.log(`   ✅ ${r.county}: ${r.added} communities added`);
  });
  
  return results;
}

if (require.main === module) {
  priorityExpansion()
    .then(() => {
      console.log('\n✅ Priority expansion finished!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { priorityExpansion };