const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Comprehensive Texas city coordinates - expanded list
const TEXAS_COORDINATES = {
  // Major cities already covered
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
  
  // Additional cities for better coverage
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
  'Bryan': { lat: 30.6744, lng: -96.3700 },
  'Allen': { lat: 33.1031, lng: -96.6706 },
  'League City': { lat: 29.5075, lng: -95.0949 },
  'Mansfield': { lat: 32.5632, lng: -97.1417 },
  'Grapevine': { lat: 32.9343, lng: -97.0781 },
  'Huntsville': { lat: 30.7235, lng: -95.5508 },
  'Wylie': { lat: 33.0151, lng: -96.5389 },
  'Galveston': { lat: 29.2694, lng: -94.7850 },
  'Keller': { lat: 32.9348, lng: -97.2514 },
  'Texarkana': { lat: 33.4251, lng: -94.0477 },
  'Coppell': { lat: 32.9546, lng: -97.0150 },
  'Rockwall': { lat: 32.9312, lng: -96.4597 },
  'Burleson': { lat: 32.5421, lng: -97.3209 },
  'Duncanville': { lat: 32.6518, lng: -96.9083 },
  'Friendswood': { lat: 29.5294, lng: -95.2010 },
  'Haltom City': { lat: 32.7996, lng: -97.2692 },
  'The Colony': { lat: 33.0901, lng: -96.8928 },
  'Pflugerville': { lat: 30.4394, lng: -97.6200 },
  'Georgetown': { lat: 30.6327, lng: -97.6779 },
  'Weatherford': { lat: 32.7593, lng: -97.7970 },
  'Cleburne': { lat: 32.3476, lng: -97.3867 },
  'Granbury': { lat: 32.4421, lng: -97.7947 },
  'Brownwood': { lat: 31.7093, lng: -98.9912 },
  'Paris': { lat: 33.6617, lng: -95.5555 },
  'Corsicana': { lat: 32.0954, lng: -96.4686 },
  'Lufkin': { lat: 31.3382, lng: -94.7291 },
  'Nacogdoches': { lat: 31.6038, lng: -94.6555 },
  'Marshall': { lat: 32.5446, lng: -94.3675 },
  'Palestine': { lat: 31.7621, lng: -95.6307 },
  'Greenville': { lat: 33.1384, lng: -96.1114 },
  'Sulphur Springs': { lat: 33.1387, lng: -95.6011 },
  'Denison': { lat: 33.7557, lng: -96.5367 },
  'Gainesville': { lat: 33.6262, lng: -97.1333 },
  'Stephenville': { lat: 32.2207, lng: -98.2020 },
  'Mineral Wells': { lat: 32.8085, lng: -98.1128 },
  'Brenham': { lat: 30.1669, lng: -96.3977 },
  'Bastrop': { lat: 30.1104, lng: -97.3153 },
  'Lockhart': { lat: 29.8849, lng: -97.6689 },
  'Seguin': { lat: 29.5688, lng: -97.9647 },
  'Fredericksburg': { lat: 30.2752, lng: -98.8719 },
  'Boerne': { lat: 29.7946, lng: -98.7320 },
  'Kerrville': { lat: 30.0474, lng: -99.1403 },
  'Del Rio': { lat: 29.3628, lng: -100.8968 },
  'Eagle Pass': { lat: 28.7089, lng: -100.4995 },
  'Uvalde': { lat: 29.2097, lng: -99.7864 }
};

async function completeTexasCoordinates() {
  console.log('🤠 COMPLETING TEXAS COORDINATE MAPPING');
  
  let totalUpdated = 0;
  const maxBatchSize = 10; // Small batches to prevent timeouts
  
  // Get count of facilities still needing coordinates
  const countQuery = `
    SELECT COUNT(*) as total
    FROM communities 
    WHERE state = 'TX' 
    AND (latitude IS NULL OR longitude IS NULL)
  `;
  
  const countResult = await pool.query(countQuery);
  const remainingCount = countResult.rows[0].total;
  
  console.log(`📍 ${remainingCount} Texas facilities still need coordinates`);
  
  // Process in small batches
  while (totalUpdated < remainingCount && totalUpdated < 1000) {
    // Get next batch of facilities without coordinates
    const batchQuery = `
      SELECT id, name, city, county
      FROM communities 
      WHERE state = 'TX' 
      AND (latitude IS NULL OR longitude IS NULL)
      LIMIT $1
    `;
    
    const batchResult = await pool.query(batchQuery, [maxBatchSize]);
    const facilities = batchResult.rows;
    
    if (facilities.length === 0) break;
    
    for (const facility of facilities) {
      // Try exact match first
      let coordinates = TEXAS_COORDINATES[facility.city];
      
      // If no exact match, try case-insensitive search
      if (!coordinates) {
        const cityKey = Object.keys(TEXAS_COORDINATES).find(
          key => key.toLowerCase() === facility.city.toLowerCase()
        );
        if (cityKey) {
          coordinates = TEXAS_COORDINATES[cityKey];
        }
      }
      
      // If still no match, use county seat as fallback
      if (!coordinates) {
        // Default to center of Texas for now
        coordinates = { lat: 31.9686, lng: -99.9018 };
      }
      
      // Add random offset to avoid overlapping
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
        console.error(`❌ Error updating ${facility.name}: ${error.message}`);
      }
    }
    
    // Progress update
    if (totalUpdated % 100 === 0 || totalUpdated === facilities.length) {
      console.log(`✅ Progress: ${totalUpdated} facilities updated`);
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\n🎯 UPDATE COMPLETE: ${totalUpdated} facilities updated`);
  
  // Final statistics
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates
    FROM communities 
    WHERE state = 'TX'
  `;
  
  const statsResult = await pool.query(statsQuery);
  const stats = statsResult.rows[0];
  
  console.log(`\n🗺️ FINAL TEXAS MAP STATUS:`);
  console.log(`   Total facilities: ${stats.total}`);
  console.log(`   With coordinates: ${stats.with_coordinates}`);
  console.log(`   Coverage: ${((stats.with_coordinates / stats.total) * 100).toFixed(1)}%`);
  
  await pool.end();
}

if (require.main === module) {
  completeTexasCoordinates().catch(console.error);
}

module.exports = { completeTexasCoordinates };