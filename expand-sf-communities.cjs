/**
 * San Francisco Community Discovery Script
 * Expands database to include all authentic senior living communities in San Francisco
 */

const { Pool } = require('@neondatabase/serverless');
const axios = require('axios');

// Use environment variable for database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function discoverSanFranciscoCommunities() {
  console.log('🔍 Starting comprehensive San Francisco senior living discovery...');
  console.log('Current communities:', await getCurrentSFCommunities());
  
  const searchTerms = [
    'senior living San Francisco CA',
    'assisted living San Francisco CA', 
    'retirement community San Francisco CA',
    'memory care San Francisco CA',
    'senior apartments San Francisco CA',
    'senior housing San Francisco CA',
    'independent living San Francisco CA',
    'continuing care retirement San Francisco CA',
    'nursing home San Francisco CA',
    'senior care facility San Francisco CA',
    'elder care San Francisco CA',
    'senior residence San Francisco CA'
  ];

  const allDiscovered = [];
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('❌ Google Places API key not found. Please set GOOGLE_PLACES_API_KEY environment variable.');
    return;
  }

  console.log(`📡 Running ${searchTerms.length} comprehensive searches...`);

  for (const searchTerm of searchTerms) {
    console.log(`\n🔎 Searching: "${searchTerm}"`);
    
    try {
      // Use Google Places Text Search API
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params: {
          query: searchTerm,
          key: GOOGLE_PLACES_API_KEY,
          region: 'us'
        }
      });

      if (response.data.results) {
        const validCommunities = response.data.results.filter(place => 
          isValidSeniorLivingFacility(place.name, place.types || [])
        );

        console.log(`   ✅ Found ${validCommunities.length} valid communities`);
        
        for (const place of validCommunities) {
          const community = {
            name: place.name,
            address: place.formatted_address || 'Address not available',
            googlePlacesId: place.place_id,
            latitude: place.geometry?.location?.lat,
            longitude: place.geometry?.location?.lng,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            types: place.types,
            searchTerm: searchTerm
          };
          
          allDiscovered.push(community);
          console.log(`     • ${place.name} (${place.rating}★)`);
        }
      }
      
      // Rate limiting to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error searching "${searchTerm}":`, error.message);
    }
  }

  console.log(`\n📊 Discovery complete! Found ${allDiscovered.length} total results`);
  
  // Deduplicate by Google Places ID and name similarity
  const deduplicated = await deduplicateCommunities(allDiscovered);
  console.log(`🔧 After deduplication: ${deduplicated.length} unique communities`);
  
  // Add to database
  const added = await addCommunitiesToDatabase(deduplicated);
  console.log(`💾 Successfully added ${added} new communities to database`);
  
  const finalCount = await getCurrentSFCommunities();
  console.log(`🎉 San Francisco now has ${finalCount.length} total communities in database`);
  
  return {
    discovered: allDiscovered.length,
    deduplicated: deduplicated.length,
    added: added,
    total: finalCount.length
  };
}

async function getCurrentSFCommunities() {
  try {
    const result = await pool.query(`
      SELECT id, name, city, "zipCode" 
      FROM communities 
      WHERE LOWER(city) = 'san francisco' 
      ORDER BY name
    `);
    return result.rows;
  } catch (error) {
    console.error('Error getting current SF communities:', error);
    return [];
  }
}

function isValidSeniorLivingFacility(name, types) {
  const excludeTerms = [
    'hospital', 'clinic', 'medical center', 'pharmacy', 'dentist', 'doctor',
    'church', 'school', 'university', 'hotel', 'motel', 'restaurant', 
    'store', 'shop', 'bank', 'gas station', 'park', 'library'
  ];
  
  const includeTerms = [
    'senior', 'assisted', 'retirement', 'memory care', 'elder', 'nursing',
    'care home', 'residential care', 'living', 'manor', 'village', 'gardens',
    'heights', 'terrace', 'residence', 'community', 'center'
  ];
  
  const lowerName = name.toLowerCase();
  
  // Exclude obvious non-senior facilities
  if (excludeTerms.some(term => lowerName.includes(term))) {
    return false;
  }
  
  // Include facilities with senior living keywords
  if (includeTerms.some(term => lowerName.includes(term))) {
    return true;
  }
  
  // Check Google Places types for care facilities
  const careTypes = ['health', 'lodging', 'establishment'];
  if (types.some(type => careTypes.includes(type))) {
    return true;
  }
  
  return false;
}

async function deduplicateCommunities(communities) {
  const seen = new Set();
  const deduplicated = [];
  
  for (const community of communities) {
    // Create a key for deduplication
    const key = `${community.googlePlacesId || ''}|${community.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(community);
    }
  }
  
  return deduplicated;
}

async function addCommunitiesToDatabase(communities) {
  let addedCount = 0;
  
  for (const community of communities) {
    try {
      // Check if community already exists
      const existing = await pool.query(
        'SELECT id FROM communities WHERE name = $1 OR "googlePlacesId" = $2',
        [community.name, community.googlePlacesId]
      );
      
      if (existing.rows.length > 0) {
        console.log(`   ⏭️  Skipping existing: ${community.name}`);
        continue;
      }
      
      // Extract city and ZIP from address
      const { city, zipCode } = parseAddress(community.address);
      
      // Insert new community
      await pool.query(`
        INSERT INTO communities (
          name, address, city, state, "zipCode", latitude, longitude,
          "googlePlacesId", "googleRating", "googleReviewCount",
          "careTypes", "dataSource", verified, county, region
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
      `, [
        community.name,
        community.address,
        city,
        'CA',
        zipCode,
        community.latitude,
        community.longitude,
        community.googlePlacesId,
        community.rating || null,
        community.userRatingsTotal || null,
        JSON.stringify(['Senior Living']), // Default care type
        'Google Places Discovery',
        true,
        'San Francisco County',
        'Bay Area'
      ]);
      
      addedCount++;
      console.log(`   ✅ Added: ${community.name} (${zipCode})`);
      
    } catch (error) {
      console.error(`❌ Error adding ${community.name}:`, error.message);
    }
  }
  
  return addedCount;
}

function parseAddress(address) {
  // Extract city and ZIP code from formatted address
  let city = 'San Francisco';
  let zipCode = null;
  
  // Look for ZIP code pattern
  const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
  if (zipMatch) {
    zipCode = zipMatch[0].split('-')[0]; // Take just the 5-digit part
  }
  
  // Ensure city is San Francisco for all results
  if (address.toLowerCase().includes('san francisco')) {
    city = 'San Francisco';
  }
  
  return { city, zipCode };
}

// Run the discovery
if (require.main === module) {
  discoverSanFranciscoCommunities()
    .then(results => {
      console.log('\n🎯 Final Results:', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Discovery failed:', error);
      process.exit(1);
    });
}

module.exports = { discoverSanFranciscoCommunities };