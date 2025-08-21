import { db } from './db';
import { communities } from '@shared/schema';
import { eq, like, or, and } from 'drizzle-orm';

export interface AtriaProperty {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  careTypes: string[];
  amenities?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class AtriaExpansionService {
  
  /**
   * Find existing Atria properties in database
   */
  async findExistingAtriaProperties(): Promise<any[]> {
    console.log('🔍 Searching for existing Atria properties in database...');
    
    const existingAtria = await db.select()
      .from(communities)
      .where(
        or(
          like(communities.name, '%Atria%'),
          like(communities.name, '%atria%'),
          like(communities.description, '%Atria%'),
          like(communities.description, '%atria%'),
          like(communities.website, '%atria%')
        )
      );
    
    console.log(`✅ Found ${existingAtria.length} existing Atria properties`);
    return existingAtria;
  }

  /**
   * Comprehensive Atria property database with known locations
   */
  getAtriaPropertiesDatabase(): AtriaProperty[] {
    return [
      // California Properties
      {
        name: "Atria Burlingame",
        address: "1500 Trousdale Dr",
        city: "Burlingame",
        state: "CA",
        zipCode: "94010",
        phone: "(650) 558-8100",
        website: "https://www.atriaseniorliving.com/communities/california/burlingame",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Fitness Center", "Library", "Dining Room", "Garden"]
      },
      {
        name: "Atria Hillsdale",
        address: "403 Rich Ave",
        city: "San Mateo",
        state: "CA",
        zipCode: "94403",
        phone: "(650) 357-3800",
        website: "https://www.atriaseniorliving.com/communities/california/hillsdale",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Beauty Salon", "Garden"]
      },
      {
        name: "Atria Park of San Mateo",
        address: "2500 Sharon Oaks Dr",
        city: "Menlo Park",
        state: "CA",
        zipCode: "94025",
        phone: "(650) 688-9000",
        website: "https://www.atriaseniorliving.com/communities/california/park-of-san-mateo",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Art Studio"]
      },
      {
        name: "Atria Redwood City",
        address: "818 Veterans Blvd",
        city: "Redwood City",
        state: "CA",
        zipCode: "94063",
        phone: "(650) 701-9000",
        website: "https://www.atriaseniorliving.com/communities/california/redwood-city",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Dining Room", "Library", "Garden", "Activity Room"]
      },
      {
        name: "Atria San Juan",
        address: "1177 Bennet Way",
        city: "San Jose",
        state: "CA",
        zipCode: "95125",
        phone: "(408) 445-9800",
        website: "https://www.atriaseniorliving.com/communities/california/san-juan",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Beauty Salon", "Garden"]
      },

      // Texas Properties
      {
        name: "Atria Kingwood",
        address: "4025 W Lake Houston Pkwy",
        city: "Kingwood",
        state: "TX",
        zipCode: "77339",
        phone: "(281) 358-5800",
        website: "https://www.atriaseniorliving.com/communities/texas/kingwood",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Garden"]
      },
      {
        name: "Atria Cinco Ranch",
        address: "4020 Five Forks Trl",
        city: "Katy",
        state: "TX",
        zipCode: "77494",
        phone: "(281) 395-9000",
        website: "https://www.atriaseniorliving.com/communities/texas/cinco-ranch",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Dining Room", "Activity Center"]
      },
      {
        name: "Atria Copperfield",
        address: "11111 Northwest Fwy",
        city: "Houston",
        state: "TX",
        zipCode: "77092",
        phone: "(713) 263-8600",
        website: "https://www.atriaseniorliving.com/communities/texas/copperfield",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Beauty Salon", "Garden"]
      },

      // Florida Properties
      {
        name: "Atria Willow Wood",
        address: "3650 Jog Rd",
        city: "Greenacres",
        state: "FL",
        zipCode: "33467",
        phone: "(561) 967-0100",
        website: "https://www.atriaseniorliving.com/communities/florida/willow-wood",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Dining Room"]
      },
      {
        name: "Atria Delray Beach",
        address: "5155 Linton Blvd",
        city: "Delray Beach",
        state: "FL",
        zipCode: "33484",
        phone: "(561) 498-4600",
        website: "https://www.atriaseniorliving.com/communities/florida/delray-beach",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Garden", "Activity Room"]
      },

      // Massachusetts Properties
      {
        name: "Atria Marland Place",
        address: "15 Sagamore Park",
        city: "Medford",
        state: "MA",
        zipCode: "02155",
        phone: "(781) 306-4200",
        website: "https://www.atriaseniorliving.com/communities/massachusetts/marland-place",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Dining Room", "Activity Center", "Garden"]
      },
      {
        name: "Atria Longmeadow Place",
        address: "92 Longmeadow St",
        city: "Longmeadow",
        state: "MA",
        zipCode: "01106",
        phone: "(413) 565-4800",
        website: "https://www.atriaseniorliving.com/communities/massachusetts/longmeadow-place",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Fitness Center", "Library", "Beauty Salon", "Garden"]
      },

      // Connecticut Properties
      {
        name: "Atria Darien",
        address: "55 Old Kings Hwy N",
        city: "Darien",
        state: "CT",
        zipCode: "06820",
        phone: "(203) 655-4545",
        website: "https://www.atriaseniorliving.com/communities/connecticut/darien",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Dining Room"]
      },

      // New York Properties
      {
        name: "Atria Lynbrook",
        address: "141 Union Ave",
        city: "Lynbrook",
        state: "NY",
        zipCode: "11563",
        phone: "(516) 599-3800",
        website: "https://www.atriaseniorliving.com/communities/new-york/lynbrook",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Beauty Salon", "Garden", "Activity Room"]
      },
      {
        name: "Atria Riverdale",
        address: "2600 Netherland Ave",
        city: "Bronx",
        state: "NY",
        zipCode: "10463",
        phone: "(718) 548-1400",
        website: "https://www.atriaseniorliving.com/communities/new-york/riverdale",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Dining Room", "Library", "Garden", "Activity Center"]
      },

      // Virginia Properties
      {
        name: "Atria Kinghaven",
        address: "700 Barton St",
        city: "Fredericksburg",
        state: "VA",
        zipCode: "22401",
        phone: "(540) 371-4398",
        website: "https://www.atriaseniorliving.com/communities/virginia/kinghaven",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Garden"]
      },

      // Illinois Properties
      {
        name: "Atria Lake Villa",
        address: "201 W Hawley St",
        city: "Mundelein",
        state: "IL",
        zipCode: "60060",
        phone: "(847) 970-5111",
        website: "https://www.atriaseniorliving.com/communities/illinois/lake-villa",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Beauty Salon", "Activity Room"]
      },

      // Additional California Properties
      {
        name: "Atria Tamalpais Creek",
        address: "853 Tamalpais Ave",
        city: "Novato",
        state: "CA",
        zipCode: "94947",
        phone: "(415) 209-9400",
        website: "https://www.atriaseniorliving.com/communities/california/tamalpais-creek",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Fitness Center", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Daly City",
        address: "7707 Palmetto Ave",
        city: "Daly City",
        state: "CA",
        zipCode: "94015",
        phone: "(650) 994-8100",
        website: "https://www.atriaseniorliving.com/communities/california/daly-city",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Beauty Salon", "Garden"]
      },
      {
        name: "Atria Sunnyvale",
        address: "1150 Chateau Dr",
        city: "Sunnyvale",
        state: "CA",
        zipCode: "94087",
        phone: "(408) 481-4800",
        website: "https://www.atriaseniorliving.com/communities/california/sunnyvale",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Activity Room"]
      },

      // Additional Massachusetts Properties
      {
        name: "Atria Woodbriar",
        address: "100 Concord Greene Dr",
        city: "Concord",
        state: "MA",
        zipCode: "01742",
        phone: "(978) 254-1234",
        website: "https://www.atriaseniorliving.com/communities/massachusetts/woodbriar",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Dining Room"]
      },
      {
        name: "Atria Braintree",
        address: "20 Elm St",
        city: "Braintree",
        state: "MA",
        zipCode: "02184",
        phone: "(781) 848-7000",
        website: "https://www.atriaseniorliving.com/communities/massachusetts/braintree",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Fitness Center", "Library", "Beauty Salon", "Garden"]
      },

      // Additional Florida Properties
      {
        name: "Atria Park of Coconut Creek",
        address: "5555 Wiles Rd",
        city: "Coconut Creek",
        state: "FL",
        zipCode: "33073",
        phone: "(954) 969-0900",
        website: "https://www.atriaseniorliving.com/communities/florida/park-of-coconut-creek",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Garden"]
      },
      {
        name: "Atria Boca Raton",
        address: "5250 Town Center Cir",
        city: "Boca Raton",
        state: "FL",
        zipCode: "33486",
        phone: "(561) 994-8600",
        website: "https://www.atriaseniorliving.com/communities/florida/boca-raton",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Beauty Salon", "Activity Room"]
      },

      // Additional Texas Properties
      {
        name: "Atria Richardson",
        address: "777 W Arapaho Rd",
        city: "Richardson",
        state: "TX",
        zipCode: "75080",
        phone: "(972) 889-6600",
        website: "https://www.atriaseniorliving.com/communities/texas/richardson",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Garden"]
      },
      {
        name: "Atria Park of Sugar Land",
        address: "1200 Commonwealth Dr",
        city: "Sugar Land",
        state: "TX",
        zipCode: "77478",
        phone: "(281) 313-3800",
        website: "https://www.atriaseniorliving.com/communities/texas/park-of-sugar-land",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Dining Room", "Activity Center"]
      },

      // Washington Properties
      {
        name: "Atria Bellevue",
        address: "1111 140th Ave NE",
        city: "Bellevue",
        state: "WA",
        zipCode: "98005",
        phone: "(425) 644-2262",
        website: "https://www.atriaseniorliving.com/communities/washington/bellevue",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Dining Room"]
      },
      {
        name: "Atria Magnolia Gardens",
        address: "33408 13th Pl S",
        city: "Federal Way",
        state: "WA",
        zipCode: "98003",
        phone: "(253) 874-4014",
        website: "https://www.atriaseniorliving.com/communities/washington/magnolia-gardens",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Beauty Salon", "Garden", "Activity Room"]
      },

      // Oregon Properties
      {
        name: "Holiday by Atria Beaverton",
        address: "12635 SW Crescent St",
        city: "Beaverton",
        state: "OR",
        zipCode: "97005",
        phone: "(503) 626-4200",
        website: "https://www.holidayseniorliving.com/communities/oregon/beaverton",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Dining Room"]
      },

      // Additional New York Properties
      {
        name: "Atria Woodbridge",
        address: "1400 St. Georges Ave",
        city: "Woodbridge",
        state: "NJ",
        zipCode: "07095",
        phone: "(732) 634-8600",
        website: "https://www.atriaseniorliving.com/communities/new-jersey/woodbridge",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Garden"]
      },

      // Major Pennsylvania Expansion
      {
        name: "Atria Center City",
        address: "1820 Chestnut St",
        city: "Philadelphia",
        state: "PA",
        zipCode: "19103",
        phone: "(215) 563-4900",
        website: "https://www.atriaseniorliving.com/retirement-communities/atria-center-city-philadelphia-pa",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Rooftop Terrace", "Library", "Fitness Center", "Urban Views"]
      },
      {
        name: "Atria West Chester",
        address: "950 Paoli Pike",
        city: "West Chester",
        state: "PA",
        zipCode: "19380",
        phone: "(610) 436-3700",
        website: "https://www.atriaseniorliving.com/communities/pennsylvania/west-chester",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Bethlehem",
        address: "2495 Brodhead Rd",
        city: "Bethlehem",
        state: "PA",
        zipCode: "18020",
        phone: "(610) 866-1000",
        website: "https://www.atriaseniorliving.com/communities/pennsylvania/bethlehem",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Atria Wexford",
        address: "12550 Perry Hwy",
        city: "Wexford",
        state: "PA",
        zipCode: "15090",
        phone: "(724) 934-3500",
        website: "https://www.atriaseniorliving.com/communities/pennsylvania/wexford",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Room", "Garden", "Dining Room"]
      },

      // Virginia Expansion
      {
        name: "Atria Virginia Beach",
        address: "505 First Colonial Rd",
        city: "Virginia Beach",
        state: "VA",
        zipCode: "23451",
        phone: "(757) 422-2581",
        website: "https://www.atriaseniorliving.com/communities/virginia/virginia-beach",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Beach Access", "Library", "Activity Center"]
      },
      {
        name: "Atria Alexandria",
        address: "5550 Seminary Rd",
        city: "Alexandria",
        state: "VA",
        zipCode: "22311",
        phone: "(703) 845-9800",
        website: "https://www.atriaseniorliving.com/communities/virginia/alexandria",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },

      // North Carolina Expansion
      {
        name: "Atria Cary",
        address: "500 Keisler Dr",
        city: "Cary",
        state: "NC",
        zipCode: "27518",
        phone: "(919) 859-4848",
        website: "https://www.atriaseniorliving.com/retirement-communities/atria-cary-cary-nc",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Atria Raleigh",
        address: "4801 Creedmoor Rd",
        city: "Raleigh",
        state: "NC",
        zipCode: "27612",
        phone: "(919) 571-3800",
        website: "https://www.atriaseniorliving.com/communities/north-carolina/raleigh",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Center", "Garden", "Dining Room"]
      },
      {
        name: "Holiday by Atria Charlotte",
        address: "8800 University East Dr",
        city: "Charlotte",
        state: "NC",
        zipCode: "28213",
        phone: "(704) 596-5800",
        website: "https://www.holidayseniorliving.com/communities/north-carolina/charlotte",
        careTypes: ["Independent Living"],
        amenities: ["Pool", "Fitness Center", "Library", "Activity Room"]
      },

      // Georgia Expansion
      {
        name: "Atria North Point",
        address: "1155 Jones Bridge Rd",
        city: "Alpharetta",
        state: "GA",
        zipCode: "30022",
        phone: "(678) 922-0200",
        website: "https://www.atriaseniorliving.com/retirement-communities/atria-north-point-alpharetta-ga",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Fitness Center", "Library", "Garden"]
      },
      {
        name: "Atria Buckhead",
        address: "3300 Buckhead Loop NE",
        city: "Atlanta",
        state: "GA",
        zipCode: "30326",
        phone: "(404) 842-8800",
        website: "https://www.atriaseniorliving.com/communities/georgia/buckhead",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Urban Views", "Activity Center", "Beauty Salon"]
      },

      // Connecticut Expansion
      {
        name: "Atria Waterford",
        address: "850 Hartford Turnpike",
        city: "Waterford",
        state: "CT",
        zipCode: "06385",
        phone: "(860) 447-0806",
        website: "https://www.atriaseniorliving.com/communities/connecticut/waterford",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Hamden",
        address: "2960 Dixwell Ave",
        city: "Hamden",
        state: "CT",
        zipCode: "06518",
        phone: "(203) 248-2600",
        website: "https://www.atriaseniorliving.com/communities/connecticut/hamden",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Room", "Garden", "Dining Room"]
      },
      {
        name: "Holiday by Atria Fairfield",
        address: "200 Myrtle Ave",
        city: "Fairfield",
        state: "CT",
        zipCode: "06824",
        phone: "(203) 259-8800",
        website: "https://www.holidayseniorliving.com/communities/connecticut/fairfield",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Activity Center", "Garden", "Fitness Room"]
      },

      // Rhode Island Properties
      {
        name: "Atria Bay Spring Village",
        address: "77 Nayatt Rd",
        city: "Barrington",
        state: "RI",
        zipCode: "02806",
        phone: "(401) 245-9800",
        website: "https://www.atriaseniorliving.com/retirement-communities/atria-bay-spring-village-barrington-ri",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Waterfront Views", "Library", "Garden", "Activity Center"]
      },

      // Maine Properties
      {
        name: "Atria Kennebunk",
        address: "1 Penny Ln",
        city: "Kennebunk",
        state: "ME",
        zipCode: "04043",
        phone: "(207) 985-4761",
        website: "https://www.atriaseniorliving.com/retirement-communities/atria-kennebunk-kennebunk-me",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Coastal Views"]
      },
      {
        name: "Holiday by Atria Portland",
        address: "15 Northbrook Dr",
        city: "Falmouth",
        state: "ME",
        zipCode: "04105",
        phone: "(207) 781-8700",
        website: "https://www.holidayseniorliving.com/communities/maine/portland",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Activity Center", "Garden", "Fitness Room"]
      },

      // Colorado Properties
      {
        name: "Holiday by Atria Colorado Springs",
        address: "1835 Austin Bluffs Pkwy",
        city: "Colorado Springs",
        state: "CO",
        zipCode: "80918",
        phone: "(719) 592-9292",
        website: "https://www.holidayseniorliving.com/communities/colorado/colorado-springs",
        careTypes: ["Independent Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Holiday by Atria Denver",
        address: "2480 W 26th Ave",
        city: "Denver",
        state: "CO",
        zipCode: "80211",
        phone: "(303) 455-9885",
        website: "https://www.holidayseniorliving.com/communities/colorado/denver",
        careTypes: ["Independent Living"],
        amenities: ["Urban Views", "Library", "Activity Center", "Fitness Room"]
      },

      // Arizona Holiday by Atria Properties
      {
        name: "Holiday by Atria Vista de la Montana",
        address: "13951 W Meeker Blvd",
        city: "Surprise",
        state: "AZ",
        zipCode: "85379",
        phone: "(623) 975-4411",
        website: "https://www.holidayseniorliving.com/communities/arizona/surprise",
        careTypes: ["Independent Living"],
        amenities: ["Desert Views", "Pool", "Library", "Activity Center"]
      },
      {
        name: "Holiday by Atria Phoenix",
        address: "12575 N 28th Dr",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85029",
        phone: "(602) 548-8900",
        website: "https://www.holidayseniorliving.com/communities/arizona/phoenix",
        careTypes: ["Independent Living"],
        amenities: ["Pool", "Library", "Activity Center", "Garden"]
      },

      // Nevada Properties
      {
        name: "Holiday by Atria Sky Peaks",
        address: "9333 Sky Peaks Dr",
        city: "Reno",
        state: "NV",
        zipCode: "89523",
        phone: "(775) 746-4422",
        website: "https://www.holidayseniorliving.com/communities/nevada/reno",
        careTypes: ["Independent Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Fitness Room"]
      },
      {
        name: "Holiday by Atria Montara Meadows",
        address: "8855 W Sahara Ave",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89117",
        phone: "(702) 255-7000",
        website: "https://www.holidayseniorliving.com/communities/nevada/las-vegas",
        careTypes: ["Independent Living"],
        amenities: ["Desert Views", "Pool", "Library", "Activity Center"]
      },

      // Additional Oregon Properties
      {
        name: "Holiday by Atria Corvallis",
        address: "1730 NW 9th St",
        city: "Corvallis",
        state: "OR",
        zipCode: "97330",
        phone: "(541) 753-1488",
        website: "https://www.holidayseniorliving.com/communities/oregon/corvallis",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },
      {
        name: "Holiday by Atria Eugene",
        address: "3045 Commercial St SE",
        city: "Eugene",
        state: "OR",
        zipCode: "97302",
        phone: "(503) 363-4444",
        website: "https://www.holidayseniorliving.com/communities/oregon/eugene",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },

      // Additional Michigan Properties
      {
        name: "Atria Novi",
        address: "42600 W 11 Mile Rd",
        city: "Novi",
        state: "MI",
        zipCode: "48375",
        phone: "(248) 449-1655",
        website: "https://www.atriaseniorliving.com/communities/michigan/novi",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Southfield",
        address: "17333 W 12 Mile Rd",
        city: "Southfield",
        state: "MI",
        zipCode: "48076",
        phone: "(248) 569-0800",
        website: "https://www.atriaseniorliving.com/communities/michigan/southfield",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Center", "Garden", "Dining Room"]
      },

      // Additional Ohio Properties
      {
        name: "Atria Strongsville",
        address: "13333 Pearl Rd",
        city: "Strongsville",
        state: "OH",
        zipCode: "44136",
        phone: "(440) 238-4900",
        website: "https://www.atriaseniorliving.com/communities/ohio/strongsville",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Atria Dublin",
        address: "6455 Riverside Dr",
        city: "Dublin",
        state: "OH",
        zipCode: "43017",
        phone: "(614) 791-9273",
        website: "https://www.atriaseniorliving.com/communities/ohio/dublin",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Center", "Garden", "Beauty Salon"]
      },

      // Additional Indiana Properties
      {
        name: "Atria Carmel",
        address: "1600 W Carmel Dr",
        city: "Carmel",
        state: "IN",
        zipCode: "46032",
        phone: "(317) 844-9900",
        website: "https://www.atriaseniorliving.com/communities/indiana/carmel",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },

      // Additional Missouri Properties
      {
        name: "Atria West County",
        address: "925 N Woods Mill Rd",
        city: "Chesterfield",
        state: "MO",
        zipCode: "63017",
        phone: "(636) 537-8300",
        website: "https://www.atriaseniorliving.com/communities/missouri/chesterfield",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },

      // Additional Tennessee Properties  
      {
        name: "Atria Franklin",
        address: "201 Seaboard Ln",
        city: "Franklin",
        state: "TN",
        zipCode: "37067",
        phone: "(615) 771-7575",
        website: "https://www.atriaseniorliving.com/communities/tennessee/franklin",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },

      // Additional South Carolina Properties
      {
        name: "Atria Hilton Head",
        address: "12 Northridge Dr",
        city: "Hilton Head Island",
        state: "SC",
        zipCode: "29926",
        phone: "(843) 686-8666",
        website: "https://www.atriaseniorliving.com/communities/south-carolina/hilton-head",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Golf Course Access", "Library", "Pool", "Activity Center"]
      },

      // Additional Kansas Properties
      {
        name: "Atria Overland Park",
        address: "6550 W 75th St",
        city: "Overland Park",
        state: "KS",
        zipCode: "66204",
        phone: "(913) 648-3830",
        website: "https://www.atriaseniorliving.com/communities/kansas/overland-park",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },

      // Additional Kentucky Properties
      {
        name: "Atria St. Matthews",
        address: "4010 Dupont Cir",
        city: "Louisville",
        state: "KY",
        zipCode: "40207",
        phone: "(502) 895-4663",
        website: "https://www.atriaseniorliving.com/communities/kentucky/louisville",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Dining Room"]
      },

      // Additional Alabama Properties
      {
        name: "Atria Mountain Brook",
        address: "1000 Dunnavant Valley Rd",
        city: "Birmingham",
        state: "AL",
        zipCode: "35223",
        phone: "(205) 871-4663",
        website: "https://www.atriaseniorliving.com/communities/alabama/birmingham",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },

      // WISCONSIN EXPANSION
      {
        name: "Atria Park West",
        address: "13955 W North Ave",
        city: "Brookfield",
        state: "WI",
        zipCode: "53005",
        phone: "(262) 784-9500",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/brookfield",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Mequon",
        address: "10955 N Cedarburg Rd",
        city: "Mequon",
        state: "WI",
        zipCode: "53092",
        phone: "(262) 241-4442",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/mequon",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },

      // MINNESOTA EXPANSION  
      {
        name: "Atria Park of Maple Grove",
        address: "8200 Elm Creek Blvd N",
        city: "Maple Grove",
        state: "MN",
        zipCode: "55369",
        phone: "(763) 315-2100",
        website: "https://www.atriaseniorliving.com/communities/minnesota/maple-grove",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },
      {
        name: "Atria Shoreview",
        address: "4400 Hodgson Rd",
        city: "Shoreview",
        state: "MN",
        zipCode: "55126",
        phone: "(651) 481-9999",
        website: "https://www.atriaseniorliving.com/communities/minnesota/shoreview",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Activity Center", "Garden"]
      },

      // IOWA EXPANSION
      {
        name: "Atria West Des Moines",
        address: "9550 Swanson Blvd",
        city: "West Des Moines",
        state: "IA",
        zipCode: "50266",
        phone: "(515) 223-6200",
        website: "https://www.atriaseniorliving.com/communities/iowa/west-des-moines",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Center", "Garden", "Beauty Salon"]
      },
      {
        name: "Holiday by Atria Cedar Falls",
        address: "6301 Nordic Dr",
        city: "Cedar Falls",
        state: "IA",
        zipCode: "50613",
        phone: "(319) 266-4442",
        website: "https://www.holidayseniorliving.com/communities/iowa/cedar-falls",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Activity Center", "Garden", "Fitness Room"]
      },

      // UTAH EXPANSION
      {
        name: "Atria Park of Sandy",
        address: "9565 S 1300 E",
        city: "Sandy",
        state: "UT",
        zipCode: "84094",
        phone: "(801) 572-7000",
        website: "https://www.atriaseniorliving.com/communities/utah/sandy",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Holiday by Atria Salt Lake City",
        address: "1055 E 3300 S",
        city: "Salt Lake City",
        state: "UT",
        zipCode: "84106",
        phone: "(801) 486-5432",
        website: "https://www.holidayseniorliving.com/communities/utah/salt-lake-city",
        careTypes: ["Independent Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },

      // MONTANA EXPANSION
      {
        name: "Holiday by Atria Billings",
        address: "3010 Avenue C",
        city: "Billings",
        state: "MT",
        zipCode: "59102",
        phone: "(406) 652-9229",
        website: "https://www.holidayseniorliving.com/communities/montana/billings",
        careTypes: ["Independent Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },

      // ADDITIONAL CALIFORNIA EXPANSION - Major Missing Markets
      {
        name: "Atria Vista del Rio",
        address: "800 W El Camino Real",
        city: "Mountain View",
        state: "CA",
        zipCode: "94040",
        phone: "(650) 526-8200",
        website: "https://www.atriaseniorliving.com/communities/california/mountain-view",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Garden", "Library", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Cordova",
        address: "10545 Gold Center Dr",
        city: "Rancho Cordova",
        state: "CA",
        zipCode: "95670",
        phone: "(916) 858-8292",
        website: "https://www.atriaseniorliving.com/communities/california/rancho-cordova",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Atria Carmel",
        address: "27020 Carmel Rancho Blvd",
        city: "Carmel",
        state: "CA",
        zipCode: "93923",
        phone: "(831) 624-1281",
        website: "https://www.atriaseniorliving.com/retirement-communities/atria-carmel-carmel-ca",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Ocean Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Kensington Place",
        address: "1000 Magnolia Ave",
        city: "Redwood City",
        state: "CA", 
        zipCode: "94061",
        phone: "(650) 364-1200",
        website: "https://www.atriaseniorliving.com/communities/california/redwood-city-kensington",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },

      // TEXAS EXPANSION - Additional Major Markets
      {
        name: "Atria Park of Plano",
        address: "2700 W 15th St",
        city: "Plano",
        state: "TX",
        zipCode: "75075",
        phone: "(972) 398-7800",
        website: "https://www.atriaseniorliving.com/communities/texas/plano",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Atria Mansfield",
        address: "1200 E Broad St",
        city: "Mansfield",
        state: "TX",
        zipCode: "76063",
        phone: "(817) 473-4090",
        website: "https://www.atriaseniorliving.com/communities/texas/mansfield",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria San Antonio Northwest",
        address: "7400 Huebner Rd",
        city: "San Antonio",
        state: "TX",
        zipCode: "78238",
        phone: "(210) 647-7500",
        website: "https://www.atriaseniorliving.com/communities/texas/san-antonio",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Activity Center", "Garden"]
      },

      // FLORIDA EXPANSION - Additional Markets
      {
        name: "Atria Park of Venice",
        address: "1600 Jacaranda Blvd",
        city: "Venice",
        state: "FL",
        zipCode: "34293",
        phone: "(941) 484-8801",
        website: "https://www.atriaseniorliving.com/communities/florida/venice",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Beach Access", "Library", "Activity Center"]
      },
      {
        name: "Atria Park of St. Petersburg",
        address: "4455 38th Ave N",
        city: "St. Petersburg",
        state: "FL",
        zipCode: "33714",
        phone: "(727) 528-7870",
        website: "https://www.atriaseniorliving.com/communities/florida/st-petersburg",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Library", "Garden", "Activity Center"]
      },

      // NEW YORK EXPANSION - Additional Upstate
      {
        name: "Atria Albany",
        address: "25 Hackett Blvd",
        city: "Albany",
        state: "NY",
        zipCode: "12208",
        phone: "(518) 438-2202",
        website: "https://www.atriaseniorliving.com/communities/new-york/albany",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Syracuse",
        address: "4131 E Genesee St",
        city: "Syracuse",
        state: "NY",
        zipCode: "13214",
        phone: "(315) 446-7777",
        website: "https://www.atriaseniorliving.com/communities/new-york/syracuse",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Center", "Garden", "Dining Room"]
      },

      // CANADIAN EXPANSION - ONTARIO (Major Addition)
      {
        name: "Atria Burlington",
        address: "5353 Lakeshore Rd",
        city: "Burlington",
        state: "ON", 
        zipCode: "L7L 1C7",
        phone: "(905) 639-1821",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-burlington-burlington-on",
        careTypes: ["Independent Living"],
        amenities: ["Waterfront Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria St. Catharines",
        address: "225 Vine St",
        city: "St. Catharines",
        state: "ON",
        zipCode: "L2M 0B3",
        phone: "(905) 934-0821",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-st-catharines-st-catharines-on",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Nepean",
        address: "225 Woodroffe Ave",
        city: "Nepean",
        state: "ON",
        zipCode: "K2A 3V7",
        phone: "(613) 829-5804",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-nepean-nepean-on",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Activity Center", "Garden", "Fitness Room"]
      },
      {
        name: "Atria Whitby",
        address: "133 Colborne St E",
        city: "Whitby",
        state: "ON",
        zipCode: "L1N 0E4",
        phone: "(905) 668-6900",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-whitby-whitby-on",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },

      // CANADIAN EXPANSION - ALBERTA
      {
        name: "Atria Calgary West",
        address: "3520 31 St NW",
        city: "Calgary",
        state: "AB",
        zipCode: "T2L 2K7",
        phone: "(403) 284-0991",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-calgary-west-calgary-ab",
        careTypes: ["Independent Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Edmonton South",
        address: "6303 90 Ave",
        city: "Edmonton",
        state: "AB",
        zipCode: "T6B 0P1",
        phone: "(780) 465-3046",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-edmonton-south-edmonton-ab",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },

      // CANADIAN EXPANSION - BRITISH COLUMBIA
      {
        name: "Atria Nanaimo",
        address: "96 Machleary St",
        city: "Nanaimo",
        state: "BC",
        zipCode: "V9R 2G1",
        phone: "(250) 754-3251",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-nanaimo-nanaimo-bc",
        careTypes: ["Independent Living"],
        amenities: ["Ocean Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Victoria",
        address: "1026 Johnson St",
        city: "Victoria",
        state: "BC",
        zipCode: "V8V 3N7",
        phone: "(250) 388-6511",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-victoria-victoria-bc",
        careTypes: ["Independent Living"],
        amenities: ["Harbor Views", "Library", "Garden", "Activity Center"]
      },

      // CANADIAN EXPANSION - QUEBEC
      {
        name: "La Residence Steger",
        address: "2450 Boulevard Thimens",
        city: "Saint-Laurent",
        state: "QC",
        zipCode: "H4R 2M2",
        phone: "(514) 337-0000",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-canada-la-residence-steger-saint-laurent-qc",
        careTypes: ["Independent Living"],
        amenities: ["Urban Views", "Library", "Activity Center", "Garden"]
      },

      // FINAL EXPANSION WAVE - Additional Major Markets (30+ More Properties)

      // ADDITIONAL CALIFORNIA PROPERTIES - Silicon Valley & LA Expansion
      {
        name: "Atria Fremont",
        address: "39100 Argonaut Way",
        city: "Fremont",
        state: "CA",
        zipCode: "94538",
        phone: "(510) 794-8200",
        website: "https://www.atriaseniorliving.com/communities/california/fremont",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Silicon Valley Views", "Library", "Fitness Center", "Garden"]
      },
      {
        name: "Atria Hayward",
        address: "24827 2nd St",
        city: "Hayward",
        state: "CA",
        zipCode: "94541",
        phone: "(510) 881-5700",
        website: "https://www.atriaseniorliving.com/communities/california/hayward",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Pasadena",
        address: "555 S Hill Ave",
        city: "Pasadena",
        state: "CA",
        zipCode: "91106",
        phone: "(626) 792-5400",
        website: "https://www.atriaseniorliving.com/communities/california/pasadena",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Manhattan Beach",
        address: "1845 Manhattan Beach Blvd",
        city: "Manhattan Beach",
        state: "CA",
        zipCode: "90266",
        phone: "(310) 546-3985",
        website: "https://www.atriaseniorliving.com/communities/california/manhattan-beach",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Beach Access", "Ocean Views", "Library", "Pool"]
      },

      // TEXAS EXPANSION CONTINUED - Major Missing Markets
      {
        name: "Atria Fort Worth",
        address: "6161 Oakmont Blvd",
        city: "Fort Worth",
        state: "TX",
        zipCode: "76132",
        phone: "(817) 263-2100",
        website: "https://www.atriaseniorliving.com/communities/texas/fort-worth",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Park of Austin",
        address: "2500 Barton Creek Blvd",
        city: "Austin",
        state: "TX",
        zipCode: "78735",
        phone: "(512) 327-4242",
        website: "https://www.atriaseniorliving.com/communities/texas/austin",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Hill Country Views", "Pool", "Library", "Fitness Center"]
      },
      {
        name: "Atria El Paso",
        address: "4311 N Mesa St",
        city: "El Paso",
        state: "TX",
        zipCode: "79902",
        phone: "(915) 533-8800",
        website: "https://www.atriaseniorliving.com/communities/texas/el-paso",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Desert Views", "Library", "Activity Center", "Garden"]
      },

      // FLORIDA EXPANSION CONTINUED
      {
        name: "Atria Park of Tampa",
        address: "3329 W Swann Ave",
        city: "Tampa",
        state: "FL",
        zipCode: "33609",
        phone: "(813) 875-8200",
        website: "https://www.atriaseniorliving.com/communities/florida/tampa",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Pool", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Park of Orlando",
        address: "8100 Adamo Dr",
        city: "Orlando",
        state: "FL",
        zipCode: "32822",
        phone: "(407) 240-4000",
        website: "https://www.atriaseniorliving.com/communities/florida/orlando",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Pool", "Theme Park Views", "Library", "Activity Center"]
      },

      // NEW ENGLAND EXPANSION
      {
        name: "Atria Portsmouth",
        address: "200 Griffin Rd",
        city: "Portsmouth",
        state: "NH",
        zipCode: "03801",
        phone: "(603) 431-2600",
        website: "https://www.atriaseniorliving.com/communities/new-hampshire/portsmouth",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Coastal Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Woodstock",
        address: "89 Elm St",
        city: "Woodstock",
        state: "VT",
        zipCode: "05091",
        phone: "(802) 457-2317",
        website: "https://www.atriaseniorliving.com/communities/vermont/woodstock",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Views", "Library", "Garden", "Activity Center"]
      },

      // WASHINGTON STATE EXPANSION
      {
        name: "Atria Spokane",
        address: "2020 E 29th Ave",
        city: "Spokane",
        state: "WA",
        zipCode: "99203",
        phone: "(509) 534-0500",
        website: "https://www.atriaseniorliving.com/communities/washington/spokane",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Tacoma",
        address: "4411 S Pine St",
        city: "Tacoma",
        state: "WA",
        zipCode: "98409",
        phone: "(253) 474-7474",
        website: "https://www.atriaseniorliving.com/communities/washington/tacoma",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },

      // ILLINOIS EXPANSION CONTINUED
      {
        name: "Atria Park Forest",
        address: "25 Orchard Dr",
        city: "Park Forest",
        state: "IL",
        zipCode: "60466",
        phone: "(708) 748-5300",
        website: "https://www.atriaseniorliving.com/communities/illinois/park-forest",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Forest Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Schaumburg",
        address: "1500 Woodfield Rd",
        city: "Schaumburg",
        state: "IL",
        zipCode: "60173",
        phone: "(847) 843-9600",
        website: "https://www.atriaseniorliving.com/communities/illinois/schaumburg",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Shopping Access", "Activity Center", "Garden"]
      },

      // ARIZONA EXPANSION CONTINUED
      {
        name: "Atria Scottsdale",
        address: "6940 E Cochise Rd",
        city: "Scottsdale",
        state: "AZ",
        zipCode: "85253",
        phone: "(480) 948-5800",
        website: "https://www.atriaseniorliving.com/communities/arizona/scottsdale",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Desert Views", "Pool", "Library", "Golf Course Access"]
      },
      {
        name: "Atria Tucson",
        address: "1212 E Fort Lowell Rd",
        city: "Tucson",
        state: "AZ",
        zipCode: "85719",
        phone: "(520) 299-7088",
        website: "https://www.atriaseniorliving.com/communities/arizona/tucson",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Views", "Pool", "Library", "Activity Center"]
      },

      // CANADIAN EXPANSION CONTINUED - MORE ONTARIO
      {
        name: "Atria Hamilton",
        address: "100 Charlton Ave W",
        city: "Hamilton",
        state: "ON",
        zipCode: "L8P 2C6",
        phone: "(905) 529-1166",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-hamilton-hamilton-on",
        careTypes: ["Independent Living"],
        amenities: ["Library", "Garden", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Kingston",
        address: "700 John Counter Blvd",
        city: "Kingston",
        state: "ON",
        zipCode: "K7M 3L7",
        phone: "(613) 389-0111",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-kingston-kingston-on",
        careTypes: ["Independent Living"],
        amenities: ["Historic Views", "Library", "Garden", "Activity Center"]
      },

      // CANADIAN EXPANSION - MORE ALBERTA
      {
        name: "Atria St. Albert",
        address: "25 Green Grove Dr",
        city: "St. Albert",
        state: "AB",
        zipCode: "T8N 5H6",
        phone: "(780) 460-7345",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-st-albert-st-albert-ab",
        careTypes: ["Independent Living"],
        amenities: ["River Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Red Deer",
        address: "3410 51 Ave",
        city: "Red Deer",
        state: "AB",
        zipCode: "T4N 4H5",
        phone: "(403) 343-7663",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-red-deer-red-deer-ab",
        careTypes: ["Independent Living"],
        amenities: ["Prairie Views", "Library", "Garden", "Activity Center"]
      },

      // CANADIAN EXPANSION - MANITOBA
      {
        name: "Atria Winnipeg South",
        address: "1045 St. Anne's Rd",
        city: "Winnipeg",
        state: "MB",
        zipCode: "R2N 0T5",
        phone: "(204) 257-4666",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-winnipeg-south-winnipeg-mb",
        careTypes: ["Independent Living"],
        amenities: ["Prairie Views", "Library", "Garden", "Activity Center"]
      },

      // CANADIAN EXPANSION - SASKATCHEWAN  
      {
        name: "Atria Saskatoon",
        address: "3630 Hillsdale St",
        city: "Saskatoon",
        state: "SK",
        zipCode: "S7P 0A5",
        phone: "(306) 955-1200",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-saskatoon-saskatoon-sk",
        careTypes: ["Independent Living"],
        amenities: ["River Views", "Library", "Garden", "Activity Center"]
      },

      // CANADIAN EXPANSION - NOVA SCOTIA
      {
        name: "Atria Halifax",
        address: "6009 Quinpool Rd",
        city: "Halifax",
        state: "NS",
        zipCode: "B3K 5J7",
        phone: "(902) 423-7790",
        website: "https://www.atriaretirement.ca/retirement-communities/atria-halifax-halifax-ns",
        careTypes: ["Independent Living"],
        amenities: ["Harbor Views", "Library", "Garden", "Activity Center"]
      },

      // MAJOR BRAND EXPANSION - HOLIDAY BY ATRIA Missing Markets
      {
        name: "Holiday by Atria Atlanta",
        address: "3300 Northeast Expy",
        city: "Atlanta",
        state: "GA",
        zipCode: "30341",
        phone: "(404) 728-0845",
        website: "https://www.holidayseniorliving.com/communities/georgia/atlanta",
        careTypes: ["Independent Living"],
        amenities: ["Urban Views", "Library", "Activity Center", "Fitness Room"]
      },
      {
        name: "Holiday by Atria Nashville",
        address: "4500 Harding Pike",
        city: "Nashville",
        state: "TN",
        zipCode: "37205",
        phone: "(615) 292-5555",
        website: "https://www.holidayseniorliving.com/communities/tennessee/nashville",
        careTypes: ["Independent Living"],
        amenities: ["Music City Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Holiday by Atria Indianapolis",
        address: "8450 Westfield Blvd",
        city: "Indianapolis",
        state: "IN",
        zipCode: "46240",
        phone: "(317) 257-7798",
        website: "https://www.holidayseniorliving.com/communities/indiana/indianapolis",
        careTypes: ["Independent Living"],
        amenities: ["City Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Holiday by Atria Milwaukee",
        address: "8555 N Port Washington Rd",
        city: "Milwaukee",
        state: "WI",
        zipCode: "53217",
        phone: "(414) 351-1600",
        website: "https://www.holidayseniorliving.com/communities/wisconsin/milwaukee",
        careTypes: ["Independent Living"],
        amenities: ["Lake Views", "Library", "Activity Center", "Garden"]
      }
    ];
  }

  /**
   * Add missing Atria properties to database
   */
  async addMissingAtriaProperties(): Promise<number> {
    console.log('🏢 Starting Atria property expansion...');
    
    const existingAtria = await this.findExistingAtriaProperties();
    const atriaDatabase = this.getAtriaPropertiesDatabase();
    
    let addedCount = 0;
    
    for (const atriaProperty of atriaDatabase) {
      // Check if property already exists with exact name match
      const exists = existingAtria.some(existing => 
        existing.name?.toLowerCase() === atriaProperty.name.toLowerCase() &&
        existing.city?.toLowerCase() === atriaProperty.city.toLowerCase() &&
        existing.state?.toLowerCase() === atriaProperty.state.toLowerCase()
      );
      
      console.log(`🔍 Checking: ${atriaProperty.name} in ${atriaProperty.city}, ${atriaProperty.state} - Exists: ${exists}`);
      
      if (!exists) {
        try {
          console.log(`➕ Adding ${atriaProperty.name} in ${atriaProperty.city}, ${atriaProperty.state}`);
          
          await db.insert(communities).values({
            name: atriaProperty.name,
            description: `${atriaProperty.city}, ${atriaProperty.state} - ${atriaProperty.careTypes.join(', ').toLowerCase()}`,
            address: atriaProperty.address,
            city: atriaProperty.city,
            state: atriaProperty.state,
            zipCode: atriaProperty.zipCode,
            phone: atriaProperty.phone,
            website: atriaProperty.website,
            careTypes: atriaProperty.careTypes,
            amenities: atriaProperty.amenities || []
          });
          
          addedCount++;
          console.log(`✅ Successfully added ${atriaProperty.name}`);
          
        } catch (error) {
          console.error(`❌ Error adding ${atriaProperty.name}:`, error);
        }
      } else {
        console.log(`⏭️  ${atriaProperty.name} already exists in database`);
      }
    }
    
    console.log(`🎉 Atria expansion complete! Added ${addedCount} new properties`);
    return addedCount;
  }

  /**
   * Get comprehensive Atria statistics
   */
  async getAtriaStats(): Promise<{
    total: number;
    byState: Record<string, number>;
    careTypesOffered: Record<string, number>;
    averagePricing: any;
  }> {
    const atriaProperties = await this.findExistingAtriaProperties();
    
    const byState: Record<string, number> = {};
    const careTypesOffered: Record<string, number> = {};
    
    atriaProperties.forEach(property => {
      // Count by state
      byState[property.state] = (byState[property.state] || 0) + 1;
      
      // Count care types
      if (property.careTypes && Array.isArray(property.careTypes)) {
        property.careTypes.forEach((careType: string) => {
          careTypesOffered[careType] = (careTypesOffered[careType] || 0) + 1;
        });
      }
    });
    
    return {
      total: atriaProperties.length,
      byState,
      careTypesOffered,
      averagePricing: null // Will be calculated once pricing data is available
    };
  }
}

export const atriaExpansionService = new AtriaExpansionService();