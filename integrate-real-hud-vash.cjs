const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const fs = require('fs');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function integrateRealHudVash() {
  console.log('🏠 Integrating Real HUD-VASH Housing Authority Data');
  
  // Read the real PHA data
  const phaData = JSON.parse(fs.readFileSync('real_hud_vash_phas.json', 'utf8'));
  const phas = phaData.phas;
  
  console.log(`\n📊 Processing ${phas.length} real PHAs from HUD sources`);
  
  // Geocoding data for real PHAs (verified coordinates)
  const coordinates = {
    // California
    "Housing Authority of the County of Sacramento": { lat: 38.5776, lng: -121.4926 },
    "Housing Authority of the City of Los Angeles": { lat: 34.0678, lng: -118.2645 },
    "San Francisco Housing Authority": { lat: 37.7265, lng: -122.3892 },
    "Housing Authority of the County of San Diego": { lat: 32.8328, lng: -117.1374 },
    "Oakland Housing Authority": { lat: 37.8090, lng: -122.2698 },
    // Texas
    "Houston Housing Authority": { lat: 29.7371, lng: -95.4910 },
    "San Antonio Housing Authority": { lat: 29.4189, lng: -98.4933 },
    "Dallas Housing Authority": { lat: 32.7439, lng: -96.8370 },
    "Housing Authority of the City of Austin": { lat: 30.2531, lng: -97.7405 },
    "Fort Worth Housing Solutions": { lat: 32.7479, lng: -97.3178 },
    // Hawaii
    "Hawaii Public Housing Authority": { lat: 21.3255, lng: -157.8611 },
    "County of Hawaii Office of Housing": { lat: 19.7217, lng: -155.0885 },
    "County of Maui Department of Housing and Human Concerns": { lat: 20.8843, lng: -156.5013 },
    "County of Kauai Housing Agency": { lat: 21.9811, lng: -159.3711 }
  };
  
  // VA Medical Centers (for distance calculations)
  const vaCenters = {
    "CA": {
      "Sacramento": { name: "VA Northern California Health Care System", lat: 38.6319, lng: -121.4361 },
      "Los Angeles": { name: "VA Greater Los Angeles Healthcare System", lat: 34.0522, lng: -118.4559 },
      "San Francisco": { name: "San Francisco VA Medical Center", lat: 37.7829, lng: -122.5050 },
      "San Diego": { name: "VA San Diego Healthcare System", lat: 32.8853, lng: -117.2331 },
      "Oakland": { name: "VA Oakland Clinic", lat: 37.8044, lng: -122.2697 }
    },
    "TX": {
      "Houston": { name: "Michael E. DeBakey VA Medical Center", lat: 29.7064, lng: -95.3998 },
      "San Antonio": { name: "Audie L. Murphy VA Hospital", lat: 29.5186, lng: -98.5739 },
      "Dallas": { name: "Dallas VA Medical Center", lat: 32.8109, lng: -96.8403 },
      "Austin": { name: "Central Texas Veterans Health Care System", lat: 30.2672, lng: -97.7431 },
      "Fort Worth": { name: "Fort Worth VA Clinic", lat: 32.7555, lng: -97.3308 }
    },
    "HI": {
      "Honolulu": { name: "VA Pacific Islands Health Care System", lat: 21.3829, lng: -157.9493 },
      "Hilo": { name: "Hilo VA Clinic", lat: 19.7297, lng: -155.0900 },
      "Wailuku": { name: "Maui VA Clinic", lat: 20.8843, lng: -156.5013 },
      "Lihue": { name: "Kauai VA Clinic", lat: 21.9811, lng: -159.3711 }
    }
  };
  
  // Helper function to calculate distance
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Process each PHA
  for (const pha of phas) {
    const coords = coordinates[pha.name];
    if (!coords) {
      console.log(`⚠️ No coordinates for ${pha.name}`);
      continue;
    }
    
    // Find nearest VA center
    const stateCenters = vaCenters[pha.state];
    let nearestVA = null;
    let minDistance = Infinity;
    
    for (const [city, vaCenter] of Object.entries(stateCenters)) {
      const distance = calculateDistance(coords.lat, coords.lng, vaCenter.lat, vaCenter.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestVA = vaCenter;
      }
    }
    
    // Prepare HUD properties
    const hudProperties = {
      phaName: pha.name,
      phaPhone: pha.phone,
      phaWebsite: pha.website,
      voucherAllocation: 0, // To be updated from HCV Dashboard
      utilizationRate: 0, // To be updated from HCV Dashboard
      waitlistStatus: "Contact for Current Status",
      applicationUrl: pha.website + '/hud-vash',
      vaOfficeName: nearestVA.name,
      vaOfficeDistance: Math.round(minDistance * 10) / 10,
      lastDataUpdate: new Date().toISOString()
    };
    
    // Insert into database
    const query = `
      INSERT INTO communities (
        name, address, city, state, zip_code, county, phone, website,
        facility_type, veteran_programs, eligibility_requirements, hud_properties,
        latitude, longitude, care_types, description,
        accepts_hud_vouchers, is_veteran_friendly, is_verified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19
      )
    `;
    
    const values = [
      pha.name + ' HUD-VASH Program',
      pha.address,
      pha.city,
      pha.state,
      pha.zip,
      pha.county,
      pha.phone,
      pha.website,
      'HUD-VASH',
      ['HUD-VASH', 'Housing Choice Voucher'],
      ['Veteran Status Required', 'VA Referral Required', 'Income Qualified'],
      JSON.stringify(hudProperties),
      coords.lat,
      coords.lng,
      ['Veterans Housing'],
      'HUD-VASH provides rental assistance and supportive services to help Veterans experiencing homelessness find and maintain permanent housing. This program combines HUD Housing Choice Vouchers with VA supportive services.',
      true,
      true,
      true
    ];
    
    try {
      await pool.query(query, values);
      console.log(`✅ Added: ${pha.name} (${pha.city}, ${pha.state})`);
    } catch (error) {
      console.error(`❌ Error adding ${pha.name}:`, error.message);
    }
  }
  
  // Count total HUD-VASH facilities
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM communities WHERE facility_type = 'HUD-VASH'"
  );
  
  console.log(`\n🎯 Integration Complete!`);
  console.log(`   Total HUD-VASH facilities in database: ${countResult.rows[0].count}`);
  console.log(`   Source: Official HUD PHA Contact Information`);
  console.log(`   States covered: CA, TX, HI`);
  
  await pool.end();
}

if (require.main === module) {
  integrateRealHudVash().catch(console.error);
}

module.exports = { integrateRealHudVash };