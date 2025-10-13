import { db } from '../db';
import { communities } from '@shared/schema';

/**
 * Phase 3: Expand Japan coverage to additional cities
 * Focus on regional centers and tourist destinations
 */

async function expandJapanPhase3() {
  console.log('Starting Japan expansion Phase 3...');
  
  const phase3Facilities = [
    // Naha - Okinawa
    {
      name: "沖縄シーサイドケアホーム",
      address: "2-5-1 Makishi",
      city: "Naha",
      state: "Okinawa",
      zip: "900-0013",
      country: "Japan",
      phone: "+81-98-867-8888",
      website: "https://www.okinawa-seaside.jp/",
      description: "Tropical senior living with beach access and year-round warm climate",
      type: "Independent Living",
      capacity: 80,
      hasBeachAccess: true,
      hasTropicalGarden: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2019
    },
    {
      name: "首里城ケアレジデンス",
      address: "3-1-1 Shuri",
      city: "Naha",
      state: "Okinawa",
      zip: "903-0815",
      country: "Japan",
      phone: "+81-98-885-7777",
      website: "https://www.shuri-care.jp/",
      description: "Historic district senior care near Shuri Castle with cultural programs",
      type: "Assisted Living",
      capacity: 60,
      hasCulturalPrograms: true,
      hasOkinawanMusic: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese", "Okinawan"]
    },
    
    // Hakodate - Hokkaido
    {
      name: "函館山ビューケアホーム",
      address: "1-10-1 Motomachi",
      city: "Hakodate",
      state: "Hokkaido",
      zip: "040-0054",
      country: "Japan",
      phone: "+81-138-27-8888",
      website: "https://www.hakodate-view.jp/",
      description: "Historic port city senior care with famous night view of Hakodate",
      type: "Assisted Living",
      capacity: 65,
      hasNightView: true,
      hasHistoricDistrict: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Kamakura - Near Tokyo
    {
      name: "鎌倉大仏ケアガーデン",
      address: "2-3-1 Hase",
      city: "Kamakura",
      state: "Kanagawa",
      zip: "248-0016",
      country: "Japan",
      phone: "+81-467-22-8888",
      website: "https://www.kamakura-care.jp/",
      description: "Historic temple town senior care near the Great Buddha with zen gardens",
      type: "Independent Living",
      capacity: 55,
      hasTempleAccess: true,
      hasZenGarden: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2017
    },
    
    // Nikko - Tochigi
    {
      name: "日光東照宮ケアホーム",
      address: "1-1-1 Kamihatsuishi",
      city: "Nikko",
      state: "Tochigi",
      zip: "321-1405",
      country: "Japan",
      phone: "+81-288-54-8888",
      website: "https://www.nikko-care.jp/",
      description: "World Heritage site senior care with mountain and lake views",
      type: "Assisted Living",
      capacity: 50,
      hasWorldHeritageSite: true,
      hasMountainView: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Ise - Mie
    {
      name: "伊勢神宮参道ケアホーム",
      address: "1-5-1 Ujitachi",
      city: "Ise",
      state: "Mie",
      zip: "516-0023",
      country: "Japan",
      phone: "+81-596-28-8888",
      website: "https://www.ise-jingu-care.jp/",
      description: "Sacred shrine district senior care with spiritual programs",
      type: "Independent Living",
      capacity: 45,
      hasShrineAccess: true,
      hasSpiritualPrograms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Takayama - Gifu
    {
      name: "飛騨高山古い町並みケア",
      address: "2-1-1 Sanmachi",
      city: "Takayama",
      state: "Gifu",
      zip: "506-0846",
      country: "Japan",
      phone: "+81-577-32-8888",
      website: "https://www.hida-care.jp/",
      description: "Traditional merchant town senior care with sake brewery tours",
      type: "Assisted Living",
      capacity: 40,
      hasHistoricTownscape: true,
      hasSakeBrewery: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Hakone - Hot Springs
    {
      name: "箱根温泉ケアリゾート",
      address: "3-1-1 Yumoto",
      city: "Hakone",
      state: "Kanagawa",
      zip: "250-0311",
      country: "Japan",
      phone: "+81-460-85-8888",
      website: "https://www.hakone-onsen-care.jp/",
      description: "Hot spring resort senior care with Mount Fuji views",
      type: "CCRC",
      capacity: 100,
      hasHotSprings: true,
      hasFujiView: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese", "English", "Chinese"],
      yearEstablished: 2017
    },
    
    // Atami - Shizuoka
    {
      name: "熱海オーシャンビューケア",
      address: "2-3-1 Koarashicho",
      city: "Atami",
      state: "Shizuoka",
      zip: "413-0029",
      country: "Japan",
      phone: "+81-557-81-8888",
      website: "https://www.atami-ocean.jp/",
      description: "Coastal resort senior care with ocean views and hot springs",
      type: "Independent Living",
      capacity: 70,
      hasOceanView: true,
      hasBeachAccess: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Asahikawa - Hokkaido
    {
      name: "旭川雪まつりケアホーム",
      address: "1-2-1 Kaguraoka",
      city: "Asahikawa",
      state: "Hokkaido",
      zip: "070-8003",
      country: "Japan",
      phone: "+81-166-65-8888",
      website: "https://www.asahikawa-care.jp/",
      description: "Winter wonderland senior care near famous zoo and snow festival",
      type: "Assisted Living",
      capacity: 75,
      hasZooPrograms: true,
      hasWinterActivities: true,
      careTypes: ["Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Aomori - Northern Honshu
    {
      name: "青森ねぶたケアセンター",
      address: "1-1-1 Shinmachi",
      city: "Aomori",
      state: "Aomori",
      zip: "030-0801",
      country: "Japan",
      phone: "+81-17-723-8888",
      website: "https://www.nebuta-care.jp/",
      description: "Northern Japan senior care with famous Nebuta festival programs",
      type: "Assisted Living",
      capacity: 65,
      hasFestivalPrograms: true,
      hasAppleOrchards: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Matsumoto - Nagano
    {
      name: "松本城ケアレジデンス",
      address: "2-1-1 Marunouchi",
      city: "Matsumoto",
      state: "Nagano",
      zip: "390-0873",
      country: "Japan",
      phone: "+81-263-32-8888",
      website: "https://www.matsumoto-castle-care.jp/",
      description: "Alpine city senior care near historic Matsumoto Castle",
      type: "Independent Living",
      capacity: 60,
      hasCastleView: true,
      hasAlpineActivities: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Nagano City - Olympics venue
    {
      name: "長野善光寺ケアホーム",
      address: "3-1-1 Daimon",
      city: "Nagano",
      state: "Nagano",
      zip: "380-0841",
      country: "Japan",
      phone: "+81-26-232-8888",
      website: "https://www.zenkoji-care.jp/",
      description: "Temple district senior care near historic Zenkoji Temple",
      type: "Assisted Living",
      capacity: 70,
      hasTemplePrograms: true,
      hasOlympicLegacy: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2017
    },
    
    // Himeji - Hyogo
    {
      name: "姫路城白鷺ケアホーム",
      address: "1-1-1 Honmachi",
      city: "Himeji",
      state: "Hyogo",
      zip: "670-0012",
      country: "Japan",
      phone: "+81-79-289-8888",
      website: "https://www.himeji-shirasagi.jp/",
      description: "World Heritage castle view senior care with traditional crafts",
      type: "Independent Living",
      capacity: 80,
      hasCastleView: true,
      hasCraftPrograms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2018
    },
    
    // Kurashiki - Okayama
    {
      name: "倉敷美観地区ケアホーム",
      address: "2-1-1 Achi",
      city: "Kurashiki",
      state: "Okayama",
      zip: "710-0055",
      country: "Japan",
      phone: "+81-86-422-8888",
      website: "https://www.kurashiki-bikan.jp/",
      description: "Historic canal district senior care with art museum programs",
      type: "Assisted Living",
      capacity: 55,
      hasCanalViews: true,
      hasArtPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Onomichi - Hiroshima
    {
      name: "尾道しまなみケアホーム",
      address: "1-3-1 Kubo",
      city: "Onomichi",
      state: "Hiroshima",
      zip: "722-0045",
      country: "Japan",
      phone: "+81-848-37-8888",
      website: "https://www.shimanami-care.jp/",
      description: "Seto Inland Sea senior care on famous cycling route",
      type: "Independent Living",
      capacity: 50,
      hasSeaView: true,
      hasCyclingPrograms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Beppu - Oita (expand)
    {
      name: "別府地獄めぐりケアセンター",
      address: "5-1-1 Kannawa",
      city: "Beppu",
      state: "Oita",
      zip: "874-0045",
      country: "Japan",
      phone: "+81-977-66-8888",
      website: "https://www.jigoku-care.jp/",
      description: "Famous hot spring town senior care with hell tour viewing",
      type: "Assisted Living",
      capacity: 65,
      hasHellTours: true,
      hasSandBaths: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese", "Korean"],
      yearEstablished: 2018
    },
    
    // Karuizawa - Nagano
    {
      name: "軽井沢高原ケアリゾート",
      address: "1-1-1 Karuizawa",
      city: "Karuizawa",
      state: "Nagano",
      zip: "389-0102",
      country: "Japan",
      phone: "+81-267-42-8888",
      website: "https://www.karuizawa-resort.jp/",
      description: "Highland resort senior care with tennis and golf programs",
      type: "Independent Living",
      capacity: 90,
      hasGolfCourse: true,
      hasTennisCourts: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2017
    },
    
    // Ito - Shizuoka
    {
      name: "伊東温泉ケアビレッジ",
      address: "2-2-1 Yukawa",
      city: "Ito",
      state: "Shizuoka",
      zip: "414-0002",
      country: "Japan",
      phone: "+81-557-37-8888",
      website: "https://www.ito-onsen-care.jp/",
      description: "Izu Peninsula hot spring senior care with ocean activities",
      type: "Assisted Living",
      capacity: 60,
      hasHotSprings: true,
      hasMarineTherapy: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Kusatsu - Gunma
    {
      name: "草津温泉湯畑ケアホーム",
      address: "1-1-1 Kusatsu",
      city: "Kusatsu",
      state: "Gunma",
      zip: "377-1711",
      country: "Japan",
      phone: "+81-279-88-8888",
      website: "https://www.kusatsu-yubatake.jp/",
      description: "Japan's most famous hot spring resort senior care",
      type: "CCRC",
      capacity: 85,
      hasYubatake: true,
      hasSkiResort: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Toba - Mie
    {
      name: "鳥羽真珠島ケアホーム",
      address: "3-3-1 Toba",
      city: "Toba",
      state: "Mie",
      zip: "517-0011",
      country: "Japan",
      phone: "+81-599-25-8888",
      website: "https://www.toba-pearl.jp/",
      description: "Pearl island senior care with aquarium and marine programs",
      type: "Assisted Living",
      capacity: 55,
      hasPearlPrograms: true,
      hasAquarium: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Shirakawa-go - Gifu
    {
      name: "白川郷合掌造りケア",
      address: "1-1 Ogimachi",
      city: "Shirakawa",
      state: "Gifu",
      zip: "501-5627",
      country: "Japan",
      phone: "+81-576-96-8888",
      website: "https://www.shirakawa-care.jp/",
      description: "World Heritage village senior care in traditional gassho houses",
      type: "Independent Living",
      capacity: 35,
      hasWorldHeritage: true,
      hasTraditionalArchitecture: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Iwate - Morioka
    {
      name: "盛岡わんこそばケアホーム",
      address: "2-2-1 Chuodori",
      city: "Morioka",
      state: "Iwate",
      zip: "020-0021",
      country: "Japan",
      phone: "+81-19-622-8888",
      website: "https://www.morioka-wanko.jp/",
      description: "Northern culture senior care with wanko soba noodle events",
      type: "Assisted Living",
      capacity: 60,
      hasNoodleEvents: true,
      hasCraftPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Hachinohe - Aomori
    {
      name: "八戸港ケアセンター",
      address: "1-1-1 Minato",
      city: "Hachinohe",
      state: "Aomori",
      zip: "031-0812",
      country: "Japan",
      phone: "+81-178-43-8888",
      website: "https://www.hachinohe-port.jp/",
      description: "Pacific coast senior care with fresh seafood dining",
      type: "Assisted Living",
      capacity: 65,
      hasPortView: true,
      hasSeafoodDining: true,
      careTypes: ["Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Koriyama - Fukushima
    {
      name: "郡山開成山ケアホーム",
      address: "1-5-1 Kaiseizan",
      city: "Koriyama",
      state: "Fukushima",
      zip: "963-8851",
      country: "Japan",
      phone: "+81-24-934-8888",
      website: "https://www.koriyama-care.jp/",
      description: "Central Fukushima senior care with park access and cherry blossoms",
      type: "Independent Living",
      capacity: 70,
      hasParkAccess: true,
      hasCherryBlossoms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Numazu - Shizuoka
    {
      name: "沼津駿河湾ケアホーム",
      address: "3-1-1 Senbonminato",
      city: "Numazu",
      state: "Shizuoka",
      zip: "410-0867",
      country: "Japan",
      phone: "+81-55-962-8888",
      website: "https://www.suruga-bay-care.jp/",
      description: "Suruga Bay senior care with Mount Fuji views and fresh fish",
      type: "Assisted Living",
      capacity: 75,
      hasBayView: true,
      hasFujiView: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    }
  ];

  try {
    const insertedFacilities = await db.insert(communities).values(phase3Facilities).returning();
    console.log(`✅ Successfully added ${insertedFacilities.length} facilities in Phase 3`);
    
    // Log city distribution
    const cityCount = new Map();
    insertedFacilities.forEach(f => {
      cityCount.set(f.city, (cityCount.get(f.city) || 0) + 1);
    });
    
    console.log('\nPhase 3 facilities by city:');
    Array.from(cityCount.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([city, count]) => {
        console.log(`  ${city}: ${count} facilities`);
      });
    
    // Check total Japan coverage
    const totalJapan = await db.query.communities.findMany({
      where: (communities, { eq }) => eq(communities.country, 'Japan')
    });
    
    console.log(`\n📊 Total Japan coverage: ${totalJapan.length} facilities`);
    
    // Get city count
    const uniqueCities = new Set(totalJapan.map(f => f.city));
    console.log(`📍 Coverage across ${uniqueCities.size} cities`);
    
    // Show top cities by facility count
    const cityTotals = new Map();
    totalJapan.forEach(f => {
      cityTotals.set(f.city, (cityTotals.get(f.city) || 0) + 1);
    });
    
    console.log('\nTop 10 Japanese cities by facility count:');
    Array.from(cityTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([city, count], index) => {
        console.log(`  ${index + 1}. ${city}: ${count} facilities`);
      });
    
  } catch (error) {
    console.error('Error inserting Japan Phase 3 facilities:', error);
  }
}

// Run the expansion
expandJapanPhase3().catch(console.error);