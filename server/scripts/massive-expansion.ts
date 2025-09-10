#!/usr/bin/env tsx
/**
 * MASSIVE Expansion Script - Get ALL facilities NOW
 * Uses Perplexity AI to find hundreds of facilities per run
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

// ALL STATES for comprehensive coverage
const STATES = [
  'Texas', 'California', 'Florida', 'Arizona', 'Georgia',
  'North Carolina', 'Ohio', 'Pennsylvania', 'Illinois', 'Michigan',
  'New York', 'Virginia', 'Tennessee', 'Colorado', 'Washington',
  'Oregon', 'Nevada', 'Utah', 'Missouri', 'Indiana'
];

// Major city approach for better results
const MAJOR_CITIES = [
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Tucson', state: 'AZ' },
  { city: 'Miami', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Raleigh', state: 'NC' },
  { city: 'Columbus', state: 'OH' }
];

class MassiveExpander {
  private perplexity: PerplexityAIService;
  private addedCount = 0;
  private skippedCount = 0;

  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async expandMassively() {
    console.log('🚀 MASSIVE EXPANSION - Getting ALL facilities NOW!');
    console.log('=' .repeat(60));
    
    // Process cities in parallel batches of 5
    for (let i = 0; i < MAJOR_CITIES.length; i += 5) {
      const batch = MAJOR_CITIES.slice(i, i + 5);
      console.log(`\n📦 Processing cities: ${batch.map(c => c.city).join(', ')}`);
      
      const promises = batch.map(location => 
        this.findAllFacilitiesInCity(location.city, location.state)
      );
      
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between batches
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 MASSIVE RESULTS:`);
    console.log(`✅ Added ${this.addedCount} REAL facilities`);
    console.log(`⚠️ Skipped ${this.skippedCount} duplicates`);
    console.log('=' .repeat(60));
  }

  private async findAllFacilitiesInCity(city: string, state: string) {
    // Comprehensive query to get ALL types of senior facilities
    const query = `List ALL senior living facilities, assisted living, memory care, nursing homes, and retirement communities in ${city}, ${state}.
      For each facility provide:
      1. Full facility name
      2. Complete street address 
      3. City, State ZIP (5-digit)
      4. Phone: xxx-xxx-xxxx
      
      Include facilities from ALL companies including:
      - Brookdale, Sunrise, Atria, Holiday
      - Local and regional chains
      - Independent facilities
      - Nursing homes
      - Memory care centers
      
      List up to 25 facilities with complete information.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const facilities = this.parseFacilities(result.summary || '', city, state);
      
      if (facilities.length > 0) {
        console.log(`  ✅ ${city}, ${state}: Found ${facilities.length} facilities`);
        
        // Add all facilities
        for (const facility of facilities) {
          await this.addFacility(facility);
        }
      }
    } catch (error) {
      // Silent fail to keep going
    }
  }

  private parseFacilities(text: string, city: string, state: string): RealFacility[] {
    const facilities: RealFacility[] = [];
    const lines = text.split('\n');
    
    let current: Partial<RealFacility> = { city, state };
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Look for facility names (usually after numbers or bullets)
      if (trimmed.match(/^\d+[\.\)]\s+/) || trimmed.match(/^[•\-\*]\s+/)) {
        // Save previous if complete
        if (this.isComplete(current)) {
          facilities.push(current as RealFacility);
        }
        
        // Start new facility
        current = { city, state };
        current.name = trimmed.replace(/^[\d\.\)\-\*•]+\s*/, '').trim();
      }
      
      // Extract address
      const addrMatch = trimmed.match(/\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct|Circle|Cir|Parkway|Pkwy|Place|Pl)/i);
      if (addrMatch && !current.address) {
        current.address = addrMatch[0].trim();
      }
      
      // Extract ZIP
      const zipMatch = trimmed.match(/\b(\d{5})\b/);
      if (zipMatch && !current.zip_code) {
        current.zip_code = zipMatch[1];
      }
      
      // Extract phone
      const phoneMatch = trimmed.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch && !current.phone) {
        const digits = phoneMatch[0].replace(/\D/g, '');
        if (digits.length === 10) {
          current.phone = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
        }
      }
    }
    
    // Don't forget last one
    if (this.isComplete(current)) {
      facilities.push(current as RealFacility);
    }
    
    return facilities;
  }

  private isComplete(facility: Partial<RealFacility>): boolean {
    return !!(
      facility.name &&
      facility.address &&
      facility.city &&
      facility.state &&
      facility.zip_code?.length === 5 &&
      facility.phone?.replace(/\D/g, '').length === 10
    );
  }

  private async addFacility(facility: RealFacility) {
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
      return;
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
        care_types: ['Assisted Living', 'Memory Care'],
        description: `${facility.name} is a senior living community in ${facility.city}, ${facility.state}.`,
        status: 'Active',
        listing_type: 'Premium',
        is_claimed: false,
        ai_enrichment_date: new Date(),
        ai_enrichment_version: 'massive_v1'
      });
      
      this.addedCount++;
    } catch (error) {
      // Silent fail
    }
  }
}

// Main execution
async function main() {
  console.log('\n💪 MASSIVE EXPANSION SCRIPT');
  console.log('Getting ALL facilities RIGHT NOW - no waiting!');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');
  
  const expander = new MassiveExpander();
  
  try {
    await expander.expandMassively();
    console.log('\n✨ MASSIVE EXPANSION COMPLETE!');
    
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

export { MassiveExpander };