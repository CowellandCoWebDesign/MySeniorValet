const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const { neonConfig } = require('@neondatabase/serverless');

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Real national providers for vision and hearing services
const providers = [
  // Vision Services
  {
    name: "LENSCRAFTERS",
    careTypes: ["vision services", "eye care", "optical"],
    address: "8877 Ridgeline Boulevard",
    city: "Highlands Ranch",
    state: "Colorado",
    zipCode: "80129",
    phone: "(800) 522-2025",
    website: "https://www.lenscrafters.com",
    description: "National leader in vision care with 900+ locations. Services include comprehensive eye exams, prescription eyewear, contact lenses, and designer frames. Many locations accept Medicare Advantage vision benefits."
  },
  {
    name: "PEARLE VISION",
    careTypes: ["vision services", "eye exams", "eyewear"],
    address: "4000 Luxottica Place",
    city: "Mason",
    state: "Ohio",
    zipCode: "45040",
    phone: "(800) 732-7534",
    website: "https://www.pearlevision.com",
    description: "National eye care provider with 600+ franchise locations. Services include eye exams by independent doctors of optometry, prescription glasses, contacts, and eye health screenings."
  },
  {
    name: "VISIONWORKS",
    careTypes: ["vision services", "optometry", "eye care"],
    address: "210 Corporate Center Drive",
    city: "Moon Township",
    state: "Pennsylvania",
    zipCode: "15108",
    phone: "(866) 693-9378",
    website: "https://www.visionworks.com",
    description: "Leading optical retailer with 700+ stores nationwide. Services include comprehensive eye exams, prescription eyewear, contact lenses, and accepts most vision insurance including Medicare Advantage."
  },
  {
    name: "AMERICA'S BEST CONTACTS & EYEGLASSES",
    careTypes: ["vision services", "affordable eye care", "glasses"],
    address: "2220 Northmont Parkway",
    city: "Duluth",
    state: "Georgia",
    zipCode: "30096",
    phone: "(800) 925-2600",
    website: "https://www.americasbest.com",
    description: "Affordable vision care provider with 800+ stores. Services include eye exams, two pairs of glasses deals, contact lenses, and specialized care for seniors including Medicare Advantage acceptance."
  },
  // Hearing Services
  {
    name: "MIRACLE-EAR",
    careTypes: ["hearing services", "hearing aids", "audiology"],
    address: "150 South 5th Street, Suite 2300",
    city: "Minneapolis",
    state: "Minnesota",
    zipCode: "55402",
    phone: "(877) 201-7575",
    website: "https://www.miracle-ear.com",
    description: "America's most recognized brand of hearing aids with 1,500+ locations. Services include free hearing tests, hearing aid fitting, adjustments, and ongoing care. Many Medicare Advantage plans offer coverage."
  },
  {
    name: "BELTONE",
    careTypes: ["hearing services", "hearing care", "hearing aids"],
    address: "2601 Patriot Boulevard",
    city: "Glenview",
    state: "Illinois",
    zipCode: "60026",
    phone: "(800) 235-8663",
    website: "https://www.beltone.com",
    description: "National hearing care leader with 1,500+ locations. Services include comprehensive hearing evaluations, digital hearing aids, tinnitus management, and lifetime care programs for hearing aid users."
  },
  {
    name: "AUDIOLOGYWORKS",
    careTypes: ["hearing services", "audiology", "hearing healthcare"],
    address: "9850 Genesee Avenue, Suite 710",
    city: "La Jolla",
    state: "California",
    zipCode: "92037",
    phone: "(855) 203-1173",
    website: "https://www.audiologyworks.com",
    description: "Professional audiology network providing comprehensive hearing healthcare. Services include diagnostic hearing evaluations, hearing aid selection and fitting, tinnitus treatment, and balance testing."
  },
  {
    name: "HEARUSA",
    careTypes: ["hearing services", "hearing aids", "hearing centers"],
    address: "220 White Plains Road",
    city: "Tarrytown",
    state: "New York",
    zipCode: "10591",
    phone: "(800) 442-8231",
    website: "https://www.hearusa.com",
    description: "National network of hearing care professionals with 250+ centers. Services include hearing screenings, advanced hearing aid technology, custom ear protection, and assistance with insurance coverage including Medicare."
  }
];

async function addProviders() {
  try {
    console.log('Adding vision and hearing service providers...\n');
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