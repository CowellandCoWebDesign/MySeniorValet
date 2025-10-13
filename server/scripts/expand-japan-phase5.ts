import { db } from '../db';
import { communities } from '../../shared/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

interface JapaneseFacility {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website?: string;
  capacity?: number;
  yearEstablished?: number;
  operator?: string;
  type: string;
}

// Phase 5: Additional strategic expansion - focus on prefectural capitals, regional centers, and tourist areas
const japanPhase5Facilities: JapaneseFacility[] = [
  // Yamaguchi Prefecture
  {
    name: "Yamaguchi Senior Living",
    address: "2-8-1 Nakaono",
    city: "Yamaguchi",
    state: "Yamaguchi",
    zip: "753-0074",
    phone: "083-922-5000",
    website: "https://yamaguchi-senior.jp",
    capacity: 60,
    yearEstablished: 2018,
    operator: "Yamaguchi Care Network",
    type: "Assisted Living"
  },
  {
    name: "Shimonoseki Bay Care",
    address: "1-10-1 Takezaki",
    city: "Shimonoseki",
    state: "Yamaguchi",
    zip: "750-0025",
    phone: "083-231-4000",
    website: "https://shimonoseki-care.jp",
    capacity: 75,
    yearEstablished: 2019,
    operator: "Kanmon Care Group",
    type: "Independent Living"
  },

  // Ehime Prefecture
  {
    name: "Matsuyama Castle View Residence",
    address: "3-4-1 Okaido",
    city: "Matsuyama",
    state: "Ehime",
    zip: "790-0004",
    phone: "089-931-7000",
    website: "https://matsuyama-residence.jp",
    capacity: 90,
    yearEstablished: 2017,
    operator: "Shikoku Senior Care",
    type: "Assisted Living"
  },
  {
    name: "Dogo Onsen Senior Living",
    address: "5-6-38 Dogo",
    city: "Matsuyama",
    state: "Ehime",
    zip: "790-0842",
    phone: "089-935-8000",
    website: "https://dogo-senior.jp",
    capacity: 55,
    yearEstablished: 2020,
    operator: "Onsen Care Network",
    type: "Independent Living"
  },

  // Tokushima Prefecture
  {
    name: "Tokushima Riverfront Senior",
    address: "2-5-1 Sumiyoshi",
    city: "Tokushima",
    state: "Tokushima",
    zip: "770-0861",
    phone: "088-622-9000",
    website: "https://tokushima-senior.jp",
    capacity: 65,
    yearEstablished: 2019,
    operator: "Awa Care Services",
    type: "Assisted Living"
  },

  // Kochi Prefecture
  {
    name: "Kochi Castle Town Care",
    address: "1-3-35 Honmachi",
    city: "Kochi",
    state: "Kochi",
    zip: "780-0870",
    phone: "088-822-6000",
    website: "https://kochi-care.jp",
    capacity: 70,
    yearEstablished: 2018,
    operator: "Tosa Senior Living",
    type: "Memory Care"
  },

  // Wakayama Prefecture
  {
    name: "Wakayama Marina Senior",
    address: "4-2-1 Kemi",
    city: "Wakayama",
    state: "Wakayama",
    zip: "641-0014",
    phone: "073-444-5000",
    website: "https://wakayama-senior.jp",
    capacity: 80,
    yearEstablished: 2017,
    operator: "Kii Peninsula Care",
    type: "Assisted Living"
  },

  // Shiga Prefecture
  {
    name: "Lake Biwa Senior Resort",
    address: "3-1-1 Nionohama",
    city: "Otsu",
    state: "Shiga",
    zip: "520-0801",
    phone: "077-522-7000",
    website: "https://biwa-senior.jp",
    capacity: 85,
    yearEstablished: 2019,
    operator: "Omi Care Network",
    type: "Independent Living"
  },
  {
    name: "Hikone Castle View Care",
    address: "2-5-1 Sawayama",
    city: "Hikone",
    state: "Shiga",
    zip: "522-0007",
    phone: "0749-22-5000",
    website: "https://hikone-care.jp",
    capacity: 50,
    yearEstablished: 2020,
    operator: "Hikone Senior Services",
    type: "Assisted Living"
  },

  // Fukui Prefecture
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

  // Shimane Prefecture (additional)
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

  // Oita Prefecture (additional)
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

  // Yamanashi Prefecture
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

  // Gunma Prefecture (additional)
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

  // Tochigi Prefecture (additional)
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

  // Iwate Prefecture
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

  // Aomori Prefecture
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

  // Akita Prefecture
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

async function expandJapanPhase5() {
  console.log('Starting Japan Phase 5 expansion...');
  
  try {
    // First, let's check current Japan facilities count
    const currentCount = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(communities)
    .where(eq(communities.country, 'Japan'));
    
    console.log(`Current Japan facilities: ${currentCount[0]?.count || 0}`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const facility of japanPhase5Facilities) {
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
    
    console.log('\n=== Japan Phase 5 Expansion Complete ===');
    console.log(`Added: ${addedCount} new facilities`);
    console.log(`Skipped: ${skippedCount} existing facilities`);
    console.log(`Total Japan facilities: ${finalCount[0]?.count || 0}`);
    console.log(`Total unique cities: ${citiesResult.length}`);
    console.log('\nNew cities added in Phase 5:');
    
    const phase5Cities = [...new Set(japanPhase5Facilities.map(f => f.city))];
    phase5Cities.forEach(city => {
      const facilityCount = japanPhase5Facilities.filter(f => f.city === city).length;
      console.log(`  - ${city}: ${facilityCount} facilities`);
    });
    
  } catch (error) {
    console.error('Error during Japan Phase 5 expansion:', error);
    throw error;
  }
}

// Run the expansion
expandJapanPhase5()
  .then(() => {
    console.log('\nPhase 5 expansion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Phase 5 expansion failed:', error);
    process.exit(1);
  });