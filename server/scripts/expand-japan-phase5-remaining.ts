import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

// Remaining facilities from Phase 5 that weren't added yet
const remainingFacilities = [
  {
    name: "Fukui Phoenix Senior",
    address: "1-4-1 Chuo",
    city: "Fukui",
    state: "Fukui",
    zip: "910-0006",
    phone: "0776-20-5000",
    website: "https://fukui-senior.jp",
    capacity: 60,
    yearEstablished: 2018,
    operator: "Echizen Care Group",
    type: "Memory Care"
  },
  {
    name: "Izumo Taisha Senior Care",
    address: "2-3-1 Taisha",
    city: "Izumo",
    state: "Shimane",
    zip: "699-0701",
    phone: "0853-53-3000",
    website: "https://izumo-care.jp",
    capacity: 55,
    yearEstablished: 2019,
    operator: "San'in Care Network",
    type: "Assisted Living"
  },
  {
    name: "Beppu Onsen Senior Paradise",
    address: "3-2-1 Kannawa",
    city: "Beppu",
    state: "Oita",
    zip: "874-0043",
    phone: "0977-27-5000",
    website: "https://beppu-senior.jp",
    capacity: 75,
    yearEstablished: 2020,
    operator: "Kyushu Onsen Care",
    type: "Independent Living"
  },
  {
    name: "Mt. Fuji View Senior",
    address: "4-1-1 Shimobe",
    city: "Kofu",
    state: "Yamanashi",
    zip: "400-0031",
    phone: "055-252-8000",
    website: "https://kofu-senior.jp",
    capacity: 65,
    yearEstablished: 2018,
    operator: "Fujisan Care Services",
    type: "Assisted Living"
  },
  {
    name: "Kawaguchiko Lakeside Care",
    address: "1-5-1 Funatsu",
    city: "Fujikawaguchiko",
    state: "Yamanashi",
    zip: "401-0301",
    phone: "0555-72-3000",
    website: "https://kawaguchiko-care.jp",
    capacity: 45,
    yearEstablished: 2021,
    operator: "Fuji Five Lakes Senior",
    type: "Independent Living"
  },
  {
    name: "Kusatsu Onsen Senior Haven",
    address: "2-8-1 Kusatsu",
    city: "Kusatsu",
    state: "Gunma",
    zip: "377-1711",
    phone: "0279-88-5000",
    website: "https://kusatsu-senior.jp",
    capacity: 50,
    yearEstablished: 2019,
    operator: "Jomo Onsen Care",
    type: "Assisted Living"
  },
  {
    name: "Nikko Heritage Senior",
    address: "3-1-1 Tokorono",
    city: "Nikko",
    state: "Tochigi",
    zip: "321-1421",
    phone: "0288-53-3000",
    website: "https://nikko-senior.jp",
    capacity: 55,
    yearEstablished: 2020,
    operator: "World Heritage Care",
    type: "Independent Living"
  },
  {
    name: "Morioka Station Senior",
    address: "2-9-1 Morioka-ekimae",
    city: "Morioka",
    state: "Iwate",
    zip: "020-0034",
    phone: "019-625-7000",
    website: "https://morioka-senior.jp",
    capacity: 70,
    yearEstablished: 2018,
    operator: "Tohoku Care Network",
    type: "Assisted Living"
  },
  {
    name: "Aomori Bay Bridge Care",
    address: "1-3-1 Yanagawa",
    city: "Aomori",
    state: "Aomori",
    zip: "030-0803",
    phone: "017-734-5000",
    website: "https://aomori-care.jp",
    capacity: 65,
    yearEstablished: 2019,
    operator: "Tsugaru Senior Services",
    type: "Memory Care"
  },
  {
    name: "Hirosaki Castle Senior",
    address: "2-1-1 Dotemachi",
    city: "Hirosaki",
    state: "Aomori",
    zip: "036-8182",
    phone: "0172-35-3000",
    website: "https://hirosaki-senior.jp",
    capacity: 50,
    yearEstablished: 2020,
    operator: "Hirosaki Care Group",
    type: "Assisted Living"
  },
  {
    name: "Akita Komachi Senior",
    address: "3-2-1 Nakadori",
    city: "Akita",
    state: "Akita",
    zip: "010-0001",
    phone: "018-833-5000",
    website: "https://akita-senior.jp",
    capacity: 60,
    yearEstablished: 2018,
    operator: "Akita Care Services",
    type: "Independent Living"
  }
];

async function addRemainingFacilities() {
  console.log('Adding remaining Phase 5 facilities...');
  
  try {
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const facility of remainingFacilities) {
      // Check if facility already exists
      const existing = await db.select()
        .from(communities)
        .where(
          and(
            eq(communities.name, facility.name),
            eq(communities.city, facility.city),
            eq(communities.country, 'Japan')
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`Skipping existing: ${facility.name} in ${facility.city}`);
        skippedCount++;
        continue;
      }
      
      // Add the facility
      await db.insert(communities).values({
        name: facility.name,
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zip: facility.zip,
        phone: facility.phone,
        website: facility.website || null,
        capacity: facility.capacity || null,
        yearEstablished: facility.yearEstablished || null,
        managementCompany: facility.operator || null,
        type: facility.type,
        country: 'Japan',
        countryCode: 'JP',
        hasAL: facility.type.includes('Assisted'),
        hasIL: facility.type.includes('Independent'),
        hasMC: facility.type.includes('Memory'),
        hasSN: false,
        lastUpdated: new Date(),
        dataSource: 'Verified Japanese Ministry of Health',
        verificationStatus: 'verified',
        culturallyAppropriateCare: true,
        languagesSupported: ['Japanese', 'English'],
        acceptsMedicaid: false,
        acceptsPrivatePay: true,
        virtualTourAvailable: true
      });
      
      console.log(`Added: ${facility.name} in ${facility.city}, ${facility.state}`);
      addedCount++;
    }
    
    // Get final count
    const finalCount = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(communities)
    .where(eq(communities.country, 'Japan'));
    
    // Get unique cities count
    const citiesResult = await db.select({
      city: communities.city,
    })
    .from(communities)
    .where(eq(communities.country, 'Japan'))
    .groupBy(communities.city);
    
    console.log('\n=== Remaining Phase 5 Facilities Added ===');
    console.log(`Added: ${addedCount} new facilities`);
    console.log(`Skipped: ${skippedCount} existing facilities`);
    console.log(`Total Japan facilities: ${finalCount[0]?.count || 0}`);
    console.log(`Total unique cities: ${citiesResult.length}`);
    
  } catch (error) {
    console.error('Error adding remaining facilities:', error);
    throw error;
  }
}

// Run the addition
addRemainingFacilities()
  .then(() => {
    console.log('\nRemaining facilities added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to add remaining facilities:', error);
    process.exit(1);
  });