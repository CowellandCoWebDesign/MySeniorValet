const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Real national providers for companion care, medical equipment, and skilled nursing
const providers = [
  // Companion Care Providers
  {
    name: "COMFORT KEEPERS",
    careTypes: ["companion care", "non-medical home care"],
    address: "16444 N. 91st Street, Suite 100",
    city: "Scottsdale",
    state: "Arizona",
    zipCode: "85260",
    phone: "(800) 387-2415",
    website: "https://www.comfortkeepers.com",
    description: "Leading provider of companion care and non-medical home care services nationwide. Services include companionship, light housekeeping, meal preparation, medication reminders, and transportation."
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
    description: "National leader in companion care and senior home care services including dementia care, personal care, and respite care."
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
    description: "Global leader in companion care and senior home care services, specializing in companionship, Alzheimer's care, meal preparation, and transportation."
  },
  // Medical Equipment Providers
  {
    name: "APRIA HEALTHCARE",
    careTypes: ["medical equipment", "durable medical equipment", "DME"],
    address: "7353 Company Drive",
    city: "Indianapolis",
    state: "Indiana",
    zipCode: "46237",
    phone: "(877) 303-5545",
    website: "https://www.apria.com",
    description: "Leading provider of home medical equipment and clinical services including oxygen therapy, CPAP/BiPAP, wheelchairs, hospital beds, and diabetic supplies."
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
    description: "National provider of respiratory care and durable medical equipment including oxygen equipment, ventilators, nebulizers, sleep therapy, and mobility aids."
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
    description: "Leading provider of complex rehab technology and mobility solutions including custom wheelchairs, power mobility, seating systems, and vehicle modifications."
  },
  // Skilled Nursing Providers
  {
    name: "GENESIS HEALTHCARE",
    careTypes: ["skilled nursing", "nursing home", "rehabilitation"],
    address: "101 East State Street",
    city: "Kennett Square",
    state: "Pennsylvania",
    zipCode: "19348",
    phone: "(610) 925-2000",
    website: "https://www.genesishcc.com",
    description: "One of the nation's largest skilled nursing and rehabilitation therapy providers with over 50,000 beds. Services include 24/7 skilled nursing, physical therapy, occupational therapy, speech therapy, and memory care."
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
    description: "Leading provider of skilled nursing and rehabilitation services with over 200 locations. Services include skilled nursing care, rehabilitation therapy, memory care, respite care, and long-term care."
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
    description: "National provider of post-acute care services including skilled nursing, transitional care, rehabilitation services, behavioral health, and home health."
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
    description: "Leading provider of skilled nursing and post-acute care services including 24-hour skilled nursing, physical therapy, occupational therapy, memory care, and hospice care."
  },
  {
    name: "BROOKDALE SENIOR LIVING SKILLED NURSING",
    careTypes: ["skilled nursing", "senior living", "memory care"],
    address: "111 Westwood Place, Suite 400",
    city: "Brentwood",
    state: "Tennessee",
    zipCode: "37027",
    phone: "(615) 221-2250",
    website: "https://www.brookdale.com",
    description: "Nation's largest senior living provider offering skilled nursing services across 700+ communities. Services include skilled nursing, memory care, assisted living, rehabilitation, and hospice support."
  }
];

async function addProviders() {
  try {
    console.log('Adding missing care service providers...\n');
    let addedCount = 0;
    let skippedCount = 0;

    for (const provider of providers) {
      try {
        // Check if provider already exists
        const checkResult = await pool.query(
          `SELECT id FROM communities WHERE name = $1 AND city = $2 AND state = $3`,
          [provider.name, provider.city, provider.state]
        );
        
        if (checkResult.rows.length > 0) {
          skippedCount++;
          console.log(`⏭️  Skipped (already exists): ${provider.name}`);
          continue;
        }
        
        // Insert new provider
        const result = await pool.query(
          `INSERT INTO communities (name, care_types, address, city, state, zip_code, phone, website, description, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           RETURNING id`,
          [
            provider.name,
            provider.careTypes,
            provider.address,
            provider.city,
            provider.state,
            provider.zipCode,
            provider.phone,
            provider.website,
            provider.description
          ]
        );
        
        if (result.rows.length > 0) {
          addedCount++;
          const category = provider.careTypes[0];
          console.log(`✅ Added ${category} provider: ${provider.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${provider.name}:`, error.message);
      }
    }

    console.log(`\n✨ Process completed!`);
    console.log(`   Added: ${addedCount} providers`);
    console.log(`   Skipped: ${skippedCount} providers (already exist)`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await pool.end();
  }
}

addProviders();