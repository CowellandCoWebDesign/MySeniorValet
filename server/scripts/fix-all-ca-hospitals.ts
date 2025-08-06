import { db } from '../db';
import { hospitals } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Comprehensive city coordinates for California
const californiaCoordinates: Record<string, { lat: number, lng: number }> = {
  // Major cities
  'LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
  'SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
  'SAN DIEGO': { lat: 32.7157, lng: -117.1611 },
  'SACRAMENTO': { lat: 38.5816, lng: -121.4944 },
  'FRESNO': { lat: 36.7378, lng: -119.7871 },
  'OAKLAND': { lat: 37.8044, lng: -122.2712 },
  'SAN JOSE': { lat: 37.3382, lng: -121.8863 },
  'LONG BEACH': { lat: 33.7701, lng: -118.1937 },
  'ANAHEIM': { lat: 33.8366, lng: -117.9143 },
  'RIVERSIDE': { lat: 33.9806, lng: -117.3755 },
  'BAKERSFIELD': { lat: 35.3733, lng: -119.0187 },
  'STOCKTON': { lat: 37.9577, lng: -121.2908 },
  'IRVINE': { lat: 33.6846, lng: -117.8265 },
  'SANTA ANA': { lat: 33.7455, lng: -117.8677 },
  'MODESTO': { lat: 37.6391, lng: -120.9969 },
  'FONTANA': { lat: 34.0922, lng: -117.4350 },
  'MORENO VALLEY': { lat: 33.9425, lng: -117.2297 },
  'GLENDALE': { lat: 34.1425, lng: -118.2551 },
  'HUNTINGTON BEACH': { lat: 33.6595, lng: -117.9988 },
  'SANTA CLARITA': { lat: 34.3917, lng: -118.5426 },
  'OXNARD': { lat: 34.1975, lng: -119.1771 },
  'GARDEN GROVE': { lat: 33.7743, lng: -117.9380 },
  'SANTA ROSA': { lat: 38.4404, lng: -122.7141 },
  'ONTARIO': { lat: 34.0633, lng: -117.6509 },
  'RANCHO CUCAMONGA': { lat: 34.1064, lng: -117.5931 },
  'ELK GROVE': { lat: 38.4088, lng: -121.3716 },
  'CORONA': { lat: 33.8753, lng: -117.5664 },
  'LANCASTER': { lat: 34.6868, lng: -118.1542 },
  'PALMDALE': { lat: 34.5794, lng: -118.1165 },
  'SALINAS': { lat: 36.6777, lng: -121.6555 },
  'HAYWARD': { lat: 37.6688, lng: -122.0808 },
  'POMONA': { lat: 34.0551, lng: -117.7500 },
  'ESCONDIDO': { lat: 33.1192, lng: -117.0864 },
  'TORRANCE': { lat: 33.8358, lng: -118.3406 },
  'PASADENA': { lat: 34.1478, lng: -118.1445 },
  'FULLERTON': { lat: 33.8703, lng: -117.9253 },
  'ORANGE': { lat: 33.7879, lng: -117.8531 },
  'ROSEVILLE': { lat: 38.7521, lng: -121.2880 },
  'VISALIA': { lat: 36.3302, lng: -119.2921 },
  'THOUSAND OAKS': { lat: 34.1706, lng: -118.8376 },
  'CONCORD': { lat: 37.9779, lng: -122.0311 },
  'SIMI VALLEY': { lat: 34.2694, lng: -118.7815 },
  'VALLEJO': { lat: 38.1041, lng: -122.2566 },
  'VICTORVILLE': { lat: 34.5362, lng: -117.2928 },
  
  // Northern California (Redding area)
  'REDDING': { lat: 40.5865, lng: -122.3917 },
  'CHICO': { lat: 39.7285, lng: -121.8375 },
  'YUBA CITY': { lat: 39.1404, lng: -121.6169 },
  'RED BLUFF': { lat: 40.1785, lng: -122.2358 },
  'SHASTA': { lat: 40.5994, lng: -122.5550 },
  'EUREKA': { lat: 40.8021, lng: -124.1637 },
  
  // Bay Area specific
  'SAN MATEO': { lat: 37.5630, lng: -122.3255 },
  'BERKELEY': { lat: 37.8716, lng: -122.2727 },
  'DALY CITY': { lat: 37.6879, lng: -122.4702 },
  'SAN LEANDRO': { lat: 37.7249, lng: -122.1561 },
  'MOUNTAIN VIEW': { lat: 37.3861, lng: -122.0839 },
  'PLEASANTON': { lat: 37.6624, lng: -121.8747 },
  'REDWOOD CITY': { lat: 37.4852, lng: -122.2364 },
  'SUNNYVALE': { lat: 37.3688, lng: -122.0363 },
  'SANTA CLARA': { lat: 37.3541, lng: -121.9552 },
  'PALO ALTO': { lat: 37.4419, lng: -122.1430 },
  'STANFORD': { lat: 37.4363, lng: -122.1747 },
  'MENLO PARK': { lat: 37.4530, lng: -122.1817 },
  'BURLINGAME': { lat: 37.5841, lng: -122.3661 },
  'FOSTER CITY': { lat: 37.5585, lng: -122.2711 },
  'SOUTH SAN FRANCISCO': { lat: 37.6547, lng: -122.4077 },
  'FREMONT': { lat: 37.5485, lng: -121.9886 },
  'MILPITAS': { lat: 37.4323, lng: -121.8996 },
  'CASTRO VALLEY': { lat: 37.6941, lng: -122.0864 },
  'UNION CITY': { lat: 37.5934, lng: -122.0438 },
  'NEWARK': { lat: 37.5297, lng: -122.0402 },
  'CUPERTINO': { lat: 37.3230, lng: -122.0322 },
  'SAN RAFAEL': { lat: 37.9735, lng: -122.5311 },
  'NOVATO': { lat: 38.1074, lng: -122.5697 },
  'PETALUMA': { lat: 38.2324, lng: -122.6367 },
  'NAPA': { lat: 38.2975, lng: -122.2869 },
  'FAIRFIELD': { lat: 38.2494, lng: -122.0400 },
  'RICHMOND': { lat: 37.9358, lng: -122.3477 },
  'ANTIOCH': { lat: 38.0049, lng: -121.8058 },
  'WALNUT CREEK': { lat: 37.9101, lng: -122.0652 },
  'LIVERMORE': { lat: 37.6819, lng: -121.7680 },
  'DUBLIN': { lat: 37.7022, lng: -121.9358 },
  'SAN RAMON': { lat: 37.7799, lng: -121.9780 },
  'ELDRIDGE': { lat: 38.3477, lng: -122.5094 },
  
  // Additional locations with hospitals
  'SOUTH EL MONTE': { lat: 34.0519, lng: -118.0473 },
  'EL MONTE': { lat: 34.0686, lng: -118.0276 },
  'BALDWIN PARK': { lat: 34.0853, lng: -117.9609 },
  'LA JOLLA': { lat: 32.8328, lng: -117.2713 },
  'WEST COVINA': { lat: 34.0686, lng: -117.9390 },
  'NORWALK': { lat: 33.9022, lng: -118.0817 },
  'DOWNEY': { lat: 33.9401, lng: -118.1332 },
  'INGLEWOOD': { lat: 33.9617, lng: -118.3531 },
  'COSTA MESA': { lat: 33.6412, lng: -117.9187 },
  'BURBANK': { lat: 34.1808, lng: -118.3090 },
  'COMPTON': { lat: 33.8958, lng: -118.2201 },
  'SOUTH GATE': { lat: 33.9548, lng: -118.2120 },
  'CARSON': { lat: 33.8317, lng: -118.2820 },
  'SANTA MONICA': { lat: 34.0195, lng: -118.4912 },
  'SANTA BARBARA': { lat: 34.4208, lng: -119.6982 },
  'VENTURA': { lat: 34.2805, lng: -119.2945 },
  'ATASCADERO': { lat: 35.4894, lng: -120.6707 },
  'COALINGA': { lat: 36.1397, lng: -120.3602 },
  'PATTON': { lat: 34.1322, lng: -117.2381 },
  'SAN JACINTO': { lat: 33.7839, lng: -116.9589 },
};

