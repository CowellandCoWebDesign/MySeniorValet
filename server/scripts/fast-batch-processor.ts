import { db } from '../db';
import { communities } from '../../shared/schema';
import { PerplexityAIService } from '../perplexity-ai-service';
import { eq, and, sql } from 'drizzle-orm';

// Fast batch processor - processes multiple facilities at once
class FastBatchProcessor {
  private perplexity: PerplexityAIService;
  private totalAdded = 0;
  private totalSkipped = 0;
  
  constructor() {
    this.perplexity = new PerplexityAIService();
  }

  async processCities(cityList: Array<{city: string, state: string}>) {
    console.log(`\n🚀 FAST BATCH PROCESSOR`);
    console.log(`Processing ${cityList.length} cities simultaneously`);
    console.log(`==================================\n`);
    
    const startTime = Date.now();
    
    // Process all cities in parallel
    const promises = cityList.map(({city, state}) => 
      this.processOneCity(city, state)
    );
    
    await Promise.all(promises);
    
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    console.log(`\n✅ ALL PROCESSING COMPLETE!`);
    console.log(`   Total Added: ${this.totalAdded}`);
    console.log(`   Total Skipped: ${this.totalSkipped}`);
    console.log(`   Time: ${elapsed} minutes`);
  }

  private async processOneCity(city: string, state: string): Promise<void> {
    console.log(`📍 Starting ${city}, ${state}...`);
    
    try {
      // Discover facilities
      const facilities = await this.discoverFacilities(city, state);
      console.log(`   Found ${facilities.length} facilities in ${city}`);
      
      if (facilities.length === 0) return;
      
      // Check existing
      const existing = await this.getExisting(city, state);
      const existingNames = new Set(existing.map(e => e.name.toLowerCase()));
      
      // Filter new ones
      const newFacilities = facilities.filter(f => 
        !existingNames.has(f.toLowerCase())
      );
      
      console.log(`   Need to add ${newFacilities.length} new facilities`);
      
      if (newFacilities.length === 0) {
        this.totalSkipped += facilities.length;
        return;
      }
      
      // Process in small batches
      const batchSize = 5;
      for (let i = 0; i < newFacilities.length; i += batchSize) {
        const batch = newFacilities.slice(i, i + batchSize);
        
        const enrichPromises = batch.map(name => 
          this.enrichFacility(name, city, state)
        );
        
        const enriched = await Promise.all(enrichPromises);
        
        // Add to database
        const toAdd = enriched.filter(e => e !== null);
        if (toAdd.length > 0) {
          await db.insert(communities).values(toAdd as any);
          this.totalAdded += toAdd.length;
          console.log(`   ✅ Added batch: ${toAdd.length} facilities`);
        }
        
        // Brief pause between batches
        await new Promise(r => setTimeout(r, 1000));
      }
      
      console.log(`   ✅ ${city} complete: ${newFacilities.length} added`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${city}:`, error);
    }
  }

  private async discoverFacilities(city: string, state: string): Promise<string[]> {
    const query = `List ALL senior living, assisted living, nursing home, memory care, and retirement community facility NAMES in ${city}, ${state}. Give me a comprehensive list with just facility names, one per line.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const text = result.summary || '';
      
      const names: string[] = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        const cleaned = line
          .replace(/^\d+[\.)]\s*/, '')
          .replace(/^[-•*]\s*/, '')
          .replace(/\*\*/g, '')
          .trim();
        
        if (cleaned && 
            cleaned.length > 3 && 
            cleaned.length < 100 &&
            !cleaned.match(/^(here|these|the following|list of|note)/i)) {
          names.push(cleaned);
        }
      }
      
      return [...new Set(names)];
    } catch (error) {
      console.error(`Discovery error for ${city}:`, error);
      return [];
    }
  }

  private async getExisting(city: string, state: string): Promise<Array<{name: string}>> {
    return await db
      .select({ name: communities.name })
      .from(communities)
      .where(
        and(
          eq(communities.city, city),
          eq(communities.state, state)
        )
      );
  }

  private async enrichFacility(name: string, city: string, state: string): Promise<any | null> {
    const query = `Find the exact street address and phone number for "${name}" senior living facility in ${city}, ${state}. Provide the actual address and contact information.`;
    
    try {
      const result = await this.perplexity.searchRealTime(query);
      const text = result.summary || '';
      
      // Extract address
      const addressMatch = text.match(/(\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Way|Lane|Ln|Court|Ct|Place|Pl|Circle|Cir|Parkway|Pkwy)\.?)/i);
      if (!addressMatch) return null;
      
      // Extract phone
      let phone = 'Call for details';
      const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) {
        const digits = phoneMatch[0].replace(/\D/g, '');
        if (digits.length === 10) {
          phone = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
        }
      }
      
      // Extract ZIP
      const zipMatch = text.match(/\b(\d{5})(?:-\d{4})?\b/);
      const zip = zipMatch ? zipMatch[1] : 'Contact for details';
      
      // Determine care type
      let careType = 'Assisted Living';
      const nameLower = name.toLowerCase();
      const textLower = text.toLowerCase();
      
      if (nameLower.includes('memory') || textLower.includes('memory care')) {
        careType = 'Memory Care';
      } else if (nameLower.includes('nursing') || textLower.includes('nursing home')) {
        careType = 'Nursing Home';
      } else if (nameLower.includes('independent') || textLower.includes('independent living')) {
        careType = 'Independent Living';
      } else if (nameLower.includes('retirement') || textLower.includes('retirement')) {
        careType = 'Retirement Community';
      }
      
      return {
        name: name,
        slug: `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        address: addressMatch[1].trim(),
        city: city,
        state: state,
        zip_code: zip,
        phone: phone,
        care_type: careType,
        care_types: [careType],
        description: `${name} is a ${careType} community located in ${city}, ${state}.`,
        verified: false,
        is_active: true,
        metadata: {
          source: 'fast_batch_processor',
          date: new Date().toISOString()
        }
      };
    } catch (error) {
      return null;
    }
  }
}

// Run it
async function main() {
  const processor = new FastBatchProcessor();
  
  // Process all major cities with gaps
  const cities = [
    { city: 'Atlanta', state: 'GA' },
    { city: 'New York', state: 'NY' },
    { city: 'Grand Forks', state: 'ND' },
    { city: 'Casper', state: 'WY' },
    { city: 'Houston', state: 'TX' },
    { city: 'Dallas', state: 'TX' },
    { city: 'Fargo', state: 'ND' },
    { city: 'Bismarck', state: 'ND' },
    { city: 'Rapid City', state: 'SD' },
    { city: 'Cheyenne', state: 'WY' },
    { city: 'Sioux Falls', state: 'SD' },
    { city: 'Billings', state: 'MT' },
    { city: 'Anchorage', state: 'AK' },
    { city: 'Honolulu', state: 'HI' }
  ];
  
  await processor.processCities(cities);
  process.exit(0);
}

main();