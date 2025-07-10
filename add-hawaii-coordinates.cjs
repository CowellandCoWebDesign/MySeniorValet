const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Hawaii city coordinates for map display
const HAWAII_COORDINATES = {
  // Honolulu County
  'Honolulu': { lat: 21.3099, lng: -157.8581 },
  'Pearl City': { lat: 21.3972, lng: -157.9751 },
  'Kailua': { lat: 21.4022, lng: -157.7394 },
  'Kaneohe': { lat: 21.4180, lng: -157.8025 },
  'Wahiawa': { lat: 21.5028, lng: -158.0242 },
  'Aiea': { lat: 21.3847, lng: -157.9211 },
  'Mililani': { lat: 21.4511, lng: -158.0158 },
  'Hawaii Kai': { lat: 21.2886, lng: -157.7078 },
  
  // Hawaii County (Big Island)
  'Hilo': { lat: 19.7297, lng: -155.0900 },
  'Kailua-Kona': { lat: 19.6390, lng: -155.9969 },
  'Kona': { lat: 19.6390, lng: -155.9969 },
  'Waimea': { lat: 20.0297, lng: -155.6681 },
  'Pahoa': { lat: 19.4958, lng: -154.9419 },
  'Volcano': { lat: 19.4194, lng: -155.2386 },
  'Naalehu': { lat: 19.0656, lng: -155.5831 },
  'Honokaa': { lat: 20.0783, lng: -155.4658 },
  'Waikoloa': { lat: 19.9386, lng: -155.7903 },
  
  // Maui County
  'Kahului': { lat: 20.8947, lng: -156.4700 },
  'Lahaina': { lat: 20.8783, lng: -156.6825 },
  'Kihei': { lat: 20.7847, lng: -156.4486 },
  'Wailuku': { lat: 20.8914, lng: -156.5053 },
  'Makawao': { lat: 20.8558, lng: -156.3144 },
  'Paia': { lat: 20.9031, lng: -156.3697 },
  'Hana': { lat: 20.7581, lng: -156.0144 },
  'Wailea': { lat: 20.6906, lng: -156.4428 },
  
  // Kauai County
  'Lihue': { lat: 21.9811, lng: -159.3711 },
  'Kapaa': { lat: 22.0752, lng: -159.3189 },
  'Poipu': { lat: 21.8747, lng: -159.4447 },
  'Waimea': { lat: 21.9611, lng: -159.6656 },
  'Hanalei': { lat: 22.2069, lng: -159.5011 },
  'Koloa': { lat: 21.9089, lng: -159.4697 },
  'Hanapepe': { lat: 21.9111, lng: -159.5889 },
  'Kalaheo': { lat: 21.9236, lng: -159.5289 }
};

async function addHawaiiCoordinates() {
  console.log('🗺️ ADDING HAWAII COORDINATES FOR MAP DISPLAY');
  
  // Get all Hawaii facilities
  const hawaiiQuery = `
    SELECT id, name, city, county, state, latitude, longitude
    FROM communities 
    WHERE state = 'HI'
    ORDER BY county, city, name
  `;
  
  const hawaiiResult = await pool.query(hawaiiQuery);
  const hawaiiFacilities = hawaiiResult.rows;
  
  console.log(`🏝️ Found ${hawaiiFacilities.length} Hawaii facilities to update`);
  
  let updatedCount = 0;
  
  for (const facility of hawaiiFacilities) {
    const coordinates = HAWAII_COORDINATES[facility.city];
    
    if (coordinates && (!facility.latitude || !facility.longitude)) {
      // Add small random offset to avoid overlapping markers
      const latOffset = (Math.random() - 0.5) * 0.01; // ~0.5 mile variance
      const lngOffset = (Math.random() - 0.5) * 0.01;
      
      const finalLat = coordinates.lat + latOffset;
      const finalLng = coordinates.lng + lngOffset;
      
      try {
        const updateQuery = `
          UPDATE communities 
          SET latitude = $1, longitude = $2
          WHERE id = $3
        `;
        
        await pool.query(updateQuery, [finalLat, finalLng, facility.id]);
        
        updatedCount++;
        console.log(`✅ Updated ${facility.name} (${facility.city}): ${finalLat.toFixed(4)}, ${finalLng.toFixed(4)}`);
        
      } catch (error) {
        console.error(`❌ Failed to update ${facility.name}: ${error.message}`);
      }
    } else if (coordinates) {
      console.log(`⏩ ${facility.name} (${facility.city}) already has coordinates`);
    } else {
      console.log(`⚠️  No coordinates found for ${facility.city}`);
    }
  }
  
  console.log(`\n🎯 COORDINATES UPDATE COMPLETE:`);
  console.log(`   Updated: ${updatedCount} facilities`);
  console.log(`   Total Hawaii facilities: ${hawaiiFacilities.length}`);
  
  // Verify coordinates were added
  const verifyQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates
    FROM communities 
    WHERE state = 'HI'
  `;
  
  const verifyResult = await pool.query(verifyQuery);
  const stats = verifyResult.rows[0];
  
  console.log(`\n🗺️ HAWAII MAP VERIFICATION:`);
  console.log(`   Total facilities: ${stats.total}`);
  console.log(`   With coordinates: ${stats.with_coordinates}`);
  console.log(`   Coverage: ${((stats.with_coordinates / stats.total) * 100).toFixed(1)}%`);
  
  if (stats.with_coordinates > 0) {
    console.log(`\n🌺 SUCCESS: Hawaii facilities now visible on map!`);
  }
  
  await pool.end();
}

if (require.main === module) {
  addHawaiiCoordinates().catch(console.error);
}

module.exports = { addHawaiiCoordinates };