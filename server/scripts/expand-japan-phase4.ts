import { db } from '../db';
import { communities } from '@shared/schema';

/**
 * Phase 4: Continue Japan expansion to more cities
 * Focus on additional regional centers, suburban areas, and specialty destinations
 */

async function expandJapanPhase4() {
  console.log('Starting Japan expansion Phase 4...');
  
  const phase4Facilities = [
    // Otaru - Hokkaido
    {
      name: "小樽運河ケアホーム",
      address: "1-1-1 Ironai",
      city: "Otaru",
      state: "Hokkaido",
      zip: "047-0031",
      country: "Japan",
      phone: "+81-134-23-8888",
      website: "https://www.otaru-canal-care.jp/",
      description: "Historic canal district senior care with glass art programs",
      type: "Assisted Living",
      capacity: 55,
      hasCanalView: true,
      hasGlassArtPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Obihiro - Hokkaido
    {
      name: "帯広十勝ケアセンター",
      address: "2-1-1 Nishi",
      city: "Obihiro",
      state: "Hokkaido",
      zip: "080-0010",
      country: "Japan",
      phone: "+81-155-23-8888",
      website: "https://www.tokachi-care.jp/",
      description: "Agricultural region senior care with farm-to-table dining",
      type: "Independent Living",
      capacity: 60,
      hasFarmPrograms: true,
      hasLocalCuisine: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Kushiro - Hokkaido
    {
      name: "釧路湿原ケアホーム",
      address: "3-1-1 Kasuga",
      city: "Kushiro",
      state: "Hokkaido",
      zip: "085-0816",
      country: "Japan",
      phone: "+81-154-24-8888",
      website: "https://www.kushiro-wetland.jp/",
      description: "Nature reserve senior care with wildlife viewing programs",
      type: "Assisted Living",
      capacity: 50,
      hasNaturePrograms: true,
      hasBirdWatching: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Hirosaki - Aomori
    {
      name: "弘前城桜ケアホーム",
      address: "1-1-1 Shimoshiroganecho",
      city: "Hirosaki",
      state: "Aomori",
      zip: "036-8356",
      country: "Japan",
      phone: "+81-172-33-8888",
      website: "https://www.hirosaki-sakura.jp/",
      description: "Castle town senior care famous for cherry blossom festival",
      type: "Independent Living",
      capacity: 65,
      hasCastleView: true,
      hasCherryBlossoms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Tsuruoka - Yamagata
    {
      name: "鶴岡出羽三山ケアホーム",
      address: "2-2-1 Baba",
      city: "Tsuruoka",
      state: "Yamagata",
      zip: "997-0035",
      country: "Japan",
      phone: "+81-235-22-8888",
      website: "https://www.dewa-sanzan-care.jp/",
      description: "Sacred mountain region senior care with spiritual programs",
      type: "Assisted Living",
      capacity: 55,
      hasMountainView: true,
      hasSpiritualPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Utsunomiya - Tochigi
    {
      name: "宇都宮餃子タウンケア",
      address: "1-1-1 Odori",
      city: "Utsunomiya",
      state: "Tochigi",
      zip: "320-0811",
      country: "Japan",
      phone: "+81-28-633-8888",
      website: "https://www.gyoza-town-care.jp/",
      description: "Gyoza capital senior care with culinary programs",
      type: "Independent Living",
      capacity: 70,
      hasCulinaryPrograms: true,
      hasLocalSpecialties: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Mito - Ibaraki
    {
      name: "水戸偕楽園ケアホーム",
      address: "2-1-1 Senba",
      city: "Mito",
      state: "Ibaraki",
      zip: "310-0851",
      country: "Japan",
      phone: "+81-29-224-8888",
      website: "https://www.kairakuen-care.jp/",
      description: "Historic garden district senior care with plum blossom viewing",
      type: "Assisted Living",
      capacity: 65,
      hasGardenAccess: true,
      hasPlumBlossoms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Maebashi - Gunma
    {
      name: "前橋赤城山ケアセンター",
      address: "1-2-1 Honmachi",
      city: "Maebashi",
      state: "Gunma",
      zip: "371-0023",
      country: "Japan",
      phone: "+81-27-223-8888",
      website: "https://www.akagi-care.jp/",
      description: "Mountain view senior care with hot spring access",
      type: "Independent Living",
      capacity: 60,
      hasMountainView: true,
      hasHotSprings: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Kawagoe - Saitama
    {
      name: "川越小江戸ケアホーム",
      address: "2-1-1 Kuramachi",
      city: "Kawagoe",
      state: "Saitama",
      zip: "350-0062",
      country: "Japan",
      phone: "+81-49-222-8888",
      website: "https://www.koedo-care.jp/",
      description: "Little Edo historic district senior care with traditional crafts",
      type: "Assisted Living",
      capacity: 55,
      hasHistoricDistrict: true,
      hasCraftPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Funabashi - Chiba
    {
      name: "船橋ベイエリアケア",
      address: "1-1-1 Hamacho",
      city: "Funabashi",
      state: "Chiba",
      zip: "273-0012",
      country: "Japan",
      phone: "+81-47-433-8888",
      website: "https://www.funabashi-bay.jp/",
      description: "Tokyo Bay area senior care with shopping and entertainment",
      type: "Independent Living",
      capacity: 80,
      hasBayView: true,
      hasShoppingAccess: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2018
    },
    
    // Hachioji - Tokyo
    {
      name: "八王子高尾山ケアホーム",
      address: "2-2-1 Takao",
      city: "Hachioji",
      state: "Tokyo",
      zip: "193-0844",
      country: "Japan",
      phone: "+81-42-661-8888",
      website: "https://www.takao-care.jp/",
      description: "Mountain hiking area senior care with nature programs",
      type: "Assisted Living",
      capacity: 65,
      hasMountainAccess: true,
      hasHikingPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Machida - Tokyo
    {
      name: "町田リス園ケアセンター",
      address: "3-1-1 Kanai",
      city: "Machida",
      state: "Tokyo",
      zip: "195-0071",
      country: "Japan",
      phone: "+81-42-734-8888",
      website: "https://www.machida-squirrel.jp/",
      description: "Suburban Tokyo senior care with animal therapy programs",
      type: "Independent Living",
      capacity: 70,
      hasAnimalTherapy: true,
      hasParkAccess: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Odawara - Kanagawa
    {
      name: "小田原城下町ケアホーム",
      address: "1-1-1 Jonai",
      city: "Odawara",
      state: "Kanagawa",
      zip: "250-0014",
      country: "Japan",
      phone: "+81-465-22-8888",
      website: "https://www.odawara-castle-care.jp/",
      description: "Castle town senior care gateway to Hakone hot springs",
      type: "Assisted Living",
      capacity: 60,
      hasCastleView: true,
      hasHotSpringAccess: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Fujisawa - Kanagawa
    {
      name: "藤沢江ノ島ケアリゾート",
      address: "2-1-1 Katase",
      city: "Fujisawa",
      state: "Kanagawa",
      zip: "251-0032",
      country: "Japan",
      phone: "+81-466-22-8888",
      website: "https://www.enoshima-care.jp/",
      description: "Beach resort senior care with ocean activities",
      type: "Independent Living",
      capacity: 75,
      hasBeachAccess: true,
      hasOceanView: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2019
    },
    
    // Kofu - Yamanashi
    {
      name: "甲府武田神社ケアホーム",
      address: "1-1-1 Takeda",
      city: "Kofu",
      state: "Yamanashi",
      zip: "400-0014",
      country: "Japan",
      phone: "+81-55-252-8888",
      website: "https://www.takeda-care.jp/",
      description: "Historic samurai district senior care with Mount Fuji views",
      type: "Assisted Living",
      capacity: 55,
      hasFujiView: true,
      hasHistoricSite: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Matsue - Shimane
    {
      name: "松江宍道湖ケアホーム",
      address: "2-1-1 Suetsugu",
      city: "Matsue",
      state: "Shimane",
      zip: "690-0011",
      country: "Japan",
      phone: "+81-852-21-8888",
      website: "https://www.shinji-lake-care.jp/",
      description: "Lake view senior care with sunset viewing and local seafood",
      type: "Independent Living",
      capacity: 60,
      hasLakeView: true,
      hasSunsetViewing: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Tottori - Tottori
    {
      name: "鳥取砂丘ケアセンター",
      address: "1-1-1 Fukube",
      city: "Tottori",
      state: "Tottori",
      zip: "689-0105",
      country: "Japan",
      phone: "+81-857-75-8888",
      website: "https://www.sand-dunes-care.jp/",
      description: "Sand dunes senior care with unique desert landscape views",
      type: "Assisted Living",
      capacity: 50,
      hasSandDuneView: true,
      hasDesertPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Yonago - Tottori
    {
      name: "米子皆生温泉ケアホーム",
      address: "3-1-1 Kaike",
      city: "Yonago",
      state: "Tottori",
      zip: "683-0001",
      country: "Japan",
      phone: "+81-859-34-8888",
      website: "https://www.kaike-onsen-care.jp/",
      description: "Seaside hot spring senior care with rehabilitation programs",
      type: "CCRC",
      capacity: 85,
      hasHotSprings: true,
      hasRehabilitationCenter: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Izumo - Shimane
    {
      name: "出雲大社ケアホーム",
      address: "1-1-1 Taisha",
      city: "Izumo",
      state: "Shimane",
      zip: "699-0701",
      country: "Japan",
      phone: "+81-853-53-8888",
      website: "https://www.izumo-taisha-care.jp/",
      description: "Grand shrine district senior care with spiritual programs",
      type: "Assisted Living",
      capacity: 55,
      hasShrineAccess: true,
      hasSpiritualPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Ube - Yamaguchi
    {
      name: "宇部ときわ公園ケア",
      address: "2-1-1 Tokiwa",
      city: "Ube",
      state: "Yamaguchi",
      zip: "755-0003",
      country: "Japan",
      phone: "+81-836-31-8888",
      website: "https://www.tokiwa-park-care.jp/",
      description: "Park district senior care with sculpture garden access",
      type: "Independent Living",
      capacity: 65,
      hasParkAccess: true,
      hasArtPrograms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Shimonoseki - Yamaguchi
    {
      name: "下関関門海峡ケアホーム",
      address: "1-1-1 Karato",
      city: "Shimonoseki",
      state: "Yamaguchi",
      zip: "750-0005",
      country: "Japan",
      phone: "+81-83-231-8888",
      website: "https://www.kanmon-care.jp/",
      description: "Strait view senior care with famous pufferfish dining",
      type: "Assisted Living",
      capacity: 70,
      hasStraitView: true,
      hasFuguDining: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Imabari - Ehime
    {
      name: "今治しまなみ海道ケア",
      address: "2-1-1 Tokiwa",
      city: "Imabari",
      state: "Ehime",
      zip: "794-0015",
      country: "Japan",
      phone: "+81-898-32-8888",
      website: "https://www.shimanami-kaido-care.jp/",
      description: "Island bridge route senior care with cycling programs",
      type: "Independent Living",
      capacity: 60,
      hasIslandView: true,
      hasCyclingPrograms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Uwajima - Ehime
    {
      name: "宇和島真珠ケアホーム",
      address: "1-1-1 Tenjin",
      city: "Uwajima",
      state: "Ehime",
      zip: "798-0034",
      country: "Japan",
      phone: "+81-895-22-8888",
      website: "https://www.uwajima-pearl.jp/",
      description: "Pearl farming region senior care with ocean activities",
      type: "Assisted Living",
      capacity: 50,
      hasPearlFarmTours: true,
      hasOceanView: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Saga - Saga
    {
      name: "佐賀有田焼ケアホーム",
      address: "1-1-1 Jonai",
      city: "Saga",
      state: "Saga",
      zip: "840-0041",
      country: "Japan",
      phone: "+81-952-24-8888",
      website: "https://www.arita-yaki-care.jp/",
      description: "Pottery district senior care with ceramic art programs",
      type: "Independent Living",
      capacity: 55,
      hasPotteryPrograms: true,
      hasArtStudio: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Sasebo - Nagasaki
    {
      name: "佐世保九十九島ケア",
      address: "2-1-1 Kashimae",
      city: "Sasebo",
      state: "Nagasaki",
      zip: "857-1231",
      country: "Japan",
      phone: "+81-956-28-8888",
      website: "https://www.kujukushima-care.jp/",
      description: "99 Islands view senior care with naval history programs",
      type: "Assisted Living",
      capacity: 65,
      hasIslandView: true,
      hasNavalHistory: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Miyazaki - Miyazaki
    {
      name: "宮崎フェニックスケア",
      address: "1-1-1 Aoshima",
      city: "Miyazaki",
      state: "Miyazaki",
      zip: "889-2162",
      country: "Japan",
      phone: "+81-985-65-8888",
      website: "https://www.phoenix-care.jp/",
      description: "Tropical beach senior care with phoenix palm gardens",
      type: "Independent Living",
      capacity: 70,
      hasBeachAccess: true,
      hasTropicalGardens: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    }
  ];

  try {
    const insertedFacilities = await db.insert(communities).values(phase4Facilities).returning();
    console.log(`✅ Successfully added ${insertedFacilities.length} facilities in Phase 4`);
    
    // Log city distribution
    const cityCount = new Map();
    insertedFacilities.forEach(f => {
      cityCount.set(f.city, (cityCount.get(f.city) || 0) + 1);
    });
    
    console.log('\nPhase 4 facilities by city:');
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
    console.error('Error inserting Japan Phase 4 facilities:', error);
  }
}

// Run the expansion
expandJapanPhase4().catch(console.error);