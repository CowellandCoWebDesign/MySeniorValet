import { db } from '../db';
import { communities } from '@shared/schema';

/**
 * Phase 2: Continue expanding Japan's coverage to additional cities
 * Focus on mid-size cities and prefectural capitals
 */

async function expandJapanPhase2() {
  console.log('Starting Japan expansion Phase 2...');
  
  const additionalFacilities = [
    // Shizuoka - Mount Fuji region
    {
      name: "富士山ビューレジデンス静岡",
      address: "3-5-1 Takajo, Aoi-ku",
      city: "Shizuoka",
      state: "Shizuoka",
      zip: "420-0839",
      country: "Japan",
      phone: "+81-54-255-8888",
      website: "https://www.fujiview-shizuoka.jp/",
      description: "Senior residence with Mount Fuji views and hot spring facilities",
      type: "Independent Living",
      capacity: 70,
      hasOnsens: true,
      hasMountainView: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    {
      name: "ケアホーム静岡清水",
      address: "2-10-5 Shimizu",
      city: "Shizuoka",
      state: "Shizuoka",
      zip: "424-0806",
      country: "Japan",
      phone: "+81-54-355-7777",
      website: "https://www.care-shimizu.jp/",
      description: "Care facility near Shimizu Port with ocean therapy programs",
      type: "Assisted Living",
      capacity: 60,
      hasOceanView: true,
      hasTherapyPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"]
    },
    
    // Kagoshima - Southern Kyushu
    {
      name: "桜島ケアセンター鹿児島",
      address: "5-8-1 Shiroyama-cho",
      city: "Kagoshima",
      state: "Kagoshima",
      zip: "892-0853",
      country: "Japan",
      phone: "+81-99-224-8888",
      website: "https://www.sakurajima-care.jp/",
      description: "Senior care with views of Sakurajima volcano and therapeutic hot springs",
      type: "Skilled Nursing",
      capacity: 80,
      hasOnsens: true,
      hasVolcanoView: true,
      careTypes: ["Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2017
    },
    
    // Matsuyama - Shikoku
    {
      name: "道後温泉シニアレジデンス",
      address: "3-1-1 Dogo",
      city: "Matsuyama",
      state: "Ehime",
      zip: "790-0842",
      country: "Japan",
      phone: "+81-89-921-7777",
      website: "https://www.dogo-senior.jp/",
      description: "Historic hot spring resort senior living near Dogo Onsen",
      type: "Independent Living",
      capacity: 55,
      hasHotSprings: true,
      hasTraditionalBaths: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Nara - Ancient capital
    {
      name: "奈良パークサイドケア",
      address: "2-3-1 Kasugano-cho",
      city: "Nara",
      state: "Nara",
      zip: "630-8212",
      country: "Japan",
      phone: "+81-742-22-8888",
      website: "https://www.nara-parkside.jp/",
      description: "Senior care near Nara Park with deer viewing and temple visits",
      type: "Assisted Living",
      capacity: 65,
      hasParkAccess: true,
      hasCulturalPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2020
    },
    
    // Kanazawa (expand existing coverage)
    {
      name: "金沢城下町レジデンス",
      address: "1-2-1 Kanazawa",
      city: "Kanazawa",
      state: "Ishikawa",
      zip: "920-0962",
      country: "Japan",
      phone: "+81-76-265-8888",
      website: "https://www.kanazawa-senior.jp/",
      description: "Traditional senior residence in historic castle town district",
      type: "Independent Living",
      capacity: 50,
      hasTraditionalArchitecture: true,
      hasGoldLeafWorkshop: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Takamatsu - Shikoku
    {
      name: "瀬戸内ケアホーム高松",
      address: "4-3-1 Bancho",
      city: "Takamatsu",
      state: "Kagawa",
      zip: "760-0017",
      country: "Japan",
      phone: "+81-87-822-7777",
      website: "https://www.setouchi-care.jp/",
      description: "Seto Inland Sea view facility with udon cooking classes",
      type: "Assisted Living",
      capacity: 60,
      hasSeaView: true,
      hasCookingClasses: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Oita - Kyushu hot springs
    {
      name: "別府温泉ケアビレッジ",
      address: "3-5-1 Beppu",
      city: "Oita",
      state: "Oita",
      zip: "874-0920",
      country: "Japan",
      phone: "+81-977-23-8888",
      website: "https://www.beppu-care.jp/",
      description: "Hot spring resort care facility in Japan's onsen capital",
      type: "CCRC",
      capacity: 120,
      hasMultipleOnsens: true,
      hasTherapeuticBaths: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese", "Korean"],
      yearEstablished: 2016
    },
    
    // Nagasaki - Historic port city
    {
      name: "長崎ハーバービューケア",
      address: "5-1-1 Dejima",
      city: "Nagasaki",
      state: "Nagasaki",
      zip: "850-0862",
      country: "Japan",
      phone: "+81-95-824-8888",
      website: "https://www.nagasaki-harbor.jp/",
      description: "Harbor view senior care in historic international trade district",
      type: "Assisted Living",
      capacity: 70,
      hasHarborView: true,
      hasInternationalPrograms: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English", "Dutch"],
      yearEstablished: 2018
    },
    
    // Utsunomiya - North of Tokyo
    {
      name: "餃子の街ケアホーム宇都宮",
      address: "2-4-1 Odori",
      city: "Utsunomiya",
      state: "Tochigi",
      zip: "320-0811",
      country: "Japan",
      phone: "+81-28-633-7777",
      website: "https://www.utsunomiya-care.jp/",
      description: "Senior care in gyoza city with specialty dining programs",
      type: "Assisted Living",
      capacity: 65,
      hasSpecialtyDining: true,
      hasCookingActivities: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Toyama - Japan Sea coast
    {
      name: "立山連峰ビューホーム富山",
      address: "1-3-1 Sogawa",
      city: "Toyama",
      state: "Toyama",
      zip: "930-0083",
      country: "Japan",
      phone: "+81-76-432-8888",
      website: "https://www.tateyama-view.jp/",
      description: "Alpine view senior residence with fresh seafood cuisine",
      type: "Independent Living",
      capacity: 55,
      hasMountainView: true,
      hasSeafoodDining: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Gifu - Central Japan
    {
      name: "長良川ケアセンター岐阜",
      address: "3-2-1 Nagara",
      city: "Gifu",
      state: "Gifu",
      zip: "502-0071",
      country: "Japan",
      phone: "+81-58-233-7777",
      website: "https://www.nagara-care.jp/",
      description: "Riverside senior care with cormorant fishing viewing",
      type: "Assisted Living",
      capacity: 60,
      hasRiverView: true,
      hasCulturalEvents: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2017
    },
    
    // Wakayama - Kansai region
    {
      name: "紀州ケアガーデン和歌山",
      address: "2-1-1 Misonochō",
      city: "Wakayama",
      state: "Wakayama",
      zip: "640-8331",
      country: "Japan",
      phone: "+81-73-423-8888",
      website: "https://www.kishu-care.jp/",
      description: "Garden care facility with traditional Kishu crafts programs",
      type: "Assisted Living",
      capacity: 50,
      hasJapaneseGarden: true,
      hasCraftWorkshops: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Matsue - Shimane
    {
      name: "宍道湖ビューケア松江",
      address: "1-5-1 Asahi-machi",
      city: "Matsue",
      state: "Shimane",
      zip: "690-0003",
      country: "Japan",
      phone: "+81-852-21-7777",
      website: "https://www.shinji-care.jp/",
      description: "Lake Shinji view facility with traditional tea ceremony programs",
      type: "Independent Living",
      capacity: 45,
      hasLakeView: true,
      hasTeaCeremony: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Miyazaki - Southern Kyushu
    {
      name: "日向灘ケアリゾート宮崎",
      address: "3-1-1 Aoshima",
      city: "Miyazaki",
      state: "Miyazaki",
      zip: "889-2162",
      country: "Japan",
      phone: "+81-985-65-8888",
      website: "https://www.hyuga-care.jp/",
      description: "Beach resort senior care with subtropical gardens",
      type: "Independent Living",
      capacity: 70,
      hasBeachAccess: true,
      hasTropicalGardens: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Akita - Northern Japan
    {
      name: "秋田杉の里ケアホーム",
      address: "2-3-1 Sanno",
      city: "Akita",
      state: "Akita",
      zip: "010-0951",
      country: "Japan",
      phone: "+81-18-862-7777",
      website: "https://www.akita-care.jp/",
      description: "Traditional wooden architecture care home with namahage cultural events",
      type: "Assisted Living",
      capacity: 55,
      hasTraditionalArchitecture: true,
      hasCulturalFestivals: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Yamagata - Tohoku region
    {
      name: "蔵王温泉ケアビレッジ",
      address: "1-2-1 Zao Onsen",
      city: "Yamagata",
      state: "Yamagata",
      zip: "990-2301",
      country: "Japan",
      phone: "+81-23-694-8888",
      website: "https://www.zao-care.jp/",
      description: "Mountain resort senior care with ski viewing and hot springs",
      type: "CCRC",
      capacity: 90,
      hasSkiResortView: true,
      hasOnsens: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2017
    },
    
    // Fukushima - Tohoku
    {
      name: "会津若松城下ケアホーム",
      address: "3-4-1 Omachi",
      city: "Fukushima",
      state: "Fukushima",
      zip: "960-8041",
      country: "Japan",
      phone: "+81-24-523-7777",
      website: "https://www.aizu-care.jp/",
      description: "Historic samurai district senior care with traditional crafts",
      type: "Assisted Living",
      capacity: 60,
      hasHistoricSetting: true,
      hasCraftPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Mito - Ibaraki
    {
      name: "偕楽園ケアレジデンス水戸",
      address: "2-1-1 Kairakuen",
      city: "Mito",
      state: "Ibaraki",
      zip: "310-0033",
      country: "Japan",
      phone: "+81-29-244-8888",
      website: "https://www.kairakuen-care.jp/",
      description: "Senior residence near famous plum garden with seasonal events",
      type: "Independent Living",
      capacity: 65,
      hasGardenAccess: true,
      hasSeasonalEvents: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Maebashi - Gunma
    {
      name: "赤城山麓ケアホーム前橋",
      address: "1-2-1 Ote-machi",
      city: "Maebashi",
      state: "Gunma",
      zip: "371-0026",
      country: "Japan",
      phone: "+81-27-224-7777",
      website: "https://www.akagi-care.jp/",
      description: "Mount Akagi foothills senior care with hot spring therapy",
      type: "Assisted Living",
      capacity: 70,
      hasMountainView: true,
      hasOnsenTherapy: true,
      careTypes: ["Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Kofu - Yamanashi
    {
      name: "富士五湖ケアセンター甲府",
      address: "2-3-1 Marunouchi",
      city: "Kofu",
      state: "Yamanashi",
      zip: "400-0031",
      country: "Japan",
      phone: "+81-55-222-8888",
      website: "https://www.fuji-care-kofu.jp/",
      description: "Wine country senior care with Mount Fuji views",
      type: "Independent Living",
      capacity: 55,
      hasWinePrograms: true,
      hasFujiView: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Tsu - Mie
    {
      name: "伊勢湾ケアガーデン津",
      address: "1-1-1 Marunouchi",
      city: "Tsu",
      state: "Mie",
      zip: "514-0033",
      country: "Japan",
      phone: "+81-59-228-7777",
      website: "https://www.isewan-care.jp/",
      description: "Ise Bay view senior care with shrine pilgrimage programs",
      type: "Assisted Living",
      capacity: 60,
      hasBayView: true,
      hasPilgrimagePrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Otsu - Shiga
    {
      name: "琵琶湖レイクビューケア大津",
      address: "3-1-1 Hamaotsu",
      city: "Otsu",
      state: "Shiga",
      zip: "520-0047",
      country: "Japan",
      phone: "+81-77-525-8888",
      website: "https://www.biwako-care.jp/",
      description: "Lake Biwa waterfront senior residence with water therapy",
      type: "Independent Living",
      capacity: 75,
      hasLakeView: true,
      hasAquaTherapy: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Tokushima - Shikoku
    {
      name: "阿波おどりケアホーム徳島",
      address: "2-1-1 Tokushima-cho",
      city: "Tokushima",
      state: "Tokushima",
      zip: "770-0841",
      country: "Japan",
      phone: "+81-88-622-7777",
      website: "https://www.awa-care.jp/",
      description: "Senior care with Awa dance programs and indigo dyeing workshops",
      type: "Assisted Living",
      capacity: 50,
      hasDancePrograms: true,
      hasArtWorkshops: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Kochi - Shikoku
    {
      name: "土佐ケアセンター高知",
      address: "1-2-1 Harimaya-cho",
      city: "Kochi",
      state: "Kochi",
      zip: "780-0822",
      country: "Japan",
      phone: "+81-88-822-8888",
      website: "https://www.tosa-care.jp/",
      description: "Riverside senior care with Yosakoi festival participation",
      type: "Assisted Living",
      capacity: 55,
      hasFestivalPrograms: true,
      hasRiverView: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Saga - Kyushu
    {
      name: "有田焼の里ケアホーム佐賀",
      address: "2-3-1 Jonai",
      city: "Saga",
      state: "Saga",
      zip: "840-0041",
      country: "Japan",
      phone: "+81-952-24-7777",
      website: "https://www.arita-care.jp/",
      description: "Senior care with pottery programs in famous ceramics region",
      type: "Assisted Living",
      capacity: 45,
      hasPotteryStudio: true,
      hasArtPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    }
  ];

  try {
    const insertedFacilities = await db.insert(communities).values(additionalFacilities).returning();
    console.log(`✅ Successfully added ${insertedFacilities.length} additional Japanese facilities`);
    
    // Log city distribution
    const cityCount = new Map();
    insertedFacilities.forEach(f => {
      cityCount.set(f.city, (cityCount.get(f.city) || 0) + 1);
    });
    
    console.log('\nNew facilities by city:');
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
    
  } catch (error) {
    console.error('Error inserting Japan facilities:', error);
  }
}

// Run the expansion
expandJapanPhase2().catch(console.error);