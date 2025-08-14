/**
 * Smart Two-Stage City Expansion
 * Stage 1: Discover facility names via city search
 * Stage 2: Enrich each facility individually for complete data
 */

import { db } from '../db';
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { PerplexityAIService } from "../perplexity-ai-service";

interface DiscoveredFacility {
  name: string;
  city: string;
  state: string;
  partialAddress?: string;
  partialZip?: string;
  partialPhone?: string;
}

interface EnrichedFacility {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  website?: string;
  pricing?: string;
  care_types?: string[];
  description?: string;
}

const TARGET_CITIES = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Denver', state: 'CO' },
  { city: 'Boston', state: 'MA' },
  // Major metros with poor coverage
  { city: 'Dallas', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'New York', state: 'NY' },
  { city: 'Brooklyn', state: 'NY' },
  { city: 'Queens', state: 'NY' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Orlando', state: 'FL' },
  { city: 'Tampa', state: 'FL' },
  { city: 'Jacksonville', state: 'FL' },
  { city: 'Columbus', state: 'OH' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Memphis', state: 'TN' },
  { city: 'Baltimore', state: 'MD' },
  { city: 'Milwaukee', state: 'WI' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'St. Louis', state: 'MO' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Pittsburgh', state: 'PA' },
  { city: 'Cincinnati', state: 'OH' },
  { city: 'Cleveland', state: 'OH' },
  // Underserved states
  { city: 'Fargo', state: 'ND' },
  { city: 'Bismarck', state: 'ND' },
  { city: 'Grand Forks', state: 'ND' },
  { city: 'Sioux Falls', state: 'SD' },
  { city: 'Rapid City', state: 'SD' },
  { city: 'Aberdeen', state: 'SD' },
  { city: 'Cheyenne', state: 'WY' },
  { city: 'Casper', state: 'WY' },
  { city: 'Laramie', state: 'WY' },
  { city: 'Honolulu', state: 'HI' },
  { city: 'Hilo', state: 'HI' },
  { city: 'Kailua', state: 'HI' },
  { city: 'Billings', state: 'MT' },
  { city: 'Missoula', state: 'MT' },
  { city: 'Great Falls', state: 'MT' },
  { city: 'Anchorage', state: 'AK' },
  { city: 'Fairbanks', state: 'AK' },
  { city: 'Juneau', state: 'AK' }
];

class SmartCityExpander {
  private perplexity: PerplexityAIService;
  private discoveredNames: DiscoveredFacility[] = [];
  private enrichedCount = 0;
  private failedCount = 0;
  private skippedCount = 0;

  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async expandCity(cityName?: string) {
    const targetCity = cityName 
      ? TARGET_CITIES.find(c => c.city.toLowerCase() === cityName.toLowerCase())
      : TARGET_CITIES[0];
    
    if (!targetCity) {
      console.log(`❌ City not found: ${cityName}`);
      return;
    }

    console.log('🧠 SMART TWO-STAGE EXPANSION');
    console.log('=' .repeat(60));
    console.log(`📍 TARGET: ${targetCity.city}, ${targetCity.state}`);
    console.log('=' .repeat(60));
    
    // STAGE 1: Discovery - Get ALL facility names
    console.log('\n📊 STAGE 1: DISCOVERY PHASE');
    console.log('-'.repeat(40));
    await this.discoverFacilityNames(targetCity.city, targetCity.state);
    
    // STAGE 2: Enrichment - Target each facility individually
    console.log('\n🎯 STAGE 2: ENRICHMENT PHASE');
    console.log('-'.repeat(40));
    await this.enrichDiscoveredFacilities();
    
    // Results
    console.log('\n' + '='.repeat(60));
    console.log(`✅ FINAL RESULTS FOR ${targetCity.city}, ${targetCity.state}:`);
    console.log(`   Discovered: ${this.discoveredNames.length} facility names`);
    console.log(`   Enriched: ${this.enrichedCount} with complete data`);
    console.log(`   Failed: ${this.failedCount} enrichment attempts`);
    console.log(`   Skipped: ${this.skippedCount} (already in database)`);
    console.log('=' .repeat(60));
  }

  private async discoverFacilityNames(city: string, state: string) {
    const queries = [
      `List ALL senior living facility NAMES in ${city}, ${state} metro area`,
      `List ALL assisted living facility NAMES in ${city}, ${state} area`,
      `List ALL nursing home NAMES in ${city}, ${state} region`,
      `List ALL memory care facility NAMES in ${city}, ${state}`,
      `List ALL retirement community NAMES in ${city}, ${state} suburbs`
    ];
    
    for (const query of queries) {
      console.log(`🔍 Discovering: ${query.split('NAMES')[0]}NAMES...`);
      
      const fullQuery = `${query}
        
        I need a comprehensive list of facility NAMES only.
        Include all major chains like Brookdale, Sunrise, Atria.
        Include all local operators and independent facilities.
        Include small residential care homes.
        Include nonprofit and faith-based facilities.
        
        List as many facilities as possible (aim for 30-50).
        Just facility names - I'll get details later.
        Focus on ${city} metro area including all suburbs.`;
      
      try {
        const result = await this.perplexity.searchRealTime(fullQuery);
        const names = this.parseDiscoveredNames(result.summary || '', city, state);
        
        console.log(`   Found ${names.length} facility names`);
        this.discoveredNames.push(...names);
        
        await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
      } catch (error) {
        console.log(`   ⚠️ Discovery failed`);
      }
    }
    
    // De-duplicate discovered names
    const uniqueNames = new Map<string, DiscoveredFacility>();
    for (const facility of this.discoveredNames) {
      const key = `${facility.name.toLowerCase()}_${facility.city}`;
      if (!uniqueNames.has(key)) {
        uniqueNames.set(key, facility);
      }
    }
    
    this.discoveredNames = Array.from(uniqueNames.values());
    console.log(`\n📋 Total unique facilities discovered: ${this.discoveredNames.length}`);
  }

  private parseDiscoveredNames(text: string, city: string, state: string): DiscoveredFacility[] {
    const facilities: DiscoveredFacility[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const cleaned = line.trim();
      if (!cleaned) continue;
      
      // Look for facility names in various formats
      let facilityName = '';
      
      // Format: "1. Facility Name"
      if (cleaned.match(/^\d+[\.)]\s+/)) {
        facilityName = cleaned.replace(/^\d+[\.)]\s*/, '').trim();
      }
      // Format: "- Facility Name" or "• Facility Name"
      else if (cleaned.match(/^[-•*]\s+/)) {
        facilityName = cleaned.replace(/^[-•*]\s*/, '').trim();
      }
      // Format: "**Facility Name**"
      else if (cleaned.includes('**')) {
        const match = cleaned.match(/\*\*([^*]+)\*\*/);
        if (match) facilityName = match[1].trim();
      }
      // Any line with senior/assisted/care/nursing keywords
      else if (cleaned.match(/\b(senior|assisted|care|nursing|retirement|memory)\b/i)) {
        // Skip if it's a description line
        if (!cleaned.match(/^(the|a|an|these|this|it|they)\s/i)) {
          facilityName = cleaned;
        }
      }
      
      // Clean up the facility name
      if (facilityName) {
        // Remove trailing punctuation, addresses, phone numbers
        facilityName = facilityName
          .replace(/[,;:].*$/, '')
          .replace(/\(.*?\)/, '')
          .replace(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}.*$/, '')
          .replace(/\d+\s+[A-Za-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive).*$/i, '')
          .trim();
        
        // Only add if it looks like a facility name
        if (facilityName.length > 3 && 
            facilityName.length < 100 &&
            !facilityName.match(/^(address|phone|contact|type|pricing|availability)/i)) {
          facilities.push({
            name: facilityName,
            city,
            state
          });
        }
      }
    }
    
    return facilities;
  }

  private async enrichDiscoveredFacilities() {
    console.log(`\n🎯 Enriching ${this.discoveredNames.length} discovered facilities...`);
    
    // Process in batches to avoid timeout
    const BATCH_SIZE = 25;
    const totalBatches = Math.ceil(this.discoveredNames.length / BATCH_SIZE);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const start = batch * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, this.discoveredNames.length);
      const batchFacilities = this.discoveredNames.slice(start, end);
      
      console.log(`\n📦 Processing batch ${batch + 1}/${totalBatches} (facilities ${start + 1}-${end})`);
      
      for (let i = 0; i < batchFacilities.length; i++) {
        const facility = batchFacilities[i];
        const globalIndex = start + i;
        
        // Check if already exists
        const existing = await this.checkExisting(facility);
        if (existing) {
          this.skippedCount++;
          console.log(`   [${globalIndex+1}/${this.discoveredNames.length}] ⏭️ Skipped: ${facility.name} (already exists)`);
          continue;
        }
        
        console.log(`   [${globalIndex+1}/${this.discoveredNames.length}] 🔍 Enriching: ${facility.name}`);
        
        const enriched = await this.enrichSingleFacility(facility);
        if (enriched) {
          const added = await this.addEnrichedFacility(enriched);
          if (added) {
            this.enrichedCount++;
            console.log(`      ✅ Added with complete data`);
          } else {
            console.log(`      ⚠️ Failed to save to database`);
          }
        } else {
          this.failedCount++;
          console.log(`      ❌ Failed to enrich`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Save progress after each batch
      console.log(`\n📊 Batch ${batch + 1} complete: ${this.enrichedCount} enriched, ${this.failedCount} failed, ${this.skippedCount} skipped`);
      
      // Process up to 3 batches to get good coverage
      if (batch === 2) {
        console.log('\n⚠️ Stopping after 3 batches to avoid timeout. Run again for more.');
        break;
      }
    }
  }

  private async enrichSingleFacility(facility: DiscoveredFacility): Promise<EnrichedFacility | null> {
    const query = `Provide complete contact information for "${facility.name}" senior living facility in ${facility.city}, ${facility.state}.
      
      I need EXACT details:
      - Full street address
      - City, State ZIP code
      - Phone number
      - Website (if available)
      - Current pricing range (if available)
      - Types of care offered
      - Brief description
      
      Search for this specific facility and provide accurate 2024-2025 information.
      This is a real facility that exists - provide the actual contact details.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      return this.parseEnrichedData(result.summary || '', facility);
    } catch (error) {
      return null;
    }
  }

  private parseEnrichedData(text: string, original: DiscoveredFacility): EnrichedFacility | null {
    // Extract address
    const addressMatch = text.match(/(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct|Circle|Cir|Parkway|Pkwy|Place|Pl)\.?)/i);
    if (!addressMatch) return null;
    
    // Extract ZIP
    const zipMatch = text.match(/\b(\d{5})(?:-\d{4})?\b/);
    if (!zipMatch) return null;
    
    // Extract phone (optional - we'll use placeholder if not found)
    let phone = '000-000-0001';
    const phoneMatch = text.match(/(?:Phone:?\s*)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (phoneMatch) {
      const digits = phoneMatch[1].replace(/\D/g, '');
      if (digits.length === 10) {
        phone = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
      }
    }
    
    // Extract pricing
    let pricing;
    const pricingMatch = text.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*(?:per|\/)\s*month)?/i);
    if (pricingMatch) {
      pricing = pricingMatch[0];
    }
    
    // Extract care types
    const care_types: string[] = [];
    if (text.match(/assisted\s+living/i)) care_types.push('Assisted Living');
    if (text.match(/memory\s+care/i)) care_types.push('Memory Care');
    if (text.match(/independent\s+living/i)) care_types.push('Independent Living');
    if (text.match(/skilled\s+nursing/i)) care_types.push('Skilled Nursing');
    if (text.match(/nursing\s+home/i)) care_types.push('Nursing Home');
    if (care_types.length === 0) care_types.push('Assisted Living'); // Default
    
    // Extract website
    let website;
    const websiteMatch = text.match(/(?:website:?\s*)?(https?:\/\/[^\s]+|www\.[^\s]+)/i);
    if (websiteMatch) {
      website = websiteMatch[1];
      if (!website.startsWith('http')) {
        website = 'https://' + website;
      }
    }
    
    // Create description
    const description = `${original.name} is a ${care_types.join(' and ')} community located in ${original.city}, ${original.state}.${pricing ? ` Pricing ranges from ${pricing}.` : ''}`;
    
    return {
      name: original.name,
      address: addressMatch[1].trim(),
      city: original.city,
      state: original.state,
      zip_code: zipMatch[1],
      phone,
      website,
      pricing,
      care_types,
      description
    };
  }

  private async checkExisting(facility: DiscoveredFacility): Promise<boolean> {
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
    
    return existing.length > 0;
  }

  private async addEnrichedFacility(facility: EnrichedFacility): Promise<boolean> {
    // CRITICAL VALIDATION: NO FAKE DATA (but missing data is OK)
    // Reject entries with FAKE phone numbers (missing is OK)
    if (facility.phone && (
      facility.phone.startsWith('000-000-') ||
      facility.phone === '000-000-0000' ||
      facility.phone === '000-000-0001'
    )) {
      console.error('      ❌ REJECTED: Fake phone number detected:', facility.phone);
      return false;
    }
    
    // Handle zip codes - convert fake "00000" to null (missing is OK)
    let validZipCode: string | null = facility.zip_code;
    if (facility.zip_code === '00000' || facility.zip_code === '') {
      validZipCode = null; // Missing zip is OK per user
      console.log('      ⚠️ Missing zip code - will proceed without it');
    } else if (facility.zip_code && !/^\d{5}$/.test(facility.zip_code)) {
      console.error('      ❌ REJECTED: Invalid zip code format:', facility.zip_code);
      return false;
    }
    
    // Reject entries with malformed names
    if (facility.name.toLowerCase().includes('here is a comprehensive list') ||
        facility.name.toLowerCase() === 'names' ||
        facility.name.length < 3 ||
        facility.name.length > 100) {
      console.error('      ❌ REJECTED: Invalid facility name:', facility.name);
      return false;
    }
    
    // Reject entries with invalid addresses
    if (!facility.address || 
        facility.address.length < 5 ||
        facility.address.toLowerCase().includes('contact')) {
      console.error('      ❌ REJECTED: Invalid address:', facility.address);
      return false;
    }
    
    try {
      await db.insert(communities).values({
        name: facility.name,
        slug: this.generateSlug(facility.name, facility.city),
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zip_code: validZipCode, // Use validated zip (null if missing)
        phone: facility.phone || null, // Allow null phone
        website: facility.website,
        care_type: facility.care_types?.[0] || 'Assisted Living',
        care_types: facility.care_types || ['Assisted Living'],
        description: facility.description || `${facility.name} is a senior living community in ${facility.city}, ${facility.state}.`,
        status: 'Active',
        listing_type: 'Premium',
        is_claimed: false,
        ai_enrichment_date: new Date(),
        ai_enrichment_version: 'smart_expansion_v1',
        monthly_rent_min: facility.pricing ? this.extractPriceMin(facility.pricing) : null,
        monthly_rent_max: facility.pricing ? this.extractPriceMax(facility.pricing) : null
      });
      
      return true;
    } catch (error) {
      console.error('      Database error:', (error as any).message || error);
      return false;
    }
  }

  private extractPriceMin(pricing: string): number | null {
    const match = pricing.match(/\$?([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return null;
  }

  private extractPriceMax(pricing: string): number | null {
    const match = pricing.match(/\$?[\d,]+\s*[-–]\s*\$?([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    // If no range, use the single price as max
    return this.extractPriceMin(pricing);
  }

  private generateSlug(name: string, city: string): string {
    const combined = `${name}-${city}`.toLowerCase();
    return combined
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}

// Main execution
async function main() {
  const cityArg = process.argv[2];
  
  console.log('\n🚀 SMART CITY EXPANSION SCRIPT');
  console.log('Two-stage approach: Discovery → Enrichment');
  console.log('Timestamp:', new Date().toISOString());
  
  const expander = new SmartCityExpander();
  
  try {
    await expander.expandCity(cityArg);
    console.log('\n✨ Smart expansion complete!');
    
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

export { SmartCityExpander };