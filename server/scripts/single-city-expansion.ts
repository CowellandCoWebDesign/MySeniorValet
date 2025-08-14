#!/usr/bin/env tsx
/**
 * Single City Expansion Script - Controlled, focused expansion
 * Process ONE city at a time for better quality control
 * NO FAKE DATA - only real facilities with complete information
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { PerplexityAIService } from "../perplexity-ai-service";

interface RealFacility {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
}

// Target cities - process one at a time
const TARGET_CITIES = [
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Orlando', state: 'FL' }
];

class SingleCityExpander {
  private perplexity: PerplexityAIService;
  private addedCount = 0;
  private skippedCount = 0;

  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async expandSingleCity(cityName?: string) {
    // Allow specifying a city or use the first from the list
    const targetCity = cityName 
      ? TARGET_CITIES.find(c => c.city.toLowerCase() === cityName.toLowerCase())
      : TARGET_CITIES[0];
    
    if (!targetCity) {
      console.log(`❌ City not found: ${cityName}`);
      return;
    }

    console.log('🎯 SINGLE CITY EXPANSION - Focused & Controlled');
    console.log('=' .repeat(60));
    console.log(`📍 TARGET: ${targetCity.city}, ${targetCity.state}`);
    console.log('=' .repeat(60));
    
    // Make multiple specific queries for better results
    const queries = [
      `Brookdale, Sunrise, and Atria facilities`,
      `nursing homes and skilled nursing facilities`,
      `memory care and Alzheimer's facilities`,
      `independent living and retirement communities`,
      `assisted living facilities`,
      `continuing care retirement communities (CCRC)`
    ];
    
    for (const queryType of queries) {
      console.log(`\n🔍 Searching for ${queryType}...`);
      await this.searchFacilities(targetCity.city, targetCity.state, queryType);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ RESULTS FOR ${targetCity.city}, ${targetCity.state}:`);
    console.log(`   Added: ${this.addedCount} new facilities`);
    console.log(`   Skipped: ${this.skippedCount} (duplicates)`);
    console.log('=' .repeat(60));
    
    // Show next city option
    const currentIndex = TARGET_CITIES.findIndex(c => c.city === targetCity.city);
    if (currentIndex < TARGET_CITIES.length - 1) {
      const nextCity = TARGET_CITIES[currentIndex + 1];
      console.log(`\n💡 Next city available: ${nextCity.city}, ${nextCity.state}`);
      console.log(`   Run: tsx single-city-expansion.ts "${nextCity.city}"`);
    }
  }

  private async searchFacilities(city: string, state: string, facilityType: string) {
    const query = `List all ${facilityType} in ${city}, ${state}.
      Provide EXACTLY this format for each facility:
      - Facility name
      - Street address (number and street)
      - ${city}, ${state} ZIP
      - Phone: xxx-xxx-xxxx
      
      Include ONLY facilities that are:
      1. Currently operating
      2. Have a physical location in ${city}
      3. Have complete contact information
      
      List up to 15 facilities.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const facilities = this.parseDetailedFacilities(result.summary || '', city, state);
      
      if (facilities.length > 0) {
        console.log(`   Found ${facilities.length} ${facilityType}`);
        
        for (const facility of facilities) {
          const added = await this.addFacility(facility);
          if (added) {
            console.log(`     ✓ ${facility.name}`);
          }
        }
      } else {
        console.log(`   No results for ${facilityType}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Search failed for ${facilityType}`);
    }
  }

  private parseDetailedFacilities(text: string, city: string, state: string): RealFacility[] {
    const facilities: RealFacility[] = [];
    const lines = text.split('\n');
    
    let current: Partial<RealFacility> = { city, state };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // New facility starts with dash, number, or bullet
      if (line.match(/^[-•*]\s+/) || line.match(/^\d+[\.)]\s+/)) {
        // Save previous if complete
        if (this.isComplete(current)) {
          facilities.push(current as RealFacility);
        }
        
        // Extract name from this line
        current = { city, state };
        const nameText = line.replace(/^[-•*\d\.)]+\s*/, '').trim();
        
        // Remove "Facility name:" prefix if present
        current.name = nameText.replace(/^(Facility name:|Name:)\s*/i, '').trim();
      }
      
      // Look for components in current or next lines
      if (!current.address) {
        const addrMatch = line.match(/(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct|Circle|Cir|Parkway|Pkwy|Place|Pl|Trail|Trl)\.?)/i);
        if (addrMatch) {
          current.address = addrMatch[1].trim();
        }
      }
      
      // Look for city, state, zip pattern
      const cityStateZip = line.match(new RegExp(`${city},\\s*${state}\\s+(\\d{5})`, 'i'));
      if (cityStateZip && !current.zip_code) {
        current.zip_code = cityStateZip[1];
      }
      
      // Look for phone
      const phoneMatch = line.match(/(?:Phone:?\s*)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
      if (phoneMatch && !current.phone) {
        const digits = phoneMatch[1].replace(/\D/g, '');
        if (digits.length === 10) {
          current.phone = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
        }
      }
    }
    
    // Don't forget last facility
    if (this.isComplete(current)) {
      facilities.push(current as RealFacility);
    }
    
    return facilities;
  }

  private isComplete(facility: Partial<RealFacility>): boolean {
    return !!(
      facility.name &&
      facility.name.length > 3 &&
      facility.address &&
      facility.city &&
      facility.state &&
      facility.zip_code?.length === 5 &&
      facility.phone?.replace(/\D/g, '').length === 10
    );
  }

  private async addFacility(facility: RealFacility): Promise<boolean> {
    // Check for duplicate
    const existing = await db
      .select()
      .from(communities)
      .where(
        and(
          sql`LOWER(${communities.name}) = LOWER(${facility.name})`,
          eq(communities.city, facility.city),
          eq(communities.state, facility.state)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      this.skippedCount++;
      return false;
    }
    
    try {
      await db.insert(communities).values({
        name: facility.name,
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zip_code: facility.zip_code,
        phone: facility.phone,
        care_type: 'Assisted Living',
        care_types: ['Assisted Living', 'Memory Care', 'Skilled Nursing'],
        description: `${facility.name} is a senior living community located in ${facility.city}, ${facility.state}.`,
        status: 'Active',
        listing_type: 'Premium',
        is_claimed: false,
        ai_enrichment_date: new Date(),
        ai_enrichment_version: 'single_city_v1'
      });
      
      this.addedCount++;
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Main execution
async function main() {
  const cityArg = process.argv[2]; // Get city from command line
  
  console.log('\n🏙️ SINGLE CITY EXPANSION SCRIPT');
  console.log('Controlled, focused expansion - ONE city at a time');
  console.log('Timestamp:', new Date().toISOString());
  
  const expander = new SingleCityExpander();
  
  try {
    await expander.expandSingleCity(cityArg);
    console.log('\n✨ City expansion complete!');
    
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// ES module execution
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main();
}

export { SingleCityExpander };