import { db } from '../db';
import { hospitals } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function verifyHospitalData() {
  console.log('📍 VERIFYING HOSPITAL DATA QUALITY\n');
  console.log('='.repeat(60));
  
  // Get sample hospitals from different states
  const sampleHospitals = await db.select({
    name: hospitals.name,
    address: hospitals.address,
    city: hospitals.city,
    state: hospitals.state,
    zipCode: hospitals.zipCode,
    county: hospitals.county,
    latitude: hospitals.latitude,
    longitude: hospitals.longitude,
    emergencyServices: hospitals.emergencyServices,
    hospitalType: hospitals.hospitalType,
  })
  .from(hospitals)
  .where(sql`state IN ('CA', 'TX', 'FL', 'NY', 'IL')`)
  .limit(10);

  console.log('\n📍 Sample Hospitals with Complete Data:\n');
  for (const hospital of sampleHospitals) {
    console.log(`${hospital.name}`);
    console.log(`  📍 ${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zipCode}`);
    console.log(`  📌 County: ${hospital.county}`);
    console.log(`  🗺️ Coordinates: ${hospital.latitude}, ${hospital.longitude}`);
    console.log(`  🚨 Emergency: ${hospital.emergencyServices ? 'Yes' : 'No'}`);
    console.log(`  🏥 Type: ${hospital.hospitalType || 'General Hospital'}`);
    console.log('');
  }

  // Get statistics by state
  const stateStats = await db.select({
    state: hospitals.state,
    count: sql<number>`count(*)`,
    withEmergency: sql<number>`count(case when emergency_services = true then 1 end)`,
  })
  .from(hospitals)
  .groupBy(hospitals.state)
  .orderBy(sql`count(*) DESC`)
  .limit(10);

  console.log('📊 Top 10 States by Hospital Count:');
  for (const stat of stateStats) {
    console.log(`  ${stat.state}: ${stat.count} hospitals (${stat.withEmergency} with emergency services)`);
  }
  
  // Check overall data completeness
  const completenessCheck = await db.select({
    totalHospitals: sql<number>`count(*)`,
    withAddress: sql<number>`count(case when address is not null and address != '' then 1 end)`,
    withZipCode: sql<number>`count(case when zip_code is not null and zip_code != '' then 1 end)`,
    withCounty: sql<number>`count(case when county is not null and county != '' then 1 end)`,
    withCoordinates: sql<number>`count(case when latitude is not null and longitude is not null then 1 end)`,
    withEmergencyServices: sql<number>`count(case when emergency_services = true then 1 end)`,
  }).from(hospitals);
  
  const stats = completenessCheck[0];
  
  console.log('\n📊 Overall Data Completeness:');
  console.log(`  Total hospitals: ${stats.totalHospitals}`);
  console.log(`  With addresses: ${stats.withAddress} (${Math.round(stats.withAddress / stats.totalHospitals * 100)}%)`);
  console.log(`  With zip codes: ${stats.withZipCode} (${Math.round(stats.withZipCode / stats.totalHospitals * 100)}%)`);
  console.log(`  With counties: ${stats.withCounty} (${Math.round(stats.withCounty / stats.totalHospitals * 100)}%)`);
  console.log(`  With coordinates: ${stats.withCoordinates} (${Math.round(stats.withCoordinates / stats.totalHospitals * 100)}%)`);
  console.log(`  With emergency services: ${stats.withEmergencyServices}`);
  
  console.log('\n✅ Hospital data verification complete!');
}

// Run the verification
verifyHospitalData().catch(console.error);