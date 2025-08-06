import { db } from '../db';
import { hospitals } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function forceFixCaliforniaHospitals() {
  // Force update ALL CA hospitals to correct city coordinates
  const cityCoords = {
    'LOS ANGELES': { lat: 34.0522, lng: -118.2437 },
    'SAN FRANCISCO': { lat: 37.7749, lng: -122.4194 },
    'SACRAMENTO': { lat: 38.5816, lng: -121.4944 },
    'REDDING': { lat: 40.5865, lng: -122.3917 },
    'SAN DIEGO': { lat: 32.7157, lng: -117.1611 },
    'OAKLAND': { lat: 37.8044, lng: -122.2712 },
    'SAN JOSE': { lat: 37.3382, lng: -121.8863 },
    'FRESNO': { lat: 36.7378, lng: -119.7871 },
    'MODESTO': { lat: 37.6391, lng: -120.9969 },
    'STANFORD': { lat: 37.4363, lng: -122.1747 },
    'LA JOLLA': { lat: 32.8328, lng: -117.2713 },
    'ELDRIDGE': { lat: 38.3477, lng: -122.5094 },
    'SOUTH EL MONTE': { lat: 34.0519, lng: -118.0473 },
    'BALDWIN PARK': { lat: 34.0853, lng: -117.9609 },
    'ATASCADERO': { lat: 35.4894, lng: -120.6707 },
    'NAPA': { lat: 38.2975, lng: -122.2869 },
    'PATTON': { lat: 34.1322, lng: -117.2381 },
    'COALINGA': { lat: 36.1397, lng: -120.3602 },
    'SAN JACINTO': { lat: 33.7839, lng: -116.9589 },
  };

  console.log('🏥 Force updating all CA hospital coordinates by city...\n');

  for (const [city, coords] of Object.entries(cityCoords)) {
    const result = await db
      .update(hospitals)
      .set({
        latitude: coords.lat.toString(),
        longitude: coords.lng.toString()
      })
      .where(
        sql`${hospitals.state} = 'CA' AND UPPER(${hospitals.city}) = ${city}`
      );
    console.log(`Updated hospitals in ${city}, CA to: ${coords.lat}, ${coords.lng}`);
  }

  // Check the results for different regions
  console.log('\n📍 Checking hospital distribution by region...\n');
  
  // Redding area count
  const reddingCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(hospitals)
    .where(
      sql`${hospitals.state} = 'CA' 
          AND CAST(${hospitals.latitude} AS DECIMAL) >= 40.0
          AND CAST(${hospitals.latitude} AS DECIMAL) <= 41.0
          AND CAST(${hospitals.longitude} AS DECIMAL) >= -123.0
          AND CAST(${hospitals.longitude} AS DECIMAL) <= -122.0`
    );
  console.log(`Redding Area (40-41°N, 122-123°W): ${reddingCount[0].count} hospitals`);
  
  // Bay Area count
  const bayAreaCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(hospitals)
    .where(
      sql`${hospitals.state} = 'CA' 
          AND CAST(${hospitals.latitude} AS DECIMAL) >= 37.0
          AND CAST(${hospitals.latitude} AS DECIMAL) <= 38.5
          AND CAST(${hospitals.longitude} AS DECIMAL) >= -123.0
          AND CAST(${hospitals.longitude} AS DECIMAL) <= -121.0`
    );
  console.log(`Bay Area (37-38.5°N, 121-123°W): ${bayAreaCount[0].count} hospitals`);
  
  // Los Angeles area count
  const laCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(hospitals)
    .where(
      sql`${hospitals.state} = 'CA' 
          AND CAST(${hospitals.latitude} AS DECIMAL) >= 33.5
          AND CAST(${hospitals.latitude} AS DECIMAL) <= 34.5
          AND CAST(${hospitals.longitude} AS DECIMAL) >= -119.0
          AND CAST(${hospitals.longitude} AS DECIMAL) <= -117.0`
    );
  console.log(`Los Angeles Area (33.5-34.5°N, 117-119°W): ${laCount[0].count} hospitals`);
  
  // San Diego area count
  const sdCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(hospitals)
    .where(
      sql`${hospitals.state} = 'CA' 
          AND CAST(${hospitals.latitude} AS DECIMAL) >= 32.5
          AND CAST(${hospitals.latitude} AS DECIMAL) <= 33.2
          AND CAST(${hospitals.longitude} AS DECIMAL) >= -117.5
          AND CAST(${hospitals.longitude} AS DECIMAL) <= -116.5`
    );
  console.log(`San Diego Area (32.5-33.2°N, 116.5-117.5°W): ${sdCount[0].count} hospitals`);
  
  // Sacramento area count
  const sacCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(hospitals)
    .where(
      sql`${hospitals.state} = 'CA' 
          AND CAST(${hospitals.latitude} AS DECIMAL) >= 38.0
          AND CAST(${hospitals.latitude} AS DECIMAL) <= 39.0
          AND CAST(${hospitals.longitude} AS DECIMAL) >= -122.0
          AND CAST(${hospitals.longitude} AS DECIMAL) <= -121.0`
    );
  console.log(`Sacramento Area (38-39°N, 121-122°W): ${sacCount[0].count} hospitals`);
  
  // Get a sample of hospitals to verify
  console.log('\n🏥 Sample of California hospitals after update:');
  const sampleHospitals = await db
    .select({
      name: hospitals.name,
      city: hospitals.city,
      latitude: hospitals.latitude,
      longitude: hospitals.longitude
    })
    .from(hospitals)
    .where(sql`${hospitals.state} = 'CA'`)
    .limit(15);
  
  sampleHospitals.forEach(h => {
    console.log(`  ${h.name} (${h.city}): ${h.latitude}, ${h.longitude}`);
  });
  
  console.log('\n✨ Hospital coordinate fix complete!');
  console.log('Hospitals should now appear in map searches for California regions.');
}

// Run the fix
forceFixCaliforniaHospitals().catch(console.error);