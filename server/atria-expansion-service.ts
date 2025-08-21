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
      // Check if property already exists
      const exists = existingAtria.some(existing => 
        existing.name?.toLowerCase().includes('atria') &&
        existing.city?.toLowerCase() === atriaProperty.city.toLowerCase() &&
        existing.state?.toLowerCase() === atriaProperty.state.toLowerCase()
      );
      
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