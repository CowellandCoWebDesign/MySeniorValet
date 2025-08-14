import { db } from '../db';
import { communities } from '../../shared/schema';
import { PerplexityAIService } from '../perplexity-ai-service';
import { eq, and, sql } from 'drizzle-orm';

interface DiscoveredFacility {
  name: string;
  city: string;
  state: string;
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
  care_types: string[];
  description: string;
}

class ContinuousProcessor {
  private perplexity: PerplexityAIService;
  private enrichedCount = 0;
  private failedCount = 0;
  private skippedCount = 0;
  private discoveredNames: DiscoveredFacility[] = [];

  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async processCityDiscoveries(city: string, state: string) {
    console.log(`\n🔄 CONTINUOUS DISCOVERY PROCESSOR`);
    console.log(`============================================================`);
    console.log(`📍 Processing ALL discoveries for: ${city}, ${state}`);
    console.log(`🚀 No batch limits - will process until complete`);
    console.log(`============================================================\n`);

    // Discover all facilities for this city
    await this.discoverAllFacilities(city, state);
    
    // Process ALL discovered facilities
    await this.processAllDiscoveries();
    
    // Final report
    console.log('\n✅ PROCESSING COMPLETE!');
    console.log(`📊 Final Results:`);
    console.log(`   ✅ Successfully added: ${this.enrichedCount}`);
    console.log(`   ⏭️ Skipped (already exists): ${this.skippedCount}`);
    console.log(`   ❌ Failed to enrich: ${this.failedCount}`);
  }

  private async discoverAllFacilities(city: string, state: string) {
    console.log(`\n🔍 DISCOVERING ALL FACILITIES...`);
    
    const searchTerms = [
      'senior living facility',
      'assisted living facility', 
      'nursing home',
      'memory care facility',
      'retirement community',
      'independent living',
      'continuing care retirement',
      'senior apartments',
      'adult care home',
      'residential care facility'
    ];

    for (const term of searchTerms) {
      const query = `List ALL ${term} NAMES in ${city}, ${state}.
        Give me JUST the facility names, nothing else.
        Include every single facility you know about.
        Search for all facilities operating in 2024-2025.`;

      try {
        const result = await this.perplexity.searchRealTime(query);
        const facilities = this.parseDiscoveredNames(result.summary || '', city, state);
        console.log(`   Found ${facilities.length} ${term}s`);
        this.discoveredNames.push(...facilities);
      } catch (error) {
        console.error(`   Error discovering ${term}s:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // De-duplicate
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
        if (!cleaned.match(/^(the|a|an|these|this|it|they)\s/i)) {
          facilityName = cleaned;
        }
      }
      
      // Clean up the facility name
      if (facilityName) {
        facilityName = facilityName
          .replace(/[,;:].*$/, '')
          .replace(/\(.*?\)/, '')
          .replace(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}.*$/, '')
          .replace(/\d+\s+[A-Za-z]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive).*$/i, '')
          .trim();
        
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

  private async processAllDiscoveries() {
    console.log(`\n🎯 PROCESSING ${this.discoveredNames.length} DISCOVERIES...`);
    console.log(`⏰ Estimated time: ${Math.round(this.discoveredNames.length * 2 / 60)} minutes\n`);
    
    for (let i = 0; i < this.discoveredNames.length; i++) {
      const facility = this.discoveredNames[i];
      
      // Check if already exists
      const existing = await this.checkExisting(facility);
      if (existing) {
        this.skippedCount++;
        console.log(`[${i+1}/${this.discoveredNames.length}] ⏭️ Skipped: ${facility.name}`);
        continue;
      }
      
      console.log(`[${i+1}/${this.discoveredNames.length}] 🔍 Processing: ${facility.name}`);
      
      const enriched = await this.enrichSingleFacility(facility);
      if (enriched) {
        const added = await this.addEnrichedFacility(enriched);
        if (added) {
          this.enrichedCount++;
          console.log(`   ✅ Added to database`);
        } else {
          console.log(`   ⚠️ Failed to save`);
        }
      } else {
        this.failedCount++;
        console.log(`   ❌ Failed to enrich`);
      }
      
      // Progress update every 10 facilities
      if ((i + 1) % 10 === 0) {
        console.log(`\n📊 Progress: ${i+1}/${this.discoveredNames.length} (${Math.round((i+1)/this.discoveredNames.length*100)}%)`);
        console.log(`   ✅ Added: ${this.enrichedCount}, ⏭️ Skipped: ${this.skippedCount}, ❌ Failed: ${this.failedCount}\n`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
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
      
      Search for this specific facility and provide accurate 2024-2025 information.`;
    
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
    
    // Extract ZIP (optional)
    const zipMatch = text.match(/\b(\d{5})(?:-\d{4})?\b/);
    const zipCode = zipMatch ? zipMatch[1] : 'Not updated by community yet';
    
    // Extract phone (optional)
    let phone = 'Contact community for details';
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
    if (care_types.length === 0) care_types.push('Assisted Living');
    
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
      zip_code: zipCode,
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
    try {
      await db.insert(communities).values({
        name: facility.name,
        slug: this.generateSlug(facility.name, facility.city),
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zip_code: facility.zip_code,
        phone: facility.phone,
        website: facility.website,
        pricing_info: facility.pricing,
        care_type: facility.care_types[0],
        care_types: facility.care_types,
        description: facility.description,
        verified: false,
        is_active: true,
        metadata: {
          source: 'perplexity_discovery',
          discovery_date: new Date().toISOString()
        }
      });
      return true;
    } catch (error) {
      console.error('Database error:', error);
      return false;
    }
  }

  private generateSlug(name: string, city: string): string {
    const combined = `${name}-${city}`.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return combined;
  }
}

// Run the processor
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: tsx process-all-discoveries.ts "City" "State"');
    console.log('Example: tsx process-all-discoveries.ts "Atlanta" "GA"');
    process.exit(1);
  }
  
  const [city, state] = args;
  const processor = new ContinuousProcessor();
  
  try {
    await processor.processCityDiscoveries(city, state);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();