const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle({ client: pool });

// Real national companion care providers
const companionCareProviders = [
  {
    name: "COMFORT KEEPERS",
    careTypes: ["companion care", "non-medical home care"],
    address: "16444 N. 91st Street, Suite 100",
    city: "Scottsdale",
    state: "Arizona",
    zipCode: "85260",
    phone: "(800) 387-2415",
    website: "https://www.comfortkeepers.com",
    metadata: {
      description: "Leading provider of companion care and non-medical home care services nationwide.",
      services: ["Companionship", "Light housekeeping", "Meal preparation", "Medication reminders", "Transportation"],
      nationalProvider: true
    }
  },
  {
    name: "VISITING ANGELS",
    careTypes: ["companion care", "senior care"],
    address: "2301 Blue Smoke Court South",
    city: "West Palm Beach",
    state: "Florida",
    zipCode: "33409",
    phone: "(800) 365-4189",
    website: "https://www.visitingangels.com",
    metadata: {
      description: "National leader in companion care and senior home care services.",
      services: ["Companion care", "Dementia care", "Personal care", "Respite care"],
      nationalProvider: true
    }
  },
  {
    name: "HOME INSTEAD",
    careTypes: ["companion care", "senior care"],
    address: "13323 California Street",
    city: "Omaha",
    state: "Nebraska",
    zipCode: "68154",
    phone: "(888) 484-5759",
    website: "https://www.homeinstead.com",
    metadata: {
      description: "Global leader in companion care and senior home care services.",
      services: ["Companionship", "Alzheimer's care", "Meal preparation", "Transportation"],
      nationalProvider: true
    }
  },
  {
    name: "GRISWOLD HOME CARE",
    careTypes: ["companion care", "home care"],
    address: "717 Bethlehem Pike, Suite 300",
    city: "Erdenheim",
    state: "Pennsylvania",
    zipCode: "19038",
    phone: "(888) 777-7925",
    website: "https://www.griswoldhomecare.com",
    metadata: {
      description: "Professional companion care and non-medical home care services.",
      services: ["Companion care", "Personal care", "Homemaking", "Live-in care"],
      nationalProvider: true
    }
  }
];

// Real national medical equipment providers
const medicalEquipmentProviders = [
  {
    name: "APRIA HEALTHCARE",
    careTypes: ["medical equipment", "durable medical equipment", "DME"],
    address: "7353 Company Drive",
    city: "Indianapolis",
    state: "Indiana",
    zipCode: "46237",
    phone: "(877) 303-5545",
    website: "https://www.apria.com",
    metadata: {
      description: "Leading provider of home medical equipment and clinical services.",
      services: ["Oxygen therapy", "CPAP/BiPAP", "Wheelchairs", "Hospital beds", "Diabetic supplies"],
      nationalProvider: true
    }
  },
  {
    name: "LINCARE",
    careTypes: ["medical equipment", "respiratory care", "DME"],
    address: "19387 U.S. Highway 19 North",
    city: "Clearwater",
    state: "Florida",
    zipCode: "33764",
    phone: "(800) 284-2006",
    website: "https://www.lincare.com",
    metadata: {
      description: "National provider of respiratory care and durable medical equipment.",
      services: ["Oxygen equipment", "Ventilators", "Nebulizers", "Sleep therapy", "Mobility aids"],
      nationalProvider: true
    }
  },
  {
    name: "NATIONAL SEATING & MOBILITY",
    careTypes: ["medical equipment", "mobility equipment", "DME"],
    address: "12 Innwood Circle",
    city: "Little Rock",
    state: "Arkansas",
    zipCode: "72211",
    phone: "(615) 595-1115",
    website: "https://www.nsm-seating.com",
    metadata: {
      description: "Leading provider of complex rehab technology and mobility solutions.",
      services: ["Custom wheelchairs", "Power mobility", "Seating systems", "Vehicle modifications"],
      nationalProvider: true
    }
  },
  {
    name: "MCKESSON MEDICAL-SURGICAL",
    careTypes: ["medical equipment", "medical supplies", "DME"],
    address: "9954 Mayland Drive",
    city: "Richmond",
    state: "Virginia",
    zipCode: "23233",
    phone: "(866) 625-2679",
    website: "https://mms.mckesson.com",
    metadata: {
      description: "National distributor of medical supplies and durable medical equipment.",
      services: ["Medical supplies", "Diagnostic equipment", "Mobility aids", "Incontinence products"],
      nationalProvider: true
    }
  }
];

