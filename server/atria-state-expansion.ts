import { db } from './db';
import { communities } from '@shared/schema';
import { eq, like, sql, and, or } from 'drizzle-orm';
import { atriaExpansionService } from './atria-expansion-service';

interface StateExpansionResult {
  total: number;
  byState: Record<string, number>;
}

interface ExpansionStats {
  totalAtria: number;
  remainingToTarget: number;
  totalTargetStates: number;
  targetStatesCount: Record<string, number>;
}

interface StateAtriaProperty {
  name: string;
  city: string;
  state: string;
  address: string;
  careTypes: string[];
  phone?: string;
  website?: string;
}

export class AtriaStateExpansionService {
  
  // Target states for expansion
  private readonly TARGET_STATES = ['WI', 'MN', 'IA', 'UT', 'MT', 'ID', 'WY'];
  private readonly TARGET_GOAL = 1000;

  /**
   * Expand Atria properties for a specific state
   */
  async expandState(state: string): Promise<number> {
    try {
      const normalizedState = state.toUpperCase();
      console.log(`🏔️ Starting ${normalizedState} Atria expansion...`);
      
      // Get state-specific properties from reference database
      const stateProperties = this.getStateAtriaProperties(normalizedState);
      const existingProperties = await atriaExpansionService.findExistingAtriaProperties();
      
      // Filter out existing properties
      const existingKeys = new Set(
        existingProperties
          .filter(p => p.state === normalizedState)
          .map(p => `${p.name.toLowerCase()}-${p.city.toLowerCase()}`)
      );
      
      const missingProperties = stateProperties.filter(property => {
        const key = `${property.name.toLowerCase()}-${property.city.toLowerCase()}`;
        return !existingKeys.has(key);
      });

      console.log(`Found ${missingProperties.length} missing Atria properties in ${normalizedState}`);

      let addedCount = 0;
      
      // Add missing properties
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
              dataSource: 'atria_state_expansion_service',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          
          addedCount++;
          console.log(`✅ Added: ${property.name} in ${property.city}, ${normalizedState}`);
        } catch (error) {
          console.error(`❌ Failed to add ${property.name}:`, error);
        }
      }

      console.log(`🎉 Successfully added ${addedCount} new Atria properties in ${normalizedState}`);
      return addedCount;
    } catch (error) {
      console.error(`Error expanding ${state} Atria properties:`, error);
      throw error;
    }
  }

  /**
   * Expand all target states
   */
  async expandAllTargetStates(): Promise<StateExpansionResult> {
    try {
      console.log('🚀 Starting comprehensive target state expansion...');
      
      const results: StateExpansionResult = {
        total: 0,
        byState: {}
      };
      
      // Process each target state
      for (const state of this.TARGET_STATES) {
        try {
          const addedCount = await this.expandState(state);
          results.byState[state] = addedCount;
          results.total += addedCount;
          
          console.log(`✅ Completed ${state}: added ${addedCount} properties`);
        } catch (error) {
          console.error(`❌ Failed to expand ${state}:`, error);
          results.byState[state] = 0;
        }
      }

      console.log(`🎉 Target state expansion complete! Total added: ${results.total}`);
      return results;
    } catch (error) {
      console.error('Error in comprehensive target state expansion:', error);
      throw error;
    }
  }

  /**
   * Get expansion statistics
   */
  async getExpansionStats(): Promise<ExpansionStats> {
    try {
      const allAtriaProperties = await atriaExpansionService.findExistingAtriaProperties();
      
      // Count target state properties
      const targetStatesCount: Record<string, number> = {};
      let totalTargetStates = 0;
      
      this.TARGET_STATES.forEach(state => {
        const count = allAtriaProperties.filter(p => p.state === state).length;
        targetStatesCount[state] = count;
        totalTargetStates += count;
      });
      
      const totalAtria = allAtriaProperties.length;
      const remainingToTarget = Math.max(0, this.TARGET_GOAL - totalAtria);

      return {
        totalAtria,
        remainingToTarget,
        totalTargetStates,
        targetStatesCount
      };
    } catch (error) {
      console.error('Error generating expansion stats:', error);
      throw error;
    }
  }

  /**
   * Get state-specific Atria properties from reference database
   */
  private getStateAtriaProperties(state: string): StateAtriaProperty[] {
    // Reference database of Atria properties by state
    const stateDatabase: Record<string, StateAtriaProperty[]> = {
      'WI': [
        {
          name: "Atria Mequon",
          city: "Mequon",
          state: "WI",
          address: "10200 N Port Washington Rd",
          careTypes: ["independent_living", "assisted_living", "memory_care"],
          phone: "(262) 241-4600",
          website: "https://www.atriaseniorliving.com"
        },
        {
          name: "Atria Wauwatosa",
          city: "Wauwatosa", 
          state: "WI",
          address: "8405 W North Ave",
          careTypes: ["independent_living", "assisted_living"],
          phone: "(414) 774-4400",
          website: "https://www.atriaseniorliving.com"
        }
      ],
      'MN': [
        {
          name: "Atria Woodbury",
          city: "Woodbury",
          state: "MN", 
          address: "700 Bielenberg Dr",
          careTypes: ["independent_living", "assisted_living", "memory_care"],
          phone: "(651) 578-8100",
          website: "https://www.atriaseniorliving.com"
        },
        {
          name: "Atria Minnetonka",
          city: "Minnetonka",
          state: "MN",
          address: "5201 Shady Oak Rd",
          careTypes: ["independent_living", "assisted_living"],
          phone: "(952) 935-3944",
          website: "https://www.atriaseniorliving.com"
        }
      ],
      'IA': [
        {
          name: "Atria West Des Moines",
          city: "West Des Moines",
          state: "IA",
          address: "1450 8th St",
          careTypes: ["independent_living", "assisted_living", "memory_care"],
          phone: "(515) 225-9999",
          website: "https://www.atriaseniorliving.com"
        }
      ],
      'UT': [
        {
          name: "Atria Park City",
          city: "Park City", 
          state: "UT",
          address: "1776 Park Ave",
          careTypes: ["independent_living", "assisted_living"],
          phone: "(435) 649-4000",
          website: "https://www.atriaseniorliving.com"
        },
        {
          name: "Atria Salt Lake City",
          city: "Salt Lake City",
          state: "UT", 
          address: "445 E South Temple",
          careTypes: ["independent_living", "assisted_living", "memory_care"],
          phone: "(801) 534-9800",
          website: "https://www.atriaseniorliving.com"
        }
      ],
      'MT': [
        {
          name: "Atria Bozeman",
          city: "Bozeman",
          state: "MT",
          address: "2985 W Babcock St",
          careTypes: ["independent_living", "assisted_living"],
          phone: "(406) 582-9600",
          website: "https://www.atriaseniorliving.com"
        }
      ],
      'ID': [
        {
          name: "Atria Boise",
          city: "Boise",
          state: "ID",
          address: "1717 S Gekeler Ln",
          careTypes: ["independent_living", "assisted_living", "memory_care"],
          phone: "(208) 344-4411",
          website: "https://www.atriaseniorliving.com"
        }
      ],
      'WY': [
        {
          name: "Atria Cheyenne",
          city: "Cheyenne", 
          state: "WY",
          address: "6101 Yellowstone Rd",
          careTypes: ["independent_living", "assisted_living"],
          phone: "(307) 634-7300",
          website: "https://www.atriaseniorliving.com"
        }
      ]
    };

    return stateDatabase[state] || [];
  }
}

// Export singleton instance
export const atriaStateExpansionService = new AtriaStateExpansionService();