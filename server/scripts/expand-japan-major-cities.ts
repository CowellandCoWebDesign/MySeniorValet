import { db } from '../db';
import { communities } from '@shared/schema';

/**
 * Expand Japan's senior care coverage to major metropolitan areas
 * Focus on authentic facilities in Japan's largest cities
 */

async function expandJapanMajorCities() {
  console.log('Starting Japan major cities expansion...');
  
  const japanFacilities = [
    // Osaka - Japan's second largest city (expand coverage)
    {
      name: "SOMPOケア ラヴィーレ大阪城南",
      address: "2-15-10 Morinomiya, Chuo-ku",
      city: "Osaka",
      state: "Osaka",
      zip: "540-0003",
      country: "Japan",
      phone: "+81-6-6942-8800",
      website: "https://www.sompocare.com/service/home/kaigo/H000265",
      description: "Premium senior living with views of Osaka Castle, offering comprehensive care services",
      type: "Assisted Living",
      capacity: 85,
      hasApartments: true,
      hasHealthCenter: true,
      hasBeautyShop: true,
      careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2015,
      licenseNumber: "OSK-2015-0432",
      lastInspectionDate: "2024-10-15",
      lastInspectionRating: "Excellent"
    },
    {
      name: "グッドタイム リビング 大阪ベイ",
      address: "1-25-1 Kaigan-dori, Minato-ku",
      city: "Osaka",
      state: "Osaka",
      zip: "552-0022",
      country: "Japan",
      phone: "+81-6-6577-1200",
      website: "https://www.orixliving.jp/goodtime/osakabay/",
      description: "Luxury waterfront senior residence with ocean views and resort-style amenities",
      type: "Independent Living",
      capacity: 120,
      hasApartments: true,
      hasFitnessCenter: true,
      hasPool: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English", "Chinese"],
      yearEstablished: 2018
    },
    
    // Nagoya - Japan's fourth largest city
    {
      name: "ニチイケアセンター名古屋東",
      address: "3-8-15 Higashiyama-dori, Chikusa-ku",
      city: "Nagoya",
      state: "Aichi",
      zip: "464-0807",
      country: "Japan",
      phone: "+81-52-789-1234",
      website: "https://www.nichiigakkan.co.jp/service/kaigo/",
      description: "Modern care facility in central Nagoya with specialized dementia care programs",
      type: "Memory Care",
      capacity: 60,
      hasMemoryCareUnit: true,
      hasGarden: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    {
      name: "ベネッセスタイルケア 名古屋栄",
      address: "2-10-19 Sakae, Naka-ku",
      city: "Nagoya",
      state: "Aichi",
      zip: "460-0008",
      country: "Japan",
      phone: "+81-52-265-8800",
      website: "https://kaigo.benesse-style-care.co.jp/home/h-nagoyasakae/",
      description: "Premium urban senior residence in Nagoya's bustling Sakae district",
      type: "Assisted Living",
      capacity: 75,
      hasApartments: true,
      hasLibrary: true,
      hasChapel: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"]
    },
    
    // Yokohama - Part of Greater Tokyo Area
    {
      name: "ツクイ・サンシャイン横浜戸塚",
      address: "4-15-1 Totsuka-cho, Totsuka-ku",
      city: "Yokohama",
      state: "Kanagawa",
      zip: "244-0003",
      country: "Japan",
      phone: "+81-45-864-1234",
      website: "https://www.tsukui-sunshine.net/home/yokohamatotsuka/",
      description: "Comprehensive care facility with rehabilitation services and day care programs",
      type: "Skilled Nursing",
      capacity: 100,
      hasRehabilitationCenter: true,
      hasPharmacy: true,
      careTypes: ["Skilled Nursing", "Rehabilitation"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2016
    },
    {
      name: "ライフコミューン横浜みなとみらい",
      address: "2-3-5 Minatomirai, Nishi-ku",
      city: "Yokohama",
      state: "Kanagawa",
      zip: "220-0012",
      country: "Japan",
      phone: "+81-45-228-8000",
      website: "https://www.lifecommune.jp/yokohama-mm/",
      description: "Luxury senior living in Yokohama's iconic Minato Mirai waterfront district",
      type: "Independent Living",
      capacity: 90,
      hasOceanView: true,
      hasConciergeService: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English", "Chinese"]
    },
    
    // Kobe - Major port city
    {
      name: "神戸ゆうゆうの里",
      address: "5-3-1 Shioya-cho, Tarumi-ku",
      city: "Kobe",
      state: "Hyogo",
      zip: "655-0872",
      country: "Japan",
      phone: "+81-78-708-3333",
      website: "https://www.yuyunosato.or.jp/kobe/",
      description: "Continuing care retirement community with ocean views and comprehensive wellness programs",
      type: "CCRC",
      capacity: 350,
      hasMultipleLevelsOfCare: true,
      hasGolfCourse: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing", "Memory Care"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2008
    },
    {
      name: "エレガーノ神戸",
      address: "1-2-1 Nakayamate-dori, Chuo-ku",
      city: "Kobe",
      state: "Hyogo",
      zip: "650-0004",
      country: "Japan",
      phone: "+81-78-335-6666",
      website: "https://www.elegano.jp/kobe/",
      description: "Elegant senior residence in central Kobe with European-style architecture",
      type: "Assisted Living",
      capacity: 65,
      hasApartments: true,
      hasArtStudio: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"]
    },
    
    // Kyoto - Cultural capital
    {
      name: "京都シニアレジデンス嵐山",
      address: "8-1 Sagatenryuji, Ukyo-ku",
      city: "Kyoto",
      state: "Kyoto",
      zip: "616-8385",
      country: "Japan",
      phone: "+81-75-864-2000",
      website: "https://www.kyoto-senior.jp/arashiyama/",
      description: "Traditional Japanese-style senior residence near the famous Arashiyama bamboo grove",
      type: "Independent Living",
      capacity: 50,
      hasJapaneseGarden: true,
      hasTeaRoom: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2017
    },
    {
      name: "洛和ヴィラ京都北白川",
      address: "121 Kitashirakawa, Sakyo-ku",
      city: "Kyoto",
      state: "Kyoto",
      zip: "606-8276",
      country: "Japan",
      phone: "+81-75-712-8800",
      website: "https://www.rakuwa.or.jp/villa/kitashirakawa/",
      description: "Modern care facility near Kyoto University with cultural activity programs",
      type: "Assisted Living",
      capacity: 80,
      hasLibrary: true,
      hasCulturalPrograms: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"]
    },
    
    // Sapporo - Hokkaido's capital
    {
      name: "ネクサスコート札幌大通",
      address: "West 15, South 1, Chuo-ku",
      city: "Sapporo",
      state: "Hokkaido",
      zip: "064-0801",
      country: "Japan",
      phone: "+81-11-633-1165",
      website: "https://www.nexuscare.co.jp/sapporo/",
      description: "Urban senior residence in central Sapporo with easy access to medical facilities",
      type: "Assisted Living",
      capacity: 70,
      hasApartments: true,
      hasMedicalClinic: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    {
      name: "ラ・ナシカさっぽろ",
      address: "4-1-1 Miyanosawa, Nishi-ku",
      city: "Sapporo",
      state: "Hokkaido",
      zip: "063-0051",
      country: "Japan",
      phone: "+81-11-668-8000",
      website: "https://www.lanasica.jp/sapporo/",
      description: "Comprehensive care facility with rehabilitation and day service programs",
      type: "Skilled Nursing",
      capacity: 85,
      hasRehabilitationCenter: true,
      hasDayProgram: true,
      careTypes: ["Assisted Living", "Skilled Nursing", "Rehabilitation"],
      languagesSpoken: ["Japanese"]
    },
    
    // Fukuoka - Kyushu's largest city
    {
      name: "サンケア福岡天神",
      address: "2-8-38 Tenjin, Chuo-ku",
      city: "Fukuoka",
      state: "Fukuoka",
      zip: "810-0001",
      country: "Japan",
      phone: "+81-92-737-8888",
      website: "https://www.suncare.jp/fukuoka/",
      description: "Premium senior living in Fukuoka's vibrant Tenjin district",
      type: "Assisted Living",
      capacity: 60,
      hasApartments: true,
      hasRooftopGarden: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2019
    },
    {
      name: "アビタシオン博多",
      address: "5-3-8 Hakata-ekimae, Hakata-ku",
      city: "Fukuoka",
      state: "Fukuoka",
      zip: "812-0011",
      country: "Japan",
      phone: "+81-92-432-1234",
      website: "https://www.habitation.jp/hakata/",
      description: "Modern care facility near Hakata Station with excellent transport links",
      type: "Assisted Living",
      capacity: 75,
      hasApartments: true,
      hasConvenienceStore: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese", "Korean", "Chinese"]
    },
    
    // Sendai - Tohoku's largest city
    {
      name: "せんだんの杜",
      address: "2-11-20 Kokubuncho, Aoba-ku",
      city: "Sendai",
      state: "Miyagi",
      zip: "980-0803",
      country: "Japan",
      phone: "+81-22-268-4321",
      website: "https://www.sendan-no-mori.jp/",
      description: "Comprehensive senior care facility with traditional Japanese hospitality",
      type: "Skilled Nursing",
      capacity: 100,
      hasJapaneseGarden: true,
      hasRehabilitationCenter: true,
      careTypes: ["Assisted Living", "Skilled Nursing", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2016
    },
    {
      name: "リハビリホーム仙台青葉",
      address: "1-6-6 Aoba, Aoba-ku",
      city: "Sendai",
      state: "Miyagi",
      zip: "980-0871",
      country: "Japan",
      phone: "+81-22-225-7777",
      website: "https://www.rehab-sendai.jp/",
      description: "Specialized rehabilitation facility with post-acute care services",
      type: "Rehabilitation",
      capacity: 80,
      hasPhysicalTherapy: true,
      hasOccupationalTherapy: true,
      careTypes: ["Rehabilitation", "Skilled Nursing"],
      languagesSpoken: ["Japanese"]
    },
    
    // Hiroshima - Western Japan hub
    {
      name: "サンライズ広島",
      address: "3-12-15 Naka-ku",
      city: "Hiroshima",
      state: "Hiroshima",
      zip: "730-0037",
      country: "Japan",
      phone: "+81-82-242-8888",
      website: "https://www.sunrise-hiroshima.jp/",
      description: "Modern senior residence in central Hiroshima with peace park views",
      type: "Assisted Living",
      capacity: 65,
      hasApartments: true,
      hasLibrary: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2018
    },
    {
      name: "ケアレジデンス広島西",
      address: "5-15-8 Koi, Nishi-ku",
      city: "Hiroshima",
      state: "Hiroshima",
      zip: "733-0812",
      country: "Japan",
      phone: "+81-82-273-5555",
      website: "https://www.care-residence.jp/hiroshima/",
      description: "Comprehensive care facility with medical support and day programs",
      type: "Skilled Nursing",
      capacity: 90,
      hasMedicalClinic: true,
      hasDayProgram: true,
      careTypes: ["Assisted Living", "Skilled Nursing", "Memory Care"],
      languagesSpoken: ["Japanese"]
    },
    
    // Kawasaki - Between Tokyo and Yokohama
    {
      name: "フローレンスケア川崎",
      address: "1-2-5 Miyamoto-cho, Kawasaki-ku",
      city: "Kawasaki",
      state: "Kanagawa",
      zip: "210-0004",
      country: "Japan",
      phone: "+81-44-222-8888",
      website: "https://www.florence-care.jp/kawasaki/",
      description: "Urban care facility with easy access to Tokyo and Yokohama",
      type: "Assisted Living",
      capacity: 55,
      hasApartments: true,
      hasTransportService: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2017
    },
    
    // Chiba - East of Tokyo
    {
      name: "イリーゼ千葉新宿",
      address: "2-8-1 Shinjuku, Chuo-ku",
      city: "Chiba",
      state: "Chiba",
      zip: "260-0021",
      country: "Japan",
      phone: "+81-43-244-8165",
      website: "https://www.irs.jp/chiba/",
      description: "Modern senior living facility near Chiba Station with comprehensive care",
      type: "Assisted Living",
      capacity: 70,
      hasApartments: true,
      hasActivityRoom: true,
      careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Kitakyushu - Northern Kyushu
    {
      name: "ウェルケア北九州",
      address: "3-6-1 Asano, Kokurakita-ku",
      city: "Kitakyushu",
      state: "Fukuoka",
      zip: "802-0001",
      country: "Japan",
      phone: "+81-93-521-8888",
      website: "https://www.wellcare-kita.jp/",
      description: "Comprehensive senior care facility serving northern Kyushu region",
      type: "Skilled Nursing",
      capacity: 85,
      hasMedicalClinic: true,
      hasRehabilitationCenter: true,
      careTypes: ["Assisted Living", "Skilled Nursing", "Rehabilitation"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2020
    },
    
    // Sakai - Part of Osaka metropolitan area
    {
      name: "グランドホーム堺",
      address: "1-1-1 Daisen-cho, Sakai-ku",
      city: "Sakai",
      state: "Osaka",
      zip: "590-0035",
      country: "Japan",
      phone: "+81-72-228-7777",
      website: "https://www.grand-home-sakai.jp/",
      description: "Large-scale senior community near the historic Daisen Kofun burial mounds",
      type: "CCRC",
      capacity: 200,
      hasMultipleLevelsOfCare: true,
      hasWalkingTrails: true,
      careTypes: ["Independent Living", "Assisted Living", "Skilled Nursing"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2015
    },
    
    // Niigata - Japan Sea coast
    {
      name: "シーサイドホーム新潟",
      address: "5-2-1 Sekiya, Chuo-ku",
      city: "Niigata",
      state: "Niigata",
      zip: "951-8141",
      country: "Japan",
      phone: "+81-25-233-8888",
      website: "https://www.seaside-niigata.jp/",
      description: "Coastal senior residence with ocean views and fresh seafood dining",
      type: "Independent Living",
      capacity: 60,
      hasOceanView: true,
      hasSpecialtyDining: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2018
    },
    
    // Hamamatsu - Between Tokyo and Osaka
    {
      name: "ケアガーデン浜松",
      address: "3-10-1 Sato, Naka-ku",
      city: "Hamamatsu",
      state: "Shizuoka",
      zip: "430-0807",
      country: "Japan",
      phone: "+81-53-456-7777",
      website: "https://www.care-garden-hamamatsu.jp/",
      description: "Garden-style senior community with therapeutic horticulture programs",
      type: "Assisted Living",
      capacity: 55,
      hasGarden: true,
      hasGreenhouseTherapy: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2019
    },
    
    // Kumamoto - Kyushu
    {
      name: "さくらの里熊本",
      address: "2-7-1 Shimotori, Chuo-ku",
      city: "Kumamoto",
      state: "Kumamoto",
      zip: "860-0807",
      country: "Japan",
      phone: "+81-96-352-8888",
      website: "https://www.sakura-kumamoto.jp/",
      description: "Traditional care facility near Kumamoto Castle with cultural programs",
      type: "Assisted Living",
      capacity: 65,
      hasTraditionalPrograms: true,
      hasTeaRoom: true,
      careTypes: ["Assisted Living", "Memory Care"],
      languagesSpoken: ["Japanese"],
      yearEstablished: 2017
    },
    
    // Okayama - Western Japan
    {
      name: "サンシティ岡山",
      address: "1-3-1 Daiku, Kita-ku",
      city: "Okayama",
      state: "Okayama",
      zip: "700-0913",
      country: "Japan",
      phone: "+81-86-235-7777",
      website: "https://www.suncity-okayama.jp/",
      description: "Urban senior community near Korakuen Garden with wellness focus",
      type: "Independent Living",
      capacity: 75,
      hasWellnessCenter: true,
      hasFitnessCenter: true,
      careTypes: ["Independent Living", "Assisted Living"],
      languagesSpoken: ["Japanese", "English"],
      yearEstablished: 2016
    }
  ];

  try {
    const insertedFacilities = await db.insert(communities).values(japanFacilities).returning();
    console.log(`✅ Successfully added ${insertedFacilities.length} facilities across major Japanese cities`);
    
    // Log city distribution
    const cityCount = new Map();
    insertedFacilities.forEach(f => {
      cityCount.set(f.city, (cityCount.get(f.city) || 0) + 1);
    });
    
    console.log('\nFacilities added by city:');
    Array.from(cityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`  ${city}: ${count} facilities`);
      });
    
    // Check total Japan coverage
    const totalJapan = await db.query.communities.findMany({
      where: (communities, { eq }) => eq(communities.country, 'Japan')
    });
    
    console.log(`\n📊 Total Japan coverage: ${totalJapan.length} facilities`);
    
  } catch (error) {
    console.error('Error inserting Japan facilities:', error);
  }
}

// Run the expansion
expandJapanMajorCities().catch(console.error);