// Default coordinates for unmapped cities (use center of California)
const defaultCaliforniaCoords = { lat: 36.7783, lng: -119.4179 };

async function fixAllCaliforniaHospitals() {
  console.log('🏥 Comprehensive California hospital coordinate fix starting...\n');
  
  // Get all California hospitals
  const caHospitals = await db
    .select({
      id: hospitals.id,
      name: hospitals.name,
      city: hospitals.city,
      state: hospitals.state,
      latitude: hospitals.latitude,
      longitude: hospitals.longitude
    })
    .from(hospitals)
    .where(sql`${hospitals.state} = 'CA'`);
  
  console.log(`Found ${caHospitals.length} California hospitals to check.\n`);
  
  let fixedCount = 0;
  let skippedCount = 0;
  
  for (const hospital of caHospitals) {
    // Check if coordinates are valid for California
    const lat = parseFloat(hospital.latitude || '0');
    const lng = parseFloat(hospital.longitude || '0');
    
    const isValidCaliforniaCoordinate = 
      lat >= 32 && lat <= 42 && 
      lng >= -125 && lng <= -114;
    
    if (!isValidCaliforniaCoordinate) {
      // Need to fix this hospital's coordinates
      const cityUpper = hospital.city?.toUpperCase() || '';
      let newCoords = californiaCoordinates[cityUpper];
      
      // If exact match not found, try partial match
      if (!newCoords) {
        for (const [knownCity, coords] of Object.entries(californiaCoordinates)) {
          if (cityUpper.includes(knownCity) || knownCity.includes(cityUpper)) {
            newCoords = coords;
            break;
          }
        }
      }
      
      // If still no match, use default California coordinates
      if (!newCoords) {
        console.log(`⚠️  No coordinate mapping for ${hospital.city}, using default California center`);
        newCoords = defaultCaliforniaCoords;
      }
      
      // Update the hospital
      await db
        .update(hospitals)
        .set({
          latitude: newCoords.lat.toString(),
          longitude: newCoords.lng.toString()
        })
        .where(sql`${hospitals.id} = ${hospital.id}`);
      
      console.log(`✅ Fixed: ${hospital.name} in ${hospital.city} - New coords: ${newCoords.lat}, ${newCoords.lng}`);
      fixedCount++;
    } else {
      skippedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Fixed: ${fixedCount} hospitals`);
  console.log(`  - Already valid: ${skippedCount} hospitals`);
  console.log(`  - Total processed: ${caHospitals.length} hospitals`);
  
  // Verify results in different regions
  const regions = [
    { name: 'Bay Area', minLat: 37.0, maxLat: 38.5, minLng: -123.0, maxLng: -121.0 },
    { name: 'Los Angeles Area', minLat: 33.5, maxLat: 34.5, minLng: -119.0, maxLng: -117.0 },
    { name: 'San Diego Area', minLat: 32.5, maxLat: 33.2, minLng: -117.5, maxLng: -116.5 },
    { name: 'Redding Area', minLat: 40.0, maxLat: 41.0, minLng: -123.0, maxLng: -122.0 },
    { name: 'Sacramento Area', minLat: 38.0, maxLat: 39.0, minLng: -122.0, maxLng: -121.0 },
  ];
  
  console.log('\n📍 Regional hospital counts after fix:');
  for (const region of regions) {
    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(hospitals)
      .where(
        sql`${hospitals.state} = 'CA' 
            AND CAST(${hospitals.latitude} AS DECIMAL) >= ${region.minLat}
            AND CAST(${hospitals.latitude} AS DECIMAL) <= ${region.maxLat}
            AND CAST(${hospitals.longitude} AS DECIMAL) >= ${region.minLng}
            AND CAST(${hospitals.longitude} AS DECIMAL) <= ${region.maxLng}`
      );
    console.log(`  ${region.name}: ${count[0].count} hospitals`);
  }
  
  console.log('\n✨ California hospital coordinate fix complete!');
}

// Run the comprehensive fix
fixAllCaliforniaHospitals().catch(console.error);