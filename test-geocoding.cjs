/**
 * Test Geocoding Script
 * Runs geocoding for San Francisco communities to populate missing coordinates
 */

const { Pool } = require('pg');

// Simple in-memory API cost protection for testing
class TestApiCostProtection {
  constructor() {
    this.totalCost = 0;
    this.totalCalls = 0;
  }

  async checkBeforeOperation(estimatedCalls, estimatedCost) {
    console.log(`API Cost Check: ${estimatedCalls} calls, $${estimatedCost.toFixed(3)} estimated`);
    return {
      allowed: true,
      reason: 'Test mode - allowing all operations'
    };
  }

  async recordUsage(actualCalls, actualCost, operation) {
    this.totalCalls += actualCalls;
    this.totalCost += actualCost;
    console.log(`API Usage: ${operation} - ${actualCalls} calls, $${actualCost.toFixed(3)}`);
    console.log(`Total so far: ${this.totalCalls} calls, $${this.totalCost.toFixed(3)}`);
  }
}

const apiCostProtection = new TestApiCostProtection();

// Simple geocoding function
async function geocodeAddress(address, city, state, zipCode) {
  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const fullAddress = `${address}, ${city}, ${state}${zipCode ? ` ${zipCode}` : ''}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }

    console.warn(`Geocoding failed for ${fullAddress}: ${data.status}`);
    return null;
  } catch (error) {
    console.error(`Error geocoding address ${address}:`, error);
    return null;
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runGeocodingTest() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🚀 Starting geocoding for all communities with missing coordinates...');

    // Find all communities missing coordinates
    const result = await pool.query(`
      SELECT id, name, address, city, state, zip_code 
      FROM communities 
      WHERE (latitude IS NULL OR longitude IS NULL)
      ORDER BY city, name
      LIMIT 25
    `);

    const communities = result.rows;
    console.log(`Found ${communities.length} San Francisco communities missing coordinates`);

    if (communities.length === 0) {
      console.log('✅ No communities need geocoding!');
      return;
    }

    let successful = 0;
    let failed = 0;

    for (const community of communities) {
      console.log(`\n📍 Geocoding: ${community.name} (${community.address})`);

      // Check API cost protection
      const costCheck = await apiCostProtection.checkBeforeOperation(1, 0.005);
      if (!costCheck.allowed) {
        console.log(`❌ ${costCheck.reason}`);
        failed++;
        continue;
      }

      // Geocode the address
      const coordinates = await geocodeAddress(
        community.address,
        community.city,
        community.state,
        community.zip_code
      );

      if (coordinates) {
        // Update database with coordinates
        await pool.query(
          'UPDATE communities SET latitude = $1, longitude = $2 WHERE id = $3',
          [coordinates.lat.toFixed(8), coordinates.lng.toFixed(8), community.id]
        );

        // Record API usage
        await apiCostProtection.recordUsage(1, 0.005, `Geocode: ${community.name}`);

        console.log(`✅ Success: ${coordinates.lat}, ${coordinates.lng}`);
        successful++;
      } else {
        console.log(`❌ Failed to geocode ${community.name}`);
        failed++;
      }

      // Add delay between requests
      await delay(1000);
    }

    console.log(`\n🏁 Geocoding complete: ${successful} successful, ${failed} failed`);

    // Check results
    const afterResult = await pool.query(`
      SELECT COUNT(*) as missing_coordinates 
      FROM communities 
      WHERE latitude IS NULL OR longitude IS NULL
    `);

    console.log(`📊 Total communities still missing coordinates: ${afterResult.rows[0].missing_coordinates}`);

  } catch (error) {
    console.error('❌ Error during geocoding test:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
runGeocodingTest().catch(console.error);