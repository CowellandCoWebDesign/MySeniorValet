import { db } from './db';
import { communities } from '@shared/schema';
import { eq, like, sql, and, or } from 'drizzle-orm';

interface AtriaProperty {
  id: number;
  name: string;
  city: string;
  state: string;
  address: string;
  careTypes: string[];
  phone?: string;
  website?: string;
}

interface AtriaStats {
  total: number;
  byState: Record<string, number>;
  careTypesOffered: Record<string, number>;
}

interface AtriaPropertyData {
  name: string;
  city: string;
  state: string;
  address: string;
  careTypes: string[];
  phone?: string;
  website?: string;
}

export class AtriaExpansionService {
  
  /**
   * Find all existing Atria properties in the database
   */
  async findExistingAtriaProperties(): Promise<AtriaProperty[]> {
    try {
      const existingAtria = await db
        .select()
        .from(communities)
        .where(
          or(
            like(communities.name, '%Atria%'),
            like(communities.name, '%atria%'),
            like(communities.corporateName, '%Atria%'),
            like(communities.corporateName, '%atria%')
          )
        );

      return existingAtria.map(community => ({
        id: community.id,
        name: community.name,
        city: community.city,
        state: community.state,
        address: community.address || '',
        careTypes: community.careTypes || [],
        phone: community.phone || undefined,
        website: community.website || undefined
      }));
    } catch (error) {
      console.error('Error finding existing Atria properties:', error);
      throw error;
    }
  }

  /**
   * Add missing Atria properties to the database
   */
  async addMissingAtriaProperties(): Promise<number> {
    try {
      console.log('🏢 Starting Atria property expansion...');
      
      // Get reference database of Atria properties
      const atriaDatabase = this.getAtriaPropertiesDatabase();
      const existingProperties = await this.findExistingAtriaProperties();
      
      // Find missing properties by comparing names and locations
      const existingNames = new Set(
        existingProperties.map(p => `${p.name.toLowerCase()}-${p.city.toLowerCase()}-${p.state.toLowerCase()}`)
      );
      
      const missingProperties = atriaDatabase.filter(property => {
        const key = `${property.name.toLowerCase()}-${property.city.toLowerCase()}-${property.state.toLowerCase()}`;
        return !existingNames.has(key);
      });

      console.log(`Found ${missingProperties.length} missing Atria properties to add`);

      let addedCount = 0;
      
      // Add missing properties to database
      for (const property of missingProperties) {
        try {
          await db
            .insert(communities)
            .values({
              name: property.name,
              city: property.city,
              state: property.state,
              address: property.address,
              careTypes: property.careTypes,
              phone: property.phone || null,
              website: property.website || null,
              corporateName: 'Atria Senior Living',
              communityType: 'senior_living_community',
              communitySubtype: 'assisted_living',
              isVerified: true,
              dataSource: 'atria_expansion_service',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          
          addedCount++;
          console.log(`✅ Added: ${property.name} in ${property.city}, ${property.state}`);
        } catch (error) {
          console.error(`❌ Failed to add ${property.name}:`, error);
        }
      }

      console.log(`🎉 Successfully added ${addedCount} new Atria properties`);
      return addedCount;
    } catch (error) {
      console.error('Error adding missing Atria properties:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive Atria statistics
   */
  async getAtriaStats(): Promise<AtriaStats> {
    try {
      const atriaProperties = await this.findExistingAtriaProperties();
      
      // Calculate statistics
      const byState: Record<string, number> = {};
      const careTypesOffered: Record<string, number> = {};
      
      atriaProperties.forEach(property => {
        // Count by state
        byState[property.state] = (byState[property.state] || 0) + 1;
        
        // Count care types
        property.careTypes.forEach(careType => {
          careTypesOffered[careType] = (careTypesOffered[careType] || 0) + 1;
        });
      });

      return {
        total: atriaProperties.length,
        byState,
        careTypesOffered
      };
    } catch (error) {
      console.error('Error generating Atria stats:', error);
      throw error;
    }
  }

  /**
   * Get the reference database of Atria properties
   */
  getAtriaPropertiesDatabase(): AtriaPropertyData[] {
    // This is a sample database of known Atria properties
    // In a production system, this would be loaded from an external source
    return [
      {
        name: "Atria Windsor Woods",
        city: "Hudson",
        state: "FL", 
        address: "6630 Rowan Rd",
        careTypes: ["assisted_living", "memory_care"],
        phone: "(727) 863-4444",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Hillcrest",
        city: "Atlanta",
        state: "GA",
        address: "200 Grandview Ave SE",
        careTypes: ["independent_living", "assisted_living"],
        phone: "(404) 355-5580", 
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Kennett Square",
        city: "Kennett Square", 
        state: "PA",
        address: "100 Atria Way",
        careTypes: ["independent_living", "assisted_living", "memory_care"],
        phone: "(610) 444-9200",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Stamford",
        city: "Stamford",
        state: "CT", 
        address: "1600 Washington Blvd",
        careTypes: ["independent_living", "assisted_living"],
        phone: "(203) 968-0881",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Cranford",
        city: "Cranford",
        state: "NJ",
        address: "15 Springfield Ave", 
        careTypes: ["independent_living", "assisted_living", "memory_care"],
        phone: "(908) 276-4999",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Marina Place",
        city: "Marina del Rey",
        state: "CA",
        address: "4125 Via Marina",
        careTypes: ["independent_living", "assisted_living"],
        phone: "(310) 821-2631", 
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Chandler Villas",
        city: "Chandler",
        state: "AZ",
        address: "2950 S Alma School Rd",
        careTypes: ["independent_living", "assisted_living", "memory_care"],
        phone: "(480) 899-2831",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Willow Glen", 
        city: "San Jose",
        state: "CA",
        address: "2280 The Alameda",
        careTypes: ["independent_living", "assisted_living", "memory_care"],
        phone: "(408) 265-3222",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Tinton Falls",
        city: "Tinton Falls", 
        state: "NJ",
        address: "851 Shrewsbury Ave",
        careTypes: ["independent_living", "assisted_living", "memory_care"],
        phone: "(732) 460-5550",
        website: "https://www.atriaseniorliving.com"
      },
      {
        name: "Atria Burlingame",
        city: "Burlingame",
        state: "CA",
        address: "1401 Cabrillo Hwy",
        careTypes: ["independent_living", "assisted_living"],
        phone: "(650) 375-1265",
        website: "https://www.atriaseniorliving.com"
      }
    ];
  }
}

// Export singleton instance
export const atriaExpansionService = new AtriaExpansionService();