const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createHudVashFacilities() {
  console.log('🏠 Creating HUD-VASH Veterans Housing Facilities');
  
  // Sample HUD-VASH facilities for California, Texas, and Hawaii
  const hudVashFacilities = [
    // California HUD-VASH
    {
      name: 'Sacramento Housing and Redevelopment Agency - HUD-VASH',
      address: '801 12th Street',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      county: 'Sacramento',
      phone: '(916) 444-9210',
      website: 'https://www.shra.org',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF'],
      eligibilityRequirements: ['Veteran Status', 'Income Qualified', 'VA Referral Required'],
      hudProperties: {
        phaName: 'Sacramento Housing and Redevelopment Agency',
        phaPhone: '(916) 444-9210',
        phaWebsite: 'https://www.shra.org/housing-choice-voucher/',
        voucherAllocation: 450,
        utilizationRate: 92,
        waitlistStatus: 'Open',
        vaOfficeName: 'VA Northern California Health Care System',
        vaOfficeDistance: 3.2
      },
      latitude: 38.5816,
      longitude: -121.4944
    },
    {
      name: 'Housing Authority of the City of Los Angeles - HUD-VASH',
      address: '2600 Wilshire Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90057',
      county: 'Los Angeles',
      phone: '(213) 252-1800',
      website: 'https://www.hacla.org',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF', 'GPD'],
      eligibilityRequirements: ['Veteran Status', 'Chronically Homeless', 'VA Referral Required'],
      hudProperties: {
        phaName: 'Housing Authority of the City of Los Angeles',
        phaPhone: '(213) 252-1800',
        phaWebsite: 'https://www.hacla.org/veterans',
        voucherAllocation: 1200,
        utilizationRate: 88,
        waitlistStatus: 'Waitlist',
        vaOfficeName: 'VA Greater Los Angeles Healthcare System',
        vaOfficeDistance: 5.1
      },
      latitude: 34.0522,
      longitude: -118.2437
    },
    {
      name: 'San Francisco Housing Authority - HUD-VASH',
      address: '1815 Egbert Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94124',
      county: 'San Francisco',
      phone: '(415) 715-3280',
      website: 'https://www.sfha.org',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF'],
      eligibilityRequirements: ['Veteran Status', 'Income Qualified', 'Case Management Required'],
      hudProperties: {
        phaName: 'San Francisco Housing Authority',
        phaPhone: '(415) 715-3280',
        phaWebsite: 'https://www.sfha.org/hud-vash',
        voucherAllocation: 800,
        utilizationRate: 95,
        waitlistStatus: 'Limited Availability',
        vaOfficeName: 'San Francisco VA Medical Center',
        vaOfficeDistance: 4.8
      },
      latitude: 37.7749,
      longitude: -122.4194
    },
    
    // Texas HUD-VASH
    {
      name: 'Houston Housing Authority - HUD-VASH Program',
      address: '2640 Fountain View Dr',
      city: 'Houston',
      state: 'TX',
      zipCode: '77057',
      county: 'Harris',
      phone: '(713) 260-0500',
      website: 'https://www.housingforhouston.com',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF', 'GPD'],
      eligibilityRequirements: ['Veteran Status', 'Homeless or At-Risk', 'VA Referral Required'],
      hudProperties: {
        phaName: 'Houston Housing Authority',
        phaPhone: '(713) 260-0500',
        phaWebsite: 'https://www.housingforhouston.com/veterans',
        voucherAllocation: 900,
        utilizationRate: 91,
        waitlistStatus: 'Open',
        vaOfficeName: 'Michael E. DeBakey VA Medical Center',
        vaOfficeDistance: 6.3
      },
      latitude: 29.7604,
      longitude: -95.3698
    },
    {
      name: 'San Antonio Housing Authority - HUD-VASH',
      address: '818 S Flores St',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78204',
      county: 'Bexar',
      phone: '(210) 477-6000',
      website: 'https://www.saha.org',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF'],
      eligibilityRequirements: ['Veteran Status', 'Income Qualified', 'Case Management Participation'],
      hudProperties: {
        phaName: 'San Antonio Housing Authority',
        phaPhone: '(210) 477-6000',
        phaWebsite: 'https://www.saha.org/veterans',
        voucherAllocation: 750,
        utilizationRate: 89,
        waitlistStatus: 'Open',
        vaOfficeName: 'Audie L. Murphy VA Hospital',
        vaOfficeDistance: 4.5
      },
      latitude: 29.4241,
      longitude: -98.4936
    },
    {
      name: 'Dallas Housing Authority - HUD-VASH',
      address: '3939 N Hampton Rd',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75212',
      county: 'Dallas',
      phone: '(214) 951-8300',
      website: 'https://www.dhadal.com',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF', 'GPD'],
      eligibilityRequirements: ['Veteran Status', 'Chronically Homeless', 'VA Healthcare Enrolled'],
      hudProperties: {
        phaName: 'Dallas Housing Authority',
        phaPhone: '(214) 951-8300',
        phaWebsite: 'https://www.dhadal.com/veterans',
        voucherAllocation: 650,
        utilizationRate: 87,
        waitlistStatus: 'Waitlist',
        vaOfficeName: 'Dallas VA Medical Center',
        vaOfficeDistance: 5.8
      },
      latitude: 32.7767,
      longitude: -96.7970
    },
    
    // Hawaii HUD-VASH
    {
      name: 'Hawaii Public Housing Authority - HUD-VASH Honolulu',
      address: '1002 N School St',
      city: 'Honolulu',
      state: 'HI',
      zipCode: '96817',
      county: 'Honolulu',
      phone: '(808) 832-5960',
      website: 'https://www.hpha.hawaii.gov',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH', 'SSVF'],
      eligibilityRequirements: ['Veteran Status', 'Island Resident', 'VA Case Management'],
      hudProperties: {
        phaName: 'Hawaii Public Housing Authority',
        phaPhone: '(808) 832-5960',
        phaWebsite: 'https://www.hpha.hawaii.gov/veterans',
        voucherAllocation: 350,
        utilizationRate: 94,
        waitlistStatus: 'Limited Availability',
        vaOfficeName: 'VA Pacific Islands Health Care System',
        vaOfficeDistance: 2.1
      },
      latitude: 21.3099,
      longitude: -157.8581
    },
    {
      name: 'County of Hawaii Office of Housing - HUD-VASH Hilo',
      address: '50 Wailuku Dr',
      city: 'Hilo',
      state: 'HI',
      zipCode: '96720',
      county: 'Hawaii',
      phone: '(808) 961-8379',
      website: 'https://www.hawaiicounty.gov/departments/office-of-housing',
      facilityType: 'HUD-VASH',
      veteranPrograms: ['HUD-VASH'],
      eligibilityRequirements: ['Veteran Status', 'Big Island Resident', 'Income Qualified'],
      hudProperties: {
        phaName: 'County of Hawaii Office of Housing',
        phaPhone: '(808) 961-8379',
        phaWebsite: 'https://www.hawaiicounty.gov/housing',
        voucherAllocation: 125,
        utilizationRate: 90,
        waitlistStatus: 'Open',
        vaOfficeName: 'Hilo VA Clinic',
        vaOfficeDistance: 1.5
      },
      latitude: 19.7297,
      longitude: -155.0900
    }
  ];
  
  // Insert HUD-VASH facilities
  for (const facility of hudVashFacilities) {
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
      facility.name,
      facility.address,
      facility.city,
      facility.state,
      facility.zipCode,
      facility.county,
      facility.phone,
      facility.website,
      facility.facilityType,
      facility.veteranPrograms,
      facility.eligibilityRequirements,
      JSON.stringify(facility.hudProperties),
      facility.latitude,
      facility.longitude,
      ['Veterans Housing'], // care_types
      'HUD-VASH provides rental assistance and supportive services to help Veterans and their families find and maintain permanent housing.',
      true, // accepts_hud_vouchers
      true, // is_veteran_friendly
      true  // is_verified
    ];
    
    try {
      await pool.query(query, values);
      console.log(`✅ Added: ${facility.name}`);
    } catch (error) {
      console.error(`❌ Error adding ${facility.name}:`, error.message);
    }
  }
  
  // Count total HUD-VASH facilities
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM communities WHERE facility_type = 'HUD-VASH'"
  );
  
  console.log(`\n🎯 Total HUD-VASH facilities added: ${countResult.rows[0].count}`);
  
  await pool.end();
}

if (require.main === module) {
  createHudVashFacilities().catch(console.error);
}

module.exports = { createHudVashFacilities };