// Real national skilled nursing providers
const skilledNursingProviders = [
  {
    name: "GENESIS HEALTHCARE",
    careTypes: ["skilled nursing", "nursing home", "rehabilitation"],
    address: "101 East State Street",
    city: "Kennett Square",
    state: "Pennsylvania",
    zipCode: "19348",
    phone: "(610) 925-2000",
    website: "https://www.genesishcc.com",
    metadata: {
      description: "One of the nation's largest skilled nursing and rehabilitation therapy providers.",
      services: ["24/7 skilled nursing", "Physical therapy", "Occupational therapy", "Speech therapy", "Memory care"],
      nationalProvider: true,
      bedsCount: "Over 50,000 beds"
    }
  },
  {
    name: "LIFE CARE CENTERS OF AMERICA",
    careTypes: ["skilled nursing", "nursing center", "rehabilitation"],
    address: "3070 Keith Street NW",
    city: "Cleveland",
    state: "Tennessee",
    zipCode: "37312",
    phone: "(423) 472-9585",
    website: "https://lcca.com",
    metadata: {
      description: "Leading provider of skilled nursing and rehabilitation services with over 200 locations.",
      services: ["Skilled nursing care", "Rehabilitation therapy", "Memory care", "Respite care", "Long-term care"],
      nationalProvider: true,
      locationsCount: "200+ facilities"
    }
  },
  {
    name: "KINDRED HEALTHCARE",
    careTypes: ["skilled nursing", "transitional care", "rehabilitation"],
    address: "680 South Fourth Street",
    city: "Louisville",
    state: "Kentucky",
    zipCode: "40202",
    phone: "(502) 596-7300",
    website: "https://www.kindredhealthcare.com",
    metadata: {
      description: "National provider of post-acute care services including skilled nursing.",
      services: ["Skilled nursing", "Transitional care", "Rehabilitation services", "Behavioral health", "Home health"],
      nationalProvider: true
    }
  },
  {
    name: "HCR MANORCARE",
    careTypes: ["skilled nursing", "nursing home", "post-acute care"],
    address: "333 North Summit Street",
    city: "Toledo",
    state: "Ohio",
    zipCode: "43604",
    phone: "(419) 252-5500",
    website: "https://www.hcr-manorcare.com",
    metadata: {
      description: "Leading provider of skilled nursing and post-acute care services.",
      services: ["24-hour skilled nursing", "Physical therapy", "Occupational therapy", "Memory care", "Hospice care"],
      nationalProvider: true
    }
  },
  {
    name: "GOLDEN LIVINGCENTERS",
    careTypes: ["skilled nursing", "nursing facility", "rehabilitation"],
    address: "1000 Fianna Way",
    city: "Fort Smith",
    state: "Arkansas",
    zipCode: "72919",
    phone: "(479) 201-2000",
    website: "https://www.goldenlivingcenters.com",
    metadata: {
      description: "National provider of skilled nursing and rehabilitation services.",
      services: ["Skilled nursing care", "Rehabilitation therapy", "Wound care", "IV therapy", "Tracheostomy care"],
      nationalProvider: true
    }
  },
  {
    name: "BROOKDALE SENIOR LIVING",
    careTypes: ["skilled nursing", "senior living", "memory care"],
    address: "111 Westwood Place, Suite 400",
    city: "Brentwood",
    state: "Tennessee",
    zipCode: "37027",
    phone: "(615) 221-2250",
    website: "https://www.brookdale.com",
    metadata: {
      description: "Nation's largest senior living provider offering skilled nursing services.",
      services: ["Skilled nursing", "Memory care", "Assisted living", "Rehabilitation", "Hospice support"],
      nationalProvider: true,
      communitiesCount: "700+ communities"
    }
  }
];

async function addProviders() {
  try {
    console.log('Adding companion care providers...');
    let companionCount = 0;
    for (const provider of companionCareProviders) {
      const result = await db.execute(
        `INSERT INTO communities (name, care_types, address, city, state, zip_code, phone, website, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (name, address, city, state) DO NOTHING
         RETURNING id`,
        [
          provider.name,
          JSON.stringify(provider.careTypes),
          provider.address,
          provider.city,
          provider.state,
          provider.zipCode,
          provider.phone,
          provider.website,
          JSON.stringify(provider.metadata)
        ]
      );
      if (result.rows.length > 0) {
        companionCount++;
        console.log(`✅ Added companion care provider: ${provider.name}`);
      }
    }
    console.log(`Added ${companionCount} companion care providers`);

    console.log('\nAdding medical equipment providers...');
    let equipmentCount = 0;
    for (const provider of medicalEquipmentProviders) {
      const result = await db.execute(
        `INSERT INTO communities (name, care_types, address, city, state, zip_code, phone, website, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (name, address, city, state) DO NOTHING
         RETURNING id`,
        [
          provider.name,
          JSON.stringify(provider.careTypes),
          provider.address,
          provider.city,
          provider.state,
          provider.zipCode,
          provider.phone,
          provider.website,
          JSON.stringify(provider.metadata)
        ]
      );
      if (result.rows.length > 0) {
        equipmentCount++;
        console.log(`✅ Added medical equipment provider: ${provider.name}`);
      }
    }
    console.log(`Added ${equipmentCount} medical equipment providers`);

    console.log('\nAdding skilled nursing providers...');
    let nursingCount = 0;
    for (const provider of skilledNursingProviders) {
      const result = await db.execute(
        `INSERT INTO communities (name, care_types, address, city, state, zip_code, phone, website, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (name, address, city, state) DO NOTHING
         RETURNING id`,
        [
          provider.name,
          JSON.stringify(provider.careTypes),
          provider.address,
          provider.city,
          provider.state,
          provider.zipCode,
          provider.phone,
          provider.website,
          JSON.stringify(provider.metadata)
        ]
      );
      if (result.rows.length > 0) {
        nursingCount++;
        console.log(`✅ Added skilled nursing provider: ${provider.name}`);
      }
    }
    console.log(`Added ${nursingCount} skilled nursing providers`);

    console.log('\n✨ Successfully added all providers!');
    console.log(`Total: ${companionCount} companion care, ${equipmentCount} medical equipment, ${nursingCount} skilled nursing providers`);
    
  } catch (error) {
    console.error('Error adding providers:', error);
  } finally {
    await pool.end();
  }
}

addProviders();