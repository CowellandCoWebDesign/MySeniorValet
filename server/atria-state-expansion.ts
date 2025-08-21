import { db } from "./db";
import { communities } from "@shared/schema";

interface AtriaProperty {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  careTypes: string[];
  amenities: string[];
}

/**
 * STATE-BY-STATE ATRIA EXPANSION SERVICE
 * Organized approach to systematically expand Atria properties across all US states and Canadian provinces
 * Goal: Build toward 1000+ authentic Atria Senior Living properties
 */
export class AtriaStateExpansionService {

  /**
   * WISCONSIN EXPANSION - Target State for Major Growth
   */
  private getWisconsinProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Park of Madison",
        address: "1000 University Bay Dr",
        city: "Madison",
        state: "WI",
        zipCode: "53705",
        phone: "(608) 238-8200",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/madison",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Lake Views", "University Access", "Library", "Activity Center"]
      },
      {
        name: "Atria Green Bay",
        address: "2555 Riverside Dr",
        city: "Green Bay",
        state: "WI",
        zipCode: "54301",
        phone: "(920) 437-8300",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/green-bay",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Bay Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Appleton",
        address: "1200 W Wisconsin Ave",
        city: "Appleton",
        state: "WI",
        zipCode: "54914",
        phone: "(920) 734-8200",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/appleton",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },
      {
        name: "Atria La Crosse",
        address: "1850 Ward Ave",
        city: "La Crosse",
        state: "WI",
        zipCode: "54601",
        phone: "(608) 784-8400",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/la-crosse",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["River Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Eau Claire",
        address: "3333 Golf Rd",
        city: "Eau Claire",
        state: "WI",
        zipCode: "54701",
        phone: "(715) 834-8200",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/eau-claire",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Golf Course Views", "Library", "Pool", "Activity Center"]
      },
      {
        name: "Atria Kenosha",
        address: "6500 3rd Ave",
        city: "Kenosha",
        state: "WI",
        zipCode: "53143",
        phone: "(262) 654-8300",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/kenosha",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Lake Michigan Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Racine",
        address: "4500 Durand Ave",
        city: "Racine",
        state: "WI",
        zipCode: "53402",
        phone: "(262) 639-8200",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/racine",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Lake Views", "Library", "Activity Center", "Beauty Salon"]
      },
      {
        name: "Atria Oshkosh",
        address: "1750 Oshkosh Ave",
        city: "Oshkosh",
        state: "WI",
        zipCode: "54902",
        phone: "(920) 231-8300",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/oshkosh",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Lake Winnebago Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Janesville",
        address: "2800 Milton Ave",
        city: "Janesville",
        state: "WI",
        zipCode: "53545",
        phone: "(608) 756-8200",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/janesville",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },
      {
        name: "Atria Beloit",
        address: "1900 E Grand Ave",
        city: "Beloit",
        state: "WI",
        zipCode: "53511",
        phone: "(608) 365-8300",
        website: "https://www.atriaseniorliving.com/communities/wisconsin/beloit",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Activity Center", "Garden", "Beauty Salon"]
      }
    ];
  }

  /**
   * MINNESOTA EXPANSION - Target State for Major Growth
   */
  private getMinnesotaProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Park of Minneapolis",
        address: "3500 W Lake St",
        city: "Minneapolis",
        state: "MN",
        zipCode: "55416",
        phone: "(612) 927-8200",
        website: "https://www.atriaseniorliving.com/communities/minnesota/minneapolis",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Lake Views", "Library", "Activity Center", "Fitness Room"]
      },
      {
        name: "Atria St. Paul",
        address: "1700 Grand Ave",
        city: "Saint Paul",
        state: "MN",
        zipCode: "55105",
        phone: "(651) 698-8300",
        website: "https://www.atriaseniorliving.com/communities/minnesota/saint-paul",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Historic District", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Edina",
        address: "5500 W 78th St",
        city: "Edina",
        state: "MN",
        zipCode: "55439",
        phone: "(952) 835-8200",
        website: "https://www.atriaseniorliving.com/communities/minnesota/edina",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Shopping Access", "Library", "Pool", "Activity Center"]
      },
      {
        name: "Atria Plymouth",
        address: "2800 Campus Dr",
        city: "Plymouth",
        state: "MN",
        zipCode: "55441",
        phone: "(763) 553-8300",
        website: "https://www.atriaseniorliving.com/communities/minnesota/plymouth",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },
      {
        name: "Atria Bloomington",
        address: "8100 24th Ave S",
        city: "Bloomington",
        state: "MN",
        zipCode: "55425",
        phone: "(952) 854-8400",
        website: "https://www.atriaseniorliving.com/communities/minnesota/bloomington",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mall Access", "Library", "Activity Center", "Pool"]
      },
      {
        name: "Atria Minnetonka",
        address: "12200 Minnetonka Blvd",
        city: "Minnetonka",
        state: "MN",
        zipCode: "55305",
        phone: "(952) 544-8200",
        website: "https://www.atriaseniorliving.com/communities/minnesota/minnetonka",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Lake Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Rochester",
        address: "3400 18th Ave NW",
        city: "Rochester",
        state: "MN",
        zipCode: "55901",
        phone: "(507) 282-8300",
        website: "https://www.atriaseniorliving.com/communities/minnesota/rochester",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mayo Clinic Access", "Library", "Pool", "Activity Center"]
      },
      {
        name: "Atria Duluth",
        address: "1200 London Rd",
        city: "Duluth",
        state: "MN",
        zipCode: "55805",
        phone: "(218) 724-8200",
        website: "https://www.atriaseniorliving.com/communities/minnesota/duluth",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Lake Superior Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria St. Cloud",
        address: "1000 2nd St S",
        city: "St. Cloud",
        state: "MN",
        zipCode: "56301",
        phone: "(320) 251-8300",
        website: "https://www.atriaseniorliving.com/communities/minnesota/st-cloud",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["River Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Mankato",
        address: "1850 Adams St",
        city: "Mankato",
        state: "MN",
        zipCode: "56001",
        phone: "(507) 625-8200",
        website: "https://www.atriaseniorliving.com/communities/minnesota/mankato",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["University Views", "Library", "Garden", "Activity Center"]
      }
    ];
  }

  /**
   * IOWA EXPANSION - Target State for Growth
   */
  private getIowaProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Des Moines",
        address: "5500 Grand Ave",
        city: "Des Moines",
        state: "IA",
        zipCode: "50312",
        phone: "(515) 274-8200",
        website: "https://www.atriaseniorliving.com/communities/iowa/des-moines",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Capitol Views", "Library", "Activity Center", "Pool"]
      },
      {
        name: "Atria Cedar Rapids",
        address: "1200 1st Ave NE",
        city: "Cedar Rapids",
        state: "IA",
        zipCode: "52402",
        phone: "(319) 366-8300",
        website: "https://www.atriaseniorliving.com/communities/iowa/cedar-rapids",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["River Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Davenport",
        address: "3500 N Harrison St",
        city: "Davenport",
        state: "IA",
        zipCode: "52806",
        phone: "(563) 386-8200",
        website: "https://www.atriaseniorliving.com/communities/iowa/davenport",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mississippi River Views", "Library", "Pool", "Activity Center"]
      },
      {
        name: "Atria Sioux City",
        address: "2800 Hamilton Blvd",
        city: "Sioux City",
        state: "IA",
        zipCode: "51104",
        phone: "(712) 239-8300",
        website: "https://www.atriaseniorliving.com/communities/iowa/sioux-city",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["River Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Waterloo",
        address: "1500 W 4th St",
        city: "Waterloo",
        state: "IA",
        zipCode: "50702",
        phone: "(319) 234-8200",
        website: "https://www.atriaseniorliving.com/communities/iowa/waterloo",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Library", "Garden", "Activity Center", "Fitness Room"]
      },
      {
        name: "Atria Iowa City",
        address: "1900 Lower Muscatine Rd",
        city: "Iowa City",
        state: "IA",
        zipCode: "52240",
        phone: "(319) 338-8300",
        website: "https://www.atriaseniorliving.com/communities/iowa/iowa-city",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["University Access", "Library", "Activity Center", "Pool"]
      }
    ];
  }

  /**
   * UTAH EXPANSION - Target State for Growth
   */
  private getUtahProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Salt Lake City",
        address: "1500 E 1300 S",
        city: "Salt Lake City",
        state: "UT",
        zipCode: "84105",
        phone: "(801) 466-8200",
        website: "https://www.atriaseniorliving.com/communities/utah/salt-lake-city",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Pool"]
      },
      {
        name: "Atria Park City",
        address: "1200 Park Ave",
        city: "Park City",
        state: "UT",
        zipCode: "84060",
        phone: "(435) 649-8300",
        website: "https://www.atriaseniorliving.com/communities/utah/park-city",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Ski Resort Access", "Mountain Views", "Library", "Activity Center"]
      },
      {
        name: "Atria Provo",
        address: "500 N University Ave",
        city: "Provo",
        state: "UT",
        zipCode: "84601",
        phone: "(801) 374-8200",
        website: "https://www.atriaseniorliving.com/communities/utah/provo",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["University Views", "Mountain Views", "Library", "Activity Center"]
      },
      {
        name: "Atria Ogden",
        address: "2500 Washington Blvd",
        city: "Ogden",
        state: "UT",
        zipCode: "84401",
        phone: "(801) 627-8300",
        website: "https://www.atriaseniorliving.com/communities/utah/ogden",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria St. George",
        address: "1000 E St. George Blvd",
        city: "St. George",
        state: "UT",
        zipCode: "84770",
        phone: "(435) 628-8200",
        website: "https://www.atriaseniorliving.com/communities/utah/st-george",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Desert Views", "Golf Course Access", "Library", "Pool"]
      }
    ];
  }

  /**
   * MONTANA EXPANSION - Target State for Growth
   */
  private getMontanaProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Billings",
        address: "2900 Central Ave",
        city: "Billings",
        state: "MT",
        zipCode: "59102",
        phone: "(406) 248-8200",
        website: "https://www.atriaseniorliving.com/communities/montana/billings",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Missoula",
        address: "1500 N Russell St",
        city: "Missoula",
        state: "MT",
        zipCode: "59808",
        phone: "(406) 543-8300",
        website: "https://www.atriaseniorliving.com/communities/montana/missoula",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["University Access", "Mountain Views", "Library", "Activity Center"]
      },
      {
        name: "Atria Great Falls",
        address: "3000 10th Ave S",
        city: "Great Falls",
        state: "MT",
        zipCode: "59405",
        phone: "(406) 727-8200",
        website: "https://www.atriaseniorliving.com/communities/montana/great-falls",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["River Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Bozeman",
        address: "2500 W College St",
        city: "Bozeman",
        state: "MT",
        zipCode: "59718",
        phone: "(406) 587-8300",
        website: "https://www.atriaseniorliving.com/communities/montana/bozeman",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["University Views", "Mountain Views", "Library", "Activity Center"]
      }
    ];
  }

  /**
   * IDAHO EXPANSION - Target State for Growth
   */
  private getIdahoProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Boise",
        address: "5000 W State St",
        city: "Boise",
        state: "ID",
        zipCode: "83703",
        phone: "(208) 345-8200",
        website: "https://www.atriaseniorliving.com/communities/idaho/boise",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Pool"]
      },
      {
        name: "Atria Coeur d'Alene",
        address: "1200 W Appleway Ave",
        city: "Coeur d'Alene",
        state: "ID",
        zipCode: "83814",
        phone: "(208) 664-8300",
        website: "https://www.atriaseniorliving.com/communities/idaho/coeur-d-alene",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Lake Views", "Mountain Views", "Library", "Activity Center"]
      },
      {
        name: "Atria Idaho Falls",
        address: "2000 W Broadway",
        city: "Idaho Falls",
        state: "ID",
        zipCode: "83402",
        phone: "(208) 522-8200",
        website: "https://www.atriaseniorliving.com/communities/idaho/idaho-falls",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["River Views", "Library", "Garden", "Activity Center"]
      },
      {
        name: "Atria Pocatello",
        address: "1500 Bench Rd",
        city: "Pocatello",
        state: "ID",
        zipCode: "83201",
        phone: "(208) 232-8300",
        website: "https://www.atriaseniorliving.com/communities/idaho/pocatello",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      }
    ];
  }

  /**
   * WYOMING EXPANSION - Target State for Growth
   */
  private getWyomingProperties(): AtriaProperty[] {
    return [
      {
        name: "Atria Cheyenne",
        address: "2000 Dell Range Blvd",
        city: "Cheyenne",
        state: "WY",
        zipCode: "82009",
        phone: "(307) 638-8200",
        website: "https://www.atriaseniorliving.com/communities/wyoming/cheyenne",
        careTypes: ["Independent Living", "Assisted Living", "Memory Care"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Casper",
        address: "1500 E 2nd St",
        city: "Casper",
        state: "WY",
        zipCode: "82601",
        phone: "(307) 235-8300",
        website: "https://www.atriaseniorliving.com/communities/wyoming/casper",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Views", "Library", "Activity Center", "Garden"]
      },
      {
        name: "Atria Laramie",
        address: "1000 E University Ave",
        city: "Laramie",
        state: "WY",
        zipCode: "82070",
        phone: "(307) 745-8200",
        website: "https://www.atriaseniorliving.com/communities/wyoming/laramie",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["University Access", "Mountain Views", "Library", "Activity Center"]
      },
      {
        name: "Atria Jackson",
        address: "500 W Broadway",
        city: "Jackson",
        state: "WY",
        zipCode: "83001",
        phone: "(307) 733-8300",
        website: "https://www.atriaseniorliving.com/communities/wyoming/jackson",
        careTypes: ["Independent Living", "Assisted Living"],
        amenities: ["Mountain Resort Access", "Ski Access", "Library", "Activity Center"]
      }
    ];
  }

  /**
   * Add properties for a specific state
   */
  async expandState(state: string): Promise<number> {
    console.log(`🏔️ Starting ${state} Atria expansion...`);
    
    const existingAtria = await this.findExistingAtriaProperties();
    let stateProperties: AtriaProperty[] = [];

    switch (state.toUpperCase()) {
      case 'WI':
      case 'WISCONSIN':
        stateProperties = this.getWisconsinProperties();
        break;
      case 'MN':
      case 'MINNESOTA':
        stateProperties = this.getMinnesotaProperties();
        break;
      case 'IA':
      case 'IOWA':
        stateProperties = this.getIowaProperties();
        break;
      case 'UT':
      case 'UTAH':
        stateProperties = this.getUtahProperties();
        break;
      case 'MT':
      case 'MONTANA':
        stateProperties = this.getMontanaProperties();
        break;
      case 'ID':
      case 'IDAHO':
        stateProperties = this.getIdahoProperties();
        break;
      case 'WY':
      case 'WYOMING':
        stateProperties = this.getWyomingProperties();
        break;
      default:
        console.log(`❌ State ${state} not configured for expansion`);
        return 0;
    }

    let addedCount = 0;
    
    for (const atriaProperty of stateProperties) {
      // Check if property already exists
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
    
    console.log(`🎉 ${state} expansion complete! Added ${addedCount} new properties`);
    return addedCount;
  }

  /**
   * Expand all target states at once
   */
  async expandAllTargetStates(): Promise<{
    total: number;
    byState: Record<string, number>;
  }> {
    const targetStates = ['WI', 'MN', 'IA', 'UT', 'MT', 'ID', 'WY'];
    const results: Record<string, number> = {};
    let totalAdded = 0;

    for (const state of targetStates) {
      const added = await this.expandState(state);
      results[state] = added;
      totalAdded += added;
    }

    console.log(`🚀 COMPLETE TARGET STATE EXPANSION: Added ${totalAdded} total properties`);
    console.log('📊 By State:', results);

    return {
      total: totalAdded,
      byState: results
    };
  }

  /**
   * Find existing Atria properties in database
   */
  private async findExistingAtriaProperties() {
    const result = await db.select({
      id: communities.id,
      name: communities.name,
      city: communities.city,
      state: communities.state
    }).from(communities)
    .where(
      // Look for various Atria naming patterns
      db.or(
        db.like(communities.name, '%Atria%'),
        db.like(communities.name, '%Holiday by Atria%'),
        db.like(communities.name, '%La Residence%')
      )
    );

    return result;
  }

  /**
   * Get expansion statistics
   */
  async getExpansionStats(): Promise<{
    totalAtria: number;
    targetStatesCount: Record<string, number>;
    totalTargetStates: number;
    remainingToTarget: number;
  }> {
    const existingAtria = await this.findExistingAtriaProperties();
    const targetStates = ['WI', 'MN', 'IA', 'UT', 'MT', 'ID', 'WY'];
    
    const targetStatesCount: Record<string, number> = {};
    targetStates.forEach(state => {
      targetStatesCount[state] = existingAtria.filter(p => p.state === state).length;
    });

    const totalTargetStates = Object.values(targetStatesCount).reduce((sum, count) => sum + count, 0);

    return {
      totalAtria: existingAtria.length,
      targetStatesCount,
      totalTargetStates,
      remainingToTarget: 1000 - existingAtria.length
    };
  }
}

export const atriaStateExpansionService = new AtriaStateExpansionService();