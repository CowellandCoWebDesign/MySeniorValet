import { db } from '../db';
import { hospitals } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Correct coordinates for major California hospitals
const hospitalCoordinateFixes = [
  // Los Angeles area hospitals
  { name: 'Cedars-Sinai Medical Center', city: 'Los Angeles', lat: 34.0764, lng: -118.3804 },
  { name: 'VA Medical Center - Los Angeles', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'UCLA Medical Center', city: 'Los Angeles', lat: 34.0658, lng: -118.4464 },
  
  // San Francisco Bay Area
  { name: 'UCSF Medical Center', city: 'San Francisco', lat: 37.7633, lng: -122.4579 },
  { name: 'Stanford Hospital', city: 'Stanford', lat: 37.4363, lng: -122.1747 },
  { name: 'REGENTS OF THE UNIVERSITY OF CALIFORNIA', city: 'SACRAMENTO', lat: 38.5816, lng: -121.4944 }, // UC Davis Medical Center
  { name: 'SUTTER VALLEY HOSPITALS', city: 'SACRAMENTO', lat: 38.5816, lng: -121.4944 },
  
  // San Diego area
  { name: 'UCSD Medical Center', city: 'San Diego', lat: 32.8801, lng: -117.2340 },
  { name: 'Scripps Memorial Hospital', city: 'La Jolla', lat: 32.8842, lng: -117.2257 },
  
  // Northern California (Redding area)
  { name: 'Mercy Medical Center', city: 'Redding', lat: 40.5865, lng: -122.3917 },
  { name: 'Shasta Regional Medical Center', city: 'Redding', lat: 40.5865, lng: -122.3917 },
  
  // Central Valley
  { name: 'CAARE DIAGNOSTIC & TREATMENT CENTER', city: 'SACRAMENTO', lat: 38.5816, lng: -121.4944 },
  { name: 'STATE OF CALIFORNIA - DEPARTMENT OF DEVELOPMENTAL SERVICES', city: 'ELDRIDGE', lat: 38.3477, lng: -122.5094 },
];

async function fixHospitalCoordinates() {
  console.log('🏥 Fixing California hospital coordinates...\n');
  
  for (const fix of hospitalCoordinateFixes) {
    try {
      // Update hospitals with matching name and city
      const result = await db
        .update(hospitals)
        .set({
          latitude: fix.lat.toString(),
          longitude: fix.lng.toString()
        })
        .where(
          sql`LOWER(${hospitals.name}) LIKE LOWER(${`%${fix.name}%`}) 
              AND LOWER(${hospitals.city}) LIKE LOWER(${`%${fix.city}%`})`
        );
      
      console.log(`✅ Updated coordinates for ${fix.name} in ${fix.city}: ${fix.lat}, ${fix.lng}`);
    } catch (error) {
      console.error(`❌ Failed to update ${fix.name}:`, error);
    }
  }
  
  // Also add some generic California hospital coordinates based on city
  const cityCoordinates = [
    { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { city: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { city: 'Sacramento', lat: 38.5816, lng: -121.4944 },
    { city: 'Fresno', lat: 36.7378, lng: -119.7871 },
    { city: 'Oakland', lat: 37.8044, lng: -122.2712 },
    { city: 'San Jose', lat: 37.3382, lng: -121.8863 },
    { city: 'Redding', lat: 40.5865, lng: -122.3917 },
    { city: 'Bakersfield', lat: 35.3733, lng: -119.0187 },
    { city: 'Riverside', lat: 33.9806, lng: -117.3755 },
  ];
  
  console.log('\n🏥 Fixing coordinates by city for remaining California hospitals...\n');
  
  for (const cityFix of cityCoordinates) {
    try {
      // Update all California hospitals in this city that have invalid coordinates
      const result = await db
        .update(hospitals)
        .set({
          latitude: cityFix.lat.toString(),
          longitude: cityFix.lng.toString()
        })
        .where(
          sql`${hospitals.state} = 'CA' 
              AND LOWER(${hospitals.city}) = LOWER(${cityFix.city})
              AND (
                ${hospitals.latitude} IS NULL 
                OR ${hospitals.longitude} IS NULL
                OR CAST(${hospitals.latitude} AS DECIMAL) < 32
                OR CAST(${hospitals.latitude} AS DECIMAL) > 42
                OR CAST(${hospitals.longitude} AS DECIMAL) < -125
                OR CAST(${hospitals.longitude} AS DECIMAL) > -114
              )`
        );
      
      console.log(`✅ Fixed coordinates for hospitals in ${cityFix.city}, CA`);
    } catch (error) {
      console.error(`❌ Failed to update hospitals in ${cityFix.city}:`, error);
    }
  }
  
  // Verify the fixes
  console.log('\n📊 Verifying California hospital coordinates...\n');
  
  const caHospitals = await db
    .select({
      name: hospitals.name,
      city: hospitals.city,
      state: hospitals.state,
      latitude: hospitals.latitude,
      longitude: hospitals.longitude
    })
    .from(hospitals)
    .where(sql`${hospitals.state} = 'CA'`)
    .limit(10);
  
  console.log('Sample of updated California hospitals:');
  caHospitals.forEach(h => {
    console.log(`  ${h.name} - ${h.city}, ${h.state}: ${h.latitude}, ${h.longitude}`);
  });
  
  // Count hospitals in specific areas
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
  
  const reddingAreaCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(hospitals)
    .where(
      sql`${hospitals.state} = 'CA' 
          AND CAST(${hospitals.latitude} AS DECIMAL) >= 40.0
          AND CAST(${hospitals.latitude} AS DECIMAL) <= 41.0
          AND CAST(${hospitals.longitude} AS DECIMAL) >= -123.0
          AND CAST(${hospitals.longitude} AS DECIMAL) <= -122.0`
    );
  
  console.log(`\n📍 Hospitals now in Bay Area bounds: ${bayAreaCount[0].count}`);
  console.log(`📍 Hospitals now in Redding area bounds: ${reddingAreaCount[0].count}`);
  
  console.log('\n✨ Hospital coordinate fixes complete!');
}

// Run the fix
fixHospitalCoordinates().catch(console.error);