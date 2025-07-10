const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Top 50 most common Texas cities with coordinates
const TEXAS_COORDINATES = {
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'El Paso': { lat: 31.7619, lng: -106.4850 },
  'Arlington': { lat: 32.7357, lng: -97.1081 },
  'Corpus Christi': { lat: 27.8006, lng: -97.3964 },
  'Plano': { lat: 33.0198, lng: -96.6989 },
  'Lubbock': { lat: 33.5779, lng: -101.8552 },
  'Laredo': { lat: 27.5306, lng: -99.4803 },
  'Garland': { lat: 32.9126, lng: -96.6389 },
  'Irving': { lat: 32.8140, lng: -96.9489 },
  'Amarillo': { lat: 35.2220, lng: -101.8313 },
  'Brownsville': { lat: 25.9018, lng: -97.4975 },
  'Pasadena': { lat: 29.6911, lng: -95.2091 },
  'Mesquite': { lat: 32.7668, lng: -96.5992 },
  'Killeen': { lat: 31.1171, lng: -97.7278 },
  'Denton': { lat: 33.2148, lng: -97.1331 },
  'Waco': { lat: 31.5494, lng: -97.1467 },
  'Beaumont': { lat: 30.0803, lng: -94.1266 },
  'Abilene': { lat: 32.4487, lng: -99.7331 },
  'Odessa': { lat: 31.8457, lng: -102.3676 },
  'Midland': { lat: 32.0173, lng: -102.1012 },
  'Tyler': { lat: 32.3513, lng: -95.3011 },
  'Longview': { lat: 32.5007, lng: -94.7405 },
  'Sugar Land': { lat: 29.6196, lng: -95.6349 },
  'Wichita Falls': { lat: 33.9137, lng: -98.4934 },
  'College Station': { lat: 30.6280, lng: -96.3344 },
  'Baytown': { lat: 29.7355, lng: -94.9777 },
  'Lewisville': { lat: 33.0462, lng: -96.9942 },
  'Round Rock': { lat: 30.5083, lng: -97.6789 },
  'Richardson': { lat: 32.9483, lng: -96.7299 },
  'Frisco': { lat: 33.1507, lng: -96.8236 },
  'McKinney': { lat: 33.1976, lng: -96.6154 },
  'Carrollton': { lat: 32.9537, lng: -96.8903 },
  'Pharr': { lat: 26.1948, lng: -98.1836 },
  'Pearland': { lat: 29.5636, lng: -95.2861 },
  'Missouri City': { lat: 29.5688, lng: -95.5377 },
  'Harlingen': { lat: 26.1906, lng: -97.6961 },
  'Victoria': { lat: 28.8053, lng: -97.0036 },
  'Flower Mound': { lat: 33.0146, lng: -97.0969 },
  'Conroe': { lat: 30.3119, lng: -95.4560 },
  'Grand Prairie': { lat: 32.7460, lng: -96.9978 },
  'New Braunfels': { lat: 29.7030, lng: -98.1245 },
  'Edinburg': { lat: 26.3017, lng: -98.1633 },
  'San Angelo': { lat: 31.4638, lng: -100.4370 },
  'Cedar Park': { lat: 30.5052, lng: -97.8203 },
  'Temple': { lat: 31.0982, lng: -97.3428 },
  'Bryan': { lat: 30.6744, lng: -96.3700 }
};

async function quickUpdateTexasCoordinates() {
  console.log('🤠 QUICK TEXAS COORDINATES UPDATE');
  
  const maxUpdates = 500; // Limit to prevent timeouts
  let totalUpdated = 0;
  
  // Focus on most common cities first
  const cityPriority = Object.keys(TEXAS_COORDINATES);
  
  for (const city of cityPriority) {
    if (totalUpdated >= maxUpdates) break;
    
    const coordinates = TEXAS_COORDINATES[city];
    
    // Get facilities for this city
    const query = `
      SELECT id, name, city
      FROM communities 
      WHERE state = 'TX' 
      AND LOWER(city) = LOWER($1)
      AND (latitude IS NULL OR longitude IS NULL)
      LIMIT 20
    `;
    
    const result = await pool.query(query, [city]);
    const facilities = result.rows;
    
    if (facilities.length === 0) continue;
    
    console.log(`📍 ${city}: Updating ${facilities.length} facilities`);
    
    for (const facility of facilities) {
      if (totalUpdated >= maxUpdates) break;
      
      // Add small random offset to avoid overlapping markers
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      const finalLat = coordinates.lat + latOffset;
      const finalLng = coordinates.lng + lngOffset;
      
      try {
        const updateQuery = `
          UPDATE communities 
          SET latitude = $1, longitude = $2
          WHERE id = $3
        `;
        
        await pool.query(updateQuery, [finalLat, finalLng, facility.id]);
        totalUpdated++;
        
      } catch (error) {
        console.error(`❌ Failed to update ${facility.name}: ${error.message}`);
      }
    }
    
    // Progress update every 100 facilities
    if (totalUpdated % 100 === 0) {
      console.log(`✅ Progress: ${totalUpdated} facilities updated`);
    }
  }
  
  console.log(`\n🎯 QUICK UPDATE COMPLETE: ${totalUpdated} facilities updated`);
  
  // Final verification
  const verifyQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates
    FROM communities 
    WHERE state = 'TX'
  `;
  
  const verifyResult = await pool.query(verifyQuery);
  const stats = verifyResult.rows[0];
  
  console.log(`\n🗺️ TEXAS MAP STATUS:`);
  console.log(`   Total facilities: ${stats.total}`);
  console.log(`   With coordinates: ${stats.with_coordinates}`);
  console.log(`   Coverage: ${((stats.with_coordinates / stats.total) * 100).toFixed(1)}%`);
  
  if (stats.with_coordinates > 500) {
    console.log(`\n🤠 SUCCESS: Major Texas cities now visible on map!`);
    console.log(`   Next step: Run script again to continue with remaining cities`);
  }
  
  await pool.end();
}

if (require.main === module) {
  quickUpdateTexasCoordinates().catch(console.error);
}

module.exports = { quickUpdateTexasCoordinates };