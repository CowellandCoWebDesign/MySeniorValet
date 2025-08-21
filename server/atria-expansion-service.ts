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