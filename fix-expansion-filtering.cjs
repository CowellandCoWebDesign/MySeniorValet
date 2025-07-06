// EMERGENCY FREEZE: Script disabled due to $600 in Google API charges
exit 1;
const { Pool } = require('@neondatabase/serverless');
const axios = require('axios');

// Critical fix: Re-expand counties with corrected filtering
async function fixExpansionFiltering() {
  console.log('🔧 CRITICAL FIX: Re-expanding counties with corrected filtering...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Counties that need re-expansion due to restrictive filtering
  const countiesNeedingReexpansion = [
    'Humboldt', 'Mendocino', 'Lake', 'Shasta', 'Siskiyou', 'Modoc', 'Lassen',
    'Plumas', 'Sierra', 'Nevada', 'Butte', 'Colusa', 'Glenn', 'Tehama'
  ];
  
  let totalNewCommunities = 0;
  
  for (const county of countiesNeedingReexpansion) {
    try {
      console.log(`\n🎯 Re-expanding ${county} County with relaxed filtering...`);
      
      // Get major cities for this county
      const cities = getCitiesForCounty(county);
      
      for (const city of cities) {
        const discoveredCommunities = await searchWithRelaxedFiltering(city, county);
        
        if (discoveredCommunities.length > 0) {
          const newCommunities = await addUniqueCommunitiesToDatabase(discoveredCommunities, county, pool);
          totalNewCommunities += newCommunities;
          console.log(`✅ Added ${newCommunities} new communities from ${city}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Error processing ${county}:`, error.message);
    }
  }
  
  console.log(`\n📊 EXPANSION COMPLETE: ${totalNewCommunities} new communities added`);
  
  // Get final count
  const result = await pool.query('SELECT COUNT(*) FROM communities');
  console.log(`Total communities in database: ${result.rows[0].count}`);
  
  await pool.end();
}

function getCitiesForCounty(county) {
  const cityMap = {
    'Humboldt': ['Eureka', 'Arcata', 'Fortuna', 'McKinleyville', 'Ferndale'],
    'Mendocino': ['Ukiah', 'Willits', 'Fort Bragg', 'Mendocino', 'Laytonville'],
    'Lake': ['Lakeport', 'Clearlake', 'Middletown', 'Kelseyville', 'Nice'],
    'Shasta': ['Redding', 'Anderson', 'Burney', 'Mount Shasta', 'Shasta Lake'],
    'Siskiyou': ['Yreka', 'Mount Shasta', 'Dunsmuir', 'Weed', 'Tulelake'],
    'Modoc': ['Alturas', 'Cedarville', 'Eagleville', 'Fort Bidwell'],
    'Lassen': ['Susanville', 'Westwood', 'Bieber', 'Herlong'],
    'Plumas': ['Quincy', 'Portola', 'Graeagle', 'Chester'],
    'Sierra': ['Downieville', 'Loyalton', 'Sierraville'],
    'Nevada': ['Nevada City', 'Grass Valley', 'Truckee', 'Penn Valley'],
    'Butte': ['Chico', 'Oroville', 'Paradise', 'Gridley', 'Biggs'],
    'Colusa': ['Colusa', 'Williams', 'Arbuckle', 'Maxwell'],
    'Glenn': ['Willows', 'Orland', 'Hamilton City'],
    'Tehama': ['Red Bluff', 'Corning', 'Tehama', 'Los Molinos']
  };
  
  return cityMap[county] || [county];
}

async function searchWithRelaxedFiltering(city, county) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }
  
  const searchTerms = [
    `senior living ${city} ${county} county ca`,
    `assisted living ${city} ca`,
    `memory care ${city} ca`,
    `retirement community ${city} ca`,
    `nursing home ${city} ca`,
    `elder care ${city} ca`
  ];
  
  const allCommunities = [];
  const seenPlaceIds = new Set();
  
  for (const term of searchTerms) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: term,
          key: apiKey,
          radius: 25000
        },
        timeout: 15000
      });
      
      if (response.data?.results?.length > 0) {
        for (const place of response.data.results) {
          if (seenPlaceIds.has(place.place_id)) continue;
          
          // Apply relaxed filtering
          if (isValidSeniorLivingFacility(place.name)) {
            seenPlaceIds.add(place.place_id);
            
            // Get detailed info
            const details = await getPlaceDetails(place.place_id, apiKey);
            
            allCommunities.push({
              name: place.name,
              address: place.formatted_address || place.vicinity || '',
              city: city,
              state: 'CA',
              zipCode: extractZipCode(place.formatted_address) || '',
              phone: details?.formatted_phone_number || null,
              website: details?.website || null,
              rating: place.rating || null,
              reviewCount: place.user_ratings_total || 0,
              lat: place.geometry?.location?.lat || null,
              lng: place.geometry?.location?.lng || null,
              placeId: place.place_id
            });
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Search failed for "${term}":`, error.message);
    }
  }
  
  return allCommunities;
}

function isValidSeniorLivingFacility(name) {
  const nameLower = name.toLowerCase();
  
  // Expanded senior living keywords
  const seniorKeywords = [
    'senior', 'assisted living', 'memory care', 'independent living', 
    'retirement', 'elder care', 'adult care', 'senior community',
    'continuing care', 'skilled nursing', 'nursing home', 'care facility',
    'assisted', 'residence', 'manor', 'lodge', 'springs', 'gardens',
    'terrace', 'village', 'estate', 'place', 'home', 'center'
  ];
  
  // Exclude non-senior facilities
  const excludeKeywords = [
    'hospital', 'urgent care', 'clinic', 'medical center', 'pharmacy',
    'school', 'daycare', 'bank', 'restaurant', 'store', 'shop', 'hotel',
    'gas station', 'church', 'temple', 'mosque', 'auto', 'repair'
  ];
  
  const hasSeniorKeyword = seniorKeywords.some(keyword => nameLower.includes(keyword));
  const hasExcludeKeyword = excludeKeywords.some(keyword => nameLower.includes(keyword));
  
  return hasSeniorKeyword && !hasExcludeKeyword;
}

async function getPlaceDetails(placeId, apiKey) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: 'formatted_phone_number,website'
      },
      timeout: 10000
    });
    
    return response.data?.result || null;
  } catch (error) {
    return null;
  }
}

function extractZipCode(address) {
  if (!address) return null;
  const match = address.match(/\b\d{5}(?:-\d{4})?\b/);
  return match ? match[0] : null;
}

async function addUniqueCommunitiesToDatabase(communities, county, pool) {
  let addedCount = 0;
  
  for (const community of communities) {
    try {
      // Check if community already exists
      const existingResult = await pool.query(
        'SELECT id FROM communities WHERE name = $1 AND city = $2',
        [community.name, community.city]
      );
      
      if (existingResult.rows.length > 0) {
        continue; // Skip duplicates
      }
      
      // Add new community
      await pool.query(`
        INSERT INTO communities (
          name, address, city, state, zip_code, phone, website, 
          description, care_types, amenities, pricing, availability,
          photos, reviews, is_verified, verification_date,
          google_rating, google_review_count, last_updated
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
      `, [
        community.name,
        community.address,
        community.city,
        community.state,
        community.zipCode,
        community.phone,
        community.website,
        `Senior living facility in ${community.city}, ${county} County, CA.`,
        JSON.stringify(['Assisted Living']),
        JSON.stringify([]),
        null,
        'Contact for Availability',
        JSON.stringify([]),
        JSON.stringify([]),
        true,
        new Date(),
        community.rating,
        community.reviewCount,
        new Date()
      ]);
      
      addedCount++;
      
    } catch (error) {
      console.error(`Error adding community ${community.name}:`, error.message);
    }
  }
  
  return addedCount;
}

fixExpansionFiltering().catch(console.error);