const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const axios = require('axios');
require('dotenv').config();

neonConfig.webSocketConstructor = ws;

// Simple geocoding using Nominatim (OpenStreetMap)
async function geocodeAddress(address, city, state) {
  try {
    const fullAddress = `${address}, ${city}, ${state}, USA`;
    const url = `https://nominatim.openstreetmap.org/search`;
    
    const response = await axios.get(url, {
      params: {
        q: fullAddress,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'TrueView Senior Living Platform'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    // Try with just city and state if full address fails
    const cityStateAddress = `${city}, ${state}, USA`;
    const cityResponse = await axios.get(url, {
      params: {
        q: cityStateAddress,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'TrueView Senior Living Platform'
      }
    });
    
    if (cityResponse.data && cityResponse.data.length > 0) {
      const result = cityResponse.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error geocoding ${address}, ${city}, ${state}:`, error.message);
    return null;
  }
}

async function addMissingCoordinates() {
  try {
    console.log('Finding communities without coordinates...\n');
    
    // Create new pool for initial query
    let pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Get all communities without coordinates
    const missingResult = await pool.query(`
      SELECT id, name, address, city, state
      FROM communities
      WHERE (latitude IS NULL OR longitude IS NULL)
      AND state = 'CA'
      ORDER BY city, name
      LIMIT 100
    `);
    
    const communities = missingResult.rows;
    console.log(`Processing first ${communities.length} California communities without coordinates\n`);
    
    // Close initial pool
    await pool.end();
    
    if (communities.length === 0) {
      console.log('No communities need coordinates!');
      return;
    }
    
    let updated = 0;
    let failed = 0;
    
    // Process one by one with new connection for each update
    for (let i = 0; i < communities.length; i++) {
      const community = communities[i];
      
      // Add delay to respect rate limits (1 request per second for Nominatim)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      console.log(`[${i+1}/${communities.length}] Geocoding ${community.name} in ${community.city}, ${community.state}...`);
      
      const coords = await geocodeAddress(community.address, community.city, community.state);
      
      if (coords) {
        // Create new pool for each update to avoid connection issues
        const updatePool = new Pool({ connectionString: process.env.DATABASE_URL });
        
        try {
          // Update the database
          await updatePool.query(`
            UPDATE communities
            SET latitude = $1, longitude = $2
            WHERE id = $3
          `, [coords.latitude, coords.longitude, community.id]);
          
          console.log(`  ✓ Updated: ${coords.latitude}, ${coords.longitude}`);
          updated++;
        } catch (updateError) {
          console.log(`  ✗ Failed to update database: ${updateError.message}`);
          failed++;
        } finally {
          await updatePool.end();
        }
      } else {
        console.log(`  ✗ Failed to geocode`);
        failed++;
      }
      
      // Show progress every 10 communities
      if ((i + 1) % 10 === 0) {
        console.log(`\nProgress: ${updated} updated, ${failed} failed, ${communities.length - i - 1} remaining\n`);
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total communities processed: ${communities.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Failed to geocode: ${failed}`);
    
    // Check final status with new connection
    const finalPool = new Pool({ connectionString: process.env.DATABASE_URL });
    const finalResult = await finalPool.query(`
      SELECT COUNT(*) 
      FROM communities 
      WHERE latitude IS NULL OR longitude IS NULL
    `);
    await finalPool.end();
    
    console.log(`\nRemaining communities without coordinates: ${finalResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error adding coordinates:', error);
  }
}

// Run the script
addMissingCoordinates();